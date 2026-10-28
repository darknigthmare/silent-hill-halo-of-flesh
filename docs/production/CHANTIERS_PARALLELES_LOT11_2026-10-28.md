# Chantiers parallèles — onzième lot du 28 octobre 2026

Ce lot prolonge `7b9980d102dc2db385445bc20e4172c1113dda2b` sur `main`.
Six agents traitent trente identifiants réels du classeur chacun :
**180 lignes, dont 106 réalisations candidates, 60 spécifications et 14 blocages**.
Les tests et recherches supplémentaires ne comptent pas comme productions.

| Chantier | Réalisations candidates | Spécifications | Blocages du lot |
| --- | ---: | ---: | ---: |
| [Images](batches/lot11-art.json) | 25 | 0 | 5 |
| [Commandes](batches/lot11-combat.json) | 30 | 0 | 0 |
| [Présentations](batches/lot11-cinematics.json) | 30 | 0 | 0 |
| [Lieux](batches/lot11-stages.json) | 21 | 0 | 9 |
| [Observations](batches/lot11-references.json) | 0 | 30 | 0 |
| [Poses](batches/lot11-poses.json) | 0 | 30 | 0 |
| **Total** | **106** | **60** | **14** |

La [synthèse vérifiée](batches/lot11-summary.json) lie les lignes, propriétaires,
références et fichiers livrés. Les **166 lignes non bloquées ont changé**.
Une réalisation candidate ne clôt pas toute son action parente et ne vaut pas
certification 1:1. Les **875 actions, dont 840 ouvertes et 93 P0**, restent suivies.

## Corps entiers et cadrage de combat 2D

Les **25 nouveaux PNG** représentent chacun un sujet entier dans une pose fixe,
orientée pour le combat 2D et contrainte par son anatomie. Ce sont des idles
candidats : aucun nouveau cycle de marche, attaque ou chute n’est produit.
Le registre atteint **74 profils illustrés et 109 images actives** ; 156 profils
restent sans PNG. Le montage animé candidat antérieur et les six décors bitmap
restent séparés de ces images. Aucune fidélité 1:1 n’est certifiée.

Le cadrage utilise le corps lisible et ses contours faiblement opaques reliés
par voisinage, et considère toutes les frames du profil. Les faibles traces
isolées restent auditées mais ne font pas reculer la caméra : une première
capture de Caliban/Siam avait révélé une arène trop petite malgré des tests
numériques verts. La marge de dix pixels intègre la secousse maximale de neuf pixels
horizontaux et de quatre pixels et demi verticaux. Cette correction de caméra
évite de couper membres, ailes, queue ou arme ; elle ne change pas les collisions.
Le rendu complet ne prouve pas une anatomie originale masquée ou une échelle native.

Remnant reste bloqué faute de vue entière lisible de sa cage et de son ombre.
Curtis reste bloqué pour sa configuration armée : son rendu entier sans outil
ne fournit pas le modèle ou la prise de la scie circulaire. Scarlet Doll reste
bloquée : le portrait de porcelaine et le rendu de la seconde forme dépouillée
ne permettent pas de reconstruire une première forme entière fidèle.

Un appel groupé de génération a été interrompu par **une réponse de refus**
concernant le groupe Flesh Lip/Cybil. L’attribution individuelle est indéterminée :
ce ne sont pas deux refus individuels établis. Les deux images restent bloquées,
sans nouvelle tentative ni substitution. Les refus antérieurs sont respectés.

La [provenance artistique](../../art/reference-provenance-batch11.json) conserve
les vues, empreintes et limites. Les mauvaises attributions provisoires ont été
corrigées avant génération : les captures Homecoming 090 et 114 montrent Nurse
et Wheeler ; 126–132 montrent Amnion, 133–136 Asphyxia et 137–138 Sepulcher.
Elles ne servent pas à inventer une arme de Curtis ou le corps de Scarlet.

## Commandes et présentations

Trente commandes concernent les trois tailles de Numb Body, Hummer, Wall Man
et One Truth. Les Numb Body avancent par heurt frontal et bond, sans bras,
prise ou impacts invisibles multiples. Hummer conserve une petite morsure locale,
sans utiliser toute l’envergure comme hitbox. Wall Man et One Truth restent liés
à leur support ; bras, griffes et tête ont des contacts localisés.

Arcs, portées, zones de contact et dégâts restent des réglages du versus.
Leur exécution ne mesure pas les timings ou la géométrie des jeux originaux.
La revue indépendante passe **96 scénarios**, dont les trente commandes aux deux
indices avec orientations opposées, puis les cas arrière, hors portée et en hauteur.

Les trente présentations couvrent Remnant, Curtis, Weeping Bat, Brawler et Agile,
sur six contextes chacun. La cage de Remnant ne devient pas un corps humain,
Weeping Bat ne gagne pas un plafond fictif, et les rendus familiaux de Prisoner
Minion ne certifient pas une variante exacte ou un art martial. Le catalogue
atteint **776 présentations sans état d’acteur**, plus sept contextes Cybil
conditionnels, avec **205 timelines stockées**. Les images contextuelles restent
à produire lorsque seule une proposition de mise en scène existe.

Trois descriptions et équipements sont corrigés : seringue de la Nurse Origins,
scie circulaire de Curtis dans Underground, cage filaire et ombre de Remnant.
L’injection exige la seringue propre au sujet ; le rig mécanique d’Amnion reste
le sien et ne peut pas être remplacé par du mobilier hospitalier générique.

## Pièces et propositions révisées

Les **21 lignes de lieux** s’attachent à huit cadres précis, avec leurs limites :
Female Treatment à Cedar Grove, passage de Green Lion Antiques, nef Holy Way,
antichambre Founding Families, deux salles du Dark Shrine, couloir éclairé de
P.T. et comptoir de la première rencontre Curtis. L’image isolée du Flauros
ne prouve pas son emplacement dans la salle ; les vues P.T. ne fixent pas une
boucle exacte. Les tuyaux supérieurs de l’orgue ne sont pas reconstruits.

Les neuf blocages restants concernent le toit d’appartement, une lampe de Cedar
Grove, Nightmare Theater et l’escalier de la Villa. Les raisons figurent dans
leurs lignes et actions. Les anciennes cibles fausses sont archivées avant
révision, sans ajouter chaîne de Sakuko, vapeur, néon ou outil motorisé non attesté.

Le directeur atteint **147 pistes sur 118 clés**, dont 141 visibles et six masquées
par les bitmaps. Il conserve 64 boucles génériques, 28 associations d’événement,
28 interactions, huit liens de dangers et quatorze profils de terrain.

## Références, classeur et vérification

Les trente observations et trente briefs de poses sont documentaires. Les cinq
poses par profil du second chantier précisent corps, appuis, équipement et limites ;
elles ne produisent aucun PNG. Les **246 sources** conservent exactement les
217 objets antérieurs et ajoutent 29 références. Les 435 observations gardent
identifiants, noms, propriétaires, œuvres, éditions, ordre, statuts et timecodes.
Les 33 décisions de rôle restent identiques : huit adaptations filmiques jouables
et 25 dossiers sans duel autonome. **Aucune mesure originale n’est inventée.**

L’export modifie **1 670 cellules**, ajuste **528 hauteurs** et ajoute 29 sources
sur **203 cellules**. Les 80 formules sont recalculées, avec une extension auditée.
La préservation compare **250 130 cellules**, différences autorisées comprises ;
la revue indépendante compare **249 198 champs mappés** et passe **74 contrôles**.
Elle vérifie les treize blocages historiques, les 21 révisions de cibles dans les
lignes et actions et onze rejets avant sélection : huit documentaires, deux
bloqués et une cible Curtis révisée. Les **18 400 cellules de timings restent vides**.

Les tests globaux passent **1 098 tests Node et 101 tests Python**. Les rapports
SOURCE complémentaires passent 344 contrôles combat avec 63 captures, 828
contrôles cinématiques avec 154 captures et 122 contrôles lieux avec 37 captures.
La validation finale DIST couvre **14 suites et 2 860 contrôles**, avec
**503 captures et aucune erreur JavaScript**. Ces preuves vérifient le prototype local,
pas une campagne originale, des périphériques physiques ou une animation 1:1.

Un contrôle DIST complémentaire vérifie les huit pièces révisées et leurs
21 éléments : **122 contrôles et 37 captures**, avec inspection visuelle sans
blocage. Il est compté séparément des quatorze suites principales. Le contrôle
HTTP artistique décode 99 fichiers, dont les 25 nouveaux ; l’audit local couvre
les 109 frames actives. Les 25 nouveaux inspecteurs sont identiques entre
sources et build. Aucune de ces comparaisons ne mesure les animations originales.

Le [rapport QA](../INTEGRATION_QA_2026-10-28-lot11.json) rassemble les validations.
Plan SHA256 : `41483987edecad042f7a7c7bc238fb12a3668af248e3bfa424ca6ed4c47d44b0`.
[Classeur](SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx) SHA256 :
`c0d6053d6ea65899a522a5a9eb104a7b5f8848033b78ea5e906ee2a7f8dacbed`.
