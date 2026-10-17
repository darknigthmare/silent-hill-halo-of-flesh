# Références de combat et d’animation — suivi d’intégration

Ce dossier suit la réalisation des movesets, supers, finishers, introductions, sorties, poses de manche et animations de lieux de **SILENT HILL: HALO OF FLESH**. Le catalogue initial conserve son point de comparaison dans la PR #4 au commit `d11cf4e8c03668aa535631cb2ef60767ee51e75b`. L’intégration v0.9.6 prolonge le commit `843449e78c02ce53564a033439dab1fd8c8fb204`.

Le classeur [SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx](SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx) rassemble le suivi de production. Les recherches JSON alimentent désormais `src/production-reference.js` et les règles du moteur par un générateur vérifié. Le fichier Excel n’est pas chargé par le jeu et ses annotations ne sont pas appliquées automatiquement. Le [rapport d’intégration](../EXCEL_RUNTIME_INTEGRATION_2026-10-17.md) décrit les réalisations et leurs limites ; le [relevé initial](QA_2026-10-17.md) conserve l’historique de la première phase.

## Contenu

| Onglet | Usage |
| --- | --- |
| Synthèse | Périmètre, répartition par œuvre, état réel des images et actions ouvertes. |
| Combattants | Identité, édition, variantes, rôle, contraintes et liens vers les gestes documentés. |
| Mouvements | Les 20 slots actuels de chaque profil, dont les deux supers, avec commandes, paramètres du moteur et révision attendue. |
| Finishers | Les deux entrées actuelles de chaque profil et les finishers d’arènes. La proposition cible et son statut restent distincts du contenu actuel. |
| Présentations | Introduction, attitude, victoire et défaite de première manche, victoire et défaite finales, sortie. |
| Clips | Les dix états de base, de la locomotion à la réaction et à la défaite. Les clips d’attaque sont suivis dans Mouvements. |
| Arènes | Identité du lieu, œuvre, architecture, éléments actuels et écarts de référence. |
| Animations arènes | Boucles, événements, interactions, dangers, transformations et pistes proposées pour chaque lieu. |
| Actions | Travail à réaliser, priorité motivée, critère de livraison, état et responsable modifiables. |
| Gestes référencés | Observations concises reliées à des sources et à l’édition exacte. |
| Sources | URL, titre, type, date de consultation, portée et limites de chaque référence. |

## Ce que signifie la fidélité

**Une identité documentée ne valide pas automatiquement un mouvement.** Un bestiaire peut attester une morsure, un rampement ou une arme sans établir la préparation, les frames actives, la portée ni les transitions d’un jeu de versus. Les 4 600 emplacements sont désormais classés comme composites de gestes ou adaptations de versus ; aucun n’est présenté comme une animation 1:1 directement attestée. Les paramètres d’une commande désactivée restent visibles comme données du catalogue, sans être exécutés.

Les gestes décrits par les sources, les contraintes de l’œuvre et les propositions de chorégraphie sont séparés. Les supers, poses de victoire, finishers et adaptations de commande portent leur statut de production. Lorsqu’une référence manque ou qu’un profil représente un élément non combattant, ses commandes incompatibles sont bloquées ; le dossier reste consultable.

Les œuvres originales, remakes, films et reprises dans *The Arcade* ou *Book of Memories* ne sont pas interchangeables. Une variante conserve son ID et peut pointer vers une base documentée ; elle ne reçoit pas les attaques d’une autre version par simple ressemblance de nom.

### Relevés restant à faire

Les champs de FPS et de début, impact et fin de mouvement restent vides tant qu’une capture de la version concernée n’a pas été mesurée. Les chiffres présents dans les colonnes de préparation, activité, récupération, dégâts, jauge et portée sont ceux du moteur actuel. Ils constituent des valeurs de gameplay du projet, jamais des valeurs officielles des jeux Silent Hill.

Les pistes de référence devront être confrontées à des captures complètes, avec l’édition, la forme, l’arme et la phase de boss identifiées. Il faudra ensuite vérifier anatomie, appuis, silhouette, accessoires, direction, contacts, récupération et transitions. Aucun clip n’est validé image par image par la seule création de ce classeur.

## Première manche et fin du match

Les poses `winRound1` et `loseRound1` représentent une transition réversible : le même personnage et ses accessoires doivent pouvoir reprendre la manche suivante. Une mort scénaristique, une disparition définitive ou un finisher ne doit pas remplacer cette transition.

La victoire finale, la défaite finale et la sortie sont suivies séparément. Un finisher prévoit plusieurs pistes synchronisées : attaquant, cible, accessoires, décor éventuel, caméra, effets et son. Sa définition du dépôt est inventoriée même quand la chorégraphie dédiée n’existe pas encore.

## Suivi de l’intégration après la phase 1

La v0.9.6 applique les 230 fiches de rôle et de capacité : **3 711 commandes
actives et 889 désactivées avec une raison**, sur les 4 600 emplacements conservés.
Les dossiers et l’atelier exposent l’édition exacte et les références.

Les neuf clés `intro`, `winRound`, `loseRound`, `winMatch`, `loseMatch`, `outro`,
`finisher`, `finished` et `taunt` utilisent des contextes précis. Les 93 montages
de fatalité écrits, les 301 présentations composées et les 50 éléments partiels
d’arène sont identifiés dans leurs lignes. Les images propres à ces gestes
restent à produire. Les 1 799 lignes d’animation d’arène gardent leurs IDs ;
1 161 éléments retirés du moteur restent listés pour tracer leur désactivation.
Sept nouveaux raccords sont détaillés dans les fiches d’arènes concernées.

L’action globale des poses de manche est validée ; les travaux techniques en
cours ne valident pas automatiquement les images. **874 actions restent ouvertes
sur 875, dont 127 P0 ; aucun clip animé ni fidélité 1:1 n’est certifié.**

Pour une mise à jour ciblée, `scripts/update-production-workbook.mjs` prend le
nouveau JSON du plan, le classeur existant, le précédent rapport
`workbook-verification.json`, le dossier de sortie et le précédent JSON du plan.
L’empreinte du précédent plan et les champs annotables sont contrôlés avant
d’écrire. Les IDs, l’ordre et les champs de travail non concernés sont conservés.
Le vérificateur accepte `--compare-source CLASSEUR_SOURCE --change-log JOURNAL_JSON`
et `--layout-change-log JOURNAL_HAUTEURS`. Les journaux peuvent être des `.json.gz`.
Il compare toutes les cellules et propriétés natives ; seules les augmentations
de hauteur enregistrées, nécessaires au nouveau texte, sont admises.
Une reconstruction complète reste un autre parcours, avec la précaution décrite
ci-dessous pour les annotations manuelles.

## Format artistique

Le format demandé reste **une image PNG transparente indépendante par image de sprite**, corps entier et accessoires visibles, avec une qualité détaillée cohérente avec les références du projet. Le cahier n’autorise ni des silhouettes CSS/Canvas de remplacement, ni l’attribution d’un PNG de film à sa version jeu, ni la duplication d’une seule image pour annoncer une animation.

L’état actuel des images est repris du registre `src/sprite-manifest.js`. Une image candidate ne devient pas validée en fidélité 1:1 par son ajout dans l’Excel.

## Mise à jour et contrôles

1. Modifier les recherches sourcées dans `research/classic.json` ou `research/extended.json`, en conservant les IDs.
2. Exécuter `node scripts/build-production-reference.mjs`, puis `node scripts/build-production-plan.mjs` depuis la racine du dépôt. Les scripts refusent les omissions, les doublons, les références inconnues et les propositions canoniques sans preuve. `npm test` reconstruit et vérifie aussi le registre distribué.
3. Vérifier le catalogue avec `node --test tests/production-plan.test.mjs tests/reference-authoring.test.mjs`.
4. Dans un environnement disposant de `@oai/artifact-tool`, exécuter `node scripts/build-production-workbook.mjs docs/production/production-plan.json /tmp/halo-workbook`. Le script recalcule les formules, exerce le changement de statut puis le restaure, vérifie les compteurs et rend chaque onglet avant l’export.
5. Exécuter `python3 scripts/verify-production-workbook.py docs/production/production-plan.json /tmp/halo-workbook/SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx /tmp/halo-workbook/workbook-export-verification.json`. Ce contrôle lit le fichier exporté sans le modifier et refuse toute cellule d’erreur, référence perdue ou divergence des données.

Le JSON complet `production-plan.json` est un intermédiaire regénérable, exclu de Git. Les recherches, la synthèse et son empreinte, les scripts, le classeur et les rapports de validation restent versionnés. Les URL de l’onglet Sources sont conservées intégralement en texte.

Les états, responsables et relevés vidéo du classeur sont des champs de travail modifiables. Ils ne sont pas importés automatiquement dans le jeu ou dans les JSON. **Une reconstruction remplace le classeur généré** : reporter d’abord les décisions conservées dans les sources du catalogue, ou garder la copie de travail annotée avant de reconstruire. Il n’y a pas de synchronisation bidirectionnelle implicite.

Les contrôles vérifient la couverture du suivi, sa traçabilité et les raccords
effectivement exécutés. Ils ne prouvent pas que toutes les animations sont
réalisées, que le canon est exhaustif sur tous les médias, ni que les campagnes
ont été jouées intégralement.
