import * as THREE from "three";
import { canvasTexture, random, rounded, tube, type Materials } from "./props";

/**
 * The things that make a room somebody's: what's on the sill, what's been
 * left on the desk, what's open on the piano. None of them is a destination.
 * They're here to catch the light.
 */

const shadows = (group: THREE.Object3D) => {
    group.traverse((node) => {
        if (node instanceof THREE.Mesh) node.castShadow = node.receiveShadow = true;
    });
    return group;
};

/** A linen curtain, drawn back: `width` of cloth gathered into deep folds. Hangs from its top edge, facing +X. */
export function curtain(width: number, height: number, seed: number) {
    const rand = random(seed);
    const geometry = new THREE.PlaneGeometry(width, height, 72, 10);
    const position = geometry.getAttribute("position");
    const folds = 5 + Math.round(width * 9);
    const phase = rand() * 6;
    for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const y = position.getY(i);
        // Pleated tight at the rod, opening out and wandering toward the hem.
        const down = 0.5 - y / height;
        const u = x / width + 0.5;
        const wave = Math.sin(u * folds * Math.PI * 2 + phase + down * 0.9) + 0.35 * Math.sin(u * folds * 4.1 + phase * 2);
        position.setZ(i, wave * (0.016 + 0.022 * down));
        position.setX(i, x * (1 + 0.05 * down));
    }
    geometry.translate(0, -height / 2, 0);
    geometry.computeVertexNormals();
    const weave = canvasTexture(256, 256, (g) => {
        g.fillStyle = "#efe6d6";
        g.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 256; i += 2) {
            g.fillStyle = `rgba(120,96,70,${0.03 + rand() * 0.07})`;
            g.fillRect(i, 0, 1, 256);
            g.fillStyle = `rgba(255,255,255,${0.03 + rand() * 0.06})`;
            g.fillRect(0, i, 256, 1);
        }
    });
    weave.wrapS = weave.wrapT = THREE.RepeatWrapping;
    weave.repeat.set(width * 6, height * 6);
    // Linen lets some of the day through: the cloth glows a little when the sun's on it.
    const material = new THREE.MeshStandardMaterial({ map: weave, roughness: 1, side: THREE.DoubleSide, emissive: 0xffd9a8, emissiveIntensity: 0 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.y = Math.PI / 2;
    mesh.castShadow = mesh.receiveShadow = true;
    return { mesh, material };
}

/** One leaf, lying along +Z from its stalk at the origin, creased down the middle and drooping at the tip. */
function leafGeometry() {
    const along = 10;
    const across = 4;
    const vertices: number[] = [];
    const indices: number[] = [];
    for (let i = 0; i <= along; i++) {
        const u = i / along;
        // Broad just past the stalk, drawn out to a point.
        const half = 0.5 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.72)), 0.85) * (1 - 0.25 * u);
        for (let j = 0; j <= across; j++) {
            const side = (j / across) * 2 - 1;
            vertices.push(side * half * 0.62, Math.abs(side) * half * 0.2 - 0.22 * u * u, u);
        }
    }
    for (let i = 0; i < along; i++)
        for (let j = 0; j < across; j++) {
            const a = i * (across + 1) + j;
            const b = a + across + 1;
            indices.push(a, b, a + 1, a + 1, b, b + 1);
        }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
}

/** A rubber plant in a stoneware pot: a few upright stems, big waxy leaves. About 1.3 m tall. */
export function plant(seed = 5) {
    const rand = random(seed);
    const group = new THREE.Group();
    const stoneware = new THREE.MeshStandardMaterial({ color: 0xd8cfc0, roughness: 0.82 });
    const pot = new THREE.Mesh(
        new THREE.LatheGeometry(
            [[0, 0], [0.13, 0], [0.145, 0.012], [0.17, 0.3], [0.172, 0.315], [0.162, 0.318], [0.156, 0.3], [0.15, 0.27], [0, 0.27]].map(([r, y]) => new THREE.Vector2(r, y)),
            48,
        ),
        stoneware,
    );
    group.add(pot);
    const soil = new THREE.Mesh(new THREE.CircleGeometry(0.152, 40), new THREE.MeshStandardMaterial({ color: 0x1c140e, roughness: 1 }));
    soil.rotation.x = -Math.PI / 2;
    soil.position.y = 0.285;
    group.add(soil);

    const bark = new THREE.MeshStandardMaterial({ color: 0x3a2c1e, roughness: 0.85 });
    const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x1f5a2b, roughness: 0.5, envMapIntensity: 0.5, side: THREE.DoubleSide });
    const placements: THREE.Matrix4[] = [];
    const up = new THREE.Vector3(0, 1, 0);
    const stems = [
        { lean: [0.05, -0.03], height: 1.0, from: [0.01, 0.02] },
        { lean: [-0.1, 0.08], height: 0.78, from: [-0.04, -0.02] },
        { lean: [0.12, 0.1], height: 0.62, from: [0.04, -0.04] },
    ];
    for (const stem of stems) {
        const base = new THREE.Vector3(stem.from[0], 0.28, stem.from[1]);
        const tip = new THREE.Vector3(stem.from[0] + stem.lean[0], 0.28 + stem.height, stem.from[1] + stem.lean[1]);
        const bend = base.clone().lerp(tip, 0.5).add(new THREE.Vector3(stem.lean[0] * 0.35, 0, stem.lean[1] * 0.35));
        const curve = new THREE.QuadraticBezierCurve3(base, bend, tip);
        group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.008, 8), bark));
        const count = Math.round(stem.height * 13);
        let turn = rand() * 6;
        for (let i = 0; i < count; i++) {
            const t = 0.22 + (0.78 * (i + 0.5)) / count;
            const at = curve.getPoint(t);
            turn += 2.4 + (rand() - 0.5) * 0.5;
            // Lower leaves hang out flat, the newest stand nearly upright.
            const pitch = -0.2 + t * 0.95 + (rand() - 0.5) * 0.25;
            const size = (0.27 + rand() * 0.08) * (1.05 - 0.3 * t);
            const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(-pitch, turn, (rand() - 0.5) * 0.4, "YXZ"));
            const out = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion);
            placements.push(new THREE.Matrix4().compose(at.clone().addScaledVector(out, 0.035), quaternion, new THREE.Vector3(size, size, size)));
            // The stalk each leaf stands off the stem on.
            const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.003, 0.04, 6), bark);
            stalk.position.copy(at).addScaledVector(out, 0.018);
            stalk.quaternion.setFromUnitVectors(up, out);
            group.add(stalk);
        }
    }
    const leaves = new THREE.InstancedMesh(leafGeometry(), leafMaterial, placements.length);
    placements.forEach((matrix, i) => leaves.setMatrixAt(i, matrix));
    group.add(leaves);
    return shadows(group);
}

/** Books lying in a stack, each a different size and not quite squared up. Returns the height of the stack. */
export function bookStack(books: { color: number; width: number; depth: number; thick: number; turn?: number }[]) {
    const group = new THREE.Group();
    const pages = new THREE.MeshStandardMaterial({ color: 0xece4d2, roughness: 0.95 });
    let y = 0;
    for (const book of books) {
        const one = new THREE.Group();
        const cloth = new THREE.MeshStandardMaterial({ color: book.color, roughness: 0.78 });
        const board = 0.0025;
        // Two boards and a spine around a block of pages set in a hair on three sides.
        for (const side of [-1, 1]) {
            const cover = rounded(book.width, board, book.depth, 0.001, cloth);
            cover.position.y = book.thick / 2 + (side * (book.thick - board)) / 2;
            one.add(cover);
        }
        const spine = rounded(board, book.thick, book.depth, 0.001, cloth);
        spine.position.set(-book.width / 2 + board / 2, book.thick / 2, 0);
        one.add(spine);
        const block = new THREE.Mesh(new THREE.BoxGeometry(book.width - 0.006, book.thick - board * 2, book.depth - 0.008), pages);
        block.position.set(0.001, book.thick / 2, 0);
        one.add(block);
        one.position.y = y;
        one.rotation.y = book.turn ?? 0;
        group.add(one);
        y += book.thick;
    }
    return { group: shadows(group), height: y };
}

/** A pencil, lying down along X. */
export function pencil() {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.0036, 0.0036, 0.15, 6), new THREE.MeshStandardMaterial({ color: 0xc9962e, roughness: 0.5 }));
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.0036, 0.014, 6), new THREE.MeshStandardMaterial({ color: 0xd9b88c, roughness: 0.8 }));
    tip.position.y = 0.082;
    const lead = new THREE.Mesh(new THREE.ConeGeometry(0.0012, 0.005, 6), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 }));
    lead.position.y = 0.087;
    group.add(body, tip, lead);
    group.rotation.z = Math.PI / 2;
    const lying = new THREE.Group();
    lying.add(group);
    group.position.y = 0.0036;
    return shadows(lying);
}

/** Two facing pages of music, open on the piano's desk. Not a real piece; it only has to look played. */
export function sheetMusic(seed = 11) {
    const rand = random(seed);
    const page = (flip: number) => {
        const texture = canvasTexture(512, 700, (g) => {
            g.fillStyle = "#e9e2d2";
            g.fillRect(0, 0, 512, 700);
            g.strokeStyle = "rgba(20,18,16,0.75)";
            g.fillStyle = "rgba(20,18,16,0.85)";
            for (let system = 0; system < 6; system++) {
                const top = 64 + system * 104;
                g.lineWidth = 1;
                for (let line = 0; line < 5; line++) {
                    g.beginPath();
                    g.moveTo(40, top + line * 8);
                    g.lineTo(472, top + line * 8);
                    g.stroke();
                }
                // Bar lines, then notes that wander up and down the staff.
                for (let bar = 0; bar <= 4; bar++) g.fillRect(40 + bar * 108, top, 1.5, 32);
                let pitch = rand() * 8;
                for (let x = 58; x < 462; x += 14 + rand() * 16) {
                    pitch = Math.max(-2, Math.min(10, pitch + (rand() - 0.5) * 5));
                    const y = top + 32 - pitch * 4;
                    g.beginPath();
                    g.ellipse(x, y, 4.6, 3.4, -0.35, 0, 7);
                    g.fill();
                    g.lineWidth = 1.2;
                    g.beginPath();
                    g.moveTo(x + (pitch > 4 ? -4.2 : 4.2), y);
                    g.lineTo(x + (pitch > 4 ? -4.2 : 4.2), y + (pitch > 4 ? 26 : -26));
                    g.stroke();
                }
            }
        });
        const geometry = new THREE.PlaneGeometry(0.22, 0.3, 8, 1);
        const position = geometry.getAttribute("position");
        // Pages bow toward the gutter, the way a book lies open.
        for (let i = 0; i < position.count; i++) {
            const u = (position.getX(i) / 0.22 + 0.5) * flip + (flip < 0 ? 1 : 0);
            position.setZ(i, 0.012 * Math.sin(u * Math.PI * 0.5) - 0.012);
        }
        geometry.computeVertexNormals();
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9, side: THREE.DoubleSide }));
        mesh.position.x = flip * 0.11;
        return mesh;
    };
    const group = new THREE.Group();
    group.add(page(-1), page(1));
    return shadows(group);
}

/**
 * A brass piano lamp: weighted foot, a goose-neck, and a long half-round shade
 * over the music. Returns where its glow is, so a light can live there.
 */
export function pianoLamp(m: Materials) {
    const group = new THREE.Group();
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.066, 0.014, 40), m.brass);
    foot.position.y = 0.007;
    group.add(foot);
    group.add(tube([[0, 0.014, 0], [0, 0.12, 0.005], [0, 0.2, 0.06], [0, 0.21, 0.15], [0, 0.185, 0.2]], 0.006, m.brass));
    // The shade: half a tube, open side down, lying along X.
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 28, 1, false, 0, Math.PI), m.brass.clone());
    (shade.material as THREE.Material).side = THREE.DoubleSide;
    shade.rotation.z = Math.PI / 2;
    const head = new THREE.Group();
    head.add(shade);
    for (const x of [-0.15, 0.15]) {
        const cap = new THREE.Mesh(new THREE.CircleGeometry(0.03, 20, 0, Math.PI), shade.material as THREE.Material);
        cap.rotation.y = Math.PI / 2;
        cap.position.x = x;
        head.add(cap);
    }
    const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.24, 12), new THREE.MeshStandardMaterial({ color: 0x2a2622, emissive: 0xffd7a1, emissiveIntensity: 0 }));
    glow.rotation.z = Math.PI / 2;
    glow.position.y = 0.008;
    head.add(glow);
    head.position.set(0, 0.18, 0.2);
    head.rotation.x = 0.35;
    group.add(head);
    group.traverse((node) => {
        if (node instanceof THREE.Mesh && node !== glow) node.castShadow = node.receiveShadow = true;
    });
    return { group, glow };
}

/** A skirting board along a wall from `a` to `b` on the floor plan, proud of the wall by its thickness. */
export function skirting(a: [number, number], b: [number, number], material: THREE.Material) {
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const board = rounded(length, 0.09, 0.014, 0.004, material);
    board.position.set((a[0] + b[0]) / 2, 0.045, (a[1] + b[1]) / 2);
    board.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]);
    board.castShadow = board.receiveShadow = true;
    return board;
}
