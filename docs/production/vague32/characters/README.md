# Vague 32 — quatre poses statiques supplémentaires

Quatre PNG transparents distincts sont importés pour deux identités déjà présentes. Ils remplissent des poses manquantes sans modifier leurs bases, portraits, images antérieures, animations ou restrictions d'admission. Le registre conserve **204 propriétaires** ; **202 propriétaires** sont entièrement inchangés. Aucun nouvel asset n'est certifié fidèle 1:1.

| Identité exacte | Pose | Index final | Image importée | Dimensions |
|---|---|---:|---|---:|
| Groaner — Silent Hill original | `neutralLight` | 5 | `assets/sprites/sh1_groaner_003.7da5f10a9307.png` | 1774 × 887 |
| Groaner — Silent Hill original | `neutralSpecial` | 6 | `assets/sprites/sh1_groaner_003.125ee32270cc.png` | 1774 × 887 |
| Sniffer Dog mâle — Silent Hill 4 | `walk` | 2 | `assets/sprites/sh4_sniffer_dog_male_053.257835c80735.png` | 1620 × 971 |
| Sniffer Dog mâle — Silent Hill 4 | `neutralLight` | 3 | `assets/sprites/sh4_sniffer_dog_male_053.4a693eb7331d.png` | 1774 × 887 |

Chaque entrée reste un clip d'une image, sans boucle. La marche historique du Groaner est conservée. Les quatre appels de génération ont fourni quatre images acceptées, sans régénération ni retouche. L'import utilise les octets PNG originaux : aucun recadrage, redimensionnement, nettoyage d'alpha, recoloriage ou recompression.

## Références et limites de fidélité

Les modèles originaux inspectés fixent l'identité et les détails anatomiques : [Groaner SH1](https://www.silenthillmemories.net/sh1/arts/pics/sh1_art_cre_04.jpg) et [Sniffer Dog mâle SH4](https://www.silenthillmemories.net/sh4/arts/pics/sh4_art_cre_05_sniffer_dog.jpg). La page 19 du [guide officiel Piggyback de SH4](https://www.silenthillmemories.net/publications/guides/silent_hill_4_the_official_strategy_guide_piggyback.pdf), reproduite dans `references/sh4-official-guide-page19.png`, a été inspectée pour l'identité et le contexte de déplacement. Les variantes féminines du Sniffer n'ont pas été utilisées.

Les descriptions des attaques du [Groaner](https://www.silenthillmemories.net/sh1/enemies_en.htm) et du [Sniffer Dog](https://www.silenthillmemories.net/sh4/enemies_en.htm) établissent les familles de gestes : approche, bond et morsure. Aucune séquence de captures de ces actions ni mesure de leur timing original n'a été nouvellement inspectée. Les nouvelles images présentent donc des poses candidates pour les emplacements de combat existants, dont les attaques restent classées `behavior-composite`. Une pose de marche ne constitue pas un cycle animé. La vue opposée repose sur le miroir déjà utilisé par le moteur.

Les bases ou portraits d'Incubus SH1 et Valtiel SH3 restent inchangés : les refus historiques sont consignés dans `held-source-review.json` et aucun nouvel appel n'a été tenté pour ces deux identités. L'arme du Robbie Arcade envisagé reste non résolue entre l'identifiant « Shotgun » du catalogue et le fichier de modèle `Robbie_Rifle.obj` ; aucune image ni entrée n'a été produite pour ce candidat.

## Intégration et revue

`import-reviewed.py` a exécuté l'importeur du projet, puis son contrôle de conservation a confirmé les images, clips, portraits et propriétaires historiques. `registry-preservation.json` et `import-receipts.json` conservent les vérifications. Les prompts exacts, reçus de génération, références et empreintes se trouvent dans ce dossier.

La QA native de `../qa-native-characters/characters-report.json` passe **229 contrôles sur 229**, avec **8 cas** couvrant les quatre poses dans les deux orientations. Les entrées utilisent les callbacks d'entrée ordinaires, l'introduction et la récupération naturelles du moteur. Les **8 captures finales ont été ouvertes et relues individuellement** : silhouettes complètes, orientation cohérente, poses distinctes et composition lisible. `visual-review.json` conserve leurs empreintes et observations.

Pour la morsure du Sniffer, le bas de la langue est plus bas que les pattes. La griffe avant mesurée dans le PNG candidat est au pixel `(1098, 838)` à alpha ≥ 32, tandis que le bas visible de la langue atteint 848. L'ancre existante est conservée ; `qa-ground-contact.mjs` contrôle séparément l'appui des pattes à moins d'un pixel monde et la langue à moins de deux pixels monde. Ces coordonnées décrivent l'image générée, pas une image du jeu d'origine.

Cette vérification utilise le véritable `FightEngine` avec un canevas natif. Elle ne certifie pas Chromium, les styles du navigateur, la distribution HTTP, le service worker, le mode hors ligne ni toute la matrice de dégâts et collisions. Elle ne transforme aucune pose statique en animation ou en preuve de fidélité 1:1.

## Bilan exact

- 4 nouvelles poses statiques ; 0 nouvelles bases ; 0 nouveaux portraits.
- 0 nouveau profil ; 0 nouvelle animation ; 0 nouvelle certification 1:1.
- 2 propriétaires complétés ; toutes leurs entrées antérieures conservées ; 202 autres propriétaires inchangés.
- 4 PNG originaux intégrés ; 8 captures natives relues ; 229 contrôles techniques réussis.
