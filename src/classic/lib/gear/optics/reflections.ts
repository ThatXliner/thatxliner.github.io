import * as THREE from 'three';
import barrelProfile from './f4-patent-barrel-profile.json';
import prescription from './f4-patent-prescription.json';
const scale=1/55;
const scenario=prescription.scenarios[0];
const front=.088+(scenario.first_vertex_to_sensor_mm-44)*scale;
export const surfaces=scenario.surfaces.map(s=>({center:front-(s.z_mm+(s.radius_mm??0))*scale,radius:Math.abs(s.radius_mm??0)*scale,side:Math.sign(s.radius_mm??0),clear:s.estimated_clear_diameter_mm/2*scale,vertex:front-s.z_mm*scale,ni:s.index_before,nt:s.index_after}));
const f=(n:number)=>n.toFixed(10);
function minRadiusSquared(){return Math.min(...barrelProfile.map(s=>Math.min(s[2],s[3])*Math.cos(Math.PI/s[4])))**2;}

export function patentShader(){
 const bounds=[0,.35,1.42,1.45,2.5,2.70,2.72,2.83,2.85,2.96,2.98,3.3];
 const clearBounds=bounds.slice(0,-1).flatMap((low,j)=>bounds.slice(j+1).map(high=>{
  const touched=barrelProfile.filter(s=>s[1]>=low&&s[0]<=high);
  return {low,high,radius:Math.min(...touched.map(s=>Math.min(s[2],s[3])*Math.cos(Math.PI/s[4])))};
 }));
 return `
 const vec4 fgBarrel[${barrelProfile.length}]=vec4[${barrelProfile.length}](${barrelProfile.map(s=>`vec4(${s.slice(0,4).map(f).join(',')})`).join(',')});
 const float fgSides[${barrelProfile.length}]=float[${barrelProfile.length}](${barrelProfile.map(s=>f(s[4])).join(',')});
 bool fgInsideBarrel(vec2 p,float radius,float sides){
  float length2=dot(p,p),inradius=radius*cos(PI/sides);
  if(length2<=inradius*inradius)return true;
  if(length2>radius*radius)return false;
  float angle=mod(atan(p.y,p.x),2.*PI/sides)-PI/sides;
  return sqrt(length2)*cos(angle)<=inradius;
 }
 bool fgBarrelClear(vec3 p,vec3 end){
  float dz=end.z-p.z,lo=min(p.z,end.z),hi=max(p.z,end.z);
  float radialMax=max(dot(p.xy,p.xy),dot(end.xy,end.xy));
  if(radialMax<${f(minRadiusSquared())})return true;
  ${clearBounds.filter(b=>b.high===3.3&&b.low>=1.45).map(b=>`if(lo>=${f(b.low)}&&hi<=3.3&&radialMax<${f(b.radius*b.radius)})return true;`).join('\n')}
  int low=0,high=${barrelProfile.length};
  for(int step=0;step<6;step++){
   if(low>=high)break;
   int mid=(low+high)/2;
   if(fgBarrel[mid].y<lo)low=mid+1;else high=mid;
  }
  for(int i=low;i<${barrelProfile.length};i++){
   vec4 s=fgBarrel[i];if(hi<s.x)break;
   vec2 t=vec2(0.,1.);
   if(abs(dz)>=.000000001){t=(s.xy-p.z)/dz;if(t.x>t.y)t=t.yx;t=vec2(max(0.,t.x),min(1.,t.y));}
   if(t.x>t.y)continue;
   for(int k=0;k<2;k++){
    vec3 point=mix(p,end,t[k]);float radius=mix(s.z,s.w,(point.z-s.x)/(s.y-s.x));
    if(!fgInsideBarrel(point.xy,radius,fgSides[i]))return false;
   }
  }
  return true;
 }


 const vec4 fgSurfaces[36]=vec4[36](${surfaces.map(s=>`vec4(${[s.center,s.radius,s.side,s.clear].map(f).join(',')})`).join(',')});
 const vec3 fgMedia[36]=vec3[36](${surfaces.map(s=>`vec3(${[s.vertex,s.ni,s.nt].map(f).join(',')})`).join(',')});
 bool fgHit(int i,vec3 p,vec3 d,out vec3 hit,out vec3 n){
  vec4 s=fgSurfaces[i];float vertex=fgMedia[i].x;
  if(s.y==0.){
   if(abs(d.z)<.000001)return false;
   float t=(vertex-p.z)/d.z;if(t<=0.)return false;
   hit=p+t*d;n=vec3(0.,0.,d.z<0.?1.:-1.);
   return dot(hit.xy,hit.xy)<=s.w*s.w&&fgBarrelClear(p,hit);
  }
  float dz=p.z-vertex,offset=vertex-s.x;
  float b=dot(p.xy,d.xy)+(dz+offset)*d.z;
  float c=dot(p.xy,p.xy)+dz*(dz+2.*offset);
  float disc=b*b-c;if(disc<0.)return false;
  float q=-b-(b<0.?-1.:1.)*sqrt(disc);
  if(abs(q)<.00000001)return false;
  vec2 roots=vec2(q,c/q);if(roots.x>roots.y)roots=roots.yx;
  for(int k=0;k<2;k++){
   float t=roots[k];vec3 point=p+t*d;
   if(t>.0000001&&s.z*(point.z-s.x)>0.&&dot(point.xy,point.xy)<=s.w*s.w){
    if(!fgBarrelClear(p,point))return false;
    hit=point;n=normalize(point-vec3(0.,0.,s.x));if(dot(n,d)>0.)n=-n;return true;
   }
  }
  return false;
 }
 vec3 fgReflectance(int i,float ci,bool reverse){
  if(i==18)return vec3(0.);
  float ni=reverse?fgMedia[i].z:fgMedia[i].y,nt=reverse?fgMedia[i].y:fgMedia[i].z;
  float sin2=pow(ni/nt,2.)*(1.-ci*ci);if(sin2>=1.)return vec3(1.);
  float ct=sqrt(1.-sin2);
  // Cemented interfaces have no air/film boundary. Coating is an explicit
  // diagnostic approximation, not manufacturer multilayer data.
  if(fgCoated>.5&&(ni==1.||nt==1.)){
   float ca=ni==1.?ci:ct,ng=max(ni,nt);
   return texture2D(fgCoatingLUT,vec2((ca*255.+.5)/256.,(float(i)+.5)/36.)).rgb;
  }
  float rs=(ni*ci-nt*ct)/(ni*ci+nt*ct),rp=(nt*ci-ni*ct)/(nt*ci+ni*ct);
  return vec3(.5*(rs*rs+rp*rp));
 }
 vec3 fgEscape(int from,vec3 p,vec3 d,out vec3 worldDirection){
  vec3 energy=vec3(1.);worldDirection=vec3(0.,0.,1.);
  for(int k=from-1;k>=0;k--){
   vec3 hit,n;if(!fgHit(k,p,d,hit,n))return vec3(0.);
   energy*=1.-fgReflectance(k,clamp(-dot(n,d),0.,1.),true);
   d=refract(d,n,fgMedia[k].z/fgMedia[k].y);
   if(dot(d,d)<.5)return vec3(0.);p=hit+d*.000001;
  }
  if(d.z<=.00001)return vec3(0.);
  vec3 end=p+d*((3.3-p.z)/d.z);
  if(!fgBarrelClear(p,end))return vec3(0.);
  worldDirection=normalize(mat3(fgWorldFromAsset)*d);return energy;
 }
 vec3 fgReflections(){
  vec3 p=(fgAssetFromWorld*vec4(cameraPosition,1.)).xyz;
  vec3 d=normalize(fgPosition-p),energy=vec3(1.),radiance=vec3(0.);
  for(int i=0;i<36;i++){
   vec3 hit,n;if(!fgHit(i,p,d,hit,n))break;
   vec3 R=fgReflectance(i,clamp(-dot(n,d),0.,1.),false);
   if(i!=18&&(fgBatch<0||i%fgBatchCount==fgBatch)){
    vec3 rd=reflect(d,n),worldDirection;
    vec3 escaped=fgEscape(i,hit+rd*.000001,rd,worldDirection);
    radiance+=energy*R*escaped*textureCubeUV(envMap,envMapRotation*worldDirection,.025).rgb*envMapIntensity;
   }
   energy*=1.-R;d=refract(d,n,fgMedia[i].y/fgMedia[i].z);
   if(dot(d,d)<.5)break;p=hit+d*.000001;
  }
  return radiance;
 }
 `;
}
export function installPatentReflections(mesh:THREE.Mesh,coatingLUT:THREE.Texture,reflectionOnly=false,meshToAsset?:THREE.Matrix4){
 mesh.updateWorldMatrix(true,false);const assetFromMesh=meshToAsset?.clone()??mesh.matrixWorld.clone();
 const assetFromWorld={value:new THREE.Matrix4()},worldFromAsset={value:new THREE.Matrix4()},coated={value:0,batch:{value:-1},batchCount:{value:12}};
 const material=mesh.material as THREE.MeshPhysicalMaterial;
 material.iridescence=1; // Compile the shared thin-film helper, overriding its output below.
 material.onBeforeRender=(_r,_s,_c,_g,object)=>{assetFromWorld.value.copy(object.matrixWorld).invert().premultiply(assetFromMesh);worldFromAsset.value.copy(assetFromWorld.value).invert();};
 material.onBeforeCompile=shader=>{
  shader.uniforms.fgBatch=coated.batch;shader.uniforms.fgBatchCount=coated.batchCount;shader.uniforms.fgCoatingLUT={value:coatingLUT};shader.uniforms.fgCoated=coated;shader.uniforms.fgAssetFromMesh={value:assetFromMesh};shader.uniforms.fgAssetFromWorld=assetFromWorld;shader.uniforms.fgWorldFromAsset=worldFromAsset;
  shader.vertexShader='uniform mat4 fgAssetFromMesh; varying vec3 fgPosition;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfgPosition=(fgAssetFromMesh*vec4(position,1.)).xyz;');
  shader.fragmentShader='uniform int fgBatch,fgBatchCount; uniform sampler2D fgCoatingLUT; uniform float fgCoated; uniform mat4 fgAssetFromWorld; uniform mat4 fgWorldFromAsset; varying vec3 fgPosition;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('void main() {',patentShader()+'\nvoid main() {');
  if(!shader.fragmentShader.includes('#include <opaque_fragment>'))throw new Error('Physical output changed');
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',(reflectionOnly?'outgoingLight=fgReflections();':'outgoingLight=totalDiffuse+fgReflections()+totalEmissiveRadiance;')+'\n#include <opaque_fragment>');
 };
 material.customProgramCacheKey=()=> 'patent-36-spheres-batched-v3-'+reflectionOnly;material.needsUpdate=true;return coated;
}
export function createPatentCoatingLUT(renderer:THREE.WebGLRenderer){
 const target=new THREE.WebGLRenderTarget(256,36,{type:THREE.HalfFloatType,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:false});
 const mat=new THREE.ShaderMaterial({vertexShader:'void main(){gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`
 #define USE_IRIDESCENCE
 #include <common>
 #include <iridescence_fragment>
 const float indices[36]=float[36](${surfaces.map(s=>f(Math.max(s.ni,s.nt))).join(',')});
 void main(){float ca=(gl_FragCoord.x-.5)/255.;float ng=indices[int(gl_FragCoord.y)];gl_FragColor=vec4(clamp(evalIridescence(1.,1.38,ca,99.638,vec3(pow((ng-1.)/(ng+1.),2.))),0.,1.),1.);}`});
 const geo=new THREE.PlaneGeometry(2,2),scene=new THREE.Scene();scene.add(new THREE.Mesh(geo,mat));const previous=renderer.getRenderTarget();renderer.setRenderTarget(target);renderer.render(scene,new THREE.Camera());renderer.setRenderTarget(previous);geo.dispose();mat.dispose();return target;
}
