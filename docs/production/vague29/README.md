# Vague 29 — cinq arènes, trois projectiles et état des lieux

Livraison du **25 novembre 2026**, à partir du commit
`2af87b6a1a8740a0759ce7c8c2746be19c48f4af`, pour la
[PR #11](https://github.com/darknigthmare/silent-hill-halo-of-flesh/pull/11).

Cette passe ajoute **13 PNG natifs indépendants** : dix plans pour cinq arènes
et trois images de projectile reliées à dix commandes existantes. Les décors
passent de **85 à 90 sur 123** et les commandes de projectile avec image dédiée
de **14 à 24 sur 86**. Les portraits, bases de personnages, costumes et clips
animés ne changent pas.

Le [bilan détaillé par catégorie et par œuvre](final-inventory.md) est calculé
depuis les manifestes actifs. Il contient également la liste des profils,
arènes et commandes encore sans image. Son [JSON](final-inventory.json)
conserve les identifiants, chemins, états et empreintes des sources.

## Contenu ajouté

| Partie | Élément | Plans / images | Commandes nouvellement couvertes |
| --- | --- | ---: | ---: |
| The Arcade | Couloir normal de Brookhaven, édition 2007 | 2 | — |
| Book of Memories | Salle de Light World, Zone 8 | 2 | — |
| Book of Memories | Salle de Steel World, Zone 19 | 2 | — |
| Film de 2006 | Galerie supérieure de Midwich en Otherworld | 2 | — |
| Film de 2006 | Nef protégée, vers l’entrée arrière, avant l’intrusion | 2 | — |
| Silent Hill | Nuage acide de Floatstinger | 1 | 4 |
| Homecoming | Jet toxique d’Asphyxia | 1 | 3 |
| Ascension | Jet de feu de l’Immolator | 1 | 3 |
| **Total** | **5 arènes et 3 effets** | **13 PNG** | **10** |

Chaque arène possède un fond opaque et un avant-plan transparent indépendant.
Les bordures proches utilisent la parallaxe déjà disponible dans le moteur.
Les projectiles sont liés à leur profil et à leur édition exacts. Ils ajoutent
une représentation aux commandes présentes, sans créer de nouveaux coups.

Les fichiers représentent **17 379 992 octets**. Les neuf plans de décor de
1672 × 941 et le premier plan de Brookhaven de 1671 × 941 gardent leurs tailles
natives. Les trois effets font 1536 × 1024. Aucun réencodage, recadrage,
redimensionnement ou nettoyage d’alpha n’a été appliqué aux PNG livrés.
Les dimensions, SHA-256, fichiers et reçus figurent dans [summary.json](summary.json).

## Références et limites visuelles

Les dossiers de production contiennent les références sélectionnées, leurs
URL et empreintes, les observations, les prompts exacts et les reçus ImageGen :

- [Couloir de Brookhaven Arcade](extra-stages/source-review.json) : deux
  captures du jeu original de 2007. Le couloir normal reste distinct de
  l’Otherworld orange. Les ouvertures et espacements de la vue latérale sont
  des extensions de composition, pas des dimensions mesurées dans le jeu.
- [Les quatre autres arènes](stages/README.md) : captures de gameplay de Book
  of Memories, éléments originaux de production pour Steel World et images
  du film de 2006. Les salles procédurales de Light et Steel combinent des
  motifs de leurs zones respectives. Midwich reste en phase Otherworld ;
  l’église reste avant l’intrusion finale.
- [Les trois projectiles](projectiles/README.md) : nuage diffus observé pour
  Floatstinger, émission sombre pour Asphyxia, jet de feu dans une vidéo
  officielle Genvid pour l’Immolator. Les références vidéo sont petites ;
  elles n’établissent pas tous les détails du volume produit.

Le statut reste **candidat statique intégré, fidélité `unverified`**. Une image
générée et intégrée ne constitue pas une certification 1:1. Les résolutions
sont celles indiquées ci-dessus ; aucune affirmation de 4K natif n’est faite.

Le moteur conserve les poses et points d’émission existants. Le nuage d’Asphyxia
apparaît à hauteur du torse/de la taille : son raccord à la bouche n’est pas
certifié. Le corps de l’Immolator masque partiellement la première émission,
puis la flamme devient clairement visible devant lui. Les vues opposées
emploient le miroir du moteur. Ces observations sont consignées dans la
[revue visuelle des projectiles](qa-final-projectiles/visual-review.json).

Twinfeeler et le Straight-Jacket d’Origins restent sans nouvelle image : les
références examinées n’établissent pas assez clairement leur émission.
Les sujets ayant fait l’objet d’un refus explicite dans les lots précédents
n’ont pas été réessayés ni remplacés par une variante.

## Vérifications réalisées

| Contrôle | Résultat | Périmètre |
| --- | ---: | --- |
| `npm run verify` | Réussi | Références, génération des données, audit des PNG et validation du paquet sans copie de distribution |
| Tests Node ciblés | **74 / 74** | Décors, projectiles, sprites et budgets des caches ; aucun échec ni test ignoré |
| Canvas natif : Brookhaven | **47 contrôles** | 1 scène, 1 capture |
| Canvas natif : les quatre autres arènes | **140 contrôles** | 4 scènes, 4 captures |
| Canvas natif : projectiles | **205 contrôles** | 6 scènes, 12 captures, deux orientations par effet |
| Éligibilité des finishers liés au plafond | **60 cas identiques à la base** | 180 appels de la vraie API comparant la base, l’état intermédiaire et l’état corrigé |
| Intégrité des anciens assets | **695 / 695 identiques** | Comparaison des octets avec le commit de base |
| Fichiers de règles et classeurs protégés | **17 / 17 identiques** | Aucun changement d’identifiants, de règles ou de classeur |

Les **392 contrôles natifs**, **11 scènes** et **17 captures** concernent le
vrai moteur `FightEngine.update/render`, piloté via ses entrées habituelles.
Les fichiers PNG sont hashés et décodés, avec vérification d’égalité des pixels
pour l’adaptation du décodeur natif. Les positions, vitesses ou états des
combattants et projectiles ne sont pas injectés. Le mode d’entraînement et
la jauge libre servent uniquement à rendre les commandes accessibles.

Les dix-sept captures ont été inspectées. Les zones de marche restent
dégagées et les effets ont un fond transparent. Pour chaque projectile,
`neutralSpecial` a été joué dans les deux emplacements de joueur ; les autres
commandes associées ont été vérifiées par les contrats de données. Cela ne
constitue pas une matrice complète de tous les coups, impacts et gardes.

L’exécutable Chromium est absent de l’environnement local. La tentative de
prévalidation HTTP sur une arène déjà existante n’a produit aucune scène
navigateur ni capture. Les contrôles Canvas ne sont donc pas annoncés comme
des tests Chromium, DOM, HTTP ou de mise à jour du service worker. Le statut
de la CI distante doit être lu sur la PR pour le commit effectivement publié ;
les succès historiques des vagues 27–28 ne sont pas attribués à cette vague.

Preuves : [intégrité et tests ciblés](final-verification.json),
[revue d’intégration](integration-review.json), [vérification du paquet](verify.log),
[Brookhaven](qa-final-hospital/report.json),
[quatre arènes](qa-final-stages/report.json),
[projectiles](qa-final-projectiles/report.json) et
[limite du navigateur local](browser-baseline/report.json).

La revue finale a détecté que déclarer un appui de plafond dans les deux salles
de Book of Memories autorisait 24 plans de fatalité supplémentaires. Les deux
valeurs `geometry.ceiling` sont corrigées à `false` : le plafond peint
n’établit pas un support utilisable pour ces actions. Les 60 plans comparés
avec `loreFinisher` sont maintenant identiques à la base. Voir le
[contrôle d’éligibilité](ceiling-eligibility-review.json). Les contrôles natifs
et les 74 tests ont été rejoués sur les manifestes corrigés ; les 17 captures
finales sont identiques octet pour octet aux captures déjà inspectées.

Le reçu d’import des quatre arènes conserve son empreinte historique. Un
snapshot reconstitué a été validé contre son SHA-256. La livraison finale
diffère seulement par son horodatage, les deux valeurs de support de plafond
et deux notes explicatives. Les huit PNG sont identiques ; les quatre
compositions finales correspondent au manifeste corrigé. Voir la
[vérification de finalisation](stages/delivery-finalization.json).

## État des lieux après cette passe

| Partie | Présent | Total suivi | Reste | Couverture |
| --- | ---: | ---: | --- | ---: |
| Portraits de sélection | 204 | 230 profils | 26 | 88,7 % |
| Bases de combat de profil, candidates | 190 | 230 profils | 36 absentes + 4 anciennes à revoir | 82,6 % |
| Boss : portraits | 63 | 75 boss | 12 | 84,0 % |
| Boss : bases de profil candidates | 57 | 75 boss | 15 absentes + 3 anciennes | 76,0 % |
| Arènes avec scène bitmap active | 90 | 123 arènes | 33 | 73,2 % |
| Commandes de projectile illustrées | 24 | 86 commandes | 62 | 27,9 % |
| Profils avec au moins un projectile illustré | 8 | 31 profils | 23 | 25,8 % |
| Intros des chroniques configurées | 15 | 15 | 0 | 100 % |
| Endings des chroniques configurées | 15 | 15 | 0 | 100 % |
| Scènes rival ou observation | 15 | 15 | 0 | 100 % |
| Idles des contextes d’armes déclarés | 3 | 4 | 1 | 75 % |
| Clips à plusieurs images distinctes | 6 | Périmètre final non défini | Non chiffré | — |
| Fidélité de personnage certifiée | 0 | 230 profils | Validation nécessaire | 0 % |

Les boss et variantes font partie des 230 profils ; ils ne s’ajoutent pas au
roster. Les 190 bases candidates comprennent aussi des rôles sans combat :
187 profils ont le combat activé, ce qui est un autre indicateur. Les fichiers
de sélection et de combat restent séparés pour les 190 vues candidates.

Les **79 fiches de variantes** possèdent 67 portraits et 60 bases de profil
candidates ; 17 bases sont absentes et 2 anciennes restent à revoir. Ces
fiches comprennent des tailles, armes, formes et éditions. Elles ne définissent
pas 79 costumes. Les trois idles d’armes présents concernent le couteau,
le pistolet et le tuyau de Memory of Alessa ; le SMG reste absent, avec son
refus antérieur documenté.

Les décors totalisent **178 PNG**, **92 pièces/variantes** enregistrées et
**86 scènes par défaut avec parallaxe**. Les huit images de projectile
couvrent 24 commandes : sept profils sont entièrement couverts dans ce
périmètre et un, Earth Guardian, ne l’est que partiellement.

Les histoires comptent **48 illustrations** pour **15 chroniques** : 15 intros,
15 endings, 12 rivaux, 3 observations et 3 apparitions supplémentaires. Cette
couverture n’annonce pas une histoire individuelle pour les 230 profils.

Les manifestes référencent **686 fichiers distincts** : 452 fichiers de
personnages/portraits, 178 plans de décor, 8 projectiles et 48 illustrations.
Les 708 fichiers sous `assets/` incluent aussi 22 fichiers non référencés par
ces quatre manifestes. Les unités se recoupent : un nombre de commandes,
un nombre d’images et un nombre de personnages ne doivent pas être additionnés.

Les données de jeu décrivent **4 600 commandes, 460 fatalités, 150 phases de
boss, 64 animations d’arène et 26 événements de lieu**. Ce sont des définitions
de gameplay, pas autant de clips graphiques achevés. Les props isolés, costumes,
VFX hors projectiles et SFX enregistrés ne disposent pas d’un catalogue final
séparé permettant un pourcentage honnête ; le son courant est synthétisé via
Web Audio.

Sur les **33 arènes restantes**, 15 ont un blocage de référence explicite et
18 n’ont pas ce marqueur. L’absence de marqueur ne prouve pas que les sources
visuelles sont suffisantes. Le [rapport complet](final-inventory.md) détaille
ces arènes, les 40 profils de combat absents ou anciens et les 62 commandes
de projectile sans image, avec le bilan des seize œuvres/packs runtime.

## Reproduire le recensement

```bash
node docs/production/vague29/build-inventory.mjs --output-prefix final-inventory
node docs/production/vague29/build-inventory.mjs --output-prefix final-inventory --check
```

Le commit de base est la référence de comparaison du lot. Les expressions
« absent du commit de base » dans les rapports ne signifient pas que le fichier
manque au commit publié de la vague 29. La PR fournit l’état de publication.
