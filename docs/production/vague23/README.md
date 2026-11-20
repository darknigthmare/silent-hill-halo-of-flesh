# Vague 23 — livraison personnages et décors

[Rapport de livraison](RAPPORT_VAGUE23_PERSONNAGES_STAGES.md) · [Audit et absences restantes](final-audit.json) · [QA native](qa-native/report.json) · [Tests complets](validation/gates.json) · [Classeur vérifié](workbook/workbook-verification.json).

Cette vague ajoute huit vues latérales dédiées et six stages manquants, soit vingt PNG actifs. Le catalogue atteint 159 vues latérales candidates, 71 stages bitmap sur 123 et conserve ses 204 portraits et six clips animés.

Les sources, sorties natives, reçus d’import, captures et limites sont conservés. Aucun rôle, identifiant, règle de combat, portrait antérieur ou clip n’est remplacé. Le rapport distingue les quatre profils admissibles au duel des quatre références hors duel, les scènes de préversion, le refus de génération et les candidats écartés.

## Rejouer les contrôles

Les scripts d’import sont des outils de production incrémentale : ne pas réimporter les livraisons déjà traitées. Le journal des huit imports est conservé au niveau supérieur. Les scripts de QA et d’audit ciblent l’état de cette vague.

- `audit-final.mjs` : périmètre, provenance, correspondance registre/manifeste et mémoire.
- `aggregate-native.mjs` : consolidation des rapports natifs existants par empreintes exactes.
- `run-validation-gates.py` : suite du projet et tests de l’importeur, avec sorties archivées.
- `update-corpus-workbook.mjs` / `verify-corpus-workbook.mjs` : mise à jour ciblée et réouverture du classeur via Artifact Tool.
- `write-wave-report.py` : rapport depuis les preuves réussies, sans écraser une livraison existante.
