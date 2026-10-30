# Air Screamer — animation reference slice

Source of truth: \`art/registry.json\`, entry \`sh1_air_screamer_001\`.

## Existing asset inventory

Three transparent full-body frames are registered. The only authored animated clip is \`idle\` with frame sequence \`[0,1,0,2]\`, four steps of six ticks, looping. This is an integrated **candidate**, not visually certified 1:1. Its different anchors must be inspected in the running arena before any approval.

## Missing deliverables

| Pose | Current status | Acceptance |
|---|---|---|
| Idle | Authored animated candidate | Verify body anchoring, natural wing motion, transparency and in-game scale |
| Walk / flight movement | No dedicated registered clip | Import distinct poses and align displacement without foot/wing sliding |
| Light / heavy attacks | No dedicated registered clips | Show startup, contact and recovery; confirm actual combat timings independently |
| Hurt / knockdown / KO | No dedicated registered clips | Distinct reactions, no stale attack frame or misleading fallback |
| Guard / dodge | No dedicated registered clips | Source-appropriate silhouette, state priority and collision integrity |
| Intro / victory / defeat / finisher | Missing presentation clips | Match source context and opponent; never substitute idle as completed cinematic |

## Integration sequence

1. Gather licensed or newly authored reference images, with edition and provenance recorded.
2. Produce **separate transparent full-body frames**, never a contact sheet as a single frame. Keep silhouette, wings and proportions consistent.
3. Import with existing sprite tooling and metadata checks; do not hand-edit \`src/sprite-manifest.js\`.
4. Author the clips in \`art/registry.json\` only after genuine distinct images exist. No duplicate-pixel animation claims.
5. Run \`npm test\`, \`npm run test:art\`, \`npm run qa:browser\` and inspect in-game captures at combat scale.
6. Update the production workbook statuses with evidence and outstanding blockers.

**Not done yet:** creating these missing images, integrating their animations, certifying fidelity, and passing browser visual QA. The presence of an idle animation alone does not satisfy a finished fighter.
