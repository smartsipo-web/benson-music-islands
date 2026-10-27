import {VISIT_MS,validateVisitor,isActive,publicVisitor,session,send,input} from '../lib/community.mjs';
import {records,readRecord,saveRecord,removeRecords} from '../lib/community-store.mjs';
import {randomUUID} from 'node:crypto';
const PREFIX='presence/';
async function allVisitors(now){const blobs=await records(PREFIX,1000);const old=blobs.filter(b=>new Date(b.uploadedAt).getTime()+VISIT_MS<=now);await removeRecords(old.slice(0,100).map(b=>b.pathname));const recent=blobs.filter(b=>new Date(b.uploadedAt).getTime()+VISIT_MS>now);const rows=await Promise.all(recent.slice(0,32).map(b=>readRecord(b.pathname)));return rows.filter(v=>v&&isActive(v,now));}
export default async function handler(req,res){
 if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return send(res,405,{error:'不支援的操作'})}
 try{const owner=session(req,res),now=Date.now();
  if(req.method==='POST'){
   let body;try{body=validateVisitor(await input(req))}catch(e){return send(res,400,{error:e.message})}
   const path=`${PREFIX}${owner}.json`,existing=await readRecord(path);
   if(existing&&isActive(existing,now))return send(res,200,{visitor:publicVisitor(existing),serverTime:now,reused:true});
   const current=await allVisitors(now);if(current.length>=24)return send(res,429,{error:'島上目前很熱鬧，請稍後再登島'});
   if(existing)await removeRecords([path]);const visitor={...body,id:randomUUID(),owner,createdAt:now,expiresAt:now+VISIT_MS};
   try{await saveRecord(path,visitor)}catch(e){const winner=await readRecord(path);if(winner&&isActive(winner,now))return send(res,200,{visitor:publicVisitor(winner),serverTime:now,reused:true});throw e}
   return send(res,201,{visitor:publicVisitor(visitor),serverTime:now});
  }
  const visitors=await allVisitors(now),mine=await readRecord(`${PREFIX}${owner}.json`);
  return send(res,200,{visitors:visitors.map(publicVisitor),mine:mine&&isActive(mine,now)?publicVisitor(mine):null,serverTime:now});
 }catch(e){console.error('visitor-api',e.name,e.message);return send(res,503,{error:'登島服務暫時忙碌，請稍後再試'})}
}
