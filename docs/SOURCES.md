# Registre de sources et provenance — v0.4.0

## Principe

Le projet organise un registre de fan-game à partir des manifestations et lieux publiquement documentés. Les descriptions sont reformulées et les visuels sont produits par paramètres internes. Aucun fichier média de référence n’est embarqué.

## Périmètre de catalogue

- Silent Hill
- Silent Hill 2, y compris les formes distinctes du remake
- Silent Hill 3
- Silent Hill 4: The Room
- Silent Hill: Origins
- Silent Hill: Homecoming
- Silent Hill: Shattered Memories
- Silent Hill: Downpour
- Silent Hill: The Arcade
- Silent Hill: Book of Memories
- P.T.
- Silent Hill: The Short Message
- Silent Hill f
- Silent Hill — Film Universe, y compris Return to Silent Hill
- Silent Hill: Ascension
- Silent Hill: Townfall

## Hiérarchie de vérification

1. Sources officielles publiques : pages de jeu, bandes-annonces, communiqués, crédits, manuels et descriptions éditeur.
2. Documentation interne au média : noms affichés, sous-titres, menus, dossiers et séquences identifiables.
3. Guides, ouvrages ou bases secondaires reconnues pour croiser variantes et translittérations.
4. Wikis communautaires comme index de travail, jamais comme unique preuve lorsqu’une source primaire est accessible.

## Statuts conservés dans les données

- `catalogueStatus` : rôle de l’entrée dans le catalogue, par exemple canon rencontré, variante visible ou adaptation de set-piece.
- `nameStatus` : nom officiel/établi, traduction courante, variante qualifiée ou nom descriptif.
- `evidenceTier` : niveau de preuve retenu.
- `canonicalBasis` : comportement, posture, attaque ou symbole ayant servi de base à la fatalité.
- `fidelity` : indique si la séquence recompose un comportement documenté ou constitue une adaptation originale.

## Politique de validation d’un profil

1. Confirmer source et identité.
2. Confirmer le statut de créature, variante, humain hostile, boss ou apparition passive.
3. Ne séparer une variante que lorsqu’elle possède une morphologie, une arme, un comportement, une phase ou une fonction visuellement distincte.
4. Relever échelle, posture et signes distinctifs sans copier d’asset.
5. Résumer le comportement source avec un texte original.
6. Définir séparément l’adaptation de combat.
7. Associer une arène cohérente et une fatalité documentée comme canonique ou originale.
8. Attribuer trait, affliction et personnalité IA justifiables.
9. Pour un boss, documenter les phases d’adaptation sans les présenter comme canoniques.
10. Vérifier qu’aucun média officiel n’est inclus.

## Cas particuliers

### Apparitions passives et set-pieces

Une créature non combattue dans son média peut être ajoutée lorsque sa présence, sa morphologie et sa fonction sont suffisamment documentées pour produire une adaptation jouable. Son statut l’indique explicitement.

### Humains hostiles

Un humain affronté comme boss ou adversaire peut être intégré lorsque le combat constitue une rencontre jouable significative. Le dossier ne le présente pas comme une « créature ».

### Townfall

Le pack est volontairement prudent : lorsque l’éditeur ne fournit pas encore de bestiaire nommé, l’entrée utilise un nom descriptif balisé. Ces appellations ne sont pas annoncées comme des noms officiels.

### Films

Les variantes cinématographiques sont séparées des variantes de jeux lorsque leur silhouette, leur mise en scène ou leur comportement diffèrent. Les adaptations récentes restent balisées par leur média exact.

## Fatalités, IA et phases

Les rites, profils IA, statistiques, phases de boss et fatalités sont des systèmes de gameplay originaux. Ils s’inspirent de l’atmosphère, de la fonction narrative, des armes et du comportement général d’une manifestation, mais ne sont pas présentés comme des mécaniques ou scènes canoniques lorsque ce n’est pas le cas.

## Visuels et animations

Les portraits, combattants, stages, fatalités et animations sont rendus avec des formes, palettes, motifs et effets programmatiques. Les captures de QA montrent le prototype en fonctionnement ; elles ne contiennent aucun sprite, modèle, son ou décor extrait.
