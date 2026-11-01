import { lifetime, motionEnabled, onMotionChange, Spring } from "./motion";

/**
 * Keep the displayed thumbnail visible until this opening's full image decodes.
 *
 * The print travels from where it sits in the gallery to the middle of the
 * screen and back. It can also be picked up: it stays under your finger, the room
 * brightens as you pull it away, and a throw carries its speed back to the grid.
 */
export function setupPhotoViewer(dialogSelector: string, triggerSelector: string) {
    const viewer = document.querySelector<HTMLDialogElement>(dialogSelector);
    const frame = viewer?.querySelector<HTMLElement>("[data-viewer-frame]");
    const title = viewer?.querySelector<HTMLElement>(".t-caption");
    if (!viewer || !frame || !title) return;

    let opening = 0;
    let thumbnail: HTMLImageElement | null = null;
    let closing = false;
    // From the thumbnail's position to the dialog's centre.
    let fromX = 0;
    let fromY = 0;
    let fromScale = 1;

    const render = () => {
        const p = open.value;
        const distance = Math.hypot(dragX.value, dragY.value);
        const lift = Math.min(1, distance / 420);
        const scale = (fromScale + (1 - fromScale) * p) * (1 - lift * 0.08);
        const x = fromX * (1 - p) + dragX.value;
        const y = fromY * (1 - p) + dragY.value;
        frame.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        const room = Math.max(0, Math.min(1, p)) * (1 - lift * 0.7);
        viewer.style.backgroundColor = `rgb(0 0 0 / ${(0.95 * room).toFixed(3)})`;
        title.style.opacity = String(Math.max(0, Math.min(1, p)) * (1 - lift));
    };

    const finishClose = () => {
        if (closing) {
            closing = false;
            if (viewer.open) viewer.close();
        }
    };
    const open = new Spring(1, { stiffness: 240, damping: 27, precision: 0.002 }, render, finishClose);
    const carry = { stiffness: 240, damping: 27, precision: 0.2 };
    const dragX = new Spring(0, carry, render);
    const dragY = new Spring(0, carry, render);

    /** Takes a fresh measurement: the page may have scrolled underneath. */
    const aimAtThumbnail = () => {
        if (!thumbnail) return false;
        const from = thumbnail.getBoundingClientRect();
        const previous = frame.style.transform;
        frame.style.transform = "none";
        const to = frame.getBoundingClientRect();
        frame.style.transform = previous;
        if (!from.width || !to.width) return false;
        fromX = from.left + from.width / 2 - (to.left + to.width / 2);
        fromY = from.top + from.height / 2 - (to.top + to.height / 2);
        fromScale = from.width / to.width;
        return true;
    };

    const dismiss = (velocityX = 0, velocityY = 0) => {
        drag = undefined;
        if (closing || !motionEnabled() || !aimAtThumbnail()) {
            closing = false;
            viewer.close();
            return;
        }
        closing = true;
        dragX.to(0, velocityX);
        dragY.to(0, velocityY);
        open.to(0);
    };

    document.querySelectorAll<HTMLButtonElement>(triggerSelector).forEach((button) => {
        button.addEventListener("click", async () => {
            const image0 = button.querySelector("img");
            if (!image0) return;
            const request = ++opening;
            const width = Number(button.dataset.width) || image0.naturalWidth || image0.width;
            const height = Number(button.dataset.height) || image0.naturalHeight || image0.height;

            // Use the browser-selected, already displayed resource, without a srcset
            // that could select a different thumbnail at the dialog's larger size.
            const placeholder = new Image(width, height);
            placeholder.src = image0.currentSrc || image0.src;
            placeholder.alt = button.dataset.alt ?? image0.alt;
            placeholder.style.cssText = "display:block;width:100%;height:100%;object-fit:contain";
            frame.style.width = `min(100%, calc((100dvh - 8rem) * ${width / height}))`;
            frame.style.aspectRatio = `${width} / ${height}`;
            frame.style.transform = "none";
            frame.replaceChildren(placeholder);
            title.textContent = button.dataset.title ?? "";
            closing = false;
            viewer.showModal();

            thumbnail = image0;
            dragX.set(0);
            dragY.set(0);
            if (motionEnabled() && aimAtThumbnail()) {
                // The print is lifted off the wall, so it can't also still be on it.
                thumbnail.style.visibility = "hidden";
                open.set(0);
                open.to(1);
            } else {
                open.set(1);
            }

            // Keep picture selection native: AVIF, then WebP as the fallback.
            // Art's original source remains its full-resolution WebP fallback.
            const picture = document.createElement("picture");
            for (const [type, srcset] of [
                ["image/avif", button.dataset.viewerAvifSrcset],
                ["image/webp", button.dataset.viewerWebpSrcset],
            ] as const) {
                if (!srcset) continue;
                const source = document.createElement("source");
                source.type = type;
                source.sizes = "100vw";
                source.srcset = srcset;
                picture.append(source);
            }
            const image = new Image(width, height);
            image.alt = "";
            image.draggable = false;
            image.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:contain;opacity:0";
            picture.append(image);
            frame.append(picture);
            image.sizes = "100vw";
            image.src = button.dataset.viewerFallback ?? button.dataset.src ?? image0.src;

            try {
                await image.decode();
                if (request !== opening || !viewer.open) return;
                // A stationary replacement needs no motion-preference exception.
                image.alt = placeholder.alt;
                placeholder.alt = "";
                image.style.opacity = "1";
            } catch {
                // A failed/aborted decode keeps this opening's thumbnail and caption.
                picture.remove();
            }
        });
    });

    // Drag to dismiss.
    let drag: { id: number; startX: number; startY: number; lastX: number; lastY: number; time: number; speedX: number; speedY: number } | undefined;
    onMotionChange(() => {
        if (motionEnabled() || !viewer.open) return;
        drag = undefined;
        dragX.set(0);
        dragY.set(0);
        open.set(closing ? 0 : 1);
        finishClose();
    }, lifetime());
    frame.addEventListener("pointerdown", (event) => {
        if (event.button !== 0 || closing || !motionEnabled()) return;
        event.preventDefault();
        frame.setPointerCapture(event.pointerId);
        drag = {
            id: event.pointerId,
            startX: event.clientX - dragX.value,
            startY: event.clientY - dragY.value,
            lastX: event.clientX,
            lastY: event.clientY,
            time: event.timeStamp,
            speedX: 0,
            speedY: 0,
        };
    });
    frame.addEventListener("pointermove", (event) => {
        if (drag?.id !== event.pointerId) return;
        const elapsed = Math.max(1, event.timeStamp - drag.time) / 1000;
        drag.speedX = drag.speedX * 0.6 + ((event.clientX - drag.lastX) / elapsed) * 0.4;
        drag.speedY = drag.speedY * 0.6 + ((event.clientY - drag.lastY) / elapsed) * 0.4;
        drag.lastX = event.clientX;
        drag.lastY = event.clientY;
        drag.time = event.timeStamp;
        dragX.set(event.clientX - drag.startX);
        dragY.set(event.clientY - drag.startY);
    });
    const letGo = (event: PointerEvent) => {
        if (drag?.id !== event.pointerId) return;
        const held = event.timeStamp - drag.time > 80;
        const speedX = held ? 0 : drag.speedX;
        const speedY = held ? 0 : drag.speedY;
        drag = undefined;
        const pulled = Math.hypot(dragX.value, dragY.value);
        if (pulled > 130 || Math.hypot(speedX, speedY) > 900) {
            dismiss(speedX, speedY);
        } else {
            dragX.to(0, speedX);
            dragY.to(0, speedY);
        }
    };
    frame.addEventListener("pointerup", letGo);
    frame.addEventListener("pointercancel", () => {
        drag = undefined;
        dragX.to(0);
        dragY.to(0);
    });

    viewer.addEventListener("click", (event) => {
        if (event.target === viewer || event.target === viewer.querySelector("[data-viewer-backdrop]")) {
            dismiss();
        }
    });
    // Esc and the close button both take the print back to the wall. A second Esc
    // during the flight closes at once, and the close event below tidies up.
    viewer.addEventListener("cancel", (event) => {
        if (closing || !motionEnabled()) return;
        event.preventDefault();
        dismiss();
    });
    viewer.querySelector("form")?.addEventListener("submit", (event) => {
        event.preventDefault();
        dismiss();
    });
    viewer.addEventListener("close", () => {
        // The close event is queued; a new opening may already be active.
        if (viewer.open) return;
        ++opening;
        closing = false;
        drag = undefined;
        if (thumbnail) thumbnail.style.visibility = "";
        thumbnail = null;
        open.set(1);
        dragX.set(0);
        dragY.set(0);
        frame.style.transform = "";
        viewer.style.backgroundColor = "";
        title.style.opacity = "";
        frame.replaceChildren();
    });
}
