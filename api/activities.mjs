import {get,head,put,del,BlobNotFoundError,BlobPreconditionFailedError} from '@vercel/blob';
import {randomBytes,randomUUID,scryptSync} from 'node:crypto';
import {PREFIX,sha,checkPassword,validateEvent,publicEvents,imageType} from '../lib/activities.mjs';
const STATE=PREFIX+'state.json',CONFIG=PREFIX+'auth.json';
async function read(path){
 // Conditional writes require the storage version, not a compressed HTTP response ETag.
 // Read metadata first: a change between head/get safely fails the subsequent write.
 let metadata;try{metadata=await head(path)}catch(e){if(e instanceof BlobNotFoundError)return null;throw e}
 const r=await get(path,{access:'private',useCache:false,headers:{'accept-encoding':'identity'}});if(!r||r.statusCode!==200)return null;
 if(path===STATE&&r.blob.etag!==metadata.etag)console.warn('activities_storage_etag',{responseWeak:r.blob.etag.startsWith('W/'),responseMatchesStorage:false});
 return {data:await new Response(r.stream).json(),etag:metadata.etag};
}
async function write(path,data,etag){return put(path,JSON.stringify(data),{access:'private',contentType:'application/json',addRandomSuffix:false,cacheControlMaxAge:0,...(etag?{allowOverwrite:true,ifMatch:etag}:{allowOverwrite:false})})}
async function authConfig(){return (await read(CONFIG))?.data||{hash:process.env.BENSON_ADMIN_PASSWORD_HASH}}
function cookie(req){return (req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('__Host-benson_admin='))?.slice(20)||''}
async function session(req){const token=cookie(req);if(!/^[a-f0-9]{64}$/.test(token))return null;const [s,c]=await Promise.all([read(PREFIX+'sessions/'+sha(token)+'.json'),authConfig()]);if(!s||s.data.expires<Date.now()||s.data.version!==sha(c.hash||''))return null;return s.data}
function send(res,status,data){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.end(JSON.stringify(data))}
async function body(req){if(req.headers.origin!==`https://${req.headers.host}`&&!(process.env.NODE_ENV==='test'&&req.headers.origin===`http://${req.headers.host}`))throw Error('請從管理後台送出操作');if(!String(req.headers['content-type']||'').startsWith('application/json'))throw Error('表單格式不正確');if(Number(req.headers['content-length']||0)>3800000)throw Error('檔案過大');if(req.body)return typeof req.body==='string'?JSON.parse(req.body):req.body;let value='';for await(const c of req){value+=c;if(Buffer.byteLength(value)>3800000)throw Error('檔案過大')}return JSON.parse(value)}
async function loginLimit(req){const ip=String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||'unknown').split(',')[0];const path=PREFIX+'limits/'+sha(ip)+'.json';for(let n=0;n<3;n++){const old=await read(path),v=old?.data;const count=v&&v.until>Date.now()?v.count:0;if(count>=8){const e=Error('登入次數過多，請 15 分鐘後再試');e.status=429;throw e}try{await write(path,{count:count+1,until:count&&v?v.until:Date.now()+900000},old?.etag);return}catch(e){if(n===2)throw e}}}
export default async function handler(req,res){
 const action=new URL(req.url,'https://local').searchParams.get('action')||'public';
 try{
 if(action==='public'&&req.method==='GET'){res.setHeader('Access-Control-Allow-Origin','*');const s=await read(STATE);return send(res,200,{events:publicEvents(s?.data||{}),updatedAt:s?.data.updatedAt||null})}
 if(action==='media'&&req.method==='GET'){
  const id=new URL(req.url,'https://local').searchParams.get('id');if(!/^[a-f0-9-]{36}$/.test(id||''))return send(res,404,{error:'找不到照片'});
  const s=await read(STATE);const visible=publicEvents(s?.data||{}).some(e=>e.media.some(m=>m.id===id));if(!visible&&!await session(req))return send(res,404,{error:'找不到照片'});
  const r=await get(PREFIX+'media/'+id,{access:'private',useCache:false});if(!r||r.statusCode!==200)return send(res,404,{error:'找不到照片'});res.setHeader('Content-Type',r.blob.contentType);res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');res.statusCode=200;return res.end(Buffer.from(await new Response(r.stream).arrayBuffer()));
 }
 if(action==='session'&&req.method==='GET')return send(res,200,{authenticated:!!await session(req),configured:!!process.env.BENSON_ADMIN_PASSWORD_HASH});
 if(req.method!=='POST')return send(res,405,{error:'不支援的操作方式'});
 const input=await body(req);
 if(action==='login'){
  if(typeof input.password!=='string'||input.password.length>200)return send(res,400,{error:'密碼格式不正確'});await loginLimit(req);const config=await authConfig();if(!config.hash)return send(res,503,{error:'後台尚未設定登入密碼'});if(!checkPassword(input.password,config.hash))return send(res,401,{error:'密碼不正確'});
  const token=randomBytes(32).toString('hex');await write(PREFIX+'sessions/'+sha(token)+'.json',{expires:Date.now()+8*3600000,version:sha(config.hash)});res.setHeader('Set-Cookie',`__Host-benson_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`);return send(res,200,{ok:true});
 }
 if(!await session(req))return send(res,401,{error:'請先登入管理後台'});
 if(action==='logout'){await del(PREFIX+'sessions/'+sha(cookie(req))+'.json');res.setHeader('Set-Cookie','__Host-benson_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');return send(res,200,{ok:true})}
 if(action==='password'){
  const config=await authConfig();if(!checkPassword(input.currentPassword||'',config.hash))return send(res,400,{error:'目前密碼不正確'});if(typeof input.password!=='string'||input.password.length<12||input.password.length>128)return send(res,400,{error:'新密碼請使用 12–128 個字元'});const salt=randomBytes(16).toString('hex'),hash=salt+':'+scryptSync(input.password,salt,64).toString('hex');const old=await read(CONFIG);await write(CONFIG,{hash},old?.etag);res.setHeader('Set-Cookie','__Host-benson_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');return send(res,200,{ok:true});
 }
 if(action==='list'){const state=await read(STATE);return send(res,200,{events:Object.values(state?.data.events||{}).sort((a,b)=>b.draft.date.localeCompare(a.draft.date))})}
 if(action==='upload'){
  if(typeof input.data!=='string'||input.data.length>3500000||!/^[A-Za-z0-9+/]*={0,2}$/.test(input.data))throw Error('照片過大，請縮小後再上傳');const bytes=Buffer.from(input.data,'base64');if(bytes.length>2500000)throw Error('照片需小於 2.5 MB');const type=imageType(bytes),id=randomUUID();await put(PREFIX+'media/'+id,bytes,{access:'private',contentType:type,addRandomSuffix:false,allowOverwrite:false});return send(res,200,{id});
 }
 if(!['save','publish','unpublish'].includes(action))return send(res,400,{error:'不支援的操作'});
 const state=await read(STATE),data=state?.data||{events:{}};const id=input.id||randomUUID();if(!/^[a-f0-9-]{36}$/.test(id))throw Error('活動編號不正確');const old=data.events[id];if(old&&input.revision!==old.revision)return send(res,409,{error:'這場活動已在其他視窗更新，請重新開啟後再編輯'});
 const event=action==='unpublish'?old?.draft:validateEvent(input.event);if(!event)throw Error('找不到活動');
 const now=new Date().toISOString();data.events[id]={id,draft:event,published:action==='publish'?{...event,id,publishedAt:now}:action==='unpublish'?null:old?.published||null,revision:(old?.revision||0)+1,updatedAt:now};data.updatedAt=now;
 await write(STATE,data,state?.etag);return send(res,200,{event:data.events[id],ok:true});
 }catch(e){console.error('activities',action,e.constructor.name,String(e.message||'').slice(0,250));if(e instanceof BlobPreconditionFailedError||/precondition|already exists|condition/i.test(e.message||''))return send(res,409,{error:'資料版本剛剛有更新，你填寫的內容仍保留在畫面，請稍後再按一次儲存或發布'});return send(res,e.status||400,{error:/blob|token|fetch|network/i.test(e.message||'')?'儲存服務暫時無法使用，請稍後再試':e.message||'操作失敗，請稍後再試'})}
}
