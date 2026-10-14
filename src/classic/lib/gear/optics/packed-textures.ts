import * as THREE from 'three';
import {MeshBVHUniformStruct,FloatVertexAttributeTexture,type MeshBVH} from 'three-mesh-bvh';

export type PackedTexture = {
 data:THREE.TypedArray;width:number;height:number;format:THREE.PixelFormat;
 type:THREE.TextureDataType;internalFormat:THREE.PixelFormatGPU|null;
};
export type PackedTransmission = Record<'index'|'position'|'bvhBounds'|'bvhContents'|'color'|'normal',PackedTexture>;

/** CPU-only packing: run in the geometry worker, before transferring ownership. */
export function packTransmissionTextures(bvh:MeshBVH):PackedTransmission {
 const uniform=new MeshBVHUniformStruct();uniform.updateFrom(bvh);
 const color=new FloatVertexAttributeTexture();color.updateFrom(bvh.geometry.getAttribute('color'));
 const normal=new FloatVertexAttributeTexture();normal.updateFrom(bvh.geometry.getAttribute('normal'));
 const textures={index:uniform.index,position:uniform.position,bvhBounds:uniform.bvhBounds,bvhContents:uniform.bvhContents,color,normal};
 const packed={} as PackedTransmission;
 for(const key of Object.keys(textures) as (keyof PackedTransmission)[]){
  const t=textures[key];
  packed[key]={data:t.image.data as THREE.TypedArray,width:t.image.width,height:t.image.height,format:t.format,type:t.type,internalFormat:t.internalFormat};
 }
 uniform.dispose();color.dispose();normal.dispose();
 return packed;
}

/** Wrap transferred storage without repacking or copying it on the UI thread. */
export function restoreTransmissionTextures(packed:PackedTransmission){
 const textures={} as Record<keyof PackedTransmission,THREE.DataTexture>;
 for(const key of Object.keys(packed) as (keyof PackedTransmission)[]){
  const p=packed[key],t=new THREE.DataTexture(p.data,p.width,p.height,p.format,p.type);
  t.internalFormat=p.internalFormat;t.needsUpdate=true;textures[key]=t;
 }
 return textures;
}
