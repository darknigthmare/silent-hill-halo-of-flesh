import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const localRequire=createRequire(import.meta.url);
function dependency(name){
  try{return localRequire(name);}catch(original){
    for(const root of [process.env.HALO_QA_NODE_MODULES,process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES].filter(Boolean)){
      try{return createRequire(join(root,'__halo_v33_alpha.cjs'))(name);}catch{}
    }
    throw original;
  }
}
const {createCanvas,loadImage}=dependency('@napi-rs/canvas');
const sharp=dependency('sharp');
const root=resolve('docs/production/vague33/characters');
const input=process.argv[2]||'generation-results-initial.json';
const suffix=process.argv[3]||'initial';
const rows=JSON.parse(await readFile(join(root,input),'utf8'));
await mkdir(join(root,'alpha-review'),{recursive:true});
for(const row of rows){
  if(!row.path)continue;
  const bytes=await readFile(row.path),normalized=await sharp(bytes).png().toBuffer();
  const before=await sharp(bytes).ensureAlpha().raw().toBuffer(),after=await sharp(normalized).ensureAlpha().raw().toBuffer();
  if(!before.equals(after))throw new Error('Decoder changed RGBA '+row.path);
  const img=await loadImage(normalized);
  const canvas=createCanvas(1536,560),ctx=canvas.getContext('2d');
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,768,560);ctx.fillStyle='#57717c';ctx.fillRect(768,0,768,560);
  ctx.fillStyle='#222';ctx.font='20px sans-serif';ctx.fillText(row.key+' | WHITE',12,27);
  ctx.fillStyle='#fff';ctx.fillText(row.key+' | BLUE-GREY',780,27);
  ctx.drawImage(img,0,40,768,512);ctx.drawImage(img,768,40,768,512);
  await writeFile(join(root,'alpha-review',row.key+'-'+suffix+'.png'),canvas.toBuffer('image/png'));
}
console.log('Native Canvas alpha-composition previews written; original PNG files untouched.');
