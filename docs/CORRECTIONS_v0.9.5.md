# v0.9.5 — Frontières de commandes, dialogues et secours de sauvegardes

Base : PR #4, v0.9.4, commit `171ebadcb78023c1496fa4132a95ac13ae7bb1b6`.
Aucune modification du catalogue, du lore, des dégâts, des portées ou des images natives.

## Combat et transitions

Le tampon d'impact conserve uniquement les impulsions léger/lourd/technique/projection/
Super/esquive/saut. Au tick de reprise, garde et directions sont celles effectivement
maintenues, pas celles du tick où l'attaque a été mémorisée. Cela supprime le retour
inattendu d'une garde relâchée, le réarmement de parade et les directions périmées.
C'est un choix de commandes Versus, pas une capacité canonique des personnages.

Intros, cinématiques de fin, fins de round et résultats consomment les impulsions
clavier, tactile et manette de manière cohérente. Maintenir garde/direction est permis,
mais cela ne fabrique ni une nouvelle attaque ni une parade à la reprise. Le joueur
peut effectuer une pression neuve lorsque le combat devient actif.

Deux pressions Start au même relevé ne se compensent plus. Tous les fronts sont mis
à jour avant une unique décision de pause ; la déconnexion d'un périphérique actif
prend priorité. Un refus ou une indisponibilité de `navigator.getGamepads()` devient
une perte de périphérique, sans exception non gérée dans la boucle. Le clavier et
le tactile restent utilisables. Aucun changement de permission du navigateur.

La reprise est refusée tant que le dialogue des commandes reste ouvert, ou que le
document est masqué. Fermer le dialogue des commandes ne reprend pas automatiquement
le combat : la pause reste à lever explicitement.

## Durée de vie du moteur

`destroy()` est définitif et idempotent. Il annule la frame programmée, désactive et
libère les commandes, et retire les écouteurs. Une ancienne référence ne peut pas
relancer ou réinitialiser un moteur détruit. Si un callback détruit le moteur pendant
un tick, la boucle ne rend pas une ancienne frame et ne reprogramme pas d'animation.

Une transition de fin déjà traitée ne rappelle pas `onMatchEnd`. Les réinitialisations
suppriment les overlays de boss, secousses, anciennes intentions IA et attribution du
dernier coup. Un reset de match réactive les commandes sans lever une pause explicite.

## Sauvegardes et commandes

`readState` accepte désormais un validateur métier facultatif en quatrième argument.
`loadRun` et `loadControls` l'utilisent aussi bien pour le primaire que pour son secours.
Un JSON correct dont les combattants n'existent plus, les victoires sont incohérentes
ou les touches se chevauchent ne masque plus une copie précédente encore utilisable.
Une lecture de secours ne modifie pas les octets stockés.

`writeState` emploie le même validateur facultatif pour ne pas promouvoir le primaire
invalide au-dessus du bon secours. L'export du menu principal applique ces validateurs
aux parcours et aux commandes ; les autres clés gardent leur contrôle de schéma.
La suppression ciblée enlève le secours avant le primaire : une panne de suppression
du secours laisse le primaire intact, au lieu de ressusciter une ancienne version.
Ce n'est pas une transaction multi-onglets ; localStorage ne fournit pas de CAS ici.

Les affectations dont la persistance échoue restent utilisables dans le moteur actif
et visibles dans l'aide et le dialogue rouvert. Elles restent explicitement non
sauvegardées et ne sont pas garanties après rechargement. Les raccourcis modifiés,
événements consommés et répétitions d'activation sont ignorés par les menus.

## Validation et limites

- Tests ciblés initiaux : 22 échecs reproduits sur 25 tests avec la source v0.9.4.
  Trois cas de contrôle passaient déjà. Deux régressions de reset reproduites séparément.
- Tests moteur, importeur Python et toutes les suites HTTP précédentes à rejouer pour
  chaque commit livré ; le rapport de livraison précise les résultats réellement obtenus.
- Nouvelle suite `scripts/http-qa-boundaries-v095.mjs` : menus, pause et sous-dialogue,
  Start simultané, Gamepad API indisponible, touches non persistées, moteur retiré,
  impulsions d'intro, export et UI de secours, écran mobile et fonctionnement hors ligne.
- Les manettes sont des objets de test injectés ; les erreurs de stockage sont simulées.
  Les tests navigateur sont des tests HTTP de l'interface, pas des mesures de matériel
  physique ou des campagnes entièrement jouées.
- La tentative locale Chromium retourne `ERR_BLOCKED_BY_ADMINISTRATOR`. Ce refus n'est
  pas contourné ; la CI GitHub autorisée exécute les parcours navigateur.
- Référence technique du refus Gamepad : https://www.w3.org/TR/gamepad/ (§ getGamepads).
  Dialogues modaux : https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal.

**Art inchangé : deux PNG candidats individuels sur 230 profils, 228 sans sprite accepté,
aucun nouveau clip animé de production, aucune certification 1:1.** Les décors/effets
procéduraux restent à remplacer. Aucun contenu de l'index Yautja n'est attribué à Silent Hill.
