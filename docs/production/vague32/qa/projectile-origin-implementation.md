# Vague 32 — raccord des canons et de la collision

## Périmètre exact

La correction concerne exclusivement `neutralSpecial` de `sh4_man_with_the_coat_067` (SH4) et `sh2_eddie_dombrowski_032` (SH2 original), avec leurs images fixes publiées en vague 31. Les points sont mesurés manuellement sur ces PNG candidats, puis vérifiés à leur échelle réelle de combat. Ils ne constituent pas une mesure des modèles ou effets des jeux originaux.

| Propriétaire | Frame | SHA-256 du PNG | Pixel de canon retenu |
| --- | --- | --- | --- |
| Man with the Coat, SH4 | `neutralSpecial[1]`, 1024×1536 | `d0c7d825135ea5f9d6f05f5e23a94d21fd933abfe7621d74a7eb6d438a64c089` | `(986,300)` |
| Eddie Dombrowski, SH2 original | `neutralSpecial[1]`, 1024×1536 | `e691299ab326b510f72029062963aaf3cacbff7fbad2bd78fb97d5e2a4297321` | `(997,261)` |

Le module `src/projectile-origin.js` exige l'identité et la source exactes, le move réel du profil et de l'attaque active, une pose dédiée statique non bouclée, son index, path, SHA et dimensions. Il refuse les mauvais propriétaires, autres formes de Walter, frames remplacées, fallback idle, supers/desperation, pièges, tirs multiples, air/crouch et phases incompatibles. Dans ces cas, l'origine générique existante demeure applicable. Le calcul ne consulte ni image décodée, ni cache, ni état réseau.

La projection utilise directement `rasterPlacement`, comme le renderer : `actor.x + flip × (localX + muzzleX × scale)` et `actor.y + localY + muzzleY × scale`. La physique stocke ces coordonnées et le renderer affiche ce même projectile. Les orientations opposées sont obtenues par le miroir existant, sans inventer un second point de canon indépendant.

## Déplacement réel du départ de collision

Pour une position analytique debout `(320,594)`, orientée à droite, l'ancienne origine commune est `x=356 ; y=475,75`. Les nouvelles origines valent approximativement :

| Tir | X avant → après | Y avant → après | Déplacement |
| --- | --- | --- | --- |
| Walter | 356 → 399,9643 | 475,75 → 435,4095 | 43,9643 vers l'avant ; 40,3405 vers le haut |
| Eddie | 356 → 402,0377 | 475,75 → 415,4272 | 46,0377 vers l'avant ; 60,3228 vers le haut |

Le calcul analytique initial est archivé dans `projectile-origin-diagnosis.json`. Les captures natives partent des positions de duel ordinaires `x=310/970` ; elles ne réutilisent pas la position analytique comme état injecté.

Le projectile apparaît d'abord au canon dans la simulation, puis parcourt son premier pas normal avant le rendu de cette frame. Sa vitesse reste `±12`, sa vitesse verticale et sa gravité restent nulles, son rayon reste `14,16`, sa durée initiale reste 60 ticks, son `damageScale` reste 1 et les règles existantes de dégâts, garde et traits restent en place. Aucun projectile supplémentaire, aucune image VFX et aucune puissance nouvelle ne sont ajoutés.

## Contact à très courte distance

Le canon dessiné peut dépasser une hurtbox très proche. Faire commencer tout test de contact uniquement au bout de l'arme permettrait alors à la balle de naître derrière cette cible.

Pour les deux tirs strictement liés, le premier `sweptProjectileContact` inclut donc un segment depuis l'ancien départ horizontal (bord avant du corps, `body.w × 0,45`) jusqu'au projectile après son premier mouvement, **à la hauteur réelle du canon**. `emissionSweepFrom` est supprimé avant ce test : le segment n'est jamais rejoué aux frames suivantes. Le contact utilise toujours le résolveur existant et `applyHit`, y compris garde, invulnérabilité et défenses propres aux sources. Les tests vérifient également qu'une cible invulnérable lors de ce premier passage ne reçoit pas un contact rétroactif.

Cette courte zone de départ est une adaptation explicite du versus pour le chevauchement arme/hurtbox. Elle change le couloir de contact des deux tirs. Elle n'élargit pas le rayon et ne crée pas de correction invisible de la hauteur.

## Différences de gameplay observées

- **Cible debout** : les deux tirs touchent réellement le Butcher dans les deux orientations. La garde normale produit le comportement de chip existant, puis l'attaquant termine sa recovery et revient à l'idle.
- **Cible très proche** : un adversaire placé entre le corps et le canon est résolu une seule fois, même quand le début visuel du projectile se trouve déjà au-delà de sa hurtbox. Ces placements de proximité sont des fixtures unitaires déclarées, distinctes des captures natives déclenchées par les commandes ordinaires.
- **Cible accroupie** : le nouveau tir neutre haut d'Eddie peut passer au-dessus du Butcher accroupi. La collision suit effectivement le canon.
- **Needler** : le haut de sa hurtbox debout est à `y=434,35`. Le centre du tir neutre d'Eddie est à `415,4272` ; avec le rayon inchangé de `14,16`, son bord inférieur est à `429,5872`. Il passe donc au-dessus, sans dégât, parade ni récompense inventée. La politique de parade du Needler reste testée avec le `downSpecial` existant d'Eddie, dont le couloir touche réellement ses lames. Ce tir frontal est dévié sans chip ni crédit de dégâts ; le tir arrivant de derrière après le croisement du tireur touche toujours.
- **Autres attaques** : supers/desperation, autres formes, autres propriétaires et profils de projectiles gardent leur origine générique et leurs paramètres. Les fixtures de refus protègent ce périmètre.

## Fichiers de tests et preuves

| Fichier | Vérification ou adaptation |
| --- | --- |
| `tests/projectile-origin.test.mjs` | 17 nouveaux tests : deux propriétaires × deux orientations, projection/canon, vrais projectiles et rendu, contacts debout, garde, proximité, invulnérabilité, crouch, recovery, refus et origines génériques préservées. |
| `tests/source-combat-expansion.test.mjs` | Deux scénarios de parade/croisement utilisent le `downSpecial` réel qui intersecte Needler ; ajout d'un scénario distinct où `neutralSpecial` passe au-dessus. Les règles de dégâts et de classification des armes restent testées. |
| `tests/stage-bitmap-build.test.mjs` | Nouveau test d'invalidation de révision lors d'un changement de point de canon sans changement de PNG ; fixture munie du vrai module. |
| `tests/projectile-bitmaps.test.mjs` | Fixture de révision complétée par le module désormais requis ; contrats de projectiles inchangés. |
| `tests/art-batch4-contracts.test.mjs` | Deux tests distincts pour le défaut de QA historique, sans effet sur le moteur. |

La suite ciblée des origines, résolutions et comportements de source compte **133 tests réussis**. `qa-projectile-origin-native.mjs` fournit **137 vérifications et quatre captures réelles** du `FightEngine`, sans injection d'acteur/attaque/caméra/horloge. Le maximum d'erreur entre point de canon transformé par le `drawImage` observé et origine physique est `0,0000339619786139` pixel. Les entrées empruntent les callbacks enregistrés de `InputState` et la sortie d'attaque est naturelle.

`characters/qa-http-origins.mjs` transpose ce contrôle au navigateur avec interface/clavier ordinaires, octets HTTP vérifiés, observation passive du Canvas et du vrai projectile, puis retour à l'idle. Les preuves locales natives ne sont pas présentées comme des résultats Chromium : le navigateur local manque son binaire. Le succès HTTP doit être attribué au run CI qui l'exécute.

Les timings originaux, silhouettes, VFX et animations 1:1 restent à valider à partir des sources originales. Le raccord exact vérifié ici est celui du PNG candidat publié avec la physique et le rendu actuels du versus.
