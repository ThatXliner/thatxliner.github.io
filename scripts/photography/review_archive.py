#!/usr/bin/env python3
"""Render every eligible photograph for review and audit review coverage.

Archive files are opened read-only. All generated data goes to --output, which
must be separate from every --source-root. Requires Pillow; optional rawpy and
astropy handle files without usable embedded previews.
NumPy is required for scientific images; tifffile supports floating-point TIFF.
"""

import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
import io
import json
from pathlib import Path
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont, ImageOps


def read_json(path):
    return json.loads(Path(path).read_text())


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2) + "\n")


def separate_output(output, roots):
    output = Path(output).resolve()
    for root in roots:
        root = Path(root).resolve()
        if output == root or output in root.parents or root in output.parents:
            raise ValueError(f"Output and source archive overlap: {output}, {root}")
    return output


def records_from(path):
    data = read_json(path)
    if isinstance(data, list):
        return data
    for key in ("records", "eligible", "photos"):
        if isinstance(data.get(key), list):
            return data[key]
    raise ValueError("Manifest must contain a records list")


def raster(data):
    with Image.open(data) as opened:
        opened.load()
        return ImageOps.exif_transpose(opened).convert("RGB")


def decode(path, exiftool, fits_neutral=False):
    errors = []
    if path.suffix.lower() in (".fit", ".fits", ".fts"):
        # Pillow's FITS plugin can misread byte order and RGB conversion clips
        # high-bit-depth values. Scientific FITS must bypass that raster path.
        import numpy as np
        from astropy.io import fits
        with fits.open(path, mode="readonly", memmap=False) as hdus:
            data = np.squeeze(next(hdu.data for hdu in hdus if hdu.data is not None)).astype(np.float32)
        if data.ndim == 3 and data.shape[0] in (3, 4):
            data = np.moveaxis(data, 0, -1)
        if data.ndim not in (2, 3) or (data.ndim == 3 and data.shape[-1] not in (3, 4)):
            raise ValueError(f"Unsupported FITS shape: {data.shape}")
        if fits_neutral:
            if data.ndim == 3:
                data = data[..., 0] * 0.2126 + data[..., 1] * 0.7152 + data[..., 2] * 0.0722
            sample = data[::8, ::8]
            positive = sample[np.isfinite(sample) & (sample > 0)]
            if not positive.size:
                raise ValueError("FITS has no finite positive pixels")
            median = np.median(positive)
            mad = np.median(np.abs(positive - median))
            low = max(float(np.percentile(positive, 1)), float(median - 3 * mad))
            high = max(float(np.percentile(positive, 99.99)), float(median + 10 * mad))
        else:
            low, high = np.nanpercentile(data[::8, ::8], [1, 99.5])
        if not np.isfinite(low) or not np.isfinite(high):
            raise ValueError("FITS has no finite display range")
        data -= low
        data /= max(float(high - low), 1e-12)
        np.clip(data, 0, 1, out=data)
        data *= 10
        np.arcsinh(data, out=data)
        data /= np.arcsinh(10)
        np.nan_to_num(data, copy=False)
        method = "fits:astropy-positive-luminance-neutral-v3" if fits_neutral else "fits:astropy-asinh-percentile-1-99.5-v2"
        return Image.fromarray((data * 255).astype("uint8")).convert("RGB"), method
    try:
        return raster(path), "raster"
    except Exception as error:
        errors.append(str(error))
    if path.suffix.lower() in (".jpg", ".jpeg") and "truncated" in errors[0].lower():
        try:
            # Isolate Pillow's global recovery switch from parallel decoders.
            recovery = subprocess.run(
                [sys.executable, "-c",
                 "from PIL import Image,ImageFile,ImageOps; import sys; "
                 "ImageFile.LOAD_TRUNCATED_IMAGES=True; "
                 "im=Image.open(sys.argv[1]); im.load(); "
                 "ImageOps.exif_transpose(im).convert('RGB').save(sys.stdout.buffer,format='PNG')",
                 str(path)], capture_output=True, timeout=180, check=True,
            )
            return raster(io.BytesIO(recovery.stdout)), "raster:truncated-jpeg-recovery"
        except Exception as error:
            errors.append(f"Truncated JPEG recovery: {error}")
    if path.suffix.lower() in (".tif", ".tiff"):
        try:
            import numpy as np
            import tifffile
            with tifffile.TiffFile(path, mode="r") as tif:
                page = tif.pages[0]
                data = np.squeeze(page.asarray())
                orientation = page.tags.get("Orientation")
                orientation = orientation.value if orientation else 1
            if data.ndim == 3 and data.shape[0] in (3, 4) and data.shape[-1] not in (3, 4):
                data = np.moveaxis(data, 0, -1)
            if data.ndim not in (2, 3) or (data.ndim == 3 and data.shape[-1] not in (3, 4)):
                raise ValueError(f"Unsupported TIFF shape: {data.shape}")
            data = data.astype(np.float32)
            if data.ndim == 3:
                data = data[..., :3]
            low, high = np.nanpercentile(data, [1, 99.5])
            scaled = np.arcsinh(np.clip((data - low) / max(float(high - low), 1e-12), 0, 1) * 10) / np.arcsinh(10)
            im = Image.fromarray((np.nan_to_num(scaled) * 255).astype("uint8")).convert("RGB")
            if orientation != 1:
                im.getexif()[274] = orientation
                im = ImageOps.exif_transpose(im)
            return im, "tiff:asinh-percentile-1-99.5-preview"
        except Exception as error:
            errors.append(f"TIFF: {error}")
    if exiftool:
        for tag in ("JpgFromRaw", "PreviewImage", "OtherImage", "ThumbnailImage"):
            result = subprocess.run(
                [str(exiftool), "-fast2", "-b", f"-{tag}", str(path)],
                capture_output=True, timeout=180, check=False,
            )
            if result.stdout:
                try:
                    with Image.open(io.BytesIO(result.stdout)) as embedded:
                        has_orientation = bool(embedded.getexif().get(274))
                    im = raster(io.BytesIO(result.stdout))
                    if not has_orientation:
                        orientation = subprocess.run(
                            [str(exiftool), "-fast2", "-s3", "-n", "-Orientation", str(path)],
                            capture_output=True, text=True, timeout=30, check=False,
                        ).stdout.strip()
                        transforms = {"2": Image.Transpose.FLIP_LEFT_RIGHT,
                                      "3": Image.Transpose.ROTATE_180,
                                      "4": Image.Transpose.FLIP_TOP_BOTTOM,
                                      "5": Image.Transpose.TRANSPOSE,
                                      "6": Image.Transpose.ROTATE_270,
                                      "7": Image.Transpose.TRANSVERSE,
                                      "8": Image.Transpose.ROTATE_90}
                        if orientation in transforms:
                            im = im.transpose(transforms[orientation])
                    return im, f"embedded:{tag}"
                except Exception as error:
                    errors.append(f"{tag}: {error}")
    try:
        import rawpy
        with rawpy.imread(str(path)) as raw:
            return Image.fromarray(raw.postprocess(use_camera_wb=True, half_size=True)), "rawpy"
    except Exception as error:
        errors.append(f"rawpy: {error}")
    raise ValueError("; ".join(errors))


def stat_signature(path):
    stat = path.stat()
    return [stat.st_size, stat.st_mtime_ns]


def render(record, output, exiftool, fits_neutral=False):
    result = dict(record)
    source = Path(record["path"])
    preview = output / "previews" / (record["id"] + ".jpg")
    thumb = output / "thumbnails" / (record["id"] + ".jpg")
    cache = output / "cache" / (record["id"] + ".json")
    try:
        signature = stat_signature(source)
        identity = {"path": str(source), "stat": signature, "sha256": record.get("sha256")}
        if cache.exists() and preview.exists() and thumb.exists():
            cached = read_json(cache)
            accepted_fits = ("fits:astropy-positive-luminance-neutral-v3",) if fits_neutral else ("fits:astropy-asinh-percentile-1-99.5-v2", "fits:astropy-positive-luminance-neutral-v3")
            fits_current = source.suffix.lower() not in (".fit", ".fits", ".fts") or cached.get("render", {}).get("render_method") in accepted_fits
            if cached.get("identity") == identity and fits_current:
                result.update(cached["render"])
                return result
        im, method = decode(source, exiftool, fits_neutral=fits_neutral)
        dimensions = list(im.size)
        im.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
        preview.parent.mkdir(parents=True, exist_ok=True)
        thumb.parent.mkdir(parents=True, exist_ok=True)
        im.save(preview, quality=90)
        im.thumbnail((440, 390), Image.Resampling.LANCZOS)
        im.save(thumb, quality=88)
        if stat_signature(source) != signature:
            raise ValueError("Source changed during read")
        result.update(render_status="ok", render_method=method, dimensions=dimensions,
                      preview_path=str(preview), thumbnail_path=str(thumb))
        if method == "raster:truncated-jpeg-recovery":
            result["recovery_warning"] = "Source JPEG is truncated; recovered pixels are viewable, but missing pixels may be decoder fill. Original remains damaged and unchanged."
            result["source_incomplete"] = True
        elif method.startswith("tiff:asinh"):
            result["recovery_warning"] = "Floating-point TIFF displayed with a deterministic global 1–99.5 percentile asinh stretch; this is a review visualization, not a finished edit."
        elif method == "fits:astropy-positive-luminance-neutral-v3":
            result["recovery_warning"] = "Secondary neutral grayscale luminance review: zero/invalid padding excluded; black point max(positive 1st percentile, median−3MAD), white point max(positive 99.99th percentile, median+10MAD), asinh(10) stretch. This is a review visualization, not a finished edit."
        cache_keys = ["render_status", "render_method", "dimensions", "preview_path", "thumbnail_path"]
        cache_keys.extend(key for key in ("recovery_warning", "source_incomplete") if key in result)
        write_json(cache, {"identity": identity, "render": {key: result[key] for key in
                   cache_keys}})
    except Exception as error:
        result.update(render_status="unreadable", render_error=str(error), preview_path=None, thumbnail_path=None)
    return result


def sheet(records, target):
    canvas = Image.new("RGB", (1800, 450 * ((len(records) + 3) // 4)), "#151515")
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default(size=18)
    for index, record in enumerate(records):
        x, y = (index % 4) * 450, (index // 4) * 450
        if record["render_status"] == "ok":
            with Image.open(record["thumbnail_path"]) as thumb:
                canvas.paste(thumb, (x + (450 - thumb.width) // 2, y + (395 - thumb.height) // 2))
        else:
            draw.text((x + 10, y + 170), "UNREADABLE — RESOLVE", fill="#ff7777", font=font)
        draw.text((x + 8, y + 400), record["id"], fill="white", font=font)
        name = Path(record.get("member_path", record["path"])).name
        draw.text((x + 8, y + 424), name[:38], fill="#cccccc", font=font)
    target.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(target, quality=92)


def prepare(args):
    output = separate_output(args.output, args.source_root)
    roots = [Path(root).resolve() for root in args.source_root]
    records = records_from(args.manifest)
    ids = [record["id"] for record in records]
    if len(set(ids)) != len(ids):
        raise ValueError("Duplicate manifest IDs")
    for record in records:
        path = Path(record["path"]).resolve()
        if not any(root in path.parents for root in roots):
            raise ValueError(f"Source outside declared archives: {path}")
        if Path(record["id"]).name != record["id"] or record["id"] in (".", ".."):
            raise ValueError("Unsafe record ID")
    records.sort(key=lambda record: (not record.get("edited", False), record.get("event", ""), record["path"]))
    with ThreadPoolExecutor(max_workers=args.jobs) as pool:
        rendered = list(pool.map(lambda record: render(record, output, args.exiftool), records))
    # Review all variants. Exact duplicates are recorded, never silently dropped.
    workers = min(max(1, args.workers), max(1, len(rendered)))
    chunks = [rendered[len(rendered) * i // workers:len(rendered) * (i + 1) // workers] for i in range(workers)]
    indexes = []
    for index, assigned in enumerate(chunks, 1):
        worker = output / "workers" / f"worker-{index:03d}"
        sheets = []
        for start in range(0, len(assigned), 16):
            group = assigned[start:start + 16]
            target = worker / "sheets" / f"sheet-{start // 16 + 1:04d}.jpg"
            sheet(group, target)
            sheets.append({"path": str(target), "ids": [record["id"] for record in group]})
        manifest = {"records": assigned, "assigned_ids": [record["id"] for record in assigned], "sheets": sheets}
        write_json(worker / "manifest.json", manifest)
        indexes.append({"worker": str(worker), "count": len(assigned), "sheets": len(sheets)})
    summary = {"input_manifest": str(Path(args.manifest).resolve()),
               "input_sha256": hashlib.sha256(Path(args.manifest).read_bytes()).hexdigest(),
               "source_roots": [str(root) for root in roots], "records": rendered, "workers": indexes,
               "count": len(rendered), "unreadable": [r["id"] for r in rendered if r["render_status"] != "ok"]}
    write_json(output / "index.json", summary)
    print(json.dumps({key: value for key, value in summary.items() if key != "records"}, indent=2))


def publish_ready(args):
    """Publish complete cached chunks while a separate prepare process renders."""
    output = separate_output(args.output, args.source_root)
    roots = [Path(root).resolve() for root in args.source_root]
    records = records_from(args.manifest)
    ids = [record["id"] for record in records]
    if len(set(ids)) != len(ids):
        raise ValueError("Duplicate manifest IDs")
    for record in records:
        path = Path(record["path"]).resolve()
        if not any(root in path.parents for root in roots):
            raise ValueError(f"Source outside declared archives: {path}")
        if Path(record["id"]).name != record["id"] or record["id"] in (".", ".."):
            raise ValueError("Unsafe record ID")
    records.sort(key=lambda record: (not record.get("edited", False), record.get("event", ""), record["path"]))
    workers = min(max(1, args.workers), max(1, len(records)))
    published, existing, pending = [], [], []
    for index in range(workers):
        chunk = records[len(records) * index // workers:len(records) * (index + 1) // workers]
        worker = output / "workers" / f"worker-{index + 1:03d}"
        if (worker / "manifest.json").exists() or (worker / "review.json").exists():
            existing.append(str(worker))
            continue
        assigned = []
        for record in chunk:
            cache = output / "cache" / (record["id"] + ".json")
            try:
                cached = read_json(cache)
                identity = {"path": record["path"], "stat": stat_signature(Path(record["path"])),
                            "sha256": record.get("sha256")}
                if cached.get("identity") != identity or cached["render"]["render_status"] != "ok":
                    break
                rendered = dict(record, **cached["render"])
                for key in ("preview_path", "thumbnail_path"):
                    path = Path(rendered[key]).resolve()
                    if output not in path.parents:
                        raise ValueError("Cache image outside output root")
                    with Image.open(path) as im:
                        im.verify()
                assigned.append(rendered)
            except (OSError, ValueError, KeyError, TypeError):
                # A cache may be in flight. Retry on the next invocation.
                break
        if len(assigned) != len(chunk):
            pending.append({"worker": str(worker), "cached_prefix": len(assigned), "count": len(chunk)})
            continue
        sheets = []
        for start in range(0, len(assigned), 16):
            group = assigned[start:start + 16]
            target = worker / "sheets" / f"sheet-{start // 16 + 1:04d}.jpg"
            if not target.exists():
                sheet(group, target)
            sheets.append({"path": str(target), "ids": [record["id"] for record in group]})
        manifest = {"records": assigned, "assigned_ids": [record["id"] for record in assigned], "sheets": sheets}
        worker.mkdir(parents=True, exist_ok=True)
        try:
            with (worker / "manifest.json").open("x") as handle:
                json.dump(manifest, handle, indent=2)
                handle.write("\n")
            published.append({"worker": str(worker), "count": len(assigned), "sheets": len(sheets)})
        except FileExistsError:
            existing.append(str(worker))
    print(json.dumps({"published": published, "existing": existing, "pending": pending}, indent=2))


def coverage(args):
    output = Path(args.output).resolve()
    index = read_json(output / "index.json")
    errors, warnings, candidates, counts = [], [], [], {}
    snapshot_paths = {output / "index.json"}
    try:
        input_manifest = Path(index["input_manifest"])
        snapshot_paths.add(input_manifest)
        if hashlib.sha256(input_manifest.read_bytes()).hexdigest() != index.get("input_sha256"):
            errors.append("Input manifest SHA-256 differs from prepared index")
    except (KeyError, OSError) as error:
        errors.append(f"Cannot verify input manifest: {error}")
    central_ids = [record["id"] for record in index["records"]]
    if len(set(central_ids)) != len(central_ids):
        errors.append("Duplicate IDs in central index")
    worker_root = output / "workers"
    indexed_dirs = {Path(worker["worker"]).resolve() for worker in index["workers"]}
    if worker_root.is_dir():
        unexpected = {path.resolve() for path in worker_root.iterdir() if path.is_dir()} - indexed_dirs
        if unexpected:
            warnings.append(f"Unexpected worker directories: {sorted(str(path) for path in unexpected)}")
    seen = set()
    if len(indexed_dirs) != len(index["workers"]):
        errors.append("Duplicate worker directories in central index")
    for worker_number, worker in enumerate(index["workers"]):
        directory = Path(worker["worker"]).resolve()
        if directory.parent != worker_root:
            errors.append(f"Worker directory outside output/workers: {directory}")
            continue
        try:
            manifest = read_json(directory / "manifest.json")
        except (OSError, ValueError) as error:
            errors.append(f"Missing or invalid worker manifest: {directory}: {error}")
            continue
        snapshot_paths.add(directory / "manifest.json")
        assigned_ids = manifest["assigned_ids"]
        assigned = set(assigned_ids)
        start = len(central_ids) * worker_number // len(index["workers"])
        end = len(central_ids) * (worker_number + 1) // len(index["workers"])
        expected_assignment = set(central_ids[start:end])
        record_ids = [record["id"] for record in manifest["records"]]
        if (assigned != expected_assignment or len(assigned_ids) != len(assigned)
                or set(record_ids) != assigned or len(record_ids) != len(assigned)
                or worker.get("count") != len(assigned)):
            errors.append(f"Worker assignment differs from central index: {directory}")
        if seen & assigned:
            errors.append(f"Overlapping worker assignments: {sorted(seen & assigned)}")
        seen |= assigned
        if not (directory / "review.json").exists():
            errors.append(f"Missing review: {directory}")
            continue
        review = read_json(directory / "review.json")
        snapshot_paths.add(directory / "review.json")
        if set(review.get("assigned_ids", [])) != assigned or len(review.get("assigned_ids", [])) != len(assigned):
            errors.append(f"Assigned IDs differ: {directory}")
        dispositions = review.get("dispositions", [])
        if isinstance(dispositions, dict):
            dispositions = [dict(value, id=key) if isinstance(value, dict) else {"id": key, "disposition": value} for key, value in dispositions.items()]
        disposition_ids = [row.get("id") for row in dispositions]
        if set(disposition_ids) != assigned or len(disposition_ids) != len(assigned):
            errors.append(f"Disposition gaps/duplicates: {directory}: {sorted(assigned - set(disposition_ids))}")
        viewed = {str(Path(path).resolve()) for path in review.get("viewed_sheet_paths", [])}
        sheet_paths = {str(Path(info["path"]).resolve()) for info in manifest["sheets"]}
        if viewed != sheet_paths:
            errors.append(f"Viewed sheet set differs from worker manifest: {directory}")
        sheet_ids = [photo_id for info in manifest["sheets"] for photo_id in info["ids"]]
        if set(sheet_ids) != assigned or len(sheet_ids) != len(assigned):
            errors.append(f"Sheet assignments differ from worker manifest: {directory}")
        for sheet_info in manifest["sheets"]:
            sheet_path = Path(sheet_info["path"]).resolve()
            if sheet_path.parent != directory / "sheets" or not sheet_path.is_file():
                errors.append(f"Missing sheet or sheet outside worker directory: {sheet_path}")
            else:
                snapshot_paths.add(sheet_path)
        shortlist_ids = [row["id"] for row in review.get("shortlist", [])]
        shortlisted = set(shortlist_ids)
        marked_shortlist = {row["id"] for row in dispositions if row.get("disposition", row.get("status")) == "shortlist"}
        if len(shortlist_ids) != len(shortlisted) or shortlisted != marked_shortlist:
            errors.append(f"Shortlist IDs differ from dispositions or contain duplicates: {directory}")
        incomplete = {record["id"] for record in manifest["records"] if record.get("source_incomplete")}
        incomplete.update(record["id"] for record in index["records"] if record.get("source_incomplete"))
        for row in dispositions:
            state = row.get("disposition", row.get("status"))
            counts[state] = counts.get(state, 0) + 1
            if state not in ("reject", "shortlist", "technical", "unreadable") or not row.get("reason"):
                errors.append(f"Invalid disposition: {row}")
            if state == "unreadable":
                errors.append(f"Unresolved unreadable: {row['id']}")
            if row["id"] in incomplete and state not in ("technical", "reject"):
                errors.append(f"Incomplete source cannot be shortlisted: {row['id']}")
            if state == "shortlist" and row["id"] not in shortlisted:
                errors.append(f"Missing shortlist details: {row['id']}")
        for candidate in review.get("shortlist", []):
            if candidate["id"] not in assigned:
                errors.append(f"Unassigned shortlist: {candidate['id']}")
            if candidate.get("face_visibility") not in ("none", "obscured", "clear", "uncertain"):
                errors.append(f"Missing face classification: {candidate['id']}")
            if not candidate.get("preview_path") or not Path(candidate["preview_path"]).is_file():
                errors.append(f"Missing candidate preview: {candidate['id']}")
            candidates.append(candidate)
    expected = {record["id"] for record in index["records"]}
    if seen != expected:
        errors.append("Worker assignment union differs from central manifest")
    for record in index["records"]:
        if record["render_status"] != "ok":
            errors.append(f"Unresolved rendering failure: {record['id']}")
    result = {"complete": not errors, "expected": len(expected), "assigned": len(seen),
              "counts": counts, "errors": errors, "warnings": warnings, "candidates": candidates}
    if getattr(args, "hash_ledger", False):
        result["post_review_snapshot"] = {
            "description": "Hashes recorded after review; this snapshot does not prove which bytes were viewed during review.",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "sha256": {str(path): hashlib.sha256(path.read_bytes()).hexdigest() for path in sorted(snapshot_paths) if path.is_file()},
        }
    write_json(output / "coverage.json", result)
    print(json.dumps(result, indent=2))
    return 0 if not errors else 1


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    prep = commands.add_parser("prepare")
    prep.add_argument("--manifest", required=True)
    prep.add_argument("--output", required=True)
    prep.add_argument("--source-root", action="append", required=True)
    prep.add_argument("--exiftool")
    prep.add_argument("--workers", type=int, default=8)
    prep.add_argument("--jobs", type=int, default=8)
    ready = commands.add_parser("publish-ready")
    ready.add_argument("--manifest", required=True)
    ready.add_argument("--output", required=True)
    ready.add_argument("--source-root", action="append", required=True)
    ready.add_argument("--workers", type=int, default=8)
    audit = commands.add_parser("coverage")
    audit.add_argument("--output", required=True)
    audit.add_argument("--hash-ledger", action="store_true", help="Record an explicitly post-review hash snapshot")
    args = parser.parse_args()
    if args.command == "prepare":
        return prepare(args)
    if args.command == "publish-ready":
        return publish_ready(args)
    return coverage(args)


if __name__ == "__main__":
    sys.exit(main())
