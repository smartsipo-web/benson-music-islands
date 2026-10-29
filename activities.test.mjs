import {test} from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {scryptSync} from 'node:crypto';
import {validateEvent,youtube,publicEvents} from './lib/activities.mjs';
globalThis.activityTestBlobs=new Map();let sequence=0;
globalThis.activityTestStorage={
 async get(path){const value=activityTestBlobs.get(path);if(!value)return null;return {statusCode:200,stream:new Response(value.bytes).body,blob:{etag:value.etag,contentType:value.contentType}}},
 async put(path,body,options){const old=activityTestBlobs.get(path);if(options.ifMatch?old?.etag!==options.ifMatch:old&&!options.allowOverwrite)throw Error('precondition failed');const value={bytes:Buffer.from(body),etag:String(++sequence),contentType:options.contentType};activityTestBlobs.set(path,value);return {etag:value.etag}},
 async del(path){activityTestBlobs.delete(path)}
};
registerHooks({resolve(specifier,context,next){if(specifier==='@vercel/blob')return {url:'data:text/javascript,export const {get,put,del}=globalThis.activityTestStorage;',shortCircuit:true};return next(specifier,context)}});
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
 result=await request('publish',{cookie,body:{id:record.id,revision:record.revision,event:{...record.draft,phase:'completed',groups:[{name:'A',result:'第一名',youtube:event.youtube,comment:'節奏穩定'},{name:'B',result:'第二名'}]}}});assert.equal(result.status,200);record=result.data.event;assert.equal((await request('public',{method:'GET'})).data.events[0].groups.length,2);
 result=await request('unpublish',{cookie,body:{id:record.id,revision:record.revision}});assert.equal(result.status,200);assert.equal((await request('public',{method:'GET'})).data.events.length,0);assert.equal((await request('media&id='+upload.data.id,{method:'GET'})).status,404);
 assert.equal((await request('password',{cookie,body:{currentPassword:pass,password:'another-test-only-password'}})).status,200);assert.equal((await request('session',{method:'GET',cookie})).data.authenticated,false);
 const newLogin=await request('login',{body:{password:'another-test-only-password'}});assert.equal(newLogin.status,200);const newCookie=newLogin.headers['set-cookie'].split(';')[0];assert.equal((await request('logout',{cookie:newCookie})).status,200);assert.equal((await request('session',{method:'GET',cookie:newCookie})).data.authenticated,false);
});
test('login attempts are rate limited',async()=>{for(let i=0;i<8;i++)assert.equal((await request('login',{ip:'limited',body:{password:'wrong'}})).status,401);assert.equal((await request('login',{ip:'limited',body:{password:pass}})).status,429)});
