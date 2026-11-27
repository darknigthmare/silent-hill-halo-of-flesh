# Suivi de la première CI distante — 24 novembre 2026

Le head publié `e6b89195760e6fc676d5b924edf63d47c4a52ac3` possède exactement
le même arbre que la livraison locale `32ea3df`. La PR est la
[nº 11](https://github.com/darknigthmare/silent-hill-halo-of-flesh/pull/11).

## Résultats de ce premier head

- [QA distante](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/45425629284) : **1 301 tests Node et 115 tests Python réussis**, avec build et vérification des fichiers générés réussis.
- Aperçu Vercel : `READY` pour ce même commit.
- [HTTP browser QA, run 105](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/45425629280) : échec dans la suite historique `http-qa-art-batch4.mjs`, après les suites précédentes. Les étapes des vagues 26–28 sont **sautées**, pas validées.

L’erreur rapportée est `sh1_groaner_003: exact source owns every declared frame
and clip`. Le contrat historique attendait quatre frames ; l’attaque de la
vague 28 ajoute explicitement une cinquième frame. Le problème se trouve dans
l’inventaire attendu par ce test.

L’artefact de ce run porte l’ID `14939200868`, avec 393 161 040 octets et le
SHA-256 `b1660d072e86331419e6549f5536219e3795f9deb3a3de179ebfafaefaf52dc3`.
Il ne contient pas les captures des trois étapes sautées.

## Réparation du contrat

Le harnais attend maintenant `forwardSpecial: [4]` pour les quatre profils
concernés : Groaner, Closer, Numb Body Small et Double Head. Les tests conservent
l’identité, l’édition, l’année, les nombres exacts de frames et clips, les
pixels distincts, les indices, les boucles et le compte des animations.

La recherche du clip d’une frame est conditionnée à une correspondance réelle.
Les anciens contrôles `walk`, `hurt` et `ko` continuent de viser leurs trois
indices historiques ; la nouvelle frame est examinée sous son slot d’attaque.

Le mode `--metadata-only` exécute le **même contrat** sur les 80 sujets, avec
**81 contrôles réussis**, sans navigateur, HTTP ou création de captures.
La [preuve locale](historical-clip-contract.json) conserve les commandes,
empreintes et résultats. La syntaxe Node est également vérifiée.

## Organisation de la relance

Le job historique `browser` conserve la suite `npm run qa:browser` entière.
Son contrat de métadonnées est contrôlé avant l’installation de Chromium pour
signaler rapidement un nouvel écart d’inventaire.

Un second job indépendant, `new-artwork`, construit la même application et
exécute les trois harnais des vagues 26–28. Après un build réussi, chacun de
ces trois contrôles peut encore s’exécuter si un autre échoue. Aucun échec
n’est masqué par `continue-on-error`, et les deux jobs doivent réussir pour
que le workflow soit vert. Les nouvelles captures sont archivées séparément
sous `http-wave26-28`.

Le YAML a été analysé et contrôlé localement : permissions `contents: read`,
jobs indépendants, suite historique conservée, trois harnais présents une
fois chacun, conditions de build et échecs conservés. Ce contrôle de structure
et celui des métadonnées **ne sont pas une réussite Chromium** : le résultat
de la relance doit être lu sur la PR.

Aucune image, donnée de combat, calibration, collision ou source du moteur
n’est modifiée par ce suivi. Les rapports natifs antérieurs gardent leurs
empreintes de production et leur statut de preuve locale.
