# Fiches Silent Hill et critères de validation

Révision : 25 novembre 2026. Correspondance de la section 27 du
[guide original](source/Combat_Games_Guide_General_v1.0.txt) avec les données du
projet. Ces modèles complètent les fiches existantes et gardent leurs IDs.
Un champ sans preuve reste « à confirmer », sans valeur canonique inventée.

## A — Projet

**Support :** [GDD](../GDD_FR.md), [intégration du guide](../COMBAT_GAMES_GUIDE_INTEGRATION.md)
et [exigences](requirements.json).

| Champ | Valeur / emplacement |
| --- | --- |
| Projet | Silent Hill: Halo of Flesh ; version runtime dans `src/data.js`. |
| Univers et continuités | `franchise-corpus.json.records`, source, édition et statut éditorial distincts. |
| Format | Duel latéral JavaScript/Canvas 2D ; simulation et affichage séparés. |
| Commandes | `src/player-input.js`, règles et options du versus. |
| Piliers | Identité, morphologie, lisibilité, récit et traçabilité. |
| Modes | Tableau de l'intégration ; campagne globale conçue séparément. |
| Production | Bases et scènes fixes ; animations nouvelles différées. |
| Décisions à prendre | Plateformes/configurations finales, architecture réseau si retenue, périmètre de première version. |

**Validation :** périmètre nommé, décisions explicites, aucune extension activée
par déduction d'un exemple du guide.

## B — Manifestation, variante ou personnage

**Clé :** `roster.id`. Réutiliser `reference`, `variant`, `variantOf`,
`reference.baseId`, `stageId`, `fatalities`, et la politique d'admission.

- Source et édition exacte ; anatomie, taille relative, asymétries et arme.
- Rôle : combattant, boss fixe, rencontre scénarisée, obstacle, présence ou
  dossier incertain ; `combatEnabled` conservé séparément.
- Comportements observés, références et limites de leur interprétation.
- Rythme, forces, faiblesses, plan d'approche et réponses adverses.
- Commandes existantes et ressources ; toute action désactivée garde sa raison.
- Présentations, Dénouements, récit et scènes ; statut narratif des rivalités.
- Portrait, vue latérale, poses fixes, costumes et futurs besoins d'animation.
- États lore/conception/assets/intégration/validation/publication.

**Validation :** aucune capacité reçue d'un homonyme, aucun parent de variante
choisi depuis un simple libellé, aucun dossier non combattant annoncé jouable.

## C — Action ou projectile

**Clé d'association :** couple `(fighterId, moveKey)` existant. Le fichier
`data/movesets.json` conserve les paramètres ; un identifiant synthétique de
suivi ne remplace pas la clé runtime.

| Domaine | Champs à reprendre / compléter |
| --- | --- |
| Identité | `key`, `name`, `input`, `canonicalBasis`, `referenceIds`, `fidelity`, `enabled`, `disabledReason`. |
| Temps et espace | `startup`, `active`, `recovery`, `reach`, `travel`, `verticalTravel`, orientation et état sol/air. |
| Effet | Dégâts, garde, coût/gain de jauge, recul, chute, affliction, invulnérabilité et armure. |
| Résolution | Effets en touche/garde/contre/échec, hitstun/blockstun et avantage réel à mesurer. |
| Enchaînement | `cancelInto`, fenêtres, réduction, rebonds, limite de prolongation et retour du défenseur. |
| Projectile | Propriétaire, émission, vitesse, trajectoire, durée, collisions, traversée, disparition, moyens de réponse. |
| Visuel | PNG indépendant, ancrage, direction, départ/trajet/impact distincts lorsque nécessaires ; futur clip associé. |

**Exemple raccordé :** `sh2_lying_figure_020` et ses slots déclarés dans
`PROJECTILE_BITMAPS.sh2_lying_figure_acid`. La vue rampante
`sh2_lying_figure_crawling_021` ne reçoit pas automatiquement cet effet. Les
timings et la trajectoire de versus restent des paramètres du projet.

**Validation :** propriété et édition exactes, commande activée, collisions et
fin de vie reproductibles, absence d'image traitée sans fausse validation.

## D — Dénouement

**Clé :** ID existant dans `fighter.fatalities[]` ou `stage.fatality`.
Les nouveaux noms de conception sont conservés comme noms du projet.

- Famille : Signature, Cauchemar ou du lieu ; distinction avec super et outro.
- Intention du sujet et résultat ; source du geste, adaptation de conclusion.
- Conditions, commande, portée, état de cible, modes et déclencheur.
- Étapes, temps, ancrages, caméra, son, présentation abrégée et retour.
- Compatibilité : humanoïde, quadrupède, volant, géant, essaim, spectre, cible
  fixe ou autre morphologie réellement rencontrée.
- Remplacement précis pour chaque incompatibilité ; hors duel = indisponible.
- Conséquence narrative limitée au parcours concerné.

**Validation :** aucune anatomie improvisée pour faire fonctionner la séquence ;
le montage écrit, ses images et la recette en jeu ont des états distincts.

## E — Récit individuel

**Clé :** `fighterId` et format `monster-story-v1` pour l'existant.
Les futurs dossiers authored ajoutent leurs IDs sans casser les sauvegardes.

- Situation initiale et motivation de parcours ; comportement du sujet conservé.
- Déclencheur, épreuves, rival, revers, finale et conséquence.
- Pour chaque rencontre : adversaire, édition, raison, stage réel, entrée,
  victoire, échec, reprise et sortie.
- Rivalité attestée, adaptation ou rencontre alternative explicitée.
- Trois fonctions visuelles minimales : intro, conflit, outro ; plans en plus
  seulement lorsqu'ils apportent une information nouvelle.
- Lien avec Chronique et campagne globale ; niveau d'autonomie du récit.
- Statuts et recette des scènes, du parcours, des sauvegardes et de la galerie.

**Validation :** `combatEnabled` et au moins un adversaire sont nécessaires à
un parcours de duel. Une file calculée pour un dossier exclu reste ignorée.
Le groupe `film` nécessite un contrôle d'édition supplémentaire.

## F — Chapitre, scène et illustration

**Clé :** ID de chapitre/scène documentaire, puis référence runtime après
implémentation. Les IDs `SHC_CAM_*` et `SHC_ILL_*` du
[chapitre narratif](CAMPAGNE_ET_DENOUEMENTS.md) sont des IDs de conception.

- Campagne/route, ordre, statut original/adaptation, fonction dramatique.
- Lieu exact, époque, météo, état normal/Otherworld, personnages et versions.
- Situation d'entrée, action, révélation et conséquence à la sortie.
- Sujet, pose, expression, arme, blessures, direction du regard et ancrages.
- Cadrage, focale/perspective adaptée, lumière, palette, repères obligatoires.
- Texte, sous-titres et son séparés de l'image ; absence de dialogue si justifiée.
- Liens vers PNG produits ; besoins de couches seulement si usage prévu.
- Checkpoint, scène passable, consultation ultérieure et condition d'échec.

**Validation :** la scène fait comprendre une évolution. Un portrait de
sélection ne valide pas une illustration d'outro. Les blessures, costumes,
armes et destructions restent cohérents entre plans.

## G — Arène

**Clé :** `stages.id`, avec `reference`, `referencePolicy`, `director`, `layers`
et, si présent, `STAGE_BITMAPS[stageId]`.

- Pièce/rue/zone, œuvre et édition ; lieu attesté ou original annoncé.
- Repères architecturaux à conserver ; géométrie et caméra adaptées déclarées.
- Sol, dimensions, limites, hauteur, collisions et échelle des sujets.
- Plans lointain/intermédiaire/sol/avant-plan et éventuels effets séparés.
- Quatre axes : présentation, interactions, dangers, connexions.
- Audio, lumière et état du monde ; ressources et coût de rendu.
- Profils de règles, variante statique et confort.
- Assets candidats, éléments à corriger et preuves de recette.

**Validation :** ne pas attribuer une salle de boss au seul nom d'un bâtiment.
Les limites et le plan de marche restent lisibles pour petites et grandes
morphologies, dans les deux orientations.

## H — Événement, interaction ou connexion

**Clé :** ID d'événement existant ou nouvel ID documentaire explicitement
prévu ; ne pas remplir une destination fictive pour un simple effet local.

- Origine, objet, emplacement, destination éventuelle et preuve du raccord.
- Déclencheur, conditions, portée, direction, commande et capacités requises.
- Signal, défense/évitement, coût, vulnérabilité et priorité.
- Dégâts, ressources, combo, chrono, durée et présentation abrégée.
- État à l'arrivée, orientation, contrôle, usage unique/répété et retour.
- Double déclenchement, KO, interruption, reset et reprise.
- Version statique/réduite avec les mêmes informations de gameplay.
- Synchronisation future et version de règles si réseau/replay retenus.

**Validation :** destination existante et jouable dans le mode annoncé,
aucune boucle de transition infinie, aucune bascule Otherworld comptée comme
déplacement entre deux stages.

## I — Boss et Boss Rush

**Clé :** profil exact, politique d'admission et éventuelle variante de rencontre.

- Type de boss : duel, fixe, géant, à phases ou rencontre scénarisée.
- Rôle narratif, échelle, stage et état d'entrée.
- Phases, déclencheurs, attaques, annonces et vulnérabilités.
- Réponses pour courte/longue portée, petits/grands volumes et outils limités.
- Victoire, échec, conclusion, checkpoints, difficulté et récompense.
- Différences entre version de campagne et version de duel.
- Rush : ordre, admission, vie/ressources conservées, soins, essais et reprise.

**Validation :** le marquage `boss` ne suffit pas à l'admission. Une machine
sous licence listée dans le corpus n'est pas automatiquement une machine
hostile à fabriquer. Chaque immunité laisse une solution prévue.

## J — Asset et suivi

**Clé :** propriétaire exact, rôle d'asset et chemin final. Registres existants :
`art/registry.json`, `STAGE_BITMAPS`, `PROJECTILE_BITMAPS`, `chronicle-art.js`.

- Catégorie : portrait, sprite latéral, costume, prop, projectile, fond,
  couche, scène, VFX fixe ou futur clip.
- Référence, édition, origine du fichier et statut de fidélité.
- Dimensions, orientation, alpha, échelle, ancrage, marges et asymétries.
- Usage prévu, source maître et fichier intégré ; fichiers liés.
- Six états indépendants, version contrôlée, preuve et publication.
- Écart restant, blocage et prochaine action concrète.

**Validation :** un sujet par sprite autonome ; corps et armes non coupés
lorsque le cadrage l'exige ; transparence réelle ; revue à la taille du jeu.
Une composition narrative multi-sujets n'est pas un sprite autonome.

## Définitions de terminé

| Élément | Porte de validation |
| --- | --- |
| Fiche | Source/version/rôle, conception, adaptations et dépendances renseignés. |
| Base fixe | Sujet et cadrage corrects, revue contre références, alpha/ancrage/échelle conformes, chemin intégré. |
| Combattant | Actions autorisées, réactions, collisions, présentation et commandes testées dans les modes annoncés. |
| Arène | Présentation promise, limites, objets, dangers et connexions fonctionnent avec règles explicites. |
| Boss | Signaux, phases, réponses, victoire, défaite et reprise vérifiés. |
| Récit | Début, rencontres motivées, rivalité, conséquence, scènes et reprise accessibles. |
| Campagne | Intrigue et parcours jusqu'à la résolution, scènes et sauvegardes cohérents. |
| Mode | Sélection, partie, résultat, sortie et reprise réellement utilisables. |

La recette cible les changements réels : côté, tailles, coins, objets, KO,
chronomètre, déconnexion, sauvegarde et performances selon ce qui a changé.
Les images sont relues visuellement. Les tests de données vérifient les liens
et contraintes ; ils ne certifient pas les images, le lore ou l'équilibrage.

## Vocabulaire et sources

« Dénouement », « Cauchemar » comme famille de conclusion et « Le Registre des
absences » sont des termes de conception de ce projet. Les termes techniques
du guide sont conservés : startup/active/recovery décrivent les phases d'une
action ; hitbox/hurtbox ses volumes ; cancel une annulation autorisée ; rollback
un mécanisme réseau qui n'est pas livré dans ce prototype.

Les références de jeux de combat du guide original justifient des inspirations
de structure. Les faits Silent Hill se rattachent aux fiches du corpus et de
production. Cette intégration ne réaudite pas les dates de publication des
66 notices ni leurs affirmations historiques ; leur date de recherche reste
visible dans les fichiers sources.
