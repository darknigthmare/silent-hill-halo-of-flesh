# Vérifications finales — vague 29

Résultat après correction des descripteurs de plafond : **74/74 tests Node ciblés réussis**, trois nouvelles QA natives réussies et inventaire final recalculé puis contrôlé sans écart. La vérification d’intégrité conserve le commit de référence `2af87b6a1a8740a0759ce7c8c2746be19c48f4af`.

## Intégrité et régressions

| Contrôle | Résultat | Preuve |
| --- | --- | --- |
| Fichiers protégés, dont les classeurs | 17/17 identiques au commit de base | `integrity.json` |
| Assets du commit de base | 695/695 identiques, aucune absence ni modification | `integrity.json` |
| Nouvelle exécution des tests Node ciblés | 74 réussis, 0 échec, 0 ignoré | `node-targeted-final-tests.txt` |
| Inventaire final `--check` | Code de sortie 0, rapports identiques au recalcul | `final-inventory.json` / `.md` |
| Références d’assets manquantes | 0 | Inventaire final |
| Rapports dérivés incohérents | 0 | Inventaire final |
| Empreintes des sources des QA finales et de l’inventaire | 46/46 fichiers cohérents avec l’état courant | `final-verification.json` |

L’intégrité compare le hash de chaque blob Git du commit de base au hash recalculé sur les octets actuels du fichier. Les 17 chemins protégés proviennent de `docs/production/vague28/baseline.json`. Les 695 fichiers d’origine sont énumérés dans l’arbre Git du commit de base ; le contrôle ne se limite pas aux images actives. Cette preuve d’intégrité précède la correction des seuls descripteurs de plafond, qui ne modifie aucun de ces fichiers protégés ni les PNG.

Commande Node relancée avec v24.22.3 :

```sh
node --test --test-concurrency=2 tests/stage-bitmaps.test.mjs tests/projectile-bitmaps.test.mjs tests/sprites.test.mjs tests/native-attack-budget.test.mjs tests/completed-result-retirement.test.mjs
```

Les tests couvrent les images et métadonnées réelles, les décors et projectiles sélectionnés par le renderer, le chargement préalable, les leases et plafonds des caches, les budgets d’attaque et le retrait des ressources de combats terminés. Aucun build `dist` supplémentaire n’a été exécuté pour cette vérification.

## Plafonds : risque concret corrigé

Les descripteurs intermédiaires `geometry.ceiling=true` de `book_light` et `book_steel` auraient autorisé **24 plans contextuels supplémentaires** par rapport au commit de base. La valeur finale est `false` pour ces deux scènes, avec une note distinguant plafond visuel et appui utilisable.

La preuve `ceiling-eligibility-review.json` exerce l’API réelle `loreFinisher` : **180 appels** pour comparer trois états sur **12 définitions et 5 scènes**. Les **60 plans de l’état corrigé sont tous identiques à la baseline**, y compris autorisation, raison de blocage, durée et étapes. Cette vérification utilise une cible debout compatible ; elle ne couvre pas toutes les anatomies de cible. Aucun PNG ni code d’attaque ou de rendu n’a été modifié par cette correction.

## QA moteur native finale

| Lot | Contrôles réussis | Scènes | Captures | Rapport final |
| --- | --- | --- | --- | --- |
| Hôpital Arcade | 47 | 1 | 1 | `qa-final-hospital/report.json` |
| Light, Steel, Midwich film, église film | 140 | 4 | 4 | `qa-final-stages/report.json` |
| Floatstinger, Asphyxia, Immolator, deux orientations | 205 | 6 | 12 | `qa-final-projectiles/report.json` |

Les trois exécutions finales totalisent **392 contrôles réussis, 11 scènes et 17 captures**, sans erreur. Leurs empreintes avant/après correspondent aux sources gelées actuelles ; le manifeste décor corrigé a pour SHA256 `cdd9a0722d57d93a0842508d544348c076385d0efba4a7d6a1edb78103388686`.

Les projectiles sont déclenchés par les callbacks de saisie et les bindings réels des acteurs. Aucun état d’acteur ou de projectile n’est injecté. Il s’agit du moteur avec Canvas natif ; le harnais de décors porte encore son nom de vague 28 parce qu’il est réutilisé avec les IDs de cette livraison. Les dossiers `qa-native-*` et le premier journal `node-targeted-tests.txt` restent conservés comme preuves historiques antérieures à la correction.

Le smoke HTTP antérieur a validé le démarrage du serveur, puis s’est arrêté au lancement de Chromium absent : **0 capture navigateur**, aucune nouvelle image validée dans un navigateur local. La QA native ne vaut pas test de DOM, de service worker ou de cache navigateur.

## Inventaire après intégration

Le nouveau recalcul confirme **90/123 décors actifs**, **178 plans enregistrés**, **8 images dédiées de projectile** couvrant **24/86 commandes**, sur **8/31 profils**. Depuis le relevé initial : +5 décors, +10 plans, +3 images de projectile et +10 commandes illustrées. Portraits, sprites de base et clips animés n’ont pas augmenté.

Treize fichiers référencés sont **absents du commit de base inspecté** et présents dans le checkout audité. Cette formulation ne présume pas leur statut de publication ultérieur. Le détail par catégorie et par œuvre reste dans `final-inventory.md` ; les données, limites et empreintes actualisées des preuves figurent dans `final-verification.json`.

```sh
node docs/production/vague29/build-inventory.mjs --output-prefix final-inventory
node docs/production/vague29/build-inventory.mjs --output-prefix final-inventory --check
```

Les résultats attestent l’intégration et les contrôles décrits. Les images restent des candidats statiques ; aucune animation supplémentaire ni fidélité 1:1 certifiée n’est déduite de ces tests.
