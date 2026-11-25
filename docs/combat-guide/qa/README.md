# Vérification du guide de combat intégré

Contrôle du 25 novembre 2026. La référence d’inventaire est le commit
`ce3c73f8e1fcaae515053dbca9458a3f5d9c0219` du projet Silent Hill: Halo of Flesh.

## Périmètre livré

Le [chapitre d’intégration](../../COMBAT_GAMES_GUIDE_INTEGRATION.md) adapte les
30 rubriques du guide fourni et précise dix décisions sur les modules. La
[matrice](../MATRICE.md), les [associations](../associations.json) et
l’[état calculé](../ETAT_DES_LIEUX.md) relient les exigences au contenu existant.
La [conception narrative](../CAMPAGNE_ET_DENOUEMENTS.md) et les
[modèles de fiches](../FICHES_ET_VALIDATION.md) définissent les travaux suivants.
Les deux classeurs existants reçoivent les mêmes onglets documentaires.

Le fichier source est conservé sans modification. Son empreinte SHA-256 est :

```text
4844584616072ac0d52d37c2fab4365e1ec489240f17a721ee216e223b0355b7
```

## Associations et génération

| Contrôle | Résultat |
| --- | --- |
| Couverture du guide | 30 rubriques ordonnées de 00 à 29 ; 10 décisions de modules. |
| Associations | 442 entrées : 230 profils, 123 arènes, 15 Chroniques, 66 notices de corpus, 8 projectiles. |
| Provenance | Empreintes de 22 fichiers du catalogue, des politiques et des manifestes. |
| Images référencées | 686 chemins uniques présents dans l’index Git ou le checkout. Aucun décodage d’image dans ce contrôle. |
| Reproductibilité | Les quatre sorties du générateur correspondent aux sources présentes. |
| Tests ciblés Node | 7 tests réussis ; voir le [journal](guide-tests.txt). |

Les tests contrôlent notamment les profils hors duel, les propriétaires de
projectiles, les rivaux, la distinction entre libellé de variante et ID,
l’agrégation du groupe `film`, le récit individuel de Lisa et sa Chronique,
ainsi que la séparation entre bascule Otherworld et connexion entre arènes.
Des données volontairement incohérentes doivent être rejetées.

Commandes de contrôle :

```sh
npm run bible:check
node --test tests/combat-guide.test.mjs
git diff --check
```

## Classeurs

Le [rapport de vérification des classeurs](WORKBOOK_QA.md) détaille la
conservation des treize anciennes feuilles et des 87 formules historiques,
les rendus avant/après et les vérifications des nouveaux onglets.
La concordance au JSON final couvre 3 484 cellules de contenu et douze caches
de formules par classeur. Les onze tests Python ciblés de maintenance passent.

## Portée des résultats

Cette livraison modifie la bible, les deux classeurs et leurs outils de
maintenance. Les fichiers du moteur, les catalogues de contenu et les assets
du jeu sont conservés. Elle ne produit aucun sprite ni aucune animation.

La campagne, les scènes illustrées, les profils de règles et les connexions
d’arènes proposés restent des éléments de conception. Les nombres d’actions
activées ou de visuels candidats décrivent l’état inspecté ; ils ne certifient
ni une fidélité 1:1 ni une nouvelle recette jouée. Les tests ciblés et les
rendus de classeurs ne remplacent pas les tests du jeu, une revue des images
ou une ouverture dans Excel de bureau.

Les anciens rapports et synthèses conservent leur date. Les informations de
publication sont consignées séparément dans la PR, après le transfert du commit.
