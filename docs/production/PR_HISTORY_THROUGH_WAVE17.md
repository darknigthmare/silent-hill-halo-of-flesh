## Vague 17 — livrée le 19 novembre 2026

Commit : [167abf6](https://github.com/darknigthmare/silent-hill-halo-of-flesh/commit/167abf6a369ab6c2329c2204e19bac79ce763ac9)

La production est intégrée dans cette PR : **10 PNG actifs nouveaux**, **3 variantes Needler archivées**, les manifests, les raccords de rendu et les preuves de vérification. [Rapport détaillé et captures](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/167abf6a369ab6c2329c2204e19bac79ce763ac9/docs/production/vague17/README.md).

### Ce que cette vague ajoute

| Ensemble | Livraison |
|---|---|
| Vues latérales individuelles | Doll Downpour, Raw Shock Diseased, Needler BoM et Nurse BoM ; corps et équipement entiers, portraits antérieurs conservés |
| Marche Origins Nurse | Deux PNG nouveaux et un cycle `[0,2,3,2]`, 7 ticks par étape ; trois dessins distincts, idle et garde existants conservés |
| Underground Homecoming | Deux plans : antichambre des familles fondatrices avant résolution, porte fermée et quatre tablettes couvertes |
| Chambre d’Alessa, film 2006 | Deux plans : chambre d’isolement et premier plan transparent ; effets de plis et de repos raccordés au fond sans seconde tente |

Doll reste un obstacle environnemental et Raw Shock une rencontre scénarisée : leur intégration graphique n’ouvre pas de duel. Needler et Nurse BoM conservent leur rôle de combattants.

Le nouveau contact revient à l’écran de sélection avant de remplacer un combat vivant, ce qui libère ses images avant le prochain préchargement. Consulter la galerie ou choisir l’arène courante conserve le combat. En Récit et Tournoi, la galerie respecte l’arène imposée par le parcours et conserve la rencontre. Les budgets restent à 64 Mio par cache ; aucun parcours sauvegardé n’est réécrit.

### Vérifications

- **`npm test` : 1 281 tests réussis et build vérifié.**
- **Python : 115 tests réussis.**
- **37 tests ciblés relancés avec succès** après la correction de galerie des modes Récit/Tournoi.
- **Canvas natif : 80 contrôles sur quatre duels/six portraits**, plus **118 contrôles de marche et 18 captures** dans les deux sens, avec les vrais callbacks d’entrée et sans injection d’état d’acteur.
- Les **204 portraits** existants conservent leurs métadonnées et leurs fichiers.
- Les **14 365 duels auparavant illustrés restent tous admis** au lancement ; aucune hausse des budgets mémoire.
- Les 13 PNG nouveaux sont reliés à leurs prompts, leurs empreintes et leur décision de sélection ou d’archive.

**Tous les checks GitHub Actions du commit `167abf6` sont terminés avec succès :** [QA — tests, importeur et build](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44469129954) et [campagne HTTP complète](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44469129949).

La campagne navigateur comprend **18 suites et 5 237 contrôles réussis**. La vague 17 y compte **176 contrôles réussis, aucune erreur et 30 captures présentes**, sous Chromium `143.0.7499.4`, sur le build `dist`. Les quatre assertions ajoutées pour Récit/Tournoi confirment la conservation du moteur, de l’arène imposée et des octets des sauvegardes.

L’[artefact `http-qa-v096`](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44469129949/artifacts/14504927654) a été téléchargé et son empreinte SHA-256 vérifiée. Ses 16 rapports conservés sont tous réussis ; les deux dernières suites (`art144` et `art92`) sont confirmées dans les logs du job. Les 30 captures de la vague 17 sont présentes et intègres. Les constats techniques ne certifient pas la fidélité artistique 1:1.

### Couverture actuelle

| Indicateur | État |
|---|---:|
| Profils | 230 |
| Portraits disponibles | 204 |
| Vues latérales candidates | 127 (+4) |
| Anciennes vues de combat à revoir | 66 (−4) |
| Images de combat manquantes | 37 |
| Portraits et sprites de combat distincts | 128 |
| Arènes avec images | 26 / 123 (+2) |
| Clips réellement animés | 3 (+1) |
| Présentations animées | 0 |
| Fidélité 1:1 certifiée | 0 |

Les quatre nouvelles vues remplacent des images anciennes ; elles ne réduisent pas le nombre d’images de combat encore absentes. Le cycle Origins est un premier cycle court de versus, pas un moveset complet ou un timing commercial mesuré. Le torse Needler et les franges visibles en plein format restent signalés. Les décors sont des reconstructions de cadrage ; aucune UHD native ni conformité 1:1 n’est annoncée.

### Traçabilité et historique

- [Receipt des 13 PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/167abf6a369ab6c2329c2204e19bac79ce763ac9/docs/production/sprite-wave17-imports-2026-11-19.json)
- [Rapports, prompts et captures de la vague 17](https://github.com/darknigthmare/silent-hill-halo-of-flesh/tree/167abf6a369ab6c2329c2204e19bac79ce763ac9/docs/production/vague17)
- [Description complète de la PR avant cette vague, conservée dans le dépôt](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/167abf6a369ab6c2329c2204e19bac79ce763ac9/docs/production/PR_HISTORY_THROUGH_WAVE16.md)

La PR reste ouverte en brouillon.

