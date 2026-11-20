// Read-only review compositions; native sprite files are never modified.
import fs from 'node:fs';
import {createRequire} from 'node:module';
const req=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/qa.cjs');
const {createCanvas,loadImage}=req('@napi-rs/canvas');
const root=new URL('./',import.meta.url).pathname;
fs.mkdirSync(root+'qa',{recursive:true});
const files=['png','variants'].flatMap(dir=>fs.readdirSync(root+dir).filter(f=>f.endsWith('.png')).map(f=>({dir,f})));
for(const {dir,f} of files){
 const im=await loadImage(root+dir+'/'+f),c=createCanvas(1200,620),ctx=c.getContext('2d');
 for(let n=0;n<3;n++){
  ctx.fillStyle=['#101010','#767676','#f1f1f1'][n];ctx.fillRect(n*400,0,400,620);
  const s=Math.min(370/im.width,440/im.height);
  ctx.drawImage(im,n*400+(400-im.width*s)/2,36+(440-im.height*s)/2,im.width*s,im.height*s);
  const s2=Math.min(340/im.width,120/im.height);
  ctx.drawImage(im,n*400+(400-im.width*s2)/2,480,im.width*s2,im.height*s2);
  ctx.fillStyle=n===2?'#222':'#eee';ctx.font='12px sans-serif';ctx.fillText(f,n*400+10,18);
 }
 fs.writeFileSync(root+'qa/'+f,c.toBuffer('image/png'));
 console.log('docs/production/vague23/characters/qa/'+f);
}
