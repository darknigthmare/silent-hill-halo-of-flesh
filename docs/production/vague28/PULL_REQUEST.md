## Pourquoi

Plusieurs combattants disposaient d’un idle mais pas de l’image de leur attaque,
les projectiles utilisaient encore le rendu générique et six arènes restaient
sans plans bitmap. L’ajout de poses natives révélait aussi un refus de chargement
dans certains duels contre la Faceless Nurse d’Origins.

## Modifications

Les vagues 27 et 28 ajoutent **23 PNG actifs indépendants** :

- **Six poses statiques** : Lying Figure SH2, Double Head SH3, Groaner SH1,
  Closer et Numb Body Small SH3, Fire Guardian de Book of Memories.
- **Cinq effets de projectile** : acide de Lying Figure, décharge bleue
  d’Incubator, feu au sol de God, rocher d’Earth Guardian, jet blanc/magenta/violet
  de Fire Guardian. Chaque effet est lié à son profil, son édition et ses
  commandes ; le rendu générique reste disponible si le PNG manque.
- **Douze plans pour six arènes** : cellule du commissariat de Homecoming,
  toit et escalier de The Short Message, chambre finale SH4, salle de Scarlet,
  toit de l’hôpital Arcade. La couverture atteint **85/123 arènes**.

Le pipeline des projectiles possède son cache indépendant de 32 Mio. Le cache
de combat passe à **72 Mio** pour garder toutes les frames natives des duels
concernés. Le cache générique et celui des décors restent à 64 Mio. Les règles,
dégâts, trajectoires, identifiants, portraits et classeurs sont préservés.

## Vérification locale

- **1 301 tests Node réussis** après la correction du cache, dont la régression
  des quatre paires qui dépassaient l’ancienne limite.
- **522 contrôles Canvas natifs**, quinze scènes et dix-sept captures finales
  inspectées : huit duels de poses contre Faceless Nurse, quatre scènes de
  projectiles et trois arènes.
- **999 admissions de paires de combattants**, 258 de décors/pièces et neuf de
  propriétaires de projectiles ; ces nombres ne désignent pas des combats joués.
- Vérification du paquet réussie. Les **683 anciens assets de la base vague 27**
  sont identiques octet pour octet, avec dix-sept fichiers de règles/classeurs
  protégés inchangés. La vague 27 avait également préservé ses 672 assets de base.

Les contrôles HTTP des deux vagues sont raccordés au workflow, dont treize
scènes nouvelles pour la vague 28. Leur résultat doit être lu dans la CI de
cette PR. Chromium local est bloqué avant ouverture de page par une erreur
`socket() Operation not permitted` ; les captures natives ne le remplacent pas.
La suite Python complète des classeurs avait été interrompue avec `exit 137`
en vague 27 ; ses 105 tests d’outils d’art passaient séparément. Aucune nouvelle
exécution Python complète n’est revendiquée.

## Limites et traçabilité

Les images sont des **candidats statiques non certifiés 1:1**. Les six clips
animés existants sont inchangés. La largeur et la caméra des salles, les gestes
de profil et les effets reposent sur des sources documentées, avec leurs limites
de résolution et d’édition. La première émission de Fire Guardian conserve une
ambiguïté entre la griffe repliée et le bec voisin ; la mesure entre repères
visuels ne certifie pas un raccord au bout du doigt.

Les 26 portraits absents, 36 vues de combat absentes, quatre vues anciennes à
revoir, 38 arènes et 72 commandes de projectile sans image restent suivis.
Les catégories se recoupent ; elles ne forment pas un total unique d’assets.

- [Vague 27 : contenu, sources et limites](docs/production/vague27/README.md)
- [Vague 28 : livraison et vérifications](docs/production/vague28/README.md)
- [Rapport final consolidé](docs/production/vague28/verification.json)
- [Inventaire restant](docs/production/vague28/remaining-assets.json)
- [Audit des clips exacts à compléter](docs/production/vague28/pose-backlog.json)
