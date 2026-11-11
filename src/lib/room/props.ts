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
export function random(seed: number) {
    return () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    };
}

/**
 * Long-grain wood, drawn twice from one stream of random numbers: the colour,
 * and a pale "relief" of the same grain and joints. The relief goes on as
 * both bump and roughness, so a low sun rakes across the boards and the
 * gloss breaks up along the grain instead of lying on it like a sticker.
 */
export function woodSurface(base: string, dark: string, seed: number, planks = 0) {
    const size = 1024;
    const reliefCanvas = document.createElement("canvas");
    reliefCanvas.width = reliefCanvas.height = size;
    const r = reliefCanvas.getContext("2d")!;
    r.fillStyle = "#f4f4f4";
    r.fillRect(0, 0, size, size);
    const map = canvasTexture(size, size, (g) => {
        const rand = random(seed);
        g.fillStyle = base;
        g.fillRect(0, 0, size, size);
        const rows = planks || 1;
        const rowHeight = size / rows;
        const board = (x0: number, x1: number, y0: number) => {
            // Each board is its own tree: a shift in tone, and its own gloss.
            const light = rand() < 0.5;
            g.fillStyle = `rgba(${light ? "255,232,200" : "38,18,6"},${0.03 + rand() * (planks ? 0.08 : 0.05)})`;
            g.fillRect(x0, y0, x1 - x0, rowHeight);
            r.fillStyle = `rgba(0,0,0,${rand() * 0.14})`;
            r.fillRect(x0, y0, x1 - x0, rowHeight);
        };
        for (let row = 0; row < rows; row++) {
            const y0 = row * rowHeight;
            const joints = planks ? [0, ...Array.from({ length: 2 }, () => rand() * size).sort((a, b) => a - b), size] : [0, size];
            for (let i = 0; i < joints.length - 1; i++) board(joints[i], joints[i + 1], y0);
            // Slow bands of figure, then the fine lines of the grain itself.
            for (let i = 0; i < 5; i++) {
                g.fillStyle = `rgba(${rand() < 0.5 ? "255,230,196" : "50,26,10"},${0.025 + rand() * 0.04})`;
                g.fillRect(0, y0 + rand() * rowHeight, size, rowHeight * (0.08 + rand() * 0.2));
            }
            const lines = Math.round(rowHeight / 2.4);
            for (let i = 0; i < lines; i++) {
                const y = y0 + rand() * rowHeight;
                const amp = 0.6 + rand() * 3;
                // Whole waves across the texture, so it tiles without a seam.
                const freq = ((1 + Math.floor(rand() * 3)) * Math.PI * 2) / size;
                const phase = rand() * 10;
                const alpha = 0.03 + rand() * 0.1;
                const width = 0.4 + rand() * 1.3;
                for (const [ctx, style, a] of [[g, dark, alpha], [r, "#000", alpha * 0.9]] as const) {
                    ctx.strokeStyle = style;
                    ctx.globalAlpha = a;
                    ctx.lineWidth = width;
                    ctx.beginPath();
                    for (let x = 0; x <= size; x += 16) ctx.lineTo(x, y + Math.sin(x * freq + phase) * amp);
                    ctx.stroke();
                }
            }
            g.globalAlpha = r.globalAlpha = 1;
            if (planks) {
                // The gap between boards. Colour only: in the relief it would read as a glossy line.
                g.fillStyle = "rgba(16,8,3,0.55)";
                g.fillRect(0, y0, size, 2);
                for (const joint of joints.slice(1, -1)) g.fillRect(joint, y0, 1.5, rowHeight);
            }
        }
    });
    const relief = new THREE.CanvasTexture(reliefCanvas);
    relief.anisotropy = 8;
    return { map, relief };
}

/** A wood material: colour, with the grain as bump and as breaks in the gloss. */
export function wood(base: string, dark: string, seed: number, options: { planks?: number; roughness?: number; repeat?: number; offset?: number; bump?: number } = {}) {
    const { map, relief } = woodSurface(base, dark, seed, options.planks);
    if (options.repeat) {
        for (const texture of [map, relief]) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(options.repeat, options.repeat);
            texture.offset.set(options.offset ?? 0, options.offset ?? 0);
        }
    }
    return new THREE.MeshStandardMaterial({ map, roughnessMap: relief, bumpMap: relief, bumpScale: options.bump ?? 0.6, roughness: options.roughness ?? 0.6 });
}

export const woodTexture = (base: string, dark: string, seed: number, planks = 0) => woodSurface(base, dark, seed, planks).map;

/** Fine speckle for painted plaster: enough tooth that a wall isn't a flat fill. */
export function plasterTexture(seed: number) {
    const texture = canvasTexture(512, 512, (g) => {
        const rand = random(seed);
        g.fillStyle = "#808080";
        g.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 9000; i++) {
            const shade = rand() < 0.5 ? 255 : 0;
            g.fillStyle = `rgba(${shade},${shade},${shade},${0.02 + rand() * 0.06})`;
            const size = 1 + rand() * 5;
            g.beginPath();
            g.ellipse(rand() * 512, rand() * 512, size, size * (0.5 + rand()), rand() * 3, 0, 7);
            g.fill();
        }
    });
    texture.colorSpace = THREE.NoColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

export const materials = () => ({
    lacquer: new THREE.MeshPhysicalMaterial({ color: 0x0a0a0b, roughness: 0.22, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06 }),
    ivory: new THREE.MeshStandardMaterial({ color: 0xf1ece2, roughness: 0.32 }),
    ebony: new THREE.MeshStandardMaterial({ color: 0x0c0c0d, roughness: 0.28 }),
    felt: new THREE.MeshStandardMaterial({ color: 0x5a1416, roughness: 1 }),
    // Lacquered yellow brass: a metal under a clear coat.
    brass: new THREE.MeshPhysicalMaterial({ color: 0xebc36e, metalness: 1, roughness: 0.13, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.9 }),
    nickel: new THREE.MeshStandardMaterial({ color: 0xd2d5d8, metalness: 1, roughness: 0.24 }),
    blackMetal: new THREE.MeshStandardMaterial({ color: 0x18181a, metalness: 0.6, roughness: 0.45 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 }),
});
export type Materials = ReturnType<typeof materials>;

export function box(w: number, h: number, d: number, material: THREE.Material, x = 0, y = 0, z = 0) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    return mesh;
}

export function rounded(w: number, h: number, d: number, r: number, material: THREE.Material) {
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
    const surface = rounded(width, depth, 0.032, 0.004, top);
    // Extruded lying down, so the grain runs the length of the top.
    surface.rotation.x = -Math.PI / 2;
    surface.position.y = height - 0.016;
    group.add(surface);
    for (const sx of [-1, 1]) {
        // A steel sled leg on each side: two posts and a foot rail.
        const x = sx * (width / 2 - 0.08);
        const part = (w: number, h: number, d: number, y: number, z: number) => {
            const bar = rounded(w, h, d, 0.003, frame);
            bar.position.set(x, y, z);
            group.add(bar);
        };
        for (const sz of [-1, 1]) part(0.03, height - 0.032, 0.03, (height - 0.032) / 2, sz * (depth / 2 - 0.06));
        part(0.03, 0.03, depth - 0.09, 0.015, 0);
        part(0.03, 0.03, depth - 0.09, height - 0.047, 0);
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
    add(rounded(width - 0.3, 0.02, 0.1, 0.004, m.lacquer)).position.set(0, keyY + 0.24, -0.01);

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

export function tube(points: V3[], radius: number, material: THREE.Material, closed = false) {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), closed, "centripetal");
    return new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(24, points.length * 24), radius, 14, closed), material);
}

type V3 = [number, number, number];

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

/** A U-bend from `a` round to `b` (both [y, z] at the same X), bulging toward `side` on X. */
function crook(x: number, a: [number, number], b: [number, number], side: 1 | -1): V3[] {
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const half = [(b[0] - a[0]) / 2, (b[1] - a[1]) / 2];
    const r = Math.hypot(half[0], half[1]);
    return Array.from({ length: 17 }, (_, i) => {
        const angle = (Math.PI * i) / 16;
        return [x + side * Math.sin(angle) * r, mid[0] - half[0] * Math.cos(angle), mid[1] - half[1] * Math.cos(angle)] as V3;
    });
}

/**
 * A tenor trombone with an F attachment, measured off a side-on catalogue
 * photo (1.35 mm a pixel, scaled from the bell). Built in the player's frame:
 * X runs from behind the player's head toward the end of the slide, Y is up,
 * Z is the player's left. The origin is the bell lock, where the two halves join.
 *
 *   ┌──── tuning slide ─────── bell tail ───────────╲ bell
 *   │F loop ── rotor ── bell lock ═══ slide (upper) ════════════╮
 *   └─                    mouthpiece ═ slide (lower) ═══════════╯
 *
 * The bell section's lower tube and the slide's upper tube are one straight
 * line. The bell sits entirely above the slide, its rim a third of the way
 * down it. The mouthpiece goes into the lower slide tube.
 *
 * Returned on its stand the way it lives between rehearsals: bell down over
 * the stand's cone, slide crook resting in the cup.
 */
export function trombone(m: Materials) {
    const horn = new THREE.Group();
    const add = <T extends THREE.Object3D>(object: T) => (horn.add(object), object);
    const { brass, nickel } = m;
    const bore = 0.0072;
    const tail = 0.115; // the bell tail's height above the main line
    // The slide's two tubes sit 95 mm apart, the lower one down and to the
    // player's right; side-on that reads as 40 mm, as in the photo.
    const lower: [number, number] = [-0.0405, -0.085];

    // ── Bell section ─────────────────────────────────────────────────────
    // Main line: tuning slide to bell lock, then on as the slide's upper tube.
    const tuneEnd = -0.219;
    add(tube([[tuneEnd, 0, 0], [0, 0, 0]], bore, brass));
    add(tube([[tuneEnd, tail, 0], [-0.05, tail, 0]], 0.0086, brass));
    add(tube(crook(tuneEnd, [0, 0], [tail, 0], -1), 0.0088, brass));
    // The tuning slide's outer tubes are nickel sleeves between its two stays.
    for (const y of [0, tail]) add(collar(-0.165, y, 0, 0.0098, 0.088, nickel));
    for (const x of [-0.198, -0.124]) add(stay([x, 0.008, 0], [x, tail - 0.008, 0], 0.0036, brass));

    // F attachment: a smaller loop behind the tuning slide, into a rotor.
    const fz = -0.035;
    const fTop = 0.092;
    const fEnd = -0.3225;
    add(tube([[fEnd, 0, fz], [-0.03, 0, fz], [-0.008, 0.01, -0.018], [0, 0.016, -0.008]], bore, brass));
    add(tube([[fEnd, fTop, fz], [-0.055, fTop, fz], [-0.02, 0.078, fz * 0.6], [-0.004, 0.045, -0.008]], bore, brass));
    add(tube(crook(fEnd, [0, fz], [fTop, fz], -1), 0.0084, brass));
    for (const y of [0, fTop]) add(collar(-0.31, y, fz, 0.0098, 0.012, nickel));
    const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.03, 32), brass);
    rotor.rotation.x = Math.PI / 2;
    rotor.position.set(0, 0.026, -0.006);
    add(rotor);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.0125, 0.0125, 0.006, 32), nickel);
    cap.rotation.x = Math.PI / 2;
    cap.position.set(0, 0.026, 0.012);
    add(cap);
    // Thumb lever.
    add(tube([[0.006, 0.036, 0.012], [0.02, 0.05, 0.014], [0.03, 0.07, 0.014]], 0.0026, brass));
    const paddle = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.018, 0.004), brass);
    paddle.position.set(0.032, 0.078, 0.014);
    add(paddle);

    // Bell: a slim tail that barely grows for most of its length, then a
    // Bessel flare, r = k·(d + c)^-m with d the distance back from the rim,
    // that does nearly all its opening in the last 25 cm.
    const rim = 0.3645;
    const length = rim - tuneEnd;
    const rimRadius = 0.098;
    const flare = 1.3;
    const c = 0.0545;
    const k = rimRadius * Math.pow(c, flare);
    const bellRadius = (d: number) => {
        const opening = k * Math.pow(d + c, -flare);
        const taper = 0.0095 - (Math.max(0, d - 0.3) / (length - 0.3)) * (0.0095 - 0.0078);
        return Math.max(opening, taper);
    };
    const profile: THREE.Vector2[] = [];
    for (let i = 0; i <= 140; i++) {
        const t = i / 140;
        const d = length * (1 - t) * (1 - t); // denser samples toward the rim
        profile.push(new THREE.Vector2(bellRadius(d), length - d));
    }
    const bellMat = brass.clone();
    bellMat.side = THREE.DoubleSide;
    const bell = new THREE.Mesh(new THREE.LatheGeometry(profile, 72), bellMat);
    bell.rotation.z = -Math.PI / 2;
    bell.position.set(tuneEnd, tail, 0);
    add(bell);
    const bead = new THREE.Mesh(new THREE.TorusGeometry(rimRadius, 0.003, 12, 96), brass);
    bead.rotation.y = Math.PI / 2;
    bead.position.set(rim, tail, 0);
    add(bead);
    // Bell brace, from the bell tail down to the bell lock.
    add(stay([0.034, tail - 0.011, 0], [0.034, 0.009, 0], 0.0038, brass));
    for (const y of [tail - 0.011, 0.009]) add(collar(0.034, y, 0, 0.0062, 0.008, nickel));
    add(collar(0.006, 0, 0, 0.0118, 0.016, nickel)); // bell lock nut

    // ── Hand slide ───────────────────────────────────────────────────────
    const outerStart = 0.26;
    const crookAt = 0.783;
    const [ly, lz] = lower;
    // Upper tube: receiver barrel, inner slide, then the outer slide.
    add(collar(0.09, 0, 0, 0.0108, 0.03, brass));
    add(tube([[0, 0, 0], [outerStart, 0, 0]], bore, nickel));
    // Lower tube: mouthpiece receiver, inner slide, outer slide.
    add(tube([[0.1, ly, lz], [outerStart, ly, lz]], bore, nickel));
    add(collar(0.108, ly, lz, 0.0102, 0.018, brass));
    for (const [y, z] of [[0, 0], lower]) {
        add(collar(0.16, y, z, 0.0102, 0.04, brass)); // cork barrels
        add(tube([[outerStart, y, z], [crookAt, y, z]], 0.0087, brass));
        add(collar(outerStart + 0.004, y, z, 0.0104, 0.012, nickel)); // stocking ferrule
        add(collar(crookAt - 0.006, y, z, 0.0104, 0.014, nickel));
    }
    // Inner (stationary) brace and the hand brace.
    for (const x of [0.127, 0.189]) add(stay([x, -0.006, -0.012], [x, ly + 0.006, lz + 0.012], 0.0042, brass));
    add(tube(crook(crookAt, [0, 0], lower, 1), 0.0092, brass));
    // Water key on the outside of the crook.
    const key = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.004, 0.007), nickel);
    key.position.set(crookAt + 0.04, ly + 0.01, lz + 0.01);
    key.rotation.z = -0.5;
    add(key);

    // Mouthpiece: cup, rim, throat and a long taper into the lower tube.
    const mouthpiece = new THREE.Mesh(
        new THREE.LatheGeometry(
            [
                [0.003, 0.024], [0.008, 0.016], [0.0112, 0.006], [0.0118, 0], [0.0134, 0.0015], [0.0136, 0.006],
                [0.0108, 0.019], [0.0072, 0.033], [0.0064, 0.055], [0.0056, 0.088],
            ].map(([r, y]) => new THREE.Vector2(r, y)),
            48,
        ),
        nickel,
    );
    mouthpiece.rotation.z = -Math.PI / 2;
    mouthpiece.position.set(0.035, ly, lz);
    add(mouthpiece);

    // ── Stand ────────────────────────────────────────────────────────────
    // Bell and slide both hang down: the player's X becomes world -Y, and the
    // slide crook rests in the cup a few centimetres off the floor.
    const top = crookAt + 0.0475 + 0.009 + 0.065;
    horn.rotation.z = -Math.PI / 2;
    horn.position.y = top;
    const group = new THREE.Group();
    group.add(horn);

    const bellX = tail;
    const bellZ = 0;
    const rimY = top - rim;
    // A felt-covered cone that sits up inside the bell. It follows the flare at
    // 85%, so it stays inside a horn that narrows faster than any straight cone.
    const felt = new THREE.MeshStandardMaterial({ color: 0x1b1b1d, roughness: 0.95 });
    const conePoints: THREE.Vector2[] = [new THREE.Vector2(0, 0.012)];
    for (let i = 0; i <= 12; i++) {
        const depth = 0.012 + (0.075 * i) / 12;
        conePoints.push(new THREE.Vector2(0.85 * bellRadius(depth), depth));
    }
    conePoints.push(new THREE.Vector2(0, 0.087));
    const cone = new THREE.Mesh(new THREE.LatheGeometry(conePoints.reverse(), 40), felt);
    cone.position.set(bellX, rimY, bellZ);
    group.add(cone);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, rimY + 0.02, 16), m.blackMetal);
    post.position.set(bellX, (rimY + 0.02) / 2, bellZ);
    group.add(post);
    // Slide cup, under the crook, on an arm off the post.
    const crookX = ly / 2;
    const crookZ = lz / 2;
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.058, 0.06, 40, 1, true), felt.clone());
    (cup.material as THREE.Material).side = THREE.DoubleSide;
    cup.position.set(crookX, top - crookAt - 0.0475 - 0.02, crookZ);
    group.add(cup);
    const cupBase = new THREE.Mesh(new THREE.CircleGeometry(0.058, 40), felt);
    cupBase.rotation.x = -Math.PI / 2;
    cupBase.position.set(crookX, cup.position.y - 0.029, crookZ);
    group.add(cupBase);
    group.add(tube([[bellX, 0.05, bellZ], [crookX, cup.position.y - 0.025, crookZ]], 0.006, m.blackMetal));
    // Three folding legs, turned away from the cup.
    const away = Math.atan2(crookZ - bellZ, crookX - bellX);
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
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.028, 20, 14), new THREE.MeshStandardMaterial({ color: 0xcfc8ba, roughness: 0.35, emissive: 0xffd7a1, emissiveIntensity: 0 }));
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
