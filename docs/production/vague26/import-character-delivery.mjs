/** Import already generated, reviewed lateral PNGs through the repository importer.
 * --input=/delivery.json --receipt=/new/receipt.json
 * Each selected[] row uses fighterId, localPath, sha256, facing,
 * calibrationProposal:{anchor:[x,y],bodyHeight}, review and limits.
 */
import {readFile,writeFile,mkdir,access,open,rename,unlink} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {ROSTER,createCombatProfile} from '../../../src/data.js';

const root=resolve(fileURLToPath(new URL('../../../',import.meta.url)));
const option=name=>process.argv.find(a=>a.startsWith('--'+name+'='))?.slice(name.length+3);
if(!option('input')||!option('receipt'))throw Error('Explicit input and receipt paths required.');
const input=resolve(option('input')),receiptPath=resolve(option('receipt'));
try{await access(receiptPath);throw Error('Preserve the existing receipt; use a fresh path.');}catch(e){if(e.code!=='ENOENT')throw e;}
const hash=b=>createHash('sha256').update(b).digest('hex');
const raw=await readFile(input),delivery=JSON.parse(raw),baseline=JSON.parse(await readFile(resolve(root,'docs/production/vague26/scope-baseline.json'),'utf8'));
if(!Array.isArray(delivery.selected)||!delivery.selected.length)throw Error('Nonempty selected[] required.');
if(new Set(delivery.selected.map(r=>r.fighterId)).size!==delivery.selected.length)throw Error('Duplicate profile.');
const receipt={schema:1,wave:26,createdAt:new Date().toISOString(),input:{path:input,sha256:hash(raw)},entries:[],complete:false};
await mkdir(dirname(receiptPath),{recursive:true});
try{
  for(const item of delivery.selected){
    const fighter=ROSTER.find(f=>f.id===item.fighterId),prior=baseline.spriteEntries[item.fighterId];
    if(!fighter||!prior||!prior.portrait)throw Error('This importer only upgrades existing illustrated profiles: '+item.fighterId);
    if(prior.combatView==='side-view-candidate')throw Error('Already has a lateral candidate: '+item.fighterId);
    const registry=JSON.parse(await readFile(resolve(root,'art/registry.json'),'utf8')),before=registry.assets[item.fighterId];
    if(hash(JSON.stringify(before))!==prior.entrySHA256)throw Error('Profile changed after the baseline: '+item.fighterId);
    const local=resolve(item.localPath||item.file),bytes=await readFile(local),cal=item.calibrationProposal;
    if(!item.sha256||hash(bytes)!==item.sha256||!cal||!Array.isArray(cal.anchor)||cal.anchor.length!==2||!Number.isFinite(cal.bodyHeight))throw Error('Incomplete or stale source/calibration: '+item.fighterId);
    if(item.source&&item.source!==fighter.source)throw Error('Wrong source edition: '+item.fighterId);
    // This pre-existing SH2 encounter is one logical profile with two canonical
    // bodies. Keep the source's honest subject count and require its explicit
    // collective review; the repository flag means one reviewed profile image.
    // A second exact case keeps the THREE bodies already displayed by the 2006
    // Creeper profile. The source establishes a swarm, not a canonical count of
    // three. Its delivery and registry must explicitly record that distinction.
    // Neither exception accepts a sprite sheet or creates independent actors.
    const canonicalDuo=fighter.id==='sh2_twin_pyramid_heads_031'&&fighter.source==='sh2'&&
      before.composition==='canonical-encounter-duo'&&item.singleSubjectReviewed===false&&
      item.singleCollectiveProfileReviewed===true&&item.subjectCount===2;
    const representativeSwarm=fighter.id==='film_creeper_swarm_film_173'&&fighter.source==='film'&&
      before.frames.length===1&&before.frames[0].sha256==='8171253b7eed7045da6e7e09ab2059c314b34e0506e3fd0713160458951a6b57'&&
      before.portrait.sha256===before.frames[0].sha256&&item.singleSubjectReviewed===false&&
      item.singleCollectiveProfileReviewed===true&&item.subjectCount===3&&item.priorDisplayedSubjectCount===3&&
      item.composition==='representative-swarm'&&item.sourceSubjectCountCertified===false;
    const collectiveReviewed=canonicalDuo||representativeSwarm;
    if(fighter.id==='film_creeper_swarm_film_173'&&!representativeSwarm)throw Error('This existing Creeper profile requires the explicit reviewed three-body representative swarm declaration.');
    if((!item.singleSubjectReviewed&&!collectiveReviewed)||!item.wholeSubjectReviewed)throw Error('Visual review missing: '+item.fighterId);
    const combatEnabled=createCombatProfile(fighter).referencePolicy.combatEnabled===true;
    if(item.combatEnabled!==undefined&&item.combatEnabled!==combatEnabled)throw Error('Role declaration differs from runtime: '+item.fighterId);
    const collectiveNote=canonicalDuo?'Une image du profil collectif canonique, deux corps revus, aucun acteur autonome supplémentaire.':representativeSwarm?'Un profil collectif unique : trois Creepers représentatifs, comme dans l’image antérieure du prototype. Ce nombre est un choix de présentation, pas une cardinalité canonique. Les trois corps entiers sont revus ; aucun acteur autonome supplémentaire. Le drapeau historique singleSubjectReviewed désigne ici le profil logique et la composition explicite précise les trois individus.':'';
    const note=[item.review,item.limits,collectiveNote,combatEnabled?'':'Vue latérale de référence dans l’atelier ; profil hors duel dans son œuvre, rôle existant inchangé.'].filter(Boolean).join(' ');
    const args=['scripts/import-sprite.py',local,'--root',root,'--fighter',fighter.id,'--source',fighter.source,
      '--origin','conversation-image-generation','--single-subject-reviewed','--combat-idle',
      '--facing',String(item.facing||1),'--anchor-x',String(cal.anchor[0]),'--anchor-y',String(cal.anchor[1]),
      '--body-height',String(cal.bodyHeight),'--note',note];
    const run=spawnSync('python',args,{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024});
    if(run.status!==0)throw Error('Official importer failed for '+fighter.id+': '+(run.stderr||run.error||run.stdout));
    const imported=JSON.parse(run.stdout),registryPath=resolve(root,'art/registry.json');
    const importedRegistryRaw=await readFile(registryPath),importedRegistry=JSON.parse(importedRegistryRaw),after=importedRegistry.assets[fighter.id];
    if(JSON.stringify(Object.keys(importedRegistry.assets).sort())!==JSON.stringify(Object.keys(registry.assets).sort())||Object.keys(registry.assets).filter(id=>id!==fighter.id).some(id=>JSON.stringify(importedRegistry.assets[id])!==JSON.stringify(registry.assets[id])))throw Error('Another registry entry changed between the reviewed snapshot and import.');
    const mutableFields=new Set(['frames','clips','animatedClips','combatView','combatNotes','notes','origin','sourceFile','sourceSHA256','sourceDimensions','selectionNotes','selectionProvenance','retainedLegacyCombatFrames']);
    const immutable=value=>Object.fromEntries(Object.entries(value).filter(([key])=>!mutableFields.has(key)));
    if(JSON.stringify(immutable(before))!==JSON.stringify(immutable(after)))throw Error('Immutable character metadata changed during import.');
    if(representativeSwarm){
      // Metadata only, after the unchanged official importer has accepted the PNG.
      // Use its same exclusive lock and a full-file compare-and-swap before rename.
      Object.assign(after,{composition:'representative-swarm',subjectCount:3,sourceSubjectCountCertified:false,collectiveProfileReviewed:true,subjectReviewScope:'one-logical-profile-three-complete-bodies'});
      const lockPath=resolve(root,'art/.import.lock'),temporary=resolve(root,'art/.wave26-collective-'+process.pid+'.json');
      const lock=await open(lockPath,'wx',0o600);
      try{
        if(!(await readFile(registryPath)).equals(importedRegistryRaw))throw Error('Registry changed before collective annotation.');
        await writeFile(temporary,JSON.stringify(importedRegistry,null,2)+'\n',{flag:'wx'});
        await rename(temporary,registryPath);
      }finally{await lock.close();await unlink(temporary).catch(error=>{if(error.code!=='ENOENT')throw error;});await unlink(lockPath);}
    }
    const staticIdleAdded=before.combatView==='selection-only'&&before.frames.length===0&&Object.keys(before.clips).length===0;
    const expectedClips=staticIdleAdded?{idle:{frames:[0],ticksPerFrame:1,loop:false}}:before.clips;
    if(JSON.stringify(before.portrait)!==JSON.stringify(after.portrait)||JSON.stringify(expectedClips)!==JSON.stringify(after.clips)||before.animatedClips!==after.animatedClips)throw Error('Portrait or prior clip semantics changed, or unexpected new idle: '+fighter.id);
    if(JSON.stringify(before.frames.slice(1))!==JSON.stringify(after.frames.slice(1)))throw Error('Retained poses changed: '+fighter.id);
    if(hash(await readFile(resolve(root,imported.path)))!==item.sha256)throw Error('Imported PNG differs from the native source.');
    receipt.entries.push({...imported,combatEnabled,usage:combatEnabled?'combat-lateral-candidate':'reference-only-lateral-candidate',sourceLocalPath:local,nativePixelsPreserved:true,portraitPreserved:true,clipSemanticsPreserved:true,staticIdleAdded,newAnimatedClips:0,roleUnchanged:true,reviewScope:representativeSwarm?'one-representative-swarm-profile-three-bodies':canonicalDuo?'one-canonical-collective-profile-two-bodies':'single-subject',reviewedSubjectCount:representativeSwarm?3:canonicalDuo?2:1,...(representativeSwarm?{composition:after.composition,sourceSubjectCountCertified:false}:{})});
    await writeFile(receiptPath,JSON.stringify(receipt,null,2)+'\n');
    console.log(JSON.stringify({id:fighter.id,path:imported.path,combatEnabled,portraitPreserved:true}));
  }
  for(const file of baseline.protectedFiles)if(hash(await readFile(resolve(root,file.path)))!==file.sha256)throw Error('Protected file changed: '+file.path);
  receipt.complete=true;receipt.completedAt=new Date().toISOString();
}catch(error){receipt.failure=String(error.stack||error);process.exitCode=1;}
await writeFile(receiptPath,JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({complete:receipt.complete,imported:receipt.entries.length,receipt:receiptPath,failure:receipt.failure}));
