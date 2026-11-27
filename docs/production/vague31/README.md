# Vague 31 — deux extensions de bible, trois poses et deux arènes

**27 novembre 2026.** Suite de la PR #11, à partir de `f01622bf097fb980f354f7f0fb55df3685f4e92a`.

Le guide général était déjà intégré à la vague 30. Cette livraison ajoute ses deux extensions exactes, met à jour les deux classeurs existants et poursuit la production de visuels fixes. Les nouvelles images restent des **candidates à fidélité non vérifiée**. Aucun nouveau clip animé ou nouveau pouvoir n’est déclaré.

## Bible de combat : trois sources complètes

| Source | Rubriques | Intégration |
| --- | --- | --- |
| `Combat_Games_Guide_General_v1.0.txt` | 00–29, soit 30 | Source historique conservée à l’identique. |
| `Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt` | 30–49, soit 20 | Taunts, entrées/sorties, équipes, relais, assists, duos, clashes, entités, bonus et exploration. |
| `Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt` | 50–67, soit 18 | Découverte, droits, installation, compatibilité, déblocages, collection et soutien. |

Les trois empreintes SHA-256 sont contrôlées par le [générateur](../../../scripts/build-combat-guide.mjs). Les deux nouveaux fichiers restent complets et inchangés dans [source](../../combat-guide/source/). La matrice résolue couvre **68 rubriques**, **445 associations**, **48 fiches concrètes** et les **16 familles de modèles** des extensions.

Les [contrats Silent Hill](../../combat-guide/extensions/README.md) conservent les rôles et éditions des dossiers existants. Les duos sont des compositions de versus, sans alliance canonique présumée. Doll reste un obstacle, Wall Man reste fixé à sa paroi et Twin Pyramid Heads conserve son rôle à plusieurs corps. Aucun personnage absent n’a été ajouté pour remplir un modèle.

L’extension distingue quatre axes indépendants : découverte, droits d’accès, installation et compatibilité de mode. Un asset manquant n’est pas maquillé en contenu verrouillé ou payant. Les règles de soutien sont un **brouillon désactivé**, sans fournisseur, prix ou paiement actif.

**État réel :** 35 rubriques d’extension sont conçues ; trois disposent de bases partielles déjà présentes (taunt, projectile, contrôles d’interface). Les **40 cas de recette fonctionnels restent `not-run`**. Les contrôles documentaires et tests de maintenance ne valident pas un nouveau mode tag, un système d’abonnement ou une campagne bonus implémentée.

Les deux classeurs sont actualisés : [bible du corpus](../SILENT_HILL_CORPUS_BIBLE.xlsx) et [movesets/animations](../SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx). Les rubriques des extensions sont ajoutées sous les tables historiques, sans déplacer les décisions de modules. La [QA des classeurs](../../combat-guide/qa/extensions/README.md) décrit la conservation des cellules, formules et feuilles.

## Sept nouvelles images fixes utilisées par le jeu

| Propriétaire exact | Image / commande | Limite de fidélité |
| --- | --- | --- |
| `sh4_man_with_the_coat_067` — SH4 | `neutralSpecial` : un pistolet pointé, le second tenu bas | Poursuivant au manteau ; aucune nouvelle arme, aucun projectile ajouté à cette image. |
| `sh2_eddie_dombrowski_032` — SH2 original | `neutralSpecial` : visée au revolver | Identité et tenue de l’original ; aucune variante du remake. |
| `sh3_nurse_revolver_044` — SH3 | `neutralLight` : frappe courte avec la crosse | Geste de mêlée uniquement ; aucune pose de tir substituée à une commande conditionnelle. |
| `cedar_grove` — Origins | Fond Female Treatment 2F + rideau alpha | Pièce normale avant miroir ; le reflet verdâtre ne déclenche pas une bascule. |
| `wish_house` — SH4 | Fond intérieur intact + livre fermé alpha | Premier passage de Forest World, avant incendie ; pas de poupée, fosse ou brasier du retour. |

Chaque pose et chaque plan a son propre PNG. Les portraits et poses idle d’origine sont conservés. Les points d’ancrage de Walter et Eddie ont été alignés sur leurs appuis visibles ; les données de collision et les règles de combat sont inchangées. Les [paquets de calibration](characters/) gardent les valeurs précédentes et les nouvelles valeurs.

La première candidate Nurse présentait un voile gris translucide. Elle a été retirée du registre avant publication et remplacée par une reprise imagegen du détourage. La [preuve de reprise](characters/nurse-alpha-cleanup.json) distingue le résultat final du fichier rejeté ; les microtextures ont pu changer, sans revendication de conservation pixel par pixel.

**Raccord visuel encore ouvert :** les captures actives montrent que les effets de projectile préexistants partent sous le canon de Walter et d’Eddie, d’environ 40 et 60 pixels respectivement dans le rendu observé. L’origine générique de ces projectiles reste celle du moteur. Ces poses sont donc intégrées comme candidates, avec ce défaut déclaré ; elles ne sont pas validées comme tirs finalisés. La résolution exigera un raccord source documenté entre pose, point d’émission et géométrie de collision.

Les [sources de décors](stage-candidates/sources.json), [prompts et provenance](stage-candidates/provenance.json) et [mesures alpha](stage-candidates/measurements.json) documentent les captures effectivement inspectées. Les plateformes, builds et réglages de ces captures ne sont pas établis. Les cadrages frontaux et la largeur du sol sont des adaptations au versus.

Wish House était bloqué faute de choix entre première et seconde visite. Sa scène est maintenant explicitement `sh4-first-visit-scripture-corner`. Les quatre propositions historiques du second passage restent conservées et désactivées dans cette scène. Les deux nouvelles arènes n’accordent ni événement, ni danger, ni appui de plafond ou Dénouement automatique.

L’ancien prototype de reflet Cedar, masqué par le nouveau fond fixe, n’est plus compté comme joué. Sa proposition reste consultable en attente ; les pistes globales passent de 163 à 162, sans perte de l’historique.

## Couverture après livraison

| Indicateur | Avant | Après |
| --- | ---: | ---: |
| Rubriques du guide et des extensions | 30 | 68 |
| Associations documentaires | 445 | 445 |
| Portraits candidats | 204 / 230 | 204 / 230 |
| Bases latérales candidates | 190 / 230 | 190 / 230 |
| Arènes avec bitmap candidat | 93 / 123 | 95 / 123 |
| PNG de décor dans les manifestes | 184 | 188 |
| Commandes projectile actives avec bitmap | 31 / 86 | 31 / 86 |
| Histoires individuelles illustrées | 1 / 230 | 1 / 230 |
| Clips animés historiques déclarés | 6 | 6 |
| Nouvelles images fixes du lot | — | 7 |
| Nouvelle animation du lot | — | 0 |

L’[inventaire recalculable](inventory.json) donne les IDs manquants et contrôle la conservation des assets historiques. Les trois nouvelles poses complètent des profils déjà équipés ; elles n’augmentent donc pas le nombre de bases latérales. Les catégories de manque se recoupent et ne doivent pas être additionnées en un total d’images à produire.

## Validation et portée

- Les audits existants décodent les vrais PNG, contrôlent leurs empreintes, dimensions, propriétaires, poses et entrées de cache.
- Les tests de scène vérifient les phases, le refus d’une autre édition ou d’une autre visite, les dangers interdits et les anciennes pistes masquées.
- La [QA native](qa-native/) utilise le vrai `FightEngine` et Canvas natif, avec les chemins d’entrée existants. Les captures d’action et de retour idle doivent être lues comme des contrôles de rendu et de placement, sans certification d’animation source.
- La [tentative de navigateur locale](qa-http/launch-attempt.json) s’est arrêtée avant création d’une page : le wrapper Chromium existe, son exécutable est absent. Elle n’est pas un test HTTP réussi. Les scénarios HTTP des [personnages](characters/qa-http.mjs) et des [arènes](stages/qa-http.mjs) sont raccordés à la CI.
- Les [preuves des classeurs](../../combat-guide/qa/extensions/README.md) couvrent leur structure, leurs associations et la conservation de l’existant.

Le [bilan final](qa/validation.json) consigne **1 325 tests Node réussis**, **270 contrôles natifs réussis** et **11 tests Python de maintenance réussis**. Le build vérifié contient 808 fichiers. Les deux défauts de raccord de tir restent ouverts malgré ces passages techniques. Une preuve d’une ancienne vague n’est pas présentée comme une exécution sur ce lot.
