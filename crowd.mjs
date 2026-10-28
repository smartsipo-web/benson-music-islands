export function movementAdjustment(actor,others){
 const forward=[Math.sin(actor.yaw),Math.cos(actor.yaw)];let rate=1,lane=0,greeting=false;
 for(const other of others){if(other===actor)continue;const dx=other.position[0]-actor.position[0],dz=other.position[2]-actor.position[2],distance=Math.hypot(dx,dz);if(distance>1.05||Math.abs(other.position[1]-actor.position[1])>.6)continue;
  greeting=true;const ahead=dx*forward[0]+dz*forward[1],alignment=Math.cos(actor.yaw-other.yaw);
  if(distance<.85&&ahead>.08&&alignment>.35)rate=Math.min(rate,.25);
  if(distance<.95&&alignment<-.2)lane=.21;
 }
 return {rate,lane,greeting};
}
export function turnTowards(current,target,dt){const diff=Math.atan2(Math.sin(target-current),Math.cos(target-current));return current+diff*Math.min(1,dt*5);}
