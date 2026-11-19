# Passe 21 — décors manquants, groupe A

Livraison figée : **6 stages, 12 PNG sélectionnés, 13 038 163 octets**. Aucun fichier du dépôt modifié. Les PNG locaux sont des liens physiques vers les sorties Imagegen originales ; SHA256 et inode vérifiés. Une treizième génération, brouillon de la chambre froide, est exclue de la livraison.

`delivery.json` : **ae28632d33ca86859183e22d2991b74638c5cfb2b1e381fbc8751b63dc0c25c2**.

## Scènes et revue visuelle

| Stage | Sous-lieu retenu | Revue des plans |
|---|---|---|
| `old_silent_hill` | SH1, façade de la maison à la niche de Levin Street | Brouillard et neige ; chaussée plane sous y=0,825. Niche, marches et boîte aux lettres au fond. Fragments proches de bardage et boîte aux lettres aux bords. |
| `hospital_nightmare` | SH1, Alchemilla Otherworld, chambre 204 | Deux lits, chariot, fenêtre barrée et plaque turquoise ; aucun Bloodsucker ou personnage. Sol inférieur dégagé ; montants proches périphériques. |
| `sewer_resort` | SH1, niveau supérieur, baie de conduites du cul-de-sac sud avec clef de sortie | Sorties de conduites devant treillis rouillé, sump derrière le caillebotis. Appuis centraux libres ; deux supports proches aux bords. |
| `south_vale` | SH2 original, Neely’s Bar à l’angle nord-est Neely/Sanders | Façade et magasin contigu ; chaussée sous y=0,825, trottoir plus haut. Pas de sang importé depuis Lindsey/Sanders. Poteaux proches périphériques. |
| `hotel_otherworld` | SH2 original après cassette, long couloir après les portes aux œufs, avant escalier final pluvieux | Plâtre gris, panneaux de bois, appliques triangulaires ; sol inférieur continu. Ce n’est ni le hall du duo, ni le sous-sol inondé, ni l’escalier d’Angela. |
| `prison_meat_locker` | SH2 original, seconde chambre froide du combat Eddie, fin du Labyrinthe | Quatre quartiers de viande animale au fond, reliés aux crochets après correction ; sol libre. Aucun acteur, corps humain, rail mobile ou vapeur du remake. |

## Vérifications exécutées

- Les six stages étaient absents du registre et `stageBitmapFor(stage)` renvoyait `null` avant intégration. Aucun n’était bloqué. Les six `referencePolicy.sceneId` étaient absents/null ; les libellés `scene` livrés explicitent le sous-lieu sans inventer une politique runtime.
- `validateStageBitmap` accepte chaque descripteur. `stageBitmapFor(stage, registreCandidat)` retourne exactement le candidat. `stageBitmapFrames` trouve deux images uniques par scène.
- Deux plans statiques indépendants par décor, `fit: cover`, rectangles normalisés complets, `parallaxX: 0` puis `0.012`, une frame par plan, `ticksPerFrame: 1`, `loop: false`.
- Les douze PNG sélectionnés ont été vus, chargés et contrôlés en dimensions, taille, SHA256 et conservation des octets originaux. Aucun redimensionnement, découpage ou post-traitement de pixels.
- Six fonds RGB opaques et six premiers plans RGBA avec alpha réel 0–255. Les premiers plans ont entre **90,07 % et 95,40 %** de pixels à alpha strictement zéro. Dans la zone centrale x=8–92 %, l’alpha maximal est **1/255** ; ce résidu mesuré n’est pas présenté comme un zéro absolu. La bande centrale des appuis y=75–90 % est aussi à alpha ≤1/255 (exactement zéro pour Levin Street).
- Dix images font **1672×941**. La chambre froide conserve ses dimensions natives : **1671×941** au fond et **1670×941** au premier plan. Le cadrage normalisé `cover` gère cet écart d’un pixel entre les plans ; aucun redimensionnement n’est enregistré dans les PNG.
- `validation-report.json` conserve les résultats, identités et empreintes. Script exécuté `validate-delivery.mjs` : **bedcc18663006d85e7f578fb504c50101c09643bdabb48b9b59c5bdb9c863a46**.

## Limites et provenance

Les sept captures natives sélectionnées et les six pages de localisation sont consignées avec URL, SHA256 et taille dans `delivery.json`. Les références de salles écartées restent explicitement marquées non utilisées. Les treize prompts complets, dont le brouillon rejeté et sa correction, sont conservés.

Les plans sont des reconstructions destinées au versus : caméra latérale, échelle des accessoires, espacement des ouvertures et cadrage de premier plan sont adaptés. Les captures attestent les lieux et matériaux visibles, sans établir une identité de pixels ou une géométrie mesurée. Le calque proche utilise des fragments périphériques pour laisser les appuis et silhouettes libres. Aucune animation de monstre, eau, lumière, neige ou viande n’est produite par ces images statiques.

**Aucun rendu du moteur, test d’attaque, parcours Chromium ou validation du HUD n’a été exécuté dans ce lot de production.** L’intégrateur conserve la responsabilité de la passe de rendu et de parallaxe. Cette livraison ne revendique aucune certification 1:1 ou UHD.

Le brouillon `prison_meat_locker.second-freezer-draft.png` avait des raccords de crochets interrompus ; il ne figure pas dans `assets` ni dans les frames. Sa correction ciblée est le seul fond de chambre froide à intégrer.
