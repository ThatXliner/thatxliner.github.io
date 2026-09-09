/** Keep the displayed thumbnail visible until this opening's full image decodes. */
export function setupPhotoViewer(dialogSelector: string, triggerSelector: string) {
    const viewer = document.querySelector<HTMLDialogElement>(dialogSelector);
    const frame = viewer?.querySelector<HTMLElement>("[data-viewer-frame]");
    const title = viewer?.querySelector<HTMLElement>(".t-caption");
    if (!viewer || !frame || !title) return;

    let opening = 0;

    document.querySelectorAll<HTMLButtonElement>(triggerSelector).forEach((button) => {
        button.addEventListener("click", async () => {
            const thumbnail = button.querySelector("img");
            if (!thumbnail) return;
            const request = ++opening;
            const width = Number(button.dataset.width) || thumbnail.naturalWidth || thumbnail.width;
            const height = Number(button.dataset.height) || thumbnail.naturalHeight || thumbnail.height;

            // Use the browser-selected, already displayed resource, without a srcset
            // that could select a different thumbnail at the dialog's larger size.
            const placeholder = new Image(width, height);
            placeholder.src = thumbnail.currentSrc || thumbnail.src;
            placeholder.alt = button.dataset.alt ?? thumbnail.alt;
            placeholder.style.cssText = "display:block;width:100%;height:100%;object-fit:contain";
            frame.style.width = `min(100%, calc((100dvh - 8rem) * ${width / height}))`;
            frame.style.aspectRatio = `${width} / ${height}`;
            frame.replaceChildren(placeholder);
            title.textContent = button.dataset.title ?? "";
            viewer.showModal();

            // Keep picture selection native: AVIF, then WebP as the fallback.
            // Art's original source remains its full-resolution WebP fallback.
            const picture = document.createElement("picture");
            for (const [type, srcset] of [
                ["image/avif", button.dataset.viewerAvifSrcset],
                ["image/webp", button.dataset.viewerWebpSrcset],
            ] as const) {
                if (!srcset) continue;
                const source = document.createElement("source");
                source.type = type;
                source.sizes = "100vw";
                source.srcset = srcset;
                picture.append(source);
            }
            const image = new Image(width, height);
            image.alt = "";
            image.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:contain;opacity:0";
            picture.append(image);
            frame.append(picture);
            image.sizes = "100vw";
            image.src = button.dataset.viewerFallback ?? button.dataset.src ?? thumbnail.src;

            try {
                await image.decode();
                if (request !== opening || !viewer.open) return;
                // A stationary replacement needs no motion-preference exception.
                image.alt = placeholder.alt;
                placeholder.alt = "";
                image.style.opacity = "1";
            } catch {
                // A failed/aborted decode keeps this opening's thumbnail and caption.
                picture.remove();
            }
        });
    });

    viewer.addEventListener("click", (event) => {
        if (event.target === viewer || event.target === viewer.querySelector("[data-viewer-backdrop]")) {
            viewer.close();
        }
    });
    viewer.addEventListener("close", () => {
        // The close event is queued; a new opening may already be active.
        if (viewer.open) return;
        ++opening;
        frame.replaceChildren();
    });
}
