# SILENT HILL: HALO OF FLESH

[![QA](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/workflows/qa.yml/badge.svg)](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/workflows/qa.yml)

Prototype jouable fan-made et non commercial de **monster battle 2D**, construit à partir de la structure de produit et des grands modules de **CQC Versus Legacy v0.56**, puis entièrement réécrit pour un bestiaire Silent Hill.

- **Jouer :** https://silent-hill-halo-of-flesh.vercel.app
- **Dépôt :** https://github.com/darknigthmare/silent-hill-halo-of-flesh
- **Version :** `0.2.0 — Otherworld Combat Systems`

> **Contrat de fidélité** — Le catalogue vise une couverture fidèle des noms, variantes, proportions relatives, signes distinctifs, comportements, rôles et lieux associés. Les silhouettes, animations, effets, sons, statistiques et compositions contenus dans le dépôt sont des créations procédurales ou des adaptations originales. Aucun sprite, modèle, son, texture ou fichier officiel n’est redistribué.

Les captures de référence et les archives de livraison sont conservées dans le dossier Google Drive du projet afin de garder le dépôt Git léger et entièrement orienté source.

## Contenu de la v0.2.0

| Contenu | Total |
|---|---:|
| Manifestations jouables | **184** |
| Boss | **68** |
| Sources | **15** |
| Arènes | **53** |
| Chroniques | **14** |
| Traits de manifestation | **12** |
| Afflictions | **8** |
| Dangers d’arène | **7** |

La couverture actuelle comprend les jeux principaux et dérivés déjà intégrés à la v0.1.0, plus deux ensembles dédiés à l’univers des films et à *Silent Hill: Ascension*.

### Nouveautés majeures

- **Otherworld dynamique** : sirène, transition progressive et transformation visuelle pendant le round.
- **Radio de proximité** : parasites plus intenses lorsque la menace se rapproche.
- **Dangers d’arène télégraphiés** : débris, marée de sang, gel, floraison, cendres, chaînes et surtension radio.
- **Traits individuels** : armure de rouille, marche phasée, suppression, constriction, profil bas et autres identités de gameplay.
- **Afflictions persistantes** : hémorragie, parasites, entrave, corrosion, brûlure, effroi, gel et floraison.
- **Garde parfaite et contres** : nouvelles fenêtres défensives, feedback distinct et statistiques dédiées.
- **Annulations et chaînes** : routes de coups définies dans chaque profil de combat.
- **Rangs S à D** pour les Chroniques selon la performance réelle.
- **Dossiers enrichis** : trait, affliction, finisher, danger lié, propriétés des coups et adaptation versus.
- **Observation étendue** : hitboxes, auto-soin, jauge libre, reset et bascule Otherworld forcée.

## Modes

- **Versus** — 1P contre CPU ou 2P local, règles et difficulté configurables.
- **Arcade** — parcours aléatoire de sept combats.
- **Grands Tourments** — circuit de six boss.
- **Observation** — laboratoire de combat et lecture des hitboxes.
- **Chroniques de la Brume** — quatorze routes avec progression, score et rang persistant.
- **Archives** — bestiaire, arènes, matrice de fidélité, finishers, systèmes, records et export JSON.
- **Roster Command / Finisher Archive / Combat Academy** — routes de compatibilité avec l’organisation de CQC.

## Lancer localement

Prérequis : **Node.js 20 ou supérieur**.

```bash
npm start
```

Ouvrir ensuite `http://127.0.0.1:4173`. Les fichiers `run-windows.bat` et `run-linux-macos.sh` lancent directement le serveur local.

### QA et build

```bash
npm test
npm run build
npm run verify
```

- `npm test` régénère les documents synchronisés, exécute la suite Node et vérifie le build.
- `npm run build` crée la version statique dans `dist/`.
- `npm run verify` contrôle le catalogue, les profils, les liens, la syntaxe et les fichiers requis sans reconstruire `dist/`.

## Commandes de combat

### Joueur 1

| Action | Clavier |
|---|---|
| Mouvement | Flèches gauche/droite |
| Saut | Flèche haut |
| Accroupi | Flèche bas |
| Garde / garde parfaite | Espace |
| Frappe | J |
| Attaque lourde | K |
| Technique signature | I |
| Saisie | U |
| Nightmare / Super | O |
| Esquive | L |

### Joueur 2

| Action | Clavier |
|---|---|
| Mouvement | Q / D |
| Saut | Z |
| Accroupi | S |
| Garde / garde parfaite | A |
| Frappe | F |
| Attaque lourde | G |
| Technique signature | H |
| Saisie | R |
| Nightmare / Super | T |
| Esquive | V |

Les deux premiers gamepads reconnus peuvent également être utilisés. Une interface tactile P1 peut être activée depuis la sélection.

Guide complet : [`docs/CONTROLS.md`](docs/CONTROLS.md).

## Architecture

```text
.
├── index.html                    # Command Center
├── modules/
│   ├── unified-versus.html       # Sélection, règles et moteur de combat
│   ├── chronicles.html           # Routes narratives et rangs
│   ├── archive.html              # Bestiaire, systèmes, fidélité, finishers
│   ├── roster-command.html       # Route de compatibilité CQC
│   ├── finisher-archive.html     # Route de compatibilité CQC
│   └── combat-academy.html       # Route de compatibilité CQC
├── src/
│   ├── data.js                   # Catalogue et règles centralisés
│   ├── fight.js                  # Moteur de combat fixe à 60 Hz
│   ├── renderers.js              # Rendu procédural et Otherworld
│   ├── command.js                # Front de commande
│   ├── versus.js                 # Modes, sélection et résultats
│   ├── chronicles.js             # Progression et rangs
│   ├── archive.js                # Consultation et exports
│   └── shared.js                 # Audio, sauvegarde, utilitaires
├── data/                         # Exports JSON intégrables
├── docs/                         # GDD, roster, règles, QA et fidélité
├── tests/                        # Tests données, gameplay et moteur headless
└── scripts/                      # Serveur, documentation et build reproductibles
```

## Données et intégration

Les exports de `data/` sont régénérés depuis `src/data.js` :

- `roster.json`
- `stages.json`
- `chronicles.json`
- `sources.json`
- `content-stats.json`
- `combat-rules.json`

Chaque combattant sépare notamment :

- `canonicalBehavior` — comportement source reformulé ;
- `adaptation` — compromis de jeu de combat ;
- `visual` — paramètres du rendu original ;
- `trait`, `affliction` et `finisher` — identité mécanique ;
- `stageId`, `signature`, `archetype`, `variantOf` et tags.

Documents générés depuis les données :

- [`docs/ROSTER.md`](docs/ROSTER.md)
- [`docs/FIDELITY_MATRIX.md`](docs/FIDELITY_MATRIX.md)
- [`docs/COMBAT_SYSTEMS.md`](docs/COMBAT_SYSTEMS.md)

## Qualité

La v0.2.0 dispose de **29 tests automatisés réussis** avant la passe finale de publication. Ils couvrent :

- unicité et résolution de toutes les références ;
- cohérence des 184 profils, 53 arènes et 14 Chroniques ;
- présence des douze traits, huit afflictions et sept dangers ;
- intégrité des six coups et des routes d’annulation de chaque profil ;
- identité des boss, projectiles, saisies et Supers ;
- classement S–D ;
- exécution et rendu du moteur sur un canvas headless ;
- transformation Otherworld forcée et options d’entraînement ;
- syntaxe JavaScript, ressources HTML, PWA et build Vercel.

Rapport détaillé : [`docs/QA_REPORT.md`](docs/QA_REPORT.md).

## Statut artistique

Le projet constitue une base jouable, extensible et publiable. La fidélité finale « 1:1 » des représentations demanderait une production artistique dédiée par manifestation : références autorisées, proportions multi-vues, sprites originaux, animations, validation de lisibilité et validation de provenance. Le registre actuel prépare cette production sans employer d’assets extraits.

## Licence et propriété intellectuelle

Le code original est fourni sous licence MIT. Les noms et l’univers *Silent Hill* appartiennent à leurs ayants droit respectifs. Voir [`NOTICE.md`](NOTICE.md).
