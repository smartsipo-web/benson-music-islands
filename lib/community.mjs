import {createHash,randomBytes} from 'node:crypto';
export const VISIT_MS=30*60*1000;
export const SHIRTS=['#ea7456','#69b7b0','#9274ca','#e7b950','#628cb8','#db87ad'];
export const SKINS=['#f2c598','#d9a37c','#a97250'];
export const HAIRS=['short','long','curly','cap'];
export const HOMES=['drum','dance','performance','certification','media'];
const RESERVED=new Set(['benson','施維駿','維駿','eric','fun','amber','鳥鳥','鳥鳥老師','阿寶','阿寶老師','阿嬤','萱萱老師','小臻','湯湯']);
export function text(value,max,label){if(typeof value!=='string')throw Error(`請填寫${label}`);const clean=value.normalize('NFC').trim();if(!clean||[...clean].length>max||/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u202a-\u202e\u2066-\u2069]|https?:|www\./iu.test(clean))throw Error(`${label}請使用 1–${max} 字，請勿加入網址或特殊標記`);return clean;}
export function validateVisitor(input){const name=text(input?.name,12,'暱稱');if(RESERVED.has(name.toLowerCase()))throw Error('這個名字已有島民使用，請換一個暱稱');if(!SHIRTS.includes(input.shirt)||!SKINS.includes(input.skin)||!HAIRS.includes(input.hair)||!HOMES.includes(input.home))throw Error('請從選項選擇角色造型與島嶼');return {name,shirt:input.shirt,skin:input.skin,hair:input.hair,home:input.home};}
export function validateMessage(input){return {name:text(input?.name,16,'本名或暱稱'),message:text(input?.message,180,'鼓勵的話')};}
export function isActive(visitor,now=Date.now()){return Number.isFinite(visitor?.createdAt)&&Number.isFinite(visitor?.expiresAt)&&visitor.expiresAt===visitor.createdAt+VISIT_MS&&visitor.createdAt<=now&&visitor.expiresAt>now;}
export function publicVisitor(v){return {id:v.id,name:v.name,shirt:v.shirt,skin:v.skin,hair:v.hair,home:v.home,createdAt:v.createdAt,expiresAt:v.expiresAt};}
export function session(req,res){const value=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('__Host-island_id='))?.split('=')[1];const token=/^[a-f0-9]{64}$/.test(value||'')?value:randomBytes(32).toString('hex');if(value!==token)res.setHeader('Set-Cookie',`__Host-island_id=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`);return createHash('sha256').update(token).digest('hex');}
export function send(res,status,data){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.end(JSON.stringify(data));}
export async function input(req){if(req.headers.origin!==`https://${req.headers.host}`)throw Error('請從音樂群島網站內送出');if(!String(req.headers['content-type']||'').startsWith('application/json'))throw Error('請使用正確的表單格式');if(Number(req.headers['content-length']||0)>2048)throw Error('內容過長');if(req.body){return typeof req.body==='string'?JSON.parse(req.body):req.body}let data='';for await(const chunk of req){data+=chunk;if(Buffer.byteLength(data)>2048)throw Error('內容過長')}return JSON.parse(data);}
