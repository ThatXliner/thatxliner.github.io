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
        { at: BEATS.end.arrive, shot: { position: v(0.2, 1.75, 2.45), target: v(0, 1.05, -1.2), fov: wide + 6 } },
        { at: 1, shot: { position: v(0.2, 1.8, 2.5), target: v(0, 1.05, -1.2), fov: wide + 6 } },
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

    // ── Other rooms ──────────────────────────────────────────────────────
    // "film": the camera follows the scroll. "fly": it's travelling between
    // rooms along a path. "gallery": it's in the photographs' hall, and
    // scrolling walks the wall instead of moving the page.
    let mode: "film" | "fly" | "gallery" = "film";
    let flight: { positions: THREE.CatmullRomCurve3; targets: THREE.CatmullRomCurve3; fovs: number[]; start: number; duration: number; to: "film" | "gallery" } | null = null;
    /** Where the film was when we left it, so coming back lands in the same moment. */
    let filmShown = 0;
    let walk = 0;
    let walkTarget = 0;
    let hallDirty = false;
    const portrait = () => canvas.clientWidth / canvas.clientHeight < 0.9;
    const copy = (s: Shot): Shot => ({ position: s.position.clone(), target: s.target.clone(), fov: s.fov });

    function fly(stops: Shot[], to: "film" | "gallery") {
        flight = {
            positions: new THREE.CatmullRomCurve3(stops.map((s) => s.position), false, "centripetal"),
            targets: new THREE.CatmullRomCurve3(stops.map((s) => s.target), false, "centripetal"),
            fovs: stops.map((s) => s.fov),
            start: performance.now(),
            duration: reduced.matches ? 0 : 2600,
            to,
        };
        mode = "fly";
    }

    /** Through the door and into the gallery, from wherever the camera is. */
    function enterGallery(push: boolean) {
        if (mode !== "film") return;
        if (push) history.pushState({ room: "photographs" }, "", "#photographs");
        filmShown = shown;
        const from = copy(shot);
        const { outside, inside } = room.gallery.doorway;
        // Rise and turn toward the door before crossing the room, so the path
        // never cuts through the desk or the piano.
        const lift: Shot = { position: from.position.clone().lerp(outside.position, 0.45).setY(1.6), target: outside.target.clone(), fov: (from.fov + outside.fov) / 2 };
        fly([from, lift, outside, inside, room.gallery.walk(walk, portrait())], "gallery");
        hall.show(true);
        canvas.style.cursor = "";
    }

    function leaveGallery() {
        if (mode !== "gallery") return;
        hall.show(false);
        const back = sample(keys, filmShown, { position: new THREE.Vector3(), target: new THREE.Vector3(), fov: 40 });
        const { outside, inside } = room.gallery.doorway;
        const lift: Shot = { position: back.position.clone().lerp(outside.position, 0.45).setY(1.6), target: outside.target.clone(), fov: (back.fov + outside.fov) / 2 };
        fly([copy(shot), inside, outside, lift, back], "film");
        canvas.style.cursor = "";
    }

    /** Leave by the way you came: the back button if we added the entry, otherwise straight out. */
    function goBack() {
        if (history.state?.room === "photographs") history.back();
        else {
            history.replaceState(null, "", location.pathname + location.search);
            leaveGallery();
        }
    }
    addEventListener(
        "popstate",
        () => {
            if (location.hash === "#photographs") enterGallery(false);
            else if (mode === "gallery") leaveGallery();
        },
        { signal },
    );
    root.querySelector("[data-hall-back]")!.addEventListener("click", goBack, { signal });

    // Every way of asking for the photographs leads through the door.
    root.addEventListener(
        "click",
        (event) => {
            const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
            if (!link || mode !== "film" || event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const url = new URL(link.href);
            if (url.origin !== location.origin || url.pathname.replace(/\/$/, "") !== "/photography") return;
            event.preventDefault();
            enterGallery(true);
        },
        { signal },
    );
    root.addEventListener(
        "room:open",
        (event) => {
            if ((event as CustomEvent).detail !== "photographs" || mode !== "film") return;
            event.preventDefault();
            enterGallery(true);
        },
        { signal },
    );

    // Walking the wall: the wheel, a swipe, or the keys move you along it.
    const step = (direction: 1 | -1) => {
        const next = Math.min(room.gallery.count - 1, Math.max(0, room.gallery.nearest(walkTarget) + direction));
        walkTarget = room.gallery.at(next);
    };
    const nudge = (pixels: number) => (walkTarget = clamp01(walkTarget + pixels / (room.gallery.span * 380)));
    addEventListener(
        "wheel",
        (event) => {
            if (mode === "film") return;
            event.preventDefault();
            if (mode === "gallery" && !hall.open) nudge(event.deltaY + event.deltaX);
        },
        { signal, passive: false },
    );
    let touch = { x: 0, y: 0 };
    addEventListener("touchstart", (event) => (touch = { x: event.touches[0].clientX, y: event.touches[0].clientY }), { signal, passive: true });
    addEventListener(
        "touchmove",
        (event) => {
            if (mode === "film" || hall.open) return;
            event.preventDefault();
            const { clientX: x, clientY: y } = event.touches[0];
            if (mode === "gallery") nudge((touch.y - y + (touch.x - x)) * 1.6);
            touch = { x, y };
        },
        { signal, passive: false },
    );
    addEventListener(
        "keydown",
        (event) => {
            if (mode === "film" || hall.open) return;
            const forward = ["ArrowRight", "ArrowDown", "PageDown", " "];
            const backward = ["ArrowLeft", "ArrowUp", "PageUp"];
            if (event.key === "Escape") goBack();
            else if (mode !== "gallery") event.preventDefault();
            else if (forward.includes(event.key)) step(1);
            else if (backward.includes(event.key)) step(-1);
            else if (event.key === "Home") walkTarget = 0;
            else if (event.key === "End") walkTarget = 1;
            else return;
            event.preventDefault();
        },
        { signal },
    );
    // Click a photograph to look closer; the camera stops in front of it.
    const canvasPoint = (event: MouseEvent) => {
        const box = canvas.getBoundingClientRect();
        return [event.clientX - box.left, event.clientY - box.top] as const;
    };
    canvas.addEventListener(
        "click",
        (event) => {
            if (mode !== "gallery") return;
            const index = room.pickPhoto(...canvasPoint(event));
            if (index < 0) return;
            walkTarget = room.gallery.at(index);
            hall.lightbox(index);
        },
        { signal },
    );
    canvas.addEventListener(
        "pointermove",
        (event) => {
            if (mode !== "gallery") return;
            canvas.style.cursor = room.pickPhoto(...canvasPoint(event)) >= 0 ? "zoom-in" : "";
        },
        { signal },
    );
    hall.onBrowse = (index) => (walkTarget = room.gallery.at(index));
    // The photographs come in once the room is settled, not during its load.
    setTimeout(() => room.gallery.load(() => (hallDirty = true)), 1200);

    /** Everything but the film: flying between rooms, or walking the gallery. */
    function elsewhere(now: number, dt: number) {
        const state = stateAt(filmShown);
        desktop.show(0);
        let changed = hallDirty;
        hallDirty = false;
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
                mode = flight.to;
                flight = null;
                if (mode === "film") lastShown = -1;
            }
        } else if (mode === "gallery") {
            const before = walk;
            walk = reduced.matches ? walkTarget : walk + (walkTarget - walk) * (1 - Math.exp(-dt * 6));
            if (Math.abs(walkTarget - walk) < 1e-5) walk = walkTarget;
            const at = room.gallery.walk(walk, portrait());
            shot.position.copy(at.position);
            shot.target.copy(at.target);
            shot.fov = at.fov;
            hall.describe(room.gallery.nearest(walk));
            changed ||= walk !== before || lastShown !== -2;
            lastShown = -2;
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
        shown = reduced.matches ? target : shown + (target - shown) * (1 - Math.exp(-dt * 7));
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
        hallDirty = true;
    };
    new ResizeObserver(resize).observe(canvas);

    // Leaving the desk on purpose: on a phone the windows fill the screen, so
    // there's no bare desktop to scroll past.
    root.querySelector("[data-os-leave]")!.addEventListener(
        "click",
        () => {
            const rect = track.getBoundingClientRect();
            const p = (BEATS.pullOut.from + BEATS.pullOut.to) / 2;
            scrollTo({ top: scrollY + rect.top + p * (rect.height - innerHeight), behavior: reduced.matches ? "auto" : "smooth" });
        },
        { signal },
    );

    // Arriving at /room#photographs goes straight to the gallery.
    if (location.hash === "#photographs") enterGallery(false);

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
