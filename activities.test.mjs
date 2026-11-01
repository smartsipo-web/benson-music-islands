import {test} from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {scryptSync,randomUUID} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {validateEvent,youtube,publicEvents,validateGallery} from './lib/activities.mjs';
globalThis.activityTestBlobs=new Map();let sequence=0;
class BlobNotFoundError extends Error{}
class BlobPreconditionFailedError extends Error{}
globalThis.activityTestStorage={
 BlobNotFoundError,BlobPreconditionFailedError,
 async head(path){const value=activityTestBlobs.get(path);if(!value)throw new BlobNotFoundError('not found');return {etag:value.etag}},
 async get(path){const value=activityTestBlobs.get(path);if(!value)return null;return {statusCode:200,stream:new Response(value.bytes).body,blob:{etag:'W/'+value.etag,contentType:value.contentType}}},
 async put(path,body,options){const old=activityTestBlobs.get(path);if(options.ifMatch?old?.etag!==options.ifMatch:old&&!options.allowOverwrite)throw new BlobPreconditionFailedError('precondition failed');if(old&&options.ifMatch)assert.equal(options.allowOverwrite,true,'conditional updates explicitly allow overwrite');const value={bytes:Buffer.from(body),etag:'"'+String(++sequence)+'"',contentType:options.contentType};activityTestBlobs.set(path,value);return {etag:value.etag}},
 async del(path){activityTestBlobs.delete(path)}
};
registerHooks({resolve(specifier,context,next){if(specifier==='@vercel/blob')return {url:'data:text/javascript,export const {get,head,put,del,BlobNotFoundError,BlobPreconditionFailedError}=globalThis.activityTestStorage;',shortCircuit:true};return next(specifier,context)}});
const {default:handler}=await import('./api/activities.mjs');
const pass='test-only-long-password';process.env.BENSON_ADMIN_PASSWORD_HASH='test-salt:'+scryptSync(pass,'test-salt',64).toString('hex');
async function request(action,{method='POST',body={},cookie,origin='https://test.local',ip='test'}={}){let headers={},raw;const req={url:'/api/activities?action='+action,method,headers:{host:'test.local',origin,'content-type':'application/json','x-forwarded-for':ip,...(cookie?{cookie}:{})},body};const res={statusCode:200,setHeader(k,v){headers[k.toLowerCase()]=v},end(v){raw=v}};await handler(req,res);let data;try{data=JSON.parse(raw)}catch{data=raw}return {status:res.statusCode,data,headers}}
const event={title:'測試活動 <不應變成 HTML>',date:'2026-10-31',time:'13:00',type:'competition',category:'drum',phase:'upcoming',location:'台中',description:'活動說明',song:'GAIA',youtube:'https://youtu.be/FA_GpWYkxAM?test=1',groups:[],media:[]};
test('validation rejects unsafe video hosts and impossible dates; preserves multiple groups',()=>{assert.equal(youtube(event.youtube),'https://www.youtube.com/watch?v=FA_GpWYkxAM');for(const url of ['https://youtube.com.evil.test/watch?v=FA_GpWYkxAM','javascript:alert(1)','https://youtube.com/playlist?list=abc'])assert.throws(()=>youtube(url));assert.throws(()=>validateEvent({...event,date:'2026-02-30'}));assert.throws(()=>validateEvent({...event,time:'25:20'}));assert.equal(validateEvent({...event,groups:[{name:'A',result:'第一名'},{name:'B',result:'第二名'}]}).groups.length,2)});
test('authenticated draft → publish → draft edit → result update → unpublish, including photo privacy and conflicts',async()=>{
 assert.equal((await request('save',{body:{event}})).status,401);
 assert.equal((await request('login',{body:{password:pass},origin:'https://evil.test'})).status,400);
 assert.equal((await request('login',{body:{password:'wrong'}})).status,401);
 const login=await request('login',{body:{password:pass}});assert.equal(login.status,200);const cookie=login.headers['set-cookie'].split(';')[0];assert.match(cookie,/^__Host-benson_admin=/);assert.match(login.headers['set-cookie'],/HttpOnly; Secure; SameSite=Strict/);
 assert.equal((await request('session',{method:'GET',cookie})).data.authenticated,true);
 const upload=await request('upload',{cookie,body:{data:Buffer.from([255,216,255,1,2,3]).toString('base64')}});assert.equal(upload.status,200);const media=[{id:upload.data.id,kind:'photo',label:'舞台照'}];
 assert.equal((await request('upload',{cookie,body:{data:Buffer.from('<svg onload="alert(1)">').toString('base64')}})).status,400);
 let result=await request('save',{cookie,body:{event:{...event,media}}});assert.equal(result.status,200);let record=result.data.event;assert.equal((await request('public',{method:'GET'})).data.events.length,0);
 assert.equal((await request('media&id='+upload.data.id,{method:'GET'})).status,404);
 assert.equal((await request('media&id='+upload.data.id,{method:'GET',cookie})).status,200);
 result=await request('publish',{cookie,body:{id:record.id,revision:record.revision,event:record.draft}});assert.equal(result.status,200);record=result.data.event;assert.equal((await request('public',{method:'GET'})).data.events.length,1);assert.equal((await request('media&id='+upload.data.id,{method:'GET'})).status,200);
 assert.equal((await request('save',{cookie,body:{id:record.id,revision:1,event}})).status,409);
 result=await request('save',{cookie,body:{id:record.id,revision:record.revision,event:{...record.draft,title:'新草稿內容'}}});record=result.data.event;assert.equal((await request('public',{method:'GET'})).data.events[0].title,event.title);
 result=await request('publish',{cookie,body:{id:record.id,revision:record.revision,event:{...record.draft,phase:'completed',youtube2:'https://youtu.be/MBbnj5EBGIM?si=test',groups:[{name:'A',song:'Supercharged',result:'第一名',youtube:event.youtube,comment:'節奏穩定'},{name:'B',result:'第二名'}]}}});assert.equal(result.status,200);record=result.data.event;const published=(await request('public',{method:'GET'})).data.events[0];assert.equal(published.groups.length,2);assert.equal(published.groups[0].song,'Supercharged');assert.equal(published.groups[1].song,'');assert.equal(published.youtube2,'https://www.youtube.com/watch?v=MBbnj5EBGIM');
 const {youtube2:ignored,...legacyEvent}=record.draft;result=await request('save',{cookie,body:{id:record.id,revision:record.revision,event:legacyEvent}});assert.equal(result.status,200);record=result.data.event;assert.equal(record.draft.youtube2,published.youtube2,'old open forms do not erase the second video');
 // Standalone photos do not need, create, or alter an activity record.
 assert.equal((await request('gallery-publish',{body:{}})).status,401);
 const galleryMedia=[];for(let i=0;i<5;i++){const photo=await request('upload',{cookie,body:{data:Buffer.from([255,216,255,10+i]).toString('base64')}});assert.equal(photo.status,200);galleryMedia.push({id:photo.data.id,label:'舞台照 '+(i+1)})}
 const batch=randomUUID(),gallery={title:'舞台影像五張',media:galleryMedia};
 assert.equal((await request('public',{method:'GET'})).data.gallery.length,0);assert.equal((await request('media&id='+galleryMedia[0].id,{method:'GET'})).status,404);
 assert.equal((await request('gallery-publish',{cookie,body:{id:batch,gallery:{...gallery,media:[...galleryMedia,media[0]]}}})).status,400);
 assert.equal((await request('gallery-publish',{cookie,body:{id:batch,gallery}})).status,200);
 let feed=(await request('public',{method:'GET'})).data;assert.equal(feed.gallery.length,1);assert.equal(feed.gallery[0].media.length,5);assert.equal(feed.events.length,1);assert.equal(feed.events[0].youtube2,published.youtube2);assert.equal((await request('media&id='+galleryMedia[0].id,{method:'GET'})).status,200);
 assert.equal((await request('gallery-publish',{cookie,body:{id:batch,gallery}})).status,200);assert.equal((await request('public',{method:'GET'})).data.gallery.length,1,'repeated request does not duplicate photos');
 assert.equal((await request('gallery-list',{cookie,body:{}})).data.gallery.length,1);
 assert.equal((await request('gallery-unpublish',{cookie,body:{id:batch}})).status,200);assert.equal((await request('public',{method:'GET'})).data.gallery.length,0);assert.equal((await request('media&id='+galleryMedia[0].id,{method:'GET'})).status,404);assert.equal((await request('media&id='+galleryMedia[0].id,{method:'GET',cookie})).status,200);
 result=await request('unpublish',{cookie,body:{id:record.id,revision:record.revision}});assert.equal(result.status,200);assert.equal((await request('public',{method:'GET'})).data.events.length,0);assert.equal((await request('media&id='+upload.data.id,{method:'GET'})).status,404);
 assert.equal((await request('password',{cookie,body:{currentPassword:pass,password:'another-test-only-password'}})).status,200);assert.equal((await request('session',{method:'GET',cookie})).data.authenticated,false);
 const newLogin=await request('login',{body:{password:'another-test-only-password'}});assert.equal(newLogin.status,200);const newCookie=newLogin.headers['set-cookie'].split(';')[0];assert.equal((await request('logout',{cookie:newCookie})).status,200);assert.equal((await request('session',{method:'GET',cookie:newCookie})).data.authenticated,false);
});
test('login attempts are rate limited',async()=>{for(let i=0;i<8;i++)assert.equal((await request('login',{ip:'limited',body:{password:'wrong'}})).status,401);assert.equal((await request('login',{ip:'limited',body:{password:pass}})).status,429)});
test('one performance renders two video buttons in one activity on both sites',()=>{
 const validated=validateEvent({...event,type:'performance',phase:'completed',youtube2:'https://youtu.be/MBbnj5EBGIM'});assert.throws(()=>validateEvent({...event,youtube2:'https://evil.test/watch?v=MBbnj5EBGIM'}));assert.equal(validateEvent(event).youtube2,'');
 const source=readFileSync(new URL('./activities-public.js',import.meta.url),'utf8');
 const context={window:{},document:{currentScript:{dataset:{}},createElement:()=>({}),head:{append(){}},querySelector:()=>null},location:{origin:'https://test.local'},fetch:async()=>({ok:true,json:async()=>({events:[]})})};runInNewContext(source,context);const cards=context.window.BensonActivities.cards;
 const html=cards({...validated,id:'test-performance'});assert.equal((html.match(/<article /g)||[]).length,1);assert.equal((html.match(/class="race-video"/g)||[]).length,2);assert.ok(html.includes('▶ 第 1 首'));assert.ok(html.includes('▶ 第 2 首'));assert.ok(html.includes(validated.youtube));assert.ok(html.includes(validated.youtube2));
 const legacy=cards({...validated,youtube2:undefined,id:'legacy'});assert.equal((legacy.match(/class="race-video"/g)||[]).length,1);assert.ok(legacy.includes('▶ 觀看影片'));
 const secondOnly=cards({...validated,youtube:'',id:'second-only'});assert.equal((secondOnly.match(/class="race-video"/g)||[]).length,1);assert.ok(secondOnly.includes('▶ 第 2 首'));const grouped=cards({...validated,groups:[{name:'A',song:'Supercharged'},{name:'B',song:'Your Idol'}],id:'group-songs'});assert.ok(grouped.includes('Supercharged'));assert.ok(grouped.includes('Your Idol'));assert.ok(!grouped.includes('台中 · GAIA'));assert.ok(legacy.includes('台中 · GAIA'));
 const photos=Array.from({length:5},(_,i)=>({id:randomUUID(),label:i===0?'<script>unsafe</script>':'舞台照 '+i}));assert.equal(validateGallery({media:photos}).media.length,5);assert.throws(()=>validateGallery({media:[]}));assert.throws(()=>validateGallery({media:[...photos,{id:randomUUID()}]}));assert.throws(()=>validateGallery({media:[photos[0],photos[0]]}));const gallery=context.window.BensonActivities.galleryMarkup([{title:'舞台照片',media:photos}]);assert.equal((gallery.match(/<figure>/g)||[]).length,5);assert.ok(!gallery.includes('<script>'));assert.ok(gallery.includes('&lt;script&gt;'));
});
test('poster archive groups published event posters by year, keeps original-image links, and excludes ordinary photos',()=>{
 const context={window:{},document:{currentScript:{dataset:{}},createElement:()=>({}),head:{append(){}},querySelector:()=>null},location:{origin:'https://test.local'},fetch:async()=>({ok:true,json:async()=>({events:[]})})};
 runInNewContext(readFileSync(new URL('./activities-public.js',import.meta.url),'utf8'),context);
 const poster=context.window.BensonActivities.postersMarkup;
 const events=[{...event,id:'older',date:'2025-06-01',title:'去年海邊演出',media:[{id:'poster-old',kind:'poster'}]},{...event,id:'newer',date:'2026-10-31',title:'新海報 <script>不執行</script>',media:[{id:'poster-new',kind:'poster'},{id:'ordinary-photo',kind:'photo'}]},{...event,id:'no-poster',media:[{id:'review-sheet',kind:'review'}]}];
 const html=poster(events);assert.equal((html.match(/class="poster-memory"/g)||[]).length,2);assert.ok(html.indexOf('2026 年海報')<html.indexOf('2025 年海報'));assert.ok(html.includes('action=media&id=poster-new'));assert.ok(html.includes('/events/newer/'));assert.ok(!html.includes('ordinary-photo'));assert.ok(!html.includes('review-sheet'));assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(poster([]).includes('第一張舞台海報'));
 const app=readFileSync(new URL('./app.js',import.meta.url),'utf8');assert.ok(app.includes("['posters','歷年海報']"));assert.ok(app.includes("location.hash==='#posters'"));
});
