# Vague 23 — six vues de personnages

Six PNG natifs sont proposés dans `delivery.json` : quatre vues latérales statiques pour les combattants BoM existants et deux vues de colonies SH4 pour l’atelier. Le statut reste `side-view-candidate`, fidélité non certifiée. Aucune animation, portrait de sélection, nouvelle attaque ou activation de duel n’est livrée.

**Après import : la QA native est maintenant terminée.** Les six processus réussissent, les 34 captures ont été inspectées et aucune correction d’ancre ou de PNG n’est demandée dans le périmètre testé. Voir [NATIVE_QA.md](NATIVE_QA.md) et `native-visual-review.json` pour les huit duels, quatre aperçus d’atelier, contrôles et limites. Les mentions de QA « à effectuer » ci-dessous et dans le delivery gelé décrivent l’état de la remise d’art avant cette exécution ; le delivery n’a pas été réécrit.

Le fichier d’import a été gelé avant remise au parent :

`b3f63409b2dadf326033ddb62fb6f4c8e42289d780f1694c1ac38b10208bbe6c` — 51 490 octets.

## Candidats retenus

| Profil | Édition de référence | Dimensions natives | Usage existant | Observation principale |
| --- | --- | --- | --- | --- |
| `bom_wood_sapling_139` | Book of Memories, PS Vita, 2012 | 1199 × 1312 | Combat, candidat statique | Petit rejeton de bois entier, tête et branches tournées vers la droite, deux appuis effilés. |
| `bom_tremer_133` | Book of Memories, PS Vita, 2012 | 1774 × 887 | Combat, candidat statique | Organisme horizontal sans membres, grande partie pâle vers la droite et pointe brune derrière. |
| `bom_raw_shock_148` | Book of Memories — Expansion Pack, PS Vita, 2013 | 1199 × 1312 | Combat, candidat statique | Forme révélée mince, tête ovoïde, longs bras, deux pieds entiers, profil droit. |
| `bom_gray_child_147` | Book of Memories — Expansion Pack, PS Vita, 2013 | 1536 × 1024 | Combat, candidat statique | Petit corps non humain, grande tête plissée, bras longs, couteau court tenu bas, orientation droite. |
| `sh4_toadstool_061` | Silent Hill 4, édition originale, 2004 | 1031 × 1525 | Atelier, obstacle hors duel | Une colonie à tiges sombres et grosses pointes mouchetées ; attache basale et pointes complètes. |
| `sh4_whitestool_062` | Silent Hill 4, édition originale, 2004 | 1040 × 1512 | Atelier, obstacle hors duel | Une colonie de fins brins ivoire sur une base commune, extrémités entières. |

Les six originaux totalisent **5 305 819 octets**. Les ancres proposées suivent les appuis visibles ; la hauteur de référence correspond aux bornes alpha ≥ 32. Ces paramètres ne sont pas des mesures extraites des jeux d’origine et restent à vérifier dans le moteur.

## Sources et limites

Les dix images effectivement fournies aux générations sont inscrites par candidat dans `selected[].references`, avec URL, chemin relatif au dépôt, taille et SHA256. Les quinze références consultées figurent dans `reference-catalog.json`.

Pour Wood Sapling, le portrait du bestiaire est complété par la capture retail du 23 octobre 2012 déjà archivée dans `docs/production/wave4-references/wood/`. Les petites créatures à droite et en bas à droite servent de référence entière. Le grand Wood Guardian central n’est pas la cible. Deux autres captures du boss ont été consultées mais exclues des entrées de génération.

Pour Raw Shock, la carte du bestiaire et la capture retail 34 montrent la forme révélée. Les captures 27 et 28, où apparaît aussi le déguisement humain, ont été consultées mais exclues des entrées. Gray Child utilise sa propre carte et les captures 29 et 30. Aucune variante visuelle d’un autre jeu n’a servi de substitut.

Tremer ne dispose ici que d’une carte de bestiaire 127 × 127 en vue oblique. Les arts de créature Toadstool et Whitestool mesurent respectivement 169 × 250 et 165 × 240. Ces sources fixent les silhouettes et les matériaux, mais pas le profil exact ni tous les détails. Rotation, pose, raccords de volumes, doigts, ramifications et microtextures sont donc explicitement des reconstructions. Aucun résultat n’est certifié 1:1.

## Contrôles réalisés

Les références et chaque sortie ont été inspectées visuellement. `native-png-audit.json` contient le résultat en lecture seule de `scripts/import-sprite.py::inspect_image`, les bornes aux seuils alpha 1/8/16/32/128/254/255 et les empreintes des fichiers.

Les six candidats passent les exigences de format, dimensions, alpha et marge de l’importeur officiel. Les bornes lisibles alpha ≥ 32 restent à l’intérieur des canevas. Leurs marges minimales mesurées vont de **7,85 % à 21,25 %** ; les marges demandées dans les prompts ne sont donc pas simplement présumées acquises. L’alpha du Gray Child culmine à 254 ; il n’a pas été normalisé.

Les fichiers `qa/*.png` sont des composites de revue sur noir, gris et blanc cassé, avec une grande vue et une petite vue dans une boîte maximale de 340 × 120 px. `render-qa.mjs` ne modifie jamais les PNG sources. Les silhouettes sont entières, les espaces entre les membres ou les tiges restent lisibles et aucun fond opaque continu n’est visible dans ces composites.

Des franges colorées ponctuelles et une apparence d’auréole ont été perçues dans les aperçus natifs sur transparence, notamment pour Tremer, les colonies et Gray Child. Les compositions sur trois fonds ne reproduisent pas de large halo lisible. Le bruit d’alpha très faible mesuré hors des silhouettes est conservé. La revue à taille réelle dans le moteur reste une étape distincte du parent ; le présent dossier ne prétend pas l’avoir effectuée.

Les six fichiers sélectionnés ont été comparés par SHA256 à leurs sorties natives de génération. Aucun redimensionnement, recadrage, nettoyage d’alpha ou autre traitement de pixels n’a été appliqué. Les PNG et les références sont physiquement présents dans ce dossier ; les aperçus de conversation ne sont pas la seule copie livrée.

## Variante écartée

Une correction de détourage de Whitestool a été tentée avec l’outil de génération après un aperçu natif ambigu. Elle est conservée dans `variants/sh4_whitestool_062-alpha-repair1.png`, avec son prompt exact et sa revue. Elle modifie légèrement les pointes et ne démontre pas de bénéfice clair sur les composites. L’original est donc retenu dans `selected[]` et la variante porte `integrate:false`.

Le lot comprend **sept appels de génération au total** : six originaux et cette unique édition. Chaque appel produit un seul asset. Aucun générateur en ligne de commande ni script Python de création ou de retouche d’image n’a été utilisé.

## Cibles différées

- `origins_remnant_077` : la capture inspectée 200 × 272 montre surtout la pièce et l’ombre ; la cage flottante est trop petite pour établir ses barres, son volume entier et son lien visuel avec l’ombre. Aucune génération ni corps de substitution.
- `sh1_bloodsucker` : le lot s’arrête aux six références exploitées. Aucune nouvelle référence entière de ses trois tubes et de leur attache n’a été inspectée ici. Son rôle hors duel reste inchangé.

## Fichiers de remise

- `delivery.json` : contrat d’import compatible avec la vague 22, six `selected[]`, deux cibles différées et une variante non intégrable.
- `png/` : six fichiers natifs retenus ; `variants/` : édition conservée pour traçabilité.
- `prompts-first.json`, `prompts-second.json`, `prompts-third.json`, `prompt-whitestool-alpha-repair.json` : prompts exacts.
- `reference-catalog.json`, `references/` : sources consultées et empreintes.
- `native-png-audit.json` : contrôle natif en lecture seule ; `visual-review.json`, `qa/` : observations et compositions inspectées.
- `build-delivery.mjs` : assembleur documentaire ; ne pas relancer après gel sans recalculer et communiquer l’empreinte du delivery.

L’agent de ce sous-lot a écrit uniquement sous `docs/production/vague23/characters/`. L’intégration centrale, la conservation effective des portraits/clips, le contrôle Canvas et la publication relèvent du parent. Aucun commit ou push n’a été effectué par cet agent.
