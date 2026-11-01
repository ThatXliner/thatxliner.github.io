import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import lcdPhoto from "../assets/photography/rosewater.webp?url";

const { lerp: mix, smoothstep } = THREE.MathUtils;

// x, y, z, pitch, yaw, roll, scale.
const OFFSTAGE = [5, 0, -3, 0.1, -1.2, 0.1, 0.4];
const PRESENTED = [1.85, -0.15, 0, 0.08, -0.36, -0.05, 1.1];

export interface CameraScene {
    /** progress runs 0 to 1 through the chapter; yaw is the hand's extra turn. */
    render(progress: number, yaw: number): void;
    resize(): void;
    dispose(): void;
}

/**
 * The September film's best shot, without its laptop or furnished room: the real
 * R7 model arrives, turns its back to you, and you go in through its rear LCD
 * until a selected photograph fills the screen. Throws if WebGL is unavailable.
 */
export async function createCameraScene(canvas: HTMLCanvasElement): Promise<CameraScene> {
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
    // to draw its outline. The same reason the portrait has its key light.
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

    let mobile = false;
    let screen: THREE.Mesh | undefined;
    const screenAnchor = new THREE.Vector3();
    let screenWidth = 1;
    const anchor = new THREE.Vector3();

    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const [body, lens, adapter, photo] = await Promise.all([
        loader.loadAsync("/models/gear/r7.glb?v=94aff49376cb").then(({ scene }) => scene),
        loader.loadAsync("/models/gear/35.glb").then(({ scene }) => scene),
        loader.loadAsync("/models/gear/adapter.glb").then(({ scene }) => scene),
        new THREE.TextureLoader().loadAsync(lcdPhoto),
    ]).catch((error) => {
        envMap.dispose();
        renderer.dispose();
        throw error;
    });
    photo.colorSpace = THREE.SRGBColorSpace;
    resources.add(photo);

    for (const object of [body, lens, adapter]) {
        own(object);
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
    body.updateMatrixWorld(true);
    body.traverse((node) => {
        if (screen || !(node instanceof THREE.Mesh)) return;
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        if (!materials.some((material) => /R7 display glass/i.test(material.name))) return;
        const bounds = new THREE.Box3().setFromObject(node);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const width = size.x * 0.96;
        const height = size.y * 0.94;
        // object-fit: cover, so the photograph is cropped and never stretched.
        const image = photo.image as { width: number; height: number };
        const imageAspect = image.width / image.height;
        const screenAspect = width / height;
        if (imageAspect > screenAspect) photo.repeat.set(screenAspect / imageAspect, 1);
        else photo.repeat.set(1, imageAspect / screenAspect);
        photo.offset.set((1 - photo.repeat.x) / 2, (1 - photo.repeat.y) / 2);
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshBasicMaterial({ map: photo, toneMapped: false });
        screen = new THREE.Mesh(geometry, material);
        screen.position.set(center.x, center.y, bounds.min.z - 0.003);
        screen.rotation.y = Math.PI;
        body.add(screen);
        resources.add(geometry);
        resources.add(material);
    });

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
    if (screen) {
        screen.getWorldPosition(screenAnchor);
        screenWidth = new THREE.Box3().setFromObject(screen).getSize(new THREE.Vector3()).x;
    }

    function render(progress: number, yaw: number) {
        const enter = smoothstep(progress, 0, 0.26);
        const turn = smoothstep(progress, 0.5, 0.68);
        const zoom = smoothstep(progress, 0.7, 1);
        const pose = OFFSTAGE.map((value, i) => mix(value, PRESENTED[i], enter));
        if (mobile) {
            pose[0] *= 0.12;
            pose[1] = mix(pose[1], -1.5, 0.75);
            pose[6] *= 0.49;
        }
        const heldYaw = yaw * (1 - turn);
        if (turn === 0) {
            rig.position.set(pose[0], pose[1], pose[2]);
            rig.rotation.set(pose[3], pose[4] + heldYaw, pose[5]);
            rig.scale.setScalar(pose[6]);
        } else {
            // Scale exponentially, which reads as a constant approach, and keep
            // the display's own centre pinned to the middle of the frame.
            const baseScale = pose[6];
            const finalScale = Math.max(18, (mobile ? 11 : 15) / screenWidth);
            const scale = baseScale * Math.pow(finalScale / baseScale, zoom);
            rig.rotation.set(mix(pose[3], 0, turn), mix(pose[4], -Math.PI, turn) + heldYaw, mix(pose[5], 0, turn));
            rig.scale.setScalar(scale);
            anchor.copy(screenAnchor).multiplyScalar(scale).applyEuler(rig.rotation);
            rig.position.set(mix(pose[0], -anchor.x, turn), mix(pose[1], -anchor.y, turn), -anchor.z * zoom);
        }
        renderer.render(scene, camera);
    }

    function resize() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (!width || !height) return;
        mobile = width < 761 || width / height < 1;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.position.z = mobile ? 11.8 : 10;
        camera.updateProjectionMatrix();
    }
    resize();

    return {
        render,
        resize,
        dispose() {
            for (const resource of resources) resource.dispose();
            envMap.dispose();
            renderer.dispose();
        },
    };
}
