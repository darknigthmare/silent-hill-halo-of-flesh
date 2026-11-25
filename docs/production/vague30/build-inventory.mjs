import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {ROSTER,STAGES,createCombatProfile} from '../../../src/data.js';
import {SPRITES} from '../../../src/sprite-manifest.js';
import {STAGE_BITMAPS} from '../../../src/stage-bitmap-manifest.js';
import {PROJECTILE_BITMAPS} from '../../../src/projectile-bitmap-manifest.js';
import {projectileBitmapFor} from '../../../src/projectile-bitmaps.js';
import {storyArtwork} from '../../../src/story-art.js';

const baseline='9c426d7e230eaec464203acb9b43b63a420acf30';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'});
const baselineAssets=git('ls-tree','-r','--format=%(objectname) %(path)',baseline,'assets').trim().split('\n').filter(Boolean).map(line=>({sha:line.slice(0,40),path:line.slice(41)}));
const unchangedAssets=[];
for(const entry of baselineAssets){const sha=git('hash-object',entry.path).trim();if(sha!==entry.sha)throw Error('Historical asset changed: '+entry.path);unchangedAssets.push(entry.path);}
const protectedPaths=['src/fight.js','src/combat-resolution.js','src/combat-reference-policy.js','src/movesets.js','src/tournament.js','src/run-progress.js'];
const protectedFiles=protectedPaths.map(path=>({path,baseline:git('rev-parse',baseline+':'+path).trim(),current:git('hash-object',path).trim()}));
if(protectedFiles.some(e=>e.baseline!==e.current))throw Error('Protected combat/routing code changed');
const workbookPaths=git('ls-tree','-r','--name-only',baseline,'docs/production').split('\n').filter(path=>path.endsWith('.xlsx')&&!path.slice('docs/production/'.length).includes('/'));
const workbooks=workbookPaths.map(path=>({path,baseline:git('rev-parse',baseline+':'+path).trim(),current:git('hash-object',path).trim()}));
if(workbooks.some(e=>e.baseline!==e.current))throw Error('Workbook changed without the required refresh QA');
const paths=new Set();
const categories={character:[],projectile:[],stage:[],story:[]};
const newPaths=(await readFile(new URL('./assets.json',import.meta.url),'utf8'));
for(const entry of JSON.parse(newPaths).assets){
 const bytes=await readFile(entry.path);
 const sha256=createHash('sha256').update(bytes).digest('hex');
 if(sha256!==entry.sha256||bytes.length!==entry.bytes)throw Error('Delivered asset differs: '+entry.path);
 paths.add(entry.path);categories[entry.category].push({...entry});
}
if(paths.size!==14)throw Error('Expected exactly14 unique delivered images');
const missingProjectiles=[],missingExactCommands=[];
for(const fighter of ROSTER){
 const profile=createCombatProfile(fighter),art=SPRITES[fighter.id];
 for(const [key,move] of Object.entries(profile.moves)){
  if(move.enabled===false)continue;
  if(move.projectile&&!projectileBitmapFor(fighter,move))missingProjectiles.push({fighterId:fighter.id,source:fighter.source,key});
  if(profile.referencePolicy?.combatEnabled!==false&&art?.combatView==='side-view-candidate'&&!art.clips?.[key])missingExactCommands.push({fighterId:fighter.id,source:fighter.source,key});
 }
}
const status=JSON.parse(await readFile('docs/combat-guide/status.json','utf8'));
const report={
 schemaVersion:1,wave:30,baselineCommit:baseline,asOf:'2026-11-25',
 counts:status.counts,delivered:categories,
 preservation:{historicalAssetFiles:unchangedAssets.length,allHistoricalAssetsIdentical:true,protectedFiles,workbooks,workbooksRefreshed:false,
  workbookNote:'Les deux classeurs conservent leur état validé du commit9c426d7. Le rafraîchissement des onglets exige le runtime Artifact Tool et sa revue ; indisponible après coupure. Les JSON et Markdown de la bible sont à jour.'},
 remaining:{
  portraits:ROSTER.filter(f=>!SPRITES[f.id]?.portrait?.path).map(f=>({id:f.id,source:f.source})),
  combatBases:ROSTER.filter(f=>!SPRITES[f.id]?.frames?.length).map(f=>({id:f.id,source:f.source})),
  legacyCombatViews:ROSTER.filter(f=>SPRITES[f.id]?.frames?.length&&SPRITES[f.id]?.combatView!=='side-view-candidate').map(f=>({id:f.id,source:f.source})),
  stages:STAGES.filter(s=>!STAGE_BITMAPS[s.id]).map(s=>({id:s.id,source:s.source})),
  projectileCommands:missingProjectiles,enabledCommandsWithoutExactClip:missingExactCommands,
  individualStoriesWithoutArtwork:ROSTER.filter(f=>!storyArtwork(f.id)).map(f=>({id:f.id,source:f.source}))
 },
 limits:['Les catégories se recoupent ; ne pas additionner en total unique.','Une pose fixe ne constitue pas un clip animé.','Le nombre de commandes sans clip exact ne mesure pas le nombre de frames à produire.','Incubus reste sans sprite de combat ; son éclair autonome ne rend pas le personnage jouable.','Aucune fidélité1:1 certifiée.']
};
await mkdir('docs/production/vague30',{recursive:true});
await writeFile('docs/production/vague30/inventory.json',JSON.stringify(report,null,2)+'\n');
console.log('V30_INVENTORY '+JSON.stringify({counts:report.counts,historicalAssets:unchangedAssets.length,missingPortraits:report.remaining.portraits.length,missingCombatBases:report.remaining.combatBases.length,legacyCombatViews:report.remaining.legacyCombatViews.length,missingStages:report.remaining.stages.length,missingProjectileCommands:missingProjectiles.length,missingExactCommands:missingExactCommands.length,workbooksPreserved:workbooks.length}));
