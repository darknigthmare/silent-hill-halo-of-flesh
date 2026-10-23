# Chantiers parallèles du 23 octobre 2026

Relevé historique de la troisième passe. Voir le
[quatrième lot](CHANTIERS_PARALLELES_LOT4_2026-10-23.md) pour la livraison actuelle.

Cette passe prolonge le commit `25fd0c9` sur la même branche de livraison.
Elle fait avancer les propositions du classeur et la comparaison aux œuvres
sans assimiler une adaptation jouable à une animation originale reproduite.

| Chantier | Réalisation de la passe | Travail restant |
| --- | --- | --- |
| Images des sujets | Lying Figure, Bubble Head Nurse et Creeper SH2 original : trois PNG fixes, identités séparées et calibrations propres. | Autres poses, attaques et comparaisons temporelles ; 224 profils sans PNG. |
| Lieux | Premier PNG de la cour normale Midwich, proportions conservées ; trois pistes de Toluca, Labyrinth et Room 302, deux réactions locales et Labyrinth intérieur corrigé. | Architecture exacte, couches et animation du décor ; les autres lieux restent procéduraux. |
| Combat | Crawling sans acide, défense frontale du Needler, ouverture pulmonaire du Smog, essaims Mary/Maria entravants, balles du revolver d'Eddie. | Animations dédiées et mesures propres aux œuvres ; chiffres du versus non officiels. |
| Présentations et finishers | Neuf profils : 18 finishers et 63 présentations supplémentaires, contraintes d'arme/corps/lieu, manche intermédiaire réversible. | Poses PNG, accessoires visuels et comparaison des gestes ; montages explicitement inventés pour le projet. |
| Identités et rôles | Onze décisions sourcées ; seuls leurs travaux de rôle sont validés. | Les rôles encore incertains, dont Prisoner, Greedy Worm et Joseph, restent ouverts. |
| Relevés et classeur | Outil de validation de captures et progression par sujet, rôle, scène et couche bitmap. | Les 4 600 relevés FPS/début/impact/fin restent vides faute de capture originale mesurée. |

Le plan conserve 875 actions et 4 600 mouvements. Il compte 862 actions ouvertes,
dont 116 P0. Onze décisions de rôle s'ajoutent aux deux validations techniques
précédentes. Aucune action artistique n'est clôturée.

Le classeur est actualisé sur 2 390 cellules, avec 644 hauteurs augmentées pour
le nouveau texte. La 136e source ajoute sept cellules ; la table et son filtre
s'étendent d'une ligne. Les 80 formules sont recalculées, avec une seule plage
de comptage élargie dans `Synthèse!B16`. Les autres formules, valeurs, styles,
annotations et parties ZIP non concernées sont préservés et vérifiés. Le
[journal structurel](workbook-structure-changes.json.gz) trace cet ajout.

## Images et références

Les références originales SH2 comprennent les modèles de production, le DVD
Lost Memories et deux captures PC distinctes. Les doublons d'une même pose ne
comptent pas comme confirmations indépendantes. Le Creeper conserve sa vue de
dessus ; la prise de vue ne permet pas de reconstituer son ventre. La Nurse
reste frontale trois-quarts, avec une orientation de présentation choisie.
Les textures lissées et les faibles halos d'alpha restent des limites.

La cour Midwich utilise le bardage bleu-vert, la porte persiennée, la marche
et les dalles visibles dans les captures SH1 et le plan du jeu. Sa caméra large,
l'étendue de la façade, les clôtures et le pavage sont des extrapolations.
Le rendu `cover` conserve les proportions des pixels. Les cordes du gibet
restent préparées mais inactives dans le bloc intérieur de Toluca, qui
ne reçoit que la réaction de sa porte de cellule. La vue bitmap remplace
les pistes procédurales de cette scène ; le prototype de piano reste inactif
pour éviter de mélanger la salle de musique à la cour.

[Provenance des images, empreintes et limites](../../art/reference-provenance-parallel.json).
Le candidat Mannequin à quatre pieds, puis celui à trois pieds, sont exclus.
Sa dernière correction a été refusée par l'outil d'image dans la catégorie
sexuelle. Aucun nouvel essai ni contournement n'a été effectué après ce refus.

## Combat et mises en scène

Le [bestiaire SH2 original](https://www.silenthillmemories.net/sh2/enemies_en.htm)
distingue le déplacement rampant de Lying Figure de sa projection debout.
Le [guide des boss SH2](https://www.silenthillmemories.net/sh2/bosses_en.htm)
documente les essaims du boss final et le revolver d'Eddie.
Le [bestiaire Homecoming](https://www.silenthillmemories.net/sh5/creatures_en.htm)
documente les lames du Needler et les poumons exposés du Smog.
Fenêtres, durées d'entrave et multiplicateur de dégâts restent des règles de
versus ; aucune valeur du moteur n'est présentée comme mesure de la source.

Les nouveaux montages concernent Grey Child, Mumbler, Romper, Closer, Nurse
Revolver SH3, Patient SH4, Screamer, Juggernaut et Bogeyman. Leurs 18 finishers
portent les timelines à 104 pour les combattants et sept pour les lieux. Les
présentations composées passent de 301 à 364. Le Crawling possède aussi une
clôture rampante distincte de la projection de la forme debout.

## Décisions de rôle et relevés source

Les onze décisions concernent Larval Stalker, Bloodsucker, Valtiel SH3,
Sewer Creature, Glutton, Toadstool, Whitestool, les deux Tremers, Wheelchair et
Valtiel Book of Memories. Leur validation exige l'ID, l'édition, les sources
de la fiche et un moteur compatible sans attaques autonomes. Les productions
graphiques et les mises en scène de ces sujets restent ouvertes.

[Décisions et preuves](research/role-decisions-2026-10-23.json).

`node scripts/source-timing.mjs validate PACKET.json --output VERIFIED.json`
contrôle le fichier local par son SHA, son édition, ses FPS rationnels et les
timestamps CFR lus par `ffprobe` de FFmpeg. Début, impact et fin sont des frames
annotées, pas des événements reconnus automatiquement. Le paquet vérifié reste
candidat et n'écrit aucun FPS dans le classeur. Le contrôle exécuté sur un MP4
noir synthétique valide l'outil, sans constituer un relevé de Silent Hill.

Le [rapport de validation](../INTEGRATION_QA_2026-10-23.json) détaille les suites,
les scènes préparées, les captures et les limites de leur portée.
La passe finale compte 651 tests Node, 98 tests Python et 367 contrôles navigateur
dans treize suites, avec 54 captures et aucune exception JavaScript. Trois
rapports complémentaires, exclus de ce total navigateur, couvrent les pixels
réels (28 contrôles), les lieux (16) et la vidéo synthétique de l'outil de relevés (3).
