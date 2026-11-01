/**
 * The site's one motion model. Three rules, and every moving thing obeys them:
 *
 *   1. Whatever you touch moves 1:1 with you. Scrolling is never smoothed or
 *      taken over; a dragged object stays under your finger.
 *   2. Whatever is attached to it follows with mass, so it is a spring, and a
 *      released object keeps the velocity you gave it.
 *   3. Nothing moves without a cause. The loop below sleeps when everything has
 *      settled, so an idle page does no animation work at all.
 *
 * The CSS curves --spring and --spring-lively are sampled from this same model.
 */

type Ticker = (dt: number) => boolean;

const MAX_FRAME = 0.05;
const STEP = 1 / 240;

const tickers = new Set<Ticker>();
let frame = 0;
let last = 0;

function loop(now: number) {
    frame = 0;
    // A hidden tab stops rAF; the clamp stops the first frame back from lurching.
    const dt = Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    for (const ticker of tickers) {
        if (!ticker(dt)) tickers.delete(ticker);
    }
    if (tickers.size) frame = requestAnimationFrame(loop);
}

/** Runs `ticker` every frame until it returns false. */
export function addTicker(ticker: Ticker) {
    tickers.add(ticker);
    if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(loop);
    }
}

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

/** False under the OS preference and under the site's own motion switch. */
export function motionEnabled() {
    return !reducedMotion.matches && document.documentElement.dataset.motion !== "off";
}

export function onMotionChange(callback: () => void, signal: AbortSignal) {
    reducedMotion.addEventListener("change", callback, { signal });
    document.addEventListener("motionchange", callback, { signal });
}

export interface SpringConfig {
    stiffness: number;
    damping: number;
    mass?: number;
    /** Below this distance and speed the spring counts as settled. */
    precision?: number;
}

export class Spring {
    value: number;
    velocity = 0;
    target: number;
    private running = false;

    constructor(
        value: number,
        private config: SpringConfig,
        private onChange: (value: number) => void,
        private onRest?: () => void,
    ) {
        this.value = value;
        this.target = value;
    }

    /** Jumps with no motion, and cancels whatever was happening. */
    set(value: number) {
        this.value = value;
        this.target = value;
        this.velocity = 0;
        this.running = false;
        this.onChange(value);
    }

    to(target: number, velocity?: number) {
        if (!motionEnabled()) {
            this.set(target);
            this.onRest?.();
            return;
        }
        this.target = target;
        if (velocity !== undefined) this.velocity = velocity;
        this.start();
    }

    /** An impulse: changes the speed and leaves the rest position alone. */
    kick(velocityChange: number) {
        if (!motionEnabled()) return;
        this.velocity += velocityChange;
        this.start();
    }

    private start() {
        if (this.running) return;
        this.running = true;
        addTicker(this.tick);
    }

    private tick = (dt: number) => {
        if (!this.running) return false;
        if (!motionEnabled()) {
            this.set(this.target);
            this.onRest?.();
            return false;
        }
        const { stiffness, damping, mass = 1, precision = 0.001 } = this.config;
        // Fixed substeps keep the feel identical at 60 and 120 Hz.
        for (let remaining = dt; remaining > 0; remaining -= STEP) {
            const h = Math.min(remaining, STEP);
            const acceleration = (-stiffness * (this.value - this.target) - damping * this.velocity) / mass;
            this.velocity += acceleration * h;
            this.value += this.velocity * h;
        }
        if (Math.abs(this.velocity) < precision && Math.abs(this.value - this.target) < precision) {
            this.value = this.target;
            this.velocity = 0;
            this.running = false;
            this.onChange(this.value);
            this.onRest?.();
            return false;
        }
        this.onChange(this.value);
        return true;
    };
}

/** Aborts when the page really goes away. A page entering bfcache keeps running. */
export function lifetime() {
    const controller = new AbortController();
    const { signal } = controller;
    window.addEventListener(
        "pagehide",
        (event) => {
            if (!event.persisted) controller.abort();
        },
        { signal },
    );
    document.addEventListener("astro:before-swap", () => controller.abort(), { signal });
    return signal;
}
