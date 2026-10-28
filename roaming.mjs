const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const angleTo=(a,b)=>Math.atan2(b.z-a.z,b.x-a.x);
export function createWalkWorld(islands,{stageOverrides={},stageApproaches={}}={}){
 const zones=[...islands,{id:'tree',name:'勇氣之樹',x:-13,z:10.3,r:2.4},{id:'corridor',name:'獎盃迴廊',x:0,z:12.3,r:1.6}];
 const links=[[0,1],[0,2],[0,3],[0,4],[2,5],[0,6]];
 const point=(i,a)=>{const d=zones[i];return i===6?[Math.cos(a)*5.5,.27,12.3]:[d.x+Math.cos(a)*(d.r-.65),.2,d.z+Math.sin(a)*(d.r-.65)];};
 const stages=islands.map((d,i)=>stageOverrides[i]||(i===0?[d.x,.45,d.z-.8]:[d.x,.28,d.z+(i===3?1.65:i===4?1.85:.6)]));
 function arc(i,a,b){if(i===6)return [point(i,a),point(i,b)];const diff=((b-a+Math.PI*3)%(Math.PI*2))-Math.PI,steps=Math.max(1,Math.ceil(Math.abs(diff)/.16));return Array.from({length:steps+1},(_,j)=>point(i,a+diff*j/steps));}
 function stagePath(i,enter){const d=zones[i];const path=stageApproaches[i]?[point(i,Math.PI/2),...stageApproaches[i],stages[i]]:i===0?[point(i,Math.PI/2),[d.x-1.85,.2,d.z+1.85],[d.x-1.65,.4,d.z-.8],stages[i]]:[point(i,Math.PI/2),stages[i]];return enter?path:path.slice().reverse();}
 function hops(from,to){const queue=[[from]],seen=new Set([from]);while(queue.length){const route=queue.shift(),last=route.at(-1);if(last===to)return route;for(const edge of links){if(!edge.includes(last))continue;const next=edge.find(i=>i!==last);if(!seen.has(next)){seen.add(next);queue.push([...route,next]);}}}throw Error('Unconnected walking area');}
 function route(from,a,to,b,fromStage=false,toStage=false){
  const path=fromStage?stagePath(from,false):[point(from,a)];if(fromStage)a=Math.PI/2;
  const chain=hops(from,to);let current=from,currentAngle=a;
  for(const next of chain.slice(1)){
   if(next===6){path.push(...arc(current,currentAngle,Math.PI/2),[0,.2,3.6],[0,.2,10.7],[0,.27,12.3]);currentAngle=Math.PI/2;}
   else if(current===6){path.push([0,.27,12.3],[0,.2,10.7],[0,.2,3.6],point(next,Math.PI/2));currentAngle=Math.PI/2;}
   else {const exit=angleTo(zones[current],zones[next]),entry=angleTo(zones[next],zones[current]),dir=[Math.cos(exit),Math.sin(exit)];path.push(...arc(current,currentAngle,exit));path.push([zones[current].x+dir[0]*(zones[current].r-.2),.2,zones[current].z+dir[1]*(zones[current].r-.2)],[zones[next].x-dir[0]*(zones[next].r-.2),.2,zones[next].z-dir[1]*(zones[next].r-.2)],point(next,entry));currentAngle=entry;}
   current=next;
  }
  path.push(...arc(to,currentAngle,toStage?Math.PI/2:b));if(toStage)path.push(...stagePath(to,true));
  const lengths=[0];for(let i=1;i<path.length;i++)lengths.push(lengths[i-1]+distance(path[i-1],path[i]));return {path,lengths,length:lengths.at(-1)};
 }
 return {zones,point,stages,route};
}

// Per-person destinations, speed and rest periods; all clocks pause with the scene.
export function createRoamer(world,home,{random=Math.random,now=0,performer=false}={}){
 let zone=home,angle=random()*Math.PI*2,atStage=performer&&home<5,position=atStage?world.stages[home]:world.point(home,angle),yaw=0;
 let restUntil=now+1+random()*5,move=null,requested=null,lastTime=now,phaseStart=now,stageHeld=false;
 function request(destination,stage=false){requested={zone:destination,stage:stage&&destination<5};restUntil=lastTime;}
 function sample(time){
  lastTime=time;
  if(move){const travelled=Math.min(move.length,Math.max(0,time-move.start)*move.speed);let i=1;while(i<move.lengths.length-1&&move.lengths[i]<travelled)i++;const a=move.path[i-1],b=move.path[i],span=move.lengths[i]-move.lengths[i-1],fraction=span?(travelled-move.lengths[i-1])/span:0;position=a.map((v,j)=>v+(b[j]-v)*fraction);if(distance(a,b)>.001)yaw=Math.atan2(b[0]-a[0],b[2]-a[2]);
   if(travelled>=move.length){zone=move.to;angle=move.angle;atStage=move.stage;move=null;phaseStart=time;restUntil=time+(atStage?7+random()*7:1+random()*4);}
  }
  if(!move&&time>=restUntil&&!(stageHeld&&atStage)){const target=requested||{zone:Math.floor(random()*(world.zones.length-1)),stage:false};if(!requested&&target.zone>=zone)target.zone++;if(!requested)target.stage=performer&&target.zone<5&&random()<.65;requested=null;const nextAngle=random()*Math.PI*2;move={...world.route(zone,angle,target.zone,nextAngle,atStage,target.stage),to:target.zone,angle:nextAngle,stage:target.stage,start:time,speed:.75+random()*.35};}
  return {position:[...position],yaw,kind:move?'walk':atStage?'perform':'pause',island:zone,next:move?.to,phase:time-phaseStart};
 }
 return {sample,request,holdStage(value){stageHeld=value;}};
}
