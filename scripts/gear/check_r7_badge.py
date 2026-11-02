"""Check the EOS and R7 lettering in the generated r7.blend (author Z axis).

Run with Blender --background output/gear-modeling/r7.blend
--python-exit-code 1 --python scripts/gear/check_r7_badge.py.
The previous Arial lettering fails on size (EOS .108 against .185 units). This
checks shape and seating, not whether the redrawn letterforms match Canon's
artwork, which still needs looking at against r7.jpg.
"""
import bpy
from mathutils import Matrix, Vector

MM_PER_UNIT=55
CAP_HEIGHT=.065;EOS_WIDTH=2.85*CAP_HEIGHT;MODEL_WIDTH=2.14*CAP_HEIGHT
MOUNT_COLLAR=.68

ink=[]
for obj in bpy.data.objects:
    if obj.type!='MESH':continue
    for face in obj.data.polygons:
        if obj.data.materials[face.material_index].name.split('.')[0]!='White ink':continue
        points=[obj.matrix_world@obj.data.vertices[i].co for i in face.vertices]
        center=sum(points,Vector((0,0,0)))/len(points)
        if center.z>0 and .50<center.x<.82 and .30<center.y<.56:
            ink.append((points,center,(obj.matrix_world.to_3x3()@face.normal).normalized()*face.area))
assert ink,'No lettering found on the terminal shoulder'

# Older exports lack the saved seat frame; estimate one so they fail the
# shape and size checks instead of failing on missing metadata.
seat_normal=bpy.context.scene.get('r7_badge_frame_normal')
normal=(Vector(seat_normal) if seat_normal is not None else sum((n for _,_,n in ink),Vector((0,0,0)))).normalized()
across=Vector((normal.z,0,-normal.x)).normalized()
up=Vector((0,normal.z,-normal.y)).normalized()
origin=ink[0][1]
frame_inverse=Matrix((across,up,normal)).transposed().inverted()
frame=lambda p:(frame_inverse@(p-origin))[:2]

faces=[[frame(p) for p in points] for points,_,_ in ink]
heights=[sum(v for _,v in face)/len(face) for face in faces]
split=(min(heights)+max(heights))/2
eos=[p for face,height in zip(faces,heights) if height>split for p in face]
model=[p for face,height in zip(faces,heights) if height<=split for p in face]
assert eos and model,'Expected two lines of lettering'

def box(points):
    us=[u for u,_ in points];vs=[v for _,v in points]
    return min(us),max(us),min(vs),max(vs)
def near(actual,expected,tolerance,label):
    assert abs(actual-expected)<=expected*tolerance,(label,round(actual,4),'expected',round(expected,4))

for label,points,width in [('EOS',eos,EOS_WIDTH),('R7',model,MODEL_WIDTH)]:
    left,right,bottom,top=box(points)
    near(right-left,width,.05,label+' width')
    near(top-bottom,CAP_HEIGHT,.05,label+' cap height')
    # The E and R stems are straight verticals: a leaning or sheared line spreads
    # their left-most vertices across the stem's height.
    stem=[u for u,_ in points if u<left+.25*.135*CAP_HEIGHT]
    assert max(stem)-min(stem)<.003,(label+' stem leans',max(stem)-min(stem))
    # A level line has its first and last letters on the same baseline.
    third=(right-left)/3
    start=min(v for u,v in points if u<left+third);end=min(v for u,v in points if u>right-third)
    assert abs(start-end)<.004,(label+' baseline tilts',start-end)
    print(label,'width',round((right-left)*MM_PER_UNIT,2),'mm cap',round((top-bottom)*MM_PER_UNIT,2),'mm')

assert abs(box(eos)[1]-box(model)[1])<.004,'Lines must share one right edge'

clearance=min((p.x*p.x+p.y*p.y)**.5 for points,_,_ in ink for p in points)
assert clearance>MOUNT_COLLAR,('Lettering runs under the mount collar',clearance)

depsgraph=bpy.context.evaluated_depsgraph_get()
visible=0
for _,center,_ in ink:
    hit,_,_,index,obj,_=bpy.context.scene.ray_cast(depsgraph,center+normal*3,-normal)
    if hit and obj.data.materials[obj.data.polygons[index].material_index].name.split('.')[0]=='White ink':visible+=1
assert visible>=.99*len(ink),('Lettering buried or covered',visible,len(ink))
print('R7 BADGE PASS',visible,'of',len(ink),'faces visible; collar clearance',round(clearance,3),'normal',tuple(round(c,3) for c in normal))
