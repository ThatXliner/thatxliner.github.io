"""Check the lower housing does not clip the C200's bottom casting screw.
Run Blender --background output/gear-modeling/c200.blend
--python-exit-code 1 --python scripts/gear/check_c200_bottom_screw.py.
Samples triangulated front cap/bevel faces against housing geometry, excluding
fastener/slot/ink materials to avoid counting the screw's own surface.
This does not establish full seating or photographic fidelity.
"""
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree
bpy.context.view_layer.update()
vertices=[];faces=[];samples=[]
for obj in bpy.data.objects:
 if obj.type!='MESH':continue
 obj.data.calc_loop_triangles()
 points=[obj.matrix_world@v.co for v in obj.data.vertices]
 normal_matrix=obj.matrix_world.to_3x3().inverted().transposed()
 for face in obj.data.loop_triangles:
  slot=obj.data.materials[face.material_index];mat=slot.name.split('.')[0] if slot else 'Unassigned'
  p=sum((points[i] for i in face.vertices),Vector())/len(face.vertices)
  normal=(normal_matrix@face.normal).normalized()
  if mat=='Anodized black' and p.y < -.9 and abs(p.x)<.08 and p.z>.35 and normal.z>.25:samples.append(p)
  if mat in ['Anodized black','Deep black','White ink']:continue
  offset=len(vertices);vertices.extend(points[i] for i in face.vertices);faces.append(tuple(range(offset,len(vertices))))
assert samples,'No bottom screw cap samples'
bvh=BVHTree.FromPolygons(vertices,faces)
blocked=0
for p in samples:
 hit,normal,index,distance=bvh.ray_cast(p+Vector((0,0,2)),Vector((0,0,-1)),3)
 if hit is not None and hit.z>p.z+.001:blocked+=1
print('SAMPLE BOUNDS',tuple(min(p[i] for p in samples) for i in range(3)),tuple(max(p[i] for p in samples) for i in range(3)))
print('BOTTOM SCREW CAP SAMPLES',len(samples),'BLOCKED BY HOUSING',blocked)
assert blocked==0,'Housing occludes the bottom screw'
