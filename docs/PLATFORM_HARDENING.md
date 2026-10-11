# Durcissement de plateforme — v0.6.1

La v0.6.1 stabilise la distribution du prototype sans modifier le catalogue, les doctrines ni l’équilibrage de la v0.6.0. Son objectif est de rendre la version publiée plus fiable sur navigateur, PWA, mobile et hébergement statique.

## Service worker et mode hors ligne

- Séparation du cache statique critique et du cache d’exécution.
- Pré-cache réduit au shell indispensable ; le lourd export `movesets.json` n’est plus téléchargé pendant l’installation.
- Navigation **network-first**, avec repli vers `offline.html` lorsque le réseau et le cache de page sont indisponibles.
- Données JSON **network-first** afin d’éviter de conserver silencieusement un catalogue obsolète.
- Ressources statiques **stale-while-revalidate** pour conserver une interface rapide tout en actualisant le cache.
- Refus de mettre en cache les réponses opaques, les erreurs HTTP, les réponses `no-store` et les requêtes partielles.
- Nettoyage automatique des anciens caches lors de l’activation.
- Messages contrôlés `SKIP_WAITING`, `CLEAR_CACHES` et `GET_VERSION`.
- Notification de l’interface lorsqu’un nouveau service worker est activé ou qu’un cache a été vidé.

## Sauvegardes et récupération

La mémoire locale peut désormais être exportée dans un document JSON versionné `shhf-memory-v1`, puis réimportée après validation. Le transfert couvre la progression, les paramètres et les relevés du projet sans lire ni exporter les données d’autres sites.

Les opérations disponibles sont :

- export de la mémoire locale ;
- import avec contrôle du schéma et des clés autorisées ;
- remise à zéro complète des clés du projet ;
- purge du cache hors ligne puis réarmement du service worker.

## Serveur statique et erreurs HTTP

Le serveur local et la configuration Vercel ont été alignés :

- prise en charge distincte de `GET` et `HEAD` ;
- refus des méthodes d’écriture avec code 405 ;
- véritable réponse 404 au lieu d’un faux retour vers la page principale ;
- page `404.html` thématique et page `offline.html` indépendante ;
- protection contre la traversée de répertoires ;
- résolution des routes HTML sans extension ;
- en-têtes `nosniff`, politique de référent, politique de permissions, CSP, protection d’encadrement et isolation de contexte.

## Accessibilité et contrôle d’interface

- lien d’évitement vers le contenu principal ;
- états `aria-pressed` synchronisés pour les bascules ;
- fenêtre d’options annoncée correctement et retirée de l’arbre d’accessibilité lorsqu’elle est fermée ;
- piège de focus, fermeture Échap et restauration du focus ;
- messages système en région vivante ;
- focus visible au clavier ;
- animation suspendue lorsque la page est masquée ou qu’un module plein écran est ouvert ;
- respect du réglage de mouvement réduit ;
- validation de la source et de l’origine des messages envoyés par les modules embarqués.

## Installation PWA

Le manifeste définit désormais l’identité, la langue, la portée, l’orientation, les catégories et trois raccourcis : Confrontation, Salle d’Observation et Archives. L’interface gère l’invite d’installation et signale explicitement lorsqu’une mise à jour est disponible.

## Validation

Le durcissement ajoute neuf contrôles structurels dédiés aux sauvegardes, au serveur, aux en-têtes, au manifeste, au service worker, aux pages hors ligne/404, à l’absence de scripts intégrés et à la sécurité des communications iframe. La passe Chromium vérifie en plus l’export de mémoire, le focus, les états ARIA, le contrôle du service worker, le poids du cache initial, le repli hors ligne et le code HTTP 404.
