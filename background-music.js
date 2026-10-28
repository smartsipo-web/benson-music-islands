(()=>{
 const audio=document.querySelector('#background-music'),button=document.querySelector('#background-music-toggle');
 let requested=false;
 audio.volume=.28;
 function sync(){const playing=!audio.paused;button.setAttribute('aria-pressed',String(playing));button.textContent=playing?'暫停背景音樂':'播放背景音樂';}
 async function play(){try{await audio.play();if(!requested||document.hidden)audio.pause();}catch(error){if(!requested||document.hidden)return;requested=false;document.querySelector('#status').textContent='背景音樂尚未播放，請再點一次播放按鈕。';}sync();}
 button.addEventListener('click',()=>{requested=!requested;if(requested){document.querySelector('#status').textContent='';play();}else{audio.pause();sync();}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)audio.pause();else if(requested)play();});
 audio.addEventListener('play',sync);audio.addEventListener('pause',sync);
 audio.addEventListener('error',()=>{requested=false;sync();document.querySelector('#status').textContent='背景音樂暫時無法載入，請稍後再試。';});
 window.addEventListener('pagehide',()=>audio.pause());
})();
