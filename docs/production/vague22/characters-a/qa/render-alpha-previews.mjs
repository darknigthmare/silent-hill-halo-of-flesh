import fs from 'node:fs';
import {createRequire} from 'node:module';
const req=createRequire('/workspace/scratch/silent-hill-wave22/package.json');
const {createCanvas,loadImage}=req('@napi-rs/canvas');
const out='/workspace/scratch/halo-wave22-fighters-a';
const rows=JSON.parse(fs.readFileSync(out+'/'+(process.argv[2]||'raster-audit-batch2.json'),'utf8')).records;
for(const r of rows){
 const c=createCanvas(1000,800),ctx=c.getContext('2d');
 for(let y=0;y<800;y+=40)for(let x=0;x<1000;x+=40){ctx.fillStyle=((x+y)/40)%2?'#89969a':'#b9c1c3';ctx.fillRect(x,y,40,40);}
 const im=await loadImage(r.localPath);const scale=Math.min(920/im.width,720/im.height);
 const w=im.width*scale,h=im.height*scale;
 ctx.drawImage(im,(1000-w)/2,40+(720-h)/2,w,h);
 ctx.fillStyle='#17242a';ctx.fillRect(0,0,1000,34);ctx.fillStyle='#f0f5f7';ctx.font='16px sans-serif';ctx.fillText(r.id+' | read-only alpha composition preview',12,23);
 const p=out+'/qa/'+r.id+'-composite.png';fs.writeFileSync(p,c.toBuffer('image/png'));console.log(p);
}
