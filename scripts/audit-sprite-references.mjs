// Audit des sprites candidats contre leurs références documentées.
// Contrôle des métadonnées : identité, édition, contrat de poses, calibrage,
// cohérence registre / manifeste runtime. Aucune comparaison de pixels avec une
// capture source n'est prétendue : la ressemblance visuelle reste non vérifiée.
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {FIGHTER_REFERENCES} from '../src/production-reference.js';
import {SPRITES} from '../src/sprite-manifest.js';
import {BASE_POSE_KEYS, PRESENTATION_KEYS, validSpriteClipKey} from '../src/sprite-poses.js';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const read = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const roster = read('data/roster.json');
const registry = read('art/registry.json');
const OUTPUT = 'docs/production/SPRITE_REFERENCE_AUDIT_2026-11-17.md';

const byId = new Map(roster.map((fighter) => [fighter.id, fighter]));
const byName = new Map(roster.map((fighter) => [fighter.name, fighter]));
const assets = Object.entries(registry.assets ?? {});
const issues = [];
const add = (id, kind, severity, message) => issues.push({id, kind, severity, message});
const RISKY_IDENTITY = /mal-etiquete|a-corriger|non-confirmee|a-reconcilier|a-verifier|partielle|nuancee|a-calibrer|a-preciser/;
const IDENTITY_TO_ARBITRATE = /mal-etiquete|a-corriger|non-confirmee|a-reconcilier|partielle|a-calibrer|a-preciser/;

for (const [id, asset] of assets) {
  const fighter = byId.get(id);
  const reference = FIGHTER_REFERENCES[id];
  if (asset.fighterId !== id) add(id, 'identité', 'bloquant', `clé de registre « ${id} » différente de \`fighterId\` « ${asset.fighterId} »`);
  if (!fighter) { add(id, 'identité', 'bloquant', 'profil absent de `data/roster.json`'); continue; }
  if (!reference) add(id, 'identité', 'bloquant', 'aucune entrée dans `FIGHTER_REFERENCES`');
  if (!SPRITES[id]) add(id, 'édition', 'bloquant', 'asset absent du manifeste runtime `SPRITES`');
  if (asset.source !== fighter.source) add(id, 'édition', 'bloquant', `source du registre « ${asset.source} » différente du roster « ${fighter.source} »`);
  if (reference && reference.source !== fighter.source) add(id, 'édition', 'bloquant', `source de référence « ${reference.source} » différente du roster « ${fighter.source} »`);
  if (reference && reference.name !== fighter.name) add(id, 'identité', 'à vérifier', `nom de référence « ${reference.name} » différent du roster « ${fighter.name} »`);

  if (reference && IDENTITY_TO_ARBITRATE.test(reference.identityStatus)) {
    add(id, 'identité', 'à arbitrer', `statut documenté « ${reference.identityStatus} » : ${reference.identityNote ?? ''}`);
  }
  if (reference?.baseId) {
    const base = byId.get(reference.baseId);
    if (!base) add(id, 'identité', 'à vérifier', `\`baseId\` inconnu : ${reference.baseId}`);
    else if (base.source !== fighter.source) add(id, 'édition', 'à vérifier', `\`baseId\` rattaché à une autre œuvre : ${reference.baseId} (${base.source})`);
  }
  const variantTarget = fighter.variantOf;
  if (variantTarget && !byId.has(variantTarget) && !byName.has(variantTarget)) {
    add(id, 'identité', 'structurel', `\`variantOf\` « ${variantTarget} » ne correspond ni à un ID ni à un nom exact du roster`);
  }
  const editionYear = (reference?.referenceEdition ?? '').match(/(?:19|20)\d{2}/)?.[0];
  if (editionYear && Number(editionYear) !== fighter.year) {
    add(id, 'édition', 'à vérifier', `édition de référence « ${reference.referenceEdition} » (${editionYear}) alors que le roster déclare ${fighter.year}`);
  }
  if (asset.status !== 'integrated-candidate') add(id, 'édition', 'à vérifier', `statut d’asset inattendu : ${asset.status}`);
  if (asset.fidelity !== 'unverified') add(id, 'édition', 'bloquant', `fidélité déclarée « ${asset.fidelity} » sans preuve associée`);
  if (!asset.singleSubjectReviewed) add(id, 'identité', 'à vérifier', 'revue « sujet unique » non déclarée');

  for (const [index, frame] of asset.frames.entries()) {
    const runtimeFrame = (SPRITES[id]?.frames ?? []).find((candidate) => candidate.path === frame.path);
    if (!runtimeFrame) add(id, 'pose', 'bloquant', `frame absente du manifeste runtime : ${frame.path}`);
    else if (!Array.isArray(runtimeFrame.visibleBounds) || !/^[0-9a-f]{64}$/.test(runtimeFrame.pixelSHA256 ?? '')) {
      add(id, 'pose', 'calibrage', `métadonnées runtime incomplètes (frame ${index}) : cadrage ou déduplication d’animation dégradés`);
    }
    if (!existsSync(resolve(root, frame.path))) add(id, 'pose', 'bloquant', `fichier absent : ${frame.path}`);
    if (![1, -1].includes(frame.facing)) add(id, 'pose', 'bloquant', `\`facing\` invalide (frame ${index})`);
    if (!Array.isArray(frame.anchor) || frame.anchor.length !== 2 || frame.anchor.some((value) => !Number.isFinite(value) || value < 0 || value > 1)) {
      add(id, 'pose', 'bloquant', `ancre invalide (frame ${index})`);
    }
    if (!Number.isFinite(frame.bodyHeight) || frame.bodyHeight < .05 || frame.bodyHeight > 4) add(id, 'pose', 'bloquant', `\`bodyHeight\` invalide : attendu 0.05..4 (frame ${index})`);
    if (!Array.isArray(frame.visibleBounds)) {
      if (Array.isArray(runtimeFrame?.visibleBounds)) add(id, 'pose', 'registre', `\`visibleBounds\` absent du registre source (frame ${index}), recalculé au build : aucune conséquence runtime`);
      else add(id, 'pose', 'calibrage', `\`visibleBounds\` absent (frame ${index}) : le cadrage retombe sur l’image entière`);
    } else {
      const [x0, y0, x1, y1] = frame.visibleBounds;
      if (![x0, y0, x1, y1].every(Number.isFinite) || x0 >= x1 || y0 >= y1) add(id, 'pose', 'bloquant', `\`visibleBounds\` incohérent (frame ${index})`);
      else if (x0 < 0 || y0 < 0 || x1 > frame.width || y1 > frame.height) add(id, 'pose', 'bloquant', `\`visibleBounds\` hors image (frame ${index})`);
    }
    if (!/^assets\/sprites\/.+\.png$/.test(frame.path)) add(id, 'édition', 'à vérifier', `chemin non conforme : ${frame.path}`);
    if (!frame.path.includes(id)) add(id, 'identité', 'structurel', `nom de fichier sans l’ID du profil : ${frame.path}`);
    if (!/^[0-9a-f]{64}$/.test(frame.pixelSHA256 ?? '')) {
      if (/^[0-9a-f]{64}$/.test(runtimeFrame?.pixelSHA256 ?? '')) add(id, 'pose', 'registre', `\`pixelSHA256\` absent du registre source (frame ${index}), recalculé au build`);
      else add(id, 'pose', 'calibrage', `\`pixelSHA256\` absent (frame ${index}) : l’animation réelle n’est pas déduplicable`);
    }
  }

  for (const [key, clip] of Object.entries(asset.clips ?? {})) {
    if (!validSpriteClipKey(key, asset)) add(id, 'pose', 'bloquant', `clé de clip refusée par le contrat : ${key}`);
    const frames = clip.frames ?? [];
    if (!frames.length) add(id, 'pose', 'bloquant', `clip vide : ${key}`);
    if (frames.some((index) => !asset.frames[index])) add(id, 'pose', 'bloquant', `clip ${key} référence une frame absente`);
    if (!Number.isInteger(clip.ticksPerFrame) || clip.ticksPerFrame < 1 || clip.ticksPerFrame > 600) add(id, 'pose', 'bloquant', `durée de clip invalide : ${key}`);
    const pose = key.split('@')[0];
    if (clip.loop && (PRESENTATION_KEYS.includes(pose) || !['idle', 'walk', ...BASE_POSE_KEYS].includes(pose))) {
      add(id, 'pose', 'bloquant', `boucle interdite pour la pose ${key}`);
    }
  }

  const animated = Object.values(asset.clips ?? {}).filter((clip) =>
    new Set((clip.frames ?? []).map((index) => asset.frames[index]?.pixelSHA256).filter(Boolean)).size > 1).length;
  if (animated !== (asset.animatedClips ?? 0)) add(id, 'pose', 'bloquant', `\`animatedClips\` = ${asset.animatedClips ?? 0} alors que ${animated} clip(s) ont des pixels distincts`);
}

const ids = new Set(assets.map(([id]) => id));
const risky = assets.filter(([id]) => FIGHTER_REFERENCES[id] && RISKY_IDENTITY.test(FIGHTER_REFERENCES[id].identityStatus));
const editionMismatches = issues.filter((issue) => issue.kind === 'édition' && /édition de référence/.test(issue.message));
const structuralVariants = issues.filter((issue) => issue.message.startsWith('`variantOf`'));
const calibrationGaps = issues.filter((issue) => issue.severity === 'calibrage');
const registryGaps = issues.filter((issue) => issue.severity === 'registre');
const blockers = issues.filter((issue) => issue.severity === 'bloquant');
const poseCoverage = {idle: 0, extraClips: [], attackClips: 0, presentationClips: 0};
const clipPoses = new Map();
for (const [id, asset] of assets) {
  const keys = Object.keys(asset.clips ?? {});
  if (keys.includes('idle')) poseCoverage.idle += 1;
  const extras = keys.filter((key) => key !== 'idle');
  if (extras.length) poseCoverage.extraClips.push({id, extras});
  for (const key of keys) {
    const pose = key.split('@')[0];
    if (BASE_POSE_KEYS.includes(pose) || PRESENTATION_KEYS.includes(pose)) {
      if (PRESENTATION_KEYS.includes(pose)) poseCoverage.presentationClips += 1;
    } else poseCoverage.attackClips += 1;
    clipPoses.set(pose, (clipPoses.get(pose) ?? 0) + 1);
  }
}
const roleCounts = new Map();
for (const [id] of assets) {
  const role = FIGHTER_REFERENCES[id]?.combatRole ?? 'inconnu';
  roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1);
}
const unillustratedFlagged = Object.entries(FIGHTER_REFERENCES)
  .filter(([id, reference]) => !ids.has(id) && /mal-etiquete|a-corriger|non-confirmee|a-reconcilier|partielle|composite|a-preciser|nuancee/.test(reference.identityStatus))
  .map(([id, reference]) => ({id, status: reference.identityStatus, illustrated: false}));

const lines = [];
lines.push('# Audit des sprites candidats contre leurs références documentées', '');
lines.push('Généré le 2026-11-17 par `npm run audit:references`. **Aucune comparaison de pixels avec une capture source n’est effectuée** : cet audit vérifie les métadonnées, l’identité, l’édition et le contrat de poses. Il ne certifie ni anatomie, ni silhouette, ni fidélité 1:1.', '');
lines.push(`**${assets.length} candidats audités · ${blockers.length} anomalie(s) bloquante(s) · ${issues.filter((issue) => issue.severity === 'à arbitrer').length} identité(s) à arbitrer · ${editionMismatches.length} édition(s) à vérifier · ${calibrationGaps.length} calibrage(s) incomplet(s) · ${registryGaps.length} champ(s) de registre recalculé(s) au build.**`, '');
lines.push('## Résultats de contrôle', '', '| Contrôle | Résultat |', '|---|---|');
lines.push(`| Clé de registre = \`fighterId\` = ID du roster | ${assets.length - issues.filter((issue) => /clé de registre|profil absent/.test(issue.message)).length} / ${assets.length} |`);
lines.push(`| Source identique registre / roster / références | ${assets.length - issues.filter((issue) => /source du registre|source de référence/.test(issue.message)).length} / ${assets.length} |`);
lines.push(`| Présence dans le manifeste runtime | ${assets.length - issues.filter((issue) => /manifeste runtime/.test(issue.message)).length} / ${assets.length} |`);
lines.push(`| Clip \`idle\` présent | ${poseCoverage.idle} / ${assets.length} |`);
lines.push(`| Clés de clips acceptées par le contrat | ${assets.length - issues.filter((issue) => /clé de clip refusée/.test(issue.message)).length} / ${assets.length} |`);
lines.push(`| Compteur d’animations cohérent avec les pixels | ${assets.length - issues.filter((issue) => /animatedClips/.test(issue.message)).length} / ${assets.length} |`);
lines.push(`| Fidélité déclarée non vérifiée (aucune fausse certification) | ${assets.length - issues.filter((issue) => /fidélité déclarée/.test(issue.message)).length} / ${assets.length} |`);
lines.push('');
lines.push('## 1. Identité — arbitrage requis', '');
lines.push('Ces profils sont illustrés alors que la couche de référence signale elle-même une identité à corriger, une édition à fixer ou une documentation partielle. Le sprite ne doit pas être présenté comme validé avant arbitrage.', '');
if (risky.length) {
  lines.push('| Profil | Nom | Statut documenté | Conséquence |', '|---|---|---|---|');
  for (const [id] of risky) {
    const reference = FIGHTER_REFERENCES[id];
    lines.push(`| \`${id}\` | ${byId.get(id)?.name ?? '—'} | \`${reference.identityStatus}\` | ${String(reference.identityNote ?? '').replaceAll('|', '/')} |`);
  }
} else lines.push('Aucun.');
lines.push('');
lines.push('### Identités signalées mais non illustrées', '');
lines.push('Hors périmètre des 154, mais à traiter avant toute production :', '');
if (unillustratedFlagged.length) {
  lines.push('| Profil | Statut |', '|---|---|');
  for (const entry of unillustratedFlagged) lines.push(`| \`${entry.id}\` | \`${entry.status}\` |`);
} else lines.push('Aucune.');
lines.push('');
lines.push('## 2. Édition', '');
if (editionMismatches.length) {
  lines.push('| Profil | Écart |', '|---|---|');
  for (const issue of editionMismatches) lines.push(`| \`${issue.id}\` | ${issue.message.replaceAll('|', '/')} |`);
} else lines.push('Aucun écart d’édition détecté.');
lines.push('');
lines.push('Points d’édition relevés séparément :', '');
lines.push('- `sh2_creeper_025` : `baseId` pointe vers `sh1_creeper_009`, une autre œuvre. La politique interdit tout transfert de capacités, mais le lien de base inter-œuvres reste à confirmer comme simple rapprochement documentaire.');
lines.push('- `film_mannequin_monster_176` : la référence décrit Revelation (2012) alors que le roster porte l’année de la franchise film (2006). L’édition exacte doit être explicite avant toute capture.');
lines.push('- `sh2_lying_figure_crawling_021` : « Crawling » est un état attesté dès 2001, pas une exclusivité du remake ; l’édition de la texture reste à fixer.');
lines.push('');
lines.push('## 3. Poses et calibrage', '');
lines.push(`- ${poseCoverage.idle}/${assets.length} candidats possèdent un clip \`idle\`.`);
lines.push(`- ${poseCoverage.extraClips.length} candidats possèdent des clips supplémentaires : ${poseCoverage.extraClips.map((entry) => `\`${entry.id}\` (${entry.extras.join(', ')})`).join(' · ') || 'aucun'}.`);
lines.push(`- ${poseCoverage.attackClips} clip(s) d’attaque et ${poseCoverage.presentationClips} clip(s) de présentation importés. Les attaques et séquences de fatalité restent donc jouées avec la pose disponible, sans animation dédiée.`);
lines.push('- Les clips existants utilisent les poses : ' + [...clipPoses.entries()].map(([pose, count]) => `\`${pose}\` ×${count}`).join(', ') + '.');
lines.push('- Aucun côté opposé n’est dessiné indépendamment : la politique de miroir reste « présentation seulement ».');
lines.push('');
if (calibrationGaps.length) {
  lines.push('### Calibrage incomplet', '', '| Profil | Détail |', '|---|---|');
  for (const issue of calibrationGaps) lines.push(`| \`${issue.id}\` | ${issue.message.replaceAll('|', '/')} |`);
  lines.push('');
}
if (registryGaps.length) {
  lines.push('### Registre source incomplet, sans conséquence runtime', '', 'Le build recalcule ces champs depuis le PNG ; ils manquent seulement à l’enregistrement d’authoring.', '', '| Profil | Détail |', '|---|---|');
  for (const issue of registryGaps) lines.push(`| \`${issue.id}\` | ${issue.message.replaceAll('|', '/')} |`);
  lines.push('');
}
lines.push('## 4. Structure des variantes', '');
lines.push(`\`variantOf\` stocke un nom d’affichage, pas un ID : ${structuralVariants.length} rattachement(s) ne correspondent à aucun nom exact du roster.`, '');
if (structuralVariants.length) {
  for (const issue of structuralVariants) lines.push(`- \`${issue.id}\` : ${issue.message}`);
}
lines.push('');
lines.push('Conséquence : une variante ne peut pas être reliée automatiquement à son profil parent, et deux œuvres différentes partageant un même nom restent indistinguables par ce champ. Une résolution par ID serait nécessaire pour verrouiller l’édition.');
lines.push('');
lines.push('## 5. Ce que cet audit ne vérifie pas', '');
lines.push('- La ressemblance anatomique, la silhouette, les proportions et les accessoires face à une capture source.');
lines.push('- Les timings, les frames actives et les collisions : ils restent des adaptations de versus.');
lines.push('- L’absence d’éléments d’une autre édition dans le dessin lui-même.');
lines.push('- La fidélité 1:1 : **0 profil certifié**, y compris parmi les 154 candidats.');
lines.push('');
lines.push('## 6. Corrections appliquées', '');
lines.push('Aucune donnée de production n’a été modifiée par cet audit. Les écarts signalés exigent soit une décision de rôle (statuts d’identité), soit une capture de référence (éditions), soit une revue visuelle humaine (calibrage et fidélité). Les corriger automatiquement reviendrait à inventer le lore.');

const markdown = lines.join('\n') + '\n';
writeFileSync(resolve(root, OUTPUT), markdown);
console.log(`Audit généré : ${OUTPUT}`);
console.log(`${assets.length} candidats · ${issues.length} signalements (${blockers.length} bloquants) · ${risky.length} identités à arbitrer`);
