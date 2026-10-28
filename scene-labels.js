import * as THREE from 'three';
const point=new THREE.Vector3();
const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export function positionWorldLabels({labels,camera,width,height,allNames,pinnedName,pointer,corridor,zones}){
 const occupied=[],people=[];
 function project(label){if(label.actor){point.copy(label.actor.root.position);point.y+=1.55;label.el.dataset.location=zones[label.actor.roamPose.island].id;label.el.dataset.walking=String(label.actor.roamPose.kind==='walk');}else point.copy(label.pos);point.project(camera);return {x:(point.x*.5+.5)*width,y:(-.5*point.y+.5)*height,visible:point.z<=1&&Math.abs(point.x)<=1&&Math.abs(point.y)<=1};}
 for(const label of labels){const p=project(label);label.el.style.visibility=p.visible?'visible':'hidden';if(label.actor){people.push({label,p});continue;}label.el.hidden=label.kind==='trophy'&&!corridor;if(label.el.hidden||!p.visible)continue;const w=label.el.offsetWidth||90,h=label.el.offsetHeight||30;p.x=Math.max(w/2+5,Math.min(width-w/2-5,p.x));let placed={x:p.x-w/2,y:p.y,w,h};for(const offset of [0,24,48,-24,-48,72]){const candidate={x:p.x-w/2,y:p.y+offset,w:w+4,h:h+4};if(candidate.y>8&&candidate.y+h<height-75&&!occupied.some(r=>overlaps(candidate,r))){placed=candidate;break;}}label.el.style.left=p.x+'px';label.el.style.top=placed.y+'px';occupied.push(placed);}
 people.sort((a,b)=>(a.label.actor.name==='Benson'?-1:b.label.actor.name==='Benson'?1:camera.position.distanceTo(a.label.actor.root.position)-camera.position.distanceTo(b.label.actor.root.position)));
 for(const {label,p} of people){const actor=label.actor;const closePointer=pointer.active&&Math.hypot(pointer.x-p.x,pointer.y-p.y)<70;const wanted=actor.name==='Benson'||allNames||actor.name===pinnedName||closePointer||camera.position.distanceTo(actor.root.position)<16;label.el.hidden=!wanted||!p.visible;if(label.el.hidden)continue;
  const w=label.el.offsetWidth||actor.name.length*10+18,h=label.el.offsetHeight||20;let rect;
  for(const offset of [0,-22,-44,-66,22,44,-88]){const candidate={x:Math.max(4,Math.min(width-w-4,p.x-w/2)),y:p.y-h+offset,w:w+6,h:h+4};if(candidate.y>8&&candidate.y+h<height-70&&!occupied.some(r=>overlaps(candidate,r))){rect=candidate;break;}}
  if(!rect&&actor.name==='Benson')rect={x:Math.max(4,Math.min(width-w-4,p.x-w/2)),y:Math.max(10,p.y-h-30),w,h};
  if(!rect){label.el.hidden=true;continue;}label.el.style.left=rect.x+w/2+'px';label.el.style.top=rect.y+h+'px';occupied.push(rect);
 }
}
