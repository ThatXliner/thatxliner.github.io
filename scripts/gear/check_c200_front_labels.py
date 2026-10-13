"""Check both lower front labels are visible and backed by the C200 housing.
Run Blender --background output/gear-modeling/c200.blend
--python-exit-code 1 --python scripts/gear/check_c200_front_labels.py.
This checks sampled mesh visibility, not lettering or photographic accuracy.
"""
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree
scene=bpy.context.scene
scene.view_layers[0].update()
vertices=[];faces=[];names=[];samples=[]
for obj in bpy.data.objects:
    if obj.type!='MESH':continue
    points=[obj.matrix_world@v.co for v in obj.data.vertices]
    for face in obj.data.polygons:
        slot=obj.data.materials[face.material_index]
        mat=slot.name.split('.')[0] if slot else 'Unassigned'
        p=sum((points[i] for i in face.vertices),Vector())/len(face.vertices)
        if mat=='White ink' and p.y < -1.1 and p.z>.35:
            samples.append(p)
        if mat=='White ink':continue
        offset=len(vertices);vertices.extend(points[i] for i in face.vertices);faces.append(tuple(range(offset,len(vertices))));names.append(mat)
assert len(samples)>100, 'Insufficient lower front lettering samples'
assert any(p.x<-.3 for p in samples) and any(p.x>.3 for p in samples), 'Both front labels must be present'
bvh=BVHTree.FromPolygons(vertices,faces)
hidden={};count=0;unsupported=0
for p in samples:
    hit,normal,index,distance=bvh.ray_cast(p+Vector((0,0,2)),Vector((0,0,-1)),3)
    if hit is None or p.z-hit.z>.01:unsupported+=1
    if hit is not None and hit.z>p.z+.001:
        hidden[names[index]]=hidden.get(names[index],0)+1;count+=1
print('FRONT LOWER LABEL TRIANGLES',len(samples),'OCCLUDED',count,'BY',hidden)
if samples:print('LABEL BOUNDS',tuple(min(p[i] for p in samples) for i in range(3)),tuple(max(p[i] for p in samples) for i in range(3)))

assert count==0, 'Lower front lettering is occluded: '+str(hidden)
assert unsupported==0, 'Lower front lettering floats off its housing'
print('C200 FRONT LABEL VISIBILITY PASS')
