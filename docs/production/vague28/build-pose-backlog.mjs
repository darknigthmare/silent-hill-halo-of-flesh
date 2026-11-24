/** Read-only documentary census; writes only the requested backlog JSON.
 * Run from any cwd: node docs/production/vague28/build-pose-backlog.mjs
 * --check compares the deterministic output with the saved audit.
 */
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve,relative} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const self=fileURLToPath(import.meta.url),root=resolve(dirname(self),'../../..');
const rel=p=>relative(root,p).replaceAll('\\','/'),sha=b=>createHash('sha256').update(b).digest('hex');
const mod=p=>import(pathToFileURL(resolve(root,p)).href),read=p=>readFile(resolve(root,p));
const [{ROSTER,createCombatProfile,MOVESET_KEYS},{BASE_POSE_KEYS,PRESENTATION_KEYS,splitSpriteClipKey,weaponIdleClipKeys,contextualPresentationKeys},
 {FIGHTER_REFERENCES},{SPRITES},{hasCombatSprite,spriteUsage},{clipSummary,validateClip},{sampleSpriteClip}]=await Promise.all([
 mod('src/data.js'),mod('src/sprite-poses.js'),mod('src/production-reference.js'),mod('src/sprite-manifest.js'),
 mod('src/sprite-usage.js'),mod('src/sprite-clips.js'),mod('src/sprite-animation.js')]);
const registry=JSON.parse(await read('art/registry.json')).assets;
const evidence=JSON.parse(await read('docs/production/vague26/remaining-evidence.json'));
const holds=new Map(evidence.entries.map(e=>[e.fighterId,e]));
const ordinary=PRESENTATION_KEYS.filter(k=>!['finisher','finished'].includes(k));
const own=(o,k)=>Object.hasOwn(o||{},k),unique=a=>[...new Set(a)],sum=(a,fn)=>a.reduce((n,x)=>n+fn(x),0);
const inventoryGroup=key=>{const {pose,contextId}=splitSpriteClipKey(key);
 if(BASE_POSE_KEYS.includes(key))return 'base';if(MOVESET_KEYS.includes(key))return 'command';
 if(pose==='idle'&&contextId)return 'weapon-idle';
 return contextId?(['finisher','finished'].includes(pose)?'contextual-finisher':'contextual-subject-presentation'):'generic-presentation';};
const profiles=[];
for(const fighter of ROSTER){
 const art=registry[fighter.id],built=SPRITES[fighter.id],profile=createCombatProfile(fighter),policy=profile.referencePolicy,ref=FIGHTER_REFERENCES[fighter.id],hold=holds.get(fighter.id);
 const usage=spriteUsage(art),combat=hasCombatSprite(art);
 const bucket=!art?'no-art':!combat?'selection-only':usage.combatView==='legacy-unreviewed'?'legacy-combat-open-evidence':!policy.combatEnabled?(policy.role==='unverified'?'side-view-role-unverified':'side-view-noncombat'):'side-view-combat-enabled';
 if(art){assert.equal(art.fighterId,fighter.id);assert.equal(art.source,fighter.source);assert.deepEqual(art.clips,built.clips);
  assert.deepEqual(art.frames.map(f=>[f.path,f.sha256]),built.frames.map(f=>[f.path,f.sha256]));}
 const clips=art?Object.entries(art.clips).map(([key,clip])=>{
  validateClip(built,key,clip);const s=clipSummary(built,clip);
  assert.ok(clip.frames.every(i=>typeof built.frames[i].pixelSHA256==='string'));
  const idlePixels=new Set((art.clips.idle?.frames||[]).map(i=>built.frames[i].pixelSHA256));
  return {key,category:inventoryGroup(key),steps:s.steps,distinctPixelImages:s.distinct,animated:s.animated,
   onlyIdlePixels:key!=='idle'&&clip.frames.every(i=>idlePixels.has(built.frames[i].pixelSHA256))};
 }):[];
 if(art)assert.equal(clips.filter(c=>c.animated).length,art.animatedClips,'Registered animation count: '+fighter.id);
 const clipMap=new Map(clips.map(c=>[c.key,c])),present=k=>clipMap.has(k),state=k=>!present(k)?'missing':clipMap.get(k).animated?'animated':'static';
 const enabled=MOVESET_KEYS.filter(k=>profile.moves[k]?.enabled===true),disabled=MOVESET_KEYS.filter(k=>profile.moves[k]?.enabled===false);
 assert.equal(enabled.length+disabled.length,MOVESET_KEYS.length,'Explicit enabled flag: '+fighter.id);
 const gatedBase=[];
 if(policy.canMove===false)gatedBase.push({key:'walk',reason:'canMove=false'});
 if(policy.canDodge===false)gatedBase.push({key:'dodge',reason:'canDodge=false'});
 if(policy.canMove===false&&policy.canJump===false)gatedBase.push({key:'jump',reason:'fixed body: free jump disabled and ordinary physics grounds the actor'});
 if(!(profile.bossPhases.length>1||profile.moveset.weaponPhases?.length>1))gatedBase.push({key:'phase',reason:'no later boss or weapon phase in the computed profile'});
 const gatedKeys=new Set(gatedBase.map(e=>e.key)),missingBase=BASE_POSE_KEYS.filter(k=>!present(k));
 const weaponKeys=weaponIdleClipKeys(fighter),defaultWeaponContext=weaponKeys[0]?splitSpriteClipKey(weaponKeys[0]).contextId:undefined;
 const subjectPresentations=ordinary.map(key=>{
  const exact=contextualPresentationKeys(fighter.id).find(k=>splitSpriteClipKey(k).pose===key);
  const proposalKey=({winRound:'winRound1',loseRound:'loseRound1'}[key]||key),proposal=ref?.proposals?.[proposalKey];
  const hookEnabled=policy.combatEnabled&&(key!=='taunt'||proposal?.status==='adaptation-versus-proposee');
  const sampled=built&&sampleSpriteClip(built,{presentation:{key,contextId:splitSpriteClipKey(exact).contextId,clipKey:exact,frame:0},
   ...(defaultWeaponContext?{weaponContext:defaultWeaponContext}:{})});
  return {key,exactKey:exact,hookEnabled,proposalStatus:proposal?.status??null,exactClip:state(exact),genericClip:state(key),
   resolvedKey:sampled?.pose??null,dedicatedRenderingAvailable:!!sampled&&[exact,key].includes(sampled.pose)};
 });
 profiles.push({fighterId:fighter.id,name:fighter.name,source:fighter.source,bucket,selectionAvailable:usage.selection,
  combatView:usage.combatView,combatEnabled:policy.combatEnabled,role:policy.role,identityStatus:ref?.identityStatus??null,
  referenceHold:hold?{reasonCodes:hold.reasonCodes,reason:hold.reason,historicalRefusal:hold.historicalRefusal??null}:null,
  unresolvedRole:policy.role==='unverified',mainBacklog:bucket==='side-view-combat-enabled'&&!hold,
  artwork:{frames:art?.frames.length||0,clips,animatedClips:clips.filter(c=>c.animated).length,staticClips:clips.filter(c=>!c.animated).length,fidelity:art?.fidelity??'not-assessed'},
  baseStates:{presentKeys:BASE_POSE_KEYS.filter(present),missingExactKeys:missingBase,knownDisabledOrUnscheduled:gatedBase,
   missingOutsideKnownGates:missingBase.filter(k=>!gatedKeys.has(k)),freeJumpEnabled:policy.canJump,
   note:policy.canJump===false&&policy.canMove!==false?'Free jump is disabled, but incoming launches can still select the jump image; that base key remains in the inventory.':null},
  commands:{enabledKeys:enabled,disabledSlots:disabled.map(key=>({key,reason:profile.moves[key].disabledReason})),
   presentEnabledKeys:enabled.filter(present),missingEnabledKeys:enabled.filter(k=>!present(k)),
   enabledKeysUsingOnlyIdlePixels:enabled.filter(k=>clipMap.get(k)?.onlyIdlePixels),
   presentDisabledKeys:disabled.filter(present),
   weaponPhaseKits:(profile.moveset.weaponPhases||[]).map(p=>({id:p.id,enabledKeys:MOVESET_KEYS.filter(k=>p.moves[k]?.enabled===true),disabledKeys:MOVESET_KEYS.filter(k=>p.moves[k]?.enabled===false)})),
   exhaustedMoveKeys:enabled.filter(k=>profile.moves[k].exhaustedMove),
   variantLimit:profile.moveset.weaponPhases?.length?'Weapon variants share the command keys. Current playback deliberately resolves every weapon-context state to that phase idle; non-idle weapon clip keys are not defined. These are not 80 additional missing clips.':null},
  presentations:{genericPresentKeys:PRESENTATION_KEYS.filter(present),genericMissingKeys:PRESENTATION_KEYS.filter(k=>!present(k)),subjectContexts:subjectPresentations,
   ownFinisherCandidateKeys:contextualPresentationKeys(fighter.id).filter(k=>splitSpriteClipKey(k).pose==='finisher'),
   existingFinisherContextKeys:clips.filter(c=>c.category==='contextual-finisher').map(c=>c.key)},
  weaponIdles:{contractKeys:weaponKeys,presentKeys:weaponKeys.filter(present),missingKeys:weaponKeys.filter(k=>!present(k))}
 });
}
const main=profiles.filter(p=>p.mainBacklog),illustrated=profiles.filter(p=>p.bucket!=='no-art');
const inventory=rows=>{const clips=rows.flatMap(r=>r.artwork.clips);return {profiles:rows.length,clipEntries:clips.length,staticClips:clips.filter(c=>!c.animated).length,
 animatedClips:clips.filter(c=>c.animated).length,profilesWithAnimation:rows.filter(r=>r.artwork.animatedClips>0).length,
 byCategory:Object.fromEntries(unique(clips.map(c=>c.category)).sort().map(k=>{const set=clips.filter(c=>c.category===k);return [k,{clips:set.length,static:set.filter(c=>!c.animated).length,animated:set.filter(c=>c.animated).length}];}))};};
const generic=main.flatMap(p=>p.presentations.genericPresentKeys),subjects=main.flatMap(p=>p.presentations.subjectContexts).filter(p=>p.hookEnabled);
const summary={rosterProfiles:profiles.length,illustratedProfiles:illustrated.length,
 groups:Object.fromEntries(unique(profiles.map(p=>p.bucket)).sort().map(k=>[k,profiles.filter(p=>p.bucket===k).length])),
 referenceHolds:{total:profiles.filter(p=>p.referenceHold).length,illustrated:illustrated.filter(p=>p.referenceHold).length,
  notIllustrated:profiles.filter(p=>p.referenceHold&&p.bucket==='no-art').length,unresolvedRolesAmongIllustrated:illustrated.filter(p=>p.unresolvedRole).length,
  note:'These hold/role flags overlap the mutually exclusive artwork groups and must not be added to them.'},
 mainBacklogProfiles:main.length,allIllustratedInventory:inventory(illustrated),mainInventory:inventory(main),
 baseStates:{contractSlots:main.length*BASE_POSE_KEYS.length,present:sum(main,p=>p.baseStates.presentKeys.length),missingExactKeys:sum(main,p=>p.baseStates.missingExactKeys.length),
  missingOutsideKnownGates:sum(main,p=>p.baseStates.missingOutsideKnownGates.length),missingDisabledOrUnscheduled:sum(main,p=>p.baseStates.missingExactKeys.length-p.baseStates.missingOutsideKnownGates.length)},
 commands:{catalogueSlots:main.length*MOVESET_KEYS.length,enabled:sum(main,p=>p.commands.enabledKeys.length),disabledExcluded:sum(main,p=>p.commands.disabledSlots.length),
  presentEnabled:sum(main,p=>p.commands.presentEnabledKeys.length),missingEnabled:sum(main,p=>p.commands.missingEnabledKeys.length),
  enabledOnlyIdleAliases:sum(main,p=>p.commands.enabledKeysUsingOnlyIdlePixels.length),presentDisabled:sum(main,p=>p.commands.presentDisabledKeys.length)},
 genericPresentations:{catalogueSlots:main.length*PRESENTATION_KEYS.length,present:generic.length,missingGenericKeys:main.length*PRESENTATION_KEYS.length-generic.length,
  additiveWithSubjectContexts:false,meaning:'Generic legal key coverage only; an exact subject context can replace the seven ordinary generic keys. Generic finisher/finished cannot fill an exact finisher context.'},
 subjectPresentations:{legalOwnOrdinaryKeys:main.length*ordinary.length,enabledHooks:subjects.length,disabledHooksExcluded:main.length*ordinary.length-subjects.length,
  exactClipsPresent:subjects.filter(p=>p.exactClip!=='missing').length,exactClipsMissing:subjects.filter(p=>p.exactClip==='missing').length,
  genericFallbackPresent:subjects.filter(p=>p.exactClip==='missing'&&p.genericClip!=='missing').length,
  withoutDedicatedRendering:subjects.filter(p=>!p.dedicatedRenderingAvailable).length},
 weaponIdles:{keys:sum(main,p=>p.weaponIdles.contractKeys.length),present:sum(main,p=>p.weaponIdles.presentKeys.length),missing:sum(main,p=>p.weaponIdles.missingKeys.length)},
 contextualFinishers:{existingExactClips:sum(main,p=>p.presentations.existingFinisherContextKeys.length),ownCandidateKeySpace:sum(main,p=>p.presentations.ownFinisherCandidateKeys.length),
  requiredMissingClips:null,reason:'A legal key is not proof of an enabled sequence. Attacker, target anatomy, exact recipe, stage props, phase and source permissions decide eligibility. No Cartesian product is counted as required artwork.'},
 expectedMissingAnimations:null};
const roots=['src/data.js','src/sprite-poses.js','src/production-reference.js','src/sprite-manifest.js','src/sprite-usage.js','src/sprite-clips.js','src/sprite-animation.js'];
const hashes=new Map();
async function source(path,recurse=true){if(hashes.has(path))return;const bytes=await read(path);hashes.set(path,{path,sha256:sha(bytes),bytes:bytes.length});
 if(recurse&&path.endsWith('.js'))for(const m of bytes.toString().matchAll(/(?:import|export)\s+(?:[^;]*?\s+from\s+)?['"]([^'"]+)['"]/g))if(m[1].startsWith('.'))await source(rel(resolve(root,dirname(path),m[1])));}
for(const path of roots)await source(path);
for(const path of ['art/registry.json','docs/production/vague26/remaining-evidence.json','src/fight.js','scripts/build-sprites.mjs',rel(self)])await source(path,false);
const output={schema:'halo-wave28-pose-backlog-v1',wave:28,generatedBy:rel(self),deterministic:true,
 scope:'Documentary key census for existing illustrated profiles. Main backlog: side-view-candidate, combatEnabled=true, no unresolved remaining-evidence entry. Other profiles remain separate.',
 contracts:{base:BASE_POSE_KEYS,commands:MOVESET_KEYS,genericPresentations:PRESENTATION_KEYS,ordinarySubjectPresentations:ordinary},
 definitions:{missing:'Exact valid clip key absent from art/registry.json; idle fallback never fills that key.',
  animated:'At least two distinct pixelSHA256 values in the clip; metadata taken from the matching built manifest after exact registry clip/path/file-hash equality checks.',
  static:'One distinct pixel image, including a clip that repeats that image over multiple steps.',
  enabledCommand:'createCombatProfile(fighter).moves[key].enabled === true. Runtime meter, HP, grounded/air, guard and recovery windows remain conditional.',
  baseGates:'All ten base contract keys are counted explicitly. A second count excludes missing walk/dodge disabled by policy, jump for a fixed grounded body, and phase with no later boss/weapon phase. This is not a live reachability proof.',
  presentation:'Seven ordinary own contexts are enumerated separately from nine generic keys. Ordinary hooks run for combatants; taunt additionally requires an approved proposal. Current first-weapon playback is sampled without any actor-state mutation.',
  referenceHolds:'vague26 remaining-evidence is retained as a production hold, including legacy art and historical refusals. An engine-enabled move does not override that hold.'},
 summary,
 readmeText:`Sur ${illustrated.length} profils illustrés, ${main.length} ont une vue latérale candidate et le combat activé sans dossier restant ouvert. Pour ce périmètre : ${summary.commands.missingEnabled} commandes activées n’ont pas de clip dédié (${summary.commands.presentEnabled} présentes sur ${summary.commands.enabled}); ${summary.commands.disabledExcluded} commandes désactivées sont exclues. ${summary.baseStates.missingOutsideKnownGates} clés d’états de base manquent hors désactivations/transitions non prévues (${summary.baseStates.missingExactKeys} absences sur le contrat brut de dix états). ${summary.subjectPresentations.withoutDedicatedRendering} présentations ordinaires activées n’ont ni clip contextuel ni substitut générique utilisable. ${summary.weaponIdles.missing} idle d’arme exact manque. Ces catégories ne sont pas un nombre d’animations attendues; ${summary.mainInventory.animatedClips} clips animés sont actuellement enregistrés dans ce périmètre.`,
 limits:['No art generated, no file pixels edited, no global file written, and no source-fidelity certification performed.',
  'Illustrated noncombatants and unresolved roles receive no actionable combat-animation debt.',
  'No required frame count, original timing, opposite-side drawing or missing animation count is inferred from an idle.',
  'Generic and contextual presentation deficits overlap and must not be added together.',
  'Weapon phases and exhausted ammunition variants reuse command keys; their additional artwork/timing cannot be inferred by multiplying enabled slots.',
  'Clip-entry counts are counts of keys, not distinct drawings. Different keys may refer to the same imported image; repeating one image never creates an animated clip.',
  'Finisher attacker/victim/stage requirements are not exhaustively enumerated or promoted from valid key syntax to enabled choreography.',
  'The documentary audit checks the registered clip contract and profile flags; it is not a browser or full per-input live combat test.'],
 sourceHashes:[...hashes.values()].sort((a,b)=>a.path.localeCompare(b.path)),profiles};
const destination=resolve(root,'docs/production/vague28/pose-backlog.json'),bytes=JSON.stringify(output,null,2)+'\n';
if(process.argv.includes('--check'))assert.equal(await readFile(destination,'utf8'),bytes,'Saved pose backlog is stale');else await writeFile(destination,bytes);
console.log(JSON.stringify({path:rel(destination),sha256:sha(bytes),bytes:Buffer.byteLength(bytes),...(process.argv.includes('--check')?{deterministicCheck:'passed',sources:hashes.size}:{summary,readmeText:output.readmeText})},null,2));
