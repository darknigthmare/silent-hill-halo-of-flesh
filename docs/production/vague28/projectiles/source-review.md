# Vague 28 — références des projectiles

## Earth Guardian : rocher indépendant

**Profil :** `bom_earth_guardian_142`, édition *Book of Memories*. Le raccordement proposé concerne uniquement `neutralSpecial`. Les trois autres slots de projectile de ce profil désignent l'onde du poing au sol ; ils ne doivent pas recevoir le rocher.

Les deux captures promotionnelles E3 2012 sont conservées dans `references/earth-e3-2012-48.jpg` et `earth-e3-2012-49.jpg`, à leur résolution de **960 × 544**. La première montre plusieurs blocs flottants distincts de la tête et des mains du Guardian ; la seconde en montre encore un près du boss. Leur matière est brun-olive, irrégulière et rocheuse, sans cristaux lumineux ni face. Le PNG demandé représente **un seul de ces projectiles**.

Sources : [capture 48](https://www.silenthillmemories.net/sh_book_of_memories/screenshots/pics/sh_book_of_memories_screen_20120606_48_earth_boss.jpg), [capture 49](https://www.silenthillmemories.net/sh_book_of_memories/screenshots/pics/sh_book_of_memories_screen_20120606_49_earth_boss.jpg). Les fichiers sont des copies conformes aux références déjà versionnées en vague22 ; leurs empreintes sont dans `references/earth-image-records.json`.

Ces images précèdent la version commerciale. Elles attestent une forme de rocher et le contexte de son émission, mais ne certifient pas les pixels, la rotation ou la cadence de la version finale. Le choix de profil et de taille de rendu reste une adaptation du versus, avec `fidelity: unverified`.

## Fire Guardian : jet de main blanc, magenta et violet

**Profil :** `bom_fire_guardian_137`, même édition. Les slots existants `neutralSpecial`, `super` et `desperation` sont explicitement dédiés au lance-flammes de main.

Le [longplay de Kryschnack](https://www.youtube.com/watch?v=ruh4O2ZO7aA) fournit trois vues utiles : [1:27:30](https://www.youtube.com/watch?v=ruh4O2ZO7aA&t=5250), [1:27:50](https://www.youtube.com/watch?v=ruh4O2ZO7aA&t=5270) et [1:29:10](https://www.youtube.com/watch?v=ruh4O2ZO7aA&t=5350). Le jet visible présente un cœur blanc très lumineux, des renflements rose-magenta et une frange violette. Il se distingue du feu orangé du décor et du corps du boss. La vue à 1:27:50 montre un jet ; celle à 1:29:10 montre une émission double. La livraison proposée reste un PNG de jet unique associé à chaque projectile déjà créé par le moteur.

Les trois références `fire-…-native.png` sont des extractions **sans agrandissement** des miniatures natives du storyboard YouTube, à **160 × 90**. L'intervalle d'échantillonnage est de dix secondes ; les liens temporels indiquent l'emplacement nominal de la miniature. Les coordonnées d'extraction, les dimensions et les hashes du fichier extrait et de la planche source sont consignés dans `references/video-frame-records.json`.

Cette preuve renseigne la palette générale et la présence du jet. Elle ne fournit ni texture à haute résolution, ni contour exact, ni mesure RGB, ni cycle animé. L'image indépendante horizontale du versus ne prétend pas reproduire la continuité du lance-flammes original. Aucun feu au sol de God n'est réemployé.

## Steel Guardian : laissé manquant faute de contour vérifiable

**Profil envisagé :** `bom_steel_guardian_146`, slots `neutralSpecial`, `super`, `desperation`. Les textes du registre documentent des lames commandées à distance ; ils ne suffisent pas à dessiner leur contour.

Les miniatures du longplay autour de 14:18–14:22 et de [la rencontre dédiée de Bosscinerator](https://www.youtube.com/watch?v=bNMOoT9_jaY) ont été inspectées. À 160 × 90, elles ne définissent pas encore assez clairement une lame de projectile isolée. Les lames suspendues aux ailes, la couronne du boss et l'arme récupérée par le joueur ne doivent pas être assimilées à ce projectile par défaut. La vidéo de Bosscinerator comporte des sous-titres ajoutés et n'a plus son audio original ; seule son image de jeu constitue une piste.

La [troisième vidéo, verticale](https://www.youtube.com/watch?v=qqqs-WKiCsg), a été contrôlée aux intervalles 0:54–1:10 et 1:48–2:04. Ses miniatures natives de 101 × 180 contiennent aussi le visage du commentateur ; la portion de jeu reste trop petite pour distinguer le contour d'une lame isolée. Les deux planches natives contrôlées et leurs empreintes sont conservées dans `references/steel-negative-evidence.json`.

L'extraction publique classique du flux vidéo a renvoyé HTTP 403. La recherche est close pour cette passe : statut `blocked-insufficient-projectile-silhouette`, aucun prompt ni PNG Steel, et conservation du rendu de secours existant. Les armes d'autres emplacements ou d'autres éditions ne servent pas de substitution.

## Raccordement et validation actuels

Les deux effets ont été importés avec leurs slots exacts. Le rocher et le jet restent centrés sur les projectiles existants, chacun à `heightInRadii: 3`. Le rapport d'aspect est conservé et la largeur reste bornée. Cette calibration de lisibilité ne modifie aucune hitbox, vitesse, quantité ou durée.

La recherche ci-dessus décrit les preuves disponibles et leurs limites. La validation du rendu est consignée séparément dans [la revue native finale](qa-native-after-cache-fix/visual-review.md) et [son rapport](qa-native-after-cache-fix/report.json), après import des deux FX, de la pose Fire et correction du cache de combat à 72 Mio : **79 contrôles réussis, quatre scènes et six captures relues individuellement**. Les 35 fichiers du graphe de modules et les dix images chargées sont identifiés par empreinte ; les six images effectivement dessinées sont listées.

La première émission Fire a été contrôlée dans les deux sens : le repère approximatif du haut de la griffe repliée se trouve à 2,47 px de l'origine colorée, avec un écart vertical de 0,18 px. Ce repère n'est pas le bout d'un doigt : la pointe estimée vers [1090,530] est distante d'environ 42,92 px. Le museau voisin peut faire lire le jet comme un souffle ; le raccord anatomique exact reste non établi. Cette mesure décrit l'écart entre des repères choisis sur les images du versus ; elle ne certifie pas une fidélité originale 1:1. Le moteur conserve sa vitesse Fire de 8 unités logiques/tick et Earth de 12. Les vues après 20 ticks montrent les effets séparés du corps. Les rapports intermédiaires et toutes les preuves initiales restent conservés.

## PNG produits et importés

Les candidats natifs sont `bom_earth_guardian_rock` (1254×1254) et `bom_fire_guardian_hand_flame` (2172×724). Leurs fichiers, empreintes et propriétés alpha figurent dans `earth-rock.receipt.json` et `fire-hand-flame.receipt.json`. Le statut visuel reste `fidelity: unverified` malgré le contrôle d'intégration réussi. Steel reste bloqué faute de silhouette projectile assez précise. Aucune validation HTTP/Chromium n'est déclarée par cette QA native.
