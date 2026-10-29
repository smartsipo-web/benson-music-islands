import {scryptSync,timingSafeEqual,createHash} from 'node:crypto';
export const PREFIX='benson-activities-v1/';
export const sha=value=>createHash('sha256').update(value).digest('hex');
export function checkPassword(password,encoded){try{const [salt,hash]=encoded.split(':');const expected=Buffer.from(hash,'hex');const actual=scryptSync(password,salt,64);return actual.length===expected.length&&timingSafeEqual(actual,expected)}catch{return false}}
export function cleanText(v,max,label){if(v==null)return '';if(typeof v!=='string'||v.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v))throw Error(`${label}格式不正確或過長`);return v.trim()}
export function youtube(value){const raw=cleanText(value,500,'影片網址');if(!raw)return '';let u;try{u=new URL(raw)}catch{throw Error('請貼上完整 YouTube 影片網址')}if(u.protocol!=='https:')throw Error('影片網址必須使用 https');const h=u.hostname.toLowerCase();let id;if(h==='youtu.be')id=u.pathname.slice(1);else if(['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com'].includes(h))id=u.pathname==='/watch'?u.searchParams.get('v'):u.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)\/?$/)?.[1];if(!/^[\w-]{11}$/.test(id||''))throw Error('請使用 YouTube 單支影片網址');return `https://www.youtube.com/watch?v=${id}`}
export function validateEvent(raw){
 const title=cleanText(raw.title,160,'活動名稱');if(!title)throw Error('請填寫活動名稱');
 const date=cleanText(raw.date,10,'日期');if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T00:00:00+08:00'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)throw Error('請填寫有效日期');
 if(!['competition','performance'].includes(raw.type)||!['drum','dance'].includes(raw.category)||!['upcoming','completed'].includes(raw.phase))throw Error('請選擇活動類型與階段');
 const time=cleanText(raw.time,5,'時間');if(time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw Error('時間格式不正確');
 const groups=(raw.groups||[]).map(g=>({name:cleanText(g.name,100,'組別'),result:cleanText(g.result,100,'名次'),score:cleanText(g.score,100,'分數'),youtube:youtube(g.youtube),comment:cleanText(g.comment,8000,'評語')}));if(groups.length>20)throw Error('一場活動最多 20 個組別');
 const media=(raw.media||[]).map(m=>{if(!/^[a-f0-9-]{36}$/.test(m.id)||!['poster','photo','review'].includes(m.kind))throw Error('照片資料不正確');return {id:m.id,kind:m.kind,label:cleanText(m.label,160,'照片說明')}});if(media.length>40||new Set(media.map(m=>m.id)).size!==media.length)throw Error('照片最多 40 張，且不可重複');
 return {title,date,time,type:raw.type,category:raw.category,phase:raw.phase,location:cleanText(raw.location,160,'地點'),song:cleanText(raw.song,200,'曲目'),description:cleanText(raw.description,8000,'活動說明'),youtube:youtube(raw.youtube),groups,media};
}
export function publicEvents(state){return Object.values(state.events||{}).filter(e=>e.published).map(e=>e.published).sort((a,b)=>b.date.localeCompare(a.date))}
export function imageType(bytes){if(bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'image/png';if(bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP')return 'image/webp';throw Error('僅支援 JPG、PNG 或 WebP 照片')}
