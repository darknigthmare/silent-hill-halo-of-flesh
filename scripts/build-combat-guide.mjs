import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { ROSTER, STAGES, CHRONICLES, SOURCE_META, createCombatProfile } from '../src/data.js';
import { combatReferencePolicy } from '../src/combat-reference-policy.js';
import { storyPlan, stageIdFor } from '../src/tournament.js';
import { chronicleEncounterPlan } from '../src/run-progress.js';
import { SPRITES } from '../src/sprite-manifest.js';
import { STAGE_BITMAPS } from '../src/stage-bitmap-manifest.js';
import { PROJECTILE_BITMAPS } from '../src/projectile-bitmap-manifest.js';
import { projectileBitmapFor } from '../src/projectile-bitmaps.js';
import { chronicleArtwork } from '../src/chronicle-art.js';
import { storyArtwork } from '../src/story-art.js';
import { cinematicSummary } from '../src/lore-cinematics.js';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = 'docs/combat-guide';
const GUIDE_SHA256 = '4844584616072ac0d52d37c2fab4365e1ec489240f17a721ee216e223b0355b7';
const EXTENSION_SOURCES = [
  {path: `${OUTPUT}/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt`, sha256: '330fb7485a7a52b2a20f855646c940aaac0fcd9510032bc84b2e17c518edd25f', firstSection: 30, lastSection: 49},
  {path: `${OUTPUT}/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt`, sha256: '08b57ea542e83c487fef3276997a612d4657f2ee9ed4f8e46b0bf65a2778038b', firstSection: 50, lastSection: 67},
];
const readJSON = path => JSON.parse(readFileSync(resolve(ROOT, path), 'utf8'));
const digest = path => createHash('sha256').update(readFileSync(resolve(ROOT, path))).digest('hex');
const stableJSON = value => JSON.stringify(value, null, 2) + '\n';
const unique = values => [...new Set(values)];
const sum = values => values.reduce((a, b) => a + b, 0);
const groupCounts = values => Object.fromEntries(unique(values).sort().map(value => [value, values.filter(v => v === value).length]));
const escapeCell = value => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
const mdTable = (head, rows) => `| ${head.join(' | ')} |\n| ${head.map(() => '---').join(' | ')} |\n${rows.map(row => `| ${row.map(escapeCell).join(' | ')} |`).join('\n')}\n`;

function extensionExampleIdsFor(record, examples) {
  const field = {profile: 'fighterIds', stage: 'stageIds', chronicle: 'chronicleIds'}[record.kind];
  return examples.filter(example => field ? example[field].includes(record.id)
    : record.kind === 'projectile' && example.kind === 'projectile-policy'
      && example.moveRef?.fighterId === record.details.fighterId
      && record.details.slots.includes(example.moveRef.moveKey)).map(example => example.id);
}

export function loadGuideRequirements() {
  const base = readJSON(`${OUTPUT}/requirements.json`);
  const extensions = readJSON(`${OUTPUT}/extensions/requirements.json`);
  return {
    ...base,
    baseSectionCount: base.sections.length,
    extensionSectionCount: extensions.sections.length,
    sourceFiles: [
      {path: base.sourceFile, sha256: digest(base.sourceFile), firstSection: 0, lastSection: 29},
      ...EXTENSION_SOURCES.map(source => ({...source, sha256: digest(source.path)})),
    ],
    requirementFiles: [`${OUTPUT}/requirements.json`, `${OUTPUT}/extensions/requirements.json`],
    extensionSources: extensions.sources,
    sections: [...base.sections, ...extensions.sections],
    extensionAcceptanceTests: extensions.acceptanceTests,
    extensionExamplesFile: extensions.examplesFile,
    extensionScope: extensions.scope,
  };
}

export function buildGuideAssociations() {
  const requirements = loadGuideRequirements();
  const extensionExamples = readJSON(requirements.extensionExamplesFile);
  const corpus = readJSON('docs/production/franchise-corpus.json');
  const ids = new Set(ROSTER.map(f => f.id));
  const stages = new Map(STAGES.map(s => [s.id, s]));
  const guideSections = kind => requirements.sections.filter(s => s.entityKinds.includes(kind)).map(s => s.section);
  const profiles = new Map(ROSTER.map(f => [f.id, createCombatProfile(f)]));
  const files = new Set(execFileSync('git', ['ls-files', '-z'], {cwd: ROOT, encoding: 'utf8'}).split('\0').filter(Boolean));
  const issues = [];
  const records = [];

  for (const fighter of ROSTER) {
    const policy = combatReferencePolicy(fighter);
    const profile = profiles.get(fighter.id);
    const story = storyPlan(fighter.id);
    const storyArt = storyArtwork(fighter.id);
    const art = SPRITES[fighter.id];
    const assignedStage = stages.get(fighter.stageId);
    if (assignedStage?.source !== fighter.source) issues.push({type: 'profile-stage-source-mismatch', id: fighter.id, assignedStageId: fighter.stageId, effectiveStageId: stageIdFor(fighter), action: 'Relire le raccord de lieu et d’édition ; le repli runtime ne prouve pas sa fidélité narrative.'});
    if (policy.combatEnabled && !story.queue.length) issues.push({type: 'story-without-opponents', id: fighter.id, action: 'Profil admis mais aucun adversaire distinct dans son groupe source ; conserver le récit consultable.'});
    records.push({
      kind: 'profile', id: fighter.id, name: fighter.name, source: fighter.source,
      guideSections: guideSections('profile'), targetFile: 'data/roster.json',
      observedStatus: `${policy.combatEnabled ? 'admis au combat' : 'hors duel'} ; ${policy.role} ; ${art?.combatView || 'vue de combat non déclarée'}`,
      details: {
        edition: policy.edition || fighter.reference?.referenceEdition || null,
        role: policy.role, combatEnabled: policy.combatEnabled, boss: Boolean(fighter.boss),
        variantOfLabel: fighter.variantOf || null,
        variantBaseId: fighter.reference?.baseId || null,
        variantLinkStatus: fighter.reference?.baseId ? 'explicit-reference-id' : fighter.variantOf ? 'label-only; do not infer edition or identity' : 'not-a-declared-variant',
        referenceIds: policy.referenceIds || [],
        assignedStageId: fighter.stageId, effectiveStageId: stageIdFor(fighter),
        stageIdentityNeedsReview: assignedStage?.source !== fighter.source,
        movesetFile: 'data/movesets.json',
        moveKeys: Object.keys(profile.moves),
        enabledMoveKeys: Object.entries(profile.moves).filter(([, move]) => move.enabled !== false).map(([key]) => key),
        disabledMoveKeys: Object.entries(profile.moves).filter(([, move]) => move.enabled === false).map(([key]) => key),
        projectileMoveKeys: Object.entries(profile.moves).filter(([, move]) => move.enabled !== false && move.projectile).map(([key]) => key),
        projectileArtworkIds: Object.values(PROJECTILE_BITMAPS).filter(a => a.fighterId === fighter.id).map(a => a.id),
        finisherFile: 'data/fatalities.json',
        finisherIds: fighter.fatalities.map(f => f.id),
        authoredFinisherIds: fighter.fatalities.filter(f => cinematicSummary(f.id).authored).map(f => f.id),
        story: {
          format: story.format, generated: true,
          artwork: storyArt ? {source:storyArt.source,stageId:storyArt.stageId,status:storyArt.status,fidelity:storyArt.fidelity,composition:storyArt.composition,illustrations:['intro','rival','ending'].filter(moment=>storyArt[moment]).map(moment=>({moment,path:storyArt[moment].path}))} : null,
          hasPlayableEncounters: Boolean(policy.combatEnabled && story.queue.length),
          rawCandidateChapterCount: story.chapters.length,
          encounters: policy.combatEnabled ? story.chapters.map(c => ({fighterId: c.fighterId, stageId: c.stageId, rival: c.rival})) : [],
          rivalId: story.rivalId,
          relationshipStatus: 'rivalité de versus calculée ; non canonique par déduction',
          editionScope: fighter.source === 'film' ? 'groupe film agrégé ; édition à désambiguïser' : 'groupe source du moteur ; vérifier édition exacte',
          detailedRouteStatus: 'structure dérivée ; rédaction et illustrations individualisées non déduites de cette présence'
        },
        chronicleIds: CHRONICLES.filter(c => c.fighters.includes(fighter.id)).map(c => c.id),
        assetRegistry: 'art/registry.json',
        assets: {
          status: art?.status || 'missing', fidelity: art?.fidelity || 'unverified',
          combatView: art?.combatView || null,
          portraitPath: art?.portrait?.path || null,
          framePaths: unique((art?.frames || []).map(f => f.path)),
          animatedClipsDeclared: art?.animatedClips || 0,
          validationThisPass: 'links-only; no visual review'
        }
      }
    });
  }

  for (const stage of STAGES) {
    const art = STAGE_BITMAPS[stage.id];
    const frames = art ? [...(art.layers || []).flatMap(l => l.frames || []), ...(art.variants || []).flatMap(v => (v.layers || []).flatMap(l => l.frames || []))] : [];
    records.push({
      kind: 'stage', id: stage.id, name: stage.name, source: stage.source,
      guideSections: guideSections('stage'), targetFile: 'data/stages.json',
      observedStatus: `${art ? 'bitmap candidat référencé' : 'sans bitmap de stage'} ; ${stage.referencePolicy?.worldState || 'état à vérifier'}`,
      details: {
        referenceIds: stage.reference?.referenceIds || [],
        locationStatus: stage.reference?.locationStatus || null,
        assignedFighterIds: ROSTER.filter(f => f.stageId === stage.id).map(f => f.id),
        effectiveFighterIds: ROSTER.filter(f => stageIdFor(f) === stage.id).map(f => f.id),
        chronicleIds: CHRONICLES.filter(c => c.stages.includes(stage.id)).map(c => c.id),
        finisherId: stage.fatality?.id || null,
        finisherAuthored: stage.fatality ? Boolean(cinematicSummary(stage.fatality.id).authored) : false,
        presentation: {referenceTrackIds: (stage.referenceTracks || []).map(t => t.id), framePaths: unique(frames.map(f => f.path)), status: art?.status || 'missing', fidelity: art?.fidelity || 'unverified'},
        interactions: (stage.interactions || []).map(i => ({id: i.id || null, event: i.event || null, trigger: i.trigger || null})),
        allowedEventIds: stage.director?.events || [],
        allowedHazardIds: stage.director?.hazardDeck || [],
        otherworldShiftEnabled: stage.shift?.enabled === true,
        connectedStageIds: [],
        connectionStatus: 'No cross-stage runtime transition observed; Otherworld changes the same stage.',
        validationThisPass: 'metadata-and-links-only'
      }
    });
  }

  for (const chronicle of CHRONICLES) {
    const plan = chronicleEncounterPlan(chronicle.id);
    const artwork = chronicleArtwork(chronicle.id) || {};
    records.push({
      kind: 'chronicle', id: chronicle.id, name: chronicle.title, source: chronicle.source,
      guideSections: guideSections('chronicle'), targetFile: 'data/chronicles.json',
      observedStatus: plan.queue.length ? `${plan.queue.length} rencontres ; ${plan.referenceDossiers.length} dossiers` : 'dossiers consultables ; aucun parcours de combat',
      details: {
        fighterIds: chronicle.fighters, stageIds: chronicle.stages,
        playableFighterIds: plan.queue, encounterStageIds: plan.stages,
        referenceDossiers: plan.referenceDossiers,
        illustrationFile: 'src/chronicle-art.js',
        illustrations: Object.entries(artwork).map(([moment, art]) => ({moment, path: art.path, fighterId: art.fighterId || null})),
        narrativeStatus: 'chronique existante ; distincte de la campagne globale conçue',
        validationThisPass: 'links-only; no new gameplay or visual recipe'
      }
    });
  }

  for (const record of corpus.records) {
    records.push({
      kind: 'corpus', id: record.id, name: record.title, source: (record.runtimeSourceIds || []).join(', '),
      guideSections: guideSections('corpus'), targetFile: 'docs/production/franchise-corpus.json',
      observedStatus: `${record.bibleStatus || 'indexed'} ; ${record.category} ; ${record.generationEligibility}`,
      details: {category: record.category, sourceUrls: record.sourceUrls || [], runtimeSourceIds: record.runtimeSourceIds || [], runtimeProfileIds: record.runtimeProfileIds || [], runtimeStageIds: record.runtimeStageIds || [], nextAction: record.nextAction, sourceAuditAsOf: corpus.asOf, publicationDatesReverifiedThisPass: false}
    });
  }

  for (const art of Object.values(PROJECTILE_BITMAPS)) {
    const fighter = ROSTER.find(f => f.id === art.fighterId);
    const moves = profiles.get(art.fighterId)?.moves || {};
    records.push({
      kind: 'projectile', id: art.id, name: `${fighter?.name || art.fighterId} — ${art.id}`, source: art.source,
      guideSections: guideSections('projectile'), targetFile: 'src/projectile-bitmap-manifest.js',
      observedStatus: `${art.status} ; ${art.fidelity} ; image fixe`,
      details: {fighterId: art.fighterId, slots: art.slots, effectiveSlots: art.slots.filter(key => moves[key]?.enabled !== false && projectileBitmapFor(fighter, moves[key])?.id === art.id), referenceIds: art.referenceIds, path: art.frame.path, validationThisPass: 'owner-slot-file-links-only'}
    });
  }

  for (const record of records) record.extensionExampleIds = extensionExampleIdsFor(record, extensionExamples.records);

  const assetPaths = unique(records.flatMap(r => r.kind === 'profile' ? [r.details.assets.portraitPath, ...r.details.assets.framePaths, ...(r.details.story.artwork?.illustrations || []).map(i=>i.path)] : r.kind === 'stage' ? r.details.presentation.framePaths : r.kind === 'chronicle' ? r.details.illustrations.map(i => i.path) : r.kind === 'projectile' ? [r.details.path] : []).filter(Boolean));
  const missingAssetPaths = assetPaths.filter(path => !files.has(path) && !existsSync(resolve(ROOT, path)));
  const sourcePaths = ['src/data.js', 'src/movesets.js', 'src/combat-reference-policy.js', 'src/production-reference.js', 'src/tournament.js', 'src/run-progress.js', 'src/lore-cinematics.js', 'src/chronicle-art.js', 'src/story-art.js', 'src/sprite-manifest.js', 'src/stage-director.js', 'src/stage-lore-policy.js', 'src/stage-reference-policy.js', 'src/stage-bitmap-manifest.js', 'src/projectile-bitmap-manifest.js', 'src/projectile-bitmaps.js', 'art/registry.json', 'data/roster.json', 'data/movesets.json', 'data/fatalities.json', 'data/stages.json', 'data/chronicles.json', 'docs/production/franchise-corpus.json', ...requirements.requirementFiles, requirements.extensionExamplesFile];
  const metadata = {schemaVersion: 2, asOf: requirements.asOf, baselineCommit: requirements.baselineCommit, sourceFile: requirements.sourceFile, sourceSHA256: digest(requirements.sourceFile), sourceFiles: requirements.sourceFiles, note: 'Associations de conception et inventaire observé. Les trois textes sources sont vérifiés par leur empreinte. Les scénarios des extensions restent une recette à exécuter, distincte des tests de structure documentaire. Les audits PNG et revues jouées sont consignés par lot. Aucune fidélité 1:1 déduite de la présence d’un fichier.'};
  const associations = {...metadata, sourceHashes: Object.fromEntries(sourcePaths.map(path => [path, digest(path)])), records,
    issues: [...issues, {type: 'aggregate-film-source', id: 'film', action: 'Le filtre par groupe source ne garantit pas une route propre à chaque film ; contrôler édition, rival et stage avant validation narrative.'}],
    verification: {assetPathCount: assetPaths.length, missingAssetPaths, method: 'Git tracked path or local file; no PNG decoding'}};
  const profileRecords = records.filter(r => r.kind === 'profile');
  const stageRecords = records.filter(r => r.kind === 'stage');
  const chronicleRecords = records.filter(r => r.kind === 'chronicle');
  const activeProjectileMoves = ROSTER.flatMap(f => Object.entries(profiles.get(f.id).moves).filter(([, m]) => m.enabled !== false && m.projectile).map(([key, move]) => ({fighter: f, key, move})));
  const movesWithImage = activeProjectileMoves.filter(({fighter, move}) => projectileBitmapFor(fighter, move));
  const status = {...metadata,
    counts: {
      guideSections: requirements.sections.length, baseGuideSections: requirements.baseSectionCount,
      extensionGuideSections: requirements.extensionSectionCount, guideSourceFiles: requirements.sourceFiles.length,
      extensionAcceptanceScenarios: requirements.extensionAcceptanceTests.length,
      extensionAcceptanceScenariosExecuted: requirements.extensionAcceptanceTests.filter(test => test.status !== 'not-run').length,
      extensionExampleRecords: extensionExamples.records.length,
      extensionTemplateFamilies: extensionExamples.templatesCovered.length,
      moduleDecisions: requirements.moduleDecisions.length,
      associations: records.length, associationsByKind: groupCounts(records.map(r => r.kind)),
      sourceGroups: Object.keys(SOURCE_META).length, corpusEntries: corpus.records.length,
      profiles: ROSTER.length, combatEnabledProfiles: profileRecords.filter(r => r.details.combatEnabled).length,
      nonCombatProfiles: profileRecords.filter(r => !r.details.combatEnabled).length,
      roles: groupCounts(profileRecords.map(r => r.details.role)),
      cataloguedBosses: ROSTER.filter(f => f.boss).length,
      combatEnabledBosses: profileRecords.filter(r => r.details.boss && r.details.combatEnabled).length,
      moveSlots: sum(profileRecords.map(r => r.details.moveKeys.length)),
      enabledMoveSlots: sum(profileRecords.map(r => r.details.enabledMoveKeys.length)),
      disabledMoveSlots: sum(profileRecords.map(r => r.details.disabledMoveKeys.length)),
      generatedStories: profileRecords.length,
      individualStoriesWithArtwork: profileRecords.filter(r=>r.details.story.artwork).length,
      individualStoryIllustrationFiles: unique(profileRecords.flatMap(r=>(r.details.story.artwork?.illustrations || []).map(i=>i.path))).length,
      storiesWithPlayableEncounters: profileRecords.filter(r => r.details.story.hasPlayableEncounters).length,
      chronicles: CHRONICLES.length, chroniclesWithPlayableEncounters: chronicleRecords.filter(r => r.details.playableFighterIds.length).length,
      chronicleEncounters: sum(chronicleRecords.map(r => r.details.playableFighterIds.length)),
      chronicleDossiers: sum(chronicleRecords.map(r => r.details.referenceDossiers.length)),
      chronicleIllustrationFiles: unique(chronicleRecords.flatMap(r => r.details.illustrations.map(i => i.path))).length,
      fighterFinisherDefinitions: sum(profileRecords.map(r => r.details.finisherIds.length)),
      fighterFinishersAuthored: sum(profileRecords.map(r => r.details.authoredFinisherIds.length)),
      stages: STAGES.length, stageFinisherDefinitions: STAGES.filter(s => s.fatality).length,
      stageFinishersAuthored: stageRecords.filter(r => r.details.finisherAuthored).length,
      profilesWithPortraitCandidate: profileRecords.filter(r => r.details.assets.portraitPath).length,
      profilesWithSideViewCandidate: profileRecords.filter(r => r.details.assets.combatView === 'side-view-candidate').length,
      stagesWithBitmapCandidate: stageRecords.filter(r => r.details.presentation.framePaths.length).length,
      projectileBitmapDefinitions: Object.keys(PROJECTILE_BITMAPS).length,
      activeProjectileMoveSlots: activeProjectileMoves.length,
      activeProjectileMoveSlotsWithBitmap: movesWithImage.length,
      activeProjectileMoveSlotsWithoutBitmap: activeProjectileMoves.length - movesWithImage.length,
      stagesWithReferenceTracks: stageRecords.filter(r => r.details.presentation.referenceTrackIds.length).length,
      referenceTracks: sum(stageRecords.map(r => r.details.presentation.referenceTrackIds.length)),
      stagesWithInteractions: STAGES.filter(s => s.interactions?.length).length,
      interactions: sum(STAGES.map(s => s.interactions?.length || 0)),
      stagesWithAllowedHazards: STAGES.filter(s => s.director?.hazardDeck?.length).length,
      stagesWithOtherworldShift: STAGES.filter(s => s.shift?.enabled === true).length,
      crossStageRuntimeLinks: 0,
      newSpritesProducedThisPass: requirements.currentPass?.staticCharacterPoses || 0,
      newStaticImagesProducedThisPass: requirements.currentPass?.staticImages || 0,
      newAnimationsProducedThisPass: requirements.currentPass?.newAnimations || 0
    },
    definitions: {
      combatEnabled: 'Admission par la politique du moteur ; distincte de la finition des assets et de la recette jouée.',
      enabledMoveSlots: 'Actions dont enabled n’est pas false, après création du profil runtime.',
      generatedStories: 'Structures dérivées des textes de moveset et du catalogue ; pas 230 campagnes détaillées.',
      playableStories: 'combatEnabled vrai ET file d’adversaires non vide ; les dossiers n’ajoutent aucun combat.',
      authoredFinishers: 'Chorégraphies définies dans lore-cinematics ; pas un compte de séquences bitmap finalisées.',
      visualCandidates: 'Registres et chemins présents ; les audits et revues artistiques restent attribués à leurs rapports et ne certifient pas 1:1.',
      stageTransitions: 'Une bascule Otherworld garde le même ID de stage ; elle ne compte pas comme une liaison entre deux arènes.',
      guideSections: '30 rubriques du guide général et 38 rubriques des deux extensions. Leur association est documentaire.',
      extensionAcceptanceScenarios: '40 cas de recette conçus pour les extensions. Un contrôle du JSON ne vaut pas exécution de ces cas dans le jeu.'
    },
    currentPass: {...requirements.currentPass, publication:'recorded-separately-after-push'}
  };
  return {requirements, extensionExamples, associations, status, ids, stages};
}

export function validateGuideAssociations({requirements, extensionExamples, associations, status, ids, stages}) {
  const errors = [];
  const sections = requirements.sections.map(s => s.section);
  const expected = Array.from({length: 68}, (_, i) => String(i).padStart(2, '0'));
  if (JSON.stringify(sections) !== JSON.stringify(expected)) errors.push('Expected ordered sections 00–67 exactly once.');
  if (requirements.baseSectionCount !== 30 || requirements.extensionSectionCount !== 38) errors.push('Base and extension section counts must remain separate (30 + 38).');
  if (associations.sourceSHA256 !== GUIDE_SHA256) errors.push('Original attachment hash mismatch.');
  const expectedSources = [{path: requirements.sourceFile, sha256: GUIDE_SHA256, firstSection: 0, lastSection: 29}, ...EXTENSION_SOURCES];
  if (JSON.stringify(associations.sourceFiles) !== JSON.stringify(expectedSources) || JSON.stringify(requirements.sourceFiles) !== JSON.stringify(expectedSources)) errors.push('Guide or extension source integrity mismatch.');
  for (const [index, source] of EXTENSION_SOURCES.entries()) {
    const recorded = requirements.extensionSources?.[index];
    if (!recorded || recorded.id !== `SHCG-EXT0${index + 1}-v1.0` || recorded.path !== source.path || recorded.sha256 !== source.sha256 || JSON.stringify(recorded.sections) !== JSON.stringify([source.firstSection, source.lastSection])) errors.push(`Extension provenance mismatch: ${source.path}`);
  }
  const acceptance = requirements.extensionAcceptanceTests;
  const expectedTestIds = ['E01', 'E02'].flatMap((extension, index) => Array.from({length: index === 0 ? 18 : 22}, (_, i) => `SHCG-${extension}-TEST-${String(i + 1).padStart(2, '0')}`));
  if (JSON.stringify(acceptance.map(test => test.id)) !== JSON.stringify(expectedTestIds)) errors.push('Expected 18 extension 01 and 22 extension 02 acceptance scenarios exactly once.');
  for (const [index, test] of acceptance.entries()) {
    if (!test.sectionRefs?.length || test.sectionRefs.some(section => !sections.includes(String(section).replace('SHCG-', '')))) errors.push(`Invalid acceptance section: ${test.id}`);
    const extension = index < 18 ? 1 : 2;
    if (test.sourceId !== `SHCG-EXT0${extension}-v1.0` || test.sourceSection !== (extension === 1 ? '47' : '64') || test.sourceCase !== (extension === 1 ? index + 1 : index - 17)) errors.push(`Acceptance source provenance mismatch: ${test.id}`);
    if (!test.given || !test.when || !test.then?.length) errors.push(`Incomplete acceptance scenario: ${test.id}`);
    if (test.status !== 'not-run' && !test.evidence?.length) errors.push(`Acceptance execution without evidence: ${test.id}`);
  }
  const exampleIds = new Set(extensionExamples.records.map(example => example.id));
  if (exampleIds.size !== extensionExamples.records.length) errors.push('Duplicate extension example identifier.');
  if (extensionExamples.counts.records !== extensionExamples.records.length) errors.push('Extension example count mismatch.');
  const chronicleIds = new Set(CHRONICLES.map(chronicle => chronicle.id));
  const referenceIds = new Set(ROSTER.flatMap(fighter => combatReferencePolicy(fighter).referenceIds || []));
  const documentaryIds = new Set(readFileSync(resolve(ROOT, `${OUTPUT}/CAMPAGNE_ET_DENOUEMENTS.md`), 'utf8').match(/SHC_(?:CAM|ROUTE)_[A-Z0-9_]+/g));
  const expectedFamilies = ['E01', 'E02'].flatMap((extension, index) => Array.from({length: index === 0 ? 10 : 6}, (_, i) => `${extension}-${String.fromCharCode(65 + i)}`));
  const actualFamilies = unique(extensionExamples.records.flatMap(example => example.templateFamilies)).sort();
  if (JSON.stringify(actualFamilies) !== JSON.stringify(expectedFamilies) || JSON.stringify(extensionExamples.templatesCovered) !== JSON.stringify(expectedFamilies)) errors.push('Extension template coverage must include E01-A–J and E02-A–F.');
  for (const example of extensionExamples.records) {
    if (!example.id.startsWith('SHCGX_') || !example.sectionRefs.length || example.sectionRefs.some(ref => !sections.includes(ref.replace('SHCG-', '')))) errors.push(`Invalid extension example section: ${example.id}`);
    for (const id of example.fighterIds) if (!ids.has(id)) errors.push(`Unknown extension example fighter: ${example.id}: ${id}`);
    for (const id of example.stageIds) if (!stages.has(id)) errors.push(`Unknown extension example stage: ${example.id}: ${id}`);
    for (const id of example.chronicleIds) if (!chronicleIds.has(id)) errors.push(`Unknown extension example chronicle: ${example.id}: ${id}`);
    for (const id of example.sourceRefs) if (!referenceIds.has(id)) errors.push(`Unknown extension example reference: ${example.id}: ${id}`);
    for (const id of example.documentaryLinks || []) if (!documentaryIds.has(id)) errors.push(`Unknown documentary chapter: ${example.id}: ${id}`);
    const evidenceFighters = unique(example.referenceEvidence.map(evidence => evidence.fighterId)).sort();
    if (JSON.stringify(evidenceFighters) !== JSON.stringify(unique(example.fighterIds).sort())) errors.push(`Extension example evidence owner mismatch: ${example.id}`);
    for (const field of ['teamProfileId', 'rewardContentId', 'contentId', 'ruleId']) if (example[field] && !exampleIds.has(example[field])) errors.push(`Unknown extension example link: ${example.id}: ${field}`);
    if (example.moveRef) {
      const fighter = ROSTER.find(f => f.id === example.moveRef.fighterId);
      if (!fighter || !createCombatProfile(fighter).moves[example.moveRef.moveKey]) errors.push(`Unknown extension example command: ${example.id}`);
    }
    for (const evidence of example.referenceEvidence) {
      const fighter = ROSTER.find(f => f.id === evidence.fighterId);
      const policy = fighter && combatReferencePolicy(fighter);
      if (!policy || evidence.role !== policy.role || evidence.edition !== (policy.edition || fighter.reference?.referenceEdition)) errors.push(`Extension example edition or role mismatch: ${example.id}`);
      if (!existsSync(resolve(ROOT, evidence.path))) errors.push(`Missing extension reference evidence: ${example.id}: ${evidence.path}`);
    }
    if (!example.loreStatus || ['design', 'assets', 'animation', 'runtime', 'validation', 'fidelity'].some(key => !example.productionStatus[key])) errors.push(`Incomplete extension production status: ${example.id}`);
  }
  const keys = associations.records.map(r => `${r.kind}:${r.id}`);
  if (new Set(keys).size !== keys.length) errors.push('Duplicate association identifier.');
  for (const section of requirements.sections) {
    if (!requirements.decisions[section.decision] || !section.acceptance.length || !section.evidencePaths.length || !section.nextAction) errors.push(`Incomplete section ${section.id}.`);
    for (const path of section.evidencePaths) if (!existsSync(resolve(ROOT, path))) errors.push(`${section.id}: missing evidence ${path}`);
    if (Number(section.section) >= 30) {
      const source = expectedSources.find(item => Number(section.section) >= item.firstSection && Number(section.section) <= item.lastSection);
      if (section.sourceFile !== source.path) errors.push(`Extension section source mismatch: ${section.id}`);
      const recordedSource = requirements.extensionSources.find(item => item.path === source.path);
      if (section.sourceId !== recordedSource?.id) errors.push(`Extension section provenance mismatch: ${section.id}`);
      if (!Array.isArray(section.lineRange) || section.lineRange.length !== 2 || !section.lineRange.every(Number.isInteger) || section.lineRange[0] < 1 || section.lineRange[1] < section.lineRange[0] || section.lineRange[1] > (recordedSource?.lineCount || 0)) errors.push(`Invalid source line range: ${section.id}`);
    }
  }
  for (const record of associations.records) {
    if (!record.guideSections.length || record.guideSections.some(s => !sections.includes(s))) errors.push(`Invalid section mapping: ${record.id}`);
    if (!existsSync(resolve(ROOT, record.targetFile))) errors.push(`Missing target: ${record.targetFile}`);
    if (record.extensionExampleIds.some(id => !exampleIds.has(id))) errors.push(`Unknown example association: ${record.id}`);
    if (JSON.stringify(record.extensionExampleIds) !== JSON.stringify(extensionExampleIdsFor(record, extensionExamples.records))) errors.push(`Extension example binding mismatch: ${record.id}`);
    const d = record.details;
    if (record.kind === 'profile') {
      if (!stages.has(d.assignedStageId) || !stages.has(d.effectiveStageId)) errors.push(`Unknown stage: ${record.id}`);
      if (d.variantBaseId && !ids.has(d.variantBaseId)) errors.push(`Unknown variant parent ID: ${record.id}`);
      if (d.enabledMoveKeys.length + d.disabledMoveKeys.length !== d.moveKeys.length) errors.push(`Move status mismatch: ${record.id}`);
      if (!d.combatEnabled && (d.story.hasPlayableEncounters || d.story.encounters.length)) errors.push(`Noncombat story enabled: ${record.id}`);
      if (d.story.rivalId && !ids.has(d.story.rivalId)) errors.push(`Unknown rival: ${record.id}`);
      if (d.story.artwork && (d.story.artwork.source!==record.source || stages.get(d.story.artwork.stageId)?.source!==record.source)) errors.push(`Story artwork source mismatch: ${record.id}`);
      for (const encounter of d.story.encounters) if (!ids.has(encounter.fighterId) || !stages.has(encounter.stageId)) errors.push(`Invalid encounter: ${record.id}`);
    }
    if (record.kind === 'chronicle') {
      for (const id of d.fighterIds) if (!ids.has(id)) errors.push(`Unknown chronicle fighter: ${id}`);
      for (const id of d.stageIds) if (!stages.has(id)) errors.push(`Unknown chronicle stage: ${id}`);
    }
    if (record.kind === 'corpus') {
      for (const id of d.runtimeProfileIds) if (!ids.has(id)) errors.push(`Unknown corpus profile: ${id}`);
      for (const id of d.runtimeStageIds) if (!stages.has(id)) errors.push(`Unknown corpus stage: ${id}`);
      for (const id of d.runtimeSourceIds) if (!SOURCE_META[id]) errors.push(`Unknown corpus source: ${id}`);
    }
    if (record.kind === 'projectile') {
      if (!ids.has(d.fighterId)) errors.push(`Unknown projectile owner: ${record.id}`);
      if (!d.slots.length || d.slots.some(k => !createCombatProfile(ROSTER.find(f => f.id === d.fighterId)).moves[k])) errors.push(`Unknown projectile slot: ${record.id}`);
    }
  }
  if (associations.verification.missingAssetPaths.length) errors.push(...associations.verification.missingAssetPaths.map(p => `Missing tracked asset: ${p}`));
  const counts = status.counts;
  if (counts.combatEnabledProfiles + counts.nonCombatProfiles !== counts.profiles) errors.push('Profile totals mismatch.');
  if (counts.enabledMoveSlots + counts.disabledMoveSlots !== counts.moveSlots) errors.push('Move totals mismatch.');
  if (counts.storiesWithPlayableEncounters > counts.combatEnabledProfiles) errors.push('Stories exceed admitted profiles.');
  return errors;
}

function markdownOutputs({requirements, associations, status}) {
  const counts = status.counts;
  const legend = 'État calculé dans le code et les registres courants, comparé au commit de référence. Le contrôle des chemins est distinct des audits PNG, des recettes jouées et de la certification de fidélité.\n';
  const matrix = '# Correspondance des 68 rubriques\n\nGénéré depuis le [guide général](requirements.json) et les [deux extensions](extensions/requirements.json). La [vue résolue](requirements-resolved.json) alimente les classeurs. Les décisions « retenue » portent sur la cible de conception, pas sur une promesse d’implémentation terminée.\n\n' +
    mdTable(['ID', 'Rubrique', 'Priorité', 'État observé', 'Prochaine action'], requirements.sections.map(s => [s.id, s.title, s.priority, s.implementationStatus, s.nextAction])) +
    '\n## Décisions sur les modules\n\n' + mdTable(['Module', 'Décision', 'Priorité', 'Justification'], requirements.moduleDecisions.map(m => [m.name, m.decision, m.priority, m.reason])) +
    '\n## Exigences détaillées et preuves\n\n' + requirements.sections.map(s => `### ${s.id} — ${s.title}\n\n**Adaptation :** ${s.adaptation}\n\n**Existant :** ${s.observed}\n\n**Fichiers associés :** ${s.evidencePaths.map(path => `[${path}](../../${path})`).join(' · ')}\n\n**Validation attendue :**\n\n${s.acceptance.map(a => `- ${a}`).join('\n')}\n`).join('\n');
  const summaryRows = [
    ['Rubriques du guide et des extensions associées', counts.guideSections, 68, '30 générales + 38 extensions ; couverture documentaire'],
    ['Textes originaux conservés et vérifiés', counts.guideSourceFiles, 3, 'SHA-256 des trois fichiers originaux'],
    ['Scénarios de recette des extensions rédigés', counts.extensionAcceptanceScenarios, 40, '18 + 22 cas ; leur rédaction ne valide pas le runtime'],
    ['Scénarios de recette des extensions exécutés', counts.extensionAcceptanceScenariosExecuted, counts.extensionAcceptanceScenarios, 'Les tests documentaires ne s’ajoutent pas à ce compteur'],
    ['Fiches d’exemple reliées aux IDs existants', counts.extensionExampleRecords, `${counts.extensionTemplateFamilies} familles de fiches`, 'Conception proposée ; pas de nouveaux combattants ou systèmes actifs'],
    ['Entrées de corpus', counts.corpusEntries, counts.corpusEntries, 'Œuvres, éditions et supports ; pas autant de jeux'],
    ['Profils admis au combat', counts.combatEnabledProfiles, counts.profiles, `${counts.nonCombatProfiles} hors duel`],
    ['Commandes activées', counts.enabledMoveSlots, counts.moveSlots, `${counts.disabledMoveSlots} emplacements désactivés`],
    ['Boss admis', counts.combatEnabledBosses, counts.cataloguedBosses, 'Admission ; pas recette artistique complète'],
    ['Récits avec rencontres', counts.storiesWithPlayableEncounters, counts.generatedStories, 'Structures générées ; pas campagnes toutes détaillées'],
    ['Chroniques avec rencontres', counts.chroniclesWithPlayableEncounters, counts.chronicles, `${counts.chronicleEncounters} rencontres et ${counts.chronicleDossiers} dossiers`],
    ['Portraits candidats référencés', counts.profilesWithPortraitCandidate, counts.profiles, 'Présence distincte de la fidélité validée'],
    ['Vues latérales candidates déclarées', counts.profilesWithSideViewCandidate, counts.profiles, 'Les vues anciennes sans ce statut restent à revoir'],
    ['Arènes avec bitmap candidat', counts.stagesWithBitmapCandidate, counts.stages, 'Arène entière ; plusieurs couches peuvent compter pour une arène'],
    ['Commandes projectile avec bitmap associé', counts.activeProjectileMoveSlotsWithBitmap, counts.activeProjectileMoveSlots, `${counts.projectileBitmapDefinitions} définitions d’images partagées selon propriétaire/slots`],
    ['Montages de Dénouement de sujet écrits', counts.fighterFinishersAuthored, counts.fighterFinisherDefinitions, 'Chorégraphies ; pas animations ou images finales'],
    ['Montages de Dénouement de lieu écrits', counts.stageFinishersAuthored, counts.stageFinisherDefinitions, 'Même distinction entre timeline et production'],
    ['Illustrations de Chroniques référencées', counts.chronicleIllustrationFiles, 'inventaire connu', 'Ne couvre pas automatiquement les nouveaux briefs'],
    ['Illustrations de récits individuels', counts.individualStoryIllustrationFiles, `${counts.individualStoriesWithArtwork} récit(s)`, 'Intro et conclusion fixes ; campagne globale distincte'],
    ['Liaisons entre stages implémentées', counts.crossStageRuntimeLinks, 'cible à définir', 'Les bascules Otherworld restent le même stage']
  ];
  const bilan = '# État du guide et des associations\n\n' + legend + `\nRéférence : \`${requirements.baselineCommit}\`, ${requirements.asOf}. Générateur : [build-combat-guide.mjs](../../scripts/build-combat-guide.mjs).\n\n` +
    mdTable(['Catégorie', 'Présent / admis', 'Périmètre', 'Lecture correcte'], summaryRows) +
    '\n## Associations\n\n' + mdTable(['Catégorie', 'Entrées reliées'], Object.entries(counts.associationsByKind)) +
    `\n**${counts.associations} entrées** reliées. ${associations.verification.assetPathCount} chemins d’images contrôlés dans l’index Git ou le checkout. Les clés de commande sont associées sous leur profil, sans leur inventer un nouvel identifiant runtime.\n\n` +
    '## Écarts de raccord observés\n\n' + mdTable(['Type', 'Sujet', 'Action'], associations.issues.map(i => [i.type, i.id, i.action])) +
    `\n## Livraison de cette passe\n\n${requirements.currentPass?.summary || 'Intégration documentaire des deux extensions et actualisation des associations.'}\n\n${counts.newStaticImagesProducedThisPass} nouvelles images fixes candidates déclarées pour ce lot, dont ${counts.newSpritesProducedThisPass} poses de personnage. ${counts.newAnimationsProducedThisPass} nouvelle animation. Les preuves de production et de validation restent attribuées à leur lot ; les résultats antérieurs sont conservés dans [la vague 30](../production/vague30/README.md). Les [contrats propres à Silent Hill](extensions/README.md) détaillent les taunts, équipes, bonus et accès aux contenus.\n`;
  return {'MATRICE.md': matrix, 'ETAT_DES_LIEUX.md': bilan};
}

export function renderGuideOutputs(result) {
  return {'requirements-resolved.json': stableJSON(result.requirements), 'associations.json': stableJSON(result.associations), 'status.json': stableJSON(result.status), ...markdownOutputs(result)};
}

async function main() {
  const check = process.argv.includes('--check');
  const result = buildGuideAssociations();
  const outputs = renderGuideOutputs(result);
  const errors = validateGuideAssociations(result);
  if (!check && !errors.length) {
    mkdirSync(resolve(ROOT, OUTPUT), {recursive: true});
    for (const [name, content] of Object.entries(outputs)) writeFileSync(resolve(ROOT, OUTPUT, name), content);
  }
  if (check) for (const [name, content] of Object.entries(outputs)) {
    const path = resolve(ROOT, OUTPUT, name);
    if (!existsSync(path) || readFileSync(path, 'utf8') !== content) errors.push(`Generated file differs: ${OUTPUT}/${name}`);
  }
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else console.log(JSON.stringify({ok: true, check, sections: result.requirements.sections.length, associations: result.associations.records.length, imagePathsChecked: result.associations.verification.assetPathCount, counts: result.status.counts}, null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
