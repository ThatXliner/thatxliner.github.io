import { useRef } from "react";
import * as THREE from "three";
import { useThreeScene } from "./useThreeScene";

// A calm "digital ocean": a structured grid of points forming one coherent
// swell, low in the frame, in the same blue family as the light rays above.
// The pointer disturbs the surface — ripples radiate from wherever it hovers.
const COLS = 240;
const ROWS = 72;
const WIDTH = 46;
const DEPTH = 26;

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uMouse;          // pointer projected into the wave plane (xz)
  uniform float uMouseStrength; // eases in on entry, decays when idle
  uniform float uChurn;         // scroll velocity agitates the water
  varying float vHeight;
  varying float vFade;
  varying float vGlow;

  float swell(vec2 p, float t) {
    // Three wave trains at different angles/speeds — organic, not gridded.
    float h = 0.0;
    h += sin(dot(p, vec2(0.28, 0.11)) + t * 0.55) * 0.55;
    h += sin(dot(p, vec2(-0.10, 0.34)) + t * 0.38) * 0.4;
    h += sin(dot(p, vec2(0.06, -0.20)) + t * 0.8) * 0.22;
    // Long slow ground swell underneath.
    h += sin(p.x * 0.045 + t * 0.18) * 0.9;
    return h;
  }

  void main() {
    vec3 pos = position;
    float h = swell(pos.xz, uTime) * (1.0 + uChurn * 0.55);

    // Pointer ripple: rings radiating out from the cursor, exponentially damped.
    float d = distance(pos.xz, uMouse);
    float ripple = sin(d * 2.2 - uTime * 2.6) * exp(-d * 0.5) * uMouseStrength;
    h += ripple * 0.45;
    vGlow = exp(-d * 0.45) * uMouseStrength;

    pos.y += h;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uPixelRatio * (26.0 / -mv.z);

    vHeight = smoothstep(-1.4, 1.6, h);
    // Fade toward the horizon and the side edges — no hard clip.
    float depthFade = smoothstep(-30.0, -6.0, mv.z);
    float edgeFade = smoothstep(23.0, 13.0, abs(position.x));
    vFade = depthFade * edgeFade;
  }
`;

const FRAGMENT = /* glsl */ `
  varying float vHeight;
  varying float vFade;
  varying float vGlow;

  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.12, d) * vFade;
    // Troughs sink into deep indigo, crests catch a sky-blue light.
    vec3 deep = vec3(0.16, 0.17, 0.42);   // indigo
    vec3 crest = vec3(0.49, 0.83, 0.99);  // sky
    vec3 color = mix(deep, crest, vHeight);
    // Points near the cursor catch extra light.
    color += crest * vGlow * 0.3;
    gl_FragColor = vec4(color, min(alpha * (0.85 + vGlow * 0.2), 1.0));
  }
`;

export default function HeroScene() {
  const pointer = useRef({
    ndc: new THREE.Vector2(),
    active: false,
    moved: false,
  });

  const containerRef = useThreeScene(
    (scene, camera) => {
      const positions = new Float32Array(COLS * ROWS * 3);
      let i = 0;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          positions[i++] = (c / (COLS - 1) - 0.5) * WIDTH; // x
          positions[i++] = 0; // y (displaced in the shader)
          positions[i++] = -(r / (ROWS - 1)) * DEPTH + 4; // z
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );

      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
          uMouse: { value: new THREE.Vector2(0, -100) }, // start far away
          uMouseStrength: { value: 0 },
          uChurn: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const points = new THREE.Points(geometry, material);
      const SURFACE_Y = -2.5; // keep the surface in the lower half
      points.position.y = SURFACE_Y;
      scene.add(points);

      const raycaster = new THREE.Raycaster();
      const wavePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -SURFACE_Y);
      const hit = new THREE.Vector3();
      const rippleTarget = new THREE.Vector2(0, -100);

      const onPointerMove = (e: PointerEvent) => {
        pointer.current.ndc.set(
          (e.clientX / window.innerWidth) * 2 - 1,
          -(e.clientY / window.innerHeight) * 2 + 1,
        );
        pointer.current.active = true;
        pointer.current.moved = true;
      };
      const onPointerLeave = () => {
        pointer.current.active = false;
      };
      window.addEventListener("pointermove", onPointerMove);
      document.documentElement.addEventListener(
        "pointerleave",
        onPointerLeave,
      );

      // Scroll state: leaving the hero dives the camera toward the surface,
      // and scroll speed churns the water.
      let smoothScroll = 0;
      let churn = 0;
      let lastScrollY = window.scrollY;

      return {
        update(elapsed) {
          material.uniforms.uTime.value = elapsed;

          const scroll = Math.min(window.scrollY / window.innerHeight, 1);
          smoothScroll += (scroll - smoothScroll) * 0.06;
          const velocity = Math.min(
            Math.abs(window.scrollY - lastScrollY) / 60,
            1,
          );
          lastScrollY = window.scrollY;
          churn += (velocity - churn) * 0.04;
          material.uniforms.uChurn.value = churn;

          // Project the cursor onto the wave surface and trail toward it.
          if (pointer.current.moved) {
            raycaster.setFromCamera(pointer.current.ndc, camera);
            if (raycaster.ray.intersectPlane(wavePlane, hit)) {
              rippleTarget.set(hit.x, hit.z);
            }
            pointer.current.moved = false;
          }
          const uMouse = material.uniforms.uMouse.value as THREE.Vector2;
          uMouse.lerp(rippleTarget, 0.08);

          const strength = material.uniforms.uMouseStrength;
          const target = pointer.current.active ? 1 : 0;
          strength.value += (target - strength.value) * 0.05;

          // Barely-there pointer parallax, plus the scroll dive: the camera
          // sinks toward the surface and pushes forward as you leave the hero.
          const baseY = 1.4 - smoothScroll * 2.1;
          const baseZ = 9 - smoothScroll * 3.5;
          camera.position.x +=
            (pointer.current.ndc.x * 0.22 - camera.position.x) * 0.02;
          camera.position.y +=
            (baseY + pointer.current.ndc.y * 0.1 - camera.position.y) * 0.04;
          camera.position.z += (baseZ - camera.position.z) * 0.04;
          camera.lookAt(0, -1.6 - smoothScroll * 0.8, -6);
        },
        dispose() {
          window.removeEventListener("pointermove", onPointerMove);
          document.documentElement.removeEventListener(
            "pointerleave",
            onPointerLeave,
          );
          geometry.dispose();
          material.dispose();
        },
      };
    },
    { fov: 50, cameraPosition: [0, 1.4, 9] },
  );

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    />
  );
}
