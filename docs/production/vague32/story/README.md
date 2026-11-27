# Deux récits individuels : Groaner et Lying Figure

Quatre illustrations fixes sont rattachées à deux profils précis : le Groaner de **Silent Hill (1999)** et le Lying Figure debout de **Silent Hill 2 original (2001)**. Les compositions sont originales et compatibles avec les références inspectées. Leur statut reste `integrated-candidate`, leur fidélité `unverified`.

| Profil | Lieu retenu | Introduction | Conclusion |
| --- | --- | --- | --- |
| `sh1_groaner_003` | Maison de Levin Street, `old_silent_hill` | Le quadrupède entier avance devant la maison, la niche et la boîte aux lettres, sous la neige. | La même composition est vide après son passage. |
| `sh2_lying_figure_020` | Façade de Neely’s Bar à South Vale, `south_vale` | Une silhouette debout, torse fermé et deux jambes visibles, se tient devant la façade aux fenêtres couvertes de papier. | La façade et la chaussée restent dans la brume, sans créature. |

Les [quatre fichiers et leurs empreintes](integration-delivery.json) sont enregistrés dans le [registre narratif](../../../../src/story-art.js). Chaque PNG conserve les octets de sortie du générateur, sans redimensionnement ni retouche par script.

## Sources inspectées

- [Rendu original du Groaner](https://www.silenthillmemories.net/sh1/arts/pics/sh1_art_cre_04.jpg) : proportions canines, quatre membres, museau, oreilles, queue et peau brune marbrée.
- [Capture native de la maison de Levin Street](https://www.silenthillmemories.net/sh1/walkthrough/pics/sh1_01_house_key_a.jpg) : lieu, niche, boîte aux lettres, marches, neige et brume. Harry présent dans cette référence n’est pas reproduit.
- [Rendu original du Lying Figure](https://www.silenthillmemories.net/sh2/arts/pics/sh2_art_monster_04_lying_figure.jpg) : enveloppe du torse, membres inférieurs et pieds sombres.
- [Capture native de rue de SH2](https://www.silenthillmemories.net/sh2/screens/pics/sh2_screenshot_pc_06.jpg) : posture de la forme debout. Les personnages, le corps au sol et le véhicule ne sont pas repris.
- [Façade originale de Neely’s Bar](https://www.silenthillmemories.net/sh2/walkthrough/sh2_w01_neelys_bar.jpg) : porte, briques et fenêtres masquées.

Ces images de l’œuvre sont archivées sur un site non officiel. Les [copies de référence et leurs hashes](references/sources.json) séparent leur rôle de celui des décors déjà intégrés au projet : ceux-ci servent à la continuité visuelle et ne constituent pas une preuve canonique supplémentaire. Les [prompts d’introduction](prompts.json) et les [instructions d’édition des fins](ending-prompts.json) sont conservés.

## Intégration et contrôle

La sélection Récit utilise l’introduction du profil choisi. L’entrée du premier chapitre peut également l’afficher lorsque le parcours est admis. La conclusion exige une partie Récit achevée. Les autres versions et formes ne récupèrent pas ces images : notamment Wormhead, Lying Figure rampant et manifestation du film. Les files de rencontres, adversaires, chapitres, sauvegardes et conditions de victoire ne sont pas modifiés.

**Le récit Lying Figure reste bloqué au lancement** : son troisième adversaire exact, `sh2_mannequin_ambusher_023`, n’a pas de base de combat. L’interface affiche « Sprites à produire : 1. Mannequin — Ambusher. Aucun parcours ni tentative modifié. » Ce profil ne reçoit ni une image empruntée ni une identité approximative. Les deux illustrations sont disponibles, mais elles ne rendent pas ce parcours jouable.

La relecture visuelle a vérifié les sujets entiers, la séparation des versions, les membres visibles, les accessoires des lieux, l’absence de texte incrusté et la suppression des créatures dans les fins. Les textures des décors varient légèrement lors des éditions. Aucun photogramme source ne correspond à ces compositions narratives : elles ne valent ni cinématiques canoniques ni certification 1:1.

Le [contrôle HTTP](qa-http.mjs) parcourt, pour Groaner, la sélection, le lancement du premier chapitre, le changement vers un profil apparenté non illustré et la reprise explicite du récit. Il a réussi **15 contrôles**, avec quatre captures relues. Pour Lying Figure, l’option explicite `--expect-blocked=sh2_mannequin_ambusher_023` vérifie le refus ordinaire, la route inchangée et l’absence de partie créée, puis les composants d’introduction et de conclusion isolés : **12 contrôles**, quatre captures relues. Aucune campagne complète n’est présentée comme jouée.

Les [preuves HTTP finales](../qa-final/story/) sont conservées avec leurs empreintes dans la [validation de la vague](../qa/validation.json). Les premières tentatives sont archivées séparément, sans remplacer un échec de recette par une fausse déclaration de jouabilité.
