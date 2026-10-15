# QA v0.9.0 — Parcours joueur et fiabilité
Date : 14 octobre 2026. Base GitHub : `c0858f74ef261bf1a943a7e3c87d586d88e3d194` (PR #2 fusionnée).

## Contrôles locaux réellement exécutés
`npm test` : **202/202** tests Node, zéro échec, zéro test ignoré. Base : 146 ; nouveaux : 56. Build vérifié : 20 modules JS, 9 pages HTML, 49 fichiers statiques.

Les nouveaux tests couvrent les transitions de parcours, leurs checkpoints et la reprise des 15 Chroniques à chaque rencontre, l'attribution par emplacement de joueur en duel miroir, les statistiques personnelles sur défaite, les rappels de résultat doublés, le cumul des performances du parcours, les commandes personnalisées, les index de manettes clairsemés, la pause à la déconnexion et la gestion des deux boutons de garde.

La sauvegarde est éprouvée contre JSON endommagé, mauvais types, entrées non autorisées, pollution de prototype, version future, parcours forgé ou incompatible, règles de combat injectées, panne de quota et restauration après import interrompu. Cela ne constitue ni une protection anti-triche ni une transaction distribuée entre onglets.

## Interface réelle en mémoire, périmètre explicite
`python scripts/ui-qa-v090.py` : **16/16 assertions**, 6 captures. Modules et styles du projet réellement exécutés dans Chromium, avec interactions clavier et pointeur. Les modules sont chargés via Blob en mémoire ; le stockage est une implémentation WebStorage simulée et le paramètre `qa=1` est injecté par le harnais.

Contrôles : sélection, dialogue de remappage, conflit de touches, saut clavier, saut tactile, pause et reprise au clavier, focus, défaite miroir, statistiques personnelles, restauration de parcours, passage à la deuxième rencontre, bannière de reprise, annulation d'un ancien résultat différé, dialogue à 430 × 932. Aucun accès HTTP dans ce harnais ; les requêtes Blob observées sont locales à la page. Zéro exception JavaScript. Les résultats de fin de match utilisés pour la progression sont des fixtures : ce ne sont pas des victoires jouées et ne prouvent pas l'équilibrage.

## Navigation HTTP locale
La tentative normale vers `http://127.0.0.1:4173/` a été refusée avec `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Aucun proxy, changement de politique ou contournement n'a été appliqué. La PWA, la navigation réelle, le stockage navigateur persistant et les mises à jour de cache ne sont pas validés par le harnais en mémoire.

Un script séparé `scripts/http-qa-v090.mjs` et un workflow GitHub Actions `browser-qa.yml` réalisent un contrôle HTTP sur un runner disposant de son propre environnement de test : menu/iframe, touches persistantes, saut après l'introduction, pause, lancement d'une Chronique, reprise de checkpoint, shell hors ligne et dialogue mobile. Leur résultat doit être vérifié dans GitHub Actions ; leur présence n'est pas un succès de test.

## Non couvert / acceptation restant nécessaire
Manettes et téléphones physiques, WebKit/Safari, Firefox, performances matérielles, longues sessions, installateurs desktop et parties intégrales sans résultats injectés. Les 230 profils et 4 600 commandes restent des données héritées : aucun nouvel audit exhaustif de fidélité 1:1 n'est revendiqué. Les dessins restent des silhouettes procédurales de prototype.
