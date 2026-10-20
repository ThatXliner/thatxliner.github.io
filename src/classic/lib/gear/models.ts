import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { type Body, type Lens } from "@/classic/lib/gear/catalog";

/** Blender-authored meshes with optical elements, surface normals and engraved controls. */
export async function loadModelLibrary(initialIds: string[], urls: Record<string,string> = {}) {
  // Decode compressed meshes off the UI thread when workers are available.
  if (typeof Worker !== "undefined") MeshoptDecoder.useWorkers(1);
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const models = new Map<string, THREE.Group>();
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const pending = new Map<string, Promise<void>>();
  let disposed = false;
  function dispose() {
    disposed = true;
    for (const resource of [...geometries, ...materials, ...textures])
      resource.dispose();
    for (const texture of textures) {
      if (
        typeof ImageBitmap !== "undefined" &&
        texture.source.data instanceof ImageBitmap
      )
        texture.source.data.close();
    }
    geometries.clear();
    materials.clear();
    textures.clear();
    models.clear();
  }
  async function load(ids: string[]) {
    const results = await Promise.allSettled(
      ids.map((id) => {
        if (models.has(id)) return Promise.resolve();
        const existing = pending.get(id);
        if (existing) return existing;
        const request = (async () => {
          const { scene } = await loader.loadAsync(urls[id] ?? `/models/gear/${id}.glb`);
          scene.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) return;
            geometries.add(object.geometry);
            const opticalNormal = object.geometry.getAttribute("_optical_normal");
            if (opticalNormal) {
              // Keep polished reflections smooth without enlarging every normal
              // buffer or the environment map. Reuse the decoded attribute.
              // Blender's joined body also carries zero-filled copies of this
              // attribute on non-optical primitives. Keep their authored normals.
              const meshMaterials = Array.isArray(object.material)
                ? object.material
                : [object.material];
              if (meshMaterials.every((material) =>
                /^(Optical glass|Inner optical glass|R7 ocular glass|40D ocular glass|C200 ocular glass)/.test(material.name),
              )) object.geometry.setAttribute("normal", opticalNormal);
              object.geometry.deleteAttribute("_optical_normal");
            }
            object.castShadow = true;
            object.receiveShadow = true;
            for (const material of Array.isArray(object.material)
              ? object.material
              : [object.material]) {
              if (materials.has(material)) {
                if (
                  material instanceof THREE.MeshPhysicalMaterial &&
                  (material.transmission > 0 || material.transparent)
                )
                  object.castShadow = false;
                continue;
              }
              materials.add(material);
              if (
                material instanceof THREE.MeshStandardMaterial &&
                material.aoMap
              )
                material.aoMapIntensity = 0.8;
              if (
                material instanceof THREE.MeshStandardMaterial &&
                material.normalMap
              ) {
                // GLTF can share one normal texture between rubber and
                // painted metal. Each finish needs its own grain scale.
                textures.add(material.normalMap);
                material.normalMap = material.normalMap.clone();
              }
              for (const value of Object.values(material))
                if (value instanceof THREE.Texture) {
                  value.anisotropy = 4;
                  if (
                    value ===
                      (material as THREE.MeshStandardMaterial).normalMap ||
                    ((/Pebbled rubber|Scanned grip rubber|Molded grip rubber|White enamel/.test(material.name) ||
                      ((id === "r7" || id === "40d" || id === "c200") && material.name.includes("Crinkle painted metal"))) &&
                      (value ===
                        (material as THREE.MeshStandardMaterial).roughnessMap ||
                        value ===
                          (material as THREE.MeshStandardMaterial)
                            .metalnessMap))
                  ) {
                    value.wrapS = value.wrapT = THREE.RepeatWrapping;
                    const grain = /^(R7|40D|C200) |^White enamel/.test(material.name)
                      ? 1
                      : material.name.includes("Scanned grip rubber")
                      ? (id === "r7" || id === "40d")
                        ? 1.6
                        : 1.25
                      : material.name.includes("Crinkle painted metal")
                        ? 6
                        : /Pebbled rubber|Molded grip rubber/.test(material.name)
                          ? 3
                          : 5;
                    value.repeat.set(grain, grain);
                  }
                  textures.add(value);
                }
              if (
                material instanceof THREE.MeshStandardMaterial &&
                material.normalMap
              )
                material.normalScale.multiplyScalar(
                  /^(R7|40D|C200) |^White enamel/.test(material.name)
                    ? 1
                    : material.name.includes("Molded grip rubber")
                    ? 0.3
                    : /Pebbled rubber|Scanned grip rubber/.test(material.name)
                    ? (id === "r7" || id === "40d")
                      ? 0.4
                      : 0.35
                    : 0.6,
                );
              // The matte focusing screen also transmits light; preserve its authored finish.
              if (
                material instanceof THREE.MeshPhysicalMaterial &&
                material.transmission > 0 &&
                /^(Optical glass|Inner optical glass)/.test(material.name)
              ) {
                material.iridescence = 1;
                material.iridescenceIOR = 1.38;
                // Reference-guided 50mm coating tint; not Canon's multilayer prescription.
                material.iridescenceThicknessRange = id === "50" ? [90, 90] : [110, 125];
                material.clearcoat = 0;
                material.side = THREE.FrontSide;
                // Screen-space transmission does not resolve stacked
                // refractive groups. Approximate the curved outer element
                // with finite thickness and a separate coated reflection layer.
                const inner = material.name.includes("Inner");
                material.transmission = inner ? 0 : 1;
                material.thickness = inner
                  ? 0
                  : id === "28-135"
                    ? 0.16
                    : id === "35"
                      ? 0.12
                      : 0.06;
                if (!inner && (id === "28-135" || id === "50" || id === "70-200-f4" || id === "70-200-f28" || id === "35")) {
                  // Match each modeled front element's center/edge thickness.
                  // glTF mesh quantization moves a
                  // uniform scale onto the node; compensate because Three
                  // multiplies volume thickness by that scale in the shader.
                  object.updateWorldMatrix(true, false);
                  const scale = object.getWorldScale(new THREE.Vector3()).x;
                  const centerThickness = id === "70-200-f28" ? 0.160 : id === "35" ? 0.030 : id === "50" ? 0.085 : id === "70-200-f4" ? 0.050 : 0.02764;
                  const edgeThickness = id === "70-200-f28" ? 0.038 : id === "35" ? 0.025 : id === "50" ? 0.006 : id === "70-200-f4" ? 0.030 : 0.12594;
                  const maxThickness = Math.max(centerThickness, edgeThickness);
                  material.thickness = maxThickness / scale;
                  const geometry = object.geometry;
                  geometry.computeBoundingBox();
                  const bounds = geometry.boundingBox!;
                  const positions = geometry.getAttribute("position");
                  const uv = new Float32Array(positions.count * 2);
                  for (let i = 0; i < positions.count; i++) {
                    uv[i * 2] = (positions.getX(i) - bounds.min.x) / (bounds.max.x - bounds.min.x);
                    uv[i * 2 + 1] = (positions.getY(i) - bounds.min.y) / (bounds.max.y - bounds.min.y);
                  }
                  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
                  const size = 64;
                  const pixels = new Uint8Array(size * size * 4);
                  const sag = centerThickness - edgeThickness;
                  const sphereRadius = (0.278 ** 2 + sag ** 2) / (2 * sag);
                  for (let y = 0; y < size; y++) {
                    for (let x = 0; x < size; x++) {
                      const r2 = Math.min(1, ((x + 0.5) / size * 2 - 1) ** 2 + ((y + 0.5) / size * 2 - 1) ** 2);
                      const offset = (y * size + x) * 4;
                      // The 50mm's spherical front cap has a planar rear face.
                      // Use its actual sag instead of a parabolic interpolation.
                      const thickness = id === "50"
                        ? edgeThickness + Math.sqrt(sphereRadius ** 2 - 0.278 ** 2 * r2) - (sphereRadius - sag)
                        : id === "28-135"
                        ? edgeThickness + [0.08090, 0.17920].map((sag) => {
                            const radius = (0.569687 ** 2 + sag ** 2) / (2 * sag);
                            return Math.sqrt(radius ** 2 - 0.569687 ** 2 * r2) - (radius - sag);
                          }).reduce((front, rear) => front - rear)
                        : centerThickness + (edgeThickness - centerThickness) * r2;
                      pixels[offset + 1] = Math.round(thickness / maxThickness * 255);
                      pixels[offset + 3] = 255;
                    }
                  }
                  const thicknessMap = new THREE.DataTexture(pixels, size, size);
                  thicknessMap.minFilter = thicknessMap.magFilter = THREE.LinearFilter;
                  thicknessMap.needsUpdate = true;
                  material.thicknessMap = thicknessMap;
                  textures.add(thicknessMap);
                }
                material.transparent = inner;
                // Internal coated surfaces are drawn after the front
                // transmission pass. Front glass must not occlude those
                // reflections in the depth buffer.
                material.depthWrite = false;
                material.opacity = inner && id !== "28-135" ? 0.12 : 1;
                material.metalness = inner && id !== "28-135" ? 1 : 0;
                material.roughness = 0.035;
                if (inner) {
                  material.color.setRGB(0.75, 0.34, 0.12);
                  material.iridescence = 0.35;
                  if (id === "28-135" || id === "70-200-f4" || id === "70-200-f28" || id === "50" || id === "35") {
                    // Add only the dielectric coating reflection. Black removes
                    // diffuse shading; the opaque optical chamber stays visible.
                    material.color.setRGB(0, 0, 0);
                    material.metalness = 0;
                    material.iridescence = 1;
                    material.ior = material.name.includes("rear") ? 1.60 : 1.52;
                    material.opacity = id === "28-135"
                      ? material.name.includes("rear") ? 0.25 : 0.35
                      : id === "50"
                      // Attenuate the additive internal layers without changing
                      // coating IOR (which also shifts their interference color).
                      ? material.name.includes("rear") ? 0.1 : 0.25
                      : id === "35"
                      ? 0.35
                      : id === "70-200-f28" ? 0.35
                      : id === "70-200-f4" ? 0.6
                      : material.name.includes("rear") ? 0.4 : 1;
                    material.iridescenceThicknessRange = material.name.includes("rear")
                      ? [350, 370]
                      : [220, 240];
                  }
                  if (["70-200-f28", "70-200-f4", "50", "35", "28-135"].includes(id)) {
                    // IBL has no barrel occlusion. Only reflect directions that
                    // can reach the front opening from an internal glass surface.
                    // shortcut: straight rays omit refraction through the front
                    // group; replace with multi-surface optics for exact transport.
                    object.updateWorldMatrix(true, false);
                    const assetFromMesh = object.matrixWorld.clone();
                    // Z/radius of each lens's front sleeve or retaining lip.
                    const apertures: Record<string, [number, number]> = {
                      "50": [0.5545, 0.278],
                      "70-200-f4": [3.134, 0.53682],
                      "70-200-f28": [3.634, 0.62629],
                      "35": [104.8 / 55 - 0.108, 0.513],
                      "28-135": [1.777, 0.713 * 0.801],
                    };
                    const opening = new THREE.Vector2(...apertures[id]);
                    // Stop plane, vertex radius, edge count, rounded blade count.
                    // Match build_models.py openings; flatten sub-.002 blade offsets
                    // and soften the boundary across bevels.
                    const irises: Record<string, [number, number, number, number]> = {
                      "50": [0.275, 0.185, 5, 0],
                      "35": [0.726, 0.225, 128, 0],
                      "70-200-f4": [3.12 * 0.46 + 0.008, 0.69 * 0.24, 96, 8],
                      "70-200-f28": [3.62 * 0.46 + 0.008, 0.805 * 0.28, 96, 8],
                      "28-135": [1.76 - 0.90 + 0.008, 0.713 * 0.16, 72, 6],
                    };
                    const iris = new THREE.Vector4(...irises[id]);
                    const assetFromWorld = { value: new THREE.Matrix4() };
                    material.onBeforeRender = (_renderer, _scene, _camera, _geometry, mesh) => {
                      assetFromWorld.value.copy(mesh.matrixWorld).invert().premultiply(assetFromMesh);
                    };
                    material.onBeforeCompile = (shader) => {
                      shader.uniforms.opticalAssetFromMesh = { value: assetFromMesh };
                      shader.uniforms.opticalAssetFromWorld = assetFromWorld;
                      shader.uniforms.opticalOpening = { value: opening };
                      shader.uniforms.opticalIris = { value: iris };
                      shader.vertexShader = "uniform mat4 opticalAssetFromMesh;\nvarying vec3 opticalAssetPosition;\n" + shader.vertexShader;
                      shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nopticalAssetPosition = (opticalAssetFromMesh * vec4(position, 1.0)).xyz;");
                      shader.fragmentShader = `uniform mat4 opticalAssetFromWorld;
                      uniform vec2 opticalOpening;
                      uniform vec4 opticalIris;
                      varying vec3 opticalAssetPosition;
                      float opticalIrisVisibility(vec2 hit) {
                        if (length(hit) < opticalIris.y * 0.5) return 1.0;
                        float tau = 6.28318530718;
                        float edgeAngle = tau / opticalIris.z;
                        float angle = mod(atan(hit.y, hit.x) + tau, tau);
                        float a = floor(angle / edgeAngle) * edgeAngle;
                        vec2 angles = vec2(a, a + edgeAngle);
                        vec2 bulge = sin(angles * opticalIris.w * 0.5);
                        vec2 radii = opticalIris.y * (1.0 + 0.025 * bulge * bulge);
                        vec2 start = radii.x * vec2(cos(angles.x), sin(angles.x));
                        vec2 end = radii.y * vec2(cos(angles.y), sin(angles.y));
                        vec2 edge = end - start;
                        vec2 delta = hit - start;
                        float outside = dot(delta, vec2(edge.y, -edge.x)) / length(edge);
                        return 1.0 - smoothstep(-opticalIris.y * 0.008, opticalIris.y * 0.008, outside);
                      }
                      ` + shader.fragmentShader;
                      const environment = THREE.ShaderChunk.envmap_physical_pars_fragment.replace(
                        "return envMapColor.rgb * envMapIntensity;",
                        `vec3 apertureRay = normalize(mat3(opticalAssetFromWorld) * reflectVec);
                        float apertureDistance = (opticalOpening.x - opticalAssetPosition.z) / max(apertureRay.z, 0.00001);
                        vec2 apertureHit = opticalAssetPosition.xy + apertureRay.xy * apertureDistance;
                        float apertureVisibility = step(0.00001, apertureRay.z) * (1.0 - smoothstep(opticalOpening.y * 0.992, opticalOpening.y * 1.008, length(apertureHit)));
                        // The iris only intercepts reflections originating behind it.
                        if (opticalAssetPosition.z < opticalIris.x) {
                          float irisDistance = (opticalIris.x - opticalAssetPosition.z) / max(apertureRay.z, 0.00001);
                          apertureVisibility *= opticalIrisVisibility(opticalAssetPosition.xy + apertureRay.xy * irisDistance);
                        }
                        return envMapColor.rgb * envMapIntensity * apertureVisibility;`,
                      );
                      if (!environment.includes("apertureVisibility") || !shader.vertexShader.includes("opticalAssetPosition =") || !shader.fragmentShader.includes("#include <envmap_physical_pars_fragment>"))
                        throw new Error("Optical aperture shader integration changed");
                      shader.fragmentShader = shader.fragmentShader.replace("#include <envmap_physical_pars_fragment>", environment);
                    };
                    material.customProgramCacheKey = () => "internal-aperture-v3";
                  }
                  material.blending = THREE.AdditiveBlending;
                } else material.color.setRGB(0.96, 0.98, 0.97);
                if (id === "70-200-f28") {
                  // Empirical coating reflectance from reference photos, not
                  // measured optical data. A single film caused a false cyan
                  // shift at oblique angles; use a neutral grazing response.
                  material.iridescence = 0;
                  const dielectricF0 = ((material.ior - 1) / (material.ior + 1)) ** 2;
                  material.specularIntensity = 1;
                  material.specularColor.setRGB(
                    0.008 / dielectricF0,
                    0.016 / dielectricF0,
                    0.006 / dielectricF0,
                  );
                }
                object.castShadow = false;
              }
              if (
                material instanceof THREE.MeshPhysicalMaterial &&
                material.name.startsWith("C200 clear audio cover")
              ) {
                // Standard shadow maps treat transmissive plastic as opaque.
                object.castShadow = false;
                material.side = THREE.FrontSide;
                // shortcut: thin clear sheet; use volume filtering for a thick/frosted guard.
                // The volume shader's bicubic blur obscures nearby dial print.
                material.onBeforeCompile = (shader) => {
                  const sample = "return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );";
                  const transmission = THREE.ShaderChunk.transmission_pars_fragment;
                  if (!transmission.includes(sample) || !shader.fragmentShader.includes("#include <transmission_pars_fragment>"))
                    throw new Error("Clear cover transmission shader integration changed");
                  shader.fragmentShader = shader.fragmentShader.replace(
                    "#include <transmission_pars_fragment>",
                    transmission.replace(sample, "return textureLod( transmissionSamplerMap, fragCoord.xy, 0.0 );"),
                  );
                };
                material.customProgramCacheKey = () => "clear-audio-guard-v1";
              }
              if (
                material instanceof THREE.MeshPhysicalMaterial &&
                /^(R7|40D|C200) ocular glass/.test(material.name)
              ) {
                object.updateWorldMatrix(true, false);
                material.thickness = 0.024 / object.getWorldScale(new THREE.Vector3()).x;
                material.ior = 1.52;
                material.clearcoat = 0;
                material.iridescence = 1;
                material.iridescenceIOR = 1.38;
                material.iridescenceThicknessRange = [110, 125];
                if (material.name.startsWith("C200 ocular glass inner")) {
                  // Preserve the authored violet reflectance; the shared film
                  // approximation turns this internal reflection green.
                  material.iridescence = 0;
                }
                if (material.name.startsWith("R7 ocular glass")) {
                  // Appearance estimate from the coated ocular reference.
                  // Avoid treating one effective film as Canon's prescription.
                  material.iridescence = 0;
                  const dielectricF0 = ((material.ior - 1) / (material.ior + 1)) ** 2;
                  material.specularIntensity = 1;
                  material.specularColor.setRGB(
                    0.012 / dielectricF0,
                    0.006 / dielectricF0,
                    0.020 / dielectricF0,
                  );
                }
                material.side = THREE.FrontSide;
                object.castShadow = false;
              }
            }
          });
          if (import.meta.env.DEV && id === "70-200-f28" && new URLSearchParams(location.search).get("frontTrace") === "1") {
            const { installFrontReflections } = await import("./optics/f28-front-reflections");
            scene.traverse((object) => {
              if (!(object instanceof THREE.Mesh) || !(object.material instanceof THREE.MeshPhysicalMaterial)) return;
              if (object.material.name.includes("Inner optical glass")) object.visible = false;
              else if (object.material.name.startsWith("Optical glass")) installFrontReflections({mesh:object,coating:new URLSearchParams(location.search).get("frontCoat") === "reference" ? "reference" : "film"});
            });
          }
          if (disposed) {
            dispose();
            return;
          }
          models.set(id, scene);
        })();
        pending.set(id, request);
        request.catch(() => pending.delete(id));
        return request;
      }),
    );
    const failure = results.find((result) => result.status === "rejected");
    if (failure?.status === "rejected") {
      throw failure.reason;
    }
  }
  try {
    await load(initialIds);
  } catch (error) {
    dispose();
    throw error;
  }
  return {
    load,
    body: (body: Body) => models.get(body.id)!,
    lens: (lens: Lens) => models.get(lens.id)!,
    adapter: () => models.get("adapter")!,
    dispose,
  };
}
