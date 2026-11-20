/** Read-only reconciliation proof. This does not replay historical QA. */
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROSTER, createCombatProfile } from '../../../src/data.js';
import { SPRITES } from '../../../src/sprite-manifest.js';
import { SpriteCache, combatSpriteFor } from '../../../src/sprite-system.js';

const root = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const folder = resolve(root, 'docs/production/vague24-recovery');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const read = path => readFile(resolve(root, path));
const json = async path => JSON.parse(await read(path));
const git = args => execFileSync('git', args, { cwd: root, maxBuffer: 32 * 1024 * 1024 });
const A = 'aa97ffba2c6ca0b6d6bdc61ee1c17dc091933231';
const B = 'c0eea6d1185cee0575c407aaf1e5854e9077db10';
const ARCHIVE = '6757168e36aaf9e99d5889197da05a28abd7c698';
const ids = ['bom_gray_child_147', 'bom_raw_shock_148'];
const report = {
  schema: 1, wave: 24, generatedAt: new Date().toISOString(),
  purpose: 'Verify exact recovery bytes, the two selected B entries, retained A art, and untouched gameplay/source contracts.',
  sourceCommits: { A, B, archive: ARCHIVE }, checks: [],
  historicalTestsRerun: false, newImageGeneration: false,
  limits: ['No browser, visual gameplay or full project suite is run by this verifier.',
    'The original A and B QA reports retain their original dates and scopes.',
    'Native images remain static candidates with unverified fidelity.'],
  passed: false,
};
const check = (name, ok, detail) => {
  report.checks.push({ name, passed: !!ok, ...(detail === undefined ? {} : { detail }) });
  if (!ok) throw Error(name);
};
try {
  const manifest = await json('docs/production/vague24-recovery/recovery-manifest.json');
  for (const entry of manifest.files) {
    const bytes = await read(entry.path);
    check('Exact retained recovery bytes: ' + entry.path,
      bytes.length === entry.bytes && hash(bytes) === entry.sha256);
  }
  report.recovery = manifest.counts;
  const before = JSON.parse(git(['show', A + ':art/registry.json'])).assets;
  const current = (await json('art/registry.json')).assets;
  const changed = Object.keys(current).filter(id => JSON.stringify(current[id]) !== JSON.stringify(before[id])).sort();
  check('Only the two unique B registry entries change from A', JSON.stringify(changed) === JSON.stringify(ids), changed);
  check('All existing profile IDs remain', JSON.stringify(Object.keys(before).sort()) === JSON.stringify(Object.keys(current).sort()));
  const priorFrames = [...new Map(Object.values(before).flatMap(a => [...a.frames, a.portrait].filter(Boolean)).map(f => [f.path, f])).values()];
  for (const frame of priorFrames) {
    const bytes = await read(frame.path);
    if (bytes.length !== frame.bytes || hash(bytes) !== frame.sha256) throw Error('Prior native sprite changed: ' + frame.path);
  }
  check('Every A sprite remains byte-identical', true, { files: priorFrames.length });
  for (const id of ids) {
    check('Historical portrait and clip semantics preserved: ' + id,
      JSON.stringify(current[id].portrait) === JSON.stringify(before[id].portrait) &&
      JSON.stringify(current[id].clips) === JSON.stringify(before[id].clips) &&
      current[id].animatedClips === before[id].animatedClips &&
      JSON.stringify(current[id].frames.slice(1)) === JSON.stringify(before[id].frames.slice(1)));
    check('Recovered profile is a static, separate candidate: ' + id,
      current[id].combatView === 'side-view-candidate' && current[id].fidelity === 'unverified' &&
      current[id].frames[0].path !== current[id].portrait.path && current[id].animatedClips === 0 &&
      createCombatProfile(ROSTER.find(f => f.id === id)).referencePolicy.combatEnabled === true);
  }
  for (const path of ['src/stage-bitmap-manifest.js', 'docs/production/SILENT_HILL_CORPUS_BIBLE.xlsx',
    'docs/production/sprite-wave23-imports-2026-11-19.json', 'docs/production/vague23/final-audit.json',
    'docs/production/vague23/RAPPORT_VAGUE23_PERSONNAGES_STAGES.md']) {
    check('A source/evidence retained without rewriting: ' + path, (await read(path)).equals(git(['show', A + ':' + path])));
  }
  const baseline = await json('docs/production/vague23/scope-baseline.json');
  for (const entry of baseline.protectedFiles) {
    const bytes = await read(entry.path);
    check('Protected roster/gameplay/source unchanged: ' + entry.path,
      bytes.length === entry.bytes && hash(bytes) === entry.sha256);
  }
  const journal = await json('docs/production/sprite-wave24-imports-2026-11-19.json');
  check('Recovery journal has exactly two entries', journal.imports.length === 2 &&
    JSON.stringify(journal.imports.map(x => x.fighterId).sort()) === JSON.stringify(ids));
  for (const row of journal.imports) {
    check('Recovered native PNG and journal agree: ' + row.fighterId,
      row.path === current[row.fighterId].frames[0].path && hash(await read(row.path)) === row.sha256 &&
      row.sha256 === row.sourceSHA256 && row.certifiedOneToOne === false);
    check('New provenance is self-contained and intact: ' + row.fighterId,
      hash(await read(row.provenance)) === row.provenanceSHA256 &&
      hash(await read(row.importReceipt.path)) === row.importReceipt.sha256);
  }
  const coverage = await json('data/sprite-coverage.json');
  report.coverage = Object.fromEntries(Object.entries(coverage).filter(([k, v]) => typeof v !== 'object'));
  check('Recovered union coverage', coverage.combatSideViewCandidates === 161 && coverage.combatLegacyUnreviewed === 32 &&
    coverage.selectionAvailable === 204 && coverage.combatMissing === 37 && coverage.selectionMissing === 26 &&
    coverage.separateSelectionAndCombat === 162 && coverage.animatedClips === 6 && coverage.certified === 0, report.coverage);
  const cache = new SpriteCache();
  let checkedPairs = 0;
  for (const id of ids) for (const fighter of ROSTER) {
    if (!createCombatProfile(fighter).referencePolicy.combatEnabled) continue;
    const arts = [combatSpriteFor(ROSTER.find(f => f.id === id), SPRITES), combatSpriteFor(fighter, SPRITES)];
    if (arts.every(Boolean)) { cache.validatePins(arts.flatMap(a => a.frames)); checkedPairs++; }
  }
  check('Recovered candidates fit current duel cache with every illustrated opponent', cache.maxBytes === 64 * 1024 * 1024, { checkedPairs });
  report.passed = true;
} catch (error) {
  report.failure = String(error.stack || error);
  process.exitCode = 1;
}
await writeFile(resolve(folder, 'reconciliation-assertions.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ passed: report.passed, checks: report.checks.length, coverage: report.coverage, failure: report.failure }));
