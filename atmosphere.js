import * as THREE from 'three';
// A continuous, broad terrain belt replaces repeated cone mountains.
export function createAtmosphere({scene,tree,batchStatic}){
 const terrain=new THREE.Group();scene.add(terrain);
 const begin=Math.PI*.78,sweep=Math.PI*1.44,angular=168,radial=24;
 function surface(a,t){const innerX=25,innerZ=23,outerX=51,outerZ=46;const envelope=(1-Math.exp(-t*16))*Math.exp(-Math.pow((t-.24)/.39,2));const ridge=4.2+3.8*Math.sin(a*2.7+.4)**2+2.8*Math.sin(a*5.3+1.2)**2;const shoulders=1+.13*Math.sin(a*8+t*5)+.07*Math.cos(a*13-t*8);return [Math.cos(a)*(innerX+(outerX-innerX)*t),-.78+envelope*ridge*shoulders,Math.sin(a)*(innerZ+(outerZ-innerZ)*t)];}
 const positions=[],colors=[],indices=[],color=new THREE.Color();
 for(let i=0;i<=angular;i++){const a=begin+sweep*i/angular;for(let j=0;j<=radial;j++){const t=j/radial,p=surface(a,t);positions.push(...p);const elevation=THREE.MathUtils.clamp(p[1]/10,0,1);color.set(0x78956e).lerp(new THREE.Color(0x809fa0),elevation*.72);color.multiplyScalar(.95+.05*Math.sin(a*5+t*3));colors.push(color.r,color.g,color.b);if(i<angular&&j<radial){const n=i*(radial+1)+j;indices.push(n,n+radial+1,n+1,n+1,n+radial+1,n+radial+2)}}}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();const hills=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:false,side:THREE.DoubleSide}));hills.receiveShadow=true;terrain.add(hills);
 // Pines follow the terrain height, with clusters on ridges and lower slopes.
 for(let i=0;i<155;i++){const a=begin+sweep*((i*.61803398875)%1),t=.06+((i*.381966)%1)*.78;const p=surface(a,t);tree(terrain,p[0],p[2],.8+(i%5)*.18);const pine=terrain.children.at(-1);pine.position.y=p[1]+.02;}
 for(let i=0;i<100;i++){const a=begin+sweep*(i/99),t=.018+(i%5)*.017,p=surface(a,t);tree(terrain,p[0],p[2],.7+(i%4)*.12);terrain.children.at(-1).position.y=p[1]+.02;}
 batchStatic(terrain);
 // Soft sculpted cloud clusters. Their horizontal drift uses the scene clock,
 // so pause/reduced-motion settings apply to clouds as well as characters.
 const cloudMaterial=new THREE.MeshStandardMaterial({color:0xe7eef3,roughness:1,emissive:0x56677b,emissiveIntensity:.15});const cloudGeometry=new THREE.SphereGeometry(1,12,9);const clouds=[];
 const specs=[[-20,6,-7,4.8],[-4,8,-15,5.2],[18,7,-11,4.5],[26,7,5,3.7],[-26,6,2,4.2],[-22,9,18,3.9],[25,9,19,4.5],[7,10,-22,3.6]];
 specs.forEach(([x,y,z,size],index)=>{const root=new THREE.Group();root.position.set(x,y,z);for(let j=0;j<6;j++){const puff=new THREE.Mesh(cloudGeometry,cloudMaterial);puff.position.set((j-2.5)*.65,Math.sin(j*1.9)*.18,Math.cos(j)*.22);puff.scale.set(1.05,.48+(j%3)*.13,.7);root.add(puff)}root.scale.setScalar(size/3);scene.add(root);clouds.push({root,x,y,z,index});});
 const tint=new THREE.Color(0xf8f4eb);
 return {update(time,sky){for(const c of clouds){c.root.position.x=c.x+Math.sin(time*.012+c.index)*3.5;c.root.position.z=c.z+Math.cos(time*.008+c.index)*1.2;c.root.position.y=c.y+Math.sin(time*.04+c.index)*.12;}cloudMaterial.color.copy(sky).lerp(tint,.66);},terrain};
}
