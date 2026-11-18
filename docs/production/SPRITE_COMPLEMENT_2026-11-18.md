# Complément des sprites — Screamer et Leonard

Deuxième lot du **18 novembre 2026**, à la suite de [Scraper, Richard et Weeping Bat](SPRITE_RESUME_2026-11-18.md), sur la même [PR #6](https://github.com/darknigthmare/silent-hill-halo-of-flesh/pull/6).

Deux nouvelles vues de combat sont intégrées et vérifiées pour **Screamer — Downpour** et **Leonard Wolf, forme monstrueuse — SH3 original**. Les sélections précédentes sont conservées. Les [deux générations](sprite-complement-generation-2026-11-18.json) et les [imports](sprite-complement-imports-2026-11-18.json) retracent leurs fichiers et leurs références.

## Deux fichiers indépendants

| Personnage et édition | Usage | Fichier | Dimensions natives |
| --- | --- | --- | --- |
| Screamer — Silent Hill: Downpour | Combat vers la droite, griffes et deux pieds entiers | [PNG](../../assets/sprites/downpour_screamer_104.6d78871316ed.png) | 1197 × 1315 |
| Leonard Wolf — Silent Hill 3 original, forme monstrueuse | Combat vers la droite, deux bras pointus et deux pieds entiers | [PNG](../../assets/sprites/sh3_leonard_wolf_048.cdbe5f879519.png) | 1536 × 1024 |

Screamer conserve sa robe sombre, ses cheveux noirs, ses griffes et ses appuis bandés. Leonard conserve sa tête irrégulière, son corps brun-ocre, les appendices pointus intégrés à ses bras et ses jambes sombres. Aucune forme humaine ou cinématographique de Leonard ne remplace le monstre de SH3. Les gardes restent légèrement obliques pour rendre les deux bras lisibles.

Les [deux références natives conservées](references-sprite-complement-2026-11-18/README.md) sont des rendus de modèle de leur édition exacte. Chacun fournit un seul angle documentaire. Les gardes latérales sont recomposées ; les surfaces non observées restent non certifiées. Les portraits antérieurs servent à la continuité de rendu.

Les deux sorties sont des PNG à fond transparent, conservés sans retouche des pixels ni agrandissement. Ce sont des **poses fixes candidates**, sans nouvelle animation ni UHD native. Le miroir du moteur permet de les afficher dans le deuxième emplacement, sans constituer un angle source indépendant.

## Couverture

| Suivi | Avant ce complément | Après ce complément |
| --- | ---: | ---: |
| Profils illustrés | 172 | 172 |
| Profils sans image | 58 | 58 |
| Combats latéraux candidats | 28 | 30 |
| Vues historiques restant à examiner | 144 | 142 |
| PNG de sprites | 239 | 241 |
| Clips animés au total | 1 | 1 |
| Fidélités 1:1 certifiées | 0 | 0 |

Les deux lots du 18 novembre ajoutent donc **cinq combats indépendants**, depuis les 25 combats latéraux et 236 PNG publiés précédemment. Le nombre de personnages entièrement sans image ne diminue pas avec ces cinq poses destinées à des profils déjà illustrés.

## Validation et conservation

| Contrôle | Résultat |
| --- | --- |
| Gate complet `npm test` | **1253 réussis, 0 échec, sortie 0** |
| Build vérifié | **322 fichiers, 42 JavaScript, 10 HTML** |
| QA du vrai moteur avec Canvas natif | **39 réussis, 0 échec** |
| Duels inversés et captures finales inspectées | **2 / 2** |
| Portraits rendus et inspectés | **4 / 4** |
| PNG antérieurs conservés octet pour octet | **239 / 239** |
| Portraits historiques identiques | **172 / 172** |
| Anciens objets de registre inchangés | **170 / 172**, seuls Screamer et Leonard changent |
| Fichiers historiques de production et de provenance préservés | **310 / 310** |
| Sorties originales et PNG importés identiques | **2 / 2** |

Le [rapport de validation](validation-sprite-complement-2026-11-18/summary.json) conserve le log et les empreintes. Le [rapport de préservation](sprite-complement-preservation-2026-11-18.json) inclut les trois PNG et tous les rapports du premier sous-lot. Le roster, le classeur de production, les anciens journaux et les provenances restent inchangés. Le lecteur des livraisons reconnaît le journal de ce complément ; son cas de régression paramétré passe.

La [revue visuelle](qa-sprite-complement-2026-11-18/README.md) confirme les griffes, les bras pointus et les appuis entiers, les orientations vers l’adversaire et l’usage des deux nouveaux PNG dans les duels. Les portraits restent distincts. Les écarts au sol sont de **−0,009 px pour Screamer** et **+0,003 px pour Leonard**. Aucun ajustement supplémentaire n’a été nécessaire. Le fond brun visible en ignorant l’alpha de Leonard ne s’affiche pas dans le rendu Canvas. L’échelle relative conserve les paramètres existants du moteur et reste à confronter aux sources.

Les deux sous-lots cumulent **103 assertions natives réussies**, **6 duels** et **10 portraits** ; toutes les captures finales de duel et de sélection ont été inspectées. Il ne s’agit pas de 103 scénarios de gameplay distincts. Les introductions, 120 mises à jour d’attente et la pause ne certifient ni animation bitmap, ni attaques complètes, ni timings de collision. DOM, CSS, entrées du navigateur et service worker restent hors de cette QA native.

## Publication et état distant de départ

Le premier sous-lot est publié au commit `e4de8d957cbb2d23856f4cb158a79785c7eba258`, arbre `6dc6c47a3a319f6aa8b0911c76b3b848bfdf6a52`, vérifié identique au commit local testé. Ce complément part de ce head publié.

La [QA distante de ce premier lot](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44256785248) est **réussie**, et le [job navigateur](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44256785154) est encore en cours au relevé du 18 novembre à 07:15:48 UTC. La concurrence existante du workflow peut remplacer ce run lors de la publication du second head ; ce cas doit rester distingué de l’ancienne annulation près de trente minutes. Aucun succès navigateur local n’est annoncé.

## Deux recherches supplémentaires sur les profils sans image

Le [rapport de recherche du complément](sprite-complement-reference-research-2026-11-18.json) et ses [quatre preuves natives](references-missing-complement-2026-11-18/README.md) concernent seulement les deux profils suivants. Aucun sprite n’a été généré à partir de ces preuves insuffisantes.

| Profil | Nouvelle preuve | Conclusion |
| --- | --- | --- |
| Monocle Man — Downpour commercial | Captures du trajet de train de la version sortie, dont une ancienne capture de 2012 | Visage identifiable, extrémités encore perdues dans le cadre ou le tunnel. Le boss prototype restauré reste une variante exclue. |
| The Collector — Ascension | Scène officielle Genvid « Boundaries », examinée à partir de planches natives | Vue large trop sombre et brumeuse ; gros plans coupés en bas. Attribution nominative secondaire et rôle de collecte conservés. |

Les deux profils restent **noncombatant** ; aucune capacité ou confrontation n’a été ajoutée. Avec Wanderer, Missionary de Revelation et Sad Daddy examinés dans le premier sous-lot, cette reprise documente **cinq dossiers sans image**, dont **zéro débloqué**. Elle ne prétend pas avoir recherché à nouveau les 58 absents. Tous les refus antérieurs sont conservés, sans nouvelle tentative.

## Point de reprise

Le [relevé courant](sprite-status-complement-2026-11-18.json) est désormais le point de départ : **30 combats latéraux candidats, 241 PNG, 172 profils illustrés et 58 sans image**. Les cinq nouvelles poses du tour sont conservées, ainsi que tous les portraits et toutes les preuves précédentes. Les **142 vues historiques** restent à examiner individuellement.

Branche : `art/missing-fullbody-20261117` · [PR #6](https://github.com/darknigthmare/silent-hill-halo-of-flesh/pull/6), ouverte en brouillon · version **0.9.6**.
