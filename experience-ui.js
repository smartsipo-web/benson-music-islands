(()=>{
 const settings=document.querySelector('#scene-settings'),toggle=document.querySelector('#scene-settings-toggle');
 toggle.onclick=()=>{settings.hidden=!settings.hidden;toggle.setAttribute('aria-expanded',String(!settings.hidden));};
 document.querySelector('#open-courage-island').onclick=()=>window.dispatchEvent(new CustomEvent('music-tree-open'));
 const steps=[
  {focus:'drum',title:'第一站 · 聽見 Benson 的節奏',copy:'點鼓組看比賽影片，也能讀到一路累積的戰績與評審回饋。',action:'music-work-select',detail:{id:'drum'},button:'看看代表作品'},
  {focus:'corridor',title:'第二站 · 走過獎盃迴廊',copy:'每一座獎盃都對應真實比賽。點進去看看日期、名次與照片。',action:'music-trophy-open',button:'打開獎盃收藏'},
  {focus:'performance',title:'第三站 · 下一次舞台見',copy:'2026/10/31（六）13:00，三條崙小鼓手達人秀，演出曲目 GAIA。',action:'music-event-open',button:'看看活動海報'},
  {focus:'tree',title:'最後一站 · 勇氣島',copy:'到勇氣之樹留一句加油，讓維駿知道你來過。記得留下本名或暱稱。',action:'music-tree-open',button:'留下我的鼓勵'}
 ];let index=0;fetch('/api/upcoming').then(r=>{if(!r.ok)throw Error('no upcoming event');return r.json()}).then(event=>{const past=Date.now()>new Date(event.startsAt).getTime()+86400000;steps[2].title=past?'第三站 · 留下舞台回憶':'第三站 · 下一次舞台見';steps[2].copy=event.dateLabel+'，'+event.title+'，演出曲目 '+event.song+'。';}).catch(()=>{});
 const panel=document.querySelector('#guided-tour');
 function show(){const step=steps[index];panel.hidden=false;document.querySelector('.explore').classList.add('tour-active');document.querySelector('#guided-tour-step').textContent=`BENSON JOURNEY · ${index+1} / ${steps.length}`;document.querySelector('#guided-tour-title').textContent=step.title;document.querySelector('#guided-tour-copy').textContent=step.copy;document.querySelector('#guided-tour-action').textContent=step.button;document.querySelector('#guided-tour-next').textContent=index===steps.length-1?'完成導覽':'下一站 →';window.dispatchEvent(new CustomEvent('music-camera-focus',{detail:{id:step.focus}}));}
 function close(){panel.hidden=true;document.querySelector('.explore').classList.remove('tour-active');window.dispatchEvent(new CustomEvent('music-camera-home'));}
 document.querySelector('#guided-tour-start').onclick=()=>{index=0;show();};document.querySelector('#guided-tour-next').onclick=()=>{if(index===steps.length-1){close();return;}index++;show();};document.querySelector('#guided-tour-close').onclick=close;
 document.querySelector('#guided-tour-action').onclick=()=>{const step=steps[index];window.dispatchEvent(new CustomEvent(step.action,{detail:step.detail||{}}));};
})();
