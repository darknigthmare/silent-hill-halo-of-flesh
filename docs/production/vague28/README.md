# Vague 28 — poses manquantes, gardiens et trois arènes

Date : **24 novembre 2026**. Base locale : vague 27, commit
`0e05c91fae9f761f6ce87c0a7915fed0763dea21`.

Cette passe intègre **12 PNG indépendants : quatre poses d’attaque, deux effets
de projectile et six plans pour trois arènes**. Les fichiers actifs conservent
les octets natifs de leur génération. Une première proposition de pose du
gardien de Feu, remplacée par une correction ciblée, reste archivée hors du jeu.
Les treize sorties de génération ne sont donc pas comptées comme treize assets
actifs. Aucun personnage, portrait ou clip animé supplémentaire n’est annoncé.

## Contenu intégré

| Élément | Œuvre et profil exact | Utilisation |
| --- | --- | --- |
| Bond avec morsure de Groaner | SH1 original, `sh1_groaner_003` | Pose statique `forwardSpecial` |
| Poussée du grand bras de Closer | SH3 original, `sh3_closer_036` | Pose statique `forwardSpecial` |
| Heurt frontal de Numb Body Small | SH3 original, `sh3_numb_body_small_037` | Pose statique `forwardSpecial` |
| Main relevée du gardien de Feu | Book of Memories, `bom_fire_guardian_137` | Pose statique `neutralSpecial`, flamme indépendante |
| Rocher du gardien de Terre | Book of Memories, `bom_earth_guardian_142` | Effet réservé à `neutralSpecial` |
| Jet blanc, magenta et violet du gardien de Feu | Book of Memories, `bom_fire_guardian_137` | Effet des trois commandes existantes `neutralSpecial`, `super`, `desperation` |
| Chambre des derniers sacrements | SH4, `final_sacrament` | Fond et avant-plan, chambre sous Room 302 |
| Salle de Scarlet | Homecoming, `scarlet_chamber` | Fond et avant-plan, arène de Hell Descent |
| Toit de l’hôpital | The Arcade, `arcade_hospital_roof` | Fond et avant-plan, phase normale dans la brume grise |

Le rocher ne remplace pas les ondes au sol du gardien de Terre. Les slots et
les phases d’attaque conservent leurs règles, dégâts, collisions et trajectoires.
Les portraits restent distincts des sprites de combat. Les trois arènes ont
chacune deux images de **1672 × 941**, avec un avant-plan transparent qui laisse
les silhouettes et les appuis visibles.

Les contrats et reçus d’import sont dans [characters/delivery.json](characters/delivery.json),
[projectile-import-receipt.json](projectile-import-receipt.json) et
[stage-import-receipt.json](stage-import-receipt.json). Les hashes et dimensions
des douze fichiers actifs figurent dans [summary.json](summary.json).

## Correction du chargement des duels

L’ajout des poses a révélé un dépassement réel : Groaner, Closer et Numb Body
Small atteignent environ **66 Mio de pixels décodés** lorsqu’ils affrontent la
Faceless Nurse d’Origins. La pose de Double Head ajoutée en vague 27 exposait
également ce problème. Le plafond précédent de 64 Mio refusait ces duels.

Le cache des combattants dispose maintenant de **72 Mio**, avec la même gestion
bornée des frames résidentes. Les PNG ne sont ni réduits ni supprimés. Le cache
générique conserve sa valeur par défaut de 64 Mio ; le cache des décors reste à
64 Mio et celui des projectiles à 32 Mio. Cette correction ne constitue pas une
mesure de performances ou de mémoire totale du navigateur.

Le [test de régression](../../../tests/native-attack-budget.test.mjs) reproduit
les quatre anciens refus, vérifie que chaque frame requise est conservée et
confirme qu’une demande dépassant encore la nouvelle borne est rejetée. Le
[contrôle d’admission](cache-admission.json) couvre **999 paires de combattants
concernées par les vagues 27–28**, 258 paires distinctes de décors/pièces et neuf
paires de propriétaires de projectiles. Ces nombres désignent des validations
de chargement ; ils ne représentent pas des combats joués.

Le premier résultat en échec est conservé dans
[cache-admission-before-cache-fix.json](cache-admission-before-cache-fix.json).
La QA finale des quatre poses utilise réellement la Faceless Nurse comme
adversaire, dans les deux orientations.

## Références et limites de fidélité

La [revue des personnages](characters/source-review.json) répertorie les modèles
SH1/SH3 inspectés et les guides décrivant leurs actions. Les poses latérales
restent des adaptations : aucun cycle source complet ni timing original n’a
été mesuré. Le modèle de Numb Body ne certifie pas à lui seul sa variante de
taille. Les nouvelles recherches sur Numb Body Arcade et d’autres profils
ouverts n’ont pas produit de référence suffisante pour débloquer une identité.

La [revue des projectiles](projectiles/source-review.md) conserve les deux
captures promotionnelles E3 2012 du gardien de Terre. Leur date antérieure à la
sortie empêche de certifier les détails de la version commerciale. Pour le
gardien de Feu, les trois miniatures natives de gameplay de **160 × 90** attestent
la palette claire, magenta et violette, mais ne résolvent pas les doigts, les
textures ou le contour précis du jet. Les lames de Steel Guardian restent
manquantes faute de silhouette isolée suffisamment lisible.

Le jet de Feu est séparé du PNG du personnage et contrôlé dans les deux sens.
Les repères choisis au haut de la griffe repliée et au début coloré de la plume
sont distants d’environ 2,47 pixels dans le rendu. Ce relevé ne désigne pas le
bout du doigt et n’est pas une preuve de raccord anatomique exact. La proximité
du bec laisse une ambiguïté de lecture au premier instant d’émission ; la
[revue visuelle finale](projectiles/qa-native-after-cache-fix/visual-review.json)
la conserve explicitement.

La [revue des décors](stages/source-review.json) distingue les scènes observées
des extensions pour le versus. Les références de Sepulcher attribuées à tort
à Scarlet et une image du lac Toluca associée au toit Arcade sont exclues.
La largeur praticable, la caméra latérale, le nombre de travées et la répétition
des stèles restent interprétés à partir de petites captures. Les personnages
des sources ne sont pas peints dans les fonds.

**Les douze images restent des candidats statiques `fidelity: unverified`.
Aucune fidélité 1:1, animation complète ou cadence originale n’est certifiée.**

## Vérifications finales

Le [rapport consolidé](verification.json), produit par
[verify-final.mjs](verify-final.mjs), vérifie que les hashes des sources, assets,
harnais et captures correspondent toujours à ceux des passages finaux.

| Contrôle | Résultat | Preuve |
| --- | --- | --- |
| Suite Node complète après correction | **1 301 réussis, zéro échec** | [Journal](node-tests-final.txt) |
| Poses contre Faceless Nurse, deux orientations | **334 contrôles, huit scènes, huit captures** | [Rapport final](characters/qa-native-final/report.json) |
| Deux projectiles, deux orientations | **79 contrôles, quatre scènes, six captures** | [Rapport final](projectiles/qa-native-after-cache-fix/report.json) |
| Trois arènes et leur parallaxe | **109 contrôles, trois scènes, trois captures** | [Rapport final](stages/qa-native-final/report.json) |
| Conservation de l’existant | **683 anciens fichiers d’assets identiques, 17 fichiers de règles/classeurs inchangés** | [Audit](summary.json) |
| Génération et vérification du paquet | **Réussies**, puis paquet revérifié après le correctif de cache | [Vérification initiale](verify-final.txt), [vérification finale](build-after-cache-fix.txt) |

Le total natif est **522 contrôles, quinze scènes et dix-sept captures finales**,
toutes inspectées. Les premiers passages et leurs captures restent archivés,
mais ne sont pas additionnés au total final. Les 66 tests ciblés du cache sont
également inclus dans les 1 301 tests Node.

Les contrôles natifs utilisent le vrai `FightEngine`, ses mises à jour et son
rendu, avec des événements synthétiques transmis aux callbacks d’entrée normaux.
Aucune position, attaque ou trajectoire n’est injectée. Le décodage PNG adapté
en mémoire pour Canvas natif vérifie l’égalité RGBA et ne modifie aucun fichier.
Les tests des projectiles déclenchent `neutralSpecial` ; les slots `super` et
`desperation` de Feu sont validés par leur contrat d’import, sans nouveau test
visuel de ces deux commandes.

Chromium local reste bloqué par `socket() Operation not permitted`.
Le [contrôle HTTP préparé](run-ci-browser-check.mjs) couvre treize scènes et
est raccordé au workflow GitHub. **Il n’a pas été exécuté dans cette passe.**
Les harnais HTTP existants des vagues 26–27 sont également corrigés pour relever
le vrai ID d’acteur, refuser un serveur déjà présent sur le port réservé et
exiger que le dessin observé appartienne à la frame capturée. Leurs anciens
rapports ne sont pas réécrits.

La suite Python complète des classeurs s’était arrêtée avec `exit 137` en
vague 27 ; elle n’a pas été relancée ici. Le résultat historique des 105 tests
d’outils d’art n’est pas compté comme une nouvelle exécution.

## Couverture et manquants

| Catégorie | État actuel | Reste à produire ou vérifier |
| --- | --- | --- |
| Portraits | 204 / 230 | 26 absents |
| Vues latérales de combat | 190 / 230 | 36 absentes et quatre vues anciennes à revoir |
| Arènes illustrées | **85 / 123** | 38 : 23 ouvertes et quinze bloquées par leurs références |
| Profils de projectile par défaut | Cinq ont au moins un effet dédié | 26 sans effet, plus le gardien de Terre partiellement couvert |
| Commandes de projectile par défaut | **14 / 86** | 72 sans effet dédié |
| Clips réellement animés | Six, inchangés | Les quatre poses nouvelles ont chacune une seule image |
| Fidélité certifiée | Zéro | Les vérifications techniques ne certifient pas les sources |

Les 26 portraits absents sont inclus dans les quarante profils de combat non
résolus ; ces quantités ne s’additionnent pas. L’[inventaire des manquants](remaining-assets.json)
conserve leurs motifs et répertorie les arènes et commandes sans bitmap.
L’[audit des poses](pose-backlog.json) détaille séparément les clips exacts
présents ou absents sur les identités déjà illustrées. Les variantes d’armes,
les présentations contextuelles, les pièges et les effets d’impact demandent
un périmètre explicite ; ils ne sont pas implicitement couverts par le total
des 86 commandes de projectile.

Sur les **165 profils illustrés avec une vue latérale et un combat activé sans
dossier de référence restant ouvert**, le registre contient seulement **sept
clips d’attaque dédiés pour 3 088 commandes activées**. **3 081 commandes restent
sans clip propre** ; 212 commandes désactivées sont exclues de ce décompte.
Le même audit dénombre 1 292 clés d’états de base absentes hors désactivations
et transitions non prévues connues, 1 154 présentations ordinaires sans rendu
dédié et un idle d’arme exact manquant. Les clés de présentations génériques et
contextuelles se recoupent. Ces valeurs ne sont ni un total d’images à générer,
ni un nombre d’animations originales attendues. Les autres profils gardent
leur catégorie distincte, et les finishers restent soumis à leur contexte.

## État de cette preuve avant publication

Cette documentation décrit le travail local prêt à être revu. À sa rédaction,
les vagues 27 et 28 n’ont pas encore été envoyées sur GitHub. Le contrôle automatique
d’approbation a refusé le push, jugeant « continue à fond » insuffisamment
explicite pour cet envoi. Aucun lien de PR ni résultat de CI distante n’est
revendiqué. La publication nécessite une autorisation nommant l’envoi de ces
commits au dépôt `darknigthmare/silent-hill-halo-of-flesh` et la création de la PR.
