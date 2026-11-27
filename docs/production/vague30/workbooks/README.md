# Vague 30 — actualisation des deux classeurs de bible

Les onglets **Guide combat** et **Associations guide** des deux classeurs existants sont actualisés depuis les JSON du guide. Ils contiennent 30 rubriques, 10 décisions de modules et 445 associations : 230 profils, 123 arènes, 15 Chroniques, 66 entrées de corpus et 11 projectiles.

Le reçu de référence est [validation.json](validation.json). Il donne les empreintes SHA-256 des fichiers livrés, leurs objets Git exacts, les empreintes des trois JSON sources et les chemins des preuves détaillées. Les XLSX restent à leurs emplacements habituels dans `docs/production/` ; aucun troisième classeur n'est livré.

## Modifications effectuées

Chaque classeur reçoit 14 corrections de cellules de source déjà présentes et 21 cellules nouvelles, soit les trois lignes de projectiles 451 à 453. Six formules de compteurs étendent leur plage jusqu'à la ligne 453. Quatre hauteurs de lignes du guide augmentent pour afficher intégralement les textes enrichis. Le tableau natif des associations garde son identité et étend seulement sa plage.

Les textes décrivent les 14 nouveaux PNG comme des images fixes candidates : trois poses, trois effets, six plans de décor et deux illustrations du récit d'Air Screamer. Aucun personnage supplémentaire ni cycle animé n'est déclaré. Les scènes de rivalité et de campagne encore au stade de brief restent distinguées des fichiers présents. Les libellés et états des trois stages produits sont réconciliés avec les sources.

La seule retouche éditoriale apportée au JSON de référence pendant cette étape corrige les espaces de la phrase `observed` de la rubrique 17. `bible:guide` et `bible:check` ont été exécutés après cette correction ; les comptes restent inchangés.

## Conservation et méthode

L'authoring, le recalcul des compteurs et les rendus sont réalisés avec **Artifact Tool dans le runtime primaire**. Le mode `refresh` de `scripts/add-combat-guide-workbook.mjs` importe le classeur Corpus, compare d'abord toutes les cellules sources à leur JSON de baseline, actualise les seules données prévues et exporte un donneur contrôlé. La décision d'un module est temporairement modifiée puis restaurée pour vérifier la réaction de sa formule de synthèse.

`scripts/graft-combat-guide-workbook.py` transfère ensuite les cellules authorées et recalculées dans chacun des deux fichiers originaux. Ce script standard ZIP/XML sert à conserver le paquet ; il ne remplace pas l'authoring Artifact Tool. Il refuse un écart au journal autorisé, une cellule inattendue, un style sans équivalent exact ou une modification supplémentaire du tableau. Les styles des nouvelles lignes reprennent la parité des lignes existantes.

**Seuls trois membres ZIP changent dans chaque classeur : les deux feuilles guide et le tableau des associations.** Les 17 autres membres du Corpus et les 42 autres membres du principal restent identiques à l'octet après décompression. Cette conservation porte sur les payloads historiques du paquet, pas sur les octets du fichier ZIP complet.

| Classeur | Feuilles historiques conservées | Cellules historiques | Formules historiques | Validations | Formats conditionnels |
|---|---:|---:|---:|---:|---:|
| Corpus | 2 | 2 272 | 7 | 2 | 4 |
| Principal | 11 | 250 550 | 80 | 9 | 9 |

Les feuilles historiques restent leurs instantanés antérieurs. Leur conservation comprend les styles, liens, annotations, relations et tables. Les données récentes de cette passe figurent dans les onglets du guide et les JSON ; les anciennes synthèses historiques ne sont pas réécrites.

## Vérifications et portée des rendus

Les [preuves Corpus](corpus-preservation.json) et [preuves du principal](production-preservation.json) détaillent les feuilles, les empreintes, les trois membres modifiés et les comparaisons. Les [valeurs des formules](formula-values.json) montrent les 12 formules et caches relus dans chacun des deux modèles finaux : 30 rubriques, 10 modules, 4 modules différés, 1 décision ouverte, 2 rubriques de conception, 2 modules hors périmètre, puis les six comptes d'associations.

Les [preuves visuelles](visual-review.json) relient les aperçus relus. Les vues du guide sont identiques à l'octet entre les deux classeurs. Les aperçus historiques `A1:F8` de **Corpus** et **Synthèse** sont identiques avant et après.

Le rendu complet du principal a rencontré la limite mémoire disponible, avec une sortie 137. Sa vérification visuelle utilise une **projection temporaire de lecture** contenant Synthèse et les deux feuilles guide complètes. Les 12 payloads conservés — feuilles, styles, chaînes, thème, tables et relations de feuilles — sont identiques à ceux du principal final. Seules les métadonnées qui déclarent les feuilles exclues changent dans cette projection ; elle n'est jamais copiée au chemin d'un classeur livré. Le bloc `renderProjection` de la preuve du principal consigne la liste exacte et les empreintes.

La projection permet de rendre les guides et le premier aperçu historique. La conservation des autres feuilles historiques repose sur la comparaison de tous leurs payloads, pas sur une affirmation de rendu visuel intégral. Microsoft Excel desktop n'a pas été exécuté.

Une revue indépendante a confirmé les garde-fous du script, les changements autorisés, les empreintes finales et la projection. Les deux XLSX ont été sauvegardés comme objets Git immuables et les SHA retournés ont été comparés aux SHA Git calculés sur leurs octets.

## Reproduction

Utiliser le runtime primaire et une zone temporaire reliée à `CODEX_PRIMARY_RUNTIME_NODE_MODULES`. Le script d'authoring attend le dépôt, une sortie temporaire, le mode `refresh`, le nom du classeur Corpus et, si nécessaire, un fichier source antérieur au rafraîchissement. La baseline JSON est `9c426d7e230eaec464203acb9b43b63a420acf30`.

La greffe exige `--before`, `--donor`, `--changes`, `--requirements`, `--associations`, `--output` et `--report`. L'option `--qa-projection` produit uniquement le sous-ensemble temporaire de lecture. Toujours travailler à partir des fichiers de baseline et produire un candidat séparé ; le script interdit de remplacer directement `--before`.

`scripts/render-combat-guide-final.mjs` importe le candidat ou la projection et rend les vues sans réexporter ni recalculer toutes les feuilles historiques. Les sources JSON, le journal et les empreintes consignées doivent correspondre avant toute nouvelle promotion.
