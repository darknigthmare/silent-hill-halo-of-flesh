# SILENT HILL: HALO OF FLESH

[![QA](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/workflows/qa.yml/badge.svg)](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/workflows/qa.yml)

Prototype fan-made non commercial de **monster battle 2D**, construit sur l’organisation fonctionnelle de **CQC Versus Legacy v0.56**, puis réécrit autour des manifestations, boss, lieux et symboles de Silent Hill.

- **Jouer :** https://silent-hill-halo-of-flesh.vercel.app
- **Dépôt :** https://github.com/darknigthmare/silent-hill-halo-of-flesh
- **Version :** `0.5.0 — Lore-First Complete Movesets & Signal Interface`

> **Contrat de fidélité** — Le catalogue vise la fidélité documentaire la plus forte possible pour les identités, variantes, proportions relatives, postures, armes, attaques, comportements, fonctions symboliques et lieux. Chaque mouvement distingue ce qui est directement attesté, recomposé de façon lore-friendly ou ajouté pour le versus. Les silhouettes, animations, effets, sons, frame data, statistiques et fatalités sont des créations originales ou procédurales : aucun asset officiel n’est redistribué.

## Contenu

| Contenu | Total |
|---|---:|
| Manifestations jouables | **230** |
| Boss | **75** |
| Sources média auditées | **16** |
| Arènes | **123** |
| Chroniques | **15** |
| Mouvements | **3 680** |
| Actions directement attestées | **425** |
| Composites lore-friendly | **2 796** |
| Adaptations versus | **459** |
| Fatalités de combattant | **460** |
| Fatalités d’arène | **123** |
| Animations d’arène | **374** |
| Transitions de boss | **150** |
| Traits / afflictions / dangers | **12 / 8 / 7** |
| Rites / personnalités IA | **9 / 12** |

Le périmètre réunit les épisodes principaux et dérivés, *P.T.*, *The Short Message*, *Silent Hill f*, les adaptations cinématographiques, *Silent Hill: Ascension* et *Silent Hill: Townfall*.

## v0.5.0 — Movesets complets

Les six attaques génériques de la première architecture ont été remplacées par **seize commandes par manifestation** :

- léger neutre, avant, bas et aérien ;
- lourd neutre, avant, bas et aérien ;
- saisie ;
- technique neutre, avant, arrière, basse et aérienne ;
- Nightmare ;
- mouvement de désespoir à faible vitalité.

Chaque action contient input, démarrage, activité, récupération, dégâts, portée, niveau de garde, annulations et propriétés : projectile, trajectoire, gravité, multi-coups, armor, invulnérabilité, téléportation, piège, aura, contre, lancement, knockdown et affliction.

### Fidélité mouvement par mouvement

- **Directement attesté** : action, arme ou comportement observable dans la source.
- **Composite lore-friendly** : combinaison jouable de plusieurs comportements attestés.
- **Adaptation versus** : action nécessaire au format de combat, signalée sans prétention canonique.

Les apparitions passives et set-pieces adaptés conservent leurs réserves. Le pack *Townfall* emploie des noms établis par guides/trophées lorsque l’éditeur ne publie pas de bestiaire officiel complet.

## Interface Silent Hill

Le Command Center est désormais présenté comme un registre de terrain relié à un récepteur radio/CRTV :

- fréquence et force du signal ;
- code de dossier ;
- carte de preuve et statut du front ;
- hiérarchie asymétrique ;
- brume, parasites, grain, scanlines et marques de rouille ;
- palette vert de moniteur, ivoire sale et rouge de signal.

L’interface reste originale et ne reproduit aucun menu officiel.

## Combat

- Moteur fixe à 60 Hz.
- Résolution directionnelle des seize commandes.
- Garde, garde parfaite, contres et bris de garde.
- Annulations et chaînes data-driven.
- Projectiles multiples, pièges, auras et téléportations.
- Armure, invulnérabilité et postures de contre.
- Jauge Nightmare et désespoir conditionnel.
- Otherworld dynamique, radio et dangers télégraphiés.
- Deux phases pour chacun des 75 boss.
- IA adaptative utilisant distance, propriété des coups et habitudes du joueur.
- Fatalités Signature, Nightmare et environnementales.
- Endurance persistante dans Rites du Jugement et Grands Tourments.
- Rangs S à D pour les Chroniques.

## Modes

- **Confrontation / Versus** — 1P contre CPU ou 2P local.
- **Descente / Arcade** — parcours de sept combats.
- **Rites du Jugement** — huit combats modifiés à endurance persistante.
- **Grands Tourments** — six boss successifs.
- **Salle d’Observation** — hitboxes, jauge libre, reset, inputs, frame data, fidélité, Otherworld et phases.
- **Chroniques de la Brume** — quinze routes avec progression et rang persistant.
- **Archives** — bestiaire, 3 680 mouvements, arènes, fatalités, couverture, rites, IA, phases et records.

## Commandes

### Joueur 1

| Action | Clavier |
|---|---|
| Mouvement | ← / → |
| Saut / accroupi | ↑ / ↓ |
| Garde | Espace |
| Léger / lourd / technique | J / K / I |
| Saisie / Nightmare | U / O |
| Esquive | L |

### Joueur 2

| Action | Clavier |
|---|---|
| Mouvement | Q / D |
| Saut / accroupi | Z / S |
| Garde | A |
| Léger / lourd / technique | F / G / H |
| Saisie / Nightmare | R / T |
| Esquive | V |

La direction et l’état aérien sélectionnent les variantes du moveset. Guide complet : [`docs/CONTROLS.md`](docs/CONTROLS.md).

## Lancer localement

Prérequis : **Node.js 20 ou supérieur**.

```bash
npm start
```

Ouvrir `http://127.0.0.1:4173`.

### QA et build

```bash
npm test
npm run build
npm run verify
```

- `npm test` régénère les documents, vérifie les données, exécute la suite Node et construit `dist/`.
- `npm run build` produit la version statique.
- `npm run verify` contrôle catalogue, movesets, fatalités, arènes, PWA, liens et syntaxe.

## Architecture

```text
.
├── index.html                    # Command Center radio / CRTV
├── modules/
│   ├── unified-versus.html       # sélection, règles, dossiers et combat
│   ├── chronicles.html           # routes narratives
│   ├── archive.html              # bestiaire, movesets et traçabilité
│   ├── roster-command.html       # route compatible CQC
│   ├── finisher-archive.html     # route compatible CQC
│   └── combat-academy.html       # route compatible CQC
├── src/
│   ├── data.js                   # catalogue et profils
│   ├── movesets.js               # 16 actions et fidélité par profil
│   ├── fight.js                  # moteur, IA, coups, phases et fatalités
│   ├── renderers.js              # rendu procédural et Otherworld
│   ├── command.js                # menu principal
│   ├── versus.js                 # modes et sélection
│   ├── chronicles.js             # progression
│   ├── archive.js                # dossiers et exports
│   └── shared.js                 # audio, sauvegarde et utilitaires
├── data/                         # exports JSON
├── docs/                         # GDD, roster, movesets, audit et QA
├── tests/                        # 49 validations automatisées
└── scripts/                      # génération, serveur et build
```

## Exports

- `data/roster.json`
- `data/stages.json`
- `data/chronicles.json`
- `data/sources.json`
- `data/content-stats.json`
- `data/combat-rules.json`
- `data/coverage-audit.json`
- `data/fatalities.json`
- `data/movesets.json`

Documents principaux :

- [`docs/MOVESETS.md`](docs/MOVESETS.md)
- [`docs/ROSTER.md`](docs/ROSTER.md)
- [`docs/FIDELITY_MATRIX.md`](docs/FIDELITY_MATRIX.md)
- [`docs/COVERAGE_AUDIT.md`](docs/COVERAGE_AUDIT.md)
- [`docs/FATALITIES_AND_STAGES.md`](docs/FATALITIES_AND_STAGES.md)
- [`docs/COMBAT_SYSTEMS.md`](docs/COMBAT_SYSTEMS.md)
- [`docs/QA_REPORT.md`](docs/QA_REPORT.md)

## Qualité

La suite v0.5.0 vérifie notamment :

- 230 profils, 123 arènes, 15 Chroniques et 16 sources ;
- 3 680 mouvements et leurs références ;
- variantes directionnelles, désespoir, projectiles, pièges et contres ;
- 460 fatalités, 123 fatalités d’arène et 374 animations ;
- 150 transitions de boss ;
- rendu de chaque manifestation et chaque arène ;
- exports, documents, pages, PWA, cache et build Vercel.

## Statut artistique

Le prototype est jouable et documenté. Une fidélité visuelle image par image exigerait une production artistique originale dédiée : références autorisées, silhouettes multi-vues, sprites, animations correspondant aux seize actions, validation des proportions et contrôle de provenance.

## Licence et propriété intellectuelle

Le code original est fourni sous licence MIT. Les noms et l’univers *Silent Hill* appartiennent à leurs ayants droit respectifs. Voir [`NOTICE.md`](NOTICE.md).
