import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface SceneHandles {
  /** Called every frame with total elapsed seconds. */
  update: (elapsed: number) => void;
  dispose?: () => void;
}

export interface ThreeSceneOptions {
  fov?: number;
  cameraPosition?: [number, number, number];
  /** Max device pixel ratio to render at. */
  maxDpr?: number;
}

/**
 * Boilerplate for a self-cleaning Three.js canvas: renderer setup, resize,
 * RAF loop that pauses when offscreen or the tab is hidden, and a single
 * static frame when the user prefers reduced motion.
 *
 * Returns a ref to attach to the container div the canvas should fill.
 */
export function useThreeScene(
  setup: (
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    container: HTMLDivElement,
  ) => SceneHandles,
  options: ThreeSceneOptions = {},
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const setupRef = useRef(setup);
  setupRef.current = setup;
  const { fov = 60, cameraPosition = [0, 0, 6], maxDpr = 2 } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
    camera.position.set(...cameraPosition);

    const handles = setupRef.current(scene, camera, container);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf = 0;
    let running = false;
    let visible = true;
    const clock = new THREE.Clock();
    let elapsed = 0;

    const frame = () => {
      elapsed += clock.getDelta();
      handles.update(elapsed);
      renderer.render(scene, camera);
      if (running) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || reducedMotion) return;
      running = true;
      clock.getDelta(); // discard time spent paused
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    if (reducedMotion) {
      // Single static frame — no animation loop at all.
      handles.update(0);
      renderer.render(scene, camera);
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !document.hidden) start();
      else stop();
    });
    io.observe(container);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      io.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      handles.dispose?.();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
    // Scene construction runs once; option changes require remount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return containerRef;
}
