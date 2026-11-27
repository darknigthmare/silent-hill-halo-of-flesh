/** Recompute this delivery's inventory from the shipped manifests and guide. */
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
const baseline='f01622bf097fb980f354f7f0fb55df3685f4e92a';
const read=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
const blob=bytes=>createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
const historical=git('ls-tree','-r',baseline,'assets').trim().split('\n').filter(Boolean).map(line=>{
  const [meta,path]=line.split('\t'),expected=meta.split(' ')[2];
  return {path,expected,actual:blob(readFileSync(resolve(root,path)))};
});
const changedHistorical=historical.filter(x=>x.expected!==x.actual);
if(changedHistorical.length)throw Error('Historical assets changed: '+JSON.stringify(changedHistorical));
const protectedPaths=['src/fight.js','src/combat-resolution.js','src/combat-reference-policy.js','src/movesets.js','src/tournament.js','src/run-progress.js','src/sprite-system.js','src/renderers.js'];
const protectedFiles=protectedPaths.map(path=>({path,baseline:git('rev-parse',baseline+':'+path).trim(),current:blob(readFileSync(resolve(root,path)))}));
if(protectedFiles.some(x=>x.baseline!==x.current))throw Error('Protected gameplay file changed');
const oldRegistry=JSON.parse(git('show',baseline+':art/registry.json'));
const currentRegistry=read('art/registry.json');
const workbookQAPath='docs/combat-guide/qa/extensions/validation.json';
const workbookQA=read(workbookQAPath);
if(workbookQA.status!=='passed'||workbookQA.baselineCommit!==baseline)throw Error('Final workbook verification missing');
for(const receipt of workbookQA.workbooks){
 const actual=createHash('sha256').update(readFileSync(resolve(root,receipt.path))).digest('hex');
 if(actual!==receipt.sha256)throw Error('Workbook differs from reviewed receipt: '+receipt.path);
}
const character=read('docs/production/vague31/characters/import-plan.json').plans.map(x=>({category:'character',owner:x.id,source:x.source,pose:x.pose,path:x.path,sha256:x.sha256,bytes:x.bytes,width:x.width,height:x.height}));
const changedOwners=new Set(character.map(x=>x.owner));
const unaffectedOwners=Object.keys(oldRegistry.assets).filter(id=>!changedOwners.has(id));
if(unaffectedOwners.some(id=>JSON.stringify(oldRegistry.assets[id])!==JSON.stringify(currentRegistry.assets[id])))throw Error('Unrelated sprite owner changed');
const {associations,status}=buildGuideAssociations();
const records=associations.records;
const profiles=records.filter(r=>r.kind==='profile');
const idSource=record=>({id:record.id,source:record.source});
const projectileCommands=[],enabledCommandsWithoutExactClip=[];
for(const fighter of ROSTER){
 const profile=createCombatProfile(fighter),art=SPRITES[fighter.id];
 for(const [key,move] of Object.entries(profile.moves)){
  if(move.enabled===false)continue;
  if(profile.referencePolicy.combatEnabled!==false&&art?.combatView==='side-view-candidate'&&!art.clips?.[key])enabledCommandsWithoutExactClip.push({fighterId:fighter.id,source:fighter.source,key});
  if(move.projectile&&!projectileBitmapFor(fighter,move))projectileCommands.push({id:fighter.id,source:fighter.source,moveKey:key});
 }}
const result={schemaVersion:1,wave:31,baselineCommit:baseline,asOf:'2026-11-27',counts:status.counts,
  delivered:{character,stage:read('docs/production/vague31/stages/import-plan.json').delivered,projectile:[],story:[]},
  preservation:{historicalAssetFiles:historical.length,allHistoricalAssetsIdentical:true,protectedFiles,unaffectedSpriteOwners:unaffectedOwners.length,
    allUnaffectedSpriteOwnersIdentical:true,workbookQA:workbookQAPath,workbooks:workbookQA.workbooks,
    historicalWorkbookSheetsPreserved:workbookQA.historicalSheetsPreserved,historicalWorkbookCellsPreserved:workbookQA.historicalCellsPreserved,historicalWorkbookFormulasPreserved:workbookQA.historicalFormulasPreserved,
    calibration:['sh4_man_with_the_coat_067','sh2_eddie_dombrowski_032'].map(id=>'docs/production/vague31/characters/'+id+'-calibration.json'),
    note:'Les deux calibrations changent uniquement les métadonnées de placement des sprites concernés. Les fichiers historiques, portraits, règles et moteur sont conservés.'},
  remaining:{portraits:profiles.filter(r=>!r.details.assets.portraitPath).map(idSource),
    combatBases:profiles.filter(r=>!r.details.assets.framePaths.length).map(idSource),
    legacyCombatViews:profiles.filter(r=>r.details.assets.framePaths.length&&r.details.assets.combatView!=='side-view-candidate').map(idSource),
    stages:records.filter(r=>r.kind==='stage'&&!r.details.presentation.framePaths.length).map(idSource),
    projectileCommands,enabledCommandsWithoutExactClip,
    individualStoriesWithoutArtwork:profiles.filter(r=>!r.details.story.artwork).map(idSource)},
  limits:['Les catégories se recoupent ; ne pas les additionner en nombre unique d’images manquantes.',
    'Une pose fixe ne constitue pas une animation. Les trois nouveaux gestes restent des adaptations de versus.',
    'Les 68 sections sont intégrées à la bible ; les 40 scénarios fonctionnels des extensions restent à exécuter après implémentation.',
    'La géométrie de décor, les distances, le cadrage et les sprites ne sont pas certifiés 1:1.',
    'La présence d’une image ne modifie pas le rôle ni l’admission au combat d’un profil.']};
writeFileSync(resolve(root,'docs/production/vague31/inventory.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({historicalAssets:historical.length,unaffectedOwners:unaffectedOwners.length,newImages:character.length+result.delivered.stage.length,remainingStages:result.remaining.stages.length,remainingCommands:enabledCommandsWithoutExactClip.length}));
