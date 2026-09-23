import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import quilliumScreen from "../assets/products/quillium-revision.png?url";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/** One native scroll position drives the stage. No scroll interception or animation dependency. */
export async function initResumeFilm() {
  const root = document.querySelector<HTMLElement>(".film");
  if (!root) return;
  const canvas = root.querySelector<HTMLCanvasElement>("canvas")!;
  const status = root.querySelector<HTMLElement>(".film-status")!;
  const toggle = root.querySelector<HTMLButtonElement>(".motion-toggle")!;
  const chapters = [...root.querySelectorAll<HTMLElement>("[data-scene]")];
  const panels = chapters.map((chapter) =>
    chapter.querySelector<HTMLElement>(".chapter-frame")!,
  );
  const galleryHeading = root.querySelector<HTMLElement>(".gallery-heading")!;
  const galleryFoot = root.querySelector<HTMLElement>(".gallery-foot")!;
  const prints = [...root.querySelectorAll<HTMLElement>(".film-gallery a")];
  const indexSection = root.querySelector<HTMLElement>("#music")!;
  const cameraSection = root.querySelector<HTMLElement>("#observe")!;
  const sourceSection = root.querySelector<HTMLElement>("#open-source")!;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let staticMode = reduced.matches;
  const galleryControl = document.createElement("div");
  galleryControl.className = "gallery-explore";
  galleryControl.hidden = true;
  galleryControl.tabIndex = 0;
  galleryControl.setAttribute("role", "region");
  galleryControl.setAttribute(
    "aria-label",
    "Photo gallery. Drag to look around or swipe sideways or use left and right arrow keys to explore. Scroll down to continue.",
  );
  galleryControl.innerHTML =
    '<div class="gallery-explore-hint"><button type="button" aria-label="Look left">←</button><span>Drag to look around · Scroll down to continue</span><button type="button" aria-label="Look right">→</button></div>';
  root.append(galleryControl);
  let galleryPitch = 0;
  let galleryPitchTarget = 0;
  let galleryYaw = 2.8;
  let galleryYawTarget = 2.8;
  const turnGallery = (amount: number) => {
    galleryYawTarget += amount;
    schedule();
  };
  galleryControl.addEventListener(
    "wheel",
    (event) => {
      const horizontal = event.shiftKey ? event.deltaY : event.deltaX;
      if (
        !event.ctrlKey &&
        (event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY))
      ) {
        event.preventDefault();
        turnGallery(horizontal * (event.deltaMode === 1 ? 16 : 1) * 0.0025);
      }
    },
    { passive: false },
  );
  let drag: { id: number; x: number; y: number } | undefined;
  galleryControl.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || (event.target as Element).closest("button"))
      return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    galleryControl.setPointerCapture(event.pointerId);
  });
  galleryControl.addEventListener("pointermove", (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    turnGallery((event.clientX - drag.x) * -0.004);
    if (event.pointerType !== "touch") {
      galleryPitchTarget = THREE.MathUtils.clamp(
        galleryPitchTarget + (event.clientY - drag.y) * 0.003,
        -0.45,
        0.45,
      );
    }
    drag.x = event.clientX;
    drag.y = event.clientY;
  });
  const release = () => {
    drag = undefined;
  };
  galleryControl.addEventListener("pointerup", release);
  galleryControl.addEventListener("pointercancel", release);
  galleryControl.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      turnGallery(event.key === "ArrowLeft" ? -0.35 : 0.35);
    }
  });
  galleryControl
    .querySelectorAll("button")
    .forEach((button, index) =>
      button.addEventListener("click", () =>
        turnGallery(index === 0 ? -0.45 : 0.45),
      ),
    );
  let frame = 0;
  let disposed = false;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch {
    root.dataset.static = "";
    status.textContent = "3D unavailable. The full story is below.";
    toggle.hidden = true;
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(environment, 0.04);
  scene.environment = envMap.texture;
  environment.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x73786c, 1.5));
  const key = new THREE.DirectionalLight(0xfff8ed, 3);
  key.position.set(-3, 5, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xd6e0df, 2);
  rim.position.set(4, 1, -3);
  scene.add(rim);
  const laptop = new THREE.Group();
  const rig = new THREE.Group();
  scene.add(laptop, rig);
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const resources = new Set<
    THREE.BufferGeometry | THREE.Material | THREE.Texture
  >();
  function own(model: THREE.Object3D) {
    model.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      resources.add(o.geometry);
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
        resources.add(m);
        for (const v of Object.values(m))
          if (v instanceof THREE.Texture) resources.add(v);
      }
    });
  }
  async function model(path: string) {
    const { scene: object } = await loader.loadAsync(path);
    own(object);
    if (disposed) {
      for (const r of resources) r.dispose();
      throw new Error("Scene disposed");
    }
    return object;
  }
  function normalize(object: THREE.Object3D, width: number) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    object.position.sub(center);
    const wrapper = new THREE.Group();
    wrapper.add(object);
    wrapper.scale.setScalar(width / size.x);
    return wrapper;
  }
  // x, y, z, pitch, yaw, roll, scale; hold a shot before moving to the next.
  const laptopPoses = [
    [1.85, -0.05, 0, 0.2, -0.58, -0.09, 0.8],
    [1.95, -0.05, -0.5, 0.22, -0.28, 0.02, 0.78],
    [1.95, -0.05, -0.5, 0.22, -0.28, 0.02, 0.78],
    [7, -3, -5, 0.8, -1.2, -0.2, 0.1],
    [-7, -3, -5, 0.4, 0.8, -0.2, 0.1],
  ];
  const cameraPoses = [
    [7, -2, -5, 0.1, -0.6, 0.15, 0.1],
    [7, -2, -5, 0.1, -0.6, 0.15, 0.1],
    [5, 0, -3, 0.1, -1.2, 0.1, 0.4],
    [1.85, -0.15, 0, 0.08, -0.36, -0.05, 1.1],
    [1.5, -0.1, 0.1, 0.04, -0.12, 0, 1.1],
  ];
  let screen: THREE.Mesh | undefined;
  let lid: THREE.Group | undefined;
  let projectTexture: THREE.Texture | undefined;
  let rearScreen: THREE.Mesh | undefined;
  const screenAnchor = new THREE.Vector3();
  let screenWidth = 1;
  new THREE.TextureLoader().load(quilliumScreen, (texture) => {
    if (disposed) {
      texture.dispose();
      return;
    }
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = false;
    projectTexture = texture;
    resources.add(texture);
    schedule();
  });
  const clamp = THREE.MathUtils.clamp;
  const mix = THREE.MathUtils.lerp;
  let target = 0;
  let current = 0;
  let mobile = innerWidth < 761;
  function locate() {
    if (staticMode) return 0;
    const y = scrollY;
    // Reveal the next fixed scene while the preceding document section leaves.
    const cameraStart = cameraSection.offsetTop;
    if (y >= cameraStart - innerHeight && y < cameraStart) {
      return mix(
        2.84,
        3,
        clamp((y - cameraStart + innerHeight) / innerHeight, 0, 1),
      );
    }
    let index = 0;
    for (let i = 0; i < chapters.length; i++)
      if (y >= chapters[i].offsetTop) index = i;
    const start = chapters[index].offsetTop;
    const duration = chapters[index].offsetHeight;
    const progress = clamp((y - start) / duration, 0, 1);
    const scene = Number(chapters[index].dataset.scene);
    if (scene === 4) {
      // Exploration is optional; most of the scroll space belongs to the photos.
      if (progress < .2) return 4 + progress / .2 * .42;
      if (progress < .35) return 4.42 + (progress - .2) / .15 * .23;
      return 4.65 + (progress - .35) / .65 * .35;
    }
    return scene + progress;
  }
  function pose(group: THREE.Group, poses: number[][], value: number) {
    const index = Math.min(Math.floor(value), poses.length - 1);
    const next = Math.min(index + 1, poses.length - 1);
    const t = THREE.MathUtils.smoothstep(value - index, 0.38, 1);
    const p = poses[index].map((n, i) => mix(n, poses[next][i], t));
    if (mobile) {
      p[0] *= 0.12;
      p[1] = mix(p[1], -1.5, 0.75);
      p[6] *= 0.49;
      if (value < 1) {
        p[0] = mix(0.1, 1.95 * 0.12, t);
        p[1] = mix(-1.1, mix(-0.05, -1.5, 0.75), t);
        p[6] = mix(0.41, 0.78 * 0.49, t);
      }
    }
    group.position.set(p[0], p[1], p[2]);
    group.rotation.set(p[3], p[4], p[5]);
    group.scale.setScalar(p[6]);
  }
  // A real inward-facing gallery is rendered into the LCD before entering it.
  const galleryScene = new THREE.Scene();
  galleryScene.background = new THREE.Color(0x111827);
  const galleryCamera = new THREE.PerspectiveCamera(65, 1, 0.1, 60);
  const galleryTarget = new THREE.WebGLRenderTarget(1024, 768);
  galleryScene.background = new THREE.Color(0xe6d9c4);
  galleryScene.add(new THREE.HemisphereLight(0xfff1db, 0x765843, 2.1));
  const sun = new THREE.DirectionalLight(0xffe3b3, 2.3);
  sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:.1,far:35});
  sun.shadow.normalBias=.035;sun.shadow.radius=3;
  sun.position.set(-4, 5, 3);
  galleryScene.add(sun);
  const grainData=new Uint8Array(128*128*4);
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){const at=(y*128+x)*4;const n=220+Math.round(15*Math.sin(x*.7+Math.sin(y*.07)*2)+8*Math.sin(x*2.7+y*.04));grainData[at]=grainData[at+1]=grainData[at+2]=n;grainData[at+3]=255;}
  const grain=new THREE.DataTexture(grainData,128,128);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(3,3);grain.needsUpdate=true;resources.add(grain);
  const roomMaterials = new Map<number, THREE.MeshStandardMaterial>();
  function surface(color: number) {
    if (!roomMaterials.has(color)) {
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.86,
      });
      if ([0x9b7050,0xa98260,0xb08b69,0x997251,0xb89470,0x79573d,0x755437,0x876142].includes(color)){material.map=grain;material.bumpMap=grain;material.bumpScale=.025;}
      roomMaterials.set(color, material);
      resources.add(material);
    }
    return roomMaterials.get(color)!;
  }
  function block(
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    color: number,
    parent: THREE.Object3D = galleryScene,
  ) {
    const soft=[0xb9ad8d,0xc8bca1,0xd3c8b1,0x8b5847,0x657669].includes(color);
    const mesh = new THREE.Mesh(soft?new RoundedBoxGeometry(w,h,d,4,Math.min(w,h,d)*.22):new THREE.BoxGeometry(w,h,d), surface(color));
    mesh.castShadow=true;mesh.receiveShadow=true;
    mesh.position.set(x, y, z);
    parent.add(mesh);
    resources.add(mesh.geometry);
    return mesh;
  }
  // Enclosed plaster-and-oak living room, viewed from standing eye level.
  block(16, 0.2, 16, 0, -3.1, 0, 0x9b7050);
  for (let i = 0; i < 32; i++) {
    block(
      0.485,
      0.025,
      16,
      -7.75 + i * 0.5,
      -2.985,
      0,
      [0xa98260, 0xb08b69, 0x997251, 0xb89470][i % 4],
    );
    for (let j = 0; j < 4; j++)
      block(
        0.48,
        0.028,
        0.016,
        -7.75 + i * 0.5,
        -2.98,
        -6 + j * 4 + (i % 2) * 1.8,
        0x785638,
      );
  }
  block(16, 0.2, 16, 0, 4.2, 0, 0xeee5d4);
  for (const z of [-8, 8]) {
    block(16, 7.2, 0.2, 0, 0.5, z, 0xded0b8);
    block(16, 0.24, 0.25, 0, -2.8, z * 0.986, 0x876142);
    block(16, 0.16, 0.3, 0, 3.95, z * 0.985, 0x9b7651);
  }
  for (const x of [-8, 8]) {
    block(0.2, 7.2, 16, x, 0.5, 0, 0xe8dcc7);
    block(0.25, 0.24, 16, x * 0.986, -2.8, 0, 0x876142);
    block(0.3, 0.16, 16, x * 0.985, 3.95, 0, 0x9b7651);
  }
  for (const x of [-5, 0, 5]) block(0.18, 0.25, 16, x, 3.9, 0, 0x876142);
  // Woven rug, low table, linen sofa, and cushions.
  block(5.6, 0.04, 4.2, 0, -2.94, 2, 0x597377);
  for (let i = 0; i < 9; i++)
    block(5.3, 0.045, 0.04, 0, -2.91, 0.1 + i * 0.46, 0xc8b598);
  block(3.8, 0.65, 1.35, 0, -2.3, 5.8, 0xb9ad8d);
  block(3.8, 1.1, 0.35, 0, -1.8, 6.4, 0xc8bca1);
  for (const x of [-1.9, 1.9]) block(0.35, 0.9, 1.5, x, -2.1, 5.8, 0xb9ad8d);
  for (const x of [-1.15, 0, 1.15])
    block(1.05, 0.18, 1.05, x, -1.89, 5.65, 0xd3c8b1);
  block(0.7, 0.65, 0.23, -1.2, -1.4, 6.12, 0x8b5847);
  block(0.65, 0.65, 0.23, 1.2, -1.4, 6.12, 0x657669);
  block(2.8, 0.16, 1.5, 0, -1.95, 2.4, 0x79573d);
  for (const x of [-1.1, 1.1])
    for (const z of [1.9, 2.9]) block(0.1, 0.95, 0.1, x, -2.5, z, 0x523d2f);
  block(0.7, 0.09, 0.5, -0.4, -1.8, 2.4, 0x394d60);
  block(0.55, 0.07, 0.43, -0.35, -1.72, 2.4, 0xc6a176);
  // Built-in bookcase with individual shelves and books.
  block(3.5, 2.8, 0.65, -5.5, -1.5, 7.55, 0x755437);
  for (let row = 0; row < 3; row++) {
    block(3.3, 0.1, 0.7, -5.5, -2.65 + row * 0.85, 7.17, 0xb08c63);
    for (let i = 0; i < 13; i++)
      block(
        0.16,
        0.42 + (i % 3) * 0.09,
        0.32,
        -7 + i * 0.24,
        -2.38 + row * 0.85,
        7.08,
        [0x566b63, 0xa97753, 0xd5c49d, 0x46586b, 0x8f5146][i % 5],
      );
  }
  // A warm floor lamp and a leafy plant anchor the corners.
  block(0.08, 2.6, 0.08, 5.5, -1.6, 5.6, 0x66513c);
  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.7, 0.75, 32, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0xffe9bc,
      side: THREE.DoubleSide,
      emissive: 0xc7883c,
      emissiveIntensity: 0.35,
    }),
  );
  shade.position.set(5.5, -0.15, 5.6);
  galleryScene.add(shade);
  own(shade);
  const lamp = new THREE.PointLight(0xffc786, 18, 9, 2);
  lamp.position.set(5.5, -0.1, 5.6);
  galleryScene.add(lamp);
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.32, 0.7, 24),
    surface(0xa56d51),
  );
  pot.position.set(-6.6, -2.6, -6.5);
  galleryScene.add(pot);
  own(pot);
  pot.castShadow=true;pot.receiveShadow=true;
  const soil=new THREE.Mesh(new THREE.CylinderGeometry(.405,.405,.045,32),surface(0x3c2d22));soil.position.set(-6.6,-2.24,-6.5);galleryScene.add(soil);own(soil);
  const lip=new THREE.Mesh(new THREE.TorusGeometry(.435,.045,10,40),surface(0xa56d51));lip.rotation.x=Math.PI/2;lip.position.set(-6.6,-2.25,-6.5);galleryScene.add(lip);own(lip);
  for(let i=0;i<11;i++) {
    const angle=i*2.399, reach=.35+(i%3)*.13, height=.95+(i%4)*.22;
    const base=new THREE.Vector3(-6.6,-2.23,-6.5);
    const end=new THREE.Vector3(-6.6+Math.cos(angle)*reach,-2.23+height,-6.5+Math.sin(angle)*reach);
    const curve=new THREE.QuadraticBezierCurve3(base,base.clone().add(new THREE.Vector3(Math.cos(angle)*.1,height*.8,Math.sin(angle)*.1)),end);
    const stem=new THREE.Mesh(new THREE.TubeGeometry(curve,12,.018,6,false),surface(0x52603c));galleryScene.add(stem);own(stem);
    const leaf=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),surface(i%2?0x405e36:0x647e47));
    leaf.scale.set(.21,.38,.035);leaf.position.copy(end);leaf.rotation.set(.25,angle,-.5*Math.cos(angle));leaf.castShadow=true;galleryScene.add(leaf);own(leaf);
  }
  // Fetch photography assets only when their chapter is within two screens.
  let cameraObserver: IntersectionObserver;
  let releaseCamera: () => void;
  const cameraNearby = new Promise<void>((resolve) => {
    releaseCamera = resolve;
    cameraObserver = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        cameraObserver.disconnect();
        resolve();
      }
    }, { rootMargin: "200% 0px" });
    cameraObserver.observe(cameraSection);
  });
  const galleryImages = [
    ...new Set(
      Object.values(
        import.meta.glob<string>("../assets/photography/*.webp", {
          eager: true,
          query: "?url",
          import: "default",
        }),
      ),
    ),
  ];
  // Each source is used once. Never wrap around the array to fill empty slots.
  root.dataset.galleryPhotoCount = String(galleryImages.length);
  void cameraNearby.then(() => {
  if (disposed) return;
  galleryImages.forEach((photo, index) => {
    const wall = index % 4;
    const slot = Math.floor(index / 4);
    const column = slot % 4;
    const row = Math.floor(slot / 4);
    const mount = new THREE.Group();
    const along = -5.4 + column * 3.6;
    const height = row === 0 ? .85 : 3.15;
    if (wall === 0) {
      mount.position.set(along, height, -7.82);
    }
    if (wall === 1) {
      mount.position.set(7.82, height, along);
      mount.rotation.y = -Math.PI / 2;
    }
    if (wall === 2) {
      mount.position.set(-along, height, 7.82);
      mount.rotation.y = Math.PI;
    }
    if (wall === 3) {
      mount.position.set(-7.82, height, -along);
      mount.rotation.y = Math.PI / 2;
    }
    galleryScene.add(mount);
    new THREE.TextureLoader().load(photo, (texture) => {
      if (disposed) {
        texture.dispose();
        return;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      resources.add(texture);
      const ratio = texture.image.width / texture.image.height;
      const w = Math.min(3.15, 1.95 * ratio),
        h = w / ratio;
      block(w + 0.22, h + 0.22, 0.1, 0, 0, 0, 0x654a35, mount);
      block(w + 0.1, h + 0.1, 0.02, 0, 0, 0.06, 0xf6efdf, mount);
      const print = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }),
      );
      print.position.z = 0.075;
      mount.add(print);
      own(print);
      schedule();
    });
  });
  });
  function draw() {
    frame = 0;
    if (disposed || document.hidden) return;
    current = staticMode ? 0 : mix(current, target, 0.15);
    if (Math.abs(current - target) < 0.001) current = target;
    pose(laptop, laptopPoses, current);
    if (lid)
      lid.rotation.x =
        0.42 * (1 - THREE.MathUtils.smoothstep(current, 0, 0.65));
    pose(rig, cameraPoses, current);
    const turn = THREE.MathUtils.smoothstep(current, 3.2, 3.58);
    const zoom = THREE.MathUtils.smoothstep(current, 3.62, 4.02);
    if (current >= 3.2) {
      const baseScale = mobile ? 0.539 : 1.1;
      const finalScale = Math.max(18, (mobile ? 11 : 15) / screenWidth);
      const scale = baseScale * Math.pow(finalScale / baseScale, zoom);
      rig.rotation.set(
        mix(0.08, 0, turn),
        mix(-0.36, -Math.PI, turn),
        mix(-0.05, 0, turn),
      );
      rig.scale.setScalar(scale);
      const anchor = screenAnchor
        .clone()
        .multiplyScalar(scale)
        .applyEuler(rig.rotation);
      rig.position.set(
        mix(mobile ? 0.222 : 1.85, -anchor.x, turn),
        mix(mobile ? -1.16 : -0.15, -anchor.y, turn),
        -anchor.z * zoom,
      );
    }
    if (rearScreen && zoom > 0) {
      rig.updateMatrixWorld(true);
      const geometry = rearScreen.geometry as THREE.PlaneGeometry;
      const halfW = geometry.parameters.width / 2;
      const halfH = geometry.parameters.height / 2;
      const lower = rearScreen
        .localToWorld(new THREE.Vector3(-halfW, -halfH, 0))
        .project(camera);
      const upper = rearScreen
        .localToWorld(new THREE.Vector3(halfW, halfH, 0))
        .project(camera);
      const match = THREE.MathUtils.smoothstep(zoom, 0.25, 0.9);
      const x = mix(1, Math.abs(upper.x - lower.x) / 2, match);
      const y = mix(1, Math.abs(upper.y - lower.y) / 2, match);
      galleryTarget.texture.repeat.set(x, y);
      galleryTarget.texture.offset.set((1 - x) / 2, (1 - y) / 2);
    } else {
      galleryTarget.texture.repeat.set(1, 1);
      galleryTarget.texture.offset.set(0, 0);
    }
    rig.visible = current > 2.55 && current < 4.02;
    galleryCamera.aspect = camera.aspect;
    galleryYaw = mix(galleryYaw, galleryYawTarget, 0.15);
    galleryPitch = mix(galleryPitch, galleryPitchTarget, 0.15);
    galleryCamera.rotation.set(galleryPitch, -galleryYaw, 0, "YXZ");
    galleryCamera.position.set(
      Math.sin(galleryYaw) * 0.5,
      0,
      Math.cos(galleryYaw) * 0.5,
    );
    galleryControl.hidden = staticMode || current < 4.02 || current > 4.42;
    if (galleryControl.hidden) drag = undefined;
    galleryCamera.updateProjectionMatrix();
    // The offscreen room is only visible through the rear LCD during this transition.
    if (!staticMode && current > 3.15 && current < 4.02) {
      renderer.setRenderTarget(galleryTarget);
      renderer.render(galleryScene, galleryCamera);
      renderer.setRenderTarget(null);
    }
    laptop.visible = current < 1.95;
    if (screen && projectTexture) {
      const material = screen.material as THREE.MeshBasicMaterial;
      const texture = projectTexture;
      if (material.map !== texture) {
        material.map = texture;
        material.needsUpdate = true;
      }
    }
    const readingCommunity =
      scrollY > sourceSection.offsetTop - innerHeight * 0.35 &&
      scrollY < cameraSection.offsetTop - innerHeight;
    const indexVisible =
      readingCommunity || scrollY > indexSection.offsetTop - innerHeight * 0.05;
    const laptopFade = 1 - THREE.MathUtils.smoothstep(current, 1.72, 1.95);
    const cameraFade =
      THREE.MathUtils.smoothstep(current, 2.55, 2.85) *
      (1 - THREE.MathUtils.smoothstep(current, 4.42, 4.52));
    canvas.style.opacity = String(
      indexVisible ? 0 : staticMode ? 1 : Math.max(laptopFade, cameraFade),
    );
    const dark = !staticMode && current > 2.78 && !indexVisible;
    root.toggleAttribute("data-dark", dark);
    panels.forEach((panel, panelIndex) => {
      const i = Number(chapters[panelIndex].dataset.scene);
      if (staticMode) {
        panel.style.removeProperty("opacity");
        panel.style.removeProperty("visibility");
        panel.style.removeProperty("transform");
        panel.inert = false;
        return;
      }
      const local = current - i;
      const enter =
        i === 0 ? 1 : THREE.MathUtils.smoothstep(local, -0.16, 0.07);
      const leave =
        1 -
        THREE.MathUtils.smoothstep(
          local,
          i === 4
            ? 0.88
            : i === 1
              ? 0.65
              : i === 3
                ? 0.36
                : i === 2
                  ? 0.8
                  : 0.66,
          i === 1 ? 0.88 : i === 3 ? 0.56 : 0.98,
        );
      const opacity = indexVisible
        ? 0
        : enter *
          leave *
          (i === 4 ? THREE.MathUtils.smoothstep(current, 4.53, 4.64) : 1);
      panel.style.opacity = String(opacity);
      panel.style.visibility = opacity > 0.001 ? "visible" : "hidden";
      panel.style.transform = `translateY(${(1 - enter) * 32 - (1 - leave) * 20}px)`;
      panel.inert = opacity < 0.35;
    });
    const galleryCopyOpacity = staticMode
      ? 1
      : THREE.MathUtils.smoothstep(current, 4.53, 4.64);
    galleryHeading.style.opacity = String(galleryCopyOpacity);
    galleryFoot.style.opacity = String(galleryCopyOpacity);
    prints.forEach((print, i) => {
      const enter = THREE.MathUtils.smoothstep(
        current,
        4.53 + i * 0.015,
        4.62 + i * 0.015,
      );
      print.style.transform = staticMode
        ? "none"
        : `translate(${(i - 1) * (1 - enter) * 180}px,${(1 - enter) * 60}px)`;
    });
    if (Number(canvas.style.opacity) > 0) renderer.render(
      current >= 4.02 && !staticMode ? galleryScene : scene,
      current >= 4.02 && !staticMode ? galleryCamera : camera,
    );
    if (
      !staticMode &&
      (Math.abs(current - target) > 0.001 ||
        Math.abs(galleryYaw - galleryYawTarget) > 0.0001 ||
        Math.abs(galleryPitch - galleryPitchTarget) > 0.0001)
    )
      schedule();
  }
  function schedule() {
    if (!frame && !disposed && !document.hidden) frame = requestAnimationFrame(draw);
  }
  function onScroll() {
    target = locate();
    if (Math.abs(target - current) > 1.2) current = target;
    schedule();
  }
  function resize() {
    mobile = innerWidth < 761;
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.position.z = mobile ? 11.8 : 10;
    camera.updateProjectionMatrix();
    galleryTarget.setSize(
      Math.min(innerWidth, 1600),
      (Math.min(innerWidth, 1600) * innerHeight) / innerWidth,
    );
    onScroll();
  }
  function setMotion() {
    root.toggleAttribute("data-static", staticMode);
    toggle.textContent = staticMode ? "Motion off" : "Motion on";
    toggle.setAttribute("aria-pressed", String(staticMode));
    resize();
  }
  const changeMotion = () => {
    staticMode = !staticMode;
    setMotion();
  };
  const preferenceChange = () => {
    staticMode = reduced.matches;
    setMotion();
  };
  const visibilityChange = () => {
    if (!document.hidden) onScroll();
  };
  const chapterStops = [0, 0.08, 0.08, 0.08];
  const chapterNavigation = (event: MouseEvent) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const link = (event.target as Element).closest<HTMLAnchorElement>(
      'a[href^="#"]',
    );
    if (!link) return;
    if (link.classList.contains("resume-jump")) {
      event.preventDefault();
      const resume = root.querySelector<HTMLElement>("#index")!;
      history.pushState(null, "", "#index");
      resume.setAttribute("tabindex", "-1");
      resume.focus({ preventScroll: true });
      resume.scrollIntoView({ behavior: "instant", block: "start" });
      return;
    }
    const index = chapters.findIndex(
      (chapter) => `#${chapter.id}` === link.getAttribute("href"),
    );
    if (index < 0 || staticMode) return;
    event.preventDefault();
    history.pushState(null, "", link.getAttribute("href")!);
    window.scrollTo({
      top:
        chapters[index].offsetTop +
        chapters[index].offsetHeight * chapterStops[index],
      behavior: "instant",
    });
  };
  root.addEventListener("click", chapterNavigation);
  toggle.addEventListener("click", changeMotion);
  reduced.addEventListener("change", preferenceChange);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", visibilityChange);
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    staticMode = true;
    setMotion();
    status.hidden = false;
    status.textContent = "3D paused. The full story is below.";
  });
  root.dataset.cinema = "";
  setMotion();
  document.addEventListener("astro:before-swap", dispose, { once: true });
  window.addEventListener(
    "pagehide",
    (event) => {
      if (!event.persisted) dispose();
    },
    { once: true },
  );
  const results = await Promise.allSettled([
    model("/models/macbook.glb").then((object) => {
      object.traverse((child) => {
        if (!(child instanceof THREE.Mesh) || child.name !== "VQmfhbMzfNAuKAD")
          return;
        // The display surface from the source model, preserving its authored UVs.
        screen = child;
        const material = new THREE.MeshBasicMaterial({
          map: projectTexture ?? null,
          toneMapped: false,
        });
        child.material = material;
        resources.add(material);
      });
      const displayAssembly = object.getObjectByName("VCQqxpxkUlzqcJI");
      if (displayAssembly?.parent) {
        // Hinge in the source model's centimeter coordinates, before normalization.
        const parent = displayAssembly.parent;
        lid = new THREE.Group();
        lid.position.set(0, -12.4, 0);
        parent.add(lid);
        object.updateMatrixWorld(true);
        lid.attach(displayAssembly);
      }
      laptop.add(normalize(object, 4.9));
      status.hidden = true;
      root.dataset.models = "laptop-ready";
      schedule();
    }),
    cameraNearby.then(() => {
      if (disposed) throw new Error("Scene disposed");
      return Promise.all([
      model("/models/gear/r7.glb"),
      model("/models/gear/35.glb"),
      model("/models/gear/adapter.glb"),
    ]); }).then(([body, lens, adapter]) => {
      for (const object of [body, lens, adapter])
        object.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          for (const material of Array.isArray(child.material)
            ? child.material
            : [child.material]) {
            if (material instanceof THREE.MeshStandardMaterial) {
              material.envMapIntensity = 0.65;
              if (material.normalMap) material.normalScale.multiplyScalar(0.25);
            }
          }
        });
      // The authored rear display determines the portal's actual position and size.
      body.updateMatrixWorld(true);
      body.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        if (
          !materials.some((material) => /R7 display glass/i.test(material.name))
        )
          return;
        const bounds = new THREE.Box3().setFromObject(child);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const geometry = new THREE.PlaneGeometry(size.x * 0.96, size.y * 0.94);
        const material = new THREE.MeshBasicMaterial({
          map: galleryTarget.texture,
          toneMapped: false,
        });
        rearScreen = new THREE.Mesh(geometry, material);
        rearScreen.position.set(center.x, center.y, bounds.min.z - 0.003);
        rearScreen.rotation.y = Math.PI;
        body.add(rearScreen);
        resources.add(geometry);
        resources.add(material);
      });
      const assembly = new THREE.Group();
      adapter.position.z = 0.53;
      lens.position.z = 0.53 - 0.088 + 24 / 55;
      assembly.add(body, lens, adapter);
      rig.add(normalize(assembly, 3.1));
      rig.updateMatrixWorld(true);
      if (rearScreen) {
        rearScreen.getWorldPosition(screenAnchor);
        rig.worldToLocal(screenAnchor);
        const size = new THREE.Box3()
          .setFromObject(rearScreen)
          .getSize(new THREE.Vector3());
        screenWidth = size.x / rig.scale.x;
      }
      schedule();
    }),
  ]);
  if (disposed) return;
  if (results.every((result) => result.status === "fulfilled")) {
    status.hidden = true;
    root.dataset.models = "ready";
  } else {
    status.textContent =
      "Some 3D assets could not load. You can still explore the work.";
    root.dataset.models = "partial";
  }
  onScroll();
  function dispose() {
    disposed = true;
    cameraObserver.disconnect();
    releaseCamera();
    galleryControl.remove();
    cancelAnimationFrame(frame);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", visibilityChange);
    reduced.removeEventListener("change", preferenceChange);
    toggle.removeEventListener("click", changeMotion);
    root.removeEventListener("click", chapterNavigation);
    for (const resource of resources) resource.dispose();
    galleryTarget.dispose();
    envMap.dispose();
    renderer.dispose();
  }

}
