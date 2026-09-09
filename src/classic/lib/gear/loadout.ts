import { bodies, lenses, type Body, type Lens, type Kit } from "@/classic/lib/gear/catalog";
import type { createStudio } from "@/classic/lib/gear/scene";

export function initLoadout(root: HTMLElement) {
  let kit: Kit = "owned";
  let body: Body = bodies[0];
  let lens: Lens = lenses[0];
  const remembered: Record<Kit, { body: Body; lens: Lens }> = {
    owned: { body, lens },
    available: { body: bodies[2], lens: lenses[4] },
  };
  let studio: Awaited<ReturnType<typeof createStudio>> | undefined;
  let cancelled = false;
  const abort = new AbortController();
  const { signal } = abort;
  const all = <T extends HTMLElement>(selector: string) =>
    Array.from(root.querySelectorAll<T>(selector));
  const text = (selector: string, value: string) => {
    root.querySelector<HTMLElement>(selector)!.textContent = value;
  };
  function render() {
    const activeBodies = bodies.filter((b) => b.kit === kit),
      activeLenses = lenses.filter((l) => l.kit === kit);
    all<HTMLButtonElement>("[data-kit]").forEach((button) => {
      const selected = button.dataset.kit === kit;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    root
      .querySelector("#gear-panel")!
      .setAttribute("aria-labelledby", `kit-${kit}`);
    all<HTMLButtonElement>("[data-owner]").forEach((button) => {
      button.hidden = button.dataset.owner !== kit;
      button.setAttribute(
        "aria-pressed",
        String(
          button.dataset.body === body.id || button.dataset.lens === lens.id,
        ),
      );
    });
    text(
      "[data-setup-name]",
      `${body.name} + ${lens.name}${lens.white ? " " + lens.aperture : ""}`,
    );
    text(
      "[data-setup-context]",
      kit === "owned"
        ? "Current setup / My equipment"
        : "Available to use / Example setup",
    );
    text('[data-spec="sensor"]', body.sensor);
    text('[data-spec="range"]', lens.range);
    text('[data-spec="aperture"]', lens.aperture);
    text(
      '[data-spec="mount"]',
      body.id === "r7" ? "EF → RF · Control Ring" : "Native EF",
    );
    text(
      "[data-body-count]",
      `${String(activeBodies.findIndex((item) => item.id === body.id) + 1).padStart(2, "0")} / ${String(activeBodies.length).padStart(2, "0")}`,
    );
    text(
      "[data-lens-count]",
      `${String(activeLenses.findIndex((item) => item.id === lens.id) + 1).padStart(2, "0")} / ${String(activeLenses.length).padStart(2, "0")}`,
    );
    all<HTMLButtonElement>("[data-cycle]").forEach(
      (button) =>
        (button.disabled =
          (button.dataset.cycle === "body" ? activeBodies : activeLenses)
            .length < 2),
    );
    remembered[kit] = { body, lens };
    studio?.select(body, lens);
  }
  function revealSelection(kind: "lens" | "body") {
    const rail = root.querySelector<HTMLElement>(`[data-rail="${kind}"]`)!;
    const selected = rail.querySelector<HTMLElement>('[aria-pressed="true"]')!;
    const top =
      selected.getBoundingClientRect().top -
      rail.getBoundingClientRect().top +
      rail.scrollTop;
    if (
      top < rail.scrollTop ||
      top + selected.offsetHeight > rail.scrollTop + rail.clientHeight
    )
      rail.scrollTo({
        top,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  }
  function cycle(kind: "lens" | "body", direction = 1) {
    if (kind === "lens") {
      const options = lenses.filter((l) => l.kit === kit);
      lens =
        options[
          (options.findIndex((l) => l.id === lens.id) +
            direction +
            options.length) %
            options.length
        ];
    } else {
      const options = bodies.filter((b) => b.kit === kit);
      body =
        options[
          (options.findIndex((b) => b.id === body.id) +
            direction +
            options.length) %
            options.length
        ];
    }
    render();
    revealSelection(kind);
  }
  all<HTMLButtonElement>("[data-kit]").forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        kit = button.dataset.kit as Kit;
        ({ body, lens } = remembered[kit]);
        render();
        all<HTMLElement>("[data-rail]").forEach((rail) => (rail.scrollTop = 0));
        revealSelection("lens");
        revealSelection("body");
      },
      { signal },
    );
    button.addEventListener(
      "keydown",
      (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
          return;
        event.preventDefault();
        const tabs = all<HTMLButtonElement>("[data-kit]");
        const next =
          event.key === "Home"
            ? tabs[0]
            : event.key === "End"
              ? tabs[1]
              : tabs.find((tab) => tab !== button)!;
        next.click();
        next.focus();
      },
      { signal },
    );
  });
  all<HTMLButtonElement>("[data-lens]").forEach((button) =>
    button.addEventListener(
      "click",
      () => {
        lens = lenses.find((l) => l.id === button.dataset.lens)!;
        render();
      },
      { signal },
    ),
  );
  all<HTMLButtonElement>("[data-body]").forEach((button) =>
    button.addEventListener(
      "click",
      () => {
        body = bodies.find((b) => b.id === button.dataset.body)!;
        render();
      },
      { signal },
    ),
  );
  all<HTMLButtonElement>("[data-cycle]").forEach((button) =>
    button.addEventListener(
      "click",
      () => cycle(button.dataset.cycle as "lens" | "body"),
      { signal },
    ),
  );
  all<HTMLElement>("[data-rail]").forEach((rail) => {
    const kind = rail.dataset.rail as "lens" | "body";
    rail.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        event.preventDefault();
        cycle(kind, event.key === "ArrowDown" ? 1 : -1);
        rail
          .querySelector<HTMLButtonElement>('[aria-pressed="true"]')
          ?.focus({ preventScroll: true });
      },
      { signal },
    );
    // Swipe naturally scrolls the rail. A deliberate swipe also equips its next item.
    let startY = 0,
      startX = 0;
    rail.addEventListener(
      "touchstart",
      (event) => {
        if (event.touches.length !== 1) return;
        startY = event.touches[0].clientY;
        startX = event.touches[0].clientX;
      },
      { passive: true, signal },
    );
    rail.addEventListener(
      "touchend",
      (event) => {
        const t = event.changedTouches[0];
        const dy = t.clientY - startY;
        if (Math.abs(dy) > 45 && Math.abs(dy) > Math.abs(t.clientX - startX))
          cycle(kind, dy < 0 ? 1 : -1);
      },
      { passive: true, signal },
    );
  });
  root
    .querySelector(".reset-view")!
    .addEventListener("click", () => studio?.reset(), { signal });
  const launch = root.querySelector<HTMLButtonElement>("[data-start-3d]")!;
  launch.disabled = false;
  let starting = false;
  async function startStudio() {
    if (starting || studio || cancelled) return;
    starting = true;
    launch.disabled = true;
    launch.textContent = "Loading 3D…";
    root.dataset.loading = "true";
    try {
      const { createStudio } = await import("@/classic/lib/gear/scene");
      if (cancelled) return;
      const created = await createStudio(root, body, lens);
      if (cancelled) {
        created.dispose();
        return;
      }
      studio = created;
      root.querySelector(".studio-poster")?.remove();
      launch.hidden = true;
      await studio.select(body, lens, false);
    } catch (error) {
      if (cancelled) return;
      console.error("Camera studio could not start", error);
      text(
        ".viewer-status",
        "3D could not load. You can still explore the equipment specs.",
      );
      root.querySelector<HTMLElement>(".viewer-status")!.hidden = false;
      launch.disabled = false;
      launch.textContent = "Try 3D again";
    } finally {
      starting = false;
      delete root.dataset.loading;
    }
  }
  launch.addEventListener("click", startStudio, { signal });
  root.addEventListener(
    "click",
    (event) => {
      if (
        (event.target as HTMLElement).closest(
          "[data-kit], [data-body], [data-lens], [data-cycle]",
        )
      )
        void startStudio();
    },
    { signal },
  );
  render();
  function dispose() {
    cancelled = true;
    abort.abort();
    studio?.dispose();
  }
  document.addEventListener("astro:before-swap", dispose, {
    once: true,
    signal,
  });
  window.addEventListener(
    "pagehide",
    (event) => {
      if (!event.persisted) dispose();
    },
    { signal },
  );
}
