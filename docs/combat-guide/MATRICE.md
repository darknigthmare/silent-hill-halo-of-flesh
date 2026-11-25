# Correspondance des 30 rubriques

Généré depuis [requirements.json](requirements.json). Les décisions « retenue » portent sur la cible de conception, pas sur une promesse d’implémentation terminée.

| ID | Rubrique | Priorité | État observé | Prochaine action |
| --- | --- | --- | --- | --- |
| SHCG-00 | Utilisation du guide et priorités | P0 | documented | Traiter les manques par lots attachés aux identifiants existants et actualiser les associations après chaque changement de données. |
| SHCG-01 | Identité du projet et périmètre | P0 | partial | Fixer les configurations de référence, langues et limites de première version avant toute extension de plateforme. |
| SHCG-02 | Fidélité au lore et sources | P0 | partial | Capturer et relire les références exactes encore absentes, en particulier film/jeu/remake et dossiers incertains. |
| SHCG-03 | Roster, personnages, variantes et costumes | P0 | partial | Compléter costumes et vues manquantes uniquement après preuve de la version ; garder les dossiers non combattants consultables. |
| SHCG-04 | Fondations du système de combat | P0 | partial | Rattacher la recette de chaque lot aux cas garde, inversion de côté, KO simultané, coin et déconnexion de périphérique. |
| SHCG-05 | Movesets, coups spéciaux et ressources | P0 | partial | Documenter réponses adverses, récupération en échec, hitstun/blockstun et avantage temporel depuis la résolution réelle ; produire les poses fixes prioritaires. |
| SHCG-06 | Ultimes, finishers et conclusions de combat | P1 | partial | Compléter les fiches de cibles compatibles et les remplacements pour géant, essaim, spectre, cible fixe ou hors duel. |
| SHCG-07 | Présentation et relations entre personnages | P1 | partial | Écrire les confrontations significatives avec statut de relation et connaissances compatibles avec l'édition. |
| SHCG-08 | Histoire individuelle de chaque personnage | P1 | partial | Remplacer progressivement les textes génériques par des routes sourcées ; vérifier les cas admis sans adversaire de la même œuvre. |
| SHCG-09 | Campagne globale distincte | P1 | documented-only | Implémenter un chapitre représentatif après validation des fiches, puis sauvegarde, reprise et parcours complet. |
| SHCG-10 | Illustrations et cinématiques narratives | P1 | partial | Lier chaque plan au sujet, à l'édition, au stage et à un fichier PNG seulement après production et revue. |
| SHCG-11 | Boss, machines et Boss Rush | P1 | partial | Établir une fiche de rencontre par boss : annonces, fenêtres, contre-jeu par morphologie et résultat. |
| SHCG-12 | Modes de jeu | P0 | partial | Valider pour chaque mode sélection, entrée, partie, résultat, revanche, sortie et reprise. |
| SHCG-13 | Arènes : lieux, composition et lisibilité | P1 | partial | Compléter les décors fixes manquants et la revue des repères avant d'ajouter des couches de parallaxe. |
| SHCG-14 | Arènes vivantes, statiques et événements | P1 | partial | Définir profils Spectacle, Duel stable et Confort ; rendre les annonces de danger lisibles dans la présentation statique. |
| SHCG-15 | Arènes connectées, transitions et interactions | P1 | documented-only | Prototyper une liaison candidate avec destination réelle, coordonnées, défense, chrono, combo et résolution KO définis avant de généraliser. |
| SHCG-16 | Ennemis, soutiens, véhicules et projectiles | P1 | partial | Compléter les commandes à projectile sans image et séparer départ, trajet, impact lorsque le moteur les manipule indépendamment. |
| SHCG-17 | Direction artistique et production des assets | P0 | partial | Produire les bases manquantes, vérifier sujet/édition/asymétrie et inspecter à l'échelle de jeu avant admission artistique. |
| SHCG-18 | Animations, VFX, son et caméra | P1 | partial | Documenter dépendances futures et points d'émission ; prioriser VFX fixes et scènes fixes utiles à la phase actuelle. |
| SHCG-19 | Interface et expérience utilisateur | P0 | partial | Recetter navigation clavier/manette, états sans image, petits écrans et sortie/reprise de chaque mode. |
| SHCG-20 | Tutoriels, entraînement et apprentissage | P0 | partial | Créer une suite d'exercices mesurables et reprises de situations avant les défis avancés. |
| SHCG-21 | IA et difficulté | P0 | partial | Mesurer réactions et réponses pour chaque famille, en particulier attaques fixes, objets et futurs changements de zone. |
| SHCG-22 | Équilibrage et accessibilité | P0 | partial | Vérifier contraste et signaux alternatifs, limites de combo et interaction des options de confort avec les dangers. |
| SHCG-23 | Multijoueur, réseau et replays | P0 | partial | Recetter attribution/reconnexion locale. Si réseau retenu, spécifier état sérialisable, aléatoire, version et déterminisme avant service en ligne. |
| SHCG-24 | Progression, sauvegardes et rejouabilité | P0 | partial | Définir déblocages et migrations de la campagne sans altérer les sauvegardes historiques. |
| SHCG-25 | Organisation, inventaires et statistiques | P0 | documented | Régénérer les associations et les feuilles Guide combat après évolution du catalogue ; joindre les preuves de livraison. |
| SHCG-26 | Critères de validation et ordre de production | P0 | documented | Appliquer les critères à chaque lot et enregistrer le commit exact testé. |
| SHCG-27 | Fiches types à remplir | P0 | documented | Utiliser les modèles pour chaque nouveau sujet, liaison, boss et scène sans créer un catalogue concurrent. |
| SHCG-28 | Instruction prête à transmettre à un projet | P0 | documented | Appliquer cette consigne aux futures passes de production. |
| SHCG-29 | Références vérifiées et vocabulaire | P0 | documented | Ajouter les nouvelles sources exactes à la fiche concernée et conserver date, édition et limites. |

## Décisions sur les modules

| Module | Décision | Priorité | Justification |
| --- | --- | --- | --- |
| Nouvelles animations | deferred | P1 | Phase demandée : sprites de base et images fixes ; états et besoins conçus dès maintenant. |
| Campagne globale jouable | retained | P1 | Intrigue distincte conçue ; implémentation et recette de bout en bout restent à faire. |
| Transitions vers une autre arène | retained | P1 | Objectif de conception avec destinations réelles ; prototype dédié requis, distinct de la bascule Otherworld. |
| Tag et assistances | deferred | P2 | Le duel et ses ressources sont prioritaires ; équipes simultanées et interactions demandent une architecture dédiée. |
| Coopération et plusieurs plans | deferred | P2 | Non requis pour l'intégration de bible ; géométrie, caméra et règles à concevoir avant ajout. |
| En ligne, rollback et matchmaking | decision-needed | P0 | Aucune livraison réseau constatée. Décider architecture et services avant toute promesse en ligne. |
| Replay de commandes versionné | deferred | P2 | La reprise de run existe mais ne rejoue pas une simulation ; enregistrement déterministe à concevoir. |
| Avatar RPG et hub exploratoire | not-applicable | P2 | Hors promesse actuelle centrée sur les manifestations et le combat latéral ; le guide n'impose pas World Tour. |
| Véhicules de combat génériques | not-applicable | P2 | Aucun besoin propre établi ; garder uniquement les présences et fonctions documentées. Les machines sous licence sont des supports du corpus. |
| Spectacle, Duel stable et Confort | retained | P1 | Quatre axes indépendants à compléter au-dessus des réglages et politiques existants. |

## Exigences détaillées et preuves

### SHCG-00 — Utilisation du guide et priorités

**Adaptation :** Le guide commun est conservé sans modification et associé à la bible Silent Hill existante. Les politiques exactes par œuvre et le moteur Canvas 2D déterminent les adaptations. La phase actuelle reste aux images fixes.

**Existant :** AGENTS, guide gamedev, données et production existent ; la correspondance systématique aux 30 rubriques est ajoutée par cette passe.

**Fichiers associés :** [AGENTS.md](../../AGENTS.md) · [docs/GAMEDEV_GUIDANCE.md](../../docs/GAMEDEV_GUIDANCE.md) · [docs/COMBAT_GAMES_GUIDE_INTEGRATION.md](../../docs/COMBAT_GAMES_GUIDE_INTEGRATION.md)

**Validation attendue :**

- 30 sections uniques 00–29 avec décision, références et critère
- Copie du guide identique à la pièce jointe
- Aucune animation nouvelle comptée dans la livraison documentaire

### SHCG-01 — Identité du projet et périmètre

**Adaptation :** Duel latéral 2D de manifestations Silent Hill, navigateur JavaScript/Canvas, clavier et manette. Fidélité d'identité, morphologies distinctes, lisibilité horrifique et archive sourcée. Le corpus éditorial ne constitue pas un roster jouable.

**Existant :** GDD, 16 groupes runtime et corpus documentaire structurés ; versions et supports sont déjà distingués.

**Fichiers associés :** [docs/GDD_FR.md](../../docs/GDD_FR.md) · [src/data.js](../../src/data.js) · [docs/production/franchise-corpus.json](../../docs/production/franchise-corpus.json)

**Validation attendue :**

- Chaque contenu porte œuvre, édition et rôle
- Aucune compilation ni émission promotionnelle ne devient implicitement un combattant
- Les plateformes promises possèdent une recette datée

### SHCG-02 — Fidélité au lore et sources

**Adaptation :** Séparer canon attesté, adaptation jouable, original compatible, alternatif/crossover et à confirmer. Conserver les catégories historiques direct-canonical, behavior-composite et versus-adaptation sans les confondre avec une validation visuelle.

**Existant :** Politiques de référence pour combattants, stages et éditions ; preuves secondaires, captures manquantes et restrictions sont explicites.

**Fichiers associés :** [src/production-reference.js](../../src/production-reference.js) · [src/combat-reference-policy.js](../../src/combat-reference-policy.js) · [src/stage-reference-policy.js](../../src/stage-reference-policy.js) · [docs/SOURCES.md](../../docs/SOURCES.md) · [docs/BIBLE_CORPUS_SILENT_HILL.md](../../docs/BIBLE_CORPUS_SILENT_HILL.md)

**Validation attendue :**

- Sources et édition accessibles depuis la fiche
- Une arme, capacité ou géographie d'une autre version n'est jamais transférée sans statut alternatif
- Aucune certification 1:1 déduite d'un test automatisé

### SHCG-03 — Roster, personnages, variantes et costumes

**Adaptation :** Distinguer profil, combattant admis, boss, manifestation scénarisée et dossier hors duel. Les humains absents du roster ne sont pas ajoutés pour remplir un modèle de campagne. Variante, costume, transformation et palette restent des notions différentes.

**Existant :** 230 profils avec identifiants stables, variantOf, références et règles d'admission ; présence de fichiers distincte de l'admission runtime.

**Fichiers associés :** [data/roster.json](../../data/roster.json) · [src/combat-reference-policy.js](../../src/combat-reference-policy.js) · [art/registry.json](../../art/registry.json) · [src/sprite-manifest.js](../../src/sprite-manifest.js)

**Validation attendue :**

- Un profil hors combat ne reçoit pas de parcours annoncé jouable
- Chaque variante pointe vers son identité de base connue
- Portrait de sélection et sprite de combat sont comptés séparément

### SHCG-04 — Fondations du système de combat

**Adaptation :** Conserver la simulation à pas fixe, les commandes compactes, garde, esquive, projections et jauge Nightmare existantes. Chaque morphologie conserve des limites d'action définies par sa fiche.

**Existant :** Moteur de duel et résolution des coups présents ; règles et tests spécialisés existent.

**Fichiers associés :** [src/fight.js](../../src/fight.js) · [src/combat-resolution.js](../../src/combat-resolution.js) · [src/player-input.js](../../src/player-input.js) · [docs/COMBAT_SYSTEMS.md](../../docs/COMBAT_SYSTEMS.md) · [docs/CONTROLS.md](../../docs/CONTROLS.md)

**Validation attendue :**

- Commandes et résolution cohérentes dans les deux orientations
- Pause et perte de périphérique ne changent pas silencieusement le résultat
- Le pas de simulation reste indépendant des effets visuels

### SHCG-05 — Movesets, coups spéciaux et ressources

**Adaptation :** Les 20 emplacements historiques sont un contrat de données. Une action interdite ou non attestée peut rester désactivée. Ils n'imposent pas 20 techniques officielles ni 20 animations produites. Nightmare est une ressource du jeu, pas un pouvoir canonique commun.

**Existant :** 4600 emplacements avec timings, commandes, propriétés, preuves, enabled et disabledReason ; gestes et valeurs de balance sont séparés.

**Fichiers associés :** [data/movesets.json](../../data/movesets.json) · [src/movesets.js](../../src/movesets.js) · [src/combat-reference-policy.js](../../src/combat-reference-policy.js) · [docs/MOVESETS.md](../../docs/MOVESETS.md)

**Validation attendue :**

- Chaque commande pointe vers son propriétaire exact et sa clé existante
- Les commandes désactivées sont exclues des totaux jouables
- Les paramètres d'équilibrage ne sont pas présentés comme frame data canonique

### SHCG-06 — Ultimes, finishers et conclusions de combat

**Adaptation :** Dénouements est l'appellation de conception du projet : Signature, Cauchemar et Dénouement du lieu. Garder les IDs et clés techniques fatalities, signature, nightmare. Séparer ultime en combat, conclusion, pose de victoire et outro narrative.

**Existant :** Définitions de combattants et de lieux, chorégraphies et mécanismes de déclenchement présents ; les règles de morphologie et la production bitmap restent à détailler par cas.

**Fichiers associés :** [data/fatalities.json](../../data/fatalities.json) · [src/lore-cinematics.js](../../src/lore-cinematics.js) · [docs/FATALITIES_AND_STAGES.md](../../docs/FATALITIES_AND_STAGES.md) · [docs/combat-guide/CAMPAGNE_ET_DENOUEMENTS.md](../../docs/combat-guide/CAMPAGNE_ET_DENOUEMENTS.md)

**Validation attendue :**

- Les noms créés sont explicitement des noms du projet
- Aucun dénouement corporel incompatible n'est imposé à une cible
- Une issue arcade ne modifie pas le canon ni les autres campagnes

### SHCG-07 — Présentation et relations entre personnages

**Adaptation :** Les manifestations parlent par comportement, cadrage et son lorsque les sources ne leur donnent pas de dialogue. Un boss choisi comme rival par l'algorithme reste un rival de versus, sans relation canonique déduite.

**Existant :** Présentations de movesets et propositions de référence présentes ; rivaux calculés par storyPlan au sein d'un groupe source, sans garantie d'édition fine pour le pack film.

**Fichiers associés :** [data/movesets.json](../../data/movesets.json) · [src/tournament.js](../../src/tournament.js) · [docs/PRESENTATION_SEQUENCES_2026-10-17.md](../../docs/PRESENTATION_SEQUENCES_2026-10-17.md) · [docs/combat-guide/CAMPAGNE_ET_DENOUEMENTS.md](../../docs/combat-guide/CAMPAGNE_ET_DENOUEMENTS.md)

**Validation attendue :**

- Chaque rivalité nomme sa justification et son statut
- Aucune personnalité bavarde inventée pour une créature silencieuse
- Les rencontres miroirs ou impossibles sont annoncées alternatives

### SHCG-08 — Histoire individuelle de chaque personnage

**Adaptation :** Enrichir les Récits de manifestation existants : situation, déclencheur, épreuves motivées, rival, revers et conséquence. Les dossiers hors duel reçoivent une lecture narrative adaptée, sans combats forcés.

**Existant :** storyPlan produit une structure par profil et filtre les groupes source, pas toutes les éditions fines. Admission au combat et présence d'adversaires sont des conditions séparées. Les textes dérivés ne constituent pas des campagnes individuelles détaillées.

**Fichiers associés :** [src/tournament.js](../../src/tournament.js) · [src/run-progress.js](../../src/run-progress.js) · [docs/TOURNAMENT_STORY.md](../../docs/TOURNAMENT_STORY.md) · [docs/combat-guide/CAMPAGNE_ET_DENOUEMENTS.md](../../docs/combat-guide/CAMPAGNE_ET_DENOUEMENTS.md)

**Validation attendue :**

- Début, rivalité, finale et conséquence distincts
- Toutes les rencontres conservent une justification et une arène réelle
- Un parcours n'est compté jouable que si combatEnabled et file non vide

### SHCG-09 — Campagne globale distincte

**Adaptation :** Le Registre des absences est une campagne originale de fan-game, structurée en chapitres et points de vue de manifestations. Les liens entre œuvres sont une construction du projet ; aucune continuité officielle commune n'est affirmée.

**Existant :** 15 Chroniques et récits individuels existent. La nouvelle intrigue globale est conçue dans cette intégration et n'a pas de mode runtime dédié.

**Fichiers associés :** [data/chronicles.json](../../data/chronicles.json) · [src/chronicles.js](../../src/chronicles.js) · [docs/combat-guide/CAMPAGNE_ET_DENOUEMENTS.md](../../docs/combat-guide/CAMPAGNE_ET_DENOUEMENTS.md)

**Validation attendue :**

- Intrigue collective avec incident, revers, résolution et épilogue
- Chaque chapitre possède objectif, sujet, lieu, sortie et checkpoint
- Les Chroniques ne sont pas comptées comme une campagne globale déjà écrite

### SHCG-10 — Illustrations et cinématiques narratives

**Adaptation :** Produire des images qui racontent l'intro, la rivalité et la conséquence de l'outro. Texte séparé, état du décor et asymétries suivis. Les scènes à plusieurs acteurs sont distinctes des sprites isolés.

**Existant :** Illustrations de Chroniques déclarées dans chronicle-art ; les nouvelles scènes de campagne sont des briefs et restent à produire.

**Fichiers associés :** [src/chronicle-art.js](../../src/chronicle-art.js) · [docs/combat-guide/CAMPAGNE_ET_DENOUEMENTS.md](../../docs/combat-guide/CAMPAGNE_ET_DENOUEMENTS.md) · [docs/combat-guide/FICHES_ET_VALIDATION.md](../../docs/combat-guide/FICHES_ET_VALIDATION.md)

**Validation attendue :**

- Intro, conflit et conséquence ont une fonction visuelle différente
- Versions, blessures, armes, regards et lumière restent continus
- Un brief n'est jamais compté comme illustration produite

### SHCG-11 — Boss, machines et Boss Rush

**Adaptation :** Grands Tourments reprend le Boss Rush. Séparer boss catalogue, boss admis, boss fixe, danger de lieu et version versus. Une machine sous licence du corpus est un support éditorial, pas une machine ennemie.

**Existant :** Phases et modificateurs de boss, parcours à endurance et reprise présents ; admission exacte filtrée par politique.

**Fichiers associés :** [src/data.js](../../src/data.js) · [src/fight.js](../../src/fight.js) · [src/run-progress.js](../../src/run-progress.js) · [data/combat-rules.json](../../data/combat-rules.json) · [docs/COMBAT_SYSTEMS.md](../../docs/COMBAT_SYSTEMS.md)

**Validation attendue :**

- Boss catalogue et boss admis comptés séparément
- Chaque immunité conserve une solution pour les familles prévues
- Le Rush précise vie, soins, reprises, échec et récompense

### SHCG-12 — Modes de jeu

**Adaptation :** Raccorder Confrontation, Descente, Rites du Jugement, Grands Tourments, Salle d'Observation, Chroniques, Récits, Rite des Huit et Archives. La campagne globale reste un ajout de conception. Tag, coopération et avatar ne sont pas activés par la seule présence du guide.

**Existant :** Modes locaux, parcours et archives présents ; la couverture complète est à recetter par mode et version.

**Fichiers associés :** [src/versus.js](../../src/versus.js) · [src/run-progress.js](../../src/run-progress.js) · [src/tournament.js](../../src/tournament.js) · [src/chronicles.js](../../src/chronicles.js) · [src/archive.js](../../src/archive.js) · [docs/COMBAT_GAMES_GUIDE_INTEGRATION.md](../../docs/COMBAT_GAMES_GUIDE_INTEGRATION.md)

**Validation attendue :**

- Un bouton seul ne compte pas comme mode terminé
- Les modes retenus ont une fiche de règles
- Les modules non retenus ne gonflent pas les objectifs de lancement

### SHCG-13 — Arènes : lieux, composition et lisibilité

**Adaptation :** Les lieux doivent conserver les repères architecturaux de l'œuvre exacte. Documenter toute coupe latérale, largeur et perspective recomposées pour le duel. Un fond horrifique générique ne valide pas un lieu Silent Hill.

**Existant :** 123 stages avec référence, état du monde, plans et politiques ; couverture bitmap partielle.

**Fichiers associés :** [data/stages.json](../../data/stages.json) · [src/stage-bitmap-manifest.js](../../src/stage-bitmap-manifest.js) · [src/stage-reference-policy.js](../../src/stage-reference-policy.js) · [docs/LORE_STAGE_GAMEPLAY.md](../../docs/LORE_STAGE_GAMEPLAY.md)

**Validation attendue :**

- Édition et repères obligatoires visibles
- Pieds, sol, échelle et limites lisibles
- Une adaptation de caméra ou de géométrie reste déclarée

### SHCG-14 — Arènes vivantes, statiques et événements

**Adaptation :** Séparer présentation, interactions, dangers et transitions. La brume, les lumières et la radio n'autorisent pas à elles seules un danger. Les états normal/Otherworld ne sont pas universellement interchangeables.

**Existant :** Directeur, reducedMotion, pistes et listes d'événements autorisés présents ; les quatre axes ne possèdent pas encore un contrat de réglages totalement indépendant.

**Fichiers associés :** [data/stage-director.json](../../data/stage-director.json) · [src/stage-director.js](../../src/stage-director.js) · [src/stage-lore-policy.js](../../src/stage-lore-policy.js) · [src/stage-reference-policy.js](../../src/stage-reference-policy.js) · [src/stage-bitmaps.js](../../src/stage-bitmaps.js)

**Validation attendue :**

- Le réglage visuel conserve sol et collisions
- Les règles dangereuses sont communes aux deux joueurs
- Chaque événement autorisé cite le lieu et sa référence

### SHCG-15 — Arènes connectées, transitions et interactions

**Adaptation :** Distinguer bascule d'état d'une même salle et déplacement vers une autre arène. Les liaisons proposées conservent œuvres et géographie ; les interludes entre œuvres du récit global sont du montage narratif.

**Existant :** Changements Otherworld et séquences de stage présents ; aucun système général de projection chargeant une autre zone de duel n'est validé par cette passe.

**Fichiers associés :** [src/stage-director.js](../../src/stage-director.js) · [src/stage-cinematics.js](../../src/stage-cinematics.js) · [docs/STAGE_CINEMATICS_v0.8.0.md](../../docs/STAGE_CINEMATICS_v0.8.0.md) · [docs/COMBAT_GAMES_GUIDE_INTEGRATION.md](../../docs/COMBAT_GAMES_GUIDE_INTEGRATION.md)

**Validation attendue :**

- Les deux IDs de stage existent et la continuité est motivée
- L'arrivée rend le contrôle sans combo infini
- KO, double déclenchement, retour et sauvegarde ont une règle explicite

### SHCG-16 — Ennemis, soutiens, véhicules et projectiles

**Adaptation :** Rattacher chaque projectile à la commande et à la variante exactes. Distances, vitesse et collisions sont adaptations jouables. Les soutiens, objets et véhicules nécessitent une présence pertinente dans la source ; aucune armée générique n'est ajoutée.

**Existant :** Actions projectiles et registre de PNG indépendants présents, avec filtrage par propriétaire et slots.

**Fichiers associés :** [data/movesets.json](../../data/movesets.json) · [src/projectile-bitmaps.js](../../src/projectile-bitmaps.js) · [src/projectile-bitmap-manifest.js](../../src/projectile-bitmap-manifest.js) · [src/combat-reference-policy.js](../../src/combat-reference-policy.js)

**Validation attendue :**

- Propriétaire, source et slot concordent
- Orientation, ancrage, durée et contre-jeu sont spécifiés
- Un véhicule de décor ne devient pas un boss sans fiche dédiée

### SHCG-17 — Direction artistique et production des assets

**Adaptation :** Sprites 2D UHD, un sujet exploitable par image, vue de combat latérale entière, alpha réel pour les détourages, ligne de sol et armes visibles. Fidélité 1:1 désigne l'identité et les références, pas le ratio carré.

**Existant :** Registre, provenance, ancrages, cadres et statut candidat présents ; aucune fidélité visuelle n'est certifiée par ce guide.

**Fichiers associés :** [art/registry.json](../../art/registry.json) · [src/sprite-manifest.js](../../src/sprite-manifest.js) · [scripts/build-sprites.mjs](../../scripts/build-sprites.mjs) · [docs/SPRITE_AUTHORING_v0.9.3.md](../../docs/SPRITE_AUTHORING_v0.9.3.md)

**Validation attendue :**

- Portrait et sprite latéral ne sont pas interchangeables
- Le fichier détouré possède une vraie transparence
- Chaque affirmation de fidélité cite la revue et les vues de référence

### SHCG-18 — Animations, VFX, son et caméra

**Adaptation :** Concevoir les états, raccords, VFX et signaux ; différer la production de nouvelles animations pendant la phase de bases fixes. Préserver les clips et synthèses audio existants. Une pose unique n'est pas un clip animé.

**Existant :** Systèmes animation/cinématique/audio présents avec prototypes ; nombreux visuels fixes et actions sans clip exact.

**Fichiers associés :** [src/sprite-animation.js](../../src/sprite-animation.js) · [src/sprite-clips.js](../../src/sprite-clips.js) · [src/lore-cinematics.js](../../src/lore-cinematics.js) · [src/shared.js](../../src/shared.js) · [docs/combat-guide/FICHES_ET_VALIDATION.md](../../docs/combat-guide/FICHES_ET_VALIDATION.md)

**Validation attendue :**

- Clips, poses, dessins et timelines comptés séparément
- Aucun geste source déduit des seuls timings de prototype
- Caméra et effets conservent la lecture du duel

### SHCG-19 — Interface et expérience utilisateur

**Adaptation :** Registre radio/CRTV, Sujet I et Sujet II, navigation lisible et retours rapides. Afficher disponible, consultable, bloqué ou à produire sans présenter tous les dossiers comme combattants.

**Existant :** Sélection, archives, options, récits et résultats présents dans les modules du jeu.

**Fichiers associés :** [src/versus.js](../../src/versus.js) · [src/playflow-ui.js](../../src/playflow-ui.js) · [src/archive.js](../../src/archive.js) · [src/shared.js](../../src/shared.js) · [src/touch-controls.js](../../src/touch-controls.js)

**Validation attendue :**

- Chaque écran a une sortie et un retour clavier/manette
- Les restrictions d'un profil sont visibles avant le match
- Réduire les effets ne masque ni sélection ni avertissement

### SHCG-20 — Tutoriels, entraînement et apprentissage

**Adaptation :** Salle d'Observation et exercices par morphologie : garde, portée, piqué, saisie, phase fixe, projectile. Expliquer les limites d'un dossier, pas une technique interdite pour compléter un tutoriel.

**Existant :** Entraînement avec reset, diagnostics et paramètres présent ; cursus guidé et enregistrement du mannequin restent à spécifier/compléter.

**Fichiers associés :** [src/fight.js](../../src/fight.js) · [src/versus.js](../../src/versus.js) · [docs/CONTROLS.md](../../docs/CONTROLS.md) · [docs/COMBAT_SYSTEMS.md](../../docs/COMBAT_SYSTEMS.md)

**Validation attendue :**

- Le reset reproduit la même position et les mêmes ressources
- Les exercices utilisent des commandes activées
- Le retour explique l'erreur sans exiger de connaître le jargon

### SHCG-21 — IA et difficulté

**Adaptation :** L'IA respecte les moyens de la manifestation et les mêmes commandes autorisées. Différencier distance, patience, erreurs et réaction ; les exceptions de boss sont documentées.

**Existant :** Profils de personnalité et sélection d'actions présents ; l'équilibrage réel par confrontation n'est pas démontré par une fiche.

**Fichiers associés :** [src/fight.js](../../src/fight.js) · [data/combat-rules.json](../../data/combat-rules.json) · [src/combat-reference-policy.js](../../src/combat-reference-policy.js)

**Validation attendue :**

- Aucune commande désactivée choisie par l'IA
- Une hausse de difficulté a des paramètres explicites
- La défaite reste lisible et permet une réponse

### SHCG-22 — Équilibrage et accessibilité

**Adaptation :** Contrôler tailles, coins, projections et ressources. Séparer règles de duel et modificateurs de run. Réduire flashs, secousses, brume ou mouvement sans supprimer les indices essentiels.

**Existant :** Options visuelles, remappage et diagnostics présents ; critères d'accessibilité complets et couverture de matchups encore partiels.

**Fichiers associés :** [src/shared.js](../../src/shared.js) · [src/player-input.js](../../src/player-input.js) · [src/combat-resolution.js](../../src/combat-resolution.js) · [src/stage-hazard-renderer.js](../../src/stage-hazard-renderer.js) · [docs/DUEL_ACCEPTANCE_PLAN.md](../../docs/DUEL_ACCEPTANCE_PLAN.md)

**Validation attendue :**

- Aucune information critique uniquement sonore ou colorée
- Les états d'affliction et dangers restent annoncés
- Toute boucle de retrait de contrôle possède une limite testable

### SHCG-23 — Multijoueur, réseau et replays

**Adaptation :** Le versus local reste la base. Réseau, rollback, matchmaking, crossplay et replays ne sont pas promis par l'ajout du guide ; leur décision d'architecture précède toute réalisation future.

**Existant :** Deux joueurs locaux et périphériques présents ; sauvegarde de run distincte d'un replay de combat.

**Fichiers associés :** [src/player-input.js](../../src/player-input.js) · [src/versus.js](../../src/versus.js) · [src/run-progress.js](../../src/run-progress.js) · [src/save-store.js](../../src/save-store.js)

**Validation attendue :**

- Deux périphériques ne pilotent pas involontairement le même sujet
- Un run sauvegardé n'est pas annoncé comme replay
- Aucun rollback ou matchmaking déclaré disponible sans code et recette

### SHCG-24 — Progression, sauvegardes et rejouabilité

**Adaptation :** Conserver rangs, Chroniques, favoris, paramètres et runs. Les nouveaux chapitres et illustrations doivent utiliser des IDs stables, une version de sauvegarde et une reprise compréhensible.

**Existant :** localStorage, reprises et validation de parcours présentes. La campagne globale documentée nécessite son propre contrat de progression.

**Fichiers associés :** [src/save-store.js](../../src/save-store.js) · [src/run-progress.js](../../src/run-progress.js) · [src/chronicles.js](../../src/chronicles.js) · [src/tournament.js](../../src/tournament.js)

**Validation attendue :**

- Reprise après fermeture au dernier checkpoint valide
- Version incompatible signalée sans réécriture silencieuse
- Bonus narratifs sans avantage caché en versus normalisé

### SHCG-25 — Organisation, inventaires et statistiques

**Adaptation :** Lier guide, corpus, profils, actions, Dénouements, stages, projectiles, Chroniques et assets par IDs existants. Suivre lore, conception, assets, intégration, validation et publication séparément.

**Existant :** Catalogues et deux classeurs historiques existent. Cette passe ajoute les associations vérifiables et un bilan calculé sans modifier les anciens audits datés.

**Fichiers associés :** [docs/combat-guide/associations.json](../../docs/combat-guide/associations.json) · [docs/combat-guide/status.json](../../docs/combat-guide/status.json) · [docs/production/SILENT_HILL_CORPUS_BIBLE.xlsx](../../docs/production/SILENT_HILL_CORPUS_BIBLE.xlsx) · [docs/production/SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx](../../docs/production/SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx)

**Validation attendue :**

- Identifiants et fichiers associés résolus
- Dénominateurs et unités explicites
- Aucun total global mélangeant profils, plans PNG et commandes

### SHCG-26 — Critères de validation et ordre de production

**Adaptation :** Adopter des portes de validation par contenu : source, conception, fichier, intégration, recette et publication. Produire d'abord bases fixes manquantes, un récit et un chapitre représentatifs, puis étendre.

**Existant :** Suites ciblées, audits et preuves historiques présents ; cette intégration vérifie les liens et préserve le moteur, sans rejouer toutes les livraisons passées.

**Fichiers associés :** [docs/GAMEDEV_GUIDANCE.md](../../docs/GAMEDEV_GUIDANCE.md) · [docs/DUEL_ACCEPTANCE_PLAN.md](../../docs/DUEL_ACCEPTANCE_PLAN.md) · [docs/combat-guide/FICHES_ET_VALIDATION.md](../../docs/combat-guide/FICHES_ET_VALIDATION.md) · [scripts/build-combat-guide.mjs](../../scripts/build-combat-guide.mjs)

**Validation attendue :**

- Terminé possède une définition par catégorie
- Les preuves sont attachées à la bonne version
- Échec, blocage ou absence de revue restent visibles

### SHCG-27 — Fiches types à remplir

**Adaptation :** Adapter les dix fiches A–J aux schémas réels : IDs roster, clés moves, stageId, source, reference, storyPlan et registres d'images. Les champs de conception manquants sont à remplir, pas auto-validés.

**Existant :** Nombreux champs existent déjà dans les données ; les fiches ajoutent une correspondance et les champs encore requis.

**Fichiers associés :** [docs/combat-guide/FICHES_ET_VALIDATION.md](../../docs/combat-guide/FICHES_ET_VALIDATION.md) · [docs/combat-guide/associations.json](../../docs/combat-guide/associations.json)

**Validation attendue :**

- Dix fiches A–J associées aux sources de données
- Champs inconnus marqués à confirmer
- Un nouveau contenu réutilise les IDs existants lorsqu'il s'agit du même sujet

### SHCG-28 — Instruction prête à transmettre à un projet

**Adaptation :** Consigne Silent Hill explicite : lire cette intégration et les politiques du projet, préserver moteur et rôles, compléter la base fixe avant animations, publier les états vérifiables dans la PR autorisée.

**Existant :** L'instruction adaptée est incluse dans le chapitre d'intégration relié au GDD, à la bible de corpus et au README.

**Fichiers associés :** [README.md](../../README.md) · [docs/GDD_FR.md](../../docs/GDD_FR.md) · [docs/BIBLE_CORPUS_SILENT_HILL.md](../../docs/BIBLE_CORPUS_SILENT_HILL.md) · [docs/COMBAT_GAMES_GUIDE_INTEGRATION.md](../../docs/COMBAT_GAMES_GUIDE_INTEGRATION.md)

**Validation attendue :**

- La demande originale et sa phase sont conservées
- L'intégration est accessible depuis les entrées de bible existantes
- Les contraintes du projet priment sur les exemples génériques du guide

### SHCG-29 — Références vérifiées et vocabulaire

**Adaptation :** Les sources Street Fighter/Guilty Gear/Mortal Kombat/Injustice inspirent la structure générale. Les preuves Silent Hill viennent des références du corpus et de chaque fiche. Dénouement et Registre des absences sont des termes créés pour le projet.

**Existant :** Références originales conservées dans le guide ; sources franchise et sources de production déjà indexées.

**Fichiers associés :** [docs/combat-guide/source/Combat_Games_Guide_General_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Guide_General_v1.0.txt) · [docs/SOURCES.md](../../docs/SOURCES.md) · [docs/production/franchise-corpus.json](../../docs/production/franchise-corpus.json) · [docs/combat-guide/FICHES_ET_VALIDATION.md](../../docs/combat-guide/FICHES_ET_VALIDATION.md)

**Validation attendue :**

- Une inspiration de design ne devient pas une preuve de lore
- Pas de terme inventé présenté comme officiel
- Les anciennes dates d'audit restent identifiées comme historiques
