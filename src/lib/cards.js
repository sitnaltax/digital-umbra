// Card definitions and deck management.
//
// A card "definition" describes a card type. A card "instance" is one copy of
// that definition with a unique id, living in a deck/hand/discard.
//
// Effect types:
//   { type: 'data', amount: N }
//   { type: 'skill', skill: 'deception' }
//   { type: 'skill_category', category: 'social' }
//   { type: 'expertise', amount: N }
//   { type: 'draw', amount: N }
//   { type: 'heat', amount: N }        positive = gain heat, negative = lose heat
//   { type: 'fatigue', amount: N }     positive = gain fatigue, negative = lose fatigue
//
// Cards with `options` let the player choose which set of effects to apply.
// Cards with `isMultiplier` enter a selection mode: the player picks a data card
//   from hand, which is then played with its data multiplied.
// Cards with `mustPlayImmediately` are auto-triggered when drawn; they never sit in hand.

let _nextCardId = 1;

export function resetCardIds(seed = 1) {
  _nextCardId = seed;
}

export function nextCardId() {
  return _nextCardId++;
}

export const CARD_DEFS = {
  // --- Starting deck ---
  packet: {
    defId: 'packet',
    name: 'Packet',
    flavor: 'Basic network traffic. Boring but reliable.',
    isStartingCard: true,
    canRemove: true,
    effects: [{ type: 'data', amount: 1 }],
  },
  signal: {
    defId: 'signal',
    name: 'Signal',
    flavor: 'Clear channel. Gets the job done.',
    isStartingCard: true,
    canRemove: true,
    effects: [{ type: 'data', amount: 1 }],
  },
  stream: {
    defId: 'stream',
    name: 'Stream',
    flavor: 'Continuous flow of data.',
    isStartingCard: true,
    canRemove: true,
    effects: [{ type: 'data', amount: 1 }],
  },
  burst: {
    defId: 'burst',
    name: 'Burst',
    flavor: 'Dump everything at once. Might work.',
    isStartingCard: true,
    canRemove: true,
    effects: [{ type: 'data', amount: 3 }],
  },
  raw_expertise: {
    defId: 'raw_expertise',
    name: 'Raw Expertise',
    flavor: 'Pure focused skill. Unrefined but powerful.',
    isStartingCard: true,
    canRemove: true,
    effects: [{ type: 'expertise', amount: 1 }],
  },
  amplifier: {
    defId: 'amplifier',
    name: 'Amplifier',
    flavor: 'Double the throughput. Double the exposure.',
    isStartingCard: true,
    canRemove: true,
    isMultiplier: true,
    multiplierFactor: 2,
  },
  social_hack: {
    defId: 'social_hack',
    name: 'Social Hack',
    flavor: 'Half charm, half data. All attitude.',
    isStartingCard: true,
    canRemove: true,
    effects: [
      { type: 'data', amount: 1 },
      { type: 'skill', skill: 'deception' },
    ],
  },
  bypass: {
    defId: 'bypass',
    name: 'Bypass',
    flavor: "If you can't break it, route around it.",
    isStartingCard: true,
    canRemove: true,
    effects: [
      { type: 'data', amount: 1 },
      { type: 'skill', skill: 'cryptography' },
    ],
  },
  shortcut: {
    defId: 'shortcut',
    name: 'Shortcut',
    flavor: "There's always another way in.",
    isStartingCard: true,
    canRemove: true,
    options: [
      { label: '3 Data', effects: [{ type: 'data', amount: 3 }] },
      { label: 'Any Making Skill', effects: [{ type: 'skill_category', category: 'making' }] },
    ],
  },
  ghost_protocol: {
    defId: 'ghost_protocol',
    name: 'Ghost Protocol',
    flavor: 'Someone noticed. Draw to compensate.',
    isStartingCard: true,
    canRemove: false,
    mustPlayImmediately: true,
    effects: [
      { type: 'heat', amount: 1 },
      { type: 'draw', amount: 1 },
    ],
  },

  // --- Purchasable cards ---
  megaburst: {
    defId: 'megaburst',
    name: 'Megaburst',
    flavor: 'More data than sense.',
    isStartingCard: false,
    canRemove: true,
    effects: [{ type: 'data', amount: 5 }],
  },
  expert_bypass: {
    defId: 'expert_bypass',
    name: 'Expert Bypass',
    flavor: 'The lock never knew you were there.',
    isStartingCard: false,
    canRemove: true,
    effects: [
      { type: 'data', amount: 2 },
      { type: 'skill', skill: 'cryptography' },
    ],
  },
  fast_talk: {
    defId: 'fast_talk',
    name: 'Fast Talk',
    flavor: 'Confidence is 90% of the job.',
    isStartingCard: false,
    canRemove: true,
    effects: [
      { type: 'data', amount: 2 },
      { type: 'skill', skill: 'charm' },
    ],
  },
  deep_architecture: {
    defId: 'deep_architecture',
    name: 'Deep Architecture',
    flavor: 'Know the blueprint before you enter.',
    isStartingCard: false,
    canRemove: true,
    effects: [
      { type: 'skill', skill: 'architecture' },
      { type: 'draw', amount: 1 },
    ],
  },
  overclock: {
    defId: 'overclock',
    name: 'Overclock',
    flavor: 'Push it past the rated limits.',
    isStartingCard: false,
    canRemove: true,
    isMultiplier: true,
    multiplierFactor: 3,
  },
  social_engineering: {
    defId: 'social_engineering',
    name: 'Social Engineering',
    flavor: 'People are the weakest link.',
    isStartingCard: false,
    canRemove: true,
    options: [
      { label: 'Deception', effects: [{ type: 'skill', skill: 'deception' }] },
      { label: 'Connections', effects: [{ type: 'skill', skill: 'connections' }] },
    ],
  },
  exploit: {
    defId: 'exploit',
    name: 'Exploit',
    flavor: 'Every system has a flaw. Find it.',
    isStartingCard: false,
    canRemove: true,
    effects: [
      { type: 'data', amount: 3 },
      { type: 'skill', skill: 'malice' },
    ],
  },
  system_comprehension: {
    defId: 'system_comprehension',
    name: 'System Comprehension',
    flavor: 'Read the system like a book.',
    isStartingCard: false,
    canRemove: true,
    effects: [
      { type: 'skill', skill: 'comprehension' },
      { type: 'expertise', amount: 1 },
    ],
  },
  dark_style: {
    defId: 'dark_style',
    name: 'Dark Style',
    flavor: "Aesthetics matter, even in the dark.",
    isStartingCard: false,
    canRemove: true,
    effects: [
      { type: 'skill', skill: 'style' },
      { type: 'draw', amount: 1 },
    ],
  },
  thermal_cache: {
    defId: 'thermal_cache',
    name: 'Thermal Cache',
    flavor: 'Burn fast or burn slow. Your call.',
    isStartingCard: false,
    canRemove: true,
    options: [
      { label: '4 Data + Automation', effects: [{ type: 'data', amount: 4 }, { type: 'skill', skill: 'automation' }] },
      { label: '6 Data', effects: [{ type: 'data', amount: 6 }] },
    ],
  },
  cold_open: {
    defId: 'cold_open',
    name: 'Cold Open',
    flavor: 'No preparation. Pure instinct.',
    isStartingCard: false,
    canRemove: true,
    effects: [
      { type: 'data', amount: 2 },
      { type: 'skill', skill: 'malice' },
    ],
  },
  network_tap: {
    defId: 'network_tap',
    name: 'Network Tap',
    flavor: 'Listen before you speak.',
    isStartingCard: false,
    canRemove: true,
    effects: [
      { type: 'data', amount: 1 },
      { type: 'draw', amount: 1 },
    ],
  },
  inside_contact: {
    defId: 'inside_contact',
    name: 'Inside Contact',
    flavor: 'Knowing the right people is half the run.',
    isStartingCard: false,
    canRemove: true,
    options: [
      { label: '2 Data + Connections', effects: [{ type: 'data', amount: 2 }, { type: 'skill', skill: 'connections' }] },
      { label: 'Charm + Draw 1', effects: [{ type: 'skill', skill: 'charm' }, { type: 'draw', amount: 1 }] },
    ],
  },
  zero_day: {
    defId: 'zero_day',
    name: 'Zero-Day',
    flavor: 'They never saw it coming.',
    isStartingCard: false,
    canRemove: true,
    effects: [
      { type: 'skill', skill: 'cryptography' },
      { type: 'skill', skill: 'automation' },
    ],
  },
  pressure_drop: {
    defId: 'pressure_drop',
    name: 'Pressure Drop',
    flavor: 'The tension rises. Use it.',
    isStartingCard: false,
    canRemove: true,
    effects: [
      { type: 'heat', amount: -1 },
      { type: 'data', amount: 2 },
    ],
  },
};

export function createCardInstance(defId) {
  const def = CARD_DEFS[defId];
  if (!def) throw new Error(`Unknown card defId: ${defId}`);
  return { ...def, id: nextCardId() };
}

export const STARTING_DECK_IDS = [
  'packet', 'signal', 'stream',
  'burst',
  'raw_expertise',
  'amplifier',
  'social_hack', 'bypass',
  'shortcut',
  'ghost_protocol',
];

export function createStartingDeck() {
  return STARTING_DECK_IDS.map(defId => createCardInstance(defId));
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Returns a description string for a card's effects (for display).
export function describeEffects(effects) {
  return effects.map(e => {
    switch (e.type) {
      case 'data': return `${e.amount} Data`;
      case 'skill': return e.skill.charAt(0).toUpperCase() + e.skill.slice(1);
      case 'skill_category': return `Any ${e.category.charAt(0).toUpperCase() + e.category.slice(1)} Skill`;
      case 'expertise': return `${e.amount} Expertise`;
      case 'draw': return `Draw ${e.amount}`;
      case 'heat': return e.amount > 0 ? `+${e.amount} Heat` : `${e.amount} Heat`;
      case 'fatigue': return e.amount > 0 ? `+${e.amount} Fatigue` : `${e.amount} Fatigue`;
      default: return e.type;
    }
  }).join(' + ');
}
