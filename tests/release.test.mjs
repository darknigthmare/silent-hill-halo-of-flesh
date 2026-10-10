import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VERSION, CONTENT_STATS, MANIFESTATION_TRAITS, AFFLICTIONS, STAGE_HAZARDS, AI_PERSONALITIES, RITUAL_MODIFIERS, coverageAudit } from '../src/data.js';

const project=resolve(fileURLToPath(new URL('../',import.meta.url)));
const read=(path)=>readFile(resolve(project,path),'utf8');

async function exists(path){try{await stat(resolve(project,path));return true;}catch{return false;}}

test('release version is synchronized across package, UI and service worker',async()=>{
  const pkg=JSON.parse(await read('package.json'));
  const index=await read('index.html');
  const worker=await read('service-worker.js');
  assert.equal(pkg.version,VERSION);
  assert.match(index,new RegExp(`v${VERSION.replaceAll('.','\\.')}`));
  assert.match(worker,new RegExp(`halo-of-flesh-v${VERSION.replaceAll('.','\\.')}`));
});

test('exported JSON mirrors the runtime catalogue',async()=>{
  const stats=JSON.parse(await read('data/content-stats.json'));
  const rules=JSON.parse(await read('data/combat-rules.json'));
  assert.deepEqual(stats,CONTENT_STATS);
  assert.equal(rules.version,VERSION);
  assert.deepEqual(rules.traits,MANIFESTATION_TRAITS);
  assert.deepEqual(rules.afflictions,AFFLICTIONS);
  assert.deepEqual(rules.hazards,STAGE_HAZARDS);
  assert.deepEqual(rules.rituals,RITUAL_MODIFIERS);
  assert.deepEqual(rules.aiPersonalities,AI_PERSONALITIES);
  const coverage=JSON.parse(await read('data/coverage-audit.json'));
  const fatalities=JSON.parse(await read('data/fatalities.json'));
  assert.deepEqual(coverage,coverageAudit());
  assert.equal(fatalities.fighters.length,CONTENT_STATS.fighters);
  assert.equal(fatalities.stages.length,CONTENT_STATS.stages);
});

test('generated documentation contains the live totals and rule families',async()=>{
  const roster=await read('docs/ROSTER.md');
  const matrix=await read('docs/FIDELITY_MATRIX.md');
  const systems=await read('docs/COMBAT_SYSTEMS.md');
  const coverage=await read('docs/COVERAGE_AUDIT.md');
  const fatalities=await read('docs/FATALITIES_AND_STAGES.md');
  assert.match(roster,new RegExp(`${CONTENT_STATS.fighters} manifestations`));
  assert.match(matrix,new RegExp(`${CONTENT_STATS.stages} arènes`));
  assert.match(systems,new RegExp(`${Object.keys(MANIFESTATION_TRAITS).length} traits`));
  assert.match(systems,new RegExp(`${Object.keys(AFFLICTIONS).length} afflictions`));
  assert.match(systems,new RegExp(`${Object.keys(STAGE_HAZARDS).length} dangers`));
  assert.match(systems,new RegExp(`${Object.keys(RITUAL_MODIFIERS).length} rites`));
  assert.match(systems,new RegExp(`${Object.keys(AI_PERSONALITIES).length} personnalités IA`));
  assert.match(systems,new RegExp(`${CONTENT_STATS.bossPhases} transitions de boss`));
  assert.match(coverage,/COMPLET DANS LE PÉRIMÈTRE DÉFINI/);
  assert.match(fatalities,new RegExp(`${CONTENT_STATS.fatalities} fatalités de combattant`));
  assert.match(fatalities,new RegExp(`${CONTENT_STATS.stageAnimations} animations de stage`));
});

test('service worker shell only references existing local files',async()=>{
  const worker=await read('service-worker.js');
  const shell=worker.match(/const SHELL=\[([\s\S]*?)\];/)?.[1]||'';
  const refs=[...shell.matchAll(/['"]([^'"]+)['"]/g)].map(match=>match[1]);
  assert.ok(refs.length>=20);
  for(const ref of refs){
    if(ref==='/')continue;
    assert.equal(await exists(ref.replace(/^\//,'')),true,`Missing service-worker shell file: ${ref}`);
  }
});

test('primary pages expose the expected accessible application landmarks',async()=>{
  const index=await read('index.html');
  const versus=await read('modules/unified-versus.html');
  const chronicles=await read('modules/chronicles.html');
  const archive=await read('modules/archive.html');
  for(const html of [index,versus,chronicles,archive]){
    assert.match(html,/<html lang="fr">/);
    assert.match(html,/<title>[^<]+<\/title>/);
  }
  assert.match(index,/aria-label="Menu principal"/);
  assert.match(versus,/id="game"/);
  assert.match(versus,/id="fatalities"/);
  assert.match(versus,/id="stageAnimations"/);
  assert.match(chronicles,/id="routeList"/);
  assert.match(archive,/id="systemsTab"/);
});
