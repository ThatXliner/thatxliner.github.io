# Camera fidelity audit — current local assets

This is an incomplete-work audit, not a completion certificate. The target remains photorealistic, reference-matched R7, 40D, C200 and all interchangeable lenses in the actual `/classic` viewer.

## Current evidence

Inspected the owned bodies with the EF 50mm f/1.8 II to reduce lens occlusion. Changed body and lens through the actual selectors; both combinations loaded without console errors. Screenshots are in the ignored `output/gear-modeling` folder:

- `audit-r7-front.jpg`: front; uneven highlights around the shutter shoulder and upper casting. Canon lettering also needs a closer surface-projection check.
- `audit-r7-rear.jpg`: rear; control placement is recognizable, but the joystick/dial construction and surface finish still need comparison at equal framing.
- `audit-40d-front.jpg`: front oblique; similarly irregular highlights around the grip shoulder and top LCD deck.
- `audit-40d-rear.jpg`: rear; controls exist, but several button domes appear more pronounced than in the brochure.

References inspected: `output/gear-reference/r7.jpg`, `r7-back-canon.jpg`, and `40d-brochure-controls.png` (Canon brochure nomenclature sheet). Reference lighting differs from the studio viewer; brightness alone is not proof of geometric error.

## Measured check: R7 screen

Read POSITION data from the current uncompressed R7 GLB's display primitive. Glass bounds are x -0.625 to 0.79775, y -0.61770 to 0.33930. The authored active mask occupies 410/512 horizontally and 306/384 vertically. At 55 mm/unit, this gives approximately **62.66 × 41.94 mm**, consistent with a 3-inch 3:2 panel. The initial visual concern about an oversized inactive border does **not** justify changing the active area. Compare glass response and edge contrast separately.

## Next priorities

1. Isolate the R7/40D shoulder highlight problem: compare normal-map-disabled rendering with the current material, then inspect fused/remeshed geometry. The generator currently joins castings and grip lofts, voxel-remeshes, applies extensive local smoothing and an R7 bridge deformation, then decimates. Do not add more cosmetic patches before identifying which stage produces the uneven surface.
2. Correct 40D rear button cap profiles against the brochure and close photographic references.
3. Audit R7 rear joystick/ring construction and Canon wordmark surface projection.
4. Continue C200 proportion and finish comparisons across front/side/rear. Recent local work improves connector recesses, grip controls, side-panel divisions and painted-shell texture but does not establish photorealism.
5. Complete the same full-view comparison for every lens, including switches, lettering and optical appearance. No lens is signed off by this audit.

## Scope still unproven

Full body contours; all control profiles; all material/optical responses; legibility across normal viewing angles; every owned lens combination; complete available C200 setup; and final interaction/performance regression verification. Independent selectors and ownership tabs were exercised only for the combinations described above. The active goal must remain incomplete.

## R7 shoulder isolation experiments

Completed in the actual `/classic` viewer at the same EF 50mm setup/home angle:

| Experiment | Observation | Consequence |
| --- | --- | --- |
| Disable normal map only | Large uneven shoulder highlights remain (`r7-shoulder-no-normal.jpg`). | Grain normal map is not the cause of the large distortion. |
| Disable normal, roughness and AO maps; use uniform roughness | Broad shape irregularity remains (`r7-shoulder-no-maps.jpg`), though highlight contrast changes. | Do not try to conceal the geometry with material tuning. |
| Export R7 without final shell decimation | Same shoulder distortion (`r7-shoulder-unreduced.jpg`). | Increasing polygon count is not a useful fix. |
| Replace narrow bridge deformation with blended analytic crown | Worse surface transitions and a control interfered with the new surface. | Rejected and reverted; another local deformation is not acceptable. |

The **next investigation is the pre-reduction grip/casting union and its loft topology**, with control support surfaces treated as part of that construction. The 40D has not yet undergone these isolation experiments; do not automatically generalize the R7 result to it.

Restoration verified: generator matches the pre-experiment source, original compressed R7 SHA-256 prefix `15ed6eb6598a909c`, and the restored viewer loads without console errors. Temporary runtime diagnostic code was removed. No trial geometry is shipped. The failed raw trial is retained at `output/gear-modeling/r7-rejected-crown-raw.glb`; the `uncompressed/r7.glb` cache was removed because it contained that rejected trial. The next R7 export must regenerate the raw cache. The editable R7 blend currently reflects the rejected trial and likewise must be regenerated from the restored source before use.

## Measured R7 transition repair

A separate shutter-seat-deformation test did not remove the broad shoulder issue and reduced the quality of the button fit; restored it. Sampling top heights after each construction stage found a trough in the union and a second problem in its repair: the sine envelope filled the middle but under-filled adjacent sections. Replaced that envelope with a full smooth interpolation between the existing measured endpoint heights. This preserves the original crown and controls rather than imposing the rejected analytic crown.

At x=-1.20, top heights at z=.20/.30/.40/.50 changed from .7068/.7194/.7177/.7188 to .7186/.7209/.7234/.7254. The local dips are removed along that measured section. Other cross-sections still show residual curvature, especially inward toward the record button, and require further work. Logs: `/tmp/r7-stages.log`, `/tmp/r7-stages-fixed.log`.

Verified front-oblique, elevated front, and grip-side views in /classic with normal production materials; shutter, command wheel and top buttons remain seated. No console errors. Proof: `output/gear-modeling/r7-full-shoulder-bridge.jpg`. Regenerated the R7 GLB, raw cache, editable blend, thumbnail and initial setup poster. This supersedes the earlier cache/restoration note. The model remains short of photorealistic completion.

## R7 bridge boundary continuity

Measured inward cross-sections (`/tmp/r7-inner-stages.log`) and compared Canon's top photograph (`output/gear-reference/r7-top.png`). The previous repair cut off at x=-1.46 and x=-.94 while its exponential weight was still 0.15. Replaced that discontinuous boundary with smoothstep ramps that reach zero with zero slope at both support edges. The repair spans x=-1.48 to -.86 and retains the forward finger channel.

Rebuilt and inspected elevated front and grip-side views in /classic. Shutter, command wheel, record/ISO controls remain seated and no console errors were reported. Proof: `output/gear-modeling/r7-shoulder-edge-taper.jpg`. Updated compressed model, raw cache, blend, thumbnail and setup poster. This corrects a mathematical discontinuity; it does not establish a full match for the larger inner contour, which remains visibly approximate.

## 40D rear key correction

Compared the Ffordes rear photograph saved as `40d-rear-photo.jpg` (source URL in REFERENCES.md). Replaced the ten ellipsoidal rear key caps with shallow rounded cylinders, oriented to the cover's actual surface normal. Added the erase key's central recess. The first viewer pass exposed the bottom keys sitting too close to the case edge; raised those five keys by .03 model units while keeping their printed legends at their prior positions.

Verified rear and rear-oblique views in /classic with no console errors. Proof: `output/gear-modeling/40d-shallow-rear-keys.jpg`. Regenerated the compressed GLB, raw cache, blend and thumbnail. This addresses cap shape/seating only; 40D shoulder geometry, other control assemblies and full material/optical fidelity remain incomplete.

### 2026-10-02 — C200 front cap, tally light and microphone

Compared the existing front product photograph (`output/gear-reference/c200-front.jpg`, JustCanon source above) with the actual /classic viewer. Replaced the thin VIDEO terminal cap with a swept rounded shoulder and flat central face; added the upper pull tab. Added the unlit front tally diffuser and bezel, plus three Boolean microphone openings with dark backings. Canon's C200 manual page 14 identifies the tally lamp and built-in monaural microphone. Reapplied planar custom normals to the front fascia after the cuts.

Regenerated the compressed C200 GLB, raw cache, editable blend and selector thumbnail. Inspected the assembled 70–200 f/2.8 setup front-on and from the grip-side front oblique, with no browser console errors. These additions address identifiable missing details; proportions remain photo-estimated, and they do not establish overall photorealistic fidelity. Proof: `output/gear-modeling/c200-front-detail-refinement.jpg`.

### 2026-10-02 — C200 EVF housing contour

The rear reference (`output/gear-reference/c200-rear.jpg`) shows a full rounded EVF housing tapering into the camera top. Replaced the undersized tilted beveled box with eight rounded cross-sections, matching the existing eyecup at the rear and narrowing into the chassis. Retained the optical channel cut and moved the diopter track, lever and ribs downward by .035 model units to follow the new underside. Overall calibrated body dimensions remain 144 × 153 × 179 mm.

Rebuilt the compressed GLB, raw cache, editable blend and thumbnail. Inspected rear-oblique and low side views in /classic with the 70–200 f/2.8 attached, with no console errors. Eyecup/ocular fit remains intact. Proof: `output/gear-modeling/c200-tapered-evf.jpg`. Shape dimensions remain inferred from photographs, not a manufacturer CAD model; overall fidelity is incomplete.

### Shared-lighting isolation check

Compared a five-card softer environment (wall radiance .06, intensity .8) with the current seven-card environment using R7/40D + EF50 and C200 + EF70–200 f/2.8 in /classic. The trial reduced some overlapping reflections but did not remove the shoulder distortions; the C200 front element became excessively dark at the default view. Rejected the trial and restored `scene.ts` byte-for-byte from `output/gear-modeling/scene-before-lighting-audit.ts`. Proofs: `lighting-r7-before.jpg`, `lighting-r7-trial.jpg`, `lighting-40d-trial.jpg`. These comparisons reinforce that the remaining shoulder problem needs geometry correction. No lighting trial is retained.

### 2026-10-02 — 40D quick-control wheel proportions

Compared the Ffordes rear photograph (`40d-rear-photo.jpg`) with the live viewer. Reduced the wheel face dish depth from .021 to .008 model units, widened the central collar, and replaced the small domed SET button with a shallow beveled cylinder (radius .080 → .095). The button-to-wheel diameter ratio is now approximately .30. Verified the final compressed asset from rear and rear-oblique angles with no console errors; the collar and button remain seated. Proof: `output/gear-modeling/40d-wheel-face.jpg`. Updated the GLB, raw cache, editable blend and thumbnail. Remaining shoulder shape/material/optical issues still prevent a claim of overall photorealistic completion.

## Source-model availability check — 2026-10-02

Checked exact R7, 40D and C200 model searches before further procedural contour work. No verified downloadable replacement covering all three bodies was found. This is a scoped search result, not proof that no such assets exist.

- R7: https://sketchfab.com/3d-models/canon-eos-r7-e85512672b174fdeb521f32dd0ee7d94 — public model API reports `isDownloadable: false` and an empty license object. The description's free-model claim does not establish authorized access; do not extract viewer meshes.
- R7: https://www.turbosquid.com/3d-models/canon-mirrorless-cameras-eos-r7-model-2339818 — listing shows $6, FBX/3ds Max, 87,266 polygons and editorial-only use.
- R7: https://www.turbosquid.com/FullPreview/2327213 — 48,816 polygons; Blender and glTF formats listed, editorial-only use.
- TurboSquid license: https://blog.turbosquid.com/turbosquid-3d-model-license/ — software-distribution section 7(b) restricts public/open model formats; the current publicly served GLB workflow is not an established permitted use. No purchase, download or incorporation performed.
- Exact 40D search returned primarily documentation and different bodies (400D/450D); those are not valid replacements. Exact C200 results included a foam-case DXF, not a camera mesh.

Retain the current authored assets. The remaining R7/40D shoulder work should target the joined grip/casting construction, using cross-section measurements before and after remeshing, rather than another lighting or normal-map adjustment. The body controls and lens interfaces must be checked again after any contour replacement.

## 40D shoulder isolation — 2026-10-02

Measured the unexported casting after union, initial smoothing and heavy shoulder smoothing. Unlike the previously measured R7 transition, the sampled 40D longitudinal sections do not contain a local trough: at x=-1.2, y decreases .6772/.6764/.6741/.6646/.6096/.5420/.4555 from z=-.1 through .5 after smoothing. The R7 bridge fix therefore should not be copied to the 40D. Full measurements and repeatable instrumentation are saved in `output/gear-modeling/40d-shoulder-stages.log` and `inspect-shoulder-stages.py`.

Actual /classic viewer experiments, using 40D + EF50 at the same front-oblique view:

- Added local tessellation before shutter-seat deformation: broad highlight bands remained. Rejected.
- Disabled 40D shutter-seat deformation: broad bands remained (`40d-no-seat-deformation.jpg`). Rejected.
- Disabled 40D normal and baked occlusion maps, retained roughness: bands remained (`40d-no-normal-ao.jpg`). Rejected.
- Disabled live shadow maps: bands remained (`40d-no-live-shadows.jpg`). Rejected.

Baseline proof: `40d-seat-resolution-before.jpg`. Generator and runtime files restored byte-for-byte from pre-test copies. These tests isolate remaining work to base shape / mesh vertex normals; they do not prove the specific source of the remaining contour error. Next useful comparison is smooth vertex normals against unweighted geometric normals on the continuous casting, then the transverse grip profile and its junction to the LCD deck. Do not retain higher polygon counts or remove shading features as a substitute for this diagnosis.

Restoration completed: regenerated 40D raw GLB and editable blend from the pre-trial generator; compressed output is 3.53 MB. Verified the restored model renders in /classic without console errors. No diagnostic runtime overrides remain.
