import {list,get,put,del} from '@vercel/blob';
export async function readRecord(pathname){const result=await get(pathname,{access:'private',useCache:false});if(!result||result.statusCode!==200)return null;return new Response(result.stream).json();}
export async function records(prefix,limit=200){const result=await list({prefix,limit});return result.blobs;}
export async function saveRecord(pathname,data){return put(pathname,JSON.stringify(data),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json',cacheControlMaxAge:0});}
export async function removeRecords(paths){if(paths.length)await del(paths);}
