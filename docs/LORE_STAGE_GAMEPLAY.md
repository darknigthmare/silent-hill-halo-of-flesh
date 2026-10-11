# Gameplay d’arène cohérent avec le lore

## Principe

Une arène Silent Hill ne doit pas être une image fixe derrière un combat générique. Elle exprime le traumatisme, la source et le type de lieu par cinq couches séparées :

1. **Géométrie jouable** — largeur utile, proximité des bords et pression verticale.
2. **Terrain** — adhérence, poids, eau, boue, glace, pétales, grille ou espace impossible.
3. **Perception** — brume, obscurité, silhouette, radio et lumière.
4. **Transformation** — signal, durée et langage propre à la source.
5. **Événements** — objets et phénomènes du lieu réagissant au combat.
6. **Déclencheurs** — le premier impact lourd, le milieu de la bascule et la pression de fin de round appellent les interactions propres au lieu.

## Contrat de fidélité

- Le motif d’un événement vient du lieu, de ses accessoires ou du langage de sa source.
- Le moteur ne prétend pas qu’une zone de dégâts, une fréquence ou une valeur numérique est canonique.
- La mécanique doit être télégraphiée, bornée et évitable, sauf événement explicitement global.
- Une variante de stage ne reçoit pas automatiquement la même transformation que les autres épisodes.
- Le décor ne doit pas effacer la lisibilité des silhouettes ou invalider un moveset.

## Exemples de doctrine

- **Midwich** : casiers, panne et sirène ; espace scolaire et recul contrôlé.
- **Brookhaven / Alchemilla** : chariot, ascenseur, moniteurs et lumière instable.
- **Toluca Prison** : projecteur, cloche, chaînes et pression latérale.
- **Subway** : grondement, rame et ligne de danger.
- **Shattered Memories** : prise de glace et inertie accrue.
- **P.T.** : boucle courte, portes, reflet et respiration de la pièce.
- **The Short Message** : floraison, racines et verticalité de la villa.
- **Silent Hill f** : sanctuaire, cloche, pétales et progression rituelle.
- **Townfall** : rupture CRTV, pluie, signal, eau, vent et géométrie différente.

## Déclenchement en combat

Les trois premières interactions documentées d’une arène ne sont plus de simples notices :

- la première répond au **premier impact lourd** ou au délai initial du lieu ;
- la deuxième répond au moment où la **transformation Otherworld dépasse 50 %** ;
- la troisième répond à une **vitalité critique** ou au dernier quart du temps réglementaire ;
- la cadence autonome demeure un repli, afin qu’un décor reste vivant même lors d’un combat très défensif.

Chaque déclenchement mémorise sa cause dans le snapshot du moteur. Les événements ne retirent pas instantanément le contrôle : leur danger associé conserve une télégraphie et une zone lisible.

## Animation

Les pistes sont attachées à une phase : Fog World, Otherworld ou les deux. L’événement actif peut injecter une animation temporaire. Le mouvement réduit désactive ou simplifie les couches non essentielles.
