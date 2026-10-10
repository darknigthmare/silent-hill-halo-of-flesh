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
  createBossPhases
} from '../src/data.js';

const project = resolve(fileURLToPath(new URL('../', import.meta.url)));
const docs = join(project, 'docs');

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
    `Catalogue synchronisé : **${CONTENT_STATS.fighters} manifestations**, dont **${CONTENT_STATS.bosses} boss**, réparties sur **${CONTENT_STATS.sources} sources**, avec **${CONTENT_STATS.bossPhases} transitions de boss**, **${CONTENT_STATS.fatalities} fatalités jouables** et **${CONTENT_STATS.stageAnimations} animations d’arène**.`,
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
      lines.push(`| ${md(fighter.name)} | ${fighter.boss ? 'Boss' : md(fighter.category)} | \`${md(fighter.archetype)}\` | ${md(MANIFESTATION_TRAITS[fighter.trait]?.name || fighter.trait)} | ${md(AFFLICTIONS[fighter.affliction]?.name || fighter.affliction)} | ${fighter.fatalities?.length || 0} | ${md(fighter.catalogueStatus)} / ${md(fighter.nameStatus)} | ${md(stage?.name || fighter.stageId)} |`);
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
    '| Source | Manifestations | Boss | Arènes | Animations | Fatalités | Couverture |',
    '|---|---:|---:|---:|---:|---:|---|'
  ];
  for (const row of sourceRows()) {
    const entry = audit.sources[row.id];
    const animations = row.stages.reduce((sum, stage) => sum + (stage.animations?.length || 0), 0);
    const fatalities = row.fighters.reduce((sum, fighter) => sum + (fighter.fatalities?.length || 0), 0) + row.stages.filter((stage) => stage.fatality).length;
    lines.push(`| ${md(row.meta.label)} | ${row.fighters.length} | ${row.bosses.length} | ${row.stages.length} | ${animations} | ${fatalities} | ${entry.complete ? 'Vérifiée' : `Lacunes : ${md(entry.missing.join(', '))}`} |`);
  }
  lines.push(
    '',
    `**Total : ${CONTENT_STATS.fighters} manifestations · ${CONTENT_STATS.bosses} boss · ${CONTENT_STATS.stages} arènes · ${CONTENT_STATS.stageAnimations} animations · ${CONTENT_STATS.fatalities} fatalités combattant · ${CONTENT_STATS.stageFatalities} fatalités d’arène · ${CONTENT_STATS.sources} sources.**`,
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
    'La mention « vérifiée » signifie qu’aucune lacune connue n’a été retrouvée dans le périmètre des seize packs média intégrés à cette release. Elle ne transforme pas les fatalités originales de ce fan-game en scènes canoniques.'
  );
  return `${lines.join('\n')}\n`;
}

function buildCombatSystems() {
  const lines = [
    `# Systèmes de combat — v${VERSION}`,
    '',
    `La v${VERSION} réunit **${Object.keys(MANIFESTATION_TRAITS).length} traits**, **${Object.keys(AFFLICTIONS).length} afflictions**, **${Object.keys(STAGE_HAZARDS).length} dangers**, **${Object.keys(RITUAL_MODIFIERS).length} rites**, **${Object.keys(AI_PERSONALITIES).length} personnalités IA** et **${CONTENT_STATS.bossPhases} transitions de boss**, **${CONTENT_STATS.fatalities} fatalités de combattant**, **${CONTENT_STATS.stageFatalities} fatalités d’arène** et **${CONTENT_STATS.stageAnimations} animations d’arène**.`,
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
    '- **Contre** : toucher pendant le démarrage adverse augmente l’impact et alimente les statistiques de rang.',
    '- **Annulations** : les chaînes autorisées sont déclarées coup par coup dans le profil de combat.',
    '- **Otherworld dynamique** : une sirène annonce la transformation progressive de l’arène pendant le combat.',
    '- **Radio de proximité** : l’intensité des parasites augmente avec la proximité et le danger immédiat.',
    '- **Dangers télégraphiés** : les arènes annoncent une zone avant l’impact afin de rester évitables et lisibles.',
    '- **Rang de Chronique** : S à D selon vitalité restante, dégâts, combo, gardes parfaites, contres et dangers subis.',
    '- **Observation** : hitboxes, historique des inputs, soin automatique, jauge libre, reset, transformation Otherworld et phase de boss forcées.',
    '- **Rites du Jugement** : huit combats à modificateur tournant, vitalité et jauge partiellement conservées.',
    '- **IA adaptative** : le CPU repère les actions répétées et choisit distance, garde, esquive ou contre.',
    '- **Fatalités signature** : deux séquences data-driven par manifestation, déclenchées par coup décisif, avec base canonique et statut de fidélité.',
    '- **Fatalités d’arène** : chaque lieu possède une exécution environnementale originale dérivée de ses dangers et de sa mise en scène.',
    '- **Arènes animées** : éclairages, sirènes, chaînes, eau, météo, machineries, ombres et décors réagissent au temps et à l’Otherworld.'
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
    '- Les créatures non combattues dans leur œuvre d’origine sont marquées comme adaptations.',
    '- Lorsqu’aucun bestiaire officiel ne nomme une créature, le nom descriptif est explicitement signalé.',
    '- Les fatalités sont originales et inspirées de comportements documentés ; elles ne sont pas présentées comme des scènes officielles.'
  );
  return `${lines.join('\n')}\n`;
}

function buildFatalitiesAndStages() {
  const lines = [
    `# Fatalités, arènes dédiées et animations — v${VERSION}`,
    '',
    `La release contient **${CONTENT_STATS.fatalities} fatalités de combattant**, **${CONTENT_STATS.stageFatalities} fatalités d’arène** et **${CONTENT_STATS.stageAnimations} animations de stage**.`,
    '',
    '## Fatalités de combattant',
    '',
    '| Combattant | Source | Signature | Nightmare | Base de fidélité |',
    '|---|---|---|---|---|'
  ];
  for (const fighter of ROSTER) {
    const [signature, nightmare] = fighter.fatalities || [];
    lines.push(`| ${md(fighter.name)} | ${md(SOURCE_META[fighter.source]?.short || fighter.source)} | ${md(signature?.name)} | ${md(nightmare?.name)} | ${md(signature?.canonicalBasis)} |`);
  }
  lines.push('', '## Arènes dédiées', '', '| Arène | Source | Famille | Fatalité d’arène | Animations |', '|---|---|---|---|---|');
  for (const stage of STAGES) {
    lines.push(`| ${md(stage.name)} | ${md(SOURCE_META[stage.source]?.short || stage.source)} | ${md(stage.family)} | ${md(stage.fatality?.name)} | ${md((stage.animations || []).join(', '))} |`);
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

await Promise.all([
  writeFile(join(docs, 'ROSTER.md'), buildRoster()),
  writeFile(join(docs, 'FIDELITY_MATRIX.md'), buildMatrix()),
  writeFile(join(docs, 'COMBAT_SYSTEMS.md'), buildCombatSystems()),
  writeFile(join(docs, 'COVERAGE_AUDIT.md'), buildCoverageAudit()),
  writeFile(join(docs, 'FATALITIES_AND_STAGES.md'), buildFatalitiesAndStages())
]);

console.log(`Documentation v${VERSION} générée : roster, couverture, fatalités, arènes et systèmes de combat.`);
