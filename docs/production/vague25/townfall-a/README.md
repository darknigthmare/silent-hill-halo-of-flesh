# Vague 25 — Townfall A

Trois vues latérales natives ont été générées puis examinées comme candidates : **Lunger, Sorrowful et Fallen**. La livraison `delivery.json` contient trois entrées `selected[]`, directement compatibles avec l’importeur de personnages de la vague 25. Aucun registre, moteur, clip, portrait ou fichier Git n’a été modifié par ce sous-lot.

| Profil | Références exactes | Statut de la source | PNG natif |
|---|---|---|---|
| `townfall_lunger` | `creature_lunger_03.jpg`, `creature_lunger_04.jpg` | Modèle final en jeu, image entière et détail | `png/townfall_lunger.side.png` |
| `townfall_sorrowful` | `creature_sorrowful_07.jpg`, `creature_sorrowful_08.jpg` | Modèle final en jeu, image entière et détail | `png/townfall_sorrowful.side.png` |
| `townfall_fallen` | `creature_fallen_04.jpg` | **Concept final**, pas modèle commercial certifié | `png/townfall_fallen.side.png` |

Les références proviennent de la [galerie Townfall de Silent Hill Memories](https://www.silenthillmemories.net/sh_townfall/art_en.htm), archive non officielle d’illustrations et rendus promotionnels. Le dossier partagé `docs/production/vague25/townfall/reference-delivery.json` établit les téléchargements HTTP 200 et la correspondance des octets/SHA avec ART92-e. Les cinq fichiers ont aussi été inspectés dans ce sous-lot. `reference-provenance.json` conserve leurs URLs exactes, empreintes, chemins et types de source.

## Production et conservation

Trois appels à `image_gen.imagegen`, trois sorties natives, aucun refus ni nouvelle tentative. `prompts.json` contient les requêtes exactes ; chaque `receipt-*.json` conserve le prompt, les références et le reçu de sortie. Les PNG sont des liens physiques vers les fichiers natifs originaux, sans détourage, redimensionnement, correction colorimétrique ou réencodage. Les références réutilisées sont également liées sans recopier leurs octets.

Les trois sorties mesurent 1024 × 1536, en RGBA réel, avec plus de 86 % de pixels alpha nul. Les mesures et empreintes sont dans `technical.json`. Le halo éventuellement visible dans l’aperçu correspond aux canaux RGB de pixels transparents ; il ne constitue pas un fond opaque. Lunger possède quelques pixels alpha1 au bord ; les pixels visibles au seuil alpha8 restent à l’intérieur du cadre.

## Revue visuelle et limites

`visual-review.json` est la revue du producteur. `peer-visual-review.json` est une seconde lecture indépendante, réalisée par l’agent d’audit sur les trois sorties et leurs sources. Les trois silhouettes sont acceptées **comme candidates**, avec corps entier, orientation droite, deux bras et deux pieds ; aucune certification 1:1 n’est attribuée.

Lunger conserve sa tête-lame continue, les mains retenues et les sangles. Sa marge supérieure de 8 px et inférieure de 19 px sont très serrées mais aucune extrémité n’est coupée. Sorrowful conserve ses mains au sternum, le petit tube et ses raccords bleu/rouge, sans fouet ajouté. Fallen reste **debout**, comme le concept final, avec ses deux petits filaments ; l’ancien indicateur `poseRig: rampant` ne fournit pas une preuve de quadrupédie et n’a pas été utilisé pour inventer une pose.

Les références ne sont pas des profils source exacts. Le côté caché, l’épaisseur, les trajets fins des sangles, les microtextures et les occlusions de membres sont reconstruits. Le rendu miroir restera une convention de présentation. Les marges généreuses du prompt ne sont pas atteintes verticalement ; les marges mesurées sont consignées.

Les ancres de pieds et hauteurs de `calibrationProposal` sont provisoires. L’intégration et la revue dans le moteur restent à la charge de root. Les rôles existants sont `combatant` / `combatEnabled: true`, sans nouveau clip animé, changement de sélection ou modification de capacité.
