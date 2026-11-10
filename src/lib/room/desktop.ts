/**
 * The laptop's desktop, as data. Two things draw it: the canvas painter that
 * textures the 3D screen while the camera is moving, and the real HTML
 * desktop that takes over once the camera holds still. Both read window
 * positions from here, so the hand-off between them lines up.
 *
 * Rects are fractions of the whole display: x and y from its top-left.
 */

export type AppId = "billion" | "quillium" | "terminal" | "projects" | "repos" | "skills";

export interface Win {
    id: AppId;
    x: number;
    y: number;
    w: number;
    h: number;
    open: boolean;
    /** Stacking order; higher is in front. */
    z: number;
    zoomed: boolean;
}

/** Menu bar and dock, as fractions of the display's height. */
export const MENU_H = 0.034;
export const DOCK_H = 0.085;

export const APPS: Record<AppId, { title: string; icon: string }> = {
    billion: { title: "Billion", icon: "B" },
    quillium: { title: "Quillium", icon: "Q" },
    terminal: { title: "Terminal", icon: ">_" },
    projects: { title: "Projects", icon: "▤" },
    repos: { title: "Repositories", icon: "⑂" },
    skills: { title: "Skills", icon: "✦" },
};

/** The order apps sit in the dock. */
export const DOCK: AppId[] = ["billion", "quillium", "projects", "repos", "skills", "terminal"];

/** What's open when you sit down: both products, and a terminal on top. */
export function defaultLayout(): Win[] {
    return [
        { id: "billion", x: 0.04, y: 0.075, w: 0.41, h: 0.75, open: true, z: 1, zoomed: false },
        { id: "quillium", x: 0.34, y: 0.06, w: 0.555, h: 0.7, open: true, z: 2, zoomed: false },
        { id: "terminal", x: 0.09, y: 0.5, w: 0.4, h: 0.36, open: true, z: 3, zoomed: false },
        { id: "projects", x: 0.22, y: 0.1, w: 0.56, h: 0.7, open: false, z: 0, zoomed: false },
        { id: "repos", x: 0.18, y: 0.12, w: 0.6, h: 0.7, open: false, z: 0, zoomed: false },
        { id: "skills", x: 0.26, y: 0.1, w: 0.5, h: 0.68, open: false, z: 0, zoomed: false },
    ];
}

/** Where a window actually sits, accounting for zoom. */
export function rectOf(win: Win) {
    return win.zoomed ? { x: 0, y: MENU_H, w: 1, h: 1 - MENU_H - DOCK_H } : win;
}

/** What the terminal says before you've typed anything. */
export const TERMINAL_INTRO = {
    command: "whoami",
    output: ["bryan — I build apps and open-source tools.", "I also take photographs and play piano and trombone.", "", "Type help to look around."],
};

export const PROMPT = "bryan@room ~ %";
