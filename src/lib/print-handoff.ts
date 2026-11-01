import { BEATS, mix, smoothstep, type Rect } from "./camera-beats";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * The first print on the line, carried from the camera's screen to its own clip.
 * It is a copy of the real print, laid exactly over the screen's picture to begin
 * with, and it finishes exactly over the real one. Then the real one takes over
 * and native scrolling carries it. The position is a pure function of progress
 * and live layout, so it runs backward as well as forward.
 *
 * The gallery's heading is tied to the line, and the line rises through the held
 * print, so the heading stays unseen until the print's measured top edge has
 * cleared it. Nothing is ever covered, at any viewport size or scroll speed.
 */
export function createPrintHandoff(real: HTMLElement, frames: HTMLElement, host: HTMLElement) {
    const list = real.parentElement!;
    const realImage = real.querySelector("img")!;
    const head = frames.querySelector<HTMLElement>(".frames-head");

    const copy = real.cloneNode(true) as HTMLElement;
    copy.removeAttribute("data-print");
    copy.removeAttribute("data-awaiting");
    copy.style.transform = "";
    copy.querySelector(".print-clip")?.remove();
    const anchor = copy.querySelector("a")!;
    anchor.removeAttribute("href");
    anchor.style.background = "none";
    anchor.style.boxShadow = "none";
    const image = copy.querySelector("img")!;
    image.loading = "eager";
    image.alt = "";
    image.style.position = "relative";
    const title = copy.querySelector<HTMLElement>(".print-title")!;
    title.style.position = "relative";
    // On the screen it is only a picture. The paper arrives as it lifts.
    const mat = document.createElement("i");
    mat.className = "observe-print-mat";
    anchor.prepend(mat);

    const root = document.createElement("div");
    root.className = "observe-print";
    root.hidden = true;
    root.inert = true;
    root.setAttribute("aria-hidden", "true");
    root.append(copy);
    host.append(root);

    let flying = false;
    let latest: { progress: number; lcd: Rect } | undefined;
    const rail = real.closest<HTMLElement>("[data-rail]");
    const refresh = () => {
        if (latest) place(latest.progress, latest.lcd);
    };
    // The camera's spring sleeps at rest; the rail and keyboard can still move
    // its destination while the photograph is being held.
    rail?.addEventListener("scroll", refresh, { passive: true });
    real.addEventListener("focusin", refresh);
    real.addEventListener("focusout", refresh);

    function clear() {
        latest = undefined;
        root.hidden = true;
        flying = false;
        real.removeAttribute("data-awaiting");
        head?.style.removeProperty("opacity");
    }

    function place(progress: number, lcd: Rect) {
        latest = { progress, lcd };
        const loaded = image.complete && image.naturalWidth > 0;
        if (progress < BEATS.lift[0]) {
            real.toggleAttribute("data-awaiting", loaded);
            root.hidden = true;
            flying = false;
            if (loaded) head?.style.setProperty("opacity", "0");
            else head?.style.removeProperty("opacity");
            return;
        }
        // Offsets, because the real print may be mid-swing and a rect would rotate.
        const box = list.getBoundingClientRect();
        const left = box.left + real.offsetLeft;
        const top = box.top + real.offsetTop;
        const { offsetWidth: width, offsetHeight: height } = real;
        // The rail may have been dragged away, which leaves no empty clip to reach.
        const onRail = left + width > 0 && left < window.innerWidth;
        const stillFlying = loaded && onRail && !real.matches(":focus-within") && progress < BEATS.meet[1];
        real.toggleAttribute("data-awaiting", stillFlying);
        if (flying && !stillFlying && progress >= BEATS.meet[1]) {
            real.dispatchEvent(new CustomEvent("print:hung"));
        }
        flying = stillFlying;
        root.hidden = !flying;
        if (!flying) {
            head?.style.removeProperty("opacity");
            return;
        }

        const lift = smoothstep(progress, BEATS.lift);
        const meet = smoothstep(progress, BEATS.meet);
        const startScale = lcd.width / realImage.offsetWidth;
        const startX = lcd.left - realImage.offsetLeft * startScale;
        const startY = lcd.top - realImage.offsetTop * startScale;
        const heldScale = Math.min(0.88, (window.innerHeight * 0.62) / height, (window.innerWidth * 0.86) / width);
        // Held at the height it will hang at, so the line does the rising.
        const settledTop = top - frames.getBoundingClientRect().top;
        const heldX = (window.innerWidth - width * heldScale) / 2;
        const heldY = clamp(settledTop + (height * (1 - heldScale)) / 2, 76, Math.max(76, window.innerHeight - height * heldScale - 16));

        const x = mix(mix(startX, heldX, lift), left, meet);
        const y = mix(mix(startY, heldY, lift), top, meet);
        const scale = mix(mix(startScale, heldScale, lift), 1, meet);
        const tilt = (lift - meet) * -1.2;
        root.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)}) rotate(${tilt.toFixed(3)}deg)`;
        if (head) {
            // The tilt lifts one top corner above the print's origin. The real gap
            // between heading and print is at least 72px, so this is whole by handoff.
            const printTop = y - width * scale * Math.sin((Math.abs(tilt) * Math.PI) / 180);
            head.style.opacity = String(smoothstep(printTop - head.getBoundingClientRect().bottom, [12, 64]));
        }
        const paper = smoothstep(progress, [BEATS.lift[0], BEATS.lift[0] + 0.06]);
        mat.style.opacity = String(paper);
        title.style.opacity = String(paper);
    }

    return {
        place,
        clear,
        dispose() {
            rail?.removeEventListener("scroll", refresh);
            real.removeEventListener("focusin", refresh);
            real.removeEventListener("focusout", refresh);
            clear();
            root.remove();
        },
    };
}
