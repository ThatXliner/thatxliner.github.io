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

### 2026-10-11 — C200 tape hook and control legends

The previous turn made progress by shipping the verified snapshot. Compared the operator side with the saved product photo and Canon manual page 12 (`c200-front-parts.png`). The manual explicitly identifies the tape-measure hook, WB button and dual-purpose playback controls.

Added the projecting tape-measure hook, vertical EXHAUST VENT legend, WB button/label, play/pause mark, white-balance adjustment symbol and INDEX/stop mark. Right-aligned the power-mode legends against their index dots. The lower marks are beside the raised playback surround, on the fascia; intermediate placements over the recessed bay or behind that surround were corrected before final verification.

Verified the final compressed asset in the actual classic viewer from operator side, front-oblique and rear-oblique views, with no console errors. Saved `c200-control-details-side.jpg`, `c200-control-details-front.jpg`, and `c200-control-details-rear.jpg` in ignored `output/gear-modeling/`. Updated raw cache, editable blend and selector thumbnail. Final optimized asset: 4,459,572 bytes. Generator syntax, GLB header/compression and diff whitespace checks pass. No runtime changes.

These details improve reference coverage; the lower control layout remains crowded compared with Canon's photograph, and materials, broad contour and optical fidelity are not yet a full photographic match. Full goal completion remains unproven. This follow-up is local and not pushed.

### 2026-10-11 — C200 operator bay and lower control spacing

Previous turn made progress by adding reference-confirmed missing hardware and legends. Its viewer capture exposed the next discrepancy: the operator bay sat too low, leaving a crowded lower control strip. Compared again with the product photograph and Canon manual page 12.

Moved the bay upward (top .31 to .45; bottom -.86 to -.74), reshaped its control casting, and moved the exhaust with it. Increased spacing in the main numbered column to .27 and the right column to .33 while bringing their horizontal separation closer to the reference. Repositioned the ND sub-panel. Raised the 4K/focal-plane/hook details and moved the whole power cluster right/up; a first trial missed the cluster because Blender object names carry a model prefix, corrected before final verification with an explicit matched-cluster assertion.

Raised and separated the lower REC/dial/WB/playback controls; enlarged the REC bezel/cap relative to numbered keys. Raised the card latch and EOS/C badge while shortening the card door to maintain clearance. Printed REC/model/transport legends now sit on the fascia plane. The changes retain the body envelope calibration and do not change runtime or selectors.

Verified final compressed asset in the actual viewer from side, front-oblique and rear-oblique views, with no console errors. Proofs: `c200-panel-layout-side.jpg`, `c200-panel-layout-front.jpg`, `c200-panel-layout-rear.jpg` in ignored `output/gear-modeling/`. Generator syntax, compressed GLB header/extension and diff whitespace checks passed. Updated raw cache, editable blend, optimized GLB (4,474,112 bytes) and thumbnail.

This improves control layout but does not establish a full photographic match. The side housing's overall aspect/proportions relative to the EVF and front casting still need a careful multi-view comparison; the crinkle finish, optics and broader material response remain incomplete. Changes remain local, not pushed.

### 2026-10-11 — C200 envelope calibration audit

Previous turn made progress by correcting control spacing, but its images did not prove overall body proportions. This turn compared the current side/rear interactive views and the saved front/side/rear product references, then measured the generated component vertices independently of the exporter. Diagnostic source and results are retained in ignored `output/gear-modeling/measure-c200-proportions.py` and `c200-proportions-current.json`. No model geometry was changed during this audit.

Measured current side fascia: 126.93 mm front-to-back by 130.39 mm high (ratio .973). Current CFast door: 29.23 by 51.11 mm (ratio .572). Both appear too broad relative to height in the product photograph and manual diagram. Those image ratios are visual constraints, not exact manufacturer component dimensions.

A stronger independent constraint is Canon's C200B camera-unit specification: 144 x 146 x 137 mm, versus C200 144 x 153 x 179 mm. The present model core, excluding the detachable handgrip, BP-A30 battery geometry and EVF/eyecup group, measures 144.00 x 153.00 x 165.79 mm. Its depth extrema come from the front screw geometry and rear SDI terminal legend. The current overall-envelope calibration gives the chassis too much of the total C200 depth; the EVF contributes only about 13.21 mm beyond the core envelope rather than the 42 mm difference between Canon's published variants. Treat the C200B as a dimensional cross-check, not proof that all its geometry is identical.

This changes the next modeling action: calibrate the main chassis and projecting EVF as separate groups, preserve the EF mating plane and round hardware, then reposition the rear assembly and accessory anchors. Do not simply stretch the whole assembled camera or declare the outer 144/153/179 check sufficient. Side-fascia height and the card-door aspect still need independent verification after that change.

Actual-viewer proof: `c200-proportion-audit-side.jpg`, `c200-proportion-audit-rear.jpg`; no console errors. Full photographic fidelity remains unproven. Earlier local C200 edits are preserved. GitHub Pages run 38160651091 completed successfully for pushed commit ed71687; subsequent model work remains local.

### 2026-10-11 — Separate C200 core and EVF calibration

Previous turn made diagnostic progress: measured a 165.79 mm deep main core, contradicting the independent C200B 137 mm envelope despite passing C200 overall dimensions. Implemented separate groups for core, EVF, battery and handgrip. The core now targets 144 x 146 x 137 mm; the viewfinder is positioned to retain the full C200 144 x 153 x 179 mm envelope. This uses C200B as a shared-housing dimensional cross-check, not manufacturer CAD or proof of identical detail geometry.

The EF mount retains its original matrices. The EVF, battery and grip retain their preceding shapes while their attachment positions follow the new core. Grip anchoring uses the actual transformed rosette pivot; battery anchoring uses its mating face and center. Circular side controls and printed markings receive a local vertical correction to avoid elliptic controls/narrowed type under the depth/height fit. The power cluster is corrected as a group. Handle size remains independently calibrated.

Generator checks measured the generated core at 144.000 x 146.000 x 137.000 mm and body plus EVF at 144.000 x 153.000 x 179.000 mm. All nine side button cap diameters agree in their face axes to within .000002 mm; unchanged EF matrices are asserted. The independent component probe (`measure-c200-proportions-recalibrated.py`, `c200-proportions-recalibrated.json`) confirms core dimensions. Side fascia aspect improves from .973 to .843; CFast door from .572 to .495. Neither ratio alone proves exact photo fidelity.

Inspected the final compressed model in the actual classic viewer from front-oblique, side, rear-oblique and grip-side views. Lens mating, rear battery, projecting EVF and grip attachments remain connected; no console errors. Proofs in ignored `output/gear-modeling/`: `c200-core-calibration-front.jpg`, `c200-core-calibration-side.jpg`, `c200-core-calibration-rear.jpg`, `c200-core-calibration-grip.jpg`. Updated generator, raw cache, blend, optimized GLB (4,467,104 bytes) and thumbnail. Syntax, GLB compression/header and diff whitespace checks pass. No renderer/loading changes.

This is retained local progress, not pushed and not a photorealism pass. Side panel/card-door aspect, material finish, optical response and remaining camera/lens contour details still need reference comparison. The grip-side capture also leaves the f/2.8 lens switch appearance visibly suspect; inspect it against the actual lens reference instead of assuming a successful asset load proves correct switches.

### 2026-10-11 — Switch-detail diagnosis and inspection zoom

Previous turn made progress by recalibrating the C200 core/EVF. Its grip-side screenshot suggested broken f/2.8 switch geometry. Reproduced in the actual viewer and compared the saved `70-200-f28-controls.jpg` reference. Do not treat the initial distant screenshot as proof of intersecting geometry.

`output/gear-modeling/probe-telephoto-print.py` traces outward from the centroids of 2,794 switch-lettering/tick triangles against all other model meshes. It found zero buried samples. Results: `f28-print-occlusion-before.json`. `probe-f28-switch-normals.py` also ruled out a gross stale-normal rotation: cap corner-normal deviation from the radial surface was at most 2.758 degrees, not a 90-degree shading failure. These probes cover those specific hypotheses, not every surface defect. No lens geometry/material was changed on this evidence.

The interactive viewer's minimum camera distance grew with the entire assembled bounds, including the cinema monitor and long telephoto. That prevented useful inspection of tiny legends. Set the minimum distance to the existing 2.2-unit lower bound for every setup; full-assembly reset framing and maximum distance remain computed from the bounds. Panning can center an individual component before further zoom. No extra asset, shader, ray tracing, polling or render loop was added.

Actual-viewer checks: zoomed beyond the preceding limit, read AF/MF and stabilizer legends, inspected all four switch faces/recesses, and reset the C200 to its full assembly. Switched to owned equipment, selected EF 50mm on R7, switched independently to 40D retaining the lens, zoomed and reset. No console errors. Proofs: `f28-switch-detail-zoom.jpg`, `detail-zoom-owned-reset.jpg`. Build passed (15 pages, 23.11 s); diff check passed.

This improves inspectability/readability and rules out two suspected geometric faults. It does not establish complete photographic fidelity: materials, optics and the remaining body/lens contours still require comparison. Changes remain local and unpushed.

### 2026-10-11 — Requested release snapshot

Prepared the verified C200 controls/core/EVF refinements, refreshed C200 thumbnail and closer inspection zoom for the user-requested release. Earlier local/unpushed notes describe their verification-time state. Set aside the unfinished HDR environment trial in ignored output; production retains the previously verified lighting and lazy viewer loading. Full photographic fidelity remains incomplete.

### 2026-10-11 — Photographed studio environment trial

Previous turn made progress by committing/pushing the verified snapshot (59ec198). Tested the set-aside Poly Haven Studio Small 08 1k HDR in the actual classic viewer, with existing exposure, environment intensity and direct lights unchanged. Compared the same R7 + 50mm view before/after, a head-on 50mm view, 40D rear and matched C200 front-oblique views. Saved evidence in ignored output/gear-modeling: lighting-baseline-r7.jpg, lighting-hdri-r7.jpg, lighting-hdri-40d-rear.jpg, lighting-hdri-c200.jpg and lighting-baseline-c200.jpg. No browser console errors during the trial.

The HDR gave smoother, broader body illumination, but flattened the dark control/fascia contrast and made the 50mm outer glass almost visually absent at the default view. Head-on, the sensor remained plainly visible through the simplified optical system. The actual Canon 50mm and C200 reference photographs were re-inspected: lighting alone does not fix the model's surface character or optical depth. Neither environment establishes photographic fidelity. Do not hide optical shortcomings by merely lowering glass transmission or coloring an opaque disk.

Rejected this environment as the production default: the comparison did not justify an extra 1,508,872-byte request. Restored scene.ts byte-for-byte to the shipped version and removed the public trial HDR, retaining both the source trial and identical HDR under ignored output. No model, thumbnail or renderer change remains from this experiment.

Next material investigation: the C200 reference shows a distinct coarse crinkle finish on the raised operator casting versus the fine housing finish. Inspect the exported normal/roughness scale and its appearance at matched close-up framing before altering shared materials. Optical multi-surface approximation and body contours remain outstanding. Full goal completion is unproven.

A closer follow-up in the restored viewer resolves the casting grain (`c200-finish-baseline.jpg`, `c200-finish-close.jpg`), so the texture is present rather than missing. Source uses a 48-cell normal map over a .26-unit C200 tile: nominal .298 mm cell pitch at 55 mm/unit, with normal strength .48 and roughness centered on .48. At the earlier full-body framing much of that grain is subpixel. Do not enlarge its physical scale merely to force visibility in thumbnails. Next compare highlight breakup/roughness under matched framing; a C200-specific finish should avoid changing R7/40D materials incidentally.

### 2026-10-11 — C200 cast-finish response

Previous turn made progress by rejecting an unhelpful HDR environment and identifying the casting response as a separate issue. Corrected one diagnostic detail: the shared source material has .48 normal strength, but the C200 export already overrides it to .30. The shipped GLB confirmed that exported value (material name carries .001 suffix).

Compared the operator close-up photograph against the actual viewer. Tested a C200-only casting change: normal strength .30 to .60 and roughness map values multiplied by .65 (mean roughly .48 to .312). Preserved the existing .26-unit texture tile / nominal .298 mm cell pitch. The first runtime trial matched the unsuffixed material name and therefore did not apply; corrected the match before judging it. The applied trial produced the broken specular highlights missing from the preceding rubber-like finish.

Baked the retained response into the generator and rebuilt/compressed the C200 asset. Removed the temporary runtime override entirely; models.ts and scene.ts match HEAD. C200 smooth housing and other camera/lens materials retain their previous settings. No new runtime resource or render pass. Final asset 4,460,436 bytes. Header/compression, material normal scale and roughness texture presence validated. Generator retained its core/full-envelope, mount and round-button assertions.

Inspected the final compressed asset in the actual classic viewer from side-close, front-oblique and rear views, without console errors. Proofs: c200-crinkle-final-side.jpg, c200-crinkle-final-front.jpg, c200-crinkle-final-rear.jpg. Updated editable blend, raw cache and selector thumbnail. This improves the distinction between the cast panel and smooth housing; it is not a full photographic match. Optical depth, body/lens contours and remaining material details still require work. Changes remain local and unpushed.

### 2026-10-11 — f/2.8 front-barrel inscription placement

Previous turn made progress by refining the C200 casting. Inspected the f/2.8 front rim and the saved product reference. The close view distinguishes the bright optical reflection from a separate, unambiguous marking error: this first-generation Canon telephoto carries its lens name on the white barrel, but the model printed generic arc lettering on the front face. Canon's EF365 product reference was rechecked online.

Moved the f/2.8 name and 77 mm diameter inscription onto the white band ahead of the red ring; removed the generic front-face lettering. Reused the existing cylindrical lettering method while preserving the owned f/4 placement. The front face retains its dark material. No optics/reflection change was made; the bright optical crescent remains a separate fidelity issue.

The generated-geometry probe output/gear-modeling/probe-f28-front-marking.py asserts exactly two barrel inscription meshes, no remaining front-ring inscription meshes, and all lettering vertices between the red ring and black rim. Actual z ranges are 3.42828–3.47282 and 3.42728–3.47364, clear of red-ring end 3.3474 and rim start 3.538. Existing Canon/ULTRASONIC branding also clears the red ring (max z 3.28930).

Rebuilt source asset, editable blend and raw cache, compressed GLB (2,031,708 bytes), and selector thumbnail. Inspected actual viewer front, opposite side and rear-oblique views; no console errors. Proofs: f28-front-marking-front.jpg, f28-front-marking-side.jpg, f28-front-marking-rear.jpg. Generator syntax, GLB header/compression and diff checks pass. This is a reference-placement correction, not a complete photographic-fidelity pass. Changes remain local and unpushed.

### 2026-10-11 — R7 rear control proportions and circularity

Previous turn made progress by correcting f/2.8 barrel markings. Compared the R7 rear in the actual viewer with saved r7-back-canon.jpg and r7-rear.webp, then inspected r7-right-canon.jpg. The upper dial and lower four-way pad were too wide relative to the LCD; source inspection also confirmed that the global .87 body-height fit flattened their circular faces. Their centers relative to the display were already close to the reference.

Reduced the complete upper dial/joystick assembly in XY to .86 of its original diameter and the lower rocker assembly to .88. Counter-scaled their local Y extents by 1/.87 before the shared body deformation, preserving final circularity without changing centers or Z seating. All associated bezels, face grips, joystick cup/dots, SET label and direction notches follow their assembly. Values are photo-based proportional fits, not manufacturer component dimensions.

Added generated-geometry assertions for the finished ring axes. Ran output/gear-modeling/probe-r7-circular-controls.py against the updated generator: upper lip axes 20.6228 / 20.6238 mm; lower rim 19.4568 / 19.4568 mm. Both within .0001 model-unit tolerance. Probe log: /tmp/r7-circular-controls-probe.log.

Rebuilt editable blend, raw cache, compressed R7 (3,748,784 bytes), selector thumbnail and setup poster. Synced the ignored poster renderer from production before capture. Actual-viewer rear, grip-side and front-oblique checks passed without console errors; proof r7-rear-controls-final-rear.jpg, r7-rear-controls-final-side.jpg and r7-rear-controls-final-front.jpg. Syntax, GLB header/compression and diff checks passed.

This fixes a specific rear-control proportion/deformation error. Overall body contour, grip finish, optics and complete setup fidelity remain unproven. Other small rear controls still pass through the body's vertical fit and merit a separate reference check. Changes remain local and unpushed.

### 2026-10-11 — R7 small rear-button circularity

Previous turn made progress by correcting the two large rear controls. The smaller rear buttons still inherited the same .87 Y compression, and MENU additionally inherited .65 X compression from the left-shoulder fit. The actual viewer showed horizontally oval AF/INFO/playback controls and a vertically narrowed MENU cap, unlike the circular keys in Canon's saved rear photo.

Counter-scaled each R7 button assembly locally around its original center before the existing body deformation. Included the bezel, cap and associated icons/labels. Retained the original cap diameter and seating depth; the body deformation still positions the control centers. MENU receives the X correction as well. No 40D or lens change in this turn.

Expanded the generator's finished-geometry assertions to all seven small rear caps. During the actual build they measured 6.05 mm horizontally and 6.0500–6.0508 mm vertically. The two large controls continue to pass their circularity checks. Build log: /tmp/r7-small-buttons-build.log.

Inspected the final compressed asset from rear, opposite rear-oblique and front in the actual viewer. MENU clears the shoulder edge; the corrected keys remain seated and legends remain visible. No console errors. Evidence: r7-small-buttons-baseline.jpg, r7-small-buttons-final-rear.jpg, r7-small-buttons-final-oblique.jpg, r7-small-buttons-final-front.jpg. Updated raw cache, editable blend, compressed GLB (3,762,084 bytes), R7 thumbnail and setup poster. Syntax, GLB header/compression and diff checks pass.

This completes the identified R7 rear-control ovalization correction, not the overall photographic-fidelity goal. The oblique view still exposes rough terminal-cover/side-surface appearance, and grip finish, broader contours and optics remain incomplete. Changes are local, unpushed.

### 2026-10-11 — R7 terminal-label footprint and molded relief

Previous turn made progress by correcting small rear-button ovalization. Compared the actual terminal-side view with saved r7-terminals.webp. The flap outlines broadly follow the reference, but MIC and particularly HDMI were undersized relative to their covers. The existing tiny black planar lettering did not reproduce the reference's molded appearance.

Matched their approximate horizontal footprints to 35 and 65 pixels in the same reference coordinate mapping already used for the flap geometry. Used bold glyphs with low molded relief and rounded edges, sharing the cover's rubber material. These are visual approximations, not exact traced HDMI-logo contours. The final relief is approximately .16 mm after projection and body-width fitting. Did not change cover outlines or rubber grain scale on this evidence.

The first close-up exposed lumpy shading across narrow raised letter faces. Corrected the formed mesh so flat caps do not inherit bevel-side smooth normals. Inspected final compressed model in terminal-side rear-oblique close-up, rear and front views; no console errors. Proofs: r7-port-labels-final-oblique.jpg, r7-port-labels-final-rear.jpg, r7-port-labels-final-front.jpg. Earlier r7-port-labels-final-side.jpg predates the letter-normal repair and is intermediate evidence.

Updated editable blend, raw cache, compressed GLB (3,811,436 bytes), R7 thumbnail and setup poster. All nine rear-control circularity assertions passed during this build. Generator syntax, GLB header/compression and diff checks pass. The terminal panel's broader rubber character and pocket geometry still need comparison; this does not establish full photographic fidelity. Changes remain local and unpushed.

### 2026-10-11 — f/2.8 inner optical profiles and barrel occlusion

Previous turn made progress on R7 terminal lettering. Compared the current telephoto glass profiles with Canon EF365's saved construction section (70-200-f28-optics.png). The generic shallow inner element was too deep and too flat. Replaced it with a stronger spherical positive meniscus, closer to the first element; added the smaller next front group. These shapes fit the diagram approximately and do not reproduce all 23 elements or constitute a measured prescription.

The geometry-only trial made the oblique white patch brighter, exposing a distinct renderer error: environment reflections on internal glass ignored the surrounding barrel. Added a f/2.8-only shader check for whether the reflected direction can pass through the front sleeve opening (Z 3.634; radius approximately .6263). Directions blocked by the barrel no longer contribute environment radiance. Uses the actual decoded mesh-to-asset matrix and current world-to-asset transform, including quantized node scale and assembled pose. No new texture, network request or render pass; existing lazy/dirty rendering remains unchanged.

The check uses straight rays, so it omits refraction through preceding groups. It does not fix multiple-interface transmission, internal absorption, or all ray occlusion. This limitation is documented beside the code. The external front-surface studio reflection remains present; it was not painted out.

Actual viewer: checked head-on, intermediate and stronger oblique angles, then switched to owned 40D + 50mm and back to C200. No console errors, and returning to the C200 preserved the expected reflection pattern. Proofs: f28-aperture-occlusion-front.jpg, f28-aperture-occlusion-quarter.jpg, f28-aperture-occlusion-oblique.jpg. The earlier f28-inner-optics-oblique.jpg records the rejected geometry-only state.

Executed output/gear-modeling/check-f28-aperture.ts against the actual production material hook with a synthetic quantized GLTF fixture: shader injection, translation/rotation/scale invariance, reflected-direction transforms and missing-integration guard passed. Generated-surface ray checks (check-f28-element-clearance.py) passed 400 samples with minimum adjacent front-group clearance 2.255 mm. Build passed: 15 pages, 20.90 s. Syntax, GLB header/compression and whitespace checks passed.

Updated blend, raw cache, compressed f/2.8 asset (2,091,108 bytes) and thumbnail. This is a substantive optical-profile/visibility improvement, not proof of complete photographic fidelity. Other lenses do not yet have equivalent barrel-visibility checks, and full body/material/optical verification remains incomplete. Changes remain local and unpushed.

### 2026-10-11 — 50mm internal-reflection visibility

Previous turn made progress on f/2.8 profiles and barrel visibility. Inspected the owned 50mm geometry: its front element retaining lip ends at Z .5545 with clear radius .278. Parameterized the existing internal-reflection shader with a per-material opening uniform and enabled it for the 50mm using those dimensions. The f/2.8 retains its sleeve dimensions (3.634 / .62629). The opening-edge transition scales with radius rather than using a telephoto-sized constant.

Performed a controlled actual-viewer comparison on R7 + 50mm, temporarily restoring the previous shader without changing assets/camera pose. The old broad internal olive reflection disappears when its reflected direction is blocked by the retaining lip; the front glass reflection remains. Evidence: 50-aperture-baseline-oblique.jpg and 50-aperture-trial-oblique.jpg. Retained the corrected shader, then checked R7 head-on, 40D + 50mm, and switching to the C200/f2.8 with its different opening. No console errors. Additional proof: 50-aperture-final-front.jpg and 50-aperture-final-40d.jpg.

Ran check-lens-aperture.ts against both production material hooks: correct per-lens uniforms, shader injection, quantized-node compensation, assembly pose/direction invariance and integration-error guard passed. Build passed (15 pages, 23.78 s), diff check passed. Refreshed 50mm and f/2.8 selector thumbnails. No mesh or lighting change in this turn, no added render pass.

The head-on sensor appearance remains too direct because this is still an approximate optical system. Opening visibility uses straight rays and does not model refraction through preceding elements or all internal stops. This correction does not establish full photorealism. Changes remain local and unpushed.

### 2026-10-11 — Requested checkpoint release

Shipping the retained C200 casting finish, f/2.8 inscriptions and internal groups, R7 rear controls and molded terminal labels, per-lens internal-reflection visibility for the 50mm and f/2.8, and refreshed previews. The local/unpushed wording above records each investigation's state at the time. Re-ran both lens material-hook checks for this checkpoint. Existing lazy loading and rendering behavior are preserved. Full photographic fidelity and multi-interface optical transport remain incomplete.

### 2026-10-11 — 50mm transmission diagnosis after checkpoint

Previous turn made progress by committing and pushing fc880a8. Rechecked the actual R7 + 50mm head-on viewer; the sensor-like rectangle is still directly visible (50-transport-diagnosis-front.jpg), with no console errors. Canon EF295 specifies six elements in five groups; the current generator creates three glass meshes. Its section's front-surface radius/sag and diaphragm position are already approximately represented, but internal groups are incomplete.

Inspected installed Three's transmission_pars_fragment and WebGLRenderer, plus production material setup. Inner glass has transmission zero and additive reflection after the opaque transmission buffer; it cannot bend the image seen through the front element. The front shader refracts once, travels a thickness-sized vector and projects that endpoint to a screen texture. It neither refracts at the planar rear face nor propagates the outgoing direction through the remaining train. Therefore adding internal reflection meshes alone cannot repair the transmitted sensor image.

Executed ignored check-50-transmission.py, reading the front geometry parameters from the actual generator AST. It compares the existing shader's orthographic sample offset with Snell refraction at both interfaces of that isolated plano-convex element, then propagation to an illustrative Z=-.8 plane. Across IOR 1.45/1.52/1.60 and radial positions 0/.1/.2/.26, normal-incidence and reverse-path assertions passed. At IOR 1.52 and radius .2, the current sample coordinate is .193783 versus -.088706 for the isolated two-surface ray. This is a transport diagnostic, not a prediction of the complete Canon lens or the perspective screenshot; remaining groups, iris clipping and measured glass data are absent. Results: 50-transmission-diagnosis.json.

Next action changes from merely adding glass geometry to prototyping bounded sequential refraction with explicit stops and a valid rear-scene sampling method. It must be tested off-axis and on both camera bodies, and costed within the opt-in/dirty-rendered viewer. Do not darken the sensor to conceal the mismatch or treat generic Three transmission as a full lens simulation. No production asset/shader was changed in this diagnostic turn. Full fidelity remains incomplete.

### 2026-10-11 — Bounded sequential-refraction prototype

Previous turn made progress by isolating the transmission limitation. Implemented and ran ignored output/gear-modeling/sequential-50.py. It reads optical_element calls from the current generator AST and analytically intersects the same spherical/parabolic surface profiles. Each of the six current glass boundaries applies Snell refraction; the actual five-vertex iris opening clips crossings at Z=.275. Explicit outcomes distinguish transmitted, missed surface, iris clipping and total internal reflection. IOR uses current viewer values (front 1.48, inner 1.52, rear 1.60), not a manufacturer prescription. It does not render reflections or model barrel/flange occlusion.

Plane-parallel slab direction recovery, normal incidence, total internal reflection and pentagonal-stop checks passed. A 21x21 spatial grid at three incident tilts tested 1,323 rays: 914 transmitted and reversed through all six interfaces back to the original entry point/direction within 1e-8, 261 hit the iris and 148 missed a surface. Analytic hit positions satisfy each source surface to 1e-7. Results saved in 50-sequential-results.json.

The numerical prototype exposes incorrect optical power in the existing three-element simplification: paraxial EFL is about 31.88 mm at 55 mm/unit, not the intended 50 mm; its paraxial axis crossing is Z=-.16796, far ahead of the illustrative EF sensor plane Z=-.8. This is a prediction for our approximate generated shapes, not a claim about Canon's real lens. Do not wire these profiles into production as if tracing alone establishes fidelity. Correct the missing positive/negative groups against the six-element/five-group section, then check focal behavior and rear-scene sampling.

Rendered and visually inspected a scientific ray section in the browser: 50-sequential-section.svg and screenshot 50-sequential-section.jpg. It shows the premature convergence and stop clipping directly. No production models, shaders, previews or browser rendering costs changed this turn. The actual-viewer head-on failure remains documented in the preceding entry. Goal remains incomplete.

### 2026-10-11 — Five-group section fit and optical feasibility

Previous turn made progress by implementing sequential transport and exposing the current simplification's wrong power. Measured dark contour runs in the saved Canon EF295 section (50-optics.gif). Fit circles to selected samples using least squares, with explicit planes for nearly planar faces. The section shows five groups: front positive, second positive meniscus, negative pre-stop element, a cemented pair behind the stop, and rear positive element. These give eleven air/glass or cemented interfaces for six elements. Maximum residual at the selected contour samples is .751 pixel; this does not prove an exact measured prescription or the unmeasured portions of each surface. Negative-group clear radii omit the drawing's outer bevels.

Implemented ignored fit-50-section.py and fit-50-power.py. Arbitrarily retaining the current glass indices with the new shapes gave an implausible ~175 mm EFL, demonstrating why an outline fit alone is insufficient. A bounded three-index feasibility fit (1.45–1.95) yields front 1.754538, other positive glass 1.898329, negative glass 1.923880, with paraxial EFL 49.999618 mm and axis crossing Z=-.711008. These are fitted provisional values, not identified Canon glass types. Dispersion, absorption, coating response, full-field aberrations and exact mounting calibration remain unverified.

Corrected the target coordinate: prior -0.8 was explicitly an illustrative plane with a mount at Z=0. The actual 50mm seating face is at .088. Reading the production R7 sensor and assembly offsets gives lens-local sensor Z=-.711 (approximately .088-44/55, allowing .001 placement rounding). The existing 40D sensor uses a different source offset and requires separate investigation before sharing a target plane.

Across the same 1,323-ray grid/three tilts, the fitted eleven-interface approximation transmitted 880 rays with reciprocal entry/direction checks to 1e-8; 412 missed a surface, 31 hit the iris. The parallel section bundle crosses the axis from about -.711 to -.696 for the sampled nonzero heights, so paraxial matching does not mean perfect marginal focus. Reviewed the resulting browser-rendered scientific diagram: 50-fitted-section.svg / 50-fitted-section.jpg. Saved fit samples/results in 50-section-fit.json / 50-power-fit.json and explicit interfaces in 50-fitted-surfaces.json.

This provides a coherent candidate for the isolated viewer transport prototype, not a production fidelity pass. No production mesh, material, thumbnail or rendering cost changed. Next verify rear-scene sampling and off-axis behavior with these provisional profiles before deciding whether to retain them in the actual loadout. Full requested fidelity remains incomplete.

### 2026-10-11 — GPU sequential-refraction prototype

Previous turn made progress by fitting a coherent provisional five-group optical train. Ported its eleven-interface traversal to GLSL in ignored sequential-gpu.glsl, with finite sphere/plane intersections, spherical-cap selection, five-blade iris clipping, Snell refraction, total-internal-reflection handling and uncoated Fresnel transmission. Stable quadratic roots avoid cancellation. No stochastic paths or continuous render loop. The prototype sequential-gpu.html/.ts renders a diagnostic checker plane through the lens, with a ±20° view slider and a direct-versus-refracted comparison. This is not a product render.

Generated 1,024 independent CPU reference rays using make-50-gpu-fixtures.py. Half test the earlier spatial/direction grid region; half use finite eye positions and the full displayed ±20° range. The browser executes the actual GPU shader into float targets and reads exit positions/directions/statuses. Final result: all 1,024 statuses agree; 363 rays transmitted; maximum exit-position error 4.56e-7 model units and direction-component error 4.43e-7. No browser console errors. Earlier narrower fixtures also passed but are superseded.

Inspected head-on, both oblique ends, and refraction-disabled checker views. Captures: 50-gpu-final-front.jpg, 50-gpu-final-oblique.jpg, 50-gpu-direct.jpg. EXT_disjoint_timer_query_webgl2 measured .492 ms per 640x640 draw across 20 draws on this device, after shader compilation, without a disjoint event. This times only the isolated transport/checker shader, not the site, mobile devices, lens materials or rear-scene capture.

The bounded shader is feasible as a candidate; it still needs actual rear-scene sampling, body-dependent geometry, coherent front/inner meshes, coatings/reflections and grazing/rear behavior. Uncoated Fresnel currently dims the checker substantially; do not treat that as calibrated Canon coating transmission. No production shader, mesh or preview changed. Next use the fitted exit rays to sample real body geometry in an isolated actual-scene prototype, rather than substituting a synthetic sensor rectangle. Full fidelity remains incomplete.

### 2026-10-11 — Actual R7 rear-scene capture and depth traversal

Previous turn made progress by validating the bounded GPU transport shader. Built ignored rear-capture.ts, rear-sampling.glsl and sequential-rear.html/.ts. These load the actual compressed R7 and control-ring adapter through the production model library, place them in lens-local coordinates using the production assembly offset, and capture a 512x512 orthographic color/depth view behind the fitted glass. The capture uses RoomEnvironment and a directional light, not the production studio. Corrected the initial display's missing linear-to-display conversion with AgX/colorspace shader chunks. No synthetic sensor rectangle or sensor material darkening.

The initial 96 fixed world-space ray steps missed a thin sensor-frame feature: fixture 863 differed from direct triangle intersection by .01984 units. Replaced marching with 2D depth-texel DDA traversal, visiting every crossed texel and intersecting its depth plane. Retained the rejected fixed-step shader separately for evidence. This reduced maximum error to .001274 units (about .070 mm at 55 mm/unit), with no hit/miss disagreements or errors above .005 units over all 363 transmitted fixtures. Independent comparisons use Three Raycaster against decoded actual R7/adapter triangles, not the depth map. Hits comprise 324 sensor coating, 6 sensor filter edge, 25 flocking and 8 anodized surfaces. CPU reference validation is expensive and runs only in this diagnostic page; it is not intended for the site.

All 1,024 CPU/GPU optical classifications still agree, maximum optical position/direction errors 4.56e-7 / 4.43e-7. No console errors. The final isolated shader (transport plus rear-depth lookup) measured .722 ms per 640x640 draw over 20 draws on this device, excluding body capture, CPU verification and production lighting. Capture is reused during the diagnostic view changes.

Inspected head-on, 20-degree oblique and direct/refraction-disabled views. Saved 50-rear-capture-final-front.jpg, 50-rear-capture-final-oblique.jpg, 50-rear-capture-direct.jpg. Direct view shows the actual sensor rectangle/frame; refracted view magnifies the sensor surface across the transmitted pupil, instead of hiding it with a fabricated disk. This is a transmission-only study: it has no polished/coated lens reflections and uses uncoated Fresnel attenuation. Its plain appearance is not a fidelity result.

Single front depth captures cannot represent all occluded/non-heightfield surfaces; the sampled ray checks do not prove arbitrary-angle or rear viewing. Captured specular color also does not vary with outgoing ray direction. 40D mirror/viewfinder behavior, other lenses, coherence with fitted glass meshes and production studio lighting remain unverified. Next integrate the candidate in an isolated copy of the real viewer, preserving front-surface reflection and explicitly handling unsupported directions, before considering production changes. No production mesh/shader/preview changed this turn. Goal remains incomplete.

Deployment 38166384462 for checkpoint fc880a8 was confirmed successful (build and deploy); subsequent optical studies remain local.

### 2026-10-11 — Isolated studio integration and pupil corrections

Previous turn made progress by validating actual R7 rear sampling. Created ignored sequential-viewer-scene.ts from current production scene.ts, with only local imports and prototype installation/toggle/disposal added. The isolated sequential-viewer.html/.ts uses the same studio lighting, shadows, controls, equipment assets and dirty rendering. viewer-optics.ts captures the actual assembled R7/adapter interior with the production environment, retaining complete equipment shadows, then replaces the outer glass with an analytically normaled cap from the fitted profile. Its MeshPhysicalMaterial retains front coating reflections while the transmission chunk calls sequential transport and rear-depth sampling. Original glass meshes remain available for the baseline toggle; prototype mode omits their inaccurate internal reflection layers.

The first studio comparison removed the small directly visible sensor rectangle but exposed a clipped pupil. CPU checks identified G3's front aperture as a limiter: its radius had incorrectly copied the smaller rear optical face (32 section pixels), although the front extends to approximately 40 pixels. Corrected its radius while retaining its fitted curvature/vertex. Also corrected interpretation of the section stop opening: .17792 is a clear radius/apothem, not a five-blade corner radius. Set the fitted iris circumradius to .17792/cos(pi/5)=.2199212146. These corrections currently apply only to the experimental profile/tracer, not the production mesh.

The revised 60-azimuth parallel-ray pupil check gives diameter 28.027925 mm at every sampled angle, corresponding to f/1.78394 for 50mm, close to the nominal f/1.8. The fitted indices and paraxial focus remain unchanged. The 1,323-ray CPU test now has 1,029 reversible transmitted rays. Regenerated GPU fixtures: all 1,024 classifications agree, 397 transmitted, max position/direction errors 4.56e-7 / 5.04e-7. The earlier section/fixture counts in prior entries describe those earlier apertures.

Compared baseline and prototype at identical head-on camera pose, then inspected corrected prototype front-oblique, side and rear. No browser console errors. Evidence: 50-integrated-baseline-front.jpg, 50-integrated-prototype-front.jpg (before pupil corrections), and final 50-integrated-corrected-{front,oblique,side,rear}.jpg. The front's blue rectangular highlights are studio-card reflections, retained by the physical material; the refracted rear image is sampled from the actual sensor. The saved Canon product photo was re-inspected, but its different studio setup/oblique view cannot validate this coating response or establish a full photographic match.

Remaining: add coherent internal reflections/coatings, align the actual glass/iris meshes with fitted transport, validate 40D and selection/assembly changes, support or explicitly bound rear/grazing directions and refresh captures correctly, and measure full viewer costs. The isolated comparison is a candidate, not a production fidelity pass. No production asset, shader or preview changed. Full goal remains incomplete.

Re-ran the rear-depth comparison with the widened pupil's 397 transmitted fixtures: zero hit/miss disagreements, zero position errors above .005 units, maximum .001274 units. Saved visible diagnostic output in 50-widened-rear-check.txt. The initial page snapshot timed out while CPU triangle checks were running; resumed the same tab after completion rather than restarting the check.

### 2026-10-11 — Refracted internal reflections and shared-path optimization

Previous turn made progress with isolated studio transmission and aperture corrections. Added internal-reflection.glsl: each single-bounce reflection returns through all preceding interfaces, including reverse refraction, iris clipping and the actual front recess/filter openings. Mechanical escape checks use generator opening planes .674/.470, .715/.469, .7215/.473 and .749/.544 (Z/radius). Front environment reflection uses the same bounded path; the MeshPhysicalMaterial still handles shadowed direct specular light. Enabled receiveShadow on the fitted cap. Inaccurate original inner meshes stay disabled in prototype mode.

The uncoated trial produced excessive white glare (50-internal-uncoated-front.jpg). Added optical-coating.glsl as an explicit provisional single-layer AR model: film IOR 1.38, 125 nm on the front and 110 nm internally, sampled at 650/550/450 nm; the cemented interface uses bare dielectric Fresnel. Primary transmission and reflection branches both use the film coefficients. This is not Canon's measured multilayer coating, and omits dispersion, absorption and multi-bounce paths. The white/colored oblique reflections remain subject to reference calibration; do not claim a photographic match just because they follow paths.

make-reflection-fixtures.py computes independent complex-amplitude film reflectance and CPU paths. reflection-check.html/.ts compares actual GPU float outputs. Final wider-angle fixture set includes 64 rays / 704 surface branches, with horizontal eye angles up to ±.6 rad and elevations up to ±.3 rad: 212 branches escape; zero GPU/CPU classification disagreements; maximum direction 3.79e-6, position 1.282e-6 and spectral-energy 2.015e-6 errors. Per-channel primary-plus-single-reflection energy never exceeds one (maximum .999900). Earlier narrower/uncoated counts are superseded. Saved visible output in 50-reflections-gpu-check.txt.

Added an explicit diagnostic GPU-timing button to the isolated scene. Initial close-up at 1440x975 measured baseline 4.079 ms / prototype 14.716 ms over 10 draws each. Refactored the viewer to traverse the shared incident path once, spawning only the reverse branches; this reduced repeated surface work. Remeasurement at the same pose: baseline 3.942 ms / prototype 7.394 ms. Canvas screenshot comparison before/after optimization (excluding the text header) has mean absolute RGB byte errors .000213/.000114/0 and maxima 3/2/0, consistent with float-order differences. These GPU times exclude capture/compilation and do not establish mobile or whole-page performance.

Inspected head-on and both front-oblique directions with no console errors. Proofs 50-reflections-final-front.jpg, 50-reflections-final-oblique.jpg, 50-reflections-final-opposite.jpg; earlier trial captures and viewer-optics-before-prefix.ts / viewer-optics-uncoated.ts retain intermediate evidence. source viewer-optics.ts is now prototype-v5. Coatings, unsupported directions, body-dependent capture/selection behavior, real internal meshes and other lenses remain unverified. No production code, models or previews changed; this is a retained local candidate, not a shipped fidelity pass. Full goal remains incomplete.


### 2026-10-11 — Body selection and optical resource lifecycle

Previous turn made progress by pushing the requested documentation checkpoint (888db75); production remains fc880a8's viewer behavior. Verified the retained ignored selector integration in sequential-viewer-scene.ts and sequential-viewer.html/.ts. The optical candidate now supports R7 and 40D with the 50mm, preserves the requested optics mode across selections, disposes the previous cap/material/render target before replacement, and regenerates the interior capture for the selected body. It resets cached lens rotation before capture and uses original optics during the 650ms assembly animation so a final-position capture is not displayed through an exploded lens. This remains isolated from production.

Actual browser test selected 40D + 50, 40D + 28–135, C200 + 70–200 f/2.8, then returned to owned equipment. The two unsupported combinations reported no installed prototype, while the requested checkbox remained checked. Eight rapid R7/40D switches incremented captureRevision from 4 through 11 with stable 121 geometries / 65 textures / 23 programs during animation. After full rendering the fitted cap adds one geometry/program: settled R7 and 40D both reported 122 / 65 / 24; further fully rendered switches (revisions 12–13) returned to exactly those counts. No browser console errors. These are renderer counters over this sequence, not a comprehensive memory profile. Evidence: ignored 50-switch-resources.json.

Inspected and saved 40d-sequential-switch-front.jpg and r7-sequential-switch-front.jpg. They show distinct captured interiors after switching, but also expose remaining fidelity failures: a horizontal strip inside the 40D lens and a plainly flat gray pupil region on R7, plus uncalibrated blue studio reflections. Source confirms the 40D has a tilted mirror mesh but no modeled focusing screen in its mount assembly; the single capture only records fixed mirror shading, not direction-dependent reflection through the screen/viewfinder path. Thus selection/resource behavior passed the exercised cases, while photographic fidelity did not. Next investigate the 40D mirror path and R7 rear/coating response rather than promoting this candidate based on working selectors. No production meshes, shaders, previews or loading costs changed this turn. Goal remains incomplete.


### 2026-10-11 — 40D depth failure and actual-triangle intersection candidate

Previous turn made progress by validating selector/resource behavior and exposing different interior appearance. Inspected the current mount generator and Canon's focusing-screen diagram (see REFERENCES.md). The generator omits the focusing screen and uses a 40D sensor Z of -.36, while its EF seating face .531 and the project's 44/55 register would place that plane at -.269. This discrepancy and the missing reflection path remain uncorrected in production; don't conflate confirming them with fixing them.

Parameterized the ignored rear-capture diagnostic for 40D. Against actual decoded triangles, the depth method had no hit/miss disagreements but two position errors over .005 units among 397 transmitted rays; maximum .688734 units. Fixture 964 actually reaches the sensor through the mirror-edge gap, while the heightfield method invents a side wall at the first occupied depth texel. A surface-only variant removed the invented walls but produced 27 missed intersections on discontinuous depth samples. Rejected that variant and restored the previous shader; retained it as rear-sampling-surface-only.glsl for evidence. A single front heightfield is insufficient for this tilted mirror and occluded rear geometry.

Implemented ignored rear-geometry.ts using installed three-mesh-bvh and the real camera triangles. Fixed a conversion error discovered by comparing CPU/GPU root bounds: StaticGeometryGenerator clones normalized integer position attributes from compressed GLBs, so writing transformed world positions into them clamps coordinates. Explicitly expanded positions to Float32 before transformation. The corrected BVH uses the actual decoded geometry without the heightfield substitution. The geometry-only lab uses it with ?geometry=bvh. Colors still come from the original front capture, so this is not yet a valid hidden-surface shading solution or mirror reflection.

Final full tests: 40D, 397 transmitted rays, zero hit/miss disagreements and zero errors above .005, maximum position error 4.615e-7; R7, same counts, maximum 5.026e-7. Both retained 1,024/1,024 CPU/GPU optical classification agreement. No browser errors. Evidence: 40d-bvh-check.txt and r7-bvh-check.txt. Full body BVHs are currently large (412,633 / 459,032 triangles); build/packing took 157.9 / 184.0 ms. Isolated 640² transport plus triangle-intersection shader measured 1.537 / 1.483 ms per draw, over 20 draws on this device, excluding capture/build/compilation. These are not whole-viewer or mobile measurements.

Next bound the triangle data to the actual interior without losing reference intersections, retain material/normal information for hidden-surface shading, and trace the 40D mirror toward reference-matched focusing-screen geometry. The new evidence changes the next action from repairing depth marching to representing the actual interior surfaces. No production model, preview or rendering code changed; photographic fidelity remains incomplete.


### 2026-10-13 — Bounded interior BVH candidate

Previous turn made progress by replacing the failed depth-intersection approximation in the isolated diagnostic with verified actual-triangle traversal. Revalidated files and found the dev server no longer listening; started the existing Astro project on 127.0.0.1:4321. Initial browser observation timed out during the expensive independent CPU check; resumed the existing tab after completion.

Reduced rear-geometry.ts to camera-interior geometry. It transforms decoded positions directly to Float32 world/lens-local coordinates, retains triangles whose AABBs intersect the chamber volume X[-.48,.48], Y[-.48,.60], Z[-1.5,.02], and remaps only retained vertices. It does not simplify retained surfaces. The shader explicitly bounds supported ray origins/hits to that volume. Whole triangles crossing a boundary remain, avoiding clipped-face approximations. This contract covers the tested primary rays and leaves space above the mirror for a future screen; it does not establish support for the pentaprism or arbitrary reflected paths outside the volume. Saved prior full-body implementation as rear-geometry-full-body.ts.

40D retained 27,401 of 412,633 triangles (93.4% removed), with 974,888 bytes of BVH texture arrays. R7 retained 63,667 of 459,032 (86.1% removed), with 2,286,352 bytes. These are BVH texture-array bytes, not total GPU memory or asset download size. Build/packing measured 122.4 / 149.8 ms on this device. Isolated 640² draw timings were 1.817 / 1.643 ms, so no GPU speedup claim relative to the earlier full-body run.

Both browser checks again matched all 397 transmitted rays against the complete decoded camera meshes via independent Three Raycaster: zero hit/miss disagreements, zero position errors above .005 units, max 4.615e-7 (40D) / 5.026e-7 (R7). All 1,024 optical classifications still matched. No browser errors on the final R7 run. Evidence: 40d-bounded-bvh-check.txt and r7-bounded-bvh-check.txt. Bounds/material handling for secondary mirror rays still needs verification. Next carry material identity and normals through these intersections to replace the invalid front-capture color lookup on hidden surfaces, then implement the missing screen/reflection path. No production assets or rendering code changed; full photographic fidelity remains incomplete.


### 2026-10-13 — Material identity and geometric normals in the interior tracer

Previous turn made progress by reducing BVH geometry while retaining the sampled intersections. Extended ignored rear-geometry.ts with material IDs per retained vertex; remapping keys include the original vertex and material so shared vertices at material-group boundaries stay distinct. A UIntVertexAttributeTexture carries these IDs through BVH index reordering. hitRearSurface returns hit position, oriented geometric face normal and material ID. Existing hitRear remains a position-only wrapper. The texture is included in resource accounting and disposal. This is geometric-normal transport, not a normal-map or smooth-shading implementation.

The actual GPU diagnostic renders normals/IDs into a float target and compares each against the original decoded GLB intersection's material object and transformed face normal. 40D: all 397 materials agree; maximum normal-vector distance 9.330e-6. R7: all 397 agree; maximum 2.057e-5. Position/classification checks still pass with the same maxima as the preceding entry. Added a complete-diagnostic status that requires full fixture coverage, optical agreement, rear-hit agreement and surface-attribute agreement; a partial probe can no longer mark the whole diagnostic passed. Evidence: 40d-bvh-surface-check.txt and r7-bvh-surface-check.txt. No errors in the final R7 console check; resumed the same tab after a CPU-validation observation timeout.

BVH-plus-material texture arrays total 1,060,152 bytes (40D), 2,483,488 bytes (R7). The observed isolated draw timings were 2.881 / 1.889 ms, excluding build, capture and compilation; no speedup or mobile claim. The prototype now has the surface identity/direction data required to distinguish mirror hits and trace a reflected ray. It still displays the old captured colors, so hidden-surface shading and the missing focusing-screen path are not fixed by this data change. No production asset or shader changed. Next use the verified mirror normal/material to validate secondary rays and construct the missing screen geometry against Canon's assembly reference. Full photographic fidelity remains incomplete.


### 2026-10-13 — 40D mirror passage and focusing-screen geometry

Previous turn made progress by validating material IDs/normals. Added ignored mirror-check.html/.ts, tracing a reflected segment from actual 40D mirror hits on the GPU and comparing against independent full-mesh Three Raycaster intersections. Of 83 distributed transmitted fixtures, 81 hit the mirror. Before modeling changes: zero secondary hit/material disagreements, max position error 3.183e-7; 80 secondary rays hit chamber flocking. All 71 rays whose paths intersect the nominal image-area rectangle at the folded screen plane were blocked by the cylindrical lining. This establishes a geometric obstruction, beyond the previously identified missing screen.

Changed build_models.py: correct the 40D sensor center to its EF register (body Z=-.269) and 22.2 × 14.8 mm; open an upward screen passage through the chamber lining, mount boss and housing; add an Ef-A screen slab and four retaining edges. The screen underside Y=.4591213 and center Z=.1901213 are derived by reflecting the corrected sensor plane across the existing front mirror plane. Screen outer dimensions/margins, slab thickness and matte-transmission material are provisional, not measured Canon components. Its material has an explicit shortcut comment. The RF body path remains unchanged. Saved pre-change source/40D asset in ignored output.

Rebuilt the 40D with Blender and meshopt/WebP optimization. New compressed asset is 3,548,788 bytes versus 3,602,404 before. Re-ran secondary-ray validation against that exported asset: zero hit/material disagreements, max position error 5.024e-7; 73 secondary hits on the screen, six on flocking, one on the casting, one miss. All 71 nominal image-area candidates reach the screen; none are blocked by the previous lining. These tests validate the sampled geometry, not the screen's Fresnel response, the partly transmitting main mirror, AF/submirror path or pentaprism. Evidence: 40d-mirror-before-screen-check.txt and 40d-mirror-with-screen-check.txt.

Selected EOS 40D + EF50mm in the actual /classic viewer and inspected front, side and rear. No visible new exterior holes and no console errors. Saved 40d-screen-production-{front,side,rear}.jpg. The existing front optics still look approximate; production runtime does not yet use the verified secondary-ray transport, so this is not a finished reflected image or photographic-fidelity pass. The new geometry is local/uncommitted. Existing thumbnails have not been regenerated for these mostly internal changes. Next integrate bounded material-aware reflection/shading and calibrate the screen finish, then refresh previews. Full goal remains incomplete.


### 2026-10-13 — Isolated mirror-path rendering and lighting limitation

Previous turn made progress by modeling the missing screen/passage and verifying secondary intersections. Integrated the bounded BVH and material-aware secondary mirror segment into ignored viewer-optics.ts (prototype-v6-mirror). buildRearGeometry now accepts an optional world-to-lens matrix so the assembled production-body transforms can feed the same validated ray coordinate system. Mirror reflection uses .6 throughput; the remaining transmitted/submirror path is still absent. Added a below-screen orthographic color/depth capture and projection into that capture for actual screen hits. Non-screen front-capture samples now require matching depth, preventing a hidden point from borrowing an unrelated foreground color. Capture-dependent shading is still approximate and incomplete.

Added an Interior image only diagnostic toggle, plus mirror/screen IDs and capture-center RGB to the isolated viewer's resource report. Actual 40D assembly identifies mirror=4, screen=5 and 29,307 retained interior triangles. The screen capture center has linear RGB .0005975/.0007453/.0009365. Inspected head-on and oblique, with no shader errors. The isolated interior image remains almost black; the screen's raster capture retains opaque equipment shadow maps and does not include light transported through the lens and reflected by the mirror. A nonzero capture pixel is not evidence of calibrated illumination or photographic fidelity. The pale horizontal strip remains visible, and oblique glass glare is excessive. Do not promote this experiment on the basis of a compiling shader.

Close head-on timing at 1440×975: baseline 4.315 ms, candidate 15.633 ms over 10 draws each, excluding capture/compilation. The candidate is not ready for visitor-facing integration. Saved 40d-integrated-mirror-front.jpg, 40d-integrated-mirror-oblique.jpg and 40d-integrated-mirror-check.txt.

The oblique view also exposed an existing rough/triangular-looking region beside the prism housing. Compared against saved 40d-before-screen.glb at the same pose: that defect is present before the screen changes (40d-before-screen-oblique-comparison.jpg). Restored the new screen asset after the temporary local comparison; SHA256 14808f0e8907eed2537c367a390cd6c0ae3e6ee886d3ee4b25ef63acf77b3c42 matches the retained candidate. No additional production shader changes or deployment. Next prioritize correcting that visible housing defect against the product reference, while retaining the optical path experiment for later lighting/performance work. Full fidelity remains incomplete.


### 2026-10-13 — Requested shipping checkpoint

Shipping the previously inspected focusing-screen asset (SHA256 14808f0e8907eed2537c367a390cd6c0ae3e6ee886d3ee4b25ef63acf77b3c42) and its matching generator. A subsequent prism-seat smooth-normal trial was generated but not visually validated; saved its source and raw GLB in ignored output and restored the verified source/asset pair for this checkpoint. The visible prism-housing defect remains unresolved. Optical transport and mirror-lighting experiments remain local, outside the production viewer. Existing lazy activation and rendering behavior are unchanged. This is an incremental geometry checkpoint, not a photorealism completion claim.


### 2026-10-13 — Prism-shoulder differential checks

Previous turn shipped the validated focusing-screen checkpoint as 981a0cd. Reproduced the prism-shoulder notch in the actual /classic viewer with EOS 40D + EF50mm, Home and two zoom-in keypresses. Rechecked the top and multi-view 40D product references; their closed cover/shoulder does not have this angular notch. Saved baseline as 40d-prism-baseline-production.jpg.

Tested the earlier prism-seat smooth-face candidate, compressed with the same meshopt/WebP settings: notch remains (40d-prism-smooth-production.jpg). Then changed only the cavity X expansion from 1.008 + .242*crown_clearance to 1.008, rebuilt and compressed: notch remains, and the surface beside the cover still has abrupt contours (40d-prism-tight-pocket-production.jpg). Neither is a fix. Saved both candidate sources/assets in ignored output, then restored the exact shipped generator and GLB. This rules out support flat-shading alone and cavity lateral expansion alone as sufficient corrections. Next isolate the cover/seat/casting geometry individually at this pose to locate the exposed boundary before further reshaping. No new production geometry or shader change retained. Full fidelity remains incomplete.


### 2026-10-13 — Prism seating intersection and continuous crown trim

Previous turn ruled out support smoothing and lateral cutter expansion alone. Generated an unjoined diagnostic assembly with blue casting/orange flash cover, viewed in the actual /classic selector. Removing baked occlusion from the shipped GLB did not remove the notch. Clearing shell custom normals likewise did not remove it; neither probe was retained. Saved component/cover-removed/no-AO/fresh-normal screenshots and assets in ignored output.

Measured shell and flash cross-sections with independent BVH rays. The previous cutter raised its lower surface along with the crown: at nine sampled seat positions the shell overlapped the cover by .009284 to .035843 model units. check_prism_clearance.py fails on the saved original unjoined assembly. Moving only the cutter underside down fixed these sampled intersections but left an excessive side gap. Restricting lateral expansion to higher points exposed raised original-casting edges in the side view; rejected that intermediate variant.

Replaced the expanded cover-copy cutter with a closed extrusion whose lower edge follows the cover loft's actual minimum Y at each longitudinal station, with .003 clearance, across the entire prism crown. This removes the raised shell edges beside the cover rather than leaving them outside a tapered cut. Retained the original normals and materials. Rebuilt, compressed and inspected oblique/front/side/rear in the actual viewer: side ridge removed, no new exterior holes or missing controls observed, no browser errors. All nine clearance samples pass at .003. Saved prism-clearance-before.txt, prism-continuous-clearance.txt, and 40d-continuous-seat-{oblique,front,side,rear}.jpg. The oblique seam is still more pronounced than the product reference; this is a geometry correction, not a complete visible-notch/fidelity fix. Next address the remaining shoulder-to-seat transition against the side/oblique reference. Preview images have not yet been refreshed for this local iteration. No new push.

Validation: local site build passed (15 pages, 26.17s); git diff --check passed. Retained compressed 40D is 3,618,844 bytes, SHA256 7e96bc68075bb3fbae8ee56e8c359844947409d522a6161b6540512f7951cca3. GitHub Pages run 38412470121 for the prior 981a0cd checkpoint completed successfully, and the live /models/gear/40d.glb hash matches that shipped asset (14808f0e8907eed2537c367a390cd6c0ae3e6ee886d3ee4b25ef63acf77b3c42). Current correction remains uncommitted/local.


### 2026-10-13 — Rejected shoulder blending/deformation candidates

Previous turn retained the continuous crown trim and proved the earlier shell/cover intersection. Tested curved support sides (12 segments), then local smoothing after a .008 voxel remesh. The first showed additional Boolean-junction creases; the second still had uneven transitions and grew the compressed body to about 4.64 MB. Rejected both.

Replaced the support union experimentally with direct deformation of the casting's upper vertices, using its original top-surface BVH, a smooth lateral shoulder profile and tapered longitudinal/lateral weights. Removed stale custom normals after deformation. A first hard selection boundary visibly stepped the opposite shoulder; smooth tapering removed that boundary. Smooth flags on the seating cutter reduced visible bands in the oblique view. These candidates passed the same nine clearance probes but the side view still showed stair-like shading and the front silhouette became jagged. The favorable oblique view and clearance checks were insufficient. Rejected the deformation and smooth-cut variants after multi-angle inspection; screenshots 40d-{curved,blended,deformed,tapered,smooth}-seat-*.jpg and candidate sources/assets remain in ignored output.

Restored the exact prior continuous-seat source/GLB pair (SHA256 7e96bc68075bb3fbae8ee56e8c359844947409d522a6161b6540512f7951cca3). Refreshed public/models/gear/previews/40d.png from the retained model with the existing thumbnail renderer, preserving transparent background. The browser's download helper timed out; recovered the same tab and saved its existing PNG export link. No new geometry changes from these trials retained, and no push. Next construct the shoulder/prism as a continuous reference-matched surface with deliberate topology; adding Boolean supports, remeshing them or deforming this decimated casting has not produced an acceptable multi-angle result. Full photographic fidelity remains incomplete.


### 2026-10-13 — Smaller flash closing-edge treatment retained

Previous turn rejected curved-support, remesh and post-decimation deformation variants after multi-angle regressions. A fresh focused asset search returned mostly EOS 400D meshes rather than the required 40D; did not substitute them or acquire a new model. Added an actual oblique 40D photograph by 103momo (see REFERENCES.md), which makes the nearly flush cover/casting joint clearer.

Tested the direct casting deformation before polygon reduction instead of after it. It still distorted the top-LCD transition in the actual viewer; saved build-models-dense-crown-rejected.py, 40d-dense-crown-rejected.glb and 40d-dense-crown-oblique.jpg in ignored output, then restored the previous continuous-seat construction.

Identified that smooth_outline used the same broad .10 corner treatment at the flash's lower closing edge as its crown. Added per-corner radius support while preserving scalar behavior for every existing caller. Only the two 40D closing corners now use .008; the remaining cover corners retain .10. These are authoring parameters, not measured Canon radii. Rebuilt and inspected in the actual /classic viewer: the side seam is visibly thinner and closer to the reference; front/rear showed no new contour regressions or missing controls. Oblique shoulder still has an angular transition, so this does not complete its fidelity pass. No browser errors. Evidence: 40d-small-seam-radius-{oblique,front,side,rear}.jpg.

Expanded check_prism_clearance.py from nine central samples to 15, including points near both closing edges. All report .003 separation, with no sampled intersections. The test remains a limited geometry check, not a photographic-accuracy gate. Refreshed the 40D thumbnail through the existing preview renderer. Compressed asset is 3,622,508 bytes, SHA256 3dece58da009fcb5c981f769ebf07ea1230e1b063dd2419f95edb7b438b95e6c. Local changes remain uncommitted; no push. Next refine the remaining casting/LCD-side transition using the oblique photo and side profile, without reviving the rejected deformation approaches. Full goal remains incomplete.

Final validation: site build passed (15 pages, 29.34s), git diff --check passed, and the built thumbnail hash matches the refreshed source PNG.

### 2026-10-13 — Requested shipping checkpoint: flash seating

Shipping the multi-angle-verified small closing-edge treatment, continuous crown trim, matching refreshed thumbnail, references and 15-point clearance check. Retained asset SHA256: 3dece58da009fcb5c981f769ebf07ea1230e1b063dd2419f95edb7b438b95e6c. The subsequent LCD-spacing candidate passes a local bridge ray check but has not completed visual review; its source and compressed/raw assets remain in ignored output/gear-modeling. Restored the verified source/asset pair for this release. Remaining shoulder/LCD transition and full photographic fidelity are unfinished. Production rendering and lazy activation remain unchanged; optical experiments are not included.

### 2026-10-13 — LCD pocket no longer cuts the prism shoulder

Previous turn shipped c16b41a (flash seating checkpoint); this turn resumes local fidelity work. Differential experiment removed only the top-LCD casting subtraction: the lower rectangular gouge disappeared while the upper flash seam remained. Restored the pocket and moved the recess, bezel, glass and inactive display segments .09 model units toward the grip (about 4.95 mm); button row remains in place. The top product reference supports a larger optical-axis-to-display distance, approximately 32 mm instead of 27 mm, but this is photo-derived rather than measured CAD.

Retained candidate after actual /classic viewer inspection at oblique, top, front, side and rear. Lower gouge is absent; LCD remains seated within the body. No new exterior contour regression or missing rear controls observed, and browser error log empty. Upper seam remains visibly angular, and lens optics/markings and overall body fidelity are not complete. Evidence saved as 40d-lcd-spacing-{oblique,top,front,side,rear}.jpg in ignored output/gear-modeling. Refreshed thumbnail using the same preview renderer.

Added independent bridge/pocket ray probes to check_prism_clearance.py. Old exported mesh fails at bridge Y=.575 (the pocket floor); new assembly passes at Y=.71004, with actual pocket floor still .575. All 15 flash-seat checks still pass at .003 separation. Compressed asset 3,618,492 bytes, SHA256 2c3d2f6a48d9aac6fa85be16c9b4e54cc1b8d68da6bf7af4ad2885c71e67c80e. Geometry checks are limited regression checks, not proof of photographic fidelity. No production shader changes or new push.

Validation: first site build encountered the existing GitHub GraphQL HTML-response/JSON-parse failure. One retry passed, 15 pages in 28.46s. git diff --check passed. The previously pushed c16b41a Pages deployment retry was still in progress when last checked; no deployment claim for this local iteration. Next inspect the remaining upper flash seam and the conspicuously exposed mount rim with EF50 against references.

### 2026-10-13 — Settled mount check corrects an animation-frame diagnosis

Previous turn made concrete progress by fixing the LCD pocket/shoulder collision. This turn rechecked the alleged exposed silver mount rim against source geometry and the actual viewer after lens insertion completed. The settled EOS 40D + EF50 assembly covers the flange correctly. The previous oblique capture was made during insertion; do not shrink the flange or enlarge the lens to correct that transient frame. Saved 40d-lcd-spacing-settled-oblique.jpg and a settled grip-side view. The lower shoulder correction remains visible in the settled view; the upper flash seam remains angular and needs further topology work. No mount geometry change is warranted by these observations. This corrects the previous turn's mount-rim follow-up, not the full fidelity assessment.

### 2026-10-13 — Corrected closed-cover longitudinal seam profile

Tested a local .035, four-segment concave fillet on 185 support/shoulder union edges. The candidate passed seat/LCD checks but did not visibly correct the upper seam in settled oblique/side views. Rejected it; source, raw/compressed assets and screenshots remain in ignored output.

Rechecked the existing 40d.jpg side reference: its closed-cover seam rises gently toward the front. Our .065*sin(pi*t) underside term instead formed a pronounced midpoint arch. Reduced that term to .012 in both the cover loft and underlying support, retaining the continuous crown trim and .003 clearance. This is photo-derived contour fitting, not a measured Canon dimension. The settled oblique view no longer has the triangular-looking interruption. Side seam is gentler; front/rear have no new visible contour regressions or missing controls. Browser error log empty. Saved 40d-seam-profile-{oblique,side,front,rear}.jpg. All 15 seating probes and both LCD bridge/pocket probes pass (prism-seam-profile-check.txt). Refreshed thumbnail.

Retained compressed asset: 3,597,936 bytes; SHA256 c532c16a39d6f8c91ce593a034ed9e5109ff20d5c92c96985dddad7feacdf2bc. Full photorealism remains unfinished; materials, optics and broader body/lens reference matching still require verification. No new push. Earlier c16b41a deployment run 38421792920 now reports success.

Final checks: site build passed (15 pages, 29.50s); git diff --check passed. Downloaded live model hash matches the shipped c16b41a checkpoint (3dece58da009fcb5c981f769ebf07ea1230e1b063dd2419f95edb7b438b95e6c). Current LCD/profile corrections remain local.

### 2026-10-13 — C200 rear/ocular audit and rejected coating-only trial

Previous turn retained a concrete 40D seam-profile correction. Shifted this pass to the available C200 + example EF70–200 f/2.8 to cover the broader goal. Confirmed available tab selects the correct body/lens and native EF specs. Compared settled rear and both rear-oblique views with c200-rear.jpg and the operator-side c200.jpg. Main battery, SD slots, audio controls and terminal-cover layout are present, but the ocular still reads as a rectangular window rather than the layered optical appearance of the reference; this is not a full rear fidelity pass. Saved c200-audit-rear.jpg.

Inspected eyecup() and confirmed its front surface already has spherical curvature, with rectangular baffles behind it. Tested a C200-only physical thin-film material (iridescence .65, IOR 1.38, thickness 260–280 nm), preserving geometry. Actual viewer comparison from both rear-oblique angles showed no material improvement toward the reference's layered optical appearance. Rejected the change and restored models.ts exactly; diagnostic source and c200-ocular-coating-test.jpg remain ignored. Do not treat adding tint as a sufficient ocular correction. Next inspect/model the internal ocular group and its occlusion, and compare side housing contours, rather than simply raising reflection intensity. No C200 geometry or shader change retained; full goal remains incomplete.

Rechecked Canon Australia's C200 technical sheet (https://www.canon.com.au/-/media/images/canon/products/eos-c200/c200-tech-sheet.ashx): built-in EVF is electronic, 1.77M dots. Existing shared eyecup comment referring to an optical finder must not be interpreted as the C200's actual architecture.

### 2026-10-13 — C200 circular ocular differential test rejected

The previous turn's coating-only test did not improve the reference match. A focused C200 model/eyepiece search found no verified downloadable replacement; the Sketchfab tag result was inaccessible and is not evidence of an available camera asset. Do not substitute unrelated Canon eyepiece teardown results.

Tested replacing only the rounded-rectangular C200 optical face with a .195-radius spherical circular face, keeping its rectangular carrier. Full C200 generator dimension checks passed and the asset exported/compressed. In the actual viewer close-up, the first candidate's reflection extended over the carrier because the optical face was forward of it. Saved forward-placement source/GLB and c200-round-ocular-forward-closeup.jpg.

Moved the circular face .05 inward and rebuilt. This fixed the frame overlap in close-up; checked the opposite rear angle as well. However the result still reads as a single window and does not reproduce the reference's layered optical appearance. Rejected the circular-face-only approach rather than retaining an unsupported approximation with no convincing fidelity gain. Saved c200-round-ocular-seated-closeup.jpg, raw/compressed assets and candidate source in ignored output. Restored the exact prior generator and C200 GLB, preserving the retained 40D LCD/seam corrections. No production C200 geometry or shader change retained. Next investigate internal optical groups and their visibility/occlusion; single-surface shape, depth and coating changes alone have not solved the observed mismatch. Goal remains active and incomplete.

### 2026-10-13 — C200 internal ocular reflection retained provisionally

Added a recessed spherical internal surface and retaining rim behind the original rectangular front glass, rather than replacing that glass. This creates a distinct curved reflection and visible internal rim in the actual viewer. Compared close-up, straight rear and both rear-oblique views: the added surface stays inside the carrier and no longer reads solely as a single flat window. Front/side setup views show no new exterior changes; browser error log empty. Evidence: c200-inner-ocular-{closeup,opposite,rear,front,side}.jpg. Refreshed thumbnail.

The opaque near-black dielectric backing approximates the powered-off EVF's internal reflection; it is not a transmitting optical prescription and does not simulate an operating display. Radius (.183), sag (.026), thickness (.008), placement and violet specular tint are photo-derived authoring approximations. Explicit shortcut comment records this limit. Full optical fidelity and the reference's exact reflection/color response remain unproven. No new renderer passes, shaders or viewer material overrides were added. Existing outer glass transmission remains unchanged.

check_c200_ocular.py probes material-selected world-space depth bounds from the generated Blender mesh: inner element lies strictly behind front glass and ahead of finder field. Pass recorded in c200-inner-ocular-seating.txt. C200 dimensional generator checks passed. Compressed asset 4,542,324 bytes; SHA256 ae0fb8428d604c8faa45ccc6b6546da66f92f6cf770a3323537d4a9598c79b1c. Normal-preservation list includes the new polished surface. This is a local incremental visual improvement, not a completed C200 or overall fidelity pass. Next prioritize the larger C200 housing/controls and lens switch profiles against the references rather than treating this eyepiece approximation as completion. No push.

Final validation: site build passed (15 pages, 26.35s) and git diff --check passed. New C200 seating check is an untracked source file to include with this retained change when next committing; ignored Python cache files must not be staged.

### 2026-10-13 — f/4 stabilizer headings scaled to the switch-panel reference

Inspected owned R7 + Control Ring adapter + EF70–200 f/4 in settled side/close-up and oblique views against 70-200-f4-side.jpg. Panel follows the cylindrical barrel and its keys sit within recesses; the original floating-plaque issue is not present in these views. No tripod collar is present on the owned lens. The STABILIZER headings were undersized relative to the panel width in the photo (roughly half its width in the viewer versus about two thirds in the reference).

Increased only the f/4 STABILIZER and STABILIZER/MODE title size from .040 to .055; retained all switch positions and other labels. Rebuilt/compressed and repeated the same close-up: headings are clearer, fit within panel edges, and do not overlap sliders. Oblique view remains seated; browser errors empty. Evidence f4-headings-{before,after,oblique}.jpg. Refreshed f/4 thumbnail. Compressed asset 2,134,320 bytes; SHA256 2a3bbd6f6e2916fbdbcd55b7ad594fd04cd96e3d84541e07ef662ccf100b281c. This is a readability/reference-proportion correction, not a full lens fidelity pass; finish and optics remain imperfect. No f/2.8 or renderer changes. No push.

Validation: site build passed (15 pages, 26.51s); git diff --check passed. Retained locally with earlier 40D and C200 work.

### 2026-10-13 — Consistent telephoto enamel grain

Compared f/4 white finish against the close side photo. Existing White enamel used fine random noise with viewer tiling based on each independently packed part. Switched to subtle cellular orange-peel normal detail and normalized enamel UV area to .22 model units per tile (12.1 mm, roughly .25 mm per cell). The classic loader now repeats enamel normal and roughness maps at the authored scale, preserving authored normal strength. Kept base color and mean roughness; final normal strength .40 is an appearance calibration, not a measured coating profile. A temporary viewer-only strength multiplier was removed after baking the chosen value into both assets.

Rebuilt f/4 and f/2.8, checked f/4 side and grazing close-up and f/2.8 side in the actual selector. Effect is subtle at normal zoom; close-up retains readable print and switch boundaries without gross bump distortion. Rubber geometry unchanged. No browser errors. Evidence f4-enamel-final-closeup.jpg and f28-enamel-final-side.jpg. Both previews refreshed. check_enamel_scale.py checks aggregate world-area/UV-area ratio from each generated Blender mesh; both return .22. This does not prove microscopic coating accuracy or eliminate local UV distortion. Full surface/lighting/optics fidelity remains incomplete. No push.

### 2026-10-13 — User-requested shipping checkpoint

Shipping the retained 40D LCD/seam corrections, C200 internal ocular, f/4 headings and both telephoto enamel finishes, with their refreshed previews and regression checks. Final site build passed (15 pages, 25.12s); git diff --check passed. Actual-viewer inspections are recorded above. Lazy activation/render scheduling remain unchanged; ignored optical experiments are excluded. Full photorealism remains unfinished.

Final telephoto SHA256: f/4 97dae7e684deba1d72890996b91447a1e1bfeed0741360a0c446c6c0ea11069f; f/2.8 51c2efb9f9fa730a51e0dd11377b94a66efdcda7e5c358f5eac6fe55d4147141.

### 2026-10-13 — C200 operator lettering weight

Previous goal turn made progress by committing/pushing checkpoint 56495a8. Resumed against the current working tree and actual viewer. Compared the operator-side C200 with the existing c200.jpg close product reference. Regular Arial captions were visibly finer than the reference printing. Switched function captions, power positions, REC, WB and INDEX to Arial Bold; increased ND caption .049 to .059, WB .031 to .039, INDEX .031 to .035. Kept numeric button legends and their geometry unchanged. Font selection is a visual approximation, not identification of Canon's typeface.

Rebuilt/compressed C200, refreshed preview, and compared the identical settled side pose plus a second oblique view. Captions are more legible, with no observed overlap into buttons or adjoining labels; ND remains inside its raised control strip. Front and rear inspections show no new visible assembly regressions; browser errors empty. Evidence c200-control-type-{before,after,oblique,front,rear}.jpg in ignored output/gear-modeling. Side reference still exposes broader finish/contour differences; this is not a full body or photorealism pass. Renderer, lazy loading and optics unchanged. Asset 4,550,484 bytes, SHA256 2d807f23c3f824ddc7ec3753ffed8694174f1c6ce8dbe925c834edd48958d793. No new push.

Validation: site build passed (15 pages, 29.37s); git diff --check passed. Shipping run 38429118039 for the earlier 56495a8 checkpoint remains in progress at last authoritative check. Current lettering changes remain local. Next compare C200 control-casting relief and specular finish at a larger reference-matched view; do not mistake caption readability for completion of the body.

### 2026-10-13 — C200 formed casting rims around operator buttons

Previous goal turn made concrete progress in lettering weight. Rechecked current generator/viewer against c200.jpg: the panel's missing curved highlights also came from geometry. The reference has textured raised casting around each cap; the model had only a flat black bezel. Added rolled annular profiles in the casting material around all seven numbered function buttons and both ND buttons. Outer radius .109 versus cap .077 approximates the reference's ~1.4 diameter ratio. Reduced dark bezel radius .099 to .086 to retain a narrow cap gap. Rim rises .019 above the local casting plane; profile/dimensions are photo-derived, not measured CAD. Moved captions from +.126 to +.140 above cap centers to preserve clearance.

Rebuilt/compressed and inspected the same settled side pose, both oblique views, front and rear. Rounded rims now catch curved highlights, including textured response from the opposite angle. No observed caption/cap overlaps or exterior assembly regressions; browser errors empty. Broader surface/lighting/optics fidelity remains incomplete, and this is not a full body pass. Evidence c200-button-rims-{side,oblique,opposite,front,rear}.jpg. Refreshed preview. Generator checks retained core 144x146x137 mm and body-with-EVF 144x153x179 mm, cap diameter mismatch 0.000002 mm; these validate internal dimensions, not photo accuracy. No renderer passes or scheduling changes. Compressed asset 4,631,040 bytes, SHA256 9361bc09fbcf06e7f572dfede1b1a9852abac9cfc0e0ca802577eee3cdd98fd8. No new push.

Validation: site build passed (15 pages, 25.93s); git diff --check passed. Current changes remain local. Next inspect the C200 side-panel boundary and front casting transitions against reference close-ups; global material brightening alone would not resolve those shapes.

### 2026-10-13 — C200 nested front casting proportions

Previous turn made concrete progress with formed button surrounds. Added ignored body-inspection.html/.ts using the production model loader and OrbitControls, with a neutral studio environment, to inspect the uncapped body against c200-front.jpg. This exposed the oversized inner casting: .925/.984 radius ratio (~.94) left only a thin outer band, while the reference shows roughly .83-.85. Changed inner maximum radius to .822, seam radii to .842/.825; kept outer .984 casting, screws and EF mount dimensions. Shifted release seat/button X from .745/.746 to .688/.689 so the seat stays on the narrower inner crown. Profile and placement remain photo-derived approximations.

Final compressed asset inspected in body-only front detail and in actual /classic mounted front, operator side, oblique and rear views. Wider outer structural band now matches the reference hierarchy; release seat stays inside the rolled edge. No observed assembly regressions or browser errors. Front casting still develops a broad bright grazing reflection, and the uncovered comparison exposes an overly rounded Canon crest plus overly uniform cast finish. Those remain fidelity issues; this does not establish photorealism or finish the goal. Evidence c200-front-band-body.jpg and c200-front-band-viewer-{front,oblique,side,rear}.jpg. Refreshed preview. Generator dimensional checks passed. Asset 4,642,888 bytes, SHA256 ad66bac2dab746cd034406ac419a94c9f4568530ce4c3362af214fdd6308b4a4. No new push. Earlier shipping checkpoint 56495a8 Pages run 38429118039 now reports success.

Validation: site build passed (15 pages, 29.44s); git diff --check passed. Downloaded live C200 matches the shipped 56495a8 asset (ae0fb8428d604c8faa45ccc6b6546da66f92f6cf770a3323537d4a9598c79b1c). Current casting/lettering/rim changes remain local. Next correct the crest silhouette against the uncovered front reference before further material calibration.

### 2026-10-13 — C200 tapered crest and confirmed lower-label obstruction

Previous goal turn made progress by correcting the nested front casting. Compared the current uncapped body to c200-front.jpg. The Canon crest read as a bulbous badge because the .033 edge bevel consumed much of its shallow face and rounded away the tapered corners. Replaced its outline with a symmetrical shallow arch and tapered lower corners, using .007 edge bevel and explicit corner rounding. Reduced face Z .422 to .410, lettering Z .429 to .4115, wordmark size .18 to .15 and moved its center Y 1.135 to 1.145, matching the greater space around the reference wordmark. Photo-derived proportions remain approximate.

Profile helper now reverses per-corner radii along with points when correcting winding; this new crest is its only call with a rounding list. Final C200 rebuilt/compressed after that correction. Inspected body-only front detail plus mounted actual-viewer front, side-front oblique and rear. Crest has a clear tapered outline, restrained edge highlight and readable smaller logo, with no new visible assembly regression or browser errors. Evidence c200-crest-{before,body}.jpg and c200-crest-viewer-{front,oblique,rear}.jpg. Refreshed preview. Dimension checks passed. Asset 4,646,944 bytes; SHA256 3c6644696045eab23c8204e6ac85451b56dce28f2b12c7fb9a0b01f1b900d447. No new push; full fidelity remains incomplete.

Separate front audit: labels beneath buttons 10 and 11 are absent in the uncapped view. Ignored check-c200-front-labels.py samples actual generated white-ink triangles below Y=-1.1 and in front of Z=.35, then raycasts from the front through non-ink geometry. Initial exact material-name match found no samples because bake adds .001 suffixes; corrected matching to strip suffixes before drawing conclusions. Final result: all 1,385 sampled label triangles occluded by Anodized black, at label Z=.447481. Their Y bounds are -1.152168 to -1.134601. Source Base rail extends ahead of their authoring Z=.443. This confirms a geometry obstruction, not missing font geometry or a contrast issue. Next fix the base/front lower housing and re-run this same diagnostic plus actual viewer inspection. Keep a failed/zero-sample diagnostic distinct from passing visibility evidence.

Validation: site build passed (15 pages, 25.42s); git diff --check passed. Current changes remain local. The lower-label diagnostic now fails explicitly if its sample selection is empty.

### 2026-10-13 — C200 lower housing no longer hides front labels

Previous turn made progress with the crest and confirmed the lower-label obstruction. Added check_c200_front_labels.py to sample the actual generated lower-front white-ink triangles, require both left and right labels, raycast toward non-ink geometry and require nearby backing. It fails on the prior mesh: all 1,385 samples blocked by Anodized black. Empty sample sets fail explicitly. This is a placement/visibility regression check, not a typographic or photorealism test.

Replaced the projecting Base rail with a lower chassis lip whose front is at author Z=.435 (previously .515). Lettering moved to .4365 and size .030 to .045, sitting close to that face. Changed the false metallic rail finish to the housing's Graphite polymer. First rectangular candidate passed visibility but still looked like a platform in the actual side view, so rejected that silhouette. Final lip tapers to the body's lower corners using an extruded outline, .004 edge bevel and .02 outline rounding. Reference-derived shape remains approximate; the central lower-front relief still is not fully reproduced.

Final generated mesh: 1,385 label triangles, zero occluded, all have backing within .01 units; both labels selected. Same core/EVF/handle dimension checks pass. Compressed asset inspected in uncovered front detail and mounted actual-viewer front, side-front oblique and rear. Labels are visible on the body face, the platform-like outer corners are gone, and no new visible assembly regression/browser errors appeared. Mounted lens naturally hides some front detail head-on. Evidence c200-lower-labels-body.jpg and c200-lower-labels-viewer-{front,oblique,rear}.jpg. Rectangular trial saved separately as c200-lower-labels-rectangular-trial.jpg. Refreshed preview. Final GLB 4,658,732 bytes, SHA256 bf6307a3cceb6b98f85ed2b890aa3434c411db628f2ce928037b6b393aac735d. No push. Full geometry/material/optics fidelity remains incomplete.

Validation: site build passed (15 pages, 27.01s); git diff --check passed. Retained locally. Next address the remaining broad front finish mismatch (uniform grey grain and grazing highlights) against reference lighting, while preserving these verified geometry and label placements.

### 2026-10-13 — C200 outer casting shoulder and recessed fasteners

Previous goal turn made progress by exposing and supporting both lower front labels. Audited the actual compressed GLB textures before changing paint: pebble normal means R/G approximately 127.6/127.7 of 255, shell roughness G 122.67 (.481), casting roughness G 79.66 (.312), consistent with authored linear values. No evidence of a color-space export error. Added an ignored inspection-only Ambient fill slider. At .05 instead of .65, the same paint became appropriately dark; grey wash in that helper depended heavily on its broad RoomEnvironment. Production lighting was not changed.

The controlled front comparison revealed a flat-washer outer casting producing a planar highlight. Replaced that annulus with a rolled radial profile while retaining .984 maximum radius and the structural back extent. Paint/normal/roughness values unchanged. Modeled six conical counterbores and lowered fasteners from .478 to .430; changed their exposed steel heads to dark anodized finish as seen in the front reference. Profile/counterbore dimensions remain photo-derived approximations. Final shoulder creates a localized curved highlight in identical low-fill lighting and a graded band under broad fill, closer to the reference's outer shoulder.

Close-up then showed bottom screw clipping by the lower lip. First screw probe selected no samples with an overly low Y cutoff; corrected it. A cap-center-only probe passed but was insufficient. Expanded it to triangulated front cap and bevel faces: 64 of 158 samples were occluded by housing on the saved pre-relief mesh. Added a .70-wide central lower-front relief behind the screw, retaining label-bearing side wings. Final: zero of 158 screw samples blocked, and all 1,385 front-label samples remain visible/backed. Kept check_c200_bottom_screw.py as a limited housing-occlusion regression check; it is not full seating or fidelity proof.

Inspected final compressed model at .05 and .65 ambient fill in body-only front detail, then actual /classic mounted front, side-front oblique and rear. No new visible assembly regressions or browser errors. Outer band no longer becomes one broad planar white face in the oblique view; inner face/specular response and lens optics still need work. Evidence c200-outer-roll-low-fill-{before,after}.jpg, c200-outer-roll-broad-fill.jpg and c200-outer-roll-viewer-{front,oblique,rear}.jpg. Refreshed preview. Dimension checks passed. Final GLB 4,697,780 bytes, SHA256 638938691d459d980b3600776e1b1a72f41e56ba463319564696b83fef2dcf99. No new push. Full goal remains incomplete.

Validation: site build passed (15 pages, 27.53s); git diff --check passed. Retained locally. The inner casting's broad grazing reflection and the lens's implausible internal reflections remain visible; next investigate those with controlled views rather than globally darkening materials.

### 2026-10-13 — f/2.8 internal reflection isolation

Previous turn made progress by shipping C200 checkpoint 101f0b9. Resumed against clean tracked source. Extended ignored glass-layers.ts with a front pose and the actual production reflection-card environment, including explicit glass envMap assignment. RoomEnvironment at an oblique angle did not reproduce the gold curls; production cards plus front pose did. Four-way isolation shows the gold wedges persist without outer glass and disappear without inner glass. Added glass-mask.html/.ts comparison preserving original onBeforeCompile, onBeforeRender and shader cache callbacks on cloned materials. Disabling the internal aperture mask restores full card reflections, including otherwise blocked peripheral highlights; the material-name group split was later found invalid because this asset uses one shared material for all internal elements (see correction below). Evidence: output/gear-modeling/f28-mask-isolation.jpg. This identifies the non-rear internal reflection layers and straight-ray clipping as the source, rather than outer transmission alone. It does not prove calibrated coating colors or exact physical transport.

No production optics change retained: removing barrel occlusion would replace the symptom with unoccluded reflections. Next test a refracted escape path through the front element for those internal reflected rays, using exported geometry and bounded shader cost; compare in the actual assembled viewer before accepting. Canon Ireland's original non-IS product listing labels its photo Front View but the displayed photo is a side elevation, so it cannot validate front coating/reflection appearance. A suitable original f/2.8 front photo is still needed. Existing expensive multi-surface prototypes remain excluded. Goal remains incomplete.

### 2026-10-13 — refracted escape trial; diagnosis corrections

Previous turn added useful controlled isolation, but two claims required correction against generator source. All f/2.8 internal elements use `Inner optical glass`, including the rear element; the former Front group only / Rear group only panels therefore meant all internal glass / none. They did not localize a physical group. Also this model follows Canon EF365, the first-generation f/2.8L IS USM, not the non-IS model searched previously. Neither error invalidates the inner-layer removal or straight-mask comparison, but narrower claims are unsupported.

Implemented ignored front-escape.ts diagnostic. It intersects the reflected ray with both spherical surfaces of the modeled outer element, refracts air→glass→air with IOR 1.52, rejects misses/TIR and then checks the front opening. Constants come from the existing generator (clear radius .805*.799, apexes 3.580 and 3.420, front/rear sag .065/-.057), not a newly inferred optical prescription. Wrapped the actual loader shader hooks while retaining quantized-node and assembly coordinate transforms. Compiled without browser errors. Compared baseline, refracted exit, unmasked, and no-inner cases at front and oblique poses, with production reflection cards. Evidence f28-escape-{front,oblique}.jpg. Front escape changes positions and trims some reflections, but large gold wedges remain; oblique appearance changes little. Rejected for production: an escape-only correction leaves the incoming camera leg unrefracted and skips intervening internal elements. No claim of geometric/physical validation or actual-viewer acceptance. Next implement bounded sequential reflection transport for both legs, using the existing analytic surface fits, and measure its cost before viewer integration. Do not resume unbounded BVH rendering or repeat simple opacity/mask removal trials.

New matching photograph: Sam Garza, Canon EF 70-200mm f/2.8 L IS USM (2007), CC BY 2.0, https://commons.wikimedia.org/wiki/File:Canon_EF_70-200mm_f2.8_L_IS_USM.jpg . Inspected original image in browser; screenshot f28-is-garza-reference.jpg. It provides an oblique front opening, rim and reflection reference for the modeled variant, but its lighting is uncalibrated and does not establish front-on coating color. Source includes no front-on view. Production geometry/materials unchanged this turn. Goal remains incomplete.

### 2026-10-13 — bounded sequential front-group reflection prototype

Previous turn made progress by rejecting escape-only transport and finding the matching IS reference. Implemented ignored front-group-reflections.ts: sequentially trace the camera ray through the six spherical surfaces of the first three modeled elements, evaluate a single reflection at each internal interface, and refract that reflected path back through preceding interfaces to the environment. The current outer reflection and screen-space transmitted chamber image remain. Internal additive meshes are hidden in candidate mode. Uses the modeled surface fits, assumed IOR 1.52, current approximate coating thicknesses, and finite front opening. It omits deeper groups, multiple reflections, and geometric chamber transport; it is not a complete prescription or production acceptance.

Geometry check in Blender sampled 1,921 interior vertices on each of the six actual surfaces; maximum spherical residual 3.40e-7 scene units. Script output/gear-modeling/check-f28-front-surfaces.py, log /tmp/f28-front-surfaces.log. CPU forward/reverse test check-front-group-rays.ts covered 1,445 rays from five camera offsets: 968 crossed all surfaces and reversed successfully, 477 were blocked; maximum entry-point error 3.70e-15 and direction error 1.83e-15. This validates CPU reversibility, not CPU/GPU parity.

Created front-group-viewer-scene.ts by copying current production scene.ts with only diagnostic toggle/disposal/benchmark integration and import paths changed. front-group-viewer.html/.ts uses actual C200 + f/2.8 assets, production lighting/shadows, orbit controls and dirty rendering. Examined front and settled oblique candidate/baseline. Internal reflections move to refracted locations rather than the former overlapping curl pattern, but front highlights remain broad and the chamber still uses the known single-surface transmission approximation. No photo-fidelity pass. Candidate browser shader errors empty. Evidence f28-sequential-viewer-{before,after,lut-front,baseline-oblique,lut-oblique}.jpg.

Initial GPU timing at Home + 5 right + 2 down + 3 zoom steps: baseline 4.466 ms, candidate 24.847 ms (1650x930, ten draws each; shader compilation excluded). This was unacceptable. Replaced repeated thin-film shader evaluation with a one-time 256x2 half-float coating LUT generated by the same Three equation. Remeasured same pose/resolution: baseline 4.907 ms, candidate 10.046 ms. GPU coating-lut-check.html/.ts compared 8,192 samples: max absolute linear RGB error .000704885, mean .0000601325, passes .003 ceiling. This is numerical agreement with an assumed coating equation, not Canon coating calibration. Runtime remains about twice baseline on this device/view; not shipped. Next establish GPU/CPU ray parity and reduce shader cost without deleting optical paths, then broaden reference-angle validation. Preserve opt-in loading and offscreen/dirty scheduling if integrated later.

Deployment checkpoint 101f0b9 completed successfully (run 38436048599). Downloaded https://bryanhu.com/models/gear/c200.glb and verified SHA256 638938691d459d980b3600776e1b1a72f41e56ba463319564696b83fef2dcf99 matches local. No additional production code/assets changed or pushed this turn. Full goal remains incomplete.

### 2026-10-13 — GPU path parity and controlled reflection timing

Previous turn made progress with bounded front-group transport and coating caching. Refactored the ignored helper to expose the exact generated shader for GPU tests, then added front-group-gpu-check.html/.ts. This renders the same 1,445 float-input rays used by the independent CPU reference into float targets. General shader: 968 complete traversals, zero traversal-classification mismatches, maximum position error 6.19e-7 and direction error 9.17e-7. Tested 7,225 single-reflection return paths: 4,139 escape, zero escape-classification mismatches, max escape-direction error 4.77e-6 and uncoated energy error 2.37e-5. Coating LUT parity remains the separate prior test. Tests cover these modeled surfaces and selected rays, not a measured Canon prescription or missing deeper transport.

Tried specializing the shader into fixed intersection/escape functions. Its GPU tests also passed (max forward position/direction errors 7.41e-7/8.19e-7, reflected direction/energy errors 7.35e-6/3.40e-5, no classification mismatches). Added actual assembled-scene render-target image comparison. Front general/specialized outputs were identical; oblique maximum channel difference 1/255, zero channels exceeding one, mean .000001792/255. No browser shader errors.

A single initial specialized timing was 11.905 ms, insufficient to conclude improvement. Replaced timing with three alternating-order ten-draw GPU batches per mode at the same 1650x930 front pose. Medians: baseline 4.877 ms, general LUT 5.065 ms, specialized LUT 5.586 ms. General samples 5.055/5.065/6.478 ms; specialized 5.296/5.586/6.305 ms. These controlled warm measurements supersede the earlier single-batch 10/24 ms figures for steady-state comparison, but do not establish startup or mobile performance. Kept general shader as default; specialization remains optional diagnostic only. Saved f28-gpu-general-parity.json and f28-reflection-timing.json under ignored output/gear-modeling.

No production integration or new push. The prototype still hides all internal reflection meshes while tracing only the first three elements; the next fidelity step is the two deeper modeled elements and the eight-blade stop, not further specialization. Generator uses parabolic middle/rear surfaces: middle z=l*.58, radius=r*.43, sag +/-.014, edge .03; rear z=l*.13, radius=r*.38, sag +/-.019, edge .032. Stop lies at l*.46, with inner radius r*.28 and curved eight-blade opening. Extend the bounded path model and verify against that geometry before claiming complete internal transport. Existing screen-space chamber transmission also remains inaccurate. Goal remains incomplete.

### 2026-10-13 — deeper elements and exact modeled iris

Previous turn made progress by validating reflected GPU paths and choosing the faster general shader. Extended the ignored prototype in lens-reflections.ts to all five currently modeled elements (ten surfaces). The last two elements use their authored parabolic profiles, with stable quadratic intersections and analytic normals; first three remain spherical. Added the exact 12-segment-per-blade, eight-blade iris opening, including each blade's .00015 Z offset. This is the complete set of glass meshes in this asset, not Canon's full physical lens prescription. Baffle/lining occlusion and transmitted chamber imaging remain incomplete.

Blender check-f28-all-surfaces.py matched 1,921 interior vertices on each of the ten actual surfaces; max residual 3.40e-7 scene units. check-f28-stop.py compared the polygon opening with the actual 192 blade triangles using 20,000 oblique forward/reverse rays: 9,256 blocked, zero mismatches. GPU lens-gpu-check.html/.ts: 1,445 forward rays, 162 complete ten-surface paths, zero classification mismatches; max position/direction errors 6.66e-7/9.74e-7. Of 13,005 reflected paths, 5,272 escape; zero escape-classification mismatches, max direction/energy errors 7.37e-6/3.40e-5. Separate 20,000 GPU iris rays include blade-sector boundaries and origins within the blade-plane stack: 7,562 blocked, zero mismatches. The first iris GPU run exposed a test-harness texture-resize problem; fresh input DataTextures fixed it. Neither visual fidelity nor a measured optical prescription follows from these numerical checks.

Assembled all-groups-viewer.html uses the production scene copy and current C200/f2.8 assets. New deeper reflections appear behind the front group; browser shaders compile without errors. First GPU batch median was 13.764 ms for all groups versus 4.880 baseline. Tried conservative iris bounds, confirmed identical front pixels and ray results, but controlled comparison showed those extra branches were slower: bounded iris 12.773 ms, original exact iris 7.100 ms, baseline 4.885 ms. Retained the exact calculation and discarded the bounds. Timing is this device/front pose only; startup and mobile remain unmeasured. Evidence f28-all-groups-front.jpg, f28-all-groups-gpu.json, f28-aperture-bounds-timing.json. Viewer retains a full-group/front-group comparison; no production integration or push.

Next address opaque baffle/lining visibility and the screen-space transmitted chamber image. C200 generator uses an opaque modeled filter window at body Z .235 (mount .48 minus .245), in front of the sensor at EF register depth; do not replace it with an invented bright disk. Broad gold/blue highlights and coating calibration still require product-reference comparison. Full goal remains incomplete.

### 2026-10-13 — f/2.8 baffle seating checkpoint

Closed annular gaps around the second and third internal baffles by extending their outer radii into the existing tapered barrel lining with .006 authoring-unit overlap. Inner openings and axial positions remain unchanged. Rebuilt and meshopt-compressed the production f/2.8 asset (2,305,588 bytes), and refreshed its browser-rendered preview. This fixes unsupported geometry; it does not establish a measured Canon internal prescription.

The actual opaque-mesh BVH audit now blocks 238 sampled reflection segments on Deep black surfaces versus 196 before the fix. The independent 47-section barrel profile agrees with the mesh audit on all 34,799 compared segments (iris visibility checked separately). Inspected the assembled C200/f2.8 setup in the actual /classic viewer; no browser errors. Broad internal highlights remain visibly implausible. Experimental sequential reflection shaders remain in ignored local diagnostics and are not part of this shipment. Full photorealism goal remains incomplete.

### 2026-10-13 — opaque barrel transport in the local optics prototype

Previous turn shipped the baffle seating fix as 0ca9444. Extended ignored lens-reflections.ts with the 47-section inner barrel envelope, including polygonal cross sections and modeled bevels. Every incoming/reflected segment now checks opaque barrel visibility as well as the iris; escaped paths check through the front rim. This remains diagnostic-only and is not used by the production viewer.

barrel-gpu-check.html compares the exact shader helper against actual opaque-mesh BVH segment results: 34,735 non-iris paths, 615 blocked, zero mismatches. Updated full lens GPU/independent CPU comparison: 1,445 camera rays, 162 complete, zero classification mismatches; position/direction error below 8.00e-7/9.74e-7. 13,005 reflected paths, 5,252 escape, zero classification mismatches; maximum direction/energy error 7.04e-6/2.16e-5. Separate 20,000 iris-ray check still passes. These are tests of the authored geometry, not a measured Canon optical prescription.

Initial linear section scan cost 49.817 ms versus 4.923 ms baseline. Binary search for the first overlapping section reduced candidate cost to 34.584 ms. Added conservative radial acceptance bounds (derived from minimum polygon inradii over axial intervals), retaining identical sampled classifications; candidate now 17.540 ms versus baseline 4.777 ms, first-three-group reference 5.139 ms. Each uses medians of three alternating-order ten-draw GPU batches at 1650x930, compilation excluded. Still too expensive for acceptance; mobile/startup unmeasured. Current helper retains bounded search and radial acceptance; earlier variants saved locally for comparison.

Inspected production-scene diagnostic at front and side/oblique angles, no browser shader errors. Evidence f28-barrel-front.png, f28-barrel-oblique.png, f28-barrel-bounds-timing.txt, f28-barrel-gpu-parity.txt, f28-barrel-transport-parity.txt under ignored output/gear-modeling. Front gold/blue highlights and screen-space chamber transmission remain visibly unresolved. No new production optics shipped, no photo-fidelity pass. Next replace inaccurate transmitted chamber sampling with geometry-consistent transport and continue cost reduction; full goal remains incomplete.

### 2026-10-13 — optical contribution isolation and visible-band coating

Previous turn made progress by matching GPU barrel visibility to actual mesh paths and reducing its cost. Added independent transmitted/outer/internal contribution controls to the ignored assembled-viewer prototype. Contrary to the prior implication that transmission explained the broad gold patch, the patch persists with transmission disabled and vanishes with internal reflections disabled. Transmission alone exposes an incorrectly projected bright crescent/deep chamber, a separate unresolved issue. Evidence f28-isolation-{reflections,outer,transmitted}.png.

Canon's coating explanation (REFERENCES.md) confirms interference-based antireflection behavior; it supplies no EF365-specific prescription. Compared the legacy 230 nm single film to a 550 nm quarter-wave film, n=1.38. Independent normal-incidence amplitude calculation gives legacy reflectance at 450/550/650 nm of 1.497/3.624/4.242%, versus candidate 1.620/1.260/1.437%. This explains the old yellow/red emphasis without treating the replacement as calibrated Canon multilayer optics. Candidate LUT versus direct shader equation: 8,192 samples, maximum absolute linear RGB error .000715435, mean .0000539418. Saved f28-coating-normal-reference.json and visible-coating-check.html/.ts locally.

Retained the visible-band internal coating in src/classic/lib/gear/models.ts for f/2.8 only, with explicit approximation comment. Existing rendering, opacity, geometry, selector behavior, lazy loading and scheduling remain; this change introduces no sequential ray tracing. Refreshed the f/2.8 preview. Examined actual /classic C200 + f/2.8 front, oblique and rear views, no browser errors; gold cast reduced, but internal curls/crescent and transmitted chamber remain inaccurate. Source-reference image is oblique under different lighting, so this is not a photo-fidelity pass. Screenshots f28-visible-coating-classic-{front,oblique}.png and diagnostic f28-visible-coating-front.png. Full goal remains incomplete.

Earlier shipment 0ca9444 deployed successfully in run 38443781905. Live f/2.8 asset SHA256 981fff329c1c761e1ace9c0d50f61a40bb726c7bb51cfa5d872459d30c1e5dc3 matches local. This coating change has not been pushed. First local build failed on GitHub GraphQL returning HTML instead of JSON; retry result follows.

Retry passed: 15 pages in 29.47s; git diff --check passed. No push. Next tackle the separate transmission/crescent error with the contribution controls retained, rather than assuming the corrected coating resolves geometric optics.

### 2026-10-13 — white rear-shoulder interior caused the transmitted crescent

Previous turn corrected the internal coating cast. Added material identification and direct/environment-light isolation to the ignored assembled viewer. Initial sparse camera-ray samples hit Anodized black and suggested rear-mount environment visibility; that attribution was incomplete. A bounded reverse optical-path trial on the lens's anodized interior did not remove the white crescent. Disabling direct lights or the body's environment also left it. The trial remains ignored and disabled; it is not the fix.

Per-material environment suppression over the projected bore identified White enamel as the dominant contributor (mean pixel reduction 5.345 versus .499 aperture steel and .188 anodized black across 10,876 nonzero linear-target pixels). The first measurement used an sRGB-like brightness threshold on a linear target and selected zero pixels; corrected the measurement before interpreting results. A denser actual-viewer camera-ray probe found 19 White enamel hits: front shoulder face Z .359955 and inner cylindrical wall around radius .43, Z .293–.345. These are the generator's Taper shoulder, not the C200 body or optical glass. The false-color test had grouped unspecified materials as gray, so color alone had not localized the white finish correctly.

Fixed the f/2.8 generator: split existing shoulder faces into exterior enamel and matte Optical barrel flocking on the inward wall and forward-facing ledge. Reused exact positions, faces and corner normals; no overlapping lining geometry or added optical shader. The original ring had applied exterior enamel to its entire closed mesh. Broader reference imagery supports a dark optical cavity, but the precise interior finish remains an authoring approximation.

Regression check output/gear-modeling/check-f28-shoulder-finish.py replays those 19 recorded viewer rays against old/new uncompressed exported meshes: all change from White enamel to Optical barrel flocking, max hit-position difference 0.0. Blender cannot import EXT_meshopt_compression here, so the test uses the export intermediates; it also explicitly reverses Blender's glTF Y-up import conversion before comparing asset-space rays. Initial uncorrected-coordinate check failed and was corrected, not suppressed. The compressed production asset was separately loaded and inspected in actual /classic at front, oblique and rear views. The white crescent disappears; no browser errors. Evidence f28-black-shoulder-classic-{front,oblique,rear}.png. Refreshed preview. New asset 2,305,716 bytes (128 bytes more), SHA256 0dde775b7b9d06a0212a39c8081eae26226492aaa712e4a6359ce26ec2bdda04.

The unused interior-reflection diagnostic also extends reverse traversal to start behind all ten surfaces. GPU/CPU comparison of 10,000 rear-origin rays: 499 escape, zero classification mismatches, max direction/energy errors 3.84e-7/2.55e-7; prior forward/reflection/iris checks still pass. This evidence concerns the modeled optics, not the actual prescription, and does not justify shipping that expensive shader. Full goal remains incomplete: transmitted projection and reflection shapes, plus broader front/side/rear product-reference fidelity, still require work. No new push.

Validation: site build passed, 15 pages in 26.40s; git diff --check passed. Retained locally with the prior coating correction. The next optics pass should start from this corrected interior, not attempt to compensate for white paint with transport or global darkening.

### 2026-10-13 — C200 LM-V1 monitor reference refinement

Previous turn fixed the f/2.8 rear shoulder's white interior. Compared the C200 monitor against Canon's parts diagram and three newly inspected product photographs (REFERENCES.md). The existing monitor had its thick rear section on the control side, a faceted ramp, a rear-facing circular VIDEO pod, MIRROR on the flat case edge, missing assignable digits and misplaced back-face screws.

Rebuilt the rear shell with 49 swept sections and a smooth ramp toward the opposite end. Replaced the circular rear-facing pod with an arched D-section across the case width; socket/plug point inward, MIRROR sits on the outer end. Cable starts along the new socket axis before curving down to the body. Added curved VIDEO lettering, MIRROR legend and 1/2 on FUNC/DISP buttons. Moved screws to case side edges and beside the bottom mounting socket. Preserved the existing documented monitor envelope, screen size and assembly anchor; photo-derived curves are still approximate. Initial build stopped on an unqualified sqrt; corrected to math.sqrt and rebuilt successfully.

Actual /classic viewer inspected at matching rear pose, close rear, front and oblique angles. The prior planar stripes are replaced with a continuous rear shoulder; socket and cable follow the reference orientation. Front labels and digits are readable in close oblique lighting, while some straight-on shadowed views remain dim. No browser errors. Evidence c200-monitor-{before,after,rear-close,controls-close,front-readable}.png. No full body/material fidelity pass claimed. Refreshed C200 preview. Compressed asset 4,757,736 bytes, +59,956 bytes; SHA256 b3b72b02d7013f2615c16dec8b22c8380c11ea946b1eb50cad30cfe0138be912. No renderer changes or additional runtime optical work. New edits remain local; full goal remains incomplete.

Validation: site build passed (15 pages, 30.09s); git diff --check passed. Build-triggered development reload reset the viewer to R7, so the pending side screenshot must be captured again after restoring C200 selection.

Restored selection after development reloads and verified the outer side: MIRROR button/legend, edge screws and front controls are visible; cable remains attached. Overwrote c200-monitor-mirror-side.png with the verified C200 view. Some initial screenshots after build/document writes showed the reset R7 selection and were not accepted as C200 evidence. Full goal remains active; no push.
