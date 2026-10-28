import * as THREE from 'three';
export function addCharacterHair(body,{name,kind}){
 const root=new THREE.Group();root.name='sculpted-hair';body.add(root);const grey=kind==='grandma',base=new THREE.Color(grey?0xa5a19d:0x292735),light=base.clone().lerp(new THREE.Color(grey?0xe8e0d2:0x79645d),grey?.22:.16);
 const material=new THREE.MeshStandardMaterial({color:base,roughness:.75}),highlight=new THREE.MeshStandardMaterial({color:light,roughness:.65});
 function tuft(x,y,z,sx,sy,sz,angle=0,bright=false){const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),bright?highlight:material);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.rotation.z=angle;mesh.castShadow=true;root.add(mesh);return mesh;}
 const hat=kind==='hat'||kind==='cap';let tail=null;
 const cap=new THREE.Mesh(new THREE.SphereGeometry(.266,18,11,0,Math.PI*2,0,Math.PI*.5),material);cap.position.set(0,.97,-.02);cap.scale.set(1,hat?.72:1,1);cap.castShadow=true;root.add(cap);
 // Back/temple coverage keeps the scalp joined to the face without hiding eyes.
 tuft(0,.994,-.13,.244,.2,.15);for(const side of [-1,1])tuft(side*.22,.985,.01,.055,.115,.095,side*.06);
 let style=kind==='drummer'?'rock':kind==='grandma'||kind==='curly'?'curl':name==='Fun'?'bob':kind==='teacher'?'ponytail':name==='Amber'?'long':kind==='long'?'long':kind==='sister'?'long':'short';
 if(style==='rock'){
  for(let i=0;i<6;i++)tuft(-.2+i*.078,1.18+Math.sin(i*.6)*.035,.025,.07,.14+(i%3)*.025,.09,(i-2.5)*-.15,i%3===0);
  for(let i=0;i<4;i++)tuft(-.15+i*.09,1.085,.19,.075,.07,.045,-.35+i*.12,i===1);
 }else if(style==='curl'){
  for(let i=0;i<15;i++){const a=i*2.399,r=.12+(i%3)*.055;tuft(Math.cos(a)*r,1.08+(i%4)*.035,Math.sin(a)*r-.01,.078,.078,.075,i*.3,i%4===0)}
  for(const side of [-1,1])for(let i=0;i<3;i++)tuft(side*.23,1.04-i*.07,-.04,.066,.068,.07,0,i===0);
 }else{
  const sidePart=name==='Eric'||kind==='glasses'||kind==='belly';
  for(let i=0;i<5;i++)tuft(-.17+i*.078,1.095+(sidePart?i*.011:Math.sin(i)*.015),.185,.072,.055+(i%2)*.015,.05,sidePart?-.42:.13-i*.06,i===1);
  for(let i=0;i<3;i++)tuft(-.12+i*.1,1.195,-.015,.075,.045,.19,-.25,i===0);
  if(style==='bob'||style==='long'){
   const length=style==='long'?.31:.19;tuft(0,.86,-.17,.24,length,.13);
   for(const side of [-1,1])for(let i=0;i<3;i++)tuft(side*(.18+i*.025),.85,-.03-i*.05,.052,length*.85,.055,side*.07,i===1);
   for(let i=0;i<4;i++)tuft(-.17+i*.11,.85,-.275,.018,length*.85,.016,-.04,i===1);
  }
  if(style==='ponytail'){
   tail=new THREE.Group();tail.position.set(.02,1.16,-.2);root.add(tail);const tie=new THREE.Mesh(new THREE.TorusGeometry(.055,.015,6,12),new THREE.MeshStandardMaterial({color:0xd3999e}));tie.rotation.x=Math.PI/2;tail.add(tie);
   for(let i=0;i<4;i++){const lock=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),i===1?highlight:material);lock.position.set(.035*i,.1-i*.09,-.1-i*.045);lock.scale.set(.085-i*.009,.12,.075);lock.rotation.z=-.1-i*.13;lock.castShadow=true;tail.add(lock)}
  }
 }
 if(hat){cap.visible=false;for(const side of [-1,1])tuft(side*.19,.97,.15,.06,.075,.04,side*.1);}
 return {root,tail,style,dispose(){material.dispose();highlight.dispose();}};
}
