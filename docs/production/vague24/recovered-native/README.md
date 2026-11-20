# Vague 24 — récupération des PNG natifs restés locaux

Douze PNG générés dans la session précédente sont conservés ici à l’octet près,
avec leurs références source et les plans de génération disponibles. Cette
récupération ne génère pas d’image et ne modifie aucun registre du jeu.

## Livraison

- `delivery.json` contient **8 candidats sélectionnés** : Kashimashi, Irohihi,
  Kamugara, Harai Katashiro, Drum Monster, Shiromuku, Tsukumogami et Bloodsucker.
- Bloodsucker reste une référence d’atelier pour un **obstacle environnemental**,
  sans locomotion ni activation en duel.
- **4 PNG restent archivés** : les deux versions d’Ara-abare, la vue trois quarts
  de Drum Monster et l’angle source de Bloodsucker. Ils ne doivent pas entrer dans
  le manifeste actif par défaut.
- Ara-abare est retenu hors production active : trois appuis/pieds sont lisibles
  sur la reconstruction alors que les références fournies en montrent deux
  clairement. Une correction ou une preuve anatomique est encore nécessaire.
- Tsukumogami est un candidat sous réserve : sept mains sont lisibles et le
  huitième bras peut être masqué par le profil. Aucune topologie huit-bras n’est
  certifiée.

`native-mapping.json` contient les identifiants, variantes, SHA256, dimensions,
contrôles alpha, réserves et décisions. `copy-verification.json` vérifie chaque
copie. Les références sont dédoublonnées par SHA256, une seule copie par image.
`references/source-index.json` conserve les URL et preuves de récupération
historiques ; ces URL n’ont pas été retéléchargées pendant cette opération.

## Calibrations et transparence

Les ancres proposées suivent les appuis vus dans chaque image : pieds, pointes de
jambes-lames, ourlet principal ou petite base commune. Le centre des armes ou d’une
longue traîne ne déplace pas l’ancre horizontale. Le seuil alpha 32 mesure les
contours lisibles ; les pixels natifs ne sont jamais modifiés. La hauteur de pose
reste une proposition d’intégration, surtout pour Irohihi en posture native basse.
Elle ne constitue pas une taille debout canonique ni une mesure de collision.
Le contrôle au moteur appartient à l’intégration suivante.

Certaines prévisualisations révèlent un halo brun/gris dans les valeurs RGB de
pixels **alpha zéro**. Le canal alpha mesuré est réellement transparent. Ne pas
refaire les images pour ce seul effet de prévisualisation. Des résidus alpha 1
peuvent toucher le canevas ; aucun pixel lisible au seuil 32 ne le touche. Les
marges demandées dans les prompts ne sont pas toutes atteintes ; les valeurs
réelles sont enregistrées.

## Provenance et limites

Les fichiers sous `prompts/` sont des copies exactes des plans retrouvés. Leurs
associations avec les PNG ont été revues à partir des sujets et références, mais
le reçu exact d’invocation de l’outil n’a pas été retrouvé. Il n’est donc pas
réinventé. `prompt-set.json` fournit un index des chemins locaux autonomes.

Tous les résultats sont des **images statiques candidates**, avec
`fidelity: unverified` et zéro nouvelle animation. L’intégration doit préserver
les portraits existants, les clips, les identifiants et les rôles du catalogue.
