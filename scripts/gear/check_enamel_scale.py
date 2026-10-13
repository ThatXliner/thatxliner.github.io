"""Run in a generated telephoto .blend to check exported enamel texture scale.
blender --background output/gear-modeling/70-200-f4.blend
  --python-exit-code 1 --python scripts/gear/check_enamel_scale.py
"""
import math
import bpy

world_area=uv_area=0
for obj in bpy.data.objects:
    if obj.type!='MESH':continue
    uv=obj.data.uv_layers.active
    for face in obj.data.polygons:
        if not obj.data.materials[face.material_index].name.startswith('White enamel'):continue
        assert uv is not None,'Missing enamel UVs'
        transform=obj.matrix_world.to_3x3()
        world_area+=abs(transform.determinant())*face.area*(transform.inverted().transposed()@face.normal).length
        points=[uv.data[i].uv for i in face.loop_indices]
        uv_area+=abs(sum(a.x*b.y-b.x*a.y for a,b in zip(points,points[1:]+points[:1])))*.5
assert world_area>0 and uv_area>0,'Missing enamel surface'
span=math.sqrt(world_area/uv_area)
assert abs(span-.22)<.002,('Enamel tile span',span)
print('ENAMEL SCALE PASS',span,'model units per tile')
