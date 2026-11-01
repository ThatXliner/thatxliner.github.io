import { addTicker, motionEnabled, onMotionChange, Spring } from "./motion";

/** Measures how far each pinned section must overhang before it sticks. */
export function initPins(signal: AbortSignal) {
    const pins = [...document.querySelectorAll<HTMLElement>("[data-pin]")];
    if (!pins.length) return;
    // Height comes from the first measure and width changes only: a mobile
    // toolbar collapsing mid-scroll must not move a pinned section.
    let viewport = window.innerHeight;
    let width = window.innerWidth;
    const measure = () => {
        for (const pin of pins) {
            pin.style.setProperty("--pin-top", `${Math.min(0, viewport - pin.offsetHeight)}px`);
        }
    };
    const observer = new ResizeObserver(measure);
    pins.forEach((pin) => observer.observe(pin));
    window.addEventListener(
        "resize",
        () => {
            if (window.innerWidth === width && matchMedia("(pointer: coarse)").matches) return;
            width = window.innerWidth;
            viewport = window.innerHeight;
            measure();
        },
        { signal, passive: true },
    );
    signal.addEventListener("abort", () => observer.disconnect());
    measure();
}

/**
 * Adds mouse drag to a native horizontal scroller. Touch, trackpads, the
 * scrollbar and arrow keys all stay native. The vertical wheel is never touched.
 * Letting go keeps the hand's speed, then surface friction takes it down.
 */
export function initRail(rail: HTMLElement, signal: AbortSignal) {
    let pressed = false;
    let moved = false;
    let startX = 0;
    let startScroll = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    let coasting = 0;

    const stopCoasting = () => {
        coasting++;
    };

    rail.addEventListener(
        "pointerdown",
        (event) => {
            if (event.pointerType !== "mouse" || event.button !== 0) return;
            stopCoasting();
            pressed = true;
            moved = false;
            startX = lastX = event.clientX;
            startScroll = rail.scrollLeft;
            lastTime = event.timeStamp;
            velocity = 0;
        },
        { signal },
    );
    rail.addEventListener(
        "pointermove",
        (event) => {
            if (!pressed) return;
            if (!(event.buttons & 1)) {
                pressed = false;
                moved = false;
                delete rail.dataset.dragging;
                return;
            }
            const distance = event.clientX - startX;
            if (!moved) {
                if (Math.abs(distance) < 5) return;
                moved = true;
                rail.setPointerCapture(event.pointerId);
                rail.dataset.dragging = "";
            }
            rail.scrollLeft = startScroll - distance;
            const elapsed = (event.timeStamp - lastTime) / 1000;
            if (elapsed > 0) {
                velocity = velocity * 0.6 + ((lastX - event.clientX) / elapsed) * 0.4;
                lastX = event.clientX;
                lastTime = event.timeStamp;
            }
        },
        { signal },
    );
    const release = (event: PointerEvent) => {
        if (!pressed) return;
        pressed = false;
        if (!moved) return;
        delete rail.dataset.dragging;
        // A pause before letting go means the hand has stopped.
        if (event.timeStamp - lastTime > 80 || !motionEnabled()) return;
        const id = ++coasting;
        let speed = velocity;
        addTicker((dt) => {
            if (id !== coasting || signal.aborted || !motionEnabled()) return false;
            speed *= Math.exp(-3.4 * dt);
            const before = rail.scrollLeft;
            rail.scrollLeft = before + speed * dt;
            return Math.abs(speed) > 24 && rail.scrollLeft !== before;
        });
    };
    // A click can leave the rail before the drag threshold grants capture.
    window.addEventListener("pointerup", release, { signal });
    window.addEventListener("pointercancel", () => {
        pressed = false;
        moved = false;
        delete rail.dataset.dragging;
        stopCoasting();
    }, { signal });
    rail.addEventListener("wheel", stopCoasting, { signal, passive: true });
    rail.addEventListener("touchstart", stopCoasting, { signal, passive: true });
    // Letting go after a drag must not also follow the link underneath.
    rail.addEventListener(
        "click",
        (event) => {
            if (!moved) return;
            event.preventDefault();
            event.stopPropagation();
            moved = false;
        },
        { signal, capture: true },
    );
    rail.addEventListener("dragstart", (event) => event.preventDefault(), { signal });
}

/**
 * A heavy object on a gimbal: it leans toward a fine pointer and swings back
 * when the pointer leaves. Touch gets none of this. A device held in the hand
 * has no hover to follow, and the finger belongs to scrolling.
 */
export function initTilt(element: HTMLElement, signal: AbortSignal) {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const maxDegrees = 4.5;
    const config = { stiffness: 70, damping: 13, precision: 0.002 };
    const apply = () => {
        element.style.transform = `perspective(1400px) rotateX(${rotateX.value.toFixed(3)}deg) rotateY(${rotateY.value.toFixed(3)}deg)`;
    };
    const rotateX = new Spring(0, config, apply);
    const rotateY = new Spring(0, config, apply);
    const reset = () => {
        rotateX.set(0);
        rotateY.set(0);
    };
    onMotionChange(() => {
        if (!motionEnabled()) reset();
    }, signal);
    signal.addEventListener("abort", reset);
    element.addEventListener(
        "pointermove",
        (event) => {
            if (event.pointerType !== "mouse" || !motionEnabled()) return;
            const box = element.getBoundingClientRect();
            rotateY.to(((event.clientX - box.left) / box.width - 0.5) * 2 * maxDegrees);
            rotateX.to(((event.clientY - box.top) / box.height - 0.5) * -2 * maxDegrees);
        },
        { signal, passive: true },
    );
    element.addEventListener(
        "pointerleave",
        () => {
            rotateX.to(0);
            rotateY.to(0);
        },
        { signal, passive: true },
    );
}
