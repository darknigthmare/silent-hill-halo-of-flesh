# Game development skills — Silent Hill: Halo of Flesh

Baseline: `main` at `1e6e408a3ef9d66869fdf7ce26eded06e383d12a`, v0.9.6. The game uses a custom JavaScript/Canvas 2D fighting engine, not Unity, Godot or Phaser. External skills are methodological guidance, not automatically executable engine APIs.

## Skill-to-code mapping

| Discipline | Existing implementation | Verification |
|---|---|---|
| [Create game assets](https://github.com/gamedev-skills/awesome-gamedev-agent-skills/tree/main/skills/disciplines/create-game-assets) | `art/registry.json`, `scripts/build-sprites.mjs`, `src/sprite-animation.js` | Check identity, source, transparency, body framing, pose coverage, real animated frames and in-game screenshots |
| [Input systems](https://github.com/gamedev-skills/awesome-gamedev-agent-skills/tree/main/skills/disciplines/input-systems) | `src/player-input.js`, `src/fight.js` | Remapping, two gamepads, disconnect/reconnect, pause and context windows |
| [Game feel](https://github.com/gamedev-skills/awesome-gamedev-agent-skills/tree/main/skills/disciplines/game-feel) | `src/combat-resolution.js`, `src/fight.js`, `src/shared.js` | Hit timing, guard, interruption, camera and audio feedback |
| [Game AI](https://github.com/gamedev-skills/awesome-gamedev-agent-skills/tree/main/skills/disciplines/game-ai) | `src/fight.js`, `src/combat-reference-policy.js` | Reproducible AI behavior without unauthorized character abilities |
| [Audio design](https://github.com/gamedev-skills/awesome-gamedev-agent-skills/tree/main/skills/disciplines/audio-design) | `src/shared.js`, `src/stage-director.js` | Hit cues, radio warning, ambience, volume and reduced-motion settings |
| [Performance](https://github.com/gamedev-skills/awesome-gamedev-agent-skills/tree/main/skills/disciplines/performance-optimization) | `src/fight.js`, `src/sprite-system.js` | Repeatable frame-time measurements before and after changes |

## Production priorities (28 October report)

The existing report records 230 profiles, 74 illustrated, 109 active PNGs, 156 without PNG, 840 open actions including 93 P0. No 1:1 fidelity is certified. Prioritize one fully testable duel with existing fighters and stage, then scale the art and animation pipeline. A static PNG must not be counted as an animated clip; an authored finisher timeline must not be counted as final bitmap art.

## Definition of done

1. Define affected character IDs, source/edition, exact poses and gameplay behavior.
2. Implement against current modules, keeping source observations distinct from versus adaptations.
3. Verify startup/active/recovery, contact, guard, interruption, orientation and negative cases as applicable.
4. Inspect the real in-game art at gameplay scale, including weapons, anchoring and fallbacks.
5. Run the relevant project tests (`npm test`, `npm run test:art`, `npm run qa:browser` as appropriate); do not claim unexecuted tests passed.
6. Update only the corresponding production tracking actions and preserve workbook formulas, references and prior annotations.
7. Record limitations, screenshots and evidence; do not certify visual fidelity from code tests alone.

The external skills do not provide franchise-specific combat or lore authority. Use the existing project research and reference policy for that.
