# Vague 29 — projectiles statiques

Trois PNG indépendants sont livrés pour **10 slots de mouvements existants**. Tous restent des **candidats à fidélité non vérifiée**. Ils sont destinés à l’intégration par le responsable de la vague 29.

| Effet | Édition | Slots existants couverts | PNG natif | Octets |
| --- | --- | ---: | --- | ---: |
| Nuage acide de Floatstinger | Silent Hill (1999) | 4 | 1536 × 1024 RGBA | 1 517 372 |
| Jet toxique d’Asphyxia | Silent Hill Homecoming | 3 | 1536 × 1024 RGBA | 1 237 462 |
| Jet de feu de l’Immolator | Silent Hill: Ascension | 3 | 1536 × 1024 RGBA | 1 168 665 |
| **Total** | **3 effets** | **10** | **3 PNG statiques** | **3 923 499** |

## Livraison et vérification

- `integration-delivery.json` suit le format de la vague 28 : descripteurs, routes exactes, présentations, chemins et SHA-256.
- `generated-files.json` conserve les chemins natifs de l’outil intégré ImageGen et les reçus de copie.
- `raster-audit.json` confirme PNG, alpha, image non animée, dimensions, bornes visibles, empreinte des pixels et copie strictement identique au fichier natif.
- `research.json` donne les sources, les observations, les limites et les candidats écartés.
- `references/files.json` inventorie les fichiers de référence conservés, leur taille et leur SHA-256.
- `prompts/` contient les trois prompts complets ; aucun CLI ou appel API externe de génération n’a été utilisé.

Le contrôle se reproduit depuis la racine du dépôt :

```sh
node docs/production/vague29/projectiles/build-delivery.mjs
```

Ce script écrit uniquement les reçus de ce dossier. Il valide les trois descripteurs avec le registre courant sans modifier le manifeste. Le contrôle de copie native est effectué si les fichiers natifs de cette session sont encore accessibles.

## Éléments réellement observés

**Floatstinger.** Le [GIF de gameplay](https://tenor.com/view/wrong-sulfuric-acid-silent-hill-floatstinger-harry-mason-cheryl-gif-13060428206898343756) montre un effet diffus olive/vert-jaune/brun sous Floatstinger. Le GIF fait 498 × 370 pixels et comporte une légende ajoutée. Cette légende n’établit aucune chimie exacte et n’est pas reprise dans l’image générée. L’apparence correspond au premier Silent Hill ; le matériel, la région et la provenance de la capture originale ne sont pas certifiés. Les images 10 et 15 ont servi de références.

**Asphyxia.** Les aperçus du [combat de Silent Hill Homecoming](https://www.youtube.com/watch?v=EgTIE8Aa0ts), vers 03:15 et 03:50, montrent une émission sombre, irrégulière et déchirée. Le PNG traduit cette matière en plume noire/brune. Les références sont des aperçus publics natifs de 320 × 180 pixels, échantillonnés toutes les cinq secondes. La densité, le volume étendu et les volutes détaillées du PNG sont une interprétation, et non une restitution certifiée du contour original.

**Immolator.** La [scène officielle Genvid UNBLINKING, diffusée le 24 janvier 2024](https://www.youtube.com/watch?v=LyuHnMZpFLE), montre un jet de flammes jaune-orange, accompagné de fumée orangée/brune. Les aperçus vers 01:46 et 01:48 montrent respectivement un mince jet presque horizontal et une émission diagonale. Les images sources font 320 × 180 pixels ; l’échantillonnage est de deux secondes. La composition horizontale indépendante, le volume et le détail du PNG restent des adaptations pour le rendu versus.

Les temps indiqués sont les positions approximatives des aperçus publics. Ils ne mesurent ni les timings de combat ni les phases d’animation.

## Contraintes respectées et limites

Chaque fichier provient d’un appel distinct à l’outil intégré ImageGen, avec transparence demandée. Les trois PNG sont copiés **octet pour octet** vers `assets/projectiles/`. Aucun redimensionnement, détourage, assemblage ou retouche de leurs pixels n’a été effectué. Les extractions et recadrages ne concernent que les références sources.

Les dimensions natives livrées sont de **1536 × 1024** ; aucune résolution supérieure n’est revendiquée. Les images contiennent de très faibles valeurs alpha isolées en marge. Le validateur existant retrouve les bornes utiles de l’effet par composante connexe ; ces bornes sont celles du descripteur, sans modification du PNG.

Floatstinger et Asphyxia utilisent `source-over` ; le feu de l’Immolator utilise `screen`, conformément au caractère lumineux de l’effet. Tous restent ancrés au centre du projectile existant et orientés vers la droite dans le fichier. Les règles de collision, dégâts, trajets et timing sont hors de cette livraison.

Twinfeeler et le Straight-Jacket d’Origins ont été recherchés, mais les captures inspectées ne montrent pas assez clairement leur émission. Aucun PNG n’a été fabriqué pour combler ces deux manques. L’onde au sol de l’Earth Guardian reste également en dehors de ce lot.

## État à la livraison

- **3 nouveaux candidats PNG**, **10 routes de slots** proposées.
- **3 audits raster réussis**, **3 copies natives identiques**, registre combiné validé.
- **0 animation**, **0 pouvoir ajouté**, **0 certification de fidélité**.
- Aucun manifeste partagé ni fichier de gameplay modifié par cette livraison.
- La QA visuelle dans le jeu appartient à l’intégration de la vague 29 ; ce dossier ne la déclare pas terminée.
