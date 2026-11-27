# Correspondance des 68 rubriques

Généré depuis le [guide général](requirements.json) et les [deux extensions](extensions/requirements.json). La [vue résolue](requirements-resolved.json) alimente les classeurs. Les décisions « retenue » portent sur la cible de conception, pas sur une promesse d’implémentation terminée.

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
| SHCG-10 | Illustrations et cinématiques narratives | P1 | partial | Produire la scène de rivalité après revue des deux silhouettes et du lieu exact, puis poursuivre les autres récits ; garder les briefs distincts des images présentes. |
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
| SHCG-30 | Portée et rattachement au guide général | P0 | documented-only | Utiliser la matrice unifiée et les exemples ancrés aux IDs avant chaque nouveau lot. |
| SHCG-31 | Taunts et réactions de personnalité | P1 | partial | Produire une attitude complète sourcée, puis vérifier entrée, interruption et retour dans les deux orientations. |
| SHCG-32 | Sélection, confirmation et désélection | P1 | documented-only | Implémenter le cycle pour Air Screamer et Mannequin sans coupler les deux curseurs. |
| SHCG-33 | Profils d’équipe et partenaires | P2 | documented-only | Valider un prototype d’équipe à deux combattants admis, sans changer les règles des modes existants. |
| SHCG-34 | Commandes, jauges et disponibilité | P0 | documented-only | Fixer l’ordre de résolution et une horloge de simulation commune avant le premier assist. |
| SHCG-35 | Assistances ponctuelles | P2 | documented-only | Réaliser une seule assistance avec échec, garde et interruption avant d’étendre aux six fiches. |
| SHCG-36 | Tag et transfert du contrôle | P2 | documented-only | Spécifier et tester les cinq moments départ/entrée/transfert/contrôle/cleanup avec KO simultané. |
| SHCG-37 | Techniques combinées et supers d’équipe | P2 | documented-only | Prototyper la combinaison Lying Figure/Mannequin avec capture uniquement sur cible compatible. |
| SHCG-38 | Dénouements d’équipe et fins conditionnelles | P2 | documented-only | Raccorder une conclusion de versus originale et ses remplacements sans réécrire une fin officielle. |
| SHCG-39 | Clashes et confrontations QTE | P2 | documented-only | Commencer par un clash sans QTE avec plafond de fréquence ; conserver le QTE comme variante séparée. |
| SHCG-40 | Entités indépendantes et objets placés | P1 | documented-only | Réaliser d’abord une fiche de rencontre Doll stationnaire ; conserver son admission inchangée. |
| SHCG-41 | Projectiles persistants et règles communes | P0 | partial | Relier chaque projectile existant à une politique d’état explicite avant le tag. |
| SHCG-42 | Stages bonus et épreuves narratives | P1 | documented-only | Prototyper l’épreuve de déplacement Air Screamer et un dossier d’observation sans combat. |
| SHCG-43 | Espace exploratoire de déblocage | P2 | documented-only | Créer une seule zone et une récompense permanente vérifiée avant d’étendre la carte. |
| SHCG-44 | Relations, narration et compatibilités | P0 | documented-only | Conserver la matrice de trois duos et ouvrir d’autres paires seulement après fiche source. |
| SHCG-45 | Assets, animations, sons et mise en scène | P0 | documented-only | Démarrer par les poses fixes nommées des exemples, puis produire de vrais cycles vérifiés. |
| SHCG-46 | Interface, apprentissage, accessibilité et réseau | P0 | partial | Valider les maquettes au clavier/manette puis définir l’état sérialisable avant toute fonction en ligne. |
| SHCG-47 | Validation, statistiques et ordre d’intégration | P0 | documented-only | Prendre les cas associés à la prochaine tranche jouable et conserver les autres en not-run. |
| SHCG-48 | Fiches de production complémentaires | P1 | documented-only | Réutiliser les modèles et ne pas créer de nouvel ID de combattant pour une attitude. |
| SHCG-49 | Instruction d’intégration et références | P0 | documented-only | Publier la matrice et les limites avec le même lot que les documents d’extension. |
| SHCG-50 | Portée du module de verrouillage | P1 | documented-only | Raccorder les règles documentaires au catalogue sans retirer l’accès aux modes actuels. |
| SHCG-51 | Découverte, droits, installation et compatibilité | P0 | documented-only | Implémenter un résolveur pur de disponibilité avec priorités et tests de combinaisons. |
| SHCG-52 | Langage visuel des verrous | P1 | documented-only | Produire un set UI avec secret, indice, acquis, installation et indisponibilité. |
| SHCG-53 | Slots de personnages et partenaires | P1 | documented-only | Tester un profil secret, un acquis non installé et un rôle non combattant sans modifier l’admission. |
| SHCG-54 | Costumes, palettes et accessoires | P1 | documented-only | Documenter une palette originale de galerie et ses tests avant toute proposition d’avantage de soutien. |
| SHCG-55 | Stages, variantes et destinations | P1 | documented-only | Valider une fiche de variante originale de old_silent_hill avec un stage de repli commun. |
| SHCG-56 | Modes et parcours verrouillés | P1 | documented-only | Limiter les premiers verrous à de nouveaux contenus de collection, sans régression des modes disponibles. |
| SHCG-57 | Conditions ET/OU et progression | P1 | documented-only | Mapper les seuls événements persistés et prévoir une migration explicite pour les nouveaux compteurs. |
| SHCG-58 | Exploration, attribution et révélation | P2 | documented-only | Construire un cas de récompense à réclamer puis fermer/recharger à chaque étape. |
| SHCG-59 | Avantages de soutien et modèles d’acquisition | P2 | documented-only | Garder les avantages en brouillon documentaire tant que leur activation n’est pas un chantier concret autorisé et validé. |
| SHCG-60 | Liaison externe Patreon ou équivalent | P2 | documented-only | Revérifier la documentation officielle du fournisseur au moment de l’implémentation, sans importer un token dans le dépôt. |
| SHCG-61 | Expiration, changements et hors ligne | P2 | documented-only | Définir une validité explicite par source et les cas de retrait avant d’activer le catalogue temporaire. |
| SHCG-62 | Local, multijoueur, entraînement et replays | P0 | documented-only | Tester d’abord deux profils locaux et leurs droits sans élargir à un service réseau. |
| SHCG-63 | Textes, accessibilité et protection des surprises | P0 | documented-only | Vérifier les messages et le focus sur une grille contenant tous les états documentés. |
| SHCG-64 | Production, sauvegarde et recette des droits | P0 | documented-only | Faire une migration additive, puis injecter fermeture, doublon, panne et seconde source valide. |
| SHCG-65 | Six fiches du module d’accès | P1 | documented-only | Réutiliser les fiches pour un premier contenu permanent gratuit et ses états techniques. |
| SHCG-66 | Instruction d’intégration au projet | P0 | documented-only | Contrôler les liens, empreintes et diff des classeurs avant publication. |
| SHCG-67 | Références et vocabulaire de l’accès | P0 | documented-only | Conserver les dates et périmètres de source dans la documentation du futur adaptateur. |

## Décisions sur les modules

| Module | Décision | Priorité | Justification |
| --- | --- | --- | --- |
| Nouvelles animations | deferred | P1 | Phase demandée : sprites de base et images fixes ; états et besoins conçus dès maintenant. |
| Campagne globale jouable | retained | P1 | Intrigue distincte conçue ; implémentation et recette de bout en bout restent à faire. |
| Transitions vers une autre arène | retained | P1 | Objectif de conception avec destinations réelles ; prototype dédié requis, distinct de la bascule Otherworld. |
| Tag et assistances | deferred | P2 | La conception des assistances, tags, supers et Dénouements d’équipe est retenue dans l’extension 01. Leur développement reste différé : ressources atomiques, réservation du partenaire, continuités et recette complète sont requis avant activation. |
| Coopération et plusieurs plans | deferred | P2 | Non requis pour l'intégration de bible ; géométrie, caméra et règles à concevoir avant ajout. |
| En ligne, rollback et matchmaking | decision-needed | P0 | Aucune livraison réseau constatée. Décider architecture et services avant toute promesse en ligne. |
| Replay de commandes versionné | deferred | P2 | La reprise de run existe mais ne rejoue pas une simulation ; enregistrement déterministe à concevoir. |
| Archives exploratoires ; avatar RPG hors périmètre | deferred | P2 | L’extension 01 retient un espace de collection original compatible et l’extension 02 précise ses récompenses et droits. Les archives sont conçues mais non développées. Cette évolution ne crée ni avatar RPG, ni lieu canonique inventé, ni boutique active. |
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

**Existant :** storyPlan produit une structure par profil et filtre les groupes source, pas toutes les éditions fines. Admission au combat et présence d'adversaires sont des conditions séparées. Les textes dérivés ne constituent pas des campagnes individuelles détaillées. Le récit SH1 d’Air Screamer possède désormais une introduction et une conclusion fixes associées à sa sélection, à son premier chapitre et à son achèvement ; sa file de rencontres est conservée.

**Fichiers associés :** [src/tournament.js](../../src/tournament.js) · [src/run-progress.js](../../src/run-progress.js) · [docs/TOURNAMENT_STORY.md](../../docs/TOURNAMENT_STORY.md) · [docs/combat-guide/CAMPAGNE_ET_DENOUEMENTS.md](../../docs/combat-guide/CAMPAGNE_ET_DENOUEMENTS.md) · [src/story-art.js](../../src/story-art.js) · [src/versus.js](../../src/versus.js)

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

**Existant :** 48 illustrations de Chroniques sont conservées. Deux PNG individuels d’Air Screamer sont produits et liés dans story-art : passage devant la maison de Levin Street puis même rue vide. La scène de rivalité et les scènes de campagne restent des briefs.

**Fichiers associés :** [src/chronicle-art.js](../../src/chronicle-art.js) · [docs/combat-guide/CAMPAGNE_ET_DENOUEMENTS.md](../../docs/combat-guide/CAMPAGNE_ET_DENOUEMENTS.md) · [docs/combat-guide/FICHES_ET_VALIDATION.md](../../docs/combat-guide/FICHES_ET_VALIDATION.md) · [src/story-art.js](../../src/story-art.js) · [docs/production/vague30/story/README.md](../../docs/production/vague30/story/README.md)

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

**Existant :** Directeur, reducedMotion, pistes et listes d'événements autorisés présents ; les quatre axes ne possèdent pas encore un contrat de réglages totalement indépendant. Les scènes Shimizu Residence II, quai de Toluca Lake et corridor Otherworld de Toluca Prison disposent de deux plans fixes chacune ; plafond peint et décor ne créent pas de règle de plafond.

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

**Existant :** Registre, provenance, ancrages, cadres et statut candidat présents ; aucune fidélité visuelle n'est certifiée par ce guide. La vague 30 ajoute 14 PNG fixes candidats : 3 poses, 3 effets, 6 plans de décor et 2 images de récit ; zéro nouvelle animation.

**Fichiers associés :** [art/registry.json](../../art/registry.json) · [src/sprite-manifest.js](../../src/sprite-manifest.js) · [scripts/build-sprites.mjs](../../scripts/build-sprites.mjs) · [docs/SPRITE_AUTHORING_v0.9.3.md](../../docs/SPRITE_AUTHORING_v0.9.3.md) · [docs/production/vague30/README.md](../../docs/production/vague30/README.md)

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

### SHCG-30 — Portée et rattachement au guide général

**Adaptation :** Raccorder les vingt rubriques de l’extension aux 230 profils existants, aux stages, Chroniques et exigences 00–29. Les rôles de combat et éditions définis par la politique de référence restent prioritaires. La conception décrit les phases et contrats des animations ; leur production demeure dans sa phase dédiée.

**Existant :** Le guide général et ses associations existent. Les deux extensions sont ajoutées comme sources séparées avec empreintes ; elles ne changent pas les règles du moteur.

**Fichiers associés :** [docs/combat-guide/requirements.json](../../docs/combat-guide/requirements.json) · [docs/combat-guide/associations.json](../../docs/combat-guide/associations.json) · [src/combat-reference-policy.js](../../src/combat-reference-policy.js) · [docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt)

**Validation attendue :**

- 38 sections nouvelles et 40 cas de recette reliés aux deux sources exactes
- Aucun rôle non combattant promu par une fiche d’extension

### SHCG-31 — Taunts et réactions de personnalité

**Adaptation :** Retenir les attitudes déjà prévues par profile.reference.proposals.taunt. Aucun dialogue humain, pouvoir sonique, renfort ou bonus de jauge implicite pour une créature. Documenter entrée, tenue, sortie, interruption et variantes par édition ; huit fiches détaillées accompagnent la présente matrice.

**Existant :** player-input expose taunt ; Fight.beginTaunt crée une piste avec minimum 66 ticks, et cancelTaunt intervient sur commande ou interruption. Cette base ne démontre ni clips complets ni fidélité visuelle.

**Fichiers associés :** [src/player-input.js](../../src/player-input.js) · [src/fight.js](../../src/fight.js) · [src/lore-cinematics.js](../../src/lore-cinematics.js) · [data/roster.json](../../data/roster.json) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt)

**Validation attendue :**

- Action disponible seulement dans ses états autorisés et sans gain de ressource caché
- Interruption enlève piste et effets sans protéger la cible
- Cri Air Screamer sans onde ; Lying Figure sans bras libérés

### SHCG-32 — Sélection, confirmation et désélection

**Adaptation :** Définir survol, aperçu, confirmation, attente, costume, désélection complète/abrégée, équipe et départ combat. L’aperçu nettoie ses acteurs et sons à chaque changement. Réutiliser la locomotion attestée : retrait au pas, ailes repliées, retrait dans le support pour Wall Man ; aucun corps caché inventé.

**Existant :** Sélection et portraits existent dans versus/archive ; les pistes de présentation de combat ne constituent pas un cycle complet de sélection-désélection.

**Fichiers associés :** [src/versus.js](../../src/versus.js) · [src/archive.js](../../src/archive.js) · [src/presentation-sequences.js](../../src/presentation-sequences.js) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt)

**Validation attendue :**

- Navigation rapide prise en compte avant la fin de la scène
- Désélection spécifique et courte, sans inversion automatique du film
- Deux curseurs et choix identiques sans partage d’état

### SHCG-33 — Profils d’équipe et partenaires

**Adaptation :** Spécifier une cible hybride à deux, un actif et une réserve, vies séparées et défaite après les deux KO. Les équipes de monstres sont des compositions de versus alternatives ; une présence dans le même opus ne prouve pas une alliance. Les deux corps Twin Pyramid Heads constituent un profil multi-body, pas deux slots de tag.

**Existant :** Le moteur de duel manipule deux côtés. Aucun profil d’équipe supplémentaire n’est livré par cette passe. Les rôles multi-body, stationary-boss et environmental-obstacle existent dans la politique.

**Fichiers associés :** [src/fight.js](../../src/fight.js) · [src/combat-reference-policy.js](../../src/combat-reference-policy.js) · [data/roster.json](../../data/roster.json) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt)

**Validation attendue :**

- Admission et édition de chaque membre vérifiées
- Profil hybride clairement séparé du duel historique
- Double corps et entité native ne créent pas gratuitement une réserve

### SHCG-34 — Commandes, jauges et disponibilité

**Adaptation :** Réserver des actions remappables ASSISTANCE, RELAIS, SUPER_DUO et DENOUEMENT_EQUIPE. Jauge d’équipe distincte de Nightmare : coût atomique, refus sans dépense, cooldown et disponibilité du partenaire séparés. Les réglages proposés dans examples.json sont hypothèses de prototype, sans valeur canonique.

**Existant :** Les commandes et la jauge Nightmare existent ; l’économie d’équipe additionnelle reste une spécification.

**Fichiers associés :** [src/player-input.js](../../src/player-input.js) · [src/fight.js](../../src/fight.js) · [src/run-progress.js](../../src/run-progress.js) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt)

**Validation attendue :**

- Une seule réservation de partenaire et de ressource par tick
- Pause et cinématique ne rechargent pas gratuitement l’équipe
- KO entrant gratuit si un survivant doit rejoindre le duel

### SHCG-35 — Assistances ponctuelles

**Adaptation :** Préparer six interventions courtes réutilisant une action activée du moveset exact : griffure planée, bond mordu, jet thoracique, jambes supérieures, poussée du Closer et bond du Double Head. Aucun pouvoir ajouté par le simple statut de soutien. Les supports fixes restent hors du premier prototype d’assistance libre.

**Existant :** Les actions de base et leurs propriétaires existent dans data/movesets.json. Le cycle d’assistance n’est pas livré dans cette passe.

**Fichiers associés :** [data/movesets.json](../../data/movesets.json) · [src/combat-reference-policy.js](../../src/combat-reference-policy.js) · [src/combat-resolution.js](../../src/combat-resolution.js) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt)

**Validation attendue :**

- Arrivée/action/sortie/récupération explicites et punissables
- Toucher actif et réserve ne double pas le gain commun
- KO ou interruption nettoie la présence sans effacer un coût engagé

### SHCG-36 — Tag et transfert du contrôle

**Adaptation :** Relais volontaire et relais après KO d’abord ; relais de combo/secours différés jusqu’à recette. Le transfert du contrôle, de la cible HUD et des entrées se fait une seule fois à un tick défini. Conserver vie, munitions, statuts, coûts et historique du combo ; ne pas transférer la propriété des projectiles.

**Existant :** Le run conserve un personnage joueur ; changer un portrait ou recommencer un combat ne prouve pas un relais en cours de manche.

**Fichiers associés :** [src/fight.js](../../src/fight.js) · [src/versus.js](../../src/versus.js) · [src/run-progress.js](../../src/run-progress.js) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt)

**Validation attendue :**

- Un seul acteur reçoit les commandes après transfert
- Aucun soin ou cooldown gratuit par alternance
- Arrivée sûre et réponse claire si aucune réserve utilisable

### SHCG-37 — Techniques combinées et supers d’équipe

**Adaptation :** Trois duos de même œuvre reçoivent une contribution distincte de chaque créature. Chaque combinaison et son nom sont créés pour le versus. La chorégraphie longue attend la confirmation de l’ouverture ; une garde ou un échec donne une résolution courte. Aucune scène exclusive n’est revendiquée pour les autres paires.

**Existant :** Des ultimes individuels existent ; les super duos proposés n’ont ni contrôleur ni animation livrés dans ce lot.

**Fichiers associés :** [data/movesets.json](../../data/movesets.json) · [src/combat-resolution.js](../../src/combat-resolution.js) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt)

**Validation attendue :**

- Deux contributeurs disponibles et réservés pendant la scène
- Cibles et morphologies compatibles vérifiées
- Retour à un membre actif, positions et ressources déterminés

### SHCG-38 — Dénouements d’équipe et fins conditionnelles

**Adaptation :** Prolonger le nom de projet Dénouements : collectif et conditionnel sont des catégories de conception. Priorité proposée : conditionnel exact, collectif autorisé, individuel compatible, victoire simple. Aucun KO ressuscité, aucune victoire inversée par la présentation. Les conclusions restent alternatives au récit officiel.

**Existant :** Les Dénouements Signature/Cauchemar et du lieu sont documentés ; les séquences collectives nouvelles ne sont pas produites.

**Fichiers associés :** [docs/combat-guide/CAMPAGNE_ET_DENOUEMENTS.md](../../docs/combat-guide/CAMPAGNE_ET_DENOUEMENTS.md) · [data/fatalities.json](../../data/fatalities.json) · [src/presentation-sequences.js](../../src/presentation-sequences.js) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt)

**Validation attendue :**

- Version, lieu, participants et cible évalués avant l’engagement
- Remplacement si partenaire KO ou morphologie incompatible
- Même résultat avec présentation abrégée

### SHCG-39 — Clashes et confrontations QTE

**Adaptation :** Limiter le prototype à une collision compatible au contact, puis séparation reproductible. La confrontation de deux tuyaux de Bubble Head Nurse est une adaptation de versus, pas une scène canonique. QTE facultatif uniquement en profil spectacle annoncé ; profil stable sans QTE. Aucun choc universel de projectiles ni rayon donné aux créatures.

**Existant :** La résolution des contacts existe. Les groupes de clash, fenêtres comparées et cinématiques interactives restent à implémenter.

**Fichiers associés :** [src/combat-resolution.js](../../src/combat-resolution.js) · [src/fight.js](../../src/fight.js) · [data/movesets.json](../../data/movesets.json) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt)

**Validation attendue :**

- Contact actif et simultanéité définis en ticks
- Projectile tiers, assistance et tie-break indépendants du côté gauche
- Réussite/échec/égalité/absence/déconnexion bornés

### SHCG-40 — Entités indépendantes et objets placés

**Adaptation :** Prendre Doll et ses Shadows comme fiche de relation propriétaire/entités déjà documentée, sans lever son rôle environmental-obstacle. Le corps demeure fixe et la destruction dissipe ses Shadows. Twin Pyramid Heads reste une rencontre à deux corps ; aucune fusion ni slot d’équipe additionnel. Les autres kits ne reçoivent pas de piège par défaut.

**Existant :** Les profils et restrictions sont présents dans la bible ; la description ne démontre pas un système natif de compagnons commandés utilisable partout.

**Fichiers associés :** [data/roster.json](../../data/roster.json) · [src/combat-reference-policy.js](../../src/combat-reference-policy.js) · [src/lore-cinematics.js](../../src/lore-cinematics.js) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt)

**Validation attendue :**

- Propriétaire stable et rôle non combattant préservé
- Commandes, budget, vulnérabilité et disparition propres à chaque entité
- Aucun corps ou pouvoir ajouté pour satisfaire un schéma commun

### SHCG-41 — Projectiles persistants et règles communes

**Adaptation :** Le jet thoracique de Lying Figure fournit le cas de projectile attribué à un propriétaire. Ne pas lui ajouter guidage, réflexion, poison de sol persistant ou nuage de mort de remake sans référence. Définir pour chaque entité réserve/KO/transformation/transition/clash/fin de manche et budget partagé.

**Existant :** Projectiles, manifestes bitmap et collisions existent ; les règles supplémentaires d’équipe et de persistance sont seulement conçues ici.

**Fichiers associés :** [src/projectile-bitmaps.js](../../src/projectile-bitmaps.js) · [src/projectile-bitmap-manifest.js](../../src/projectile-bitmap-manifest.js) · [src/fight.js](../../src/fight.js) · [data/movesets.json](../../data/movesets.json) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt)

**Validation attendue :**

- Propriétaire, source de dégâts et combo restent stables au relais
- La présentation réduite ne supprime aucune menace réelle
- Au KO/transition appliquer une politique documentée sans impact doublé

### SHCG-42 — Stages bonus et épreuves narratives

**Adaptation :** Préparer quatre épreuves originales raccordées au Registre des absences et à ses dossiers : déplacement Air Screamer, portée de la grande lame, observation des manifestations de fuite, coordination de versus. Une horde éventuelle utilise des cibles de test explicitement originales ; aucune créature canonique puissante n’est dégradée en ennemi fragile par défaut.

**Existant :** Les modes de parcours et la campagne documentaire existent ; ces bonus n’ont pas d’entrée jouable ou de scène produite dans cette passe.

**Fichiers associés :** [docs/combat-guide/CAMPAGNE_ET_DENOUEMENTS.md](../../docs/combat-guide/CAMPAGNE_ET_DENOUEMENTS.md) · [src/run-progress.js](../../src/run-progress.js) · [data/chronicles.json](../../data/chronicles.json) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt)

**Validation attendue :**

- But mesurable, état initial et sortie définis
- Échec facultatif ne bloque pas le récit
- Aucune victoire fictive pour harry_ice ou maya_villa

### SHCG-43 — Espace exploratoire de déblocage

**Adaptation :** Nom de projet : Archives du Registre, prolongement documentaire du Registre des absences. Une carte 2D de dossiers reliés offre une exploration sans inventer un bâtiment canonique reliant toutes les œuvres. Les connexions sont des passages de consultation ; une porte physique demande une source géographique.

**Existant :** Les Archives actuelles consultent des catalogues. Elles ne sont pas encore un hub explorable ni une économie de clés.

**Fichiers associés :** [src/archive.js](../../src/archive.js) · [docs/combat-guide/CAMPAGNE_ET_DENOUEMENTS.md](../../docs/combat-guide/CAMPAGNE_ET_DENOUEMENTS.md) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt)

**Validation attendue :**

- Carte, accès et récompenses distincts par œuvre
- Aucun cycle de prérequis ; voies gratuites d’apprentissage préservées
- Ouverture sauvegardée avant scène et jamais débitée deux fois

### SHCG-44 — Relations, narration et compatibilités

**Adaptation :** Les trois paires proposées sont des coopérations alternatives de versus, pas des alliances attestées. Une scène de campagne exige présence, édition et disponibilité précises. Le groupe film ne fusionne pas 2006, Revelation et Return ; une apparence remake ne remplace pas une identité originale. Les créatures silencieuses gardent des gestes et sons.

**Existant :** La bible distingue les groupes source et leurs limites ; des rivalités de versus sont déjà étiquetées comme calculées/non canoniques.

**Fichiers associés :** [docs/combat-guide/CAMPAGNE_ET_DENOUEMENTS.md](../../docs/combat-guide/CAMPAGNE_ET_DENOUEMENTS.md) · [docs/COMBAT_GAMES_GUIDE_INTEGRATION.md](../../docs/COMBAT_GAMES_GUIDE_INTEGRATION.md) · [src/combat-reference-policy.js](../../src/combat-reference-policy.js) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt)

**Validation attendue :**

- Chaque duo porte statut de relation, éditions et modes autorisés
- Aucune scène exclusive annoncée pour toutes les combinaisons
- Aucune connaissance ou réplique inventée présentée comme canon

### SHCG-45 — Assets, animations, sons et mise en scène

**Adaptation :** Chaque taunt, sélection, assistance, super, entité, bonus et récompense possède une liste de poses et de dépendances. Un personnage par source bitmap ; les storyboards collectifs peuvent réunir les participants. Lier propriétaire, orientation, ancrage et version sans modifier les compteurs d’animation pour un simple brief.

**Existant :** Registre d’art, manifestes et chaînes d’import existent ; aucun nouvel asset d’extension n’est généré par cette intégration.

**Fichiers associés :** [art/registry.json](../../art/registry.json) · [src/sprite-manifest.js](../../src/sprite-manifest.js) · [src/sprite-poses.js](../../src/sprite-poses.js) · [docs/SPRITE_PIPELINE_v0.9.1.md](../../docs/SPRITE_PIPELINE_v0.9.1.md) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt)

**Validation attendue :**

- Pose fixe, storyboard, clip animé et intégration comptés séparément
- Versions réduites et sorties propres prévues
- Asymétries de mains, armes et morphologies conservées

### SHCG-46 — Interface, apprentissage, accessibilité et réseau

**Adaptation :** Conserver remappage et confort existants. Ajouter aux maquettes actif/réserve, jauge commune/cooldown/ressource personnelle et raison de refus. Entraînement pour assist/tag/clash/entité seulement lorsque ces mécanismes existent. Réseau et replay restent décisions séparées, sans promesse de rollback livré.

**Existant :** Clavier/manette, entraînement, pause et réglages sont présents. L’UI d’équipe et l’état réseau de ces nouveaux systèmes ne sont pas livrés.

**Fichiers associés :** [src/player-input.js](../../src/player-input.js) · [src/playflow-ui.js](../../src/playflow-ui.js) · [src/versus.js](../../src/versus.js) · [src/save-store.js](../../src/save-store.js) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt)

**Validation attendue :**

- L’option de confort conserve l’information de combat
- Aides QTE solo séparées des règles communes PvP
- Passage abrégé aboutit au même état logique

### SHCG-47 — Validation, statistiques et ordre d’intégration

**Adaptation :** Conserver 18 cas de recette de l’extension 01, chacun relié à ses sections. Les cas sont préparés, pas exécutés. La couverture de documentation se compte sur 20 sections ; elle n’est pas le pourcentage d’achèvement des fonctionnalités.

**Existant :** Les tests historiques n’établissent pas le bon fonctionnement de systèmes encore documentaires.

**Fichiers associés :** [docs/combat-guide/extensions/requirements.json](../../docs/combat-guide/extensions/requirements.json) · [docs/combat-guide/extensions/README.md](../../docs/combat-guide/extensions/README.md) · [docs/combat-guide/ETAT_DES_LIEUX.md](../../docs/combat-guide/ETAT_DES_LIEUX.md) · [docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt)

**Validation attendue :**

- 18 cas E01 uniques, sans résultat réussi inventé
- Statistiques par section, fiche, pose et clip
- Chaque futur résultat précise version et preuve

### SHCG-48 — Fiches de production complémentaires

**Adaptation :** Fournir les dix familles A–J au moyen des fiches examples.json : attitude, sélection, équipe, assistance/relais, super/conclusion, clash, entité/projectile, bonus, exploration et récompense. Les fiches nommées restent de la conception, même si elles réemploient un sprite existant.

**Existant :** Le guide général possède déjà dix modèles ; les seize modèles additionnels des deux extensions sont raccordés par ce lot.

**Fichiers associés :** [docs/combat-guide/FICHES_ET_VALIDATION.md](../../docs/combat-guide/FICHES_ET_VALIDATION.md) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/extensions/README.md](../../docs/combat-guide/extensions/README.md) · [docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt)

**Validation attendue :**

- Dix familles E01 couvertes par une fiche concrète ou un statut motivé
- ID stable, source, statuts et critères sur chaque fiche

### SHCG-49 — Instruction d’intégration et références

**Adaptation :** Conserver l’extension source sans modification, sa provenance et ses références. Les inspirations d’autres jeux ne sont pas des preuves de lore Silent Hill. Les liens de sources de franchise restent attachés aux observations du dossier précis.

**Existant :** Les sources exactes sont copiées avec SHA256 ; leur contenu reste distinct des propositions spécifiques au fan-game.

**Fichiers associés :** [docs/combat-guide/extensions/README.md](../../docs/combat-guide/extensions/README.md) · [docs/combat-guide/extensions/requirements.json](../../docs/combat-guide/extensions/requirements.json) · [docs/SOURCES.md](../../docs/SOURCES.md) · [docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt)

**Validation attendue :**

- Empreinte source identique à la copie Drive
- Aucune propriété d’un jeu de référence transférée comme capacité canonique

### SHCG-50 — Portée du module de verrouillage

**Adaptation :** Appliquer la conception aux profils, costumes, stages, modes et collections retenus. Le catalogue reste consultable. Un verrou signifie une règle d’accès ; une production absente est affichée comme technique/inachevée. Les systèmes de soutien sont préparés sans activer une offre commerciale.

**Existant :** Le catalogue et ses restrictions de rôle existent ; le module de droits à quatre axes n’est pas livré par ces documents.

**Fichiers associés :** [src/archive.js](../../src/archive.js) · [src/combat-reference-policy.js](../../src/combat-reference-policy.js) · [docs/COMMERCIAL_READINESS.md](../../docs/COMMERCIAL_READINESS.md) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt)

**Validation attendue :**

- Accès, rôle et absence de fichier distincts
- Toutes catégories reçoivent décision et priorité

### SHCG-51 — Découverte, droits, installation et compatibilité

**Adaptation :** Modèle à quatre axes indépendants : secret/indice/identifié ; sources permanentes/temporaires/en attente/expirées ; installation/version ; admission au mode/équipe. Un contenu peut être acquis mais non installé ou un costume acquis avant le personnage. Priorité de message et action utile explicites.

**Existant :** Le champ unlock historique est descriptif et la politique combatEnabled décide un rôle, pas une propriété de compte.

**Fichiers associés :** [data/roster.json](../../data/roster.json) · [src/combat-reference-policy.js](../../src/combat-reference-policy.js) · [src/save-store.js](../../src/save-store.js) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt)

**Validation attendue :**

- Aucun booléen unlocked utilisé comme vérité unique
- Source permanente préservée quand une source temporaire expire
- Refus de rôle ne se présente pas comme paiement manquant

### SHCG-52 — Langage visuel des verrous

**Adaptation :** Métaphore UI originale : dossiers opaques, fiches scellées et marque de fermeture, brouillard décoratif limité. Silhouette seulement après indice révélé ; une identité secrète utilise un emblème neutre. Ne pas employer un sceau comme événement canonique et ne pas donner un sens magique inventé à un symbole de la série.

**Existant :** La direction visuelle du projet est disponible ; les nouveaux cadres et états n’ont pas d’images livrées dans cette passe.

**Fichiers associés :** [docs/GDD_FR.md](../../docs/GDD_FR.md) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/extensions/README.md](../../docs/combat-guide/extensions/README.md) · [docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt)

**Validation attendue :**

- Texte/icône/focus contrastés, sans dépendre du rouge ou du son seul
- Aucune fuite d’identité par silhouette/voix/aria-label
- Version à mouvements réduits sans flash

### SHCG-53 — Slots de personnages et partenaires

**Adaptation :** Le slot verrouillé reste focusable et explique la voie d’accès. La confirmation ouvre la fiche ; elle ne sélectionne pas un profil interdit. Aléatoire et équipes sauvegardées évaluent les quatre axes. Les profils hors duel, dont Doll, gardent leur dossier sans promesse de déblocage combattant.

**Existant :** Le roster comporte des profils admis et non admis ; aucune règle d’accès ne peut annuler la politique de référence.

**Fichiers associés :** [src/versus.js](../../src/versus.js) · [src/combat-reference-policy.js](../../src/combat-reference-policy.js) · [data/roster.json](../../data/roster.json) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt)

**Validation attendue :**

- Aléatoire exclut non utilisables, pas les fiches consultables
- Compagnon indispensable inclus dans le kit et non vendu à part
- Duo verrouillé distinct des membres acquis

### SHCG-54 — Costumes, palettes et accessoires

**Adaptation :** Présenter provenance, période et statut de chaque apparence. Une palette originale reste originale ; une arme changeant le kit est une variante. Un costume acquis avant son propriétaire reste enregistré. L’aperçu n’accorde pas le droit d’équiper et restitue le costume utilisable à sa fermeture.

**Existant :** Les variantes existent au catalogue ; aucune nouvelle apparence canonique ou de soutien n’est déclarée produite ici.

**Fichiers associés :** [data/roster.json](../../data/roster.json) · [art/registry.json](../../art/registry.json) · [src/sprite-manifest.js](../../src/sprite-manifest.js) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt)

**Validation attendue :**

- Même hitboxes/timings/ressources pour cosmétique
- Pas de transfert d’équipement entre versions
- Acquisition conservée lors d’un changement d’accès

### SHCG-55 — Stages, variantes et destinations

**Adaptation :** Séparer sélection, participation, variante visuelle, règles et destinations liées. Une ambiance de soutien éventuelle conserve géométrie, collisions et signaux ; les profils vivants/statiques de confort restent inclus. Tous les assets requis doivent être disponibles avant autorisation du match.

**Existant :** Les 123 IDs de stage et leurs références existent ; aucune nouvelle destination ni offre payante n’est créée par ce module.

**Fichiers associés :** [data/stages.json](../../data/stages.json) · [src/stage-reference-policy.js](../../src/stage-reference-policy.js) · [src/stage-director.js](../../src/stage-director.js) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt)

**Validation attendue :**

- Non-abonné peut participer selon politique annoncée sans acquérir le stage
- Transition impossible désactivée avant match avec explication
- Confort et règles de collision inchangés

### SHCG-56 — Modes et parcours verrouillés

**Adaptation :** Préserver Confrontation, Salle d’Observation, réglages et accès actuels. Préparer seulement des défis additionnels après apprentissage, ou chapitres/archives selon la campagne proposée. Aucun boss rush existant n’est rétroactivement bloqué par cette documentation.

**Existant :** Les modes run listés dans src/run-progress.js sont déjà présents ; les nouvelles tuiles de défis restent documentaires.

**Fichiers associés :** [src/run-progress.js](../../src/run-progress.js) · [src/command.js](../../src/command.js) · [src/save-store.js](../../src/save-store.js) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt)

**Validation attendue :**

- Pas de gain exigé dans le mode qui seul le débloquerait
- Maintenance et absence d’installation ne deviennent pas un défi
- Accès aux options et apprentissage préservés

### SHCG-57 — Conditions ET/OU et progression

**Adaptation :** Règles explicites all/any, compteurs typés et événements admissibles. Exemples : finir SHC_CAM_01 ET consulter le dossier ; ou réussite d’un défi OU avantage temporaire vérifié. Sources d’accès conservées séparément, coût et attribution idempotents, aucune rétroactivité promise sans trace enregistrée.

**Existant :** Les sauvegardes ont matchs appliqués et Chroniques terminées ; ces traces ne couvrent pas arbitrairement toutes les nouvelles conditions.

**Fichiers associés :** [src/save-store.js](../../src/save-store.js) · [src/run-progress.js](../../src/run-progress.js) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt)

**Validation attendue :**

- Branches ET/OU montrées et évaluées correctement
- Aucun cycle de dépendances
- Doublon d’événement ne recrédite ni redébite

### SHCG-58 — Exploration, attribution et révélation

**Adaptation :** Les Archives du Registre utilisent le même contentId que les menus. Attribuer et sauvegarder avant la révélation ; le passage abrégé ne saute pas le gain. Une récompense déjà obtenue est signalée avant tout coût. La carte est une création du projet, pas une localisation canonique commune aux épisodes.

**Existant :** Aucune transaction de coffre ni scène d’acquisition nouvelle n’est produite dans cette passe.

**Fichiers associés :** [src/archive.js](../../src/archive.js) · [src/save-store.js](../../src/save-store.js) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt)

**Validation attendue :**

- Réouverture sans coût double
- Arrêt pendant révélation conserve l’acquisition
- État À réclamer uniquement pour récompense vraiment manuelle

### SHCG-59 — Avantages de soutien et modèles d’acquisition

**Adaptation :** Préparer un contrat de catalogue : permanent, temporaire ou lot de période. Priorité aux éléments cosmétiques originaux ; pas de statistiques payantes. Aucun prix, niveau commercial, avantage vendu ou campagne active n’est créé. L’état commercialAuthorized:false documenté demeure inchangé.

**Existant :** COMMERCIAL_READINESS et release/readiness.json portent les limites commerciales du projet ; les propositions d’abonnement ne les lèvent pas.

**Fichiers associés :** [docs/COMMERCIAL_READINESS.md](../../docs/COMMERCIAL_READINESS.md) · [release/readiness.json](../../release/readiness.json) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt)

**Validation attendue :**

- Modèle d’acquisition annoncé par contenu
- Cosmétique distinct d’une variante de gameplay
- Droits permanents existants conservés au changement d’offre

### SHCG-60 — Liaison externe Patreon ou équivalent

**Adaptation :** Décrire une interface d’adaptateur, pas un fournisseur actif. Liaison volontaire par autorisation officielle, preuve côté service de confiance, aucun secret dans le client Canvas, vérification d’événements, idempotence et réconciliation. Fournisseur/campagne/niveaux restent non configurés.

**Existant :** Le jeu actuel sauvegarde localement ; ce lot n’ajoute ni OAuth, webhook, compte externe ni paiement.

**Fichiers associés :** [src/save-store.js](../../src/save-store.js) · [docs/COMMERCIAL_READINESS.md](../../docs/COMMERCIAL_READINESS.md) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt)

**Validation attendue :**

- Compte lié distinct d’avantage confirmé
- Aucune preuve fondée sur adresse identique ou capture d’écran
- Événements doublés/désordonnés réconciliés

### SHCG-61 — Expiration, changements et hors ligne

**Adaptation :** Préserver acquisitions permanentes, découvertes et préférences. Expiration ne retire que sa source ; erreur réseau = statut inconnu, pas abonnement terminé. Une partie admise garde sa configuration jusqu’au résultat. Durées de justificatif et tolérance sont à décider sans inventer une validité garantie.

**Existant :** Le mode local n’a pas de fournisseur d’abonnement à réconcilier. Les scénarios d’expiration sont une recette future.

**Fichiers associés :** [src/save-store.js](../../src/save-store.js) · [src/run-progress.js](../../src/run-progress.js) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt)

**Validation attendue :**

- Permanent OU temporaire reste accessible si une source subsiste
- Annulation n’implique pas retrait immédiat arbitraire
- Aucun changement de costume ou décor en plein combo

### SHCG-62 — Local, multijoueur, entraînement et replays

**Adaptation :** Séparer aperçu, sélection, participation et test. Décrire profil principal/invité et futur compte distant. L’accès de collection ne remplace pas les restrictions de rôle. Une scène de replay n’est pas soumise au seul abonnement actuel ; absence d’asset et version incompatible reçoivent un message ou repli prévu.

**Existant :** Le local existe ; le réseau et les replays de combat ne sont pas établis par ce lot.

**Fichiers associés :** [src/versus.js](../../src/versus.js) · [src/save-store.js](../../src/save-store.js) · [src/run-progress.js](../../src/run-progress.js) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt)

**Validation attendue :**

- Contenu/versions/composition vérifiés avant départ
- Invité n’acquiert pas automatiquement ce qu’il voit
- Partenaire devenu inaccessible remplacé sans effacer l’équipe

### SHCG-63 — Textes, accessibilité et protection des surprises

**Adaptation :** Une fiche affiche identité autorisée, état et prochaine action. Les exemples textuels sont en français, traduisibles ; ils séparent Acquis, Installation nécessaire, Vérification indisponible et Hors de ce mode. Les secrets ne fuient ni en aria-label, ni dans une voix, un costume ou une notification.

**Existant :** Le projet possède une interface et des réglages ; les nouveaux états d’accès demandent une recette propre.

**Fichiers associés :** [src/playflow-ui.js](../../src/playflow-ui.js) · [src/versus.js](../../src/versus.js) · [src/archive.js](../../src/archive.js) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt)

**Validation attendue :**

- Icône+texte+focus, navigation clavier/manette et mouvement réduit
- Voies alternatives visibles au même niveau
- Aucune date d’expiration non établie affichée comme certaine

### SHCG-64 — Production, sauvegarde et recette des droits

**Adaptation :** Catalogue versionné et sources d’accès distinctes ; journal d’attribution, imports et migrations préservent les acquisitions. Vingt-deux scénarios E02 couvrent droits, présentation, sauvegarde et reprise. Les acquisitions du joueur ne sont pas une mesure de production des assets.

**Existant :** save-store fournit une validation et des sauvegardes de repli ; son schéma ne contient pas encore le catalogue d’accès complet proposé.

**Fichiers associés :** [src/save-store.js](../../src/save-store.js) · [docs/combat-guide/extensions/requirements.json](../../docs/combat-guide/extensions/requirements.json) · [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt)

**Validation attendue :**

- 22 cas E02 uniques, status not-run jusqu’à preuve
- Un slot terminé ne valide pas son combattant
- Migration conserve les identifiants et sources

### SHCG-65 — Six fiches du module d’accès

**Adaptation :** Raccorder les six modèles E02 aux exemples : contenu/slot, règle, avantage, charte des verrous, stage spécial, matrice d’accès. Chaque fiche indique sa portée documentaire et ses dépendances non produites.

**Existant :** Les modèles des fichiers sources sont conservés à l’identique ; les exemples propres au projet sont ajoutés séparément.

**Fichiers associés :** [docs/combat-guide/extensions/examples.json](../../docs/combat-guide/extensions/examples.json) · [docs/combat-guide/extensions/README.md](../../docs/combat-guide/extensions/README.md) · [docs/combat-guide/extensions/requirements.json](../../docs/combat-guide/extensions/requirements.json) · [docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt)

**Validation attendue :**

- Six familles couvertes sans inventer une offre opérationnelle
- Chaque contenu a un ID documentaire distinct des IDs runtime

### SHCG-66 — Instruction d’intégration au projet

**Adaptation :** Maintenir le lien entre guide général, extension 01 et extension 02. Enregistrer toute adaptation ou fonction différée et ne pas modifier une restriction de source pour remplir un tableau. Les builds de documentation et classeurs doivent afficher 68 sections avec états distincts.

**Existant :** Cette passe ajoute les deux sources, 38 rubriques et fiches ; les exports et liens sont gérés par le générateur commun.

**Fichiers associés :** [docs/combat-guide/extensions/requirements.json](../../docs/combat-guide/extensions/requirements.json) · [docs/combat-guide/extensions/README.md](../../docs/combat-guide/extensions/README.md) · [scripts/build-combat-guide.mjs](../../scripts/build-combat-guide.mjs) · [docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt)

**Validation attendue :**

- Matrice complète 00–67 sans écraser les données historiques
- Aucun contenu généré compté comme animé par l’import documentaire

### SHCG-67 — Références et vocabulaire de l’accès

**Adaptation :** Conserver la définition de slot, acquisition permanente, accès temporaire, admissibilité, attribution et resynchronisation. Les références Patreon de la source sont des lectures historiques ; les endpoints et modalités seront revérifiés lors d’un chantier réel de connexion.

**Existant :** Les sources datées du guide sont conservées ; aucun appel au service Patreon n’a été réalisé pour cette intégration.

**Fichiers associés :** [docs/combat-guide/extensions/README.md](../../docs/combat-guide/extensions/README.md) · [docs/combat-guide/extensions/requirements.json](../../docs/combat-guide/extensions/requirements.json) · [docs/COMMERCIAL_READINESS.md](../../docs/COMMERCIAL_READINESS.md) · [docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt](../../docs/combat-guide/source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt)

**Validation attendue :**

- Origine de chaque assertion technique explicitée
- Aucune promesse d’accès ou de service reposant sur une documentation non revérifiée
