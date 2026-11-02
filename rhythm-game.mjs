export const DURATION=15000;
export const BEATS=Array.from({length:24},(_,i)=>(i+1)*600);
export function judgeTap(elapsed,hits){let best=-1,delta=Infinity;BEATS.forEach((beat,i)=>{const d=Math.abs(beat-elapsed);if(!hits.has(i)&&d<delta){best=i;delta=d;}});return delta<=180?{index:best,points:delta<=90?100:60,label:delta<=90?'完美跟拍！':'跟上了！'}:{index:-1,points:0,label:'再聽下一拍！'};}
