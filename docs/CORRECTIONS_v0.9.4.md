# v0.9.4 — Commandes, reprise de parcours et cache hors ligne

Continuation de la PR #4 depuis `a9d3d44776da5a25b5614aebc78b613dc71b2231`.
Cette passe corrige le comportement du jeu existant. Aucun sprite ni décor nouveau
n'est ajouté et aucun profil de combat, coup, dégât ou document canonique n'est modifié.

## Défauts corrigés

### Commandes tactiles et clavier

Maintenir la garde tactile conservait la valeur `pressed` indéfiniment et réouvrait
la fenêtre de parade parfaite à chaque tick. Le front de pression est maintenant
consommé une fois. Relâcher la garde tactile produit un seul front de relâchement.
La garde agrège clavier, tactile et manette : un deuxième périphérique ne réarme
pas la parade tant que la garde reste tenue, et relâcher un périphérique ne relâche
pas les autres.

Les événements de clavier déjà consommés, les raccourcis Ctrl/Alt/Meta, la composition
et les zones éditables n'injectent pas d'attaque. Un `keyup` sans pression détenue
n'est pas un relâchement de jeu. Après un changement de focus ou une remise à zéro,
un événement `repeat` ne simule pas une nouvelle pression. La pause refuse les
nouveaux inputs et la désactivation des touches tactiles libère les touches tenues.

Chaque pointeur tactile appartient à un moteur et à une génération d'inputs.
Deux doigts sur un bouton ne redéclenchent pas l'action ; la dernière libération
termine le maintien. Un ancien `pointerup`, `pointercancel` ou `lostpointercapture`
ne peut pas annuler une commande d'un nouveau combat. Le contrat est testé avec
plusieurs pointeurs synthétiques ; les appareils physiques restent à tester.

### Reprise et continuation

La reprise d'un checkpoint ou le bouton Combat suivant construisent un candidat
sans remplacer immédiatement `state.run`. Le candidat ne devient actif qu'après
la vérification graphique réussie. Un échec conserve la victoire, l'index, le
moteur précédent et les données persistantes. Une seconde tentative vise le même
combat suivant, sans rechargement de page. La reprise bloquée ne remplace plus le
personnage ni les réglages affichés. Les tentatives de Chroniques ne sont pas
augmentées par une simple reprise.

Recommencer depuis la pause conserve le dialogue pendant la vérification. L'erreur
apparaît dans le dialogue accessible, qui reste utilisable. Il ne se ferme qu'au
lancement effectif. Les réglages désactivés par Observation sont réinitialisés
lors de l'activation d'un parcours.

### Sélection

L'aléatoire respecte une liste filtrée vide, plutôt que d'ignorer les filtres.
Le choix du deuxième sujet exclut le premier sans boucle de tirage potentiellement
infinie. Retirer un favori réapplique immédiatement le filtre des favoris.

### Cache PWA

Un cache vide hors ligne renvoie une vraie réponse HTTP 503 quand aucune page de
secours n'est disponible. L'ancienne expression utilisait une promesse comme une
valeur booléenne et pouvait renvoyer `undefined`.

Un échec de CacheStorage ou un dépassement de quota ne jette plus une réponse
réseau valide : les pages, données et PNG continuent à être servis en ligne.
La copie runtime récente est prioritaire sur la copie statique de la même version.
Les mises à jour en arrière-plan sont rattachées à `FetchEvent.waitUntil`.
Le cache runtime est borné à 128 entrées, sans toucher aux fichiers précachés.
Les fichiers absents ne reçoivent jamais une page HTML de secours à la place de JS.

### Atelier

Les montages de travail restent disponibles lors d'un aller-retour entre deux
poses du même inspecteur, même avant Prévisualiser. Ils ne sont pas sauvegardés
sur disque : exporter avant de quitter la fiche ou de recharger reste nécessaire.
Une calibration invalide visible bloque l'export au lieu d'exporter discrètement
les anciennes valeurs valides.

Les exports de calibration passent au schéma 2 et contiennent `previousFrames`
(identités, empreintes, ancres, hauteur et direction d'origine). Un export périmé
ne peut plus écraser une calibration plus récente utilisant les mêmes PNG.
Les paquets schéma 1 restent vérifiables sans écriture, mais leur application est
refusée : refaire l'export depuis l'inspecteur courant. Le CLI lit un tampon borné,
refuse les champs additionnels et les répertoires d'assets liés symboliquement.

## Vérification

Avant les corrections, 20 des 21 nouveaux tests de commandes/cache échouaient
sur la base v0.9.3. Après corrections, la suite locale compte 352 tests Node et
68 tests Python réussis. Les anciens tests restent exécutés, sans exclusion.

`npm test` reconstruit et vérifie le moteur. `npm run test:art` exécute les outils
Python (Pillow nécessaire). Après installation de Playwright, `npm run qa:browser`
exécute les cinq suites HTTP. Le workflow GitHub conserve les rapports et captures.
Les résultats HTTP du commit livré sont donnés dans le rapport de livraison,
pas présumés à partir des seuls tests unitaires.

La suite de reprise inclut un résultat et un checkpoint préparés, une panne de
préchargement injectée et un cache volontairement vidé. Ce ne sont pas des campagnes
jouées. Les tests de quotas exécutent le vrai service worker dans un environnement
CacheStorage simulé ; le contrôle hors ligne est aussi prévu en Chromium HTTP.
La navigation HTTP locale est bloquée par la politique du navigateur ; aucune
modification de cette politique n'est faite. Le runner GitHub exécute les tests HTTP.

## Limites artistiques et déploiement

Toujours 2 candidats individuels / 230 profils, 228 profils sans image acceptée,
0 animation de production, 0 fidélité 1:1 certifiée. Les images de référence Yautja
ne sont pas réaffectées à des monstres Silent Hill. Les décors et effets restent
procéduraux. Les essais physiques, le canon détaillé et la revue artistique demeurent
séparés des tests techniques. Aucun changement de facturation ni fusion automatique.

Références techniques consultées : MDN, `KeyboardEvent.repeat` et
`ServiceWorkerGlobalScope: fetch event`. Elles documentent les événements du navigateur,
non le lore de Silent Hill.
