/** Recompute wave32 coverage and verify preservation against its exact baseline. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {buildGuideAssociations} from '../../../scripts/build-combat-guide.mjs';
import {ROSTER,createCombatProfile} from '../../../src/data.js';
import {SPRITES} from '../../../src/sprite-manifest.js';
import {projectileBitmapFor} from '../../../src/projectile-bitmaps.js';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const baseline='d4269ad8239a99cad53d44bc77b569ed7a0d41a3';
const read=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});
const blob=bytes=>createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
const historical=git('ls-tree','-r',baseline,'assets').trim().split('\n').filter(Boolean).map(line=>{
  const [meta,path]=line.split('\t'),expected=meta.split(' ')[2];
  return {path,expected,actual:blob(readFileSync(resolve(root,path)))};
});
if(historical.some(x=>x.expected!==x.actual))throw Error('Historical asset bytes changed');
const protectedPaths=['src/combat-resolution.js','src/combat-reference-policy.js','src/movesets.js','src/tournament.js','src/run-progress.js','src/renderers.js'];
const protectedFiles=protectedPaths.map(path=>({path,baseline:git('rev-parse',baseline+':'+path).trim(),current:blob(readFileSync(resolve(root,path)))}));
if(protectedFiles.some(x=>x.baseline!==x.current))throw Error('Unrelated protected gameplay file changed');
const oldRegistry=JSON.parse(git('show',baseline+':art/registry.json')),currentRegistry=read('art/registry.json');
const character=read('docs/production/vague32/characters/import-plan.json').plans.map(x=>{
  const frame=SPRITES[x.id].frames[x.frameIndex];
  if(frame.path!==x.path||frame.sha256!==x.sha256)throw Error('Character import differs from published manifest');
  return {category:'character',owner:x.id,source:x.source,pose:x.pose,frameIndex:x.frameIndex,path:frame.path,sha256:frame.sha256,bytes:frame.bytes,width:frame.width,height:frame.height};
});
const changedOwners=new Set(character.map(x=>x.owner));
const unaffectedOwners=Object.keys(oldRegistry.assets).filter(id=>!changedOwners.has(id));
if(unaffectedOwners.some(id=>JSON.stringify(oldRegistry.assets[id])!==JSON.stringify(currentRegistry.assets[id])))throw Error('Unrelated sprite owner changed');
const workbookQAPath='docs/production/vague32/workbooks/validation.json',workbookQA=read(workbookQAPath);
if(workbookQA.status!=='passed'||workbookQA.baselineCommit!==baseline)throw Error('Final workbook verification missing');
for(const receipt of workbookQA.workbooks){
  const actual=createHash('sha256').update(readFileSync(resolve(root,receipt.path))).digest('hex');
  if(actual!==receipt.sha256)throw Error('Workbook differs from reviewed receipt: '+receipt.path);
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
const story=read('docs/production/vague32/story/integration-delivery.json').entries.map(x=>({category:'story',owner:x.fighterId,source:ROSTER.find(f=>f.id===x.fighterId).source,moment:x.moment,path:x.path,sha256:x.sha256,bytes:x.bytes,width:x.width,height:x.height}));
const result={schemaVersion:1,wave:32,baselineCommit:baseline,asOf:'2026-11-27',baselineCounts:read('docs/production/vague31/inventory.json').counts,counts:status.counts,
  delivered:{character,stage:read('docs/production/vague32/stages/import-plan.json').delivered,projectile:[],story},
  preservation:{historicalAssetFiles:historical.length,allHistoricalAssetsIdentical:true,protectedFiles,unaffectedSpriteOwners:unaffectedOwners.length,allUnaffectedSpriteOwnersIdentical:true,
    workbookQA:workbookQAPath,workbooks:workbookQA.workbooks,historicalWorkbookSheetsPreserved:workbookQA.historicalSheetsPreserved,historicalWorkbookCellsPreserved:workbookQA.historicalCellsPreserved,historicalWorkbookFormulasPreserved:workbookQA.historicalFormulasPreserved,
    changedGameplay:[{path:'src/fight.js',reason:'Origine physique et visuelle des neutralSpecial exacts de Walter SH4 et Eddie SH2 alignée sur le canon ; segment d’émission initial à bout portant.',referenceModule:'src/projectile-origin.js',proof:'docs/production/vague32/qa-native-origins/characters-report.json'},
      {path:'src/sprite-system.js',reason:'Budget combat borné de 72 à 79 Mio pour admettre toutes les frames natives du duo maximal Groaner / Faceless Nurse.',proof:'docs/production/vague32/qa/combat-sprite-budget.json'}],
    note:'Les anciens fichiers d’image sont identiques. Les changements de couloir de tir sont documentés ; aucun nouveau bitmap de projectile ni certification 1:1.'},
  remaining:{portraits:profiles.filter(r=>!r.details.assets.portraitPath).map(idSource),combatBases:profiles.filter(r=>!r.details.assets.framePaths.length).map(idSource),
    legacyCombatViews:profiles.filter(r=>r.details.assets.framePaths.length&&r.details.assets.combatView!=='side-view-candidate').map(idSource),
    stages:records.filter(r=>r.kind==='stage'&&!r.details.presentation.framePaths.length).map(idSource),projectileCommands,enabledCommandsWithoutExactClip,
    individualStoriesWithoutArtwork:profiles.filter(r=>!r.details.story.artwork).map(idSource)},
  limits:['Les catégories se recoupent et ne représentent pas un nombre unique d’images manquantes.',
    'Quatre nouvelles poses fixes ; aucune nouvelle animation ni mesure de timing original.',
    'Les 68 sections du guide et ses deux extensions restent intégrées ; leurs 40 scénarios fonctionnels restent à exécuter après implémentation.',
    'Les illustrations de récit sont des compositions originales compatibles et ne constituent pas des fins canoniques.',
    'Les dimensions, angles, géométries et sprites ne sont pas certifiés 1:1.',
    'La présence d’une image ne modifie pas le rôle ni l’admission au combat d’un profil.']};
writeFileSync(resolve(root,'docs/production/vague32/inventory.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({historicalAssets:historical.length,unaffectedOwners:unaffectedOwners.length,newImages:character.length+result.delivered.stage.length+story.length,remainingStages:result.remaining.stages.length,remainingCommands:enabledCommandsWithoutExactClip.length,remainingStories:result.remaining.individualStoriesWithoutArtwork.length}));
