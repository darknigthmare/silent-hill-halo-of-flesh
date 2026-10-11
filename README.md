# SILENT HILL: HALO OF FLESH

[![QA](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/workflows/qa.yml/badge.svg)](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/workflows/qa.yml)

Prototype fan-made non commercial de **monster battle 2D**, construit sur l’organisation fonctionnelle de **CQC Versus Legacy v0.56**, puis entièrement réécrit autour des manifestations, boss, lieux, comportements et symboles de *Silent Hill*.

- **Jouer :** https://silent-hill-halo-of-flesh.vercel.app
- **Dépôt :** https://github.com/darknigthmare/silent-hill-halo-of-flesh
- **Version :** `0.7.0 — Living Otherworld Stage Director`

> **Contrat de fidélité** — Le catalogue vise la fidélité documentaire la plus forte possible pour les identités, variantes, proportions relatives, postures, armes, attaques, comportements, fonctions symboliques et lieux. Chaque mouvement distingue ce qui est directement attesté, recomposé de façon lore-friendly ou ajouté pour rendre une manifestation jouable dans un versus. Les silhouettes, animations, effets, sons, frame data, statistiques et fatalités sont des créations originales ou procédurales : aucun asset officiel n’est redistribué.

## Contenu

| Contenu | Total |
|---|---:|
| Manifestations jouables | **230** |
| Boss | **75** |
| Sources média auditées | **16** |
| Arènes | **123** |
| Chroniques | **15** |
| Commandes par manifestation | **20** |
| Mouvements documentés | **4 600** |
| Actions directement attestées | **447** |
| Composites lore-friendly | **3 694** |
| Adaptations versus | **459** |
| Fatalités de combattant | **460** |
| Fatalités d’arène | **123** |
| Animations d’arène | **374** |
| Événements de directeur | **446** |
| Interactions de lieu | **359** |
| Liens de danger | **474** |
| Terrains / bascules Otherworld | **14 / 15** |
| Transitions de boss | **150** |
| Traits / afflictions / dangers | **12 / 8 / 29** |
| Rites / personnalités IA | **9 / 12** |

Le périmètre réunit les épisodes principaux et dérivés, *P.T.*, *The Short Message*, *Silent Hill f*, les adaptations cinématographiques, *Silent Hill: Ascension* et *Silent Hill: Townfall*.

## v0.7.0 — Living Otherworld Stage Director

Cette passe transforme les 123 arènes en systèmes de combat propres au lieu plutôt qu’en simples variantes visuelles :

- **14 terrains** modifient réellement mouvement, saut, esquive, friction, recul et récupération de garde ;
- **15 styles de bascule** donnent à chaque source son langage Otherworld : rouille, décomposition, hantise, miroir, glace, boucle, floraison, sanctuaire, signal CRTV ou effondrement du vide ;
- **22 événements environnementaux** pilotent panne, sirène, casiers, chariot, train, vapeur, montée des eaux, miroir, racines, projecteur, CRTV, cloche, vide, cendre, ascenseur, pièce respirante, orage, gel et rituel ;
- **29 dangers télégraphiés** utilisent des zones en cercle, ligne, bord, balayage, centre, anneau ou totalité de l’arène ;
- **446 événements**, **359 interactions** et **474 liens de danger** sont distribués dans les 123 profils de stage ;
- les trois premières interactions de chaque lieu répondent désormais à un **impact lourd**, au **mi-chemin de la bascule Otherworld** et à la **pression de fin de round**, au lieu de dépendre uniquement d’un chronomètre ;
- les Archives détaillent terrain, visibilité, transformation, danger, animation, événement et distinction entre motif canonique et règle de versus.

Le moteur prend désormais en charge les sols inondés, glissants, boueux, étroits, instables, floraux, rituels et impossibles. Une arène peut changer temporairement de terrain pendant un événement : l’eau monte, les racines gagnent le sol, la glace prend ou le vide altère la géométrie.

Détails : [`docs/STAGE_DIRECTOR.md`](docs/STAGE_DIRECTOR.md), [`docs/LORE_STAGE_GAMEPLAY.md`](docs/LORE_STAGE_GAMEPLAY.md) et [`docs/RELEASE_NOTES_v0.7.0.md`](docs/RELEASE_NOTES_v0.7.0.md).

## v0.6.1 — Signal Recovery & Platform Hardening

Cette release de stabilité conserve intégralement le roster, les 4 600 mouvements et les règles lore-first de la v0.6.0, puis sécurise leur distribution :

- export et import contrôlés de la mémoire locale ;
- reset complet des données propres au projet ;
- purge et réarmement du cache hors ligne ;
- service worker à caches séparés, shell initial léger et données network-first ;
- véritable page hors ligne et véritable réponse HTTP 404 ;
- manifeste PWA enrichi avec raccourcis Confrontation, Observation et Archives ;
- en-têtes de sécurité alignés entre serveur local et Vercel ;
- modale accessible avec piège de focus, restauration, états ARIA et région de statut ;
- communications iframe limitées à la bonne fenêtre et à la même origine ;
- animations suspendues hors vue et respect renforcé du mouvement réduit.

La suite atteint **63 tests automatisés**. La QA Chromium couvre **13 parcours et 20 assertions**, sans erreur console, avertissement, exception, échec réseau inattendu ni débordement horizontal.

Détails : [`docs/PLATFORM_HARDENING.md`](docs/PLATFORM_HARDENING.md) et [`docs/RELEASE_NOTES_v0.6.1.md`](docs/RELEASE_NOTES_v0.6.1.md).

## v0.6.0 — Doctrine contextuelle

Chaque manifestation dispose de vingt entrées réellement exécutables :

- huit attaques normales : léger et lourd, chacun en neutre, avant, bas et aérien ;
- saisie avant et projection arrière ;
- riposte après esquive ;
- contre après garde parfaite ;
- attaque de relevée ;
- cinq techniques : neutre, avant, arrière, basse et aérienne ;
- Nightmare à jauge pleine ;
- mouvement de désespoir à faible vitalité.

Les quatre nouvelles options contextuelles ne sont pas de simples lignes de codex : elles disposent de fenêtres d’activation, statistiques, propriétés et tests moteur spécifiques.

### Contrats contextuels

| Commande | Fonction mécanique |
|---|---|
| `← + T` | projection arrière, changement de côté et chute dure |
| `ESQUIVE + L` | contre-attaque pendant la fenêtre de sortie d’esquive |
| `P-GUARD + H` | riposte après garde parfaite, capable de briser l’armure |
| `RELEVÉE + S` | reversal invulnérable avec rebond au sol |

Chaque action contient input, démarrage, activité, récupération, dégâts, portée, hauteur, coût, annulations et propriétés : projectile, trajectoire, gravité, multi-coups, armure, rupture d’armure, invulnérabilité, téléportation, piège, aura, contre, changement de côté, lancement, chute dure, rebond et affliction.

### Fidélité mouvement par mouvement

- **Directement attesté** : action, arme ou comportement observable dans la source.
- **Composite lore-friendly** : combinaison jouable de plusieurs comportements attestés.
- **Adaptation versus** : action nécessaire au format de combat, signalée sans prétention canonique.

Les apparitions passives et set-pieces adaptés conservent leurs réserves. Les appellations de *Townfall* issues de guides post-sortie sont balisées comme telles lorsque l’annonce officielle ne fournit pas de bestiaire nommé.

## Interface Silent Hill

Le menu principal est présenté comme un registre de terrain relié à un récepteur radio/CRTV :

- fréquence et force du signal ;
- code de dossier et fiche de preuve ;
- carrés rouges, papier souillé, rouille, brume et parasites ;
- hiérarchie asymétrique et transitions instables ;
- désignation **Sujet I / Sujet II** plutôt que joueurs génériques ;
- navigation **Retour à la Brume** ;
- fenêtres de riposte affichées dans le HUD et la Salle d’Observation ;
- dossiers listant les vingt commandes et leur niveau de preuve.

L’interface reste originale et ne reproduit aucun menu officiel.

## Combat

- Moteur fixe à 60 Hz.
- Résolution directionnelle et contextuelle des vingt commandes.
- Garde, garde parfaite, contre, rupture d’armure et bris de garde.
- Esquive, riposte d’esquive, projection arrière et reversal de relevée.
- Annulations et chaînes data-driven.
- Projectiles multiples, pièges, auras et téléportations.
- Armure, invulnérabilité, changement de côté, chute dure et rebond au sol.
- Jauge Nightmare et désespoir conditionnel.
- Otherworld dynamique par lieu, radio, quatorze terrains et vingt-neuf dangers télégraphiés.
- Directeur d’arène avec événements, interactions et terrain temporaire cohérents avec la source.
- Deux phases pour chacun des 75 boss.
- IA adaptative utilisant distance, propriété des coups et habitudes du joueur.
- Fatalités Signature, Nightmare et environnementales.
- Endurance persistante dans Rites du Jugement et Grands Tourments.
- Rangs S à D pour les Chroniques.

## Modes

- **Confrontation** — Sujet I contre CPU ou deux sujets locaux.
- **Descente** — parcours de sept combats.
- **Rites du Jugement** — huit combats modifiés à endurance persistante.
- **Grands Tourments** — six boss successifs.
- **Salle d’Observation** — hitboxes, jauge libre, reset, inputs, frame data, fidélité, fenêtres contextuelles, Otherworld et phases.
- **Chroniques de la Brume** — quinze routes avec progression et rang persistant.
- **Archives** — bestiaire, 4 600 mouvements, arènes, fatalités, couverture, rites, IA, phases et relevés.

## Commandes principales

### Sujet I

| Action | Clavier |
|---|---|
| Mouvement | ← / → |
| Saut / accroupi | ↑ / ↓ |
| Garde | Espace |
| Léger / lourd / technique | J / K / I |
| Saisie / Nightmare | U / O |
| Esquive | L |

### Sujet II

| Action | Clavier |
|---|---|
| Mouvement | Q / D |
| Saut / accroupi | Z / S |
| Garde | A |
| Léger / lourd / technique | F / G / H |
| Saisie / Nightmare | R / T |
| Esquive | V |

La direction, l’état aérien et les fenêtres de combat sélectionnent les variantes du moveset. Guide complet : [`docs/CONTROLS.md`](docs/CONTROLS.md).

## Lancer localement

Prérequis : **Node.js 20 ou supérieur**. Pour la QA Chromium, exécuter d’abord `npm install` afin d’installer `playwright-core`.

```bash
npm start
```

Ouvrir `http://127.0.0.1:4173`.

### QA et build

```bash
npm test
npm run qa:browser
npm run build
npm run verify
```

- `npm test` régénère les documents, vérifie les données, exécute la suite Node et construit `dist/`.
- `npm run qa:browser` valide quinze parcours desktop/mobile et vingt-six assertions dans Chromium, puis produit les captures et le rapport machine.
- `npm run build` produit la version statique.
- `npm run verify` contrôle catalogue, movesets, fatalités, arènes, PWA, liens et syntaxe.

## Architecture

```text
.
├── index.html                    # registre radio / CRTV
├── modules/
│   ├── unified-versus.html       # sélection, règles, dossiers et combat
│   ├── chronicles.html           # quinze routes narratives
│   ├── archive.html              # bestiaire, movesets et traçabilité
│   ├── roster-command.html       # route de compatibilité
│   ├── finisher-archive.html     # route de compatibilité
│   └── combat-academy.html       # route de compatibilité
├── src/
│   ├── data.js                   # catalogue et profils
│   ├── movesets.js               # 20 actions et fidélité par profil
│   ├── fight.js                  # moteur, IA, contextes, phases et fatalités
│   ├── renderers.js              # rendu procédural et Otherworld
│   ├── stage-director.js          # terrains, bascules, événements et interactions de lieu
│   ├── command.js                # menu principal
│   ├── versus.js                 # modes et sélection
│   ├── chronicles.js             # progression
│   ├── archive.js                # dossiers et exports
│   └── shared.js                 # audio, sauvegarde et utilitaires
├── data/                         # exports JSON
├── docs/                         # GDD, roster, movesets, audit et QA
├── tests/                        # validations automatisées
└── scripts/                      # génération, serveur, build et QA navigateur
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
- `data/stage-director.json`

Documents principaux :

- [`docs/MOVESETS.md`](docs/MOVESETS.md)
- [`docs/ROSTER.md`](docs/ROSTER.md)
- [`docs/FIDELITY_MATRIX.md`](docs/FIDELITY_MATRIX.md)
- [`docs/COVERAGE_AUDIT.md`](docs/COVERAGE_AUDIT.md)
- [`docs/FATALITIES_AND_STAGES.md`](docs/FATALITIES_AND_STAGES.md)
- [`docs/COMBAT_SYSTEMS.md`](docs/COMBAT_SYSTEMS.md)
- [`docs/STAGE_DIRECTOR.md`](docs/STAGE_DIRECTOR.md)
- [`docs/LORE_STAGE_GAMEPLAY.md`](docs/LORE_STAGE_GAMEPLAY.md)
- [`docs/QA_REPORT.md`](docs/QA_REPORT.md)
- [`docs/PLATFORM_HARDENING.md`](docs/PLATFORM_HARDENING.md)

## Qualité

La suite v0.7.0 vérifie notamment :

- 230 profils, 123 arènes, 15 Chroniques et 16 sources ;
- 4 600 mouvements, leurs références et leurs contrats contextuels ;
- variantes directionnelles, projections arrière, ripostes, relevées, désespoir, projectiles, pièges et contres ;
- 460 fatalités, 123 fatalités d’arène et 374 animations ;
- 150 transitions de boss ;
- rendu de chaque manifestation et chaque arène ;
- les 14 terrains, 15 langages de bascule, 22 événements, 29 dangers, interactions contextuelles et géométries de zone ;
- exports, documents, pages, PWA, caches séparés, sauvegardes exportables, sécurité HTTP et build Vercel ;
- **71 contrôles automatisés**, **15 parcours Chromium** et **26 assertions navigateur**.

## Statut artistique

Le prototype est jouable et documenté. Une fidélité visuelle image par image exige une production artistique originale dédiée : références autorisées, silhouettes multi-vues, sprites, animations correspondant aux vingt actions, validation des proportions et contrôle de provenance.

## Licence et propriété intellectuelle

Le code original est fourni sous licence MIT. Les noms et l’univers *Silent Hill* appartiennent à leurs ayants droit respectifs. Voir [`NOTICE.md`](NOTICE.md).
