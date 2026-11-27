# Lying Figure — quatre poses intégrées, SH2 original

Ce sous-lot apporte quatre des huit poses fixes intégrées en vague 33. Les propriétaires restent distincts : `sh2_lying_figure_020` debout et `sh2_lying_figure_crawling_021` rampant, tous deux rattachés à **Silent Hill 2 original (2001)**. Chacun dispose des nouvelles poses `walk` et `neutralLight`. Les PNG sélectionnés sont indépendants, avec un seul sujet, sans découpe de planche ni modification de leurs pixels après génération.

Les références du jeu original et les images déjà attribuées à chaque propriétaire servent à la continuité. Le remake est exclu. Le torse conserve ses bras enfermés ; les membres inférieurs restent complets. Les figures rampantes regardent nativement à gauche, les figures debout à droite. Le miroir du moteur reste une adaptation de présentation.

## Sélection et mesures

Les compositions alpha initiales ont été relues sur blanc et bleu gris avec un décodeur natif. Les deux essais supplémentaires de détourage des figures debout ne sont pas retenus : les originaux présentent déjà une découpe propre et les essais modifient leur texture. [candidates.json](candidates.json) conserve les essais ; [provenance.json](provenance.json) précise la sélection.

[import-plan.json](import-plan.json) décrit les chemins actifs, dimensions, empreintes, indices et calibrations courantes. `pixelSHA256` suit le protocole canonique de l’importeur, avec RGB neutralisé sous alpha nul ; `transparentFraction` compte alpha < 16 et les appuis utilisent alpha ≥ 32. Ces métriques sont distinctes de l’empreinte des octets du PNG. [baseline-owners.json](baseline-owners.json) conserve l’état antérieur.

## Calibration des deux formes

Pour les nouvelles figures debout, `bodyHeight: 0.6266666666666666` compense le passage à un canevas haut de 1536 pixels : `1536 × bodyHeight = 1024 × 0.94`. Le facteur monde/pixel de l’ancienne frame est donc conservé. Cette relation de rendu ne mesure pas la taille du modèle original.

Pour le rampant, les **trois frames**, y compris l’ancien idle, utilisent désormais **`bodyHeight: 2.94` et `anchorX: 0.4`**. La hauteur de référence debout équivalente peut dépasser celle d’un canevas très horizontal de **2172 × 724**. Passer de `0.98` à `2.94` divise le facteur monde/pixel par trois ; cela corrige la présentation du dessin sans agrandir la portée de l’attaque.

| Frame rampante | Appui vertical dans le PNG | `anchorY` |
|---|---|---|
| `idle`, indice 0 | y = 611 sur 724 | `611/724` |
| `walk`, indice 1 | y = 563 sur 724 | `563/724` |
| `neutralLight`, indice 2 | y = 609 sur 724 | `609/724` |

La [fiche de calibration](../crawling-calibration.json) décrit cette correction des trois frames et ses limites. Les appuis proviennent des PNG candidats ; aucune dimension source 1:1 n’est mesurée. Les octets des images, portraits et clips historiques sont conservés.

## Commande courte du rampant

La commande existante `neutralLight` passe de **médiane à basse** pour correspondre au front proche du sol. Le [contrôle des profils](../combat-profile-preservation.json) compare les **230 profils** : **229 restent identiques**, et seules les deux représentations du champ `neutralLight.level` changent pour le rampant. Sa portée **55**, ses dégâts **31** et ses durées **5 / 3 / 9** restent inchangés. Aucune nouvelle commande, dimension corporelle physique ou enveloppe de collision n’est introduite par cette calibration.

## Limites

**Quatre nouvelles poses fixes ; fidélité `unverified` ; aucune animation ajoutée.** Les gestes d’impact restent des adaptations versus et ne reconstituent pas une séquence chronométrée du jeu original. Les [poses en jeu](../qa/characters/report.json), le [front dans HITBOXES](../qa/crawling-contact/report.json) et les [six cas de touche/garde](../qa/crawling-combat/report.json) sont désormais vérifiés, avec captures inspectées. La comparaison complète avec le jeu source, l’échelle 1:1 et la face opposée restent non vérifiées.
