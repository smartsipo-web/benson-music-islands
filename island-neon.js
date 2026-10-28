import * as THREE from 'three';

export function createIslandNeon({groups,definitions,batchStatic}){
 const colors=[0x4de5ff,0xff68d7,0xffb854,0x68ffba,0xb28aff];
 const lights=definitions.map((def,index)=>{
  const root=new THREE.Group();groups[index].add(root);
  const material=new THREE.MeshStandardMaterial({color:colors[index],emissive:colors[index],emissiveIntensity:.4,roughness:.3,toneMapped:false});
  const glow=new THREE.MeshBasicMaterial({color:colors[index],transparent:true,opacity:.07,depthWrite:false,toneMapped:false});
  const ring=new THREE.Mesh(new THREE.TorusGeometry(def.r-.07,.04,6,72),material);ring.rotation.x=-Math.PI/2;ring.position.y=.22;root.add(ring);
  const halo=new THREE.Mesh(new THREE.TorusGeometry(def.r-.07,.12,6,72),glow);halo.rotation.x=-Math.PI/2;halo.position.y=.22;root.add(halo);
  function tube(a,b){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),direction=to.clone().sub(from);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,direction.length(),6),material);mesh.position.copy(from).add(to).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());root.add(mesh);}
  const half=index===4?1.88:index===0?2.15:1.7,top=index===3?3.3:3.18,z=index===4?-1.1:-1.78;
  tube([-half,.45,z],[-half,top,z]);tube([-half,top,z],[half,top,z]);tube([half,top,z],[half,.45,z]);
  for(const side of [-1,1])tube([side*(def.r-.55),.35,-.8],[side*(def.r-.55),.35,.8]);
  batchStatic(root);
  const light=new THREE.PointLight(colors[index],.2,def.r*2,2);light.position.set(0,.9,.6);groups[index].add(light);
  return {material,glow,light};
 });
 return {update(time,theme){const dance=theme==='dance';lights.forEach(({material,glow,light},i)=>{const wave=.65+.35*Math.sin(time*3.4-i*.9)**2;material.emissiveIntensity=dance?2.6+wave*1.8:.32;glow.opacity=dance?.12+wave*.11:.045;light.intensity=dance?2+wave*2:.2;});}};
}
