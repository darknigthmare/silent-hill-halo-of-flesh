/** Exact-file stage import for this pass; no image processing or fighter changes.
 * node docs/production/vague27/integrate-stage-deliveries.mjs --input=/delivery.json [--input=/other.json] --receipt=/receipt.json
 */
import {readFile,writeFile,mkdir,link,copyFile,lstat,access} from 'node:fs/promises';
import {resolve,dirname,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {STAGES} from '../../../src/data.js';
import {STAGE_BITMAPS} from '../../../src/stage-bitmap-manifest.js';
import {validateStageBitmap,stageBitmapFor,stageBitmapFrames} from '../../../src/stage-bitmaps.js';
import {auditStagePng,buildStageBitmaps} from '../../../scripts/build-stage-bitmaps.mjs';

const root=resolve(fileURLToPath(new URL('../../../',import.meta.url)));
const inputs=process.argv.filter(arg=>arg.startsWith('--input=')).map(arg=>resolve(arg.slice(8)));
const receiptPath=process.argv.find(arg=>arg.startsWith('--receipt='))?.slice(10);
if(!inputs.length||!receiptPath)throw Error('At least one --input and a --receipt path are required.');
try{await access(resolve(receiptPath));throw Error('Preserve the existing receipt; use a fresh path.');}catch(error){if(error.code!=='ENOENT')throw error;}
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const baseline=JSON.parse(await readFile(resolve(root,'docs/production/vague27/baseline.json'),'utf8'));
async function protect(){
  for(const file of baseline.protectedFiles)if(hash(await readFile(resolve(root,file.path)))!==file.sha256)throw Error('Protected gameplay/source scope changed: '+file.path);
}
await protect();
const registry=structuredClone(STAGE_BITMAPS),byId=new Map(STAGES.map(stage=>[stage.id,stage]));
const receipt={schema:1,createdAt:new Date().toISOString(),scope:'Missing stage bitmap candidates only',inputs:[],stages:[],assets:[],protectedFiles:baseline.protectedFiles.map(file=>file.path),existingCompositionsPreserved:false};
const beforeActive=STAGES.filter(stage=>!stage.reference?.blocked&&stageBitmapFor(stage,STAGE_BITMAPS)).length;
const incoming=new Map();
for(const input of inputs){
  const raw=await readFile(input),delivery=JSON.parse(raw);receipt.inputs.push({path:input,sha256:hash(raw)});
  if(!Array.isArray(delivery.stages)||!Array.isArray(delivery.assets))throw Error('Expected stages[] and assets[] in '+input);
  const assets=new Map(delivery.assets.map(asset=>[asset.path,asset]));
  if(assets.size!==delivery.assets.length)throw Error('Duplicate asset path in '+input);
  for(const supplied of delivery.stages){
    const stage=byId.get(supplied.stageId);
    if(!stage||stage.reference?.blocked||stageBitmapFor(stage,registry))throw Error('Stage is unknown, blocked, or already illustrated: '+supplied.stageId);
    const art=Object.fromEntries(['stageId','source','status','fidelity','origin','mode','scene','geometry','referenceIds','layers','notes'].filter(key=>supplied[key]!==undefined).map(key=>[key,structuredClone(supplied[key])]));
    validateStageBitmap(stage,art);
    if(art.layers.length!==2||art.layers.some(layer=>layer.frames.length!==1||layer.loop)||new Set(art.layers.map(layer=>layer.frames[0].path)).size!==2)throw Error('Expected two independent static planes: '+stage.id);
    for(const [index,layer] of art.layers.entries()){
      const frame=layer.frames[0],asset=assets.get(frame.path);
      if(!asset||asset.stageId!==stage.id||!asset.localPath||['sha256','bytes','width','height'].some(key=>asset[key]!==frame[key]))throw Error('Asset receipt mismatch: '+frame.path);
      if(incoming.has(frame.path))throw Error('Duplicate destination across deliveries: '+frame.path);
      const bytes=await readFile(asset.localPath),audit=auditStagePng(bytes);
      if(bytes.length!==frame.bytes||hash(bytes)!==frame.sha256||audit.width!==frame.width||audit.height!==frame.height)throw Error('Original PNG audit mismatch: '+frame.path);
      incoming.set(frame.path,{asset,frame,audit,plane:index===0?'background':'foreground'});
    }
    registry[stage.id]=art;
    if(stageBitmapFor(stage,registry)!==art||stageBitmapFrames([stage],registry).length!==2)throw Error('The exact runtime scene does not select both planes: '+stage.id);
    receipt.stages.push({stageId:stage.id,source:stage.source,scene:art.scene,runtimeSceneId:stage.referencePolicy?.sceneId||null,referenceIds:art.referenceIds,paths:art.layers.map(layer=>layer.frames[0].path)});
  }
}
for(const [path,{asset,frame,audit,plane}] of incoming){
  const target=resolve(root,path);if(relative(root,target).startsWith('..'))throw Error('Destination outside checkout.');
  await mkdir(dirname(target),{recursive:true});let method;
  try{
    const existing=await lstat(target);
    if(!existing.isFile()||existing.isSymbolicLink()||hash(await readFile(target))!==frame.sha256)throw Error('Existing destination differs: '+path);
    method='existing-exact-file';
  }catch(error){
    if(error.code!=='ENOENT')throw error;
    try{await link(asset.localPath,target);method='hardlink-original';}catch(linkError){if(linkError.code!=='EXDEV')throw linkError;await copyFile(asset.localPath,target);method='exact-copy-original';}
  }
  if(hash(await readFile(target))!==frame.sha256)throw Error('Destination SHA differs: '+path);
  receipt.assets.push({...frame,stageId:asset.stageId,plane,localSource:asset.localPath,sourcePixelSHA256:audit.pixelSHA256,transfer:method,pixelsModified:false});
}
for(const [id,art] of Object.entries(STAGE_BITMAPS))if(JSON.stringify(registry[id])!==JSON.stringify(art))throw Error('Existing composition changed: '+id);
receipt.existingCompositionsPreserved=true;
await writeFile(resolve(root,'src/stage-bitmap-manifest.js'),'// Authored exact-stage candidates. Original timing and visual fidelity remain unverified.\nexport const STAGE_BITMAPS = '+JSON.stringify(registry,null,2)+';\n');
receipt.build=await buildStageBitmaps({root,registry});
await protect();receipt.protectedScopeUnchanged=true;
receipt.coverage={total:STAGES.length,beforeActive,afterActive:STAGES.filter(stage=>!stage.reference?.blocked&&stageBitmapFor(stage,registry)).length};
receipt.coverage.remaining=receipt.coverage.total-receipt.coverage.afterActive;
receipt.activePNGBytes=receipt.assets.reduce((sum,asset)=>sum+asset.bytes,0);
await mkdir(dirname(resolve(receiptPath)),{recursive:true});await writeFile(resolve(receiptPath),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({stagesAdded:receipt.stages.length,pngAdded:receipt.assets.length,bytes:receipt.activePNGBytes,coverage:receipt.coverage,protectedScopeUnchanged:true,receipt:resolve(receiptPath)}));
