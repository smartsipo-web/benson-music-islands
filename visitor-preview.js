import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {addCharacterHair} from './character-hair.js';
import {addVisitorOutfit,addVisitorCap} from './visitor-outfit.js';

function mannequin({shirt,skin,hair}){
 const root=new THREE.Group(),materials=[];
 function material(color){const m=new THREE.MeshStandardMaterial({color,roughness:.72});materials.push(m);return m;}
 const cloth=material(shirt),face=material(skin),ink=material(0x302733),cream=material(0xffeddb),jeans=material(0x343850);
 function ellipsoid(r,mat,x,y,z,sx=1,sy=1,sz=1){const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,20,14),mat);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);root.add(mesh);return mesh;}
 function box(w,h,d,mat,x,y,z){const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,.025),mat);mesh.position.set(x,y,z);root.add(mesh);return mesh;}
 ellipsoid(.22,cloth,0,.43,0,1,1.25,.8);ellipsoid(.25,face,0,.94,0,1,1.08,.95);
 for(const side of [-1,1]){ellipsoid(.027,ink,side*.09,.95,.23);ellipsoid(.045,material(0xe19e8e),side*.135,.87,.21,1,.55,.4);ellipsoid(.048,face,side*.248,.93,0,.6,1,.7);box(.11,.26,.12,cloth,side*.24,.51,0);ellipsoid(.065,face,side*.24,.35,0);box(.12,.26,.13,jeans,side*.1,.13,0);box(.14,.09,.23,cream,side*.1,-.01,.04);}
 ellipsoid(.035,face,0,.91,.25);
 const smile=new THREE.Mesh(new THREE.TorusGeometry(.055,.009,6,16,Math.PI),material(0x8f554e));smile.position.set(0,.86,.235);smile.rotation.z=Math.PI;root.add(smile);
 const hairRig=addCharacterHair(root,{name:'訪客',kind:hair}),outfit=addVisitorOutfit(root,shirt),cap=hair==='cap'?addVisitorCap(root,shirt):null;
 return {root,dispose(){hairRig.dispose();outfit.dispose();cap?.dispose();root.traverse(o=>{if(o.isMesh)o.geometry.dispose();});materials.forEach(m=>m.dispose());}};
}

export function setupVisitorPreview(){
 let canvas,renderer,scene,camera,controls,observer,avatar;
 function render(){if(renderer)renderer.render(scene,camera);}
 function dispose(){observer?.disconnect();controls?.dispose();avatar?.dispose();renderer?.dispose();renderer?.forceContextLoss();canvas=renderer=scene=camera=controls=avatar=observer=null;}
 window.addEventListener('music-visitor-preview',event=>{
  const target=document.querySelector('#visitor-preview-canvas');if(!target)return;
  if(canvas!==target){dispose();canvas=target;
   try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});}catch{return;}
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
   scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xfff3dd,0x808ca8,2.8));const light=new THREE.DirectionalLight(0xffefd5,3);light.position.set(-2,4,4);scene.add(light);
   camera=new THREE.PerspectiveCamera(32,1,.1,15);camera.position.set(1.2,1.05,2.75);
   controls=new OrbitControls(camera,canvas);controls.target.set(0,.67,0);controls.enablePan=false;controls.enableZoom=false;controls.minPolarAngle=.65;controls.maxPolarAngle=1.8;controls.update();controls.addEventListener('change',render);
   observer=new ResizeObserver(()=>{const width=canvas.clientWidth,height=canvas.clientHeight;if(width&&height){renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();render();}});observer.observe(canvas);
  }
  if(!renderer)return;avatar?.root.removeFromParent();avatar?.dispose();avatar=mannequin(event.detail);scene.add(avatar.root);canvas.dataset.hair=event.detail.hair;canvas.dataset.shirt=event.detail.shirt;render();
 });
 document.querySelector('#community-dialog').addEventListener('close',dispose);
}
