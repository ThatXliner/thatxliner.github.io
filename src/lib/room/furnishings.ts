import * as THREE from "three";
import { box, canvasTexture, rounded, tube, type Materials } from "./props";

/**
 * The room's things you can walk up to once the tour is over: the camera bag
 * under the desk, the shelf of awards, and the rug with the path woven in.
 * Each returns its group and the handles the film needs to animate it.
 */

const fabric = () => {
    const weave = canvasTexture(256, 256, (g) => {
        g.fillStyle = "#2b2c30";
        g.fillRect(0, 0, 256, 256);
        for (let y = 0; y < 256; y += 3) {
            g.fillStyle = `rgba(255,255,255,${y % 6 ? 0.025 : 0.05})`;
            g.fillRect(0, y, 256, 1);
        }
        for (let x = 0; x < 256; x += 3) {
            g.fillStyle = "rgba(0,0,0,0.05)";
            g.fillRect(x, 0, 1, 256);
        }
    });
    weave.wrapS = weave.wrapT = THREE.RepeatWrapping;
    weave.repeat.set(3, 3);
    return new THREE.MeshStandardMaterial({ map: weave, roughness: 0.95 });
};

/**
 * A padded camera bag. Its lid is hinged along the back edge; `open(t)` lifts
 * it from shut (0) to thrown back (1), showing the dividers and lenses inside.
 */
export function cameraBag(m: Materials) {
    const group = new THREE.Group();
    const W = 0.44;
    const H = 0.27;
    const D = 0.29;
    const shell = fabric();
    const lining = new THREE.MeshStandardMaterial({ color: 0x8a8f96, roughness: 1 });
    const accent = new THREE.MeshStandardMaterial({ color: 0xc8742f, roughness: 0.8 });

    // The body: four walls and a floor, so it has an inside once the lid lifts.
    const wall = 0.02;
    const add = (mesh: THREE.Mesh) => (group.add(mesh), mesh);
    add(box(W, wall, D, shell, 0, wall / 2, 0));
    add(rounded(W, H, wall, 0.008, shell)).position.set(0, H / 2, D / 2 - wall / 2);
    add(rounded(W, H, wall, 0.008, shell)).position.set(0, H / 2, -D / 2 + wall / 2);
    for (const sx of [-1, 1]) add(rounded(wall, H, D, 0.008, shell)).position.set(sx * (W / 2 - wall / 2), H / 2, 0);
    // Lining and dividers, with a body and two lenses standing in them.
    add(box(W - wall * 2, 0.004, D - wall * 2, lining, 0, wall + 0.002, 0));
    for (const x of [-0.07, 0.07]) add(box(0.012, H * 0.8, D - wall * 2, accent, x, H * 0.42, 0));
    add(rounded(0.12, 0.09, 0.07, 0.01, m.blackMetal)).position.set(0, wall + 0.045, 0.02);
    for (const [x, h] of [[-0.14, 0.15], [0.14, 0.11]] as const) {
        const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, h, 28), m.blackMetal);
        lens.position.set(x, wall + h / 2, 0);
        group.add(lens);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.003, 8, 28), m.nickel);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(x, wall + h - 0.008, 0);
        group.add(ring);
    }
    // Front pocket, its zip, and a woven patch.
    add(rounded(W * 0.8, H * 0.55, 0.035, 0.012, shell)).position.set(0, H * 0.42, D / 2 + 0.012);
    add(box(W * 0.74, 0.004, 0.004, m.nickel, 0, H * 0.66, D / 2 + 0.031));
    add(box(0.07, 0.02, 0.002, accent, 0, H * 0.32, D / 2 + 0.031));

    // The lid, hinged at the back edge.
    const hinge = new THREE.Group();
    hinge.position.set(0, H, -D / 2);
    const lid = rounded(W + 0.01, 0.05, D + 0.01, 0.012, shell);
    lid.position.set(0, 0.025, D / 2);
    hinge.add(lid);
    const handle = tube([[-0.07, 0.05, D / 2], [-0.05, 0.085, D / 2], [0.05, 0.085, D / 2], [0.07, 0.05, D / 2]], 0.008, shell);
    hinge.add(handle);
    group.add(hinge);
    // Strap loops on the sides.
    for (const sx of [-1, 1]) add(box(0.01, 0.05, 0.035, m.rubber, sx * (W / 2 + 0.005), H * 0.8, 0));

    group.traverse((node) => {
        if (node instanceof THREE.Mesh) node.castShadow = node.receiveShadow = true;
    });
    const open = (t: number) => {
        hinge.rotation.x = -1.9 * t;
    };
    return { group, open, size: new THREE.Vector3(W, H, D) };
}

function plaqueTexture(lines: [string, string]) {
    return canvasTexture(512, 256, (g) => {
        const font = getComputedStyle(document.body).fontFamily;
        g.fillStyle = "#b08a4a";
        g.fillRect(0, 0, 512, 256);
        g.strokeStyle = "rgba(60,40,10,0.5)";
        g.lineWidth = 6;
        g.strokeRect(14, 14, 484, 228);
        g.fillStyle = "#2b1d08";
        g.textAlign = "center";
        g.font = `600 44px ${font}`;
        g.fillText(lines[0], 256, 116);
        g.font = `400 32px ${font}`;
        g.fillText(lines[1], 256, 170);
    });
}

/**
 * Two floating walnut shelves for the right wall: trophies, plaques, a small
 * FRC robot with its team number on the bumpers, and a few books. Built facing
 * -X, so it hangs on the right wall as is.
 */
export function awardShelf(m: Materials, wood: THREE.Material) {
    const group = new THREE.Group();
    const add = (o: THREE.Object3D) => (group.add(o), o);
    const length = 1.5;
    for (const y of [1.18, 1.62]) {
        const shelf = rounded(0.24, 0.035, length, 0.006, wood);
        shelf.position.set(-0.12, y, 0);
        add(shelf);
    }
    const gold = m.brass;
    const silver = m.nickel;
    const trophy = (metal: THREE.Material, height: number) => {
        const t = new THREE.Group();
        t.add(box(0.09, 0.03, 0.09, new THREE.MeshStandardMaterial({ color: 0x1d1d1f, roughness: 0.4 }), 0, 0.015, 0));
        t.add(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.014, height * 0.45, 16), metal)).position.y = 0.03 + height * 0.225;
        const cup = new THREE.Mesh(
            new THREE.LatheGeometry([new THREE.Vector2(0.004, 0), new THREE.Vector2(0.03, 0.02), new THREE.Vector2(0.045, 0.07), new THREE.Vector2(0.047, height * 0.5)], 32),
            metal,
        );
        cup.position.y = 0.03 + height * 0.45;
        t.add(cup);
        for (const s of [-1, 1]) {
            const arm = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.004, 8, 20, Math.PI), metal);
            arm.position.set(0, 0.03 + height * 0.7, s * 0.05);
            arm.rotation.set(0, Math.PI / 2, s > 0 ? -Math.PI / 2 : Math.PI / 2);
            t.add(arm);
        }
        return t;
    };
    const plaque = (lines: [string, string]) => {
        const p = new THREE.Group();
        p.add(box(0.03, 0.2, 0.28, wood, 0, 0.1, 0));
        const face = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.12), new THREE.MeshStandardMaterial({ map: plaqueTexture(lines), metalness: 0.6, roughness: 0.35 }));
        face.rotation.y = -Math.PI / 2;
        face.position.set(-0.016, 0.1, 0);
        p.add(face);
        p.rotation.z = 0.12; // leaning back against the wall
        return p;
    };
    // Lower shelf: the robot, a trophy, a plaque.
    const lower = 1.18 + 0.0175;
    const robot = frcRobot(m);
    robot.position.set(-0.13, lower, -0.45);
    robot.rotation.y = 0.5;
    add(robot);
    add(trophy(gold, 0.2)).position.set(-0.12, lower, 0.05);
    add(plaque(["Congressional App", "Challenge · 3rd, CA-19"])).position.set(-0.05, lower, 0.45);
    // Upper shelf: the music and the CTF, and books.
    const upper = 1.62 + 0.0175;
    add(trophy(silver, 0.16)).position.set(-0.12, upper, -0.5);
    add(plaque(["picoCTF 2026", "174th of 8,747"])).position.set(-0.05, upper, -0.12);
    const bookColors = [0x2f4a6d, 0x8c3b2e, 0xd8cfb8, 0x3b5b45, 0x1f1f22];
    bookColors.forEach((color, i) => {
        const h = 0.2 + ((i * 37) % 5) * 0.012;
        add(box(0.16, h, 0.035, new THREE.MeshStandardMaterial({ color, roughness: 0.85 }), -0.12, upper + h / 2, 0.3 + i * 0.038));
    });
    group.traverse((node) => {
        if (node instanceof THREE.Mesh) node.castShadow = node.receiveShadow = true;
    });
    return group;
}

/** A desk-sized FRC robot: chassis, wheels, red bumpers with the team number, an elevator mast. */
function frcRobot(m: Materials) {
    const group = new THREE.Group();
    const s = 0.24;
    const bumperTex = canvasTexture(512, 96, (g) => {
        g.fillStyle = "#b3261e";
        g.fillRect(0, 0, 512, 96);
        g.fillStyle = "#fff";
        g.font = `700 64px ${getComputedStyle(document.body).fontFamily}`;
        g.textAlign = "center";
        g.fillText("3256", 256, 72);
    });
    const bumper = new THREE.MeshStandardMaterial({ map: bumperTex, roughness: 0.8 });
    const plainBumper = new THREE.MeshStandardMaterial({ color: 0xb3261e, roughness: 0.8 });
    const aluminium = new THREE.MeshStandardMaterial({ color: 0xb9bcc0, metalness: 0.8, roughness: 0.35 });
    group.add(box(s, 0.025, s, aluminium, 0, 0.03, 0));
    for (const [x, z, w, d, mat] of [
        [0, s / 2 + 0.012, s + 0.05, 0.025, bumper],
        [0, -s / 2 - 0.012, s + 0.05, 0.025, bumper],
        [s / 2 + 0.012, 0, 0.025, s, plainBumper],
        [-s / 2 - 0.012, 0, 0.025, s, plainBumper],
    ] as const)
        group.add(box(w, 0.035, d, mat, x, 0.03, z));
    for (const x of [-1, 1])
        for (const z of [-1, 1]) {
            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.016, 20), m.rubber);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(x * (s / 2 - 0.02), 0.022, z * (s / 2 - 0.04));
            group.add(wheel);
        }
    // Elevator mast and a carriage partway up it.
    for (const x of [-0.04, 0.04]) group.add(box(0.012, 0.26, 0.012, aluminium, x, 0.17, -0.05));
    group.add(box(0.1, 0.035, 0.05, m.blackMetal, 0, 0.16, -0.025));
    group.add(box(0.08, 0.05, 0.08, new THREE.MeshStandardMaterial({ color: 0x2d2d30, roughness: 0.6 }), 0, 0.07, 0.04));
    return group;
}

export interface RugStop {
    year: string;
    title: string;
    icon: string;
}

/**
 * Line drawings for the rug's badges, in a box of `s` centred on the origin.
 * Drawn as thread: one stroke weight, round ends, nothing filled.
 */
const ICONS: Record<string, (g: CanvasRenderingContext2D, s: number) => void> = {
    music(g, s) {
        // Two beamed eighth notes.
        const h = s * 0.42;
        g.beginPath();
        g.ellipse(-s * 0.2, h * 0.55, s * 0.12, s * 0.09, -0.4, 0, Math.PI * 2);
        g.ellipse(s * 0.22, h * 0.4, s * 0.12, s * 0.09, -0.4, 0, Math.PI * 2);
        g.moveTo(-s * 0.09, h * 0.5);
        g.lineTo(-s * 0.09, -h);
        g.lineTo(s * 0.33, -h * 1.15);
        g.lineTo(s * 0.33, h * 0.35);
        g.moveTo(-s * 0.09, -h * 0.62);
        g.lineTo(s * 0.33, -h * 0.77);
        g.stroke();
    },
    code(g, s) {
        const w = s * 0.42;
        g.beginPath();
        g.moveTo(-w * 0.45, -w * 0.6);
        g.lineTo(-w, 0);
        g.lineTo(-w * 0.45, w * 0.6);
        g.moveTo(w * 0.45, -w * 0.6);
        g.lineTo(w, 0);
        g.lineTo(w * 0.45, w * 0.6);
        g.moveTo(w * 0.18, -w * 0.75);
        g.lineTo(-w * 0.18, w * 0.75);
        g.stroke();
    },
    school(g, s) {
        const w = s * 0.4;
        g.beginPath();
        g.rect(-w, -w * 0.1, w * 2, w * 0.95);
        g.moveTo(-w * 1.15, -w * 0.1);
        g.lineTo(0, -w * 0.75);
        g.lineTo(w * 1.15, -w * 0.1);
        g.rect(-w * 0.2, w * 0.35, w * 0.4, w * 0.5);
        g.moveTo(0, -w * 0.75);
        g.lineTo(0, -w * 1.15);
        g.lineTo(w * 0.35, -w * 1.02);
        g.lineTo(0, -w * 0.9);
        for (const x of [-w * 0.65, w * 0.65]) g.rect(x - w * 0.15, w * 0.1, w * 0.3, w * 0.25);
        g.stroke();
    },
    club(g, s) {
        // Three people, the middle one a step forward.
        const person = (x: number, y: number, r: number) => {
            g.moveTo(x + r, y);
            g.arc(x, y, r, 0, Math.PI * 2);
            g.moveTo(x - r * 1.7, y + r * 3.2);
            g.quadraticCurveTo(x, y + r * 0.9, x + r * 1.7, y + r * 3.2);
        };
        g.beginPath();
        person(-s * 0.26, -s * 0.12, s * 0.09);
        person(s * 0.26, -s * 0.12, s * 0.09);
        person(0, -s * 0.2, s * 0.11);
        g.stroke();
    },
    robot(g, s) {
        const w = s * 0.32;
        g.beginPath();
        g.roundRect(-w, -w * 0.55, w * 2, w * 1.5, w * 0.25);
        g.moveTo(0, -w * 0.55);
        g.lineTo(0, -w * 1.05);
        g.moveTo(w * 0.12, -w * 1.15);
        g.arc(0, -w * 1.15, w * 0.12, 0, Math.PI * 2);
        g.moveTo(-w * 0.3 + w * 0.16, w * 0.05);
        g.arc(-w * 0.4, w * 0.05, w * 0.16, 0, Math.PI * 2);
        g.moveTo(w * 0.56, w * 0.05);
        g.arc(w * 0.4, w * 0.05, w * 0.16, 0, Math.PI * 2);
        g.moveTo(-w * 0.4, w * 0.6);
        g.lineTo(w * 0.4, w * 0.6);
        g.moveTo(-w, w * 0.2);
        g.lineTo(-w * 1.3, w * 0.2);
        g.moveTo(w, w * 0.2);
        g.lineTo(w * 1.3, w * 0.2);
        g.stroke();
    },
    app(g, s) {
        // A phone with a bar chart: an app that explains what's changing.
        const w = s * 0.26;
        const h = s * 0.46;
        g.beginPath();
        g.roundRect(-w, -h, w * 2, h * 2, w * 0.35);
        g.moveTo(-w * 0.3, -h * 0.78);
        g.lineTo(w * 0.3, -h * 0.78);
        for (const [x, top] of [[-w * 0.45, 0.25], [0, -0.15], [w * 0.45, -0.45]] as const) {
            g.moveTo(x, h * 0.55);
            g.lineTo(x, h * top);
        }
        g.stroke();
    },
    flag(g, s) {
        const h = s * 0.46;
        g.beginPath();
        g.moveTo(-s * 0.22, h);
        g.lineTo(-s * 0.22, -h);
        g.moveTo(-s * 0.22, -h * 0.95);
        g.quadraticCurveTo(0, -h * 1.15, s * 0.1, -h * 0.85);
        g.quadraticCurveTo(s * 0.22, -h * 0.6, s * 0.36, -h * 0.75);
        g.lineTo(s * 0.36, -h * 0.05);
        g.quadraticCurveTo(s * 0.22, h * 0.1, s * 0.1, -h * 0.12);
        g.quadraticCurveTo(0, -h * 0.4, -s * 0.22, -h * 0.2);
        g.moveTo(-s * 0.4, h);
        g.lineTo(-s * 0.04, h);
        g.stroke();
    },
};

/**
 * The rug, with the path woven in: a stitched line that winds through every
 * stop, each with its year. `paint(selected)` re-draws it with one stop lit.
 * Stop positions come back in UV space so a click on the rug can find them.
 */
export function pathRug(stops: RugStop[], width: number, depth: number) {
    const W = 1536;
    const H = Math.round((W * depth) / width);
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const g = canvas.getContext("2d")!;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;

    // A snake across the rug: left to right, a turn, right to left.
    const points = stops.map((_, i) => {
        const t = i / (stops.length - 1);
        const x = 0.14 + 0.72 * t;
        const y = 0.5 + 0.26 * Math.sin(t * Math.PI * 2.2 + 0.4);
        return { x, y };
    });

    // Speckle once; the rest is redrawn per selection on top of it.
    const base = document.createElement("canvas");
    base.width = W;
    base.height = H;
    const b = base.getContext("2d")!;
    b.fillStyle = "#3a3935";
    b.fillRect(0, 0, W, H);
    let seed = 11;
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < 26000; i++) {
        b.fillStyle = `rgba(${rand() < 0.5 ? "255,255,255" : "0,0,0"},0.05)`;
        b.fillRect(rand() * W, rand() * H, 2, 2);
    }
    b.strokeStyle = "rgba(230,220,200,0.28)";
    b.lineWidth = 8;
    b.strokeRect(40, 40, W - 80, H - 80);
    b.lineWidth = 2;
    b.strokeRect(62, 62, W - 124, H - 124);

    let painted = -2;
    const R = 62; // badge radius, in texture pixels
    function paint(selected: number) {
        if (selected === painted) return;
        painted = selected;
        g.drawImage(base, 0, 0);
        const thread = "rgba(226,214,190,0.85)";
        const gold = "#f3c76b";
        // The path: a running stitch that passes through every stop. Catmull–Rom
        // through the points, as Béziers, so it meets each badge dead centre.
        const at = points.map((p) => ({ x: p.x * W, y: p.y * H }));
        g.save();
        g.strokeStyle = "rgba(226,214,190,0.6)";
        g.lineWidth = 5;
        g.setLineDash([18, 12]);
        g.lineCap = "round";
        g.beginPath();
        g.moveTo(at[0].x, at[0].y);
        for (let i = 0; i < at.length - 1; i++) {
            const p0 = at[Math.max(0, i - 1)];
            const p1 = at[i];
            const p2 = at[i + 1];
            const p3 = at[Math.min(at.length - 1, i + 2)];
            g.bezierCurveTo(p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6, p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6, p2.x, p2.y);
        }
        g.stroke();
        g.restore();
        const hand = `"Patrick Hand", "Segoe Print", cursive`;
        at.forEach(({ x, y }, i) => {
            const lit = i === selected;
            const ink = lit ? gold : thread;
            g.save();
            g.translate(x, y);
            // The badge: a darker patch with a stitched edge, the icon inside.
            g.beginPath();
            g.arc(0, 0, R, 0, Math.PI * 2);
            g.fillStyle = lit ? "#3b3224" : "#2b2a27";
            g.fill();
            g.lineWidth = lit ? 6 : 4;
            g.strokeStyle = ink;
            g.setLineDash(lit ? [] : [10, 7]);
            g.stroke();
            g.setLineDash([]);
            g.beginPath();
            g.arc(0, 0, R - 11, 0, Math.PI * 2);
            g.lineWidth = 1.5;
            g.strokeStyle = lit ? "rgba(243,199,107,0.45)" : "rgba(226,214,190,0.25)";
            g.stroke();
            if (lit) {
                g.beginPath();
                g.arc(0, 0, R + 16, 0, Math.PI * 2);
                g.strokeStyle = "rgba(243,199,107,0.35)";
                g.lineWidth = 3;
                g.stroke();
            }
            g.strokeStyle = ink;
            g.lineWidth = lit ? 6 : 5;
            g.lineCap = g.lineJoin = "round";
            (ICONS[stops[i].icon] ?? ICONS.flag)(g, R * 1.15);
            g.restore();
            // The year sits on the outside of the curve, clear of the path.
            const above = i === 0 ? at[1].y > y : i === at.length - 1 ? at[i - 1].y > y : (at[i - 1].y + at[i + 1].y) / 2 > y;
            g.fillStyle = ink;
            g.font = `${lit ? 54 : 46}px ${hand}`;
            g.textAlign = "center";
            g.fillText(stops[i].year, x, above ? y - R - 22 : y + R + 52);
        });
        texture.needsUpdate = true;
    }
    paint(-1);

    /** The stop nearest a point on the rug (UV, origin bottom-left), if one is close. */
    function stopAt(uv: THREE.Vector2) {
        let best = -1;
        let distance = 0.06;
        points.forEach((p, i) => {
            const d = Math.hypot((uv.x - p.x) * (width / depth), 1 - uv.y - p.y);
            if (d < distance) {
                distance = d;
                best = i;
            }
        });
        return best;
    }

    return { texture, paint, stopAt };
}
