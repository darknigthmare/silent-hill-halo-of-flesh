# SILENT HILL: HALO OF FLESH

[![QA](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/workflows/qa.yml/badge.svg)](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/workflows/qa.yml)

Prototype jouable fan-made et non commercial de **monster battle 2D**, construit à partir de la structure de produit et des grands modules de **CQC Versus Legacy v0.56**, puis entièrement réécrit autour du bestiaire de Silent Hill.

- **Jouer :** https://silent-hill-halo-of-flesh.vercel.app
- **Dépôt :** https://github.com/darknigthmare/silent-hill-halo-of-flesh
- **Version :** `0.3.0 — Rituals & Boss Phases`

> **Contrat de fidélité** — Le catalogue vise une couverture fidèle des noms, variantes, proportions relatives, signes distinctifs, comportements, rôles et lieux associés. Les silhouettes, animations, effets, sons, statistiques et compositions contenus dans le dépôt sont des créations procédurales ou des adaptations originales. Aucun sprite, modèle, son, texture ou fichier officiel n’est redistribué.

Les captures de référence et les archives de livraison sont conservées dans le dossier Google Drive du projet afin de garder le dépôt Git orienté source.

## Contenu de la v0.3.0

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
| Rites, standard inclus | **9** |
| Personnalités IA | **12** |
| Transitions de boss | **136** |

La couverture réunit les épisodes principaux et dérivés, *P.T.*, *The Short Message*, *Silent Hill f*, les adaptations cinématographiques et *Silent Hill: Ascension*.

## Nouveautés majeures

### Rites du Jugement

Un gauntlet à endurance de huit combats fait tourner huit modificateurs actifs : Brume épaisse, Dette de sang, Garde fissurée, Orage parasite, Silence sacré, Nuit de l’exécution, Aucune échappatoire et Jugement rouge. La vitalité et une partie de la jauge sont conservées entre les combats, avec récupération limitée.

### Phases de boss

Les 68 boss disposent désormais de deux transitions data-driven, soit 136 phases. Les seuils peuvent modifier vitesse, puissance, armure, récupération, jauge, dangers et état Otherworld. Le mode Observation peut forcer chaque transition pour la QA et l’équilibrage.

### IA adaptative

Chaque archétype reçoit une personnalité dédiée : portée préférée, agressivité, défense, fréquence de saisie, esquive, garde et projectile. Lorsque l’option est active, le CPU lit les répétitions du joueur et répond aux habitudes trop prévisibles.

### Endurance et continuité

Grands Tourments et Rites du Jugement emploient une santé persistante, une jauge partiellement conservée et une récupération paramétrée. Les résultats affichent le combat courant, le rite, la progression et les statistiques avancées.

### Observation technique

Le laboratoire affiche l’état du joueur, le coup actif, la distance, le trait, le statut, la phase du boss et les derniers inputs. Il permet de forcer l’Otherworld, la phase suivante, l’auto-soin, la jauge libre et les hitboxes.

### Durcissement navigateur

L’audio procédural et les vibrations restent silencieux avant une interaction réelle. Les lancements directs, captures et tests headless ne provoquent plus d’appels interdits par les politiques d’autoplay.

## Systèmes déjà présents

- Otherworld dynamique avec sirène et transition progressive.
- Radio de proximité et brouillage contextuel.
- Dangers d’arène télégraphiés.
- Garde parfaite, contres, bris de garde et routes d’annulation.
- Traits, afflictions, projectiles, saisies et Supers propres aux profils.
- Rangs S à D pour les Chroniques.
- Favoris, dossiers, finishers, records et export JSON.
- Clavier 2P, deux gamepads et commandes tactiles P1.
- Sauvegarde locale, PWA, build statique et fonctionnement hors ligne.

## Modes

- **Versus** — 1P contre CPU ou 2P local, rite et règles configurables.
- **Arcade** — parcours aléatoire de sept combats.
- **Rites du Jugement** — huit combats modifiés à endurance persistante.
- **Grands Tourments** — circuit de six boss à endurance.
- **Observation** — laboratoire de combat, IA, hitboxes, Otherworld et phases.
- **Chroniques de la Brume** — quatorze routes avec progression, score et rang persistant.
- **Archives** — bestiaire, arènes, fidélité, finishers, rites, IA, phases et records.
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

- `npm test` régénère les documents, exécute les tests Node et vérifie le build.
- `npm run build` crée la version statique dans `dist/`.
- `npm run verify` contrôle le catalogue, les profils, les liens et la syntaxe sans reconstruire `dist/`.

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
│   ├── unified-versus.html       # Sélection, rites, runs et combat
│   ├── chronicles.html           # Routes narratives et rangs
│   ├── archive.html              # Bestiaire, IA, phases et fidélité
│   ├── roster-command.html       # Route compatible CQC
│   ├── finisher-archive.html     # Route compatible CQC
│   └── combat-academy.html       # Route compatible CQC
├── src/
│   ├── data.js                   # Catalogue, rites, IA et phases
│   ├── fight.js                  # Moteur fixe à 60 Hz
│   ├── renderers.js              # Rendu procédural et Otherworld
│   ├── command.js                # Front de commande
│   ├── versus.js                 # Modes, runs, sélection et résultats
│   ├── chronicles.js             # Progression et rangs
│   ├── archive.js                # Consultation et exports
│   └── shared.js                 # Audio, sauvegarde, utilitaires
├── data/                         # Exports JSON intégrables
├── docs/                         # GDD, roster, règles, QA et fidélité
├── tests/                        # Données, gameplay, rendu et moteur headless
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

`combat-rules.json` expose les traits, afflictions, dangers, rites et personnalités IA. Chaque boss transporte ses phases ordonnées dans son profil exporté.

Documents générés depuis les données :

- [`docs/ROSTER.md`](docs/ROSTER.md)
- [`docs/FIDELITY_MATRIX.md`](docs/FIDELITY_MATRIX.md)
- [`docs/COMBAT_SYSTEMS.md`](docs/COMBAT_SYSTEMS.md)

## Qualité

La v0.3.0 dispose de **36 tests automatisés réussis** et d’une passe navigateur réelle sur sept vues. La validation couvre :

- les 184 profils, 53 arènes, 14 Chroniques et 15 sources ;
- les 12 traits, 8 afflictions, 7 dangers, 9 rites et 12 personnalités IA ;
- les 136 phases de boss et leurs seuils ordonnés ;
- l’endurance, la jauge conservée et le démarrage Otherworld ;
- l’IA, les projectiles, saisies, Supers et rangs ;
- le rendu de chaque manifestation et de chaque arène ;
- les pages principales, le responsive mobile, la PWA et le build Vercel ;
- l’absence d’exception JavaScript dans les captures navigateur.

Rapports : [`docs/QA_REPORT.md`](docs/QA_REPORT.md) et [`docs/BROWSER_QA_v0.3.0.md`](docs/BROWSER_QA_v0.3.0.md).

## Statut artistique

Le projet constitue une base jouable, extensible et publiable. La fidélité visuelle finale image par image demande une production artistique dédiée par manifestation : références autorisées, proportions multi-vues, sprites originaux, animations, validation de lisibilité et validation de provenance. Le registre actuel prépare cette production sans employer d’assets extraits.

## Licence et propriété intellectuelle

Le code original est fourni sous licence MIT. Les noms et l’univers *Silent Hill* appartiennent à leurs ayants droit respectifs. Voir [`NOTICE.md`](NOTICE.md).
