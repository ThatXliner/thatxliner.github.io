/**
 * What sits over the gallery hall: a way back, a caption for the photograph
 * you're standing in front of, and a lightbox for looking closer. The film
 * moves the camera; this only handles the words and the big picture.
 */

export interface HallPhoto {
    thumb: string;
    large: string;
    aspect: number;
    title: string;
    alt: string;
    date: string;
    camera: string;
}

export function createHall(root: HTMLElement, photos: HallPhoto[], signal: AbortSignal) {
    const ui = root.querySelector<HTMLElement>("[data-hall]")!;
    const caption = ui.querySelector<HTMLElement>("[data-hall-caption]")!;
    const box = root.querySelector<HTMLElement>("[data-lightbox]")!;
    const image = box.querySelector<HTMLImageElement>("[data-lightbox-img]")!;
    const title = box.querySelector<HTMLElement>("[data-lightbox-title]")!;
    const meta = box.querySelector<HTMLElement>("[data-lightbox-meta]")!;
    const alt = box.querySelector<HTMLElement>("[data-lightbox-alt]")!;
    let shown = -1;
    let open = -1;
    let returnFocus: Element | null = null;
    /** Told when the lightbox moves, so the camera can follow along the wall. */
    let onBrowse: (index: number) => void = () => {};

    function show(visible: boolean) {
        ui.hidden = !visible;
        if (!visible) close();
    }

    function describe(index: number) {
        if (index === shown) return;
        shown = index;
        const photo = photos[index];
        caption.replaceChildren();
        const name = document.createElement("b");
        name.textContent = photo.title;
        const detail = document.createElement("span");
        detail.textContent = `${photo.date} · ${photo.camera}`;
        caption.append(name, detail);
    }

    function view(index: number) {
        const photo = photos[(index + photos.length) % photos.length];
        open = photos.indexOf(photo);
        image.src = photo.large;
        image.alt = photo.alt;
        image.style.aspectRatio = String(photo.aspect);
        title.textContent = photo.title;
        meta.textContent = `${photo.date} · ${photo.camera} · ${open + 1} of ${photos.length}`;
        alt.textContent = photo.alt;
        onBrowse(open);
    }

    function lightbox(index: number) {
        returnFocus = document.activeElement;
        box.hidden = false;
        view(index);
        box.querySelector<HTMLElement>("[data-lightbox-close]")!.focus({ preventScroll: true });
    }

    function close() {
        if (open < 0) return;
        open = -1;
        box.hidden = true;
        image.removeAttribute("src");
        (returnFocus as HTMLElement | null)?.focus?.({ preventScroll: true });
    }

    box.querySelector("[data-lightbox-close]")!.addEventListener("click", close, { signal });
    box.querySelector("[data-lightbox-prev]")!.addEventListener("click", () => view(open - 1), { signal });
    box.querySelector("[data-lightbox-next]")!.addEventListener("click", () => view(open + 1), { signal });
    // Clicking the dim surround, not the picture, closes it.
    box.addEventListener("click", (event) => event.target === box && close(), { signal });
    addEventListener(
        "keydown",
        (event) => {
            if (open < 0) return;
            if (event.key === "Escape") close();
            else if (event.key === "ArrowRight") view(open + 1);
            else if (event.key === "ArrowLeft") view(open - 1);
            else return;
            event.preventDefault();
            event.stopImmediatePropagation();
        },
        { signal, capture: true },
    );

    return {
        show,
        describe,
        lightbox,
        close,
        get open() {
            return open >= 0;
        },
        set onBrowse(fn: (index: number) => void) {
            onBrowse = fn;
        },
    };
}
