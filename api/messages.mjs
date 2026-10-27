import {validateMessage,session,send,input} from '../lib/community.mjs';
import {records,readRecord,saveRecord} from '../lib/community-store.mjs';
import {randomUUID} from 'node:crypto';
const PREFIX='encouragement/';
export default async function handler(req,res){
 if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return send(res,405,{error:'不支援的操作'})}
 try{const owner=req.method==='POST'?session(req,res):null,now=Date.now();
  if(req.method==='POST'){
   let body;try{body=validateMessage(await input(req))}catch(e){return send(res,400,{error:e.message})}
   const recent=await records(`message-rate/${owner}/`,1);if(recent[0]&&now-new Date(recent[0].uploadedAt).getTime()<60000)return send(res,429,{error:'謝謝你的鼓勵，請稍等一分鐘再留言'});
   // Time bucket prevents duplicate writes from double-clicks; message files are immutable.
   const bucket=Math.floor(now/60000),guard=`message-rate/${owner}/${bucket}.json`;
   try{await saveRecord(guard,{at:now})}catch{return send(res,429,{error:'留言已送出，請稍等一分鐘'})}
   const id=randomUUID(),message={...body,id,createdAt:now};await saveRecord(`${PREFIX}${String(9999999999999-now)}-${id}.json`,message);
   return send(res,201,{message,serverTime:now});
  }
  const blobs=await records(PREFIX,60),messages=(await Promise.all(blobs.map(b=>readRecord(b.pathname)))).filter(Boolean).sort((a,b)=>b.createdAt-a.createdAt);
  return send(res,200,{messages,serverTime:now});
 }catch(e){console.error('message-api',e.name,e.message);return send(res,503,{error:'生命之樹暫時忙碌，請稍後再試'})}
}
