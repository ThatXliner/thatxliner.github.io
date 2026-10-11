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

### 2026-10-11 — 40D shoulder normals and compression isolation

The previous shipping turn verified deployment of bb25fdb; it made no modeling progress. Resumed the outstanding shoulder contour investigation against that exact asset in the `/classic` interactive viewer, using EF 50mm, Home, four zoom-in steps and four upward orbit steps.

- Inspected the saved production Blender mesh's 13,125 corner normals on the painted grip shoulder (x -1.5…-.85, y .4….8, z -.1….65). Resetting custom normals to calculated normals changed none: median, 95th percentile and maximum angular difference were all 0°. This rules out stale custom normals in that region.
- Trialed sharp boundaries at 11 casting edges with a dihedral angle above 35° around the shutter/command-wheel pockets. Re-exported, optimized and inspected in the actual viewer at the same angle. The broad uneven highlights remained; rejected the trial.
- Loaded the original uncompressed 40D GLB through the same actual viewer. The broad shoulder distortion remained. Meshopt normal quantization is therefore not its cause; retaining a larger uncompressed download would not solve it.
- Measured transverse casting sections from the baked mesh. Pocket-floor hits contaminate some top-surface samples, so those samples must not drive a smoothing fit. The next shape investigation should sample the casting before control-pocket booleans and compare transverse curvature across the grip/top-deck union against `output/gear-reference/40d-top.jpg`.

Diagnostics retained in ignored `output/gear-modeling/`: `probe-40d-corner-normals.py`, `probe-40d-pocket-edges.py`, `probe-40d-transverse.py`, `40d-transverse.log`, `40d-pocket-edge-before.jpg`, `40d-uncompressed-shoulder.jpg`. Restored the compressed public asset byte-for-byte; generator, editable Blender file, original raw cache, previews and runtime were unchanged. This is diagnostic progress, not a photorealism pass or a new deployment.

### 2026-10-11 — 40D crown geometry and strap-recess fit

The preceding normals/compression turn made diagnostic progress: its ruled-out causes directed this edit to the casting geometry. Measured the casting before pocket cuts using `inspect-40d-crown-stages.py` (`40d-crown-before.log`) and compared the saved front, top and grip-side product references. The old upper grip rings contracted too early, leaving a rounded shutter bulge and a sharp transition into the deck.

- Broadened the upper grip loft and extended its forward shoulder: replaced the two upper rows at y .57/.64 with three at .55/.64/.68. The lower grip and rubber sleeve contour are unchanged.
- Moved the 40D shutter seat from z .389 to .460. The wider crown alone left it too far back and almost invisible from the front. The revised spacing from the main wheel follows the top reference more closely, and the front view again shows its angled face. Its seat and pocket continue to follow the measured casting surface.
- Corrected the grip-side strap recess where the original cut approached the crown's curved edge. A trial lowering it to y .425 caused an intersection with the rubber and was rejected. Final center y .445, opening height .17, lining height .16, and eye offset -.032 retain a continuous upper rim and clear the rubber. The opposite-side lug is unchanged.
- Verified the final compressed asset from front, grip side and rear in the actual `/classic` viewer with EF 50mm. No console errors. Saved proof: `40d-crown-final-front.jpg`, `40d-crown-final-side.jpg`, `40d-crown-final-rear.jpg` in ignored `output/gear-modeling/`. Earlier trial captures are explicitly not final proofs.

Updated the generator, optimized 40D GLB (3,602,404 bytes), original raw cache, editable Blender file and selector thumbnail. Body selectors, ownership tabs and lazy rendering are unchanged. The crown is a closer approximation, not a full photorealism pass: uneven broader highlights, material appearance and other body/lens discrepancies still need work. These local changes have not been pushed.

### 2026-10-11 — EF 50mm II surface details

Previous turn was progress: retained and verified the revised 40D crown/recess, with updated asset and preview. This turn compared the 50mm with a newly fetched official Canon product photograph (source recorded in REFERENCES.md).

Corrected the minimum-focus marking to white lettering plus a yellow flower, moved it around the barrel relative to the main 50mm legend, and projected both onto the shell. The saved Blender asset's distance-legend vertices were checked against the intended barrel radius with `output/gear-modeling/check-50-marking-surface.py`. Replaced sinusoidal rear groove profiles with flat floors and rounded walls, retaining their count, extent and depth while increasing angular sampling.

Actual-viewer checks: R7 front glass/inscription, opposite-side label and slots, AF/MF switch side, and 40D front-oblique mounting. No console errors. Captures in `output/gear-modeling/`: `50-markings-slot-front.jpg`, `50-markings-slot-side.jpg`, `50-markings-slot-switch.jpg`, `50-markings-slot-40d.jpg`. Updated GLB, raw cache, blend and thumbnail. Final GLB 933,020 bytes versus 883,552 before this turn; Meshopt remains enabled. Generator parses and diff whitespace checks pass. No runtime/renderer changes.

This improves specific reference mismatches; full photographic fidelity remains incomplete. The front glass's appearance still needs evaluation, and the R7 grip-side inspection shows a visibly imperfect sleeve/casting seam that should be addressed in the body geometry. These local changes are not pushed.

### 2026-10-11 — R7 upper grip sleeve contact

Previous turn was progress (50mm slot geometry and reference-correct printing). The R7 side view from that turn exposed an upper rubber sleeve that flared away from the casting. Checked Canon's already-saved grip-side reference, `output/gear-reference/r7-right-canon.jpg`.

`output/gear-modeling/probe-r7-sleeve-fit.py` samples the upper sleeve against the finished casting after the body's deformations, before export. The original maximum positive clearance was .033298 model units (1.831 mm at 55 mm/unit); the 95th percentile was 1.454 mm. The sleeve still followed its original loft while the casting had been unioned and smoothed.

Fitted the exposed upper sleeve to the casting before receiver placement, with a smooth transition from the lower grip. Solidify's paired outer/inner vertices retain separate .004/.0005 offsets. Deeply buried rear portions remain inside the housing. The final transformed model measures maximum positive clearance .232 mm and 95th percentile .224 mm in the same region. Logs: `r7-sleeve-fit-before.log` and `r7-sleeve-fit-after.log`.

Actual `/classic` viewer checks with EF 50mm: side flare is removed; front receiver and rear controls remain seated. No console errors. Proof captures: `r7-sleeve-fit-side.jpg`, `r7-sleeve-fit-front.jpg`, `r7-sleeve-fit-rear.jpg` in ignored `output/gear-modeling/`. Updated raw GLB, blend, optimized GLB (3,757,832 bytes), R7 thumbnail and setup poster. The ignored poster helper was synchronized with the current production scene before capturing; it had been missing the current front environment card. Runtime code and loading behavior are unchanged.

This repairs a specific geometry gap. The rear termination of the sleeve and broader body contour/material/optical fidelity still require further comparison; completion remains unproven. These changes are local and not pushed.

### 2026-10-11 — C200 operator markings and release snapshot

Moved the 4K frame fully onto the upper housing and seated power, Canon and function legends closer to their actual panel surfaces. Added the focal-plane symbol, power-lock symbol and mode index dots from the saved C200 operator-side product reference. The 4K frame is a flat printed mesh instead of a raised tube.

Verified the optimized C200 in the actual classic viewer: the 4K frame clears the recessed bay, the labels remain visible, and no console errors were reported. Proof: ignored `output/gear-modeling/c200-operator-ink-final.jpg`. Refreshed the C200 thumbnail; optimized GLB is 4,441,768 bytes. Generator syntax and compressed GLB headers/extensions validated for all four modified models.

Release snapshot includes the preceding 40D crown, 50mm printing/slots and R7 sleeve changes. The earlier “local/not pushed” statements describe their verification-time state; this snapshot is prepared for the user's requested commit and push. No renderer or loading behavior changed. Full photographic fidelity remains incomplete.
