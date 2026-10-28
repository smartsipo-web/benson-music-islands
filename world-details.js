import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
export function enrichWorld(ctx){
 const {groups,scene,box,ball,cyl,bar,group,mesh,plaque,tree,lantern,material}=ctx;
 const rot=(o,a)=>{o.rotation.y=a;return o};
 function planter(p,x,z,color){cyl(p,.22,.17,.24,0xa56c4e,x,.3,z,10);for(let j=0;j<5;j++){const a=j*2.4,xx=x+Math.cos(a)*.12,zz=z+Math.sin(a)*.12;bar(p,new THREE.Vector3(xx,.4,zz),new THREE.Vector3(xx,.65,zz),.012,0x538856);ball(p,.065,color,xx,.65,zz);ball(p,.025,0xf4d579,xx,.71,zz)}}
 function guitar(p,x,z,c){const g=group(p,x,.35,z);ball(g,.23,c,0,.35,0,.8,1.2,.35);ball(g,.16,c,0,.6,0,.75,1,.35);box(g,.075,.8,.06,0x8c5a3c,0,.95,0);box(g,.13,.25,.06,0xcb9d5e,0,1.45,0);for(const side of [-1,1])for(let i=0;i<3;i++)ball(g,.025,0xd3c0a0,side*.09,1.39+i*.07,0);box(g,.06,.13,.05,0xefe5c2,0,.4,.08);g.rotation.z=-.13;return g}
 function stool(p,x,z){cyl(p,.22,.22,.12,0x38303c,x,.63,z);for(const side of [-1,1])bar(p,new THREE.Vector3(x+side*.16,.15,z),new THREE.Vector3(x,.6,z),.025,0xb2ac9d)}
 function paper(p,text,x,y,z,color='#fff0c7',w=.6){return plaque(p,text,color,x,y,z,w)}
 function brickTrim(p,x,z,w=2){for(let i=0;i<7;i++)box(p,w/7-.025,.12,.12,0xceb78a,x-w/2+i*w/7,.4,z)}
 const drum=groups[0];
 // A circular timber stage with brass edge studs, cables, pedals and monitor wedges.
 for(let i=0;i<18;i++){const x=-2.2+i*.26,len=Math.sqrt(Math.max(0,2.35**2-x*x))*2;box(drum,.235,.025,len, i%2?0xb77f58:0xc68c60,x,.4,0)}
 for(let i=0;i<32;i++){const a=i/32*Math.PI*2;ball(drum,.045,0xf6bf59,Math.cos(a)*2.43,.4,Math.sin(a)*2.43)}
 for(const x of [-1.3,1.3]){const monitor=box(drum,.6,.28,.4,0x2d3041,x,.54,1.1);monitor.rotation.x=-.2;for(let j=0;j<4;j++)box(drum,.45,.013,.02,0x55576c,x,.69,1+j*.05)}
 guitar(drum,-1.65,.75,0xcf5f47);stool(drum,0,-.85);box(drum,.22,.04,.33,0x6b6970,0,.46,.9);for(let i=0;i<3;i++){const cable=new THREE.Mesh(new THREE.TorusGeometry(.25+i*.055,.014,5,24,Math.PI*1.5),material(0x252d3c));cable.rotation.x=-Math.PI/2;cable.position.set(-1.2,.43,-.5);drum.add(cable)}
 for(const x of [-2.1,2.1]){const light=mesh(drum,new THREE.CylinderGeometry(.12,.16,.28,10),0x292f44,x,3.1,-1.3);light.rotation.x=Math.PI/3;}
 paper(drum,'ROCK STAR',1.85,.9,1.8,'#86502f',.8);
 const dance=groups[1];
 // A painted mural, boom box, sneaker sculpture, rails and a mini practice mirror.
 plaque(dance,'STREET DANCE','#5c2877',0,1.58,-1.7,2.8);box(dance,.65,1.8,.7,0x423050,1.5,1.1,-1.5);for(let i=0;i<5;i++)box(dance,.7,.045,.75,0xc75dae,1.5,.4+i*.32,-1.5,{emissive:0x7c2d85,emissiveIntensity:.25});
 const shoe=group(dance,1.5,2.1,-1.5);ball(shoe,.35,0xb796de,0,.1,.2,1,.65,1.6);box(shoe,.65,.1,1,0xffedcf,0,-.1,.15);for(let j=0;j<4;j++)box(shoe,.4,.025,.035,0xffebcf,0,.35,-.1+j*.1);rot(shoe,-.4);
 const boom=group(dance,-1.85,.3,1);box(boom,.75,.4,.23,0x433749,0,.25,0);for(const x of [-.23,.23]){const disc=cyl(boom,.14,.14,.03,0xd6b67a,x,.25,.13);disc.rotation.x=Math.PI/2;}box(boom,.3,.08,.08,0x8cb5b2,0,.48,0);for(let i=0;i<8;i++)box(dance,.12,.09,.04,[0xec8ec6,0x8acabd,0xe8c179][i%3],-1+i*.3,.55+Math.sin(i)*.2,-1.73);
 const live=groups[2];
 guitar(live,-.8,-.35,0x8aafb9);for(const x of [-1.55,1.55]){for(let i=0;i<7;i++)ball(live,.06,0xffcc80,x,2.35,-1.4+i*.3)}
 for(const x of [-1.5,1.5])planter(live,x,1.7,0xe7ad98);const cafe=group(live,1.7,.2,.9);box(cafe,.7,.8,.55,0xa57b4e,0,.4,0);box(cafe,.85,.1,.65,0xeacb8e,0,.85,0);for(const x of [-.2,0,.2]){cyl(cafe,.055,.04,.13,0xfff0d0,x,.96,0,8)}paper(cafe,'MUSIC CAFE',0,.6,.29,'#78512e',.6);
 // Tents and a stone-edged campfire on the side of the performance island.
 const tent=mesh(live,new THREE.ConeGeometry(.55,.65,3),0xb6d7d1,-1.7,.65,-.1);tent.rotation.y=Math.PI/6;for(let i=0;i<7;i++){const a=i/7*Math.PI*2;ball(live,.08,0x8b847b,1.65+Math.cos(a)*.3,.25,1.85+Math.sin(a)*.3)}
 const academy=groups[3];
 brickTrim(academy,0,.53,2.6);for(const xx of [-1.15,1.15]){box(academy,.23,.12,.32,0xd5b687,xx,1.75,.45);box(academy,.23,.12,.32,0xd5b687,xx,.28,.45)}
 for(let i=0;i<4;i++){const book=box(academy,.6,.12,.4,[0x9b6f85,0x7da9a5,0xe1b563,0x687da2][i],-1.7,.25+i*.13,1.1);book.rotation.y=i*.12;box(academy,.5,.07,.42,0xffedc6,-1.7,.28+i*.13,1.1)}
 const scroll=group(academy,1.8,.25,1.1);box(scroll,.5,.75,.04,0xf7e7bb,0,.5,0);for(const yy of [.12,.87]){const roll=cyl(scroll,.055,.055,.6,0xe3c99e,0,yy,0);roll.rotation.z=Math.PI/2;}paper(scroll,'CPA',0,.58,.025,'#c6a563',.4);
 for(const x of [-1.6,1.6])planter(academy,x,-.8,0xe0c47c);
 const media=groups[4];
 // Film reels, clapperboard, poster display and cozy little cinema tables.
 const reel=group(media,1.85,.4,-.6);for(const zz of [-.08,.08]){const disk=cyl(reel,.28,.28,.035,0x8a889d,0,.3,zz,20);disk.rotation.x=Math.PI/2;for(let j=0;j<5;j++){const a=j/5*Math.PI*2;const hole=cyl(reel,.055,.055,.04,0x343347,Math.cos(a)*.16,.3+Math.sin(a)*.16,zz+.02,8);hole.rotation.x=Math.PI/2}}
 const clap=group(media,-1.7,.5,1.2);box(clap,.7,.5,.06,0x2d2d3b,0,.3,0);const top=box(clap,.75,.12,.07,0xe2e4dc,0,.65,0);top.rotation.z=.15;for(let i=0;i<4;i++)box(clap,.07,.11,.08,0x393a49,-.3+i*.2,.67,0);paper(clap,'TAKE 01',0,.3,.04,'#303246',.55);
 for(const x of [-.8,.8]){cyl(media,.22,.22,.07,0xbb9067,x,.5,1.02);cyl(media,.04,.04,.25,0x746049,x,.35,1.02);cyl(media,.05,.04,.13,0xffe8b9,x,.6,1.02,8)}
 for(let i=0;i<4;i++){const board=group(media,2.2,.4,-.9+i*.45);box(board,.35,.5,.05,0x987d63,0,.3,0);paper(board,['ROCK','LIVE','DANCE','DREAM'][i],0,.3,.032,'#5b5a77',.28);}
 groups.slice(0,5).forEach((g,i)=>{for(const [x,z] of [[-1.7,-1.8],[1.75,1.65]])planter(g,x,z,[0xd989a7,0xa68ac7,0xf1c26a,0xbbd493,0x8fb9c7][i]);for(let j=0;j<12;j++){const a=j*2.399,r=i===0?3.05:2.48;const bush=ball(g,.17,0x6f965d,Math.cos(a)*r,.24,Math.sin(a)*r,1.3,.8,1);}});
 // Branching life tree island, independent from the five content islands.
 const treeIsland=group(scene,-13,.0,10.3);treeIsland.userData.lifeTree=true;
 cyl(treeIsland,2.4,2.1,.8,0x80796c,0,-.5,0,20);cyl(treeIsland,2.48,2.4,.15,0xd5bd8a,0,-.02,0,32);cyl(treeIsland,2.28,2.28,.13,0x81a26b,0,.09,0,32);
 const trunkMat=0x986a43;cyl(treeIsland,.24,.42,2.4,trunkMat,0,1.27,0,10);for(const side of [-1,1]){bar(treeIsland,new THREE.Vector3(0,1.25,0),new THREE.Vector3(side*1.1,2.8,.2),.13,trunkMat);bar(treeIsland,new THREE.Vector3(0,1.8,0),new THREE.Vector3(side*.8,3.4,-.2),.1,trunkMat)}
 for(let i=0;i<13;i++){const a=i*2.399,r=.3+(i%4)*.36;ball(treeIsland,.68,[0x8eaf68,0xb0c67a,0x6e9d67][i%3],Math.cos(a)*r,2.8+Math.sin(i)*.55,Math.sin(a)*r,1.15,.85,1)}
 for(let i=0;i<5;i++){const a=i/5*Math.PI*2;lantern(treeIsland,Math.cos(a)*1.8,Math.sin(a)*1.8)}plaque(treeIsland,'COURAGE TREE','#6b7743',0,.8,1.85,1.7);
 const msgLeaves=group(treeIsland);for(let i=0;i<16;i++){const a=i*2.399,leaf=box(msgLeaves,.18,.24,.035,[0xf2c475,0xe4acbb,0xc8d7a1][i%3],Math.cos(a)*1.2,1.65+(i%4)*.26,Math.sin(a)*1.2);bar(msgLeaves,new THREE.Vector3(leaf.position.x,leaf.position.y+.13,leaf.position.z),new THREE.Vector3(leaf.position.x,2.7,leaf.position.z),.005,0xcab986);}
 return {treeIsland,messageLeaves:msgLeaves};
}
export function batchStatic(root){
 root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert(),buckets=new Map(),remove=[];
 root.traverse(obj=>{if(!obj.isMesh||obj.userData.noBatch||Array.isArray(obj.material))return;const key=obj.material.uuid;if(!buckets.has(key))buckets.set(key,{material:obj.material,geometries:[]});const geom=obj.geometry.clone();geom.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,obj.matrixWorld));buckets.get(key).geometries.push(geom);remove.push(obj)});
 for(const obj of remove){obj.removeFromParent();obj.geometry.dispose()}for(const bucket of buckets.values()){const geometry=mergeGeometries(bucket.geometries,false);if(geometry){const mesh=new THREE.Mesh(geometry,bucket.material);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh)}bucket.geometries.forEach(g=>g.dispose())}
}
