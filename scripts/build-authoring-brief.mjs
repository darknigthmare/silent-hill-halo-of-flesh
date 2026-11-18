// Génère un dossier d'authoring pour les assets encore absents.
// Sources uniques : données du dépôt. Aucune observation n'est inventée et
// aucune image n'est produite : le dossier décrit ce qui est documenté,
// ce qui reste à capturer et les contraintes de référence à respecter.
import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {FIGHTER_REFERENCES, STAGE_REFERENCES} from '../src/production-reference.js';
import {STAGE_BITMAPS} from '../src/stage-bitmap-manifest.js';
import {BASE_POSE_KEYS, PRESENTATION_KEYS} from '../src/sprite-poses.js';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const read = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));

const roster = read('data/roster.json');
const sources = read('data/sources.json');
const movesets = read('data/movesets.json');
const fatalities = read('data/fatalities.json');
const stages = read('data/stages.json');
const director = read('data/stage-director.json');
const spriteCoverage = read('data/sprite-coverage.json');

const OUTPUT = 'docs/production/AUTHORING_BRIEF_2026-11-17.md';
const STATUS_LEGEND = [
  'Statuts conservés séparément : identité documentée, comportement documenté, candidat importé, clip animé, fidélité vérifiée.',
  'Une description documentée n’est ni une capture, ni une mesure de timing, ni une validation 1:1.',
  'Une image ou un décor produit depuis ce dossier reste un **candidat** tant qu’une revue visuelle réelle ne l’a pas validé.',
].join('\n\n');

const escapeCell = (value) => String(value ?? '').replaceAll('|', '/').replace(/\s+/g, ' ').trim();
const moveSummary = (entry) => {
  const observed = Array.isArray(entry?.observedMoves) ? entry.observedMoves : [];
  if (!observed.length) return ['- Aucun geste documenté dans les références consultées ; capture à relever.'];
  return observed.map((move) => {
    const status = [move.status, move.captureStatus].filter(Boolean).join(' · ');
    const evidence = Array.isArray(move.evidence) && move.evidence.length ? ` (${move.evidence.join(', ')})` : '';
    return `- **${escapeCell(move.name)}** — ${escapeCell(move.description)}${evidence}${status ? ` — *${escapeCell(status)}*` : ''}`;
  });
};

const entries = spriteCoverage.entries ?? [];
const missingFighters = entries.filter((entry) => !(Number.isSafeInteger(entry.frames) && entry.frames > 0));
const integratedCount = entries.length - missingFighters.length;
const missingStages = stages.filter((stage) => !Object.hasOwn(STAGE_BITMAPS, stage.id));

const bySource = (list) => {
  const counts = new Map();
  for (const item of list) counts.set(item.source, (counts.get(item.source) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
};
const sourceLabel = (key) => {
  const meta = sources[key];
  return meta ? `${meta.label} (${meta.year})` : key;
};

const lines = [];
lines.push('# Dossier d’authoring — assets manquants et correspondance lore', '');
lines.push(`Généré le 2026-11-17 depuis les données du dépôt. **${missingFighters.length} profils sans image acceptée**, **${missingStages.length} arènes sans bitmap**, ${integratedCount}/${entries.length} sprites candidats intégrés, 0 fidélité 1:1 certifiée.`, '');
lines.push(STATUS_LEGEND, '');
lines.push('## Comment utiliser ce dossier', '');
lines.push('1. Choisir un profil ou une arène ci-dessous ; lire la base canonique, les gestes documentés et les contraintes.', '2. Relever la capture ou la référence manquante avant de dessiner : la ligne « capture à relever » indique le blocage réel.', '3. Produire une image individuelle transparente par pose, puis passer par `python scripts/import-sprite.py` (sprites) ou une entrée `STAGE_BITMAPS` (décors).', '4. Après import : `npm run sprites:check`, `npm test`, puis revue visuelle en jeu. Un import réussi n’est pas une certification lore.', '');
lines.push('## Synthèse par œuvre', '', '| Œuvre | Sprites manquants | Arènes sans bitmap |', '|---|---:|---:|');
for (const key of Object.keys(sources)) {
  const fighters = missingFighters.filter((entry) => entry.source === key).length;
  const arenas = missingStages.filter((stage) => stage.source === key).length;
  if (fighters || arenas) lines.push(`| ${escapeCell(sourceLabel(key))} | ${fighters} | ${arenas} |`);
}
lines.push('');

lines.push('## 1. Sprites manquants', '');
lines.push('Poses exigées par le moteur pour chaque profil : ' + [...BASE_POSE_KEYS, 'gestes d’attaque (20 emplacements de moveset)', ...PRESENTATION_KEYS].join(', ') + '. Une pose absente ne doit jamais être fabriquée en recyclant `idle`.', '');
for (const entry of missingFighters) {
  const fighter = roster.find((item) => item.id === entry.id);
  const reference = FIGHTER_REFERENCES[entry.id];
  const moveset = movesets.fighters.find((item) => item.id === entry.id);
  const fate = fatalities.fighters.find((item) => item.id === entry.id);
  lines.push(`### \`${entry.id}\` — ${escapeCell(fighter?.name ?? entry.name)}`, '');
  lines.push(`- **Œuvre / édition :** ${escapeCell(sourceLabel(entry.source))} (\`${entry.source}\`)`);
  lines.push(`- **Catégorie :** ${escapeCell(fighter?.category ?? 'non renseignée')}${fighter?.boss ? ' · boss' : ''}${fighter?.variant ? ` · variante de \`${fighter.variantOf}\`` : ''}`);
  lines.push(`- **Rôle de combat :** ${escapeCell(reference?.combatRole ?? 'non renseigné')} · identité : ${escapeCell(reference?.identityStatus ?? 'non renseignée')}`);
  if (reference?.identityNote) lines.push(`- **Note d’identité :** ${escapeCell(reference.identityNote)}`);
  lines.push(`- **Arène d’affectation :** \`${escapeCell(fighter?.stageId ?? 'non renseignée')}\``);
  lines.push(`- **Comportement canonique déclaré :** ${escapeCell(fighter?.canonicalBehavior ?? 'non renseigné')}`);
  lines.push(`- **Comportement lore :** ${escapeCell(fighter?.lore ?? 'non renseigné')}`);
  lines.push(`- **Références :** ${Array.isArray(reference?.referenceIds) && reference.referenceIds.length ? reference.referenceIds.map((id) => `\`${id}\``).join(', ') : 'aucune référence consultée'}`);
  lines.push('- **Gestes documentés :**');
  lines.push(...moveSummary(reference).map((line) => `  ${line}`));
  if (Array.isArray(reference?.constraints) && reference.constraints.length) {
    lines.push('- **Contraintes de référence :**');
    lines.push(...reference.constraints.map((constraint) => `  - ${escapeCell(constraint)}`));
  }
  if (fate?.fatalities?.length) {
    lines.push(`- **Fatalités du profil (${fate.fatalities.length}) :** ${fate.fatalities.map((item) => `${escapeCell(item.name)} [${escapeCell(item.fidelity)}]`).join(' · ')}`);
  }
  if (moveset?.summary) {
    const summary = moveset.summary;
    lines.push(`- **Répartition des 20 gestes :** ${summary.direct} directs, ${summary.composite} composites, ${summary.adapted} adaptations.`);
  }
  lines.push(`- **État actuel :** ${Number(entry.frames) || 0} image(s) acceptée(s), ${Number(entry.animatedClips) || 0} clip(s) animé(s), fidélité \`${escapeCell(entry.fidelity ?? 'unverified')}\`.`);
  lines.push('- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.');
  lines.push('');
}

lines.push('## 2. Arènes sans bitmap', '');
lines.push('Chaque décor doit rester dans la pièce exacte décrite ci-dessous : aucun accessoire, météo, danger ou animation d’une pièce voisine ne doit être emprunté. Les propositions listées sont des mises en scène du projet, pas des observations.', '');
for (const stage of missingStages) {
  const meta = director.stages.find((item) => item.id === stage.id);
  const reference = STAGE_REFERENCES[stage.id];
  lines.push(`### \`${stage.id}\` — ${escapeCell(stage.name)}`, '');
  lines.push(`- **Œuvre / édition :** ${escapeCell(sourceLabel(stage.source))} (\`${stage.source}\`)`);
  lines.push(`- **Prémisse lore :** ${escapeCell(meta?.lore?.premise ?? reference?.locationNote ?? 'non renseignée')}`);
  lines.push(`- **Base canonique :** ${escapeCell(meta?.lore?.canonicalBasis ?? 'non renseignée')}`);
  lines.push(`- **Fidélité déclarée :** ${escapeCell(meta?.lore?.fidelity ?? 'non renseignée')}`);
  lines.push(`- **Références :** ${Array.isArray(reference?.referenceIds) && reference.referenceIds.length ? reference.referenceIds.map((id) => `\`${id}\``).join(', ') : 'aucune référence consultée'}`);
  lines.push(`- **Famille / météo :** ${escapeCell(stage.family)} · ${escapeCell(stage.weather)}`);
  lines.push(`- **Accessoires autorisés :** ${Array.isArray(stage.props) && stage.props.length ? stage.props.map(escapeCell).join(', ') : 'aucun'}`);
  lines.push(`- **Danger d’arène :** ${escapeCell(stage.hazard ?? 'aucun')} · animations : ${Array.isArray(stage.animations) && stage.animations.length ? stage.animations.map(escapeCell).join(', ') : 'aucune'}`);
  if (Array.isArray(reference?.animations) && reference.animations.length) {
    lines.push('- **Motifs de référence :**');
    lines.push(...reference.animations.map((animation) => `  - **${escapeCell(animation.name)}** — ${escapeCell(animation.description)} — *${escapeCell([animation.status, animation.captureStatus].filter(Boolean).join(' · '))}*`));
  }
  lines.push('- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.');
  lines.push('- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.');
  lines.push('');
}

lines.push('## 3. Limites explicites', '');
lines.push('- Ce dossier ne produit aucune image, aucun timing mesuré et aucune certification 1:1.', '- Les propositions de mise en scène restent des adaptations de versus, distinctes des observations documentées.', '- Les captures marquées « à relever » sont des blocages réels : les contourner reviendrait à inventer le lore.', '- La revue visuelle en jeu reste obligatoire après chaque import (cadrage, armes, ancrage, arrière-plan).');

const markdown = lines.join('\n') + '\n';
writeFileSync(resolve(root, OUTPUT), markdown);
console.log(`Dossier d’authoring généré : ${OUTPUT} (${missingFighters.length} sprites, ${missingStages.length} arènes, ${markdown.split('\n').length} lignes)`);
