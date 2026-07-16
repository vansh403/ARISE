// Mock data for Solo Leveling inspired Ranked Gym Workouts app

export const IMAGES = {
  BG_IMAGE_1: 'https://customer-assets.emergentagent.com/job_spotlight-reveal-4/artifacts/gcw05ce2_ChatGPT%20Image%20Jul%205%2C%202026%2C%2001_43_08%20PM.png',
  BG_IMAGE_2: 'https://customer-assets.emergentagent.com/job_spotlight-reveal-4/artifacts/rjsdpk2w_ChatGPT%20Image%20Jul%205%2C%202026%2C%2003_46_43%20PM.png',
};

export const RANKS = [
  { id: 'E', name: 'E-Rank', tier: 'Awakened', color: '#8a8f98', glow: '#c0c5cc', desc: 'The first step. Your dormant potential begins to stir.', reqs: '0 - 1,700 XP', unlock: 'Basic bodyweight drills' },
  { id: 'D', name: 'D-Rank', tier: 'Novice Hunter', color: '#22d3ee', glow: '#67e8f9', desc: 'You feel the system responding. Strength incoming.', reqs: '1,700 - 3,050 XP', unlock: 'Weighted circuits, endurance runs' },
  { id: 'C', name: 'C-Rank', tier: 'Iron Hunter', color: '#38bdf8', glow: '#7dd3fc', desc: 'Iron discipline. Your form is refined.', reqs: '3,050 - 5,400 XP', unlock: 'Compound lifts, hypertrophy blocks' },
  { id: 'B', name: 'B-Rank', tier: 'Elite Hunter', color: '#3b82f6', glow: '#60a5fa', desc: 'The gates open. Your body reshapes itself.', reqs: '5,400 - 8,750 XP', unlock: 'Power phases, advanced conditioning' },
  { id: 'A', name: 'A-Rank', tier: 'Ace Hunter', color: '#ef4444', glow: '#fca5a5', desc: 'Feared in the arena. Few reach here.', reqs: '8,750 - 12,100 XP', unlock: 'Elite programs, monolith protocols' },
  { id: 'S', name: 'S-Rank', tier: 'Shadow Monarch', color: '#dc2626', glow: '#f87171', desc: 'Arise. You have become the apex.', reqs: '12,100+ XP', unlock: 'Sovereign training, unlimited access' },
];

export const QUESTS = [
  { id: 1, title: 'Daily Push Protocol', type: 'Strength', rank: 'D', xp: 240, duration: '32 min', exercises: 6, status: 'active', desc: 'Chest, shoulders, triceps. Ignite the burn.' },
  { id: 2, title: 'Shadow Legs Trial', type: 'Power', rank: 'C', xp: 480, duration: '45 min', exercises: 8, status: 'locked', desc: 'Squats, RDLs, plyo finisher. Break your limit.' },
  { id: 3, title: 'Cardio Gate Break', type: 'Endurance', rank: 'E', xp: 120, duration: '20 min', exercises: 4, status: 'active', desc: 'HIIT intervals to condition the vessel.' },
  { id: 4, title: 'Monarch\'s Core', type: 'Core', rank: 'B', xp: 720, duration: '38 min', exercises: 7, status: 'locked', desc: 'Weighted core matrix. Only the worthy.' },
  { id: 5, title: 'Pull Domain Raid', type: 'Strength', rank: 'D', xp: 320, duration: '40 min', exercises: 6, status: 'active', desc: 'Back and biceps. Widen the frame.' },
  { id: 6, title: 'Arise Protocol', type: 'Full Body', rank: 'A', xp: 1200, duration: '60 min', exercises: 10, status: 'locked', desc: 'The final ascension circuit.' },
];

export const HUNTER = {
  name: 'Sung Jinwoo',
  handle: '@shadow_monarch',
  rank: 'C',
  level: 47,
  xp: 8420,
  xpNext: 15000,
  streak: 23,
  quests: 142,
  hoursTrained: 218,
  stats: [
    { name: 'Strength', value: 82, cap: 100 },
    { name: 'Endurance', value: 71, cap: 100 },
    { name: 'Agility', value: 64, cap: 100 },
    { name: 'Discipline', value: 91, cap: 100 },
    { name: 'Recovery', value: 58, cap: 100 },
  ],
};

export const LEADERBOARD = [
  { rank: 1, name: 'ShadowSlayer', tier: 'S', xp: 148230, streak: 312 },
  { rank: 2, name: 'IronKaisar', tier: 'S', xp: 132015, streak: 287 },
  { rank: 3, name: 'VoidHunter', tier: 'A', xp: 92401, streak: 201 },
  { rank: 4, name: 'PhantomLift', tier: 'A', xp: 87340, streak: 178 },
  { rank: 5, name: 'GateBreaker', tier: 'B', xp: 38210, streak: 142 },
  { rank: 6, name: 'You', tier: 'C', xp: 8420, streak: 23, self: true },
];

export const FEATURES = [
  { icon: 'Swords', title: 'Ranked Quest System', desc: 'Every workout is a quest. Complete them, earn XP, break through rank walls.' },
  { icon: 'Zap', title: 'Real-Time Level Up', desc: 'The system tracks your stats live. Watch your strength, agility, and endurance rise.' },
  { icon: 'Shield', title: 'Gate Protocols', desc: 'Unlock advanced training gates. Each rank opens brutal, effective programs.' },
  { icon: 'Trophy', title: 'Global Leaderboards', desc: 'Compete with hunters worldwide. Only the disciplined ascend.' },
];

export const TESTIMONIALS = [
  { name: 'Kaito R.', rank: 'A', quote: 'From E-rank couch potato to A-rank in 11 months. The system works because it makes you show up.', streak: 297 },
  { name: 'Mina L.', rank: 'B', quote: 'The rank progression is addictive in the best way. Every quest feels earned.', streak: 156 },
  { name: 'Devon P.', rank: 'S', quote: 'I don\'t train anymore. I hunt. Different mindset entirely.', streak: 421 },
];
