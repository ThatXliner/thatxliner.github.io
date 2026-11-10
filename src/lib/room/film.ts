import * as THREE from "three";
import { createRoom, loadImage, type RoomScene, type Shot } from "./scene";
import { createDesktop } from "./os";
import { createHall, type HallPhoto } from "./hall";
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
    // Camera holds on the room, then pushes in to sit at the laptop by `in`.
    hero: { hold: 0.045, words: [-1, 0.045] },
    push: { at: 0.11, in: 0.2 },
    typing: [0.08, 0.19],
    // At the desk: the camera holds and the laptop's desktop is real and usable.
    desk: { from: 0.2, to: 0.33, fade: 0.008 },
    pullOut: { from: 0.33, to: 0.37 },
    r7: { arrive: 0.435, hold: 0.49 },
    // The gallery wall gets the frame to itself: no words over the photographs.
    prints: { arrive: 0.54, hold: 0.565 },
    photography: { words: [0.435, 0.49] },
    trombone: { arrive: 0.615, hold: 0.68, words: [0.615, 0.68] },
    piano: { arrive: 0.745, hold: 0.835, words: [0.745, 0.835] },
    end: { arrive: 0.91, words: [0.91, 2] },
    dusk: [0.33, 0.537],
    night: [0.563, 0.743],
    lamp: [0.589, 0.621],
} as const;

/** Each chapter in the page, by its `data-chapter` name. */
const CHAPTERS: Record<string, readonly [number, number]> = {
    hero: BEATS.hero.words,
    photography: BEATS.photography.words,
    trombone: BEATS.trombone.words,
    piano: BEATS.piano.words,
    end: BEATS.end.words,
};

/** Somewhere you can go from the room, each with its own URL hash. */
export type PlaceId = "desk" | "gear" | "path" | "recognition" | "music" | "photographs";
const PLACES: PlaceId[] = ["desk", "gear", "path", "recognition", "music", "photographs"];

interface Key {
    at: number;
    shot: Shot;
}

function shotsFor(room: RoomScene, aspect: number): Key[] {
    const portrait = aspect < 0.9;
    const a = room.anchors;
    const screen = deskShot(room, aspect);
    // Backed off along the same line, so leaving the screen is a straight pull.
    const out = screen.position.clone().sub(screen.target).setLength(0.75).add(screen.target);
    const wide = portrait ? 52 : 40;
    const r7 = { position: a.r7.clone().add(v(0.34, 0.24, 0.46)), target: a.r7.clone().add(portrait ? v(0, -0.04, 0) : v(0.1, 0, -0.08)), fov: portrait ? 40 : 30 };
    // Square-on to the gallery, far enough back to take in the whole wall.
    const prints = { position: v(0, 1.62, portrait ? 0.9 : 1.55), target: v(0, 1.83, -2), fov: portrait ? 50 : 40 };
    const trombone = { position: a.trombone.clone().add(v(0.15, 0.15, 1.75)), target: a.trombone.clone().add(portrait ? v(0, -0.1, 0) : v(-0.22, 0.05, 0)), fov: portrait ? 50 : 40 };
    const piano = { position: v(1.95, 1.45, 1.55), target: a.piano.clone().add(v(-0.15, 0, 0)), fov: portrait ? 50 : 38 };
    const establishing = { position: v(0.75, 1.55, 2.45), target: v(-0.25, 0.95, -1.4), fov: wide };
    // Each subject is held still for its words; the camera only moves between holds.
    return [
        { at: 0, shot: establishing },
        { at: BEATS.hero.hold, shot: establishing },
        { at: BEATS.push.at, shot: { position: v(-0.3, 1.2, -0.25), target: a.laptop.clone().add(v(0, -0.05, 0)), fov: portrait ? 44 : 36 } },
        { at: BEATS.push.in, shot: screen },
        { at: BEATS.desk.to, shot: screen },
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
        // The whole room in one look, rug and shelf included: where exploring starts.
        { at: BEATS.end.arrive, shot: { position: v(0.45, 2.1, 2.45), target: v(0.05, 0.78, -0.9), fov: portrait ? 72 : 56 } },
        { at: 1, shot: { position: v(0.45, 2.15, 2.5), target: v(0.05, 0.78, -0.9), fov: portrait ? 72 : 56 } },
    ];
}

/** Sitting at the laptop: square-on, the whole display in view. */
const deskShot = (room: RoomScene, aspect: number) => room.screenShot(aspect, "contain");

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
        // How much the real desktop is showing over the painted one.
        desk: Math.min(span(p, BEATS.desk.from, BEATS.desk.from + BEATS.desk.fade), 1 - span(p, BEATS.desk.to - BEATS.desk.fade, BEATS.desk.to)),
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
    const desktop = createDesktop(root.querySelector<HTMLElement>("[data-os]")!, data.wallpaper, signal);
    const hall = createHall(root, data.photographs, signal);

    let room: RoomScene;
    try {
        const [wallpaper, billion, quillium, prints] = await Promise.all([
            loadImage(data.wallpaper),
            loadImage(data.billion),
            loadImage(matchMedia("(prefers-color-scheme: dark)").matches ? data.quillium : data.quilliumLight),
            Promise.all(data.prints.map((print: { src: string; aspect: number }) => loadImage(print.src).then((image) => ({ image, aspect: print.aspect })))),
        ]);
        await document.fonts.ready;
        room = await createRoom({
            canvas,
            screen: { wallpaper, billion, quillium },
            labels: data.labels,
            prints,
            photographs: (data.photographs as HallPhoto[]).map(({ thumb, aspect }) => ({ thumb, aspect })),
            story: data.story,
            releases: data.releases,
            onProgress: loader.progress,
        });
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
    const compact = () => canvas.clientWidth < 761;
    /** Lay the real desktop exactly over the painted one, as seen from the desk. */
    const placeDesktop = () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        desktop.place(room.screenRect(deskShot(room, width / height), width, height), compact());
    };
    placeDesktop();
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
    let lastVersion = -1;

    // Glass buttons: each rides its chapter's opacity and has a springy lift.
    // Pressing pushes past "hovered", like pressing into something soft.
    const lenses = [...root.querySelectorAll<HTMLElement>("[data-glass]")].map((element) => {
        const lens = { element, chapter: element.closest<HTMLElement>("[data-chapter]")!, lift: 0, velocity: 0, target: 0, hovered: false };
        const aim = () => (lens.target = element.matches(":active") ? 1.35 : lens.hovered || element.matches(":focus-visible") ? 1 : 0);
        element.addEventListener("pointerenter", () => ((lens.hovered = true), aim()), { signal });
        element.addEventListener("pointerleave", () => ((lens.hovered = false), aim()), { signal });
        for (const type of ["pointerdown", "pointerup", "pointercancel", "focus", "blur"]) element.addEventListener(type, () => requestAnimationFrame(aim), { signal });
        return lens;
    });
    const scrimmed = chapters.map((chapter) => chapter.element);
    /** Steps every lift spring; true while any is still moving. */
    function stepLenses(dt: number) {
        let moving = false;
        for (const lens of lenses) {
            if (reduced.matches) {
                lens.lift = lens.target;
                continue;
            }
            // Damping ratio about 0.65: a small overshoot, the same feel as --spring-lively.
            const stiffness = 260;
            const damping = 2 * Math.sqrt(stiffness) * 0.65;
            lens.velocity += (stiffness * (lens.target - lens.lift) - damping * lens.velocity) * dt;
            lens.lift += lens.velocity * dt;
            if (Math.abs(lens.target - lens.lift) < 1e-3 && Math.abs(lens.velocity) < 1e-3) {
                lens.lift = lens.target;
                lens.velocity = 0;
            } else moving = true;
        }
        return moving;
    }
    function overlay() {
        const canvasTop = canvas.getBoundingClientRect().top;
        const local = (rect: DOMRect) => new DOMRect(rect.left, rect.top - canvasTop, rect.width, rect.height);
        room.overlay({
            scrims: scrimmed
                .map((element) => ({ element, opacity: Number(element.style.opacity || 0) }))
                .filter((scrim) => scrim.opacity > 0)
                .map(({ element, opacity }) => ({ rect: local(element.getBoundingClientRect()), opacity })),
            lenses: lenses
                .map((lens) => ({ lens, opacity: Number(lens.chapter.style.opacity || 0) }))
                .filter(({ opacity }) => opacity > 0)
                .map(({ lens, opacity }) => ({ rect: local(lens.element.getBoundingClientRect()), opacity, lift: lens.lift })),
        });
    }
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

    // ── Places ───────────────────────────────────────────────────────────
    // The scroll is the guided tour. When it's over you're left standing in
    // the room, and anything with a dot can be walked up to: a "place". Four
    // are in this room (the desk, the camera bag, the rug, the shelf) and two
    // are through doors (the gallery and the music room). Each has a URL
    // hash, so it can be linked to, and the back button walks you out again.
    //
    // "film": the camera follows the scroll. "fly": it's travelling to or from
    // a place. "place": it's there, and the page doesn't scroll underneath.
    let mode: "film" | "fly" | "place" = "film";
    let place: PlaceId | null = null;
    let flight: { positions: THREE.CatmullRomCurve3; targets: THREE.CatmullRomCurve3; fovs: number[]; start: number; duration: number; to: PlaceId | null } | null = null;
    /** Where the film was when we left it, so coming back lands in the same moment. */
    let filmShown = 0;
    let walk = 0;
    let walkTarget = 0;
    let dirty = false;
    let bag = 0;
    let bagTarget = 0;
    let coversLoaded = false;
    const portrait = () => canvas.clientWidth / canvas.clientHeight < 0.9;
    const copy = (s: Shot): Shot => ({ position: s.position.clone(), target: s.target.clone(), fov: s.fov });
    const panels = new Map(PLACES.map((id) => [id, root.querySelector<HTMLElement>(`[data-panel="${id}"]`)]));
    const gearSheet = root.querySelector<HTMLElement>("[data-gear-sheet]")!;
    const html = document.documentElement;

    /** Where the camera stands for each place. */
    function placeShot(id: PlaceId): Shot {
        const a = room.anchors;
        const p = portrait();
        switch (id) {
            case "desk":
                return deskShot(room, canvas.clientWidth / canvas.clientHeight);
            case "gear":
                // Crouched in front of the desk, looking down into the bag.
                return { position: a.bag.clone().add(v(0.16, 0.6, p ? 1.05 : 0.9)), target: a.bag.clone().add(v(0, -0.03, 0)), fov: p ? 54 : 40 };
            case "path":
                // Straight down onto the rug, shifted so it sits left of the panel.
                // A phone can't fit the rug from under the ceiling, so it looks on at an angle.
                return p
                    ? { position: a.rug.clone().add(v(0, 2.35, 1.35)), target: a.rug.clone().add(v(0, 0, -0.1)), fov: 58 }
                    : { position: a.rug.clone().add(v(0.5, 2.55, 0.002)), target: a.rug.clone().add(v(0.5, 0, 0)), fov: 44 };
            case "recognition":
                return p
                    ? { position: v(0.55, 1.45, -0.3), target: v(2.2, 1.42, -0.3), fov: 62 }
                    : { position: v(0.9, 1.5, 0.15), target: v(2.2, 1.42, -0.62), fov: 44 };
            case "music":
                return room.music.view(p);
            case "photographs":
                return room.gallery.walk(walk, p);
        }
    }
    /** The doorways a place is reached through, in order from the room. */
    const via = (id: PlaceId): Shot[] =>
        id === "photographs" ? [room.gallery.doorway.outside, room.gallery.doorway.inside] : id === "music" ? [room.music.doorway.outside, room.music.doorway.inside] : [];
    /** Rise and turn before crossing the room, so the path clears the desk and the piano. */
    const lift = (from: Shot, toward: Shot): Shot => ({
        position: from.position.clone().lerp(toward.position, 0.45).setY(Math.max(1.35, (from.position.y + toward.position.y) / 2)),
        target: toward.target.clone(),
        fov: (from.fov + toward.fov) / 2,
    });

    function fly(stops: Shot[], to: PlaceId | null) {
        flight = {
            positions: new THREE.CatmullRomCurve3(stops.map((s) => s.position), false, "centripetal"),
            targets: new THREE.CatmullRomCurve3(stops.map((s) => s.target), false, "centripetal"),
            fovs: stops.map((s) => s.fov),
            start: performance.now(),
            duration: reduced.matches ? 0 : 1600 + 500 * Math.min(2, stops.length - 2),
            to,
        };
        mode = "fly";
    }

    function go(id: PlaceId, push = true) {
        if (mode !== "film") return;
        if (push) history.pushState({ room: id }, "", `#${id}`);
        filmShown = shown;
        place = id;
        // The page holds still while you're somewhere else in the house.
        html.style.overflow = "hidden";
        hideHotspots();
        const from = copy(shot);
        const stops = via(id);
        const dest = placeShot(id);
        fly([from, lift(from, stops[0] ?? dest), ...stops, dest], id);
        if (id === "photographs") hall.show(true);
        canvas.style.cursor = "";
    }

    function arrive(id: PlaceId) {
        mode = "place";
        panels.get(id)?.removeAttribute("hidden");
        if (id === "gear") bagTarget = 1;
        if (id === "path") room.showStop(selectedStop);
        if (id === "music" && !coversLoaded) {
            coversLoaded = true;
            room.music.loadCovers();
        }
        panels.get(id)?.querySelector<HTMLElement>("[data-place-close]")?.focus({ preventScroll: true });
        dirty = true;
    }

    function leave() {
        if (mode !== "place" || !place) return;
        const id = place;
        panels.get(id)?.setAttribute("hidden", "");
        gearSheet.hidden = true;
        hall.show(false);
        bagTarget = 0;
        if (id === "path") room.showStop(-1);
        const back = sample(keys, filmShown, { position: new THREE.Vector3(), target: new THREE.Vector3(), fov: 40 });
        const stops = via(id).reverse();
        fly([copy(shot), ...stops, lift(back, stops.at(-1) ?? copy(shot)), back], null);
        canvas.style.cursor = "";
    }

    /** Leave by the way you came: the back button if we added the entry, otherwise straight out. */
    function goBack() {
        if (history.state?.room) history.back();
        else {
            history.replaceState(null, "", location.pathname + location.search);
            leave();
        }
    }
    const hashPlace = () => {
        const id = location.hash.slice(1) as PlaceId;
        return PLACES.includes(id) ? id : null;
    };
    addEventListener(
        "popstate",
        () => {
            const id = hashPlace();
            if (id && mode === "film") go(id, false);
            else if (!id && mode === "place") leave();
        },
        { signal },
    );
    root.querySelector("[data-hall-back]")!.addEventListener("click", goBack, { signal });
    for (const close of root.querySelectorAll("[data-place-close]")) close.addEventListener("click", goBack, { signal });

    // Every way of asking for the photographs leads through the door.
    root.addEventListener(
        "click",
        (event) => {
            const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
            if (!link || mode !== "film" || event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const url = new URL(link.href);
            if (url.origin !== location.origin || url.pathname.replace(/\/$/, "") !== "/photography") return;
            event.preventDefault();
            go("photographs");
        },
        { signal },
    );
    root.addEventListener(
        "room:open",
        (event) => {
            const id = (event as CustomEvent).detail as PlaceId;
            if (!PLACES.includes(id) || mode !== "film") return;
            event.preventDefault();
            go(id);
        },
        { signal },
    );

    // ── Hotspots ─────────────────────────────────────────────────────────
    // A dot over each thing you can walk up to. All of them once the tour's
    // over; a few earlier, while the tour is looking right at their thing.
    const hotspots = [...root.querySelectorAll<HTMLButtonElement>("[data-hotspot]")].map((element) => {
        const id = element.dataset.hotspot as PlaceId;
        element.addEventListener("click", () => go(id), { signal });
        return { element, id };
    });
    const anchorOf = (id: PlaceId) => {
        const a = room.anchors;
        return { desk: a.laptop, gear: a.r7, path: a.rug.clone().add(v(0.35, 0.02, -0.35)), recognition: a.shelf, music: a.piano.clone().add(v(-0.2, 0.55, 0)), photographs: a.prints }[id];
    };
    const exploring = (p: number) => p >= BEATS.end.arrive;
    const duringTour: Partial<Record<PlaceId, readonly [number, number]>> = { gear: BEATS.photography.words, music: BEATS.piano.words };
    function placeHotspots(p: number) {
        const explore = exploring(p);
        root.toggleAttribute("data-exploring", explore);
        for (const { element, id } of hotspots) {
            const beat = duringTour[id];
            const wanted = mode === "film" && (explore || (beat !== undefined && p >= beat[0] && p <= beat[1]));
            const at = wanted ? room.project(anchorOf(id)) : null;
            const show = !!at?.visible;
            element.hidden = !show;
            if (at && show) element.style.transform = `translate3d(${at.x}px, ${at.y}px, 0)`;
        }
    }
    function hideHotspots() {
        root.removeAttribute("data-exploring");
        for (const { element } of hotspots) element.hidden = true;
    }

    // ── Skip to the end ──────────────────────────────────────────────────
    let snap = false;
    function skipToEnd() {
        const rect = track.getBoundingClientRect();
        scrollTo({ top: scrollY + rect.top + rect.height - innerHeight, behavior: "instant" as ScrollBehavior });
        // Cut, don't sweep the camera through the whole tour on the way.
        snap = true;
    }
    root.querySelector("[data-skip]")?.addEventListener("click", skipToEnd, { signal });

    // ── The gallery: walking the wall ────────────────────────────────────
    const inGallery = () => mode === "place" && place === "photographs";
    const step = (direction: 1 | -1) => {
        const next = Math.min(room.gallery.count - 1, Math.max(0, room.gallery.nearest(walkTarget) + direction));
        walkTarget = room.gallery.at(next);
    };
    const nudge = (pixels: number) => (walkTarget = clamp01(walkTarget + pixels / (room.gallery.span * 380)));
    addEventListener(
        "wheel",
        (event) => {
            if (inGallery() && !hall.open) nudge(event.deltaY + event.deltaX);
        },
        { signal, passive: true },
    );
    let touch = { x: 0, y: 0 };
    addEventListener("touchstart", (event) => (touch = { x: event.touches[0].clientX, y: event.touches[0].clientY }), { signal, passive: true });
    addEventListener(
        "touchmove",
        (event) => {
            if (!inGallery() || hall.open) return;
            event.preventDefault();
            const { clientX: x, clientY: y } = event.touches[0];
            nudge((touch.y - y + (touch.x - x)) * 1.6);
            touch = { x, y };
        },
        { signal, passive: false },
    );
    addEventListener(
        "keydown",
        (event) => {
            if (mode === "film" || hall.open) return;
            if ((event.target as Element).closest?.("input, textarea, [contenteditable]")) return;
            if (event.key === "Escape") return goBack();
            if (!inGallery()) return;
            const forward = ["ArrowRight", "ArrowDown", "PageDown", " "];
            const backward = ["ArrowLeft", "ArrowUp", "PageUp"];
            if (forward.includes(event.key)) step(1);
            else if (backward.includes(event.key)) step(-1);
            else if (event.key === "Home") walkTarget = 0;
            else if (event.key === "End") walkTarget = 1;
            else return;
            event.preventDefault();
        },
        { signal },
    );

    // Clicking in the scene: a photograph in the gallery, a stop on the rug.
    const canvasPoint = (event: MouseEvent) => {
        const box = canvas.getBoundingClientRect();
        return [event.clientX - box.left, event.clientY - box.top] as const;
    };
    canvas.addEventListener(
        "click",
        (event) => {
            if (inGallery()) {
                const index = room.pickPhoto(...canvasPoint(event));
                if (index < 0) return;
                walkTarget = room.gallery.at(index);
                hall.lightbox(index);
            } else if (mode === "place" && place === "path") {
                const index = room.pickStop(...canvasPoint(event));
                if (index >= 0) selectStop(index, true);
            }
        },
        { signal },
    );
    canvas.addEventListener(
        "pointermove",
        (event) => {
            const point = canvasPoint(event);
            if (inGallery()) canvas.style.cursor = room.pickPhoto(...point) >= 0 ? "zoom-in" : "";
            else if (mode === "place" && place === "path") canvas.style.cursor = room.pickStop(...point) >= 0 ? "pointer" : "";
        },
        { signal },
    );
    hall.onBrowse = (index) => (walkTarget = room.gallery.at(index));
    // The photographs come in once the room is settled, not during its load.
    setTimeout(() => room.gallery.load(() => (dirty = true)), 1200);

    // ── The path on the rug ──────────────────────────────────────────────
    let selectedStop = 0;
    const stopItems = [...root.querySelectorAll<HTMLButtonElement>("[data-stop]")];
    function selectStop(index: number, fromRug = false) {
        selectedStop = index;
        room.showStop(index);
        stopItems.forEach((item, i) => item.setAttribute("aria-expanded", String(i === index)));
        if (fromRug) stopItems[index]?.scrollIntoView({ block: "nearest", behavior: reduced.matches ? "auto" : "smooth" });
        dirty = true;
    }
    stopItems.forEach((item, i) => item.addEventListener("click", () => selectStop(i), { signal }));

    // ── The gear: the bag opens, then the loadout ────────────────────────
    gearSheet.querySelector("[data-place-close]")?.addEventListener("click", goBack, { signal });

    /** Everything but the film: flying between places, or being at one. */
    function elsewhere(now: number, dt: number) {
        const state = stateAt(filmShown);
        const atDesk = mode === "place" && place === "desk";
        desktop.show(atDesk ? 1 : 0);
        let changed = dirty;
        dirty = false;
        // The bag's lid, on its own easing; the loadout comes up once it's open.
        if (bag !== bagTarget) {
            bag = reduced.matches ? bagTarget : bag + (bagTarget - bag) * (1 - Math.exp(-dt * 6));
            if (Math.abs(bagTarget - bag) < 0.002) bag = bagTarget;
            room.openBag(smoother(bag));
            changed = true;
        }
        if (mode === "place" && place === "gear" && bag > 0.85 && gearSheet.hidden) {
            gearSheet.hidden = false;
            gearSheet.querySelector<HTMLElement>("[data-place-close]")?.focus({ preventScroll: true });
        }
        if (mode === "place" && place === "music") {
            room.music.spin(dt);
            changed = true;
        }
        if (mode === "fly" && flight) {
            const t = flight.duration ? clamp01((now - flight.start) / flight.duration) : 1;
            const e = smoother(t);
            flight.positions.getPoint(e, shot.position);
            flight.targets.getPoint(e, shot.target);
            const f = e * (flight.fovs.length - 1);
            const i = Math.min(flight.fovs.length - 2, Math.floor(f));
            shot.fov = flight.fovs[i] + (flight.fovs[i + 1] - flight.fovs[i]) * (f - i);
            changed = true;
            if (t >= 1) {
                const to = flight.to;
                flight = null;
                if (to) arrive(to);
                else {
                    mode = "film";
                    place = null;
                    html.style.overflow = "";
                    lastShown = -1;
                }
            }
        } else if (inGallery()) {
            const before = walk;
            walk = reduced.matches ? walkTarget : walk + (walkTarget - walk) * (1 - Math.exp(-dt * 6));
            if (Math.abs(walkTarget - walk) < 1e-5) walk = walkTarget;
            const at = room.gallery.walk(walk, portrait());
            shot.position.copy(at.position);
            shot.target.copy(at.target);
            shot.fov = at.fov;
            hall.describe(room.gallery.nearest(walk));
            changed ||= walk !== before;
        }
        if (!changed) return;
        showChapters(10);
        overlay();
        room.render(shot, { screen: { typed: state.typed, windows: desktop.windows, version: desktop.version }, daylight: state.daylight, lamp: state.lamp });
    }

    function frame(now: number) {
        if (signal.aborted) return;
        const dt = Math.min(0.1, (now - lastTime) / 1000);
        lastTime = now;
        if (mode !== "film") {
            elsewhere(now, dt);
            requestAnimationFrame(frame);
            return;
        }
        const target = frozen ?? progress();
        // A critically-damped-ish follow: about a quarter second to settle.
        shown = reduced.matches || snap ? target : shown + (target - shown) * (1 - Math.exp(-dt * 7));
        snap = false;
        if (Math.abs(target - shown) < 1e-5) shown = target;
        const state = stateAt(shown);
        desktop.show(state.desk);
        // Redraw when the playhead moves, or when the desktop's arrangement
        // does and the painted screen is what's showing.
        const repaint = desktop.version !== lastVersion && state.desk < 1;
        const liftMoving = stepLenses(dt);
        if (shown !== lastShown || repaint) {
            sample(keys, shown, shot);
            if (pinned) {
                shot.position.copy(pinned.position);
                shot.target.copy(pinned.target);
                shot.fov = pinned.fov;
            }
            showChapters(shown);
            overlay();
            room.render(shot, { screen: { typed: state.typed, windows: desktop.windows, version: desktop.version }, daylight: state.daylight, lamp: state.lamp });
            placeHotspots(shown);
            lastShown = shown;
            if (state.desk < 1) lastVersion = desktop.version;
        } else if (liftMoving) {
            // Only the glass changed: redraw it over the last frame of the room.
            overlay();
            room.present();
        }
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    const resize = () => {
        room.resize();
        keys = shotsFor(room, canvas.clientWidth / canvas.clientHeight);
        placeDesktop();
        lastShown = -1;
        dirty = true;
    };
    new ResizeObserver(resize).observe(canvas);

    // Leaving the desk on purpose: on a phone the windows fill the screen, so
    // there's no bare desktop to scroll past.
    root.querySelector("[data-os-leave]")!.addEventListener(
        "click",
        () => {
            if (mode === "place") return goBack();
            const rect = track.getBoundingClientRect();
            const p = (BEATS.pullOut.from + BEATS.pullOut.to) / 2;
            scrollTo({ top: scrollY + rect.top + p * (rect.height - innerHeight), behavior: reduced.matches ? "auto" : "smooth" });
        },
        { signal },
    );

    // Arriving at /room#music (or any place) skips the tour and walks straight there,
    // once the loading screen has stepped aside.
    const arrived = hashPlace();
    if (arrived) {
        const ready = () => (root.dataset.loader === "off" ? Promise.resolve() : new Promise<void>((resolve) => setTimeout(() => ready().then(resolve), 120)));
        ready().then(() => {
            skipToEnd();
            requestAnimationFrame(() => requestAnimationFrame(() => go(arrived, false)));
        });
    }

    // Tabbing to a link in a chapter that's off-screen brings its moment back.
    root.addEventListener(
        "focusin",
        (event) => {
            // Only keyboard focus: a click already happens where you're looking.
            const chapter = chapters.find((c) => c.element.contains(event.target as Node));
            if (!chapter || mode !== "film" || !(event.target as Element).matches(":focus-visible")) return;
            const p = (chapter.from + chapter.to) / 2;
            const rect = track.getBoundingClientRect();
            const top = scrollY + rect.top + p * (rect.height - innerHeight);
            scrollTo({ top, behavior: reduced.matches ? "auto" : "smooth" });
        },
        { signal },
    );
}
