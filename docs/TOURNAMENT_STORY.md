# Tournoi des Huit et récits de manifestation

Deux modes ajoutés sans modifier le moteur de combat ni les règles de rôle. Ils restent des
**adaptations de versus** : aucune capacité d'une autre œuvre n'est transférée, aucun texte
canonique n'est inventé et aucune fidélité 1:1 n'est certifiée.

## Le Rite des Huit

Un bracket à élimination directe de huit manifestations, dans l'esprit des tournois de jeux
de combat classiques.

- Le joueur choisit un sujet compatible avec le combat. Deux sujets non combattants sont
  refusés avec leur raison documentée ; leur fiche reste consultable.
- Sept adversaires sont tirés de façon déterministe depuis le roster combattant. Un
  représentant par œuvre est retenu en priorité : le rite est une convergence, pas une
  armée de clones.
- Le **rival** est un boss documenté de la même œuvre que le joueur lorsqu'il en existe un ;
  il est placé à l'autre extrémité du bracket et attend en finale. À défaut, un boss d'une
  autre œuvre est retenu, puis un combattant de la même œuvre.
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
- **Adversaires** : trois épreuves tirées parmi les combattants documentés de la **même
  œuvre**, puis le **rival** — un boss de la même œuvre quand il est documenté.
- **Nombre d'adversaires** : trois épreuves + le rival, soit quatre rencontres ; trois
  lorsque l'œuvre ne fournit pas de boss distinct.
- **Clôture** : texte de victoire du moveset suivi du lore du profil, avec la mention
  explicite qu'aucune fidélité 1:1 n'est certifiée.
- Les profils non combattants (Raw Shock, Lisa, Sakura Head…) conservent un récit
  **consultable** sans parcours de combat, avec la raison de rôle affichée.
- Aucune épreuve ni aucun rival ne peut venir d'une autre œuvre, même à nom identique.

Entrées : menu principal → **RÉCITS DE MANIFESTATION**, ou
`modules/unified-versus.html?mode=story&fighter=<identifiant exact>`.

## Contrats techniques

| Fichier | Rôle |
| --- | --- |
| `src/tournament.js` | Génération pure, déterministe, du bracket et des récits. |
| `src/run-progress.js` | Modes `tournament` et `story` dans le même parcours sauvegardé, validé et repris. |
| `src/save-store.js` | Autorisation explicite des deux modes dans le contrat de sauvegarde. |
| `src/versus.js` | Panneau de bracket/récit, libellés de manche, clôture de récit. |
| `tests/tournament-story.test.mjs` | Bracket, rival, isolation par œuvre, falsification, reprise. |

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
| Carton de rival | Composition verticale réservée au boss de la même œuvre. | À produire |
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
