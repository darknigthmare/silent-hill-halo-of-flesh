import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  VERSION,
  ROSTER,
  STAGES,
  CHRONICLES,
  SOURCE_META,
  CONTENT_STATS,
  MANIFESTATION_TRAITS,
  AFFLICTIONS,
  STAGE_HAZARDS,
  AI_PERSONALITIES,
  RITUAL_MODIFIERS,
  SOURCE_COVERAGE_TARGETS,
  coverageAudit,
  createBossPhases,
  createCombatProfile,
  MOVESET_KEYS,
  MOVE_FIDELITY,
  STAGE_TERRAINS,
  STAGE_SHIFT_STYLES,
  STAGE_EVENTS,
  stageDirectorSummary
} from '../src/data.js';
import { cinematicSummary } from '../src/lore-cinematics.js';
import { REFERENCE_SOURCES } from '../src/production-reference.js';

const project = resolve(fileURLToPath(new URL('../', import.meta.url)));
const docs = join(project, 'docs');
const profiles = new Map(ROSTER.map(fighter => [fighter.id, createCombatProfile(fighter)]));
const runtimeCounts = {
  playable: [...profiles.values()].filter(profile => profile.referencePolicy.combatEnabled).length,
  enabled: [...profiles.values()].flatMap(profile => Object.values(profile.moves)).filter(move => move.enabled).length,
  fighterFinishers: ROSTER.flatMap(fighter => fighter.fatalities).filter(definition => cinematicSummary(definition.id).authored).length,
  stageFinishers: STAGES.filter(stage => cinematicSummary(stage.fatality.id).authored).length,
  referenceTracks: STAGES.reduce((count, stage) => count + stage.referenceTracks.length, 0)
};
function sourceLinks(ids = []) {
  return [...new Set(ids)].map(id => REFERENCE_SOURCES[id]).filter(Boolean).map(source => `[${md(source.title)}](${source.url})`).join(' · ');
}
function worldState(stage) {
  return stage.shift.enabled ? `${stage.shift.name} — transition versus autorisée` : `${stage.referencePolicy.worldState} — aucune bascule`;
}

function md(value = '') {
  return String(value)
    .replaceAll('|', '\\|')
    .replaceAll('\n', ' ')
    .trim();
}

function sourceRows() {
  return Object.entries(SOURCE_META).map(([id, meta]) => {
    const fighters = ROSTER.filter((fighter) => fighter.source === id);
    const bosses = fighters.filter((fighter) => fighter.boss);
    const stages = STAGES.filter((stage) => stage.source === id);
    const chronicles = CHRONICLES.filter((route) => route.source === id);
    const traits = new Set(fighters.map((fighter) => fighter.trait));
    const afflictions = new Set(fighters.map((fighter) => fighter.affliction));
    return {
      id,
      meta,
      fighters,
      bosses,
      stages,
      chronicles,
      traits,
      afflictions
    };
  });
}

function buildRoster() {
  const lines = [
    `# Roster complet — v${VERSION}`,
    '',
    `Catalogue synchronisé : **${CONTENT_STATS.fighters} fiches**, dont **${runtimeCounts.playable} profils compatibles avec un combat de prototype**. Les ${CONTENT_STATS.moves} emplacements comprennent **${runtimeCounts.enabled} commandes activées**. ${CONTENT_STATS.fatalities} propositions de fatalité de combattant sont inventoriées ; **${runtimeCounts.fighterFinishers} montages** sont écrits et déclenchables lorsque leurs conditions corporelles et matérielles sont réunies.`,
    '',
    'Les rôles non combattants et les identités non confirmées restent consultables. Les rencontres scénarisées autorisées sont explicitement des adaptations versus. Aucun clip animé ni fidélité 1:1 n’est certifié.',
    '',
    '> Les noms servent à documenter le fan-prototype. Les silhouettes, statistiques, timings, effets et fatalités sont des créations ou adaptations originales documentées ; aucun asset officiel n’est inclus.',
    ''
  ];

  for (const { id, meta, fighters } of sourceRows()) {
    const sourceStages = STAGES.filter((stage) => stage.source === id);
    lines.push(`## ${meta.label} (${meta.year})`, '');
    lines.push(`**${fighters.length} manifestations · ${fighters.filter((fighter) => fighter.boss).length} boss · ${sourceStages.length} arènes**`, '');
    lines.push('| Manifestation | Type | Archétype | Trait | Affliction | Fatalités | Statut | Arène |', '|---|---|---|---|---|---:|---|---|');
    for (const fighter of fighters) {
      const stage = STAGES.find((entry) => entry.id === fighter.stageId);
      const profile = profiles.get(fighter.id), policy = profile.referencePolicy;
      lines.push(`| ${md(fighter.name)} | ${md(policy.role)} | \`${md(fighter.archetype)}\` | ${md(profile.trait.name)} | ${md(profile.affliction.name)} | ${fighter.fatalities.filter(definition => cinematicSummary(definition.id).authored).length} montages / 2 propositions | ${policy.combatEnabled ? md(policy.adaptationMode) : 'Dossier uniquement'} · ${md(fighter.catalogueStatus)} / ${md(fighter.nameStatus)} | ${md(stage?.name || fighter.stageId)} |`);
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

function buildMatrix() {
  const audit = coverageAudit();
  const lines = [
    `# Matrice de fidélité et couverture — v${VERSION}`,
    '',
    '| Source | Manifestations | Boss | Arènes | Boucles conservées | Propositions de fatalité | Couverture interne |',
    '|---|---:|---:|---:|---:|---:|---|'
  ];
  for (const row of sourceRows()) {
    const entry = audit.sources[row.id];
    const animations = row.stages.reduce((sum, stage) => sum + (stage.animations?.length || 0), 0);
    const fatalities = row.fighters.reduce((sum, fighter) => sum + (fighter.fatalities?.length || 0), 0) + row.stages.filter((stage) => stage.fatality).length;
    lines.push(`| ${md(row.meta.label)} | ${row.fighters.length} | ${row.bosses.length} | ${row.stages.length} | ${animations} | ${fatalities} | ${entry.complete ? 'Cibles de catalogue présentes' : `Lacunes : ${md(entry.missing.join(', '))}`} |`);
  }
  lines.push(
    '',
    `**Total : ${CONTENT_STATS.fighters} manifestations · ${CONTENT_STATS.moves} coups · ${CONTENT_STATS.directCanonicalMoves} directement attestés · ${CONTENT_STATS.behaviorCompositeMoves} composites · ${CONTENT_STATS.versusAdaptationMoves} adaptations · ${CONTENT_STATS.bosses} boss · ${CONTENT_STATS.stages} arènes · ${CONTENT_STATS.stageAnimations} animations · ${CONTENT_STATS.sources} sources.**`,
    '',
    '## Contrat de fidélité',
    '',
    'Chaque profil sépare explicitement six couches :',
    '',
    '1. **Catalogue** — nom, source, année, variante, statut de boss et lieu associé.',
    '2. **Niveau de preuve** — nom officiel/établi, variante d’écran ou nom descriptif signalé.',
    '3. **Comportement source** — rythme, portée, posture et attaque caractéristique décrits en texte original.',
    '4. **Silhouette** — primitives et paramètres graphiques originaux organisés par morphologie.',
    '5. **Adaptation versus** — statistiques, timings, fatalités, affliction et équilibrage, jamais présentés comme canoniques quand ils ne le sont pas.',
    '6. **Provenance** — aucun modèle, sprite, son, texture ou fichier extrait d’un titre officiel.',
    '',
    '## Périmètre',
    '',
    audit.scope,
    '',
    audit.policy,
    '',
    'La couverture interne vérifie les cibles déclarées du catalogue. Elle ne prouve pas l’exhaustivité de la franchise, la jouabilité des 230 rôles ni la fidélité visuelle. Les fiches de recherche déterminent séparément les restrictions d’exécution. Aucun clip animé et aucune fidélité 1:1 ne sont certifiés.'
  );
  return `${lines.join('\n')}\n`;
}

function buildCombatSystems() {
  const lines = [
    `# Systèmes de combat — v${VERSION}`,
    '',
    `La v${VERSION} réunit **${CONTENT_STATS.moves} coups documentés**, **${Object.keys(MANIFESTATION_TRAITS).length} traits**, **${Object.keys(AFFLICTIONS).length} afflictions**, **${Object.keys(STAGE_HAZARDS).length} dangers**, **${Object.keys(RITUAL_MODIFIERS).length} rites**, **${Object.keys(AI_PERSONALITIES).length} personnalités IA** et **${CONTENT_STATS.bossPhases} transitions de boss**, **${CONTENT_STATS.fatalities} fatalités de combattant**, **${CONTENT_STATS.stageFatalities} fatalités d’arène** et **${CONTENT_STATS.stageAnimations} animations d’arène**, **${CONTENT_STATS.stageDirectorEvents} événements**, **${CONTENT_STATS.terrainProfiles} terrains** et **${CONTENT_STATS.shiftStyles} types de bascule**.`,
    '',
    '## Architecture des movesets',
    '',
    `Chaque fiche conserve **${MOVESET_KEYS.length} emplacements** : huit attaques normales contextuelles, deux saisies, trois ripostes de situation, cinq techniques, un Nightmare et une attaque Otherworld de désespoir. **${runtimeCounts.enabled} commandes sont activées ; ${CONTENT_STATS.moves - runtimeCounts.enabled} sont désactivées avec une raison explicite.**`,
    '',
    `Répartition : **${CONTENT_STATS.directCanonicalMoves} directement attestées**, **${CONTENT_STATS.behaviorCompositeMoves} composites lore-friendly**, **${CONTENT_STATS.versusAdaptationMoves} adaptations versus**.`,
    '',
    'Chaque coup contient son input, ses frames de démarrage/activité/récupération, dégâts, portée, niveau de garde, propriétés, routes d’annulation, références et état d’exécution. Les nombres sont des paramètres de versus non mesurés dans la source ; les valeurs d’une commande désactivée restent documentées mais ne sont pas exécutées.',
    '',
    'Les projectiles, téléportations, auras et afflictions exigent une capacité autorisée pour l’identifiant exact. Un trait passif ne peut pas réintroduire un effet retiré. Cybil possède dix tirs et abandonne son arme lorsque les munitions sont épuisées ou que sa santé passe strictement sous 50 %. La phase désarmée persiste entre les manches, sans consommer les balles abandonnées. Les corps attachés conservent leur ancrage, même sous une projection arrière. La provocation P1 P / P2 N / manette L3 est annulable et n’accorde ni dégâts, ni jauge, ni invulnérabilité.',
    '',
    'Memory of Alessa suit quatre armes dans l’ordre SH3 : couteau, pistolet, tuyau puis mitraillette. La récupération verrouille chaque changement ; les coups de contact, tirs et rafales suivent uniquement l’arme équipée. Les quarts de vitalité, la récupération et la cadence de trois tirs sont des adaptations de versus, sans relevé officiel de timings. La naissance de Blood Baby depuis sa mère ne lui accorde pas le pouvoir inverse d’invoquer Blood Mama.',
    'Le Missionary de SH3 dévie les balles visibles de face lorsqu’il est disponible ; dos, chute et attaque restent vulnérables. Cette défense ne donne ni jauge ni contre automatique. Incubator possède un champ passif local qui renverse vers l’extérieur ; Incubus ne le reçoit pas. Leurs décharges sont respectivement bleues et rouges. Les états, dimensions, durées, dégâts et valeurs RGB du versus ne sont pas des mesures officielles.',
    '',
    '## Traits de manifestation',
    '',
    '| Identifiant | Nom | Effet |',
    '|---|---|---|'
  ];
  for (const [id, trait] of Object.entries(MANIFESTATION_TRAITS)) {
    lines.push(`| \`${id}\` | ${md(trait.name)} | ${md(trait.description)} |`);
  }
  lines.push('', '## Afflictions', '', '| Identifiant | Nom | Durée | Effet |', '|---|---|---:|---|');
  for (const [id, affliction] of Object.entries(AFFLICTIONS)) {
    lines.push(`| \`${id}\` | ${md(affliction.name)} | ${affliction.duration} frames | ${md(affliction.description)} |`);
  }
  lines.push('', '## Dangers d’arène', '', '| Identifiant | Nom | Télégraphe | Rayon | Dégâts | Affliction |', '|---|---|---:|---:|---:|---|');
  for (const [id, hazard] of Object.entries(STAGE_HAZARDS)) {
    lines.push(`| \`${id}\` | ${md(hazard.name)} | ${hazard.telegraph} f | ${hazard.radius} | ${hazard.damage} | ${md(AFFLICTIONS[hazard.effect]?.name || hazard.effect)} |`);
  }
  lines.push('', '## Rites du Jugement', '', '| Identifiant | Nom | Effet |', '|---|---|---|');
  for (const [id, ritual] of Object.entries(RITUAL_MODIFIERS)) {
    lines.push(`| \`${id}\` | ${md(ritual.name)} | ${md(ritual.description)} |`);
  }
  lines.push('', '## Personnalités IA', '', '| Archétype | Nom | Distance | Agressivité | Défense |', '|---|---|---:|---:|---:|');
  for (const [id, ai] of Object.entries(AI_PERSONALITIES)) {
    lines.push(`| \`${id}\` | ${md(ai.name)} | ${ai.preferredRange} | ×${ai.aggression} | ×${ai.defense} |`);
  }
  lines.push('', '## Phases de boss', '', `Les **${CONTENT_STATS.bosses} boss** possèdent deux transitions, soit **${CONTENT_STATS.bossPhases} phases déclenchables**. Les seuils sont documentés dans chaque dossier et modifient puissance, vitesse, armure, jauge, Otherworld ou danger d’arène.`);
  lines.push(
    '',
    '## Règles avancées',
    '',
    '- **Garde parfaite** : bloquer dans la fenêtre d’impact neutralise davantage de pression, produit un signal visuel/sonore distinct et ouvre une réponse rapide.',
    '- **Projection arrière** : une saisie compatible peut changer de côté ; la cible attachée au décor conserve son ancrage.',
    '- **Riposte d’esquive** : une attaque légère pendant la fenêtre de sortie d’esquive déclenche une action propre à la manifestation.',
    '- **Contre de garde** : une attaque lourde après une garde parfaite consomme la fenêtre de riposte et brise les armures actives.',
    '- **Reversal de relevée** : une technique pendant la reprise au sol déclenche une action invulnérable documentée séparément.',
    '- **Contre** : toucher pendant le démarrage adverse augmente l’impact et alimente les statistiques de rang.',
    '- **Annulations** : les chaînes autorisées sont déclarées coup par coup dans le profil de combat.',
    '- **Otherworld** : seules les phases de lieux autorisant une transition peuvent basculer. Les lieux normaux, déjà altérés ou non confirmés conservent leur état, y compris sous un rite.',
    '- **Radio de proximité** : l’intensité des parasites augmente avec la proximité et le danger immédiat.',
    '- **Dangers télégraphiés** : les arènes annoncent une zone avant l’impact afin de rester évitables et lisibles.',
    '- **Rang de Chronique** : S à D selon vitalité restante, dégâts, combo, gardes parfaites, contres et dangers subis.',
    '- **Observation** : hitboxes, historique des inputs, soin automatique, jauge libre, reset, transformation Otherworld et phase de boss forcées.',
    '- **Rites du Jugement** : huit combats à modificateur tournant, vitalité et jauge partiellement conservées.',
    '- **IA adaptative** : le CPU repère les actions répétées et choisit distance, garde, esquive ou contre.',
    `- **Fatalités de combattant** : ${runtimeCounts.fighterFinishers} montages originaux écrits, uniquement à la victoire finale, après vérification de l’identité, de l’arme et des corps. Les autres propositions restent à produire.`,
    `- **Fatalités d’arène** : ${runtimeCounts.stageFinishers} montages propres à un lieu, sous conditions de zone, d’accessoires et de mécanisme autorisé. Aucun repli vers une exécution générique incompatible.`,
    '- **Arènes animées** : éclairages, sirènes, chaînes, eau, météo, machineries, ombres et décors réagissent au temps et à l’Otherworld.',
    '- **Terrain contextuel** : adhérence, esquive, saut, garde et recul suivent la matière du lieu sans annuler la lisibilité du versus.',
    '- **Directeur environnemental** : chaque arène alterne événements, dangers et bascule selon sa source, sa famille et ses accessoires.',
    '- **Otherworld différencié** : rouille, glace, signal CRTV, hantise, floraison, sanctuaire, tempête, vide ou rituel utilisent des règles et overlays distincts.'
  );
  return `${lines.join('\n')}\n`;
}


function buildCoverageAudit() {
  const audit = coverageAudit();
  const lines = [
    `# Audit de couverture du roster — v${VERSION}`,
    '',
    `**État global : ${audit.complete ? 'COMPLET DANS LE PÉRIMÈTRE DÉFINI' : 'LACUNES RESTANTES'}**`,
    '',
    audit.scope,
    '',
    audit.policy,
    '',
    '| Source | Présents | Minimum audité | Arènes | Minimum | Manquants | Nommage |',
    '|---|---:|---:|---:|---:|---|---|'
  ];
  for (const [source, entry] of Object.entries(audit.sources)) {
    lines.push(`| ${md(SOURCE_META[source]?.label || source)} | ${entry.fighters} | ${entry.minFighters} | ${entry.stages} | ${entry.minStages} | ${entry.missing.length ? md(entry.missing.join(', ')) : 'Aucun'} | ${md(entry.namingNote || 'Noms officiels ou établis, variantes explicitement balisées')} |`);
  }
  lines.push(
    '',
    '## Règles de décision',
    '',
    '- Les humains réellement affrontés, boss narratifs et set-pieces transformables en combattants sont inclus et balisés.',
    '- Les variations morphologiques visibles et mécaniquement distinctes peuvent devenir des variantes séparées.',
    '- Les simples recolorations sans comportement distinct restent fusionnées.',
    '- Les sujets non combattants, obstacles et identités non confirmées restent consultables ; leurs commandes offensives sont désactivées. Une rencontre scénarisée n’est jouable que si la politique de sa fiche l’autorise comme adaptation versus.',
    '- Lorsqu’aucun bestiaire officiel ne nomme une créature, le nom descriptif est explicitement signalé.',
    '- Les fatalités sont originales et inspirées de comportements documentés ; elles ne sont pas présentées comme des scènes officielles.'
  );
  return `${lines.join('\n')}\n`;
}

function buildMovesets() {
  const lines = [
    `# Movesets complets et fidélité — v${VERSION}`,
    '',
    `**${CONTENT_STATS.fighters} manifestations · ${CONTENT_STATS.moves} coups · ${CONTENT_STATS.directCanonicalMoves} actions directement attestées · ${CONTENT_STATS.behaviorCompositeMoves} composites lore-friendly · ${CONTENT_STATS.versusAdaptationMoves} adaptations versus.**`,
    '',
    '## Légende',
    ''
  ];
  for (const [id, definition] of Object.entries(MOVE_FIDELITY)) lines.push(`- **${md(definition.label)}** (\`${id}\`) — ${md(definition.description)}`);
  lines.push(
    '',
    'Les noms de coups sont des libellés originaux de fan-game. Le statut « directement attesté » qualifie le comportement, l’arme ou l’action observée dans la source, pas l’existence officielle du nom donné au coup.',
    ''
  );
  for (const fighter of ROSTER) {
    const profile = profiles.get(fighter.id);
    const summary = profile.moveset.fidelitySummary;
    lines.push(
      `## ${md(fighter.name)} — ${md(SOURCE_META[fighter.source]?.short || fighter.source)}`,
      '',
      `**${summary.direct} directs · ${summary.composite} composites · ${summary.adapted} adaptations.**`,
      '',
      `Édition : ${md(fighter.reference.referenceEdition)}. Rôle : ${md(profile.referencePolicy.role)}. ${profile.referencePolicy.combatEnabled ? 'Combat de prototype autorisé.' : 'Dossier consultable ; combat désactivé.'}`,
      '',
      `Gestes relevés : ${fighter.reference.observedMoves.map(move => `${md(move.name)} — ${md(move.description)}`).join(' ; ') || 'Aucun geste de combat attesté dans cette fiche.'}`,
      '',
      `Références : ${sourceLinks(fighter.reference.referenceIds)}`,
      '',
      '| Input | Coup | Exécution | Catégorie | Frames S/A/R du prototype | Dégâts | Portée | Fidélité | Base de l’adaptation |',
      '|---|---|---|---|---:|---:|---:|---|---|'
    );
    for (const key of MOVESET_KEYS) {
      const move = profile.moves[key];
      lines.push(`| \`${md(move.input)}\` | ${md(move.name)} | ${move.enabled ? 'Activée' : `Désactivée — ${md(move.disabledReason)}`} | ${md(move.category)} / ${md(move.level)} | ${move.startup}/${move.active}/${move.recovery} | ${move.damage} | ${move.reach} | ${md(MOVE_FIDELITY[move.fidelity]?.label || move.fidelity)} | ${md(move.canonicalBasis)} |`);
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

function buildFatalitiesAndStages() {
  const lines = [
    `# Fatalités, arènes dédiées et animations — v${VERSION}`,
    '',
    `Le catalogue contient **${CONTENT_STATS.fatalities} propositions de fatalité de combattant** et **${CONTENT_STATS.stageFatalities} propositions d’arène**. **${runtimeCounts.fighterFinishers} montages de combattant et ${runtimeCounts.stageFinishers} montages de lieu** sont écrits, avec des conditions d’éligibilité. Les arènes conservent ${CONTENT_STATS.stageAnimations} boucles et jouent ${runtimeCounts.referenceTracks} éléments visuels partiels issus des fiches, ${CONTENT_STATS.stageDirectorEvents} événements et ${CONTENT_STATS.stageInteractions} interactions.`,
    '',
    'Les montages déplacent les acteurs et synchronisent les effets, la caméra et le son du prototype. Les images propres à chaque action restent à produire ; un montage écrit ne constitue pas un clip bitmap ni une certification 1:1.',
    '',
    '## Fatalités de combattant',
    '',
    '| Combattant | Source | Signature | Nightmare | État | Base de production |',
    '|---|---|---|---|---|---|'
  ];
  for (const fighter of ROSTER) {
    const [signature, nightmare] = fighter.fatalities || [];
    const montage = cinematicSummary(signature.id);
    lines.push(`| ${md(fighter.name)} | ${md(SOURCE_META[fighter.source]?.short || fighter.source)} | ${md(signature?.name)} | ${md(nightmare?.name)} | ${montage.authored ? 'Deux montages écrits, conditions requises' : md(montage.reason)} | ${md(fighter.reference.proposals.finisher.description)} |`);
  }
  lines.push('', '## Arènes dédiées', '', '| Arène | Source | Terrain | Bascule | Événements | Dangers | Animations | Fatalité |', '|---|---|---|---|---:|---:|---:|---|');
  for (const stage of STAGES) {
    lines.push(`| ${md(stage.name)} | ${md(SOURCE_META[stage.source]?.short || stage.source)} | ${md(stage.terrain?.name)} | ${md(worldState(stage))} | ${stage.director?.events?.length || 0} | ${stage.director?.hazardDeck?.length || 0} | ${stage.referenceTracks.length} éléments de fiche / ${stage.animations.length} boucles | ${md(stage.fatality?.name)} — ${cinematicSummary(stage.fatality.id).authored ? 'montage écrit, conditions requises' : 'à produire'} |`);
  }
  lines.push(
    '',
    '## Interprétation',
    '',
    'Les fatalités traduisent en langage de jeu de combat des gestes, poursuites, armes, postures et symboles associés aux manifestations. Sauf mention explicite, elles sont des compositions originales et non des reconstitutions de scènes officielles.',
    '',
    'Les arènes dédiées s’appuient sur des lieux nommés ou clairement reconnaissables. Les animations enrichissent la profondeur visuelle sans utiliser de ressources extraites.'
  );
  return `${lines.join('\n')}\n`;
}


function buildStageDirector() {
  const lines = [
    `# Directeur d’arènes et gameplay environnemental — v${VERSION}`,
    '',
    `**${CONTENT_STATS.stages} arènes · ${CONTENT_STATS.terrainProfiles} terrains · ${CONTENT_STATS.shiftStyles} bascules · ${CONTENT_STATS.stageDirectorEvents} événements · ${CONTENT_STATS.stageHazardLinks} liens de danger · ${CONTENT_STATS.stageInteractions} interactions.**`,
    '',
    '> Les lieux, accessoires, climats et motifs sont documentés à partir du catalogue du projet. Les timings, dégâts, zones de danger et déclencheurs restent des adaptations versus originales explicitement séparées du canon.',
    '',
    '## Terrains jouables',
    '',
    '| ID | Nom | Mouvement | Saut | Esquive | Friction | Recul | Garde | Description |',
    '|---|---|---:|---:|---:|---:|---:|---:|---|'
  ];
  for (const [id, terrain] of Object.entries(STAGE_TERRAINS)) lines.push(`| \`${id}\` | ${md(terrain.name)} | ×${terrain.moveScale} | ×${terrain.jumpScale} | ×${terrain.dodgeScale} | ${terrain.friction} | ×${terrain.knockbackScale} | ×${terrain.guardRegenScale} | ${md(terrain.description)} |`);
  lines.push('', '## Bascule des mondes', '', '| ID | Nom | Signal | Durée | Seuil | Radio | Description |', '|---|---|---|---:|---:|---:|---|');
  for (const [id, shift] of Object.entries(STAGE_SHIFT_STYLES)) lines.push(`| \`${id}\` | ${md(shift.name)} | ${md(shift.cue)} | ${shift.duration} f | ${Math.round(shift.threshold * 100)}% | ×${shift.radioScale} | ${md(shift.description)} |`);
  lines.push('', '## Déclencheurs contextuels', '', '- `time-or-first-heavy-impact` : premier impact lourd, rupture d’armure, rebond au sol ou délai initial du lieu.', '- `otherworld-halfway` : transformation du monde arrivée à mi-course.', '- `low-health-or-late-round` : vitalité critique ou dernier quart du temps réglementaire.', '- `director-cadence` : repli autonome quand aucun déclencheur contextuel ne s’active.', '', 'Les événements conservent leur télégraphie et leur zone évitable ; le snapshot mémorise la cause du déclenchement.', '', '## Événements environnementaux', '', '| ID | Nom | Durée | Danger lié | Terrain temporaire | Message |', '|---|---|---:|---|---|---|');
  for (const [id, event] of Object.entries(STAGE_EVENTS)) lines.push(`| \`${id}\` | ${md(event.name)} | ${event.duration} f | ${md(STAGE_HAZARDS[event.hazard]?.name || event.hazard || 'Aucun')} | ${md(event.terrainPulse || 'Aucun')} | ${md(event.message)} |`);
  lines.push('', '## Doctrine par arène', '', '| Arène | Terrain | Bascule | Événements | Déclencheurs | Dangers | Animations | Base lore |', '|---|---|---|---|---|---|---:|---|');
  for (const stage of STAGES) {
    const summary = stageDirectorSummary(stage);
    lines.push(`| ${md(stage.name)} | ${md(summary.terrain.name)} | ${md(worldState(stage))} | ${md(summary.events.map(event => event.name).join(', '))} | ${md((stage.interactions || []).map(interaction => interaction.triggerLabel || interaction.trigger).join(', '))} | ${md(summary.hazards.map(id => STAGE_HAZARDS[id]?.name || id).join(', '))} | ${summary.animations.length} | ${md(stage.lore?.premise)} |`);
  }
  lines.push('', '## Réactions issues des fiches', '',
    `Les ${runtimeCounts.referenceTracks} éléments visuels partiels sont déclarés par leur ID de proposition et leur élément réellement dessiné. Les réactions de lumière, poussière et vapeur utilisent exclusivement \`local-heavy-impact\` : un choc lourd dans la zone normalisée du lieu. Elles ne produisent aucun dégât, ne démarrent pas par simple cadence et respectent la phase autorisée.`, '',
    'Les états et listes de mécanismes de la fiche sont également vérifiés lors des appels directs du moteur, des transitions de boss et des rites. Une famille de décor ne suffit pas à autoriser un événement.');
  return `${lines.join('\n')}\n`;
}

await Promise.all([
  writeFile(join(docs, 'ROSTER.md'), buildRoster()),
  writeFile(join(docs, 'FIDELITY_MATRIX.md'), buildMatrix()),
  writeFile(join(docs, 'COMBAT_SYSTEMS.md'), buildCombatSystems()),
  writeFile(join(docs, 'COVERAGE_AUDIT.md'), buildCoverageAudit()),
  writeFile(join(docs, 'FATALITIES_AND_STAGES.md'), buildFatalitiesAndStages()),
  writeFile(join(docs, 'MOVESETS.md'), buildMovesets()),
  writeFile(join(docs, 'STAGE_DIRECTOR.md'), buildStageDirector())
]);

console.log(`Documentation v${VERSION} générée : roster, movesets, couverture, fatalités, arènes, terrains et directeur environnemental.`);
