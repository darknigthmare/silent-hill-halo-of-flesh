// Individual story artwork: original compositions bound to one exact source profile.
// Static candidate images do not certify animation or 1:1 fidelity.
const ARTWORK = Object.freeze({
  sh1_air_screamer_001: Object.freeze({
    fighterId: 'sh1_air_screamer_001',
    source: 'sh1',
    stageId: 'old_silent_hill',
    status: 'integrated-candidate',
    fidelity: 'unverified',
    composition: 'original-compatible',
    intro: Object.freeze({
      path: 'assets/stories/sh1_air_screamer_001.intro.7ed088410461.png',
      sha256: '7ed08841046109a2c1e570f7b22b9d857e8c7a526807420f8046be1998c84a82',
      bytes: 1800262, width: 1672, height: 941,
      title: 'DERNIER PASSAGE',
      caption: 'Au-dessus de Levin Street, un battement traverse la neige. La rue reste vide sous les ailes.',
      alt: 'Un Air Screamer de Silent Hill 1999, ailes entières déployées, passe devant la maison de Levin Street dans la neige et le brouillard.'
    }),
    ending: Object.freeze({
      path: 'assets/stories/sh1_air_screamer_001.ending.2aa5dbd07554.png',
      sha256: '2aa5dbd075549dad46b789ddd4aa390c30141fc744735fe596f0f37197eb9930',
      bytes: 1794469, width: 1672, height: 941,
      title: 'LA RUE DEMEURE',
      caption: 'Le battement s’éloigne. La même façade demeure derrière la neige et le brouillard.',
      alt: 'La maison, la niche et la boîte aux lettres de Levin Street restent dans la brume après le départ de l’Air Screamer.'
    })
  }),
  sh1_groaner_003: Object.freeze({
    fighterId: 'sh1_groaner_003',
    source: 'sh1',
    stageId: 'old_silent_hill',
    status: 'integrated-candidate',
    fidelity: 'unverified',
    composition: 'original-compatible',
    intro: Object.freeze({
      path: 'assets/stories/sh1_groaner_003.intro.3cf2e2a42b4d.png',
      sha256: '3cf2e2a42b4dd0a9559ca5c62050591dea7ba3e43b201102707b86f757c4b097',
      bytes: 1764170, width: 1672, height: 941,
      title: 'AU RAS DE LA BRUME',
      caption: 'Un Groaner longe la maison de Levin Street. Ses pas traversent la neige qui tombe sur la chaussée.',
      alt: 'Un Groaner de Silent Hill 1999, entier et à quatre pattes, avance devant la maison, la niche et la boîte aux lettres de Levin Street.'
    }),
    ending: Object.freeze({
      path: 'assets/stories/sh1_groaner_003.ending.f76866b461ac.png',
      sha256: 'f76866b461ac91c71f978eaf5467eeb3690270a0f944f334a784042c1b96f6fe',
      bytes: 1722309, width: 1672, height: 941,
      title: 'DES PAS DANS LE SILENCE',
      caption: 'Les pas se sont éloignés. La niche et la maison restent derrière le voile de neige.',
      alt: 'La même rue de Levin Street est vide dans la neige et la brume après le passage du Groaner.'
    })
  }),
  sh2_lying_figure_020: Object.freeze({
    fighterId: 'sh2_lying_figure_020',
    source: 'sh2',
    stageId: 'south_vale',
    status: 'integrated-candidate',
    fidelity: 'unverified',
    composition: 'original-compatible',
    intro: Object.freeze({
      path: 'assets/stories/sh2_lying_figure_020.intro.b80a3fd0a6d3.png',
      sha256: 'b80a3fd0a6d3436ff4edf970349876ed485eeebfef6819963dcb14e94baf4888',
      bytes: 2211673, width: 1672, height: 941,
      title: 'DEVANT LES VITRES MASQUÉES',
      caption: 'Une silhouette entravée se tient devant Neely’s Bar. La brume atténue les fenêtres couvertes de papier.',
      alt: 'Un Lying Figure debout de Silent Hill 2 original, torse fermé et deux jambes entières, apparaît devant la façade de Neely’s Bar.'
    }),
    ending: Object.freeze({
      path: 'assets/stories/sh2_lying_figure_020.ending.e00f51f74769.png',
      sha256: 'e00f51f747697fc5f377fa0d6a2e7422a449529c54d813f2a8d678e46eea3540',
      bytes: 2055798, width: 1672, height: 941,
      title: 'LA FAÇADE MUETTE',
      caption: 'La silhouette a disparu du cadre. La porte et les vitres masquées demeurent dans la brume.',
      alt: 'La façade de Neely’s Bar et la chaussée restent vides, dans le même brouillard, après le passage du Lying Figure.'
    })
  })
});

export function storyArtwork(fighterId) {
  return Object.hasOwn(ARTWORK, fighterId) ? ARTWORK[fighterId] : null;
}

export function storyOpeningArtwork(run, enteringChapter = true) {
  if (!enteringChapter || run?.mode !== 'story' || !Number.isInteger(run.index) || run.index < 0) return null;
  const scenes = storyArtwork(run.playerId);
  if (!scenes) return null;
  if (run.index === 0) return scenes.intro || null;
  const rival = scenes.rival;
  return rival && rival.fighterId === run.queue?.[run.index] && rival.stageId === run.stages?.[run.index] ? rival : null;
}

export function storyEndingArtwork(run) {
  if (run?.mode !== 'story' || run.status !== 'complete') return null;
  return storyArtwork(run.playerId)?.ending || null;
}
