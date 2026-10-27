const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
export function createTour(defs){
 const segments=[];let clock=0;const point=(d,angle,r=d.r-.65)=>[d.x+Math.cos(angle)*r,.2,d.z+Math.sin(angle)*r];
 const anchors=defs.map((d,i)=>i===0?[d.x,.45,d.z-.8]:[d.x,.28,d.z+(i===3?1.65:i===4?1.85:.6)]);
 function arc(d,a,b){let diff=((b-a+Math.PI*3)%(Math.PI*2))-Math.PI;const steps=Math.max(2,Math.ceil(Math.abs(diff)/.2));return Array.from({length:steps+1},(_,i)=>point(d,a+diff*i/steps));}
 const edgeAngle=(from,to)=>Math.atan2(to.z-from.z,to.x-from.x);
 function leave(i,other){const d=defs[i],a=edgeAngle(d,other);const start=i===0?[anchors[i],[d.x-1.65,.4,d.z-.8],[d.x-1.85,.2,d.z+1.85],point(d,Math.PI/2)]:[anchors[i],point(d,Math.PI/2)];return [...start,...arc(d,Math.PI/2,a)]}
 function enter(i,other){const d=defs[i],a=edgeAngle(d,other);const path=[...arc(d,a,Math.PI/2)];if(i===0)path.push([d.x-1.85,.2,d.z+1.85],[d.x-1.65,.4,d.z-.8]);path.push(anchors[i]);return path;}
 const order=[0,1,2,3,4];
 for(let index=0;index<order.length;index++){
  const from=order[index],to=order[(index+1)%order.length];segments.push({kind:'perform',island:from,start:clock,duration:14,point:anchors[from]});clock+=14;
  let path;
  if(from===0)path=[...leave(from,defs[to]),...enter(to,defs[0])];
  else if(to===0)path=[...leave(from,defs[0]),...enter(0,defs[from])];
  else {const a=edgeAngle(defs[0],defs[from]),b=edgeAngle(defs[0],defs[to]);path=[...leave(from,defs[0]),...arc(defs[0],a,b),...enter(to,defs[0])];}
  const lengths=[0];for(let i=1;i<path.length;i++)lengths.push(lengths[i-1]+distance(path[i-1],path[i]));const duration=lengths.at(-1)/1.05;segments.push({kind:'walk',island:from,next:to,start:clock,duration,path,lengths,length:lengths.at(-1)});clock+=duration;
 }
 return {segments,duration:clock};
}
export function sampleTour(tour,time){const elapsed=((time%tour.duration)+tour.duration)%tour.duration;const segment=tour.segments.find(s=>elapsed<s.start+s.duration)||tour.segments.at(-1),phase=elapsed-segment.start;
 if(segment.kind==='perform')return {...segment,phase,position:segment.point,yaw:0};
 const travelled=phase/segment.duration*segment.length;let i=1;while(i<segment.lengths.length-1&&segment.lengths[i]<travelled)i++;const a=segment.path[i-1],b=segment.path[i],span=segment.lengths[i]-segment.lengths[i-1],t=span?(travelled-segment.lengths[i-1])/span:0;return {...segment,phase,position:a.map((v,j)=>v+(b[j]-v)*t),yaw:Math.atan2(b[0]-a[0],b[2]-a[2])};
}
