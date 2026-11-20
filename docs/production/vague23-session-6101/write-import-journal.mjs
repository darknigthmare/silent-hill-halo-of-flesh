/** Bind each new static idle to its original image, source references and
 * preserved portrait, using the existing purpose-delivery contract. */
import {readFile,writeFile,access} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(fileURLToPath(new URL('../../../',import.meta.url)));
const arg=name=>process.argv.find(a=>a.startsWith('--'+name+'='))?.slice(name.length+3);
if(!arg('delivery')||!arg('receipt'))throw Error('Explicit --delivery and --receipt required.');
const deliveryPath=resolve(arg('delivery')),receiptPath=resolve(arg('receipt'));
const journalPath=resolve(root,'docs/production/sprite-wave23-imports-2026-11-19.json');
try{await access(journalPath);throw Error('Preserve existing journal.');}catch(e){if(e.code!=='ENOENT')throw e;}
const hash=b=>createHash('sha256').update(b).digest('hex');
const deliveryBytes=await readFile(deliveryPath),receiptBytes=await readFile(receiptPath);
const delivery=JSON.parse(deliveryBytes),receipt=JSON.parse(receiptBytes);
if(receipt.input?.sha256!==hash(deliveryBytes))throw Error('Receipt is not bound to this exact delivery.');
if(!receipt.complete||receipt.entries.length!==delivery.selected.length)throw Error('Incomplete import receipt.');
if(JSON.stringify(receipt.entries.map(r=>r.fighterId).sort())!==JSON.stringify(delivery.selected.map(r=>r.fighterId).sort()))throw Error('Receipt identities differ from delivery.');
const registry=JSON.parse(await readFile(resolve(root,'art/registry.json'),'utf8')).assets;
const baseline=JSON.parse(await readFile(resolve(root,'docs/production/vague23/scope-baseline.json'),'utf8'));
const imports=[];
for(const imported of receipt.entries){
  const id=imported.fighterId,item=delivery.selected.find(r=>r.fighterId===id),art=registry[id],frame=art.frames[0];
  if(!item||hash(await readFile(resolve(root,frame.path)))!==item.sha256)throw Error('Source differs: '+id);
  if(JSON.stringify(art.portrait)!==JSON.stringify(baseline.spriteEntries[id].portrait))throw Error('Portrait differs: '+id);
  const references=[];
  for(const ref of item.references||[]){
    if(!/^https?:\/\//.test(ref.url||'')||!ref.path||!/^[a-f0-9]{64}$/.test(ref.sha256))throw Error('Incomplete source reference: '+id);
    const path=relative(root,resolve(root,ref.path));if(path.startsWith('..'))throw Error('Reference outside repository: '+path);
    const bytes=await readFile(resolve(root,path));if(hash(bytes)!==ref.sha256)throw Error('Reference SHA mismatch: '+path);
    references.push({...ref,path,bytes:bytes.length});
  }
  if(!references.some(ref=>ref.url.startsWith('https://')))throw Error('At least one inspected HTTPS source reference is required: '+id);
  imports.push({fighterId:id,source:art.source,kind:'distinct-combat-idle',path:frame.path,sha256:frame.sha256,bytes:frame.bytes,width:frame.width,height:frame.height,
    sourceSHA256:item.sha256,singleSubjectReviewed:item.singleSubjectReviewed,wholeSubjectReviewed:item.wholeSubjectReviewed,subjectCount:1,references,existingSelectionReference:art.portrait,
    pose:'idle',frameIndex:0,animatedClips:art.animatedClips,fidelity:'unverified',certifiedOneToOne:false,combatEnabled:imported.combatEnabled,usage:imported.usage,roleUnchanged:true,
    calibration:{facing:frame.facing,anchor:frame.anchor,bodyHeight:frame.bodyHeight,basis:'Authored display calibration, not a canonical size or timing measurement.'},
    provenance:relative(root,deliveryPath),provenanceSHA256:hash(deliveryBytes),importReceipt:{path:relative(root,receiptPath),sha256:hash(receiptBytes),completedAt:receipt.completedAt},
    review:item.review,limits:item.limits,notes:'Static native PNG. Existing portrait, source role and clip semantics preserved. Image presence does not certify fidelity or animation.'});
}
const result={schema:1,wave:23,date:'2026-11-19',baseLocalCommit:baseline.baseCommit,scope:'New source-reviewed lateral images for existing profiles; historical campaign dispositions preserved.',imports};
await writeFile(journalPath,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({journal:relative(root,journalPath),imports:imports.length}));
