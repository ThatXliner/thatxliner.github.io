import * as THREE from "three";
import { FullScreenQuad } from "three/addons/postprocessing/Pass.js";

/**
 * The last thing drawn: the finished room, plus whatever sits over it that
 * should look like it's made of something. Two layers, both in one pass:
 *
 *   scrims  soft dark pools behind the words, so type reads over the room;
 *   lenses  pill-shaped glass under the outline buttons. Clear, not frosted:
 *           it magnifies the room a touch, bends it inward at the rim with a
 *           hairline of colour split, and catches light along its top edge.
 *
 * Glass has to be here rather than in CSS: it bends real pixels of the room,
 * and only the canvas has them. The buttons stay ordinary links on top.
 */

export const MAX_LENSES = 8;
export const MAX_SCRIMS = 4;

export interface Lens {
    /** CSS pixels, from the canvas's top-left. */
    rect: DOMRect;
    /** 0–1, follows the words it belongs to. */
    opacity: number;
    /** 0 at rest, 1 hovered, a little more while pressed. Springy. */
    lift: number;
}

export interface Scrim {
    rect: DOMRect;
    opacity: number;
}

const fragmentShader = /* glsl */ `
precision highp float;
uniform sampler2D tScene;
uniform vec2 uResolution;
uniform float uDpr;
uniform int uLensCount;
uniform vec4 uLens[${MAX_LENSES}];
uniform vec2 uLensState[${MAX_LENSES}];
uniform int uScrimCount;
uniform vec4 uScrim[${MAX_SCRIMS}];
uniform float uScrimAlpha[${MAX_SCRIMS}];

float sdPill(vec2 p, vec2 halfSize) {
    float r = halfSize.y;
    vec2 q = abs(p) - halfSize + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

vec3 scene(vec2 frag) {
    return texture2D(tScene, clamp(frag / uResolution, 0.0, 1.0)).rgb;
}

void main() {
    vec2 frag = gl_FragCoord.xy;
    vec3 col = scene(frag);

    // Scrims: an elliptical pool, 0.7 at the centre, 0.35 by 60%, gone at the edge.
    for (int i = 0; i < ${MAX_SCRIMS}; i++) {
        if (i >= uScrimCount) break;
        vec4 r = uScrim[i];
        vec2 radii = r.zw * vec2(0.85, 0.95);
        float t = length((frag - (r.xy + r.zw * 0.5)) / radii);
        float dark = t < 0.6 ? mix(0.7, 0.35, t / 0.6) : mix(0.35, 0.0, clamp((t - 0.6) / 0.4, 0.0, 1.0));
        col *= 1.0 - dark * uScrimAlpha[i];
    }

    for (int i = 0; i < ${MAX_LENSES}; i++) {
        if (i >= uLensCount) break;
        float alpha = uLensState[i].x;
        if (alpha < 0.002) continue;
        float lift = uLensState[i].y;
        vec4 r = uLens[i];
        vec2 halfSize = r.zw * 0.5;
        vec2 centre = r.xy + halfSize;
        vec2 p = frag - centre;
        float d = sdPill(p, halfSize);

        // A soft shadow on the room, just below.
        float s = sdPill(p - vec2(0.0, -5.0 * uDpr), halfSize);
        float shadow = exp(-max(s, 0.0) / (9.0 * uDpr)) * (0.1 + 0.08 * lift);
        col *= 1.0 - shadow * alpha * smoothstep(-0.5, 1.5, d);

        if (d > 1.0) continue;
        // Outward normal, from the distance field.
        float e = 0.75;
        vec2 n = normalize(vec2(sdPill(p + vec2(e, 0.0), halfSize) - sdPill(p - vec2(e, 0.0), halfSize),
                                sdPill(p + vec2(0.0, e), halfSize) - sdPill(p - vec2(0.0, e), halfSize)) + 1e-5);
        float rim = 1.0 - clamp(-d / (halfSize.y * 0.95), 0.0, 1.0); // 1 at the edge, 0 deep inside

        // Magnify a little, more when lifted, and bend inward near the rim.
        float magnify = 1.0 / (1.03 + 0.06 * lift);
        float bend = pow(rim, 2.6) * (8.0 + 5.0 * lift) * uDpr;
        vec2 at = centre + p * magnify - n * bend;
        // The colours separate only right at the rim.
        float split = pow(rim, 3.5) * 1.8 * uDpr;
        vec3 glass = vec3(scene(at - n * split).r, scene(at).g, scene(at + n * split).b);

        // A clear body that lifts the room a hair.
        glass = mix(glass, vec3(1.0), 0.015 + 0.03 * lift);
        // Darker band where the light refracts away, just inside the rim.
        glass *= 1.0 - 0.12 * smoothstep(0.5, 0.82, rim) * (1.0 - smoothstep(0.9, 1.0, rim));
        // Fresnel: the very edge takes the colour of the sky.
        glass += vec3(0.85, 0.92, 1.0) * pow(rim, 9.0) * 0.16;
        // A bright edge, strongest where it faces the light (up and left).
        float facing = 0.5 + 0.5 * dot(n, normalize(vec2(-0.55, 0.85)));
        glass += (1.0 - smoothstep(0.0, 1.1 * uDpr, -d)) * (0.05 + 0.34 * facing * facing);
        // A long soft streak across the upper left, a small glint lower right.
        vec2 q = p / halfSize;
        float streak = exp(-pow((q.y - 0.5) / 0.16, 2.0)) * smoothstep(-0.95, -0.35, q.x) * (1.0 - smoothstep(0.05, 0.6, q.x));
        float glint = exp(-dot((q - vec2(0.8, -0.5)) * vec2(3.5, 6.0), (q - vec2(0.8, -0.5)) * vec2(3.5, 6.0)));
        glass += vec3(1.0) * (streak * (0.045 + 0.05 * lift) + glint * 0.07);

        float inside = smoothstep(0.75 * uDpr, -0.75 * uDpr, d);
        col = mix(col, glass, inside * alpha);
    }

    gl_FragColor = vec4(col, 1.0);
}
`;

export function createGlass() {
    const lenses = Array.from({ length: MAX_LENSES }, () => new THREE.Vector4());
    const lensState = Array.from({ length: MAX_LENSES }, () => new THREE.Vector2());
    const scrims = Array.from({ length: MAX_SCRIMS }, () => new THREE.Vector4());
    const scrimAlpha = new Array(MAX_SCRIMS).fill(0);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            tScene: { value: null },
            uResolution: { value: new THREE.Vector2(1, 1) },
            uDpr: { value: 1 },
            uLensCount: { value: 0 },
            uLens: { value: lenses },
            uLensState: { value: lensState },
            uScrimCount: { value: 0 },
            uScrim: { value: scrims },
            uScrimAlpha: { value: scrimAlpha },
        },
        vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
        fragmentShader,
        depthTest: false,
        depthWrite: false,
    });
    const quad = new FullScreenQuad(material);

    /** CSS rect → device pixels with the origin at the bottom-left, as gl_FragCoord has it. */
    const toDevice = (rect: DOMRect, out: THREE.Vector4, cssHeight: number, dpr: number) =>
        out.set(rect.left * dpr, (cssHeight - rect.bottom) * dpr, rect.width * dpr, rect.height * dpr);

    function set(layers: { lenses: Lens[]; scrims: Scrim[] }, cssHeight: number, dpr: number) {
        const u = material.uniforms;
        u.uDpr.value = dpr;
        const visibleLenses = layers.lenses.filter((lens) => lens.opacity > 0.002).slice(0, MAX_LENSES);
        visibleLenses.forEach((lens, i) => {
            toDevice(lens.rect, lenses[i], cssHeight, dpr);
            lensState[i].set(lens.opacity, lens.lift);
        });
        u.uLensCount.value = visibleLenses.length;
        const visibleScrims = layers.scrims.filter((scrim) => scrim.opacity > 0.002).slice(0, MAX_SCRIMS);
        visibleScrims.forEach((scrim, i) => {
            toDevice(scrim.rect, scrims[i], cssHeight, dpr);
            scrimAlpha[i] = scrim.opacity;
        });
        u.uScrimCount.value = visibleScrims.length;
    }

    function draw(renderer: THREE.WebGLRenderer, scene: THREE.Texture) {
        const size = renderer.getDrawingBufferSize(material.uniforms.uResolution.value);
        material.uniforms.uResolution.value.copy(size);
        material.uniforms.tScene.value = scene;
        renderer.setRenderTarget(null);
        quad.render(renderer);
    }

    return {
        set,
        draw,
        dispose() {
            material.dispose();
            quad.dispose();
        },
    };
}
