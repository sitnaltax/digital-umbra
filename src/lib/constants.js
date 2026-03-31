export const CONFIG = {
  startingHandLimit: 3,
  totalRuns: 12,
  maxUpgrades: 3,
  downtimeActionsTotal: 2,
  // Free reductions at start of downtime
  downtimeFreeHeatReduction: 1,
  downtimeFreeFatigueReduction: 1,
  // Rest action reductions (additional beyond free)
  restHeatReduction: 3,
  restFatigueReduction: 3,
  // Hand bonus when heat > half
  heatBonusThreshold: (maxHeat) => Math.floor(maxHeat / 2) + 1,
  // Escape obstacle counts by run segment
  escapeObstacleCount: (runNumber) => {
    if (runNumber <= 4) return 1;
    if (runNumber <= 8) return 2;
    return 3;
  },
  // Obstacles per run (run 12 is the final, longer run)
  obstaclesPerRun: (runNumber) => runNumber === 12 ? 10 : 7,
  // Data requirement scaling by run number
  scaleDataReq: (base, runNumber) => base + Math.floor((runNumber - 1) * 0.6),
  // Final run reward multiplier
  finalRunMultiplier: 2,
};

export const SKILLS = {
  social: ['deception', 'charm', 'connections'],
  making: ['architecture', 'comprehension', 'style'],
  breaking: ['cryptography', 'automation', 'malice'],
};

export const ALL_SKILLS = [
  ...SKILLS.social,
  ...SKILLS.making,
  ...SKILLS.breaking,
];

// Maps skill → its category
export const SKILL_CATEGORY = Object.fromEntries(
  Object.entries(SKILLS).flatMap(([cat, skills]) => skills.map(s => [s, cat]))
);

export const SKILL_LABELS = {
  deception:     'Deception',
  charm:         'Charm',
  connections:   'Connections',
  architecture:  'Architecture',
  comprehension: 'Comprehension',
  style:         'Style',
  cryptography:  'Cryptography',
  automation:    'Automation',
  malice:        'Malice',
};

export const CATEGORY_LABELS = {
  social:   'Social',
  making:   'Making',
  breaking: 'Breaking',
};

// UI colors
export const CATEGORY_COLORS = {
  social:   '#00f5ff',  // cyan
  making:   '#aaff00',  // chartreuse
  breaking: '#ff5555',  // red
};

export const SKILL_COLORS = Object.fromEntries(
  ALL_SKILLS.map(s => [s, CATEGORY_COLORS[SKILL_CATEGORY[s]]])
);
