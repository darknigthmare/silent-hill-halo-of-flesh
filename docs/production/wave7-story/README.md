# Illustrations des chroniques

Trois des quinze chroniques disposent désormais d’une ouverture et d’un dénouement illustrés. Les six images suivent les textes déjà écrits pour le jeu. [Voir les trois paires](overview.jpg)

| Chronique | Ouverture | Dénouement |
| --- | --- | --- |
| **Naître deux fois** · *Silent Hill 3* (2003) | Heather s’arrête entre le diner et le centre commercial. Les lames des stores découpent la lumière sur les banquettes. | Après le combat, Heather regarde les vitraux depuis une allée de la chapelle. La scène accompagne « Le dieu tombe, mais la mémoire reste. » |
| **Les vingt-et-un sacrements** · *Silent Hill 4: The Room* (2004) | Depuis la cuisine de l’appartement 302, Henry fait face à la porte condamnée. | Deux chaînes se tendent sur les panneaux de cette même porte. Le bilan garde la mention du chapitre de Walter sacrifié et affiche la phrase finale sous l’illustration. |
| **Les miroirs de Travis** · *Silent Hill: Origins* (PSP, 2007) | Travis examine le miroir terni qui surplombe les lavabos. | Le Flauros assemblé et la clé de la chambre 500 du Riverside Motel évoquent le passé de Travis. La nature morte réunit deux objets du jeu. Dans le récit commercial, l’assemblage se déroule au sous-sol de l’hôpital après le motel. |

Les façades, accessoires et vêtements s’appuient sur les vues des jeux concernés. Les compositions interprètent les fins écrites pour ces chroniques. La forme triangulaire du Flauros vient de l’image finale du puzzle dans le guide officiel. [Extrait du guide](reference-flauros.png) · [Sources, instructions de génération et empreintes SHA-256](generation.json)

## Où voir les images

Dans **Chroniques**, choisir l’un des trois titres. L’archive affiche l’ouverture au-dessus du texte et du trajet. **Lancer** présente cette illustration et le texte d’ouverture pendant l’entrée des combattants du premier combat. Le dernier écran de victoire présente le dénouement, le rang et les statistiques. Les résultats intermédiaires conservent le bouton du combat suivant. Une reprise de sauvegarde ou un nouvel essai au premier combat reprend directement la rencontre.

Le registre des illustrations se trouve dans [chronicle-art.js](../../../src/chronicle-art.js). Les WebP sont livrés avec le jeu et précachés pour le mode hors ligne. Le contrôleur de parcours conserve l’ordre des rencontres, les dossiers, les sauvegardes et le calcul du rang.

## Couverture

Au départ, chaque archive dessinait la première arène sur Canvas et les quinze bilans de chronique étaient textuels. Les trois paires ci-dessus ajoutent six illustrations narratives. Douze chroniques attendent encore leurs deux images.

| Édition | Chronique encore à illustrer | Édition | Chronique encore à illustrer |
| --- | --- | --- | --- |
| Silent Hill | La brume d’Alessa | Silent Hill 2 | La sentence de James |
| Homecoming | Le fils qui revient | Shattered Memories | Mémoire sous la glace |
| Downpour | Pluie sur Ryall | Book of Memories | Les gardiens du livre |
| P.T. | 204863 | The Short Message | Les pétales de Maya |
| Silent Hill f | La procession d’Hinako | Films | Les cendres d’Alessa |
| Ascension | Le trauma partagé | Townfall | Le signal sous St. Amelia |

La Descente Arcade, les Grands Tourments et les Rites du jugement utilisent leurs propres parcours dans le moteur Versus. Le lecteur choisit les illustrations par identifiant de chronique.

## Contrôle en navigateur

Le [script de contrôle](../../../scripts/http-qa-chronicle-art.mjs) ouvre les archives dans Chromium depuis le build `dist`, choisit un combattant illustré de l’édition et lance la chronique avec les réglages ordinaires. Pour chaque rencontre, il prépare le KO décisif et laisse le moteur produire le résultat, la sauvegarde et le bouton de poursuite. Il vérifie également la défaite et le nouvel essai, le bilan mobile de SH4, les empreintes des six fichiers compilés et leur décodage après coupure du réseau.

| Chronique | Archive | Premier combat | Fin |
| --- | --- | --- | --- |
| Naître deux fois | [Aperçu](qa/heather_birth-archive.jpg) | [Ouverture](qa/heather_birth-opening.jpg) | [Bilan](qa/heather_birth-ending.jpg) |
| Les vingt-et-un sacrements | [Aperçu](qa/room_21-archive.jpg) | [Ouverture](qa/room_21-opening.jpg) | [Bilan](qa/room_21-ending.jpg) |
| Les miroirs de Travis | [Aperçu](qa/travis_mirrors-archive.jpg) | [Ouverture](qa/travis_mirrors-opening.jpg) | [Bilan](qa/travis_mirrors-ending.jpg) |

Chromium 153 a validé **121 contrôles sur 121**. Le parcours couvre six rencontres SH3, cinq rencontres SH4 et son dossier hors combat, puis six rencontres Origins dont Sad Daddy. Après installation du service worker et coupure du réseau, les six fichiers WebP ont été décodés avec les mêmes dimensions et empreintes que le build. Ils occupent ensemble **909 000 octets**. [Résultats détaillés des contrôles Chromium](qa/report.json)
