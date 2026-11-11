/** Bump a model's version here when its GLB changes, so both viewers pick it up together. */
const VERSIONS: Record<string, string> = {
    r7: "dfe2d43a6ace",
    "28-135": "c371a5932cc9",
};

/** Decimated copies for scenes where a camera is one prop among many. */
const LITE: Record<string, string> = {
    r7: "1",
    c200: "1",
};

export function modelUrl(id: string, lite = false) {
    if (lite && LITE[id]) return `/models/gear/lite/${id}.glb?v=${LITE[id]}`;
    const version = VERSIONS[id];
    return `/models/gear/${id}.glb${version ? `?v=${version}` : ""}`;
}
