# QA native — Suite des sprites du 17 novembre 2026

**78 contrôles réussis, aucun échec**, répartis sur deux passages du véritable `FightEngine` avec Canvas natif. Chaque paire a été exécutée dans les deux ordres : quatre duels au total, huit rendus de portrait et quatre captures finales de combat inspectées. Les deux portraits de Steel Guardian ont également été inspectés.

| Passage | Contrôles | Duels | Résultat |
|---|---:|---:|---|
| [Anne Cunningham ↔ Prisoner Juggernaut](downpour/README.md) | 39 | 2 | Silhouettes complètes, transparence correcte, appuis cohérents. |
| [Steel Guardian ↔ Anne Cunningham](steel/README.md) | 39 | 2 | Ailes et chaînes complètes, caméra adaptée, suspension cohérente. |

Aucun recalage du registre recommandé. Les portraits restent distincts des poses de combat. Registre et manifeste sont restés inchangés pendant chaque passage ; l’import Steel a eu lieu entre les deux.

[Résumé structuré](summary.json)

Ces rendus ne sont pas des captures de navigateur. Les vérifications concernent les introductions, les poses fixes, le rendu, les ressources exactes, la caméra et la pause. Elles ne certifient aucune animation, attaque, collision, fidélité 1:1 ou comportement DOM/CSS/service worker.
