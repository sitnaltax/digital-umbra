// Runner definitions (player classes) and difficulty settings.

export const RUNNERS = {
  cipher: {
    id: 'cipher',
    name: 'Cipher',
    tagline: 'Ghost in the machine.',
    description:
      'You grew up in the margins. Taught yourself to pick locks, crack codes, and read people. ' +
      'Now you work in the dark—not for money, not for ideology, but because you\'re very, very good at it.',
    maxHeat: 10,
    maxFatigue: 10,
    startingHandLimit: 3,
    startingCash: 3,
    startingBurnerIds: 1,
    // Abilities available to this runner
    abilities: [
      {
        id: 'ghost_mode',
        name: 'Ghost Mode',
        description: 'Once per run, after clearing an obstacle, draw 2 extra cards instead of 1.',
        usesPerRun: 1,
      },
    ],
  },
};

export const DIFFICULTIES = {
  normal: {
    id: 'normal',
    name: 'Standard',
    description: 'The intended experience.',
    secretsToWinComplete: 30,
    secretsToWinMarginal: 18,
  },
};
