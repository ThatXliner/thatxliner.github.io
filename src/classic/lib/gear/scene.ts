import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { type Body, type Lens } from "@/classic/lib/gear/catalog";
import { loadModelLibrary } from "@/classic/lib/gear/models";

export async function createStudio(
  root: HTMLElement,
  initialBody: Body,
  initialLens: Lens,
) {
  const host = root.querySelector<HTMLElement>(".model-canvas")!;
  const setupIds = (body: Body, lens: Lens) => [
    body.id,
    lens.id,
    ...(body.id === "r7" ? ["adapter"] : []),
  ];
  const factory = await loadModelLibrary(setupIds(initialBody, initialLens));
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
  } catch (error) {
    factory.dispose();
    throw error;
  }
  // Cap pixel work on high-density screens, especially handheld devices.
  renderer.setPixelRatio(
    Math.min(
      devicePixelRatio,
      matchMedia("(pointer: coarse)").matches ? 1.25 : 1.5,
    ),
  );
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const reflectionStudio = new THREE.Scene();
  reflectionStudio.background = new THREE.Color().setRGB(0.16, 0.16, 0.18);
  // Large light cards give the optics continuous studio reflections.
  for (const [x, y, z, width, height, strength] of [
    [-3, 3, 5, 3, 4.5, 5],
    [4, 2, 2, 2, 4, 3],
    [0, 5, 0, 3, 3, 2],
    [-3, 3, -5, 3, 4.5, 5],
  ]) {
    const card = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color().setRGB(strength, strength, strength),
        side: THREE.DoubleSide,
      }),
    );
    card.position.set(x, y, z);
    card.lookAt(0, 0, 0.8);
    reflectionStudio.add(card);
  }
  const env = pmrem.fromScene(reflectionStudio, 0.02, 0.1, 30);
  reflectionStudio.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      (object.material as THREE.Material).dispose();
    }
  });
  function prepare(model: THREE.Group) {
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      for (const material of Array.isArray(object.material)
        ? object.material
        : [object.material]) {
        if (
          material instanceof THREE.MeshPhysicalMaterial &&
          /Optical glass|Inner optical glass/.test(material.name)
        )
          material.envMap = env.texture;
      }
    });
    return model;
  }
  scene.environment = env.texture;
  scene.environmentIntensity = 0.65;
  pmrem.dispose();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const studioLights: THREE.SpotLight[] = [];
  for (const [color, intensity, x, y, z] of [
    ["#fff4e6", 35, -3, 4, 5],
    ["#f4f6ff", 55, -3, 3, -5],
    ["#ffffff", 25, 4, 3, 1],
  ] as const) {
    const light = new THREE.SpotLight(
      color,
      intensity,
      30,
      Math.PI / 3,
      0.8,
      2,
    );
    light.position.set(x, y, z);
    light.target.position.set(0, 0, 0.8);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    light.shadow.camera.near = 0.2;
    light.shadow.camera.far = 25;
    light.shadow.normalBias = 0.008;
    light.shadow.bias = -0.00002;
    scene.add(light, light.target);
    studioLights.push(light);
  }
  const assembly = new THREE.Group();
  scene.add(assembly);
  // Orbiting moves only the camera. Rebuild shadows when the equipment moves.
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  const floorMat = new THREE.ShadowMaterial({ opacity: 0.32 });
  const floorGeo = new THREE.PlaneGeometry(30, 30);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.04;
  floor.receiveShadow = true;
  scene.add(floor);
  const orbit = new THREE.Group();
  orbit.position.y = -1.025;
  scene.add(orbit);
  const ringPoints = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    ringPoints.push(
      new THREE.Vector3(Math.sin(a) * 2.05, 0, Math.cos(a) * 2.05 + 0.65),
    );
  }
  const orbitMat = new THREE.LineBasicMaterial({
    color: "#a39b88",
    transparent: true,
    opacity: 0.26,
  });
  const orbitGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
  orbit.add(new THREE.Line(orbitGeo, orbitMat));
  const ticks = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    for (const r of [1.99, 2.11])
      ticks.push(new THREE.Vector3(Math.sin(a) * r, 0, Math.cos(a) * r + 0.65));
  }
  const tickGeo = new THREE.BufferGeometry().setFromPoints(ticks);
  orbit.add(new THREE.LineSegments(tickGeo, orbitMat));
  host.append(renderer.domElement);
  const keepPageScroll = (event: WheelEvent) =>
    event.stopImmediatePropagation();
  renderer.domElement.addEventListener("wheel", keepPageScroll, {
    capture: true,
    passive: true,
  });
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = true;
  controls.screenSpacePanning = true;
  controls.enableZoom = true;
  controls.minDistance = 6;
  controls.maxDistance = 17;
  controls.minPolarAngle = 0.25;
  controls.maxPolarAngle = Math.PI * 0.65;
  controls.rotateSpeed = 0.65;
  // Wheel keeps scrolling the page; zoom uses pinch or keyboard instead.
  controls.touches.ONE = THREE.TOUCH.ROTATE;
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let currentBody = initialBody,
    currentLens = initialLens;
  let needsRender = true;
  controls.addEventListener("change", () => {
    needsRender = true;
  });
  let animationStart = 0;
  let lensOffset = 0;
  let disposed = false;
  let frame = 0;
  let visible = false;
  let lastDraw = 0;
  const defaultDirection = new THREE.Vector3(-0.55, 0.24, 0.88).normalize();
  const reset = () => {
    // Fit the real assembled bounds, including long telephotos and the cinema monitor.
    const box = new THREE.Box3().setFromObject(assembly);
    const center = box.getCenter(new THREE.Vector3());
    const radius = box.getSize(new THREE.Vector3()).length() / 2;
    controls.minDistance = Math.max(2.2, radius * 1.08);
    controls.maxDistance = Math.max(17, radius * 4);
    floor.position.y = box.min.y - 0.04;
    orbit.position.y = floor.position.y + 0.012;
    orbit.position.z = center.z - 0.65;
    const right = new THREE.Vector3()
      .crossVectors(new THREE.Vector3(0, 1, 0), defaultDirection)
      .normalize();
    const up = new THREE.Vector3()
      .crossVectors(defaultDirection, right)
      .normalize();
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const tanH = tanV * camera.aspect;
    let distance = 0;
    for (const x of [box.min.x, box.max.x])
      for (const y of [box.min.y, box.max.y])
        for (const z of [box.min.z, box.max.z]) {
          const offset = new THREE.Vector3(x, y, z).sub(center);
          distance = Math.max(
            distance,
            Math.abs(offset.dot(right)) / tanH + offset.dot(defaultDirection),
            Math.abs(offset.dot(up)) / tanV + offset.dot(defaultDirection),
          );
        }
    controls.target.copy(center);
    camera.position
      .copy(center)
      .addScaledVector(defaultDirection, distance * 0.96);
    controls.update();
  };
  let selectionVersion = 0;
  async function select(body: Body, lens: Lens, animate = true) {
    const version = ++selectionVersion;
    if (animate && currentBody.id === body.id && currentLens.id === lens.id) {
      status.hidden = true;
      return;
    }
    status.textContent = "Loading selected equipment…";
    status.hidden = false;
    try {
      await factory.load(setupIds(body, lens));
    } catch (error) {
      if (disposed || version !== selectionVersion) return;
      console.error("Equipment could not load", error);
      status.textContent =
        "This setup could not load. Select it again to retry.";
      return;
    }
    if (disposed || version !== selectionVersion) return;
    status.hidden = true;
    const setupChanged =
      currentBody.id !== body.id || currentLens.id !== lens.id;
    currentBody = body;
    currentLens = lens;
    assembly.clear();
    assembly.add(prepare(factory.body(body)));
    const offset = body.id === "r7" ? 24 / 55 : 0;
    if (offset) {
      const adapter = factory.adapter();
      adapter.position.z = 0.53;
      assembly.add(adapter);
    }
    const lensModel = prepare(factory.lens(lens));
    lensModel.position.z = 0.53 - 0.088 + offset;
    assembly.add(lensModel);
    needsRender = true;
    animationStart = performance.now();
    renderer.shadowMap.needsUpdate = true;
    lensOffset = animate && !reduced.matches ? 1.3 : 0;
    if (setupChanged) reset();
    host.setAttribute(
      "aria-label",
      `3D model of ${body.name} with ${lens.name} ${lens.aperture}. Drag to rotate, right-drag or Shift plus arrow keys to pan, arrow keys to orbit, plus or minus to zoom, Home to reset.`,
    );
    draw();
  }
  const status = root.querySelector<HTMLElement>(".viewer-status")!;
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    reset();
    needsRender = true;
    draw();
  }
  function draw() {
    if (disposed) return;
    if (lensOffset > 0) renderer.shadowMap.needsUpdate = true;
    const t = Math.min(1, (performance.now() - animationStart) / 650);
    const ease = 1 - Math.pow(1 - t, 3);
    const lensModel = factory.lens(currentLens);
    lensModel.position.z =
      0.53 -
      0.088 +
      (currentBody.id === "r7" ? 24 / 55 : 0) +
      lensOffset * (1 - ease);
    lensModel.rotation.z = lensOffset * 0.12 * (1 - ease);
    controls.update();
    if (needsRender || (lensOffset > 0 && t < 1)) {
      renderer.render(scene, camera);
      needsRender = false;
    }
    if (lensOffset > 0 && t === 1) {
      lensOffset = 0;
      renderer.render(scene, camera);
    }
  }
  function loop(now: number) {
    if (!visible || disposed) return;
    if (now - lastDraw > 1000 / 40) {
      draw();
      lastDraw = now;
    }
    frame = requestAnimationFrame(loop);
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting && !document.hidden;
      cancelAnimationFrame(frame);
      if (visible) frame = requestAnimationFrame(loop);
    },
    { threshold: 0 },
  );
  observer.observe(host);
  const onVisibility = () => {
    visible =
      !document.hidden &&
      host.getBoundingClientRect().bottom > 0 &&
      host.getBoundingClientRect().top < innerHeight;
    cancelAnimationFrame(frame);
    if (visible) frame = requestAnimationFrame(loop);
  };
  document.addEventListener("visibilitychange", onVisibility);
  const sizeObserver = new ResizeObserver(resize);
  sizeObserver.observe(host);
  function keydown(event: KeyboardEvent) {
    if (
      ![
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "+",
        "=",
        "-",
        "Home",
      ].includes(event.key)
    )
      return;
    event.preventDefault();
    if (event.key === "Home") {
      reset();
      return;
    }
    if (event.shiftKey && event.key.startsWith("Arrow")) {
      const step = camera.position.distanceTo(controls.target) * 0.025;
      const horizontal =
        event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      const vertical =
        event.key === "ArrowUp" ? 1 : event.key === "ArrowDown" ? -1 : 0;
      camera.updateMatrixWorld();
      const translation = new THREE.Vector3()
        .setFromMatrixColumn(camera.matrixWorld, 0)
        .multiplyScalar(horizontal * step)
        .addScaledVector(
          new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1),
          vertical * step,
        );
      camera.position.add(translation);
      controls.target.add(translation);
      needsRender = true;
      draw();
      return;
    }
    const spherical = new THREE.Spherical().setFromVector3(
      camera.position.clone().sub(controls.target),
    );
    if (event.key === "ArrowLeft") spherical.theta -= 0.12;
    if (event.key === "ArrowRight") spherical.theta += 0.12;
    if (event.key === "ArrowUp") spherical.phi -= 0.1;
    if (event.key === "ArrowDown") spherical.phi += 0.1;
    if (event.key === "+" || event.key === "=") spherical.radius *= 0.9;
    if (event.key === "-") spherical.radius *= 1.1;
    spherical.phi = THREE.MathUtils.clamp(spherical.phi, 0.25, Math.PI * 0.65);
    spherical.radius = THREE.MathUtils.clamp(
      spherical.radius,
      controls.minDistance,
      controls.maxDistance,
    );
    camera.position
      .copy(controls.target)
      .add(new THREE.Vector3().setFromSpherical(spherical));
    draw();
  }
  host.addEventListener("keydown", keydown);
  const contextLost = (event: Event) => {
    event.preventDefault();
    status.textContent =
      "The 3D view was interrupted. Reload to reopen the studio. You can still explore the equipment specs.";
    status.hidden = false;
    visible = false;
    cancelAnimationFrame(frame);
  };
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  await select(initialBody, initialLens, false);
  reset();
  resize();
  status.hidden = true;
  return {
    select,
    reset,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      sizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      host.removeEventListener("keydown", keydown);
      controls.dispose();
      renderer.domElement.removeEventListener("wheel", keepPageScroll, true);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      factory.dispose();
      for (const light of studioLights) light.shadow.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      orbitGeo.dispose();
      tickGeo.dispose();
      orbitMat.dispose();
      env.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
