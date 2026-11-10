import * as THREE from "three";
import { createRoom, loadImage, type RoomScene, type Shot } from "./scene";
import type { Bounds } from "./screen";
import { createLoader } from "./loader";

/**
 * Scroll is the playhead. The page is one tall track; a sticky canvas shows
 * the room, and scroll progress (0–1) picks the camera, the hour, and what's
 * on the laptop. The camera follows the playhead with a little mass, so a
 * flick of the wheel reads as a dolly move rather than a jump cut.
 */

const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const span = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/**
 * Every timing in the film, in playhead units, in one place. The rule that
 * keeps it readable: something moves, *then* the words for it arrive, and the
 * words are gone before the next thing moves. So each chapter sits inside a
 * hold, never across a transition.
 */
const BEATS = {
    // Camera holds on the room, then pushes in; the screen fills the view at `in`.
    hero: { hold: 0.045, words: [-1, 0.045] },
    push: { at: 0.11, in: 0.2 },
    typing: [0.06, 0.2],
    idea: { words: [0.205, 0.275] },
    billion: { arrive: [0.28, 0.315], words: [0.32, 0.37] },
    quillium: { arrive: [0.375, 0.41], words: [0.415, 0.465] },
    pullOut: { from: 0.47, to: 0.51 },
    r7: { arrive: 0.56, hold: 0.585 },
    prints: { arrive: 0.625, hold: 0.65 },
    photography: { words: [0.56, 0.65] },
    trombone: { arrive: 0.7, hold: 0.75, words: [0.7, 0.75] },
    piano: { arrive: 0.8, hold: 0.87, words: [0.8, 0.87] },
    end: { arrive: 0.93, words: [0.93, 2] },
    dusk: [0.47, 0.64],
    night: [0.66, 0.8],
    lamp: [0.68, 0.705],
} as const;

/** Each chapter in the page, by its `data-chapter` name. */
const CHAPTERS: Record<string, readonly [number, number]> = {
    hero: BEATS.hero.words,
    idea: BEATS.idea.words,
    billion: BEATS.billion.words,
    quillium: BEATS.quillium.words,
    photography: BEATS.photography.words,
    trombone: BEATS.trombone.words,
    piano: BEATS.piano.words,
    end: BEATS.end.words,
};

interface Key {
    at: number;
    shot: Shot;
}

function shotsFor(room: RoomScene, aspect: number): Key[] {
    const portrait = aspect < 0.9;
    const a = room.anchors;
    const screen = room.screenShot(aspect, portrait ? "contain" : "cover");
    if (portrait) {
        // On a phone the words go underneath, so the display rides in the top of the frame.
        const lift = screen.position.distanceTo(screen.target) * Math.tan(THREE.MathUtils.degToRad(screen.fov / 2)) * 0.42;
        screen.position.y -= lift;
        screen.target.y -= lift;
    }
    // Backed off along the same line, so leaving the screen is a straight pull.
    const out = screen.position.clone().sub(screen.target).setLength(0.75).add(screen.target);
    const wide = portrait ? 52 : 40;
    const r7 = { position: a.r7.clone().add(v(0.34, 0.24, 0.46)), target: a.r7.clone().add(portrait ? v(0, -0.04, 0) : v(0.1, 0, -0.08)), fov: portrait ? 40 : 30 };
    const prints = { position: v(-0.7, 1.45, 0.4), target: portrait ? v(-1.05, 1.5, -2) : v(-0.5, 1.5, -2), fov: portrait ? 48 : 38 };
    const trombone = { position: a.trombone.clone().add(v(0.15, 0.15, 1.75)), target: a.trombone.clone().add(portrait ? v(0, -0.1, 0) : v(-0.22, 0.05, 0)), fov: portrait ? 50 : 40 };
    const piano = { position: v(1.95, 1.45, 1.55), target: a.piano.clone().add(v(-0.15, 0, 0)), fov: portrait ? 50 : 38 };
    const establishing = { position: v(0.75, 1.55, 2.45), target: v(-0.25, 0.95, -1.4), fov: wide };
    // Each subject is held still for its words; the camera only moves between holds.
    return [
        { at: 0, shot: establishing },
        { at: BEATS.hero.hold, shot: establishing },
        { at: BEATS.push.at, shot: { position: v(-0.3, 1.2, -0.25), target: a.laptop.clone().add(v(0, -0.05, 0)), fov: portrait ? 44 : 36 } },
        { at: BEATS.push.in, shot: screen },
        { at: BEATS.pullOut.from, shot: screen },
        { at: BEATS.pullOut.to, shot: { position: out, target: a.laptop.clone(), fov: 34 } },
        // Down onto the R7, lying where it was put down.
        { at: BEATS.r7.arrive, shot: r7 },
        { at: BEATS.r7.hold, shot: r7 },
        // Up to the prints over the desk.
        { at: BEATS.prints.arrive, shot: prints },
        { at: BEATS.prints.hold, shot: prints },
        // Across to the trombone on its stand.
        { at: BEATS.trombone.arrive, shot: trombone },
        { at: BEATS.trombone.hold, shot: trombone },
        // The piano, with the C200 already pointed at it.
        { at: BEATS.piano.arrive, shot: piano },
        { at: BEATS.piano.hold, shot: piano },
        // Everything at once, after dark, still drifting back.
        { at: BEATS.end.arrive, shot: { position: v(0.2, 1.75, 2.45), target: v(0, 0.9, -1.2), fov: wide + 6 } },
        { at: 1, shot: { position: v(0.2, 1.8, 2.5), target: v(0, 0.9, -1.2), fov: wide + 6 } },
    ];
}

function sample(keys: Key[], p: number, out: Shot) {
    let i = 0;
    while (i < keys.length - 2 && p > keys[i + 1].at) i++;
    const a = keys[i];
    const b = keys[i + 1];
    const t = smoother(span(p, a.at, b.at));
    out.position.lerpVectors(a.shot.position, b.shot.position, t);
    out.target.lerpVectors(a.shot.target, b.shot.target, t);
    out.fov = a.shot.fov + (b.shot.fov - a.shot.fov) * t;
    return out;
}

/** What else the playhead controls, besides the camera. */
function stateAt(p: number) {
    return {
        typed: span(p, ...BEATS.typing),
        apps: smoother(span(p, ...BEATS.billion.arrive)) + smoother(span(p, ...BEATS.quillium.arrive)),
        // 1 golden hour → 0.5 dusk by the prints → 0 night by the piano.
        daylight: 1 - 0.5 * smoother(span(p, ...BEATS.dusk)) - 0.5 * smoother(span(p, ...BEATS.night)),
        lamp: smoother(span(p, ...BEATS.lamp)),
    };
}

export async function initRoomFilm(root: HTMLElement, signal: AbortSignal) {
    const canvas = root.querySelector<HTMLCanvasElement>("[data-room-canvas]")!;
    const track = root.querySelector<HTMLElement>("[data-room-track]")!;
    const status = root.querySelector<HTMLElement>("[data-room-status]")!;
    const loader = createLoader(root, signal);
    const chapters = [...root.querySelectorAll<HTMLElement>("[data-chapter]")].map((element) => {
        const [from, to] = CHAPTERS[element.dataset.chapter!];
        return { element, from, to };
    });
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const data = JSON.parse(root.dataset.room!);

    let room: RoomScene;
    try {
        const [wallpaper, quillium, prints, ...billion] = await Promise.all([
            loadImage(data.wallpaper),
            loadImage(data.quillium),
            Promise.all(data.prints.map((print: { src: string; aspect: number }) => loadImage(print.src).then((image) => ({ image, aspect: print.aspect })))),
            ...data.billion.map(loadImage),
        ]);
        await document.fonts.ready;
        room = await createRoom({ canvas, screen: { wallpaper, quillium, billion }, prints, onProgress: loader.progress });
    } catch (error) {
        console.error(error);
        status.textContent = "The room didn’t load, so here’s the short version.";
        root.dataset.state = "fallback";
        loader.fail();
        return;
    }
    if (signal.aborted) return room.dispose();
    root.dataset.state = "live";
    loader.ready();
    signal.addEventListener("abort", () => room.dispose());

    let keys = shotsFor(room, canvas.clientWidth / canvas.clientHeight);
    const onScreenChapters = chapters.filter((c) => c.to <= BEATS.pullOut.from && c.from >= BEATS.push.in);
    const bounds: Bounds = { left: 0, right: 1 };
    /**
     * The part of the laptop's display that's both visible and clear of the
     * words over it. Filling a narrower viewport crops the display's sides, so
     * this moves with the window shape.
     */
    function measureInset() {
        const width = canvas.clientWidth;
        const aspect = width / canvas.clientHeight;
        if (aspect < 0.9) return Object.assign(bounds, { left: 0.03, right: 0.97 });
        const words = Math.max(...onScreenChapters.map((c) => c.element.getBoundingClientRect().right)) + 40;
        const visible = Math.min(1, room.screenShot(aspect, "cover").visible.x);
        const crop = (1 - visible) / 2;
        bounds.left = crop + (words / width) * visible;
        bounds.right = 1 - crop - 0.025 * visible;
    }
    measureInset();
    const shot: Shot = { position: new THREE.Vector3(), target: new THREE.Vector3(), fov: 40 };

    const progress = () => {
        const rect = track.getBoundingClientRect();
        return clamp01(-rect.top / (rect.height - innerHeight));
    };
    const params = new URLSearchParams(location.search);
    // ?p=0.5 freezes the playhead, for checking a single frame.
    const frozen = params.has("p") ? Number(params.get("p")) : null;
    let shown = frozen ?? progress();
    let lastTime = performance.now();
    let lastShown = -1;
    // ?cam=x,y,z&look=x,y,z&fov=n pins the camera anywhere in the room, for inspecting a prop.
    const pinned = params.get("cam") && params.get("look")
        ? { position: v(...(params.get("cam")!.split(",").map(Number) as [number, number, number])), target: v(...(params.get("look")!.split(",").map(Number) as [number, number, number])), fov: Number(params.get("fov") ?? 30) }
        : null;

    function showChapters(p: number) {
        for (const chapter of chapters) {
            // Fades sit inside the window, so words never outlive their hold.
            const fade = 0.012;
            const visible = Math.min(span(p, chapter.from, chapter.from + fade), 1 - span(p, chapter.to - fade, chapter.to));
            const shift = (1 - visible) * (p < chapter.from + fade ? 24 : -24);
            chapter.element.style.opacity = String(visible);
            chapter.element.style.transform = `translate3d(0, ${shift}px, 0)`;
            chapter.element.style.pointerEvents = visible > 0.5 ? "auto" : "none";
        }
    }

    function frame(now: number) {
        if (signal.aborted) return;
        const dt = Math.min(0.1, (now - lastTime) / 1000);
        lastTime = now;
        const target = frozen ?? progress();
        // A critically-damped-ish follow: about a quarter second to settle.
        shown = reduced.matches ? target : shown + (target - shown) * (1 - Math.exp(-dt * 7));
        if (Math.abs(target - shown) < 1e-5) shown = target;
        const state = stateAt(shown);
        // Typing keeps a blinking cursor; otherwise nothing changes while still.
        const onScreen = shown > BEATS.typing[0] && shown < BEATS.pullOut.to;
        if (shown !== lastShown || onScreen) {
            sample(keys, shown, shot);
            if (pinned) {
                shot.position.copy(pinned.position);
                shot.target.copy(pinned.target);
                shot.fov = pinned.fov;
            }
            room.render(shot, { ...state, bounds }, now);
            showChapters(shown);
            lastShown = shown;
        }
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    const resize = () => {
        room.resize();
        keys = shotsFor(room, canvas.clientWidth / canvas.clientHeight);
        measureInset();
        lastShown = -1;
    };
    new ResizeObserver(resize).observe(canvas);

    // Tabbing to a link in a chapter that's off-screen brings its moment back.
    root.addEventListener(
        "focusin",
        (event) => {
            const chapter = chapters.find((c) => c.element.contains(event.target as Node));
            if (!chapter) return;
            const p = (chapter.from + chapter.to) / 2;
            const rect = track.getBoundingClientRect();
            const top = scrollY + rect.top + p * (rect.height - innerHeight);
            scrollTo({ top, behavior: reduced.matches ? "auto" : "smooth" });
        },
        { signal },
    );
}
