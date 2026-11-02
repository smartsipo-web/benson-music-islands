import * as THREE from 'three';
export function addDemonIsland({scene,group,cyl,ball,box,bar,plaque}){
 const island=group(scene,0,.1,-17.2);island.userData.musicAction='demon';
 cyl(island,2.65,2.2,1.35,0x3a314d,0,-.65,0,14);cyl(island,2.65,2.65,.16,0x514267,0,.1,0,32);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(2.5,.055,7,64),new THREE.MeshStandardMaterial({color:0xc16bff,emissive:0xb13aff,emissiveIntensity:2}));ring.rotation.x=Math.PI/2;ring.position.y=-.25;island.add(ring);
 // Rounded rock arch with an actual dark cave mouth, crystal clusters and a friendly guardian.
 for(let i=0;i<11;i++){const a=i/10*Math.PI;ball(island,.65,0x524462,Math.cos(a)*1.25,.65+Math.sin(a)*1.4,-.35,1,.95,.9);}
 const mouth=new THREE.Mesh(new THREE.CircleGeometry(1.18,32),new THREE.MeshBasicMaterial({color:0x100d22}));mouth.position.set(0,1,-.42);island.add(mouth);
 for(const side of [-1,1])for(let i=0;i<3;i++){const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.3+i*.05),new THREE.MeshStandardMaterial({color:side<0?0x9b70f5:0x64d9e1,emissive:side<0?0x642bbc:0x128a98,emissiveIntensity:.8,roughness:.3}));crystal.position.set(side*(1.65+i*.2),.45+i*.12,.4-i*.5);crystal.scale.y=1.6;island.add(crystal);}
 const guard=group(island,1.15,.2,1);ball(guard,.28,0xb468cb,0,.35,0,1,1.1,.85);ball(guard,.3,0xb468cb,0,.8,0);for(const x of [-.12,.12]){ball(guard,.045,0xffe1a1,x,.83,.27);const horn=new THREE.Mesh(new THREE.ConeGeometry(.08,.25,8),new THREE.MeshStandardMaterial({color:0xffd899}));horn.position.set(x*1.5,1.12,0);horn.rotation.z=x<0?.3:-.3;guard.add(horn);}plaque(island,'DEMON CAVE','#532e76',0,2.55,-.18,2.1);plaque(island,'冒險者，準備好了嗎？','#443151',0,.45,1.6,2.3);
 const label=document.createElement('button');label.className='demon-island-label';label.textContent='惡魔島';label.onclick=()=>window.dispatchEvent(new Event('music-demon-open'));document.querySelector('.map').append(label);
 const anchor=new THREE.Vector3(0,.2,-14.4);return {island,update(camera,w,h,t){const p=anchor.clone().project(camera);const half=label.offsetWidth/2+8;label.style.left=Math.max(half,Math.min(w-half,(p.x+1)*w/2))+'px';label.style.top=((-p.y+1)*h/2)+'px';label.hidden=Math.abs(p.x)>1||Math.abs(p.y)>1||p.z>1;ring.material.emissiveIntensity=1.2+Math.sin(t*2)*.4;}};
}
