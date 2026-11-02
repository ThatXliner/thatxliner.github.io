import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { type Body, type Lens } from "./catalog";
import { modelUrl } from "./model-urls";

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
          const { scene } = await loader.loadAsync(modelUrl(id));
          scene.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) return;
            geometries.add(object.geometry);
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
                    (/Pebbled rubber|Scanned grip rubber/.test(material.name) &&
                      (value ===
                        (material as THREE.MeshStandardMaterial).roughnessMap ||
                        value ===
                          (material as THREE.MeshStandardMaterial)
                            .metalnessMap))
                  ) {
                    value.wrapS = value.wrapT = THREE.RepeatWrapping;
                    const grain = material.name.includes("Scanned grip rubber")
                      ? id === "r7"
                        ? 0.9
                        : 1.25
                      : material.name.includes("Crinkle painted metal")
                        ? 6
                        : material.name.includes("Pebbled rubber")
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
                  /Pebbled rubber|Scanned grip rubber/.test(material.name)
                    ? id === "r7"
                      ? 0.65
                      : 0.35
                    : 0.6,
                );
              if (
                material instanceof THREE.MeshPhysicalMaterial &&
                material.transmission > 0
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
                  if (id === "28-135" || id === "70-200-f4") {
                    // Add only the dielectric coating reflection. Black removes
                    // diffuse shading; the opaque optical chamber stays visible.
                    material.color.setRGB(0, 0, 0);
                    material.metalness = 0;
                    material.iridescence = 1;
                    material.ior = material.name.includes("rear") ? 1.60 : 1.52;
                    material.opacity = id === "70-200-f4"
                      ? 0.6
                      : material.name.includes("rear") ? 0.4 : 1;
                    material.iridescenceThicknessRange = material.name.includes("rear")
                      ? [350, 370]
                      : [220, 240];
                  }
                  material.blending = THREE.AdditiveBlending;
                } else material.color.setRGB(0.96, 0.98, 0.97);
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
