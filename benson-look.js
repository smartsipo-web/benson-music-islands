import * as THREE from 'three';
// A small, articulated baseball-uniform figurine based on Benson's reference video.
export function dressBenson({body,limbs,head,torso}){
 const navy=new THREE.MeshStandardMaterial({color:0x17283c,roughness:.85}),white=new THREE.MeshStandardMaterial({color:0xe9e6da,roughness:.7}),skin=new THREE.MeshStandardMaterial({color:0xf2c598});torso.material=navy;head.scale.set(1.04,1.04,.97);
 function line(parent,points,r=.007){const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),12,r,5,false),white);parent.add(m);}
 function block(parent,w,h,d,mat,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);parent.add(m);return m;}
 line(body,[[-.12,.68,.095],[-.075,.6,.16],[0,.55,.18],[.075,.6,.16],[.12,.68,.095]]);
 line(body,[[0,.55,.18],[0,.4,.184],[0,.18,.14]]);
 for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.012,8,6),white);b.position.set(.02,.5-i*.085,.181);body.add(b);}
 for(const [i,arm] of [limbs[1],limbs[3]].entries()){const sleeve=arm.children.find(o=>o.geometry?.type==='BoxGeometry');sleeve.material=navy;sleeve.scale.y=.55;sleeve.position.y=-.05;block(arm,.085,.13,.09,skin,0,-.18,0);line(arm,[[-.055,-.12,.065],[0,-.12,.07],[.055,-.12,.065]]);}
 for(const leg of [limbs[0],limbs[2]]){const shorts=leg.children.find(o=>o.geometry?.type==='BoxGeometry');shorts.material=navy;shorts.scale.y=.58;shorts.position.y=-.055;block(leg,.09,.13,.1,skin,0,-.17,0);line(leg,[[-.06,-.13,.07],[0,-.13,.075],[.06,-.13,.07]]);}
 const patch=new THREE.Mesh(new THREE.PlaneGeometry(.092,.07),new THREE.MeshStandardMaterial({color:0xb34738,side:THREE.DoubleSide}));patch.position.set(-.095,.48,.175);body.add(patch);
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#f5d58c';ctx.font='bold 53px sans-serif';ctx.textAlign='center';ctx.fillText('BENSON',128,77);const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;const badge=new THREE.Mesh(new THREE.PlaneGeometry(.18,.09),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));badge.position.set(.085,.47,.184);body.add(badge);
 for(const x of [-.11,.11]){const brow=block(body,.067,.012,.012,navy,x,.998,.233);brow.rotation.z=x<0?.1:-.1;}
}
