/**
 * The wait for the room, spent at a piano. The bar is real download progress.
 * When the room is ready it fades in behind the keys; if nobody has touched
 * them, we walk straight in. If someone is mid-phrase, we don't pull the
 * piano out from under them: we say so and wait for them to come in.
 */

const SHORTCUTS = new Set(["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j", "k", "o", "l", "p", ";"]);
/** How recently a note must have been played to count as "still playing". */
const PLAYING_MS = 3000;
const LEAVE_MS = 700;

export function createLoader(root: HTMLElement, signal: AbortSignal) {
    const loader = root.querySelector<HTMLElement>("[data-room-loader]")!;
    const label = loader.querySelector<HTMLElement>("[data-loader-label]")!;
    const readout = loader.querySelector<HTMLElement>("[data-loader-readout]")!;
    const bar = loader.querySelector<HTMLElement>("[data-loader-bar]")!;
    const enter = loader.querySelector<HTMLButtonElement>("[data-loader-enter]")!;
    const piano = loader.querySelector<HTMLElement>(".playable-piano")!;
    const html = document.documentElement;

    // The film starts at the door, whatever the scroll was last visit.
    history.scrollRestoration = "manual";
    scrollTo(0, 0);
    root.dataset.loader = "on";
    html.style.overflow = "hidden";

    let lastPlayed = -Infinity;
    const played = () => (lastPlayed = performance.now());
    piano.addEventListener("pointerdown", played, { signal });
    addEventListener(
        "keydown",
        (event) => {
            if (piano.contains(document.activeElement) || SHORTCUTS.has(event.key.toLowerCase())) played();
        },
        { signal },
    );

    let gone = false;
    function leave() {
        if (gone) return;
        gone = true;
        loader.dataset.leaving = "";
        root.dataset.loader = "leaving";
        setTimeout(() => {
            root.dataset.loader = "off";
            html.style.overflow = "";
            loader.hidden = true;
        }, LEAVE_MS);
    }

    function progress(fraction: number) {
        readout.textContent = `${Math.round(fraction * 100)}%`;
        bar.style.transform = `scaleX(${fraction})`;
    }

    function ready() {
        progress(1);
        if (performance.now() - lastPlayed > PLAYING_MS) return leave();
        label.textContent = "The room’s ready. Finish your song.";
        readout.hidden = true;
        enter.hidden = false;
        enter.addEventListener("click", leave, { signal });
        // Trying to scroll is as clear a "let's go" as the button.
        addEventListener("wheel", (event) => event.deltaY > 0 && leave(), { signal, passive: true });
        addEventListener("keydown", (event) => ["ArrowDown", "PageDown", "End"].includes(event.key) && leave(), { signal });
        let touchY = 0;
        addEventListener("touchstart", (event) => (touchY = event.touches[0].clientY), { signal, passive: true });
        addEventListener(
            "touchmove",
            (event) => {
                if (!piano.contains(event.target as Node) && touchY - event.touches[0].clientY > 24) leave();
            },
            { signal, passive: true },
        );
    }

    function fail() {
        loader.hidden = true;
        root.dataset.loader = "off";
        html.style.overflow = "";
    }

    return { progress, ready, fail };
}
