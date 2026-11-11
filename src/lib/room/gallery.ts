import * as THREE from "three";
import { canvasTexture } from "./props";

/**
 * The gallery: a long, quiet hall through a door in the room's right wall,
 * every photograph hung along one wall in two staggered rows, in the order
 * /photography shows them. You walk it by scrolling.
 *
 * Nothing here is lit by the room's lights. A gallery is evenly lit on
 * purpose, and photographs should keep their colours whatever the hour is
 * in the room next door, so the walls carry their light painted in (a soft
 * pool above each frame) and the photographs are shown exactly as they are.
 */

export interface GalleryPhoto {
    thumb: string;
    aspect: number;
}

/** Where the hall meets the room: a doorway in the room's right wall. */
export const DOOR = { x: 2.2, z0: 0.95, z1: 1.95, height: 2.15 };

const HALL = { z0: -0.35, z1: 3.05, height: 3 };
/** The wall the photographs hang on faces +Z; you walk along it at this distance. */
const VIEW = { z: 2.6, y: 1.58 };
const PHOTO_H = 0.52;
const ROWS = [2.04, 1.12];
const GAP = 0.34;
const MARGIN = 1.1;

const blank = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
blank.colorSpace = THREE.SRGBColorSpace;
blank.needsUpdate = true;

function framedPhoto(aspect: number) {
    const group = new THREE.Group();
    const w = PHOTO_H * aspect;
    const mat = PHOTO_H * 0.12;
    const outerW = w + mat * 2 + 0.03;
    const outerH = PHOTO_H + mat * 2 + 0.03;
    // A soft shadow down and right of the frame, as if lit from above-left.
    const spread = 0.08;
    const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(outerW + spread * 2, outerH + spread * 2),
        new THREE.MeshBasicMaterial({ map: shadowTexture(outerW, outerH, spread), transparent: true, depthWrite: false, toneMapped: false }),
    );
    shadow.position.set(0.012, -0.025, 0.001);
    group.add(shadow);
    // Unlit, so the moulding's depth is painted in: its sides a shade lighter than its face.
    const side = new THREE.MeshBasicMaterial({ color: 0x3a3a3a, toneMapped: false });
    const face = new THREE.MeshBasicMaterial({ color: 0x161616, toneMapped: false });
    const moulding = new THREE.Mesh(new THREE.BoxGeometry(outerW, outerH, 0.03), [side, side, side, side, face, face]);
    moulding.position.z = 0.015;
    group.add(moulding);
    const matBoard = new THREE.Mesh(new THREE.PlaneGeometry(w + mat * 2, PHOTO_H + mat * 2), new THREE.MeshBasicMaterial({ color: 0xf1eee7, toneMapped: false }));
    matBoard.position.z = 0.0305;
    group.add(matBoard);
    // Blank until its photograph arrives; the stand-in map means that swap needs no new shader.
    const photo = new THREE.Mesh(new THREE.PlaneGeometry(w, PHOTO_H), new THREE.MeshBasicMaterial({ color: 0x2a2a2c, map: blank, toneMapped: false }));
    photo.position.z = 0.031;
    group.add(photo);
    return { group, photo, width: outerW };
}

/** A soft drop shadow for one frame: its rectangle, blurred, on a plane `spread` larger each side. */
function shadowTexture(width: number, height: number, spread: number) {
    const scale = 400; // texture pixels per metre
    const w = Math.round((width + spread * 2) * scale);
    const h = Math.round((height + spread * 2) * scale);
    return canvasTexture(w, h, (g) => {
        // Draw the rectangle far off the canvas and let only its blurred shadow land here.
        const away = w + h;
        g.shadowColor = "rgba(0,0,0,0.3)";
        g.shadowBlur = spread * scale * 0.55;
        g.shadowOffsetX = away;
        g.fillStyle = "#000";
        g.fillRect(spread * scale - away, spread * scale, width * scale, height * scale);
    });
}

/**
 * Some of the photographs carry a white border in the file itself. On a wall
 * that reads as a second mat, so find it (rows and columns that are flat and
 * near-white, from each edge in) and return the fraction to crop from each side.
 */
function whiteBorder(image: CanvasImageSource) {
    const size = 160;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const g = canvas.getContext("2d", { willReadFrequently: true })!;
    g.drawImage(image, 0, 0, size, size);
    const pixels = g.getImageData(0, 0, size, size).data;
    const white = (x: number, y: number) => {
        const i = (y * size + x) * 4;
        return pixels[i] > 238 && pixels[i + 1] > 238 && pixels[i + 2] > 238;
    };
    const line = (fixed: number, vertical: boolean) => {
        let count = 0;
        for (let k = 0; k < size; k++) if (vertical ? white(fixed, k) : white(k, fixed)) count++;
        return count > size * 0.94;
    };
    const scan = (vertical: boolean, from: number, step: number) => {
        let n = 0;
        while (n < size * 0.3 && line(from + n * step, vertical)) n++;
        // A thin white line inside a photograph isn't a border.
        return n >= 2 ? (n + 0.5) / size : 0;
    };
    return { left: scan(true, 0, 1), right: scan(true, size - 1, -1), top: scan(false, 0, 1), bottom: scan(false, size - 1, -1) };
}

export function createGallery(photos: GalleryPhoto[]) {
    const group = new THREE.Group();
    const meshes: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];
    const centres: number[] = [];

    // Hang them: each photograph goes on whichever row has more room left,
    // so the two rows stay staggered and the order still reads left to right.
    const cursor = ROWS.map(() => DOOR.x + MARGIN);
    photos.forEach((photo, i) => {
        const row = cursor[0] <= cursor[1] + 0.25 ? 0 : 1;
        const framed = framedPhoto(photo.aspect);
        const x = cursor[row] + framed.width / 2;
        framed.group.position.set(x, ROWS[row], HALL.z0 + 0.002);
        group.add(framed.group);
        framed.photo.userData.index = i;
        meshes.push(framed.photo);
        centres.push(x);
        cursor[row] += framed.width + GAP;
    });
    const end = Math.max(...cursor) + MARGIN;
    const length = end - DOOR.x;

    // The hall: walls, floor and ceiling, all carrying painted light.
    const wallTex = canvasTexture(4096, 512, (g) => {
        g.fillStyle = "#e6e4df";
        g.fillRect(0, 0, 4096, 512);
        // A wash from the ceiling down.
        const wash = g.createLinearGradient(0, 0, 0, 512);
        wash.addColorStop(0, "rgba(255,252,246,0.25)");
        wash.addColorStop(0.55, "rgba(0,0,0,0)");
        wash.addColorStop(1, "rgba(60,50,40,0.18)");
        g.fillStyle = wash;
        g.fillRect(0, 0, 4096, 512);
        // A pool of warm light over every frame.
        for (const x of centres) {
            const px = ((x - DOOR.x) / length) * 4096;
            const pool = g.createRadialGradient(px, 150, 10, px, 200, 220);
            pool.addColorStop(0, "rgba(255,248,236,0.28)");
            pool.addColorStop(1, "rgba(255,248,236,0)");
            g.fillStyle = pool;
            g.fillRect(px - 260, 0, 520, 512);
        }
    });
    const plain = (color: number) => new THREE.MeshBasicMaterial({ color, toneMapped: false });
    const photoWall = new THREE.Mesh(new THREE.PlaneGeometry(length, HALL.height), new THREE.MeshBasicMaterial({ map: wallTex, toneMapped: false }));
    photoWall.position.set(DOOR.x + length / 2, HALL.height / 2, HALL.z0);
    group.add(photoWall);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(length, HALL.height), plain(0xd9d5cd));
    back.rotation.y = Math.PI;
    back.position.set(DOOR.x + length / 2, HALL.height / 2, HALL.z1);
    group.add(back);
    const farEnd = new THREE.Mesh(new THREE.PlaneGeometry(HALL.z1 - HALL.z0, HALL.height), plain(0xdcd8d0));
    farEnd.rotation.y = -Math.PI / 2;
    farEnd.position.set(end, HALL.height / 2, (HALL.z0 + HALL.z1) / 2);
    group.add(farEnd);
    const floorTex = canvasTexture(1024, 256, (g) => {
        const gradient = g.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, "#5a5249");
        gradient.addColorStop(1, "#3b352f");
        g.fillStyle = gradient;
        g.fillRect(0, 0, 1024, 256);
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(length, HALL.z1 - HALL.z0), new THREE.MeshBasicMaterial({ map: floorTex, toneMapped: false }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(DOOR.x + length / 2, 0.001, (HALL.z0 + HALL.z1) / 2);
    group.add(floor);
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(length, HALL.z1 - HALL.z0), plain(0xf2efe9));
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(DOOR.x + length / 2, HALL.height, (HALL.z0 + HALL.z1) / 2);
    group.add(ceiling);
    // The hall's own end wall, around the door, seen from inside the gallery.
    const doorSide = plain(0xdcd8d0);
    const piece = (z0: number, z1: number, y0: number, y1: number) => {
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(z1 - z0, y1 - y0), doorSide);
        mesh.rotation.y = Math.PI / 2;
        mesh.position.set(DOOR.x + 0.09, (y0 + y1) / 2, (z0 + z1) / 2);
        group.add(mesh);
    };
    piece(HALL.z0, DOOR.z0, 0, HALL.height);
    piece(DOOR.z1, HALL.z1, 0, HALL.height);
    piece(DOOR.z0, DOOR.z1, DOOR.height, HALL.height);

    const firstX = DOOR.x + MARGIN + 0.9;
    const lastX = end - MARGIN - 0.9;
    /** Standing in the gallery, `t` of the way along the wall. */
    function walk(t: number, portrait: boolean) {
        const x = firstX + (lastX - firstX) * t;
        return {
            // A phone sees a narrow slice, so it stands back with a wider lens
            // to take in a full column: one photograph from each row.
            position: new THREE.Vector3(x, VIEW.y, portrait ? HALL.z1 - 0.15 : VIEW.z),
            // Dead level and square-on, so every frame edge is truly vertical: a hair
            // of tilt shows as a one-pixel jog down the side of each frame.
            target: new THREE.Vector3(x, VIEW.y, HALL.z0),
            fov: portrait ? 60 : 40,
        };
    }
    /** How far along the walk a photograph sits, to stop in front of it. */
    const at = (index: number) => THREE.MathUtils.clamp((centres[index] - firstX) / (lastX - firstX), 0, 1);
    /** The photograph you're standing nearest to. */
    function nearest(t: number) {
        const x = firstX + (lastX - firstX) * t;
        let best = 0;
        centres.forEach((c, i) => {
            if (Math.abs(c - x) < Math.abs(centres[best] - x)) best = i;
        });
        return best;
    }

    // Photographs load once the room is up.
    let loading = false;
    function load(onEach: (texture: THREE.Texture) => void) {
        if (loading) return;
        loading = true;
        // Hanging the hall must never cost the room a frame: each photograph is
        // decoded off the main thread, and goes up one at a time, between frames.
        const pending: (() => void)[] = [];
        let draining = false;
        const idle = (run: () => void) => ("requestIdleCallback" in window ? requestIdleCallback(run, { timeout: 400 }) : setTimeout(run, 60));
        const drain = () => {
            const next = pending.shift();
            if (!next) return void (draining = false);
            next();
            idle(drain);
        };
        photos.forEach(async (photo, i) => {
            try {
                const blob = await (await fetch(photo.thumb)).blob();
                // WebGL wants the first row at the bottom; a bitmap has to be made that way.
                const [bitmap, probe] = await Promise.all([createImageBitmap(blob, { imageOrientation: "flipY" }), createImageBitmap(blob, { resizeWidth: 160, resizeHeight: 160 })]);
                pending.push(() => {
                    const texture = new THREE.Texture(bitmap);
                    texture.flipY = false;
                    texture.colorSpace = THREE.SRGBColorSpace;
                    texture.anisotropy = 8;
                    texture.needsUpdate = true;
                    // Crop a built-in white border and keep the picture's shape inside the mat.
                    const border = whiteBorder(probe);
                    probe.close();
                    const keepX = 1 - border.left - border.right;
                    const keepY = 1 - border.top - border.bottom;
                    if (keepX < 1 || keepY < 1) {
                        texture.offset.set(border.left, border.bottom);
                        texture.repeat.set(keepX, keepY);
                        const fit = 1 / Math.max(keepX, keepY);
                        meshes[i].scale.set(keepX * fit, keepY * fit, 1);
                    }
                    meshes[i].material.map = texture;
                    meshes[i].material.color.set(0xffffff);
                    onEach(texture);
                });
                if (!draining) {
                    draining = true;
                    idle(drain);
                }
            } catch (error) {
                console.error(error);
            }
        });
    }

    const raycaster = new THREE.Raycaster();
    function pick(camera: THREE.Camera, ndc: THREE.Vector2) {
        raycaster.setFromCamera(ndc, camera);
        const hit = raycaster.intersectObjects(meshes, false)[0];
        return hit ? (hit.object.userData.index as number) : -1;
    }

    /** Standing in the doorway, looking down the hall: the bridge between the two rooms. */
    const doorway = {
        outside: { position: new THREE.Vector3(1.15, 1.6, (DOOR.z0 + DOOR.z1) / 2), target: new THREE.Vector3(3.2, 1.55, (DOOR.z0 + DOOR.z1) / 2), fov: 44 },
        inside: { position: new THREE.Vector3(DOOR.x + 0.9, 1.6, 1.75), target: new THREE.Vector3(DOOR.x + 2.6, 1.6, 0.4), fov: 42 },
    };

    return { group, walk, at, nearest, load, pick, doorway, count: photos.length, span: lastX - firstX };
}

export type Gallery = ReturnType<typeof createGallery>;
