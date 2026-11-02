export const DURATION=15000;
export const BEATS=Array.from({length:24},(_,i)=>(i+1)*600);
export function judgeTap(elapsed,hits,beats=BEATS){let best=-1,delta=Infinity;beats.forEach((beat,i)=>{const d=Math.abs(beat-elapsed);if(!hits.has(i)&&d<delta){best=i;delta=d;}});return delta<=180?{index:best,points:delta<=90?100:60,label:delta<=90?'完美跟拍！':'跟上了！'}:{index:-1,points:0,label:'再聽下一拍！'};}
// Daily plans use the Taiwan calendar; an in-progress run keeps its starting plan.
export function taipeiDate(now=new Date()){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);return ['year','month','day'].map(k=>parts.find(p=>p.type===k).value).join('-');}
export function dailyPlan(now=new Date()){
 const date=taipeiDate(now),day=Math.floor(Date.parse(date+'T00:00:00Z')/86400000),bpm=[96,104,112,120][((day%4)+4)%4],period=60000/bpm;
 const patterns=[[0,1,2,3],[0,1,2.5,3.5],[0,.5,2,3],[0,1.5,2,3.5]],pattern=patterns[((day%4)+4)%4];
 let seed=2166136261;for(const c of date)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;
 const beats=[];for(let bar=0;bar<8;bar++)for(const offset of pattern){const time=600+(bar*4+offset)*period;if(time<=14500)beats.push(time);}
 return {date,day,bpm,period,beats,seed,transpose:[0,2,5,7,9][day%5],style:['暖陽律動','海風切分','跳躍鼓步','星光搖擺'][day%4],melody:Array.from({length:8},(_,i)=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return [0,2,4,7,9,12][seed%6];})};
}
