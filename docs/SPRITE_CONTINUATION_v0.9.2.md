# v0.9.2 — Inspection, cadrage et décodage des sprites

Cette révision poursuit la PR #4 sur sa tête `3e75e4156baccecac558b2a524608e67cda84b4f`.
Elle ne certifie pas la fidélité Silent Hill et n’ajoute aucun sprite individuel accepté.
Les deux candidats antérieurs restent les seuls fichiers de personnage intégrés.

## Changements dans le jeu

L’atelier possède un inspecteur de poses. Il montre les images réellement présentes,
la chronologie en ticks, le sens d’affichage, la grille, l’enveloppe alpha et la
collision physique. Les poses absentes restent explicitement « À produire » : leur
aperçu utilise idle, sans inventer une marche, une attaque ou un KO. La lecture est
désactivée pour une image unique. Le zoom et les champs de calibration sont locaux.

L’ancre, la hauteur corporelle de référence et le sens natif sont ajustables puis
exportables en JSON. Cet export ne modifie pas le dépôt, le compte ou la progression.
`python scripts/apply-sprite-calibration.py CALIBRATION.json` vérifie une simulation
sans écriture. Ajouter `--apply` pour modifier le registre sous verrou et par
remplacement atomique, après vérification du profil, du média et des empreintes.
Les collisions ne sont pas recalibrées silencieusement avec l’illustration.

La caméra de combat tient compte des limites visibles de toutes les images du clip,
notamment des armes longues et des ailes. Un même cadrage est appliqué au décor,
aux personnages, aux projectiles, aux volumes de collision et aux dangers. Le HUD
reste à sa taille de lecture. Les coordonnées physiques ne sont pas modifiées.
Le recul peut laisser une marge sombre autour de l’arène : aucun décor extérieur
supplémentaire n’est fabriqué. Les proportions relatives des personnages restent
celles des calibrations candidates, pas des mesures canoniques validées.

Les horloges de poses sont pilotées par les pas de simulation, réinitialisées au
changement d’état et gelées pendant pause/gel d’impact. Les états garde, esquive,
renversement et phase sont distingués. Les durées de chaque frame sont prises en
charge via `frameTicks`, sans nécessiter de dupliquer un fichier. Le code expose
ces capacités ; aucune nouvelle séquence animée n’est livrée.

## Décodage réel, pas seulement lecture d’en-têtes

`npm run sprites:check` décode désormais les pixels des PNG RGBA/LA, 8 ou 16 bits,
entrelacés Adam7 ou non. Il vérifie les CRC des chunks, l’ordre IHDR/IDAT/IEND,
la décompression bornée, les filtres de scanline, la transparence et les marges.
Un simple en-tête falsifié, un PNG tronqué ou des pixels corrompus sont refusés.
Cette politique d’import est volontairement plus stricte que le format PNG général.

Les WebP sont décodés par `scripts/validate-webp.py`, avec Python et Pillow. Sans
ce décodeur, un WebP enregistré échoue explicitement au build ; ses en-têtes ne
constituent pas une acceptation. Les PNG actuels ne nécessitent aucun décodeur Python
pendant le build Node. Le serveur et le jeu n’ont pas de nouvelle dépendance réseau.

Une empreinte des pixels normalisés accompagne maintenant l’empreinte du fichier.
Les copies réencodées et les changements de couleur dans des pixels entièrement
transparents ne deviennent pas de nouveaux monstres ou frames d’animation.
L’importeur publie toujours exactement le tampon d’octets inspecté.

Références techniques : spécification PNG W3C, https://www.w3.org/TR/png-3/ ;
documentation Pillow, https://pillow.readthedocs.io/en/stable/handbook/image-file-formats.html .
Ces références décrivent les formats, pas la fidélité artistique des candidats.

## Production artistique et limites

- 230 profils conservés ; 2 candidats intégrés ; 228 profils sans sprite accepté.
- 0 nouvelle image individuelle acceptée ; 0 clip animé livré ; 0 fidélité 1:1 certifiée.
- Les sorties de génération non conformes restent exclues et consignées dans
  `art/rejected.json`. Aucun nouveau sprite individuel conforme n’a été accepté.
- Les décors et effets restent procéduraux. Cette révision ne satisfait donc pas
  encore le remplacement artistique intégral demandé.

## Vérifications

Avant publication : 288/288 tests Node et 39/39 tests Python réussis localement.
La navigation HTTP du Chromium local a été refusée par
`ERR_BLOCKED_BY_ADMINISTRATOR` ; ce refus n’a pas été contourné.
Les workflows GitHub exécutent les régressions HTTP existantes et le nouveau
`http-qa-art-v092.mjs`. Les résultats distants doivent être consultés sur le commit
livré, pas extrapolés à partir d’anciens runs.

Le nouveau parcours navigateur teste aussi un cadrage aux limites sur 123 arènes,
3 états Otherworld et 2 orientations (738 rendus). Les positions et états y sont
imposés comme fixtures : ce ne sont ni 738 parties jouées ni une revue artistique
humaine exhaustive. Les fixtures synthétiques des tests de format et d’animation
ne sont pas distribuées comme images de production.
