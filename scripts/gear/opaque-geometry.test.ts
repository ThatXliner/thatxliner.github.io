import {expect,test} from 'bun:test';
import * as THREE from 'three';
import {MeshBVH} from 'three-mesh-bvh';
import {buildOpaqueGeometry} from '../../src/classic/lib/gear/optics/opaque-geometry';
function triangle(x=0){
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute([x,0,0,x+.1,0,0,x,.1,0],3));
 geometry.setAttribute('normal',new THREE.Float32BufferAttribute([0,0,1,0,0,1,0,0,1],3));
 return new THREE.Mesh(geometry,new THREE.MeshPhysicalMaterial({color:0x888888}));
}
test('keeps lens shell, filters distant body surfaces, and preserves transformed hit data',()=>{
 const lens=new THREE.Group(),body=new THREE.Group();
 const shell=triangle(2);lens.add(shell);
 const interior=triangle();interior.position.z=.5;interior.rotation.x=.25;body.add(interior);
 body.add(triangle(3));
 const glass=triangle();(glass.material as THREE.MeshPhysicalMaterial).transmission=1;body.add(glass);
 const {geometry,bvh,triangles}=buildOpaqueGeometry([lens,body]);
 expect(triangles).toBe(2);
 const p=geometry.getAttribute('position'),n=geometry.getAttribute('normal');
 expect(p.getX(0)).toBe(2);expect(p.getZ(3)).toBeCloseTo(.5,6);
 expect(n.getY(3)).toBeCloseTo(-Math.sin(.25),6);expect(n.getZ(3)).toBeCloseTo(Math.cos(.25),6);
 const reconstructed=new THREE.BufferGeometry();reconstructed.setAttribute('position',p.clone());
 const restored=MeshBVH.deserialize(MeshBVH.serialize(bvh),reconstructed);
 const ray=new THREE.Ray(new THREE.Vector3(.02,.02,2),new THREE.Vector3(0,0,-1));
 expect(restored.raycastFirst(ray,THREE.DoubleSide)?.distance).toBeCloseTo(bvh.raycastFirst(ray,THREE.DoubleSide)!.distance,9);
 geometry.dispose();reconstructed.dispose();
});
