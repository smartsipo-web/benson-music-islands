export const TEACHER_ROLES={
 '鳥鳥老師':{role:'drums',zone:0,point:[-1.35,.45,.55]},
 '阿寶老師':{role:'drums',zone:0,point:[1.35,.45,.55]},
 '萱萱老師':{role:'dance',zone:1,offset:[0,-.55]},
 '小臻老師':{role:'dance',zone:1,offset:[-.95,.6]},
 '湯湯老師':{role:'dance',zone:1,offset:[.95,.6]}
};

// Teachers gather by walking, share a performance clock, then resume free roaming.
export function createTeacherSessions(actors,{random=Math.random}={}){
 const groups=['drums','dance'].map(role=>({role,zone:role==='drums'?0:1,members:actors.filter(a=>TEACHER_ROLES[a.name]?.role===role),state:'new',started:0,next:0}));
 function gather(group){group.state='gathering';for(const actor of group.members){actor.roamer.holdStage(true);actor.roamer.request(group.zone,true);}}
 return {
  visit(role){const group=groups.find(g=>g.role===role);if(group&&(group.state==='roaming'||group.state==='new'))gather(group);},
  update(time){for(const group of groups){if(!group.members.length)continue;if(group.state==='new'||group.state==='roaming'&&time>=group.next)gather(group);
   if(group.state==='gathering'&&group.members.every(a=>a.roamPose?.kind==='perform'&&a.roamPose.island===group.zone)){group.state='performing';group.started=time;}
   if(group.state==='performing'&&time-group.started>=22){group.state='roaming';group.next=time+50+random()*20;for(const actor of group.members){actor.roamer.holdStage(false);let destination=Math.floor(random()*6);if(destination>=group.zone)destination++;actor.roamer.request(destination,false);}}
   for(const actor of group.members)actor.teacherSession={role:group.role,active:group.state==='performing',phase:time-group.started,state:group.state};
  }},
  snapshot(){return Object.fromEntries(groups.map(g=>[g.role,g.state]));}
 };
}
