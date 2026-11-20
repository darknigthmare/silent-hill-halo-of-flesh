# Vague 24 — préparation des contrôles

Base immuable : `54404d2280f6feee9530e95c42ffcb711a597e19`, après réunion des deux livraisons locales de la vague 23. Cette préparation ne déclare aucun résultat de rendu ou d’intégration.

## État initial enregistré

`scope-baseline.json` enregistre 230 profils, 204 portraits, 161 vues latérales candidates, 32 anciennes vues, 37 images de combat absentes, 26 portraits absents, six clips animés et 71 stages bitmap. Les 60 fichiers protégés incluent les règles, les définitions, les stages, le corpus et les deux classeurs. La commande de capture refuse une autre tête Git et conserve un fichier déjà existant.

## Contrôles préparés

- `qa-characters-native.mjs` adapte le harness de la vague 23 en conservant ses vérifications réelles de `FightEngine`, ses callbacks d’entrée et le renderer d’atelier. Les seuls changements sont les chemins de baseline et les étiquettes de vague. Les profils admis font deux duels ordinaires, un dans chaque orientation. Les rôles hors duel restent des aperçus d’atelier.
- `run-native-cases.py` exécute un profil par processus afin de limiter la mémoire. Il conserve les logs, délais, codes de sortie, empreintes de rapports et comptes exacts. Les sorties échouées ne gonflent pas les comptes de succès.
- `audit-final.mjs` compare les imports explicitement fournis à la base : PNG natifs, édition, rôle, portrait, clips, poses antérieures, fichiers protégés, manifeste, service worker et admission mémoire des duels affectés. Il refuse un chemin d’audit existant et une liste d’IDs ambiguë.

Exemple après les imports et le build des manifestes :

```sh
python docs/production/vague24/run-native-cases.py --ids=shf_kashimashi_151,shf_ara_abare_153,shf_irohihi_154,shf_kamugara_157,shf_harai_katashiro_158,shf_drum_monster_161,shf_shiromuku_166,shf_tsukumogami_167,sh1_bloodsucker --out=docs/production/vague24/qa-native/recovered
```

L’audit final exige la même liste d’IDs que les reçus fournis, un ou plusieurs `--receipt=...` et un nouveau `--out=...`. Les imports ultérieurs peuvent utiliser d’autres listes explicites ; le bilan final doit inclure tous les reçus ayant changé le registre depuis la base.

## Limites

La QA Canvas native ne teste ni Chromium, ni HTTP, ni DOM/CSS. Les captures doivent être inspectées séparément et leur revue consignée. Les tests de présentation droite/gauche, mouvement autorisé, repos et cadrage ne certifient pas les timings originaux, toute la matrice d’attaques ou la fidélité 1:1. Un PNG statique ne compte pas comme un nouveau clip animé. Les anciennes suites de la vague 23 gardent leurs dates et ne sont pas attribuées à cette passe.

## Préparation vérifiée

Les trois scripts JavaScript passent `node --check` ; le pilote Python passe sa compilation de syntaxe. Les dépendances Canvas natives et Sharp sont présentes dans le runtime partagé. Aucun moteur, registre, manifeste, ancien rapport ni classeur n’est modifié par cette préparation.
