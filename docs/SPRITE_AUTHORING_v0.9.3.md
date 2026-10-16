# v0.9.3 — Montage des clips, sans fausses images

Continuation de la PR #4 à partir du commit `6998226008f06c631adb51ab4890a099fdb717a6`.
Les deux PNG antérieurs restent les seules images de personnage intégrées. Ni cet éditeur
ni cette livraison ne génèrent les 228 profils manquants. Un montage n’atteste pas une
animation correcte, une anatomie canonique ou une fidélité 1:1.

## Dans l’atelier

Ouvrir **Monter les images importées** dans une fiche disposant d’images. Chaque étape
sélectionne un fichier individuel déjà présent, avec une durée entière de 1 à 600 ticks
à 60 Hz. On peut déplacer ou retirer les étapes et demander une prévisualisation locale.
Les repères préparation/impact/récupération d’une attaque sont lus dans le profil du
moteur : la timeline ne modifie pas les dégâts, la portée ou les fenêtres de collision.
Les attaques ne bouclent pas indépendamment du moteur.

La prévisualisation porte la mention **Brouillon de montage non publié**. Elle n’écrit
ni dans le dépôt, ni dans les sauvegardes du joueur. Répéter le même PNG dans plusieurs
étapes ne produit pas de nouvelles images et ne permet pas de revendiquer une animation.
La lecture automatique reste désactivée s’il n’existe qu’une image distincte.

Les brouillons ne persistent pas au rechargement de page. Exporter le JSON avant de
quitter. Le JSON contient les empreintes et l’ordre des images, la pose et l’ancien clip.
Il ne contient pas les pixels : il accompagne le projet qui possède déjà ces fichiers.
Une pose absente ne peut pas être publiée en recyclant uniquement idle ; il faut au
moins une image dédiée et une revue visuelle réelle de la séquence.

## Appliquer un montage

```bash
python scripts/apply-sprite-clip.py HALO_CLIP_identifiant_pose.json
python scripts/apply-sprite-clip.py HALO_CLIP_identifiant_pose.json --apply --pose-reviewed
npm run sprites:check
npm test
npm run build
```

La première commande est une simulation sans écriture. La publication exige explicitement
la revue de la pose. Elle vérifie le profil, l’œuvre, l’ordre et les empreintes réelles des
images, les durées, la boucle et le précédent clip. Un export périmé est refusé, au lieu
d’écraser un montage plus récent. Le registre est publié atomiquement sous le verrou de
l’importeur. Les fichiers image, la provenance, le statut candidat et la fidélité ne sont
pas modifiés. Pillow est nécessaire à la vérification locale des images par l’outil Python.

Limites : 256 étapes et 36 000 ticks par clip ; aucune exécution de commande contenue dans
le JSON. La vérification technique ne sait pas reconnaître le bon mouvement dans l’image.
L’option de revue n’est pas une certification de l’anatomie ou de la propriété intellectuelle.

L’importeur individuel conserve maintenant `frameTicks` lors d’un ajout. Si une nouvelle
image a une durée différente, les anciennes durées sont conservées et le clip utilise des
durées explicites par étape. Les poses inconnues et les attaques en boucle sont refusées.

## Erreurs et filtres

Un échec de chargement dans l’inspecteur est annoncé comme tel, sans prétendre que le
fichier est affiché. **Réessayer cette image** relance explicitement le chargement et
fonctionne sans recharger la page. Le passage du filtre film au catalogue complet remet
le dossier sur un profil de la page visible, au lieu de conserver une sélection invisible.

## Validation et portée

Les tests unitaires couvrent les contrats JS/Python, les durées, la réutilisation de frames,
les collisions de versions, le verrou, les entrées incorrectes et les refus sans écriture.
Les fixtures pixel synthétiques restent confinées aux tests ; elles ne sont pas des sprites
livrés. Le parcours HTTP `http-qa-clips-v093.mjs` manipule les vrais PNG existants, les contrôles,
les exports, les filtres, le réseau interrompu et le mode hors ligne. Les autres suites HTTP
restent exécutées. Consulter les résultats du commit exact dans la PR et le rapport de livraison.

## Travail artistique restant

Toujours 230 profils, 2 images candidates, 228 profils sans sprite accepté, zéro animation
livrée et aucune fidélité 1:1 certifiée. Les décors et effets restent procéduraux. Les repères
de l’atelier n’effectuent aucun audit canonique des noms, timings ou actions du catalogue.
