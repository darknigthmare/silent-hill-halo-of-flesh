# SILENT HILL: HALO OF FLESH — v0.8.1
## Corps, collisions et lieux cohérents

Cette version intègre la v0.8.0 récupérée, qui n'avait pas encore été publiée sur main, puis corrige le combat et les décors. Elle ne rajoute pas artificiellement des combattants ou des coups.

### Combat

Les 23 familles de silhouettes procédurales partagent désormais une définition de corps avec le moteur de collision. Les insectes, quadrupèdes, serpents, fantômes et formes suspendues n'héritent plus d'un rectangle humain universel. Les échelles enfant/géant sont appliquées une seule fois. La posture accroupie ajuste simultanément silhouette et zone vulnérable. Les projectiles partent du corps qui les émet.

Les sols ralentissent les acteurs en contact avec eux, pas les entités en vol ou suspendues. Une esquive directionnelle suit la direction tenue ; l'esquive neutre conserve le recul. Les volumes corporels se séparent sans pousser le personnage coincé hors de l'écran ; un passage aérien suffisamment haut n'est pas bloqué par une collision au sol.

### Dangers et objets

Le télégraphe, la silhouette et la collision utilisent la même géométrie. Un effondrement de bord ne frappe plus le bord opposé ; une fissure de glace ciblée reste au lieu annoncé. Un anneau conserve un centre sûr selon le volume entier du personnage. Les racines et dangers bas peuvent être sautés ; une onde psychique de pleine hauteur ne le peut pas.

Trains et chariots se déplacent physiquement dans le couloir annoncé : ils ne frappent pas tout le trajet dès la première image. Chaque passage ne peut toucher un acteur qu'une fois. Les dégâts non gardés interrompent réellement l'attaque. Une expiration du chronomètre interdit la résolution d'un coup ou danger après la fin du round.

La silhouette d'un danger est dessinée même lorsque les animations d'ambiance sont coupées. L'événement ne crée plus une deuxième représentation du même objet ailleurs dans le décor. L'horloge visuelle dépend de la simulation ; pause et fréquence de rendu n'avancent pas les machines.

### Lieux

Les règles explicites d'un stage prennent priorité sur les règles génériques de sa source. Les événements incompatibles avec ses accessoires déclarés sont filtrés. Lakeview n'hérite plus d'un feu ou miroir générique ; Brookhaven Roof ne réutilise plus les accessoires d'un sous-sol hospitalier. Les intérieurs (hôpital, appartement, métro) possèdent maintenant un espace fermé en perspective plutôt qu'une façade lointaine extérieure. Les zones élémentaires ne changent plus arbitrairement d'élément toutes les quelques secondes.

### Comptages de cette version

230 manifestations, 75 boss, 123 stages, 15 chroniques, 4 600 commandes, 460 fatalités de combattant et 123 de stage : inchangés. Les associations de décor diminuent volontairement : 352 pistes d'animation (374 auparavant), 300 événements distribués (446), 286 interactions (359), 335 liens de dangers (474). Les 14 terrains, 15 styles de transformation et 22 familles de chorégraphies restent présents.

### Validation et limites

109/109 tests Node réussis, 15 modules JavaScript, 9 pages HTML, build de 44 fichiers. Les captures Canvas sont des rendus du moteur courant en mémoire, pas des photos officielles et pas une validation de navigation du site. La navigation locale Chromium est bloquée par la politique de l'environnement ; tests UI, commandes physiques, PWA, mobile et longues sessions restent à réaliser.

Les corps, décors, timings et paramètres sont des adaptations originales de versus. Les relations de motifs sont contrôlées par le catalogue du projet, pas certifiées par un nouvel audit exhaustif du canon. La qualité visuelle reste celle de silhouettes procédurales de prototype, pas une reconstitution graphique 1:1.
