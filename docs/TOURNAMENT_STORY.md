# Tournoi des Huit et récits de manifestation

**Association au guide commun, 25 novembre 2026 :** [campagne, récits et
Dénouements](combat-guide/CAMPAGNE_ET_DENOUEMENTS.md) complète ces structures.
Le [bilan calculé](combat-guide/ETAT_DES_LIEUX.md) distingue dossier, profil admis
et récit avec adversaires. Les rivalités calculées restent des choix de versus.

Deux modes ajoutés sans modifier le moteur de combat ni les règles de rôle. Ils restent des
**adaptations de versus** : aucune capacité d'une autre œuvre n'est transférée, aucun texte
canonique n'est inventé et aucune fidélité 1:1 n'est certifiée.

## Le Rite des Huit

Un bracket à élimination directe de huit manifestations, dans l'esprit des tournois de jeux
de combat classiques.

- Le joueur choisit un sujet compatible avec le combat. Les sujets non combattants sont
  refusés avec leur raison documentée ; leur fiche reste consultable.
- Sept adversaires sont tirés de façon déterministe depuis le roster combattant. Un
  représentant par groupe source du moteur est retenu en priorité : le rite est une
  convergence. Les éditions internes aux groupes agrégés restent à distinguer.
- Le **rival** est un boss admissible du même groupe source que le joueur lorsqu'il en existe un ;
  il est placé à l'autre extrémité du bracket et attend en finale. À défaut, un boss d'une
  autre source est retenu, puis un combattant du même groupe source.
- Trois rencontres sont jouées : quart de finale, demi-finale, finale. Chaque adversaire
  combat sur l'arène associée à son propre profil. Le joueur doit vaincre trois sujets.
- Une défaite conserve le bracket et permet de rejouer la rencontre en cours. La santé n'est
  pas reportée : chaque manche repart pleine, comme dans un tournoi classique.
- Le bracket est régénéré à l'identique depuis la graine enregistrée ; un parcours modifié
  est refusé au chargement.

Entrées : menu principal → **TOURNOI DES HUIT**, ou
`modules/unified-versus.html?mode=tournament&seed=1234`.

## Récits de manifestation

Chaque fiche du catalogue possède un récit dérivé de ses données existantes.

- **Introduction** : texte déjà authored du moveset (`presentation.intro`).
- **Adversaires** : jusqu'à trois épreuves tirées parmi les combattants du **même
  groupe source du moteur**, puis le **rival** — un boss de ce groupe quand il est
  disponible. Le groupe `film` agrège plusieurs films ; l'édition fine doit être
  contrôlée avant d'en faire une route propre à un film.
- **Nombre d'adversaires** : jusqu'à trois épreuves, plus un rival s'il est disponible,
  soit zéro à quatre rencontres. Un parcours de récit exige un sujet admis au combat
  et une file d'adversaires non vide.
- **Clôture** : texte de victoire du moveset suivi du lore du profil, avec la mention
  explicite qu'aucune fidélité 1:1 n'est certifiée.
- Les profils non combattants (Raw Shock, Eileen Head, Sakura Head…) conservent un récit
  **consultable** sans parcours de combat, avec la raison de rôle affichée.
- Aucune épreuve ni aucun rival ne vient d'un autre groupe source. Cette règle ne
  garantit pas l'isolement par édition à l'intérieur d'un groupe agrégé.
- `pt_lisa_149` est admise comme rencontre scénarisée dans la politique actuelle,
  mais son récit individuel n'a aucun adversaire P.T. distinct : il ne lance
  aucun parcours. La Chronique `loop_204863` conserve sa rencontre contre Lisa.

Entrées : menu principal → **RÉCITS DE MANIFESTATION**, ou
`modules/unified-versus.html?mode=story&fighter=<identifiant exact>`.

## Contrats techniques

| Fichier | Rôle |
| --- | --- |
| `src/tournament.js` | Génération pure, déterministe, du bracket et des récits. |
| `src/run-progress.js` | Modes `tournament` et `story` dans le même parcours sauvegardé, validé et repris. |
| `src/save-store.js` | Autorisation explicite des deux modes dans le contrat de sauvegarde. |
| `src/versus.js` | Panneau de bracket/récit, libellés de manche, clôture de récit. |
| `tests/tournament-story.test.mjs` | Bracket, rival, isolation par groupe source, falsification, reprise. |

Le format enregistré est `rite-of-eight-v1` pour le tournoi et `monster-story-v1` pour les
récits. Toute divergence entre la graine, la file d'adversaires et les arènes invalide la
sauvegarde plutôt que de la réécrire.

## Illustrations à produire

Aucune image n'est créée par cette livraison. Les éléments ci-dessous sont des
**spécifications** ; ils restent au statut « à produire » tant qu'un PNG revu n'est pas
importé.

### Tournoi

| Élément | Description | Statut |
| --- | --- | --- |
| Fond du bracket | Salle circulaire de l'Otherworld, huit stèles de pierre et poussière en suspension ; lisibilité prioritaire sur l'ornement. | À produire |
| Écusson du rite | Sceau à huit branches, métal terni et traces de doigts ; décliné en 192 px et 512 px. | À produire |
| Cartes de quarts | Huit vignettes 3:4, une par participant, fond neutre pour accepter tous les sprites. | À produire |
| Transition de manche | Voile de brume qui balaie l'écran entre deux rencontres, sans texte incrusté. | À produire |
| Entrée du rival | Plan large fixe du rival dans son arène, avant la finale. | À produire |
| Carton de champion | Cadre vertical pour le vainqueur, sans couronne ni trophée génériques. | À produire |

### Récits

| Élément | Description | Statut |
| --- | --- | --- |
| Carte d'introduction | Portrait du sujet à gauche, texte du catalogue à droite, fond propre à l'œuvre. | À produire |
| Carton d'épreuve | Bandeau discret « ÉPREUVE 1/2/3 » réutilisable, sans visuel de monstre. | À produire |
| Carton de rival | Composition verticale du rival retenu dans le groupe source ; édition fine à contrôler. | À produire |
| Carte de clôture | Fond de brume et cadre de dossier ; le texte de victoire est fourni par le catalogue. | À produire |

Contraintes communes : PNG transparents, un sujet par fichier, aucune arme ou anatomie
empruntée à une autre édition, aucune capture officielle redistribuée. Les cartes de texte
ne doivent pas figer la typographie du jeu afin de rester lisibles en portrait.

## Limites

- Les chances et les récompenses restent celles du moteur existant ; aucun nouvel équilibrage.
- Les adversaires simulés du bracket ne sont pas joués : seules les rencontres du joueur
  sont réelles.
- La revue visuelle du bracket et des récits en jeu reste à faire.
- Aucun test navigateur complet n'est exécuté par cette livraison.
