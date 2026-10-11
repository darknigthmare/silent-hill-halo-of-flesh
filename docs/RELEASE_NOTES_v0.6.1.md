# SILENT HILL: HALO OF FLESH — Notes de version 0.6.1

## Signal Recovery & Platform Hardening

La v0.6.1 est une release de stabilité construite sur la doctrine lore-first de la v0.6.0. Elle conserve les **230 manifestations**, **4 600 mouvements**, fatalités, arènes et phases de boss, mais renforce la façon dont le jeu se sauvegarde, s’installe, se met à jour et se récupère en cas de panne réseau.

## Contenu conservé

- 230 manifestations jouables, dont 75 boss.
- 20 commandes et 4 600 mouvements documentés.
- 447 actions directement attestées.
- 3 694 composites lore-friendly.
- 459 adaptations Versus explicitement signalées.
- 123 arènes, 374 animations et 123 fatalités environnementales.
- 460 fatalités de combattant.
- 150 transitions de boss.

## Sauvegarde et mémoire

- Export JSON versionné de la progression, des réglages et des relevés.
- Import contrôlé avec validation du schéma et liste blanche de clés.
- Réinitialisation globale des données propres au projet.
- Messages d’état visibles et accessibles pour chaque opération.

## PWA et hors ligne

- Service worker réécrit avec caches statique et runtime distincts.
- Shell critique léger ; `movesets.json` n’est plus préchargé à l’installation.
- Navigation network-first, données network-first et ressources statiques stale-while-revalidate.
- Page hors ligne thématique indépendante.
- Mise à jour et purge du cache pilotables depuis les options.
- Raccourcis PWA pour Confrontation, Observation et Archives.

## Serveur et sécurité

- Véritable page HTTP 404.
- Méthodes autres que GET/HEAD refusées.
- Protection contre la traversée de chemin.
- En-têtes CSP, frame protection, isolation de contexte, nosniff, permissions et référent harmonisés entre serveur local et Vercel.
- Messages iframe limités à la bonne fenêtre et à la même origine.
- Suppression des scripts intégrés dans les routes de compatibilité.

## Accessibilité et performance

- Lien d’évitement, focus visible, fenêtre modale avec piège de focus et restauration.
- États ARIA synchronisés.
- Région de statut système.
- Animation arrêtée lorsque l’application est masquée ou qu’un module est ouvert.
- Respect du mouvement réduit et meilleure position des notifications sur mobile.

## QA

- 63 tests automatisés, 63 réussites.
- 9 modules JavaScript et 9 pages HTML vérifiés.
- Build statique de 37 fichiers.
- 13 parcours Chromium, 20 assertions réussies.
- 0 erreur console, 0 avertissement, 0 exception JavaScript, 0 échec réseau inattendu et 0 débordement horizontal.

## Limites

- La fidélité graphique image par image demeure une production artistique originale distincte.
- Les composites et adaptations Versus ne sont pas présentés comme des animations officielles.
- Le multijoueur réseau et le rollback ne sont pas inclus.
- Les sons distribués restent procéduraux et aucun asset officiel n’est redistribué.
