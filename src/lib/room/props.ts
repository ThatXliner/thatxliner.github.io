import * as THREE from "three";

/**
 * Everything in the room that isn't a scanned or authored model. Units are
 * metres, Y is up, and each builder returns a group whose origin sits on the
 * floor (or the surface it rests on) so placement in the room is one line.
 */

export function canvasTexture(width: number, height: number, draw: (g: CanvasRenderingContext2D) => void) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    draw(canvas.getContext("2d")!);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
}

/** Seeded, so the grain doesn't reshuffle on every visit. */
function random(seed: number) {
    return () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    };
}

/** Long-grain wood: a base tone, slow colour bands, then fine wavering lines. */
export function woodTexture(base: string, dark: string, seed: number, planks = 0) {
    return canvasTexture(1024, 1024, (g) => {
        const rand = random(seed);
        g.fillStyle = base;
        g.fillRect(0, 0, 1024, 1024);
        const rows = planks || 1;
        const rowHeight = 1024 / rows;
        for (let row = 0; row < rows; row++) {
            const y0 = row * rowHeight;
            // Each plank is a slightly different board.
            g.fillStyle = `rgba(${rand() < 0.5 ? "255,235,210" : "40,20,8"},${0.04 + rand() * 0.08})`;
            g.fillRect(0, y0, 1024, rowHeight);
            for (let i = 0; i < 70; i++) {
                const y = y0 + rand() * rowHeight;
                const amp = 1 + rand() * 4;
                const freq = 0.002 + rand() * 0.01;
                const phase = rand() * 10;
                g.strokeStyle = dark;
                g.globalAlpha = 0.04 + rand() * 0.12;
                g.lineWidth = 0.5 + rand() * 2.2;
                g.beginPath();
                for (let x = 0; x <= 1024; x += 16) g.lineTo(x, y + Math.sin(x * freq + phase) * amp);
                g.stroke();
            }
            g.globalAlpha = 1;
            if (planks) {
                g.fillStyle = "rgba(20,10,4,0.55)";
                g.fillRect(0, y0, 1024, 2);
                // Butt joints, staggered.
                const joint = rand() * 1024;
                g.fillRect(joint, y0, 2, rowHeight);
            }
        }
    });
}

export const materials = () => ({
    lacquer: new THREE.MeshPhysicalMaterial({ color: 0x0a0a0b, roughness: 0.22, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06 }),
    ivory: new THREE.MeshStandardMaterial({ color: 0xf1ece2, roughness: 0.32 }),
    ebony: new THREE.MeshStandardMaterial({ color: 0x0c0c0d, roughness: 0.28 }),
    felt: new THREE.MeshStandardMaterial({ color: 0x5a1416, roughness: 1 }),
    // Lacquered yellow brass: a metal under a clear coat.
    brass: new THREE.MeshPhysicalMaterial({ color: 0xe2b462, metalness: 1, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08 }),
    nickel: new THREE.MeshStandardMaterial({ color: 0xd2d5d8, metalness: 1, roughness: 0.24 }),
    blackMetal: new THREE.MeshStandardMaterial({ color: 0x18181a, metalness: 0.6, roughness: 0.45 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 }),
});
export type Materials = ReturnType<typeof materials>;

function box(w: number, h: number, d: number, material: THREE.Material, x = 0, y = 0, z = 0) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    return mesh;
}

function rounded(w: number, h: number, d: number, r: number, material: THREE.Material) {
    // A chamfer-free box reads as CG. A 1–3 mm radius catches a highlight on every edge.
    const shape = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: d - r * 2, bevelEnabled: true, bevelSize: r, bevelThickness: r, bevelSegments: 3, curveSegments: 4 });
    geometry.translate(0, 0, -(d - r * 2) / 2);
    return new THREE.Mesh(geometry, material);
}

export function desk(top: THREE.Material, frame: THREE.Material) {
    const group = new THREE.Group();
    const width = 1.5;
    const depth = 0.72;
    const height = 0.75;
    const surface = rounded(width, 0.032, depth, 0.004, top);
    surface.position.y = height - 0.016;
    group.add(surface);
    for (const sx of [-1, 1]) {
        // A steel sled leg on each side: two posts and a foot rail.
        const x = sx * (width / 2 - 0.08);
        for (const sz of [-1, 1]) group.add(box(0.03, height - 0.032, 0.03, frame, x, (height - 0.032) / 2, sz * (depth / 2 - 0.06)));
        group.add(box(0.03, 0.03, depth - 0.09, frame, x, 0.015, 0));
        group.add(box(0.03, 0.03, depth - 0.09, frame, x, height - 0.047, 0));
    }
    group.add(box(width - 0.2, 0.06, 0.02, frame, 0, height - 0.062, -depth / 2 + 0.06));
    return group;
}

/** An upright piano, closed lid, fallboard open. Front faces +Z. */
export function piano(m: Materials) {
    const group = new THREE.Group();
    const width = 1.5;
    const depth = 0.6;
    const keyY = 0.72;
    const add = (mesh: THREE.Mesh) => (group.add(mesh), mesh);

    // Upper case, lid, and the slab below the keys.
    const upper = rounded(width, 1.26 - keyY - 0.08, 0.3, 0.008, m.lacquer);
    upper.position.set(0, keyY + 0.08 + (1.26 - keyY - 0.08) / 2, -depth / 2 + 0.15);
    add(upper);
    add(rounded(width + 0.04, 0.03, 0.34, 0.006, m.lacquer)).position.set(0, 1.27, -depth / 2 + 0.16);
    add(rounded(width, keyY - 0.06, 0.34, 0.008, m.lacquer)).position.set(0, (keyY - 0.06) / 2, -depth / 2 + 0.17);
    // Cheek blocks either side of the keys, and the arms that run to the toes.
    for (const sx of [-1, 1]) {
        const cheek = rounded(0.05, 0.12, depth - 0.02, 0.008, m.lacquer);
        cheek.position.set(sx * (width / 2 - 0.025), keyY + 0.02, 0);
        add(cheek);
        const toe = rounded(0.05, 0.05, 0.22, 0.01, m.lacquer);
        toe.position.set(sx * (width / 2 - 0.08), 0.025, depth / 2 - 0.05);
        add(toe);
        const leg = rounded(0.05, keyY - 0.08, 0.05, 0.01, m.lacquer);
        leg.position.set(sx * (width / 2 - 0.08), (keyY - 0.08) / 2 + 0.05, depth / 2 - 0.06);
        add(leg);
    }
    // Key slip in front of the keys and the keybed under them.
    add(rounded(width - 0.1, 0.05, 0.02, 0.004, m.lacquer)).position.set(0, keyY - 0.03, depth / 2 - 0.01);
    add(box(width - 0.1, 0.02, depth - 0.3, m.lacquer, 0, keyY - 0.03, 0.14));
    // The red felt strip that peeks out behind the keys.
    add(box(width - 0.1, 0.006, 0.01, m.felt, 0, keyY + 0.012, -0.0));
    // Fallboard, opened back against the case.
    const fall = rounded(width - 0.1, 0.12, 0.018, 0.004, m.lacquer);
    fall.position.set(0, keyY + 0.11, -0.03);
    fall.rotation.x = -0.12;
    add(fall);
    // Music desk ledge.
    add(rounded(width - 0.3, 0.02, 0.08, 0.004, m.lacquer)).position.set(0, keyY + 0.24, -0.03);

    // 88 keys: 52 naturals, 36 sharps. Instanced, they cost one draw call each.
    const span = width - 0.12;
    const white = span / 52;
    const naturals = new THREE.InstancedMesh(new THREE.BoxGeometry(white - 0.0012, 0.022, 0.15), m.ivory, 52);
    const sharps = new THREE.InstancedMesh(new THREE.BoxGeometry(white * 0.55, 0.024, 0.095), m.ebony, 36);
    const matrix = new THREE.Matrix4();
    let sharp = 0;
    // A0 is the first key; the black-key pattern over naturals starting at A.
    const hasSharpAfter = [true, false, true, true, false, true, true]; // A B C D E F G
    for (let i = 0; i < 52; i++) {
        const x = -span / 2 + white * (i + 0.5);
        matrix.makeTranslation(x, keyY, 0.15);
        naturals.setMatrixAt(i, matrix);
        if (i < 51 && hasSharpAfter[i % 7]) {
            matrix.makeTranslation(x + white / 2, keyY + 0.014, 0.11);
            sharps.setMatrixAt(sharp++, matrix);
        }
    }
    sharps.count = sharp;
    group.add(naturals, sharps);

    // Pedals.
    for (const x of [-0.07, 0, 0.07]) {
        const pedal = box(0.022, 0.008, 0.07, m.brass, x, 0.07, depth / 2 - 0.02);
        group.add(pedal);
    }
    group.traverse((node) => {
        if (node instanceof THREE.Mesh) node.castShadow = node.receiveShadow = true;
    });
    return group;
}

export function bench(m: Materials) {
    const group = new THREE.Group();
    const seat = rounded(0.76, 0.06, 0.36, 0.012, m.lacquer);
    seat.position.y = 0.48;
    group.add(seat);
    for (const sx of [-1, 1])
        for (const sz of [-1, 1]) {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.014, 0.45, 12), m.lacquer);
            leg.position.set(sx * 0.33, 0.225, sz * 0.14);
            group.add(leg);
        }
    group.traverse((node) => {
        if (node instanceof THREE.Mesh) node.castShadow = node.receiveShadow = true;
    });
    return group;
}

function tube(points: V3[], radius: number, material: THREE.Material, closed = false) {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), closed, "centripetal");
    return new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(24, points.length * 24), radius, 14, closed), material);
}

type V3 = [number, number, number];

/** A half-circle U-bend in the plane z, turning from (x, y0) to (x, y1) and bulging toward `side` on X. */
function bend(x: number, y0: number, y1: number, z: number, side: 1 | -1): V3[] {
    const r = Math.abs(y1 - y0) / 2;
    const yc = (y0 + y1) / 2;
    const dir = Math.sign(y1 - y0);
    return Array.from({ length: 17 }, (_, i) => {
        const a = (Math.PI * i) / 16;
        return [x + side * Math.sin(a) * r, yc - dir * Math.cos(a) * r, z] as V3;
    });
}

/** A short collar around a tube running along X: ferrules, lock nuts, cork barrels. */
function collar(x: number, y: number, z: number, radius: number, length: number, material: THREE.Material) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 28), material);
    mesh.rotation.z = Math.PI / 2;
    mesh.position.set(x, y, z);
    return mesh;
}

/** A ball-ended rod between two points: braces and stays. */
function stay(a: V3, b: V3, radius: number, material: THREE.Material) {
    const group = new THREE.Group();
    group.add(tube([a, b], radius, material));
    for (const end of [a, b]) {
        const ball = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.9, 16, 12), material);
        ball.position.set(...end);
        group.add(ball);
    }
    return group;
}

/**
 * A tenor trombone, after a Bach 42-sized horn: 8½" bell, .547" bore, a
 * slide of about 70 cm. Built in the player's frame: X points away from the
 * player along the slide, Y is up, Z is the player's left. Air runs from the
 * mouthpiece down the upper slide tube, round the crook, back up the lower
 * tube, through the gooseneck into the bell section (which sits beside the
 * slide, not on it), back over the shoulder to the tuning slide, and forward
 * again through a bell tail that widens all the way to the rim.
 *
 * Returned on its stand the way it lives between rehearsals: bell down over
 * the stand's cone, slide crook resting in the cup.
 */
export function trombone(m: Materials) {
    const horn = new THREE.Group();
    const add = <T extends THREE.Object3D>(object: T) => (horn.add(object), object);
    const brass = m.brass;
    const S = 0.095; // slide tube spacing, centre to centre
    const B = 0.125; // how far the bell section sits to the player's left of the slide
    const neck = -0.035; // the bell section's lower (neckpipe) tube
    const tail = 0.045; // its upper tube, which becomes the bell
    const bore = 0.0072;

    // Mouthpiece: cup, rim, throat and a long taper into the receiver.
    const mouthpiece = new THREE.Mesh(
        new THREE.LatheGeometry(
            [
                [0.003, 0.024], [0.008, 0.016], [0.0112, 0.006], [0.0118, 0], [0.0134, 0.0015], [0.0136, 0.006],
                [0.0108, 0.019], [0.0072, 0.033], [0.0064, 0.055], [0.0056, 0.088],
            ].map(([r, y]) => new THREE.Vector2(r, y)),
            48,
        ),
        m.nickel,
    );
    mouthpiece.rotation.z = -Math.PI / 2;
    mouthpiece.position.x = -0.09;
    add(mouthpiece);

    // Inner slide (nickel), mostly hidden; the stationary brace and cork barrels.
    for (const y of [0, -S]) add(tube([[0, y, 0], [0.11, y, 0]], bore, m.nickel));
    add(collar(0.008, 0, 0, 0.0102, 0.02, brass)); // mouthpiece receiver
    add(collar(0.052, 0, 0, 0.0096, 0.03, brass));
    add(collar(0.052, -S, 0, 0.0096, 0.03, brass));
    add(stay([0.052, -0.004, 0], [0.052, -S + 0.004, 0], 0.0042, brass));
    // Slide lock, a knurled ring on the upper tube.
    add(collar(0.085, 0, 0, 0.0108, 0.01, m.nickel));

    // Outer slide: two long tubes, the hand brace, and the crook.
    const outer = 0.0087;
    const crookAt = 0.675;
    for (const y of [0, -S]) {
        add(tube([[0.108, y, 0], [crookAt, y, 0]], outer, brass));
        add(collar(0.112, y, 0, 0.0104, 0.016, brass)); // stocking ferrule at the open end
        add(collar(0.165, y, 0, 0.0102, 0.022, brass)); // hand brace sleeves
        add(collar(crookAt - 0.006, y, 0, 0.0102, 0.014, brass));
    }
    add(stay([0.165, -0.006, 0], [0.165, -S + 0.006, 0], 0.0045, brass));
    add(tube(bend(crookAt, 0, -S, 0, 1), 0.0092, brass));
    // Water key on the outside of the crook.
    const key = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.004, 0.007), m.nickel);
    key.position.set(crookAt + 0.04, -S + 0.012, 0.011);
    key.rotation.z = -0.5;
    add(key);

    // Gooseneck: leaves the lower slide tube through the bell lock nut, then an
    // S-curve up and across into the bell section's plane.
    add(collar(-0.006, -S, 0, 0.0118, 0.018, m.nickel)); // bell lock nut
    add(
        tube(
            [[-0.004, -S, 0], [-0.03, -S, 0], [-0.058, -S + 0.01, 0.018], [-0.08, -0.064, 0.064], [-0.094, -0.044, 0.108], [-0.115, neck, B], [-0.15, neck, B]],
            bore,
            brass,
        ),
    );
    // Neckpipe back toward the player's shoulder.
    add(tube([[-0.15, neck, B], [-0.33, neck, B]], bore, brass));

    // Tuning slide: two tubes and a crook, behind the player's head.
    const tuneAt = -0.43;
    for (const y of [neck, tail]) {
        add(tube([[-0.33, y, B], [tuneAt, y, B]], 0.0086, brass));
        add(collar(-0.333, y, B, 0.0102, 0.016, brass));
    }
    add(tube(bend(tuneAt, neck, tail, B, -1), 0.0088, brass));
    add(stay([-0.405, neck + 0.006, B], [-0.405, tail - 0.006, B], 0.0038, brass));
    // The bell section's own stay between its two tubes.
    add(stay([-0.215, neck + 0.006, B], [-0.215, tail - 0.007, B], 0.0036, brass));

    // Bell: one Bessel horn from the tuning slide to the rim, r = k·(d + c)^-m,
    // where d is the distance back from the rim. It barely widens for most of
    // its length and then opens fast in the last 15 cm, which is the shape.
    const rim = 0.42;
    const length = rim - -0.33;
    const c = 0.0235;
    const k = 0.00646;
    const flare = 0.75;
    const profile: THREE.Vector2[] = [];
    for (let i = 0; i <= 120; i++) {
        const t = i / 120;
        const d = length * (1 - t) * (1 - t); // denser samples toward the rim
        profile.push(new THREE.Vector2(k * Math.pow(d + c, -flare), length - d));
    }
    const bellMat = brass.clone();
    bellMat.side = THREE.DoubleSide;
    const bell = new THREE.Mesh(new THREE.LatheGeometry(profile, 72), bellMat);
    bell.rotation.z = -Math.PI / 2;
    bell.position.set(-0.33, tail, B);
    add(bell);
    const rimRadius = k * Math.pow(c, -flare);
    const bead = new THREE.Mesh(new THREE.TorusGeometry(rimRadius, 0.0032, 12, 96), brass);
    bead.rotation.y = Math.PI / 2;
    bead.position.set(rim, tail, B);
    add(bead);
    // Bell brace: from the bell tail across to the slide, by the receiver.
    add(stay([-0.035, tail - 0.008, B - 0.004], [0.012, 0.009, 0.006], 0.0042, brass));

    // ── Stand ────────────────────────────────────────────────────────────
    // Bell and slide both hang down: player's X becomes world -Y.
    const top = 0.8;
    horn.rotation.z = -Math.PI / 2;
    horn.position.y = top;
    const group = new THREE.Group();
    group.add(horn);

    const bellX = tail;
    const bellZ = B;
    const rimY = top - rim;
    // A felt-covered cone that sits up inside the bell. It follows the flare at
    // 85%, so it stays inside a horn that narrows faster than any straight cone.
    const felt = new THREE.MeshStandardMaterial({ color: 0x1b1b1d, roughness: 0.95 });
    const conePoints: THREE.Vector2[] = [new THREE.Vector2(0, 0.012)];
    for (let i = 0; i <= 12; i++) {
        const depth = 0.012 + (0.075 * i) / 12;
        conePoints.push(new THREE.Vector2(0.85 * k * Math.pow(depth + c, -flare), depth));
    }
    conePoints.push(new THREE.Vector2(0, 0.087));
    const cone = new THREE.Mesh(new THREE.LatheGeometry(conePoints.reverse(), 40), felt);
    cone.position.set(bellX, rimY, bellZ);
    group.add(cone);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, rimY + 0.02, 16), m.blackMetal);
    post.position.set(bellX, (rimY + 0.02) / 2, bellZ);
    group.add(post);
    // Slide cup, under the crook, on an arm off the post.
    const crookX = -S / 2;
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.058, 0.06, 40, 1, true), felt.clone());
    (cup.material as THREE.Material).side = THREE.DoubleSide;
    cup.position.set(crookX, top - crookAt - S / 2 - 0.03, 0);
    group.add(cup);
    const cupBase = new THREE.Mesh(new THREE.CircleGeometry(0.058, 40), felt);
    cupBase.rotation.x = -Math.PI / 2;
    cupBase.position.set(crookX, cup.position.y - 0.029, 0);
    group.add(cupBase);
    group.add(tube([[bellX, 0.05, bellZ], [crookX, cup.position.y - 0.025, 0]], 0.006, m.blackMetal));
    // Three folding legs, turned away from the cup.
    const away = Math.atan2(0 - bellZ, crookX - bellX);
    for (let i = 0; i < 3; i++) {
        const a = away + Math.PI / 3 + (i * Math.PI * 2) / 3;
        const foot: V3 = [bellX + Math.cos(a) * 0.19, 0.008, bellZ + Math.sin(a) * 0.19];
        group.add(tube([[bellX, 0.09, bellZ], foot], 0.0065, m.blackMetal));
        const pad = new THREE.Mesh(new THREE.SphereGeometry(0.011, 12, 8), m.rubber);
        pad.position.set(...foot);
        group.add(pad);
    }

    group.traverse((node) => {
        if (node instanceof THREE.Mesh) node.castShadow = node.receiveShadow = true;
    });
    return group;
}

/** A two-arm task lamp. Returns the bulb's world anchor so a light can live there. */
export function lamp(m: Materials) {
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.08, 0.018, 40), m.blackMetal);
    base.position.y = 0.009;
    group.add(base);
    const lower = tube([[0, 0.018, 0], [0.02, 0.2, 0.06], [0.05, 0.36, 0.1]], 0.0065, m.blackMetal);
    group.add(lower);
    const upper = tube([[0.05, 0.36, 0.1], [0.16, 0.42, 0.18], [0.27, 0.43, 0.24]], 0.0065, m.blackMetal);
    group.add(upper);
    const joint = new THREE.Mesh(new THREE.SphereGeometry(0.013, 16, 12), m.blackMetal);
    joint.position.set(0.05, 0.36, 0.1);
    group.add(joint);
    const head = new THREE.Group();
    head.position.set(0.27, 0.43, 0.24);
    const shadeMat = m.blackMetal.clone();
    shadeMat.side = THREE.DoubleSide;
    const shade = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0.018, 0.04), new THREE.Vector2(0.03, 0.02), new THREE.Vector2(0.065, -0.05), new THREE.Vector2(0.067, -0.055)], 40), shadeMat);
    head.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.028, 20, 14), new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0xffd7a1, emissiveIntensity: 0 }));
    bulb.position.y = -0.03;
    head.add(bulb);
    // Aim the head down and back toward the laptop.
    head.rotation.set(0.35, 0, 0.45);
    group.add(head);
    group.traverse((node) => {
        if (node instanceof THREE.Mesh && node !== bulb) node.castShadow = node.receiveShadow = true;
    });
    return { group, head, bulb };
}

export function tripod(m: Materials, height = 1.25) {
    const group = new THREE.Group();
    const top = height;
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.3, 14), m.blackMetal);
    column.position.y = top - 0.15;
    group.add(column);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.05, 20), m.blackMetal);
    head.position.y = top + 0.02;
    group.add(head);
    const spider = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 3), m.blackMetal);
    spider.position.y = top - 0.28;
    group.add(spider);
    for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
        const foot: [number, number, number] = [Math.cos(a) * 0.42, 0.01, Math.sin(a) * 0.42];
        const hip: [number, number, number] = [Math.cos(a) * 0.04, top - 0.28, Math.sin(a) * 0.04];
        group.add(tube([hip, foot], 0.013, m.blackMetal));
        const knee: [number, number, number] = [mix(hip[0], foot[0], 0.5), mix(hip[1], foot[1], 0.5), mix(hip[2], foot[2], 0.5)];
        group.add(tube([knee, foot], 0.0095, m.nickel));
    }
    group.traverse((node) => {
        if (node instanceof THREE.Mesh) node.castShadow = node.receiveShadow = true;
    });
    return group;
}

function mix(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

export function mug() {
    const group = new THREE.Group();
    const ceramic = new THREE.MeshStandardMaterial({ color: 0xe9e4da, roughness: 0.35 });
    const outer = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0, 0), new THREE.Vector2(0.04, 0), new THREE.Vector2(0.042, 0.095), new THREE.Vector2(0.038, 0.095), new THREE.Vector2(0.036, 0.008), new THREE.Vector2(0, 0.008)], 40), ceramic);
    group.add(outer);
    const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.036, 32), new THREE.MeshStandardMaterial({ color: 0x24140a, roughness: 0.15 }));
    coffee.rotation.x = -Math.PI / 2;
    coffee.position.y = 0.075;
    group.add(coffee);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.0065, 10, 24, Math.PI * 1.2), ceramic);
    handle.position.set(0.045, 0.05, 0);
    handle.rotation.z = -Math.PI * 0.6;
    group.add(handle);
    group.traverse((node) => {
        if (node instanceof THREE.Mesh) node.castShadow = node.receiveShadow = true;
    });
    return group;
}

/** A framed print: thin black frame, white mat, the photograph. */
export function frame(texture: THREE.Texture, aspect: number, height: number) {
    const group = new THREE.Group();
    const width = height * aspect;
    const matBorder = height * 0.12;
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.6 });
    const outerW = width + matBorder * 2 + 0.03;
    const outerH = height + matBorder * 2 + 0.03;
    group.add(box(outerW, outerH, 0.025, frameMat, 0, 0, 0.0125));
    group.add(box(width + matBorder * 2, height + matBorder * 2, 0.004, new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.95 }), 0, 0, 0.026));
    const print = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8 }));
    print.position.z = 0.0285;
    group.add(print);
    group.traverse((node) => {
        if (node instanceof THREE.Mesh) node.castShadow = node.receiveShadow = true;
    });
    return group;
}
