require('esbuild').buildSync({entryPoints:['scene.js'],outfile:'dist/world.js',bundle:true,minify:true,format:'esm',target:'es2020'});
const fs=require('node:fs'),path=require('node:path');
fs.mkdirSync('dist',{recursive:true});
for(const name of ['index.html','style.css','app.js','activities-public.js','admin','background-music.js','trophies.js','community.js','experience-ui.js','share-card.js','upcoming-event.json','content.json','assets','benson-hq-photos',...fs.readdirSync('.').filter(n=>n.endsWith('.jpg'))])fs.cpSync(name,path.join('dist',name),{recursive:true});
console.log('Static production build complete.');
