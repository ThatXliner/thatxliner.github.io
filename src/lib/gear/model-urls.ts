/** Bump a model's version here when its GLB changes, so both viewers pick it up together. */
const VERSIONS: Record<string, string> = {
    r7: "dfe2d43a6ace",
    "28-135": "c371a5932cc9",
};

export function modelUrl(id: string) {
    const version = VERSIONS[id];
    return `/models/gear/${id}.glb${version ? `?v=${version}` : ""}`;
}
