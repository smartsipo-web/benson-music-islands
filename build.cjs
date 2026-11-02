require('esbuild').buildSync({entryPoints:['scene.js'],outfile:'dist/world.js',bundle:true,minify:true,format:'esm',target:'es2020'});
const fs=require('node:fs'),path=require('node:path');
fs.mkdirSync('dist',{recursive:true});
for(const name of ['index.html','style.css','app.js','activities-public.js','admin','background-music.js','trophies.js','community.js','experience-ui.js','share-card.js','upcoming-event.json','content.json','assets','benson-hq-photos',...fs.readdirSync('.').filter(n=>n.endsWith('.jpg'))])fs.cpSync(name,path.join('dist',name),{recursive:true});
// New URLs for changed interface assets prevent browsers reusing the old island tabs.
const {createHash}=require('node:crypto');let html=fs.readFileSync('dist/index.html','utf8');
for(const name of ['style.css','app.js','activities-public.js']){const version=createHash('sha256').update(fs.readFileSync(name)).digest('hex').slice(0,12);html=html.replaceAll('"'+name+'"','"'+name+'?v='+version+'"')}
fs.writeFileSync('dist/index.html',html);
console.log('Static production build complete.');

require('esbuild').buildSync({entryPoints:['rhythm-challenge.js'],outfile:'dist/rhythm-play.js',bundle:true,minify:true,format:'esm',target:'es2020'});

require('esbuild').buildSync({entryPoints:['adventure-ui.js'],outfile:'dist/adventure-play.js',bundle:true,minify:true,format:'esm',target:'es2020'});
