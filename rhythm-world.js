import * as THREE from 'three';

// Shared materials keep the rhythm animation to a few uniform updates per frame.
export function createRhythmWorld({scene,groups,definitions,batchStatic}){
 const root=new THREE.Group();scene.add(root);
 const gold=new THREE.MeshStandardMaterial({color:0xffd08a,emissive:0xff9d35,emissiveIntensity:.5,roughness:.5});
 const violet=new THREE.MeshStandardMaterial({color:0xdba9ff,emissive:0x9659ff,emissiveIntensity:.5,roughness:.5});
 const ivory=new THREE.MeshStandardMaterial({color:0xf9e9c7,roughness:.65});
 const ebony=new THREE.MeshStandardMaterial({color:0x302c45,roughness:.65});
 const noteGeometry=new THREE.SphereGeometry(.09,7,5),stemGeometry=new THREE.CylinderGeometry(.018,.018,.34,5);
 for(let i=1;i<5;i++){
  const a=definitions[0],b=definitions[i],dir=new THREE.Vector3(b.x-a.x,0,b.z-a.z).normalize();
  const from=new THREE.Vector3(a.x,0,a.z).addScaledVector(dir,a.r-.2),to=new THREE.Vector3(b.x,0,b.z).addScaledVector(dir,-b.r+.2);
  const length=from.distanceTo(to),bridge=new THREE.Group();bridge.position.copy(from).add(to).multiplyScalar(.5);bridge.rotation.y=Math.atan2(dir.x,dir.z);root.add(bridge);
  const count=Math.ceil(length/.25);for(let j=0;j<count;j++){
   const key=new THREE.Mesh(new THREE.BoxGeometry(.7,.035,.22),j%7===1||j%7===2||j%7===4?ebony:ivory);key.position.set(0,.125,-length/2+(j+.5)*length/count);bridge.add(key);
   if(j%3===0){const m=i===1?violet:gold,note=new THREE.Mesh(noteGeometry,m);note.position.set(.47,.57,key.position.z);note.scale.set(1.3,.65,1);bridge.add(note);const stem=new THREE.Mesh(stemGeometry,m);stem.position.set(.55,.73,key.position.z);bridge.add(stem);}
  }
 }
 batchStatic(root);
 const targets=[];
 function target(parent,geometry,x,y,z,action){const hit=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({visible:false}));hit.position.set(x,y,z);hit.userData.musicAction=action;parent.add(hit);targets.push(hit);}
 target(groups[0],new THREE.BoxGeometry(2.8,1.8,2),0,1,-.05,'drum');
 target(groups[0],new THREE.BoxGeometry(.95,1.8,.95),1.9,1.05,1.1,'awards');
 target(groups[1],new THREE.BoxGeometry(3.35,.12,3.35),0,.32,0,'dance');
 const floor=new THREE.Mesh(new THREE.TorusGeometry(1.65,.035,5,48),violet);floor.rotation.x=-Math.PI/2;floor.position.set(0,.34,0);groups[1].add(floor);
 const stage=new THREE.Mesh(new THREE.TorusGeometry(2.35,.035,5,48),gold);stage.rotation.x=-Math.PI/2;stage.position.set(0,.41,0);groups[0].add(stage);
 return {targets,setTheme(mode){root.userData.theme=mode;},update(t,enabled,theme){const pulse=enabled?.55+Math.pow(Math.max(0,Math.sin(t*Math.PI*100/60)),2)*1.3:.45;gold.emissiveIntensity=pulse*(theme==='drum'?1:.55);violet.emissiveIntensity=pulse*(theme==='dance'?1:.55);}};
}
