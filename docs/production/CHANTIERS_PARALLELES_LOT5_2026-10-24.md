# Chantiers parallèles — cinquième lot du 24 octobre 2026

Cette livraison prolonge `088960c` sur `codex/source-fidelity-20261023`.
Six chantiers ont avancé en parallèle. Les adaptations du versus, les faits
attestés dans les œuvres et les images candidates restent distingués.

| Chantier | Réalisation | Travail restant |
| --- | --- | --- |
| Acteurs | Wormhead et Hanged Scratcher SH1, Closer SH3, Hummer SH4 : quatre PNG fixes séparés. | Autres poses, cycles et comparaisons ; 216 profils sans PNG. |
| Lieux | Salle d’attente normale Alchemilla en bitmap ; quatre pistes SH4 et correction des pièces représentées. | Géométrie, caméra et animations originales à comparer. |
| Combat | Phases et ouverture de gueule de Split Head, chute du Hummer, griffes renversantes de Wall Man, bonds et morsures des deux Sniffers. | Clips propres et mesures de la source ; fenêtres, dégâts et cadence restent des choix de versus. |
| Cinématiques | Dix profils, vingt finishers et soixante-dix présentations supplémentaires. | Poses PNG contextuelles et comparaison des gestes. |
| Rôles | Sakura Head et les cinq Raw Shocks requalifiés en poursuites sans duel autonome. | Dossiers, captures et futures rencontres de poursuite à produire. |
| Relevés et classeur | Prévisualisations de frames pour la relecture, suivi et export Excel actualisés. | Aucun des 4 600 relevés originaux n’est mesuré. |

Le suivi conserve **875 actions, dont 849 ouvertes et 103 P0**. Vingt-quatre
décisions de rôle et deux travaux techniques sont validés. Aucune validation
artistique n’est inventée. Les 435 observations gardent leurs identifiants et leur
ordre ; trois sources ajoutées en fin portent le total à 142.

## Images et pièces exactes

La [provenance du lot](../../art/reference-provenance-batch5.json) conserve les
URLs, empreintes, vues retenues, doublons écartés et limites. Les références brutes
restent hors dépôt. Un rendu recopié dans un guide ou sur le DVD n’est pas une
nouvelle vue indépendante.

Wormhead conserve sa tête recouverte de replis et se distingue de Groaner.
Hanged Scratcher conserve la posture tassée, le museau pendant et ses griffes ;
la face arrière reste masquée. Son enveloppe agrandie suit la description
qualitative « large/huge/giant » du bestiaire ; le facteur 1,55 est une calibration
du versus, sans mesure de la taille originale. Les extrémités recadrées sont
reconstruites. Hummer utilise uniquement le grand sujet d’une planche de deux
créatures ; membrane et fourrure sont extrapolées depuis une image de 404 × 214.
Sa variante Arcade ne reçoit aucun PNG par héritage.

Le premier Closer est exclu pour confusion entre un bras et une jambe dans une
vue en perspective. Deux captures du jeu ont servi à vérifier le remplaçant
frontal : deux bras cylindriques latéraux, deux jambes sombres centrales, tête
allongée et tablier. Sa pose est redressée et sa texture plus contrastée ; les
extrémités cachées restent reconstruites. La variante Church n’est pas illustrée
par substitution.

Alchemilla utilise la salle d’attente normale SH1, avec murs bicolores, banquette
en L, chariot métallique et bord du comptoir. La carte confirme la réception
adjacente ; elle n’est pas fusionnée en faux couloir. Caméra élargie, sol caché
et mobilier repoussé au fond sont des adaptations pour les appuis du versus.
La réaction d’ascenseur est désactivée dans cette pièce. Ses deux pistes de
décor restent préparées et masquées par le bitmap.

Le catalogue compte **14 profils illustrés, 18 PNG d’acteur, trois PNG de décor
et un montage animé candidat**. Aucun n’est certifié 1:1. Les plafonds des
scènes bitmap sont maintenant déclarés par `geometry.ceiling` : une scène de
remplacement exige explicitement `true` pour les prises suspendues. Renommer
une cour ne peut plus lui donner un plafond par un motif textuel.

## Combats, poursuites et cinématiques

Split Head distingue la phase initiale et la phase de mâchoire persistante.
L’exposition frontale suit les frames actives de ses véritables commandes de
morsure, avec une indication « GUEULE OUVERTE · VERSUS ». Le PNG de bouche
ouverte reste à produire ; le moteur ne le remplace pas par une animation
prétendument originale. Seuil, multiplicateur et timings sont des paramètres
du versus. Hummer tombe après un impact de mêlée ; son corps et son placement
raster rejoignent le même sol, puis retrouvent le vol après récupération.
Wall Man renverse par ses griffes ; les
Sniffers mâle et femelle disposent de leurs bonds et morsures avec entrave.

Les six poursuites restent dans le catalogue et les dossiers, avec leurs vingt
commandes autonomes désactivées. Raw Shock Diseased perd l’aura affaiblissante
non attestée ; Abstract ne revendique plus une collision changeante. Les deux
routes Harry Ice et Maya Villa ne contiennent plus de duel : leurs dossiers
restent consultables et le lancement est refusé sans modifier sauvegarde,
records ou tentatives. Le total devient **188 profils compatibles avec le
prototype de combat, 3 570 commandes actives et 1 030 désactivées**.

Les dix profils de cinématiques sont Incubator, Incubus, Creeper SH2, God SH3,
Straight Jacket Origins, Ariel, Helen Grady, Richard Grady, Lurker et Smog.
Leurs contraintes de corps, armes et supports restent vérifiées. Le total atteint
**151 finishers composés, dont 144 de combattants et sept de lieu, et 504
présentations**. Ce sont des compositions de versus sans clips PNG contextuels.

Les quatre scènes SH4 sont le quai Lynch Street avec voitures arrêtées,
le sentier du premier passage en forêt, la salle de roue hydraulique B2 de
Water Prison et le couloir des fauteuils de Hospital World. Elles ne récupèrent
ni train SH3, ni façade Wish House, ni cellules/toit, ni tête géante provenant
d’une autre pièce. Le chemin forestier ne reçoit plus de montagnes du repli
générique. Le fauteuil de fond reste un prototype cosmétique explicite, sans
importer silencieusement les dégâts ou l’IA de l’ennemi SH4.

Le suivi compte **61 fiches de piste, 31 clés, 60 identifiants activables avant
les masques bitmap et 22 événements/interactions**. Trois fiches sont masquées
par Midwich/Alchemilla ; l’une d’elles est la réaction d’ascenseur désactivée.

## Relecture des frames et vérification

`node scripts/source-timing.mjs review-preview BATCH.json --output-dir DOSSIER_NEUF`
revalide le paquet brut et sa capture, extrait une fois les frames uniques de
début, impact et fin, puis écrit les PNG, leur manifeste SHA256 et `index.html`.
Hash, `ffprobe` et `ffmpeg` utilisent le même snapshot privé. Les aperçus sont
bornés à 640 pixels ; indices et secondes relatives sont calculés depuis le
FPS rationnel de cette capture. Le HTML échappe les libellés et ne charge aucune
ressource distante. Il ne crée aucune attestation humaine et n’écrit aucun
timing dans le classeur.

Le smoke utilise douze images synthétiques CFR. Les cinq PNG extraits aux indices
0, 2, 3, 8 et 11 sont comparés à des extractions indépendantes. Le navigateur
cloud bloquant `file://`, les mêmes fichiers ont été inspectés sur une boucle
locale pour ce contrôle ; ils restent des fichiers HTML/PNG autonomes.

Les [décisions de rôle](research/role-decisions-batch5-2026-10-24.json) donnent
les preuves retenues. Lisa, Prisoner, Greedy Worm et Eileen Head restent ouverts
quand la documentation relue ne permet pas de conclure suffisamment. Les tests
et captures vérifient des scènes préparées et des régressions, pas une campagne
jouée ni la reproduction temporelle d’une œuvre.

Le [rapport de validation](../INTEGRATION_QA_2026-10-24.json) détaille les
résultats, l’export Excel et les limites de leur portée.

La version finale passe **736 tests Node, 100 tests Python et 749 contrôles
navigateur dans quatorze suites**, avec 113 captures et aucune exception
JavaScript. Les 96 fichiers du build issus du dépôt sont identiques aux sources ;
le build contient 97 fichiers au total. Ces contrôles ont été exécutés dans
l’environnement cloud ; aucune exécution de GitHub CI n’est revendiquée.

L’export modifie 1 857 cellules, augmente 431 hauteurs et ajoute 21 cellules
pour les trois sources finales. La table Sources, son filtre et la plage de
comptage de `Synthèse!B16` s’étendent ; les 80 formules sont recalculées.
Annotations, valeurs et styles hors périmètre restent préservés et comparés.
Une revue indépendante de 25 contrôles vérifie aussi les SHA, les caches des
formules, les 435 observations et les 18 400 cellules de mesures source vides.
