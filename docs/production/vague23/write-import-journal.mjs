/** Record completed wave23 imports without rewriting earlier provenance.
 * node docs/production/vague23/write-import-journal.mjs --receipt=/receipt.json [--receipt=/other.json]
 * Optional --out=/new/journal.json; the default name is discovered by ART92.
 */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,relative,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root=resolve(fileURLToPath(new URL('../../../',import.meta.url)));
const option=name=>process.argv.find(a=>a.startsWith('--'+name+'='))?.slice(name.length+3);
const inputs=process.argv.filter(a=>a.startsWith('--receipt=')).map(a=>resolve(a.slice(10)));
if(!inputs.length)throw Error('At least one completed --receipt is required.');
const out=resolve(option('out')||resolve(root,'docs/production/sprite-wave23-imports-2026-11-19.json'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=async path=>JSON.parse(await readFile(path,'utf8'));
const baseline=await read(resolve(root,'docs/production/vague23/scope-baseline.json'));
const registry=await read(resolve(root,'art/registry.json'));
const imports=[],seen=new Set();
const location=path=>{const rel=relative(root,path);return rel.startsWith('..')?path:rel;};
for(const path of inputs){
  const raw=await readFile(path),receipt=JSON.parse(raw);
  if(receipt.complete!==true||receipt.wave!==23||!Array.isArray(receipt.entries)||!receipt.entries.length)throw Error('Not a completed wave23 character receipt: '+path);
  const deliveryPath=resolve(receipt.input.path),deliveryRaw=await readFile(deliveryPath);
  if(hash(deliveryRaw)!==receipt.input.sha256)throw Error('Delivery changed after import: '+deliveryPath);
  const delivery=JSON.parse(deliveryRaw),selected=new Map((delivery.selected||[]).map(item=>[item.fighterId,item]));
  for(const entry of receipt.entries){
    const id=entry.fighterId,item=selected.get(id),prior=baseline.spriteEntries[id],art=registry.assets[id],frame=art?.frames?.[0];
    if(seen.has(id)||!item||!prior?.portrait||!frame)throw Error('Repeated or missing imported identity: '+id);
    if(art.source!==entry.source||frame.path!==entry.path||frame.sha256!==item.sha256||hash(await readFile(resolve(root,frame.path)))!==frame.sha256)throw Error('Current idle differs from completed delivery: '+id);
    if(JSON.stringify(art.portrait)!==JSON.stringify(prior.portrait)||frame.path===art.portrait.path)throw Error('Historical portrait was changed or reused: '+id);
    if(item.singleSubjectReviewed!==true||item.wholeSubjectReviewed!==true||!Array.isArray(item.references)||!item.references.length)throw Error('Explicit visual review and source references required: '+id);
    seen.add(id);
    imports.push({
      fighterId:id,source:art.source,kind:'distinct-combat-idle',
      path:frame.path,sha256:frame.sha256,bytes:frame.bytes,width:frame.width,height:frame.height,
      sourceSHA256:frame.sourceSHA256,singleSubjectReviewed:true,wholeSubjectReviewed:true,subjectCount:1,
      references:item.references,existingSelectionReference:prior.portrait,
      pose:'idle',frameIndex:0,animatedClips:art.animatedClips,fidelity:'unverified',certifiedOneToOne:false,
      combatEnabled:entry.combatEnabled,usage:entry.usage,roleUnchanged:entry.roleUnchanged,
      calibration:{facing:frame.facing,anchor:frame.anchor,bodyHeight:frame.bodyHeight,basis:'Authored presentation calibration; source height and animation timing are not certified.'},
      provenance:location(deliveryPath),provenanceSHA256:receipt.input.sha256,
      importReceipt:{path:location(path),sha256:hash(raw),completedAt:receipt.completedAt},
      review:item.review,limits:item.limits,
      notes:'Static dedicated lateral image; historical portrait, existing clips and source role preserved.'
    });
  }
}
const journal={schema:1,wave:23,date:'2026-11-19',baseLocalCommit:baseline.baseCommit,
  scope:'Append-only record of completed static lateral imports. No historical journal, roster role or animation is replaced.',imports};
await mkdir(dirname(out),{recursive:true});
await writeFile(out,JSON.stringify(journal,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({journal:out,imports:imports.length,baseCommit:baseline.baseCommit}));

