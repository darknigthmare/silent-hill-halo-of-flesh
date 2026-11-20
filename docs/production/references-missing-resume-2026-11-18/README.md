# Références des profils manquants — reprise du 18 novembre 2026

**Aucun des trois dossiers n’est débloqué. Aucune génération ni import de sprite ne résulte de ces recherches.** Ces trois profils comptent comme recherchés pendant cette reprise ; les **58 profils sans image n’ont pas tous été recherchés à nouveau**. Les refus historiques restent exclus.

Le rapport complet est [sprite-resume-reference-research-2026-11-18.json](../sprite-resume-reference-research-2026-11-18.json). Il contient les conclusions, l’attribution des identités, les limites d’accès, les chemins durables et les SHA-256. Les chemins absolus `originalPath` et `originalExtraction` sont seulement la provenance du travail temporaire ; les pièces conservées sont les chemins du dépôt indiqués par `path`.

## Wanderer — Silent Hill: Ascension

Profil : `ascension_wanderer_178`. Source visuelle **primaire**, scène finale publiée par **Genvid Entertainment** : [Please Come Home — 11/7/23, scène 2](https://www.youtube.com/watch?v=8WNC1piyOGc).

| Temps nominal | Pièce native conservée | Observation |
|---|---|---|
| 02:24 | [wanderer-home-native-02m24s.png](wanderer-home-native-02m24s.png) | Jambes au premier plan ; haut du corps hors cadre. |
| 02:26 | [wanderer-home-native-02m26s.png](wanderer-home-native-02m26s.png) | Vue contiguë des jambes. |
| 02:28 | [wanderer-home-native-02m28s.png](wanderer-home-native-02m28s.png) | Haut du corps en mouvement, peu lisible. |
| 02:30 | [wanderer-home-native-02m30s.png](wanderer-home-native-02m30s.png) | Haut du corps surtout en silhouette. |
| 02:32 | [wanderer-home-native-02m32s.png](wanderer-home-native-02m32s.png) | Partie basse ; appuis trop sombres pour les établir avec assurance. |
| 02:34 | [wanderer-home-native-02m34s.png](wanderer-home-native-02m34s.png) | Vue contiguë du haut du corps. |
| 02:52 | [wanderer-home-native-02m52s.png](wanderer-home-native-02m52s.png) | Corps au sol entier mais très sombre. |
| 02:54 | [wanderer-home-native-02m54s.png](wanderer-home-native-02m54s.png) | Même corps au sol, autre échantillon. |

Les huit images sont des cellules **natives de 320×180**, extraites sans agrandissement ni correction de couleur. [Coordonnées et SHA](wanderer-native-frame-coordinates.json) : `[x,y,largeur,hauteur]` dans les planches natives. Le pas d’échantillonnage est de 2 secondes ; il ne s’agit pas d’un visionnage continu.

L’attribution du nom est **secondaire** : le [guide GameFAQs de jimfish, section Monsters](https://gamefaqs.gamespot.com/webonly/383913-silent-hill-ascension/faqs/80945/monsters) désigne précisément comme Wanderer la créature frappée à la batte dans cette scène et distingue son corps sans bras libres du Fighter aux bras griffus. La description officielle Genvid ne nomme pas le monstre. Le rôle existant **`scripted-encounter`**, l’identité **`identite-documentee-secondaire`** et les propositions de super/finisher bloquées sont conservés.

[The End of Joy](https://www.youtube.com/watch?v=kC4QnrVE6iQ) a également été examiné à partir de ses vignettes natives : pieds masqués par végétation/brouillard ou coupés en bas. Ces planches supplémentaires ne font pas partie du présent lot. La tentative ordinaire de flux vidéo de Please Come Home a renvoyé 195 octets HTML « Site Unavailable », pas une vidéo ; route arrêtée. **Aucune preuve HD n’a été obtenue.** La revue indépendante des huit images conserve le blocage ; aucune géométrie ni détail n’est à inventer.

## Memory of Richard Grady / Sad Daddy — Origins PS2

Profil : `origins_memory_of_richard_grady_083`. [Vidéo de David Link05](https://www.youtube.com/watch?v=g1iDk4qjLRE), intitulée *Silent Hill: Origins All Creature Cutscenes Fights*. Il s’agit d’une **capture de gameplay tierce**, pas d’une planche officielle de modèle. Le chapitre annoncé est 10:03–11:57. L’auteur indique des textures améliorées, une luminosité accrue et le retrait du grain : **géométrie partielle seulement**, matériaux/couleurs/éclairage d’origine non probants. L’absence de modification géométrique n’est pas certifiée indépendamment.

| Temps nominal | Pièce native conservée | Observation |
|---|---|---|
| 11:10 | [sad-daddy-native-11m10s.png](sad-daddy-native-11m10s.png) | Boss visible, haut du modèle et suspension coupés. |
| 11:30 | [sad-daddy-native-11m30s.png](sad-daddy-native-11m30s.png) | Géométrie centrale et inférieure partielle ; haut coupé. |
| 11:50 | [sad-daddy-native-11m50s.png](sad-daddy-native-11m50s.png) | Nouvelle projection du corps ; haut toujours coupé. |

[Coordonnées et SHA](sad-daddy-native-frame-coordinates.json). Ces images sont **natives de 320×180**, sans agrandissement ni correction. L’inspection a porté sur **11 échantillons espacés de 10 secondes**, de 10:10 à 11:50 : les six premiers montrent Richard humain pendu ; 11:20 et 11:40 sont des menus ; les trois vues ci-dessus montrent le boss. Ce constat concerne les images obtenues, **pas chaque frame de la vidéo**. Le corps humain ne doit pas servir à compléter le corps monstrueux. Le rôle `stationary-boss` reste inchangé.

## Missionary — Revelation 2012

Profil : `film_missionary_revelation_177`. Le blocage demeure : **chaussures finales du costume non établies**.

La [galerie Metropolitan Films](https://metrofilms.com/film/silent-hill-revelation/) est une source **primaire de distributeur**. [metro-gallery-inspection.png](metro-gallery-inspection.png) est le montage étiqueté effectivement inspecté de 29 vignettes SH2, réduit pour repérage. **Ce montage n’est pas une nouvelle photo native du film.** Trois autres images de la galerie n’ont pas été inspectées. Aucune des 29 vignettes ne montre les chaussures recherchées.

Le [making-of officiel Open Road Films](https://www.youtube.com/watch?v=Zw8_w4JiIdA), durée 3:07, est une seconde source primaire. Les quatre planches ci-dessous ont été copiées sans modification ; elles contiennent des cellules natives 160×90 espacées nominalement de 2 secondes, avec 95 échantillons au total. Aucun visionnage continu en pleine résolution n’est revendiqué.

| Planche | Début nominal | Fichier |
|---|---|---|
| 0 | 00:00 | [missionary-bts-L2-M0.jpg](missionary-bts-L2-M0.jpg) |
| 1 | 00:50 | [missionary-bts-L2-M1.jpg](missionary-bts-L2-M1.jpg) |
| 2 | 01:40 | [missionary-bts-L2-M2.jpg](missionary-bts-L2-M2.jpg) |
| 3 | 02:30 jusqu’à la fin | [missionary-bts-L2-M3.jpg](missionary-bts-L2-M3.jpg) |

Les échantillons n’établissent ni les chaussures finales ni un costume entier exploitable. Les différentes propositions Mercer, la maquette précoce inutilisée, le fan model improvisé, le cosplay et le Missionary de SH3 restent des substitutions exclues. Le rôle `scripted-encounter` est conservé.

## Conservation des preuves

**16 images** sont conservées : 8 vues Wanderer, 3 vues Sad Daddy, 4 planches du making-of Missionary et 1 planche de galerie. Leurs octets sont **identiques aux fichiers inspectés dans le scratch**, avec SHA-256 contrôlés avant et après copie. Aucune réinterprétation, amélioration ou nouvelle compression n’a été appliquée pendant cette sauvegarde. Les coordonnées sont des métadonnées, pas une transformation supplémentaire.

Les journaux détaillés sont intégrés par leurs conclusions et leur provenance dans le rapport principal ; les pièces effectivement copiées disposent de chemins durables. Les 49 téléchargements initiaux, fichiers HTML/player, URL signées/temporaires et réponse vidéo inutilisable ne sont pas copiés. Aucun ancien rapport, classeur, registre, capacité ou PNG de jeu n’a été modifié par cette conservation documentaire.
