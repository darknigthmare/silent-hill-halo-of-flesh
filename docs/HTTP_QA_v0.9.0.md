# Validation HTTP indépendante v0.9.0
Date : 14 octobre 2026.

Cette note complète les rapports locaux QA_v0.9.0.md et QA_v0.9.0.json, rédigés avant l'exécution de la CI HTTP. Leur indication initiale « non exécuté » décrit cet état antérieur, pas le résultat final ci-dessous. Aucun code applicatif n'est modifié par cette note.

## Preuves vérifiées
- Commit applicatif : `6acae343a89d5e1a2de243efb09dc17488c3fa33`.
- QA Node : https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/38538091142 — SUCCESS, 202 tests.
- QA HTTP : https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/38538091330 — SUCCESS.
- Rapport HTTP téléchargé et relu : 14/14 assertions, zéro exception JavaScript ; Chromium 143.0.7499.4 sur runner GitHub Ubuntu.
- Artifact `http-qa-v090`, ID `11880463249`, ZIP 2 173 272 octets, SHA-256 `21bb12067f303fad4de2b6e4d6d9f46b6204a070b46a1b6c26713b3bbd27a239` ; trois captures réelles, rapport JSON. Le paquet final QA conserve cette preuve au-delà de la rétention de 14 jours du runner.

## Couverture réellement exécutée
Démarrage du serveur, menu principal, iframe de sélection same-origin, remappage persistant après rechargement HTTP, saut au clavier après introduction normale, dialogue de pause, arrêt du chronomètre, retour du focus, lancement d'une Chronique depuis son menu, reprise exacte à la deuxième rencontre, contrôle de la page par le service worker, rechargement hors ligne du shell mis en cache et dialogue de commandes à une largeur de 430 pixels.

Le test de checkpoint injecte un résultat de combat terminé. Cela teste la progression réelle après un résultat, pas une victoire jouée. Aucun résultat de fin de match n'est injecté pour le test de saut ou de pause.

## Préversion Vercel
Déploiement `dpl_94ADLwH8suVt7visfbTTAnjpdzX3` : READY, commit applicatif ci-dessus, environnement preview, aucune promotion de production.
https://silent-hill-halo-of-flesh-p0s1vs52y-darknigthmares-projects.vercel.app
La page /offline.html a renvoyé HTTP 200 et v0.9.0. Ce contrôle de réponse ne remplace pas une session de navigation sur Vercel.

## Limites et préparation commerciale
La condition globale HTTP/PWA reste ouverte : migration de cache entre versions, perte de réseau au cours de tous les modes, Firefox/WebKit et appareils physiques ne sont pas validés. Le blocage local ERR_BLOCKED_BY_ADMINISTRATOR subsiste ; l'environnement GitHub dispose de son propre navigateur normal, sans contournement de cette politique locale.
Les fichiers de préparation commerciale doivent donc rester non approuvés. Aucun droit Silent Hill, asset final, parcours intégral sans résultat simulé, test de manette réelle, budget matériel ou installateur commercial n'est certifié par ces contrôles.
