# Vague 32 — QA de reprise et corrections mesurées

Le job navigateur général de `d4269ad8239a99cad53d44bc77b569ed7a0d41a3` a terminé en échec après la précédente livraison. Les nouveaux visuels vague 31 avaient passé leur recette HTTP dédiée ; le défaut se situe dans un ancien contrat d'absence de pose, atteint plus tard par la suite générale.

## Cause et correction

La Nurse Revolver de SH3 possède désormais une image `neutralLight` dédiée, index 2. Le contrat positif de `http-qa-art-batch4.mjs` la réclamait déjà, mais sa boucle historique de contrôles négatifs exigeait encore que cette même pose affiche « À PRODUIRE » et l'idle. L'interface affichait correctement la nouvelle pose : l'assertion d'absence était périmée.

Les contrôles négatifs proviennent maintenant du même contrat explicite que les contrôles positifs. Le filtre ne s'appuie pas sur le manifeste réel : une pose supplémentaire non déclarée continue à faire échouer le contrôle strict des clips. `neutralHeavy`, toujours absent pour la Nurse, reste testé. Chaque nouvelle pose statique déclarée doit afficher son image dédiée sans avertissement d'absence et sans lecture animée.

## Preuves locales

- [Échec source et extrait de journal exact](previous-browser-failure.json).
- [Résultats des tests ciblés](workshop-contract-tests.tap).
- Métadonnées historiques : **81 contrôles, 80 sujets** ; [contrat final](workshop-contract-summary.json).
- **544 contrôles négatifs** résolus avec le véritable échantillonneur de clips, tous vers l'idle explicite. Le correctif initial en comptait 545 ; la nouvelle pose `neutralLight` du Groaner quitte ensuite le plan d'absence. Le Sniffer remplace son contrôle d'absence de marche par celui de saut.
- Deux tests de régression couvrent la coexistence du nouveau `neutralLight` et du `neutralHeavy` absent, puis toutes les sondes négatives historiques.

Ces contrôles de métadonnées restent distincts de la recette navigateur. La reprise finale a exécuté le contrôle ciblé dans **Chromium 158.0.8127.0** : la pose légère dédiée et la pose lourde absente sont correctement distinguées dans l’atelier. Le [rapport atelier/cache](../qa-final/workshop-cache/report.json) compte neuf contrôles, en incluant l’admission réelle du duo maximal. La suite navigateur générale complète n’a pas été rejouée localement.

## Origines physiques et visuelles des tirs

La correction autorisée de Walter SH4 et Eddie SH2 original est implémentée dans `src/projectile-origin.js` et raccordée dans `src/fight.js`. Les deux tirs neutres partent désormais du canon de leur PNG exact, avec la même transformation que le sprite. Ce changement déplace réellement le départ de collision. Un segment d'émission, consommé une seule fois, évite de traverser un adversaire très proche avant la création visible du projectile.

La [note d'implémentation](projectile-origin-implementation.md) décrit les points mesurés, les différences de contact, la parade Needler et les limites. Les [133 tests ciblés](projectile-origin-tests.tap) passent. Le contrôle natif compte **137 vérifications, 4 cas et 4 captures**, [rapport](../qa-native-origins/characters-report.json) et [examen visuel](../qa-native-origins/visual-review.json). L'écart maximal de projection entre origine physique et canon rendu est inférieur à **0,000034 pixel** ; le projectile visible a déjà parcouru son premier pas normal de 12 pixels monde.

Recette HTTP dédiée : `node docs/production/vague32/characters/qa-http-origins.mjs`, sortie `tests/http-wave32-origins`. L’exécution Chromium finale passe **94 contrôles, quatre cas et huit captures**, tous relus : [rapport final](../qa-final/origins/report.json). L’écart maximal entre point du canon peint et origine physique est inférieur à **0,000012 pixel**. Les quatre captures finales montrent le projectile après un tick ordinaire.

Le premier observateur attendait exactement le tick actif, unique pour Eddie. Une entrée clavier acceptée peut être simulée entre deux rendus et ne produire aucune capture de ce tick. Le harnais observe désormais le premier projectile rendu pendant la pose de tir et vérifie son déplacement par rapport au nombre réel de ticks écoulés. Il ne modifie ni acteur, ni horloge, ni image. Le test moteur conserve la vérification exacte du premier tick ; les [premières tentatives](../qa-final/initial-failures/) restent archivées.

## Quatre nouvelles poses

Le contrôle natif des quatre poses Groaner/Sniffer compte **229 vérifications, 8 cas et 8 captures**, avec directions opposées et retour naturel à l'idle : [rapport final](../qa-native-characters/characters-report.json) et [examen des huit captures](../characters/visual-review.json). Le premier essai est [conservé séparément](../qa-native-characters-initial-contact/README.md) : son contrôle du pixel le plus bas confondait la langue du Sniffer et une patte d'appui.

Pour le PNG exact `4a693eb7331d…`, la griffe avant proche mesurée à `(1098,838)` reste à moins d'un pixel rendu de l'origine de l'acteur ; le bas de langue `y848` est contrôlé séparément avec un dépassement maximal de **2 pixels monde**. L'ancre approximative existante `y≈834` n'est pas modifiée. Ce contrat par ID/source/pose/path/SHA est isolé dans `characters/qa-ground-contact.mjs`. La silhouette complète reste dans le cadre.

Recette HTTP : `node docs/production/vague32/characters/qa-http.mjs`, sortie `tests/http-wave32-characters`. Elle préserve notamment le `hurt[2]` du Groaner et l'absence de `hurt` du Sniffer, puis utilise l'interface et le clavier ordinaires. L’exécution finale passe **408 contrôles, huit cas et seize captures**, tous relus : [rapport](../qa-final/characters/report.json). Aucune injection d'acteur, d'attaque, de caméra ou d'horloge n'est employée par ces captures natives/HTTP.

## Admission mémoire d'un duel

L'ajout des PNG a mis quatre paires au-delà de l'ancien cache de combat de 72 Mio. L'énumération de **230 profils et 26 565 paires** donne un maximum de **81 802 000 octets RGBA sur 13 frames**, Groaner + Faceless Nurse. Cette valeur dépasse 78 Mio de 13 072 octets ; le nouveau plafond fixe est donc **79 Mio**, avec 1 035 504 octets de marge pour la paire maximale.

Le [rapport recalculable](combat-sprite-budget.json) et son [script](measure-combat-sprite-budget.mjs) conservent la mesure. Toutes les paires sont admises. Le duo maximal augmenté d'une frame de 512×512 est refusé sans perdre le bail déjà actif. Les PNG, dimensions et frames restent intacts ; le cache générique reste à 64 Mio, celui des arènes à 64 Mio et celui des projectiles à 32 Mio. Il s'agit du budget RGBA décodé du cache, pas de la mémoire totale du navigateur/GPU.

Les [75 tests ciblés budget/caches/retirement](budget-and-projectile-cache-tests.tap) passent. Les [18 tests service-worker/révision](cache-origin-tests.tap) passent également : `projectile-origin.js` est ajouté au shell et à la révision, de sorte qu'un changement des points de canon invalide le cache même si les PNG restent identiques. Les captures natives citées ont été réalisées avant le passage du plafond de 72 à 79 Mio ; ce changement ultérieur ne modifie aucune transformation de rendu. Les tests d'admission et les recettes HTTP vérifient le plafond final.

## Reprise finale sur HTTP

La [validation finale](validation.json) conserve **575 contrôles HTTP réussis et 37 captures inspectées**, avec les empreintes des fichiers servis. Ce total regroupe les poses (408), les origines de tir (94), les deux scènes (37), le récit Groaner (15), le refus et les composants du récit Lying Figure (12), et l’atelier/cache (9). **39 tests Node ciblés** ont également été réexécutés avec succès ; ils recoupent les anciennes suites et ne s’ajoutent pas au total historique.

Le récit Lying Figure demeure non lançable tant que son adversaire `sh2_mannequin_ambusher_023` n’a pas de base exacte. Son refus normal est testé, sans diagnostic forcé, remplacement d’adversaire ou partie injectée. Les trois histoires illustrées ne sont donc pas assimilées à trois parcours complets jouables. Les service workers sont bloqués dans cette recette ; aucune mise à jour hors ligne, livraison distante ou fidélité artistique 1:1 n’est certifiée.
