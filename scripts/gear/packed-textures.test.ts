import {expect,test} from 'bun:test';
import * as THREE from 'three';
import {MeshBVH,MeshBVHUniformStruct,FloatVertexAttributeTexture} from 'three-mesh-bvh';
import {packTransmissionTextures,restoreTransmissionTextures} from '../../src/classic/lib/gear/optics/packed-textures';

test('transferred optical textures match direct BVH packing byte-for-byte',()=>{
 const geometry=new THREE.BoxGeometry(1,2,3,2,2,2);
 geometry.clearGroups();
 const colors=new Float32Array(geometry.getAttribute('position').count*4);
 for(let i=0;i<colors.length;i++)colors[i]=(i%17)/17;
 geometry.setAttribute('color',new THREE.BufferAttribute(colors,4));
 const bvh=new MeshBVH(geometry);
 const uniform=new MeshBVHUniformStruct();uniform.updateFrom(bvh);
 const color=new FloatVertexAttributeTexture();color.updateFrom(geometry.getAttribute('color'));
 const normal=new FloatVertexAttributeTexture();normal.updateFrom(geometry.getAttribute('normal'));
 const reference={index:uniform.index,position:uniform.position,bvhBounds:uniform.bvhBounds,bvhContents:uniform.bvhContents,color,normal};
 const packed=packTransmissionTextures(bvh);
 const transferred=structuredClone(packed,{transfer:[...new Set(Object.values(packed).map(t=>t.data.buffer))]});
 const restored=restoreTransmissionTextures(transferred);
 for(const key of Object.keys(reference) as (keyof typeof reference)[]){
  const expected=reference[key],actual=restored[key];
  expect(packed[key].data.byteLength).toBe(0);
  expect(actual.image.data).toBe(transferred[key].data);
  expect(new Uint8Array(actual.image.data.buffer)).toEqual(new Uint8Array(expected.image.data.buffer));
  for(const property of ['format','type','internalFormat','minFilter','magFilter','generateMipmaps','flipY','unpackAlignment'] as const)expect(actual[property]).toBe(expected[property]);
  expect([actual.image.width,actual.image.height]).toEqual([expected.image.width,expected.image.height]);
  actual.dispose();
 }
 uniform.dispose();color.dispose();normal.dispose();geometry.dispose();
});
