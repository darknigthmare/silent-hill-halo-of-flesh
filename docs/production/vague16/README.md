# Silent Hill Combat — reprise du 19 novembre 2026

Base vérifiée : `67d8df2cff2132387ee39b590420145204729a44`, branche `art/missing-fullbody-20261117`, PR [#6](https://github.com/darknigthmare/silent-hill-halo-of-flesh/pull/6).

## Livraison de cette vague

**Sept images actives nouvelles : cinq poses individuelles et deux plans de décor.** Les quatre portraits historiques restent associés à la sélection. Chaque nouvelle pose est un PNG transparent indépendant, avec le corps, les appuis et les armes dans le cadre.

| Sujet | Image ajoutée | Usage |
| --- | --- | --- |
| Faceless Nurse — Origins | Profil droit avec seringue | Attente en combat |
| Faceless Nurse — Origins | Avant-bras relevé, seringue près du corps | Garde, puis retour à l’attente |
| Scarlet — Homecoming | Forme verticale à coque de porcelaine | Attente latérale, distincte de la forme arachnide |
| Incubator — Silent Hill (1999) | Robe blanche, profil droit | Présentation latérale dans les limites de son rôle existant |
| Scraper — The Arcade | Voile, tunique et deux lames de l’édition Arcade | Attente latérale |
| Brookhaven — Silent Hill 2 (2001) | Terminus du couloir Otherworld devant l’ascenseur | Fond avec sol dégagé |
| Brookhaven — Silent Hill 2 (2001) | Huisserie gauche transparente | Plan proche défilant séparément |

Les poses restent statiques : cette vague n’ajoute aucun clip animé. Les détails de profil sont reconstruits à partir des portraits candidats existants. La conformité exacte aux modèles des œuvres n’est pas certifiée.

Le fond de Brookhaven et son plan proche sont affectés à la fiche `brookhaven_sh2`, scène `otherworld-b1-elevator-terminus`, référence `CL_SH2_06_NIGHTMARE_HOSPITAL`. Le plan proche reste sur le bord gauche et possède sa propre translation de parallaxe. Une première version de la huisserie et un essai de Scarlet sont conservés dans les sources de production, sans usage actif. Un rendu intermédiaire de correction de Scarlet reste non récupéré après la panne du poste ; ses métadonnées figurent dans le journal, sans prétendre livrer ses octets.

## Fichiers des séances précédentes

Les **11 PNG identifiés** dans le dossier de travail `530224f9f64b` étaient déjà présents à la base vérifiée. Cela inclut les infirmières Homecoming et SH3, Jasper Gein, Raw Shock, Ayakakashi, le portrait Air Screamer, les deux plans de la salle de Leonard et l’apparition James/Lying Figure. Leurs chemins, tailles et références d’empreinte sont rapprochés dans [recovered-files.json](recovered-files.json).

Le portrait de **Colin** est aussi présent, avec un usage de sélection seulement. La marche de **Scarlet arachnide** possède déjà trois dessins distincts et la séquence `[0,1,2,1]`. Les treize sources et dérivés des scènes de la vague 12 sont publiés. Ils ne sont pas recomptés comme de nouvelles créations.

Le poste distant est devenu indisponible durant l’inventaire. Ces conclusions portent sur les fichiers effectivement retrouvés et les sources de la PR ; elles ne prétendent pas constituer une nouvelle inspection exhaustive de tous les anciens dossiers locaux.

## Couverture après intégration

| Indicateur | Avant | Après |
| --- | ---: | ---: |
| Portraits de sélection | 204 / 230 | 204 / 230 |
| Profils avec vue latérale dédiée | 119 | 123 |
| Anciennes vues de combat restant à revoir | 74 | 70 |
| Profils sans image de combat | 37 | 37 |
| Arènes avec décor bitmap | 23 / 123 | 24 / 123 |
| Illustrations de chroniques | 48 | 48 |
| Clips animés comptabilisés | 2 | 2 |
| Fidélités 1:1 certifiées | 0 | 0 |

Les 48 illustrations couvrent 15 introductions, 15 fins, 12 rivaux, 3 observations et 3 apparitions. Aucun ancien portrait, cadre de sprite ou décor n’est supprimé du dépôt.

## Traçabilité et contrôle

- [Prompts, références et métadonnées des personnages](fighter-generation.json).
- [Plans de Brookhaven, sources et placement](brookhaven-sh2.json).
- [Registre actif des personnages](../../../art/registry.json).
- [Couverture calculée](../../../data/sprite-coverage.json).

Les sept PNG actifs sont inspectés visuellement et décodés avant publication. Les CRC, dimensions, empreintes de fichier et de pixels, transparence et limites des sujets sont contrôlés. Les 204 portraits conservent leurs descriptions exactes ; les scènes et les anciens sprites restent disponibles. Le service worker reçoit les nouveaux fichiers et une nouvelle révision bitmap.

La validation complète Node/Python et les captures du navigateur sont exécutées par les workflows de cette PR après publication. Leur résultat est consultable dans [Checks](https://github.com/darknigthmare/silent-hill-halo-of-flesh/pull/6/checks) ; aucun succès futur n’est présumé ici.

## Suite du travail

Il reste **26 portraits**, **37 profils sans image de combat**, **70 anciennes vues à revoir** et **99 arènes sans décor bitmap**. Les poses d’attaque, locomotions et présentations demandent encore leurs dessins dédiés. Le statut de chaque profil est consultable dans la couverture active ; une pose statique ne vaut pas un moveset animé.
