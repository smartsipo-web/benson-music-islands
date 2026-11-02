import {get,head,put,list,BlobNotFoundError,BlobPreconditionFailedError} from '@vercel/blob';
import {createHash,randomBytes,randomUUID,randomInt} from 'node:crypto';
import {input,send,validateVisitor} from '../lib/community.mjs';
import {fresh,newPlayer,mutate,ranking,dayNumber,GEAR,SKILLS,ZONES,REWARDS,stats} from '../lib/demon-game.mjs';
const PREFIX='demon-rpg-v1/',COOKIE='__Host-benson_adventure';
const hash=s=>createHash('sha256').update(s).digest('hex');
async function read(path){let meta;try{meta=await head(path)}catch(e){if(e instanceof BlobNotFoundError)return null;throw e;}const r=await get(path,{access:'private',useCache:false,headers:{'accept-encoding':'identity'}});if(!r||r.statusCode!==200)return null;return {data:await new Response(r.stream).json(),etag:meta.etag};}
const write=(path,data,etag)=>put(path,JSON.stringify(data),{access:'private',contentType:'application/json',addRandomSuffix:false,cacheControlMaxAge:0,...(etag?{allowOverwrite:true,ifMatch:etag}:{allowOverwrite:false})});
function token(req,res){const old=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);const value=/^[a-f0-9]{64}$/.test(old||'')?old:randomBytes(32).toString('hex');setCookie(res,value);return value;}
function setCookie(res,t){res.setHeader('Set-Cookie',`${COOKIE}=${t}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`);}
function view(p,now){if(p)fresh(p,now);return {player:p,serverDay:dayNumber(now),serverTime:now,gear:GEAR,skills:SKILLS,zones:ZONES,rewards:REWARDS,stats:p?stats(p):null};}
async function creationLimit(req,now){const ip=String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||'unknown').split(',')[0],path=PREFIX+'limits/'+hash(ip)+'.json';const old=await read(path),day=dayNumber(now),count=old?.data.day===day?old.data.count:0;if(count>=5)throw Error('今天建立角色的次數已達上限');await write(path,{day,count:count+1},old?.etag);}
export default async function handler(req,res){try{if(!['GET','POST'].includes(req.method))return send(res,405,{error:'不支援的操作'});const now=Date.now(),t=token(req,res),path=PREFIX+'players/'+hash(t)+'.json',action=new URL(req.url,'https://local').searchParams.get('action');
 if(req.method==='GET'){const old=await read(path);if(action==='ranking'){const blobs=[];let cursor;do{const page=await list({prefix:PREFIX+'players/',limit:1000,cursor});blobs.push(...page.blobs);cursor=page.hasMore?page.cursor:undefined;}while(cursor);const players=[];for(let i=0;i<blobs.length;i+=20){const batch=await Promise.all(blobs.slice(i,i+20).map(b=>read(b.pathname)));players.push(...batch.filter(Boolean).map(r=>r.data));}return send(res,200,ranking(players,old?.data.id));}return send(res,200,view(old?.data||null,now));}
 let body;try{body=await input(req)}catch(e){return send(res,400,{error:e.message});}
 if(body.action==='recover'){const code=String(body.code||'').replace(/[\s-]/g,'').toLowerCase();if(!/^[a-f0-9]{64}$/.test(code))return send(res,400,{error:'請輸入完整冒險存檔碼'});const found=await read(PREFIX+'players/'+hash(code)+'.json');if(!found)return send(res,404,{error:'找不到這份冒險存檔'});setCookie(res,code);return send(res,200,view(found.data,now));}
 const old=await read(path);
 if(body.action==='create'){if(old)return send(res,200,view(old.data,now));let avatar;try{avatar=validateVisitor({...body.avatar,home:'drum'});if(!['drum','dance'].includes(body.kind))throw Error('請選擇流派');await creationLimit(req,now);}catch(e){return send(res,400,{error:e.message});}const p=newPlayer(avatar,body.kind,randomUUID(),now);await write(path,p);return send(res,201,{...view(p,now),message:'角色建立成功，記得保存冒險存檔碼。'});}
 if(!old)return send(res,404,{error:'請先建立冒險角色'});if(body.action==='backup')return send(res,200,{code:t});
 try{const p=structuredClone(old.data),message=mutate(p,body,now,()=>randomInt(0,1000000)/1000000);await write(path,p,old.etag);return send(res,200,{...view(p,now),message});}catch(e){if(e instanceof BlobPreconditionFailedError)return send(res,409,{error:'另一個操作已更新存檔，請重新整理冒險資料再試'});return send(res,400,{error:e.message});}
 }catch(e){console.error('demon-rpg',e.name);return send(res,503,{error:'洞穴服務暫時忙碌，請稍後再試'});}}
