import * as THREE from 'three';
import {MeshBVH} from 'three-mesh-bvh';
export function buildOpaqueGeometry(objects:THREE.Object3D[],assetFromWorld=new THREE.Matrix4()){
 const full=false;
 const positions:number[]=[],colors:number[]=[],normals:number[]=[];let triangles=0,sourceId=0;const ranges:{start:number,end:number,mesh:string,material:string}[]=[];
 const vertices=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];
 function intersectsInterior(){
  if(Math.min(...vertices.map(v=>v.z))>3.3||Math.max(...vertices.map(v=>v.z))<-1)return false;
  const crosses=vertices.map((a,i)=>{const b=vertices[(i+1)%3];return a.x*b.y-a.y*b.x;});
  const area=crosses.reduce((a,b)=>a+b,0);
  if(Math.abs(area)>1e-12&&(crosses.every(c=>c>=0)||crosses.every(c=>c<=0)))return true;
  return vertices.some((a,i)=>{const b=vertices[(i+1)%3],dx=b.x-a.x,dy=b.y-a.y;
   const t=Math.max(0,Math.min(1,-(a.x*dx+a.y*dy)/(dx*dx+dy*dy||1)));
   return (a.x+t*dx)**2+(a.y+t*dy)**2<=.56**2;
  });
 }
 for(const root of objects){root.updateMatrixWorld(true);root.traverse(o=>{
  if(!(o instanceof THREE.Mesh)||o.name.startsWith('Patent_element'))return;
  const g=o.geometry,pos=g.getAttribute('position'),normal=g.getAttribute('normal'),idx=g.getIndex();const toAsset=new THREE.Matrix4().multiplyMatrices(assetFromWorld,o.matrixWorld);const normalMatrix=new THREE.Matrix3().getNormalMatrix(toAsset);if(!pos)return;
  const count=idx?idx.count:pos.count,groups=g.groups.length?g.groups:[{start:0,count,materialIndex:0}];
  for(const group of groups){const m=(Array.isArray(o.material)?o.material[group.materialIndex??0]:o.material) as THREE.MeshStandardMaterial;
   if(!m||!(m instanceof THREE.MeshStandardMaterial)||(m as THREE.MeshPhysicalMaterial).transmission>0||m.opacity<.5)continue;
   const range={start:sourceId,end:sourceId,mesh:o.name,material:m.name};ranges.push(range);
   for(let k=group.start;k<Math.min(group.start+group.count,count);k+=3){
    const id=sourceId++;range.end=sourceId;
    for(let j=0;j<3;j++)vertices[j].fromBufferAttribute(pos,idx?idx.getX(k+j):k+j).applyMatrix4(toAsset);
    if(!full&&root!==objects[0]&&!intersectsInterior())continue;
    const faceNormal=new THREE.Vector3().subVectors(vertices[1],vertices[0]).cross(new THREE.Vector3().subVectors(vertices[2],vertices[0])).normalize();
    for(let j=0;j<3;j++){const v=vertices[j];positions.push(...v.toArray());colors.push(m.color.r,m.color.g,m.color.b,id+1);const n=normal?new THREE.Vector3().fromBufferAttribute(normal,idx?idx.getX(k+j):k+j).applyMatrix3(normalMatrix).normalize():faceNormal;normals.push(n.x,n.y,n.z); }
    triangles++;
   }
  }
 });}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));
 geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
 const bvh=new MeshBVH(geometry,{targetLeafSize:8});
 return {triangles,bvh,geometry};
}
