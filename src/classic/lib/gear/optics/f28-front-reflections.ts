import * as THREE from 'three';
// Section-diagram geometry shared with build_models.py, not an optical prescription.
import frontGroup from './f28-front-group.json';
const elements = frontGroup.elements;
export const frontSurfaces=elements.flatMap(e=>[1,-1].map(side=>{
 const sag=side===1?e.front:e.back;
 const radius=(e.r*e.r+sag*sag)/(2*Math.abs(sag));
 const vertex=e.z+side*e.edge/2+sag;
 return {vertex,center:vertex-Math.sign(sag)*radius,radius,cap:Math.sign(sag),clear:e.r,ni:side===1?1:1.52,nt:side===1?1.52:1};
}));
const f=(v:number)=>v.toFixed(10);
export function installFrontReflections({mesh,coating="film"}:{mesh:THREE.Mesh;coating?:"film"|"reference"}){
 const m=mesh.material;if(!(m instanceof THREE.MeshPhysicalMaterial))throw new Error('Expected optical physical material');
 m.iridescence=1; // Compile the thin-film helper for the comparison branch.
 mesh.updateWorldMatrix(true,false);
 const assetFromMesh=mesh.matrixWorld.clone();
 const assetFromWorld={value:new THREE.Matrix4()},worldFromAsset={value:new THREE.Matrix4()};
 m.onBeforeRender=(_r,_s,_c,_g,o)=>{assetFromWorld.value.copy(o.matrixWorld).invert().premultiply(assetFromMesh);worldFromAsset.value.copy(assetFromWorld.value).invert();};
 m.onBeforeCompile=shader=>{
 shader.uniforms.frAssetFromMesh={value:assetFromMesh};shader.uniforms.frAssetFromWorld=assetFromWorld;shader.uniforms.frWorldFromAsset=worldFromAsset;
 shader.vertexShader='uniform mat4 frAssetFromMesh;varying vec3 frPosition;\n'+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfrPosition=(frAssetFromMesh*vec4(position,1.)).xyz;');
 shader.fragmentShader='uniform mat4 frAssetFromWorld,frWorldFromAsset;varying vec3 frPosition;\n'+shader.fragmentShader;
 const code=`
 const vec4 frSurfaces[${frontSurfaces.length}]=vec4[${frontSurfaces.length}](${frontSurfaces.map(s=>`vec4(${[s.center,s.radius,s.cap,s.clear].map(f).join(',')})`).join(',')});
 const vec3 frMedia[${frontSurfaces.length}]=vec3[${frontSurfaces.length}](${frontSurfaces.map(s=>`vec3(${[s.vertex,s.ni,s.nt].map(f).join(',')})`).join(',')});
 bool frHit(int i,vec3 p,vec3 d,out vec3 h,out vec3 n){
  vec4 s=frSurfaces[i];float dz=p.z-frMedia[i].x,offset=frMedia[i].x-s.x;
  float b=dot(p.xy,d.xy)+(dz+offset)*d.z,c=dot(p.xy,p.xy)+dz*(dz+2.*offset),disc=b*b-c;
  if(disc<0.)return false;
  float q=-b-(b<0.?-1.:1.)*sqrt(disc);if(abs(q)<1e-8)return false;
  vec2 roots=vec2(q,c/q);if(roots.x>roots.y)roots=roots.yx;
  for(int k=0;k<2;k++){
   vec3 point=p+roots[k]*d;
   if(roots[k]>1e-7&&s.z*(point.z-s.x)>0.&&dot(point.xy,point.xy)<=s.w*s.w){
    h=point;n=normalize(point-vec3(0.,0.,s.x));if(dot(n,d)>0.)n=-n;return true;
   }
  }return false;
 }
 vec3 frCoat(int i,float ci,bool reverse){
  float ni=reverse?frMedia[i].z:frMedia[i].y,nt=reverse?frMedia[i].y:frMedia[i].z;
  float sin2=pow(ni/nt,2.)*(1.-ci*ci);if(sin2>=1.)return vec3(1.);
  float ca=ni==1.?ci:sqrt(1.-sin2),ng=max(ni,nt);
  ${coating === "reference"
    // Empirical normal-incidence RGB reflectance, not measured coating data.
    // Schlick's grazing term approaches neutral white without a spectral sweep.
    ? "return mix(vec3(.008,.016,.006),vec3(1.),pow(1.-ca,5.));"
    : "return clamp(evalIridescence(1.,1.38,ca,400.,vec3(pow((ng-1.)/(ng+1.),2.))),0.,1.);"}
 }
 vec3 frEscape(int from,vec3 p,vec3 d,out vec3 direction){
  vec3 energy=vec3(1.);direction=vec3(0.,0.,1.);
  for(int k=from-1;k>=0;k--){
   vec3 h,n;if(!frHit(k,p,d,h,n))return vec3(0.);
   energy*=1.-frCoat(k,clamp(-dot(n,d),0.,1.),true);
   d=refract(d,n,frMedia[k].z/frMedia[k].y);if(dot(d,d)<.5)return vec3(0.);p=h+d*1e-6;
  }
  if(d.z<=1e-5)return vec3(0.);
  vec2 opening=p.xy+d.xy*((3.634-p.z)/d.z);
  if(length(opening)>.62629)return vec3(0.);
  direction=normalize(mat3(frWorldFromAsset)*d);return energy;
 }
 vec3 frReflections(){
  vec3 p=(frAssetFromWorld*vec4(cameraPosition,1.)).xyz,d=normalize(frPosition-p),energy=vec3(1.),radiance=vec3(0.);
  for(int i=0;i<${frontSurfaces.length};i++){
   vec3 h,n;if(!frHit(i,p,d,h,n))break;
   vec3 r=frCoat(i,clamp(-dot(n,d),0.,1.),false),rd=reflect(d,n),worldDirection;
   vec3 escaped=frEscape(i,h+rd*1e-6,rd,worldDirection);
   radiance+=energy*r*escaped*textureCubeUV(envMap,envMapRotation*worldDirection,.035).rgb*envMapIntensity;
   energy*=1.-r;d=refract(d,n,frMedia[i].y/frMedia[i].z);if(dot(d,d)<.5)break;p=h+d*1e-6;
  }return radiance;
 }
 `;
 shader.fragmentShader=shader.fragmentShader.replace('void main() {',code+'\nvoid main() {');
 shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight=totalDiffuse+frReflections()+totalEmissiveRadiance;\n#include <opaque_fragment>');
 };
 m.customProgramCacheKey=()=> 'f28-front-diagram-interfaces-review-v3-'+coating;m.needsUpdate=true;
}
