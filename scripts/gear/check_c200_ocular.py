"""Check internal ocular seating in the generated c200.blend (author Z axis).

Run with Blender --background output/gear-modeling/c200.blend
--python-exit-code 1 --python scripts/gear/check_c200_ocular.py.
This checks placement, not photographic fidelity or an optical prescription.
"""
import bpy

def depth_bounds(fragment):
    depths=[]
    for obj in bpy.data.objects:
        if obj.type!='MESH':continue
        for face in obj.data.polygons:
            name=obj.data.materials[face.material_index].name
            if name.split('.')[0]!=fragment:continue
            depths.extend((obj.matrix_world@obj.data.vertices[i].co).z for i in face.vertices)
    assert depths, 'Missing '+fragment
    return min(depths),max(depths)

front=depth_bounds('C200 ocular glass')
inner=depth_bounds('C200 ocular glass inner')
field=depth_bounds('C200 finder field')
assert inner[0]>front[1], 'Internal element intersects the front glass'
assert inner[1]<field[0], 'Internal element intersects the finder field'
print('C200 OCULAR SEATING PASS',front,inner,field)
