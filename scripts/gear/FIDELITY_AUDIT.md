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
