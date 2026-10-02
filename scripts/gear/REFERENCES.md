# Camera loadout modeling references

The meshes are authored in `build_models.py`. Product photographs were consulted for form and control placement; they are not used as textures or distributed with the site.

- EOS R7 front and rear: https://melaniec.co.za/2022/07/01/the-canon-eos-r7-and-the-canon-eos-r10/
- EOS 40D multi-angle reference: https://www.thegioimayanhso.vn/canon-40d-body
- EOS 40D top photograph: https://giangduydat.vn/canon-eos-40d
- EOS 40D manufacturer brochure: https://downloads.canon.com/cpr/software/camera/40D_BC_0113W833.pdf
- C200 side panel: https://www.canosa.com.hr/canon-eos-c200-ef-24-105mm-f4l-is-ii-usm-kit-cinema-camera-profesionalna-vide/47768/product/
- EF 28–135mm: https://www.canon.com.br/produtos/produtos-para-voce/cameras/lentes-eos/zoom-normal/ef-28-135mm-f/35-56-is-usm
- EOS R7 straight rear product photograph: https://cameraclix.com.au/products/canon-eos-r7-body-mirrorless-camera
- EOS R7 top product photograph: https://excellentphoto.ca/products/canon-eos-r7-mirrorless-camera
- EF 28–135mm switch close-up: https://www.pointsinfocus.com/reviews/lenses/normal/canon-ef-28-135mm-f3-5-5-6-is-usm/

## Visual acceptance review

The current custom models are still a work in progress, not accepted as photorealistic.
Custom modeling is continuing from online product photographs. Acquiring an
external model is an option, not a prerequisite for correcting these meshes.
The September 6 review identified a floating planar lens switch panel, inaccurate rear
controls, reversed zoom/focus ring placement, unsupported barrel joints, and a solid
viewfinder block. These have been revised; the body contours, lens-specific molding,
surface finish, and optical appearance still require reference comparisons.

Retain raw exports in `output/gear-modeling/uncompressed/` before compression. Generate
the same front, rear, and side views for each R7 revision with:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python-exit-code 1 --python scripts/gear/render_studio.py -- --audit
```

Inspect `output/gear-modeling/audit-{front,rear,side}.png`, then inspect the actual
browser viewer. Offline Cycles renders do not establish WebGL quality or prove that
the other bodies and lenses meet the target.

Add `--body-only` to render isolated R7 front, rear, side, and top views into
`audit-r7-body-*.png`. The September 7 R7 revision moves the mode dial to the grip
shoulder, increases grip depth, corrects the command wheel axis and width, adds
the top controls, and fuses the grip into the main shell before mesh reduction.

Use `--body-only --body=40d` for equivalent isolated 40D views. Its September 7
revision removes the screen hinge, reduces the fixed LCD width, moves the rear
controller, adds the five-button bottom row and power lever, and replaces the
generic rear disk with a recessed wheel with radial grip ridges. The top LCD and
command wheel, pop-up flash cover, and reflex mirror chamber have also been revised.
The mode dial's scene pictograms remain simplified, and full photorealism has not
been established by these corrections.

### Asset sourcing, September 6

- R7 by Salome: public Sketchfab API reports `isDownloadable: false` and no license.
  Do not extract viewer geometry. https://api.sketchfab.com/v3/models/e85512672b174fdeb521f32dd0ee7d94
- R7 by 3d_molier / 3dmi: a commercial candidate, listed at $79 on CGTrader.
  No purchase has been authorized or made; downloadable geometry has not been inspected.
  https://www.cgtrader.com/3d-models/electronics/video/canon-eos-r7-camera
- CGTrader's license guidance restricts independent retrieval and redistribution of
  purchased model files. An openly served GLB in this public repository needs a
  suitable license arrangement; do not assume the standard purchase covers it.
  https://help.cgtrader.com/hc/en-us/articles/360015124437-Royalty-Free-License
- The 40D listings found on CadNav and Open3DModel state non-commercial and personal/
  education licenses respectively. Neither has been approved as a source asset.
  https://www.cadnav.com/3d-models/model-46748.html
  https://open3dmodel.com/3d-models/3d-model-canon-eos-40d-camera_44899.html

The custom 28–135 grip is now based on the broad rounded lands in the close-up,
and the optical elements use shallow closed curved surfaces instead of flattened
spheres. This is a visual approximation, not Canon's optical prescription.
The 28–135 and 50mm II diaphragm counts follow the manufacturer's six- and five-blade
specifications: https://global.canon/en/c-museum/product/ef342.html and
https://global.canon/en/c-museum/product/ef295.html.

## Included lighting asset

`public/models/gear/studio.hdr` is Studio Small 09 by Sergej Majboroda / Poly Haven, CC0.
https://polyhaven.com/a/studio_small_09
https://polyhaven.com/license

## Rebuild

Run Blender from the repository root:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python scripts/gear/build_models.py
```

Optional asset IDs after `--` rebuild only those meshes. Editable `.blend` files are saved under `output/gear-modeling/`. Models use the viewer's Y-up coordinates and are exported without Blender's axis conversion.

Compress the exported GLBs with glTF Transform, retaining geometry and material names:

```sh
bunx @gltf-transform/cli optimize input.glb output.glb --compress meshopt --simplify false --palette false --texture-compress webp
```

The web viewer loads the compressed GLBs with Three.js and MeshoptDecoder.

## Wordmark

`canon-wordmark.svg` is the Canon wordmark, sourced from Wikimedia Commons (PD-textlogo; trademark). The normalized contour file is derived from that SVG for accurate markings on the models.
https://commons.wikimedia.org/wiki/File:Canon_wordmark.svg

### C200 rear-panel revision

Reference: https://www.cined.com/canon-eos-c200-internal-4k-raw-affordable-price/
Product photograph: https://www.cined.com/content/uploads/2017/05/Canon-C200_5-1536x864.jpg

The rear assembly now separates the lower BP-A30 battery bay, dual SD doors,
audio-channel controls, navigation buttons, and right-hand connector covers.
The operator side and handgrip placements were corrected, and the monitor faces
the operator. Connector internals remain covered; the grip and casting contours
still require closer reference matching. Four-sided C200 Blender audits are
available through `render_studio.py -- --audit --body-only --body=c200`.

C200 grip reference: https://www.adorama.com/us1739913.html
Photo: https://www.adorama.com/images/Large/1739913.jpg
The GR-V1 replaces the earlier oval with a contoured shell, rubber overmold,
rosette, padded strap, buckle, record button and control dial. The right side
also has intake louvers and audio selector covers. The C200 audit now includes
a dedicated grip-side view; these details do not establish overall photorealism.

### C200 physical scale

Canon body-only dimensions: 144 × 153 × 179 mm.
https://sg.canon/en/consumer/eos-c200/main/specification

The shared lens scale is 55 mm per unit (28–135 length 1.76 units = 96.8 mm).
The C200 bare body measured approximately 122.79 × 123.81 × 152.49 mm before
calibration. The builder calibrates the bare body to Canon's dimensions, excluding
the detachable grip and monitor from the measured bounds and preserving the EF
mount geometry and front mating plane. Live front/rear captures after this change
are in output/gear-modeling/c200-live-scale.png and c200-live-rear.png.
The WebGL checks confirm assembly and rotation, not photorealistic completion.

### 28–135 front optical group

Front photo: https://file.hstatic.net/200000782117/file/1s5a0178_614dd3ef2fb448ab9c102cf1353b0b08.jpg
Source: https://thanhmaistore.vn/products/ong-kinh-canon-ef-28-135mm-f-3-5-5-6-is-usm
The model now has the broad stepped baffle and smaller recessed inner group seen
in this photograph, plus larger front nameplate text. The website's optical
material uses thin transmission and an inner reflection layer; it is a real-time
approximation, not a recovered optical prescription. Live comparisons still
show insufficiently convincing glass reflections, so optical fidelity remains open.

### R7 mount chamber

Sensor dimensions: https://cam.start.canon/en/C005/manual/html/UG-10_Reference_0100.html
RF flange distance: https://www.canon.com.au/get-inspired/rf-lens-benefits

The R7 shell is bored after grip remeshing, with a 22.3 × 14.8 mm sensor placed
20 mm behind the flange at the shared 55 mm/unit scale. Its twelve contacts are
spread along the bottom arc and exposed above the bayonet face. The Canon mark
was raised to clear the alignment pip, and the model badge given its raised pad.
These fix front details; overall shell contour matching remains unfinished.

### R7 silhouette revision

The R7 housing height is reduced by 13%, and the model-badge shoulder is narrowed
past x=0.45. The same deformation applies to attached controls, excluding the
mount and the lens-release projection; the circular sensor chamber is cut after
deformation. Front/rear body renders were inspected for collisions. Canon front
lettering is smaller to fit the shorter viewfinder crest. This is a visual
proportion correction against the existing R7 photo, not a dimensionally complete
reverse-engineered housing.

### R7 ambient occlusion

The R7 exports a 2048px geometry-baked ambient occlusion map using a separate
BakedAO UV set. It captures local occlusion within 0.16 scene units rather than
baking directional lighting. The glTF occlusion texture and UV coordinates were
checked after meshopt compression, and the actual viewer's rear controls and
eyecup were inspected. This process now applies to R7, 40D, and C200; compressed textures and live assembled views were checked for all three. Surface grain
continues to use the original UV set. Overall photorealism remains unproven.

### EF 70–200mm f/4L IS controls

Reference: https://commons.wikimedia.org/wiki/File:Canon_EF_70-200mm_F4L_IS_USM_lens.jpg
Photo: https://upload.wikimedia.org/wikipedia/commons/2/2f/Canon_EF_70-200mm_F4L_IS_USM_lens.jpg
The f/4 model now uses the four-switch white control band between the rubber
rings: 1.2m/3m focus limiter, AF/MF, IS on/off, and IS modes 1/2. Rubber-ring widths
were corrected and the optional tripod collar moved onto the rear barrel, clear
of the zoom grip. Side placement was checked in the actual viewer. The f/2.8
example still needs its own reference-specific panel correction.

### EF 70–200mm f/2.8 example controls

Canon reference: https://www.canon.com.hk/en/product/catalog/productItemDetails.do?prrfnbr=321
Photo: https://www.canon.com.hk/public/product/3/pr_large_321.jpg
Control close-up: https://bbsimg01.kakaku.k-img.com/images/smartphone/icv/152818_f.jpg
The example uses the original IS layout: a white central four-switch panel,
1.4m/2.5m focus limiter and IS modes 1/2. Its collar is clear of the rear zoom
ring, with Canon/Ultrasonic marks near the front. Both telephoto focal-length
scales are now behind their zoom rings. The assembled C200 side view was checked
in the actual viewer. This supersedes the earlier note about a pending f/2.8
panel correction; optics and overall photorealistic fidelity remain unfinished.

### EF 50mm f/1.8 II geometry

Reference photo: https://mayanhvn.com/media/product/1651_canon_50mm_f18_mkii.jpg
Product page: https://mayanhvn.com/canon-ef-50mm-f18-ii.html
The 50mm now has a dedicated mesh builder: smooth fixed barrel, narrow front
focus rim, compact AF/MF recess, plastic mount, and a smaller recessed optical
group. Removed the generic zoom grip and nonexistent distance window. Its front
inscription includes the II designation. A continuous conical recess replaces
stacked beveled rings that produced visible moire in the live viewer. Glass size
and recess depth are estimates from the photo, not measured optical geometry.
Front three-quarter and side views were inspected in the interactive viewer.
These changes improve model specificity; full photorealistic fidelity is still
unfinished, particularly body contours and optical rendering.

### Tamron SP 35mm F/1.4 Di USD F045

Primary references: https://tamron.in/product/f045 and
https://www.tamron.com/global/consumer/lenses/f045/
Exterior photographs: https://tamron.in/v2/product_image/topside.jpg and
https://tamron.in/v2/product_image/sideview.jpg
A dedicated F045 builder replaces the generic zoom-shaped prime. Canon mount
length is 104.8mm and maximum diameter 80.9mm at 55mm per model unit. Focus grip
is toward the front, with smooth rear barrel, tapered shoulder, broad metal
mount accent, curved distance window, and compact AF/MF controls. Removed the
incorrect front-ring Canon-style inscription. Top, side and front three-quarter
views were inspected in the actual viewer. The first top inspection caught
window geometry sinking into the cylinder; subdivision before bending corrected
that visible defect. Optical construction remains an approximation, and the
assembled model does not yet establish photorealistic completion.

### R7 grip silhouette and camera bases

Rechecked the R7 front/back and top references listed above. The front grip is
narrower toward the mount while retaining its outside edge; the shutter moves
with the narrowed grip. The assembled viewer now shows more of the finger
recess and front focus-mode selector. Isolated front/side renders confirmed the
contour change and exposed two unrelated base defects: the battery plate floated
below the casting and the tripod socket protruded as a peg. The shared camera
base now seats the plate against the body and cuts a recessed, ringed socket.
This is an incremental correction; full reference fidelity remains unfinished.
The rebuilt R7 and 40D bases were inspected from below in the interactive viewer;
the R7 also received an isolated bottom render. The floating plate and protruding
socket defects are gone. The bottom render reveals that rear control attachment
and the front overmold edge still need closer inspection from grazing angles.

### Rear control seating and viewer lighting

Rear controls previously sat ahead of the main casting with no supporting rear
cover. Added a shaped rear cover to R7 and 40D, with an LCD opening. Rebuilt AO
and inspected compressed models from oblique rear angles; the R7 isolated bottom
render now shows the controls connected to the cover. The 40D LCD remains visible.
Viewer exposure is now 1.0, environment intensity .4, key .85, rim .65 and warm
fill .15. Compared R7 and C200 assembled views: black finishes retain darker
values without losing the principal highlights, and the white telephoto remains
legible. TypeScript and production build pass. These inspections establish the
specific fixes only; optics, C200 silhouette, and overall realism remain open.

### C200 front casting

Front reference: https://www.justcanon.in/products/canon-eos-c200
Photo: https://www.justcanon.in/cdn/shop/products/eos-c200_07.jpg?v=1659445922
Replaced the cuboid front with a shaped chassis, raised Canon crest, circular
structural mount casting, VIDEO cap, Cinema EOS badge, and lower 10/11 function
buttons. The handle/monitor attachment rises to clear the taller housing. An
isolated front render exposed vertical stretching of the circular casting under
body calibration; that casting now uses equal X/Y scale. The monitor cable also
now ends in a side connector. The sensor chamber and accessories still use
approximate geometry and remain part of the unfinished fidelity work.

### Optical rendering investigation

Inspected the exported GLB transmission/IOR/clearcoat extensions and the served
viewer material code. Stronger thin-film coating alone produced little visible
change at the default angle. Closed glass surfaces now render front faces only,
without an additional clearcoat lobe; inner reflection opacity is .06. The
28-135 front element has greater curvature, with its apex remaining behind the
rim. Rotating the actual viewer reveals a distinct reflected highlight across
that glass. The concentric internal baffles remain too dominant and the optical
result is still not photorealistic. Coating thickness and curvature are visual
approximations, not a recovered manufacturer optical prescription.

### 28–135 front recess revision

Compared directly with the previously downloaded Thanh Mai front close-up.
Replaced the eight strongly rounded internal steps with a continuous shallow
recess and six narrow grooves, using a rough black optical-barrel material.
Both default and rotated viewer captures show the oversized ring highlights
removed. Groove clearance was increased to avoid intersecting the conical
surface, but faint speckling remains visible and needs further diagnosis (the
last clearance change did not establish that artifact as solved). Glass depth
and coating reflections still need refinement. Production build passes.

### Baffle speckling diagnosis

A temporary test disabling received shadows on the optical recess did not
change the speckling; that test was reverted. Replacing the six tiny groove
meshes with a mapped roughness texture removed the speckling in matching and
second-angle viewer captures. The recess has a dedicated preserved UV set;
exported metallicRoughnessTexture presence was checked in the compressed GLB.
Fine rings remain visible as finish variation without subpixel geometry edges.
Production build passes. This resolves the observed baffle artifact, not the
remaining optical-depth or complete photorealistic-fidelity requirements.

### Refraction depth and next renderer test

Verified runtime MeshPhysicalMaterial values with a temporary diagnostic, then
removed it. Outer glass now uses finite approximate thickness (.16 units for
28-135, .12 for 35, .06 otherwise). Default/front/telephoto views were checked;
the visual change is small and does not establish realistic multi-element
refraction. A tinted inner-reflection trial was reverted because it did not
produce a meaningful improvement. TypeScript and production build passed.
Next investigation: an isolated progressive path-tracing comparison using
https://github.com/gkjohnson/three-gpu-pathtracer, whose documented renderer can
trace multiple bounces. The maintainer has announced eventual WebGL deprecation
(https://github.com/gkjohnson/three-gpu-pathtracer/issues/779); any prototype must
use a verified compatible release and preserve responsive interaction. No path
tracer dependency or production integration has been added yet.
# C200 filter housing and finish follow-up

## Grip finish

The camera grips use the CC0 normal and roughness maps documented in
`textures/README.md`, calibrated against the saved R7 front and rear photos.
The first unadjusted scan trial was rejected after browser inspection: it was
too glossy, and three repeats averaged the grain into a smooth highlight.
The final recipe uses a matte roughness range, stronger molded relief and
1.25 repeats shared by normal and roughness maps. Black body color is retained.
The C200's painted castings keep their distinct procedural crinkle finish.
World-area UV density normalization keeps the same grain size across differently
sized rubber parts. Rear inspection also caught a buried 40D thumb pad and
labels behind the rear-cover face. Both still-camera thumb pads now overlap the
cover slightly with their outer faces exposed; the 40D cover labels sit just
outside its rear surface.

## Telephoto optical depth and aperture

Canon specifies eight rounded diaphragm blades for both modeled IS telephotos:
https://global.canon/en/c-museum/product/ef391.html and
https://global.canon/en/c-museum/product/ef365.html.
The f/4 block diagram places the diaphragm near the middle of the optical train:
https://global.canon/ja/c-museum/wp-content/uploads/2015/05/ef391-lens-construction2.gif.
Replaced the shallow nine-blade approximation with eight rounded, blackened
blades deeper in the barrel. Internal elements remain a reduced visual model,
not a full optical prescription; the f/2.8 depth is approximate.

Front reflection reference for the original f/4 IS:
https://www.fredmiranda.com/forum/topic/1924402/0
Image https://www.fredmiranda.com/forum/ufiles/54/2985454.jpg.
With glass hidden in a temporary browser diagnostic, the gray bowl remained.
Reducing the lining's specular response removed it. The final flocking uses
Blender Specular IOR Level 0.05 rather than the default 0.5. A separate black
front sleeve covers exposed white housing inside the filter rim. Removed the
temporary scene diagnostic after tracing these causes.

HDU-2 handle primary reference:
https://www.usa.canon.com/shop/p/hdu-2-handle-unit
Image: https://s7d1.scene7.com/is/image/canon/2421C001_primary
The reference shows a single hollow casting, scalloped hand opening, transverse
accessory sockets, cold shoe, recessed top mounting insert and central knurled
mounting wheel. Rebuilt these features and removed the unsupported wide cage
plate from the previous model. The monitor arm moves upward with the handle
to maintain clearance. Dimensions remain photo-estimated; the casting is not
claimed to be a manufacturer CAD model.

Verification caught a filled hand opening despite a successful export. The
profile helper accepted clockwise outlines with inward normals, which made the
boolean unreliable. It now normalizes winding before building solids; an
unobstructed ray through the hand opening is required before export. Confirmed
the resulting opening in the actual viewer and inspected the side/top Blender
audit renders. The wider audit framing includes the raised monitor.

The front photo from https://www.justcanon.in/products/canon-eos-c200 shows a
clipped-corner filter cassette, four retaining screws, blue filter surround and
narrow gold border inside the mount. The generic still-camera insert has been
replaced with this assembly. The actual sensor plane is placed at EF register
depth behind the visible filter assembly. Canon lists the sensor as 26.4 × 13.8
mm at https://sg.canon/en/consumer/eos-c200/main/specification; those dimensions
set the underlying sensor plane rather than the visible filter housing.

The same photo and the saved operator-side photo show a coarse painted finish
on the circular front casting and inset control casting. Those surfaces now use
a separate crinkle-paint material, distinct from the smoother housing polymer
and softer rubber grip. This is a procedural approximation of the reference
finish, not a scanned material.

### Still-camera eyepieces

R7 rear reference: https://cameraclix.com.au/cdn/shop/products/r7_back_body_1800x1800.webp?v=1653368444
40D front/rear/side reference: https://bizweb.dktcdn.net/100/107/650/products/allroundview-jpeg.jpg?v=1573647746827
Canon R7 diopter operation: https://cam.start.canon/en/C005/manual/html/UG-01_Preparations_0100.html

The two bodies now use separate rubber cup proportions and an inner optical
carrier with a shallow curved glass face. The R7 has the rectangular eye sensor
beside its aperture; the 40D has a centered aperture and lower retaining rail,
without an eye sensor. Knurled diopter wheels sit beside the eyepieces. These
remain reference-based geometric approximations, not optical prescriptions.

The rear display pass uses the same R7/40D rear references. The 40D bezel was
partly buried in the rear cover: its rear surface was at rz−0.0275 while the
cover reached rz−0.041. The frame now sits outside that cover, with a perimeter
gasket, inset black dielectric display face, and logo on the visible lower
frame. Display glass has a separate material from distance windows and optics,
so correcting its blue-gray metallic appearance does not change lens glass.
The R7 hinge now has two barrel sections separated by its central joint.

The 40D four-view reference also shows two adjacent vertical rubber terminal
covers, with molded VIDEO OUT, sync, remote and USB markings. The previous
shared model incorrectly divided that area horizontally. The 40D now has its
own paired flaps, recessed surround and low-contrast molded symbols. A CF-card
door perimeter follows the opposite side; its points are ray-projected onto
the casting/grip surfaces and fail the build if they miss the housing.

28–135mm control pocket refinement uses the saved Points in Focus close-up:
https://static1.pointsinfocus.com/2010/08/canon-ef-28-135mm-f3-5-5-6-is-usm/EF-28-135mm-f-3.5-5.6-IS-USM-controls.jpg
The control insert now sits in a boolean-cut curved barrel pocket rather than
on the housing surface. The pocket is taller around the circumference, with
larger individual switch wells, revised spacing, a stabilizer position mark,
and a lower retaining screw. All insert components follow the barrel radius.

### Control Ring Mount Adapter EF–EOS R

User confirmed ownership of the control-ring version. Canon's product photo:
https://s7d1.scene7.com/is/image/canon/2972C002_control-ring-mount-adapter-ef-eos-r_primary-1
Manual: https://gdlp01.c-wss.com/gds/2/0300032192/01/crm-adapter-ef-eosr-im-eng.pdf
The 2025 Canon EOS R catalog specifies 74.4 × 24.0 mm for this version.
The model now uses 24/55 scene units between mating planes, a stepped painted
housing, rear silver trim and five rows of diamond control-ring knurling.
R7 mounting copy identifies the control ring. Lens bayonets (local z=0…0.088)
now insert into the receiving mount, with local z=0.088 on its mating plane;
previously the entire bayonet sat forward of it. Viewer and study renderers use
the same corrected assembly offsets.

Distance-window carriers on the 28–135mm and both 70–200mm models are now
subdivided and bent around the barrel radius, together with their glass and
printed markings. The prior tangent boxes lifted their outer edges away from
the housing. Window glass uses the black dielectric material introduced for
inactive displays; this does not change the transmissive optical elements.

The R7/40D cast housings, grip cores and rear covers now use the painted finish
rather than the smooth button/trim polymer. An initial viewer comparison showed
oversized shoulder grain because independent UV packing changed texture scale.
Painted surfaces now use the same world-area UV normalization as scanned grips;
the paint's separate sixfold repeat keeps its grain finer than the rubber.

A later rear-oblique check showed the 40D terminal assembly still stood too
far off the side. Its tessellated covers and molded markings now project onto
the actual casting surface, retaining 45% of their prior outward depth. The
lower side fasteners are also seated by ray intersection; missing intersections
fail the build instead of silently leaving detached details.

C200 rear-detail pass uses the saved CineD rear photograph:
https://www.cined.com/content/uploads/2017/05/Canon-C200_5-1536x864.jpg
Added the BP-A30 white identification strip, individual charge-indicator dots,
check membrane/legend, battery-release tab, XLR retaining screws and PUSH
markings. The connector flaps now carry drawn headphone, USB and network
symbols in place of generic text labels. Small legends are geometric lettering;
readability remains dependent on viewer zoom and rendering resolution.

LM-V1 monitor controls follow page 17 of Canon's C200 manual:
https://gdlp01.c-wss.com/gds/3/0300027483/02/eosc200-200b-im2-en.pdf
The monitor now has a left control column (FUNC, MENU, joystick, MIRROR,
CANCEL, DISP), a separate display bezel, black inactive glass, a bottom mounting
socket and VIDEO connector. Removed the invented STBY/settings/safe-frame
readout. The cable's monitor end is moved to the modeled VIDEO connector.

C200 viewfinder geometry follows the saved rear product photo and page 40 of
the same Canon manual. The taller rubber opening surrounds a rectangular curved
optical face and an eye sensor on the left when viewed from behind. Its diopter
control is a sliding lever below the EVF housing, rather than a still-camera
side wheel. This remains simplified optical geometry, not a full EVF lens stack.


40D flash hood topology follow-up: replaced the bevel-then-subdivide extrusion
with a longitudinal loft, rounded end stations, and sampled perimeter edges.
The local interactive side view no longer shows the previous horizontal bands.
Front-oblique inspection still shows a small surface blemish near the middle of
the hood; this is unresolved and requires geometry inspection. Overall body
finish and lens optics remain visibly synthetic. C200 modeling remains paused.
Browser captures: /tmp/40d-loft-dense-front.png and
/tmp/40d-loft-dense-side.png. Production build passed during this pass; final
perimeter resampling changed only the generated 40D asset and generator.


40D hood blemish resolved: ray inspection of the unjoined model found the
continuous cast housing outside the hood at y=.96/1.0, z=.24 on the left side.
The old cavity subtracted only the hood volume, leaving exterior shell islands.
Widening and raising the hidden cavity removed those islands. All 24 sampled
side rays now encounter the hood first. Browser front-oblique confirmation:
/tmp/40d-pocket-front.png. The 40D-only EF flange was also reduced from radius
.626 to .591, with its fasteners moved inward, reducing the broad exposed silver
annulus at the lens joint. Both the 28–135 and 70–200 f/4 were inspected attached;
see /tmp/40d-flange-after.png and /tmp/40d-flange-tele.png. Rear inspection:
/tmp/40d-pocket-rear.png. These repairs do not establish photorealism.


Live-view optics/environment pass: disabling scene.environmentIntensity removed
the striped glass highlight; changing only material.envMapIntensity had no effect.
The installed Three.js WebGLRenderer overrides material intensity when envMap is
null and scene.environment is used (WebGLRenderer.js, environment uniform update).
The live scene now generates a PMREM environment from four broad light cards,
with neutral fill, and assigns that map explicitly to optical glass materials.
The old HDR remains available for the separate Blender/path-tracing studies.
Outer coating range is now 110–125 nm and glass environment intensity 1.2.
28–135 inner retaining ring/aperture housing now use the matte internal finish;
its aperture blades use blackened steel. The striped highlight is gone, but the
central pale crescent/reflection is still visibly unlike the reference. Do not
claim optical fidelity from this pass. Both body defaults, the R7 rear, owned
telephoto, and available-tab rendering were inspected. Type check and production
build passed; no browser errors. C200 geometry was not changed. Captures in /tmp:
28-interior-matte.png, r7-softbox-fill-rear.png, r7-softbox-tele.png,
c200-softbox-check.png. No path tracing was integrated into the live viewer.


28–135 inner chamber correction: a diagnostic ray from (0,.1,3), direction
(0,-.22,-1), previously hit the exterior Taper shoulder through the optics at
z=.36. There was no inner wall between the front recess and aperture. A dark
continuous chamber now joins the recess at r*.405/z=l-.32 to the aperture outer
edge; the same ray now hits Zoom inner optical chamber at z=1.19885. The broad
pale crescent disappeared in the actual viewer. The six aperture blades now fill
the complete annulus with rounded inner edges instead of leaving wedge gaps.
The Ø72mm inscription span was tightened from .42 to .30 radians. Rebuilt only
28–135; white lens geometry is unchanged. Front/oblique views were checked on R7
and 40D, with no browser errors; production build passed. Captures:
/tmp/28-iris-front.png, /tmp/28-chamber-r7-angle.png,
/tmp/28-chamber-40d-angle.png. The central optical reflections are still too plain
and photorealism is not established.


28–135 front optical profile: Canon Camera Museum construction diagram:
https://global.canon/en/c-museum/product/ef342.html
https://global.canon/ja/c-museum/wp-content/uploads/2015/05/ef342-lens-construction.gif
The diagram shows an asymmetric curved front element, unlike the old symmetric
biconvex mesh. optical_element now accepts independent rear curvature, defaults
to its previous profile for other lenses, and rejects intersecting center faces.
The 28–135 front uses a negative meniscus with .075 edge thickness, front sag .10,
rear sag .135 (.040 center thickness). These are visual approximations from the
diagram, not Canon's optical prescription. The front face position is preserved;
the recess/chamber moves .035 back to clear the rear glass surface. The live
viewer was inspected; the separate tracing study reached 453 samples in 82s at
450x450. It still lacks convincing layered internal reflections. Do not ship
path tracing as a presumed solution to model fidelity. The study also now sets
material.castShadow=false for glass: its tracing library ignores the mesh flag
for that purpose. This latest optical pass is local, after snapshot b6b3261.

40D rear printed symbols: Canon EOS 40D instruction manual, page 17:
https://gdlp01.c-wss.com/gds/6/0900008236/01/EOS40D_HG_EN.pdf
Compared with the four-view product photograph (40d.jpg). Replaced the incorrect
LV text with Print/Share artwork and STYLE with the Picture Style swatches.
Playback/erase ink belongs above-right of the bottom buttons, not on their faces.
Added the blue index/reduce and enlarge symbols below the AE/AF buttons. These
new markings use planar polygons projected onto the rear cover/overmold, avoiding
raised tubes for printed strokes. Existing R7 markings are unchanged.
Verified regenerated mesh in the live viewer at rear and rear-oblique angles:
/tmp/40d-legends-final-rear.png and /tmp/40d-legends-final-oblique.png.
New blue symbols and Picture Style artwork are visible and follow the cover.
The AE asterisk remains poorly visible; the upper button group, eyepiece and
rubber/shroud transitions still need comparison and correction. This pass does
not establish photorealism and remains local. Meshopt export and diff check pass.

40D control seating and Eyecup Eb pass:
The rear button depth is now measured against the cover/overmold BVH for each
button, with an annular bezel and a separate satin plastic cap. The AE-lock mark
uses three crossing ink strokes rather than the undersized font asterisk.
Eyecup identification: Canon's EOS 40D support/catalog lists Eyecup Eb:
https://www.canon.com.hk/en/product/catalog/productItemDetails.do?prrfnbr=100075
Separate genuine accessory reference:
https://www.cameranu.nl/p2739/canon-eyecup-eb
https://static.cmra.nu/139/1399616414_679.jpg
(local eyecup-eb.jpg). This shows an open U-shaped rubber surround, two lower
feet and an exposed hard carrier/retaining rail. The 40D cup now has the lower
central opening and additional lip profile stations. R7/C200 profiles retain
their previous loops; no optical simulation claim is made from this change.
Live-view verification: /tmp/40d-eb-rear.png and /tmp/40d-eb-oblique.png show the
open lower eyecup, exposed retaining rail, visible AE asterisk and seated button
rims. The satin caps now catch separate highlights instead of reading as rubber
bumps. Remaining fidelity gaps include the opaque-looking finder optic, broad
body/overmold transitions, subdued marking contrast and the lens optics. This
is a local revision, not proof that the full photorealism goal is complete.

Live studio rear-light/material inspection:
The existing rear spotlight moves from (4,2,-3), intensity 20 to (-3,3,-5),
intensity 55; its reflection card moves to the same rear quadrant and widens.
This brings the rear controls out of shadow without adding lights/shadow maps.
Rubber normal strength in the viewer changes from exported strength * .8 to
* .35: the brighter rear view exposed excessively deep-looking grain. Paint
normal strength stays unchanged. Checked 40D rear before/after normal adjustment
(/tmp/40d-rear-balanced-light.png, /tmp/40d-rear-reduced-normal.png), R7 front,
side and rear (/tmp/r7-balanced-{front,side,rear}.png), and the white 70-200 f/4
on 40D (/tmp/40d-70-balanced-front.png). The new views improve visibility but
still show synthetic optics, simplified controls and body transitions. These
renderer changes remain local and do not prove photorealistic fidelity.

28-135 optical recess isolation and machining pass:
Temporarily hid only the outer glass material in the live viewer. The grey
corrugated recess remained (/tmp/28-no-outer-glass.png), locating that appearance
in the underlying geometry, not solely the front transmission shader. Restored
the outer material immediately after the diagnostic. Compared the existing
28-135-front.jpg: narrow annular cuts with broad lands and stepped inner group
retainers. Replaced the sinusoidal recess corrugation with ten narrow V cuts;
added four retaining shelves extending into the chamber wall. Dimensions remain
visual approximations, not a recovered optical prescription. Inspected front
and oblique views (/tmp/28-stepped-recess-{front,oblique}.png). Reduced recess
sampling from the trial 240 rows to 120; compressed GLB is 1.60 MB rather than
1.79 MB. Final capture: /tmp/28-stepped-final.png. Central coated reflections
still look like simple discs; that fidelity gap remains open. Not published.

28-135 inner dielectric/coating pass:
Replaced this lens's inner brown metal/opacity-.12 layer with a nonmetallic,
black-diffuse additive reflection layer, opacity 1, IOR 1.52, iridescence 1 and
280–300 nm thickness range. This is a raster reflection approximation, not a
multielement transmission simulation. Other lenses retain their existing
material settings pending their own checks. Three.js material/shader references:
https://threejs.org/docs/pages/MeshPhysicalMaterial.html
node_modules/three/src/renderers/shaders/ShaderChunk/iridescence_fragment.glsl.js
Initial dielectric test at the old curvature stayed disc-like and blue
(/tmp/28-inner-dielectric.png). Increased the two 28-135 inner surface sags to
.055 (visual approximation; not a recovered Canon optical prescription), while
retaining positions/radii. The curved surfaces now catch moving, distinct
softbox reflections in front and both oblique views:
/tmp/28-curved-dielectric.png, /tmp/28-curved-dielectric-oblique.png,
/tmp/28-curved-dielectric-opposite.png. The reflected coating colours are still
an approximation and the optics remain visibly synthetic. GLB stays 1.60 MB.

R7 rear screen/speaker/control pass:
Compared r7-rear.webp (CameraClix product reference). Thin glass/gasket cube
bevels were clamped by their .010 thickness, leaving nearly square corners.
The R7 now uses an explicitly rounded outline extruded to that thickness;
outline radius no longer depends on thickness. Added six real boolean speaker
perforations with dark recessed floors below the finder/dial gap. A trial .09
finder shift was rejected because it visibly misaligned the finder and hot shoe
(/tmp/r7-surround-rear.png); original finder placement is retained. Replaced the
small font AE asterisk with three strokes and added the blue playback frame,
with a smaller triangle inside it. These changes are restricted to the R7.
Final R7 viewer checks: /tmp/r7-rear-final.png and
/tmp/r7-rear-final-oblique.png. Speaker recesses remain visible with the original
finder placement; the AE and framed playback marks are visible. Oblique view
shows the thin glass outline and its corner radius. Compressed R7 is 3.57 MB.
The side door geometry, finder optics, broad shoulder transitions and overall
material response remain visibly simplified. This pass stays local and does
not establish photorealism. Earlier snapshot b6b3261's GitHub Pages workflow
34161252863 was independently confirmed completed/success during this pass.

R7 terminal covers and port-side strap eye:
Reference: https://cameraland.co.za/products/canon-eos-r7-body
https://cameraland.co.za/cdn/shop/files/cameraland-canon-eos-r7-mirrorless-camera-body-04.webp?v=1755191805&width=1400
(local r7-terminals.webp). Four covers replace the generic rectangle: sloped
MIC cover, long remote-terminal cover, lower headphone cover, and tall HDMI/USB
cover. Outlines use coordinates from the image; molded MIC/HDMI text and remote,
headphone and USB symbols follow the same surface projection as the covers.
Added a shaped leatherette surround and thin recessed-looking seam borders.
All cover vertices are projected onto the real housing before the common R7
body deformation. Added a controllable outline-rounding parameter to profile;
its existing default is preserved for all previous callers.
The former square strap fitting overlapped MIC. Replaced it with a raised oval
metal eye above the covers, posed against the shoulder normal with a stable
across-camera axis (the initial shortest-arc rotation rolled the slot). Removed
two generic side screws that incorrectly crossed the headphone/HDMI covers.
The existing positive-side fill light changes from (2,1,5), intensity 8 to
(4,3,1), intensity 25; the same three lights/shadow maps remain in use. Initial
side captures exposed these overlaps/alignment issues before final correction:
/tmp/r7-terminals-side.png and /tmp/r7-ports-final-side.png.
The close-up exposed severe panel shading artifacts. Disabling normal/AO maps
and then live shadows did not remove them; both diagnostics were fully restored.
Denser interior triangulation, zeroing custom normals and smoothing the sampled
support did not resolve the artifact. Rebuilding the deformed panel mesh data
(vertices/faces/materials, with automatic smooth normals) finally removed the
rippling. Retained custom-normal data was the decisive issue, not a material
colour adjustment. Covers retain a smooth vertical support profile sampled
across the casting depth, with narrow clearance; source outlines remain intact.
Final checks: /tmp/r7-fresh-normals-final.png (side close-up),
/tmp/r7-clean-ports-oblique.png and /tmp/r7-clean-ports-front.png. Four shaped
covers, molded symbols and the horizontal oval strap eye are visible without
the old overlaps or rippled panel shading. GLB is 3.90 MB. Broader body shading
and optics still need fidelity work; consider retained custom normals when
investigating remaining deformed-surface artifacts. All changes remain local.

### R7 shoe and casting verification

The R7 shoe now has a metal bed, inset black contact block, one large sync
contact, four smaller communication contacts and a modeled accessory-contact
row. Compared with r7-top.png and Canon's EOS R7 manual (21 accessory pins plus
five flash contacts):
https://global.canon/ja/c-museum/wp-content/uploads/2023/06/dslr901_en.pdf
Live checks: /tmp/r7-shoe-top-shortlens.png and
/tmp/r7-shoe-rear-oblique.png. Bed and contacts stay attached in both views.
Mechanical dimensions remain photo-derived approximations.

Top housing streak diagnosis: removing the roughness map initially appeared to
remove streaks, but that also changed effective roughness to 1. Holding uniform
roughness at 0.48 retained the streaks (/tmp/r7-shell-uniform-roughness.png).
Disabling the normal map alone also retained them. Matching roughness tiling to
normal tiling did not solve them. All runtime diagnostic overrides and the
unproven tiling change were reverted. The earlier whole-housing fresh-normal
experiment likewise did not improve the housing. Investigate casting geometry;
do not cite map removal as a successful fix.
A 24-iteration casting smoothing trial (baseline 4) did not remove the streaks
in /tmp/r7-casting-smoothed-oblique.png. Reverted source and published-path GLB
to the shoe revision. The ignored editable blend and uncompressed R7 output
still contain this rejected smoothing trial; regenerate them from source before
using them. Disabling live shadow maps also retained housing streaks
(/tmp/r7-casting-no-shadow.png); restored shadow settings. Geometry remains a
hypothesis, not a proven root cause. A next controlled comparison should hold
roughness at 0.48 while disabling both normal mapping and AO, rather than
changing effective roughness when removing a map.

### R7 crown deformation sampling

Controlled diagnostic /tmp/r7-controlled-no-maps.png holds roughness at 0.48
and disables normal, roughness and AO maps together. Broad bands remain.
Restored all runtime settings after the comparison. Increasing pre-remesh
smoothing alone had not helped. Subdividing long upper-housing triangles before
the nonlinear crown bend reduces broad shoulder bands in the actual viewer:
/tmp/r7-tessellated-casting.png, compared with /tmp/r7-shoe-rear-oblique.png.
The first subdivision export exposed rippled rear-cover shading, so the final
mesh must also discard pre-deformation split normals. Neither a favorable
shoulder view nor a successful export establishes completion.
Final retained implementation subdivides upper shell/rear-cover edges longer
than 0.05 model units before bending, then rebuilds those meshes with smooth
normals from their final vertex positions. The combination matters: replacing
normals alone had not removed broad shoulder bands; subdivision alone retained
bad rear-cover split normals. Verified final export in the interactive viewer:
/tmp/r7-formed-normals-oblique.png, /tmp/r7-formed-normals-rear.png and
/tmp/r7-formed-normals-front.png. Rear rippling is removed and the shoulder bands
are reduced. Remaining geometry, lettering, small seams and optics still fall
short of the reference. Final compressed R7 is 4.44 MB (previous shoe version
3.93 MB); loading remains opt-in. Editable blend and uncompressed GLB have been
regenerated from the retained source, superseding the stale-output note above.

### R7 mode dial reference

Canon's Part Names page provides the twelve-position mode dial diagram:
https://cam.start.canon/en/C005/manual/html/UG-00_Before_0090.html
https://cam.start.canon/en/C005/manual/html/screens/UG-00_i0210.png
Local reference: output/gear-reference/r7-mode-dial.png.
The prior ten-position generic dial omitted Fv and Creative Filters and placed
SCN/custom positions in the wrong sequence. The R7-specific dial now includes
all twelve, larger type, outlined custom/Auto marks, an overlapping-circle
Creative Filters symbol and a white body index seated on the shoulder.
The first outlined C1/C2/C3 treatment crowded adjacent labels. Replaced it with
stacked dark C/numeral glyphs on white badges, matching the product photo; Auto
uses a green framed A with a raised plus. The dial is set to Tv at the index,
as in r7-top.png. Final live checks: /tmp/r7-dial-final-top.png and
/tmp/r7-dial-final-oblique.png. Twelve positions and their symbols are now
visible in the interactive viewer. Fine glyphs still depend on zoom/resolution;
this is not a claim that the full camera is photorealistic. R7-only geometry
change; both regenerated GLB and editable source are local and uncommitted.

### R7 shutter-area controls

Compared top controls with output/gear-reference/r7-top.png at original
resolution. The main wheel has a diamond pattern, while the prior generic dial
used long axial ribs. Replaced it with a cylindrical core and a single mesh of
12 axial rows × 32 diamond positions, using the existing satin control plastic.
The first viewer check exposed over-large teeth and too much wheel above the
casting. Reduced tooth relief from .008 to .003 model units and lowered its
center by .023. Enlarged the M-Fn/ISO/LOCK legends; added the power selector's
white index and movie pictogram. Printed marks follow the casting surface.
The fixed-height wheel still intersected the cross-sloping grip. Sampling both
axle endpoints aligned it to that slope, but exposed a convex center that hid
the wheel (/tmp/r7-wheel-aligned-top.png). Final fix cuts a real .088 × .282
opening through the casting above the aligned wheel. Verified across its width
in /tmp/r7-wheel-slot-top.png and from both sides in
/tmp/r7-wheel-slot-front-oblique.png and /tmp/r7-wheel-slot-oblique.png. The
wheel is seated inside a continuous slot instead of intersecting the grip.
All diagnostic attempts were superseded by the retained alignment + slot.

### 28–135 front inscription and rim overlap

Compared output/gear-reference/28-135-front.jpg at original resolution.
For inscriptions without an explicit angular span, arc_text now bends a full
Blender-typeset line onto the ring. This preserves proportional glyph widths,
spaces and font kerning instead of equally spacing every character. The
28–135 inscriptions use this path, with larger reference-scaled type and a
centered Ø72mm marking. Other lens GLBs were not regenerated in this pass.

Seating the lettering near the printed surface exposed an existing overlap:
the anodized outer rim covered most of the graphite printed ring. Narrowed the
28–135 outer rim's inner radius from .845r to .958r so it borders the printed
ring instead of covering it. Lettering is now .0005 units above the printed
surface rather than floating above the overlapping rim. Verified live:
/tmp/28-ring-overlap-front.png and /tmp/28-ring-overlap-oblique.png. The printed
ring and inscription remain visible from both views. Compressed GLB remains
1.60 MB. Optics still look synthetic; this pass does not establish photorealism.

### 28–135 internal coating separation

Compared the original front photo and Canon construction diagram already listed
above. The single 280–300nm inner-layer setting produced a dominant purple disk.
The first internal surface now uses a 220–240nm modeled film range; a separately
named rear surface uses 350–370nm with opacity .4. Both remain inexpensive
additive reflection approximations. IOR 1.52/1.60 and film settings are visual
model parameters, not recovered Canon glass/coating specifications.

Initially identical Blender materials were deduplicated by glTF optimization,
so a second name alone did not survive. A distinct rear glass IOR in the source
now preserves both materials; inspected final GLB JSON to verify both names.
The rear material still receives the same shared environment and lifecycle
handling through its 'Inner optical glass rear' name. Final actual-viewer
captures: /tmp/28-coatings-final-front.png and
/tmp/28-coatings-final-oblique.png. Purple dominance is reduced, with separate
amber/cool contributions. Reflections still look too simple to establish
photorealism. This does not add path tracing or change opt-in loading.

### Owned 70–200mm without mount bracket

User correction: the owned 70–200mm f/4 has no mount bracket. Removed its entire
tripod collar, stem, foot, rubber pad and locking knob. Collar generation now
applies only to the available f/2.8 example. Regenerated the owned GLB (1.36 MB)
and its 480×330 transparent selector thumbnail from the collar-free mesh.
Verified both thumbnail and selected R7 + f/4 scene in the actual viewer:
/tmp/70-f4-no-collar-viewer.png. This preference overrides references showing an
optional collar installed on the f/4 lens.

The owned f/4 switch panel now has four rounded openings, wider white sliders,
black position marks and grip ridges, based on 70-200-f4-side.jpg. Verified the
optimized 1.49 MB model in /tmp/70-f4-switches-side.png; regenerated the collar-free
selector thumbnail from this mesh. Build and whitespace checks passed. These
refinements do not establish photorealism and remain local.

### Owned f/4 molded grip pattern

Compared the smooth uninterrupted model ribs with 70-200-f4-side.jpg. The photo
shows staggered interruptions: two axial sections on the rear grip and three on
the front grip. Added those breaks, widened the lands and rounded their edges.
The counts and dimensions are photo-based approximations. All lands remain in
one mesh per grip; other lenses retain their existing rib pattern. The optimized
owned f/4 asset is now 1.78 MB. Actual viewer checks: /tmp/f4-ribs-side.png and
/tmp/f4-ribs-oblique.png. Updated its thumbnail from the new mesh. The optical
reflections and camera housing still visibly fall short of photorealism.

### Owned f/4 front rim and barrel lettering

70-200-f4-front.jpg shows a plain black front rim; 70-200-f4-side.jpg places the
lens inscription on the white barrel behind the red ring. Removed the erroneous
front-face nameplate and its lettering for the owned f/4. Added a recessed black
filter-rim face and wrapped the name/67mm marking onto the white barrel. Enlarged
the lettering to fit the available band without crossing the grip or red ring.
Verified /tmp/f4-markings-side.png and /tmp/f4-markings-front.png in the actual
viewer, plus the earlier /tmp/f4-front-oblique.png. Regenerated the thumbnail.
The internal reflections remain visibly too simple; this is not a photorealism
completion claim. Other lens exports were not changed by this correction.

### Owned f/4 rubber and internal coating response

Compared identical front/oblique views before and after assigning dedicated
telephoto grip rubber: roughness .68, normal strength .20, specular IOR level .30.
This reduces the broad glare while retaining edge highlights. Values are visual
estimates from the reference, not measured material properties. Other bodies
and lenses retain the previous rubber material.

The f/4 internal optical surfaces previously used metallic amber shading.
They now use dielectric coating-only reflection (black diffuse, metalness zero,
IOR 1.52, iridescence 1, opacity .6). This removes some brown disk shading while
preserving the shared environment and opt-in loading. No live path tracing was
added. Viewer captures: /tmp/f4-rubber-front.png, /tmp/f4-dielectric-front.png,
/tmp/f4-dielectric-oblique.png. Thumbnail refreshed. TypeScript check passed.
Optics remain an approximation and still lack realistic multi-element refraction.

### 40D rear LCD outline

The 40D four-view reference shows rounded LCD corners. The previous thin cube
bevel was clamped by depth, producing nearly square bezel and glass outlines.
Replaced the bezel, gasket and cover glass with rounded-panel meshes whose
outline radius is independent of thickness (.075/.060/.050 scene units).
Kept their existing dimensions and seating. Regenerated and optimized 40d.glb
(3.38 MB). Actual viewer verification: /tmp/40d-lcd-rear.png and
/tmp/40d-lcd-oblique.png; no exposed opening at the rounded corners was visible.
The broader body/control fidelity remains incomplete. No runtime code changed.

### 40D power-switch markings and current body previews

Added the rear lever's white position index and the upper quick-control-enabled
position mark visible in the four-view 40D reference. Enlarged ON/OFF lettering
from .032 to .045 scene units; printed legends continue to follow the rear cover
through the existing surface projection. Verified /tmp/40d-power-rear.png and
/tmp/40d-power-oblique.png. Regenerated and optimized the 40D asset.

Refreshed both owned-body selector PNGs from their current exported meshes using
the local preview renderer. Inspected /tmp/r7-updated-preview.png and
/tmp/40d-updated-preview.png before replacing their public previews. These show
the current geometry, whose overall photorealism remains incomplete.

### R7 grip surface response audit

Investigated the smooth-looking front grip before changing geometry. The first
color-isolation capture was stale and misleading. Repeated capture showed the
rubber correctly; Blender surface measurements and browser ray intersections
both put it ahead of the housing (~.005 scene units at the sampled front point).
No housing/overmold geometry was moved. The local diagnostic color/visibility
and raycast instrumentation were removed after the check.

Increased only the R7 scanned-rubber normal multiplier from .35 to .65, retaining
the texture mapping and other materials. Compared with r7.jpg and verified the
actual viewer front oblique (/tmp/r7-grip-normal-check.png) and rear
(/tmp/r7-grip-normal-rear.png). Grain is more distinct from smooth plastic; the
whole model still does not meet photorealism. Refreshed the R7 thumbnail.
TypeScript verification passed. This adds no texture, geometry or loading work.

### EF 50mm f/1.8 II rim lettering and recess

Compared 50ii.jpg with the actual viewer. Equal-angle placement had stretched
individual letters around the front rim. Switched both inscriptions to the
continuous typeset arc path, preserving glyph widths and spaces; enlarged the
main text to .078 and the lower text to .060 within the existing band.
Verified /tmp/50-type-oblique.png and /tmp/50-type-front.png.

The front conical recess also reflected like a shiny solid funnel. Assigned the
existing matte optical-barrel material and radial/axial UVs for its subtle
annular finish variation, without adding geometry. Verified the final model in
/tmp/50-matte-front.png and regenerated its selector thumbnail. Glass reflection
and overall photorealism remain incomplete. No loading or render-loop changes.

### R7 eyepiece carrier outlines

Compared r7-rear.webp with the current rear viewer. The curved optical face was
already present, but thin cube bevels made its carrier, recess and proximity
window outlines nearly square. Replaced those R7-only pieces with rounded-panel
outlines independent of their depth. Kept the glass curvature and seating.
Regenerated/optimized R7; checked /tmp/r7-eyepiece-rear.png and
/tmp/r7-eyepiece-oblique.png for fit within the rubber cup. No exposed gaps were
visible at those checked angles. Overall optical and body realism remain
incomplete; this is not a completion claim.

### R7 and 40D inactive display appearance

Added separate small base-color textures for the rear glass, with a subtly
lighter inactive pixel area and darker perimeter. R7 proportions were checked
against Canon's 3:2 LCD specification:
https://cam.start.canon/en/C005/manual/html/UG-10_Reference_0100.html
40D proportions follow the four-view rear reference. Color values are visual
approximations, not measurements. The first shared mask was visibly too wide;
replaced it with body-specific masks before retaining the exports.

The initial custom UV name introduced an extra UV layer after joining and
conflicted with the AO helper's hard-coded active index. Stopped that confirmed
incorrect bake, named the display base UV 'UVMap', and made the AO helper select
the newly appended layer rather than assuming index 1. The corrected bake
completed normally. Inspected final GLB materials: display color uses UV0 and AO
uses UV1 for both bodies. Optimized assets: R7 4,427,584 bytes; 40D 3,389,376 bytes.

Verified /tmp/r7-display-final-rear.png, /tmp/r7-display-final-oblique.png,
/tmp/40d-display-final-rear.png and /tmp/40d-display-final-oblique.png in the actual
viewer. Both selections and rear controls remain usable. No extra render pass,
animation or live ray tracing was added. Overall photorealism remains incomplete.

### R7 front AF/MF selector

The front reference r7.jpg shows a diagonal lever and shaped surround below the
round AF/MF selector. Added these missing pieces, seated the surround into the
front panel, and moved/enlarged the MF/AF legend away from the grip edge. The
legend now sits at the panel surface rather than on the selector's raised plane.
Regenerated and optimized R7. Checked /tmp/r7-focus-selector-oblique.png in the
interactive viewer; the lens occludes part of the selector in the front view.
Also checked a straight-on bare-body preview /tmp/r7-front-selector.png to verify
the complete lever/legend placement. The oblique selector thumbnail is refreshed.
The first local preview after editing its camera helper was stale; a reload
produced the expected front view. Overall model fidelity remains incomplete.

### R7 RF chamber lining

The bare-body front preview exposed grey casting around/behind the sensor;
r7.jpg shows a dark internal chamber. Kept mount and sensor dimensions and
added a matte lining inside the RF throat plus a rear baffle behind the sensor
frame. The frame/filter remain in front of the baffle. Regenerated/optimized R7.
Verified sensor visibility in /tmp/r7-chamber-front.png and the assembled
R7 + Control Ring Adapter + 50mm in /tmp/r7-chamber-assembled.png. Refreshed the
body thumbnail from the current mesh. Chamber construction is still simplified;
no claim of full reference fidelity or photorealism follows from this change.

### R7 front model badge

Moved the EOS/R7 markings higher on the shoulder and enlarged them relative to
the earlier compressed text. An initial wider backing protruded beyond the
shoulder in the bare-body view; narrowed/moved it inward and projected the
backing and text onto the housing surface before retaining the final export.
The backing uses a rounded outline independent of its small thickness. A missed
surface projection now raises an error rather than exporting a floating badge.

Verified /tmp/r7-badge-final-front.png and /tmp/r7-badge-mounted.png; the mounted
lens still occludes part of the lower badge at this angle. Refreshed the body
thumbnail. These checks establish the local fit, not full photorealistic fidelity.

### Current first-load poster and 28–135mm preview

Regenerated setup.png from the current createStudio implementation, models and
lighting using a local-only copy with capture enabled. The shipped renderer was
not changed. Updated the 28–135 selector thumbnail from its current mesh too.
Verified /tmp/gear-updated-poster-page.png against
/tmp/gear-updated-poster-live.png: framing/materials match before and after entry.
Before opening 3D, the poster was loaded with no canvas and no GLB/Three/scene/model
requests. Opening requested only r7.glb, 28-135.glb and adapter.glb and removed the
poster. This preserves opt-in loading; it does not establish photorealism.

### 28–135 front recess finish

Compared the current preview with 28-135-front.jpg. Retained the grey base and
annular cuts, but changed the machined-baffle finish from roughness .57 to .72,
normal strength .18 to .30 and specular IOR level .30. This subdues its broad
glare while preserving grooves and the separate glass reflection. These are
visual finish estimates, not measured Canon material data. Verified actual
viewer /tmp/28-recess-finish-oblique.png and /tmp/28-recess-finish-front.png.
Regenerated/optimized the lens, its thumbnail and the default setup poster.
Glass and overall model realism remain incomplete.

### 40D mirror-box lining

Added a dark chamber lining and rectangular aperture carrier behind the EF
mount, using the bare-body photograph in the Cameralabs 40D review
(https://www.cameralabs.com/canon_eos_40d/6/). Verified the exported model
front-on and obliquely in the local WebGL preview; refreshed its thumbnail.
The mirror still reflects the environment approximation and is not realistic
local mirror-box optics.

Confirmed the owned 70–200 f/4 export has no collar, locking knob, stem or
tripod foot in /tmp/f4-no-bracket-check.png. The collar remains f/2.8-only.

### f/4 retaining face and internal baffle finish

Compared output/gear-reference/70-200-f4-front.jpg with the actual viewer.
Added two opposing recessed tool slots and five fine concentric face lines
to the front retaining annulus. Switched the three internal baffles from
Deep black to Optical barrel flocking to reduce metallic-looking highlights.
The fine face lines are shallow dark geometry, not physically cut grooves.
Rebuilt and meshopt/WebP optimized the f/4 GLB and refreshed its thumbnail.
Verified /tmp/f4-retainer-oblique.png and /tmp/f4-retainer-front.png in the
interactive R7/f4 setup. The bright inner optical outline remains inaccurate;
this change does not establish photorealistic glass or overall completion.

### Optical face normals

Isolated inner and outer glass in the local preview (/tmp/f4-no-inner.png and
/tmp/f4-no-outer.png). The internal bright elliptical outline came from glass
shading. optical_element shared smooth normals across the curved polished
faces and cylindrical cut edges. Corrected rear-face winding and split normals
at the face/edge boundary with a 45-degree Edge Split modifier.
Rebuilt/optimized only the f/4 asset for this check; other exported assets have
not yet received this shared-generator change. Verified the actual viewer at
/tmp/f4-optical-normals-oblique.png and /tmp/f4-optical-normals-front.png: the
false bright inner outline is removed. The outer transmission and coating
reflection remain approximations, and overall optics are still not realistic.
Refreshed the f/4 thumbnail and removed temporary preview isolation controls.

### Optical normal correction: 28–135 and 50mm

Rebuilt and meshopt/WebP optimized 28-135.glb and 50.glb with the polished-face
edge normal split verified on the f/4. Inspected both in the interactive viewer
from front and oblique angles: /tmp/28-optical-normals-{front,oblique}.png and
/tmp/50-optical-normals-{front,oblique}.png. Updated both selector thumbnails
and the default R7/28–135 poster from the current native WebGL scene.
The 28–135 still has an overly funnel-like recess; glass reflections remain
approximate. These checks prove the exports render, not overall photorealism.

### 28–135 recessed shoulder profile

Compared the front assembly against output/gear-reference/28-135-front.jpg.
The photograph shows seven outer grooves and an ungrooved shoulder near the
central bore. Replaced the straight conical profile with a curve that flattens
toward the inner edge and restricted the grooves to the outer 70 percent of
the radial span. Preserved both radial endpoints and total recess depth;
intermediate depth remains a visual estimate from the photograph.
Rebuilt/optimized the GLB and refreshed the thumbnail/default setup poster.
Verified /tmp/28-shoulder-front.png and /tmp/28-shoulder-oblique.png in the actual
viewer. The flatter inner band is present, but the glass and overall appearance
still fall short of the reference.

### R7 eyecup shoulder taper

Compared output/gear-reference/r7-rear.webp with /tmp/r7-rear-review.png.
The rubber eyecup in the reference narrows toward its upper shoulders, while
the model had parallel sides. Applied a gradual 10 percent upper-width taper
to the rubber cup only; retained the separate carrier, optical window and eye
sensor positions. This amount is an estimate from the product photograph.
Rebuilt/optimized R7 and inspected /tmp/r7-eyecup-taper-rear.png and
/tmp/r7-eyecup-taper-oblique.png in the interactive viewer. No exposed gap or
carrier protrusion was visible at those angles. Refreshed the R7 thumbnail and
default setup poster. Body materials and overall realism remain incomplete.

### R7 terminal finger-access pockets

Inspected r7-terminals.webp and the actual side view. Blender ray checks at
MIC, remote, HDMI, USB and headphone centers hit Focus rubber above the shell
(/tmp/r7-port-surfaces.log), ruling out buried faces at those sampled points.
Added three shaped dark pocket floors outside the MIC, remote and headphone
flap edges, below the flap faces and above the leatherette. These are shallow
layered recess representations, not through-cut cavities. Applied the same
subdivision and fitted side profile as the covers.
Rebuilt/optimized R7 and verified /tmp/r7-port-recess-side.png and
/tmp/r7-port-recess-oblique.png. Pocket silhouettes are visible; depth remains
subtle under the current lighting. Refreshed R7 thumbnail/default poster.
Overall material and body fidelity remain incomplete.

### R7 grip grain scale

Compared the R7 grip and rear thumb pad with r7-terminals.webp/r7-rear.webp.
Changed the R7 scanned-rubber texture repeat from 1.25 to 0.9 in models.ts,
keeping normal and roughness maps aligned. The initial 0.65 experiment made
the rear grain too large and was rejected. Other bodies retain 1.25.
Verified the final front/rear viewer captures /tmp/r7-grain-final-front.png and
/tmp/r7-grain-final-rear.png, then refreshed the R7 thumbnail/default poster.
TypeScript check and production build passed (/tmp/r7-grain-scale-build.log).
This changes texture sampling only, with no added geometry, textures or render
passes. Grain scale is visually estimated; overall realism remains incomplete.

### 40D rear dial center

Compared the rear dial in 40d.jpg with /tmp/40d-wheel-before.png. Replaced two
flat annuli around SET with one smooth concave surface, matching the continuous
molded dish in the reference. Retained the grip ring, SET socket and button.
The curvature depth is visually estimated. Rebuilt/optimized the 40D GLB and
verified /tmp/40d-wheel-bowl-rear.png and /tmp/40d-wheel-bowl-oblique.png: the
false circular step is gone, with no visible gap at the button or outer ring.
Refreshed the 40D thumbnail. Overall photorealism remains incomplete.

### 40D flash seating clearance investigation

The flash-pocket cutter previously expanded to 125 percent width at every
height. Narrowed its lower seating region to 100.8 percent, blending to the
existing upper clearance above y=.95. This retains the upper crown trimming
while reducing excess removal beneath the cover. Rebuilt/optimized 40D and
refreshed its thumbnail.
Verified /tmp/40d-flash-seat-oblique.png and /tmp/40d-flash-seat-side.png. The
detached-looking silhouette remains: the cover profile is still too slab-like
compared with 40d.jpg. This fit change does not resolve that visual defect;
a reference-based cover-profile revision remains necessary.

### 40D flash-cover underside profile

Compared the side contour in 40d.jpg and top shape in 40d-top.jpg with the
previous straight lower edge. Added a smooth .065 scene-unit relief through
the middle of the cover underside, preserving front/rear endpoints and badge
position. This depth is an estimate from the photographs.
Rebuilt/optimized 40D and inspected /tmp/40d-flash-profile-side.png and
/tmp/40d-flash-profile-front-oblique.png. The lower side contour is curved
instead of straight; the front badge remains fitted. The cover still appears
too separate from the body obliquely, so the housing fit remains unresolved.
Refreshed the 40D thumbnail; overall photorealism remains incomplete.

### 40D projecting prism casting

The shell was a flat extrusion ending at z=.28 beneath a cover reaching z=.555.
The side reference shows a projecting prism housing beneath that cover. Added
a gradual forward extension of up to .20 to the upper central casting before
grip fusion/remeshing and flash-seat subtraction. The extension fades into
the shoulders and leaves the rear plane fixed. Its depth is photo-estimated.
Rebuilt/optimized 40D and verified /tmp/40d-prism-casting-side.png against the
previous /tmp/40d-flash-profile-side.png: the casting now supports the forward
cover instead of ending behind it. Inspected front, front-oblique and rear
captures too (/tmp/40d-prism-casting-{face,front,rear}.png). Mount, badge and
rear controls remain fitted. Front shoulder shading still needs refinement;
this does not establish overall photorealism. Refreshed the 40D thumbnail.

### 40D shoulder deformation sampling

The projecting casting was initially deformed with large front-face polygons,
so its transition was interpolated mostly from boundary vertices. Triangulated
and subdivided long edges before deformation (target .06 scene units, at most
six passes), followed by the existing fusion/remesh/reduction pipeline.
Rebuilt/optimized 40D and inspected /tmp/40d-shoulder-sampling-face.png against
/tmp/40d-prism-casting-face.png: the broad shoulder band is reduced. Checked
/tmp/40d-shoulder-sampling-side.png for the supported brow contour and refreshed
the thumbnail. This improves deformation sampling, not overall photorealism.

### 40D terminal symbols

Compared the terminal covers with the side view in 40d.jpg. Replaced the
vertical three-line USB approximation with a horizontal trident, including
arrow, round and square endpoints. Replaced the generic remote outline with
the release plug/cable/socket mark. Both follow the existing cover projection.
Rebuilt/optimized 40D and verified /tmp/40d-terminal-icons-side.png and
/tmp/40d-terminal-icons-oblique.png; refreshed the thumbnail. These are small
molded marks with low contrast, as in the reference. Overall realism remains
incomplete.

### 40D complete mode dial

Verified Canon EOS40D_HG_EN.pdf p.20 (https://gdlp01.c-wss.com/gds/6/0900008236/01/EOS40D_HG_EN.pdf), rendered locally at /tmp/40d-manual-dial.png.
Replaced the nine-label placeholder with all 15 positions in manual order:
Full Auto, P, Tv, Av, M, A-DEP, C1–C3 and Portrait, Landscape, Close-up, Sports,
Night Portrait, Flash Off. Added a green Full Auto outline, inverted custom
mode badges and individually drawn scene symbols. Symbol silhouettes are
approximations of Canon's pictograms, not extracted artwork.
Rebuilt/optimized 40D; checked /tmp/40d-mode-dial-top.png and
/tmp/40d-mode-dial-detail.png in the interactive viewer. Marks remain separate
and visible after export. Refreshed the thumbnail. Top display/materials and
overall photorealism remain incomplete.


### 2026-09-23 — 40D top function pictograms, classic route
Compared the existing 40d-top.jpg reference with the actual /classic viewer.
Replaced the incorrect LIGHT legend with an illumination pictogram; added the
metering symbol beside WB and flash-compensation symbol beside ISO. Each stroke
is projected onto the shoulder surface so the markings follow the casting.
Rebuilt in Blender and optimized the exported GLB from 22.82 MB to 3.51 MB.
Verified the exported symbols in the actual interactive viewer from above,
including a zoomed view. Small text is still faint at normal viewing distance;
this does not establish overall photorealism.

Finish investigation: in the isolated 40D preview, removing AO did not remove
the broad top highlight bands. Replacing Graphite polymer's roughness map with
its matching .52 scalar also retained them. Setting all roughness to 1 masked
the highlights, which is not evidence of a texture fix. Geometry and environment
reflection contributions remain to be separated. No finish change was retained.


### 2026-09-23 — 40D casting normals and rubber grain
A texture-free MeshNormalMaterial view showed shoulder ripples in both the raw
and meshopt-compressed GLB. Increased only the 40D casting's pre-decimation
relaxation from 4 to 12 iterations. The subsequent display/control cuts preserve
their edges. Normals comparison showed reduced ripples; no claim that all uneven
highlights are resolved. Rebuilt and optimized body: 3,477,472 bytes.
Compared front, side, rear, and top views in /classic's actual interactive viewer.
Grip, terminal covers, display recess, and rear cover still fit the casting.
The 40D scanned rubber now uses .9 texture repeats and .65 normal strength
multiplier, matching the existing R7 treatment. The reference 40d.jpg shows
pronounced grip and rear-thumb grain; the prior 1.25/.35 treatment became almost
smooth at viewing distance. Verified clearer rear grain and the front grip in
the viewer. Other body and lens material settings are unchanged.


### 2026-09-23 — 28–135 front ring finish; rejected optical changes
Compared 28-135-front.jpg with front and oblique views in the actual /classic
viewer. The printed front ring was too smooth: gave this part a dedicated
fine-grained matte polymer (.66 roughness, .18 pebble normal strength), leaving
other black barrel parts unchanged. Rebuilt/optimized lens: about 1.69 MB.
Refreshed and inspected 28-135 and 40D thumbnail PNGs plus the default R7 setup
poster (984×630), using the current classic model loader and scene for the poster.
Production build passed before the static preview refresh.

Tested internal envMapIntensity .35 against original 1.2. It reduced bright
central reflections head-on but made the bore look more hollow at the default
oblique angle; rejected. Also rejected outer specularIntensity .35, which shifted
the front coating to amber. Both optical settings were restored. This leaves the
optics incomplete: investigate refraction and multi-surface visibility rather
than further intensity-only adjustments. The separate thumbnail preview uses
RoomEnvironment, so its reflections are not evidence for the actual studio.


### 2026-09-23 — zoom thickness matches exported geometry
Inspected Three's transmission pass: its capture includes opaque objects, not
our later transparent internal reflection meshes. An isolated prototype in
output/gear-modeling/optical-study.html captures these before outer refraction
(?refract enables the extra pass). Front/oblique comparison showed only a modest
placement difference; it was not integrated into the site and needs substantially
stronger visual/performance justification before adoption.

Corrected the 28–135 outer element's volume thickness independently. Its authored
meniscus is .040 units thick at the center and .075 at the edge; the old runtime
used .16 everywhere. The exported node has uniform scale .569687, which Three's
volume shader multiplies into thickness. Runtime now compensates for node scale
and samples a 64×64 radial thickness map matching the existing modeled surfaces.
These numbers describe our model, not a measured Canon optical prescription.
The map is generated once per asset load, tracked for disposal, and requires no
additional rendering pass. No optical mesh vertex positions change.

Verified front and oblique views in the actual /classic viewer, no browser shader
errors, and switching to the f/4 lens and back while selecting 40D independently.
Production build passed (/tmp/28-thickness-build.log). Refreshed and inspected the
28–135 thumbnail and default setup poster. Multi-surface optics and overall
photorealism remain incomplete; the thickness correction alone is visually subtle.

### 2026-09-23 — R7 shutter pocket follows grip casting
Compared the shutter shoulder with the existing R7 front/top photo references.
Measured the generated shell at shutter center (-1.25, .754 in X/Z): top Y
.7148503, surface normal (-.06571, .94956, .30662). The previous oval recess
intersected the casting centrally while sitting above its falling edges.

Blended a small elliptical crown region into the measured tangent plane, cut an
elliptical pocket into that casting, and placed the dark pocket floor and shutter
cap along the measured normal. The subsequent shared crown deformation still
moves all these parts together. This removes the separate raised oval pad.
Rebuilt R7 in Blender and optimized with Meshopt: 28.69 MB raw to about 4.48 MB.

Verified the default oblique, top, front, and grip-side views in the actual
/classic viewer (50mm lens for less occlusion on the latter views). Refreshed and
inspected the body thumbnail and 984×630 setup poster. Uneven broader housing
highlights and incomplete lens optics remain visible; this is a fit correction,
not a photorealism sign-off. Changes remain local and unpushed.

### 2026-09-23 — R7 fused casting relaxation
Extended the existing 40D casting relaxation to R7: 12 smoothing iterations
instead of 4, before decimation and before control pockets are cut. Compared
front and default oblique views before/after in /classic, then inspected the
grip side and rear for displaced controls. Small shoulder highlight irregularities
are reduced modestly; broad side bands remain, so further smoothing is not a
complete solution. No browser errors recorded. Refreshed thumbnail and setup
poster. Optimized asset is 4.39 MB (previously about 4.48 MB); no runtime rendering
passes added. Build and optimization logs: /tmp/r7-shoulder-smooth.log and
/tmp/r7-shoulder-smooth-opt.log. Photorealism remains incomplete.

### 2026-09-23 — separate finish streaks from shadow acne
An isolated side-view study (output/gear-modeling/body-surface-study.html) compared
mesh normals, uniform material, no AO, no normal texture, and no roughness texture.
Broad finish variation persisted without AO or normals but disappeared with
constant roughness. Repeating the painted-metal roughness map at the normal map's
6× density retained grain while removing the broad variation. Applied this to
R7/40D painted metal only; scanned rubber keeps its existing mapping.

Actual /classic verification exposed a separate diagonal pattern on the R7 side
that the shadowless study did not reproduce. Raising spotlight normalBias from
.008 to .025 removed those self-shadow stripes without increasing shadow-map
resolution or adding passes. Inspected R7 side, 40D front/oblique and available
C200 setup for detached contact shadows; no obvious new separation at those
views. Updated owned-body thumbnails and setup poster. These fixes improve
surface rendering but do not settle remaining contour and optical fidelity.
Production build passed (/tmp/casting-final-build.log); git diff --check passed.

### 2026-09-23 — 50mm front recess finish and grooves
Rechecked the 40D/50mm mount after the insertion animation settled. The earlier
wide silver annulus was an in-motion capture, not a settled mounting defect;
mount dimensions and placement are unchanged. Future selection screenshots must
be checked after insertion finishes.

Compared local 50ii.jpg (source above) with settled front/oblique viewer views.
Warm optical reflections also occur in the reference; did not change coating
color based only on their presence. Added three shallow concentric tooling grooves
to the outer portion of the existing continuous recessed cone. Eleven radial
rows describe their edges directly instead of a dense uniform grid. Replaced
near-black flocking on this visible front cone with the existing fine matte
baffle finish, so its contour is readable under studio light. Internal glass
and the rest of the barrel are unchanged.

Built in Blender, optimized to 680.57 KB, checked front/oblique in /classic on
40D and R7, and refreshed the 50mm thumbnail. No browser errors. Logs:
/tmp/50-front-grooves.log and /tmp/50-front-grooves-opt.log. Photorealistic optics
and overall model fidelity remain unfinished; this does not change that status.

### 2026-09-23 — 50mm front-element profile and glass materials
Canon's optical section (https://global.canon/en/c-museum/product/ef295.html,
https://global.canon/ja/c-museum/wp-content/uploads/2015/05/ef295-lens-construction.gif)
shows a strongly convex first surface with a nearly planar rear. The previous
symmetric .022 sag was too shallow. Matched the diagram's approximate visible
sag/radius ratio using radius .278, sag .079, edge thickness .006 and planar back.
This is a diagram-derived approximation, not a measured optical prescription.

Separated rear glass from the front material. Internal reflection layers now use
dielectric coating reflections rather than the older orange metallic treatment.
Extended the existing generated thickness map to 50mm: .085 modeled center and
.006 edge thickness, with exported node-scale compensation. No additional pass;
one 64×64 map allocated once when loading this lens and tracked for disposal.

Verified front/oblique on R7 and oblique on 40D after insertion settled. A broad
bright internal reflection remains. Trialing matte iris-seat material did not
remove it, so that trial was reverted. Rebuilt/optimized model: 682.28 KB; refreshed
thumbnail. Production build passed (/tmp/50-optics-build.log); browser logged no
errors during the checks. This corrects the modeled profile/material assumptions
without claiming the unresolved multi-surface optics are photorealistic.

### 2026-09-23 — 50mm missing optical-chamber lining
A four-panel diagnostic (output/gear-modeling/glass-layers.html) independently
hid inner glass, outer glass, and all glass. The broad gray crescent remained
with all glass hidden, proving it was exposed barrel geometry rather than an
optical reflection. Added a dark cylindrical lining behind the front-element
retainer, from Z .151 to .531, inner radius .279. It masks sightlines onto the
outer barrel's unlined interior while leaving the glass and diaphragm visible.

Repeated diagnostic and actual /classic front/oblique/grazing-angle checks on R7,
plus settled 40D/50mm view. The false gray crescent is removed. Glass reflections
remain an approximation rather than full multi-surface refraction. No browser
errors. Rebuilt/optimized asset is 702.94 KB; refreshed thumbnail. Logs:
/tmp/50-chamber.log and /tmp/50-chamber-opt.log. No rendering passes added.

### 2026-09-23 — zoom retaining faces and rejected coating variation
Repeated glass-layer isolation for 28–135. Unlike the 50mm, it already has a
continuous dark lining. Compared retaining faces with 28-135-front.jpg: the
model's broad metallic annuli read as stacked washers. Split each retaining
ring into a dark seat and a narrow reflective inner edge. Kept their existing
positions and aperture radii. Rebuilt/optimized model: about 1.78 MB.

An isolated four-way coating study compared 125, 250, 350 and 450 nm settings.
A 440–460 nm production trial was greener obliquely but pink head-on in the
actual studio; rejected it and restored the existing 110–125 range. Do not
claim measured coating parameters or a solved optical simulation from this test.

Verified final front view with restored coating, oblique retaining-ring trial,
and no browser errors in /classic. Refreshed thumbnail and default setup poster.
Build logs: /tmp/28-retainer-finish.log and /tmp/28-retainer-finish-opt.log.
Remaining work includes multi-surface reflections/refraction and body fidelity.

### 2026-09-23 — owned f/4 switch-panel typography
Compared the actual side/overhead viewer with 70-200-f4-side.jpg. Replaced generic
single-line limiter and AF/MF layouts with the reference's stacked limiter and
staggered AF/MF labels. Added the two position ticks above each slider and small
lower panel screw, all transformed through the existing curved panel mapping.
Stabilizer and mode titles have separate position labels. Collar/foot remain
absent on the owned f/4.

Verified close side and overhead views, no browser errors. Labels remain tiny at
default viewing distance; do not claim complete readability. The distance window
still has generic markings and requires a separate reference pass. Rebuilt and
optimized f/4 model to about 1.96 MB, refreshed thumbnail. Logs:
/tmp/f4-control-legends.log and /tmp/f4-control-legends-opt.log.

### 2026-09-23 — original f/4 IS distance window
Sources: Canon manual ENG-10, downloaded from
https://gdlp01.c-wss.com/gds/2/0300003622/02/ef70-200f4lisusm-im3-eng.pdf;
top product photo https://www.kenrockwell.com/canon/lenses/images/70-200mm-f4-is/KEN_3055-1200.jpg
(local 70-200-f4-top.jpg).

Enlarged the f/4 window from .42×.19 to .64×.31 model units to match its relative
barrel proportions. Replaced generic single-row numbers with green 10/15/30 feet
above white 3/5/10 metres, separate ft/m units, infinity symbol and compensation
L, a distance index, and red 100/70 infrared indexes. Added adjacent focal-range
and USM markings. All follow the same cylindrical mapping as the window.

Verified final overhead close-up in /classic: scale rows and index marks visible,
window stays on the curved barrel. Glare and small default display size still
limit legibility. Rebuilt/optimized model about 1.98 MB and refreshed thumbnail.
Logs: /tmp/f4-distance-window.log and /tmp/f4-distance-window-opt.log.

### 2026-09-24 — f/4 scale window seated in barrel
Cut a curved shallow pocket into the main white housing and lowered the existing
window/frame/scale by .026 model units. Adjacent focal-range/USM ink remains on
the painted barrel. Verified overhead markings and side silhouette in /classic.

Measured generated mesh radial extents independently in Blender: barrel radius
.6693, frame max .6623, glass max .6673, numeral surfaces .6683. The frame, glass,
and numerals therefore sit below the surrounding casting, rather than merely
appearing flush from a favorable angle. Measurements logged in
/tmp/f4-pocket-measurements.log. Rebuilt and optimized model: about 2.06 MB;
refreshed thumbnail. Build/optimization logs: /tmp/f4-window-pocket.log and
/tmp/f4-window-pocket-opt.log. Photorealism and overall marking legibility remain
incomplete; this corrects the physical seating of the scale window.

### 2026-09-24 — f/4 rear barrel identification and molded ribs
The top reference shows a two-line IMAGE STABILIZER badge and shallow rear ribs
missing from the previously blank barrel. Added curved gold lettering with a
thin white contour, using a dedicated warmer badge finish instead of changing
the shared gold material. Added short white molded ribs near the rear edge,
interrupted around the smooth badge region. No collar, foot, or locking knob.

Verified top close-up and default assembled view in /classic, no browser errors.
The badge is now identifiable, though its contrast still depends on lighting;
this is not an overall photorealism approval. Refreshed thumbnail. Optimized model
about 2.16 MB; no runtime code or render-pass changes. Logs:
/tmp/f4-rear-detail.log and /tmp/f4-rear-detail-opt.log.

### 2026-09-24 — f/4 internal front sleeve reflection
The front photo (70-200-f4-front.jpg) shows dark internal hardware rather than a
broad chrome-like band. A four-panel glass-visibility study confirmed the band
persisted without glass. A second material-isolation study identified the sleeve
finish: merely switching to Machined optical baffles retained too much specular
reflection. Assigned the existing low-reflection Optical barrel flocking finish
to the f/4 sleeve only; rim/filter-thread highlights remain unchanged.

Rebuilt and meshopt/WebP optimized to 2.16 MB; refreshed the lens thumbnail.
Verified settled R7/f4 assembly in /classic from oblique and front views, with no
browser errors. The broad sleeve glare is reduced; the layered glass reflections
still look simplified and this is not a photorealism approval. No runtime render
passes or loading changes. Logs: /tmp/f4-sleeve.log and /tmp/f4-sleeve-opt.log.

### 2026-09-24 — f/4 front meniscus and first internal group
Canon's section diagram distinguishes a thin curved front meniscus from the
more strongly curved first internal group:
https://global.canon/en/c-museum/product/ef391.html
https://global.canon/ja/c-museum/wp-content/uploads/2015/05/ef391-lens-construction2.gif
Saved reference: output/gear-reference/f4-optics.gif.

Replaced the symmetric front element with independently curved faces (front sag
.050, rear .030, edge thickness .030; center .050), preserving its front apex.
The first internal element now has front sag .065, rear -.030 and edge .015,
instead of the nearly planar symmetric .021 profile. These are visual estimates
from the diagram, not measured optical prescriptions. Added the f/4 to the
existing scale-compensated thickness-map path, matching .050 center/.030 edge.
No additional render pass; one 64-square RGBA thickness texture.

Built successfully (15 pages, /tmp/f4-meniscus-build.log), rebuilt and optimized
GLB to 2.16 MB, refreshed thumbnail. Verified R7 front view and 40D oblique
assembly in /classic, no browser errors. Geometry now follows the reference more
closely, but brown internal reflections persist: the layered-glass approximation
still requires work and photorealism is not achieved. Build/model logs:
/tmp/f4-meniscus.log and /tmp/f4-meniscus-opt.log.

### 2026-09-24 — studio surround and localized optical reflections
A controlled four-panel study compared current coatings, hidden inner glass,
uncoated inner glass, and a dark studio surround. Removing the coating changed
the broad brown disc into a gray disc; darkening the surround removed the broad
fill while retaining localized coating highlights. The uniform studio background
was the source of much of the flat colored appearance, not only glass geometry.
Helper: output/gear-modeling/inner-study.{html,ts} (ignored diagnostic).

Changed the classic studio background from linear RGB .16/.16/.18 to .025 neutral.
A .005 trial lost too much body fill. Added a low reflection card at (3,-2,5),
2 by 3, strength 2, so the default angle still shows the glass instead of an
empty black bore. The card is baked into the existing PMREM once at setup; no
new per-frame render pass, light, external texture download, or map resolution.

Verified R7/f4 front and oblique; 40D/f4, 28-135, 50 and Tamron35; C200/f2.8 in
the actual /classic viewer. No browser errors. The broad colored wash is reduced
and body contours remain visible. Highlight edges and multilayer optics are
still approximate, so overall photorealism remains incomplete. Refreshed default
R7/28 poster with the same lighting. Build log: /tmp/gear-dark-studio-build.log.

### 2026-09-24 — preserve polished optical normals through compression
A four-panel comparison held geometry/materials/light positions constant and
varied normal precision and PMREM resolution (256/512). Higher normal precision
removed the ragged highlight edge; 512 PMREM alone barely helped. Inspection of
GLB accessors confirmed signed 8-bit normals. glTF Transform 4.5's high meshopt
preset hard-codes 8-bit octahedral normal filtering, independent of the nominal
normal quantization setting. Full-model medium/14-bit output fixed it but grew
the f/4 from 2.16 to 3.05 MB.

The generator now exports _OPTICAL_NORMAL for polished optical materials only.
Custom attributes survive the high compression preset as float vectors. The
classic loader promotes that attribute to normal and removes the custom semantic
before rendering; no additional shader attribute or draw pass. Other materials
retain compact normals. The glass-only version visually matches the full-precision
comparison while the f/4 grows only to 2.28 MB. Keep export_attributes=True and
this custom attribute in subsequent rebuilds; do not strip it during optimization.

Rebuilt/optimized all owned lenses: 28-135 about 1.87 MB, f/4 2.28 MB, 50 about
786.78 KB, Tamron35 about 1.25 MB. The Tamron rebuild also picks up the earlier
shared optical face-winding/edge-separation corrections. C200/f2.8 not rebuilt.
Refreshed all four thumbnails and default poster. Verified R7 f/4 front/oblique,
all owned selectors/lenses, and 40D/Tamron assembly in /classic; no browser errors.
Build passed (15 pages, /tmp/optical-normals-build.log). Studies and build logs:
output/gear-modeling/precision-study.{html,ts}; /tmp/f4-optical-normals.log;
/tmp/owned-optical-normals.log; /tmp/{lens}-optical-normals-opt.log.

This fixes compressed reflection edges, not the remaining accuracy of multilayer
optics, body proportions, or all markings. Photorealism goal remains incomplete.

### 2026-09-24 — R7 rear dial face and LCD proportions
Compared the actual near-level rear view against r7-rear.webp. The wheel's
existing axial knurl was largely hidden by the surrounding lip; the real dial
has ridges across its rear-facing annulus. Added 64 shallow beveled radial lands
from radius .157 to .200 on the exposed face, merged with the existing rubber
material. Verified the textured annulus around the joystick from rear/oblique.

The level view also exposed an overly short LCD and excessive gap below the
finder. Increased R7 bezel height from 1.12 to 1.25 and moved its center from
-.240 to -.175, holding its lower edge at -.800 before body deformation. The
cover opening, glass and gasket follow those dimensions. Extended both hinge
sections to .595 and centers to +/-.3125, preserving their bottom alignment and
central gap. The resulting top edge now sits just below the eyepiece like the
reference. 40D dimensions remain separate and unchanged.

Rebuilt/optimized R7; verified rear, rear oblique and assembled front in /classic
with no browser errors. Refreshed R7 thumbnail and default poster. Modeling logs:
/tmp/r7-rear-dial.log and /tmp/r7-rear-display.log; final optimization log:
/tmp/r7-rear-display-opt.log. These correct two reference mismatches; full body
and equipment photorealism has not yet been demonstrated.

### 2026-09-24 — R7 SD-card door and rear rubber boundary
Canon's side/rear reference identifies the grip-side card door:
https://personal.canon.jp/product/camera/eos/r7/feature/face-design
Saved official right view as output/gear-reference/r7-right-canon.jpg. Compared
with the existing rear photo, it also shows a visible door strip outside the
rear thumb rubber. The model had neither a distinct side door nor that separation.

Added a thin shaped door skin, perimeter seam and small ribbed finger grip. All
side vertices are projected onto the actual casting with small surface offsets;
triangles sample the curvature and projected meshes discard stale planar weighted
normals. Narrowed the outside edge of the rear rubber and added a three-sided rear
door boundary projected onto the rear cover. Geometry remains merged by material.

Rebuilt/optimized R7 to 4.51 MB. Verified final rear and grip-side views in /classic,
no browser errors; refreshed body thumbnail and default poster. Logs:
/tmp/r7-card-door.log and /tmp/r7-card-door-opt.log. The overall photorealism goal
remains open. The grip-side strap eye is not yet visibly correct in the side view.

Also located Canon's official SVG wordmark in that page's header and saved it to
output/gear-reference/canon-wordmark.svg for comparison. A subsequent source audit confirmed the existing Canon text
already uses canon-contours.json, derived from the previously attributed vector
wordmark; the Georgia fallback only applies to other text such as the single C.

### 2026-09-24 — R7 grip-side strap eye
The grip-side fitting still used a small circular ring at fixed x=-1.42. That
position was buried inside the widened casting, explaining its absence in the
side view. Canon's official right-side reference shows a horizontal oval fitting
above the SD door (r7-right-canon.jpg).

Generalized the existing R7 port-side oval fitting to both shoulders: ray-cast
from the appropriate side, align the seat and open metal aperture to the surface
normal, and orient its long axis along the body depth. The 40D path is unchanged.
Verified grip-side and raised rear-oblique views in /classic, plus the opposite
side for regressions; the eye is visible and seated, no browser errors. Updated
body thumbnail/default poster. Logs: /tmp/r7-strap-eye.log and
/tmp/r7-strap-eye-opt.log. Photorealism remains unproven overall.

### 2026-09-24 — Rear ink orientation and R7 magnifier
Added the blue magnifier ring/handle below the R7 AF-point button, projected onto
the rear cover using the existing Canon rear reference. Lowered the adjacent SD
door top edge to leave the reference's clear strip below the control. A raw-GLB
check showed every icon vertex clears the cover by approximately .002 units, yet
parts vanished in the viewer: global closed-volume normal recalculation was
flipping disconnected ink quads. Preserved rear_ink face orientation through
export; all 132 sampled magnifier vertices now have outward -Z normals (previously
56 pointed inward). The temporary shadow experiment did not help and was reverted.

Rebuilt/optimized R7 (4.47 MB) and 40D (3.48 MB), since both use rear_ink. Verified
the complete R7 icon at close zoom and 40D rear legends in the actual /classic
viewer, with no browser errors. Refreshed both thumbnails and default poster.
Logs: /tmp/rear-ink-orientation.log, /tmp/r7-rear-ink-opt.log,
/tmp/40d-rear-ink-opt.log. This is a local correction, not a photorealism sign-off.

### 2026-09-24 — Tamron 35mm coated glass and chamber
Compared output/gear-reference/35-front.webp with the actual viewer and consulted
Tamron's F045 description of BBAR-G2 anti-reflection coating:
https://www.tamron.com/jp/consumer/lenses/f045/
The runtime still treated this lens's inner optics as orange metal. Included 35
in the dielectric coating path already used by the other owned lenses, at .35
reflection opacity. This is an artistic thin-film approximation, not measured
BBAR-G2 parameters. Front inspection then exposed a bright internal barrel/iris
housing; changed those two internal surfaces to existing Optical barrel flocking.
The front-view broad silver band is now dark while glass reflections remain.

Rebuilt/optimized 35 to 1.26 MB; refreshed its thumbnail. Verified R7 front and
side plus 40D front-oblique setup in /classic, no browser errors. Runtime build
passed (15 pages, 26.28s); subsequent chamber-only GLB change checked in viewer.
Logs: /tmp/tamron-coating-build.log, /tmp/tamron-chamber.log,
/tmp/tamron-chamber-opt.log. Overall photorealism remains incomplete; the modeled
optical group shapes and multilayer reflections still need closer matching.

### 2026-09-24 — Tamron front optical curvature
Inspected Tamron's official F045 optical construction diagram:
https://www.tamron.com/product/pc_file/file/f045_lens-construction_jp.svg
linked by https://www.tamron.com/jp/consumer/lenses/f045/spec.html.
The first elements curve toward the object side; the model's shallow symmetric
biconvex placeholders produced broad flat reflections. Replaced the front with a
meniscus (radius .513, front sag .120, back sag .115, edge thickness .025) and the
next visible inner profile with front sag .095, back sag .140, edge .070. These
are visual estimates from the diagram, not an optical prescription or a complete
14-element simulation. Added 35 to the scale-compensated radial thickness map,
matching front center .030 and edge .025 to the actual generated geometry.

Verified R7 front-oblique/head-on and 40D front-oblique in /classic: localized
reflections replace the former broad flat disc, rim clearance remains visible,
and console errors are absent. Updated thumbnail. GLB 1.27 MB; no extra render
passes. Build passed: 15 pages in 23.58s. Logs /tmp/tamron-meniscus{,-opt,-build}.log.
Overall photorealism remains unproven; body surface accuracy and other lens
optical details still require further work.

### 2026-09-24 — Body rubber grain scale
Compared R7 rear/side at normal viewing size with r7.jpg and r7-rear.webp. The
rubber read as coarse cracked leather rather than fine camera overmold. Increased
existing scanned rubber texture repeat .9→1.6 for both owned bodies and reduced
normal multiplier .65→.4; roughness and normal maps retain matching repeats.
No added texture downloads, geometry, or render passes. Checked same-angle R7
rear before/after, R7 side and 40D rear in actual viewer; no console errors.
Refreshed both thumbnails and default poster. Build log /tmp/body-grain-build.log.
This improves surface scale but does not establish overall photorealism. Side
inspection still shows uneven highlights on the R7 upper casting; investigate
its mesh/normals before further finish tuning.

### 2026-09-24 — R7 shoulder diagnosis and pocket edge normals
Compared compressed and uncompressed R7 in an untextured diagnostic view. Both
show the shoulder unevenness, ruling out grain maps and meshopt quantization as
the main cause. Increasing pre-decimation smoothing 12→40 iterations made only a
small difference and was reverted. Added a 60-degree edge split to the R7 casting
after Boolean pockets and final deformation, preventing steep pocket walls from
sharing averaged normals with the exterior. The shutter pocket edge is cleaner;
the broad grip/shoulder transition remains imperfect and needs geometric work.

Rebuilt/optimized R7 (4.47 MB). Verified side and front-oblique views with actual
materials in /classic, controls remain seated, no console errors. Refreshed R7
thumbnail/default poster. Diagnostic helpers are ignored output files. Logs:
/tmp/r7-casting-smooth.log (reverted experiment), /tmp/r7-pocket-normals.log,
/tmp/r7-pocket-normals-opt.log. Do not treat this small shading improvement as a
photorealism sign-off or complete repair of the shoulder contour.

### 2026-09-24 — Correct grip solid orientation before merging
The loft_grip helper advanced XZ rings along +Y with inward face winding. A
standalone Blender test of the actual helper produced signed volume -4.830147;
after reversing the generated faces before subdivision it produces +4.830147.
Final export's normal repair was too late for the preceding body remesh. Fixed
this shared helper and rebuilt both owned bodies. Viewer comparison shows the
R7 shoulder distortion persists, so this fixes a real construction defect but
does not establish its cause as the main visible distortion. Next work should
reshape the grip/shoulder join, not keep increasing global smoothing.

R7 optimized 4.61 MB, 40D 3.44 MB. Verified both grip-side views and R7 rear in the
actual viewer; no console errors, attached controls remain seated. Updated body
thumbnails/default poster. Logs /tmp/body-grip-winding.log,
/tmp/r7-grip-winding-opt.log, /tmp/40d-grip-winding-opt.log. Diagnostic
/tmp/check-grip-winding.py. Overall photorealism remains incomplete.

### 2026-09-24 — Local R7 shoulder blend
Canon's right-side reference shows a continuous upper grip shoulder. Added a
localized smooth blend before decimation, restricted with a smooth weight around
x=-1.16/z=.25 and y>.28, to reduce the pinched grip/casting union. This leaves the
lower grip and opposite shoulder unaffected; attachment ray casts run afterward.
The initial build failed when removing a stale Blender vertex-group handle;
resolved by looking the group up by name after modifier application. Final build
succeeded. Verified side close-up, front-oblique and rear in /classic: less pinched
join, shutter/strap/control seating preserved, no console errors. Updated R7
thumbnail/default poster. R7 optimized 4.44 MB. Logs /tmp/r7-shoulder-blend.log and
/tmp/r7-shoulder-blend-opt.log. Overall photorealism still not demonstrated.

A separate GLB inventory before this local blend found ~895k triangles in the
R7+28-135 setup (553396 + 341594). Lazy loading alone is not sufficient to settle
the performance requirement; inspect geometry contributors and reduce redundant
triangles without losing control markings, contours or polished normals.

### 2026-09-24 — 28–135 redundant tessellation reduction
Profiled individual generator objects before export (/tmp/profile-gear-geometry.py,
/tmp/profile-gear-geometry.log). Distance glass, its frame, and the switch panel
each used 31,772 triangles from uniformly subdividing every bevel edge 12 times.
Reduced those subdivisions to 6 for 28–135 only. Reduced the shallow optical
recess from 256 to 128 circular segments while preserving all 120 axial rows and
the groove profile. Optical glass meshes, precise normals, text and ribs unchanged.

Final GLB: 341,594→243,194 triangles (28.8% fewer); 1,873,804→1,551,324 bytes
(17.2% smaller). Verified close front-oblique, switch-side and raised top views in
/classic; no obvious new faceting or lost marks, no console errors. Refreshed lens
thumbnail/default poster. Logs /tmp/28-mesh-budget.log and
/tmp/28-mesh-budget-opt.log. This is geometry reduction, not an FPS benchmark;
body triangle costs and other lenses still need optimization and fidelity work.

### 2026-09-24 — Small camera-control tessellation
Small sphere-based controls used 64×32 tessellation (~3968 triangles each).
For R7/40D only and maximum local radius <=.16, use 32×16 with smooth normals.
Larger shapes, other assets, glass, printed legends and recessed seats unchanged.
Rebuilt both and checked R7 rear buttons at extreme close zoom, R7 top/shutter,
40D rear and top/shutter in /classic. No obvious silhouette/highlight regression
or lost legend detail; no console errors. Refreshed body thumbnails and poster.

R7: 549868→390444 triangles (-29.0%), 4443440→3672352 bytes (-17.4%).
40D: 388849→325681 triangles (-16.2%), 3438472→3177852 bytes (-7.6%).
Logs /tmp/body-control-budget.log, /tmp/r7-control-budget-opt.log,
/tmp/40d-control-budget-opt.log. This reduces geometry work; not a measured FPS
claim or proof that visitor-performance and photorealism goals are complete.

### 2026-09-24 — Other owned lens panel tessellation
Extended the verified 12→6 subdivision reduction to Tamron distance/switch panels
and f/4 distance/switch panels. Kept optical elements and normals, engraved/printed
markings, barrel profiles and ribs intact. F/2.8 remains unchanged. Verified each
owned lens in /classic at close switch-side and raised top angles, no obvious new
faceting or detached panel edges; no console errors. F/4 still has no collar.
Refreshed both thumbnails.

35: 244347→154107 triangles (-36.9%), 1267764→970152 bytes (-23.5%).
f/4: 373140→289092 triangles (-22.5%), 2280972→1983880 bytes (-13.0%).
Logs /tmp/owned-panel-budget.log, /tmp/35-panel-budget-opt.log,
/tmp/70-200-f4-panel-budget-opt.log. Performance reductions are measured geometry
and bytes, not FPS. Photorealism and end-to-end visitor performance remain open.

### 2026-09-24 — R7 shutter finish
Compared r7-top.png with the actual viewer; shutter looked too much like a dark
empty recess. Checked seating with a BVH ray along the button's principal short
axis: button hit distance .48857, shell/pocket floor .52729 from the same outside
origin, confirming the face is above the pocket. Removing AO in an isolated
viewer did not resolve the dim face. Replaced the R7 shutter's Anodized black
(.55 metalness) with existing Satin control plastic (nonmetal). Geometry and
seating unchanged. Top-view button face now reads distinctly from its dark pocket.

Rebuilt/optimized and verified top/default front-oblique in /classic, no console
errors; refreshed thumbnail/poster. No new material class/draw pass. Diagnostics
/tmp/check-shutter-seat.py and .log; builds /tmp/r7-shutter-finish{,-opt}.log.
This is a small material correction; overall photorealism remains incomplete.

### 2026-09-24 — Viewer lifecycle measurement
Built an ignored diagnostic page around a copy of current classic scene.ts with
one instrumentation wrapper around renderer.render. Production renderer logic and
model loader unchanged. Test files: output/gear-modeling/performance-check.html,
performance-check.ts, performance-scene.ts. Page displays resource entries,
render-call counts, and canvas count; UI actions performed through browser tools.

Observed:
- Before Start: no GLB requests, no canvas, 0 render calls.
- Ready R7/28: requests only r7, adapter, 28-135; 37 calls then 0/second idle.
- Switch 40D/f4: adds only 40d and 70-200-f4; 60 calls then 0/second.
- Return R7/28: same five request entries (cache reuse), 84 calls then idle.
- Move host off-screen: calls remain 84, 0/second.
- Show + ArrowLeft: calls advance to 85, proving interaction resumes.
- Dispose: canvas count 0, calls remain 85, no browser errors.

Source audit confirms production loadout.ts imports scene only in startStudio,
triggered by Explore or an equipment-selection click; navigation disposal calls
studio.dispose. This test verifies the scene lifecycle and selected-asset cache,
not actual production-network throttling, GPU frame time or low-end mobile FPS.
Those limits remain separate from incomplete photographic fidelity.

### 2026-09-24 — R7 front sensor details
Front-only inspection exposed a missing circular remote-control sensor on the
grip. Canon's parts list identifies it as (9), distinct from the (12) preview
button integrated with the focus-mode control:
https://cam.start.canon/en/C005/manual/html/UG-00_Before_0090.html
Diagram: https://cam.start.canon/en/C005/manual/html/screens/UG-00_i0170.svg
Compared the existing r7.jpg front photo for size and finish. Added a small dark
receiver face and rim, tangent to the actual overmold via BVH ray cast; subsequent
body deformation carries it with the grip. Replaced only the R7 AF-assist lamp's
dark LCD material with a pale frosted indicator finish matching the photo.
Rebuilt/optimized to 3.68 MB. Verified body-only front and actual /classic assembled
front-oblique/side views; receiver stays seated, no console errors. Refreshed body
thumbnail/default poster. Logs /tmp/r7-front-sensors.log and
/tmp/r7-front-sensors-opt.log. Full photographic fidelity remains incomplete.

### 2026-09-24 — R7 mount alignment stripe
Body-only front inspection prompted a mount check. Kept flange dimensions: the
apparent width alone was not sufficient evidence to justify changing its geometry.
The existing r7.jpg front reference does clearly show a short vertical red stripe
on the top of the metal flange, rather than the generic round dot above it. In
mount(rf=True), replaced the dot with a .014×.042×.002 stripe centered y=.601,
z=flange face +.001. EF/C200 paths retain their existing marks. Reference part
identification is RF lens mount index (20) in Canon's previously cited R7 manual.
Verified stripe in the exposed-front diagnostic and assembled /classic scene;
no console errors. Refreshed body thumbnail/poster. Logs /tmp/r7-mount-index.log
and /tmp/r7-mount-index-opt.log. This is one reference-detail correction, not
proof of overall photorealism or a change to the mount's physical specification.

### 2026-09-24 — Body finish hypothesis check
Compared the current R7 against a diagnostic-only 1.25x roughness factor on
Crinkle painted metal, with identical camera and lighting in body-surface-study.
The visible change was too small to establish a useful fidelity improvement.
Kept production materials unchanged. Broad shoulder contours and surface quality
remain unresolved; increasing roughness alone did not convincingly address them.
No production asset rebuild or shipment in this comparison.

### 2026-09-24 — Continuous R7 shutter-seat transition
Geometry-only browser inspection isolated a vertical surface break immediately
below the shutter. The planar seating adjustment had an abrupt y=.59 cutoff,
so adjacent vertices could receive different displacements across that boundary.
Replaced the cutoff with a smoothstep fade from y=.50 to .62, retaining the
elliptical radial fade and the button/pocket dimensions. Rebuilt and optimized
R7 (3.66 MB). The geometry-only comparison shows a smoother descending highlight;
the assembled /classic viewer confirms the shutter remains seated from the top
and front-oblique views. No browser console errors. Refreshed R7 thumbnail and
default setup poster. Logs: /tmp/r7-seat-transition.log and
/tmp/r7-seat-transition-opt.log. Body geometry and materials still require broader
reference matching; this local repair does not establish photorealism.

### 2026-09-24 — Rounded molded grip grain for owned bodies
Inspected the source Leather037 normal map: its angular intersecting creases
explain why earlier scale changes alternated between cracked leather and a
nearly featureless grip. Compared an existing rounded-pebble normal against
r7.jpg and Canon's right-side reference in body-surface-study. The rounded
pattern retains visible grain without leather creases at normal viewer size.
Created a distinct Molded grip rubber material for R7/40D (roughness .66, normal
strength 1.4, runtime .6 multiplier and 3x texture repeat). Uses the existing
512px pebble map with normalized UV density and matching roughness-map repeat.
C200 keeps its existing finish. This is a reference-guided procedural material,
not a scan of Canon rubber or a claim of measured surface properties.
Rebuilt both and checked front-oblique, grip-side and rear in /classic, including
rear thumb pads/joystick. No console errors. Optimized R7 3.44 MB, 40D 2.96 MB;
reusing the pebble map removes the owned bodies' separate leather normal texture.
Refreshed thumbnails/default poster. Production build passed (15 pages, 23.80s).
Logs: /tmp/owned-molded-grips.log, /tmp/{r7,40d}-molded-grip-opt.log,
/tmp/molded-grips-build.log. Broader geometry and optical fidelity remain open.

### 2026-09-24 — 40D depth-preview location and self-timer lamp
The four-view 40d.jpg reference clearly places the preview button on the terminal
side, below lens release. The model instead had a round button on the front grip.
Canon nomenclature identifies the control as depth-of-field preview:
https://gdlp01.c-wss.com/gds/6/0900008236/01/EOS40D_HG_EN.pdf
Removed the grip button and seated a rounded button/bezel on the side using the
casting BVH normal. Initial z=.13 placement overlapped the terminal flap in the
actual viewer; moved forward to z=.26, verified clear on the casting's rounded
front edge. y=-.46. Changed the 40D front lamp from dark display glass to the
pale frosted indicator finish seen in the photo, and named it Self-timer lamp.
Rebuilt/optimized 40D, checked default front and terminal side in /classic,
no console errors, refreshed its thumbnail. Source-only/model change; runtime
and other assets unchanged. Logs /tmp/40d-preview-control-clearance.log and
/tmp/40d-preview-control-opt.log. Full body fidelity remains unfinished.

### 2026-09-24 — 40D lens-release silhouette
Compared the terminal-side/front views in 40d.jpg. The existing generic circular
release was undersized and front-facing, unlike the tall rounded control on the
40D's front corner. Split the owned-body release branches: R7 retains its existing
control, while 40D now uses a .325x.425 bezel and rounded .280x.358 button face,
fitted to the casting's diagonal corner via BVH. Initial narrower face was
visibly too thin in side view and was widened. Verified terminal-side and
front-oblique views in /classic; control is seated and clears the terminal flap
and the depth-preview button below. No console errors. Refreshed 40D preview.
Logs /tmp/40d-lens-release-width.log and /tmp/40d-lens-release-opt.log. Dimensions
are visual estimates from reference, not manufacturing measurements. Overall
photorealism remains unfinished.

### 2026-09-24 — 40D seated shutter button
The 40d.jpg front/side reference shows a shallow shutter face in the sloping
shoulder, while the model used overlapping raised ellipsoids. Reused the R7's
continuous seating/pocket construction with 40D-specific location and circular
footprint: ray at x=-1.2,z=.389, pocket radius .120, face radius .105 and
face half-depth .013. Seat fade is relative to the sampled casting height.
R7 parameters are unchanged by the shared construction. Both body castings now
split steep pocket edges after their final Boolean operations to avoid pulling
exterior smooth normals toward pocket walls. Rebuilt/optimized 40D; front, top
and grip-side viewer checks show the button follows the shoulder, without the
old raised pedestal. No console errors. Refreshed 40D thumbnail. Logs
/tmp/40d-shutter-seat.log and /tmp/40d-shutter-seat-opt.log. Broader shoulder
contours and overall photographic fidelity remain unresolved.

### 2026-09-24 — 40D shoulder join and exposed command wheel
Compared 40d-top.jpg and the geometry-only browser study. Removed the old
Grip molding seam curve: it floated across the front of the grip, while the
overlapping rubber edge already provides the physical seam. Extended the
existing local shoulder-blend vertex weighting/smoothing to the 40D, before
control fitting and Boolean cuts. The grip-to-deck transition is less pinched.
The check exposed the old fixed-position main wheel as partly buried. Replaced
that generic dial with an axle fitted from two shoulder BVH hits at z=.16,
.12-radius rubber core, .23 width, 64 axial knurls and a narrow casting slot.
Verified final top/grip-side views in /classic; shutter/status display remain
seated, wheel now shows its knurled edge, no console errors. Refreshed thumbnail.
Logs /tmp/40d-shoulder-blend.log, /tmp/40d-command-wheel.log and
/tmp/40d-command-wheel-opt.log. Geometry estimates still require broader
reference matching; this does not establish overall photographic fidelity.

### 2026-09-24 — 40D CF door molded details
The 40d.jpg grip-side reference shows dotted finger purchase, a narrow release
area and a vertical OPEN legend missing from the model. Added eight small
rounded dots, a dark finger-slot representation and the label, projected onto
the actual side casting. Initial flat text was not visibly readable. A Blender
check showed vertices .003 outside the shell and outward normals in raw export
(/tmp/check-cf-legend.log); no claim that incorrect normals caused that failure.
Enlarged label .041 to .055 and added .002 raised relief with explicit outward
orientation. Bright diagnostic material now clearly shows complete OPEN text
in the intended direction. The actual /classic dark finish remains difficult
to read under current lighting; label readability is still unresolved. Dots and
slot are visible and seated in side/oblique views. No console errors, refreshed
40D thumbnail. Logs /tmp/40d-cf-door-relief.log and
/tmp/40d-cf-door-details-opt.log. Overall photorealism remains unfinished.

### 2026-09-24 — Correct previously skipped R7 badge fitting
Auditing exact object-name guards found that register() prefixes every object
with "r7 / ", but the badge fitting loop compared unprefixed names. It therefore
skipped the badge and both text objects. Corrected both the selection guard and
backplate depth branch using the local name after removing the body prefix.
Earlier notes describing badge projection should not be read as evidence that
the projection actually executed before this fix. Rebuilt/optimized R7 and
checked badge/text against the shoulder in front-oblique and near-side views
in /classic; no console errors. Refreshed R7 thumbnail and default setup poster.
Logs /tmp/r7-badge-name-fix.log and /tmp/r7-badge-name-fix-opt.log. Overall
photographic fidelity and other model details remain incomplete.

### 2026-09-24 — R7 low-profile lens release
The exposed-front r7.jpg reference shows a tall, low release control to the
right of the RF mount. Replaced the generic circular cylinder and deep pedestal
with a .190x.365 rounded bezel and .150x.300 button, placed just above the front
leatherette. Final body deformation retains the existing release position rule.
Verified exposed-front silhouette against the reference and front-oblique
assembly in /classic with Control Ring adapter and 28–135 attached: control is
seated, with no visible intersection against the adapter. No console errors.
Refreshed R7 thumbnail/default poster. Logs /tmp/r7-release-profile.log and
/tmp/r7-release-profile-opt.log. Further mismatch visible in the exposed-front
view: the shutter face appears nearly edge-on compared with the reference's
sloped grip crown. That requires geometry/seat-angle investigation; overall
photorealism remains unfinished.

### 2026-09-24 — R7 shutter slope and crown seating
The exposed-front check showed a nearly edge-on shutter face compared with
r7.jpg. Measured pre-seat crown normals using /tmp/check-r7-crown.py: z=.754
normal Y=.951/Z=.303 (~18 degrees from +Y); z=.800 gives Y=.710/Z=.701
(~45 degrees before final body deformation). Sampled the latter slope, expanded
button depth radius .074 to .092, pocket radius .087 to .105, and seating blend
radius .145 to .160. The first tangent-plane trial raised a peak behind the
button; rejected that placement and inset the seat by .035 along its normal.
Retained the earlier continuous height fade (.50 floor/.12 range). Final
exposed-front, actual /classic grip-side and top views show a visible front
button face, a seated pocket, and no trial peak. No console errors. Refreshed
R7 thumbnail/default poster. Logs /tmp/check-r7-crown.log,
/tmp/r7-shutter-inset.log and /tmp/r7-shutter-inset-opt.log. Angles describe
the authored mesh, not measurements of Canon's part. Overall photorealism
remains incomplete; the R7 main command wheel still appears too deeply seated
in the top-view slot and should be checked against r7-top.png.

### 2026-09-24 — R7 command wheel center-surface fitting
The top-view reference r7-top.png shows the diamond grip across the main wheel,
while the model showed a largely empty black slot. Measured the casting before
fitting: axle-end mean y=.66301, midpoint surface y=.70165; the convex crown
rises .03791 along wheel-up above the endpoint chord. Anchoring to that chord
therefore buried the wheel centrally. Kept axle direction, radius, width, diamond
mesh and slot dimensions; anchor now uses the actual midpoint surface ray hit,
then the same .097 axle offset. Final /classic top view shows the textured edge,
and side view confirms it remains seated. No console errors. Refreshed R7
thumbnail/default poster. Logs /tmp/check-r7-wheel.log, /tmp/r7-wheel-center.log,
/tmp/r7-wheel-center-opt.log. Broader geometry/material fidelity remains open.

### 2026-09-24 — Low side bounce for molded controls
An identical-camera A/B using the actual scene showed the 40D card-door OPEN
relief was present but lost in the shadow-side lighting. Added a 3x4 environment
card at (-5,0,1), intensity 2, to the existing static PMREM environment. The door
seam and dark lettering now appear in the side view without whitening their
materials. This adds no dynamic light, shadow map or per-frame rendering pass.
Checked the actual /classic R7+28–135, 40D card-door view, 40D+f4 and C200+f2.8;
no obvious new clipping or blown white lens surfaces and no console errors.
Refreshed the default poster to match. Production build passed (15 pages,
28.36s), log /tmp/gear-side-bounce-build.log. These are desktop visual checks,
not evidence of low-end frame rate or completed photorealism.

### 2026-09-24 — 28–135 internal coating reflection balance
Rechecked output/gear-reference/28-135-front.jpg: amber reflections are real,
so removing the tint would misrepresent the reference. The runtime's additive
inner layer was opacity 1 (rear .4), overwhelming the dark chamber in the
default studio view. Reduced only this lens's inner coating weights to .35
and rear .25. Retained the dielectric IOR, coating thickness/color response,
curved geometry, transmission and environment. This is a reference-guided
visual approximation, not measured Canon coating reflectance.
Compared front and oblique views in /classic and the separate RoomEnvironment
preview. The amber reflection remains, with more visible dark chamber. Checked
the 40D body switch and side view; no console errors. Regenerated 28–135
thumbnail and default poster. Build passed, /tmp/gear-zoom-coating-build.log.
No additional geometry, textures or rendering passes. Broad body-contour and
optical fidelity remain incomplete; this change alone does not prove realism.

### 2026-09-24 — 40D closed-flash hood taper
Compared the actual viewer's high front view with 40d-top.jpg and the four-view
40d.jpg reference. The hood was too parallel-sided. Increased its longitudinal
width taper from .20 to .32 (front/rear width ratio .80 to .68), keeping the rear
seat, length, crown and underside relief. The Boolean seating pocket derives
from the modified hood; updated the front seam's width factor to .68 as well.
The Canon mark remains contained in the front face without resizing. Checked
front in the exposed-body diagnostic, top/side/rear in the actual /classic
viewer, and refreshed the 40D thumbnail. No new visible intersections or console
errors. Rebuilt and Meshopt-compressed to 2.96 MB; logs
/tmp/40d-hood-taper.log and /tmp/40d-hood-taper-opt.log. The taper is visually
estimated, not a physical measurement. Rear control shapes and rubber texture
remain visibly approximate and require further reference matching.

### 2026-09-24 — 40D rear multi-controller profile
The rear view in 40d.jpg shows a distinct concentric bezel around a relatively
flat center pad. Replaced the model's two overlapping domes with a separate
annular bezel, low rubber seat and bevelled cylindrical thumb pad. Retained
the control center and socket envelope. Rebuilt and Meshopt-compressed the
40D, checked straight rear and oblique rear in the actual /classic viewer,
and refreshed its thumbnail. The bezel and pad remain distinct and seated;
no console errors. Logs /tmp/40d-joystick-profile.log and
/tmp/40d-joystick-profile-opt.log. No runtime change. The rear wheel and
rubber finish still need broader matching; this is not a complete body audit.

### 2026-09-24 — 40D SET collar and wheel center
Revisited 40d.jpg's rear wheel. The earlier continuous bowl removed a false
broad step, but also omitted the narrow raised collar immediately around SET.
Kept the continuous molded face, shortened its inner radius to .114 and
reduced its concavity from .034 to .021; added a .116/.087 radius collar,
.012 deep. These are visual estimates. Rear and oblique checks in /classic
show a distinct collar seated into the face without a visible gap. No console
errors. Rebuilt/optimized and refreshed the 40D thumbnail; logs
/tmp/40d-set-collar.log and /tmp/40d-set-collar-opt.log. No runtime or loading
changes. This supersedes the earlier implication that the smooth bowl alone
fully matched the center profile; broader realism remains incomplete.

### 2026-09-24 — Molded rubber relief correction
The rear 40D comparison still showed exaggerated grain relief. Traced the
mapping: 48 seed cells per texture, 3 repeats and UV area normalization of
1.4 scene units imply an average pitch of 55*1.4/(48*3), about .53 mm.
Kept this spacing and reduced only Molded grip rubber's runtime normal-scale
multiplier from .6 to .3 (authored strength 1.4, effective .84 to .42).
This retains the current rounded procedural grain rather than returning to
the earlier cracked leather scan. Checked front/oblique and rear R7/40D in
/classic; grain remains visible with less pronounced highlights. No console
errors. Refreshed both body thumbnails and the default poster. Build passed:
/tmp/gear-rubber-relief-build.log. Relief remains visually estimated, not a
measured surface scan. No new textures, geometry or rendering passes; overall
photorealism remains incomplete.

### 2026-09-24 — 28–135 distinct AF and stabilizer controls
Compared output/gear-reference/28-135-controls.jpg with the assembled viewer.
The curved panel was seated, but both switches still used the same generic
shape. Authored a smaller ribbed AF slider and a larger smooth IS slider,
lowered their protrusion, and added separate white position marks. Matched
the staggered AF/MF and OFF/ON text layout and added the two position ticks.
The initial label pass remained undersized; enlarged the legends after the
viewer comparison. Side/oblique close views in /classic show the distinct
sliders, legible principal legends, and retained curved panel seating. No
console errors. Rebuilt/optimized the lens and refreshed its thumbnail and
default poster. Logs /tmp/zoom-switch-legends.log and
/tmp/zoom-switch-legends-opt.log. Sizes are visually estimated. This does not
establish complete lens fidelity or readability at every zoom level.

### 2026-09-24 — 28–135 rounded zoom-grip lands
Matched the rounded ends and short center grooves in 28-135-controls.jpg.
The former thin boxes could not obtain the required end radius because cube
bevels were clamped by thickness. A capsule-plus-Boolean trial introduced
diagonal shading, including in a plain-material diagnostic; recomputing normals
did not resolve it. Replaced that trial with explicit outer/inner capsule rings,
a planar annular face, recessed groove walls and floor. Flat faces now shade
cleanly in the diagnostic and actual /classic oblique/default views. Refreshed
the lens thumbnail and default poster. No console errors. The explicit bevel
angle limit did not further reduce the export: final lens is 1.99 MB Meshopt,
up from about 1.55 MB before this detail. No new runtime passes or loading
changes. Logs /tmp/zoom-grip-topology.log and
/tmp/zoom-grip-edge-budget-opt.log. Overall realism remains incomplete.

### 2026-09-24 — Zoom-grip detail density
Reduced capsule contours from 32 to 24 samples and the .001 edge bevel from
two segments to one. Retained all 40 rounded lands and recessed center grooves.
Actual glTF inspection: rubber mesh 52,256 to 36,896 triangles; 74,460 to
44,928 vertices, crossing from u32 to u16 indices. Total compressed lens
1.99 to 1.73 MB. Close oblique and default /classic views retain clean rounded
ends and grooves, with no console errors. Refreshed lens/default previews.
Logs /tmp/zoom-grip-density.log, /tmp/zoom-grip-density-opt.log; before/after
inspection /tmp/zoom-grip-inspect.txt and /tmp/zoom-grip-density-inspect.txt.
These are asset-size/geometry measurements, not an FPS benchmark.

### 2026-09-24 — Control-ring adapter RF stripe
Compared control-ring-adapter.jpg. The RF stripe was an ellipsoid centered
at z=.075, crossing from the silver rear trim into the control ring. Replaced
it with a flat rounded .012 x .045 mark centered at z=.042, tangent to the
trim at its existing angular position. The mark now lies within the silver
trim in the isolated rear-side diagnostic and remains visible on that trim
in the actual R7 assembly's upper side view. No console errors. Rebuilt and
Meshopt-compressed adapter.glb and refreshed the default setup poster. Logs
/tmp/adapter-rf-stripe.log and /tmp/adapter-rf-stripe-opt.log. This verifies
the stripe placement, not the adapter's complete mechanical accuracy.

### 2026-09-26 — 70–200 f/4 switch-panel checkpoint
Rounded the switch recesses and sliders and enlarged/repositioned their legends
against 70-200-f4-side.jpg. Boolean cuts left large faces that formed diagonal
shading creases when bent around the barrel. Triangulated and subdivided the
panel before bending, then rebuilt its mesh normals. The prior close side
viewer check showed the crease removed. The owned lens retains no tripod
collar or foot. Exported with Meshopt compression (2,127,344 bytes) and refreshed
the lens thumbnail from the current browser renderer. Production build passed
(15 pages). This is a progress checkpoint, not a claim of complete photorealism.

### 2026-10-02 — 40D rear access-light window
The rear view in 40d.jpg shows a small amber access-light window beside the
lower-right edge of the quick-control dial, absent from the exported model.
Added a rounded dark socket and a non-emissive amber inset, seated against the
raised rubber surround. The first rear check caught the tilt mirrored relative
to the reference; corrected it to follow the dial circumference. Rechecked the
compressed model in /classic with the 28–135 attached, at rear and oblique rear
angles: the window remains visible and seated without a floating gap. Final
40d.glb is 2,982,664 bytes, 6,384 bytes larger than the prior checkpoint. No
runtime passes or loading changes. Logs: /tmp/40d-access-lamp.log and
/tmp/40d-access-opt.log. Shape, position and color remain visually estimated;
this detail does not prove overall photorealism. The prior turn was progress:
it committed and pushed the existing model/rendering checkpoint.

### 2026-10-02 — R7 finder-side control and LCD outline
The current rear viewer showed an exposed diopter cylinder above/right of the
eyecup. Comparing r7-top.png and r7-terminals.webp established that the R7
adjuster belongs on the terminal side, to the left when viewed from behind.
The shared eyecup builder had incorrectly applied the DSLR location to the R7.
Added R7-specific placement below the finder crown and reduced wheel/axle width
from .088/.079 to .035. The first side check still exposed too much of the
wheel; advanced it .057 into the housing. Actual /classic rear, terminal-side,
and oblique views now show its thin edge beside the left eyecup, without the
former right-side protrusion. The DSLR placement remains unchanged.

Also replaced the R7 LCD bezel cube with a rounded-outline extrusion and
increased gasket/glass corner radii to .050/.040 using r7-rear.webp. The frame
now has continuous rounded corners rather than thickness-limited cube bevels.
Rebuilt and Meshopt-compressed R7: 3,525,020 bytes. Refreshed body thumbnail and
default setup poster. Logs: /tmp/r7-finder-frame.log and
/tmp/r7-finder-frame-opt.log. Prior goal turn was progress (40D access-light
geometry and actual-viewer checks). These corrections do not establish full
body-contour, material or optical fidelity; those requirements remain open.
Production build passed on retry (15 pages, 29.75 seconds). The first attempt
failed while parsing an HTML response from the GitHub GraphQL data request;
no feature change was required. Retry log: /tmp/r7-finder-frame-build-retry.log.

### 2026-10-02 — R7 upper grip and top-control seating
Compared r7-top.png and r7.jpg with the current interactive R7/50mm assembly.
The M-Fn control stood above the grip because all four top buttons used fixed
heights. Replaced these with shell ray casts and local surface-normal alignment
for each bezel, button and recording dot. Applied the same rigid surface seating
to the power selector assembly while retaining independently projected legends.
The first seated pass exposed an underlying contour problem: uniform 20%
shrinkage of the grip cross-section extended up through the shutter crown,
placing M-Fn on a steep inner wall. The grip now transitions from 80% width below
y=.28 to full width at y=.59, preserving its outer edge and widening inward.
Applied the same section transform to the rubber overmold. The rebuilt model
shows M-Fn seated on the upper crown in the actual viewer's elevated front and
overhead views; front inspection preserves the outside grip silhouette.

Exported and Meshopt compressed R7 is 3,531,848 bytes; no renderer/loading changes.
Refreshed body/default previews. Logs /tmp/r7-top-seating.log and
/tmp/r7-top-seating-opt.log. Previous goal turn was progress (finder placement,
LCD outlines and live comparison). Exact contour/material fidelity remains
unproven; the shoulder finish and optical appearance need further comparison.

### 2026-10-02 — EF 50mm II rear barrel and focus switch
Checked 50ii.jpg and Canon's C21-6241 exploded parts drawing, page 2:
https://cfargo.com/pdf/Canon/EF%2050%201.8%20II.pdf
Local reference: output/gear-reference/50ii-parts.pdf and 50ii-parts.png.
The YA2-0425 outer barrel has short axial rear grip grooves, separate from the
ribbed dust cap. Added a 48-slot sampled outer surface from z=.190 to .330 with
.008 maximum recess depth; the AF/MF insert interrupts the band. Slot count and
dimensions are visual estimates. Moved the minimum-distance legend onto the
smooth band immediately ahead of the grooves.

The live R7 side inspection also exposed a broken AF/MF surround: bending only
the old box corners made its flat faces form chords inside the barrel. Replaced
it with a rounded panel, tessellated its interior before cylindrical projection,
and rebuilt normals after deformation. Lowered/rounded the track and slider.
Actual /classic side and oblique close views now retain a continuous seated
panel and readable AF/MF lettering; no browser console errors. Switched to the
40D and verified the native EF assembly. Refreshed the 50mm thumbnail.
Compressed asset: 883,784 bytes. Export logs /tmp/50-barrel-grip.log and
/tmp/50-barrel-grip-opt.log. The optics were observed but not changed or accepted
as photorealistic. Prior turn was progress (R7 crown/control seating and checks).

### 2026-10-02 — 50mm front-element profile consistency
The front element generator used a parabolic sag interpolation. Added an opt-in
spherical-cap surface and applied it only to the EF 50mm II front element,
retaining radius .278, center thickness .085, edge thickness .006 and planar
rear face. The runtime thickness map now samples the same sphere rather than
interpolating thickness quadratically. This improves internal geometry/render
consistency; the existing visually estimated dimensions are not Canon's optical
prescription, and the section reference alone cannot establish exact curvature.

Decoded the raw GLB POSITION accessor and checked all 4,362 front-element
vertices against spherical front/planar rear equations. Maximum residual was
2.9541e-8 scene units. Thickness at normalized radii 0/.25/.5/.75/1 is
.085/.080412/.066398/.042146/.006. Actual /classic front and oblique R7 views show
continuous glass reflections, with no console errors; also checked the 40D
assembly. Refreshed lens thumbnail. Compressed lens is 883,552 bytes. Logs:
/tmp/50-spherical-glass.log and /tmp/50-spherical-glass-opt.log.

The fast renderer still approximates stacked internal reflections. The large
bright reflection in the 40D setup remains; this change does not establish
complete optical fidelity or photorealism. Prior goal turn was progress (rear
barrel grooves and curved AF/MF panel, verified on both owned bodies).

### 2026-10-02 — Internal reflection isolation and R7 rear keys
Isolated the 50mm reflection layers in copies of the current studio scene.
Disabling the reflex mirror did not remove the oversized bright patch; disabling
the inner optical layers did. Reducing specular intensity shifted the coating
color toward blue, so that trial was rejected. Quartering the additive inner
opacity preserved the warm hue while reducing the patch (front internal .25,
rear internal .10). Checked the actual R7 and 40D assemblies. These remain
visually calibrated approximations, not measured coating parameters. Refreshed
the 50mm thumbnail to match the material change after the checkpoint push.

Compared the R7 rear in the actual viewer with output/gear-reference/r7-rear.webp.
The seven small rear keys were visibly domed, unlike the shallow, flatter
reference faces. Replaced their ellipsoid caps with beveled cylinders and satin
control plastic, retaining the front face plane beneath their existing legends.
Verified rear and grip-side oblique views: key faces remain seated, the asterisk,
AF-point and playback/erase markings remain visible, and no console errors were
reported. This does not establish overall photorealism; contours, screen/optical
response and all-kit comparison still require further work. Export logs:
/tmp/r7-rear-buttons.log and /tmp/r7-rear-buttons-opt.log. Previous turn was
progress: committed, pushed and verified the checkpoint against origin/main.

### 2026-10-02 — R7 grip depth against dimensional reference
Canon's manual specifies 132.0 × 90.4 × 91.7 mm:
https://cam.start.canon/en/C005/manual/html/UG-10_Reference_0100.html
Measured exported geometry at 55 mm/unit: the current R7 was approximately
130.53 × 92.45 × 81.05 mm. Its depth was substantially short. The official
right-side reference (r7-right-canon.jpg) also shows the deeper grip silhouette.
Extended the forward grip by 10.65 mm with smooth spatial fades, carrying its
overmold, receiver and shutter together. The deformation stops before the RF
mount and rear controls; the mounting register is unchanged.

Measured all exported POSITION vertices with node transforms applied using
output/gear-modeling/measure-glb-bounds.py: 130.526 × 92.453 × 91.696 mm.
The remaining width/height difference is not declared solved. The 40D measured
147.126 × 109.187 × 77.300 mm against Canon's 145.5 × 107.8 × 73.5 mm
(https://global.canon/en/c-museum/product/dslr795.html); investigate its reference
silhouette before changing it. Bounding dimensions alone do not prove contours.

Checked R7 with 50mm in the actual /classic viewer from the grip side, default
front oblique and rear. Grip covering and shutter remain seated; the lens and
Control Ring adapter have clearance; rear controls remain intact. No console
errors. Refreshed R7 thumbnail and default 28–135 assembly poster. Logs:
/tmp/r7-depth.log and /tmp/r7-depth-opt.log. Prior turn was progress (flatter
R7 rear keys, current 50mm thumbnail and actual viewer checks). Overall material,
optical and contour fidelity across all equipment remains unproven.

### 2026-10-02 — 40D recessed strap fittings
Compared the actual viewer's 40D side with the four-view reference 40d.jpg.
The generic round strap ring was buried in the grip shoulder; the photographed
camera has a rectangular webbing opening inside a broad recessed pocket there.
Replaced both round rings with rounded rectangular open fittings. Ray-cast the
actual shoulder to place and orient each fitting; cut a true grip-side cavity
and added a dark lining behind its inset eye. The terminal-side eye sits close
to the outer surface below the mode dial. Dimensions and pocket outline remain
visual estimates from the reference, not manufacturing measurements.

Rebuilt and compressed the 40D, then checked grip side, terminal side, front
oblique, elevated front and rear in the actual /classic viewer. Both openings
are visible and seated; adjacent terminal covers, top controls and rear controls
remain intact. No console errors. Refreshed the 40D thumbnail. Logs:
/tmp/40d-strap-pocket.log and /tmp/40d-strap-pocket-opt.log.
Did not rescale the entire body to force the bounding box: the reference's depth
arrow and the asset's protruding fittings need a closer comparison first.
Previous turn was progress (corrected R7 grip depth and verified actual views).

### 2026-10-02 — f/4 stabilizer thumb switch
Compared 70-200-f4-side.jpg with the actual R7/f4 side view. The four generated
sliders shared one flat shape, but the IS on/off switch in the reference has a
taller pocket and raised thumb pad with ridges concentrated at one end. Gave
that switch a .275 × .175 opening, .175 × .145 pad with .020 depth, four raised
right-side grip ridges and the black indicator toward the left. Other three
switches retain their shallower profiles. Dimensions are visually estimated.

Verified side and oblique actual viewer views: the IS pad remains seated and
distinct from the other switches; the panel follows the barrel. Also inspected
the front optics and switched to the 40D native-EF assembly. The f/4 remains
without a collar or foot. Refreshed its lens thumbnail. Logs:
/tmp/f4-is-slider.log and /tmp/f4-is-slider-opt.log. Front optics still show an
internal bright arc and are not accepted as physically faithful by this check.
Previous turn was progress (40D strap pockets and fittings, verified in viewer).

### 2026-10-02 — f/4 internal white seam leak
Isolated the visible bright internal arc using an ignored copy of the current
production scene (f4-isolation-scene.ts). Removing inner glass, machined metal,
or anodized surfaces did not remove it. Removing the aperture blades exposed
more of the ring; removing the black barrel lining exposed broad white surfaces
behind it. Removing the front glass made the arc thinner but did not eliminate
it. This separates the opaque seam leak from the warm coating reflections.

The lining ended at radius outer and z=aperture_z+.025, ahead of the aperture
carrier, leaving a slit into the white barrel at oblique sightlines. Extended
the f/4 lining to radius outer*.96 and z=aperture_z-.010 so it overlaps the
carrier. Identical diagnostic front view now has no white arc; warm glass
reflections remain. No lighting, glass opacity, draw passes or surface counts
were increased. Checked actual /classic R7 front and 40D front/oblique views;
the seam stays closed. The 40D still shows a central mirror reflection, which
is distinct from this removed arc and is not accepted as final optical fidelity.
No console errors; refreshed f/4 thumbnail. Logs /tmp/f4-lining-seam.log and
/tmp/f4-lining-seam-opt.log. Prior turn was progress (distinct IS thumb slider).

### 2026-10-02 — Enclosed 40D mirror and studio IBL
The actual 40D/f4 front view still showed a bright central semicircle after the
lining leak was fixed. The reflex mirror was inheriting global studio cards,
whose environment lighting has no geometric occlusion from the camera housing.
Setting only material.envMapIntensity=0 did not change the actual viewer:
Three's WebGLRenderer uses scene.environmentIntensity for implicit environment
maps. Confirmed in the installed WebGLRenderer.js uniform update.

In scene.prepare, explicitly assign the studio environment to the reflex mirror
and set its intensity to zero, retaining shadowed direct lighting. Match optional
Blender numeric suffixes (the current asset names it Reflex mirror.001). Keep
the rule together in the scene rather than splitting it across loader and scene.
Actual 40D/f4 front view now has no bright central studio-card semicircle; lens
coating reflections remain. Also checked the 40D/50 oblique view with no console
errors. This suppresses an incorrect exterior reflection; it does NOT implement
the missing focusing-screen/interior reflection or prove optical fidelity.
No new texture, render pass, loading dependency or animation loop was added.
Prior turn was progress (closed f/4 lining seam, actual viewer verification).

### 2026-10-02 — Tamron switch panel and inset distance window
Compared the actual side and oblique viewer views with 35-side.jpg and 35-top.jpg.
The AF/MF surround was short with clamped box bevels and faceted-looking edges.
Replaced it with a .30 × .64 rounded panel, thinner inset and shallow pill key;
subdivided panel interiors before cylindrical projection and rebuilt normals.
The side/oblique viewer now shows a seated rounded surround rather than a slab.

The distance window was raised above an uninterrupted barrel. Cut a curved
pocket, lowered its surround/glass/internal legends .023 units and replaced its
box corners with explicit radii. An initial export exposed shading streaks from
the Boolean boundary. Restored analytic radial normals on the outer cylinder,
preserving pocket-wall face normals; actual elevated view then showed smooth
continuous barrel shading. These are visual-reference dimensions, not measured
manufacturing specifications. Checked R7 side, elevated top and front oblique,
then the native-EF 40D assembly, with no console errors. Refreshed 35mm thumbnail.
Logs /tmp/tamron-switch-panel.log, /tmp/tamron-window.log and corresponding
-opt.log files. Prior turn was progress (removed unoccluded mirror studio IBL).
This verifies these control surfaces, not complete lens or body photorealism.

### 2026-10-02 — Tamron distance-scale layout and origin legend
The top product reference 35-top.jpg shows one shared infinity symbol centered
over the focus index, with 3 feet / 1 metre to its left. Replaced the two offset
infinity glyphs with that layout and replaced the index letter with a thin line.
Added the small MADE IN JAPAN inscription visible below the AF/MF panel in
35-side.jpg, conforming its letters to the same cylindrical surface.

Verified the actual interactive viewer with keyboard orbit, pan and zoom: the
single infinity symbol aligns over the index and the 3/1 values and ft/m units
are readable in the top close-up. The side origin legend remains attached around
the barrel curvature; at normal framing it is intentionally small and not fully
legible. No console errors. Refreshed the 35mm thumbnail. Export logs:
/tmp/tamron-markings.log and /tmp/tamron-markings-opt.log. Prior turn was progress
(rounded AF/MF panel, inset distance window and corrected cylinder normals).

### 2026-10-02 — R7 recessed joystick cup
Compared the actual rear viewer with output/gear-reference/r7-rear.webp.
The previous convex rubber surround and thumb pad protruded beyond the wheel
face, reading as a raised dome instead of the reference's recessed joystick.
Replaced the ellipsoid surround with a smooth concave annular cup, lowered the
socket and thumb pad below the wheel rim, and moved its molded dots with it.
Verified rear and rear-oblique views in the actual /classic interactive viewer:
the pad now sits inside the wheel and the cup remains continuous. No browser
errors. Front-facing selector/poster previews do not expose this rear control.
Export logs: /tmp/r7-joystick-cup.log and /tmp/r7-joystick-cup-opt.log.
Prior turn was progress (committed and pushed the existing verified checkpoint).
This local correction does not prove full body contour or photorealism completion.

### 2026-10-02 — R7 lower rocker curvature
The rear product reference r7-rear.webp shows a shallow dished four-way rocker
around a flat Q/SET key. Replaced the convex ellipsoid with a concave annular
surface, a beveled flat key, and direction marks following the dish slope.
Added an outer return into the bezel to keep the rocker a seated part rather
than an exposed open sheet in oblique views. Rear and oblique comparisons in
the interactive viewer show the corrected curvature and readable Q/SET marking;
no browser errors. This does not establish overall photorealism. The prior goal
turn made progress by correcting the upper joystick cup. Export/build logs use
/tmp/r7-rocker-dish*. Front previews do not show either changed rear control.

### 2026-10-02 — R7 speaker grille placement audit
Official rear reference:
https://personal.canon.jp/product/camera/eos/r7/feature/face-design
Saved its rear image as output/gear-reference/r7-back-canon.jpg.
It confirms the R7 screen bezel has no Canon wordmark; do not add one.
The six speaker perforations were centered at y=.405, below the LCD bezel top
at y=.45, hiding them. Moved their center to y=.505 so the lowest hole clears
the bezel. Verified the actual viewer in rear close-up and rear-oblique views:
the grille is now exposed rather than buried. Its bright edge shading remains
stronger than the reference and needs further comparison; this is a placement
correction, not a photorealism sign-off. No browser errors. Export logs:
/tmp/r7-speaker-position.log and /tmp/r7-speaker-position-opt.log.
Prior turn was progress (dished lower rocker and flat Q/SET key).

### 2026-10-02 — R7 speaker perforation shading
The formed R7 rear cover rebuilt all faces with smooth normals but did not
separate the Boolean hole walls from the exterior. Applied the same hard-edge
normal separation used on the main casting to the R7 rear cover after its mesh
rebuild. This preserves smooth body contours while keeping the hole rims sharp.
Compared identical rear macro views in the actual /classic viewer before and
after: swollen bright highlights disappeared and the grille reads as dark
perforations. Also verified the wider rear-oblique view with no console errors.
The prior turn made progress by exposing the grille above the screen bezel;
this resolves the specific edge-shading issue recorded in that audit. It does
not verify the remaining body/material/optical fidelity requirements.
Logs: /tmp/r7-speaker-normals.log, /tmp/r7-speaker-normals-opt.log,
/tmp/r7-speaker-normals-build.log. Changes remain local after 0a4896b.

### 2026-10-02 — R7 material grain calibration
Compared r7-top.png and r7-rear.webp against actual viewer top, side, and rear
views. The modeled rubber and shell showed excessive coarse relief. Generator
UV normalization was compounded by runtime repeat/normal-strength multipliers.
R7-only material copies now author the final strengths (.30 rubber, .18 shell)
and grain spacing (approximately .4 mm rubber, .2 mm shell) in the asset, with
runtime repeat and strength multipliers of one for these named finishes.
These are reference-guided visual estimates, not physical surface measurements.
The other bodies, lenses and scanned front-grip material remain unchanged.
Verified rear close-up: finer shell, visibly coarser rubber, less raised grain;
also checked top and grip-side angles, with no console errors. Refreshed R7
thumbnail and setup poster. Top shell contour accuracy remains a separate open
requirement; improved material response does not establish photorealism.
Prior turn was progress (corrected speaker perforation normals).
Logs: /tmp/r7-finish-grain.log, /tmp/r7-finish-grain-opt.log,
/tmp/r7-finish-grain-build.log.

### 2026-10-02 — R7 shutter seat geometry
Compared top and grip-side viewer views with r7-top.png and
r7-right-canon.jpg. The shutter region showed an exaggerated recessed surround.
Locally subdivided the reduced casting before its nonlinear seat deformation;
that alone did not remove the broad ring, establishing that the seat shape was
also responsible. Reduced the R7 seat's normal inset from .035 to .012 units
(about 1.9 to .66 mm before the final body deformation). The resulting button
remains seated in the grip-side view and the recess is shallower. The broader
top shoulder still appears too rounded against the reference; this is a partial
contour correction, not a body-fidelity sign-off. No viewer console errors.
Updated R7 thumbnail and setup poster. Prior turn made progress by calibrating
R7 shell/rubber grain. Logs: /tmp/r7-shutter-surface.log,
/tmp/r7-shutter-surface-opt.log, /tmp/r7-shutter-surface-build.log.

### 2026-10-02 — R7 casting-to-grip trough correction
Probed the pre-shutter casting with BVH rays (ignored diagnostic script
output/gear-modeling/probe-r7-crown.py). At x=-1.2, the upper surface dipped
from y=.7162 at z=.1 to .6703 at z=.3, then returned to .7162 at z=.5.
That roughly 2.5 mm trough at the casting/grip join matched the uneven top
highlight and was inconsistent with the smoother shoulder in r7-top.png.
Added a localized upper-surface bridge between z=.08 and .58, fading into
the sides and original end sections before mesh reduction and control placement.
The same probe now reads .7193 at the center section; forward shutter crown
and rear sections retain their sampled heights. Before/after probe logs:
/tmp/r7-crown-probe.log and /tmp/r7-crown-probe-after.log.
Verified actual viewer top, grip side, and front with both 28-135 and shorter
50mm setup. Controls remain seated; no browser errors. Refreshed body/setup
previews. This is a local contour improvement, not a complete body comparison.
Prior turn made progress on shutter seat depth. Export/build logs:
/tmp/r7-shoulder-bridge.log, /tmp/r7-shoulder-bridge-opt.log,
/tmp/r7-shoulder-bridge-build.log.

### 2026-10-02 — 40D shell and grip finish
Compared the actual rear viewer with the rear panel in 40d.jpg. The rubber
finish was excessively coarse at the normal camera framing. Extended the
asset-authored finish calibration to independent 40D material copies: approximately
.46 mm rubber cells with normal strength .36, and .2 mm shell cells with strength
.18. These are visual estimates; 40D rubber remains coarser than the R7 setting.
The viewer preserves these authored values instead of compounding texture repeat
and normal strength. Verified rear, terminal side, and front three-quarter views
with no browser errors; refreshed the 40D thumbnail. Geometry is unchanged.
The terminal-side check also highlights rear screen surround depth as an item
for further reference comparison; this material pass does not settle it.
Prior turn made progress correcting the R7 shoulder trough. Logs:
/tmp/40d-finish-grain.log, /tmp/40d-finish-grain-opt.log,
/tmp/40d-finish-grain-build.log.

### 2026-10-02 — 40D screen stack seating
Compared rear-oblique viewer with the side view in 40d.jpg. The glass stood
roughly .6 mm above its frame, and the stack projected about 3 mm from the
rear cover. Reduced frame offset from rz-.057 to rz-.045, and glass stack
reference from rz-.088 to rz-.071, retaining a visible perimeter gasket.
Moved the rear Canon wordmark from rz-.087 to rz-.074 to follow the frame.
Verified matching oblique views and rear view in the interactive viewer:
smaller screen step, continuous visible frame, readable Canon wordmark, no
buried glass or console errors. Refreshed 40D thumbnail. The larger rear-cover
to casting seam still warrants comparison; this is a screen-stack correction.
Prior turn made progress calibrating 40D materials. Logs:
/tmp/40d-screen-seating.log, /tmp/40d-screen-seating-opt.log,
/tmp/40d-screen-seating-build.log.

### 2026-10-02 — 40D rear cover/casting overlap
The rear-oblique viewer showed a deep double-bevel seam making the rear cover
read as a separate slab. The cover extended only .012 units into a casting
with a .055-unit back bevel. Increased the DSLR cover's embedded front extent
to back+.065 and matched its bevel to .055, retaining its rear face and all
control locations. Compared identical terminal-side rear-oblique views before
and after: the deep notch is reduced and the join reads more continuously.
Verified rear controls and opposite rear corner, with no new visible
intersections or console errors. Updated 40D thumbnail. This is an overlap
correction, not a claim that the entire housing matches the reference.
Prior turn made progress seating the 40D screen stack. Logs:
/tmp/40d-cover-overlap.log, /tmp/40d-cover-overlap-opt.log,
/tmp/40d-cover-overlap-build.log.

### 2026-10-02 — 40D focal-plane mark
The grip-side view in 40d.jpg clearly shows a focal-plane symbol ahead of the
diopter wheel. Added its ring and stem at the modeled sensor plane (z=-.36),
projecting the strokes onto the casting with BVH rays so they follow its curve.
Verified readability in two close-up side/rear-oblique viewer angles and normal
framing; no console errors. Updated 40D thumbnail.
Investigated diopter +/- markings but did not establish their exact layout
well enough to add them. Saved Canon's manufacturer brochure and rendered its
nomenclature page for further reference (output/gear-reference/40d-brochure.pdf,
40d-brochure-controls.png). Source:
https://downloads.canon.com/cpr/software/camera/40D_BC_0113W833.pdf
Prior turn made progress correcting rear-cover overlap. Logs:
/tmp/40d-focal-mark.log, /tmp/40d-focal-mark-opt.log,
/tmp/40d-focal-mark-build.log. Overall photorealism remains unproven.

### 2026-10-02 — f/4 switch recess floor curvature
The default viewer's apparent distorted markings were the switch controls,
not the focal scale. Compared the side view with 70-200-f4-side.jpg: the
stabilizer recess was partly filled by white housing. Its broad floor n-gon
was bent only at its perimeter, leaving interior triangles as chords below
the cylindrical barrel. Extended the existing pre-bend interior subdivision
to the four recess floors. The matching actual viewer side angle now shows
continuous dark recesses around the sliders, including the taller IS pad.
Also checked default assembled view and console (no errors), and refreshed
the lens thumbnail. No collar was added. This fixes an intersection; it does
not establish overall photorealism. Previous turn committed and pushed the
body refinements as f75a208. This correction remains local.
Logs: /tmp/f4-recess-floor.log, /tmp/f4-recess-floor-opt.log,
/tmp/f4-recess-floor-build.log.

### 2026-10-02 — R7 finger-grip undercut
Compared the actual viewer's grip-side silhouette to Canon's annotated
r7-right-canon.jpg. The reference's shutter ledge projects beyond the finger
grip; the model's forward edge was nearly straight. Retreated the lower grip
loft fronts by up to .11 scene units (~6 mm), tapering below the shutter deck
and at the bottom return. This is a photo-based estimate, not a measured
dimension. Kept each section's rear edge and shutter crown in place; the
overmold and ray-seated remote receiver follow the shaped grip.
Verified matching side, front and rear-oblique views in the actual R7+50mm
viewer. The undercut is visible; receiver remains seated and rear joins are
continuous, with no console errors. Refreshed R7 thumbnail and setup poster.
Overall contour matching and photorealism remain incomplete. Prior turn
fixed f/4 recess-floor intersections. Logs: /tmp/r7-grip-undercut.log,
/tmp/r7-grip-undercut-opt.log, /tmp/r7-grip-undercut-build.log.

### 2026-10-02 — 40D mode dial location and seating
Compared actual rear/top viewer angles with 40d.jpg and 40d-top.jpg. The
fixed-height mode dial sat level with the shoe center in top view, whereas
the reference places it behind the shoe. Moved its center from z=-.10 to
-.26 and ray-seated its underside on the casting, using the hit normal for
its tilt. Its radius and mode markings remain unchanged. Verified top view
now places the center aft of the shoe, rear view exposes the knurled edge,
and terminal-side oblique view shows a seated dial without a visible gap.
No console errors; build passed. Refreshed 40D thumbnail. This is a placement
correction, not proof of full body fidelity. Previous turn reshaped the R7
finger grip. Logs: /tmp/40d-mode-seat.log, /tmp/40d-mode-seat-opt.log,
/tmp/40d-mode-seat-build.log.

### 2026-10-02 — replacement-mesh search and rejected finder trial
Rechecked R7/40D model availability. Results included the already known R7
Sketchfab model and commercial TurboSquid assets; no new verified downloadable
pair suitable for the public GLB repository was identified. No assets bought
or extracted. Current listing references:
https://www.turbosquid.com/3d-models/3d-model-canon-eos-r7-camera-2327213
https://www.turbosquid.com/3d-models/canon-mirrorless-cameras-eos-r7-model-2339818

The 40D rear reference shows a lit optical aperture, unlike the dark electronic
finder appearance of the current model. Tested a dedicated transmissive ocular
with a recessed diffuse focusing-screen rectangle. Actual rear and oblique
viewer inspection rejected it: the rectangle read as a flat gray tile and did
not convincingly reproduce the optical pupil. Reverted both generator and
runtime trial changes and regenerated the 40D. Retained the preceding mode-dial
correction. A future finder pass needs a view-dependent optical pupil/image
representation, not merely a brighter rectangle behind thin glass. No claim
of progress in final finder fidelity; this experiment rules out that shortcut.
Logs: /tmp/40d-finder-transmission.log, /tmp/40d-finder-transmission-opt.log,
/tmp/40d-finder-revert.log, /tmp/40d-finder-revert-opt.log.

### 2026-10-02 — R7 molded grip cell structure
The grip normal map used isolated bell-shaped bumps. Tested adjoining rounded
cells with fine creases (nearest/second-nearest Voronoi distance difference)
and correlated roughness, limited to R7 molded rubber. Kept the established
physical grain scale and normal strength; painted-shell grain is unchanged.
Actual viewer grip-side macro shows a continuous irregular molded texture;
front three-quarter and rear views retain readable controls and distinct
rubber/paint finishes. No console errors; build passed. Refreshed R7 thumbnail
and setup poster. Optimized R7 is 3.55 MB; no added runtime rendering passes.
This is a material refinement, not proof of full photorealism. The preceding
finder trial was rejected after visual inspection, not left in the asset.
Logs: /tmp/r7-cell-grain.log, /tmp/r7-cell-grain-opt.log,
/tmp/r7-cell-grain-build.log.

### 2026-10-02 — R7 rear thumb-pad outline
Compared r7-back-canon.jpg and the unobstructed r7-rear.webp with the viewer.
The old pad cut inward too early beneath the joystick and left excess bare
housing beside INFO. Traced the wider upper shelf and the return around INFO
and Q/SET using the control positions as anchors. Reduced its exposed depth
by .010 units (~.55 mm), keeping the back embedded in the rear cover.
Verified actual rear and grip-side rear-oblique views: pad extends beneath
the joystick, controls remain clear, and the thinner edge stays seated.
No console errors; build passed. Updated R7 thumbnail. This is a rear contour
correction; overall fidelity remains incomplete. Previous turn changed the
R7 rubber grain. Logs: /tmp/r7-thumb-outline.log,
/tmp/r7-thumb-outline-opt.log, /tmp/r7-thumb-outline-build.log.

### 2026-10-02 — R7 covering end-rim geometry
Untextured and normal-only diagnostics exposed a scalloped lower grip seam.
A nearest-surface probe confirmed that the rounded overmold end cap sinks
into the casting; its visible boundary was the intersection of two surfaces.
Changed only the R7 overmold from a capped subdivided solid to an open loft
with a .004-unit inward solidified skin. Its end rings now define the seam.
The untextured comparison removes the scalloping. Verified front, grip-side
and rear-oblique actual viewer views: continuous lower rim, seated receiver,
and no newly exposed gap in those views. Refreshed thumbnail and setup poster.
No console errors; build passed. Broader shoulder shape remains under review.
Previous turn corrected the rear thumb-pad contour. Diagnostic script is
output/gear-modeling/probe-grip-clearance.py; its samples include cap interior
vertices, so negative clearances are not all visible defects by themselves.
Logs: /tmp/r7-grip-clearance.log, /tmp/r7-grip-rim.log,
/tmp/r7-grip-rim-opt.log, /tmp/r7-grip-rim-build.log.

### 2026-10-02 — R7 visible LCD aspect ratio
Canon specifies a roughly 3-inch, 3:2 screen:
https://cam.start.canon/en/C005/manual/html/UG-10_Reference_0100.html
The old texture mask occupied 346/384 of the glass height and produced an
approximately 4:3 active area after the body deformation. Adjusted only the
R7 mask's vertical bounds to 39..345. Measured UV boundary points on the saved
mesh (barycentric interpolation over its triangles), rather than trusting
undeformed dimensions: 62.8374 x 41.9436 mm, aspect 1.49814, diagonal 2.9744 in.
The first trial was 1.47881 and was corrected using that measured mapping.
Verified final rear view in the actual viewer, with no console errors;
refreshed R7 thumbnail. Build passed during this pass. The diagnostic lives
at output/gear-modeling/probe-screen-size.py. Overall photorealism is unproven;
this establishes only the visible LCD proportions. Previous turn repaired
the grip's lower seam. Logs: /tmp/r7-screen-ratio-final.log,
/tmp/r7-screen-ratio-final-opt.log, /tmp/r7-screen-size-final.log,
/tmp/r7-screen-ratio-build.log.

### 2026-10-02 — R7 card-door corner and seam agreement
Compared the current grip-side view with r7-right-canon.jpg. The door inherited
profile()'s .10-unit corner rounding (~5.5 mm), making its corners too broad.
Set its rounding to .018 (~1 mm, estimated from the photo), and generated its
seam from that same rounded outline instead of the original sharp polygon.
Checked matching side and rear-oblique actual viewer views: tighter corners,
aligned seam, and no newly visible gap at the door edge. No console errors;
build passed. Refreshed R7 thumbnail and setup poster. Overall fidelity remains
incomplete; the previous turn established the R7 visible LCD's aspect ratio.
Logs: /tmp/r7-card-door-outline.log, /tmp/r7-card-door-outline-opt.log,
/tmp/r7-card-door-outline-build.log.
