function refreshEventSharing(record){
 const panel=document.getElementById('event-sharing');
 panel.hidden=!record?.published;
 document.getElementById('event-share-status').textContent='';
 if(!record?.published)return;
 const url='https://benson-shih-bensondrum.vercel.app/events/'+encodeURIComponent(record.id)+'/';
 document.getElementById('event-share-url').value=url;
 document.getElementById('event-share-open').href=url;
 document.getElementById('event-share-facebook').href='https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url);
 document.getElementById('event-sharing-note').textContent=hasChanges(record)?'這個連結顯示目前已發布的版本；草稿變更需要按「發布」才會同步。':'已發布，可以直接分享這個官網活動網址。';
}
document.getElementById('event-share-copy').addEventListener('click',async()=>{
 const input=document.getElementById('event-share-url'),status=document.getElementById('event-share-status');
 try{await navigator.clipboard.writeText(input.value);status.textContent='已複製，貼到 Facebook 貼文即可。'}
 catch{input.focus();input.select();status.textContent='請複製上方已選取的活動網址。'}
});
