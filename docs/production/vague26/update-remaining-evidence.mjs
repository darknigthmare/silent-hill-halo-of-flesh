/** Reconcile wave25's remaining-art register with the completed wave26 audit.
 * node docs/production/vague26/update-remaining-evidence.mjs \
 *   --out=docs/production/vague26/remaining-evidence.json \
 *   [--audit=docs/production/vague26/final-audit.json] [--resolution=delivery.json ...]
 * Outputs a fresh JSON and sibling .README.md. Never modifies prior evidence,
 * runtime data, roles, registry, source images, or workbooks.
 */
import {readFile,writeFile,access,mkdir,realpath} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve,relative,dirname,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {ROSTER,createCombatProfile} from '../../../src/data.js';
import {spriteUsage} from '../../../src/sprite-usage.js';

const root=resolve(fileURLToPath(new URL('../../../',import.meta.url)));
const option=name=>process.argv.find(arg=>arg.startsWith('--'+name+'='))?.slice(name.length+3);
const options=name=>process.argv.filter(arg=>arg.startsWith('--'+name+'=')).map(arg=>arg.slice(name.length+3));
if(process.argv.includes('--help')){
  console.log('Usage: node docs/production/vague26/update-remaining-evidence.mjs --out=docs/production/vague26/remaining-evidence.json [--audit=docs/production/vague26/final-audit.json] [--resolution=delivery.json ...]');
  process.exit(0);
}
if(!option('out'))throw Error('A fresh --out JSON path is required.');
const BASE='8c2b56320ceb9fd5490660cb8e20a2dbf62c57bb',TREE='6a91576644a19bd0fb2ac23278e8584071e61dca';
const priorPath='docs/production/vague25/remaining-evidence.json';
const coveragePath='data/sprite-coverage.json',registryPath='art/registry.json';
const baselinePath='docs/production/vague26/scope-baseline.json';
const nurseId='film_bubble_head_nurse_return_to_silent_hill';
const nurseReceiptPath='docs/production/vague26/film/receipt-nurse-return-refused.json';
const nurseRecoveryPath='docs/production/vague26/film/source-recovery-nurse-return.json';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const sameSet=(a,b)=>same([...a].sort(),[...b].sort());
const need=(condition,message)=>{if(!condition)throw Error(message);};
const pointerToken=value=>String(value).replaceAll('~','~0').replaceAll('/','~1');
function withinRepo(path,base=root){
  need(typeof path==='string'&&path.length>0,'Missing retained evidence path.');
  const absolute=resolve(base,path),local=relative(root,absolute);
  need(local&&!local.startsWith('../')&&!isAbsolute(local),'Evidence must be inside this repository: '+path);
  return local.replaceAll('\\','/');
}
const outPath=withinRepo(option('out')),out=resolve(root,outPath);
need(outPath.startsWith('docs/production/vague26/')&&outPath.endsWith('.json'),'Output must be a new wave26 JSON document.');
const readme=out.replace(/\.json$/,'.README.md');
for(const path of [out,readme]){
  try{await access(path);throw Error('Preserve existing evidence; use fresh output paths: '+path);}catch(error){if(error.code!=='ENOENT')throw error;}
}
const files=new Map(),byteInputs=new Map();
async function readRetainedBytes(path){
  path=withinRepo(path);
  const actual=await realpath(resolve(root,path));
  need(withinRepo(actual)===path,'Evidence must not redirect through a symlink: '+path);
  const raw=await readFile(actual),digest=sha(raw),prior=byteInputs.get(path);
  need(!prior||prior===digest,'Evidence changed during reconciliation: '+path);
  byteInputs.set(path,digest);return raw;
}
async function readEvidence(path){
  path=withinRepo(path);
  if(!files.has(path)){
    const raw=await readRetainedBytes(path);files.set(path,{path,raw,sha256:sha(raw),json:JSON.parse(raw)});
  }
  return files.get(path);
}
function resolvePointer(value,pointer){
  need(typeof pointer==='string'&&(pointer===''||pointer.startsWith('/')),'Invalid JSON pointer: '+pointer);
  if(pointer==='')return value;
  for(const encoded of pointer.slice(1).split('/')){
    need(!/~(?![01])/.test(encoded),'Invalid JSON pointer escape: '+pointer);
    const key=encoded.replaceAll('~1','/').replaceAll('~0','~');
    need(value!==null&&typeof value==='object'&&Object.hasOwn(value,key),'Unresolved JSON pointer: '+pointer);
    if(Array.isArray(value))need(/^(0|[1-9]\d*)$/.test(key)&&Number(key)<value.length,'Invalid array index: '+pointer);
    value=value[key];
  }
  return value;
}
async function evidence(path,jsonPointer='',relation='direct'){
  const file=await readEvidence(path);resolvePointer(file.json,jsonPointer);
  return {path:file.path,jsonPointer,fileSHA256:file.sha256,relation};
}
async function refreshEvidence(record){
  return {...record,...await evidence(record.path,record.jsonPointer,record.relation||'direct')};
}
async function verifyReference(ref,ownerPath){
  const path=ref.localPath||ref.file||ref.path||ref.relativePath;
  const relativeBase=typeof path==='string'&&!isAbsolute(path)&&!path.startsWith('docs/')&&!path.startsWith('art/')&&!path.startsWith('assets/')?resolve(root,dirname(ownerPath)):root;
  const local=withinRepo(path,relativeBase),raw=await readRetainedBytes(local);
  need(/^[0-9a-f]{64}$/.test(ref.sha256||'')&&sha(raw)===ref.sha256&&(ref.bytes===undefined||raw.length===ref.bytes),'Source reference bytes changed: '+local);
  return {path:local,sha256:sha(raw),bytes:raw.length};
}
const previousFile=await readEvidence(priorPath),previous=previousFile.json;
const publishedPrevious=execFileSync('git',['show',TREE+':'+priorPath],{cwd:root,maxBuffer:8*1024*1024});
need(sha(publishedPrevious)===previousFile.sha256,'Wave25 register differs from the published immutable baseline.');
const baseline=(await readEvidence(baselinePath)).json;
need(baseline.baseCommit===BASE&&baseline.baseTree===TREE,'Unexpected wave26 baseline.');
const auditPath=withinRepo(option('audit')||'docs/production/vague26/final-audit.json');
const auditFile=await readEvidence(auditPath),audit=auditFile.json;
need(audit.passed===true&&audit.wave===26&&audit.baseCommit===BASE&&audit.baseTree===TREE,'A completed wave26 preservation audit on the exact baseline is required.');
const registryFile=await readEvidence(registryPath),registry=registryFile.json.assets;
const coverageFile=await readEvidence(coveragePath),coverage=coverageFile.json;
need(Array.isArray(previous.entries)&&Array.isArray(coverage.entries),'Missing evidence or coverage entries.');
need(new Set(previous.entries.map(row=>row.fighterId)).size===previous.entries.length,'Duplicate prior evidence ID.');
need(coverage.total===ROSTER.length&&coverage.entries.length===ROSTER.length&&new Set(coverage.entries.map(row=>row.id)).size===ROSTER.length,'Coverage must enumerate the exact roster once.');
const currentCoverage=Object.fromEntries(Object.entries(coverage).filter(([,value])=>value===null||typeof value!=='object'));
need(same(currentCoverage,audit.coverage.sprites),'Coverage changed after the final audit.');
const coverageById=new Map(coverage.entries.map(row=>[row.id,row]));
const priorById=new Map(previous.entries.map((row,index)=>[row.fighterId,{row,index}]));
const policyById=new Map();
for(const fighter of ROSTER){
  const row=coverageById.get(fighter.id),art=registry[fighter.id],usage=spriteUsage(art);
  need(row&&row.source===fighter.source&&row.selection===usage.selection&&row.combatView===usage.combatView&&row.separateSelectionAndCombat===usage.separateSelectionAndCombat&&row.frames===(art?.frames?.length||0),'Built coverage is stale for '+fighter.id);
  policyById.set(fighter.id,createCombatProfile(fighter).referencePolicy);
}
const stillOpen=coverage.entries.filter(row=>row.combatView!=='side-view-candidate');
need(stillOpen.every(row=>priorById.has(row.id)),'A new unresolved profile needs an explicit evidence entry; it cannot be invented here.');
const resolvedRows=previous.entries.filter(row=>coverageById.get(row.fighterId)?.combatView==='side-view-candidate');
const resolvedIds=resolvedRows.map(row=>row.fighterId),auditedIds=audit.coverage.upgradedProfiles.ids;
need(Array.isArray(auditedIds)&&new Set(auditedIds).size===auditedIds.length&&sameSet(resolvedIds,auditedIds),'Only profiles newly lateral and accepted in the exact final audit may be resolved.');
need(previous.entries.length===stillOpen.length+resolvedIds.length,'Remaining/resolved partition is incomplete.');

// Derive actual delivery paths from frozen receipts. No Stalker path or source
// name is guessed before its delivery exists and has passed the final audit.
const receiptById=new Map(),auditedDeliveries=new Map();
for(const item of audit.receipts){
  const file=await readEvidence(item.path),receipt=file.json;
  need(file.sha256===item.sha256&&receipt.complete===true&&Array.isArray(receipt.entries),'Import receipt changed or incomplete: '+item.path);
  const deliveryPath=withinRepo(item.delivery.path),deliveryFile=await readEvidence(deliveryPath);
  need(deliveryFile.sha256===item.delivery.sha256&&deliveryFile.sha256===receipt.input.sha256&&withinRepo(receipt.input.path)===deliveryPath,'Delivery is not the immutable audited input: '+deliveryPath);
  need(Array.isArray(deliveryFile.json.selected)&&sameSet(deliveryFile.json.selected.map(row=>row.fighterId),receipt.entries.map(row=>row.fighterId)),'Delivery and receipt scope differ: '+deliveryPath);
  auditedDeliveries.set(deliveryPath,deliveryFile);
  receipt.entries.forEach((entry,index)=>{
    need(!receiptById.has(entry.fighterId),'Duplicate imported ID: '+entry.fighterId);
    receiptById.set(entry.fighterId,{entry,index,path:file.path,deliveryPath});
  });
}
const requested=options('resolution').map(path=>withinRepo(path));
need(new Set(requested).size===requested.length,'Duplicate --resolution path.');
if(requested.length)need(sameSet(requested,[...auditedDeliveries.keys()]),'Explicit --resolution inputs must be exactly the completed audited deliveries.');
const resolvedThisWave=[];
for(const prior of resolvedRows){
  const id=prior.fighterId,proof=receiptById.get(id),art=registry[id],now=coverageById.get(id),policy=policyById.get(id);
  need(proof,'Missing completed import for '+id);
  const delivery=auditedDeliveries.get(proof.deliveryPath).json;
  const index=delivery.selected.findIndex(row=>row.fighterId===id),selected=delivery.selected[index],frame=art.frames[0];
  need(selected.source===prior.source&&now.source===prior.source&&art.source===prior.source,'Source identity changed for '+id);
  need(policy.role===prior.role&&policy.combatEnabled===prior.combatEnabled&&policy.superEnabled===prior.superEnabled,'Role, duel permission or super changed for '+id);
  need(selected.wholeSubjectReviewed===true&&Array.isArray(selected.references)&&selected.references.length>0,'Missing whole-profile source review for '+id);
  const auditedAsset=audit.assets.find(row=>row.fighterId===id&&row.path===frame.path);
  need(auditedAsset&&auditedAsset.sha256===frame.sha256&&auditedAsset.bytes===frame.bytes&&same(auditedAsset.calibration,{facing:frame.facing,anchor:frame.anchor,bodyHeight:frame.bodyHeight}),'Final active frame differs from the audited asset for '+id);
  need(selected.sha256===frame.sha256&&proof.entry.path===frame.path&&proof.entry.nativePixelsPreserved===true&&art.fidelity==='unverified','No native candidate proof for '+id);
  const localPath=withinRepo(selected.localPath||selected.file),source=await readRetainedBytes(localPath),active=await readRetainedBytes(frame.path);
  need(source.equals(active)&&sha(active)===frame.sha256&&active.length===frame.bytes,'Native source/active PNG mismatch for '+id);
  const snapshot=baseline.spriteEntries[id];
  need(snapshot&&same(art.portrait,snapshot.portrait)&&art.animatedClips===snapshot.animatedClips,'Selection or clip accounting changed for '+id);
  const staticIdleAdded=snapshot.combatView==='selection-only'&&snapshot.frames.length===0&&Object.keys(snapshot.clips).length===0;
  const expectedClips=staticIdleAdded?{idle:{frames:[0],ticksPerFrame:1,loop:false}}:snapshot.clips;
  need(same(art.clips,expectedClips),'Authored clip order or timing changed for '+id);
  const sourceChecks=[];
  for(const ref of selected.references)sourceChecks.push(await verifyReference(ref,proof.deliveryPath));
  const previousIndex=priorById.get(id).index;
  const row={fighterId:id,name:now.name,source:now.source,edition:selected.edition,combatView:now.combatView,previousCombatView:prior.combatView,
    selectionAvailable:now.selection,activeFrames:now.frames,animatedClips:art.animatedClips,role:policy.role,combatEnabled:policy.combatEnabled,superEnabled:policy.superEnabled,
    previousReasonCodes:[...prior.reasonCodes],resolution:selected.review,limits:selected.limits,fidelity:'unverified',newGenerationAttemptedInWave26:true,
    activePNG:{path:frame.path,sha256:frame.sha256,bytes:frame.bytes,width:frame.width,height:frame.height},sourceFilesVerified:sourceChecks,
    evidence:[await evidence(priorPath,'/entries/'+previousIndex,'historical'),await evidence(proof.deliveryPath,'/selected/'+index),await evidence(proof.path,'/entries/'+proof.index),await evidence(registryPath,'/assets/'+pointerToken(id))]};
  if(id==='film_creeper_swarm_film_173'){
    need(selected.singleSubjectReviewed===false&&selected.singleCollectiveProfileReviewed===true&&selected.subjectCount===3&&selected.priorDisplayedSubjectCount===3&&selected.composition==='representative-swarm'&&selected.sourceSubjectCountCertified===false&&art.composition==='representative-swarm'&&art.subjectCount===3&&art.sourceSubjectCountCertified===false,'Creeper resolution must preserve the explicit noncanonical three-body collective presentation.');
    const priorFrameSHA256='8171253b7eed7045da6e7e09ab2059c314b34e0506e3fd0713160458951a6b57';
    need(snapshot.frames.length===1&&snapshot.frames[0].sha256===priorFrameSHA256&&snapshot.portrait.sha256===priorFrameSHA256&&selected.priorFrameSHA256===priorFrameSHA256&&art.collectiveProfileReviewed===true&&proof.entry.reviewScope==='one-representative-swarm-profile-three-bodies'&&proof.entry.reviewedSubjectCount===3&&proof.entry.sourceSubjectCountCertified===false,'Creeper collective baseline or review scope changed.');
    row.composition={kind:'representative-swarm',subjectCount:3,priorDisplayedSubjectCount:3,priorFrameSHA256,sourceSubjectCountCertified:false,independentActorsAdded:0};
  }else need(selected.singleSubjectReviewed===true,'Single-subject review missing for '+id);
  resolvedThisWave.push(row);
}

// This is a new direct refusal for this exact 2026 identity, not a relabelled
// 2006 Nurse rejection. Keep its recovered sources and the one failed call.
const nurseReceipt=(await readEvidence(nurseReceiptPath)).json,nurseRecovery=(await readEvidence(nurseRecoveryPath)).json;
need(nurseReceipt.fighterId===nurseId&&nurseReceipt.status==='refused'&&nurseReceipt.successfulImages===0&&nurseReceipt.attemptCount===1&&nurseReceipt.noRetryOrWorkaround===true&&nurseReceipt.requestId==='b468e2dc-c90c-4431-ab93-83f40574d77c','Unexpected Nurse Return refusal evidence.');
need(nurseRecovery.fighterId===nurseId&&nurseRecovery.generationOutcome?.status==='refused'&&nurseRecovery.generationOutcome.successfulImages===0,'Missing recovered-source/refusal reconciliation.');
need(stillOpen.some(row=>row.id===nurseId),'A refused Nurse output cannot resolve this profile.');
need(Array.isArray(nurseRecovery.references)&&nurseRecovery.references.length>0,'Missing recovered Nurse references.');
const nurseSources=[];
for(const ref of nurseRecovery.references)nurseSources.push(await verifyReference(ref,nurseRecoveryPath));
const nursePrompt=withinRepo(nurseReceipt.promptPath,resolve(root,dirname(nurseReceiptPath))),nursePromptBytes=await readRetainedBytes(nursePrompt);
const nursePromptFileSHA256=sha(nursePromptBytes);
let nurseRequestPromptBytes=nursePromptBytes,nursePromptSerializationDeltaBytes=0;
if(nursePromptFileSHA256!==nurseReceipt.promptSHA256){
  // This exact retained text file adds one LF to the exact request string.
  // Both known hashes, lengths and terminal bytes are pinned; no generic trim
  // or other whitespace/encoding normalization is permitted.
  need(nursePromptFileSHA256==='76b58f73e3d3d54962d31d6b61825aa404b505680b0e7cd5153c87b6457bf94b'&&
    nurseReceipt.promptSHA256==='9fa78e316a3b5fb0ad0b20749ad9e2dc36cf81cd77564ad0795fda06436a8437'&&
    nursePromptBytes.length===2646&&nursePromptBytes.at(-1)===0x0a&&
    nursePromptBytes.at(-2)!==0x0a&&nursePromptBytes.at(-2)!==0x0d,
    'Nurse refusal prompt changed beyond its known single retained terminal LF.');
  nurseRequestPromptBytes=nursePromptBytes.subarray(0,nursePromptBytes.length-1);
  nursePromptSerializationDeltaBytes=1;
}
need(sha(nurseRequestPromptBytes)===nurseReceipt.promptSHA256,'Nurse request prompt differs from its original receipt.');
const nursePromptVerification={path:nursePrompt,sha256:nursePromptFileSHA256,bytes:nursePromptBytes.length,
  fileSHA256:nursePromptFileSHA256,fileBytes:nursePromptBytes.length,
  requestSHA256:sha(nurseRequestPromptBytes),requestBytes:nurseRequestPromptBytes.length,
  receiptSHA256Field:'promptSHA256',serializationDeltaBytes:nursePromptSerializationDeltaBytes,
  serialization:nursePromptSerializationDeltaBytes===1?'The retained text file adds exactly one terminal LF (0x0a) to the original request string. Both original artifacts are preserved unchanged.':'The retained file and original request string are byte-identical.',
  onlyKnownTerminalLFRemoved:nursePromptSerializationDeltaBytes===1,genericTrimApplied:false,originalArtifactsPreserved:true};
need(Array.isArray(nurseReceipt.references)&&nurseReceipt.references.every(path=>nurseSources.some(ref=>ref.path===withinRepo(path,resolve(root,dirname(nurseReceiptPath))))),'Nurse request references must be among the retained recovered sources.');
const entries=[];
for(const prior of previous.entries){
  if(resolvedIds.includes(prior.fighterId))continue;
  const now=coverageById.get(prior.fighterId),policy=policyById.get(prior.fighterId);
  need(now&&now.combatView===prior.combatView&&now.source===prior.source&&policy.role===prior.role&&policy.combatEnabled===prior.combatEnabled&&policy.superEnabled===prior.superEnabled,'Unresolved profile identity, role or availability changed without a resolution: '+prior.fighterId);
  const row={...structuredClone(prior),selectionAvailable:now.selection,activeFrames:now.frames,newGenerationAttemptedInWave26:false};
  row.evidence=await Promise.all(prior.evidence.map(refreshEvidence));
  if(prior.fighterId===nurseId){
    row.previousReasonCodes=[...prior.reasonCodes];
    row.reasonCodes=['historical-refusal'];
    row.reason='Les références finales de Return to Silent Hill (2026) ont été retrouvées : costume entier, chaussures, tête et petit maillet, corroborés par le making-of officiel et un extrait licencié. L’unique appel imagegen a ensuite été refusé en sortie (moderation_blocked, catégorie other) ; aucun PNG produit, aucun réessai ni changement de nom.';
    row.requiredEvidenceOrAction='Conserver les sources récupérées et le refus direct documenté de cette identité. Aucun nouvel appel, variante ou changement d’étiquette du même sujet refusé. Le portrait existant et le rôle non vérifié hors duel restent inchangés.';
    row.historicalRefusal={kind:'direct',subject:nurseId,requestId:nurseReceipt.requestId,wave:26,moderationStage:nurseReceipt.moderationStage,categories:nurseReceipt.categories};
    row.sourceGapResolvedInWave26=true;row.newGenerationAttemptedInWave26=true;row.successfulImagesInWave26=0;
    row.sourceFilesVerified=nurseSources;row.promptVerified=nursePromptVerification;
    row.evidence.push(await evidence(priorPath,'/entries/'+priorById.get(nurseId).index,'historical'),await evidence(nurseRecoveryPath),await evidence(nurseReceiptPath));
  }
  entries.push(row);
}
const reasonNames=['source-insufficient','historical-refusal','related-refusal-hold','corpus-divergence'];
need(entries.every(row=>reasonNames.includes(row.reasonCodes?.[0])),'Unknown primary reason requires explicit review.');
const counts={remainingRows:entries.length,legacyUnreviewed:entries.filter(row=>row.combatView==='legacy-unreviewed').length,
  missingCombatView:entries.filter(row=>row.combatView==='missing').length,selectionMissingWithinRemaining:entries.filter(row=>!row.selectionAvailable).length,
  productionInProgress:0,resolvedProfilesThisWave:resolvedThisWave.length,resolvedLegacyThisWave:resolvedThisWave.filter(row=>row.previousCombatView==='legacy-unreviewed').length,
  resolvedMissingThisWave:resolvedThisWave.filter(row=>row.previousCombatView==='missing').length,
  byPrimaryReason:Object.fromEntries(reasonNames.map(reason=>[reason,entries.filter(row=>row.reasonCodes[0]===reason).length]))};
need(counts.remainingRows===coverage.combatMissing+coverage.combatLegacyUnreviewed&&counts.legacyUnreviewed===coverage.combatLegacyUnreviewed&&counts.missingCombatView===coverage.combatMissing&&counts.selectionMissingWithinRemaining===coverage.selectionMissing,'Final remaining counts do not match built coverage.');
need(coverage.certified===0&&coverage.animatedClips===previous.currentCoverage.animatedClips&&coverage.selectionAvailable===previous.currentCoverage.selectionAvailable,'This register must not claim new portraits, animations or certification.');
const report={schema:1,wave:26,reviewedAt:new Date().toISOString(),status:'final',scope:previous.scope,baseRemoteCommit:BASE,baseLocalEquivalent:BASE,baseTree:TREE,
  currentCoverage,coverageEvidence:await evidence(coveragePath),baselineEvidence:await evidence(baselinePath),finalAuditEvidence:await evidence(auditPath),previousEvidenceRegister:await evidence(priorPath,'','historical'),
  townfallRecoveredSourceEvidence:await refreshEvidence(previous.townfallRecoveredSourceEvidence),registrySHA256:registryFile.sha256,counts,
  method:[...previous.method,'Wave26 resolutions require current side-view availability, a completed exact preservation audit, frozen import receipts/deliveries and matching native PNG/reference bytes.','Every previous remaining entry is retained unless those resolution checks pass. Current identity, role, duel and super permissions are compared to its wave25 row.','The Return2026 Nurse source gap is resolved, but one new direct generation refusal is retained with zero successful images and no retry.'],
  importantCorrections:[...previous.importantCorrections,'Wave25 records remain unchanged. New source recovery and generated images are documented only by actual wave26 delivery paths; no missing Stalker source file is inferred.','The Creeper2006 count of three, if integrated, remains a representative prototype composition. It does not certify a canonical swarm size or create independent actors.','Return2026 Nurse has recovered final-film references followed by a direct output refusal in wave26; the primary blocker is now that refusal.'],
  resolvedThisWave,productionInProgress:[],entries,pointerValidation:{passed:false,pointersResolved:0,uniqueEvidenceFiles:0},limits:previous.limits};
let pointersResolved=0;const pointerFiles=new Set();
async function verifyPointers(value){
  if(!value||typeof value!=='object')return;
  if(typeof value.path==='string'&&typeof value.jsonPointer==='string'){
    const file=await readEvidence(value.path);resolvePointer(file.json,value.jsonPointer);
    need(value.fileSHA256===file.sha256,'Stale final evidence digest: '+value.path);
    pointersResolved++;pointerFiles.add(file.path);
  }
  for(const child of Object.values(value))await verifyPointers(child);
}
await verifyPointers(report);
// Refuse to publish a coherent-looking report if any evidence changed while it
// was assembled. All evidence files are read-only inputs to this operation.
for(const [path,digest] of byteInputs)need(sha(await readFile(resolve(root,path)))===digest,'Evidence changed during reconciliation: '+path);
report.pointerValidation={passed:true,pointersResolved,uniqueEvidenceFiles:pointerFiles.size};
const cell=text=>String(text??'').replaceAll('|','\\|').replaceAll('\n',' ');
const link=path=>relative(dirname(out),resolve(root,path)).replaceAll('\\','/');
const legacy=entries.filter(row=>row.combatView==='legacy-unreviewed');
const reasonLabels={'source-insufficient':'insuffisances de source','historical-refusal':'refus directs documentés','related-refusal-hold':'arrêts apparentés','corpus-divergence':'divergences d’identité ou de corpus'};
const readmeText=`# Reprendre les vues encore ouvertes après la vague 26

Le registre [remaining-evidence.json](${relative(dirname(out),out)}) contient **${counts.remainingRows} dossiers encore ouverts** : **${counts.legacyUnreviewed} anciennes vues à reprendre** et **${counts.missingCombatView} vues de combat absentes**. Les **${counts.selectionMissingWithinRemaining} portraits absents** sont compris dans cet ensemble ; ces nombres ne s’additionnent pas.

La couverture construite compte **${coverage.combatSideViewCandidates} vues latérales candidates**, **${coverage.selectionAvailable} portraits** et **${coverage.animatedClips} clips animés**. Cette vague résout **${resolvedThisWave.length} profils** : ${counts.resolvedLegacyThisWave} anciennes vues reprises et ${counts.resolvedMissingThisWave} vues auparavant absentes. Aucun portrait, clip animé ou profil de roster supplémentaire n’est compté ; aucune fidélité 1:1 n’est certifiée.

## Profils résolus dans cette vague

| ID exact | Œuvre et rôle conservés | Preuve de livraison |
| --- | --- | --- |
${resolvedThisWave.map(row=>`| ${cell(row.fighterId)} | ${cell(row.edition)} ; ${cell(row.role)} ; ${row.combatEnabled?'duel déjà autorisé':'hors duel'} | [Livraison](${link(row.evidence[1].path)}) |`).join('\n')}

Les images sont des candidats latéraux statiques. Les rôles et capacités restent ceux du projet. Le Collector demeure non combattant. La composition Creeper2006 conserve les trois individus déjà représentés par le prototype ; ce nombre est explicitement représentatif et non canonique, sans acteur autonome ajouté. Une résolution n’est incluse que si son PNG actif correspond à la livraison et au [contrôle final](${link(auditPath)}) réussi.

## Anciennes vues encore ouvertes

| ID exact | Motif et condition de reprise |
| --- | --- |
${legacy.map(row=>`| ${cell(row.fighterId)} | ${cell(row.reason)} ${cell(row.requiredEvidenceOrAction)} |`).join('\n')}

## Vues absentes et motifs

Chaque profil possède sa propre ligne dans le JSON, avec identité, œuvre, rôle, permissions, portrait et preuves. Les motifs principaux des ${counts.remainingRows} dossiers sont : ${reasonNames.map(reason=>`**${counts.byPrimaryReason[reason]} ${reasonLabels[reason]}**`).join(', ')}. Seul le premier motif est compté pour éviter les doubles comptes.

**Bubble Head Nurse — Return to Silent Hill** dispose désormais de références finales entières. Son unique appel de génération de la vague26 a toutefois été refusé en sortie : requête \`${nurseReceipt.requestId}\`, **zéro PNG produit**, aucun réessai ni réétiquetage. Les [sources récupérées](${link(nurseRecoveryPath)}) et le [reçu du refus](${link(nurseReceiptPath)}) remplacent le manque de source comme explication actuelle ; les notices antérieures restent conservées. Le rôle non vérifié demeure hors duel.

## Utiliser les preuves

Le prompt Nurse conservé compte **${nursePromptVerification.fileBytes} octets**, avec SHA256 **${nursePromptVerification.fileSHA256}**. La chaîne originale envoyée à imagegen compte **${nursePromptVerification.requestBytes} octets**, avec SHA256 **${nursePromptVerification.requestSHA256}**, identique au champ **promptSHA256** du reçu historique. La différence est exactement **${nursePromptVerification.serializationDeltaBytes} octet** : un unique LF final **0x0a** ajouté au fichier texte conservé. Cette différence connue est vérifiée par les deux empreintes, les tailles et les octets terminaux ; aucun trim générique ni autre normalisation ne sont appliqués. Le prompt et le reçu originaux restent inchangés. Ces deux empreintes et cette différence sont consignées dans **promptVerified** pour ce profil.

Les **${pointersResolved} pointeurs JSON**, répartis dans **${pointerFiles.size} fichiers**, ont été résolus et chaque empreinte SHA256 recalculée. Les nouvelles livraisons sont liées aux reçus d’import terminés, aux octets des PNG actifs et aux fichiers de référence réellement présents. Aucun chemin de source Stalker n’est présumé : ses références ne peuvent provenir que d’une livraison existante et auditée.

La base publiée est \`${BASE}\`, arbre \`${TREE}\`. Le [registre de la vague25](${link(priorPath)}) reste intégralement conservé. Les recherches historiques ne sont pas présentées comme des recherches nouvelles. Les contrôles visuels et les exécutions du moteur sont documentés dans leurs rapports séparés ; ce registre n’en invente aucun résultat et ne modifie ni corpus, ni capacités, ni classeurs.
`;
await mkdir(dirname(out),{recursive:true});
await writeFile(out,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
await writeFile(readme,readmeText,{flag:'wx'});
console.log(JSON.stringify({out:outPath,readme:withinRepo(readme),counts,pointerValidation:report.pointerValidation,resolvedIds}));
