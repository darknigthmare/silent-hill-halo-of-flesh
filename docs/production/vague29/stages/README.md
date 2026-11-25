# Vague 29 — quatre arènes statiques supplémentaires

Production du **25 novembre 2026**, destinée à la PR de reprise à partir du
commit `2af87b6a1a8740a0759ce7c8c2746be19c48f4af`.

Les huit images natives sont des PNG indépendants de **1672 × 941** : un fond
opaque et un avant-plan transparent pour chacune des quatre arènes. Aucune
animation supplémentaire n’est produite. Les fichiers définitifs se trouvent
dans `assets/stages/` ; leurs chemins et SHA-256 sont dans
[integration-delivery.json](integration-delivery.json).

| Arène | Scène retenue | Références visuelles inspectées |
| --- | --- | --- |
| `book_light` | Salle de Light World, Zone 8, fenêtres claires et dalles rose-brun | Gameplay PS Vita : planches 6 et 10, cellules natives 320 × 180 |
| `book_steel` | Salle industrielle de Steel World, Zone 19 | Gameplay PS Vita : planches 1 et 3, cellules 160 × 90 ; porte métallique et disque denté originaux de Miguel Rico |
| `film_midwich` | Galerie supérieure de Midwich déjà transformée en Otherworld | Image du film 2006 : fenêtre circulaire ambrée, travées rectangulaires, poutres et coursive grillagée |
| `film_church` | Nef protégée orientée vers l’entrée arrière, avant l’intrusion finale | Image du film 2006 : piliers carrés pâles, lambris, portes surélevées, suspensions circulaires et cierges |

Les URL, tailles et empreintes des huit références retenues figurent dans
[references/sources.json](references/sources.json). Les captures vidéo ne sont
pas des modèles 3D exacts. Les noms horodatés des images du film correspondent
à la création des captures, pas à des timecodes affirmés dans le film.

Le générateur du dossier a été réexécuté après l’import pour vérifier sa lecture
des fichiers définitifs. Cette première reprise a seulement changé le champ
`createdAt`. La revue suivante a corrigé `geometry.ceiling` à `false` pour
`book_light` et `book_steel`, avec une note de justification dans chaque
composition : ce champ autorise un appui pour des finishers contextuels.
Les références ne prouvent pas cet appui, donc l’inéligibilité précédente est
conservée. **Cette valeur ne signifie pas que le plafond peint serait absent
de la salle.** Les PNG ne changent pas.
[delivery-finalization.json](delivery-finalization.json) enregistre cette
différence de timestamp et les deux corrections d’appui, compare les huit
images et les quatre compositions au reçu
d’import historique et au manifeste actif, et décrit la récupération du
[snapshot importé](integration-delivery.imported.json) dont le SHA-256
correspond exactement à celui consigné dans le reçu. Le reçu historique n’a
pas été modifié et l’import n’a pas été rejoué.

## Contrôles effectués

- Huit appels distincts à l’outil intégré `image_gen__imagegen`, un plan par
  appel, huit sorties retenues et inspectées visuellement.
- **10 543 708 octets** pour les huit PNG actifs ; les octets et pixels natifs
  sont conservés. Aucun redimensionnement, recadrage, changement de couleur,
  réparation d’alpha ou réencodage.
- Les quatre fonds sont opaques. Les avant-plans contiennent **94,90 % à
  98,86 %** de pixels entièrement transparents. Dans les 86 % centraux et la
  zone d’appui, aucun pixel d’avant-plan ne dépasse un alpha de 1/255 ; les
  traces natives sont conservées.
- `validateStageBitmap` accepte les quatre identités, sources et compositions
  de deux plans. La parallaxe proposée vaut 0 pour le fond et 0,006 pour les
  bords proches.

Cette livraison ne modifie aucun manifeste partagé ni règle de combat.
Les vérifications dans le moteur et la publication appartiennent à l’étape
d’intégration. Ce dossier ne revendique donc pas de test moteur ou de push.

## Fidélité et limites

Le statut reste **`integrated-candidate` / `fidelity: unverified`**. Les couleurs,
matériaux et motifs proviennent des références inspectées ; la caméra latérale,
la largeur de jeu, les espacements et la répétition des éléments sont adaptés
au combat 2D. La géométrie complète des salles, leurs dimensions et le nombre
exact d’éléments n’ont pas été mesurés. Les deux salles de Book of Memories
combinent des motifs de leurs zones procédurales respectives.

La galerie Midwich conserve sa phase Otherworld ; la nef du film demeure en
phase normale, sans trou, barbelés ni intrusion finale. Les personnages et les
interfaces des sources ne sont pas peints dans les décors. Aucun effet ou
danger nouveau n’est inféré à partir des images. Les résolutions natives sont
indiquées ci-dessus : ce lot n’est pas présenté comme du 4K natif ni comme une
reconstruction 1:1 certifiée.

[source-review.json](source-review.json) détaille les observations et limites
pour chaque arène. Les fichiers `*.prompt.json` et `*.receipt.json` conservent
les prompts exacts, références et reçus d’origine.
