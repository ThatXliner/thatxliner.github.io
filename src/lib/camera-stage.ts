import { motionEnabled, onMotionChange, Spring } from "./motion";
import { BEATS, smoothstep, type Rect } from "./camera-beats";
import { createPrintHandoff } from "./print-handoff";
import type { CameraScene, LcdFrame } from "./camera-scene";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Connects native scrolling to the "Look closer" scene. Scrolling is read and
 * never written. The chapter's timeline follows it on a critically damped spring,
 * so the camera has weight but no wobble. three.js and the models load only when
 * this chapter is close, and not at all without motion.
 */
export function initCameraStage(signal: AbortSignal) {
    const section = document.querySelector<HTMLElement>("[data-camera-stage]");
    if (!section) return;
    const stage = section.querySelector<HTMLElement>("[data-stage]")!;
    const canvas = section.querySelector<HTMLCanvasElement>("canvas")!;
    const copy = section.querySelector<HTMLElement>("[data-stage-copy]")!;
    const status = section.querySelector<HTMLElement>("[data-stage-status]")!;
    const note = section.querySelector<HTMLElement>("[data-stage-note]")!;
    const light = section.querySelector<HTMLElement>(".observe-light")!;
    const frames = section.nextElementSibling as HTMLElement | null;
    const firstPrint = frames?.querySelector<HTMLElement>("[data-print]");
    const lcdFrames: LcdFrame[] = JSON.parse(stage.dataset.lcdFrames ?? "[]");

    let scene: CameraScene | undefined;
    let handoff: ReturnType<typeof createPrintHandoff> | undefined;
    let review: { image: Rect; body: Rect } | undefined;
    let requested = false;
    let visible = false;
    let drawnPast = false;

    /** The stage is a control only while the camera can actually answer it. */
    let turnable = false;
    const setTurnable = (on: boolean) => {
        if (on === turnable) return;
        turnable = on;
        if (on) {
            stage.tabIndex = 0;
            stage.setAttribute("role", "group");
            stage.setAttribute("aria-label", "Canon EOS R7 model. The left and right arrow keys turn it.");
        } else {
            stage.removeAttribute("tabindex");
            stage.removeAttribute("role");
            stage.removeAttribute("aria-label");
        }
    };

    const apply = () => {
        const progress = motionEnabled() ? pose.value : 0;
        // The copy leaves before the camera turns away from you.
        const fade = scene ? 1 - smoothstep(progress, BEATS.copyOut) : 1;
        copy.style.opacity = String(fade);
        copy.style.translate = `0 ${((1 - fade) * -28).toFixed(1)}px`;
        copy.style.visibility = fade === 0 ? "hidden" : "";
        if (!scene || !motionEnabled()) {
            setTurnable(false);
            return;
        }

        setTurnable(progress <= BEATS.turn[0]);
        const noted = smoothstep(progress, BEATS.noteIn) * (1 - smoothstep(progress, BEATS.noteOut));
        note.style.opacity = String(noted);
        note.style.visibility = noted === 0 ? "hidden" : "";
        light.style.opacity = String(1 - smoothstep(progress, BEATS.sink));
        light.style.setProperty("--turn", String(smoothstep(progress, BEATS.turn)));
        // A filter, because the canvas's opacity carries its own arrival transition,
        // which would make this lag behind the scroll.
        const cameraOut = smoothstep(progress, BEATS.cameraOut);
        canvas.style.filter = cameraOut > 0 ? `opacity(${(1 - cameraOut).toFixed(3)})` : "";
        canvas.style.visibility = cameraOut === 1 ? "hidden" : "";
        if (review) handoff?.place(progress, review.image);

        if (!visible) return;
        // Once the camera has been lowered there is nothing left to draw.
        const past = progress >= BEATS.sink[1];
        if (!past || !drawnPast) scene.render(progress, yaw.value);
        drawnPast = past;
    };
    const pose = new Spring(0, { stiffness: 70, damping: 16.7, precision: 0.0004 }, apply);
    // Heavier than the pose, so it swings back slowly from a hard shove.
    const yaw = new Spring(0, { stiffness: 26, damping: 6.4, precision: 0.001 }, apply);

    const read = () => {
        const box = section.getBoundingClientRect();
        if (box.top > 0) return -Math.min(1, box.top / window.innerHeight);
        const travel = box.height - stage.offsetHeight;
        return travel > 0 ? Math.min(1, -box.top / travel) : 0;
    };
    const follow = () => {
        if (!motionEnabled() || !visible) return;
        const target = read();
        // Anchor links jump whole chapters. That's a cut, not a move.
        if (Math.abs(target - pose.value) > 0.45) pose.set(target);
        else pose.to(target);
    };

    const measure = () => {
        if (!scene) return;
        review = scene.measure();
        drawnPast = false;
        const { image, body } = review;
        note.style.left = `${image.left.toFixed(1)}px`;
        note.style.top = `${clamp(body.top + body.height + 6, 0, window.innerHeight - 72).toFixed(1)}px`;
    };

    /** Takes back everything the scene wrote, so the stylesheet's still page shows. */
    const stillness = () => {
        handoff?.clear();
        setTurnable(false);
        for (const element of [copy, note, light, canvas]) {
            for (const property of ["opacity", "translate", "visibility", "filter", "--turn"]) element.style.removeProperty(property);
        }
    };

    const goStatic = () => {
        section.dataset.static = "";
        status.hidden = true;
        stillness();
        handoff?.dispose();
        handoff = undefined;
    };

    async function load() {
        if (requested || !motionEnabled()) return;
        requested = true;
        if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) {
            goStatic();
            return;
        }
        status.hidden = false;
        try {
            const { createCameraScene } = await import("./camera-scene");
            const created = await createCameraScene(canvas, lcdFrames);
            if (signal.aborted) {
                created.dispose();
                return;
            }
            scene = created;
            section.dataset.state = "ready";
            status.hidden = true;
            if (firstPrint && frames) handoff = createPrintHandoff(firstPrint, frames, section);
            measure();
            pose.set(read());
            enableTurning();
        } catch {
            scene?.dispose();
            scene = undefined;
            review = undefined;
            goStatic();
        }
    }

    function enableTurning() {
        stage.addEventListener(
            "keydown",
            (event) => {
                if (!turnable) return;
                if (event.key === "ArrowLeft") yaw.kick(-2.6);
                else if (event.key === "ArrowRight") yaw.kick(2.6);
                else return;
                event.preventDefault();
            },
            { signal },
        );

        // Turning it is direct, and it swings back when let go, keeping whatever
        // speed the hand gave it. Vertical swipes stay with the browser (pan-y).
        let drag: { id: number; x: number; time: number; speed: number } | undefined;
        stage.addEventListener(
            "pointerdown",
            (event) => {
                if (event.button !== 0 || !turnable) return;
                // The words stay selectable.
                if ((event.target as Element).closest("[data-stage-copy]")) return;
                drag = { id: event.pointerId, x: event.clientX, time: event.timeStamp, speed: 0 };
                stage.setPointerCapture(event.pointerId);
                stage.dataset.grabbed = "";
            },
            { signal },
        );
        stage.addEventListener(
            "pointermove",
            (event) => {
                if (drag?.id !== event.pointerId) return;
                const change = (event.clientX - drag.x) * 0.007;
                const elapsed = Math.max(1, event.timeStamp - drag.time) / 1000;
                drag.speed = drag.speed * 0.6 + (change / elapsed) * 0.4;
                drag.x = event.clientX;
                drag.time = event.timeStamp;
                yaw.set(clamp(yaw.value + change, -1.5, 1.5));
            },
            { signal, passive: true },
        );
        const letGo = (event: PointerEvent) => {
            if (drag?.id !== event.pointerId) return;
            const speed = event.timeStamp - drag.time > 80 ? 0 : drag.speed;
            drag = undefined;
            delete stage.dataset.grabbed;
            yaw.to(0, clamp(speed, -9, 9));
        };
        stage.addEventListener("pointerup", letGo, { signal });
        stage.addEventListener("pointercancel", letGo, { signal });
    }

    const resize = new ResizeObserver(() => {
        scene?.resize();
        measure();
        apply();
    });
    resize.observe(canvas);

    // Fetch ahead of arrival; draw only while it is actually on screen.
    const nearby = new IntersectionObserver(
        (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) void load();
        },
        { rootMargin: "150% 0px" },
    );
    nearby.observe(section);
    const onscreen = new IntersectionObserver((entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        // Leaving as well as arriving: the print must not stay mid-air.
        if (motionEnabled()) pose.set(read());
    });
    onscreen.observe(section);

    window.addEventListener("scroll", follow, { signal, passive: true });
    window.addEventListener("resize", follow, { signal, passive: true });
    canvas.addEventListener(
        "webglcontextlost",
        (event) => {
            event.preventDefault();
            scene?.dispose();
            scene = undefined;
            review = undefined;
            goStatic();
        },
        { signal },
    );
    onMotionChange(() => {
        if (motionEnabled()) {
            drawnPast = false;
            pose.set(read());
            if (section.getBoundingClientRect().top < window.innerHeight * 2.5) void load();
        } else {
            stillness();
        }
    }, signal);

    signal.addEventListener("abort", () => {
        pose.set(0);
        yaw.set(0);
        resize.disconnect();
        nearby.disconnect();
        onscreen.disconnect();
        handoff?.dispose();
        handoff = undefined;
        scene?.dispose();
        scene = undefined;
    });
}
