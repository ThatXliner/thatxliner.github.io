/**
 * The "Look closer" chapter as one timeline, shared by the scene, the stage and
 * the print. Kept apart from camera-scene so three.js stays out of the first load.
 *
 * Progress is 0 to 1 while the stage is pinned. -1 to 0 is the stage scrolling
 * into view, so the camera is already in place when the page stops moving it.
 * The line of prints starts rising at about 0.444, which is `.frames` overlapping
 * the last 100svh of the 180svh pinned travel.
 */
export const BEATS = {
    /** The camera comes round to face you as the stage arrives. */
    settle: [-1, -0.05],
    copyOut: [0.1, 0.16],
    /** Turned over and brought up to look at, the way you check a shot. */
    turn: [0.12, 0.3],
    /** One click of the dial, from the frame passed over to the keeper. */
    cuts: [0.36],
    noteIn: [0.37, 0.4],
    noteOut: [0.44, 0.46],
    /** The print leaves the screen and is held up on its own. */
    lift: [0.45, 0.6],
    /** The camera is lowered out from under it, and is gone before the line arrives. */
    sink: [0.46, 0.57],
    cameraOut: [0.5, 0.56],
    /** The print settles under its clip as the line comes up to it. */
    meet: [0.74, 0.94],
} as const;

export const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;

export function smoothstep(value: number, [from, to]: readonly [number, number]) {
    const t = Math.min(1, Math.max(0, (value - from) / (to - from)));
    return t * t * (3 - 2 * t);
}

export interface Rect {
    left: number;
    top: number;
    width: number;
    height: number;
}
