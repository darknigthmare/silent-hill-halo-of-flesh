# Vague 23 — character agent delivery

## Selected native candidates

Seven assets are selected. Import, gameplay review and publication belong to the root agent. The aggregate repeats the incremental deliveries; it must not cause duplicate imports.

| ID | Existing role | Delivery | Scope |
| --- | --- | --- | --- |
| sh4_greedy_worm_069 | Noncombatant | delivery-part1.json | Dedicated whole exterior view |
| sh4_toadstool_061 | Environmental obstacle | delivery-part1.json | One rooted colony |
| sh4_whitestool_062 | Environmental obstacle | delivery-part1.json | One rooted colony |
| origins_remnant_077 | Combatant | delivery-part2.json | Empty floating cage and intrinsic flat shadow |
| bom_tremer_133 | Combatant, ground only | delivery-part2.json | Limbless right-facing low profile |
| bom_wood_sapling_139 | Combatant | delivery-part2.json | Whole wooden body and root supports |
| arcade_gum_head_arcade | Combatant | delivery-part3.json | Whole right-facing unarmed Arcade form |

All seven PNGs are native 1254×1254 RGBA outputs, copied byte-identically. Their combined native file size is 6,242,613 bytes. No resampling, color adjustment, alpha editing or compositing was performed. Each delivery retains full prompt, source URLs, downloaded source hashes and byte sizes, generated file path, native SHA256, alpha/framing measures and explicit review limits. The final aggregate and audit revalidated native bytes, dimensions, RGBA mode and reference hashes for all seven.

## Coverage meaning

These are seven replacements of legacy views whose IDs already had portraits and a static idle frame. They add no absent portrait, no baseline missing combat sprite, no animation clip and no fidelity certification. The three SH4 environmental/noncombatant roles remain outside duels. Tremer remains ground only. Remnant already contains its intrinsic humanoid shadow. The delivery proposed shadowScale=0, but that property does not exist in the baseline/runtime and was not applied. The engine’s native ellipse remains active. Root reports no visibly detached duplicate shadow in the native render; this is a presentation limit, not proof of generic shadow suppression.

The baseline missing triage still contains 37 absent combat views and 26 absent portraits: 20 combat absences have a direct or related historical refusal, 8 lack visual source coverage, and 9 have other identity or role blockers. Four potentially combat-enabled source priorities remain unresolved; their exact needs are copied in audit-character-production.json.

## Red Pyramid disposition

The initial Arcade Red Pyramid candidate was generated before the root agent's later report that Film Red Pyramid generation was blocked. The Arcade candidate was already held because it retained a three-quarter frontal view. It is never in selected.

The pose-correction prompt had been prepared and the original candidate viewed, but **no correction imagegen request had started** when the stop instruction arrived. The correction is cancelled before call and marked doNotExecute. No retry or alternative was made afterward. See red-pyramid-disposition.json for the parent-reported Film request ID and explicit call state.

## Source and review limits

The references are original model renders or native gameplay images mirrored by the repository's known Silent Hill Memories archive; official hosting is not claimed. They establish source identity and visible silhouette, with limits:

- Remnant: 200×272 source; wire topology and lateral shadow projection remain interpreted.
- Tremer: very small oblique bestiary source; right-facing relief and fine texture are reconstructed.
- Wood Sapling: native portrait plus labeled pre-release 2012-06-06 gameplay; retail geometry is not independently certified.
- SH4 colonies: one small native angle each; strand count and depth are not proven.
- Gum Head: exact Arcade model plus two gameplay frames; pose is authored and no SH4 club is transferred.

The visible body envelope is fully inside the canvas. Requested padding was not universally met; actual padding is reported per file. Very low-alpha fringe is preserved. In-engine support, overlap and final approval are root responsibilities. No shared manifest, runtime source, git commit or publication was modified by this agent.
