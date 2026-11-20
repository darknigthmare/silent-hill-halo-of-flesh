# Vague 23 — revue native des six personnages

**Les six processus réussissent et les 34 captures ont été inspectées.** Les quatre BoM ont chacun été exécutés dans deux duels ordinaires, côté joueur 1 puis joueur 2. Les deux colonies SH4 ont seulement été rendues par le renderer d’atelier, dans les deux orientations.

## Résultats

- 6 processus, tous code 0, sans signal ; 328 exécutions de contrôles réussies.
- 8 duels, 4 aperçus d’atelier, 34 captures conservées dont 6 portraits historiques.
- Aucun PNG ou module central modifié pendant les processus ; aucun portrait historique substitué à la vue latérale en jeu.
- Harness exécuté : `e5e7ede8084a1e2e7c4216fe8fbd2393644fa6d9f561ec6088af2c9d27ee3a25`, copie immuable sous `../qa-native/executed/`.
- Journaux, rapports et observations de processus : `../qa-native/cases/<id>/`.

| Profil | Duels | Atelier | Captures | Silhouette native affichée (px) | Écart de borne basse au sol |
| --- | ---: | ---: | ---: | ---: | --- |
| `bom_wood_sapling_139` | 2 | 0 | 7 | 96.36 × 107.23 | 2.73e-7 px |
| `bom_tremer_133` | 2 | 0 | 7 | 174.88 × 51.66 | 5.06e-7 px |
| `bom_raw_shock_148` | 2 | 0 | 7 | 124.64 × 210.35 | 4.89e-7 px |
| `bom_gray_child_147` | 2 | 0 | 7 | 102.36 × 151.45 | 0.00e+0 px |
| `sh4_toadstool_061` | 0 | 2 | 3 | 60.70 × 98.64 | Base atelier y=430 |
| `sh4_whitestool_062` | 0 | 2 | 3 | 63.88 × 98.64 | Base atelier y=430 |

La borne basse est calculée sur l’alpha ≥ 32 après la véritable matrice Canvas. Pour les quatre BoM elle coïncide avec le sol moteur y=594 à moins de 0,000001 px. Les appuis visuels ont aussi été examinés : aucun corps coupé ou suspendu n’a été constaté. Cela confirme la calibration de ces poses, sans prétendre mesurer la géométrie des jeux d’origine.

## Revue visuelle

### bom_wood_sapling_139

- Les six captures de jeu montrent la tête, tous les doigts et les deux pointes d’appui entiers. Les deux racines sont lisibles sur le sol ; pas de glissement vertical entre idle, déplacement et relâchement.
- Le volume penché et le bras avancé pointent vers Creeper des deux côtés. La petite silhouette garde ses creux internes à environ 107 px de haut.
- Pas de frange colorée matériellement gênante ni de halo large discerné à la taille de jeu ; texture très fine réduite par l’échelle.

### bom_tremer_133

- La grande masse pâle est du côté de l’adversaire dans les deux placements ; pointe brune en arrière. Contour complet bas et horizontal, environ 175 × 52 px en jeu.
- Le dessous touche la ligne de sol du moteur à chaque capture ; l’inversion est correcte. Le déplacement fait glisser le PNG statique, sans déformation ou cycle rampant ajouté.
- Les franges ponctuelles remarquées dans l’aperçu natif ne forment pas de liseré coloré important sur Hazel Subway. Partie claire nettement plus lumineuse que le décor, sans large halo.

### bom_raw_shock_148

- Tête ovoïde, bras, doigts, deux jambes et pieds sont visibles dans les six captures de jeu. Pied proche posé au sol ; pied éloigné légèrement plus haut dans la perspective de la pose.
- Profil droit puis miroir gauche corrects, tête et main avancée orientées vers l’adversaire. Silhouette mince entière à environ 210 px de haut.
- Pas de rectangle de fond, de halo large ou de frange parasite gênante observé au niveau du crâne, des bras ou des pieds.

### bom_gray_child_147

- Tête disproportionnée, tronc court, mains, jambes et petite lame tenue basse sont présents dans les six captures. Pieds entiers et appui stable à environ 151 px de haut.
- Présentation droite puis miroir gauche cohérents ; légère ouverture du torse conservée. La lame reste basse, sans attaque ni effet ajouté.
- Le halo large suspecté dans l’aperçu natif n’apparaît pas dans ces captures de jeu. Alpha source maximal 254 conservé ; aucun nettoyage ou renforcement d’opacité.

### sh4_toadstool_061

- Deux aperçus du renderer d’atelier montrent une seule colonie entière, toutes pointes et base visibles, environ 61 × 99 px.
- L’attache rejoint la ligne de référence y=430 ; le miroir inverse les tiges inclinées. Les interstices restent sombres/transparents, sans webbing opaque gênant à cette échelle.
- Aucun duel ne concerne ce profil : cases=[] et deux rendererPreviews combatEnabled=false. La capture n’est pas une page d’atelier DOM/CSS.

### sh4_whitestool_062

- Deux aperçus du renderer d’atelier montrent une touffe entière de brins ivoire, fine et distincte de Toadstool, environ 64 × 99 px.
- Base au niveau de la ligne y=430, pointes complètes, miroir cohérent. Les interstices restent lisibles sur le fond sombre ; pas de halo large ou de toile opaque visible.
- Aucun duel ne concerne ce profil : cases=[] et deux rendererPreviews combatEnabled=false. L’original a été testé, pas la variante de détourage archivée.

## Portée

Les captures de duel couvrent idle, douze ticks d’entrée de déplacement avec l’image statique, puis le retour à idle après relâchement, dans les deux placements ordinaires. Les portraits historiques se décodent et restent distincts des sprites utilisés en jeu. Les têtes, mains, pointes, couteau et appuis restent complets ; les inversions se dirigent vers l’adversaire. Aucun halo large ou frange colorée matériellement gênante n’est visible dans ces captures. Les faibles pixels d’alpha hors contour ne sont pas effacés.

Les touches sont envoyées aux callbacks InputState existants et le véritable FightEngine produit les captures. Il n’y a ni injection de position/état d’acteur, ni changement de rôle. Le mouvement est une translation de l’unique idle dessiné ; aucune animation de marche n’a été créée ou annoncée.

Cette QA utilise Canvas natif, pas Chromium. Elle ne certifie pas DOM/CSS, livraison clavier réelle du navigateur, HTTP, service worker, attaques/contacts/gardes/finishers ou durée des animations d’origine. Les six vues restent des candidats statiques à fidélité non certifiée.

`native-visual-review.json` contient la liste de toutes les captures inspectées, leurs empreintes, les rapports associés et les observations. Le delivery gelé est inchangé : `b3f63409b2dadf326033ddb62fb6f4c8e42289d780f1694c1ac38b10208bbe6c`.
