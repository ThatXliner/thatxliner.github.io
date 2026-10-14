import * as THREE from 'three';
import {MeshBVH} from 'three-mesh-bvh';
import {buildOpaqueGeometry} from './opaque-geometry';
import {packTransmissionTextures} from './packed-textures';
import type {MeshInput,AttributeInput} from './prepare-transmission';
function attribute(a:AttributeInput){return a.stride
 ?new THREE.InterleavedBufferAttribute(new THREE.InterleavedBuffer(a.array,a.stride),a.itemSize,a.offset!,a.normalized)
 :new THREE.BufferAttribute(a.array,a.itemSize,a.normalized);}
self.onmessage=(event:MessageEvent<{meshes:MeshInput[];audit:boolean}>)=>{
 try{
  const roots=[new THREE.Group(),new THREE.Group()];
  for(const input of event.data.meshes){
   const g=new THREE.BufferGeometry();g.setAttribute('position',attribute(input.position));if(input.normal)g.setAttribute('normal',attribute(input.normal));if(input.index)g.setIndex(new THREE.BufferAttribute(input.index,1));g.groups=input.groups;
   const materials=input.materials.map(m=>new THREE.MeshPhysicalMaterial({color:new THREE.Color(...m.color),opacity:m.opacity,transmission:m.transmission}));
   const mesh=new THREE.Mesh(g,materials);mesh.matrixAutoUpdate=false;mesh.matrix.fromArray(input.matrix);roots[input.lens?0:1].add(mesh);
  }
  const {geometry,bvh,triangles}=buildOpaqueGeometry(roots);
  const textures=packTransmissionTextures(bvh);
  const transfer=Object.values(textures).map(t=>t.data.buffer);
  const audit=event.data.audit?{
   serialized:MeshBVH.serialize(bvh,{cloneBuffers:false}),
   position:geometry.getAttribute('position').array,
   normal:geometry.getAttribute('normal').array,
   color:geometry.getAttribute('color').array,
  }:undefined;
  if(audit)transfer.push(audit.position.buffer,audit.normal.buffer,audit.color.buffer,audit.serialized.index!.buffer,...audit.serialized.roots);
  self.postMessage({textures,triangles,...audit},[...new Set(transfer)]);

 }catch(error){self.postMessage({error:String(error)});}
};
