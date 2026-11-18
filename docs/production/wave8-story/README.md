# Illustrations des chroniques — vague 8

Quatre paires accompagnent les textes français déjà présents dans les Chroniques. Ouvrir **Chroniques** dans le jeu, puis choisir l’un des titres ci-dessous. [Planche des huit illustrations](overview.jpg)

| Chronique | Ouverture | Dénouement |
| --- | --- | --- |
| **Mémoire sous la glace** · *Shattered Memories* | Le fauteuil du cabinet, le crayon et le questionnaire situent l’évaluation de Harry. Une silhouette froide se devine de l’autre côté de la vitre. | Une fissure coupe en deux le reflet de Harry dans la glace. |
| **Les pétales de Maya** · *The Short Message* | La lumière d’une lampe à abat-jour carré révèle les feuilles autocollantes qui tapissent un appartement de la Villa. | Quelques pétales quittent la silhouette peinte sur le mur de l’atelier de Maya et traverse la lumière du matin. |
| **Le signal sous St. Amelia** · *Townfall* | Simon écoute au bord de l’eau, le dos tourné aux façades noyées de brume. | Le dernier point lumineux du CRTV s’estompe, à la fenêtre d’un bâtiment de St. Amelia. |
| **Pluie sur Ryall** · *Downpour* | Dans la prison d’Overlook, Murphy se tient sous les ombres des hautes fenêtres. | Une main ouverte entre Anne et Murphy donne forme au choix du pardon. |

Pour *Townfall* et *Downpour*, l’ouverture accompagne la première entrée en combat. La fin apparaît avec le bilan de victoire de la chronique. Pour *Shattered Memories* et *The Short Message*, le plan de rencontres ne contient que des poursuites scénarisées conservées en dossier. Dans leurs archives, **Voir le dénouement illustré** ouvre l’image de fin. Cette lecture laisse le nombre de tentatives et la progression intacts.

Les images interprètent les dénouements écrits pour ce projet. Les captures d’époque et les portraits servent de références d’architecture, de costume et d’accessoires. La vue promotionnelle du récepteur montre notamment les deux commandes diagonales et l’antenne repliée du CRTV de *Townfall*. Les plans du cabinet et de l’appartement, le reflet fissuré, les pétales en mouvement et la composition face à face à Overlook sont des réinterprétations. Les liens des images originales, les prompts, leurs empreintes SHA-256 et celles des WebP figurent dans le [journal de génération](generation.json). [Présentation du CRTV par Screen Burn sur PlayStation Blog](https://blog.playstation.com/2026/02/12/silent-hill-townfall-reveals-first-person-gameplay-in-a-new-trailer/) · [Chapitre d’Overlook et décision finale](https://www.silenthillmemories.net/sh8/walkthrough_10_overlook_penitentiary_en.htm)

[Entrée du premier combat de Townfall](qa/static_beneath_st_amelia-opening.jpg) · [Fin de Downpour](qa/murphy_rain-ending.jpg) · [Dénouement du dossier de Maya sur mobile](qa/maya_villa-dossier-ending.jpg)

## Vérification

La vérification HTTP utilise les archives et les commandes normales du jeu. Elle prépare les K.-O. décisifs pour exercer les transitions de combat, le dernier écran et l’enregistrement du résultat. Pour les dossiers, elle ouvre le dénouement dans l’interface et vérifie l’absence de tentative et de victoire. Après installation du service worker, Chromium passe hors ligne et vérifie le décodage, les dimensions et le SHA-256 de chaque illustration des deux vagues. [Rapport et résultats par chronique](qa/report.json)

```sh
npm run build
QA_STORY_ROUTES=harry_ice,maya_villa,static_beneath_st_amelia,murphy_rain QA_OUTPUT=docs/production/wave8-story/qa node scripts/http-qa-chronicle-art.mjs
```

Sept des quinze chroniques possèdent désormais une paire. Les huit paires à produire sont **La brume d’Alessa**, **La sentence de James**, **Le fils qui revient**, **Les gardiens du livre**, **204863**, **La procession d’Hinako**, **Les cendres d’Alessa** et **Le trauma partagé**.
