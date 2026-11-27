# Vague 32 — poses, scènes précises et récits individuels

La vague ajoute **douze PNG candidats** au prototype : quatre poses de combat, quatre plans de décor et quatre illustrations narratives. Elle corrige aussi l’origine des deux tirs illustrés de la vague 31 et le contrat navigateur historique de la Nurse. Référence de départ : `d4269ad8239a99cad53d44bc77b569ed7a0d41a3`, PR #11.

## Contenu livré

| Domaine | Propriétaire exact | Ajout |
| --- | --- | --- |
| Combat | Groaner, SH1 original | `neutralLight` et `neutralSpecial`, une image indépendante par commande |
| Combat | Sniffer Dog mâle, SH4 | `walk` et `neutralLight`, une image indépendante par pose |
| Décor | Green Lion, Origins | Antichambre du culte après le tunnel : fond et bord de grille transparent |
| Décor | Lighthouse Counseling Center, Shattered Memories | Extérieur avant l’entrée : fond et bord de neige transparent |
| Récit | Groaner, SH1 original | Introduction et conclusion devant la maison de Levin Street |
| Récit | Lying Figure debout, SH2 original | Introduction et conclusion devant Neely’s Bar |

Les quatre poses sont des images fixes de gestes compatibles avec les sources. Elles n’ajoutent aucun cycle animé, chronométrage source, personnage ou portrait. Les récits utilisent des compositions originales compatibles ; leurs conclusions ne sont pas des fins canoniques. La plaque du centre Lighthouse ne reproduit que le mot lisible `LIGHTHOUSE`, et les autres écarts de reconstruction sont conservés dans la provenance.

Les anciens plans, portraits, frames et clips sont préservés. Les trois anciennes pistes procédurales Green Lion sont masquées pour la scène sélectionnée : poussière, Flauros abstrait et lueur. Leurs propositions restent documentées. Aucun nouveau danger, événement, plafond utilisable ou changement d’admission au combat n’est activé.

## Tir et mémoire

Les `neutralSpecial` exacts de Walter SH4 et d’Eddie SH2 utilisent maintenant le point du canon mesuré sur leur PNG. Le même calcul fournit la position physique du projectile et son rendu, dans les deux orientations. Un segment d’émission initial traite une cible très proche, puis le projectile reprend son déplacement ordinaire.

La hauteur corrigée du tir d’Eddie passe au-dessus de Needler et d’une cible accroupie ; les tests l’explicitent. Sa commande basse existante continue d’exercer la déviation de Needler. Vitesse, rayon, dégâts et durée de vie ne changent pas. Les autres formes, commandes et supers conservent leur origine antérieure.

Le budget des sprites de combat passe de **72 à 79 Mio** pour conserver toutes les images natives du duo Groaner / Faceless Nurse. Le maximum mesuré est de **81 802 000 octets RGBA**, sur **26 565 paires**, soit légèrement plus de 78 Mio. Le budget générique reste à 64 Mio, les décors à 64 Mio et les projectiles à 32 Mio. Les images ne sont ni réduites ni retirées.

## Bible et suivi

Le guide général et ses deux extensions représentent toujours **68 rubriques**, **48 fiches d’exemple**, **16 familles** et **40 scénarios de recette conçus**. Les **445 associations** référencent désormais **719 chemins d’image**. Les scénarios fonctionnels des extensions restent à exécuter après implémentation ; ces ajouts visuels n’activent aucun mode d’équipe ni service d’abonnement.

La mise à jour des deux classeurs conserve les feuilles historiques et leurs formules. Le [rapport de vérification des classeurs](workbooks/validation.json) distingue les feuilles préservées des actualisations de suivi autorisées.

## Vérifications

Les premiers contrôles ont révélé et corrigé les attentes historiques obsolètes concernant les nouvelles poses, les récits et les pistes de décor. Le dépassement mémoire du duo Groaner / Faceless Nurse est traité comme un défaut réel de lancement. La [validation globale](qa/validation.json) indique les résultats finaux exécutés, et conserve les tentatives initiales lorsqu’elles ont échoué.

- [Production et provenance des personnages](characters/README.md).
- [Sources, scènes et QA des décors](stages/README.md).
- [Illustrations narratives et parcours de contrôle](story/README.md).
- [Diagnostic et correctif des origines](qa/projectile-origin-diagnosis.json).
- [Contrôles natifs des origines](qa-native-origins/characters-report.json).
- [Inventaire calculé et conservation des données](inventory.json).

Les captures natives utilisent le moteur réel et les entrées ordinaires. La reprise a ensuite exécuté les recettes HTTP dans Chromium 158.0.8127.0 : **575 contrôles réussis et 37 captures relues**, avec les PNG servis aux empreintes attendues. Les recettes sont également inscrites dans la CI, dont le résultat distant reste à vérifier sur le commit publié. Le contrôle de fin narrative utilise un composant isolé et ne représente pas quatre combats joués jusqu’au terme. Le cache hors ligne n’est pas couvert.

Le récit Groaner a été lancé jusqu’au premier combat, puis repris depuis son checkpoint après changement de sélection. **Le récit Lying Figure demeure bloqué** par l’absence de la base exacte de `sh2_mannequin_ambusher_023` : le refus normal est contrôlé, la route conservée et ses images vérifiées comme composants isolés. Une histoire illustrée n’est pas comptée comme un parcours complet jouable.

## Manquants conservés explicitement

La couverture reste de **204 portraits**, **190 bases latérales candidates**, **4 anciennes vues de combat à revoir**, **36 bases de combat absentes**, **97 arènes illustrées sur 123**, **31 commandes de projectile illustrées sur 86** et **3 récits individuels illustrés sur 230**. Les catégories se recoupent ; elles ne doivent pas être additionnées comme un nombre unique d’images.

Les profils retenus par un refus de génération ou une identité insuffisamment établie ne sont pas remplacés par des créations approximatives. Le [relevé des blocages examinés](characters/held-source-review.json) conserve ces décisions. Les six clips animés antérieurs restent distincts des quatre poses fixes ajoutées ici. La fidélité reste `unverified` partout où une comparaison source 1:1 n’a pas été établie.
