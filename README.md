# SILENT HILL: HALO OF FLESH

[![QA](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/workflows/qa.yml/badge.svg)](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/workflows/qa.yml)

Prototype jouable fan-made et non commercial de **monster battle 2D**, construit sur l’organisation fonctionnelle de **CQC Versus Legacy v0.56**, puis entièrement réécrit autour des manifestations, boss et lieux de Silent Hill.

- **Jouer :** https://silent-hill-halo-of-flesh.vercel.app
- **Dépôt :** https://github.com/darknigthmare/silent-hill-halo-of-flesh
- **Version :** `0.4.0 — Complete Manifestation & Fatality Pass`

> **Contrat de fidélité** — Le catalogue vise la plus grande fidélité documentaire possible pour les noms, variantes, proportions relatives, signes distinctifs, comportements, fonctions symboliques et lieux associés. Chaque entrée distingue nom officiel ou établi, variante visible et nom descriptif. Les silhouettes, animations, effets, sons, statistiques, fatalités et compositions sont des créations procédurales ou des adaptations originales : aucun sprite, modèle, son, texture ou fichier officiel n’est redistribué.

## Contenu de la v0.4.0

| Contenu | Total |
|---|---:|
| Manifestations jouables | **230** |
| Boss | **75** |
| Sources média auditées | **16** |
| Arènes | **123** |
| Chroniques | **15** |
| Fatalités de combattant | **460** |
| Fatalités d’arène | **123** |
| Animations d’arène | **374** |
| Transitions de boss | **150** |
| Traits / afflictions / dangers | **12 / 8 / 7** |
| Rites / personnalités IA | **9 / 12** |

La couverture réunit les épisodes principaux et dérivés, *P.T.*, *The Short Message*, *Silent Hill f*, les adaptations cinématographiques, *Silent Hill: Ascension* et un pack *Silent Hill: Townfall* dont les noms descriptifs sont explicitement balisés lorsque la nomenclature officielle reste absente ou incomplète.

## Nouveautés majeures

### Audit complet du roster

Le catalogue a été repris source par source. Les manifestations passives, formes uniques, humains hostiles, boss narratifs et variantes réellement distinctes ont été évalués selon des règles explicites. La v0.4.0 ajoute notamment les fantômes nommés de *Silent Hill 4*, plusieurs formes absentes de *Silent Hill 2* et *Silent Hill 3*, des adversaires de *Homecoming*, *The Arcade*, les adaptations cinématographiques récentes et *Townfall*.

L’audit ne prétend pas que chaque adaptation jouable est canonique : `catalogueStatus`, `nameStatus` et `evidenceTier` conservent cette distinction dans les données, les dossiers et les exports.

### Fatalités jouables

Chaque manifestation possède deux séquences :

- une **fatalité Signature**, dérivée de sa posture, de ses armes, de son attaque ou de son rôle documenté ;
- une **fatalité Nightmare**, plus spectaculaire, balisée comme adaptation originale lorsqu’elle n’existe pas dans l’œuvre source.

Chaque arène possède également une fatalité environnementale. Le moteur choisit entre exécution Signature et exécution de stage selon le coup décisif, la position, le danger actif et le type d’attaque finale. Les séquences disposent de leur propre phase de combat, caméra, poses, effets, statistiques et écran de résultat.

### 123 arènes dédiées et animées

Les épisodes disposent désormais de lieux dédiés plutôt que de quelques décors génériques. Les stages prennent en charge :

- Fog World, transition et Otherworld ;
- sirènes, néons, lampes, moniteurs, radios et téléviseurs ;
- chaînes, ventilateurs, ascenseurs, casiers, portes et machineries ;
- pluie, neige, cendres, pétales, vapeur, vagues et eau ;
- ombres, passages de trains, véhicules, carrousels et silhouettes ;
- fatalité propre au lieu et danger télégraphié.

L’option **Animations d’arène** permet de couper cette couche sans désactiver le stage.

### Traçabilité et compatibilité

- Audit de couverture exporté dans `data/coverage-audit.json`.
- Fatalités et animations exportées dans `data/fatalities.json`.
- Anciens identifiants v0.3 conservés comme alias, y compris les profils renommés.
- Documents générés automatiquement pour éviter les écarts entre code, roster, stages et statistiques.

## Systèmes de combat

- Otherworld dynamique avec sirène et transformation progressive.
- Radio de proximité et brouillage contextuel.
- Dangers d’arène télégraphiés.
- Garde parfaite, contres, bris de garde et routes d’annulation.
- Traits, afflictions, projectiles, saisies et Supers par profil.
- Deux phases progressives par boss.
- IA adaptative avec douze personnalités.
- Rites modifiant santé, garde, jauge, vitesse, dangers et Otherworld.
- Endurance persistante dans Rites du Jugement et Grands Tourments.
- Rangs S à D pour les Chroniques.
- Favoris, dossiers, fatalités, records et exports JSON.
- Clavier 2P, deux gamepads et commandes tactiles P1.
- Sauvegarde locale, PWA, build statique et fonctionnement hors ligne.

## Modes

- **Versus** — 1P contre CPU ou 2P local, fatalités, rite et règles configurables.
- **Arcade** — parcours aléatoire de sept combats.
- **Rites du Jugement** — huit combats modifiés à endurance persistante.
- **Grands Tourments** — circuit de six boss à endurance.
- **Observation** — laboratoire de combat, hitboxes, fatalités, IA, Otherworld et phases.
- **Chroniques de la Brume** — quinze routes avec progression, score et rang persistant.
- **Archives** — bestiaire, arènes, couverture, fatalités, rites, IA, phases et records.
- **Roster Command / Finisher Archive / Combat Academy** — routes de compatibilité avec l’organisation de CQC.

## Lancer localement

Prérequis : **Node.js 20 ou supérieur**.

```bash
npm start
```

Ouvrir `http://127.0.0.1:4173`. Les fichiers `run-windows.bat` et `run-linux-macos.sh` lancent aussi le serveur local.

### QA et build

```bash
npm test
npm run build
npm run verify
```

- `npm test` régénère les documents, exécute la suite Node et vérifie le build.
- `npm run build` produit la version statique dans `dist/`.
- `npm run verify` contrôle catalogue, fatalités, arènes, liens, syntaxe et couverture sans reconstruire `dist/`.

## Commandes de combat

### Joueur 1

| Action | Clavier |
|---|---|
| Mouvement | Flèches gauche/droite |
| Saut / accroupi | Flèche haut / bas |
| Garde / garde parfaite | Espace |
| Frappe / lourd / technique | J / K / I |
| Saisie / Nightmare | U / O |
| Esquive | L |

### Joueur 2

| Action | Clavier |
|---|---|
| Mouvement | Q / D |
| Saut / accroupi | Z / S |
| Garde / garde parfaite | A |
| Frappe / lourd / technique | F / G / H |
| Saisie / Nightmare | R / T |
| Esquive | V |

Guide complet : [`docs/CONTROLS.md`](docs/CONTROLS.md).

## Architecture

```text
.
├── index.html                    # Command Center
├── modules/
│   ├── unified-versus.html       # Sélection, règles, fatalités et combat
│   ├── chronicles.html           # Routes narratives et rangs
│   ├── archive.html              # Bestiaire, stages, couverture et fatalités
│   ├── roster-command.html       # Route compatible CQC
│   ├── finisher-archive.html     # Route compatible CQC
│   └── combat-academy.html       # Route compatible CQC
├── src/
│   ├── data.js                   # Roster, stages, fatalités, rites, IA et phases
│   ├── fight.js                  # Moteur fixe à 60 Hz et phase Fatality
│   ├── renderers.js              # Rendu procédural, animations et Otherworld
│   ├── command.js                # Front de commande
│   ├── versus.js                 # Modes, sélection, runs et résultats
│   ├── chronicles.js             # Progression et rangs
│   ├── archive.js                # Dossiers, couverture et exports
│   └── shared.js                 # Audio, sauvegarde et utilitaires
├── data/                         # Exports JSON intégrables
├── docs/                         # GDD, roster, audit, stages, QA et fidélité
├── tests/                        # Données, gameplay, rendu et moteur headless
└── scripts/                      # Serveur, documentation et build reproductibles
```

## Exports

Les fichiers de `data/` sont régénérés depuis `src/data.js` :

- `roster.json`
- `stages.json`
- `chronicles.json`
- `sources.json`
- `content-stats.json`
- `combat-rules.json`
- `coverage-audit.json`
- `fatalities.json`

Documents générés :

- [`docs/ROSTER.md`](docs/ROSTER.md)
- [`docs/FIDELITY_MATRIX.md`](docs/FIDELITY_MATRIX.md)
- [`docs/COVERAGE_AUDIT.md`](docs/COVERAGE_AUDIT.md)
- [`docs/FATALITIES_AND_STAGES.md`](docs/FATALITIES_AND_STAGES.md)
- [`docs/COMBAT_SYSTEMS.md`](docs/COMBAT_SYSTEMS.md)

## Qualité

La validation automatisée contrôle notamment :

- l’unicité et la résolution des **230 profils**, **123 arènes**, **15 Chroniques** et **16 sources** ;
- les **460 fatalités**, **123 fatalités d’arène** et **374 animations** ;
- les alias de sauvegarde v0.3 ;
- le déclenchement d’une fatalité Signature, d’une fatalité d’arène et du KO classique lorsque le système est désactivé ;
- les profils de combat, effets, projectiles, saisies, phases, rites et rangs ;
- le rendu de chaque manifestation et chaque arène, animations activées ou coupées ;
- les exports, documents, pages, PWA, service worker et build Vercel.

Rapports : [`docs/QA_REPORT.md`](docs/QA_REPORT.md) et [`docs/BROWSER_QA_v0.4.0.md`](docs/BROWSER_QA_v0.4.0.md).

## Statut artistique

Le projet constitue une base jouable et documentée. Une fidélité visuelle image par image exigerait une production artistique originale dédiée : recherches autorisées, silhouettes multi-vues, sprites, animations, validation des proportions et de la provenance. Cette release améliore fortement le catalogue et la mise en scène tout en restant une interprétation procédurale, pas une redistribution d’assets officiels.

## Licence et propriété intellectuelle

Le code original est fourni sous licence MIT. Les noms et l’univers *Silent Hill* appartiennent à leurs ayants droit respectifs. Voir [`NOTICE.md`](NOTICE.md).
