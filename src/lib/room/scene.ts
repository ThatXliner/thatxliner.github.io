import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { SMAAPass } from "three/addons/postprocessing/SMAAPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { loadModelLibrary } from "../gear/models";
import { lenses, bodies } from "../gear/catalog";
import * as props from "./props";
import { awardShelf, cameraBag, pathRug, type RugStop } from "./furnishings";
import { bookStack, curtain, pencil, pianoLamp, plant, sheetMusic, skirting } from "./details";
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
    gallery: Omit<Gallery, "load"> & { load(onEach: () => void): void };
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

/** The grade: how bright each source is, and how the picture is exposed. */
const LOOK = { sun: 7.6, bounce: 3.4, hemi: 0.32, env: 0.8, sky: 2.6, exposure: 0.9, nightLift: 0.35, bloom: 0.075, bloomAt: 5 };

/** A stand-in for the room, for reflections: warm walls, a dark floor, one bright window on the left. */
function reflectedRoom() {
    const scene = new THREE.Scene();
    const shell = new THREE.Mesh(new THREE.BoxGeometry(6, 3.2, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.13, 0.105, 0.085), side: THREE.BackSide }));
    scene.add(shell);
    const panel = (width: number, height: number, color: [number, number, number], place: (mesh: THREE.Mesh) => void) => {
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ color: new THREE.Color(...color), side: THREE.DoubleSide }));
        place(mesh);
        scene.add(mesh);
    };
    // The window, the ceiling it washes, the floor, and the paler wall opposite.
    panel(2.4, 1.5, [15, 10.5, 6.5], (mesh) => (mesh.position.set(-2.95, 0.3, -0.6), (mesh.rotation.y = Math.PI / 2)));
    panel(5.6, 5.6, [0.6, 0.54, 0.46], (mesh) => (mesh.position.set(0, 1.55, 0), (mesh.rotation.x = Math.PI / 2)));
    panel(5.6, 5.6, [0.16, 0.09, 0.05], (mesh) => (mesh.position.set(0, -1.55, 0), (mesh.rotation.x = Math.PI / 2)));
    panel(2.2, 1.2, [0.55, 0.47, 0.4], (mesh) => (mesh.position.set(1, 0.2, 2.95), (mesh.rotation.y = Math.PI)));
    return scene;
}

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
    const toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMapping = toneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    // A phone gets smaller shadow maps and lighter anti-aliasing; the room is the same.
    const small = Math.min(innerWidth, innerHeight) < 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050506);
    const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 40);

    // What the room's surfaces reflect: a warm box with one bright window in
    // its left wall, like the room itself. It's what puts the window in the
    // piano's lacquer and the brass.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(reflectedRoom(), 0.03).texture;
    pmrem.dispose();
    scene.environment = envMap;

    const m = props.materials();
    const owned: { dispose(): void }[] = [envMap, renderer];

    // ── Shell ────────────────────────────────────────────────────────────
    const plaster = props.plasterTexture(31);
    plaster.repeat.set(3, 3);
    owned.push(plaster);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xe4dccf, roughness: 0.94 });
    // The tooth of the plaster goes on the one unbroken wall. On the pieces
    // around doors and the window it would stretch across their narrow ends.
    const backWallMat = wallMat.clone();
    backWallMat.bumpMap = plaster;
    backWallMat.bumpScale = 0.35;
    // Oak boards, twelve to the texture and a little over two textures across the room.
    const floorMat = props.wood("#8a623f", "#3d2412", 7, { planks: 12, repeat: 2.6, roughness: 0.62, bump: 1.2 });
    const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xece7de, roughness: 1 });
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

    const back = new THREE.Mesh(new THREE.PlaneGeometry(width, ROOM.height), backWallMat);
    back.position.set(0, ROOM.height / 2, ROOM.back);
    back.receiveShadow = true;
    scene.add(back);

    // Skirting boards, wherever a wall meets the floor and there's no door.
    const trim = new THREE.MeshStandardMaterial({ color: 0xf1ece3, roughness: 0.6 });
    for (const [a, b] of [
        [[ROOM.left, ROOM.back + 0.007], [ROOM.right, ROOM.back + 0.007]],
        [[ROOM.left + 0.007, ROOM.back], [ROOM.left + 0.007, MUSIC_DOOR.z0 - 0.06]],
        [[ROOM.left + 0.007, MUSIC_DOOR.z1 + 0.06], [ROOM.left + 0.007, ROOM.front]],
        [[ROOM.right - 0.007, ROOM.back], [ROOM.right - 0.007, DOOR.z0 - 0.06]],
        [[ROOM.right - 0.007, DOOR.z1 + 0.06], [ROOM.right - 0.007, ROOM.front]],
    ] as [[number, number], [number, number]][])
        scene.add(skirting(a, b, trim));

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
    const casing = trim;
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
    const sill = props.rounded(0.3, 0.032, win.z1 - win.z0 + 0.12, 0.006, trim);
    sill.position.set(ROOM.left - 0.02, win.y0, (win.z0 + win.z1) / 2);
    sill.castShadow = sill.receiveShadow = true;
    scene.add(sill);
    // The sash: a frame round the opening, one mullion, one transom.
    const sashAt = ROOM.left - 0.09;
    const sash = (height: number, length: number, y: number, z: number) => {
        const bar = props.rounded(0.045, height, length, 0.004, trim);
        bar.position.set(sashAt, y, z);
        bar.castShadow = bar.receiveShadow = true;
        scene.add(bar);
    };
    const winMid = { y: (win.y0 + win.y1) / 2, z: (win.z0 + win.z1) / 2 };
    for (const z of [win.z0 + 0.0225, winMid.z, win.z1 - 0.0225]) sash(win.y1 - win.y0, z === winMid.z ? 0.035 : 0.045, winMid.y, z);
    for (const y of [win.y0 + 0.035, win.y0 + (win.y1 - win.y0) * 0.62, win.y1 - 0.0225]) sash(y === win.y1 - 0.0225 || y === win.y0 + 0.035 ? 0.045 : 0.03, win.z1 - win.z0, y, winMid.z);
    // Linen curtains, drawn back to either side on a thin rail.
    const rail = props.tube([[ROOM.left + 0.07, win.y1 + 0.16, win.z0 - 0.42], [ROOM.left + 0.07, win.y1 + 0.16, win.z1 + 0.36]], 0.008, m.blackMetal);
    rail.castShadow = true;
    scene.add(rail);
    const drapes = [curtain(0.5, win.y1 + 0.14, 3), curtain(0.42, win.y1 + 0.14, 9)];
    drapes[0].mesh.position.set(ROOM.left + 0.07, win.y1 + 0.16, win.z0 - 0.17);
    drapes[1].mesh.position.set(ROOM.left + 0.07, win.y1 + 0.16, win.z1 + 0.13);
    for (const drape of drapes) scene.add(drape.mesh);

    // The sky outside: a gradient card that changes with the hour.
    const skyCanvas = document.createElement("canvas");
    skyCanvas.width = 256;
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
        g.fillRect(0, 0, 256, 256);
        // Far hills and a nearer line of trees, soft, as through old glass.
        g.filter = "blur(3px)";
        for (const [base, rise, tone, alpha] of [[178, 9, "#5b5a78", 0.5], [192, 14, "#2c3440", 0.72]] as const) {
            g.fillStyle = blend("#04060a", tone, 0.12 + daylight * 0.88);
            g.globalAlpha = alpha;
            g.beginPath();
            g.moveTo(-8, 264);
            for (let x = -8; x <= 264; x += 4) g.lineTo(x, base - rise * (0.5 + 0.5 * Math.sin(x * 0.045 + base)) - rise * 0.4 * Math.sin(x * 0.19 + rise));
            g.lineTo(264, 264);
            g.fill();
        }
        g.globalAlpha = 1;
        g.filter = "none";
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
    const desk = props.desk(props.wood("#a57c54", "#55331a", 3, { roughness: 0.52, bump: 0.5, repeat: 0.62, offset: 0.5 }), m.blackMetal);
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
    lampLight.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
    // The lamp sits against the left wall, so its light skims along it. Without a
    // normal bias the wall shades itself in stair-steps ("shadow acne").
    lampLight.shadow.bias = -0.0008;
    lampLight.shadow.normalBias = 0.03;
    lampLight.shadow.camera.near = 0.05;
    lampLight.shadow.radius = 5;
    scene.add(lampLight, lampLight.target);
    const lampFill = new THREE.PointLight(0xffb070, 0, 6, 1.4);
    scene.add(lampFill);

    const coffee = props.mug();
    coffee.position.set(-0.5, deskY, -1.86);
    scene.add(coffee);

    // A day's worth of things left about: books and a pencil by the lamp,
    // a rubber plant in the window's light.
    const books = bookStack([
        { color: 0x2b3f58, width: 0.23, depth: 0.165, thick: 0.03, turn: 0.04 },
        { color: 0xb9a688, width: 0.21, depth: 0.15, thick: 0.022, turn: -0.09 },
        { color: 0x7a2f26, width: 0.19, depth: 0.13, thick: 0.017, turn: 0.12 },
    ]);
    books.group.position.set(-1.58, deskY, -1.47);
    books.group.rotation.y = 0.22;
    scene.add(books.group);
    const left = pencil();
    left.position.set(-1.57, deskY + books.height, -1.46);
    left.rotation.y = 0.9;
    scene.add(left);
    const fig = plant();
    fig.position.set(-1.98, 0, -1.86);
    fig.rotation.y = 0.6;
    scene.add(fig);

    // On the piano: music open on the desk, and a brass lamp over it.
    const music88 = sheetMusic();
    music88.position.set(1.2, 0.97 + 0.136, ROOM.back + 0.3 + 0.03);
    music88.rotation.x = -0.05;
    scene.add(music88);
    const pianoLight = pianoLamp(m);
    pianoLight.group.position.set(1.2, 1.285, ROOM.back + 0.3 - 0.2);
    scene.add(pianoLight.group);
    const pianoGlow = new THREE.SpotLight(0xffc58a, 0, 2.4, 1.05, 0.85, 1.6);
    scene.add(pianoGlow, pianoGlow.target);

    // A camera bag on the floor under the desk, lid shut until it's asked for.
    const bag = cameraBag(m);
    bag.group.position.set(-1.12, 0, -1.62);
    bag.group.rotation.y = 0.12;
    scene.add(bag.group);

    // Two floating shelves of awards on the right wall, between the piano and the gallery door.
    const shelf = awardShelf(m, props.wood("#5a3a22", "#24140a", 13, { roughness: 0.58, bump: 0.5 }));
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
    const hemi = new THREE.HemisphereLight(0xfff0dc, 0x3a2414, 0.2);
    scene.add(hemi);
    // The sun comes through the window low and warm, from the left.
    const sun = new THREE.DirectionalLight(0xffb26b, 6);
    sun.castShadow = true;
    // Fitted to the room, so the window's bars land on the wall with an edge.
    sun.shadow.mapSize.set(small ? 2048 : 4096, small ? 2048 : 4096);
    sun.shadow.camera.left = -3.4;
    sun.shadow.camera.right = 3.4;
    sun.shadow.camera.top = 2.6;
    sun.shadow.camera.bottom = -2.6;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 13;
    sun.shadow.bias = -0.0002;
    sun.shadow.normalBias = 0.02;
    sun.shadow.radius = 2.2;
    // Nothing in the room moves on its own, so a shadow map is good until its
    // light moves or the bag's lid does. Redrawing the room into both maps on
    // every frame was the larger part of the frame.
    sun.shadow.autoUpdate = lampLight.shadow.autoUpdate = false;
    sun.shadow.needsUpdate = lampLight.shadow.needsUpdate = true;
    let sunAt = -1;
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
    pianoLight.group.updateMatrixWorld(true);
    pianoLight.glow.getWorldPosition(pianoGlow.position);
    pianoGlow.target.position.set(1.2, 0.7, ROOM.back + 0.62);

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
    const sunColor = { day: new THREE.Color(0xffb46e), dusk: new THREE.Color(0xffb893), night: new THREE.Color(0x6f88c8) };
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
        if (daylight !== sunAt) sun.shadow.needsUpdate = true;
        sunAt = daylight;
        sun.intensity = daylight > 0.25 ? 0.9 + Math.pow(daylight, 1.6) * LOOK.sun : 0.35 + daylight * 2.2;
        bounce.color.copy(tmp);
        bounce.intensity = 0.1 + daylight * LOOK.bounce;
        hemi.intensity = 0.03 + daylight * LOOK.hemi;
        // After dark the lamps are what the lacquer and brass have to reflect.
        scene.environmentIntensity = 0.05 + daylight * LOOK.env + lampOn * 0.1;
        // Outside is far brighter than in: by day the window burns out, as it would on film.
        (sky.material as THREE.MeshBasicMaterial).color.setScalar(1 + Math.pow(daylight, 2) * LOOK.sky);
        for (const drape of drapes) drape.material.emissiveIntensity = Math.pow(daylight, 1.5) * 0.28;
        lampLight.intensity = lampOn * 22;
        lampFill.intensity = lampOn * 2.5;
        (lamp.bulb.material as THREE.MeshStandardMaterial).emissiveIntensity = lampOn * 14;
        pianoGlow.intensity = lampOn * 3.5;
        (pianoLight.glow.material as THREE.MeshStandardMaterial).emissiveIntensity = lampOn * 10;
        screenGlow.intensity = 0.15 + (1 - daylight) * 0.35;
        renderer.toneMappingExposure = LOOK.exposure + (1 - daylight) * LOOK.nightLift;
    }

    // Contact shadows where things meet: the thing that stops it reading as a render.
    // The room is drawn with its depth kept, so the occlusion pass can read it
    // rather than draw two million triangles a second time to find it out.
    const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthTexture: new THREE.DepthTexture(1, 1) }));
    composer.addPass(new RenderPass(scene, camera));
    const ao = new GTAOPass(scene, camera);
    ao.setGBuffer(composer.readBuffer.depthTexture!);
    ao.updateGtaoMaterial({ radius: 0.3, distanceExponent: 1.4, thickness: 1, scale: 1.05, samples: 12 });
    // A wide denoise: grain in the occlusion is what gives a real-time render away.
    ao.updatePdMaterial({ radius: 10, rings: 3, samples: 12, depthPhi: 2, normalPhi: 3, lumaPhi: 10 });
    composer.addPass(ao);
    // A little halation round whatever's brighter than the walls: the window, a bulb, a glint on brass.
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), LOOK.bloom, 0.35, LOOK.bloomAt);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    // Edges are smoothed last, on the finished picture, so the occlusion and the
    // geometry agree about where every edge is.
    composer.addPass(new SMAAPass());
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
        const ratio = renderer.getPixelRatio();
        composer.setPixelRatio(ratio);
        composer.setSize(width, height);
        // Occlusion is worked out at half size, which costs a quarter. The
        // denoise that follows runs at full size and weighs by depth, so it
        // doubles as the upscale and edges stay where they are.
        const half = [Math.ceil((width * ratio) / 2), Math.ceil((height * ratio) / 2)] as const;
        ao.gtaoRenderTarget.setSize(...half);
        ao.gtaoMaterial.uniforms.resolution.value.set(...half);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
    resize();

    const frustum = new THREE.Frustum();
    const viewProjection = new THREE.Matrix4();
    const galleryDoorway = new THREE.Box3(new THREE.Vector3(ROOM.right - 0.05, 0, DOOR.z0), new THREE.Vector3(ROOM.right + 0.2, DOOR.height, DOOR.z1));
    const musicDoorway = new THREE.Box3(new THREE.Vector3(ROOM.left - 0.2, 0, MUSIC_DOOR.z0), new THREE.Vector3(ROOM.left + 0.05, MUSIC_DOOR.height, MUSIC_DOOR.z1));
    /**
     * The other rooms are only drawn when you could see into them: with their
     * doorway in frame, or from inside. (And whenever a shadow map is redrawn,
     * so the maps never depend on where the camera happened to be.)
     */
    function cull() {
        camera.updateMatrixWorld();
        frustum.setFromProjectionMatrix(viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
        const mapping = sun.shadow.needsUpdate || lampLight.shadow.needsUpdate;
        gallery.group.visible = mapping || camera.position.x > ROOM.right - 0.4 || frustum.intersectsBox(galleryDoorway);
        music.group.visible = mapping || camera.position.x < ROOM.left + 0.4 || frustum.intersectsBox(musicDoorway);
    }
    function render(shot: Shot, state: { screen: ScreenState; daylight: number; lamp: number; gallery?: boolean }) {
        screen.paint(state.screen);
        light(state.daylight, state.lamp);
        // The hall shows photographs as they are: no filmic tone curve squeezing
        // their colour, and no ambient occlusion greying the mats.
        renderer.toneMapping = state.gallery ? THREE.NoToneMapping : toneMapping;
        ao.enabled = bloom.enabled = !state.gallery;
        camera.position.copy(shot.position);
        camera.fov = shot.fov;
        camera.updateProjectionMatrix();
        camera.lookAt(shot.target);
        cull();
        // The composer's two buffers trade places; the depth to read is in whichever is drawn into next.
        ao.gtaoMaterial.uniforms.tDepth.value = ao.pdMaterial.uniforms.tDepth.value = composer.readBuffer.depthTexture;
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

    // Build every shader and send every texture to the card now, behind the
    // loading screen, so nothing has to be made the first time it's looked at.
    scene.traverse((node) => {
        if (!(node instanceof THREE.Mesh)) return;
        for (const material of Array.isArray(node.material) ? node.material : [node.material])
            for (const value of Object.values(material)) if (value instanceof THREE.Texture && value.image) renderer.initTexture(value);
    });
    await renderer.compileAsync(scene, camera);

    return {
        screenShot,
        screenRect,
        anchors,
        render,
        overlay,
        present,
        gallery: {
            ...gallery,
            load: (onEach: () => void) =>
                gallery.load((texture) => {
                    renderer.initTexture(texture);
                    onEach();
                }),
        },
        pickPhoto,
        pickStop,
        showStop: (index: number) => pathOnRug.paint(index),
        openBag: (t: number) => {
            bag.open(t);
            sun.shadow.needsUpdate = lampLight.shadow.needsUpdate = true;
        },
        music,
        project,
        resize,
        dispose,
    };
}
