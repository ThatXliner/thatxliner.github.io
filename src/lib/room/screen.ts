import * as THREE from "three";
import { APPS, DOCK, MENU_H, PROMPT, TERMINAL_INTRO, rectOf, type AppId, type Win } from "./desktop";

/**
 * The MacBook's display while the camera is moving: a canvas painting of the
 * same desktop the HTML version shows when it holds still. Window positions
 * come from the live desktop, so leaving the laptop shows your arrangement.
 * Sizes are fractions of the display's height, like the CSS's `cqh`.
 */

export interface ScreenImages {
    wallpaper: HTMLImageElement;
    billion: HTMLImageElement;
    quillium: HTMLImageElement;
}

/** A few real names for the list windows, so they read as more than grey bars. */
export interface ScreenLabels {
    projects: string[];
    repos: string[];
    skills: { name: string; color: string }[];
}

export interface ScreenState {
    /** 0–1: how much of the terminal's first command has been typed. */
    typed: number;
    windows: Win[];
    /** Bumps when the arrangement changes. */
    version: number;
}

const W = 2048;
const H = 1328;
export const SCREEN_ASPECT = W / H;
const u = H / 100; // one cqh
const em = 1.55 * u;

let font = "Inter, -apple-system, sans-serif";
const mono = `"SF Mono", ui-monospace, Menlo, monospace`;

const DOCK_COLORS: Record<AppId, [string, string]> = {
    billion: ["#1b2a5c", "#0d1636"],
    quillium: ["#3a3330", "#1c1917"],
    projects: ["#5fa7ff", "#2b6fe0"],
    repos: ["#2c2c30", "#0d0d0f"],
    skills: ["#b08cff", "#6b45d9"],
    terminal: ["#26262a", "#060607"],
};

export function createScreen(images: ScreenImages, labels: ScreenLabels) {
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

    const rr = (x: number, y: number, w: number, h: number, r: number) => {
        g.beginPath();
        g.roundRect(x, y, w, h, r);
    };

    function cover(image: HTMLImageElement, x: number, y: number, w: number, h: number) {
        const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
        const sw = w / scale;
        const sh = h / scale;
        g.drawImage(image, (image.naturalWidth - sw) / 2, (image.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
    }

    /** A web page as a browser shows it: full width, from the top. */
    function page(image: HTMLImageElement, x: number, y: number, w: number, h: number) {
        const scale = w / image.naturalWidth;
        g.drawImage(image, 0, 0, image.naturalWidth, Math.min(image.naturalHeight, h / scale), x, y, w, Math.min(h, image.naturalHeight * scale));
    }

    function chrome(x: number, y: number, w: number, h: number, title: string, body: string, bar: string, ink: string) {
        const radius = 0.75 * em;
        g.save();
        g.shadowColor = "rgba(0,0,0,0.55)";
        g.shadowBlur = 4 * em;
        g.shadowOffsetY = 1.5 * em;
        rr(x, y, w, h, radius);
        g.fillStyle = body;
        g.fill();
        g.restore();
        g.save();
        rr(x, y, w, h, radius);
        g.clip();
        g.fillStyle = bar;
        g.fillRect(x, y, w, 2.5 * em);
        ["#ff5f57", "#febc2e", "#28c840"].forEach((color, i) => {
            g.beginPath();
            g.arc(x + 0.9 * em + 0.475 * em + i * 1.45 * em, y + 1.25 * em, 0.475 * em, 0, Math.PI * 2);
            g.fillStyle = color;
            g.fill();
        });
        g.fillStyle = ink;
        g.font = `500 ${0.88 * em}px ${font}`;
        g.textAlign = "center";
        g.fillText(title, x + w / 2, y + 1.55 * em);
        g.textAlign = "left";
        g.restore();
        g.strokeStyle = "rgba(255,255,255,0.12)";
        g.lineWidth = 2;
        rr(x + 1, y + 1, w - 2, h - 2, radius);
        g.stroke();
    }

    function body(x: number, y: number, w: number, h: number, draw: () => void) {
        g.save();
        g.beginPath();
        g.roundRect(x, y + 2.5 * em, w, h - 2.5 * em, [0, 0, 0.75 * em, 0.75 * em]);
        g.clip();
        draw();
        g.restore();
    }

    function drawWindow(win: Win, typed: number) {
        const r = rectOf(win);
        const x = r.x * W;
        const y = r.y * H;
        const w = r.w * W;
        const h = r.h * H;
        const top = y + 2.5 * em;
        switch (win.id) {
            case "billion":
                chrome(x, y, w, h, "Billion — billion-news.app", "#0b1230", "#2a2a2e", "rgba(255,255,255,0.7)");
                body(x, y, w, h, () => page(images.billion, x, top, w, h - 2.5 * em));
                break;
            case "quillium":
                chrome(x, y, w, h, "Quillium — quillium.bryanhu.com", "#171412", "#2a2a2e", "rgba(255,255,255,0.7)");
                body(x, y, w, h, () => page(images.quillium, x, top, w, h - 2.5 * em));
                break;
            case "terminal": {
                chrome(x, y, w, h, "bryan — zsh", "#0c0c0e", "#1d1d20", "rgba(255,255,255,0.7)");
                body(x, y, w, h, () => {
                    g.font = `400 ${0.92 * 0.92 * em * 1.08}px ${mono}`;
                    const line = 1.5 * 0.92 * em;
                    let ty = top + 0.8 * em + line * 0.8;
                    g.fillStyle = "#28c840";
                    g.fillText(PROMPT, x + em, ty);
                    const after = x + em + g.measureText(`${PROMPT} `).width;
                    const command = TERMINAL_INTRO.command.slice(0, Math.round(TERMINAL_INTRO.command.length * typed));
                    g.fillStyle = "#e6e6ea";
                    g.fillText(command, after, ty);
                    if (typed < 1) g.fillRect(after + g.measureText(command).width + 2, ty - 0.8 * em, 0.5 * em, em);
                    else {
                        for (const out of TERMINAL_INTRO.output) {
                            ty += line;
                            g.fillText(out, x + em, ty);
                        }
                        ty += line;
                        g.fillStyle = "#28c840";
                        g.fillText(PROMPT, x + em, ty);
                    }
                });
                break;
            }
            case "projects":
                chrome(x, y, w, h, "Projects", "#f6f5f2", "#e9e7e2", "rgba(0,0,0,0.6)");
                body(x, y, w, h, () => {
                    g.fillStyle = "#ecebe7";
                    g.fillRect(x, top, 11 * em, h);
                    g.font = `400 ${0.92 * em}px ${font}`;
                    g.fillStyle = "rgba(0,0,0,0.7)";
                    ["Products", "Featured", "Apps", "Libraries & tools"].forEach((item, i) => g.fillText(item, x + 1.2 * em, top + 2 * em + i * 2 * em));
                    labels.projects.forEach((name, i) => {
                        const ry = top + 1.4 * em + i * 2.3 * em;
                        if (ry > y + h - em) return;
                        if (i % 2 === 0) {
                            g.fillStyle = "rgba(0,0,0,0.03)";
                            g.fillRect(x + 12 * em, ry - 1.4 * em, w - 13 * em, 2.2 * em);
                        }
                        g.fillStyle = "#1d1d1f";
                        g.font = `600 ${em}px ${font}`;
                        g.fillText(name, x + 12.6 * em, ry);
                        g.fillStyle = "rgba(0,0,0,0.12)";
                        g.fillRect(x + 22.5 * em, ry - 0.55 * em, Math.max(0, w - 26 * em) * (0.5 + ((i * 37) % 40) / 100), 0.5 * em);
                    });
                });
                break;
            case "repos":
                chrome(x, y, w, h, "github.com/ThatXliner", "#1c1c1f", "#2a2a2e", "rgba(255,255,255,0.7)");
                body(x, y, w, h, () => {
                    labels.repos.forEach((name, i) => {
                        const ry = top + 4.2 * em + i * 3.6 * em;
                        if (ry > y + h - em) return;
                        g.fillStyle = "#f5f5f7";
                        g.font = `600 ${em}px ${font}`;
                        g.fillText(name, x + 1.2 * em, ry);
                        g.fillStyle = "rgba(255,255,255,0.18)";
                        g.fillRect(x + 1.2 * em, ry + 0.7 * em, (w - 2.4 * em) * (0.45 + ((i * 29) % 45) / 100), 0.45 * em);
                        g.fillStyle = "rgba(255,255,255,0.07)";
                        g.fillRect(x + 1.2 * em, ry + 2.1 * em, w - 2.4 * em, 2);
                    });
                });
                break;
            case "skills":
                chrome(x, y, w, h, "Skills", "#1c1c1f", "#2a2a2e", "rgba(255,255,255,0.7)");
                body(x, y, w, h, () => {
                    const cell = 5.6 * em;
                    const cols = Math.max(1, Math.floor((w * 0.52 - 2 * em) / cell));
                    labels.skills.forEach((skill, i) => {
                        const cx = x + em + (i % cols) * cell + cell / 2;
                        const cy = top + em + Math.floor(i / cols) * cell + 1.8 * em;
                        if (cy > y + h - em) return;
                        g.fillStyle = skill.color;
                        g.beginPath();
                        g.arc(cx, cy, 1.1 * em, 0, Math.PI * 2);
                        g.fill();
                        g.fillStyle = "rgba(255,255,255,0.7)";
                        g.font = `400 ${0.78 * em}px ${font}`;
                        g.textAlign = "center";
                        g.fillText(skill.name.slice(0, 12), cx, cy + 2.4 * em);
                        g.textAlign = "left";
                    });
                });
                break;
        }
    }

    function paint(state: ScreenState) {
        const minute = new Date().toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" });
        const key = `${state.typed.toFixed(3)}|${state.version}|${minute}`;
        if (key === last) return false;
        last = key;

        cover(images.wallpaper, 0, 0, W, H);
        g.fillStyle = "rgba(0,0,0,0.35)";
        g.fillRect(0, 0, W, H);

        const open = state.windows.filter((win) => win.open).sort((a, b) => a.z - b.z);
        for (const win of open) drawWindow(win, state.typed);

        // Menu bar.
        g.fillStyle = "rgba(20,20,22,0.7)";
        g.fillRect(0, 0, W, MENU_H * H);
        g.font = `600 ${0.92 * em}px ${font}`;
        g.fillStyle = "#fff";
        const mid = MENU_H * H * 0.68;
        g.fillText("Bryan", 1.2 * em, mid);
        g.font = `400 ${0.92 * em}px ${font}`;
        g.fillStyle = "rgba(255,255,255,0.8)";
        let mx = 1.2 * em + g.measureText("Bryan").width + 1.4 * em * 1.6;
        for (const item of ["File", "Edit", "View", "Window", "Help"]) {
            g.fillText(item, mx, mid);
            mx += g.measureText(item).width + 1.4 * em;
        }
        g.textAlign = "right";
        g.fillText(minute, W - 1.2 * em, mid);
        g.textAlign = "left";

        // Dock.
        const tile = 5.2 * u;
        const gap = 0.5 * em;
        const pad = 0.45 * em;
        const dockW = DOCK.length * tile + (DOCK.length - 1) * gap + pad * 2;
        const dockX = (W - dockW) / 2;
        const dockY = H - 1.1 * u - tile - pad * 2;
        rr(dockX, dockY, dockW, tile + pad * 2, 1.2 * em);
        g.fillStyle = "rgba(40,40,44,0.6)";
        g.fill();
        g.strokeStyle = "rgba(255,255,255,0.12)";
        g.stroke();
        DOCK.forEach((id, i) => {
            const tx = dockX + pad + i * (tile + gap);
            const ty = dockY + pad;
            const gradient = g.createLinearGradient(0, ty, 0, ty + tile);
            gradient.addColorStop(0, DOCK_COLORS[id][0]);
            gradient.addColorStop(1, DOCK_COLORS[id][1]);
            rr(tx, ty, tile, tile, tile * 0.22);
            g.fillStyle = gradient;
            g.fill();
            g.fillStyle = "#fff";
            g.font = `600 ${tile * 0.36}px ${id === "terminal" ? mono : font}`;
            g.textAlign = "center";
            g.fillText(APPS[id].icon, tx + tile / 2, ty + tile * 0.63);
            g.textAlign = "left";
            if (state.windows.find((win) => win.id === id)?.open) {
                g.beginPath();
                g.arc(tx + tile / 2, dockY + tile + pad * 2 + 0.35 * em, 0.15 * em, 0, Math.PI * 2);
                g.fillStyle = "rgba(255,255,255,0.8)";
                g.fill();
            }
        });

        texture.needsUpdate = true;
        return true;
    }

    return { texture, paint, aspect: SCREEN_ASPECT };
}
