(()=>{
 const audio=document.querySelector('#background-music'),button=document.querySelector('#background-music-toggle');
 const tracks={drum:{src:'assets/benson-jingbao-latin-fusion.mp3',title:'鼓手 Benson · Jingbao Latin Fusion'},dance:{src:'assets/benson-dance-2026.m4a',title:'街舞 Benson · 2026 肢 A 成發'}};
 let requested=false,theme='drum',revision=0;
 audio.volume=.28;
 function sync(){const playing=!audio.paused;button.setAttribute('aria-pressed',String(playing));button.textContent=playing?'暫停背景音樂':'播放背景音樂';button.title=tracks[theme].title;audio.dataset.track=theme;document.querySelector('#music-track-title').textContent='正在選用：'+tracks[theme].title;}
 async function play(){const ticket=revision;try{await audio.play();if(ticket!==revision)return;if(!requested||document.hidden)audio.pause();}catch(error){if(ticket!==revision||!requested||document.hidden)return;requested=false;document.querySelector('#status').textContent='背景音樂尚未播放，請再點一次播放按鈕。';}sync();}
 function pause(){revision++;audio.pause();sync();}
 button.addEventListener('click',()=>{requested=!requested;if(requested){document.querySelector('#status').textContent='';play();}else pause();});
 window.addEventListener('music-theme-change',event=>{const next=event.detail.theme;if(!tracks[next]||next===theme)return;pause();theme=next;audio.src=tracks[theme].src;audio.load();sync();if(requested&&!document.hidden)play();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else if(requested)play();});
 audio.addEventListener('play',sync);audio.addEventListener('pause',sync);
 audio.addEventListener('error',()=>{requested=false;sync();document.querySelector('#status').textContent='背景音樂暫時無法載入，請稍後再試。';});
 document.querySelector('#music-volume').addEventListener('input',event=>{audio.volume=Number(event.target.value)/100;document.querySelector('#music-volume-value').textContent=event.target.value+'%';});window.addEventListener('music-video-opening',()=>{requested=false;pause();});window.addEventListener('pagehide',pause);sync();
})();
