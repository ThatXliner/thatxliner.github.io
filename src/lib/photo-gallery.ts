export function setupPhotoGallery() {
    const gallery = document.querySelector<HTMLElement>("#photo-gallery");
    const controls = document.querySelector<HTMLElement>("#gallery-controls");
    const status = document.querySelector<HTMLElement>("#gallery-status");
    const count = document.querySelector<HTMLElement>("#gallery-count");
    const empty = document.querySelector<HTMLElement>("#gallery-empty");
    const more = document.querySelector<HTMLElement>("#gallery-more");
    const total = document.querySelector<HTMLElement>("#portfolio-total");
    const showEntire = document.querySelector<HTMLButtonElement>("#show-entire");
    const showSelected = document.querySelector<HTMLButtonElement>("#show-selected");
    if (!gallery || !controls || !status || !count || !empty || !more || !total || !showEntire || !showSelected) return;

    const photos = Array.from(gallery.querySelectorAll<HTMLElement>("figure"));
    const cameraButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".filter-pill[data-camera]"));
    const sortButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-sort]"));
    const selectedCameras = new Set<string>();
    let entire = new URLSearchParams(window.location.search).get("view") === "all";
    let sort = "newest";

    const updateGallery = () => {
        let matching = 0;
        let shown = 0;
        photos.sort((a, b) => {
            const difference = Number(b.dataset.date) - Number(a.dataset.date);
            return sort === "newest" ? difference : -difference;
        }).forEach((photo) => {
            const cameraMatches = selectedCameras.size === 0 || selectedCameras.has(photo.dataset.camera ?? "");
            if (cameraMatches) matching++;
            photo.hidden = !cameraMatches || (!entire && photo.dataset.featured !== "true");
            if (!photo.hidden) shown++;
            gallery.append(photo);
        });
        gallery.dataset.ready = "true";

        count.textContent = entire
            ? `Entire portfolio · ${shown} photographs`
            : `Selected work · ${shown} of ${matching} photographs`;
        gallery.setAttribute("aria-label", entire ? "Entire photography portfolio" : "Selected photographs");
        empty.hidden = entire || shown > 0;
        more.hidden = entire || shown === matching;
        showSelected.hidden = !entire;
        showEntire.setAttribute("aria-expanded", String(entire));
        total.textContent = `${matching} photographs${selectedCameras.size ? " matching your filter" : ""}`;
    };

    const changeView = (showAll: boolean) => {
        entire = showAll;
        const url = new URL(window.location.href);
        if (entire) url.searchParams.set("view", "all");
        else url.searchParams.delete("view");
        window.history.replaceState(null, "", url);
        updateGallery();
        const target = entire ? showSelected : more.hidden ? count : showEntire;
        target.focus({ preventScroll: true });
        target.scrollIntoView({
            block: "nearest",
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        });
    };

    cameraButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const camera = button.dataset.camera;
            if (!camera) return;
            if (selectedCameras.has(camera)) selectedCameras.delete(camera);
            else selectedCameras.add(camera);
            button.setAttribute("aria-pressed", String(selectedCameras.has(camera)));
            updateGallery();
        });
    });
    sortButtons.forEach((button) => {
        button.addEventListener("click", () => {
            sort = button.dataset.sort ?? "newest";
            sortButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
            updateGallery();
        });
    });
    showEntire.addEventListener("click", () => changeView(true));
    showSelected.addEventListener("click", () => changeView(false));
    controls.hidden = false;
    status.hidden = false;
    updateGallery();
}
