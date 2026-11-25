import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildGuideAssociations, validateGuideAssociations, renderGuideOutputs, ROOT } from '../scripts/build-combat-guide.mjs';
import { ROSTER, STAGES, CHRONICLES } from '../src/data.js';

const result = buildGuideAssociations();
const byId = new Map(result.associations.records.filter(r => r.kind === 'profile').map(r => [r.id, r]));

test('guide links resolve and generated outputs match the reviewed source data', () => {
  assert.deepEqual(validateGuideAssociations(result), []);
  for (const [name, content] of Object.entries(renderGuideOutputs(result))) {
    assert.equal(readFileSync(resolve(ROOT, 'docs/combat-guide', name), 'utf8'), content, name);
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
  assert.ok(validateGuideAssociations(fewer).some(e => e.includes('sections 00–29')));
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
  assert.equal(result.status.currentPass.assets, 'no-new-art');
});
