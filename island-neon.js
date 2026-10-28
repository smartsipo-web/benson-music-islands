import * as THREE from 'three';

// A continuous lower rim and a radial wash on the water, rather than stage frames.
export function createIslandNeon({groups,definitions,batchStatic}){
 const colors=[0x24dfff,0xff4fbd,0xffac36,0x42f7a6,0x9b72ff];
 const lights=definitions.map((def,index)=>{
  const root=new THREE.Group();groups[index].add(root);
  const core=new THREE.MeshBasicMaterial({color:colors[index],toneMapped:false,transparent:true,opacity:.65});
  const aura=new THREE.MeshBasicMaterial({color:colors[index],transparent:true,opacity:.12,depthWrite:false,toneMapped:false});
  for(const [radius,tube,material,y] of [[def.r+.035,.065,core,-.67],[def.r+.045,.17,aura,-.68]]){const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,8,96),material);ring.rotation.x=-Math.PI/2;ring.position.y=y;root.add(ring);}
  const washMaterial=new THREE.ShaderMaterial({uniforms:{tint:{value:new THREE.Color(colors[index])},strength:{value:.23}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform vec3 tint;uniform float strength;void main(){float radius=length((vUv-.5)*2.);float halo=exp(-pow((radius-.72)/.18,2.));float fade=1.-smoothstep(.85,1.,radius);gl_FragColor=vec4(tint,halo*fade*strength);}',transparent:true,depthWrite:false,toneMapped:false});
  const wash=new THREE.Mesh(new THREE.PlaneGeometry((def.r+1.1)*2,(def.r+1.1)*2),washMaterial);wash.rotation.x=-Math.PI/2;wash.position.y=-.85;root.add(wash);
  batchStatic(root);
  const light=new THREE.PointLight(colors[index],.45,def.r*2.4,2);light.position.set(0,-.5,0);groups[index].add(light);
  return {core,aura,washMaterial,light};
 });
 return {update(time,theme){const dance=theme==='dance';lights.forEach(({core,aura,washMaterial,light},i)=>{const wave=.65+.35*Math.sin(time*3.4-i*.9)**2;core.opacity=dance?.75+wave*.25:.58;aura.opacity=dance?.2+wave*.16:.09;washMaterial.uniforms.strength.value=dance?.5+wave*.28:.23;light.intensity=dance?2+wave*2:.45;});}};
}
