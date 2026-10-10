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
    `Catalogue synchronisé : **${CONTENT_STATS.fighters} manifestations**, dont **${CONTENT_STATS.bosses} boss**, réparties sur **${CONTENT_STATS.sources} sources**, avec **${CONTENT_STATS.bossPhases} transitions de boss**.`,
    '',
    '> Les noms servent à documenter le fan-prototype. Les silhouettes, statistiques, timings, effets et finishers sont des créations ou adaptations originales ; aucun asset officiel n’est inclus.',
    ''
  ];

  for (const { id, meta, fighters } of sourceRows()) {
    const sourceStages = STAGES.filter((stage) => stage.source === id);
    lines.push(`## ${meta.label} (${meta.year})`, '');
    lines.push(`**${fighters.length} manifestations · ${fighters.filter((fighter) => fighter.boss).length} boss · ${sourceStages.length} arènes**`, '');
    lines.push('| Manifestation | Type | Archétype | Trait | Affliction | Signature | Arène |', '|---|---|---|---|---|---|---|');
    for (const fighter of fighters) {
      const stage = STAGES.find((entry) => entry.id === fighter.stageId);
      lines.push(`| ${md(fighter.name)} | ${fighter.boss ? 'Boss' : md(fighter.category)} | \`${md(fighter.archetype)}\` | ${md(MANIFESTATION_TRAITS[fighter.trait]?.name || fighter.trait)} | ${md(AFFLICTIONS[fighter.affliction]?.name || fighter.affliction)} | ${md(fighter.signature)} | ${md(stage?.name || fighter.stageId)} |`);
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

function buildMatrix() {
  const lines = [
    `# Matrice de fidélité par source — v${VERSION}`,
    '',
    '| Source | Manifestations | Boss | Arènes | Chroniques | Traits | Afflictions |',
    '|---|---:|---:|---:|---:|---:|---:|'
  ];
  for (const row of sourceRows()) {
    lines.push(`| ${md(row.meta.label)} | ${row.fighters.length} | ${row.bosses.length} | ${row.stages.length} | ${row.chronicles.length} | ${row.traits.size} | ${row.afflictions.size} |`);
  }
  lines.push(
    '',
    `**Total : ${CONTENT_STATS.fighters} manifestations · ${CONTENT_STATS.bosses} boss · ${CONTENT_STATS.stages} arènes · ${CONTENT_STATS.chronicles} Chroniques · ${CONTENT_STATS.sources} sources.**`,
    '',
    '## Contrat de fidélité',
    '',
    'Chaque profil sépare explicitement cinq couches :',
    '',
    '1. **Catalogue** — nom, source, année, variante, statut de boss et lieu associé.',
    '2. **Comportement source** — rythme, portée, posture et attaque caractéristique décrits en texte original.',
    '3. **Silhouette** — primitives et paramètres graphiques originaux organisés par morphologie.',
    '4. **Adaptation versus** — statistiques, timings, affliction, trait et équilibrage, jamais présentés comme canoniques.',
    '5. **Provenance** — aucun modèle, sprite, son, texture ou fichier extrait d’un titre officiel.',
    '',
    '## Limite artistique',
    '',
    'La fidélité documentaire et comportementale est intégrée au catalogue. Une fidélité visuelle finale image par image exige une production artistique dédiée, des références autorisées et une validation de provenance pour chaque variante.'
  );
  return `${lines.join('\n')}\n`;
}

function buildCombatSystems() {
  const lines = [
    `# Systèmes de combat — v${VERSION}`,
    '',
    `La v${VERSION} réunit **${Object.keys(MANIFESTATION_TRAITS).length} traits**, **${Object.keys(AFFLICTIONS).length} afflictions**, **${Object.keys(STAGE_HAZARDS).length} dangers**, **${Object.keys(RITUAL_MODIFIERS).length} rites**, **${Object.keys(AI_PERSONALITIES).length} personnalités IA** et **${CONTENT_STATS.bossPhases} transitions de boss**.`,
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
    '- **IA adaptative** : le CPU repère les actions répétées et choisit distance, garde, esquive ou contre.'
  );
  return `${lines.join('\n')}\n`;
}

await Promise.all([
  writeFile(join(docs, 'ROSTER.md'), buildRoster()),
  writeFile(join(docs, 'FIDELITY_MATRIX.md'), buildMatrix()),
  writeFile(join(docs, 'COMBAT_SYSTEMS.md'), buildCombatSystems())
]);

console.log(`Documentation v${VERSION} générée : roster, matrice de fidélité et systèmes de combat.`);
