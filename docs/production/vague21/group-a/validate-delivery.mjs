import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {STAGES} from '/workspace/scratch/8edddaaaab76/silent-hill-halo-of-flesh/src/data.js';
import {STAGE_BITMAPS} from '/workspace/scratch/8edddaaaab76/silent-hill-halo-of-flesh/src/stage-bitmap-manifest.js';
import {validateStageBitmap,stageBitmapFor,stageBitmapFrames} from '/workspace/scratch/8edddaaaab76/silent-hill-halo-of-flesh/src/stage-bitmaps.js';
const root='/workspace/scratch/8edddaaaab76/stage-pass21-a';
const hash=b=>createHash('sha256').update(b).digest('hex');
const deliveryBytes=readFileSync(root+'/delivery.json');
const d=JSON.parse(deliveryBytes);
const rows=[];
for(const art of d.stages){
 const stage=STAGES.find(s=>s.id===art.stageId);
 if(!stage)throw new Error('Missing runtime stage '+art.stageId);
 const absent=!Object.hasOwn(STAGE_BITMAPS,stage.id);
 if(!absent||stageBitmapFor(stage)!==null)throw new Error('Target no longer missing: '+stage.id);
 if(stage.reference.blocked)throw new Error('Blocked target '+stage.id);
 if((stage.referencePolicy?.sceneId||null)!==art.runtimeSceneId)throw new Error('Scene policy changed '+stage.id);
 if(validateStageBitmap(stage,art)!==art)throw new Error('Descriptor validator failed '+stage.id);
 const reg={[stage.id]:art};
 if(stageBitmapFor(stage,reg)!==art)throw new Error('Descriptor selection failed '+stage.id);
 const frames=stageBitmapFrames([stage],reg);
 if(art.layers.length!==2||frames.length!==2)throw new Error('Wrong layer/frame count '+stage.id);
 if(art.layers[0].parallaxX!==0||art.layers[1].parallaxX!==.012)throw new Error('Incorrect parallax split '+stage.id);
 const assets=d.assets.filter(a=>a.stageId===stage.id);
 if(assets.length!==2)throw new Error('Wrong asset count '+stage.id);
 const checked=[];
 for(const frame of frames){
  const a=assets.find(a=>a.path===frame.path);
  if(!a)throw new Error('Missing asset '+frame.path);
  const b=readFileSync(a.localPath),original=readFileSync(a.originalOutput);
  if(hash(b)!==frame.sha256||b.length!==frame.bytes||hash(original)!==frame.sha256)throw new Error('Hash/byte mismatch '+frame.path);
  if(b.readUInt32BE(16)!==frame.width||b.readUInt32BE(20)!==frame.height)throw new Error('PNG dimension mismatch '+frame.path);
  if(statSync(a.localPath).ino!==statSync(a.originalOutput).ino)throw new Error('Expected immutable hardlink '+a.localPath);
  if(a.role==='opaque-background'&&(a.mode!=='RGB'||a.qa.decodedAlphaRange[0]!==255))throw new Error('Background not opaque '+frame.path);
  if(a.role==='transparent-foreground'&&(a.mode!=='RGBA'||a.qa.decodedAlphaRange[0]!==0||a.qa.decodedAlphaRange[1]!==255||a.qa.centralAlphaRange[1]>1||a.qa.footBandAlphaRange[1]>1))throw new Error('Foreground alpha check failed '+frame.path);
  checked.push({path:frame.path,sha256:frame.sha256,bytes:frame.bytes,width:frame.width,height:frame.height,role:a.role,hashVerified:true,nativeHardlinkVerified:true,pngHeaderDimensionsVerified:true});
 }
 rows.push({stageId:stage.id,source:stage.source,scene:art.scene,runtimeSceneId:art.runtimeSceneId,missingBeforeIntegration:true,referenceBlocked:false,validateStageBitmap:true,stageBitmapForSelectsCandidate:true,uniqueFrames:frames.length,layers:art.layers.length,parallaxX:art.layers.map(l=>l.parallaxX),assets:checked});
}
if(rows.length!==6||d.assets.length!==12)throw new Error('Expected six stages/twelve assets');
const report={observedAt:new Date().toISOString(),status:'pass',scope:'metadata, native byte preservation, alpha audit and descriptor selection only; no engine render, browser or attack tests',scriptSha256:hash(readFileSync(new URL(import.meta.url))),deliverySha256:hash(deliveryBytes),stageCount:rows.length,assetCount:d.assets.length,stages:rows};
writeFileSync(root+'/validation-report.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,stageCount:report.stageCount,assetCount:report.assetCount,deliverySha256:report.deliverySha256,scriptSha256:report.scriptSha256,stages:rows.map(r=>r.stageId)},null,2));
