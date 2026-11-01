import { motionEnabled, onMotionChange, Spring } from "./motion";
import type { CameraScene } from "./camera-scene";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Connects native scrolling to the "Look closer" scene. Scrolling is read and
 * never written. The camera's pose follows it on a critically damped spring, so
 * it has weight but no wobble. three.js and the models load only when this
 * chapter is close, and not at all without motion.
 */
export function initCameraStage(signal: AbortSignal) {
    const section = document.querySelector<HTMLElement>("[data-camera-stage]");
    if (!section) return;
    const stage = section.querySelector<HTMLElement>("[data-stage]")!;
    const canvas = section.querySelector<HTMLCanvasElement>("canvas")!;
    const copy = section.querySelector<HTMLElement>("[data-stage-copy]")!;
    const status = section.querySelector<HTMLElement>("[data-stage-status]")!;

    let scene: CameraScene | undefined;
    let requested = false;
    let visible = false;

    const apply = () => {
        const progress = motionEnabled() ? pose.value : 0;
        // The copy leaves before the camera turns away from you.
        const fade = scene ? 1 - clamp((progress - 0.38) / 0.1, 0, 1) : 1;
        copy.style.opacity = String(fade);
        copy.style.translate = `0 ${((1 - fade) * -28).toFixed(1)}px`;
        copy.style.visibility = fade === 0 ? "hidden" : "";
        if (scene && visible && motionEnabled()) scene.render(progress, yaw.value);
    };
    const pose = new Spring(0, { stiffness: 70, damping: 16.7, precision: 0.0004 }, apply);
    // Heavier than the pose, so it swings back slowly from a hard shove.
    const yaw = new Spring(0, { stiffness: 26, damping: 6.4, precision: 0.001 }, apply);

    const read = () => {
        const box = section.getBoundingClientRect();
        const travel = box.height - stage.offsetHeight;
        return travel > 0 ? clamp(-box.top / travel, 0, 1) : 0;
    };
    const follow = () => {
        if (!motionEnabled() || !visible) return;
        const target = read();
        // Anchor links jump whole chapters. That's a cut, not a move.
        if (Math.abs(target - pose.value) > 0.45) pose.set(target);
        else pose.to(target);
    };

    const goStatic = () => {
        section.dataset.static = "";
        status.hidden = true;
        stage.removeAttribute("tabindex");
        stage.removeAttribute("role");
        stage.removeAttribute("aria-label");
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
            const created = await createCameraScene(canvas);
            if (signal.aborted) {
                created.dispose();
                return;
            }
            scene = created;
            section.dataset.state = "ready";
            status.hidden = true;
            pose.set(read());
            enableTurning();
        } catch {
            goStatic();
        }
    }

    function enableTurning() {
        if (motionEnabled()) stage.tabIndex = 0;
        stage.setAttribute("role", "group");
        stage.setAttribute("aria-label", "Canon EOS R7 model. The left and right arrow keys turn it.");
        stage.addEventListener(
            "keydown",
            (event) => {
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
                if (event.button !== 0 || pose.value > 0.5 || !motionEnabled()) return;
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
        if (visible) {
            pose.set(read());
        }
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
            goStatic();
        },
        { signal },
    );
    onMotionChange(() => {
        if (motionEnabled()) {
            if (scene && !section.hasAttribute("data-static")) {
                stage.tabIndex = 0;
                stage.setAttribute("role", "group");
                stage.setAttribute("aria-label", "Canon EOS R7 model. The left and right arrow keys turn it.");
            }
            follow();
            if (section.getBoundingClientRect().top < window.innerHeight * 2.5) void load();
        } else {
            stage.removeAttribute("tabindex");
            stage.removeAttribute("role");
            stage.removeAttribute("aria-label");
            copy.style.removeProperty("opacity");
            copy.style.removeProperty("translate");
            copy.style.removeProperty("visibility");
        }
    }, signal);

    signal.addEventListener("abort", () => {
        pose.set(0);
        yaw.set(0);
        resize.disconnect();
        nearby.disconnect();
        onscreen.disconnect();
        scene?.dispose();
        scene = undefined;
    });
}
