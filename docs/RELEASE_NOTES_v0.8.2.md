# SILENT HILL: HALO OF FLESH — v0.8.2
## Impacts, avertissements et ambiance

Base récupérée : archive source v0.8.1, HEAD GitHub vérifié `802996487d5f8aca11ac55239b4dc66298c31ae1`.

### Combat

Un coup interrompu n'est plus conservé pendant l'étourdissement puis repris à son ancienne frame active. Une armure active conserve le coup sans suspendre son animation ; un bris d'armure, une projection ou une mise au sol l'interrompt. Une garde parfaite coupe le coup de mêlée, mais ne frappe ni ne repousse magiquement le tireur d'un projectile distant. Le contre de contact ne renvoie pas de dégâts à ce tireur.

Les projectiles testent le segment entier parcouru pendant une frame, avec l'enveloppe carrée déjà utilisée par le moteur. Le recul suit leur déplacement même si leur propriétaire s'est retourné. Un contact invulnérable ne valide pas une chaîne ni ne consomme une touche de multi-coup.

La vitalité ne descend plus sous zéro et les statistiques enregistrent les dégâts réellement reçus. Saignement et brûlure créditent leur source ; un renouvellement environnemental retire l'attribution au précédent combattant. Les deux ticks périodiques sont résolus avant toute nouvelle action : une créature tuée ne peut donc pas attaquer ou commencer une phase de boss après ce tick.

Les phases automatiques attendent la fin de la transition précédente et abandonnent le coup en cours. Observation peut toujours les parcourir manuellement. Le chronomètre départage au pourcentage de vie restante, pas au nombre brut de points d'un boss géant. Ce sont des règles Versus, pas des règles officielles Silent Hill.

### Lieux et animations

Les signaux radio, sirènes, CRTV, projecteurs, cloches et portraits gardent leur composition visuelle/sonore, sans être transformés en source automatique de dégâts. Leurs six anciens profils expérimentaux restent dans l'archive technique et les tests mais sont exclus des decks de stages. Lakeview dispose ainsi d'un deck vide : aucune attaque générique n'est inventée pour le remplir.

Les autres dangers restent des adaptations explicites. Deux avertissements automatiques au maximum peuvent être présents. Un événement physique refusé attend au lieu de montrer un objet sans collision. Une interaction refusée n'est pas marquée comme déjà consommée.

Eau, racines, glace et autres variations de traction attendent la fin du télégraphe de leur danger. L'interface affiche le sol qui prendra effet à l'impact. Désactiver les dangers garde l'ambiance mais supprime les dangers en cours et les changements de terrain en attente. Les particules utilisent un générateur aléatoire indépendant : leur quantité ne change plus les décisions ultérieures de l'IA et du directeur d'arène.

Les intérieurs utilisent maintenant une brume diffuse plutôt que des nappes opaques à bord dur. Les panneaux de danger sont dessinés après les combattants pour rester lisibles devant les armes volumineuses. Leur texte précise le changement de terrain prévu à l’impact.

### Commandes

Une pression pendant le gel d'impact peut être mémorisée huit frames, avec sa direction. Une nouvelle pression est prioritaire et une ancienne commande expire. Pause, perte de focus, masquage de la page et début d'un nouveau round purgent les entrées : pas de touche de déplacement collée au retour.

### Catalogue inchangé

230 manifestations, 75 boss, 123 stages, 4 600 commandes, 460 fatalités de combattants, 123 fatalités de stage. 352 pistes d'animation, 300 événements et 286 interactions conservés. Les liens de dangers automatiques passent de 335 à 255 ; les 29 définitions techniques restent testées. Il s'agit de comptages du catalogue du projet, non d'un décompte officiel exhaustif de la franchise.

### Sources et frontière de fidélité

La distinction entre radio d'avertissement et attaque est appuyée sur l'article de Mateusz Lenart (Bloober Team), « Sortie de Silent Hill 2 le 8 octobre, nouveau gameplay dévoilé », PlayStation Blog, 31 mai 2024 :
https://blog.fr.playstation.com/2024/05/31/sortie-de-silent-hill-2-le-8-octobre-nouveau-gameplay-devoile/

L'article décrit la radio comme un moyen de créer l'incertitude et de donner des indices audio, et insiste sur une lutte de survie plutôt qu'un spectacle de puissance. Il ne valide PAS notre duel de monstres, nos timings, nos fatalités ou chaque stage du catalogue. Le choix conservateur de rendre d'autres signaux non blessants est une décision du prototype en l'absence de preuve d'une attaque correspondante, non une affirmation universelle sur la franchise.

Aucune nouvelle validation exhaustive des 4 600 étiquettes de mouvements n'a été effectuée. Les silhouettes sont procédurales et simplifiées ; aucune reproduction graphique 1:1 n'est revendiquée. Les anciens noms descriptifs et ajouts spéculatifs nécessitent encore un audit par média.
