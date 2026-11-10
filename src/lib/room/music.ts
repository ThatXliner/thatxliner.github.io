import * as THREE from "three";
import { box, rounded, tube, woodTexture, type Materials } from "./props";

/**
 * The music room, through a door in the main room's left wall: a DJ desk
 * with two decks and a mixer, monitors on stands, a crate of records, and the
 * releases framed on the wall. The records carry the real cover art, from the
 * same lookup the page uses for its links.
 *
 * It's a small dark room lit by its own two lamps and a warm LED strip.
 * Its walls cast shadows, so the main room's moonlight stays outside.
 */

export const MUSIC_DOOR = { x: -2.2, z0: 0.75, z1: 1.75, height: 2.15 };
const ROOM = { x0: -6, x1: -2.2, z0: 0.5, z1: 3.6, height: 2.7 };

export interface Release {
    title: string;
    artwork: string;
}

export function createMusicRoom(m: Materials, releases: Release[]) {
    const group = new THREE.Group();
    const add = <T extends THREE.Object3D>(o: T) => (group.add(o), o);
    const width = ROOM.x1 - ROOM.x0;
    const depth = ROOM.z1 - ROOM.z0;
    const cx = (ROOM.x0 + ROOM.x1) / 2;
    const cz = (ROOM.z0 + ROOM.z1) / 2;

    // Shell: dark walls, a wood floor, acoustic panels on the far wall.
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a2c31, roughness: 0.95 });
    const floorTex = woodTexture("#4a3424", "#1d120a", 21, 10);
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(1.6, 1.6);
    const slab = (w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material = wallMat) => {
        const mesh = add(box(w, h, d, material, x, y, z));
        mesh.castShadow = mesh.receiveShadow = true;
        return mesh;
    };
    slab(width, 0.04, depth, cx, -0.02, cz, new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.6 }));
    slab(width, 0.04, depth, cx, ROOM.height + 0.02, cz, new THREE.MeshStandardMaterial({ color: 0x1f2024, roughness: 1 }));
    slab(0.12, ROOM.height, depth, ROOM.x0 - 0.06, ROOM.height / 2, cz); // far wall
    slab(width, ROOM.height, 0.12, cx, ROOM.height / 2, ROOM.z0 - 0.06); // north
    slab(width, ROOM.height, 0.12, cx, ROOM.height / 2, ROOM.z1 + 0.06); // south
    const panel = new THREE.MeshStandardMaterial({ color: 0x3a3d44, roughness: 1 });
    for (let row = 0; row < 3; row++)
        for (let col = 0; col < 5; col++)
            slab(0.05, 0.5, 0.5, ROOM.x0 + 0.03, 1.15 + row * 0.56, ROOM.z0 + 0.45 + col * 0.56, panel);

    // LED strip along the far wall, under the ceiling: an emissive bar that
    // reads as a glow, with a real light doing the lighting.
    const led = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffa04a, emissiveIntensity: 2.2 });
    add(box(0.02, 0.02, depth - 0.2, led, ROOM.x0 + 0.02, ROOM.height - 0.08, cz));
    const ledBlue = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x5a7dff, emissiveIntensity: 1.6 });
    add(box(width - 0.2, 0.02, 0.02, ledBlue, cx, ROOM.height - 0.08, ROOM.z1 - 0.02));

    // The DJ desk, against the far wall.
    const deskZ = (ROOM.z0 + ROOM.z1) / 2;
    const deskX = ROOM.x0 + 0.45;
    const top = 0.92;
    const walnut = new THREE.MeshStandardMaterial({ map: woodTexture("#5a3a22", "#24140a", 8), roughness: 0.5 });
    add(rounded(0.7, 0.04, 1.9, 0.006, walnut)).position.set(deskX, top - 0.02, deskZ);
    for (const dz of [-0.85, 0.85]) slab(0.62, top - 0.04, 0.04, deskX, (top - 0.04) / 2, deskZ + dz, m.blackMetal);

    const record = (artwork: THREE.Texture | null) => {
        const disc = new THREE.Group();
        disc.add(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.004, 64), new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.35 })));
        const label = new THREE.Mesh(new THREE.CircleGeometry(0.05, 48), new THREE.MeshStandardMaterial({ map: artwork, color: artwork ? 0xffffff : 0xc8742f, roughness: 0.6 }));
        label.rotation.x = -Math.PI / 2;
        label.position.y = 0.0025;
        disc.add(label);
        return disc;
    };
    const deck = (artwork: THREE.Texture | null) => {
        const d = new THREE.Group();
        d.add(rounded(0.36, 0.08, 0.46, 0.01, new THREE.MeshStandardMaterial({ color: 0x1c1c1f, metalness: 0.3, roughness: 0.4 }))).position.y = 0.04;
        const platter = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.02, 64), m.nickel);
        platter.position.set(0, 0.09, -0.03);
        d.add(platter);
        const disc = record(artwork);
        disc.position.set(0, 0.102, -0.03);
        d.add(disc);
        // Tonearm.
        d.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 20), m.nickel)).position.set(0.13, 0.095, 0.15);
        d.add(tube([[0.13, 0.115, 0.15], [0.12, 0.115, 0.02], [0.07, 0.115, -0.08]], 0.004, m.nickel));
        d.add(box(0.02, 0.008, 0.035, m.blackMetal, 0.065, 0.112, -0.095));
        // Pitch fader.
        d.add(box(0.02, 0.004, 0.12, m.blackMetal, 0.15, 0.081, -0.08));
        return { group: d, disc };
    };
    const left = deck(null);
    const right = deck(null);
    left.group.position.set(deskX, top, deskZ - 0.52);
    right.group.position.set(deskX, top, deskZ + 0.52);
    left.group.rotation.y = right.group.rotation.y = -Math.PI / 2;
    add(left.group);
    add(right.group);
    // Mixer between them: a slab, a crossfader, and rows of knobs.
    const mixer = new THREE.Group();
    mixer.add(rounded(0.3, 0.07, 0.4, 0.01, new THREE.MeshStandardMaterial({ color: 0x232327, metalness: 0.3, roughness: 0.4 }))).position.y = 0.035;
    for (let r = 0; r < 4; r++)
        for (let c = 0; c < 2; c++) {
            const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.018, 16), r === 0 ? m.brass : m.nickel);
            knob.position.set(-0.06 + c * 0.12, 0.08, -0.13 + r * 0.06);
            mixer.add(knob);
        }
    mixer.add(box(0.12, 0.004, 0.012, m.blackMetal, 0, 0.072, 0.15));
    mixer.add(box(0.016, 0.014, 0.022, m.nickel, 0.02, 0.08, 0.15));
    mixer.position.set(deskX, top, deskZ);
    mixer.rotation.y = -Math.PI / 2;
    add(mixer);
    // Headphones resting on the desk.
    const cans = tube([[0, 0, -0.08], [0, 0.09, -0.06], [0, 0.11, 0], [0, 0.09, 0.06], [0, 0, 0.08]], 0.008, m.blackMetal);
    cans.position.set(deskX + 0.22, top + 0.03, deskZ + 0.95);
    cans.rotation.z = Math.PI / 2;
    add(cans);

    // Monitors on stands, either side of the desk, angled in.
    for (const side of [-1, 1]) {
        const stand = new THREE.Group();
        stand.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 12), m.blackMetal)).position.y = 0.5;
        stand.add(box(0.26, 0.02, 0.26, m.blackMetal, 0, 0.01, 0));
        const cabinet = rounded(0.26, 0.38, 0.3, 0.012, new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: 0.7 }));
        cabinet.position.y = 1.19;
        stand.add(cabinet);
        for (const [y, r] of [[1.12, 0.085], [1.3, 0.03]] as const) {
            const cone = new THREE.Mesh(new THREE.CircleGeometry(r, 32), new THREE.MeshStandardMaterial({ color: 0x0c0c0d, roughness: 0.5 }));
            cone.rotation.y = Math.PI / 2;
            cone.position.set(0.151, y, 0);
            stand.add(cone);
            const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.004, 8, 32), m.nickel);
            rim.rotation.y = Math.PI / 2;
            rim.position.set(0.152, y, 0);
            stand.add(rim);
        }
        stand.position.set(deskX + 0.15, 0, deskZ + side * 1.2);
        stand.rotation.y = side * 0.35;
        add(stand);
    }

    // The releases, framed above the desk, and a crate of records by the door.
    const frames: THREE.Mesh[] = [];
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x111112, roughness: 0.5 });
    const shown = Math.max(1, Math.min(3, releases.length));
    for (let i = 0; i < shown; i++) {
        const z = deskZ + (i - (shown - 1) / 2) * 0.62;
        add(box(0.03, 0.5, 0.5, frameMat, ROOM.x0 + 0.1, 1.72, z));
        const cover = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.44), new THREE.MeshStandardMaterial({ color: 0x2a2a2c, roughness: 0.6 }));
        cover.rotation.y = Math.PI / 2;
        cover.position.set(ROOM.x0 + 0.117, 1.72, z);
        add(cover);
        frames.push(cover);
    }
    const crate = new THREE.Group();
    const crateWood = new THREE.MeshStandardMaterial({ map: woodTexture("#9a7046", "#5a3a1c", 4), roughness: 0.75 });
    crate.add(box(0.36, 0.02, 0.36, crateWood, 0, 0.01, 0));
    for (const [x, z, w, d] of [[0, 0.17, 0.36, 0.02], [0, -0.17, 0.36, 0.02], [0.17, 0, 0.02, 0.36], [-0.17, 0, 0.02, 0.36]] as const) crate.add(box(w, 0.3, d, crateWood, x, 0.15, z));
    const sleeves: THREE.Mesh[] = [];
    for (let i = 0; i < 9; i++) {
        const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.31, 0.006), new THREE.MeshStandardMaterial({ color: [0x2f2f33, 0x5a4636, 0x23344a, 0x3d3d40][i % 4], roughness: 0.8 }));
        sleeve.position.set(0, 0.18, -0.13 + i * 0.03);
        sleeve.rotation.x = -0.18;
        crate.add(sleeve);
        sleeves.push(sleeve);
    }
    crate.position.set(ROOM.x1 - 0.6, 0, ROOM.z1 - 0.55);
    crate.rotation.y = 0.4;
    add(crate);

    // Two warm lamps, short-reaching, so they light this room and not the next.
    const warm = new THREE.PointLight(0xffb070, 14, 3.4, 1.5);
    warm.position.set(cx - 0.3, 2.3, deskZ);
    const fill = new THREE.PointLight(0x7f95ff, 4, 3, 1.6);
    fill.position.set(ROOM.x1 - 0.8, 0.6, ROOM.z1 - 0.6);
    add(warm);
    add(fill);

    group.traverse((node) => {
        if (node instanceof THREE.Mesh && node.castShadow === false) node.receiveShadow = true;
    });

    // Cover art arrives after the room is up; the label and frames take it as it lands.
    function loadCovers() {
        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin("anonymous");
        releases.slice(0, 3).forEach((release, i) =>
            loader.load(release.artwork, (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                const apply = (mesh: THREE.Mesh) => {
                    const material = mesh.material as THREE.MeshStandardMaterial;
                    material.map = texture;
                    material.color.set(0xffffff);
                    material.needsUpdate = true;
                };
                if (frames[i]) apply(frames[i]);
                const disc = [left.disc, right.disc][i];
                if (disc) apply(disc.children[1] as THREE.Mesh);
                if (i === 0) apply(sleeves[sleeves.length - 1]);
                if (i === 1 && sleeves[sleeves.length - 2]) apply(sleeves[sleeves.length - 2]);
            }),
        );
    }

    const doorZ = (MUSIC_DOOR.z0 + MUSIC_DOOR.z1) / 2;
    const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    return {
        group,
        loadCovers,
        /** Spin the decks; `dt` in seconds. Only while you're in the room. */
        spin(dt: number) {
            left.disc.rotation.y -= dt * 3.49; // 33⅓ rpm
            right.disc.rotation.y -= dt * 3.49;
        },
        doorway: {
            outside: { position: v(-1.15, 1.6, doorZ), target: v(-3.2, 1.55, doorZ), fov: 44 },
            inside: { position: v(MUSIC_DOOR.x - 0.7, 1.6, doorZ + 0.2), target: v(deskX, 1.2, deskZ), fov: 44 },
        },
        /** Standing back from the desk, the room to the left of a panel on the right. */
        view: (portrait: boolean) =>
            portrait
                ? { position: v(ROOM.x1 - 0.35, 1.75, deskZ), target: v(deskX, 1.05, deskZ), fov: 62 }
                : // Looking west, screen-right is -Z: aim right of the desk so it sits left of the panel.
                  { position: v(ROOM.x1 - 0.3, 1.7, deskZ + 0.45), target: v(deskX, 1.1, deskZ - 0.55), fov: 46 },
    };
}

export type MusicRoom = ReturnType<typeof createMusicRoom>;
