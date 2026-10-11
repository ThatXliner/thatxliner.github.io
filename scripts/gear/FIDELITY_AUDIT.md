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
