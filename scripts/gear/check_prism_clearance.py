"""Check sampled 40D shell/flash clearance in the generated Blender assembly.
Run: blender --background output/gear-modeling/40d.blend --python-exit-code 1
     --python scripts/gear/check_prism_clearance.py
This checks intersections at 15 seating points, not photographic fidelity.
"""
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree
groups={}
for kind,fragment in [('shell','Crinkle painted metal'),('cover','Graphite polymer')]:
 verts=[];faces=[]
 for obj in bpy.data.objects:
  if obj.type!='MESH':continue
  offset=len(verts);verts.extend(obj.matrix_world@v.co for v in obj.data.vertices)
  faces.extend([offset+i for i in p.vertices] for p in obj.data.polygons if fragment in obj.data.materials[p.material_index].name)
 groups[kind]=BVHTree.FromPolygons(verts,faces)
fail=[]
for z in [-.2,0,.2]:
 edge=.49*(1-.32*((z+.36)/.915))*.95
 for x in [-edge,-.25,0,.25,edge]:
  shell=groups['shell'].ray_cast(Vector((x,1.5,z)),Vector((0,-1,0)))[0]
  cover=groups['cover'].ray_cast(Vector((x,.75,z)),Vector((0,1,0)))[0]
  gap=cover.y-shell.y if shell is not None and cover is not None else None
  print('SEAT',x,z,'shell',None if shell is None else round(shell.y,6),'cover',None if cover is None else round(cover.y,6),'gap',None if gap is None else round(gap,6))
  if gap is None or gap<.001:fail.append((x,z,gap))
print('CLEARANCE', 'PASS' if not fail else 'FAIL',fail)
if fail:raise RuntimeError('Intersecting flash seat')
