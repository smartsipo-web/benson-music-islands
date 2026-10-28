import * as THREE from 'three';

export function createConcertEffects(drum){
 const root=new THREE.Group();drum.add(root);
 const orange=new THREE.MeshBasicMaterial({color:0xff681c,transparent:true,opacity:.8,toneMapped:false,depthWrite:false});
 const gold=new THREE.MeshBasicMaterial({color:0xffdf65,toneMapped:false});
 const nozzleMaterial=new THREE.MeshStandardMaterial({color:0x363644,metalness:.6,roughness:.4});
 const fireGeometry=new THREE.LatheGeometry([[0,0],[.12,.08],[.18,.36],[.13,.7],[.075,1.12],[0,1.65]].map(p=>new THREE.Vector2(...p)),12);
 const jets=[[-1.95,.85],[1.95,.85],[-1.9,-.9],[1.9,-.9]].map(([x,z],i)=>{
  const nozzle=new THREE.Mesh(new THREE.CylinderGeometry(.14,.19,.16,10),nozzleMaterial);nozzle.position.set(x,.44,z);root.add(nozzle);
  const fire=new THREE.Group();fire.position.set(x,.52,z);root.add(fire);
  const outer=new THREE.Mesh(fireGeometry,orange);fire.add(outer);
  const inner=new THREE.Mesh(fireGeometry,gold);inner.scale.set(.52,.72,.52);inner.position.z=.015;fire.add(inner);
  return {fire,x,z,phase:i*.46};
 });
 const glyphs=[];
 for(let i=0;i<4;i++){
  const note=new THREE.Group(),material=new THREE.MeshBasicMaterial({color:[0xffd669,0x66dfff,0xff88d1,0xffdf8d][i],toneMapped:false});
  const head=new THREE.Mesh(new THREE.SphereGeometry(.16,10,7),material);head.scale.set(1.15,.65,.6);head.rotation.z=.25;note.add(head);
  const stem=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.65,7),material);stem.position.set(.13,.3,0);note.add(stem);
  const flag=new THREE.Mesh(new THREE.BoxGeometry(.28,.085,.065),material);flag.position.set(.23,.59,0);flag.rotation.z=-.3;note.add(flag);root.add(note);
  glyphs.push({object:note,angle:i*Math.PI/2+.45,phase:i*.9});
 }
 const boltShape=new THREE.Shape();boltShape.moveTo(.05,.8);boltShape.lineTo(-.27,.25);boltShape.lineTo(-.04,.25);boltShape.lineTo(-.16,-.32);boltShape.lineTo(.32,.4);boltShape.lineTo(.08,.4);boltShape.closePath();
 const boltGeometry=new THREE.ExtrudeGeometry(boltShape,{depth:.055,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.025,bevelThickness:.02});
 for(let i=0;i<3;i++){const bolt=new THREE.Mesh(boltGeometry,gold);bolt.scale.setScalar(.65);root.add(bolt);glyphs.push({object:bolt,angle:i*Math.PI*2/3+1.1,phase:i*1.1+2});}
 const sparkPositions=new Float32Array(24*3),sparkGeometry=new THREE.BufferGeometry();sparkGeometry.setAttribute('position',new THREE.BufferAttribute(sparkPositions,3));
 const sparks=new THREE.Points(sparkGeometry,new THREE.PointsMaterial({color:0xffd270,size:.055,transparent:true,opacity:.8,depthWrite:false,toneMapped:false}));root.add(sparks);
 return {update(time,theme){root.visible=theme==='drum';if(!root.visible)return;
  jets.forEach((jet,i)=>{const cycle=(time+jet.phase)%3.4,envelope=cycle<1.05?Math.sin(cycle/1.05*Math.PI)**.65:0;jet.fire.visible=envelope>.02;jet.fire.scale.set(.75+envelope*.3,envelope*(.9+Math.sin(time*12+i)*.08),.75+envelope*.3);jet.fire.rotation.z=Math.sin(time*8+i)*.08;
   for(let j=0;j<6;j++){const index=(i*6+j)*3,life=(time*1.3+j/6+jet.phase)%1;sparkPositions[index]=jet.x+Math.sin(j*2.4)*life*.27;sparkPositions[index+1]=.53+life*1.8;sparkPositions[index+2]=jet.z+Math.cos(j*2.4)*life*.23;if(!jet.fire.visible)sparkPositions[index+1]=-5;}
  });sparkGeometry.attributes.position.needsUpdate=true;
  glyphs.forEach(({object,angle,phase})=>{object.position.set(Math.cos(angle)*2.65,.75+Math.abs(Math.sin(time*1.7+phase))*.85,Math.sin(angle)*2.65);object.rotation.y=Math.sin(time*.85+phase)*.6;object.rotation.z=Math.sin(time*1.6+phase)*.16;});
 }};
}
