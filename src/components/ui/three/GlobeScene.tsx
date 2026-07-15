import * as THREE from "three";
import { useThreeScene } from "./useThreeScene";

const POINT_COUNT = 1800;
const ARC_COUNT = 7;
const ARC_SEGMENTS = 64;
const RADIUS = 1.55;

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aPhase;
  varying float vAlpha;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uPixelRatio * (11.0 / -mv.z);
    // Fade points on the far side of the globe (camera looks down -z).
    float facing = smoothstep(-1.2, 0.9, mv.z + 4.6);
    vAlpha = (0.35 + 0.35 * sin(uTime * 1.2 + aPhase * 6.0)) * facing;
  }
`;

const FRAGMENT = /* glsl */ `
  varying float vAlpha;

  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float alpha = smoothstep(0.5, 0.1, d) * vAlpha;
    gl_FragColor = vec4(vec3(0.55, 0.78, 1.0), alpha);
  }
`;

/** Point on the unit sphere via fibonacci spiral for even coverage. */
function fibonacciPoint(i: number, n: number, out: THREE.Vector3) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (i / (n - 1)) * 2;
  const r = Math.sqrt(1 - y * y);
  const theta = golden * i;
  return out.set(Math.cos(theta) * r, y, Math.sin(theta) * r);
}

/** Arc between two surface points, bulging outward proportional to distance. */
function makeArcGeometry(a: THREE.Vector3, b: THREE.Vector3) {
  const angle = a.angleTo(b);
  const points: THREE.Vector3[] = [];
  // lerp a→b re-projected onto the sphere, lifted by a sine bump
  for (let i = 0; i <= ARC_SEGMENTS; i++) {
    const t = i / ARC_SEGMENTS;
    const p = a
      .clone()
      .normalize()
      .lerp(b.clone().normalize(), t)
      .normalize()
      .multiplyScalar(RADIUS * (1 + Math.sin(Math.PI * t) * 0.16 * angle));
    points.push(p);
  }
  return new THREE.BufferGeometry().setFromPoints(points);
}

export default function GlobeScene({ className }: { className?: string }) {
  const containerRef = useThreeScene(
    (scene, camera, container) => {
      const globe = new THREE.Group();
      globe.rotation.z = 0.25;
      scene.add(globe);

      // Surface points
      const positions = new Float32Array(POINT_COUNT * 3);
      const phases = new Float32Array(POINT_COUNT);
      const v = new THREE.Vector3();
      for (let i = 0; i < POINT_COUNT; i++) {
        fibonacciPoint(i, POINT_COUNT, v).multiplyScalar(RADIUS);
        positions[i * 3] = v.x;
        positions[i * 3 + 1] = v.y;
        positions[i * 3 + 2] = v.z;
        phases[i] = Math.random() * Math.PI * 2;
      }
      const pointsGeo = new THREE.BufferGeometry();
      pointsGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
      pointsGeo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

      const pointsMat = new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      globe.add(new THREE.Points(pointsGeo, pointsMat));

      // Connection arcs that draw themselves on, hold, then fade
      const arcMats: THREE.LineBasicMaterial[] = [];
      const arcGeos: THREE.BufferGeometry[] = [];
      const arcOffsets: number[] = [];
      const a = new THREE.Vector3();
      const b = new THREE.Vector3();
      for (let i = 0; i < ARC_COUNT; i++) {
        fibonacciPoint(
          Math.floor(Math.random() * POINT_COUNT),
          POINT_COUNT,
          a,
        );
        fibonacciPoint(
          Math.floor(Math.random() * POINT_COUNT),
          POINT_COUNT,
          b,
        );
        const geo = makeArcGeometry(a, b);
        const mat = new THREE.LineBasicMaterial({
          color: new THREE.Color("#a78bfa"),
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        arcGeos.push(geo);
        arcMats.push(mat);
        arcOffsets.push(Math.random() * 10);
        globe.add(new THREE.Line(geo, mat));
      }

      camera.lookAt(0, 0, 0);

      // The globe leans gently toward the cursor (tracked window-wide since
      // the canvas itself is pointer-events-none).
      const lean = { x: 0, y: 0, targetX: 0, targetY: 0 };
      const onPointerMove = (e: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        const px = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
        const py = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
        lean.targetY = Math.max(-0.5, Math.min(0.5, px)) * 0.22;
        lean.targetX = Math.max(-0.5, Math.min(0.5, py)) * 0.15;
      };
      window.addEventListener("pointermove", onPointerMove);

      return {
        update(elapsed) {
          pointsMat.uniforms.uTime.value = elapsed;
          lean.x += (lean.targetX - lean.x) * 0.04;
          lean.y += (lean.targetY - lean.y) * 0.04;
          globe.rotation.x = lean.x;
          globe.rotation.y = elapsed * 0.08 + lean.y;

          for (let i = 0; i < ARC_COUNT; i++) {
            const cycle = 9;
            const t = ((elapsed + arcOffsets[i]) % cycle) / cycle;
            const geo = arcGeos[i];
            if (t < 0.35) {
              // draw on
              const progress = t / 0.35;
              geo.setDrawRange(0, Math.floor(progress * (ARC_SEGMENTS + 1)));
              arcMats[i].opacity = 0.55;
            } else if (t < 0.7) {
              geo.setDrawRange(0, ARC_SEGMENTS + 1);
              arcMats[i].opacity = 0.55 * (1 - (t - 0.35) / 0.35);
            } else {
              arcMats[i].opacity = 0;
            }
          }
        },
        dispose() {
          window.removeEventListener("pointermove", onPointerMove);
          pointsGeo.dispose();
          pointsMat.dispose();
          arcGeos.forEach((g) => g.dispose());
          arcMats.forEach((m) => m.dispose());
        },
      };
    },
    { fov: 45, cameraPosition: [0, 0, 4.6] },
  );

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    />
  );
}
