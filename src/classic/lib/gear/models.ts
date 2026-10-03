import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { type Body, type Lens } from "@/classic/lib/gear/catalog";

/** Blender-authored meshes with optical elements, surface normals and engraved controls. */
export async function loadModelLibrary(initialIds: string[]) {
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
          const { scene } = await loader.loadAsync(`/models/gear/${id}.glb`);
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
                /^(Optical glass|Inner optical glass|40D ocular glass|C200 ocular glass)/.test(material.name),
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
                    ((/Pebbled rubber|Scanned grip rubber|Molded grip rubber/.test(material.name) ||
                      ((id === "r7" || id === "40d" || id === "c200") && material.name.includes("Crinkle painted metal"))) &&
                      (value ===
                        (material as THREE.MeshStandardMaterial).roughnessMap ||
                        value ===
                          (material as THREE.MeshStandardMaterial)
                            .metalnessMap))
                  ) {
                    value.wrapS = value.wrapT = THREE.RepeatWrapping;
                    const grain = /^(R7|40D|C200) /.test(material.name)
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
                  /^(R7|40D|C200) /.test(material.name)
                    ? 1
                    : material.name.includes("Molded grip rubber")
                    ? 0.3
                    : /Pebbled rubber|Scanned grip rubber/.test(material.name)
                    ? (id === "r7" || id === "40d")
                      ? 0.4
                      : 0.35
                    : 0.6,
                );
              if (
                material instanceof THREE.MeshPhysicalMaterial &&
                material.transmission > 0 &&
                !/^(40D|C200) ocular glass/.test(material.name)
              ) {
                material.iridescence = 1;
                material.iridescenceIOR = 1.38;
                material.iridescenceThicknessRange = [110, 125];
                material.clearcoat = 0;
                material.side = THREE.FrontSide;
                material.envMapIntensity = 1.2;
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
                  const centerThickness = id === "70-200-f28" ? 0.160 : id === "35" ? 0.030 : id === "50" ? 0.085 : id === "70-200-f4" ? 0.050 : 0.040;
                  const edgeThickness = id === "70-200-f28" ? 0.038 : id === "35" ? 0.025 : id === "50" ? 0.006 : id === "70-200-f4" ? 0.030 : 0.075;
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
                  material.blending = THREE.AdditiveBlending;
                } else material.color.setRGB(0.96, 0.98, 0.97);
                object.castShadow = false;
              }
              if (
                material instanceof THREE.MeshPhysicalMaterial &&
                /^(40D|C200) ocular glass/.test(material.name)
              ) {
                object.updateWorldMatrix(true, false);
                material.thickness = 0.024 / object.getWorldScale(new THREE.Vector3()).x;
                material.ior = 1.52;
                material.clearcoat = 0;
                material.iridescence = 1;
                material.iridescenceIOR = 1.38;
                material.iridescenceThicknessRange = [110, 125];
                material.side = THREE.FrontSide;
                object.castShadow = false;
              }
            }
          });
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
