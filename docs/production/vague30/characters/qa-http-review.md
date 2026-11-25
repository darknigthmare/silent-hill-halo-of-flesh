# Trois poses — revue des captures HTTP

Revue du 25 novembre 2026 : **114 contrôles réussis, six cas joués, douze captures affichées et relues individuellement**. Les empreintes et tailles des douze PNG correspondent au [rapport conservé](../qa-http/http-wave30-characters/report.json). La [validation structurée](validation.json) énumère chaque image.

## Provenance et méthode

Les captures proviennent du [run 45660199560](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/45660199560), job `139367652764`, artefact `15045286963`, exécuté depuis `a1f434ea1d53eb933879442b05f1971c767c197f`. Le job a importé les trois poses relues et construit les données dérivées avant de servir l’application. Ce commit désigne donc la source de l’exécution ; les fichiers générés ne sont pas tous des blobs déjà présents dans ce commit.

La sélection et les entrées clavier sont ordinaires, dans des contextes Chromium neufs. L’observateur de `drawImage` est passif : aucun acteur, module, PNG, mouvement de caméra ou horloge n’est substitué. Les captures du canvas sont natives, **1 280 × 720**. La revue vérifie les images affichées, en complément des contrôles d’état et d’appui.

## Résultats

| Propriétaire | Action observée | Revue dans les deux sens et après relâchement |
| --- | --- | --- |
| Sniffer Dog mâle SH4 | `forwardSpecial` | Silhouette allongée distincte de l’idle d’origine, langue rouge et fourrure visibles, corps entier et appui cohérent. Le retour affiche bien l’ancien PNG. |
| Carrion Origins | `forwardSpecial` | Pose ramassée orientée vers l’adversaire, membre d’appui visible, absence de découpe du corps. Le retour retrouve la silhouette plus relevée de l’ancien idle. |
| Creeper SH1 | `walk` | Pose rampante différente de l’idle, orientation cohérente et retour au PNG initial. La silhouette et les pattes fines restent peu contrastées contre la grille sombre du sol. |

Aucun rectangle opaque, halo manifeste ou défaut bloquant de placement n’a été observé dans ces douze images. Le contraste limité du Creeper reste une réserve de lisibilité ; ces captures ne valident pas son affichage sur tous les décors.

## Portée

Le grand texte « FIGHT » est encore visible au-dessus des combattants et ne masque pas les sprites évalués. Les deux attaques sont observées en phase active ; la marche et le retour à l’idle sont contrôlés après des entrées ordinaires. Cela ne constitue ni une recette de toutes les commandes, ni une campagne jouée, ni une mesure de la cadence de l’œuvre source.

Chaque nouvel état utilise une seule pose fixe. L’autre orientation résulte du miroir existant du moteur. La pose `hurt` manquante conserve son fallback explicite sur l’idle. Les service workers sont bloqués par le harness : aucune mise à jour hors ligne n’est validée ici. L’anatomie exacte et la fidélité 1:1 restent non certifiées.

L’[audit d’import](import-receipts.json) et la [conservation du registre](registry-preservation.json) établissent séparément que les 201 autres propriétaires, tous les portraits, les anciennes frames et les clips préexistants sont conservés.
