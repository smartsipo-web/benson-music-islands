(()=>{
 let cardUrl='';
 const imageFrom=source=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=source;});
 const capture=(eventName,fallback)=>new Promise(resolve=>{const timer=setTimeout(()=>resolve(fallback),1200);window.dispatchEvent(new CustomEvent(eventName,{detail:{receive:value=>{clearTimeout(timer);resolve(value||fallback);}}}));});
 window.addEventListener('music-share-card',async event=>{
  const target=document.querySelector('#visitor-card-result'),button=document.querySelector('#make-visitor-card');if(!target)return;
  button.disabled=true;target.textContent='正在準備你的登島紀念卡…';
  try{
   await document.fonts.ready;
   const [worldSource,avatarSource]=await Promise.all([capture('music-scene-card-request','assets/islands.png'),capture('music-avatar-card-request',null)]);
   const world=await imageFrom(worldSource),avatar=avatarSource?await imageFrom(avatarSource):null;
   const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext('2d');
   const gradient=ctx.createLinearGradient(0,0,1080,1350);gradient.addColorStop(0,'#122941');gradient.addColorStop(1,'#34294c');ctx.fillStyle=gradient;ctx.fillRect(0,0,1080,1350);
   ctx.strokeStyle='#cda55d';ctx.lineWidth=3;ctx.strokeRect(35,35,1010,1280);
   ctx.fillStyle='#e9c78a';ctx.font='700 26px sans-serif';ctx.fillText("BENSON'S MUSIC ISLANDS",80,112);
   ctx.fillStyle='#fff3d9';ctx.font='800 57px sans-serif';ctx.fillText('我來過 Benson 音樂島！',80,207);
   ctx.font='28px sans-serif';ctx.fillStyle='#dacbc7';ctx.fillText('跟著節奏，留下今天的勇敢與陪伴。',80,267);
   const photo={x:65,y:325,w:950,h:580};ctx.save();ctx.beginPath();ctx.roundRect(photo.x,photo.y,photo.w,photo.h,28);ctx.clip();const scale=Math.max(photo.w/world.width,photo.h/world.height);ctx.drawImage(world,photo.x+(photo.w-world.width*scale)/2,photo.y+(photo.h-world.height*scale)/2,world.width*scale,world.height*scale);ctx.restore();
   ctx.fillStyle='#f6e8cf';ctx.beginPath();ctx.roundRect(710,770,300,430,28);ctx.fill();
   if(avatar){const ratio=Math.min(290/avatar.width,410/avatar.height);ctx.drawImage(avatar,715+(290-avatar.width*ratio)/2,780+(410-avatar.height*ratio)/2,avatar.width*ratio,avatar.height*ratio);}
   const name=event.detail.name;ctx.fillStyle='#f5cf86';let size=54;ctx.font='800 '+size+'px sans-serif';while(ctx.measureText(name).width>580&&size>26){size-=2;ctx.font='800 '+size+'px sans-serif';}ctx.fillText(name,80,1020);
   ctx.fillStyle='#fff2dc';ctx.font='30px sans-serif';ctx.fillText('今天也在音樂島，為維駿加油！',80,1080);
   ctx.font='24px sans-serif';ctx.fillStyle='#c5ced5';ctx.fillText(new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())+' · 登島紀念',80,1140);
   ctx.font='22px sans-serif';ctx.fillStyle='#e7c995';ctx.fillText('benson-music-islands-bensondrum.vercel.app',80,1250);
   const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('製作失敗');if(cardUrl)URL.revokeObjectURL(cardUrl);cardUrl=URL.createObjectURL(blob);
   target.replaceChildren();const preview=document.createElement('img');preview.src=cardUrl;preview.alt=name+' 的音樂島登島紀念卡';preview.className='visitor-share-preview';const download=document.createElement('a');download.href=cardUrl;download.download='Benson-Music-Islands-紀念卡.png';download.textContent='下載我的登島紀念卡 ↓';download.className='community-submit card-download';const note=document.createElement('p');note.className='score-note';note.textContent='下載後，就能分享到你的社群或傳給朋友。';target.append(preview,download,note);preview.scrollIntoView({block:'nearest',behavior:'smooth'});
  }catch{target.textContent='紀念卡暫時無法製作，請再試一次。';}finally{button.disabled=false;}
 });
 document.querySelector('#community-dialog').addEventListener('close',()=>{if(cardUrl){URL.revokeObjectURL(cardUrl);cardUrl='';}});
})();
