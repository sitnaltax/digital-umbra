// Target definitions and obstacle generation.
//
// Each target has a template with some pre-defined obstacle slots and some
// random slots. Obstacle requirements are scaled by run number.
//
// Obstacle types:
//   data          - needs N data
//   skill         - needs a specific skill or category skill
//   data_and_skill - needs N data AND a skill
//   choice        - player satisfies EITHER optionA OR optionB

import { CONFIG, SKILLS, SKILL_CATEGORY } from './constants.js';

// ─── Obstacle factories ───────────────────────────────────────────────────────

function dataObs(base, rewards, name, desc) {
  return { kind: 'data', baseDataReq: base, rewards, name, desc };
}

function skillObs(req, rewards, name, desc) {
  // req: { skill } or { category }
  return { kind: 'skill', skillReq: req, rewards, name, desc };
}

function dataAndSkillObs(base, req, rewards, name, desc) {
  return { kind: 'data_and_skill', baseDataReq: base, skillReq: req, rewards, name, desc };
}

function choiceObs(optA, optB, rewards, name, desc) {
  // optA/optB: { baseDataReq?, skillReq?, label }
  return { kind: 'choice', optA, optB, rewards, name, desc };
}

function randomObs(rewards) {
  return { kind: 'random', rewards };
}

// ─── Target templates ─────────────────────────────────────────────────────────

// difficulty 1 = easy, 2 = medium, 3 = hard
// skillFocus affects the random obstacle generator's weighting

export const TARGET_TEMPLATES = [
  {
    id: 'neotek',
    name: 'Neotek Solutions',
    tagline: 'Your data is safe with us.',
    description: 'A sprawling bureaucratic tech firm. Dull, but their archives run deep.',
    aesthetic: 'drab-corporate',
    difficulty: 1,
    skillFocus: 'making',
    obstacleTemplates: [
      dataObs(3, { cash: 1, secrets: 0 }, 'Perimeter Scan', 'Basic traffic monitoring. Route around it.'),
      skillObs({ category: 'making' }, { cash: 1, secrets: 0 }, 'System Map', 'Their internal architecture is labyrinthine—if you can read it.'),
      dataObs(4, { cash: 1, secrets: 1 }, 'Data Silo', 'Tiered storage with redundant checksums.'),
      dataAndSkillObs(2, { category: 'making' }, { cash: 2, secrets: 1 }, 'Archive Vault', 'Cross-reference the blueprints. Get in quietly.'),
      randomObs({ cash: 2, secrets: 1 }),
      choiceObs(
        { baseDataReq: 5, label: '5 Data' },
        { skillReq: { category: 'making' }, label: 'Any Making Skill' },
        { cash: 2, secrets: 2 },
        'Executive Layer', 'The locked floor. Two ways in.'
      ),
      randomObs({ cash: 3, secrets: 2 }),
    ],
  },
  {
    id: 'prismatic',
    name: 'Prismatic Media',
    tagline: 'Stories that shape tomorrow.',
    description: 'A slick media conglomerate. Their real product is influence.',
    aesthetic: 'slick-corporate',
    difficulty: 1,
    skillFocus: 'social',
    obstacleTemplates: [
      dataObs(3, { cash: 1, secrets: 0 }, 'Lobby System', 'Visitor management that isn\'t really managed.'),
      skillObs({ category: 'social' }, { cash: 1, secrets: 1 }, 'PR Filter', 'They\'re watching the optics. Give them what they want to see.'),
      choiceObs(
        { baseDataReq: 4, label: '4 Data' },
        { skillReq: { skill: 'charm' }, label: 'Charm' },
        { cash: 1, secrets: 1 },
        'Talent Relations', 'Everyone here is performing something.'
      ),
      dataAndSkillObs(3, { skill: 'connections' }, { cash: 2, secrets: 1 }, 'Executive Network', 'Somebody always knows somebody.'),
      randomObs({ cash: 2, secrets: 2 }),
      dataObs(5, { cash: 2, secrets: 2 }, 'Broadcast Archives', 'What they aired. And what they didn\'t.'),
      randomObs({ cash: 3, secrets: 2 }),
    ],
  },
  {
    id: 'meridian',
    name: 'Meridian Biotech',
    tagline: 'Life, engineered.',
    description: 'Biotech running clinical trials that aren\'t in any registry. Something is being hidden.',
    aesthetic: 'drab-corporate',
    difficulty: 2,
    skillFocus: 'making',
    obstacleTemplates: [
      dataObs(4, { cash: 1, secrets: 1 }, 'Bioscan Gate', 'Biometric lock with a logging daemon.'),
      skillObs({ skill: 'cryptography' }, { cash: 1, secrets: 1 }, 'Encrypted Manifests', 'Trial data behind strong encryption.'),
      dataAndSkillObs(5, { category: 'making' }, { cash: 2, secrets: 1 }, 'Lab Access', 'The clean room has its own subnet.'),
      choiceObs(
        { baseDataReq: 4, label: '4 Data' },
        { skillReq: { skill: 'automation' }, label: 'Automation' },
        { cash: 2, secrets: 2 },
        'Process Control', 'Automated workflows with override access.'
      ),
      randomObs({ cash: 2, secrets: 2 }),
      dataAndSkillObs(6, { skill: 'architecture' }, { cash: 3, secrets: 2 }, 'Deep Research', 'The real lab. Schematics required.'),
      randomObs({ cash: 3, secrets: 3 }),
    ],
  },
  {
    id: 'apex',
    name: 'Apex Financial',
    tagline: 'Your wealth, amplified.',
    description: 'A high-frequency trading firm. Their systems run at machine speed—and so does their security.',
    aesthetic: 'slick-corporate',
    difficulty: 2,
    skillFocus: 'breaking',
    obstacleTemplates: [
      dataObs(5, { cash: 2, secrets: 0 }, 'Rate Limiter', 'Traffic shaping that will notice anomalies.'),
      skillObs({ skill: 'cryptography' }, { cash: 2, secrets: 1 }, 'Key Rotation', 'Certificates that expire every 15 minutes.'),
      choiceObs(
        { baseDataReq: 6, label: '6 Data' },
        { skillReq: { skill: 'automation' }, label: 'Automation' },
        { cash: 2, secrets: 2 },
        'Algorithmic Layer', 'Bots trading bots. Find the pattern.'
      ),
      randomObs({ cash: 3, secrets: 2 }),
      dataObs(7, { cash: 3, secrets: 2 }, 'Dark Pool', 'Off-book transactions. The real money.'),
      skillObs({ skill: 'malice' }, { cash: 3, secrets: 3 }, 'Executive Override', 'Sometimes the fastest way is the direct way.'),
      randomObs({ cash: 4, secrets: 3 }),
    ],
  },
  {
    id: 'bureau',
    name: 'Bureau of Civic Order',
    tagline: 'Safety through compliance.',
    description: 'State security apparatus. They watch everyone. Getting in means becoming no one.',
    aesthetic: 'authoritarian',
    difficulty: 3,
    skillFocus: 'breaking',
    obstacleTemplates: [
      dataAndSkillObs(5, { skill: 'deception' }, { cash: 1, secrets: 2 }, 'Identity Check', 'Papers, citizen. Real-time verification.'),
      dataObs(6, { cash: 2, secrets: 2 }, 'Surveillance Net', 'Camera feeds, motion tracking, pattern analysis.'),
      randomObs({ cash: 2, secrets: 3 }),
      skillObs({ category: 'breaking' }, { cash: 2, secrets: 3 }, 'Secure Comms', 'Encrypted channels. Break them or go around.'),
      choiceObs(
        { baseDataReq: 7, label: '7 Data' },
        { skillReq: { skill: 'connections' }, label: 'Connections' },
        { cash: 3, secrets: 3 },
        'Classified Registry', 'Names. Dossiers. Things they don\'t admit to tracking.'
      ),
      randomObs({ cash: 3, secrets: 4 }),
      dataAndSkillObs(8, { category: 'social' }, { cash: 4, secrets: 4 }, 'Black Archive', 'The deepest layer. What they have on everyone.'),
    ],
  },
  {
    id: 'sovereign',
    name: 'Sovereign Net Authority',
    tagline: 'The network is the nation.',
    description: 'The agency that controls the infrastructure itself. Everything runs through them.',
    aesthetic: 'authoritarian',
    difficulty: 3,
    skillFocus: 'mixed',
    obstacleTemplates: [
      dataObs(6, { cash: 2, secrets: 2 }, 'Backbone Access', 'Tier-1 infrastructure. Heavily monitored.'),
      skillObs({ category: 'breaking' }, { cash: 2, secrets: 2 }, 'Protocol Analysis', 'Their protocols weren\'t designed to be read.'),
      randomObs({ cash: 3, secrets: 3 }),
      dataAndSkillObs(7, { skill: 'style' }, { cash: 3, secrets: 3 }, 'Traffic Masking', 'Look like noise in the signal.'),
      randomObs({ cash: 3, secrets: 4 }),
      choiceObs(
        { baseDataReq: 8, label: '8 Data' },
        { skillReq: { skill: 'malice' }, label: 'Malice' },
        { cash: 4, secrets: 4 },
        'Control Layer', 'Where the kill switches live.'
      ),
      dataObs(9, { cash: 5, secrets: 4 }, 'Core Registry', 'The full network map. Every address, every route, every secret.'),
    ],
  },
];

// ─── Target selection ─────────────────────────────────────────────────────────

// Weighted target selection based on run number.
// Returns an array of 3 unique target IDs.
export function pickTargetsForRun(runNumber, lastChosenId) {
  // Difficulty weights by run phase
  const weights = {
    1: runNumber <= 4 ? 3 : runNumber <= 8 ? 1 : 0,
    2: runNumber <= 4 ? 1 : runNumber <= 8 ? 2 : 1,
    3: runNumber <= 4 ? 0 : runNumber <= 8 ? 1 : 3,
  };

  const pool = TARGET_TEMPLATES.map(t => ({
    id: t.id,
    weight: weights[t.difficulty] ?? 1,
  })).filter(t => t.id !== lastChosenId); // avoid exact repeat

  // Weighted random pick without replacement
  const picked = [];
  let remaining = [...pool];

  while (picked.length < 3 && remaining.length > 0) {
    const totalWeight = remaining.reduce((s, t) => s + t.weight, 0);
    let r = Math.random() * totalWeight;
    for (let i = 0; i < remaining.length; i++) {
      r -= remaining[i].weight;
      if (r <= 0) {
        picked.push(remaining[i].id);
        remaining.splice(i, 1);
        break;
      }
    }
  }

  // If we couldn't fill 3 (e.g., all excluded), pad from full pool
  if (picked.length < 3) {
    const all = TARGET_TEMPLATES.map(t => t.id).filter(id => !picked.includes(id));
    while (picked.length < 3 && all.length > 0) {
      picked.push(all.splice(Math.floor(Math.random() * all.length), 1)[0]);
    }
  }

  return picked;
}

export function getTargetById(id) {
  return TARGET_TEMPLATES.find(t => t.id === id) ?? null;
}

// ─── Obstacle generation ──────────────────────────────────────────────────────

let _nextObstacleId = 1;

export function resetObstacleIds(seed = 1) {
  _nextObstacleId = seed;
}

function obsId() {
  return _nextObstacleId++;
}

// Random obstacle generation for "random" slots and escape obstacles.
// Weighted toward the target's skill focus.
function pickSkillForTarget(target, runNumber, forceSpecific = false) {
  const focus = target.skillFocus;
  const categories = ['social', 'making', 'breaking'];

  // Pick category, biased toward skillFocus
  let category;
  if (focus === 'mixed') {
    category = categories[Math.floor(Math.random() * 3)];
  } else {
    category = Math.random() < 0.65 ? focus : categories[Math.floor(Math.random() * 3)];
  }

  const skills = SKILLS[category];

  // Specificity scales with run number
  const specific = forceSpecific || runNumber >= 9
    ? true
    : runNumber >= 5
      ? Math.random() < 0.5
      : false;

  if (specific) {
    return { skill: skills[Math.floor(Math.random() * skills.length)] };
  }
  return { category };
}

function generateRandomObstacle(target, runNumber, rewards) {
  const roll = Math.random();
  const dataBase = 3 + Math.floor(target.difficulty * 1.5);
  const scaledData = CONFIG.scaleDataReq(dataBase, runNumber);

  if (roll < 0.3) {
    // Pure data
    return {
      id: obsId(),
      kind: 'data',
      dataReq: scaledData,
      rewards,
      name: 'Unexpected Protocol',
      desc: 'Something the intel didn\'t mention.',
    };
  } else if (roll < 0.55) {
    // Skill
    const skillReq = pickSkillForTarget(target, runNumber);
    return {
      id: obsId(),
      kind: 'skill',
      skillReq,
      rewards,
      name: 'Unknown Variable',
      desc: 'The system\'s doing something you didn\'t plan for.',
    };
  } else if (roll < 0.78) {
    // Data and skill
    const skillReq = pickSkillForTarget(target, runNumber);
    return {
      id: obsId(),
      kind: 'data_and_skill',
      dataReq: scaledData - 1,
      skillReq,
      rewards,
      name: 'Compound Lock',
      desc: 'More than one layer here.',
    };
  } else {
    // Choice
    const skillReq = pickSkillForTarget(target, runNumber);
    const highData = scaledData + 2;
    return {
      id: obsId(),
      kind: 'choice',
      optA: { label: `${highData} Data`, baseDataReq: highData },
      optB: { label: skillReqLabel(skillReq), skillReq },
      rewards,
      name: 'Fork in the Path',
      desc: 'Two routes through. Pick one.',
    };
  }
}

function skillReqLabel(req) {
  if (req.skill) return req.skill.charAt(0).toUpperCase() + req.skill.slice(1);
  if (req.category) return `Any ${req.category.charAt(0).toUpperCase() + req.category.slice(1)} Skill`;
  return 'Skill';
}

// Materialise a template obstacle slot into a concrete obstacle for this run.
export function materialiseObstacle(template, target, runNumber) {
  if (template.kind === 'random') {
    return generateRandomObstacle(target, runNumber, template.rewards);
  }

  const obs = {
    id: obsId(),
    kind: template.kind,
    name: template.name,
    desc: template.desc,
    rewards: template.rewards,
  };

  const scale = (base) => CONFIG.scaleDataReq(base, runNumber);

  switch (template.kind) {
    case 'data':
      obs.dataReq = scale(template.baseDataReq);
      break;
    case 'skill':
      obs.skillReq = template.skillReq;
      break;
    case 'data_and_skill':
      obs.dataReq = scale(template.baseDataReq);
      obs.skillReq = template.skillReq;
      break;
    case 'choice':
      obs.optA = {
        ...template.optA,
        dataReq: template.optA.baseDataReq != null ? scale(template.optA.baseDataReq) : undefined,
      };
      obs.optB = {
        ...template.optB,
        dataReq: template.optB.baseDataReq != null ? scale(template.optB.baseDataReq) : undefined,
      };
      break;
  }

  return obs;
}

// Build the full obstacle list for a run: template obstacles + escape obstacles.
export function buildRunObstacles(target, runNumber) {
  const total = CONFIG.obstaclesPerRun(runNumber);
  const templates = target.obstacleTemplates;

  const obstacles = [];
  for (let i = 0; i < total; i++) {
    const tmpl = i < templates.length ? templates[i] : { kind: 'random', rewards: templates[templates.length - 1].rewards };
    obstacles.push(materialiseObstacle(tmpl, target, runNumber));
  }
  return obstacles;
}

// Generate N escape obstacles for the escape phase.
export function buildEscapeObstacles(target, runNumber) {
  const count = CONFIG.escapeObstacleCount(runNumber);
  const escapeRewards = { cash: 0, secrets: 0 };
  return Array.from({ length: count }, () => {
    const obs = generateRandomObstacle(target, runNumber, escapeRewards);
    obs.name = `Escape: ${obs.name}`;
    return obs;
  });
}

// Check if an obstacle is satisfied given current dataPool and satisfiedSkills.
// Returns: { satisfied: bool, via: 'A'|'B'|null } (via only for choice obstacles)
export function checkObstacleSatisfied(obs, dataPool, satisfiedSkills) {
  switch (obs.kind) {
    case 'data':
      return { satisfied: dataPool >= obs.dataReq, via: null };

    case 'skill':
      return { satisfied: skillSatisfied(obs.skillReq, satisfiedSkills), via: null };

    case 'data_and_skill':
      return {
        satisfied: dataPool >= obs.dataReq && skillSatisfied(obs.skillReq, satisfiedSkills),
        via: null,
      };

    case 'choice': {
      const aOk = checkOption(obs.optA, dataPool, satisfiedSkills);
      const bOk = checkOption(obs.optB, dataPool, satisfiedSkills);
      if (aOk) return { satisfied: true, via: 'A' };
      if (bOk) return { satisfied: true, via: 'B' };
      return { satisfied: false, via: null };
    }

    default:
      return { satisfied: false, via: null };
  }
}

function checkOption(opt, dataPool, satisfiedSkills) {
  const dataOk = opt.dataReq != null ? dataPool >= opt.dataReq : true;
  const skillOk = opt.skillReq != null ? skillSatisfied(opt.skillReq, satisfiedSkills) : true;
  return dataOk && skillOk;
}

export function skillSatisfied(req, satisfiedSkills) {
  if (!req) return true;
  if (req.skill) return satisfiedSkills.includes(req.skill);
  if (req.category) return satisfiedSkills.some(s => SKILL_CATEGORY[s] === req.category);
  return false;
}
