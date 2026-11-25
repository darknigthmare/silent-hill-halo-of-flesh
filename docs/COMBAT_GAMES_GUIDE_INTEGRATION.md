# Guide de combat intégré — Silent Hill: Halo of Flesh

**Révision du 25 novembre 2026.** Référence commune :
[Combat Games, version 1.0](combat-guide/source/Combat_Games_Guide_General_v1.0.txt).
Référence de comparaison : `9c426d7e230eaec464203acb9b43b63a420acf30`. Inventaire courant régénéré pour la vague30.

Ce chapitre applique les **30 rubriques** du guide au jeu existant. Il complète
le [GDD](GDD_FR.md), la [bible du corpus](BIBLE_CORPUS_SILENT_HILL.md) et les deux
classeurs de production. Les règles de référence, les identifiants et les
restrictions de rôle du moteur restent la base de chaque association.

## 1. Lire et maintenir cette intégration

| Support | Usage |
| --- | --- |
| [Matrice des 30 rubriques](combat-guide/MATRICE.md) | Adaptation Silent Hill, état constaté, fichiers concernés, prochaine action et critères de validation. |
| [Exigences structurées](combat-guide/requirements.json) | Source des 30 rubriques et de dix décisions sur les modules ; alimente les feuilles « Guide combat ». |
| [Associations structurées](combat-guide/associations.json) | 445 entrées reliées : profils, lieux, Chroniques, œuvres et projectiles ; actions et Dénouements accessibles sous leur propriétaire exact. |
| [Campagne, récits et Dénouements](combat-guide/CAMPAGNE_ET_DENOUEMENTS.md) | Conception narrative distincte, exemples de récits, scènes fixes, compatibilité des conclusions et écarts de lieux. |
| [Fiches et validation](combat-guide/FICHES_ET_VALIDATION.md) | Dix modèles A–J raccordés aux schémas existants ; définitions de terminé. |
| [État des lieux calculé](combat-guide/ETAT_DES_LIEUX.md) | Dénominateurs, couverture observée, limites et prochaines corrections ; données dans [status.json](combat-guide/status.json). |
| [Vérification de l’intégration](combat-guide/qa/README.md) | Contrôles des associations, concordance des classeurs, conservation des feuilles et portée exacte des vérifications. |
| [Classeur de production](production/SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx) | Feuilles historiques conservées, plus Guide combat et Associations guide. |
| [Classeur Corpus / Stages](production/SILENT_HILL_CORPUS_BIBLE.xlsx) | Même correspondance du guide auprès du corpus éditorial et des lieux. |

Les feuilles **Guide combat** et **Associations guide** des deux classeurs sont rafraîchies pour la vague 30 et concordent avec les JSON courants : 30 rubriques, dix décisions de module et 445 associations. Les 13 feuilles historiques cumulées, 252 822 cellules et 87 formules restent intactes. La [validation des classeurs](production/vague30/workbooks/validation.json) détaille les empreintes, la conservation, les caches recalculés et les rendus ; le grand classeur a été relu au moyen d’une projection temporaire dont les parties retenues sont identiques au fichier final.

### Production fixe — vague30

Quatorze PNG candidats sont ajoutés : trois poses de profils existants, trois effets, six plans pour trois arènes et deux images du récit individuel d’Air Screamer. La couverture calculée de cette passe est de **93 arènes sur 123** et **31 commandes projectile sur 86**, vérifiée par [l’inventaire calculé](production/vague30/inventory.json). Aucun nouveau cycle animé.

Les références de Shimizu sont corrigées vers Residence II pour la salle à manger, en conservant le corridor de Residence I séparé. Le corridor de prison The Arcade est fixé dans son état Otherworld ; son plafond peint ne crée pas de plafond de combat. Les [sources, contrôles, limites et états de publication](production/vague30/README.md) accompagnent les nouveaux fichiers.

La régénération se fait avec `npm run bible:guide`, puis le contrôle avec
`npm run bible:check`. Le générateur vérifie les IDs, les propriétaires, les
chemins et l'empreinte de la pièce jointe. Les chemins de PNG peuvent être
contrôlés dans l'index Git sans télécharger le corpus artistique complet ;
cette vérification ne contrôle ni l'image ni son comportement à l'écran.

## 2. Décisions propres au projet

Le jeu reste un **combat latéral 2D de manifestations**, avec moteur
JavaScript/Canvas, commandes compactes et fortes différences de morphologie.
Le guide complète ce cadre ; son exemple d'avatar RPG ou de véhicules n'élargit
pas automatiquement le périmètre.

Les piliers retenus sont : identité vérifiable par œuvre et édition, combat
lisible, morphologies respectées, récits qui préservent l'ambiguïté de la série,
et état de production traçable. La fidélité **1:1** porte sur identité,
apparence, gestes, armes, lieux et personnalité. Les durées, dégâts, largeur de
duel et cadres de caméra restent des adaptations à documenter.

| Décision | Application |
| --- | --- |
| Phase de production | Bases fixes : sprites entiers, costumes attestés, décors, projectiles, props et illustrations. Les nouvelles animations sont différées ; leurs besoins sont conçus. |
| Roster | Conserver les rôles exacts. Une entrée du bestiaire, une apparition et un boss ne sont pas automatiquement des combattants de duel. |
| Périmètre de franchise | Conserver les 66 notices de corpus et les 16 groupes runtime, avec leurs distinctions d'édition. Transmission est un programme de présentation. |
| Histoires | Conserver les Récits et les Chroniques ; ajouter une conception de campagne globale autonome. |
| Conclusions | Employer « Dénouements » dans la bible : Signature, Cauchemar, du lieu. Ces noms sont créés pour le projet. |
| Stages | Lieu reconnaissable et version précise ; présentation, interactions, dangers et connexions ont des contrats séparés. |
| Extensions | Tag et coopération différés ; avatar/hub RPG et véhicules génériques hors périmètre actuel ; réseau à décider avant développement. |

## 3. Fidélité, continuités et admission

Chaque nouveau contenu doit porter un statut parmi **canon attesté**,
**adaptation jouable**, **original compatible**, **alternatif/crossover** et
**à confirmer**. Ces statuts complètent les catégories de mouvements existantes
`direct-canonical`, `behavior-composite` et `versus-adaptation` ; ils ne
remplacent pas les observations ou le niveau de preuve déjà enregistrés.

Une référence secondaire identifie un sujet et ses gestes ; elle ne fournit
pas automatiquement une capture exacte, une palette mesurée ou une cadence
canonique. La fiche précise édition, région lorsqu'elle compte, séquence,
source consultée et limites. Une information inconnue reste inconnue.

Le **groupe source** est un mécanisme du catalogue. Il ne garantit pas la
continuité fine : `film` agrège plusieurs films. Les récits actuels filtrent
leurs adversaires par ce groupe. Une route propre à un film nécessite donc
encore un contrôle des personnages, costumes, rivaux et lieux de ce film.
Les œuvres originales, remakes, réimaginations et adaptations conservent leurs
capacités respectives, même lorsqu'un nom est partagé.

Le champ historique `variantOf` peut être un **libellé**, tel que « Mannequin ».
Seul un `reference.baseId` existant constitue ici une association précise à
un profil parent. Le nouvel inventaire conserve le libellé et l'ID séparément ;
il ne choisit pas un parent homonyme d'une autre édition.

La politique `combatReferencePolicy` décide l'admission. Dans l'état inspecté,
187 des 230 profils sont admis et 43 restent hors duel. Le qualificatif
« admis » décrit les règles du prototype ; les assets, la fidélité visuelle et
la recette demeurent des étapes séparées. Un personnage humain absent du
roster ne devient pas jouable pour remplir une fiche de campagne.

## 4. Combat et movesets associés

Les vingt emplacements historiques par profil sont conservés. Le guide
n'exige pas vingt pouvoirs authentifiés : une action incompatible peut rester
désactivée, avec sa raison. Sur les 4 600 emplacements, 3 499 sont activés dans
l'état inspecté et 1 101 sont désactivés. La référence opérationnelle reste
la création du profil runtime, pas une ancienne somme descriptive du GDD.

Pour chaque action, la fiche C relie propriétaire, clé, commande, source,
conditions, timings, portée, déplacements, collisions, ressources et résultats
en touche/garde/contre/échec. Les paramètres déjà présents sont réutilisés.
Le hitstun, le blockstun et l'avantage temporel doivent être dérivés de la
résolution effective avant d'être présentés comme mesurés. Un nom inventé
pour une adaptation reçoit ce statut.

La jauge Nightmare est un mécanisme commun de ce jeu. Son existence ne prouve
pas que chaque créature possède les mêmes pouvoirs. Le cri de l'Air Screamer
ne justifie pas une onde sonique ; le nom partagé par une créature de Book of
Memories et une créature d'un autre opus ne transfère pas leurs capacités.
Les restrictions exactes de projectile, téléportation, piège, aura, déplacement
et saut sont préservées.

Le guide ajoute une obligation de **réponse adverse** : montrer comment
approcher, défendre, éviter ou punir, en tenant compte du volume et des moyens
du sujet. Les timings et dégâts restent des hypothèses d'équilibrage tant que
les situations ne sont pas jouées et reproduites. La simulation à 60 pas par
seconde conserve son rythme indépendamment des effets de rendu.

## 5. Dénouements, ultimes et récits

| Élément | Sens dans le projet | Association existante |
| --- | --- | --- |
| Ultime Nightmare / Désespoir | Action pendant le combat, avec conditions et ressources | Clés `super` et `desperation` du moveset. |
| Dénouement Signature | Conclusion utilisant l'identité du sujet | `fatalities[].type: signature`. |
| Dénouement Cauchemar | Conclusion de versus intensifiée, sans nouvelle capacité présumée | `fatalities[].type: nightmare`. |
| Dénouement du lieu | Conclusion dépendant d'un lieu et de ses cibles compatibles | `stage.fatality`. |
| Victoire | Présentation après le combat | `presentation.victory` et proposition `winMatch`. |
| Outro | Conséquence du récit individuel, de la Chronique ou de la campagne | Texte/scène du parcours concerné. |

Les IDs et les clés techniques existantes restent compatibles. Le vocabulaire
de la bible n'est pas présenté comme un renommage déjà livré dans toute l'UI.
Chaque Dénouement doit préciser conditions, intention, cible, distance,
chorégraphie, reprise et solution de remplacement. Une masse fixe, un essaim
ou une entité immatérielle ne reçoit pas une saisie humanoïde automatique.
Une présence hors duel conserve une sortie narrative appropriée.

Les **Récits de manifestation** existent sous forme de structures calculées.
186 profils possèdent à la fois l'admission et une file d'adversaires. Lisa
`pt_lisa_149` est admise comme rencontre scénarisée, mais son récit individuel
n'a pas d'adversaire P.T. distinct. La Chronique `loop_204863`, elle, conserve
sa rencontre Lisa : les deux structures ont des usages différents.

Les **15 Chroniques** comportent 57 rencontres et 11 dossiers hors combat ;
13 possèdent un parcours de rencontres. `harry_ice` et `maya_villa` restent
consultables sans duel. Les nouveaux textes ne doivent pas convertir les
dossiers en victoires simulées ni leurs files internes en combats livrés.

La nouvelle campagne **Le Registre des absences** est conçue dans le chapitre
[Campagne et Dénouements](combat-guide/CAMPAGNE_ET_DENOUEMENTS.md) : trois actes,
huit chapitres, prologue et épilogue. Son cadre d'archives est une création du
fan-game ; il ne réécrit pas l'origine officielle des manifestations. Le
document définit aussi deux récits combattants détaillés et un dossier
consultable, ainsi que leurs briefs fixes. Leur implémentation est à faire.

## 6. Arènes : quatre axes indépendants

| Axe | État constaté | Exigence retenue |
| --- | --- | --- |
| Présentation | `stageAnimations`, `reducedMotion`, pistes visuelles et parallaxe | Versions vivante/statique/réduite qui conservent sol, limites et annonces utiles. |
| Interactions | 26 interactions déclarées sur 22 stages, selon conditions du directeur | Fiche d'objet, déclencheur, effet, vulnérabilité, usage, remise à zéro ; commande d'utilisation seulement si conçue. |
| Dangers | Huit stages avec liste de dangers autorisés non vide | Annonce lisible, contre-jeu, règles partagées et compatibilité avec la présentation fixe. |
| Connexions | Aucune liaison générale vers un autre stage en plein duel constatée | Origine/destination réelles, conditions, défense, positions d'arrivée, chrono, combo, KO et retour. |

Les quatre bascules Otherworld autorisées observées modifient l'état du même
stage. Elles ne sont pas comptées comme des liaisons entre arènes. Désactiver
les animations du décor ne désactive pas implicitement les dangers ou les
événements de gameplay ; les règles de match doivent l'indiquer.

### Profils de présentation et règles à compléter

- **Spectacle** : activité de fond et effets retenus par la fiche exacte ;
  dangers et transitions sont annoncés avant le combat.
- **Duel stable** : géométrie et règles fixes, collisions lisibles, pas de
  danger aléatoire introduit par un choix purement visuel.
- **Confort** : réduction des secousses, flashs et mouvement ; un signal
  nécessaire est remplacé par une forme lisible s'il ne peut plus être animé.

Ces profils sont des exigences de conception au-dessus des réglages existants,
pas trois nouveaux modes déjà livrés.

### Exemple de liaison à étudier

**`SHC_LINK_VILLA_STAIRS_ROOF` : `villa_stairwell` vers `villa_rooftop`.**
Les deux IDs existent, sont associés à The Short Message et désignent des zones
différentes. Leur raccord exact, la porte, la profondeur et le trajet doivent
être établis par les références avant toute validation 1:1. Le prototype ne
doit pas inventer un mur brisable sur la seule proximité des noms.

La cible de conception est un **passage narratif** à travers l'accès vérifié,
sans dégâts de transition ni projection inventée contre une présence de
poursuite. L'arrivée définit orientation, position et état d'observation. La
version de duel avec rupture de mur n'est pas autorisée par cette seule fiche.
Le statut reste « à documenter et à implémenter ».

Pour une future liaison de duel à projection, la fiche H impose : seuil et
conditions visibles, moyen de prévention, chargement de destination, gel ou
continuité du chrono explicités, fin de combo ou prolongation limitée, gestion
du double déclenchement et priorité du KO. Le nombre de liaisons cibles reste
à définir après le premier prototype vérifié.

### Décors et références visuelles

Une arène reçoit la pièce, la façade ou la rue exacte, ses repères obligatoires,
son état du monde et son édition. Le passage en vue latérale peut nécessiter
une recomposition ; la fiche conserve cet écart. Les lieux partagent parfois
un nom sans partager une géométrie. La carte `labyrinth` représente notamment
la commande Box of Faces, et `brookhaven_sh2` le couloir B1 : leur présence ne
valide pas les salles de boss d'Abstract Daddy ou Flesh Lip.

## 7. Modes, boss, apprentissage et progression

| Mode / fonction | Association observée | Travail prévu par le guide |
| --- | --- | --- |
| Confrontation | Duel CPU ou local | Recette des rôles, règles, périphériques et revanche. |
| Descente | Sept confrontations | Mieux présenter progression et reprises ; distinct de la campagne globale. |
| Rites du Jugement | Modificateurs et endurance | Expliquer ressources, soins, difficultés et récompenses. |
| Grands Tourments | Boss Rush existant | Fiche par boss, annonces, fenêtres et contre-jeu ; distinguer boss catalogue et boss admis. |
| Salle d'Observation | Reset, volumes, jauge, auto-soin et diagnostics | Tutoriels interactifs, programmation et enregistrement du mannequin à compléter. |
| Chroniques | Parcours thématiques et dossiers | Réécriture, versions exactes, scènes et reprise. |
| Récits | Structures individuelles générées | Motivation, épreuves, rivalité, revers et outro écrits par profil. |
| Rite des Huit | Tableau de huit, trois duels du joueur | Présentation du rival ; préciser que les autres branches sont simulées. |
| Archives | Consultation des catalogues | Montrer source, disponibilité, restrictions et état artistique. |
| Campagne globale | Conception nouvelle | Un chapitre représentatif, sauvegarde, puis récit complet à implémenter. |

Le catalogue possède 75 profils marqués boss, dont 63 admis au combat.
« Boss Combat » peut s'appuyer sur une confrontation choisie ; cette bible ne
déclare pas un écran autonome de sélection de rencontres qui n'existe pas.
Les versions fixes, géantes ou à phases reçoivent des règles propres et une
solution lisible pour les familles de combattants retenues.

La sauvegarde actuelle conserve des paramètres, runs, rangs et progrès de
Chroniques. Elle ne constitue pas un replay de combat. Les nouveaux chapitres
doivent définir format, migration, reprise après fermeture et scènes déjà
vues. Les futurs déblocages narratifs ne donnent pas d'avantage caché en duel.

Le multijoueur local est présent. La validation physique des manettes reste
une recette distincte. Aucun réseau de combat, matchmaking, rollback ou
lecteur de replay n'est établi par cet ajout documentaire. Si le réseau est
retenu, l'état du combat, l'aléatoire, les objets, les transitions et les
versions doivent être conçus pour une reproduction déterministe dès le départ.

## 8. Production et six états séparés

| Axe | Exemple d'état | Preuve requise pour avancer |
| --- | --- | --- |
| Lore | Source identifiée / vérifiée / incertaine | Œuvre, édition, vue ou séquence et observation précise. |
| Conception | À définir / documentée / validée | Fiche et règles cohérentes avec les dépendances. |
| Assets | Manquants / produits / revus | Fichier réel, sujet/repères/asymétrie/alpha/échelle contrôlés. |
| Intégration | Absente / partielle / raccordée | Registre, propriétaire, mode et référence de fichier corrects. |
| Validation | Non testée / échec / validée | Test ou revue datés, version et limites. |
| Publication | Locale / commit / PR / fusion / livraison | Référence distante exacte et disponibilité réellement vérifiée. |

Les deux classeurs conservent les anciennes feuilles et leurs notes. Les
nouvelles feuilles ajoutent la correspondance, pas un statut de réussite
globale. Une image de sélection ne remplit pas la case sprite de combat ;
un montage de Dénouement écrit ne remplit pas la case animation finale.

Les comptages sont publiés par unité. Le total de 445 correspond uniquement
aux **entrées d'association**. Les 4 600 emplacements d'actions sont reliés sous
leurs 230 propriétaires ; les 48 images de Chroniques et les deux images individuelles d’Air Screamer sont des chemins
référencés ; aucune addition de ces unités ne représente une complétude du jeu.

## 9. Ordre de travail résultant

1. Corriger les raccords d'édition, de rôle et de lieu qui empêchent une
   interprétation fidèle des données existantes.
2. Compléter les sprites de base, décors et projectiles manquants avec leur
   source exacte, puis vérifier les candidats à l'échelle réelle du jeu.
3. Produire les illustrations fixes d'un récit représentatif et d'un chapitre
   de campagne ; vérifier qu'elles racontent intro, conflit et conséquence.
4. Intégrer ce parcours avec reprise, galerie et critères d'échec explicites.
5. Prototyper une liaison de zones et les quatre axes d'arène séparés avant
   de généraliser leur production.
6. Étendre les contenus selon leurs dépendances. Les nouvelles animations
   attendent leur phase ; les besoins restent documentés dès maintenant.

## 10. Instruction opérationnelle Silent Hill

Utiliser le guide commun avec cette intégration, le GDD et les politiques de
référence du dépôt. Examiner les données, registres et modes réels avant de
compter un manque. Conserver les identifiants, les éditions, les restrictions
des manifestations et la phase de sprites fixes. Écrire les campagnes, rivalités, Dénouements et illustrations avec leur statut d'adaptation ou de
création originale. Les créatures silencieuses ne reçoivent pas de psychologie
ou de dialogues ajoutés par défaut.

Associer chaque production à ses profils, commandes, lieux et scènes. Pour
un nouveau besoin, employer les fiches A–J ; pour un élément existant, compléter
sa fiche au lieu de lui attribuer une identité concurrente. Présenter séparément
sources, conception, fichiers, intégration, validation et publication. Vérifier
les cas modifiés, préserver les preuves antérieures et publier un bilan calculé
sur un périmètre daté. La fidélité 1:1 doit être démontrée par les références et
la revue, jamais déclarée depuis le seul nombre de fichiers.
