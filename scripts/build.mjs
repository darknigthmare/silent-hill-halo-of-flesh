import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  VERSION, ROSTER, STAGES, CHRONICLES, SOURCE_META, CONTENT_STATS,
  MANIFESTATION_TRAITS, AFFLICTIONS, STAGE_HAZARDS, AI_PERSONALITIES, RITUAL_MODIFIERS, SOURCE_COVERAGE_TARGETS, coverageAudit, createBossPhases, createCombatProfile, MOVESET_KEYS, MOVE_FIDELITY, STAGE_TERRAINS, STAGE_SHIFT_STYLES, STAGE_EVENTS, STAGE_INTERACTION_TRIGGERS, stageDirectorSummary
} from '../src/data.js';

const project = resolve(fileURLToPath(new URL('../', import.meta.url)));
const dist = join(project, 'dist');
const dataDir = join(project, 'data');
const verifyOnly = process.argv.includes('--verify-only');
const verify = process.argv.includes('--verify') || verifyOnly;
const roots = ['index.html','offline.html','404.html','styles.css','manifest.webmanifest','service-worker.js','vercel.json','assets','modules','src','data'];

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
    writeJson(join(dataDir,'coverage-audit.json'),coverageAudit()),
    writeJson(join(dataDir,'stage-director.json'),{ version: VERSION, terrains: STAGE_TERRAINS, shifts: STAGE_SHIFT_STYLES, events: STAGE_EVENTS, interactionTriggers: STAGE_INTERACTION_TRIGGERS, stages: STAGES.map(stage=>({ id:stage.id, name:stage.name, source:stage.source, lore:stage.lore, ...stageDirectorSummary(stage) })) }),
    writeJson(join(dataDir,'fatalities.json'),{ version: VERSION, fighters: ROSTER.map(({id,name,source,fatalities})=>({id,name,source,fatalities})), stages: STAGES.map(({id,name,source,fatality,animations})=>({id,name,source,fatality,animations})) }),
    writeJson(join(dataDir,'movesets.json'),{
      version: VERSION,
      order: MOVESET_KEYS,
      fidelityTypes: MOVE_FIDELITY,
      fighters: ROSTER.map((fighter)=>{
        const profile=createCombatProfile(fighter);
        return { id:fighter.id, name:fighter.name, source:fighter.source, summary:profile.moveset.fidelitySummary, presentation:profile.moveset.presentation, moves:profile.moves };
      })
    }),
    writeJson(join(dataDir,'combat-rules.json'),{
      version: VERSION,
      traits: MANIFESTATION_TRAITS,
      afflictions: AFFLICTIONS,
      hazards: STAGE_HAZARDS,
      rituals: RITUAL_MODIFIERS,
      aiPersonalities: AI_PERSONALITIES,
      terrains: STAGE_TERRAINS,
      shiftStyles: STAGE_SHIFT_STYLES,
      stageEvents: STAGE_EVENTS,
      stageInteractionTriggers: STAGE_INTERACTION_TRIGGERS,
      coverageTargets: SOURCE_COVERAGE_TARGETS
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
  const aiIds=new Set(Object.keys(AI_PERSONALITIES));
  const ritualIds=new Set(Object.keys(RITUAL_MODIFIERS));
  const terrainIds=new Set(Object.keys(STAGE_TERRAINS));
  const shiftIds=new Set(Object.keys(STAGE_SHIFT_STYLES));
  const stageEventIds=new Set(Object.keys(STAGE_EVENTS));

  for (const stage of STAGES) {
    assert(!stageIds.has(stage.id),`ID d’arène dupliqué: ${stage.id}`);
    stageIds.add(stage.id);
    assert(SOURCE_META[stage.source],`Source d’arène inconnue: ${stage.id}/${stage.source}`);
    assert(hazardIds.has(stage.hazard),`Danger d’arène inconnu: ${stage.id}/${stage.hazard}`);
    assert(Array.isArray(stage.animations)&&(stage.animations.length>=1||stage.referencePolicy),`Animations d’arène absentes sans décision de référence: ${stage.id}`);
    assert(stage.fatality&&typeof stage.fatality.name==='string'&&stage.fatality.sequence?.length>=3,`Fatalité d’arène incomplète: ${stage.id}`);
    assert(stage.terrain&&terrainIds.has(stage.terrain.id),`Terrain d’arène inconnu: ${stage.id}/${stage.terrain?.id}`);
    assert(stage.shift&&shiftIds.has(stage.shift.style),`Bascule d’arène inconnue: ${stage.id}/${stage.shift?.style}`);
    assert(stage.lore?.premise&&stage.lore?.adaptationNotice,`Doctrine lore d’arène incomplète: ${stage.id}`);
    assert(stage.director&&Array.isArray(stage.director.events)&&Array.isArray(stage.director.hazardDeck),`Directeur d’arène incomplet: ${stage.id}`);
    assert(JSON.stringify(stage.director.events)===JSON.stringify(stage.referencePolicy.allowedEvents),`Événement non autorisé par la fiche: ${stage.id}`);
    assert(JSON.stringify(stage.director.hazardDeck)===JSON.stringify(stage.referencePolicy.allowedHazards),`Danger non autorisé par la fiche: ${stage.id}`);
    stage.director.events.forEach(id=>assert(stageEventIds.has(id),`Événement d’arène inconnu: ${stage.id}/${id}`));
    stage.director.hazardDeck.forEach(id=>assert(hazardIds.has(id),`Deck de dangers inconnu: ${stage.id}/${id}`));
    assert(stage.animationTracks?.length===stage.animations.length,`Pistes d’animation incohérentes: ${stage.id}`);
    assert(Array.isArray(stage.interactions)&&stage.interactions.every(i=>stage.director.events.includes(i.event)),`Interaction sans événement autorisé: ${stage.id}`);
  }
  for (const fighter of ROSTER) {
    assert(!fighterIds.has(fighter.id),`ID de combattant dupliqué: ${fighter.id}`);
    fighterIds.add(fighter.id);
    assert(SOURCE_META[fighter.source],`Source inconnue: ${fighter.id}/${fighter.source}`);
    assert(stageIds.has(fighter.stageId),`Arène manquante pour ${fighter.name}: ${fighter.stageId}`);
    assert(traitIds.has(fighter.trait),`Trait inconnu: ${fighter.id}/${fighter.trait}`);
    assert(afflictionIds.has(fighter.affliction),`Affliction inconnue: ${fighter.id}/${fighter.affliction}`);
    assert(aiIds.has(fighter.aiProfile),`Personnalité IA inconnue: ${fighter.id}/${fighter.aiProfile}`);
    assert(typeof fighter.finisher==='string'&&fighter.finisher.trim().length>=4,`Finisher absent: ${fighter.id}`);
    assert(Array.isArray(fighter.fatalities)&&fighter.fatalities.length===2,`Fatalités incomplètes: ${fighter.id}`);
    fighter.fatalities.forEach((fatality)=>{
      assert(typeof fatality.name==='string'&&fatality.name.length>=4,`Nom de fatalité absent: ${fighter.id}`);
      assert(Array.isArray(fatality.sequence)&&fatality.sequence.length>=3,`Séquence de fatalité absente: ${fighter.id}/${fatality.id}`);
      assert(typeof fatality.canonicalBasis==='string'&&fatality.canonicalBasis.length>=8,`Base canonique absente: ${fighter.id}/${fatality.id}`);
      assert(typeof fatality.fidelity==='string'&&fatality.fidelity.length>=4,`Statut de fidélité absent: ${fighter.id}/${fatality.id}`);
    });
    assert(typeof fighter.catalogueStatus==='string'&&typeof fighter.nameStatus==='string'&&typeof fighter.evidenceTier==='string',`Traçabilité incomplète: ${fighter.id}`);
    const profile=createCombatProfile(fighter);
    assert(profile.maxHealth>=700&&profile.maxHealth<=1800,`Vitalité hors bornes: ${fighter.id}`);
    assert(Object.keys(profile.moves).length===MOVESET_KEYS.length,`Moveset incomplet: ${fighter.id}`);
    assert(profile.moveset?.fidelitySummary?.total===MOVESET_KEYS.length,`Résumé de moveset incomplet: ${fighter.id}`);
    assert(profile.ai&&profile.ai.preferredRange>0,`Profil IA incomplet: ${fighter.id}`);
    const phases=createBossPhases(fighter);
    assert((fighter.boss&&phases.length===2)||(!fighter.boss&&phases.length===0),`Phases de boss incohérentes: ${fighter.id}`);
    phases.forEach((phase,index)=>{
      assert(phase.threshold>0&&phase.threshold<1,`Seuil de phase invalide: ${fighter.id}/${index}`);
      assert(phase.power>=1&&phase.speed>=1,`Modificateur de phase invalide: ${fighter.id}/${index}`);
    });
    const contextualContract={
      backThrow:{trigger:'back-throw',sideSwitch:true,hardKnockdown:true},
      dodgeAttack:{trigger:'dodge-followup'},
      guardCounter:{trigger:'perfect-guard',armorBreak:true},
      wakeupAttack:{trigger:'wakeup',groundBounce:true}
    };
    for(const key of MOVESET_KEYS){
      const move=profile.moves[key];
      assert(move&&move.key===key,`Coup absent ou mal indexé: ${fighter.id}/${key}`);
      assert(move.damage>0&&move.startup>=0&&move.active>0&&move.recovery>0&&move.reach>0,`Coup invalide: ${fighter.id}/${key}`);
      assert(typeof move.input==='string'&&move.input.length>0,`Commande absente: ${fighter.id}/${key}`);
      assert(typeof move.canonicalBasis==='string'&&move.canonicalBasis.length>=8,`Base canonique absente: ${fighter.id}/${key}`);
      assert(MOVE_FIDELITY[move.fidelity],`Statut de fidélité inconnu: ${fighter.id}/${key}/${move.fidelity}`);
      if(move.effect)assert(afflictionIds.has(move.effect.id),`Effet inconnu: ${fighter.id}/${key}/${move.effect.id}`);
      for(const [property,expected] of Object.entries(contextualContract[key]||{}))assert(move[property]===expected,`Contrat contextuel invalide: ${fighter.id}/${key}/${property}`);
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
  assert(CONTENT_STATS.rituals===ritualIds.size,'Statistique rites incohérente');
  assert(CONTENT_STATS.bossPhases===ROSTER.filter(f=>f.boss).reduce((sum,fighter)=>sum+createBossPhases(fighter).length,0),'Statistique phases incohérente');
  assert(CONTENT_STATS.fatalities===ROSTER.reduce((sum,fighter)=>sum+fighter.fatalities.length,0),'Statistique fatalités incohérente');
  assert(CONTENT_STATS.stageFatalities===STAGES.filter(stage=>stage.fatality).length,'Statistique fatalités d’arène incohérente');
  assert(CONTENT_STATS.stageAnimations===STAGES.reduce((sum,stage)=>sum+stage.animations.length,0),'Statistique animations incohérente');
  assert(CONTENT_STATS.stageDirectorEvents===STAGES.reduce((sum,stage)=>sum+stage.director.events.length,0),'Statistique événements de lieu incohérente');
  assert(CONTENT_STATS.stageInteractions===STAGES.reduce((sum,stage)=>sum+stage.interactions.length,0),'Statistique interactions incohérente');
  assert(CONTENT_STATS.stageHazardLinks===STAGES.reduce((sum,stage)=>sum+stage.director.hazardDeck.length,0),'Statistique decks de danger incohérente');
  assert(CONTENT_STATS.terrainProfiles===terrainIds.size&&CONTENT_STATS.shiftStyles===shiftIds.size,'Statistique doctrines de terrain incohérente');
  assert(CONTENT_STATS.moves===ROSTER.length*MOVESET_KEYS.length,'Statistique moves incohérente');
  assert(CONTENT_STATS.directCanonicalMoves+CONTENT_STATS.behaviorCompositeMoves+CONTENT_STATS.versusAdaptationMoves===CONTENT_STATS.moves,'Répartition de fidélité incohérente');
  const audit=coverageAudit();
  assert(audit.complete&&CONTENT_STATS.coverageComplete,'Audit de couverture incomplet');

  const required=[
    'index.html','offline.html','404.html','styles.css','modules/unified-versus.html','modules/chronicles.html','modules/archive.html',
    'modules/versus.css','modules/chronicles.css','modules/archive.css','src/command.js','src/versus.js',
    'src/chronicles.js','src/archive.js','src/fight.js','src/renderers.js','src/data.js','src/shared.js',
    'data/roster.json','data/stages.json','data/chronicles.json','data/sources.json','data/content-stats.json','data/combat-rules.json','data/coverage-audit.json','data/fatalities.json','data/movesets.json','data/stage-director.json','src/movesets.js','src/stage-director.js'
  ];
  for(const path of required)assert(await exists(join(project,path)),`Fichier requis absent: ${path}`);

  const jsFiles=(await filesUnder(join(project,'src'))).filter(file=>extname(file)==='.js');
  for(const file of jsFiles){
    const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
    assert(result.status===0,`Syntaxe invalide ${relative(project,file)}\n${result.stderr}`);
  }
  const distributedFiles=(await Promise.all(roots.map(async(item)=>{
    const path=join(project,item);
    const info=await stat(path);
    return info.isDirectory()?filesUnder(path):[path];
  }))).flat();
  const htmlFiles=distributedFiles.filter(file=>extname(file)==='.html');
  for(const file of htmlFiles){
    const content=await readFile(file,'utf8');
    const inlineScripts=[...content.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].filter(match=>match[1].trim().length>0);
    assert(inlineScripts.length===0,`Script inline interdit par la CSP: ${relative(project,file)}`);
    for(const match of content.matchAll(/(?:src|href)=["']([^"'#?]+)["']/g)){
      const ref=match[1];
      if(/^(https?:|data:|mailto:)/.test(ref))continue;
      const target=resolve(dirname(file),ref.replace(/^\//,''));
      const rootTarget=ref.startsWith('/')?resolve(project,ref.slice(1)):target;
      assert(await exists(rootTarget),`Référence absente ${relative(project,file)} → ${ref}`);
    }
  }
  const manifest=JSON.parse(await readFile(join(project,'manifest.webmanifest'),'utf8'));
  assert(manifest.id==='/'&&manifest.scope==='/'&&manifest.lang==='fr',`Manifeste PWA incomplet`);
  assert(Array.isArray(manifest.shortcuts)&&manifest.shortcuts.length>=3,`Raccourcis PWA incomplets`);
  const vercel=JSON.parse(await readFile(join(project,'vercel.json'),'utf8'));
  const headerKeys=new Set(vercel.headers?.flatMap(rule=>rule.headers||[]).map(header=>header.key));
  for(const key of ['Content-Security-Policy','Cross-Origin-Opener-Policy','Cross-Origin-Resource-Policy','X-Frame-Options'])assert(headerKeys.has(key),`En-tête Vercel absent: ${key}`);
  return {js:jsFiles.length,html:htmlFiles.length,traits:traitIds.size,afflictions:afflictionIds.size,hazards:hazardIds.size,rituals:ritualIds.size,aiPersonalities:aiIds.size,terrains:terrainIds.size,shiftStyles:shiftIds.size,stageEvents:stageEventIds.size,bossPhases:CONTENT_STATS.bossPhases,fatalities:CONTENT_STATS.fatalities,stageFatalities:CONTENT_STATS.stageFatalities,stageAnimations:CONTENT_STATS.stageAnimations,stageDirectorEvents:CONTENT_STATS.stageDirectorEvents,stageInteractions:CONTENT_STATS.stageInteractions,stageHazardLinks:CONTENT_STATS.stageHazardLinks,terrains:CONTENT_STATS.terrainProfiles,shiftStyles:CONTENT_STATS.shiftStyles,moves:CONTENT_STATS.moves,directCanonicalMoves:CONTENT_STATS.directCanonicalMoves,behaviorCompositeMoves:CONTENT_STATS.behaviorCompositeMoves,versusAdaptationMoves:CONTENT_STATS.versusAdaptationMoves,coverageComplete:coverageAudit().complete};
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
  const report={project:'SILENT HILL: HALO OF FLESH',version:VERSION,builtAt:new Date().toISOString(),content:CONTENT_STATS,combatRules:{traits:Object.keys(MANIFESTATION_TRAITS).length,afflictions:Object.keys(AFFLICTIONS).length,hazards:Object.keys(STAGE_HAZARDS).length,rituals:Object.keys(RITUAL_MODIFIERS).length,aiPersonalities:Object.keys(AI_PERSONALITIES).length,bossPhases:CONTENT_STATS.bossPhases,fatalities:CONTENT_STATS.fatalities,stageFatalities:CONTENT_STATS.stageFatalities,stageAnimations:CONTENT_STATS.stageAnimations,stageDirectorEvents:CONTENT_STATS.stageDirectorEvents,stageInteractions:CONTENT_STATS.stageInteractions,stageHazardLinks:CONTENT_STATS.stageHazardLinks,terrains:CONTENT_STATS.terrainProfiles,shiftStyles:CONTENT_STATS.shiftStyles,moves:CONTENT_STATS.moves,directCanonicalMoves:CONTENT_STATS.directCanonicalMoves,behaviorCompositeMoves:CONTENT_STATS.behaviorCompositeMoves,versusAdaptationMoves:CONTENT_STATS.versusAdaptationMoves,coverageComplete:CONTENT_STATS.coverageComplete},verified:verify,checks:result,files:manifest};
  await writeJson(join(dist,'build-manifest.json'),report);
  console.log(`Build v${VERSION}: ${files.length+1} fichiers → ${dist}`);
}
if(verify)console.log(`Vérification réussie: ${result.js} JS, ${result.html} HTML, ${ROSTER.length} combattants, ${STAGES.length} arènes, ${CHRONICLES.length} chroniques, ${CONTENT_STATS.fatalities} fatalités, ${CONTENT_STATS.stageAnimations} animations d’arène, ${CONTENT_STATS.stageDirectorEvents} événements de lieu.`);
