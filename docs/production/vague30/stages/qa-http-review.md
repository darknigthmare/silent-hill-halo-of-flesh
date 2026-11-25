# Vague 30 — revue visuelle des trois arènes sur HTTP

Revue du 25 novembre 2026, après inspection séparée des trois captures du jeu réellement exécuté. **Les trois compositions sont acceptables pour l’intégration candidate dans le périmètre observé : deux plans chargés, combattants lisibles sur le sol, premier plan dégagé aux positions de départ et libellé de phase correct.** La fidélité visuelle 1:1 reste non certifiée.

## Preuve et périmètre

Le [rapport HTTP original](../qa-http/http-wave30-stages/report.json) comporte **37 contrôles réussis, zéro erreur navigateur et trois captures de combat**. Le [résumé vague 30](../qa-http/http-wave30-stages/wave30-summary.json) confirme les trois IDs attendus et le build `dist`. L’identifiant `wave: 28` du rapport original désigne le harness réutilisé ; le résumé conserve explicitement `harnessReportWave: 28` et porte `wave: 30`.

Le lancement passe par l’interface normale et atteint la phase `fight` avec `bom_pyramid_head_129` et `bom_butcher_123`. Le rapport enregistre les appels du canvas aux six PNG natifs, leur disponibilité dans le cache et les six réponses HTTP 200 avec tailles et SHA-256 exacts. Il n’indique ni injection d’état des combattants ni substitution d’assets. Les neuf fichiers sources surveillés sont inchangés avant/après la QA. Les trois captures mesurent 1440 × 982 pixels ; leurs octets et empreintes ont été revérifiés localement pendant cette revue.

| Arène et capture inspectée | Phase visible dans le HUD | Observation des plans et des appuis | Premier plan |
| --- | --- | --- | --- |
| [Shimizu Residence II](../qa-http/http-wave30-stages/shimizu_residence-http-fight.png) — `shimizu_residence` | `RESIDENCE II · SALLE À MANGER` | Table basse ronde, chaise de sol, tatamis et meuble TV/radio identifiables. Le mobilier reste derrière la bande de combat ; les pieds des deux combattants se lisent sur le tatami, sans chevauchement avec la table. | Le coussin est visible en bas à gauche ; il ne recouvre aucun des combattants sur cette capture. |
| [Toluca Lake, quai](../qa-http/http-wave30-stages/arcade_toluca_lake-http-fight.png) — `arcade_toluca_lake` | `STAGE 3 AREA 1 · QUAI DU LAC` | Brume claire, lampadaires, piliers de pierre et garde-corps lisibles. Les deux combattants se détachent sur une aire pavée continue, avec des appuis visuellement cohérents. | Le pilier de pierre reste en bas à droite, à l’écart des deux positions de départ. |
| [Toluca Prison, Otherworld](../qa-http/http-wave30-stages/arcade_prison-http-fight.png) — `arcade_prison` | `STAGE 2 AREA 2 · OTHERWORLD` | Les cellules et les surfaces corrodées rouges/turquoises sont visibles. Les combattants restent identifiables ; leurs pieds se lisent sur le sol, malgré une texture nettement plus chargée que dans les deux autres scènes. | Le jambage corrodé reste contre le bord gauche ; ses traverses courtes ne coupent pas la zone centrale ni les combattants affichés. |

Le rapport place les deux acteurs à `y: 594` dans chaque arène. Ce contrôle moteur et l’inspection des pieds concordent sur ces images de départ. Le wrapper vérifie aussi les scènes sélectionnées, les états fixes et le contrat de plafond avant le lancement ; une image isolée ne prouve pas à elle seule la conservation d’un état pendant tout un match.

## Observations à conserver

L’annonce centrale « FIGHT » recouvre temporairement une partie de chaque décor. Elle appartient au démarrage normal du combat et empêche de traiter ces images comme une vue entièrement dégagée de l’arène. Les deux plans restent néanmoins identifiables et les combattants ne sont pas masqués.

Le quai affiche aussi « EAU STAGNANTE », et la prison « CAILLEBOTIS MÉTALLIQUE ». Ces lignes viennent des profils de terrain conservés ; elles ne décrivent pas exactement toutes les surfaces peintes des nouveaux fonds. Le quai montré est pavé. Cette revue ne change ni ces profils physiques ni leurs textes et signale cette différence de présentation pour une éventuelle révision ciblée du HUD.

La prison offre le contraste le moins régulier autour des jambes en raison de sa texture rouge/turquoise. Aucun blocage de lecture n’est constaté sur la capture fournie. Il reste utile d’examiner le mouvement près des bords avant d’étendre la conclusion à toutes les positions.

## Traçabilité

- Commit source du run : `a1f434ea1d53eb933879442b05f1971c767c197f`.
- [Run GitHub Actions 45660199560](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/45660199560), job `139367652764`, artifact `15045286963`.
- SHA-256 du ZIP téléchargé communiqué par root : `6ada019a87812fefec31116529ffb13ff44024066a0f383ad1942a65ec86ae65`. Cette revue revérifie les fichiers extraits ; elle ne recalcule pas le ZIP.
- Exécution du harness : du `2026-11-25T17:07:43.270Z` au `2026-11-25T17:07:57.082Z`, Chromium `143.0.7499.4`, build `dist`.
- SHA-256 du rapport revérifié : `a4f29f9cbfb4e12942a366026bf48c9211be08ecc10d8f80e776b6a02415645e`.
- SHA-256 du résumé revérifié : `d8db7a0cef6f1d42b9dfcf1c25b13c323cca4bd3d340617c9f279cec79e905f0`.

| Capture | Octets | SHA-256 revérifié |
| --- | ---: | --- |
| `shimizu_residence-http-fight.png` | 1 336 168 | `3b579e285a4b689e1dd04f9d17d4871ea10e1806289fcb1cd19c6080ae95e76b` |
| `arcade_toluca_lake-http-fight.png` | 1 119 565 | `3f02d75302905a9cdd62d64de7c682b3b4eebd72ea61f9509e2cc2245aac2a00` |
| `arcade_prison-http-fight.png` | 1 621 045 | `1bfc270aaa078899a903032cd2eb21433c42ccf61402829a562474cc0e77a017` |

Les empreintes du manifeste des décors, de leur politique et de `src/data.js` enregistrées par le résumé concordent avec leurs blobs du commit source. Le `src/production-reference.js` réellement testé vaut `684e9dd63870a2969fdfb371716f43b833e360c405ba26b1aa589ad9b63cb603` ; le blob brut de ce commit vaut `bc9626b507e9c64c9b2c466119fd2d04905255d7ae88b946c0b3a6f4a4c98889`. Le [workflow](../../../../.github/workflows/wave30-review.yml) lance `npm run build` avant les QA ; cette commande reconstruit les références de production. Le commit identifie donc les sources de départ du run, tandis que le résumé identifie les octets générés réellement testés. Le wrapper vérifie l’identité source/dist de ces quatre modules.

## Limites de cette validation

Cette preuve couvre le chargement et le rendu HTTP réel des six plans fixes ainsi que la composition de départ de trois arènes. Elle ne démontre pas les déplacements jusqu’aux extrémités, la parallaxe au fil du temps, toutes les tailles d’écran, les attaques, les Dénouements ou les collisions pendant un match complet. Aucun test de service worker hors ligne ou de mise à jour n’est revendiqué : les contextes Chromium bloquent les service workers.

Aucun nouveau danger, plafond de gameplay ou changement de géométrie n’est autorisé par cette revue. Les scènes restent des adaptations candidates documentées dans les [sources](sources.json), avec leurs limites de cadrage ; cette inspection du jeu ne certifie pas leur fidélité 1:1 aux œuvres.

Les contrôles antérieurs à la panne restent conservés dans [validation.json](validation.json). La nouvelle entrée `postRecoveryHttpValidation` ajoute la preuve HTTP et la revue visuelle ; elle ne réécrit pas l’ancien état « non exécuté » et ne remplace pas le suivi des autres validations par root.
