import { photographs } from "./photography";

// Only Bryan's own selection, never every file in the assets folder.
const selected = photographs.filter((photo) => photo.featured);
const fromTheR7 = selected.filter((photo) => photo.camera === "Canon EOS R7");

/** The frame kept on the back of the R7. It hangs first on the line. */
export const keeper = fromTheR7[0];

export const prints = [keeper, ...selected.filter((photo) => photo !== keeper)];

// Looked up inside the R7's selects, so nothing else can reach its screen.
const passedOver = ["Rosewater"];

/** What the R7's screen shows, in order. The keeper is always last. */
export const reviewFrames = [
    ...passedOver.flatMap((title) => fromTheR7.filter((photo) => photo.title === title)),
    keeper,
];
