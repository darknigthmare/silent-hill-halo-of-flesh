import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  VERSION, ROSTER, STAGES, CHRONICLES, SOURCE_META, CONTENT_STATS,
  MANIFESTATION_TRAITS, AFFLICTIONS, STAGE_HAZARDS, createCombatProfile
} from '../src/data.js';

const project = resolve(fileURLToPath(new URL('../', import.meta.url)));
const dist = join(project, 'dist');
const dataDir = join(project, 'data');
const verifyOnly = process.argv.includes('--verify-only');
const verify = process.argv.includes('--verify') || verifyOnly;
const roots = ['index.html','styles.css','manifest.webmanifest','service-worker.js','vercel.json','assets','modules','src','data'];

async function filesUnder(folder) {
  const out=[];
  for (const entry of await readdir(folder,{withFileTypes:true})) {
    const path=join(folder,entry.name);
    if (entry.isDirectory()) out.push(...await filesUnder(path)); else out.push(path);
  }
  return out;
}
async function exists(path){try{await stat(path);return true;}catch{return false;}}
function assert(condition,message){if(!condition)throw new Error(message);}
async function writeJson(path,value){await writeFile(path,`${JSON.stringify(value,null,2)}\n`);}

async function syncData() {
  await mkdir(dataDir,{recursive:true});
  await Promise.all([
    writeJson(join(dataDir,'roster.json'),ROSTER),
    writeJson(join(dataDir,'stages.json'),STAGES),
    writeJson(join(dataDir,'chronicles.json'),CHRONICLES),
    writeJson(join(dataDir,'sources.json'),SOURCE_META),
    writeJson(join(dataDir,'content-stats.json'),CONTENT_STATS),
    writeJson(join(dataDir,'combat-rules.json'),{
      version: VERSION,
      traits: MANIFESTATION_TRAITS,
      afflictions: AFFLICTIONS,
      hazards: STAGE_HAZARDS
    })
  ]);
}

async function runVerification() {
  const fighterIds=new Set();
  const stageIds=new Set();
  const routeIds=new Set();
  const traitIds=new Set(Object.keys(MANIFESTATION_TRAITS));
  const afflictionIds=new Set(Object.keys(AFFLICTIONS));
  const hazardIds=new Set(Object.keys(STAGE_HAZARDS));

  for (const stage of STAGES) {
    assert(!stageIds.has(stage.id),`ID d’arène dupliqué: ${stage.id}`);
    stageIds.add(stage.id);
    assert(SOURCE_META[stage.source],`Source d’arène inconnue: ${stage.id}/${stage.source}`);
    assert(hazardIds.has(stage.hazard),`Danger d’arène inconnu: ${stage.id}/${stage.hazard}`);
  }
  for (const fighter of ROSTER) {
    assert(!fighterIds.has(fighter.id),`ID de combattant dupliqué: ${fighter.id}`);
    fighterIds.add(fighter.id);
    assert(SOURCE_META[fighter.source],`Source inconnue: ${fighter.id}/${fighter.source}`);
    assert(stageIds.has(fighter.stageId),`Arène manquante pour ${fighter.name}: ${fighter.stageId}`);
    assert(traitIds.has(fighter.trait),`Trait inconnu: ${fighter.id}/${fighter.trait}`);
    assert(afflictionIds.has(fighter.affliction),`Affliction inconnue: ${fighter.id}/${fighter.affliction}`);
    assert(typeof fighter.finisher==='string'&&fighter.finisher.trim().length>=4,`Finisher absent: ${fighter.id}`);
    const profile=createCombatProfile(fighter);
    assert(profile.maxHealth>=700&&profile.maxHealth<=1800,`Vitalité hors bornes: ${fighter.id}`);
    assert(Object.keys(profile.moves).length===6,`Moveset incomplet: ${fighter.id}`);
    for(const [key,move] of Object.entries(profile.moves)){
      assert(move.damage>0&&move.startup>=0&&move.reach>0,`Coup invalide: ${fighter.id}/${key}`);
      if(move.effect)assert(afflictionIds.has(move.effect.id),`Effet inconnu: ${fighter.id}/${key}/${move.effect.id}`);
      for(const cancel of move.cancelInto||[])assert(profile.moves[cancel],`Annulation inconnue: ${fighter.id}/${key}/${cancel}`);
    }
  }
  for (const route of CHRONICLES) {
    assert(!routeIds.has(route.id),`ID de chronique dupliqué: ${route.id}`);
    routeIds.add(route.id);
    assert(SOURCE_META[route.source],`Source de chronique inconnue: ${route.id}/${route.source}`);
    assert(route.fighters.length>=1,`Chronique sans adversaire: ${route.id}`);
    route.fighters.forEach(id=>assert(fighterIds.has(id),`Combattant de chronique manquant: ${route.id}/${id}`));
    route.stages.forEach(id=>assert(stageIds.has(id),`Arène de chronique manquante: ${route.id}/${id}`));
  }
  for(const hazard of Object.values(STAGE_HAZARDS))assert(afflictionIds.has(hazard.effect),`Affliction de danger inconnue: ${hazard.name}/${hazard.effect}`);

  assert(CONTENT_STATS.fighters===ROSTER.length,'Statistique roster incohérente');
  assert(CONTENT_STATS.bosses===ROSTER.filter(f=>f.boss).length,'Statistique boss incohérente');
  assert(CONTENT_STATS.sources===Object.keys(SOURCE_META).length,'Statistique sources incohérente');
  assert(CONTENT_STATS.stages===STAGES.length,'Statistique arènes incohérente');
  assert(CONTENT_STATS.chronicles===CHRONICLES.length,'Statistique chroniques incohérente');

  const required=[
    'index.html','styles.css','modules/unified-versus.html','modules/chronicles.html','modules/archive.html',
    'modules/versus.css','modules/chronicles.css','modules/archive.css','src/command.js','src/versus.js',
    'src/chronicles.js','src/archive.js','src/fight.js','src/renderers.js','src/data.js','src/shared.js',
    'data/roster.json','data/stages.json','data/chronicles.json','data/sources.json','data/content-stats.json','data/combat-rules.json'
  ];
  for(const path of required)assert(await exists(join(project,path)),`Fichier requis absent: ${path}`);

  const jsFiles=(await filesUnder(join(project,'src'))).filter(file=>extname(file)==='.js');
  for(const file of jsFiles){
    const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
    assert(result.status===0,`Syntaxe invalide ${relative(project,file)}\n${result.stderr}`);
  }
  const allFiles=await filesUnder(project);
  const htmlFiles=allFiles.filter(file=>extname(file)==='.html'&&!file.includes(`${join(project,'dist')}`));
  for(const file of htmlFiles){
    const content=await readFile(file,'utf8');
    for(const match of content.matchAll(/(?:src|href)=["']([^"'#?]+)["']/g)){
      const ref=match[1];
      if(/^(https?:|data:|mailto:)/.test(ref))continue;
      const target=resolve(dirname(file),ref);
      assert(await exists(target),`Référence absente ${relative(project,file)} → ${ref}`);
    }
  }
  return {js:jsFiles.length,html:htmlFiles.length,traits:traitIds.size,afflictions:afflictionIds.size,hazards:hazardIds.size};
}

await syncData();
if(!verifyOnly){
  await rm(dist,{recursive:true,force:true});
  await mkdir(dist,{recursive:true});
  for(const item of roots){const src=join(project,item),dest=join(dist,item);await cp(src,dest,{recursive:true});}
}
const result=verify?await runVerification():{js:0,html:0,traits:0,afflictions:0,hazards:0};
if(!verifyOnly){
  const files=await filesUnder(dist);const manifest=[];
  for(const file of files){const bytes=await readFile(file);manifest.push({path:relative(dist,file).replaceAll('\\','/'),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}
  const report={project:'SILENT HILL: HALO OF FLESH',version:VERSION,builtAt:new Date().toISOString(),content:CONTENT_STATS,combatRules:{traits:Object.keys(MANIFESTATION_TRAITS).length,afflictions:Object.keys(AFFLICTIONS).length,hazards:Object.keys(STAGE_HAZARDS).length},verified:verify,checks:result,files:manifest};
  await writeJson(join(dist,'build-manifest.json'),report);
  console.log(`Build v${VERSION}: ${files.length+1} fichiers → ${dist}`);
}
if(verify)console.log(`Vérification réussie: ${result.js} JS, ${result.html} HTML, ${ROSTER.length} combattants, ${STAGES.length} arènes, ${CHRONICLES.length} chroniques.`);
