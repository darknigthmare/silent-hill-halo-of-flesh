# SILENT HILL: HALO OF FLESH — v0.9.5

## Suite du 17 octobre 2026 — séquences de présentation

Le moteur et l’atelier acceptent maintenant huit clips de présentation :
introduction, victoire/défaite de manche, victoire/défaite finale, sortie et
pistes attaquant/cible du finisher. Leur lecture suit la simulation et la pause ;
les clips importés peuvent prolonger la scène sans modifier les timings des attaques.
Le panneau de résultat attend la fin d’une véritable outro importée.

Cette passe corrige aussi les sorties de focus pendant l’outro, les anciens
résultats après un RESET du dojo et le mouvement décoratif résiduel de 22 familles
de cinématiques d’arène lorsque les mouvements réduits sont activés.

[Détails de l’intégration et limites](docs/PRESENTATION_SEQUENCES_2026-10-17.md) ·
[Excel actualisé](docs/production/SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx).

**471 tests Node, 76 tests Python et 202 contrôles HTTP réussis dans sept suites.**
Les 52 contrôles de présentation sont inclus. Les parcours produisent 35 captures
et ne signalent aucune erreur JavaScript. La suite complète fait partie de
`npm run qa:browser` et de la CI.
**Images : 2 candidats / 230 profils, 0 clip animé, 0 fidélité 1:1 certifiée.**
Les huit points d’intégration livrés ne constituent pas huit animations produites.

## Continuation du 17 octobre 2026 — phase 1 de production

[**Excel des movesets et animations**](docs/production/SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx) :
230 profils, 123 arènes et 135 sources, avec mouvements actuels, gestes documentés,
supers, finishers, intros/outros, poses de manche et travaux d’animation.
Les adaptations et les références manquantes sont identifiées ; aucun clip n’est
certifié 1:1 par la seule présence d’une fiche.

[Guide du classeur](docs/production/README.md) ·
[Périmètre et vérification](docs/production/QA_2026-10-17.md) ·
[Cinq corrections moteur et preuves](docs/CORRECTIONS_CONTINUATION_2026-10-17.md).

La continuation corrige aussi les rites appliqués, le boss final de Descente,
les secours pendant l’import, les touches de revanche et le déclenchement des
finishers uniquement à la victoire finale. **415 tests Node réussis** ; la suite
HTTP ciblée comporte **43 contrôles réussis**. La version reste `0.9.5`.

### Passe précédente — commandes et sauvegardes

Corrections des commandes aux transitions, pause multi-manettes et dialogues,
récupération des sauvegardes valides, exports de secours et retrait des anciens moteurs.
[Détails de cette passe](docs/CORRECTIONS_v0.9.5.md).

**Couverture artistique inchangée : 2 candidats / 230 profils, aucun nouveau sprite ni clip animé.**

## Suite de la PR #4 — v0.9.4

Corrections de la garde tactile, des inputs après pause, de la reprise de parcours
après échec de chargement, des filtres de sélection et du cache hors ligne.
L'atelier conserve les montages entre poses et protège les calibrations contre
les exports périmés. [Détails et compatibilité](docs/CORRECTIONS_v0.9.4.md).

**Art inchangé : 2 candidats / 230 profils, aucun nouveau sprite ni clip animé livré.**
Les notes des versions antérieures ci-dessous sont historiques.

## Suite de la PR #4 — v0.9.3

Montage et export de clips à partir d’images individuelles déjà importées, durées par étape,
repères des vraies attaques, publication locale contrôlée et reprise d’un chargement d’inspecteur.
[Documentation de cette passe](docs/SPRITE_AUTHORING_v0.9.3.md).
La couverture artistique reste **2 candidats sur 230, aucune nouvelle image ni animation livrée**.
L’éditeur est un outil de production, pas un générateur d’images ni une certification canonique.

## Suite de la PR #4 — v0.9.2

Inspecteur des poses réellement disponibles, export de calibration, cadrage commun
pour les armes/ailes près des bords, horloges de poses liées à la simulation et
vérification des pixels PNG/WebP au build. Voir [la documentation de cette passe](docs/SPRITE_CONTINUATION_v0.9.2.md).

**Art : 2 candidats sur 230 profils ; aucun nouveau sprite individuel accepté dans cette passe.**
Les notes de versions antérieures ci-dessous restent historiques.

# SILENT HILL: HALO OF FLESH — v0.9.1

## Première intégration bitmap individuelle

Deux PNG détaillés natifs, un sujet par image, remplacent les silhouettes géométriques sur leurs identifiants exacts. Les combats, la sélection, l’accueil, les archives et les chroniques utilisent maintenant le pipeline raster. Atelier de suivi : `modules/sprite-workshop.html`.

**Couverture réelle : 2 candidats / 230 profils ; 228 images à produire ; 0 fidélité 1:1 certifiée ; 0 clip animé.** Les autres profils sont conservés et explicitement marqués. Les parcours incomplets graphiquement sont accessibles par le diagnostic moteur volontaire, pas présentés comme une version finale. Le CSS d’interface et les décors procéduraux ne sont pas supprimés.

Lire [le pipeline, l’importeur et les limites de validation](docs/SPRITE_PIPELINE_v0.9.1.md). `npm test` contrôle 233 cas ; les 15 tests Python de l’importeur se lancent séparément. Les rapports historiques ci-dessous sont conservés et ne remplacent pas cet état graphique.

---

# Historique — v0.9.0, prototype en développement

La passe actuelle apporte checkpoints de parcours, remappage, commandes tactiles corrigées, résultats par sujet et sauvegardes validées. **Ce projet n'est pas déclaré prêt à commercialiser.** La fidélité exhaustive, les arts définitifs et les droits de franchise ne sont pas certifiés.

Détails : [notes v0.9.0](docs/RELEASE_NOTES_v0.9.0.md), [QA et limites](docs/QA_v0.9.0.md), [conditions de commercialisation](docs/COMMERCIAL_READINESS.md).

`npm test` : suite automatisée. `npm start` : serveur local. `npm run qa:browser` : tests HTTP sur environnement autorisé après installation Playwright. `npm run release:check` : conditions de sortie, actuellement bloquées.

Les sections ci-dessous décrivent l'historique et les systèmes du prototype ; leurs anciens chiffres de QA ne remplacent pas les résultats de la passe actuelle.

---

# SILENT HILL: HALO OF FLESH — v0.8.2

Prototype de fan. Cette passe ne certifie ni le canon intégral ni une fidélité graphique 1:1.

## Nouveautés : impacts, avertissements et ambiance

Les coups interrompus sont abandonnés, les projectiles utilisent une collision continue, les phases de boss se succèdent sans reprendre un vieux coup et les dégâts sont comptabilisés sans dépasser la vitalité restante. Les avertissements annoncent aussi les changements de sol ; un signal radio ne produit plus une attaque générique. Les détails et limites sont dans `docs/RELEASE_NOTES_v0.8.2.md` et `docs/QA_v0.8.2.md`.

```sh
npm test
npm start
```

Serveur local : http://localhost:4173. Node >=20. Aucun compte ni clé requis pour le moteur local. Le navigateur n'est nécessaire que pour jouer ou lancer les contrôles Canvas/menus, pas pour `npm test`.

## Historique du projet : SILENT HILL: HALO OF FLESH

[![QA](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/workflows/qa.yml/badge.svg)](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/workflows/qa.yml)

Prototype fan-made non commercial de **monster battle 2D**, construit sur l’organisation fonctionnelle de **CQC Versus Legacy v0.56**, puis entièrement réécrit autour des manifestations, boss, lieux, comportements et symboles de *Silent Hill*.

- **Jouer :** https://silent-hill-halo-of-flesh.vercel.app
- **Dépôt :** https://github.com/darknigthmare/silent-hill-halo-of-flesh
- **Version :** `0.8.1 — Corps, collisions et lieux cohérents`

> **Contrat de fidélité** — Le catalogue vise la fidélité documentaire la plus forte possible pour les identités, variantes, proportions relatives, postures, armes, attaques, comportements, fonctions symboliques et lieux. Chaque mouvement distingue ce qui est directement attesté, recomposé de façon lore-friendly ou ajouté pour rendre une manifestation jouable dans un versus. Les silhouettes, animations, effets, sons, frame data, statistiques et fatalités sont des créations originales ou procédurales : aucun asset officiel n’est redistribué.

> **v0.8.1** : chorégraphies de 22 événements environnementaux (123 scènes), objets physiques synchronisés aux avertissements, réactions de l’IA aux dangers visibles et simulateur déterministe indépendant de la fréquence d’affichage. Voir `docs/RELEASE_NOTES_v0.8.1.md`.

## État de cette passe — v0.8.1

- 109/109 tests Node exécutés avec succès, 44 fichiers statiques construits.
- 30 nouveaux tests ciblés sur les corps, dangers, sols, limites et motifs de stage.
- Rendu réel des fonctions Canvas dans une page en mémoire : voir `tests/canvas-v081/canvas-report.json` dans le paquet QA (captures non versionnées dans Git).
- La navigation Chromium vers le serveur local est bloquée par `ERR_BLOCKED_BY_ADMINISTRATOR`. Les écrans, commandes physiques, mobiles et la PWA **ne sont pas certifiés** par cette passe.
- Les classifications de canon des 4 600 coups proviennent du catalogue existant ; elles n'ont pas été réauditées intégralement. Le champ hérité `coverageComplete` vérifie les cibles internes du catalogue, pas l'exhaustivité de la franchise.
- Les événements non compatibles avec les accessoires déclarés d'un lieu ont été retirés de ce lieu. Les 22 familles de chorégraphies restent disponibles, mais pas dans chaque arène.

Détails : [notes](docs/RELEASE_NOTES_v0.8.1.md), [QA](docs/QA_v0.8.1.md), [frontière de fidélité](docs/LORE_COHERENCE_v0.8.1.md).

## Contenu

| Contenu | Total |
|---|---:|
| Manifestations jouables | **230** |
| Boss | **75** |
| Ensembles média du catalogue | **16** |
| Arènes | **123** |
| Chroniques | **15** |
| Commandes par manifestation | **20** |
| Mouvements documentés | **4 600** |
| Actions étiquetées « attestées » dans le catalogue hérité | **447** |
| Composites lore-friendly | **3 694** |
| Adaptations versus | **459** |
| Fatalités de combattant | **460** |
| Fatalités d’arène | **123** |
| Animations d’arène | **352** |
| Événements de directeur | **300** |
| Interactions de lieu | **286** |
| Liens de danger | **335** |
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
