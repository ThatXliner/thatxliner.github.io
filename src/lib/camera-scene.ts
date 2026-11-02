import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { BEATS, mix, smoothstep, type Rect } from "./camera-beats";
import { modelUrl } from "./gear/model-urls";

export interface LcdFrame {
    src: string;
    width: number;
    height: number;
}

export interface CameraScene {
    /** progress is the chapter's timeline (see BEATS); yaw is the hand's extra turn. */
    render(progress: number, yaw: number): void;
    /** Where the kept picture and the body sit on screen while being reviewed. */
    measure(): { image: Rect; body: Rect };
    resize(): void;
    dispose(): void;
}

/**
 * The real R7 model, handled the way a photographer handles it: it faces you, gets
 * turned over and brought up to check the shot, and then lowered. It never grows
 * past something you could hold. The screen shows the frames in `frames`, whole
 * and uncropped. Throws if WebGL or any asset is unavailable.
 */
export async function createCameraScene(canvas: HTMLCanvasElement, frames: LcdFrame[]): Promise<CameraScene> {
    if (!frames.length) throw new Error("Nothing to review");

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 10);

    const environment = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(environment, 0.04);
    scene.environment = envMap.texture;
    environment.dispose();
    pmrem.dispose();

    // A black camera on a black page is all edges: one soft key, then two rims
    // to draw its outline.
    scene.add(new THREE.HemisphereLight(0xffffff, 0x3c3e42, 0.9));
    const key = new THREE.DirectionalLight(0xfff4e6, 2.8);
    key.position.set(-3, 5, 5);
    const rimRight = new THREE.DirectionalLight(0xd6e4ff, 3);
    rimRight.position.set(5, 1.5, -4);
    const rimLeft = new THREE.DirectionalLight(0xffffff, 2);
    rimLeft.position.set(-5, 2, -4);
    scene.add(key, rimRight, rimLeft);

    const rig = new THREE.Group();
    scene.add(rig);

    const resources = new Set<THREE.BufferGeometry | THREE.Material | THREE.Texture>();
    const own = (model: THREE.Object3D) => {
        model.traverse((node) => {
            if (!(node instanceof THREE.Mesh)) return;
            resources.add(node.geometry);
            for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
                resources.add(material);
                for (const value of Object.values(material)) if (value instanceof THREE.Texture) resources.add(value);
            }
        });
    };

    const dispose = () => {
        for (const resource of resources) resource.dispose();
        envMap.dispose();
        renderer.dispose();
    };
    /** For a build that never finished: nothing will draw here, so free the context too. */
    const abandon = (error: unknown): never => {
        dispose();
        renderer.forceContextLoss();
        throw error;
    };

    const textureLoader = new THREE.TextureLoader();
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const modelPaths = [modelUrl("r7"), modelUrl("28-135"), modelUrl("adapter")];
    // Settled, not raced: when one asset fails, the ones that arrived still get
    // owned and freed instead of being stranded by the rejection.
    const models = await Promise.allSettled(modelPaths.map((path) => loader.loadAsync(path).then(({ scene }) => scene)));
    const textures = await Promise.allSettled(frames.map((frame) => textureLoader.loadAsync(frame.src)));
    for (const model of models) if (model.status === "fulfilled") own(model.value);
    for (const texture of textures) if (texture.status === "fulfilled") resources.add(texture.value);
    const failure = [...models, ...textures].find((result): result is PromiseRejectedResult => result.status === "rejected");
    if (failure) abandon(failure.reason);
    const [body, lens, adapter] = models.map((model) => (model as PromiseFulfilledResult<THREE.Group>).value);
    const pictures = textures.map((texture) => (texture as PromiseFulfilledResult<THREE.Texture>).value);
    for (const picture of pictures) picture.colorSpace = THREE.SRGBColorSpace;

    for (const object of [body, lens, adapter]) {
        object.traverse((node) => {
            if (!(node instanceof THREE.Mesh)) return;
            for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
                if (material instanceof THREE.MeshStandardMaterial) {
                    material.envMapIntensity = 0.65;
                    if (material.normalMap) material.normalScale.multiplyScalar(0.25);
                }
            }
        });
    }

    // The authored rear display decides where the screen goes and how big it is.
    let lcd: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | undefined;
    let lcdWidth = 1;
    let lcdHeight = 1;
    body.updateMatrixWorld(true);
    body.traverse((node) => {
        if (lcd || !(node instanceof THREE.Mesh)) return;
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        if (!materials.some((material) => /R7 display glass/i.test(material.name))) return;
        const bounds = new THREE.Box3().setFromObject(node);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        lcdWidth = size.x * 0.96;
        lcdHeight = size.y * 0.94;
        const geometry = new THREE.PlaneGeometry(1, 1);
        // A picture that doesn't match the screen's shape gets black bars, as on the camera.
        const backing = new THREE.MeshBasicMaterial({ color: 0x050506, toneMapped: false });
        const glass = new THREE.Mesh(geometry, backing);
        glass.scale.set(lcdWidth, lcdHeight, 1);
        glass.position.set(center.x, center.y, bounds.min.z - 0.002);
        glass.rotation.y = Math.PI;
        const material = new THREE.MeshBasicMaterial({ map: pictures[0], toneMapped: false });
        lcd = new THREE.Mesh(geometry, material);
        lcd.position.set(center.x, center.y, bounds.min.z - 0.003);
        lcd.rotation.y = Math.PI;
        body.add(glass, lcd);
        resources.add(geometry);
        resources.add(backing);
        resources.add(material);
    });
    if (!lcd) return abandon(new Error("The model has no display"));
    const screen = lcd;

    let shown = -1;
    const showFrame = (index: number) => {
        if (index === shown) return;
        shown = index;
        screen.material.map = pictures[index];
        const aspect = frames[index].width / frames[index].height;
        const height = Math.min(lcdHeight, lcdWidth / aspect);
        screen.scale.set(height * aspect, height, 1);
    };
    showFrame(0);

    const assembly = new THREE.Group();
    adapter.position.z = 0.53;
    lens.position.z = 0.53 - 0.088 + 24 / 55;
    assembly.add(body, lens, adapter);

    const box = new THREE.Box3().setFromObject(assembly);
    assembly.position.sub(box.getCenter(new THREE.Vector3()));
    const normalized = new THREE.Group();
    normalized.add(assembly);
    normalized.scale.setScalar(3.1 / box.getSize(new THREE.Vector3()).x);
    rig.add(normalized);

    // Measured with the rig at rest, so a later pose can't skew the numbers.
    rig.updateMatrixWorld(true);
    const bodyBox = new THREE.Box3().setFromObject(body);
    const bodyCenter = bodyBox.getCenter(new THREE.Vector3());
    const bodySize = bodyBox.getSize(new THREE.Vector3());
    const screenCenter = screen.getWorldPosition(new THREE.Vector3());
    const anchor = new THREE.Vector3();

    const layout = { frontX: 1.85, frontY: -0.15, frontScale: 1.1, enterX: 0.9, reviewY: 0, reviewScale: 1, sinkBy: 6 };

    function poseRig(progress: number, yaw: number) {
        const settle = smoothstep(progress, BEATS.settle);
        const turn = smoothstep(progress, BEATS.turn);
        const sink = smoothstep(progress, BEATS.sink);
        const scale = mix(layout.frontScale, layout.reviewScale, turn);
        rig.scale.setScalar(scale);
        // Turning something in the hand rolls it a little on the way round. The
        // tip of the wrist as it is lowered stays slight, or the lens swings up at you.
        rig.rotation.set(
            mix(0.08, 0, turn) + sink * 0.18,
            mix(-0.36 - (1 - settle) * 0.55, -Math.PI, turn) + yaw * (1 - turn),
            mix(-0.05, 0, turn) + Math.sin(turn * Math.PI) * 0.05,
        );
        // At review the body is centred and its screen sits at z = 0, so its size
        // on the page comes from reviewScale alone and perspective can't inflate it.
        anchor.copy(screenCenter).multiplyScalar(scale).applyEuler(rig.rotation);
        const screenDepth = anchor.z;
        anchor.copy(bodyCenter).multiplyScalar(scale).applyEuler(rig.rotation);
        rig.position.set(
            mix(layout.frontX + (1 - settle) * layout.enterX, -anchor.x, turn),
            mix(layout.frontY, layout.reviewY - anchor.y, turn) - sink * layout.sinkBy,
            -screenDepth * turn,
        );
    }

    function render(progress: number, yaw: number) {
        showFrame(Math.min(BEATS.cuts.filter((cut) => progress >= cut).length, frames.length - 1));
        poseRig(progress, yaw);
        renderer.render(scene, camera);
    }

    const projected = new THREE.Vector3();
    function toScreen(points: THREE.Vector3[], matrix: THREE.Matrix4): Rect {
        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;
        for (const point of points) {
            projected.copy(point).applyMatrix4(matrix).project(camera);
            const x = ((projected.x + 1) / 2) * canvas.clientWidth;
            const y = ((1 - projected.y) / 2) * canvas.clientHeight;
            left = Math.min(left, x);
            top = Math.min(top, y);
            right = Math.max(right, x);
            bottom = Math.max(bottom, y);
        }
        return { left, top, width: right - left, height: bottom - top };
    }

    const screenCorners = [
        [-0.5, -0.5],
        [0.5, -0.5],
        [0.5, 0.5],
        [-0.5, 0.5],
    ].map(([x, y]) => new THREE.Vector3(x, y, 0));
    const bodyCorners = [0, 1, 2, 3, 4, 5, 6, 7].map(
        (i) =>
            new THREE.Vector3(
                i & 1 ? bodyBox.max.x : bodyBox.min.x,
                i & 2 ? bodyBox.max.y : bodyBox.min.y,
                i & 4 ? bodyBox.max.z : bodyBox.min.z,
            ),
    );

    /** Leaves the rig in the review pose. The next render puts it back. */
    function measure() {
        showFrame(frames.length - 1);
        poseRig(BEATS.lift[0], 0);
        rig.updateMatrixWorld(true);
        camera.updateMatrixWorld();
        return { image: toScreen(screenCorners, screen.matrixWorld), body: toScreen(bodyCorners, rig.matrixWorld) };
    }

    function resize() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (!width || !height) return;
        const portrait = width < 761 || width / height < 1;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.position.z = portrait ? 11.8 : 10;
        camera.updateProjectionMatrix();
        const visibleHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        const visibleWidth = visibleHeight * camera.aspect;
        layout.frontX = portrait ? 0.22 : 1.85;
        layout.frontY = portrait ? -1.16 : -0.15;
        layout.frontScale = portrait ? 0.54 : 1.1;
        layout.enterX = portrait ? 0.3 : 0.9;
        layout.reviewScale = Math.min((0.84 * visibleWidth) / bodySize.x, ((portrait ? 0.5 : 0.66) * visibleHeight) / bodySize.y);
        layout.reviewY = visibleHeight * (portrait ? 0.06 : 0.03);
        layout.sinkBy = visibleHeight / 2 + bodySize.y * layout.reviewScale * 1.3;
    }
    resize();

    return {
        render,
        measure,
        resize,
        dispose,
    };
}
