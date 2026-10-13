import * as THREE from 'three';
import {MeshBVH} from 'three-mesh-bvh';
import {buildOpaqueGeometry} from './opaque-geometry';
import type {MeshInput,AttributeInput} from './prepare-transmission';
function attribute(a:AttributeInput){return a.stride
 ?new THREE.InterleavedBufferAttribute(new THREE.InterleavedBuffer(a.array,a.stride),a.itemSize,a.offset!,a.normalized)
 :new THREE.BufferAttribute(a.array,a.itemSize,a.normalized);}
self.onmessage=(event:MessageEvent<MeshInput[]>)=>{
 try{
  const roots=[new THREE.Group(),new THREE.Group()];
  for(const input of event.data){
   const g=new THREE.BufferGeometry();g.setAttribute('position',attribute(input.position));if(input.normal)g.setAttribute('normal',attribute(input.normal));if(input.index)g.setIndex(new THREE.BufferAttribute(input.index,1));g.groups=input.groups;
   const materials=input.materials.map(m=>new THREE.MeshPhysicalMaterial({color:new THREE.Color(...m.color),opacity:m.opacity,transmission:m.transmission}));
   const mesh=new THREE.Mesh(g,materials);mesh.matrixAutoUpdate=false;mesh.matrix.fromArray(input.matrix);roots[input.lens?0:1].add(mesh);
  }
  const {geometry,bvh,triangles}=buildOpaqueGeometry(roots);
  const serialized=MeshBVH.serialize(bvh,{cloneBuffers:false});
  const position=geometry.getAttribute('position').array,normal=geometry.getAttribute('normal').array,color=geometry.getAttribute('color').array;
  self.postMessage({serialized,position,normal,color,triangles},[position.buffer,normal.buffer,color.buffer,serialized.index!.buffer,...serialized.roots]);
 }catch(error){self.postMessage({error:String(error)});}
};
