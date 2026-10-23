# Camera asset candidates — 2026-09-08

The procedural models remain visibly synthetic. Further detail edits should not
be treated as evidence that the base forms or materials meet the target.

| Candidate | Verified availability | Integration decision |
| --- | --- | --- |
| [R7 by 3d_molier](https://www.turbosquid.com/3d-models/3d-model-canon-eos-r7-camera-2327213) | Listing shows $79, Blender/glTF, 48,816 polygons, PBR and editorial-only restriction | Not purchased. Site reuse permission and actual mesh quality remain unverified. |
| [R7 by Salome](https://sketchfab.com/3d-models/canon-eos-r7-e85512672b174fdeb521f32dd0ee7d94) | Public API reports isDownloadable=false, 170,792 faces, no download license | Use only as a viewable comparison; do not extract viewer mesh. |
| [40D on CadNav](https://www.cadnav.com/3d-models/model-46748.html) | MAX/WRL, 4,537 polygons, non-commercial | Not imported; origin and suitability for site reuse unverified. |
| [40D on Open3DModel](https://open3dmodel.com/3d-models/3d-model-canon-eos-40d-camera_44899.html) | MAX, personal/education use | Not imported; restrictive terms and no verified original author. |

No replacement asset was acquired or added to the website. Paid marketing
claims of photorealism are not visual verification, and a downloadable model
may not grant permission to distribute its mesh through a public GLB URL.

The search did not establish a reusable replacement for either owned body.
Preserve the current independent selectors, opt-in loading and model cache.
Prioritize the unresolved 40D crown/flash joint and full-body silhouette checks
over further small trim details.

## f/4 optical candidate — 2026-10-22 checkpoint

Do not reconstruct the f/4 optics from the small construction raster again.
The repository already contains a Canon-patent-derived 20-element candidate:
`src/classic/lib/gear/optics/f4-patent-prescription.json`, the reflection and
transmission implementations beside it, and the development-only `?optics=1`
route in the actual `/classic` viewer. See FIDELITY_AUDIT.md entries beginning
“reference-derived f/4 optical train prototype” (2026-10-13) for numerical,
ray-path, housing, lifecycle and performance evidence and its limits.

The candidate GLB now includes the current collar-free f/4 exterior, corrected
control orientation and narrower focus grip. It is **not accepted for public
activation**. Current real-viewer inspection still shows overly uniform blue
reflections; first setup logged 49.9 ms upload CPU time at 568,890 optical pixels.
That single desktop observation is not a benchmark or mobile result.

Next work should refine this existing refracted-path candidate and its costs.
Recent removal-of-inner-glass diagnostics repeated earlier isolation findings;
do not repeat recoloring or direct-light suppression as if they were new fixes.
Normal production still loads the separate four-element approximate asset.

The 2026-10-22 channel/card isolation found the broad front fill dominates the
uniform blue rings: reflection-only preserved them; removing that card removed
most of the wash. The `?optics=1` preview now uses a narrower, offset front fill
(0.75, 1, 6; 0.65 × 2.4; strength 0.8), with the complete optical calculation.
Ordinary visitor lighting retains the prior front fill. This improves reflection
separation but does not calibrate coatings or establish photographic acceptance.
See `f4-channel-{baseline,reflection-only,no-front-fill,narrow-front-fill}.png`.
Do not rediscover this with another transmission-removal experiment. Next optical
comparison should address coating spectral/angular response and reference lighting
together; the current single-film coating remains an explicit approximation.

## 40D finder prototype — 2026-10-22 checkpoint

The existing three-element/two-reflector finder jig is not ready for integration.
Its 225-ray diagnostic reaches the screen for only134 rays (see October20 audit).
A new Cycles diagnostic exposed another defect: closing the outer ocular in
`trace-40d-finder-refraction.py` rebuilt all polygons with flat shading. Corrected
that local script to preserve3200 smooth optical-front polygons and split the
polished face from the edge. The corrected saved candidate is
`output/gear-modeling/40d-finder-polished-field-prototype.blend`; the older
`40d-finder-field-prototype.blend` still has the flat-shading defect.

Same-light before/after renders remove the optical striping. The rear-light-off
render shows a clipped upper-right transmitted field, so the layout remains
rejected. These are offline diagnostic renders, not interactive-viewer acceptance
or a measured Canon prescription. Production ocular geometry/materials unchanged.
Next finder work must resolve full-field coverage and a renderer-compatible folded
path together; repeating front-window recoloring or the central-ray test is not
a substitute. Diagnostic scripts and images use prefix40d-finder-pathtraced.

Updated finder candidate: `40d-finder-centered-field-prototype.blend` retains
the polished normals and centers the same .20-unit boss passage on ocular X=.04.
Controlled upright render no longer has the corner obstruction. Same-integrator
smooth-normal volume comparison improves142/225→157/225; the earlier134/225
used triangle normals and is not the comparable baseline. Five sampled exterior
views are unchanged against the prior polished prototype. Wide-field coverage
still fails; do not activate it in the site.

Diagnostic camera correction: Blender's previous track quaternion rolled the
image180degrees relative to world-Y-up. Explicit Y rotation bypi now gives an
upright view; trace rays use camera.view_frame and matrix_world, not assumed
image-axis signs. The formerly described upper-right clip is lower-left upright.
Emission-screen and color-ID renders identify the mount boss as the obstruction;
it was not a lighting shadow. Latest scripts/reports use centered-field,
centered-envelope and volume-smooth in their names.

### 40D ocular cross-section correction

Canon whitepaper page14, enlarged in40d-finder-section-detail.png, shows the
eye-facing surface of eyepiece lens3 as concave. Production build_models.py
now uses that sign for40D only, retaining the estimated sag/radius and frame.
Do not continue optimizing the old full finder prototypes as though their convex
outer surface were reference-correct. They remain experiments with estimated
three-element geometry and no true roof prism.

The wide-baffle branch (.29×.19 opening in a .35-wide frame) clears all30 prior
baffle failures, but only improves157/225→165/225; central pupil remains18/25.
Eye-position renders still show deep housing obstruction. Its sampled exterior
is unchanged. It is not accepted for public rendering, and broadening clearances
further is not the next supported fix. Reconstruct the ocular shapes/spacing
from the reference before tuning the coupled prism path and renderer.

### 40D lens3 meniscus study (2026-10-22)

`output/gear-modeling/40d-meniscus-seated-candidate.blend` starts from the latest
production40D with concave outer ocular and AF-ON correction, closes lens3 with
an estimated curved inner face, and relocates its first internal baffle.
Zero tested glass/housing triangle intersections; sampled exterior preserved.
It does **not** include the old two-reflector/three-element prototype internals.
Do not combine their old convex outer element with this candidate. Full prism,
other lens shapes/prescription and actual browser rendering remain unresolved.
See the latest fidelity-audit entry and local meniscus reports for assumptions.

### 40D three-element eyepiece clearance candidate (2026-10-22)

`output/gear-modeling/40d-eyepiece-casting-channel-candidate.blend` extends the
current meniscus study with estimated plano-convex lens1 and biconvex lens2.
The casting was isolated, seam-welded and consistently oriented before cutting;
whole-assembly subtraction on the original mesh produced false blocking caps.
All three elements clear opaque geometry, and nine axial visibility probes
reach all six glass interfaces. This is still **not** a working finder: the
forward casting cap, actual prism, refracted field coverage and browser optical
rendering remain unresolved. No public asset promotion. See the fidelity audit
for geometry estimates, failed experiments and the small top-depth discrepancy.


## 28–135 complete glass geometry — 2026-10-22

The three-element public approximation has incorrect image-plane placement.
A separate16element/12group geometry candidate now exists at
`output/gear-modeling/28-135-vector-optics-prototype.blend` and `.glb`.
Source: vector outlines from saved Canon workbook page8, extracted with
`extract-28-135-section.py`; data `28-135-vector-surfaces.json`.
All16meshes pass manifold/positive-volume checks and sampled intergroup gaps
are positive. Actual-mesh section visually matches the source group sequence.
This is not a glass prescription or a viewer-accepted replacement. Placeholder
IOR1.52, diagram-derived scale/radii, no iris or housing integration yet.
Continue from this candidate; do not restart the smallGIF meniscus fit or treat
three-element material tweaking as a complete optical correction.


The next assembled checkpoint is
`output/gear-modeling/28-135-vector-assembled-prototype.blend`/`.glb`.
It retains current exterior and replaces glass, with a widened internal recess,
reshaped liner and relocated obstructing seat. Reopened assembly reports zero
triangle-surface glass/housing overlaps across16elements. This is an experimental
mechanical fit, not a refraction/containment or viewer acceptance result. Generated
by `fit-28-135-prototype-housing.py`; verify with `check-28-135-fitted-housing.py`.


Viewer checkpoint: `28-135-viewer.html?candidate=1` on localVite uses a copied
production scene and the assembled candidate; omitcandidate for baseline.
Front/side/rear screenshots are saved. **Reject current placeholder glass rendering**:
white reflections obscure the recess. Geometry is a candidate only; no full
multi-interface transport or coating calibration. Do not ship or merely darken
individual glass layers to hide the failure. See latest FIDELITY_AUDIT entry.


Optical update: prefer `28-135-vector-regularized-surfaces.json` and separate
`28-135-vector-regularized-optics-prototype.blend` for further transport work.
Raw PDF surface14 had a non-axial tangent; surfaces17/27 had tiny axis offsets.
Corrected without altering raw extraction. Full cubic trace plus independent
paraxial check now agree, but uniform-index assumptions still miss the sensor
plane. See `28-135-vector-trace.json`. The assembled viewer candidate has NOT
been rebuilt with these curves; do not present its old screenshot as validation.


Prescription research: saved Canon `US6061180A.pdf/.html` contains multiple
28–132mm designs. `28-135-patent-example10.json` is a first transcribed candidate,
not a verified production match; numerical checks retained in the companion
`-check.json`. `28-135-patent-ranking.json` compares axial spacing of six examples
with the product diagram. Examples1/4 fit axial positions closer than10; do not
select10 just because its16elements and14thasphere agree. Full curvature/source
validation remains necessary. No candidate has replaced the vector prototype.


Do not adopt `28-135-vector-fitted-indices.json`: it satisfies28.8mmEFL andEFimage
plane only paraxially. Independent `28-135-vector-fitted-trace.json` shows large
finite-aperture focus variation and clipping. This rules out the two-constraint
index fit as a ready rendering candidate. Patent-curvature screening also found
sign discrepancies in every screened example; none is established as production.
