import * as THREE from 'three';
import type {MeshBVH} from 'three-mesh-bvh';
export type AttributeInput={array:THREE.TypedArray;itemSize:number;normalized:boolean;stride?:number;offset?:number};
export type MeshInput={position:AttributeInput;normal?:AttributeInput;index?:THREE.TypedArray;matrix:number[];lens:boolean;groups:THREE.BufferGeometry['groups'];materials:{color:[number,number,number];opacity:number;transmission:number}[]};
type Prepared={serialized:ReturnType<typeof MeshBVH.serialize>;position:Float32Array;normal:Float32Array;color:Float32Array;triangles:number};
function attribute(a:THREE.BufferAttribute|THREE.InterleavedBufferAttribute):AttributeInput{
 return a instanceof THREE.InterleavedBufferAttribute
  ?{array:a.data.array,itemSize:a.itemSize,normalized:a.normalized,stride:a.data.stride,offset:a.offset}
  :{array:a.array,itemSize:a.itemSize,normalized:a.normalized};
}
export function prepareTransmission(objects:THREE.Object3D[],assetFromWorld:THREE.Matrix4,signal:AbortSignal):Promise<Prepared>{
 signal.throwIfAborted();const inputs:MeshInput[]=[],sources:THREE.Mesh[]=[];
 for(const root of objects){root.updateMatrixWorld(true);root.traverse(o=>{
  if(!(o instanceof THREE.Mesh)||o.name.startsWith('Patent_element'))return;
  const g=o.geometry,position=g.getAttribute('position'),normal=g.getAttribute('normal');if(!position)return;
  const materials=(Array.isArray(o.material)?o.material:[o.material]).map(m=>m instanceof THREE.MeshStandardMaterial
   ?{color:m.color.toArray() as [number,number,number],opacity:m.opacity,transmission:(m as THREE.MeshPhysicalMaterial).transmission??0}
   :{color:[0,0,0] as [number,number,number],opacity:0,transmission:1});
  sources.push(o);inputs.push({position:attribute(position),normal:normal?attribute(normal):undefined,index:g.getIndex()?.array,matrix:new THREE.Matrix4().multiplyMatrices(assetFromWorld,o.matrixWorld).toArray(),lens:root===objects[0],groups:g.groups,materials});
 });}
 return new Promise((resolve,reject)=>{
  const worker=new Worker(new URL('./opaque.worker.ts',import.meta.url),{type:'module'});
  const cleanup=()=>{worker.terminate();signal.removeEventListener('abort',abort);};
  const abort=()=>{cleanup();reject(signal.reason);};
  signal.addEventListener('abort',abort,{once:true});
  worker.onerror=event=>{cleanup();reject(new Error(event.message));};
  worker.onmessage=async event=>{
   cleanup();
   try{
    if(event.data.error)throw new Error(event.data.error);
    if(import.meta.env.DEV&&new URLSearchParams(location.search).has('opticsAudit')){
     const {buildOpaqueGeometry}=await import('./opaque-geometry');
     const {MeshBVH}=await import('three-mesh-bvh');signal.throwIfAborted();
     for(const root of objects)root.updateMatrixWorld(true);
     const moved=sources.flatMap((mesh,i)=>{const current=new THREE.Matrix4().multiplyMatrices(assetFromWorld,mesh.matrixWorld).elements;const delta=Math.max(...current.map((n,j)=>Math.abs(n-inputs[i].matrix[j])));return delta?[{mesh:mesh.name,delta,before:inputs[i].matrix,after:current}]:[];});
     const reference=buildOpaqueGeometry(objects,assetFromWorld),serialized=MeshBVH.serialize(reference.bvh,{cloneBuffers:false});
     const equal=(a:ArrayLike<number>,b:ArrayLike<number>)=>a.length===b.length&&Array.from(a).every((n,i)=>Object.is(n,b[i]));
     const checks={position:equal(reference.geometry.getAttribute('position').array,event.data.position),normal:equal(reference.geometry.getAttribute('normal').array,event.data.normal),color:equal(reference.geometry.getAttribute('color').array,event.data.color),index:equal(serialized.index!,event.data.serialized.index),bounds:serialized.roots.every((r,i)=>equal(new Uint8Array(r),new Uint8Array(event.data.serialized.roots[i])))};
     const differences:Record<string,unknown>={};
     for(const key of ['position','normal'] as const){const a=reference.geometry.getAttribute(key).array,b=event.data[key];let max=0,count=0;const examples=[];for(let i=0;i<a.length;i++)if(!Object.is(a[i],b[i])){count++;max=Math.max(max,Math.abs(a[i]-b[i]));if(examples.length<6)examples.push({i,reference:a[i],worker:b[i]});}differences[key]={count,max,examples};}
     reference.geometry.dispose();console.debug('Optical worker equivalence',JSON.stringify({checks,differences,moved}));
     if(!Object.values(checks).every(Boolean))throw new Error('Worker geometry differs from original scene');
    }
    resolve(event.data);
   }catch(error){reject(error);}
  };
  try{worker.postMessage(inputs);}catch(error){cleanup();reject(error);}
 });
}
