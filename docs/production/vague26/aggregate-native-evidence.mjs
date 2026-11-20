/** Revalidate retained native QA against the final assets, without recounting old runs.
 * Repeat --character-run=DIR; supply --stage-run=DIR, optionally --air-run=DIR,
 * and --out=NEW.json. This audits evidence; it does not render another capture.
 */
import { readFile, writeFile, access, mkdir } from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { SPRITES } from '../../../src/sprite-manifest.js';
import { getStage } from '../../../src/data.js';
import { stageBitmapFor } from '../../../src/stage-bitmaps.js';

const root = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const option = name => process.argv.find(x => x.startsWith('--' + name + '='))?.slice(name.length + 3);
const options = name => process.argv.filter(x => x.startsWith('--' + name + '=')).map(x => x.slice(name.length + 3));
const characterRuns = options('character-run');
if (!characterRuns.length || !option('stage-run') || !option('stage-ids') || !option('out')) throw Error('Explicit completed runs and a fresh output are required.');
const out = resolve(option('out'));
try { await access(out); throw Error('Preserve the prior aggregation; choose a fresh output.'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const jsonHash = value => hash(JSON.stringify(value));
const read = async path => JSON.parse(await readFile(path, 'utf8'));
const repositoryPath = path => {
  const marker = path.indexOf('docs/production/');
  const resolved = marker >= 0 ? resolve(root, path.slice(marker)) : resolve(root, path);
  if (relative(root, resolved).startsWith('..')) throw Error('Evidence must be retained in the repository: ' + path);
  return resolved;
};
const report = {
  schema: 1, wave: 26, createdAt: new Date().toISOString(), passed: false,
  method: 'SHA256 validation of each successful process, tested manifest entry, source module, asset, capture and visual-review record against the final tree. No new render or test execution is counted.',
  browserTest: false, httpTest: false, actorStateInjected: false,
  checks: [], runs: [], visualReviews: [], totals: {},
  limits: [
    'Native Canvas does not exercise Chromium, DOM/CSS, HTTP, browser keyboard delivery or service-worker behavior.',
    'Whole-catalogue hashes may differ after independent imports; every entry actually used by a process and every renderer/gameplay module must still match exactly.',
    'Visual acceptance is limited to the explicitly recorded captures; fidelity and original animation timing remain unverified.'
  ]
};
const check = (name, ok, detail) => {
  report.checks.push({ name, passed: !!ok, ...(detail === undefined ? {} : { detail }) });
  if (!ok) throw Error(name);
};
const runs = characterRuns.map(path => ({ kind: 'characters', path, harness: 'qa-characters-native.mjs' }));
for(const path of options('stage-run'))runs.push({ kind: 'stages', path, harness: 'qa-stages-native.mjs' });
if (option('air-run')) runs.push({ kind: 'air', path: option('air-run'), harness: 'qa-air-screamer-native.mjs' });
const cataloguePaths = new Set(['art/registry.json', 'src/sprite-manifest.js', 'src/stage-bitmap-manifest.js']);
const captured = new Map(), processReports = new Map(), viewed = new Set();
const testedCharacters = new Set(), testedStages = new Set(), reviewedCharacters = new Set(), reviewedStages = new Set();
let processCount = 0, automatedChecks = 0, combatCases = 0, stageCases = 0, referencePreviews = 0;

try {
  const journalPath = resolve(root, 'docs/production/sprite-wave26-imports-2026-11-20.json');
  const journalRaw = await readFile(journalPath), journal = JSON.parse(journalRaw);
  for (const run of runs) {
    const directory = repositoryPath(run.path), harnessPath = resolve(root, 'docs/production/vague26', run.harness);
    const harnessSHA256 = hash(await readFile(harnessPath));
    let summary = null, observations;
    try {
      summary = await read(resolve(directory, 'process-summary.json'));
      check('Run completed successfully: ' + run.path, summary.passed === true && summary.processes.length > 0);
      observations = summary.processes.map(process => ({ process, directory: resolve(directory, process.id) }));
    } catch (error) {
      if (error.code !== 'ENOENT' || run.kind !== 'air') throw error;
      // The dedicated Air harness may be invoked as one direct process.
      const process = await read(resolve(directory, 'process-observation.json'));
      observations = [{ process, directory }];
    }
    const runRow = { kind: run.kind, path: relative(root, directory), processes: [], generatedCaptures: 0, automatedChecks: 0 };
    for (const observation of observations) {
      const { process } = observation;
      const path = resolve(observation.directory, 'report.json'), raw = await readFile(path), result = JSON.parse(raw);
      const reportSHA256 = hash(raw);
      check('Successful observed process: ' + relative(root, path), process.exitCode === 0 && process.timeout === false && process.reportSHA256 === reportSHA256 && result.passed === true && result.actorStateInjected === false && result.browserTest === false && (result.errors || []).length === 0);
      check('Exact QA harness: ' + relative(root, path), result.harnessSHA256 === harnessSHA256);
      check('Every recorded assertion passed: ' + relative(root, path), Array.isArray(result.checks) && result.checks.length > 0 && result.checks.every(c => c.passed === true));
      check('Tested sprite and stage hashes are present: ' + relative(root, path), Object.keys(result.testedSpriteEntryHashes || {}).length > 0 && Object.keys(result.testedStageEntryHashes || {}).length > 0);
      for (const [id, expected] of Object.entries(result.testedSpriteEntryHashes)) check('Final tested sprite: ' + id, !!SPRITES[id] && jsonHash(SPRITES[id]) === expected);
      for (const [id, expected] of Object.entries(result.testedStageEntryHashes)) check('Final tested stage: ' + id, jsonHash(stageBitmapFor(getStage(id))) === expected);
      for (const [path, versions] of Object.entries(result.sourceHashes)) {
        check('Source stayed read-only during process: ' + path, versions.before === versions.after);
        if (!cataloguePaths.has(path)) check('Final renderer/gameplay module is still exact: ' + path, hash(await readFile(resolve(root, path))) === versions.after);
      }
      for (const asset of result.assets) {
        const bytes = await readFile(resolve(root, asset.path));
        check('Final tested PNG is exact: ' + asset.path, bytes.length === asset.bytes && hash(bytes) === asset.sha256);
      }
      for (const capture of result.captures) {
        const path = resolve(observation.directory, capture.file), bytes = await readFile(path);
        check('Retained capture is exact: ' + relative(root, path), !captured.has(path) && hash(bytes) === capture.sha256 && bytes.length === capture.bytes && bytes.readUInt32BE(16) === capture.width && bytes.readUInt32BE(20) === capture.height);
        captured.set(path, { ...capture, reportPath: relative(root, resolve(observation.directory, 'report.json')) });
      }
      processReports.set(path, { sha256: reportSHA256,
        characterIds: run.kind === 'stages' ? [] : run.kind === 'air' ? [result.fighterId] : [...result.combatIds, ...result.referenceOnlyIds],
        stageIds: run.kind === 'stages' ? result.stageIds : [] });
      processCount++; automatedChecks += result.checks.length;
      if (run.kind === 'stages') {
        stageCases += result.cases.length;
        for (const id of result.stageIds) testedStages.add(id);
      } else {
        combatCases += result.cases.length;
        referencePreviews += (result.rendererPreviews || []).length;
        const ids = run.kind === 'air' ? ['sh1_air_screamer_001'] : [...result.combatIds, ...result.referenceOnlyIds];
        for (const id of ids) { check('Each updated character has one successful process: ' + id, !testedCharacters.has(id)); testedCharacters.add(id); }
      }
      runRow.automatedChecks += result.checks.length;
      runRow.generatedCaptures += result.captures.length;
      runRow.processes.push({ path: relative(root, path), sha256: reportSHA256, assertions: result.checks.length, captures: result.captures.length });
    }
    if (summary) {
      check('Process summary counts match the underlying reports: ' + run.path,
        summary.successfulProcesses === observations.length && summary.checksInSuccessfulProcesses === runRow.automatedChecks && summary.capturesInSuccessfulProcesses === runRow.generatedCaptures);
    }
    report.runs.push(runRow);

    const reviewPath = resolve(directory, 'visual-review.json'), reviewRaw = await readFile(reviewPath), review = JSON.parse(reviewRaw);
    check('Visual review lists accepted entries: ' + run.path, Array.isArray(review.entries) && review.entries.length > 0);
    if (review.importEvidence) {
      const expected = review.importEvidence.sha256;
      if (hash(journalRaw) !== expected) {
        const historicalRaw = await readFile(resolve(directory, 'import-journal-at-review.json')), historical = JSON.parse(historicalRaw);
        check('Earlier exact import journal remains verifiable: ' + run.path, hash(historicalRaw) === expected && historical.imports.every(old => journal.imports.some(current => current.fighterId === old.fighterId && jsonHash(current) === jsonHash(old))));
      }
    }
    let reviewedCaptureCount = 0;
    for (const entry of review.entries) {
      const isStage = run.kind === 'stages';
      check('Visual decision accepted: ' + (entry.stageId || entry.fighterId), isStage ? entry.accepted === true && entry.viewed === true : entry.decision === 'accepted-as-candidate');
      if (isStage) reviewedStages.add(entry.stageId); else reviewedCharacters.add(entry.fighterId);
      const path = repositoryPath(isStage ? entry.reportPath : entry.automatedReport);
      const boundReport = processReports.get(path);
      check('Visual decision is bound to its own process report', !!boundReport && boundReport.sha256 === (isStage ? entry.reportSHA256 : entry.automatedReportSHA256) && (isStage ? boundReport.stageIds.includes(entry.stageId) : boundReport.characterIds.includes(entry.fighterId)));
      const evidence = isStage ? [{ path: entry.capturePath, sha256: entry.captureSHA256 }] : entry.evidence;
      check('Visual review references actual captures', Array.isArray(evidence) && evidence.length >= (isStage ? 1 : 2));
      check('Visual evidence contains distinct captures', new Set(evidence.map(item => repositoryPath(item.path))).size === evidence.length);
      const facings = new Set(), airPoses = new Set();
      for (const item of evidence) {
        const capturePath = repositoryPath(item.path), capture = captured.get(capturePath);
        check('Viewed capture agrees with its own identity and report: ' + relative(root, capturePath), !!capture && capture.sha256 === item.sha256 && resolve(root, capture.reportPath) === path && (isStage ? capture.stageId === entry.stageId : capture.fighterId === entry.fighterId));
        const facing = capture.facing ?? capture.state?.facing;
        if (facing === 1 || facing === -1) facings.add(facing);
        if (run.kind === 'air' && [0, 1, 2].includes(capture.expectedFrameIndex)) airPoses.add(facing + ':' + capture.expectedFrameIndex);
        viewed.add(capturePath); reviewedCaptureCount++;
      }
      if (!isStage) check('Both observed orientations were visually reviewed: ' + entry.fighterId, facings.has(1) && facings.has(-1));
      if (run.kind === 'air') check('All three Air poses were visually reviewed in each orientation', [1, -1].every(facing => [0, 1, 2].every(index => airPoses.has(facing + ':' + index))));
      if (!isStage && entry.assetSHA256) check('Visually reviewed active candidate is still exact: ' + entry.fighterId, SPRITES[entry.fighterId].frames[0].sha256 === entry.assetSHA256);
    }
    report.visualReviews.push({ path: relative(root, reviewPath), sha256: hash(reviewRaw), entries: review.entries.length, capturesReferenced: reviewedCaptureCount });
  }
  const equalSets = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
  const expectedCharacters = new Set(journal.imports.map(item => item.fighterId));
  if (option('air-run')) expectedCharacters.add('sh1_air_screamer_001');
  check('All and only the updated characters were executed and visually reviewed', equalSets(expectedCharacters, testedCharacters) && equalSets(expectedCharacters, reviewedCharacters));
  const suppliedStageIds=option('stage-ids').split(',').filter(Boolean);
  check('Expected stage IDs are unique and nonempty', suppliedStageIds.length>0&&new Set(suppliedStageIds).size===suppliedStageIds.length);
  const expectedStages = new Set(suppliedStageIds);
  check('All and only the declared added stages were executed and visually reviewed', equalSets(expectedStages, testedStages) && equalSets(expectedStages, reviewedStages));
  report.totals = { processes: processCount, successfulProcesses: processCount, nativeAssertions: automatedChecks,
    characterCombatCases: combatCases, stageCases, referencePreviews, generatedCaptures: captured.size,
    capturesActuallyViewed: viewed.size, charactersReviewed: reviewedCharacters.size, stagesReviewed: reviewedStages.size };
  report.passed = true;
} catch (error) { report.failure = String(error.stack || error); process.exitCode = 1; }
report.completedAt = new Date().toISOString();
await mkdir(dirname(out), { recursive: true });
await writeFile(out, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ passed: report.passed, checks: report.checks.length, totals: report.totals, out, failure: report.failure }));
