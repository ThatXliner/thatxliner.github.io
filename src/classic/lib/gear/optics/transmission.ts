import type {prepareTransmission} from './prepare-transmission';
import * as THREE from 'three';
import {BVHShaderGLSL} from 'three-mesh-bvh';
import {restoreTransmissionTextures} from './packed-textures';
/** Diagnostic: exact opaque triangles, spherical refraction; diffuse-only hit shading. */
export function installPatentTransmission(material:THREE.MeshPhysicalMaterial,data:Awaited<ReturnType<typeof prepareTransmission>>){
 const textures=restoreTransmissionTextures(data.textures);
 const {index,position,bvhBounds,bvhContents,color:colorTexture,normal:normalTexture}=textures;
 const uniform={index,position,bvhBounds,bvhContents};
 const bvhUniform={value:uniform},colorUniform={value:colorTexture},normalUniform={value:normalTexture};
 const debugHit={value:0};
 const accelerated={value:1};const prior=material.onBeforeCompile;
 material.onBeforeCompile=(shader,renderer)=>{
  prior(shader,renderer);shader.uniforms.chamberDebugHit=debugHit;shader.uniforms.chamberAccelerated=accelerated;shader.uniforms.chamberHeight={value:renderer.getDrawingBufferSize(new THREE.Vector2()).y};shader.uniforms.chamberBVH=bvhUniform;shader.uniforms.chamberColor=colorUniform;shader.uniforms.chamberNormal=normalUniform;
  const hitStart=shader.fragmentShader.indexOf(' bool fgHit('),hitEnd=shader.fragmentShader.indexOf(' vec3 fgReflectance(',hitStart);
  if(hitStart<0||hitEnd<0)throw new Error('Optical intersection helper changed');
  const rawHit=shader.fragmentShader.slice(hitStart,hitEnd).replace('fgHit(', 'fgRawHit(').replace('&&fgBarrelClear(p,hit)','').replace('if(!fgBarrelClear(p,point))return false;','').replace('&&dot(point.xy,point.xy)<=s.w*s.w','').replace('hit=point;n=normalize(', 'hit=point;if(dot(point.xy,point.xy)>s.w*s.w)return false;n=normalize(');
  const code=`
  ${rawHit}
  ${BVHShaderGLSL.bvh_struct_definitions}
  ${BVHShaderGLSL.common_functions}
  ${BVHShaderGLSL.bvh_ray_functions}
  uniform float chamberHeight,chamberAccelerated,chamberDebugHit;uniform BVH chamberBVH;uniform sampler2D chamberColor,chamberNormal;
  vec3 fgOpaqueColor(vec3 d,vec3 n,uvec4 face,vec3 bary){
   vec3 color=texelFetch1D(chamberColor,face.x).rgb*bary.x+texelFetch1D(chamberColor,face.y).rgb*bary.y+texelFetch1D(chamberColor,face.z).rgb*bary.z;
   vec3 smoothNormal=normalize(texelFetch1D(chamberNormal,face.x).xyz*bary.x+texelFetch1D(chamberNormal,face.y).xyz*bary.y+texelFetch1D(chamberNormal,face.z).xyz*bary.z);
   if(dot(smoothNormal,n)<0.)smoothNormal=-smoothNormal;
   vec3 worldNormal=normalize(mat3(fgWorldFromAsset)*smoothNormal);
   // Uses the modeled material's base color. No invented bright backdrop.
   // This first diagnostic omits local shadowing and specular metal response.
   return color*textureCubeUV(envMap,envMapRotation*worldNormal,1.).rgb*envMapIntensity;
  }
  bool fgOpaqueHit(vec3 p,vec3 d,out float distance,out vec3 shade){
   uvec4 face=uvec4(0);vec3 n=vec3(0.),bary=vec3(0.);float side=0.;distance=1e20;
   if(!bvhIntersectFirstHit(chamberBVH,p,d,face,n,bary,side,distance))return false;
   shade=fgOpaqueColor(d,n,face,bary);
   if(chamberDebugHit>.5){float id=texelFetch1D(chamberColor,face.x).a;shade=vec3(mod(id,256.),mod(floor(id/256.),256.),floor(id/65536.))/255.;}
   return true;
  }
  vec3 fgTransmission(){
   if(fgBatch<=-3&&int(floor(gl_FragCoord.y/chamberHeight*12.))!=-fgBatch-3)return vec3(0.);
   vec3 p=(fgAssetFromWorld*vec4(cameraPosition,1.)).xyz,d=normalize(fgPosition-p),energy=vec3(1.);
   for(int i=0;i<36;i++){
    vec3 hit=p+d*max((fgMedia[i].x-p.z)/d.z,0.),n;bool optical=fgRawHit(i,p,d,hit,n);float opaqueDistance;vec3 shade;
    bool opaque=false;
    if(chamberAccelerated<.5||!optical||!fgBarrelClear(p,hit))opaque=fgOpaqueHit(p,d,opaqueDistance,shade);
    if(opaque&&opaqueDistance<length(hit-p)-.000005)return chamberDebugHit>.5?shade:energy*shade;
    if(!optical)return vec3(0.);
    energy*=1.-fgReflectance(i,clamp(-dot(n,d),0.,1.),false);
    d=refract(d,n,fgMedia[i].y/fgMedia[i].z);if(dot(d,d)<.5)return vec3(0.);p=hit+d*.000001;
   }
   float distance;vec3 shade;return fgOpaqueHit(p,d,distance,shade)?(chamberDebugHit>.5?shade:energy*shade):vec3(0.);
  }
  `;
  shader.fragmentShader=shader.fragmentShader.replace('void main() {',code+'\nvoid main() {');
  shader.fragmentShader=shader.fragmentShader.replace('outgoingLight=fgReflections();','outgoingLight=fgBatch<=-2?fgTransmission():fgReflections();');
 };
 material.customProgramCacheKey=()=> 'patent-transmission-bvh-v1';material.needsUpdate=true;
 function dispose(){for(const texture of Object.values(textures))texture.dispose();}
 return {triangles:data.triangles,dispose};
}
