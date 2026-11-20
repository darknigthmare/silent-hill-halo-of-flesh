# Vague 23 — quatre décors de Book of Memories

Livraison de **4 stages jusque-là sans bitmap**, avec **8 PNG actifs candidats** de **1672 × 941 pixels**, pour **9 433 427 octets**. Chaque scène possède un fond opaque et un premier plan transparent indépendant. Les images sont des sorties natives de l’outil intégré `image_gen.imagegen` ; la copie dans ce dossier ne modifie ni les pixels ni le canal alpha.

`delivery.json` est le contrat destiné à l’import parent. Cette livraison ne modifie aucun manifeste central, aucune politique de scène, aucun mouvement, aucun portrait et aucun identifiant de personnage. Son statut reste **`integrated-candidate` / `fidelity: unverified`**. Le terme « intégré » dans ce contrat désigne le statut attendu après import ; le contrôle visuel du moteur et la publication sont à la charge de la passe parent.

## Scènes et éditions retenues

| Stage | Sous-lieu documenté | Édition de la référence | Limite conservée |
| --- | --- | --- | --- |
| `book_fire` | Salle industrielle Fire, image 01 de la galerie de lancement US | PS Vita, 16 octobre 2012 | Caméra, largeur et totalité de la pièce procédurale reconstruites pour le versus. |
| `book_earth` | Galerie Earth avec soutènements de bois et récipients, image 37 | PS Vita, E3 du 6 juin 2012, **préversion** | Aucun plan final commercial revendiqué. |
| `book_blood` | Plateforme de l’arène Blood Guardian, image 31, boss exclu | PS Vita, E3 du 6 juin 2012, **préversion** | Partie centrale occultée dans la source, divisions et périphérie non certifiées. |
| `book_water` | Bassin carrelé de l’arène Water Guardian, image 50, boss exclu | PS Vita, E3 du 6 juin 2012, **préversion** | Mur partiellement caché, dimensions et orientation réinterprétées. |

La [galerie de références datées](https://www.silenthillmemories.net/sh_book_of_memories/screenshots_en.htm) distingue les captures E3 des images du lancement. Elle est hébergée par un site d’archives non officiel ; les fichiers inspectés sont des captures du jeu. Les cinq images réellement utilisées, leurs adresses, dimensions et empreintes sont consignées dans `reference-inventory.json`. Les noms des scènes incluent la date et la préversion lorsqu’il y a lieu. Les quatre fiches moteur restent en phase `fixed-altered`, avec leurs `referenceIds` existants, et aucun `sceneId` de politique moteur n’a été ajouté ou changé.

## Revue visuelle des sorties natives

**Fire.** Le fond reprend les parois de métal sombre, le meuble d’atelier rouge, son petit meuble voisin et la grille lumineuse en retrait. Le sol est continu sur la ligne de combat. Le premier essai avait extrapolé un rebord de plateforme avec des bandes jaunes/noires ; une correction ciblée par imagegen l’a supprimé. Le nombre et les proportions exactes des panneaux et des tiroirs ne sont pas certifiés à partir de cette source en plongée. Les deux chants d’acier proches occupent seulement les marges.

**Earth.** La galerie conserve les rochers, les soutènements de bois, une roue et les récipients, avec un premier plan de terre et de petits cailloux dégagé. La caméra frontale et les accessoires repoussés au fond constituent une adaptation au combat 2D. L’ouverture complète et le plafond visible dans la sortie ne sont pas une mesure de la géométrie du jeu. Les bords rocheux proches restent à l’extrême gauche et à l’extrême droite.

**Blood.** Le fond garde les surfaces rouges opaques et les divisions grillagées. Il n’y a ni Guardian, ni personnage, ni organe, ni écoulement animé. Une seconde correction imagegen a supprimé le disque central extrapolé dans la première sortie. Le cadrage garde une plongée douce ; largeur de la plateforme, disposition de la partie cachée et nombre de blocs restent non certifiés. Les deux petits fragments de blocs au bas des coins n’entrent pas dans la ligne de combat.

**Water.** Le bassin montre du carrelage vert-gris, les montants maçonnés, une ouverture de conduit ronde et quelques morceaux de dalle au fond. L’eau et les reflets sont peints dans une image statique. La taille du conduit et la largeur de la salle ne sont pas des mesures de la source. Aucun ruissellement mural, aucune cascade ni attaque du Guardian n’a été ajouté. Le premier plan se limite aux chants carrelés latéraux.

Dans tous les cas, les personnes, armes, monstres, interfaces, indicateurs et chiffres des captures de référence sont absents. Les sorties sont des **reconstructions guidées par les sources**, sans certification de fidélité 1:1 ni d’UHD. Les deux calques et leur parallaxe ne constituent pas une animation originale du jeu.

## Contrôles effectués avant import

- Les huit fichiers ont été décodés et comparés octet par octet à leur sortie imagegen d’origine.
- Les quatre fonds sont opaques. Les quatre premiers plans ont un alpha réel de 0 à 255, sans détourage externe.
- Dans la bande centrale des pieds (`x=8–92 %`, `y=75–90 %`), l’alpha maximal des premiers plans vaut **0 ou 1 sur 255**. Les traces natives de valeur 1 sont conservées et ne sont pas présentées comme un zéro exact.
- `validateStageBitmap`, `stageBitmapFor`, la sélection des deux plans, les `referenceIds`, la phase et le `sceneId` moteur existants passent le contrôle en lecture seule.
- `auditStagePng` valide les huit PNG. Chaque scène représente **12 586 816 octets décodés** pour ses deux plans.

Les résultats sont dans `validation.json` et `raster-audit.json`. Aucun succès de navigateur, aucune animation d’origine, aucun timing, aucun test de duel exécuté par le parent n’est présumé ici.

## Pistes reportées

Les cibles initiales ne sont pas remplacées par des pièces voisines. Les vues consultées pour Daisy Villa montraient un gros plan de Missionary ou la porte 102, sans nouveau toit exploitable. La capture promotionnelle trouvée pour l’escalier de The Short Message correspond à un escalier couvert de notes : elle ne prouve pas la phase normale demandée par la fiche. La page du commissariat Homecoming donne un parcours textuel, mais aucune nouvelle vue native de pièce n’a été retenue dans cette passe. Les réserves antérieures pour Cedar Grove, Green Lion et les autres salles restent ouvertes. Ces pistes ne sont pas comptées comme des stages produits.

## Reproduction de la livraison

`assemble_delivery.py` relit uniquement les PNG, les prompts et les données de scène pour produire les métadonnées. Il ne transforme aucune image. Les deux premiers essais sont conservés dans `variants/`, identifiés comme **non actifs** ; ils ne doivent pas être ajoutés au manifeste des décors. Le prompt de chaque génération et des deux corrections est enregistré intégralement. Le parent peut importer `delivery.json` avec le contrat de vague23 dérivé de `vague22/integrate-stage-deliveries.mjs`, puis effectuer la QA du moteur.
