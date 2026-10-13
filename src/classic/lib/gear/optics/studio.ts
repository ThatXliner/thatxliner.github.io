import {prepareTransmission} from './prepare-transmission';
import * as THREE from 'three';
import {createOpticalWorkQueue} from '../optical-work';
import {installPatentReflections,createPatentCoatingLUT} from './reflections';
import {installPatentTransmission} from './transmission';

/** Candidate prescription renderer; currently enabled only for local review. */
export async function createF4Optics(renderer:THREE.WebGLRenderer,camera:THREE.Camera,environment:THREE.Texture,lens:THREE.Group,assembly:THREE.Group,onComplete:()=>void,signal:AbortSignal){
 const setupStart=performance.now();
 assembly.updateMatrixWorld(true);
 const optics:THREE.Mesh[]=[];
 lens.traverse(o=>{if(o instanceof THREE.Mesh&&o.name.startsWith('Patent_element'))optics.push(o);});
 const first=optics.find(o=>/01$/.test(o.name));
 if(!first)throw new Error('Prescription front element is missing');
 const assetFromWorld=lens.matrixWorld.clone().invert();
 const prepared=await prepareTransmission([lens,...assembly.children.filter(o=>o!==lens)],assetFromWorld,signal);
 signal.throwIfAborted();const uploadStart=performance.now();
 const original=first.material as THREE.MeshPhysicalMaterial;
 const visibility=optics.map(o=>o.visible);
 const size=renderer.getDrawingBufferSize(new THREE.Vector2());
 const owned:{dispose():void}[]=[];
 const keep=<T extends {dispose():void}>(resource:T):T=>{owned.push(resource);return resource;};
 const release=()=>{for(const resource of owned.splice(0).reverse())resource.dispose();};
 try{
 const accumulation=keep(new THREE.WebGLRenderTarget(size.x,size.y,{type:THREE.HalfFloatType}));
 const coat=keep(createPatentCoatingLUT(renderer));
 const rayScene=new THREE.Scene();rayScene.environment=environment;rayScene.environmentIntensity=.65;
 const rayMat=keep(original.clone());rayMat.transmission=0;rayMat.side=THREE.FrontSide;rayMat.envMap=environment;rayMat.envMapIntensity=.65;rayMat.toneMapped=false;rayMat.blending=THREE.AdditiveBlending;rayMat.transparent=true;rayMat.depthWrite=false;
 const rayMesh=new THREE.Mesh(first.geometry,rayMat);rayMesh.matrixAutoUpdate=false;rayMesh.matrix.copy(first.matrixWorld);rayScene.add(rayMesh);
 const ray=installPatentReflections(rayMesh,coat.texture,true,new THREE.Matrix4().multiplyMatrices(assetFromWorld,first.matrixWorld));ray.value=1;
 const chamber=keep(installPatentTransmission(rayMat,prepared));
 const composed={value:false};const display=keep(original.clone());display.transmission=0;display.envMap=environment;display.envMapIntensity=.65;
 display.onBeforeCompile=shader=>{
  shader.uniforms.completeOptics=composed;shader.uniforms.reflectionImage={value:accumulation.texture};shader.uniforms.canvasSize={value:size};
  shader.fragmentShader='uniform bool completeOptics;uniform sampler2D reflectionImage;uniform vec2 canvasSize;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight=completeOptics?texture2D(reflectionImage,gl_FragCoord.xy/canvasSize).rgb:totalSpecular;\n#include <opaque_fragment>');
 };
 display.customProgramCacheKey=()=> 'f4-prescription-composite-v1';
 first.material=display;for(const o of optics)o.visible=o===first;
 const queue=keep(createOpticalWorkQueue(renderer.getContext() as WebGL2RenderingContext));
 let abort=new AbortController(),disposed=false,building=false,ready=false;
 function invalidate(){abort.abort();abort=new AbortController();composed.value=false;ready=false;building=false;}
 function pass(batch:number,clear:boolean){
  const previous=renderer.getRenderTarget(),auto=renderer.autoClear,alpha=renderer.getClearAlpha(),color=renderer.getClearColor(new THREE.Color());
  try{renderer.setRenderTarget(accumulation);renderer.autoClear=false;renderer.setClearColor(0,0);if(clear)renderer.clear();else renderer.clearDepth();ray.batch.value=batch;renderer.render(rayScene,camera);}
  finally{renderer.setRenderTarget(previous);renderer.autoClear=auto;renderer.setClearColor(color,alpha);}
 }
 async function refine(){
  if(disposed||building||ready)return;
  building=true;const signal=abort.signal;
  try{
   await renderer.compileAsync(rayScene,camera);
   for(let i=0;i<24;i++){
    if(disposed||signal.aborted)return;
    if(!await queue.run(()=>pass(i<12?-3-i:i-12,i===0),signal))return;
   }
   if(disposed||signal.aborted)return;
   composed.value=true;ready=true;onComplete();
  }finally{if(signal===abort.signal)building=false;}
 }
 console.debug("Optical setup cost",JSON.stringify({wallMs:performance.now()-setupStart,uploadCpuMs:performance.now()-uploadStart,triangles:chamber.triangles,pixels:size.x*size.y}));
 return {invalidate,refine,dispose(){
  if(disposed)return;disposed=true;abort.abort();queue.dispose();first.material=original;
  optics.forEach((o,i)=>o.visible=visibility[i]);release();
 }};
 }catch(error){first.material=original;optics.forEach((o,i)=>o.visible=visibility[i]);release();throw error;}
}
