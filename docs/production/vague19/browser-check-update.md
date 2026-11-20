# Adapter la QA historique à une marche réellement livrée

Le harness partagé `scripts/http-qa-art144.mjs`, également utilisé par ART92,
vérifiait que toute demande de marche retombait sur un idle statique absent.
Cette attente était devenue fausse pour Scarlet doll, dont la vague 18 livre
le cycle `[0, 1, 2, 1]`, huit ticks par étape. Les 52 candidats ART144 et les
15 autres candidats ART92 n'ont toujours pas de marche importée.

## Comportement contrôlé

- Marche absente : demande `walk`, rendu `idle`, bouton de lecture désactivé
  et mention « À PRODUIRE », comme auparavant.
- Marche présente : taille et SHA-256 des PNG obtenus par HTTP, attributs
  réels de l'inspecteur, bornes de la timeline, état du bouton de lecture et
  statut du clip importé.
- Scrub : début et fin de chaque étape via le gestionnaire réel du contrôle,
  avec vérification de l'image rendue, du cadrage et du texte de progression.
- Lecture : clic sur LIRE, observation des attributs exposés par l'interface,
  contrôle de chaque image, de sa correspondance aux durées déclarées et du
  bouclage ou de l'arrêt. Aucun acteur, état moteur ou horloge injectés.
- Retour à idle, image zéro et tick zéro avant la vérification des portraits,
  liens et rôles historiques.

Le rapport distingue ces extensions dans `laterClipExtensions`. Aucun intake,
fragment, refus, compte historique ni `newAnimatedClips` original n'est réécrit.

## Validation locale et portée

La syntaxe du harness est valide. Les tests `art-campaign-review`,
`art-campaign-tracking` et `sprite-clips` passent **108 tests**
([log](browser-qa-regression-tests.txt)). Le sampler de Scarlet associe les
ticks `[0,7,8,15,16,23,24,31]` aux images `[0,0,1,1,2,2,1,1]`, et boucle au
tick 32.

Ces vérifications ne sont pas une exécution de Chromium. Les nouvelles
assertions HTTP/UI doivent réussir dans la campagne GitHub Actions du commit
publié. Le code de production, les assets et les workflows sont inchangés
par ce correctif du harness.
