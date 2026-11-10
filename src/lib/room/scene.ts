import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { loadModelLibrary } from "../gear/models";
import { lenses, bodies } from "../gear/catalog";
import * as props from "./props";
import { awardShelf, cameraBag, pathRug, type RugStop } from "./furnishings";
import { MUSIC_DOOR, createMusicRoom, type MusicRoom, type Release } from "./music";
import { DOOR, createGallery, type Gallery, type GalleryPhoto } from "./gallery";
import { createGlass, type Lens, type Scrim } from "./glass";
import { createScreen, type ScreenImages, type ScreenLabels, type ScreenState } from "./screen";

/**
 * The room, in metres. Back wall at z = -2, window in the left wall at
 * x = -2.2, the open side (where the camera lives) toward +z.
 *
 *   desk + MacBook + lamp + R7 ........ left, under the window light
 *   trombone on its stand ............. between desk and piano
 *   upright piano + bench ............. right
 *   C200 on sticks, aimed at the piano  front right
 */
export const ROOM = { left: -2.2, right: 2.2, back: -2, front: 2.6, height: 2.7 };

export interface Shot {
    position: THREE.Vector3;
    target: THREE.Vector3;
    fov: number;
}

export interface RoomScene {
    /** Where the camera must be for the laptop display to fill a viewport of this aspect. */
    /**
     * The camera square-on to the display. "contain" fits it in the viewport
     * with a margin, for sitting at the desk; "cover" fills the viewport.
     */
    screenShot(aspect: number, fit: "cover" | "contain"): Shot;
    /** Where the display lands on the page, in CSS pixels, seen from `shot`. */
    screenRect(shot: Shot, width: number, height: number): { left: number; top: number; width: number; height: number };
    anchors: Record<"laptop" | "r7" | "piano" | "trombone" | "c200" | "prints" | "bag" | "rug" | "shelf", THREE.Vector3>;
    /** `gallery`: the camera is in the photographs' hall, which is shown untouched. */
    render(shot: Shot, state: { screen: ScreenState; daylight: number; lamp: number; gallery?: boolean }): void;
    /** What floats over the room: scrims behind words, glass under buttons. */
    overlay(layers: { lenses: Lens[]; scrims: Scrim[] }): void;
    /** Redraw only the overlay, over the last rendered room. */
    present(): void;
    /** The photographs' hall, through the door in the right wall. */
    gallery: Gallery;
    /** The photograph under a point on the canvas (CSS pixels), or -1. */
    pickPhoto(x: number, y: number): number;
    /** The stop on the rug's path under a point on the canvas, or -1. */
    pickStop(x: number, y: number): number;
    /** Light one stop on the rug (-1 for none). */
    showStop(index: number): void;
    /** The camera bag's lid, 0 shut to 1 open. */
    openBag(t: number): void;
    /** The music room, through the left wall. */
    music: MusicRoom;
    /** Where a point in the room lands on the canvas from the last rendered shot. */
    project(point: THREE.Vector3): { x: number; y: number; visible: boolean; ahead: boolean };
    resize(): void;
    dispose(): void;
}

interface Inputs {
    canvas: HTMLCanvasElement;
    screen: ScreenImages;
    labels: ScreenLabels;
    prints: { image: HTMLImageElement; aspect: number }[];
    /** Every photograph, for the gallery through the door. */
    photographs: GalleryPhoto[];
    /** The path's stops, woven into the rug. */
    story: RugStop[];
    /** Releases for the music room's records. */
    releases: Release[];
    /** 0–1 across every model download. */
    onProgress?: (fraction: number) => void;
}

/** Rough sizes, so the bar moves sensibly before each server reports a length. */
const EXPECTED_BYTES: Record<string, number> = { macbook: 11e6, r7: 4.5e6, c200: 6e6, "28-135": 2.3e6, adapter: 0.5e6 };

const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Couldn't load ${src}`));
        image.src = src;
    });
export { loadImage };

export async function createRoom({ canvas, screen: screenImages, labels, prints, photographs, story, releases, onProgress }: Inputs): Promise<RoomScene> {
    const downloads = new Map(Object.entries(EXPECTED_BYTES).map(([id, total]) => [id, { loaded: 0, total }]));
    const progress = (id: string, loaded: number, total: number) => {
        downloads.set(id, { loaded, total: total || downloads.get(id)!.total });
        let done = 0;
        let all = 0;
        for (const file of downloads.values()) {
            done += Math.min(file.loaded, file.total);
            all += file.total;
        }
        onProgress?.(done / all);
    };
    RectAreaLightUniformsLib.init();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.AgXToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050506);
    const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 40);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    const envMap = pmrem.fromScene(environment, 0.04).texture;
    environment.dispose();
    pmrem.dispose();
    scene.environment = envMap;
    scene.environmentIntensity = 0.35;

    const m = props.materials();
    const owned: { dispose(): void }[] = [envMap, renderer];

    // ── Shell ────────────────────────────────────────────────────────────
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xd8d2c8, roughness: 0.95 });
    const floorTex = props.woodTexture("#7a5434", "#3a2010", 7, 8);
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(2.2, 2.2);
    const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.55 });
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 1 });
    const width = ROOM.right - ROOM.left;
    const depth = ROOM.front - ROOM.back;

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, (ROOM.front + ROOM.back) / 2);
    floor.receiveShadow = true;
    scene.add(floor);

    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, ROOM.height, (ROOM.front + ROOM.back) / 2);
    scene.add(ceiling);

    const back = new THREE.Mesh(new THREE.PlaneGeometry(width, ROOM.height), wallMat);
    back.position.set(0, ROOM.height / 2, ROOM.back);
    back.receiveShadow = true;
    scene.add(back);

    // Right wall, built around the door to the gallery. Solid, so neither
    // room shows through it from the other side.
    const rightPiece = (z0: number, z1: number, y0: number, y1: number) => {
        const piece = new THREE.Mesh(new THREE.BoxGeometry(0.16, y1 - y0, z1 - z0), wallMat);
        piece.position.set(ROOM.right + 0.08, (y0 + y1) / 2, (z0 + z1) / 2);
        piece.castShadow = piece.receiveShadow = true;
        scene.add(piece);
    };
    rightPiece(ROOM.back, DOOR.z0, 0, ROOM.height);
    rightPiece(DOOR.z1, ROOM.front, 0, ROOM.height);
    rightPiece(DOOR.z0, DOOR.z1, DOOR.height, ROOM.height);
    // Door casing, and a small plaque beside it.
    const casing = new THREE.MeshStandardMaterial({ color: 0xf1eee8, roughness: 0.7 });
    for (const z of [DOOR.z0 - 0.03, DOOR.z1 + 0.03]) {
        const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.2, DOOR.height + 0.06, 0.06), casing);
        jamb.position.set(ROOM.right + 0.08, (DOOR.height + 0.06) / 2, z);
        jamb.castShadow = jamb.receiveShadow = true;
        scene.add(jamb);
    }
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, DOOR.z1 - DOOR.z0 + 0.12), casing);
    head.position.set(ROOM.right + 0.08, DOOR.height + 0.03, (DOOR.z0 + DOOR.z1) / 2);
    head.castShadow = true;
    scene.add(head);
    const plaqueTex = props.canvasTexture(512, 160, (g) => {
        g.fillStyle = "#1b1b1d";
        g.fillRect(0, 0, 512, 160);
        g.fillStyle = "#e8e4dc";
        g.font = `500 56px ${getComputedStyle(document.body).fontFamily}`;
        g.textAlign = "center";
        g.fillText("Photographs", 256, 84);
        g.fillStyle = "rgba(232,228,220,0.55)";
        g.font = `400 30px ${getComputedStyle(document.body).fontFamily}`;
        g.fillText("this way →", 256, 128);
    });
    const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.075), new THREE.MeshStandardMaterial({ map: plaqueTex, roughness: 0.5 }));
    plaque.rotation.y = -Math.PI / 2;
    plaque.position.set(ROOM.right - 0.001, 1.45, DOOR.z1 + 0.28);
    scene.add(plaque);
    owned.push(plaqueTex);

    // Left wall, built around a window opening.
    const win = { z0: -1.55, z1: 0.35, y0: 0.9, y1: 2.3 };
    const leftWall = new THREE.Group();
    const wallPiece = (z0: number, z1: number, y0: number, y1: number) => {
        const piece = new THREE.Mesh(new THREE.BoxGeometry(0.16, y1 - y0, z1 - z0), wallMat);
        piece.position.set(ROOM.left - 0.08, (y0 + y1) / 2, (z0 + z1) / 2);
        piece.castShadow = piece.receiveShadow = true;
        leftWall.add(piece);
    };
    wallPiece(ROOM.back, win.z0, 0, ROOM.height);
    wallPiece(win.z1, MUSIC_DOOR.z0, 0, ROOM.height);
    wallPiece(win.z0, win.z1, 0, win.y0);
    wallPiece(win.z0, win.z1, win.y1, ROOM.height);
    // The door to the music room.
    wallPiece(MUSIC_DOOR.z1, ROOM.front, 0, ROOM.height);
    wallPiece(MUSIC_DOOR.z0, MUSIC_DOOR.z1, MUSIC_DOOR.height, ROOM.height);
    scene.add(leftWall);
    // Mullions and sill.
    const trim = new THREE.MeshStandardMaterial({ color: 0xf1eee8, roughness: 0.7 });
    const sill = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.03, win.z1 - win.z0 + 0.1), trim);
    sill.position.set(ROOM.left - 0.02, win.y0, (win.z0 + win.z1) / 2);
    sill.castShadow = sill.receiveShadow = true;
    scene.add(sill);
    for (const z of [win.z0 + 0.02, (win.z0 + win.z1) / 2, win.z1 - 0.02]) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.05, win.y1 - win.y0, 0.04), trim);
        bar.position.set(ROOM.left - 0.06, (win.y0 + win.y1) / 2, z);
        bar.castShadow = true;
        scene.add(bar);
    }
    const transom = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, win.z1 - win.z0), trim);
    transom.position.set(ROOM.left - 0.06, win.y0 + (win.y1 - win.y0) * 0.62, (win.z0 + win.z1) / 2);
    transom.castShadow = true;
    scene.add(transom);

    // The sky outside: a gradient card that changes with the hour.
    const skyCanvas = document.createElement("canvas");
    skyCanvas.width = 4;
    skyCanvas.height = 256;
    const skyTex = new THREE.CanvasTexture(skyCanvas);
    skyTex.colorSpace = THREE.SRGBColorSpace;
    // Wide enough for the window, short of the music room behind the wall.
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 5), new THREE.MeshBasicMaterial({ map: skyTex, toneMapped: false }));
    sky.rotation.y = Math.PI / 2;
    sky.position.set(ROOM.left - 2.5, 1.6, -2.3);
    scene.add(sky);
    owned.push(skyTex);
    const skyStops = {
        day: ["#f6c58a", "#f1a866", "#7fa7cf"],
        dusk: ["#3b4a78", "#8a5a7a", "#e08a5a"],
        night: ["#05070d", "#0b1222", "#16213a"],
    };
    let skyKey = -1;
    function paintSky(daylight: number) {
        const key = Math.round(daylight * 100);
        if (key === skyKey) return;
        skyKey = key;
        const blend = (a: string, b: string, t: number) => new THREE.Color(a).lerp(new THREE.Color(b), t).getStyle();
        const [from, to, t] = daylight > 0.5 ? [skyStops.dusk, skyStops.day, (daylight - 0.5) * 2] : [skyStops.night, skyStops.dusk, daylight * 2];
        const g = skyCanvas.getContext("2d")!;
        const gradient = g.createLinearGradient(0, 0, 0, 256);
        // Top, middle, horizon.
        gradient.addColorStop(0, blend(from[2], to[2], t));
        gradient.addColorStop(0.55, blend(from[1], to[1], t));
        gradient.addColorStop(1, blend(from[0], to[0], t));
        g.fillStyle = gradient;
        g.fillRect(0, 0, 4, 256);
        skyTex.needsUpdate = true;
    }

    // The rug, out on the open floor, with the path woven into it.
    const rugSize = { width: 2.4, depth: 1.6 };
    const pathOnRug = pathRug(story, rugSize.width, rugSize.depth);
    owned.push(pathOnRug.texture);
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(rugSize.width, rugSize.depth), new THREE.MeshStandardMaterial({ map: pathOnRug.texture, roughness: 1 }));
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0.1, 0.004, 0.6);
    rug.receiveShadow = true;
    scene.add(rug);

    // ── Furniture ────────────────────────────────────────────────────────
    const deskTop = props.woodTexture("#9c7550", "#4a2c14", 3);
    const desk = props.desk(new THREE.MeshStandardMaterial({ map: deskTop, roughness: 0.5 }), m.blackMetal);
    desk.position.set(-1.05, 0, -1.62);
    desk.traverse((node) => {
        if (node instanceof THREE.Mesh) node.castShadow = node.receiveShadow = true;
    });
    scene.add(desk);
    const deskY = 0.75;

    const piano = props.piano(m);
    piano.position.set(1.2, 0, ROOM.back + 0.3);
    scene.add(piano);
    const bench = props.bench(m);
    bench.position.set(1.2, 0, -0.95);
    bench.rotation.y = 0.04;
    scene.add(bench);

    const trombone = props.trombone(m);
    trombone.position.set(0.12, 0, -1.6);
    trombone.rotation.y = -0.5;
    scene.add(trombone);

    const lamp = props.lamp(m);
    lamp.group.position.set(-1.6, deskY, -1.86);
    lamp.group.rotation.y = 0.1;
    scene.add(lamp.group);
    const lampLight = new THREE.SpotLight(0xffc98a, 0, 5, 0.95, 0.6, 1.4);
    lampLight.castShadow = true;
    lampLight.shadow.mapSize.set(2048, 2048);
    // The lamp sits against the left wall, so its light skims along it. Without a
    // normal bias the wall shades itself in stair-steps ("shadow acne").
    lampLight.shadow.bias = -0.0008;
    lampLight.shadow.normalBias = 0.035;
    lampLight.shadow.camera.near = 0.05;
    lampLight.shadow.radius = 6;
    scene.add(lampLight, lampLight.target);
    const lampFill = new THREE.PointLight(0xffb070, 0, 6, 1.4);
    scene.add(lampFill);

    const coffee = props.mug();
    coffee.position.set(-0.5, deskY, -1.86);
    scene.add(coffee);

    // A camera bag on the floor under the desk, lid shut until it's asked for.
    const bag = cameraBag(m);
    bag.group.position.set(-1.12, 0, -1.62);
    bag.group.rotation.y = 0.12;
    scene.add(bag.group);

    // Two floating shelves of awards on the right wall, between the piano and the gallery door.
    const shelf = awardShelf(m, new THREE.MeshStandardMaterial({ map: props.woodTexture("#5a3a22", "#24140a", 13), roughness: 0.55 }));
    shelf.position.set(ROOM.right, 0, -0.3);
    scene.add(shelf);
    // A small picture light over the shelf, so the awards read after dark.
    const shelfLight = new THREE.SpotLight(0xffd9a8, 6, 2.2, 0.75, 0.6, 1.5);
    shelfLight.position.set(ROOM.right - 0.35, 2.15, -0.3);
    shelfLight.target.position.set(ROOM.right - 0.1, 1.3, -0.3);
    scene.add(shelfLight, shelfLight.target);

    // Prints over the desk, his own photographs.
    const printTextures = prints.map(({ image }) => {
        const texture = new THREE.Texture(image);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 8;
        texture.needsUpdate = true;
        owned.push(texture);
        return texture;
    });
    const printGroup = new THREE.Group();
    // The back wall as a gallery: every print, in justified rows, centred in
    // the band of wall above the lamp and the piano. Each row is split by the
    // photos' total width so the rows balance, then scaled to fill the wall
    // edge to edge. `frame` adds a mat of 12% a side and a 1.5 cm moulding.
    const wall = { width: 3.9, bottom: 1.36, top: 2.36, gap: 0.07 };
    const outerWidth = (aspect: number, h: number) => h * aspect + h * 0.24 + 0.03;
    const rowCount = Math.max(1, Math.round(Math.sqrt(prints.length / 2.2)));
    const share = prints.reduce((sum, p) => sum + p.aspect + 0.24, 0) / rowCount;
    const rows: number[][] = [[]];
    let filled = 0;
    prints.forEach((p, i) => {
        if (filled >= share * 0.92 && rows.length < rowCount) {
            rows.push([]);
            filled = 0;
        }
        rows[rows.length - 1].push(i);
        filled += p.aspect + 0.24;
    });
    // The photo height that makes each row exactly the wall's width.
    let heights = rows.map((row) => {
        const fixed = row.length * 0.03 + (row.length - 1) * wall.gap;
        return Math.min(0.34, (wall.width - fixed) / row.reduce((sum, i) => sum + prints[i].aspect + 0.24, 0));
    });
    const blockHeight = (hs: number[]) => hs.reduce((sum, h) => sum + h * 1.24 + 0.03, 0) + (hs.length - 1) * wall.gap;
    const fit = Math.min(1, (wall.top - wall.bottom) / blockHeight(heights));
    heights = heights.map((h) => h * fit);
    let rowTop = (wall.top + wall.bottom) / 2 + blockHeight(heights) / 2;
    rows.forEach((row, r) => {
        const h = heights[r];
        const rowWidth = row.reduce((sum, i) => sum + outerWidth(prints[i].aspect, h), 0) + (row.length - 1) * wall.gap;
        let x = -rowWidth / 2;
        const y = rowTop - (h * 1.24 + 0.03) / 2;
        for (const i of row) {
            const w = outerWidth(prints[i].aspect, h);
            const framed = props.frame(printTextures[i], prints[i].aspect, h);
            framed.position.set(x + w / 2, y, ROOM.back + 0.001);
            printGroup.add(framed);
            x += w + wall.gap;
        }
        rowTop -= h * 1.24 + 0.03 + wall.gap;
    });
    scene.add(printGroup);

    const gallery = createGallery(photographs);
    scene.add(gallery.group);

    const music = createMusicRoom(m, releases);
    scene.add(music.group);
    // The music room's door gets a casing and a plaque, like the gallery's.
    for (const z of [MUSIC_DOOR.z0 - 0.03, MUSIC_DOOR.z1 + 0.03]) {
        const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.2, MUSIC_DOOR.height + 0.06, 0.06), casing);
        jamb.position.set(ROOM.left - 0.08, (MUSIC_DOOR.height + 0.06) / 2, z);
        jamb.castShadow = jamb.receiveShadow = true;
        scene.add(jamb);
    }
    const musicHead = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, MUSIC_DOOR.z1 - MUSIC_DOOR.z0 + 0.12), casing);
    musicHead.position.set(ROOM.left - 0.08, MUSIC_DOOR.height + 0.03, (MUSIC_DOOR.z0 + MUSIC_DOOR.z1) / 2);
    scene.add(musicHead);
    const musicPlaqueTex = props.canvasTexture(512, 160, (g) => {
        g.fillStyle = "#1b1b1d";
        g.fillRect(0, 0, 512, 160);
        g.fillStyle = "#e8e4dc";
        g.font = `500 56px ${getComputedStyle(document.body).fontFamily}`;
        g.textAlign = "center";
        g.fillText("Music room", 256, 84);
        g.fillStyle = "rgba(232,228,220,0.55)";
        g.font = `400 30px ${getComputedStyle(document.body).fontFamily}`;
        g.fillText("← this way", 256, 128);
    });
    const musicPlaque = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.075), new THREE.MeshStandardMaterial({ map: musicPlaqueTex, roughness: 0.5 }));
    musicPlaque.rotation.y = Math.PI / 2;
    musicPlaque.position.set(ROOM.left + 0.001, 1.45, MUSIC_DOOR.z1 + 0.28);
    scene.add(musicPlaque);
    owned.push(musicPlaqueTex);

    // ── Models ───────────────────────────────────────────────────────────
    const gltf = new GLTFLoader();
    const [macbookResult, libraryResult] = await Promise.allSettled([
        gltf.loadAsync("/models/macbook.glb", (event) => progress("macbook", event.loaded, event.lengthComputable ? event.total : 0)),
        loadModelLibrary(["r7", "c200", "28-135", "adapter"], progress),
    ]);
    if (macbookResult.status === "rejected" || libraryResult.status === "rejected") {
        if (libraryResult.status === "fulfilled") libraryResult.value.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        throw macbookResult.status === "rejected" ? macbookResult.reason : (libraryResult as PromiseRejectedResult).reason;
    }
    const library = libraryResult.value;
    owned.push(library);

    const macbook = macbookResult.value.scene;
    const screen = createScreen(screenImages, labels);
    owned.push(screen.texture);
    let display: THREE.Mesh | undefined;
    macbook.traverse((node) => {
        if (!(node instanceof THREE.Mesh)) return;
        node.castShadow = node.receiveShadow = true;
        const material = node.material as THREE.MeshStandardMaterial;
        if (material.emissiveMap && !display) {
            display = node;
            // A display emits; it shouldn't catch the room's lights or be tone-mapped into mud.
            node.material = new THREE.MeshBasicMaterial({ map: screen.texture, toneMapped: false });
            node.castShadow = false;
        }
    });
    if (!display) throw new Error("The MacBook has no display");
    const box = new THREE.Box3().setFromObject(macbook);
    macbook.position.set(-1.0, deskY - box.min.y, -1.62);
    scene.add(macbook);

    // The R7 + 28–135, put down on the desk, lens toward the room.
    const r7 = new THREE.Group();
    const body = library.body(bodies.find((b) => b.id === "r7")!);
    const lens = library.lens(lenses.find((l) => l.id === "28-135")!);
    const adapter = library.adapter();
    adapter.position.z = 0.53;
    lens.position.z = 0.53 - 0.088 + 24 / 55;
    r7.add(body, adapter, lens);
    // Model units are 55 mm.
    r7.scale.setScalar(0.055);
    const r7Box = new THREE.Box3().setFromObject(r7);
    r7.position.set(-0.45, deskY - r7Box.min.y, -1.5);
    r7.rotation.y = 0.75;
    scene.add(r7);

    // The C200 on sticks, aimed at the piano: somebody's about to record.
    const c200 = new THREE.Group();
    const cBody = library.body(bodies.find((b) => b.id === "c200")!);
    const cLens = library.lens(lenses.find((l) => l.id === "28-135")!).clone();
    cLens.position.z = 0.53 - 0.088;
    c200.add(cBody, cLens);
    c200.scale.setScalar(0.055);
    const cBox = new THREE.Box3().setFromObject(c200);
    const sticks = props.tripod(m, 1.22);
    sticks.position.set(1.75, 0, 0.45);
    scene.add(sticks);
    c200.position.set(1.75, 1.27 - cBox.min.y, 0.45);
    c200.lookAt(1.1, 0.95, -1.7);
    scene.add(c200);

    // ── Light ────────────────────────────────────────────────────────────
    const hemi = new THREE.HemisphereLight(0xfff2e0, 0x2a2018, 0.5);
    scene.add(hemi);
    // The sun comes through the window low and warm, from the left.
    const sun = new THREE.DirectionalLight(0xffb26b, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -4;
    sun.shadow.camera.right = 4;
    sun.shadow.camera.top = 4;
    sun.shadow.camera.bottom = -4;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 16;
    sun.shadow.bias = -0.0003;
    sun.shadow.normalBias = 0.035;
    sun.shadow.radius = 3;
    scene.add(sun, sun.target);
    // Window bounce: light that's come in and hit the floor.
    const bounce = new THREE.RectAreaLight(0xffd2a0, 0, 1.8, 1.3);
    bounce.position.set(ROOM.left + 0.02, 1.6, -0.6);
    bounce.lookAt(0, 1.2, -0.6);
    scene.add(bounce);
    // The laptop's own glow on the desk and the face of whoever's there.
    const screenGlow = new THREE.PointLight(0x9fb8ff, 0.25, 1.4, 2);
    scene.add(screenGlow);

    const lampWorld = new THREE.Vector3();
    lamp.group.updateMatrixWorld(true);
    lamp.bulb.getWorldPosition(lampWorld);
    lampLight.position.copy(lampWorld);
    lampLight.target.position.set(-1.1, deskY, -1.5);
    lampFill.position.copy(lampWorld).add(new THREE.Vector3(0, -0.05, 0.05));

    // ── The display, as geometry ─────────────────────────────────────────
    scene.updateMatrixWorld(true);
    // Where the painted texture actually lands. The display mesh carries more
    // than the picture (the corners under the bezel), so its bounds would lie.
    // Each vertex sits at origin + u·across + v·down; fit those three vectors
    // to the mesh by least squares and the texture's corners fall out exactly.
    const { origin, across, down } = (() => {
        const position = display.geometry.getAttribute("position");
        const uv = display.geometry.getAttribute("uv");
        const m = new THREE.Matrix3().set(0, 0, 0, 0, 0, 0, 0, 0, 0);
        const sums = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
        const point = new THREE.Vector3();
        const e = m.elements;
        for (let i = 0; i < position.count; i++) {
            point.fromBufferAttribute(position, i).applyMatrix4(display.matrixWorld);
            const f = [1, uv.getX(i), uv.getY(i)];
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) e[c * 3 + r] += f[r] * f[c];
                sums[r].addScaledVector(point, f[r]);
            }
        }
        const inverse = m.clone().invert().elements;
        const solve = (row: number) => new THREE.Vector3().addScaledVector(sums[0], inverse[row]).addScaledVector(sums[1], inverse[3 + row]).addScaledVector(sums[2], inverse[6 + row]);
        return { origin: solve(0), across: solve(1), down: solve(2) };
    })();
    // flipY is off, so v runs down the picture.
    const displayCenter = origin.clone().addScaledVector(across, 0.5).addScaledVector(down, 0.5);
    const panelWidth = across.length();
    const panelHeight = down.length();
    const normal = new THREE.Vector3().crossVectors(down, across).normalize();
    if (normal.z < 0) normal.negate();
    screenGlow.position.copy(displayCenter).addScaledVector(normal, 0.25);

    function screenShot(aspect: number, fit: "cover" | "contain"): Shot {
        const fov = 32;
        const tan = Math.tan(THREE.MathUtils.degToRad(fov / 2));
        // At the desk the display takes at most 86% of the height and 94% of
        // the width, leaving the bezel, a little desk, and room for a note.
        const byHeight = panelHeight / 2 / tan / (fit === "cover" ? 1 : 0.86);
        const byWidth = panelWidth / 2 / (tan * aspect) / (fit === "cover" ? 1 : 0.94);
        const distance = fit === "cover" ? Math.min(byHeight, byWidth) : Math.max(byHeight, byWidth);
        return {
            position: displayCenter.clone().addScaledVector(normal, distance),
            target: displayCenter.clone(),
            fov,
        };
    }

    const probe = new THREE.PerspectiveCamera();
    const corners = [origin, origin.clone().add(across), origin.clone().add(down), origin.clone().add(across).add(down)];
    function screenRect(shot: Shot, width: number, height: number) {
        probe.fov = shot.fov;
        probe.aspect = width / height;
        probe.near = 0.01;
        probe.far = 40;
        probe.position.copy(shot.position);
        probe.lookAt(shot.target);
        probe.updateProjectionMatrix();
        probe.updateMatrixWorld();
        const xs: number[] = [];
        const ys: number[] = [];
        for (const corner of corners) {
            const p = corner.clone().project(probe);
            xs.push(((p.x + 1) / 2) * width);
            ys.push(((1 - p.y) / 2) * height);
        }
        const left = Math.min(...xs);
        const top = Math.min(...ys);
        return { left, top, width: Math.max(...xs) - left, height: Math.max(...ys) - top };
    }

    const centerOf = (object: THREE.Object3D) => new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3());
    const anchors = {
        laptop: displayCenter.clone(),
        r7: centerOf(r7),
        piano: new THREE.Vector3(1.2, 0.85, ROOM.back + 0.45),
        trombone: centerOf(trombone),
        c200: centerOf(c200),
        prints: centerOf(printGroup),
        bag: centerOf(bag.group),
        rug: rug.position.clone(),
        shelf: centerOf(shelf),
    };

    // ── Hour of day ──────────────────────────────────────────────────────
    const sunColor = { day: new THREE.Color(0xffb46e), dusk: new THREE.Color(0xff7a4a), night: new THREE.Color(0x6f88c8) };
    const tmp = new THREE.Color();
    function light(daylight: number, lampOn: number) {
        paintSky(daylight);
        // daylight: 1 golden hour, 0.5 dusk, 0 night.
        if (daylight > 0.5) tmp.copy(sunColor.dusk).lerp(sunColor.day, (daylight - 0.5) * 2);
        else tmp.copy(sunColor.night).lerp(sunColor.dusk, daylight * 2);
        sun.color.copy(tmp);
        // The sun sinks as the evening goes; at night this is moonlight.
        const elevation = 0.2 + daylight * 0.2;
        const azimuth = 0.2 + daylight * 0.25;
        sun.target.position.set(-0.7, 0.6, -1.1);
        sun.position
            .set(-Math.cos(elevation) * Math.cos(azimuth), Math.sin(elevation), Math.cos(elevation) * Math.sin(azimuth))
            .multiplyScalar(7)
            .add(sun.target.position);
        sun.intensity = daylight > 0.25 ? 0.9 + Math.pow(daylight, 1.6) * 7.3 : 0.35 + daylight * 2.2;
        bounce.color.copy(tmp);
        bounce.intensity = 0.1 + daylight * 2.7;
        hemi.intensity = 0.02 + daylight * 0.5;
        scene.environmentIntensity = 0.02 + daylight * 0.33;
        lampLight.intensity = lampOn * 30;
        lampFill.intensity = lampOn * 2.5;
        (lamp.bulb.material as THREE.MeshStandardMaterial).emissiveIntensity = lampOn * 14;
        screenGlow.intensity = 0.15 + (1 - daylight) * 0.35;
        renderer.toneMappingExposure = 1.05 + (1 - daylight) * 0.15;
    }

    // Contact shadows where things meet: the thing that stops it reading as a render.
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const ao = new GTAOPass(scene, camera);
    ao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.5, thickness: 1, scale: 1.1 });
    composer.addPass(ao);
    composer.addPass(new OutputPass());
    // The room renders into a texture; the glass pass puts it on screen.
    composer.renderToScreen = false;
    owned.push(composer);
    const glass = createGlass();
    owned.push(glass);
    const present = () => glass.draw(renderer, composer.readBuffer.texture);
    const overlay = (layers: { lenses: Lens[]; scrims: Scrim[] }) => glass.set(layers, canvas.clientHeight, renderer.getPixelRatio());

    function resize() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        composer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
    resize();

    function render(shot: Shot, state: { screen: ScreenState; daylight: number; lamp: number; gallery?: boolean }) {
        screen.paint(state.screen);
        light(state.daylight, state.lamp);
        // The hall shows photographs as they are: no filmic tone curve squeezing
        // their colour, and no ambient occlusion greying the mats.
        renderer.toneMapping = state.gallery ? THREE.NoToneMapping : THREE.AgXToneMapping;
        ao.enabled = !state.gallery;
        camera.position.copy(shot.position);
        camera.fov = shot.fov;
        camera.updateProjectionMatrix();
        camera.lookAt(shot.target);
        composer.render();
        present();
    }

    function dispose() {
        scene.traverse((node) => {
            if (!(node instanceof THREE.Mesh)) return;
            node.geometry.dispose();
            for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
                for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose();
                material.dispose();
            }
        });
        for (const thing of owned) thing.dispose();
    }

        const ndc = new THREE.Vector2();
    function pickPhoto(x: number, y: number) {
        ndc.set((x / canvas.clientWidth) * 2 - 1, -(y / canvas.clientHeight) * 2 + 1);
        return gallery.pick(camera, ndc);
    }

    const rayFrom = new THREE.Raycaster();
    function pickStop(x: number, y: number) {
        ndc.set((x / canvas.clientWidth) * 2 - 1, -(y / canvas.clientHeight) * 2 + 1);
        rayFrom.setFromCamera(ndc, camera);
        const hit = rayFrom.intersectObject(rug, false)[0];
        return hit?.uv ? pathOnRug.stopAt(hit.uv) : -1;
    }
    const projected = new THREE.Vector3();
    const facing = new THREE.Vector3();
    function project(point: THREE.Vector3) {
        projected.copy(point).project(camera);
        // In front of the camera, and inside the frame.
        camera.getWorldDirection(facing);
        const ahead = facing.dot(point.clone().sub(camera.position)) > 0;
        return {
            x: ((projected.x + 1) / 2) * canvas.clientWidth,
            y: ((1 - projected.y) / 2) * canvas.clientHeight,
            visible: ahead && Math.abs(projected.x) < 0.95 && Math.abs(projected.y) < 0.95,
            ahead,
        };
    }

    return {
        screenShot,
        screenRect,
        anchors,
        render,
        overlay,
        present,
        gallery,
        pickPhoto,
        pickStop,
        showStop: (index: number) => pathOnRug.paint(index),
        openBag: (t: number) => bag.open(t),
        music,
        project,
        resize,
        dispose,
    };
}
