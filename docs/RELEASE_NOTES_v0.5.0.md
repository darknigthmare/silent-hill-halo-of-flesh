# SILENT HILL: HALO OF FLESH — Notes de version 0.5.0

## Lore-First Complete Movesets & Signal Interface

La v0.5.0 remplace les six attaques génériques héritées du prototype par un véritable langage de combat propre à chaque manifestation. Les commandes restent volontairement compactes, mais leur direction, leur posture et leur contexte donnent accès à seize actions documentées et nommées distinctement par profil.

## Totaux conservés et étendus

- 230 manifestations jouables.
- 75 boss.
- 16 packs média audités.
- 123 arènes et 374 animations d’arène.
- 15 Chroniques.
- 460 fatalités de combattant et 123 fatalités d’arène.
- **3 680 mouvements**, soit seize par manifestation.
- 425 mouvements directement ancrés dans une action ou un comportement attesté.
- 2 796 composites lore-friendly.
- 459 adaptations versus explicitement signalées.

## Movesets complets

Chaque profil possède désormais :

- quatre frappes légères : neutre, avant, basse et aérienne ;
- quatre attaques lourdes : neutre, avant, basse et aérienne ;
- une saisie ;
- cinq techniques : neutre, avant, arrière, basse et aérienne ;
- un Nightmare ;
- un mouvement de désespoir disponible à faible vitalité.

Les données exposent input, démarrage, activité, récupération, dégâts, portée, niveau de garde, déplacements, armure, invulnérabilité, projectiles, pièges, auras, téléportations, multi-coups, propriétés de lancement et routes d’annulation.

## Contrat de fidélité

Trois niveaux sont visibles dans l’interface et les exports :

1. **Directement attesté** — action, arme ou comportement observé dans la source.
2. **Composite lore-friendly** — recomposition jouable de plusieurs comportements attestés.
3. **Adaptation versus** — action nécessaire au format de combat, dérivée de la morphologie ou du symbolisme et jamais présentée comme canonique.

Les apparitions passives, set-pieces et humains adaptés conservent leurs réserves. Les noms de *Townfall* issus des guides de sortie sont balisés comme établis par guides ou trophées lorsqu’aucun bestiaire officiel n’existe.

## Moteur

- Résolution directionnelle des seize commandes.
- Coup de désespoir sélectionné automatiquement sous le seuil de vitalité documenté.
- Projectiles multiples, trajectoires, gravité et homing.
- Pièges persistants et zones d’aura.
- Téléportations derrière ou à travers l’adversaire.
- Armure, invulnérabilité et postures de contre.
- Multi-coups, lancement, knockdown et saisies spéciales.
- IA capable de choisir projectile neutre, assaut avant, retraite spéciale, technique basse ou attaque aérienne selon le moveset et la distance.
- HUD Observation enrichi avec input, nom et niveau de fidélité du coup actif.

## Archives et UI

- Nouvel onglet **Movesets 1:1** avec les 3 680 actions.
- Dossiers Versus et Bestiaire enrichis avec les seize commandes.
- Export `data/movesets.json`.
- Document exhaustif `docs/MOVESETS.md`.
- Command Center retravaillé comme un registre CRTV/radio de terrain : fréquence, force du signal, code de dossier, fiche de preuve et hiérarchie plus organique.
- Palette rouille, ivoire sale, vert de moniteur et rouge de signal, sans réutiliser une interface officielle.

## QA

- 49 tests automatisés réussis avant la passe navigateur.
- Tests dédiés aux commandes directionnelles, désespoir, projectiles, pièges et postures de contre.
- Rendu exhaustif des 230 manifestations et des 123 arènes maintenu.
- Build statique, exports, PWA, cache hors ligne et documentation vérifiés.

## Limites

- Les animations visuelles restent procédurales et originales ; la fidélité image par image nécessite une production de sprites dédiée.
- Un mouvement composite ou adapté n’est jamais présenté comme une animation officielle.
- Le multijoueur réseau et le rollback ne sont pas inclus.
- Le tactile cible principalement le joueur 1.
