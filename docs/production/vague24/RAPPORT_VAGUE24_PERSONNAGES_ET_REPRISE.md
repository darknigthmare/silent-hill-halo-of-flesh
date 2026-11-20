# Silent Hill Combat — reprise publiée et vague 24

Date : 20 novembre 2026. Dépôt : `darknigthmare/silent-hill-halo-of-flesh`. PR conservée : [#6](https://github.com/darknigthmare/silent-hill-halo-of-flesh/pull/6), branche `art/missing-fullbody-20261117`.

## Résultat

La reprise de cette session publie d'abord les deux livraisons locales de la vague 23 et leurs archives, puis ajoute **14 vues latérales distinctes** aux profils déjà illustrés. Les portraits de sélection, les autres poses, les clips et les identités restent conservés.

Depuis l'ancien état distant de vague 22, le catalogue gagne **24 vues latérales candidates** et **six arènes bitmap**. La vague 24 ajoute sept vues récupérées et sept vues nouvellement générées ou corrigées. Treize des quatorze profils conservent leur admission au duel ; Bloodsucker reste une référence d'atelier correspondant à un obstacle environnemental.

## Publication des anciens lots

Les deux sessions de vague 23 ont été rapprochées dans le snapshot local `54404d2280f6feee9530e95c42ffcb711a597e19`. Sa publication est effective au commit [`4b36a85bd63b5b15c0ead61784ae0194f51ba02f`](https://github.com/darknigthmare/silent-hill-halo-of-flesh/commit/4b36a85bd63b5b15c0ead61784ae0194f51ba02f), parent `cffb58bbcb78c2bdb1381965ea0efb3e5fb54994`.

L'arbre Git distant `1fcc00e732178bcf5bd2948da8d2f8a32d6713d1` correspond exactement au snapshot local. Les **536 chemins**, **194 blobs binaires uniques** et **23 lots d'arbre** ont été vérifiés. Le contrôle de réconciliation a réussi ses **382 contrôles**. Le [reçu de publication](previous-lots-publication-receipt.json) conserve ces faits séparément des tests de la nouvelle vague.

Les dix vues reprises sont Gum Head Arcade, Gray Child et Raw Shock de Book of Memories, Tremer, Wood Sapling, Remnant d'Origins, Glutton de SH3, Greedy Worm, Toadstool et Whitestool de SH4. Les six stages repris correspondent aux zones Blood, Earth, Fire et Water de Book of Memories, à la ville de The Arcade et à Ebisugaoka de Silent Hill f. Ils comportent chacun deux plans retenus. Les variantes concurrentes sont conservées dans leurs archives.

## Quatorze vues intégrées pendant cette passe

| Profil | Source | Travail retenu | Usage conservé |
| --- | --- | --- | --- |
| Kashimashi | Silent Hill f | Vue latérale récupérée ; trois bras, couteau et deux pieds complets | Combat candidat |
| Irohihi | Silent Hill f | Vue latérale récupérée ; posture basse avec appui des mains | Combat candidat |
| Kamugara | Silent Hill f | Vue latérale récupérée ; collier, entraves et chaînes conservés | Combat candidat |
| Harai Katashiro | Silent Hill f | Vue latérale récupérée ; masque, couteau et jambes en lame | Combat candidat |
| Drum Monster | Silent Hill f | Vue latérale récupérée ; forme tambour et bras asymétriques | Combat candidat |
| Shiromuku | Silent Hill f | Vue latérale récupérée de la forme de base ; robe et traîne entières | Combat candidat |
| Bloodsucker | Silent Hill original | Vue latérale récupérée ; trois tubes issus d'une base commune | Atelier, hors duel |
| Ara-abare | Silent Hill f | Correction du troisième appui inventé ; deux appuis retenus | Combat candidat |
| Tsukumogami | Silent Hill f | Correction du bras masqué/manquant ; huit mains séparément visibles | Combat candidat |
| Stinger | Silent Hill: Ascension | Nouvelle vue de flanc ; quatre terminaisons de bras et deux pieds | Combat candidat |
| The Immolator | Silent Hill: Ascension | Nouvelle vue latérale après correction de l'angle initial | Combat candidat |
| Shichibi | Silent Hill f | Nouvelle vue de la phase dorée, corps et éventail de queues entiers | Combat candidat |
| Kyubi | Silent Hill f | Nouvelle vue noire/bleue, quatre pattes et queues entières | Combat candidat |
| Oi-omoi | Silent Hill f | Nouvelle vue corrigée avec thorax fermé, deux jambes et chaussures entières | Combat candidat |

Le journal [sprite-wave24-imports-2026-11-20.json](../sprite-wave24-imports-2026-11-20.json) lie chaque import à sa source, son portrait préexistant, ses empreintes et son reçu. Les quatre reçus d'import séparés sont conservés dans ce dossier.

## Production et corrections

Les appels réussis de cette session ont produit **neuf PNG natifs** : sept sont retenus, deux sont des essais remplacés. Les douze PNG récupérés de la session précédente sont tous conservés : sept sont actifs dans cette passe, cinq restent des variantes archivées ou remplacées. Aucune image native n'a été recadrée, redimensionnée, repeinte ou nettoyée par script.

Les corrections ont porté sur des défauts précis : les deux appuis d'Ara-abare, les huit mains de Tsukumogami, le thorax fermé d'Oi-omoi et le flanc de l'Immolator. Les essais initiaux restent consultables. La première correction de Tsukumogami interrompue par l'indisponibilité de l'environnement n'a produit aucun fichier et n'entre pas dans les neuf sorties réussies.

Les références d'Ascension ont aussi été rapprochées des personnages : la planche `sh_ascension_art_monster_09.jfif` correspond à Stinger et `_10.jfif` à l'Immolator. Les nouveaux appels utilisent chacun la planche correspondante, avec la correspondance enregistrée dans [ascension-new/delivery.json](ascension-new/delivery.json).

Les prompts et références exacts des nouvelles sorties sont conservés dans les dossiers `ara-abare-correction`, `tsukumogami-correction`, `shf-new` et `ascension-new`. Pour les fichiers récupérés, les plans de prompts antérieurs sont conservés ; les reçus d'appel originaux non retrouvés ne sont pas reconstitués comme s'ils avaient été observés.

## Validation de la nouvelle vague

- **Build des manifestes réussi** : 175 vues latérales, 204 portraits, 71 arènes bitmap ; les règles et données du jeu passent `node scripts/build.mjs --verify-only`.
- **159 tests Node ciblés réussis**, aucun échec, aucun test ignoré. Le journal est [targeted-tests.tap](targeted-tests.tap) ; les six fichiers exécutés sont détaillés dans [verification-summary.json](verification-summary.json).
- **368 contrôles de conservation et de cohérence réussis** : édition, rôle, portrait, clips, autres poses, empreintes des PNG, manifeste et blocs de cache. Les 60 fichiers protégés restent identiques, dont les règles, les définitions, les stages, le corpus et les classeurs.
- **2 119 paires de combattants affectées** passent la vérification d'admission mémoire. Maximum observé : 44 049 456 octets décodés, sous le budget existant de 67 108 864 octets. Ce contrôle ne représente pas 2 119 matchs joués.
- **14 processus de QA native réussis**, **868 assertions**, **26 cas du moteur FightEngine**, **deux aperçus d'atelier** et **94 captures** conservées. Les profils de combat sont placés une fois de chaque côté par le démarrage normal d'un duel. Les entrées, le déplacement autorisé ou stationnaire et le retour au repos sont contrôlés sans injection de positions ou d'états d'acteur.

**28 des 94 captures** ont été inspectées visuellement : les deux orientations des treize combattants et les deux aperçus de Bloodsucker. Aucun ajustement de calibration supplémentaire n’a été demandé.

Le [bilan des processus](qa-native/final/process-summary.json), le [rapport d'audit](final-audit.json), la [revue visuelle indépendante](peer-visual-review.json) et la [revue des captures du moteur](qa-native/final/visual-review.json) documentent ces résultats. Les captures natives ne représentent pas une campagne Chromium/HTTP/DOM/CSS. La suite Node globale et la suite Python globale n'ont pas été relancées pour cette passe d'images.

Une première construction intermédiaire avait lu le registre avant la fin du dernier import et affichait 174 vues. Elle reste dans `build-sprites.log` comme trace intermédiaire et n'est pas comptée dans la validation finale. Le build final et l'audit exact du manifeste portent bien sur les quatorze imports et sur 175 vues.

## Couverture après intégration

| Indicateur | Ancienne PR, vague 22 | Après reprise de vague 23 | Après vague 24 |
| --- | ---: | ---: | ---: |
| Profils du catalogue | 230 | 230 | 230 |
| Portraits disponibles | 204 | 204 | 204 |
| Vues latérales candidates | 151 | 161 | 175 |
| Anciennes vues à reprendre | 42 | 32 | 18 |
| Images de combat absentes | 37 | 37 | 37 |
| Portraits absents | 26 | 26 | 26 |
| Arènes bitmap actives | 65 | 71 | 71 |
| Clips réellement animés | 6 | 6 | 6 |
| Fidélités 1:1 certifiées | 0 | 0 | 0 |

Les quatorze images de cette passe complètent donc la séparation sélection/combat de profils déjà illustrés. Les six clips animés préexistants restent conservés ; un PNG au repos ne crée pas un nouveau clip animé.

## Fidélité et suites identifiées

Toutes les vues restent des **candidates statiques, `fidelity: unverified`**. Les références guident les proportions, matières, équipements et formes ; les détails occultés et les angles reconstruits ne sont pas certifiés 1:1. Les marges de plusieurs PNG, notamment les deux renards et Oi-omoi, sont plus faibles que les 10 % demandés. Leurs extrémités lisibles restent à l'intérieur du PNG et leur cadrage est contrôlé dans le moteur. Le côté opposé utilise toujours le miroir de présentation existant.

Irohihi garde une posture basse appuyée sur les mains ; le calibrage représente son enveloppe au repos, pas une mesure canonique debout. Shiromuku garde sa forme de base et ses pieds restent couverts par la robe. Bloodsucker conserve son rôle d'obstacle et son exclusion du duel.

Il reste **18 anciennes vues à reprendre**, **26 portraits absents**, **37 images de combat absentes** et **52 arènes sans bitmap actif**, dont 15 bloquées par les références. Les listes exactes sont conservées dans `final-audit.json` et `verification-summary.json`. Plusieurs absences disposent déjà d'un refus de génération ou d'une limite de source documentée. The Collector et Stilledalen Stinger attendent notamment des références suffisamment complètes ; leurs rôles existants restent conservés.

La bible conserve les 66 notices déjà documentées, dont Silent Hill Transmission. Les classeurs historiques restent byte-identiques à la base réconciliée. La PR reste ouverte en brouillon ; aucune fusion ou mise en production n'est incluse dans cette opération.

## Rejouer l’audit depuis un clone neuf

L’audit utilise l’arbre immuable `1fcc00e732178bcf5bd2948da8d2f8a32d6713d1`, rendu accessible par le commit de reprise `4b36a85`, pour les lectures Git de la base. Le SHA de réconciliation locale `54404d2` reste une provenance historique ; il n’est pas nécessaire pour relire cet arbre dans un clone du dépôt. La répétition de ce contrôle est conservée dans `final-audit-tree-replay.json` et ne s’ajoute pas aux 368 contrôles distincts annoncés.
