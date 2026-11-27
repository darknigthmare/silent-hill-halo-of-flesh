/** Recompute wave33 coverage and preserve exact content from its wave32 baseline. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {buildGuideAssociations} from '../../../scripts/build-combat-guide.mjs';
import {ROSTER,createCombatProfile} from '../../../src/data.js';
import {SPRITES} from '../../../src/sprite-manifest.js';
import {STAGE_BITMAPS} from '../../../src/stage-bitmap-manifest.js';
import {projectileBitmapFor} from '../../../src/projectile-bitmaps.js';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const read=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const baseline=read('docs/production/vague33/baseline.json');
const git=(...args)=>execFileSync('git',args,{cwd:root,env:{...process.env,GIT_NO_LAZY_FETCH:'1'},encoding:'utf8',maxBuffer:32*1024*1024});
const blob=bytes=>createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
const historical=git('ls-tree','-r',baseline.tree,'assets').trim().split('\n').filter(Boolean).map(line=>{
  const [meta,path]=line.split('\t'),expected=meta.split(' ')[2];
  return {path,expected,actual:blob(readFileSync(resolve(root,path)))};
});
assert.ok(historical.every(x=>x.expected===x.actual),'Historical asset bytes changed');
const protectedPaths=['src/fight.js','src/combat-geometry.js','src/combat-resolution.js','src/movesets.js','src/tournament.js','src/run-progress.js','src/renderers.js'];
const protectedFiles=protectedPaths.map(path=>({path,baseline:git('rev-parse',baseline.tree+':'+path).trim(),current:blob(readFileSync(resolve(root,path)))}));
assert.ok(protectedFiles.every(x=>x.baseline===x.current),'Unrelated gameplay changed');
const oldRegistry=JSON.parse(git('show',baseline.tree+':art/registry.json')),currentRegistry=read('art/registry.json');
const plans=['characters','characters-root'].flatMap(folder=>read(`docs/production/vague33/${folder}/import-plan.json`).plans);
const character=plans.map(x=>{
  const frame=SPRITES[x.id].frames[x.frameIndex];
  assert.equal(frame.path,x.path);assert.equal(frame.sha256,x.sha256);
  assert.deepEqual(frame.anchor,x.anchor);assert.equal(frame.bodyHeight,x.bodyHeight);
  return {category:'character',owner:x.id,source:x.source,pose:x.pose,frameIndex:x.frameIndex,path:frame.path,sha256:frame.sha256,bytes:frame.bytes,width:frame.width,height:frame.height};
});
const changedOwners=new Set(character.map(x=>x.owner));
const unaffectedOwners=Object.keys(oldRegistry.assets).filter(id=>!changedOwners.has(id));
for(const id of unaffectedOwners)assert.deepEqual(currentRegistry.assets[id],oldRegistry.assets[id],id+' unrelated owner changed');
for(const id of changedOwners){
  const before=oldRegistry.assets[id],after=currentRegistry.assets[id];
  assert.deepEqual(after.portrait,before.portrait,id+' portrait changed');
  for(const [key,clip] of Object.entries(before.clips))assert.deepEqual(after.clips[key],clip,id+' historical clip changed');
  const expected=structuredClone(before.frames);
  if(id==='sh3_numb_body_medium')expected[0].anchor[1]=903/1024;
  if(id==='sh2_lying_figure_crawling_021'){
    const correction=read('docs/production/vague33/crawling-calibration.json').frames.find(f=>f.index===0);
    assert.equal(correction.sha256,expected[0].sha256);
    expected[0].anchor=correction.after.anchor;expected[0].bodyHeight=correction.after.bodyHeight;
  }
  assert.deepEqual(after.frames.slice(0,before.frames.length),expected,id+' unexpected historical frame change');
}
const oldStageSource=git('show',baseline.tree+':src/stage-bitmap-manifest.js');
const oldStages=JSON.parse(oldStageSource.slice(oldStageSource.indexOf('{'),oldStageSource.lastIndexOf('}')+1));
for(const [id,art] of Object.entries(oldStages))assert.deepEqual(STAGE_BITMAPS[id],art,id+' historical stage image changed');
const workbookQAPath='docs/production/vague33/workbooks/validation.json',workbookQA=read(workbookQAPath);
assert.equal(workbookQA.status,'passed');
for(const receipt of workbookQA.workbooks){
  const actual=createHash('sha256').update(readFileSync(resolve(root,receipt.path))).digest('hex');
  assert.equal(actual,receipt.sha256,'Workbook differs from reviewed receipt: '+receipt.path);
}
const {associations,status}=buildGuideAssociations(),records=associations.records;
const profiles=records.filter(r=>r.kind==='profile'),idSource=record=>({id:record.id,source:record.source});
const projectileCommands=[],enabledCommandsWithoutExactClip=[];
for(const fighter of ROSTER){
  const profile=createCombatProfile(fighter),art=SPRITES[fighter.id];
  for(const [key,move] of Object.entries(profile.moves)){
    if(move.enabled===false)continue;
    if(profile.referencePolicy.combatEnabled!==false&&art?.combatView==='side-view-candidate'&&!art.clips?.[key])enabledCommandsWithoutExactClip.push({fighterId:fighter.id,source:fighter.source,key});
    if(move.projectile&&!projectileBitmapFor(fighter,move))projectileCommands.push({id:fighter.id,source:fighter.source,moveKey:key});
  }
}
const result={schemaVersion:1,wave:33,baselineCommit:baseline.commit,baselineTree:baseline.tree,asOf:'2026-11-27',baselineCounts:read('docs/production/vague32/inventory.json').counts,counts:status.counts,
  delivered:{character,stage:read('docs/production/vague33/stages/import-plan.json').delivered,projectile:[],story:[]},
  preservation:{historicalAssetFiles:historical.length,allHistoricalAssetsIdentical:true,protectedFiles,
    unaffectedSpriteOwners:unaffectedOwners.length,allUnaffectedSpriteOwnersIdentical:true,allHistoricalPortraitsAndClipsIdentical:true,
    historicalFrameExceptions:[read('docs/production/vague33/idle-anchor-correction.json'),read('docs/production/vague33/crawling-calibration.json')],historicalStageOwners:Object.keys(oldStages).length,allHistoricalStageImagesIdentical:true,
    workbookQA:workbookQAPath,workbooks:workbookQA.workbooks,historicalWorkbookSheetsPreserved:workbookQA.historicalSheetsPreserved,historicalWorkbookCellsPreserved:workbookQA.historicalCellsPreserved,historicalWorkbookFormulasPreserved:workbookQA.historicalFormulasPreserved,
    combatProfileComparison:read('docs/production/vague33/combat-profile-preservation.json'),
    changedGameplay:[{path:'src/stage-reference-policy.js',reason:'Galerie normale précise de The Arcade, sol neutre et effets génériques désactivés.'},
      {path:'src/combat-reference-policy.js',reason:'Seule neutralLight du rampant passe de mid à low ; portée, dégâts, timings et autres profils préservés.'},
      {path:'src/sprite-system.js',reason:'Domaine de hauteur debout0.05..4 pour canevas horizontaux ; ancres0..1, PNG et corps physiques inchangés.'},
      {path:'src/projectile-origin.js',reason:'Contrôle de calibration commun ; origines exactes de Walter et Eddie couvertes par tests.'}]},
  remaining:{portraits:profiles.filter(r=>!r.details.assets.portraitPath).map(idSource),combatBases:profiles.filter(r=>!r.details.assets.framePaths.length).map(idSource),
    legacyCombatViews:profiles.filter(r=>r.details.assets.framePaths.length&&r.details.assets.combatView!=='side-view-candidate').map(idSource),
    stages:records.filter(r=>r.kind==='stage'&&!r.details.presentation.framePaths.length).map(idSource),projectileCommands,enabledCommandsWithoutExactClip,
    individualStoriesWithoutArtwork:profiles.filter(r=>!r.details.story.artwork).map(idSource)},
  limits:['Les catégories se recoupent ; les commandes sans clip exact ne sont pas un nombre d’images à produire.',
    'Huit nouvelles poses fixes ; aucun nouveau cycle animé ni timing original mesuré.',
    'Les 40 scénarios fonctionnels des extensions restent conçus et non exécutés ; la QA technique ne les remplace pas.',
    'La galerie utilise deux plans fixes reconstruits à partir de vues source de faible résolution ; géométrie et textures non certifiées 1:1.',
    'La route narrative Lying Figure reste bloquée par la base manquante de sh2_mannequin_ambusher_023.',
    'Les identités, sources, rôles et conditions d’admission au combat restent conservés.']};
writeFileSync(resolve(root,'docs/production/vague33/inventory.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({historicalAssets:historical.length,unaffectedOwners:unaffectedOwners.length,newImages:character.length+result.delivered.stage.length,remainingStages:result.remaining.stages.length,remainingCommands:enabledCommandsWithoutExactClip.length,remainingStories:result.remaining.individualStoriesWithoutArtwork.length}));
