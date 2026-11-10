import * as THREE from "three";

/**
 * The MacBook's display, painted on a canvas. What's on it is driven by two
 * numbers: `typed` (0–1, how much of the file has been written) and `apps`
 * (0–2, which product window has been brought forward). Both come from the
 * scroll position, so every keystroke belongs to a bit of scrolling.
 */

export interface ScreenImages {
    wallpaper: HTMLImageElement;
    billion: HTMLImageElement[];
    quillium: HTMLImageElement;
}

const W = 2048;
const H = 1328;
export const SCREEN_ASPECT = W / H;

/** The part of the display, as fractions of its width, that windows may use. */
export interface Bounds {
    left: number;
    right: number;
}

const CODE = `import { build, ship } from "./life";

export const bryan = {
  builds: ["Billion", "Quillium", "open source"],
  stack: ["TypeScript", "Python", "Rust", "Svelte"],
  also: ["photographs", "piano", "trombone"],
};

// Start with the thing I wish existed.
for (const idea of bryan.builds) {
  await ship(build(idea));
}
`;

const KEYWORDS = /\b(import|from|export|const|for|await|of)\b/g;

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    g.beginPath();
    g.roundRect(x, y, w, h, r);
}

function cover(g: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, w: number, h: number) {
    const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
    const sw = w / scale;
    const sh = h / scale;
    g.drawImage(image, (image.naturalWidth - sw) / 2, (image.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
}

function windowChrome(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, title: string, fill = "#1c1c1f") {
    g.save();
    g.shadowColor = "rgba(0,0,0,0.55)";
    g.shadowBlur = 60;
    g.shadowOffsetY = 24;
    roundRect(g, x, y, w, h, 22);
    g.fillStyle = fill;
    g.fill();
    g.restore();
    g.save();
    roundRect(g, x, y, w, h, 22);
    g.clip();
    g.fillStyle = "rgba(255,255,255,0.04)";
    g.fillRect(x, y, w, 56);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((color, i) => {
        g.beginPath();
        g.arc(x + 32 + i * 30, y + 28, 9, 0, Math.PI * 2);
        g.fillStyle = color;
        g.fill();
    });
    g.fillStyle = "rgba(255,255,255,0.5)";
    g.font = `500 22px ${font}`;
    g.textAlign = "center";
    g.fillText(title, x + w / 2, y + 36);
    g.textAlign = "left";
    g.restore();
    g.strokeStyle = "rgba(255,255,255,0.12)";
    g.lineWidth = 2;
    roundRect(g, x + 1, y + 1, w - 2, h - 2, 21);
    g.stroke();
}

let font = "Inter, -apple-system, sans-serif";
const mono = `"SF Mono", ui-monospace, Menlo, monospace`;

export function createScreen(images: ScreenImages) {
    font = getComputedStyle(document.body).fontFamily || font;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const g = canvas.getContext("2d")!;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.flipY = false;

    let last = "";

    function drawCode(x: number, y: number, w: number, h: number, typed: number, blink: boolean) {
        windowChrome(g, x, y, w, h, "bryan.ts — portfolio", "#141416");
        // File tree.
        const tree = 250;
        g.fillStyle = "#101012";
        g.fillRect(x + 1, y + 56, tree, h - 57);
        g.font = `400 22px ${font}`;
        const files = [
            ["▾ portfolio", 0.75],
            ["  ▸ billion", 0.5],
            ["  ▸ quillium", 0.5],
            ["  ▾ src", 0.5],
            ["     bryan.ts", 1],
            ["     life.ts", 0.5],
            ["     room.ts", 0.5],
            ["  package.json", 0.5],
        ] as const;
        files.forEach(([name, alpha], i) => {
            if (name.includes("bryan.ts")) {
                g.fillStyle = "rgba(127,168,255,0.16)";
                g.fillRect(x + 1, y + 82 + i * 40, tree, 38);
            }
            g.fillStyle = `rgba(245,245,247,${alpha})`;
            g.fillText(name, x + 26, y + 108 + i * 40);
        });

        // The file, written up to `typed`.
        const count = Math.round(CODE.length * typed);
        const text = CODE.slice(0, count);
        const lines = text.split("\n");
        const lineHeight = 46;
        const left = x + tree + 80;
        const top = y + 120;
        g.font = `400 26px ${mono}`;
        const allLines = CODE.split("\n");
        for (let i = 0; i < allLines.length; i++) {
            g.fillStyle = i < lines.length ? "rgba(245,245,247,0.32)" : "rgba(245,245,247,0.12)";
            g.textAlign = "right";
            g.fillText(String(i + 1), left - 36, top + i * lineHeight);
        }
        g.textAlign = "left";
        lines.forEach((line, i) => {
            let cursor = left;
            // A three-colour palette is enough to read as code.
            const parts = line.split(/("[^"]*"?|\/\/.*$)/);
            for (const part of parts) {
                if (!part) continue;
                if (part.startsWith("//")) g.fillStyle = "#7d8590";
                else if (part.startsWith('"')) g.fillStyle = "#a5d6a7";
                else g.fillStyle = "#e6e6ea";
                if (!part.startsWith('"') && !part.startsWith("//")) {
                    // Keywords in blue, inline.
                    let index = 0;
                    for (const match of part.matchAll(KEYWORDS)) {
                        const before = part.slice(index, match.index);
                        g.fillStyle = "#e6e6ea";
                        g.fillText(before, cursor, top + i * lineHeight);
                        cursor += g.measureText(before).width;
                        g.fillStyle = "#7fa8ff";
                        g.fillText(match[0], cursor, top + i * lineHeight);
                        cursor += g.measureText(match[0]).width;
                        index = match.index! + match[0].length;
                    }
                    const rest = part.slice(index);
                    g.fillStyle = "#e6e6ea";
                    g.fillText(rest, cursor, top + i * lineHeight);
                    cursor += g.measureText(rest).width;
                } else {
                    g.fillText(part, cursor, top + i * lineHeight);
                    cursor += g.measureText(part).width;
                }
            }
            if (i === lines.length - 1 && blink) {
                g.fillStyle = "#f5f5f7";
                g.fillRect(cursor + 2, top + i * lineHeight - 28, 3, 36);
            }
        });

        // Terminal along the bottom.
        const termY = y + h - 230;
        g.fillStyle = "#0c0c0e";
        g.fillRect(x + tree + 1, termY, w - tree - 2, 229);
        g.fillStyle = "rgba(255,255,255,0.08)";
        g.fillRect(x + tree + 1, termY, w - tree - 2, 2);
        g.font = `400 26px ${mono}`;
        g.fillStyle = "#28c840";
        g.fillText("➜", x + tree + 40, termY + 60);
        g.fillStyle = "#e6e6ea";
        g.fillText(" bun run dev", x + tree + 70, termY + 60);
        if (typed >= 1) {
            g.fillStyle = "rgba(245,245,247,0.55)";
            g.fillText("  ready in 312 ms", x + tree + 40, termY + 108);
            g.fillStyle = "#7fa8ff";
            g.fillText("  ➜ Local: http://localhost:4321/", x + tree + 40, termY + 150);
        }
    }

    function drawBillion(x: number, y: number, w: number, h: number) {
        windowChrome(g, x, y, w, h, "Billion — Simulator", "#0d0d0f");
        const phoneH = h - 130;
        const phoneW = phoneH * 0.462;
        images.billion.forEach((image, i) => {
            const px = x + w / 2 - phoneW - 24 + i * (phoneW + 48);
            const py = y + 90 + (i ? 30 : 0);
            g.save();
            roundRect(g, px - 10, py - 10, phoneW + 20, phoneH + 20, 62);
            g.fillStyle = "#050505";
            g.fill();
            roundRect(g, px, py, phoneW, phoneH, 52);
            g.clip();
            cover(g, image, px, py, phoneW, phoneH);
            g.restore();
        });
    }

    function drawQuillium(x: number, y: number, w: number, h: number) {
        windowChrome(g, x, y, w, h, "Quillium", "#f6f3ec");
        g.save();
        roundRect(g, x, y + 56, w, h - 56, 0);
        g.clip();
        const image = images.quillium;
        const scale = w / image.naturalWidth;
        g.drawImage(image, x, y + 56, w, image.naturalHeight * scale);
        g.restore();
    }

    /**
     * Windows are drawn at a design size, then scaled down if the free space to
     * the right of `inset` is narrower, so nothing crops or slides under the words.
     */
    function fit(bounds: Bounds, top: number, width: number, height: number, draw: (x: number, y: number, w: number, h: number) => void) {
        const left = W * bounds.left;
        const room = W * bounds.right - left;
        const scale = Math.min(1, room / width);
        g.save();
        g.translate(left + (room - width * scale) / 2, top + (height * (1 - scale)) / 2);
        g.scale(scale, scale);
        draw(0, 0, width, height);
        g.restore();
    }

    function paint(typed: number, apps: number, bounds: Bounds, now: number) {
        const blink = typed < 1 || Math.floor(now / 530) % 2 === 0;
        const key = `${typed.toFixed(3)}|${apps.toFixed(3)}|${bounds.left.toFixed(3)}|${bounds.right.toFixed(3)}|${blink}`;
        if (key === last) return false;
        last = key;

        cover(g, images.wallpaper, 0, 0, W, H);
        g.fillStyle = "rgba(0,0,0,0.35)";
        g.fillRect(0, 0, W, H);
        // Menu bar.
        g.fillStyle = "rgba(20,20,22,0.55)";
        g.fillRect(0, 0, W, 44);
        g.fillStyle = "rgba(255,255,255,0.88)";
        g.font = `600 22px ${font}`;
        g.fillText("Code", 72, 30);
        g.font = `400 22px ${font}`;
        ["File", "Edit", "View", "Terminal"].forEach((item, i) => g.fillText(item, 150 + i * 78, 30));
        g.textAlign = "right";
        g.fillText("Mon 6:42 PM", W - 36, 30);
        g.textAlign = "left";

        const rise = (t: number) => {
            const c = Math.min(1, Math.max(0, t));
            return 1 - Math.pow(1 - c, 3);
        };
        const billion = rise(apps);
        const quill = rise(apps - 1);
        // Whatever is behind the newest window steps back, so only one reads at a time.
        g.save();
        g.globalAlpha = 1 - billion * 0.75;
        fit(bounds, 110, 1170, H - 200, (x, y, w, h) => drawCode(x, y, w, h, typed, blink));
        g.restore();
        if (billion > 0) {
            g.save();
            g.globalAlpha = billion * (1 - quill * 0.8);
            fit(bounds, 110 + (1 - billion) * 120, 1060, H - 200, drawBillion);
            g.restore();
        }
        if (quill > 0) {
            g.save();
            g.globalAlpha = quill;
            fit(bounds, 110 + (1 - quill) * 120, 1170, H - 200, drawQuillium);
            g.restore();
        }
        texture.needsUpdate = true;
        return true;
    }

    return { texture, paint, aspect: W / H };
}
