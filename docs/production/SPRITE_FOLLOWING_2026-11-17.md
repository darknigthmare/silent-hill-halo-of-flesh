# Suite des sprites — Insane Cancer Arcade, Walter et Bogeyman

Reprise du **17 novembre 2026**, depuis le commit `c2a9fc4acf1934294bb39d29e6759c747e90d87d`.

**172 profils illustrés sur 230, 58 encore sans image et 25 poses de combat latérales distinctes.** Ce lot ajoute quatre PNG : Insane Cancer de The Arcade, auparavant absent, reçoit sa sélection et son combat séparés ; Walter Sullivan et le Bogeyman de Downpour reçoivent chacun un combat distinct. Le [relevé courant](sprite-status-following-2026-11-17.json) conserve les 58 IDs encore manquants. Le [rapport précédent](SPRITE_SUITE_2026-11-17.md) reste le relevé historique de Steel Guardian, Anne et Juggernaut.

## Quatre nouveaux fichiers indépendants

| Personnage et édition | Usage | Fichier | Dimensions natives |
|---|---|---|---|
| Walter Sullivan — Silent Hill 4: The Room | Combat vers la droite, deux pistolets | [PNG](../../assets/sprites/sh4_walter_sullivan_072.f7a3056ad30d.png) | 1024 × 1536 |
| Bogeyman — Downpour | Combat vers la droite, masse entière | [PNG](../../assets/sprites/downpour_bogeyman_115.f6de13b5497f.png) | 1024 × 1536 |
| Insane Cancer — The Arcade | Sélection entière | [PNG](../../assets/sprites/arcade_insane_cancer_arcade.af065e6db36b.png) | 1199 × 1312 |
| Insane Cancer — The Arcade | Combat latéral droit | [PNG](../../assets/sprites/arcade_insane_cancer_arcade.05cd8a4b7672.png) | 1297 × 1212 |

Les portraits précédents de Walter et du Bogeyman sont conservés à l’identique. Insane Cancer possède deux images indépendantes ; le moteur utilise exclusivement sa nouvelle garde dans le duel. Chaque PNG conserve les octets et l’alpha de la sortie originale, sans agrandissement ni retouche des pixels.

| Suivi | Avant | Après |
|---|---:|---:|
| Profils illustrés | 171 | **172** |
| Profils sans image | 59 | **58** |
| Combats latéraux candidats distincts | 22 | **25** |
| Vues de combat historiques restant à examiner | 149 | **147** |
| Fichiers PNG de sprites | 232 | **236** |
| Clips animés au total | 1 | **1** |
| Fidélités 1:1 certifiées | 0 | **0** |

Les quatre livraisons sont des **images fixes candidates**, aux dimensions natives indiquées ci-dessus. Elles ne sont pas de l’UHD native et n’ajoutent aucune animation. Le côté gauche est obtenu par le miroir de rendu du moteur ; il ne constitue pas une autre vue documentée du modèle source. Le buste du Bogeyman reste légèrement oblique.

## Insane Cancer : références désormais assez complètes pour un candidat

La [capture originale Arcade 15](https://www.silenthillmemories.net/sh_arcade/screens/pics/sh_arcade_15.jpg), de 425 × 319 px, documente le haut du corps mais coupe les pieds. Une nouvelle inspection de la [démonstration de modèles de metheload](https://www.youtube.com/watch?v=IlbdUgTlD_g&t=390), intitulée *SILENT HILL ： THE ARCADE all creature and character animation*, trouve une carte explicitement nommée **Insane Cancer à 6:30**, avec la tête, les deux jambes et les deux pieds dans le cadre. Les poses continues à 6:40, 6:50, 7:20 et 7:30 complètent cette lecture.

Les images effectivement inspectées pour cette silhouette entière sont des **vignettes natives de 120 × 90 px**. La description de la vidéo indique une conversion de fichiers `.xab` et `.x` vers MDL7. Il s’agit d’une démonstration tierce du modèle converti : elle apporte le contour inférieur manquant, sans certifier les détails de matière, les surfaces arrière ou la géométrie exacte du fichier du jeu. La pose de combat est recomposée à partir de ces références et de la nouvelle sélection.

Les [quatre preuves conservées](references-sprite-following-2026-11-17/README.md) comprennent la capture Arcade et trois vues natives du modèle, avec URL, timecode et empreinte. Aucun modèle SH3 ou Book of Memories n’est substitué à l’édition Arcade.

Walter s’appuie sur le [rendu original de l’homme au manteau de SH4](https://www.silenthillmemories.net/sh4/monsters/man_with_the_coat.png), de 300 × 350 px, et sur sa sélection existante. Le Bogeyman s’appuie sur son [rendu Downpour](https://www.silenthillmemories.net/sh8/arts/pics/sh_downpour_art_120422_16_boogieman.png), de 571 × 1000 px, et sur sa sélection conservée. Ce dernier demeure attaché à l’ID Downpour, distinct de l’édition Homecoming.

Les [imports et leurs empreintes](sprite-following-imports-2026-11-17.json), les [cinq appels de génération et leurs résultats](sprite-following-generation-2026-11-17.json) et les [recherches complémentaires](sprite-following-reference-research-2026-11-17.json) conservent les preuves et les limites.

## Refus conservés et dossiers toujours ouverts

La génération du combat de **Patient — SH4** a été refusée au stade `output`, catégories `sexual` et `violence`, requête `088656ba-b3e7-4fec-807e-5cd3fa086065` : **un appel, zéro image, aucun réessai**. Son entrée de registre complète et son portrait restent inchangés. Les arrêts précédents de Robbie — tronçonneuse et du Butcher — Origins restent inscrits dans le relevé courant, sans nouvelle tentative.

Cette reprise a réexaminé **dix dossiers initialement sans image**. Seul Insane Cancer obtient une référence suffisante pour un candidat entier. Les neuf autres gardent leur blocage :

| Dossier et édition | Limite des nouvelles preuves |
|---|---|
| Wood Guardian — Book of Memories | Branches extrêmes encore coupées ou masquées par le cadrage et l’interface. |
| Greedy Worm — The Arcade | Bouche visible, partie arrière et silhouette entière non établies. |
| Toadstool — The Arcade | Plusieurs modèles voisins visibles ; attribution Toadstool/Whitestool et raccord tête-base non résolus. |
| Ghost — Book of Memories | Le portrait nommé et les silhouettes entières trouvées ne permettent pas une identité de costume sûre. |
| Phantom — The Arcade | Cheveux et tentacules restent hors cadre ; aucune silhouette native entière validée. |
| Wheelman — Downpour | Extrémités et câbles encore incomplets ; le paquet de modèle public n’a pas pu être obtenu. |
| Creeper — The Arcade | Petits modèles visibles sans carte d’identité assez lisible pour attribuer la variante. |
| Snarler — Ascension | Attribution et vues disponibles insuffisantes pour établir un corps entier. |
| Eileen Head — SH4 | Couronne et attaches latérales encore coupées ; dossier hors duel, sans corps mobile inventé. |

Les **58 manquants** conservent les catégories héritées du ledger : 26 arrêts ou refus historiques, 3 refus de génération déjà documentés, 20 références incomplètes, 7 identités ou variantes non résolues et 2 formes immatérielles. Patient, Robbie et le Butcher ont déjà un portrait et ne sont donc pas ajoutés aux 58 profils entièrement sans image. La réconciliation des 58 IDs ne prétend pas que tous ont reçu une nouvelle recherche indépendante.

## Validation et préservation

| Contrôle | Résultat |
|---|---|
| Gate complet `npm test` | **1251 réussis, 0 échec, code de sortie 0** |
| Build vérifié | **317 fichiers, 42 JavaScript, 10 HTML** |
| Contrôles du moteur réel avec Canvas natif | **78 réussis, 0 échec** |
| Duels avec inversion des places | **4** |
| Rendus de sélection | **8** |
| Captures inspectées | **4 duels finaux + 2 portraits Insane Cancer** |
| PNG antérieurs identiques octet pour octet | **232 / 232** |
| Anciens portraits préservés | **171 / 171** |
| Anciens objets de registre inchangés | **169 / 171** ; seuls les combats de Walter et du Bogeyman changent |
| Nouveaux PNG identiques aux sorties générées | **4 / 4** |
| Fichiers antérieurs comparés et préservés | **317 / 317** |
| `git diff --check` | **Conforme** |

Le [relevé complet de validation](validation-sprite-following-2026-11-17/summary.json) conserve le log et les empreintes. Le premier `npm test` avait passé ses 1251 tests avant d’échouer sur la copie finale du build, faute d’espace disque (`ENOSPC`). Le gate entier a ensuite été relancé dans une copie identique sur `/tmp` : **820 fichiers d’entrée vérifiés**, aucune modification par les générateurs ou les tests, et toutes les empreintes des 316 fichiers applicatifs distribués conformes. Les rapports de livraison ont été finalisés ensuite ; le code, les tests, le registre et les assets testés restent identiques.

La [QA visuelle native](qa-sprite-following-2026-11-17/README.md) utilise le vrai `FightEngine`, les introductions et 120 ticks d’attente. Les corps, les deux pistolets de Walter, la masse du Bogeyman, les poings et les pieds d’Insane Cancer restent entiers. Les personnages sont orientés l’un vers l’autre ; aucune image de sélection n’est dessinée en combat. L’écart des derniers pixels au sol est de **+2,47 px pour Walter**, **+1,08 px pour le Bogeyman** et **+0,39 px pour Insane Cancer**, identique dans les deux emplacements. Aucun recalage supplémentaire n’a été nécessaire.

Ces captures sont rendues par **Canvas natif**. Elles ne valident pas les parcours DOM/CSS, le service worker, les entrées du navigateur, les attaques complètes ou des timings d’animation. Le [rapport de préservation](sprite-following-preservation-2026-11-17.json) couvre également le classeur, les anciens ledgers, les fragments, les provenances, les journaux antérieurs et le roster.

## Transition des Rites et cache d’images

Le dernier contrôle navigateur publié sur le commit de départ avait échoué au passage du troisième Rite au suivant. Un parcours Node déterministe a reproduit un dépassement du cache : chaque duel tient séparément dans les **64 MiB** autorisés, mais garder toutes les poses des deux duels exigeait **69 209 432 octets**.

Le correctif conserve désormais les images finales encore rendables de l’ancien match pendant le chargement du suivant. Un combat encore actif garde toutes ses poses ; une sortie animée garde toutes ses frames, et les couches de l’ancien décor restent protégées. En cas d’échec ou d’annulation du chargement, l’ancien résultat reste affichable et la progression gagnée est préservée. Le cas reproduit exige alors **50 336 864 octets**, sans relever le budget ni affaiblir les assertions.

Les **110 tests ciblés** passent, dont trois nouvelles régressions. Le [diagnostic détaillé](BROWSER_QA_RITE_CACHE_2026-11-17.md) conserve le run distant, les chiffres, la reproduction et ses limites. Le seed du run distant n’étant pas enregistré, cette reproduction ne prouve pas à elle seule la cause exacte de cet ancien échec. Chromium local a été bloqué au démarrage par une restriction de l’environnement ; aucun succès navigateur local n’est annoncé. Le nouveau résultat distant sera consultable dans la PR.

## Reprise suivante

Partir de `sprite-status-following-2026-11-17.json`, puis du registre courant. Conserver les **25 combats latéraux**, les **236 PNG** et tous les arrêts de génération. Les **147 vues historiques** doivent être examinées individuellement avant de recevoir le statut de combat latéral. Les silhouettes encore incomplètes restent des dossiers ouverts.

Branche : `art/missing-fullbody-20261117` · [PR #6](https://github.com/darknigthmare/silent-hill-halo-of-flesh/pull/6) · version du jeu **0.9.6**.
