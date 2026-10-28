import * as THREE from 'three';

export function addVisitorOutfit(body,shirt){
 const root=new THREE.Group();body.add(root);
 const base=new THREE.Color(shirt),dark=base.clone().multiplyScalar(.55),cream=new THREE.Color(0xffefd7);
 const material=new THREE.MeshStandardMaterial({color:dark,roughness:.8});
 const trim=new THREE.MeshStandardMaterial({color:cream,roughness:.8});
 const add=(geometry,mat,x,y,z)=>{const o=new THREE.Mesh(geometry,mat);o.position.set(x,y,z);root.add(o);return o;};
 const collar=add(new THREE.TorusGeometry(.09,.025,6,20),material,0,.67,.015);collar.rotation.x=Math.PI/2;
 add(new THREE.BoxGeometry(.135,.12,.018),material,.085,.45,.168);
 add(new THREE.BoxGeometry(.12,.018,.022),trim,.085,.505,.18);
 const patch=add(new THREE.SphereGeometry(.025,8,6),trim,-.075,.48,.175);patch.scale.set(1.25,.7,.35);
 add(new THREE.CylinderGeometry(.008,.008,.08,5),trim,-.053,.515,.175);
 const hem=add(new THREE.TorusGeometry(.19,.015,5,20),material,0,.27,0);hem.rotation.x=Math.PI/2;hem.scale.y=.8;
 return {root,dispose(){material.dispose();trim.dispose();}};
}

export function addVisitorCap(body,shirt){
 const root=new THREE.Group();body.add(root);const color=new THREE.Color(shirt).lerp(new THREE.Color(0x293a57),.35);
 const material=new THREE.MeshStandardMaterial({color,roughness:.72}),trim=new THREE.MeshStandardMaterial({color:0xffe5bc});
 const crown=new THREE.Mesh(new THREE.SphereGeometry(.277,20,12,0,Math.PI*2,0,Math.PI/2),material);crown.position.set(0,1.04,-.015);crown.scale.y=.72;root.add(crown);
 const brim=new THREE.Mesh(new THREE.SphereGeometry(1,18,8),material);brim.position.set(0,1.06,.24);brim.scale.set(.28,.025,.18);root.add(brim);
 const button=new THREE.Mesh(new THREE.SphereGeometry(.026,8,6),trim);button.position.set(0,1.24,-.015);root.add(button);
 return {root,dispose(){material.dispose();trim.dispose();}};
}
