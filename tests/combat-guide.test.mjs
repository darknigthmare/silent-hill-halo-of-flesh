import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { buildGuideAssociations, validateGuideAssociations, renderGuideOutputs, ROOT } from '../scripts/build-combat-guide.mjs';
import { ROSTER, STAGES, CHRONICLES } from '../src/data.js';

const result = buildGuideAssociations();
const byId = new Map(result.associations.records.filter(r => r.kind === 'profile').map(r => [r.id, r]));

test('guide links resolve and generated outputs match the reviewed source data', () => {
  assert.deepEqual(validateGuideAssociations(result), []);
  for (const [name, content] of Object.entries(renderGuideOutputs(result))) {
    const digest = value => createHash('sha256').update(value).digest('hex');
    assert.equal(digest(readFileSync(resolve(ROOT, 'docs/combat-guide', name))), digest(content), name);
  }
  assert.equal(result.status.counts.profiles, ROSTER.length);
  assert.equal(result.status.counts.stages, STAGES.length);
  assert.equal(result.status.counts.chronicles, CHRONICLES.length);
});

test('consultable dossiers never become combat encounters through association', () => {
  const excluded = [...byId.values()].filter(r => !r.details.combatEnabled);
  assert.ok(excluded.length > 0);
  assert.ok(excluded.every(r => !r.details.story.hasPlayableEncounters && r.details.story.encounters.length === 0));
  const corrupt = structuredClone(result);
  const dossier = corrupt.associations.records.find(r => r.kind === 'profile' && !r.details.combatEnabled);
  dossier.details.story.hasPlayableEncounters = true;
  assert.ok(validateGuideAssociations(corrupt).some(e => e.includes('Noncombat story enabled')));
});

test('Lisa admission remains distinct from her empty individual story and Chronicle encounter', () => {
  const lisa = byId.get('pt_lisa_149').details;
  assert.equal(lisa.combatEnabled, true);
  assert.equal(lisa.story.hasPlayableEncounters, false);
  const chronicle = result.associations.records.find(r => r.kind === 'chronicle' && r.id === 'loop_204863');
  assert.ok(chronicle.details.playableFighterIds.includes('pt_lisa_149'));
});

test('variant labels and film grouping cannot silently establish exact edition identity', () => {
  for (const record of byId.values()) {
    const source = ROSTER.find(f => f.id === record.id);
    assert.equal(record.details.variantOfLabel, source.variantOf || null);
    assert.equal(record.details.variantBaseId, source.reference?.baseId || null);
    if (source.source === 'film') assert.match(record.details.story.editionScope, /agrégé/);
  }
  const mismatch = result.associations.issues.find(i => i.id === 'sh3_memory_of_alessa_049');
  assert.equal(mismatch.type, 'profile-stage-source-mismatch');
  assert.equal(mismatch.assignedStageId, 'lakeside_amusement');
  assert.notEqual(mismatch.effectiveStageId, mismatch.assignedStageId);
});

test('guide coverage and attachment integrity reject missing sections or changed source', () => {
  const fewer = structuredClone(result);
  fewer.requirements.sections.splice(15, 1);
  assert.ok(validateGuideAssociations(fewer).some(e => e.includes('sections 00–67')));
  const changed = structuredClone(result);
  changed.associations.sourceSHA256 = '0'.repeat(64);
  assert.ok(validateGuideAssociations(changed).includes('Original attachment hash mismatch.'));
});

test('an unknown rival or projectile command cannot be published as a valid binding', () => {
  const rival = structuredClone(result);
  rival.associations.records.find(r => r.kind === 'profile').details.story.rivalId = 'missing-profile';
  assert.ok(validateGuideAssociations(rival).some(e => e.includes('Unknown rival')));
  const projectile = structuredClone(result);
  projectile.associations.records.find(r => r.kind === 'projectile').details.slots.push('missing-command');
  assert.ok(validateGuideAssociations(projectile).some(e => e.includes('Unknown projectile slot')));
});

test('presentation shifts and authored finisher timelines are counted in their own units', () => {
  const stageRecords = result.associations.records.filter(r => r.kind === 'stage');
  assert.equal(result.status.counts.crossStageRuntimeLinks, 0);
  assert.ok(stageRecords.some(r => r.details.otherworldShiftEnabled));
  assert.ok(stageRecords.every(r => r.details.connectedStageIds.length === 0));
  assert.ok(result.status.counts.fighterFinishersAuthored < result.status.counts.fighterFinisherDefinitions);
  assert.equal(result.status.counts.newAnimationsProducedThisPass, 0);
  const produced = result.status.currentPass;
  assert.equal(result.status.counts.newStaticImagesProducedThisPass,
    produced.staticCharacterPoses + produced.staticProjectileImages + produced.staticStageLayers + produced.individualStoryIllustrations);
});

test('individual narrative art belongs to its exact profile and extends the image inventory', () => {
  const art=byId.get('sh1_air_screamer_001').details.story.artwork;
  assert.equal(art.source,'sh1');assert.equal(art.stageId,'old_silent_hill');
  assert.deepEqual(art.illustrations.map(i=>i.moment),['intro','ending']);
  assert.equal(byId.get('bom_air_screamer_121').details.story.artwork,null);
  assert.equal(result.status.counts.individualStoriesWithArtwork,1);
  assert.equal(result.status.counts.individualStoryIllustrationFiles,2);
  assert.equal(result.status.counts.associations,
    ROSTER.length + STAGES.length + CHRONICLES.length + result.status.counts.corpusEntries + result.status.counts.projectileBitmapDefinitions);
  const corrupt=structuredClone(result);
  corrupt.associations.records.find(r=>r.id==='sh1_air_screamer_001'&&r.kind==='profile').details.story.artwork.source='bom';
  assert.ok(validateGuideAssociations(corrupt).some(e=>e.includes('Story artwork source mismatch')));
});

test('extensions keep original sources and distinguish documented acceptance from executed gameplay', () => {
  assert.equal(result.requirements.baseSectionCount, 30);
  assert.equal(result.requirements.extensionSectionCount, 38);
  assert.equal(result.requirements.sections.length, 68);
  assert.equal(result.requirements.extensionAcceptanceTests.length, 40);
  assert.equal(result.status.counts.extensionAcceptanceScenariosExecuted, 0);
  const changed = structuredClone(result);
  changed.associations.sourceFiles[1].sha256 = '0'.repeat(64);
  assert.ok(validateGuideAssociations(changed).includes('Guide or extension source integrity mismatch.'));
  const inventedRun = structuredClone(result);
  inventedRun.requirements.extensionAcceptanceTests[0].status = 'passed';
  assert.ok(validateGuideAssociations(inventedRun).some(error => error.includes('Acceptance execution without evidence')));
  const missingTest = structuredClone(result);
  missingTest.requirements.extensionAcceptanceTests.splice(18, 1);
  assert.ok(validateGuideAssociations(missingTest).some(error => error.includes('18 extension 01 and 22 extension 02')));
});

test('an extension section cannot be silently attributed to the wrong source or omit its entity links', () => {
  const changed = structuredClone(result);
  changed.requirements.sections.find(section => section.section === '50').sourceFile = result.requirements.sourceFile;
  assert.ok(validateGuideAssociations(changed).some(error => error.includes('Extension section source mismatch')));
  for (const kind of ['profile', 'stage', 'chronicle', 'corpus', 'projectile']) {
    const sections = result.requirements.sections.filter(section => section.entityKinds.includes(kind)).map(section => section.section);
    assert.ok(sections.some(section => Number(section) >= 30), kind);
    assert.ok(result.associations.records.filter(record => record.kind === kind).every(record => JSON.stringify(record.guideSections) === JSON.stringify(sections)));
  }
});

test('extension examples keep concrete identities, roles and documentary links separate', () => {
  assert.equal(result.status.counts.extensionExampleRecords, 48);
  assert.equal(result.status.counts.extensionTemplateFamilies, 16);
  assert.ok(byId.get('sh1_air_screamer_001').extensionExampleIds.includes('SHCGX_TAUNT_AIR'));
  assert.ok(!byId.get('bom_air_screamer_121').extensionExampleIds.includes('SHCGX_TAUNT_AIR'));
  const missing = structuredClone(result);
  missing.extensionExamples.records[0].fighterIds.push('SHC_CAM_01');
  assert.ok(validateGuideAssociations(missing).some(error => error.includes('Unknown extension example fighter')));
  const role = structuredClone(result);
  const wall = role.extensionExamples.records.find(example => example.id === 'SHCGX_TAUNT_WALL');
  wall.referenceEvidence[0].role = 'combatant';
  assert.ok(validateGuideAssociations(role).some(error => error.includes('edition or role mismatch')));
  const link = structuredClone(result);
  link.extensionExamples.records.find(example => example.kind === 'assist').teamProfileId = 'missing-team';
  assert.ok(validateGuideAssociations(link).some(error => error.includes('Unknown extension example link')));
  const knownWrongOwner = structuredClone(result);
  knownWrongOwner.extensionExamples.records.find(example => example.id === 'SHCGX_TAUNT_AIR').fighterIds = ['bom_air_screamer_121'];
  assert.ok(validateGuideAssociations(knownWrongOwner).some(error => error.includes('Extension example evidence owner mismatch')));
  const knownWrongBinding = structuredClone(result);
  knownWrongBinding.associations.records.find(record => record.kind === 'profile' && record.id === 'bom_air_screamer_121').extensionExampleIds.push('SHCGX_TAUNT_AIR');
  assert.ok(validateGuideAssociations(knownWrongBinding).some(error => error.includes('Extension example binding mismatch')));
});
