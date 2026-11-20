# Vague 23 — complément de preuves du corpus

Audit du **19 novembre 2026**, confronté à la révision `2026-11-19-final-66` de la PR nº 6, commit `cffb58bbcb78c2bdb1381965ea0efb3e5fb54994`.

## Résultat

**Aucune œuvre nouvelle à ajouter parmi les 66 notices.** Transmission, Townfall publié, les trois films, les éditions mobiles, les machines et les crossovers sont déjà distingués. Ce complément conserve les identifiants existants et n'altère ni le corpus central, ni le runtime, ni les classeurs.

L'[audit structuré](evidence-addendum.json) contient une précision factuelle et trois sources primaires supplémentaires. Ces preuves documentent les œuvres ; elles ne valident pas à elles seules de nouveaux personnages ou des décors.

## Précision utile : Ascension

La notice `ascension_2023` peut être enrichie avec les deux dates publiées par **Genvid** :

- fin de la portion interactive : **14 avril 2024** ;
- fin du parcours ultérieur **What-If** : **15 juillet 2024**.

Le producteur présente les épisodes terminés et le parcours canonique comme consultables à la demande. Cette affirmation du producteur est vérifiée sur sa page ; la lecture effective des épisodes et la disponibilité des applications n'ont pas été testées. La note existante sur les applications reste donc valable.

Le classement en série interactive demeure inchangé. Les variantes What-If doivent conserver leur provenance lors des études de récit, au lieu d'être confondues avec les choix du parcours canonique.

Source : [Genvid — SILENT HILL: Ascension](https://genvid.com/silent-hill-ascension-2/).

## Sources primaires supplémentaires

| Notice existante | Apport de la source | Limite à conserver |
|---|---|---|
| `the_arcade_2007` | La fiche Konami confirme le jeu, le mode un à deux joueurs et la fin du service e-amusement. | La page n'établit pas à elle seule la date de sortie initiale ni l'exhaustivité du contenu. |
| `book_of_memories_2012` | La fiche Konami confirme le jeu PS Vita, ses éléments RPG et la coopération jusqu'à quatre joueurs. | La date de la page est régionale. Ne pas remplacer une date mondiale sans comparaison. L'extension de 2013 reste une notice distincte. |
| `the_escape_mobile_2007` | Le catalogue officiel NTT DoCoMo de l'automne-hiver 2007 atteste le titre Konami et la visée par orientation du téléphone. | C'est une annonce/catalogue prévisionnel. Elle ne remplace pas les preuves de lancement déjà présentes. |

Liens :

- [Konami — SILENT HILL THE ARCADE](https://www.konami.com/arcadegames/products/site/am_silent_hill/).
- [Konami — Book of Memories](https://www.konami.com/games/eu/en/products/shbom/). Le titre de page « Books » n'impose aucun renommage : son descriptif écrit bien « Book of Memories ».
- [NTT DoCoMo — nouveautés i-app automne-hiver 2007, page 1](https://www.docomo.ne.jp/binary/pdf/info/news_release/page/news_release070918_01.pdf). L'analyse porte sur le texte extrait ; la demande de capture de page a expiré.

## Points déjà corrects

- **Transmission** est un programme d'actualités, sans personnages ou lieu autonome déduits de son nom.
- **Townfall** est déjà indiqué publié le 24 septembre 2026, avec `st_amelia_marina` comme raccord.
- **The Short Message** et **Silent Hill f** possèdent déjà leurs raccords `villa` et `ebisugaoka`.
- **Dead by Daylight** est déjà classé comme collaboration dont les contenus gardent la provenance du jeu hôte.
- **The Escape mobile**, **Silent Hill Escape** de Konami Gaming et **Silent Hill Return** de Konami Gaming sont déjà distincts ; cette dernière machine est également distincte du film.

Les champs `coverageStatus` et `coverageNote` du corpus décrivent la couverture **avant la vague 21**. Ils ne doivent pas être réécrits à l'occasion de cette précision documentaire.

## Fichiers examinés

- `docs/BIBLE_CORPUS_SILENT_HILL.md`
- `docs/production/franchise-corpus.json`

Les fichiers centraux et les deux classeurs n'ont été ni modifiés ni réexportés par cette passe.
