// The corridor reads existing competition records; it never modifies the drum island.
let awardRecords=[];
const confirmedAwardPhotos={
 '20261003':[
  {src:'S__158121997_0.jpg',alt:'金鼓獎舞台演奏・舉棒瞬間'},
  {src:'S__158121998_0.jpg',alt:'金鼓獎舞台演奏・節奏專注'}
 ]
};
function collectAwards(){
 const records=[];
 for(const [section,category] of [['results','爵士鼓'],['dance','街舞']]){
  const doc=document.createElement('div');doc.innerHTML=data.sections[section];
  doc.querySelectorAll('article').forEach((article,index)=>{
   if(article.dataset.activityId)return;
   const reviewId=article.querySelector('[data-review-id]')?.dataset.reviewId;
   const reviewRecord=data.reviews.find(record=>record.id===reviewId);
   const date=article.querySelector('.date')?.textContent.trim()||'';
   records.push({id:reviewId||`${section}-${index}`,section,category,date,title:article.querySelector('h3').textContent.trim(),result:reviewRecord?.result||article.querySelector('.medal')?.textContent.trim()||'成績紀錄',group:reviewRecord?.group||article.querySelector('p')?.textContent.trim()||'',video:article.querySelector('a[href*="youtu"]')?.href,reviewId,photos:confirmedAwardPhotos[reviewId]||[],sourceIndex:index});
  });
 }
 for(const e of data.activityEvents||[]){if(e.phase!=='completed'||e.type!=='competition')continue;for(const [i,g] of (e.groups.length?e.groups:[{}]).entries()){records.push({id:e.id+'-'+i,section:e.category==='dance'?'dance':'results',category:e.category==='dance'?'街舞':'爵士鼓',date:e.date.replaceAll('-','.'),title:e.title,result:g.result||'活動紀錄',group:g.name||'',video:g.youtube||e.youtube,photos:e.media.filter(m=>m.kind==='photo').map(m=>({src:window.BensonActivities.mediaUrl(m.id),alt:m.label})),activity:e,groupIndex:i,sourceIndex:-1})}}
 return records.sort((a,b)=>b.date.localeCompare(a.date));
}
function sendAwards(){window.dispatchEvent(new CustomEvent('music-awards-ready',{detail:awardRecords.map(({id,title,result,date,category})=>({id,title,result,date,category}))}))}
ready.then(()=>{awardRecords=collectAwards();sendAwards();}).catch(()=>{});
window.addEventListener('music-world-ready',()=>ready.then(sendAwards).catch(()=>{}));
window.addEventListener('music-award-select',event=>showAward(event.detail.id));
window.addEventListener('music-trophy-open',()=>showAwardGallery());
function awardPanel(title,kicker){
 opener=document.activeElement;document.querySelector('#panel-title').textContent=title;document.querySelector('#panel-kicker').textContent=kicker;
 document.querySelector('#panel-tabs').replaceChildren();document.querySelector('#panel-body').replaceChildren();if(!panel.open)panel.showModal();panel.scrollTop=0;return document.querySelector('#panel-body');
}
async function showAwardGallery(filter='all'){
 try{await ready}catch{return}
 const body=awardPanel('獎盃迴廊','THE TROPHY WALK');
 body.append(add('p','每一次登台，都留下值得記住的成就。點選獎盃，看看那一天的比賽、名次與照片。','section-lead'));
 const filters=add('div','','award-filters');
 for(const [id,label] of [['all',`全部 ${awardRecords.length}`],['results','爵士鼓'],['dance','街舞']]){const b=add('button',label);b.setAttribute('aria-pressed',String(filter===id));b.onclick=()=>showAwardGallery(id);filters.append(b)}body.append(filters);
 const grid=add('div','','award-grid');
 for(const record of awardRecords.filter(r=>filter==='all'||r.section===filter)){
  const button=add('button','','award-card');button.dataset.awardId=record.id;
  const icon=add('span','','award-emblem');icon.innerHTML='<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M14 7h20v10c0 8-5 13-10 13S14 25 14 17V7Z" fill="#e7b94d" stroke="#9a6a27" stroke-width="2"/><path d="M14 10H6v6c0 7 5 9 11 9M34 10h8v6c0 7-5 9-11 9" stroke="#b38332" stroke-width="3"/><path d="M24 30v8M15 42h18l-2-4H17l-2 4Z" stroke="#9a6a27" stroke-width="3"/><path d="m24 12 2 4 5 .7-3.5 3.4.8 4.9-4.3-2.3-4.3 2.3.8-4.9-3.5-3.4 5-.7 2-4Z" fill="#fff1b5"/></svg>';
icon.setAttribute('aria-hidden','true');
  button.append(icon,add('small',`${record.category} · ${record.date}`),add('strong',record.title),add('span',record.result,'award-rank'),add('small',record.photos.length?`${record.photos.length} 張照片`:'照片待補'));
  button.onclick=()=>showAward(record.id);grid.append(button);
 }body.append(grid);
}
async function showAward(id){
 try{await ready}catch{return}const r=awardRecords.find(record=>record.id===id);if(!r)return;
 const body=awardPanel('獎盃紀錄','THE TROPHY WALK');const back=add('button','← 返回獎盃迴廊','award-back');back.onclick=()=>showAwardGallery();
 body.append(back,add('div',`${r.category} · ${r.date}`,'date'),add('h3',r.title,'award-detail-title'),add('div',r.result,'award-result'));
 if(r.group)body.append(add('p',r.group,'section-lead'));
 if(r.photos.length){const photos=add('div','','award-photos');for(const photo of r.photos){const figure=document.createElement('figure'),img=document.createElement('img');img.src=photo.src;img.alt=photo.alt;img.loading='lazy';figure.append(img,add('figcaption',photo.alt));photos.append(figure)}body.append(photos)}else body.append(add('div','這一場的得獎／比賽照片待補。','award-photo-pending'));
 if(r.activity){const detail=document.createElement('div');detail.innerHTML=window.BensonActivities.cards({...r.activity,groups:[r.activity.groups[r.groupIndex]||{}],media:r.activity.media.filter(m=>m.kind==='review')});body.append(detail);return;}
 const actions=add('div','','award-actions');if(r.video){const video=add('a','觀看這場比賽影片 ↗','video-btn');video.href=r.video;video.target='_blank';video.rel='noopener';actions.append(video)}if(r.reviewId){const b=add('button','查看評語與分數','review-trigger');b.onclick=()=>showReview(r.reviewId);actions.append(b)}const original=add('button',`前往${r.category==='街舞'?'街舞島':'爵士鼓島'}完整紀錄`,'video-btn');original.onclick=async()=>{
  await openIsland(islands.find(i=>i.id===(r.category==='街舞'?'dance':'drum')),document.querySelector('#island-world'));
  const articles=[...document.querySelectorAll('#panel-body article')],target=articles[r.sourceIndex];if(!target)return;
  const hidden=target.closest('#drum-history');if(hidden){hidden.hidden=false;const toggle=document.querySelector('.drum-history-toggle');toggle?.setAttribute('aria-expanded','true');if(toggle)toggle.textContent='收合歷年戰績';}
  target.classList.add('award-highlight');target.scrollIntoView({block:'center',behavior:'smooth'});
 };actions.append(original);body.append(actions);
}
