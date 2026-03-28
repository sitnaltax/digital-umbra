// Shop generation for the Downtime phase.
//
// The shop offers 3 options (4 if Black Market App upgrade is equipped).
// Options can be: new cards, upgrades, or card removal services.

import { CARD_DEFS, describeEffects } from './cards.js';

// ─── Upgrades ─────────────────────────────────────────────────────────────────

export const UPGRADES = {
  neural_lace: {
    id: 'neural_lace',
    name: 'Neural Lace',
    description: 'Expand your working memory. Hand limit +1 permanently.',
    flavor: 'Think faster. Hold more.',
    cost: 6,
    effect: { type: 'hand_limit', amount: 1 },
  },
  burner_stack: {
    id: 'burner_stack',
    name: 'Burner Stack',
    description: 'Pre-loaded identities. Gain +1 Burner ID now and start each future run with one more.',
    flavor: 'Never get caught with the same face twice.',
    cost: 8,
    effect: { type: 'burner_ids', amount: 1 },
  },
  ice_breaker: {
    id: 'ice_breaker',
    name: 'ICE Breaker',
    description: 'Once per obstacle, reduce Heat by 1 when you play a card with a Breaking skill.',
    flavor: 'Cut through the countermeasures.',
    cost: 5,
    effect: { type: 'passive', passiveId: 'ice_breaker' },
  },
  ghost_rig: {
    id: 'ghost_rig',
    name: 'Ghost Rig',
    description: 'Leave less of a trace. At the start of each Downtime, lose 1 extra Fatigue.',
    flavor: 'Optimized for the long game.',
    cost: 5,
    effect: { type: 'passive', passiveId: 'ghost_rig' },
  },
  black_market_app: {
    id: 'black_market_app',
    name: 'Black Market App',
    description: 'Access to a wider selection. The shop now shows 4 options instead of 3.',
    flavor: 'Connections. You have them.',
    cost: 7,
    effect: { type: 'shop_size', amount: 1 },
  },
};

// ─── Purchasable cards ────────────────────────────────────────────────────────

const PURCHASABLE_CARD_DEFS = [
  { defId: 'megaburst', cost: 4, category: 'data' },
  { defId: 'expert_bypass', cost: 4, category: 'skill' },
  { defId: 'fast_talk', cost: 4, category: 'skill' },
  { defId: 'deep_architecture', cost: 5, category: 'skill' },
  { defId: 'overclock', cost: 6, category: 'utility' },
  { defId: 'social_engineering', cost: 5, category: 'skill' },
  { defId: 'exploit', cost: 5, category: 'skill' },
  { defId: 'system_comprehension', cost: 4, category: 'skill' },
  { defId: 'dark_style', cost: 5, category: 'skill' },
  { defId: 'thermal_cache', cost: 6, category: 'data' },
  { defId: 'cold_open', cost: 4, category: 'skill' },
  { defId: 'network_tap', cost: 3, category: 'utility' },
  { defId: 'inside_contact', cost: 5, category: 'skill' },
  { defId: 'zero_day', cost: 6, category: 'skill' },
  { defId: 'pressure_drop', cost: 5, category: 'utility' },
];

// ─── Shop option types ────────────────────────────────────────────────────────

// type: 'card'    — add a card to deck
// type: 'upgrade' — install an upgrade (max 3)
// type: 'remove'  — remove a card from deck (non-starting)
// type: 'purge'   — remove any card from deck (including starting, except ghost_protocol)

export function generateShopOptions(runNumber, playerUpgrades) {
  const hasBlackMarket = playerUpgrades.some(u => u.id === 'black_market_app');
  const slotCount = hasBlackMarket ? 4 : 3;

  const pool = buildShopPool(runNumber, playerUpgrades);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, slotCount);
}

function buildShopPool(runNumber, playerUpgrades) {
  const options = [];
  const equippedUpgradeIds = new Set(playerUpgrades.map(u => u.id));

  // Card options
  for (const entry of PURCHASABLE_CARD_DEFS) {
    const def = CARD_DEFS[entry.defId];
    if (!def) continue;
    const descParts = def.options
      ? def.options.map(o => describeEffects(o.effects)).join(' OR ')
      : def.isMultiplier
        ? `×${def.multiplierFactor} a Data card`
        : describeEffects(def.effects);
    options.push({
      type: 'card',
      defId: entry.defId,
      name: def.name,
      description: descParts,
      flavor: def.flavor,
      cost: entry.cost,
    });
  }

  // Upgrade options (only ones not already equipped)
  for (const upg of Object.values(UPGRADES)) {
    if (!equippedUpgradeIds.has(upg.id)) {
      options.push({
        type: 'upgrade',
        upgradeId: upg.id,
        name: upg.name,
        description: upg.description,
        flavor: upg.flavor,
        cost: upg.cost,
      });
    }
  }

  // Removal services
  options.push({
    type: 'remove',
    name: 'Data Purge',
    description: 'Remove any non-starting card from your deck.',
    flavor: 'Clean it up.',
    cost: 3,
  });

  options.push({
    type: 'purge',
    name: 'Origin Wipe',
    description: 'Remove any card from your deck, including starting cards. Cannot remove Ghost Protocol.',
    flavor: 'Burn it down to the roots.',
    cost: 6,
  });

  return options;
}
