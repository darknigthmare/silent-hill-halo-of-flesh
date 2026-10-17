# Séquences de présentation — continuation du 17 octobre 2026

PR #4, branche `feat/bitmap-sprites-v091`, version `0.9.5`.
Cette passe intègre les séquences préparées dans le classeur au moteur, au lecteur
de sprites et à l’atelier. Elle ne livre aucune image supplémentaire et ne certifie
pas la fidélité d’un clip par l’existence de son point d’intégration.

## Les huit pistes disponibles

| Clé du clip | Moment et comportement |
| --- | --- |
| `intro` | Entrée du premier round ou d’une nouvelle tentative. Pas de répétition à chaque manche. |
| `winRound` | Victoire d’une manche non décisive ; transition réversible vers la reprise. |
| `loseRound` | Défaite non décisive ; également utilisée pour les deux acteurs d’une égalité, avec le rôle `draw`. |
| `winMatch` | Victoire finale, après le finisher si celui-ci a eu lieu. |
| `loseMatch` | Défaite finale sans finisher. Après un finisher, la cible conserve la fin de `finished`. |
| `outro` | Sortie du vainqueur ; le panneau de résultat attend un clip effectivement importé. |
| `finisher` | Piste de l’attaquant synchronisée avec la séquence de finisher. |
| `finished` | Piste de la cible ; sa dernière image reste tenue après la séquence. |

Les 30 clés antérieures gardent leur ordre : dix poses de base, vingt attaques,
puis ces huit clés. Les outils Python et JavaScript utilisent le même contrat de
38 poses. Dans le catalogue, `winRound1` et `loseRound1` restent les identifiants
de production de la première manche et ciblent respectivement `winRound` et
`loseRound` dans le moteur. L’attitude libre `taunt` reste à intégrer.

## Horloge, interruptions et durée

Chaque acteur reçoit une présentation identifiée, avec une clé, une frame de
simulation, une durée, la durée du clip importé, la progression, l’état de fin,
le rôle et le contexte de manche. Les pistes d’une scène partagent un identifiant
de séquence. Le lecteur échantillonne cette frame ; plusieurs rendus ne font pas
avancer l’animation plusieurs fois. La pause fige l’ensemble.

Les durées sont exprimées en ticks de simulation à 60 Hz. Elles conservent les
minimums du jeu et s’étendent si un clip importé dure davantage. Elles ne sont
pas présentées comme une mesure officielle des jeux de référence. Les attaques,
leurs dégâts et leurs timings de combat ne sont pas modifiés par ces pistes.

Le moteur efface les présentations lors de la reprise du combat, d’une nouvelle
tentative ou de sa destruction. Les résultats et statistiques sont enregistrés
au moment de la fin du match. Le voile Canvas et le panneau HTML attendent ensuite
la fin de l’outro importée ; une attente basée sur l’horloge réelle ne peut pas
la sauter pendant la pause. Sans clip importé, le comportement de résultat
habituel reste disponible.

Une perte de focus, un onglet masqué, Start ou la déconnexion d’une manette
suspendent aussi une outro active. Le retour de focus ou la reconnexion ne
relancent pas automatiquement la scène. Le dialogue explique que le résultat
est déjà enregistré. Le RESET du dojo crée une nouvelle tentative, conserve
ses options et les commandes remappées, et invalide le résultat différé de
l’ancien moteur. Une ancienne outro ne peut donc plus afficher son résultat
sur le nouveau combat.

Les identifiants du finisher et de l’arène sont transmis aux pistes. Les huit
clés sont actuellement communes à chaque profil : le montage distinct de chaque
finisher, les accessoires autonomes, les pistes de caméra et de son et les
animations bitmap du décor restent des travaux de production.

## Atelier et import

L’inspecteur et l’éditeur présentent les huit clés, leur état réel et la lecture
unique. La prévisualisation et l’export refusent un montage de présentation qui
ne contient que l’image idle, une boucle, une identité incorrecte ou des images
qui ne correspondent plus au paquet source. Les importeurs conservent les
contrôles d’identité, de hash, de pixels et de montage précédent.

Une piste absente est signalée comme telle. Le rendu peut conserver le repli
idle du prototype, sans l’annoncer comme une animation disponible. Le rapport
de couverture expose séparément les présentations présentes, manquantes et
animées pour chaque profil. Les deux nouveaux modules font partie du cache
hors ligne.

## Mouvements réduits dans les arènes

Les compositions décoratives utilisent maintenant une position et une progression
stables lorsque les mouvements réduits sont activés. Les fondus d’apparition et
de disparition restent liés à l’événement. Les 22 familles ont été contrôlées ;
19 présentaient auparavant encore un déplacement décoratif dans ce mode.

Les dangers physiques, leurs avertissements, leurs trajectoires et leurs zones
de collision continuent à suivre la simulation. Le changement ne remplace pas
un danger mobile par une indication immobile. Les tests couvrent notamment
29 géométries de danger et les directions des trains et des brancards.

## Classeur et suivi de production

Le classeur conserve ses 11 onglets et ses 12 690 lignes de données, les sources,
les propositions, les styles et les champs de travail. Deux actions globales
sont actualisées : les poses réversibles de manche sont intégrées ; les pistes
de cinématique sont en cours, avec leur montage spécialisé restant à produire.
Sur 875 actions, 874 restent ouvertes, dont 127 de priorité P0.

Le suivi distingue les huit points d’intégration du moteur des images livrées :
**2 PNG candidats, 0 clip animé et 0 fidélité 1:1 certifiée**. Les 4 600 mouvements,
460 supers, 583 entrées de finisher et 1 610 présentations restent inventoriés.
Les supers sont inclus dans les 4 600 mouvements, pas ajoutés à ce total.

`scripts/update-production-workbook.mjs` importe le classeur existant et modifie
uniquement les cellules de suivi concernées. Les formules sont recalculées et
un changement temporaire de statut est exercé puis restauré. Le vérificateur
en lecture seule peut comparer toutes les cellules au classeur source avec
`--compare-source` et `--change-log` : il contrôle les valeurs non concernées,
les formules, les styles, les tableaux et les propriétés natives des feuilles.
Les rapports courants se trouvent dans `docs/production/`.

## Vérification et limites

- `npm test` : **471 tests Node réussis**, avec construction du jeu et contrôle des modules et documents HTML.
- `python3 -m unittest discover -s tests -p 'test_*.py' -v` : **76 tests Python réussis**.
- `scripts/http-qa-presentations.mjs` : **52 contrôles HTTP réussis**, aucune erreur JavaScript et six captures ; séquences, atelier mobile, pause, RESET dojo et cache hors ligne.
- `npm run qa:browser` : **202 contrôles réussis dans sept suites**, 35 captures et aucune erreur JavaScript ; cette suite complète est aussi appelée par le workflow `browser-qa.yml`.

Les tests de KO utilisent des états préparés pour exercer les transitions. Les
clips de test prolongés emploient temporairement des métadonnées sur une image
existante, puis restaurent le registre à l’identique. Ils ne créent pas d’art,
ne constituent pas des campagnes jouées intégralement et ne prouvent pas une
fidélité visuelle image par image. Les captures et rapports HTTP sont conservés
comme artefacts de QA, hors des fichiers livrés au jeu.

Le premier passage de la suite historique a révélé un ancien test de checkpoint
qui appelait directement le résultat alors que le moteur était encore en combat.
Les fixtures de checkpoint, de récupération et des Rites passent désormais par
un KO décisif préparé puis par les ticks et callbacks réels de fin de match.
Les protections de l’interface sont conservées ; aucun contrôle historique
n’est supprimé pour faire passer la suite.
