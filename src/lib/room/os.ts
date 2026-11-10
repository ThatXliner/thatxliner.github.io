import { APPS, DOCK_H, MENU_H, PROMPT, defaultLayout, rectOf, type AppId, type Win } from "./desktop";

/**
 * The laptop's desktop, made to work: windows that drag, resize, stack, zoom
 * and close; a dock; a clock; a terminal that answers. The film decides where
 * it sits on the page and whether it's showing; this only runs the desktop.
 */

export interface Rect {
    left: number;
    top: number;
    width: number;
    height: number;
}

interface TerminalData {
    repos: { name: string; stars: number; language: string }[];
    stars: number;
    publicRepos: number;
    contributions: number;
    projects: { name: string; tagline: string }[];
    skills: string[];
    email: string;
}

const MIN_W = 0.2;
const MIN_H = 0.22;

export function createDesktop(root: HTMLElement, wallpaper: string, signal: AbortSignal) {
    const screen = root.querySelector<HTMLElement>("[data-os-screen]")!;
    screen.style.setProperty("--wallpaper", `url("${wallpaper}")`);
    const windows = defaultLayout();
    const elements = new Map(windows.map((win) => [win.id, root.querySelector<HTMLElement>(`[data-window="${win.id}"]`)!]));
    const dock = new Map([...root.querySelectorAll<HTMLElement>(".os-dock [data-open]")].map((button) => [button.dataset.open as AppId, button]));
    let compact = false;
    /** Bumped on every change, so the 3D painter knows when to repaint. */
    let version = 0;

    function place(win: Win) {
        const element = elements.get(win.id)!;
        const rect = rectOf(win);
        element.style.left = `${rect.x * 100}%`;
        element.style.top = `${rect.y * 100}%`;
        element.style.width = `${rect.w * 100}%`;
        element.style.height = `${rect.h * 100}%`;
        element.style.zIndex = String(win.z + 1);
        element.toggleAttribute("data-closed", !win.open);
        element.inert = !win.open;
        dock.get(win.id)?.toggleAttribute("data-running", win.open);
    }

    function render() {
        const front = top();
        for (const win of windows) {
            place(win);
            elements.get(win.id)!.toggleAttribute("data-focused", win === front);
        }
        version++;
    }

    const top = () => windows.filter((win) => win.open).sort((a, b) => b.z - a.z)[0];
    const get = (id: AppId) => windows.find((win) => win.id === id)!;

    function focus(win: Win) {
        const highest = Math.max(...windows.map((w) => w.z));
        if (win.z !== highest || !win.open) win.z = highest + 1;
        render();
    }

    let framesLoaded = false;
    /** The two product sites load only once someone is actually at the desk. */
    function loadFrames() {
        if (framesLoaded) return;
        framesLoaded = true;
        for (const frame of root.querySelectorAll<HTMLIFrameElement>("iframe[data-src]")) frame.src = frame.dataset.src!;
    }

    function open(id: AppId) {
        const win = get(id);
        win.open = true;
        focus(win);
        if (id === "terminal") setTimeout(() => input.focus({ preventScroll: true }), 50);
    }

    function close(id: AppId) {
        get(id).open = false;
        render();
    }

    // Dock and anything else that opens an app.
    root.addEventListener(
        "click",
        (event) => {
            const opener = (event.target as Element).closest<HTMLElement>("[data-open]");
            if (opener) open(opener.dataset.open as AppId);
        },
        { signal },
    );

    for (const win of windows) {
        const element = elements.get(win.id)!;
        element.addEventListener("pointerdown", () => win !== top() && focus(win), { signal });
        element.querySelector("[data-close]")!.addEventListener("click", () => close(win.id), { signal });
        element.querySelector("[data-min]")!.addEventListener("click", () => close(win.id), { signal });
        const zoom = () => {
            win.zoomed = !win.zoomed;
            focus(win);
        };
        element.querySelector("[data-zoom]")!.addEventListener("click", zoom, { signal });
        const bar = element.querySelector<HTMLElement>("[data-drag]")!;
        bar.addEventListener("dblclick", (event) => !(event.target as Element).closest("button, a") && zoom(), { signal });

        // Drag by the title bar, resize by the corner. Both in display fractions.
        const track = (handle: HTMLElement, mode: "move" | "resize") =>
            handle.addEventListener(
                "pointerdown",
                (event) => {
                    if (compact || event.button !== 0 || (event.target as Element).closest("button, a")) return;
                    event.preventDefault();
                    handle.setPointerCapture(event.pointerId);
                    const box = screen.getBoundingClientRect();
                    if (win.zoomed) Object.assign(win, rectOf(win), { zoomed: false });
                    const start = { x: event.clientX, y: event.clientY, win: { ...win } };
                    root.dataset.dragging = "";
                    const move = (e: PointerEvent) => {
                        const dx = (e.clientX - start.x) / box.width;
                        const dy = (e.clientY - start.y) / box.height;
                        if (mode === "move") {
                            // Keep the title bar reachable: never under the menu bar or off the edges.
                            win.x = Math.min(1 - 0.08, Math.max(0.08 - win.w, start.win.x + dx));
                            win.y = Math.min(1 - DOCK_H - 0.04, Math.max(MENU_H, start.win.y + dy));
                        } else {
                            win.w = Math.min(1 - win.x, Math.max(MIN_W, start.win.w + dx));
                            win.h = Math.min(1 - win.y, Math.max(MIN_H, start.win.h + dy));
                        }
                        place(win);
                        version++;
                    };
                    const end = () => {
                        delete root.dataset.dragging;
                        handle.removeEventListener("pointermove", move);
                        handle.removeEventListener("pointerup", end);
                        handle.removeEventListener("pointercancel", end);
                    };
                    handle.addEventListener("pointermove", move);
                    handle.addEventListener("pointerup", end);
                    handle.addEventListener("pointercancel", end);
                },
                { signal },
            );
        track(bar, "move");
        track(element.querySelector<HTMLElement>("[data-resize]")!, "resize");
    }

    // Skills: a tab list.
    const skillTabs = [...root.querySelectorAll<HTMLButtonElement>("[data-skill]")];
    for (const tab of skillTabs)
        tab.addEventListener(
            "click",
            () => {
                for (const other of skillTabs) {
                    const selected = other === tab;
                    other.setAttribute("aria-selected", String(selected));
                    root.querySelector<HTMLElement>(`#${other.getAttribute("aria-controls")}`)!.hidden = !selected;
                }
            },
            { signal },
        );

    // Finder sidebar links scroll their own pane, never the page.
    for (const link of root.querySelectorAll<HTMLAnchorElement>(".finder-side a"))
        link.addEventListener(
            "click",
            (event) => {
                event.preventDefault();
                const target = root.querySelector<HTMLElement>(link.getAttribute("href")!)!;
                const pane = target.closest<HTMLElement>("[data-scroll]")!;
                pane.scrollTo({ top: target.offsetTop - 8, behavior: "smooth" });
            },
            { signal },
        );

    // Clock.
    const clock = root.querySelector<HTMLElement>("[data-os-clock]")!;
    const tick = () => (clock.textContent = new Date().toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" }));
    tick();
    const timer = setInterval(tick, 15_000);
    signal.addEventListener("abort", () => clearInterval(timer));

    // ── Terminal ─────────────────────────────────────────────────────────
    const data: TerminalData = JSON.parse(root.dataset.terminal!);
    const term = root.querySelector<HTMLElement>("[data-term]")!;
    const log = root.querySelector<HTMLElement>("[data-term-log]")!;
    const input = root.querySelector<HTMLInputElement>("[data-term-input]")!;
    const history: string[] = [];
    let cursor = 0;

    type Line = string | { text: string; tone?: "dim" | "accent"; href?: string };
    const print = (...lines: Line[]) => {
        for (const line of lines) {
            const p = document.createElement("p");
            const { text, tone, href } = typeof line === "string" ? { text: line, tone: undefined, href: undefined } : line;
            if (href) {
                const a = document.createElement("a");
                a.href = href;
                a.textContent = text;
                p.append(a);
            } else p.textContent = text || " ";
            if (tone) p.className = `term-${tone}`;
            log.append(p);
        }
    };
    const pad = (text: string, width: number) => text + " ".repeat(Math.max(1, width - text.length));
    const openable: Record<string, AppId> = { billion: "billion", quillium: "quillium", projects: "projects", repos: "repos", skills: "skills", terminal: "terminal" };

    const commands: Record<string, { about: string; run: (args: string[]) => void }> = {
        help: {
            about: "this list",
            run: () =>
                print(
                    ...Object.entries(commands)
                        .filter(([, command]) => command.about)
                        .map(([name, command]) => ({ text: `${pad(name, 12)}${command.about}`, tone: "dim" as const })),
                ),
        },
        whoami: { about: "who lives here", run: () => print("bryan — I build apps and open-source tools.", "I also take photographs and play piano and trombone.") },
        ls: { about: "what’s on this machine", run: () => print({ text: "billion/   quillium/   projects/   repos/   skills/   resume.pdf   photographs/", tone: "accent" }) },
        open: {
            about: "open <billion|quillium|projects|repos|skills|resume|photos>",
            run: ([what = ""]) => {
                const name = what.replace(/\/$/, "").replace(/\.pdf$/, "").toLowerCase();
                if (openable[name]) {
                    open(openable[name]);
                    return print({ text: `Opening ${APPS[openable[name]].title}…`, tone: "dim" });
                }
                if (name === "resume") return (location.href = "/resume.pdf");
                if (name === "photos" || name === "photographs") return (location.href = "/photography");
                print(what ? `open: ${what}: no such app` : "open what? Try: open billion");
            },
        },
        cd: { about: "", run: (args) => commands.open.run(args) },
        projects: { about: "the ones worth showing", run: () => print(...data.projects.map((p) => `${pad(p.name, 16)}${p.tagline}`), { text: "open projects for the rest", tone: "dim" }) },
        repos: {
            about: "most-starred public repos",
            run: () => print(...data.repos.map((r) => ({ text: `★ ${String(r.stars).padStart(4)}  ${pad(r.name, 22)}${r.language}`, href: `https://github.com/ThatXliner/${r.name}` }))),
        },
        skills: { about: "what I work in", run: () => print(data.skills.join(" · "), { text: "open skills for the details", tone: "dim" }) },
        neofetch: {
            about: "the machine, summarized",
            run: () =>
                print(
                    { text: "bryan@room", tone: "accent" },
                    { text: "──────────", tone: "dim" },
                    "OS        RoomOS (a website, honestly)",
                    "Host      a desk by the window",
                    "Shell     zsh, allegedly",
                    `Repos     ${data.publicRepos} public, ${data.stars} stars`,
                    `Commits   ${data.contributions.toLocaleString("en-US")} contributions this year`,
                    `Stack     ${data.skills.slice(0, 6).join(", ")}`,
                    "Also      R7, C200, an upright piano, a trombone",
                ),
        },
        contact: { about: "how to reach me", run: () => print({ text: data.email, href: `mailto:${data.email}` }) },
        echo: { about: "", run: (args) => print(args.join(" ")) },
        clear: { about: "clear the screen", run: () => log.replaceChildren() },
        exit: { about: "close the terminal", run: () => close("terminal") },
        sudo: { about: "", run: () => print("Nice try.") },
        rm: { about: "", run: () => print("Not on my machine.") },
        vim: { about: "", run: () => print("You’d never get out. Try open quillium instead.") },
        git: { about: "", run: ([sub]) => print(sub === "log" ? "a lot of commits that say “fix”" : "git: try open repos") },
    };

    function run(raw: string) {
        const line = raw.trim();
        const echo = document.createElement("p");
        const prompt = document.createElement("span");
        prompt.className = "term-prompt";
        prompt.textContent = PROMPT;
        echo.append(prompt, ` ${line}`);
        log.append(echo);
        if (line) {
            history.push(line);
            const [name, ...args] = line.split(/\s+/);
            const command = commands[name.toLowerCase()];
            if (command) command.run(args);
            else print(`zsh: command not found: ${name}`, { text: "Try help.", tone: "dim" });
        }
        cursor = history.length;
        term.scrollTop = term.scrollHeight;
    }

    input.addEventListener(
        "keydown",
        (event) => {
            if (event.key === "Enter") {
                run(input.value);
                input.value = "";
            } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                event.preventDefault();
                cursor = Math.max(0, Math.min(history.length, cursor + (event.key === "ArrowUp" ? -1 : 1)));
                input.value = history[cursor] ?? "";
            } else if (event.key === "Tab") {
                event.preventDefault();
                const [first, ...rest] = input.value.split(" ");
                const pool = rest.length ? Object.keys(openable) : Object.keys(commands).filter((name) => commands[name].about);
                const word = rest.length ? rest[rest.length - 1] : first;
                const match = pool.filter((name) => name.startsWith(word.toLowerCase()));
                if (match.length === 1) input.value = rest.length ? `${first} ${match[0]}` : `${match[0]} `;
                else if (match.length > 1) print(match.join("   "));
            } else if (event.key === "l" && event.ctrlKey) {
                event.preventDefault();
                log.replaceChildren();
            }
            // Keys typed here belong to the terminal, not the page's piano or scroll.
            event.stopPropagation();
        },
        { signal },
    );
    term.addEventListener("click", () => getSelection()?.isCollapsed && input.focus({ preventScroll: true }), { signal });

    render();

    return {
        windows,
        /** Changes whenever the arrangement does. */
        get version() {
            return version;
        },
        /** Lay the desktop over `rect` (page pixels), or the whole viewport in compact mode. */
        place(rect: Rect, isCompact: boolean) {
            compact = isCompact;
            root.toggleAttribute("data-compact", isCompact);
            const r = isCompact ? { left: 0, top: 0, width: innerWidth, height: innerHeight } : rect;
            root.style.left = `${r.left}px`;
            root.style.top = `${r.top}px`;
            root.style.width = `${r.width}px`;
            root.style.height = `${r.height}px`;
        },
        /** 0 hidden, 1 fully there. Interactive only once it's fully there. */
        show(amount: number) {
            root.style.opacity = String(amount);
            root.toggleAttribute("data-live", amount > 0);
            const interactive = amount > 0.98;
            if (interactive && !root.hasAttribute("data-interactive")) loadFrames();
            root.toggleAttribute("data-interactive", interactive);
            root.inert = !interactive;
        },
    };
}

export type Desktop = ReturnType<typeof createDesktop>;
