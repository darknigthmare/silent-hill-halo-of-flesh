# Chantiers parallèles — quatrième lot du 23 octobre 2026

Cette livraison prolonge `4239f9d` sur `codex/source-fidelity-20261023`.
Six chantiers ont avancé en parallèle, puis ont été réunis et vérifiés.
Les propositions du classeur restent distinctes des gestes attestés dans les œuvres.

| Chantier | Ajouts de ce lot | Limites restantes |
| --- | --- | --- |
| Acteurs | Groaner, Split Head et Floatstinger SH1 ; Numb Body Small SH3 : quatre PNG fixes, identifiants et calibrations séparés. | 220 profils sans image ; autres poses et cycles à produire. |
| Décors | Couloir Wood Side original PC en bitmap ; quatre pistes sur Historical Society, Baldwin Mansion, Church et Hilltop Center. | Caméras, textures et animations originales non certifiées ; 121 lieux sans bitmap. |
| Combat | Parade des petits calibres de Pendulum ; charges renversantes d’Insane Cancer et Slurper ; morsure entravante du Slurper ; proximité des onze fantômes SH4, avec variation de Jasper. | Distances, fenêtres, dégâts et cadence du versus restent des paramètres du projet. |
| Cinématiques | Dix profils, vingt finishers et soixante-dix présentations supplémentaires. | Montages adaptés pour le versus ; clips PNG contextuels à produire. |
| Rôles | Sept décisions supplémentaires, dix-huit au total. | Les autres travaux de chaque sujet restent ouverts. |
| Relevés et Excel | Lots de relevés sur une même capture, relecture liée aux annotations et vérification XML renforcée. | Aucun des 4 600 relevés originaux n’est mesuré. |

Le suivi conserve **875 actions : 855 ouvertes, dont 109 P0**, et vingt validées
(dix-huit rôles et deux actions techniques). Les 435 observations gardent leurs
identifiants et leur ordre. Trois sources ajoutées en fin portent leur nombre à 139.
Les 4 600 emplacements comprennent 3 693 commandes actives et 907 désactivées.

## Références et images

La [provenance du lot](../../art/reference-provenance-batch4.json) conserve les
URLs, empreintes, vues écartées et revues des candidats. Les sources brutes restent
hors dépôt. Un doublon du même modèle ne compte pas comme une seconde vue.

Le Groaner conserve sa patte avant éloignée repliée ; les premiers essais avec
halo brun sont exclus. Ses marges latérales sont étroites et sa texture amplifiée.
Split Head conserve sa bouche fermée ; certaines extrémités recadrées dans la
source ont été reconstruites. Sa classification devient quadrupède à quatre
membres, avec une enveloppe de collision réglée pour le versus.

Floatstinger conserve quatre ailes et deux antennes. La correction rapproche sa
silhouette du modèle, avec un écart de rapport largeur/hauteur encore estimé à
14,3 %. Aucun battement original n’est reproduit. Le modèle de Numb Body ne
prouve pas la taille Small ; son échelle est une adaptation et aucune image
n’est attribuée aux variantes Medium, Large ou Arcade.

Wood Side utilise deux cadrages distincts du couloir PC original, sans mélanger
le remake. Le passage en 16:9 et le sol caché par James sont reconstruits ;
l’étage et le segment exact ne sont pas établis. Le rendu `cover` conserve les
proportions de l’image. Le premier cadrage plaçait les pieds sur les plinthes :
le tapis du premier plan et la coupe des murs sont désormais adaptés au plan
horizontal du versus, sans prétendre reproduire la géométrie originale.
Le total est de **10 profils illustrés, 14 PNG d’acteur,
2 PNG de décor et un montage animé candidat**, sans certification 1:1.

## Comportements et lieux

La parade de Pendulum vise les petits calibres de face ; mitraillette et fusil
restent des exceptions. Sa classification volante remplace le petit collider
d’insecte qui laissait passer les balles au-dessus du corps. La projection arrière
du Slurper est désactivée. L’IA filtre également les commandes et contextes interdits.
Le type ancien du Gum Head combat à mains nues ; le vol et l’usage d’armes restent
propres au type nouveau.

Les dix profils de cinématiques sont Creeper SH1, Hanged Scratcher, Mandarin,
Flesh Lip 2001, Abstract Daddy, Pendulum, Leonard Wolf, Hummer, Wall Man et
Gum Head ancien. Les contrôles imposent plafond, grille, eau, mur ou mobilier
selon la recette. La cage de Flesh Lip appartient à son corps original ; aucune
patte du remake n’est ajoutée. La cour ouverte de Midwich refuse désormais toutes
les prises au plafond, y compris les anciennes recettes. Toute nouvelle scène
extérieure bitmap doit être ajoutée à cette exclusion explicite.

Historical Society anime un reflet de cadre, Baldwin une réponse de porte fermée,
Church des cierges sur pied et Hilltop le store du bureau de Monica.
La chapelle devient intérieure. Escalier, cheminée, ascenseur et motifs provenant
d’autres pièces sont retirés des scènes concernées. La porte d’Ernest ne révèle
aucun corps inventé. Le catalogue atteint **57 pistes de référence, 27 clés
actives et 24 événements/interactions**. Une piste reste masquée par le bitmap
de Midwich ; les prototypes piano et gibet restent inactifs dans les pièces
incompatibles.

## Rôles, capture et classeur

Les [sept décisions nouvelles](research/role-decisions-batch4-2026-10-23.json)
concernent Joseph, Sacrificed Walter, Doll, Tormented Soul, Void, Monocle Man
et Mother. Elles exigent l’édition, les preuves de la fiche et des commandes
compatibles avec le rôle retenu. Eileen Head et Greedy Worm restent ouverts.

`node scripts/source-timing.mjs validate-batch BATCH.json --output VERIFIED.json`
vérifie jusqu’à vingt emplacements uniques d’un même sujet, d’une même édition
et d’une même capture, décodée une fois. `annotation-digest PACKET.json`
calcule l’empreinte des annotations pour une relecture candidate distincte.
Changer les frames ou la provenance invalide cette relecture. Hash et décodage
utilisent désormais le même snapshot privé, supprimé ensuite. Les preuves de
l’outil utilisent une vidéo synthétique ; aucun résultat n’est importé comme
mesure source dans l’Excel.

L’export actualise **2 210 cellules**, augmente 712 hauteurs et ajoute 21 cellules
pour trois sources finales. Seules la table Sources, son filtre et la plage de
comptage de `Synthèse!B16` s’étendent. Les 80 formules sont recalculées ; valeurs,
annotations, styles et parties ZIP hors périmètre sont préservés et comparés.
Le vérificateur refuse maintenant les doublons de cellules, de lignes et de
charges XML, ainsi que les coordonnées incohérentes, après reproductions réelles.

Le [rapport de validation](../INTEGRATION_QA_2026-10-23.json) donne les résultats
complets : **692 tests Node, 100 tests Python et 546 contrôles navigateur dans
quatorze suites, avec 82 captures et aucune exception JavaScript**.
Les scènes préparées et les simulations
de KO vérifient des régressions ; elles ne prouvent pas une campagne jouée ni
la reproduction temporelle des œuvres.
