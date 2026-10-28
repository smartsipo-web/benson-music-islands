import * as THREE from 'three';
export function addCharacterHair(body,{name,kind}){
 const root=new THREE.Group();root.name='sculpted-hair';body.add(root);const grey=kind==='grandma',base=new THREE.Color(grey?0xa5a19d:0x292735),light=base.clone().lerp(new THREE.Color(grey?0xe8e0d2:0x79645d),grey?.22:.16);
 const material=new THREE.MeshStandardMaterial({color:base,roughness:.75}),highlight=new THREE.MeshStandardMaterial({color:light,roughness:.65});
 function tuft(x,y,z,sx,sy,sz,angle=0,bright=false){const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),bright?highlight:material);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.rotation.z=angle;mesh.castShadow=true;root.add(mesh);return mesh;}
 function lock(points,width,depth,bright=false){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),positions=[],indices=[],n=12,sides=8;for(let i=0;i<=n;i++){const t=i/n,p=curve.getPoint(t),tangent=curve.getTangent(t),side=new THREE.Vector3().crossVectors(tangent,new THREE.Vector3(0,0,1)).normalize(),normal=new THREE.Vector3().crossVectors(tangent,side).normalize();const taper=.12+.88*Math.pow(Math.sin((.15+t*.84)*Math.PI),.6);for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2,q=p.clone().addScaledVector(side,Math.cos(a)*width*taper).addScaledVector(normal,Math.sin(a)*depth*taper);positions.push(q.x,q.y,q.z);if(i<n&&j<sides){const k=i*(sides+1)+j;indices.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1)}}}const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();const mesh=new THREE.Mesh(geometry,bright?highlight:material);mesh.castShadow=true;root.add(mesh);return mesh;}
 const hat=kind==='hat'||kind==='cap';let tail=null;
 const cap=new THREE.Mesh(new THREE.SphereGeometry(.266,18,11,0,Math.PI*2,0,Math.PI*.5),material);cap.position.set(0,.97,-.02);cap.scale.set(1,hat?.72:1,1);cap.castShadow=true;root.add(cap);
 // Back/temple coverage keeps the scalp joined to the face without hiding eyes.
 tuft(0,.994,-.13,.244,.2,.15);for(const side of [-1,1])tuft(side*.22,.985,.01,.055,.115,.095,side*.06);
 if(hat){cap.visible=false;for(const side of [-1,1])tuft(side*.19,.97,.15,.055,.065,.04,side*.1);return {root,tail,style:'cap',dispose(){material.dispose();highlight.dispose();}};}
 let style=kind==='drummer'||kind==='rock'?'rock':kind==='grandma'||kind==='curly'?'curl':name==='Fun'||kind==='bob'?'bob':kind==='teacher'||kind==='ponytail'?'ponytail':name==='Amber'?'long':kind==='long'?'long':kind==='sister'?'long':'short';
 if(kind==='curly'){for(let i=0;i<11;i++){const a=i*2.399,r=.1+(i%3)*.055;const curl=new THREE.Mesh(new THREE.TorusGeometry(.052,.031,7,14,Math.PI*1.8),i%4===0?highlight:material);curl.position.set(Math.cos(a)*r,1.12+(i%3)*.035,Math.sin(a)*r+.01);curl.rotation.set(.3+Math.sin(a)*.4,a,.2);root.add(curl);}for(const side of [-1,1])tuft(side*.23,1.01,.01,.06,.09,.07);
 }else if(style==='rock'){
  for(let i=0;i<6;i++){const x=-.2+i*.078;lock([[x,1.08,-.08],[x*.9,1.23,-.025],[x*.8+.025,1.32+Math.sin(i*.7)*.04,.015],[x+.055,1.25,.12]],.056,.05,i%3===0);}
  for(let i=0;i<4;i++)tuft(-.15+i*.09,1.085,.19,.075,.07,.045,-.35+i*.12,i===1);
 }else if(style==='curl'){
  for(let i=0;i<15;i++){const a=i*2.399,r=.12+(i%3)*.055;tuft(Math.cos(a)*r,1.08+(i%4)*.035,Math.sin(a)*r-.01,.078,.078,.075,i*.3,i%4===0)}
  for(const side of [-1,1])for(let i=0;i<3;i++)tuft(side*.23,1.04-i*.07,-.04,.066,.068,.07,0,i===0);
 }else{
  const sidePart=name==='Eric'||kind==='glasses'||kind==='belly';
  for(let i=0;i<5;i++){const x=-.18+i*.075;lock([[x+.045,1.2,-.03],[x+.025,1.18,.11],[x-.035,1.1,.205],[x-.07,1.04+(i%2)*.025,.215]],.057,.033,i===1);}
  for(let i=0;i<3;i++)tuft(-.12+i*.1,1.195,-.015,.075,.045,.19,-.25,i===0);
  if(style==='bob'||style==='long'){
   const length=style==='long'?.31:.19;tuft(0,.86,-.17,.24,length,.13);
   for(const side of [-1,1])for(let i=0;i<3;i++){const x=side*(.17+i*.027);lock([[x,1.12,-.04-i*.045],[x*1.12,.95,-.02-i*.045],[x*1.1,.79,-.04-i*.05],[x*.9,.84-length*.8,-.08-i*.04]],.048,.04,i===1);}
   for(let i=0;i<4;i++)tuft(-.17+i*.11,.85,-.275,.018,length*.85,.016,-.04,i===1);
  }
  if(style==='ponytail'){
   tail=new THREE.Group();tail.position.set(.05,1.23,-.2);root.add(tail);const tie=new THREE.Mesh(new THREE.TorusGeometry(.055,.015,6,12),new THREE.MeshStandardMaterial({color:0xd3999e}));tie.rotation.x=Math.PI/2;tail.add(tie);
   for(let i=0;i<4;i++){const offset=(i-1.5)*.035;tail.add(lock([[offset,.035,-.015],[offset+.18,.08,-.16],[offset+.24,-.18,-.23],[offset+.14,-.44,-.13]],.052,.043,i===1));}
  }
 }
 if(hat){cap.visible=false;for(const side of [-1,1])tuft(side*.19,.97,.15,.06,.075,.04,side*.1);}
 return {root,tail,style,dispose(){material.dispose();highlight.dispose();}};
}
