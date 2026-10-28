import * as THREE from 'three';

export function decorateCourageTree({island,batchStatic,plaque,lantern}){
 const sculpture=new THREE.Group();island.add(sculpture);
 const bark=new THREE.MeshStandardMaterial({color:0x94633f,roughness:.95});
 const barkLight=new THREE.MeshStandardMaterial({color:0xb68c58,roughness:.9});
 const leafColors=[0x558a64,0x76aa78,0x9dbb7a,0x70a58d,0xc3c98a];
 const foliage=leafColors.map(color=>new THREE.MeshStandardMaterial({color,roughness:.9}));
 function branch(points,radius,material=bark){const mesh=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),16,radius,8,false),material);mesh.castShadow=true;mesh.receiveShadow=true;sculpture.add(mesh);return mesh;}
 branch([[0,.18,0],[-.12,.8,.03],[.08,1.6,-.04],[.05,2.4,0]],.21);
 for(let i=0;i<6;i++){const a=i*Math.PI/3;branch([[0,.45,0],[Math.cos(a)*.3,.25,Math.sin(a)*.3],[Math.cos(a)*.72,.18,Math.sin(a)*.72]],.075);}
 for(const [x,z] of [[-1,0],[.95,.1],[-.55,-.65],[.6,-.6],[0,.65]]){branch([[.05,1.3,0],[x*.35,2,.1],[x*.75,2.5,z*.7],[x,3,z]],.09);branch([[x*.3,2,.08],[x*.5,2.35,z*.3],[x*.65,2.6,z*.5]],.025,barkLight);}
 const clusters=[[-.82,3.2,.05,.94],[.82,3.25,0,.94],[-.56,3.72,-.08,.78],[.56,3.72,-.1,.78],[0,2.85,.3,.78],[0,3.34,-.6,.8],[0,3.15,.68,.62]];
 const leafGeometry=new THREE.SphereGeometry(1,10,7);
 clusters.forEach(([x,y,z,size],index)=>{const core=new THREE.Mesh(new THREE.SphereGeometry(size*.78,12,8),foliage[index%foliage.length]);core.position.set(x,y,z);core.scale.set(1,.75,.92);core.castShadow=true;sculpture.add(core);
  for(let j=0;j<15;j++){const a=j*2.399,level=(j%4)/3,leaf=new THREE.Mesh(leafGeometry,foliage[(j+index)%foliage.length]);leaf.position.set(x+Math.cos(a)*size*(.4+level*.4),y+Math.sin(a*1.7)*size*.4,z+Math.sin(a)*size*.6);leaf.scale.set(.42+level*.1,.16+level*.04,.27);leaf.rotation.set(Math.sin(a)*.35,a,Math.cos(a)*.18);leaf.castShadow=true;sculpture.add(leaf);}
 });
 // A gold circular seat and small flowers give the tree a welcoming garden base.
 const seat=new THREE.Mesh(new THREE.TorusGeometry(.7,.09,7,36),new THREE.MeshStandardMaterial({color:0xd9b77c,roughness:.8}));seat.rotation.x=-Math.PI/2;seat.position.y=.28;sculpture.add(seat);
 const flowerMaterials=[0xe8bd6b,0xe5a4b9,0xece1b0].map(color=>new THREE.MeshStandardMaterial({color}));for(let i=0;i<18;i++){const a=i*2.399,r=1.35+(i%3)*.13,flower=new THREE.Mesh(new THREE.SphereGeometry(.07,7,5),flowerMaterials[i%3]);flower.position.set(Math.cos(a)*r,.25,Math.sin(a)*r);sculpture.add(flower);}
 batchStatic(sculpture);
 for(let i=0;i<5;i++){const a=i/5*Math.PI*2;lantern(island,Math.cos(a)*1.85,Math.sin(a)*1.85);}
 plaque(island,'勇氣之樹','#557c59',0,.78,1.87,1.7);
 const heartShape=new THREE.Shape();heartShape.moveTo(0,-.13);heartShape.bezierCurveTo(-.26,.02,-.2,.26,-.06,.22);heartShape.bezierCurveTo(0,.2,0,.17,0,.15);heartShape.bezierCurveTo(.06,.28,.25,.22,.2,.07);heartShape.bezierCurveTo(.17,-.01,.08,-.07,0,-.13);
 const heartGeometry=new THREE.ExtrudeGeometry(heartShape,{depth:.035,bevelEnabled:true,bevelSize:.012,bevelThickness:.01,bevelSegments:1,steps:1});
 const notes=new THREE.Group();island.add(notes);
 for(let i=0;i<20;i++){const card=new THREE.Group();card.userData.messageCard=true;const a=i*2.399,r=1.02+(i%3)*.15,y=1.72+(i%4)*.25;card.position.set(Math.cos(a)*r,y,Math.sin(a)*r);card.rotation.y=a*.3;const material=new THREE.MeshStandardMaterial({color:[0xf2cf81,0xeeb5cb,0xc9dba5][i%3],roughness:.65,emissive:0x5d3613,emissiveIntensity:.08});const heart=new THREE.Mesh(heartGeometry,material);heart.scale.setScalar(.62);card.add(heart);const line=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,.47,5),barkLight);line.position.y=.34;card.add(line);notes.add(card);}
 const charm=new THREE.Mesh(heartGeometry,new THREE.MeshStandardMaterial({color:0xffd78a,emissive:0xe0a64e,emissiveIntensity:.7}));charm.position.set(0,1.42,.25);charm.scale.setScalar(1.4);island.add(charm);
 const light=new THREE.PointLight(0xffd596,2.5,6,2);light.position.set(0,2,.5);island.add(light);
 const coordinates=new Float32Array(14*3),geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(coordinates,3));const fireflies=new THREE.Points(geometry,new THREE.PointsMaterial({color:0xffe3a0,size:.055,transparent:true,opacity:.85,depthWrite:false,toneMapped:false}));fireflies.frustumCulled=false;island.add(fireflies);
 return {messageLeaves:notes,update(time){for(let i=0;i<14;i++){const a=i*2.399+time*.12,r=1.4+Math.sin(i)*.25;coordinates[i*3]=Math.cos(a)*r;coordinates[i*3+1]=1.4+(i%5)*.48+Math.sin(time*.7+i)*.13;coordinates[i*3+2]=Math.sin(a)*r;}geometry.attributes.position.needsUpdate=true;notes.children.forEach((card,i)=>card.rotation.z=Math.sin(time*.7+i)*.06);}};
}
