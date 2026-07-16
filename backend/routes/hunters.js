import express from 'express';
import { db } from '../lib/data-store.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

const MOCK_LEADERBOARD = [
  { name: 'ShadowSlayer', tier: 'S', xp: 148230, level: 95, status: 'Online' },
  { name: 'IronKaisar', tier: 'S', xp: 132015, level: 88, status: 'In Dungeon' },
  { name: 'VoidHunter', tier: 'A', xp: 92401, level: 74, status: 'Online' },
  { name: 'PhantomLift', tier: 'A', xp: 87340, level: 69, status: 'In Dungeon' },
  { name: 'GateBreaker', tier: 'B', xp: 38210, level: 47, status: 'Online' },
];

// GET /api/hunters
router.get('/', auth, (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    // 1. Fetch all live registered users
    const allUsers = db.find('users');
    
    // 2. Fetch progress for all users to construct live database hunters
    const liveHunters = allUsers.map((user) => {
      const progress = db.findOne('progress', { userId: user.id }) || {
        xp: 0,
        level: 1,
        currentRank: 'E'
      };

      return {
        id: user.id,
        name: user.name,
        tier: progress.currentRank || 'E',
        xp: progress.xp || 0,
        level: progress.level || 1,
        status: user.id === currentUserId ? 'Online' : (progress.xp > 500 ? 'In Dungeon' : 'Online'),
        isLocal: user.id === currentUserId
      };
    });

    // 3. Map mock hunters
    const mockHunters = MOCK_LEADERBOARD.map((h, i) => ({
      id: `mock-${i}`,
      name: h.name,
      tier: h.tier,
      xp: h.xp,
      level: h.level,
      status: h.status,
      isLocal: false
    }));

    // 4. Combine and sort by XP descending
    const combined = [...liveHunters, ...mockHunters];
    combined.sort((a, b) => b.xp - a.xp);

    // 5. Assign rankings
    const rankedHunters = combined.map((hunter, index) => ({
      ...hunter,
      rank: index + 1
    }));

    return res.json(rankedHunters);
  } catch (e) {
    console.error('Fetch hunters error:', e);
    return res.status(500).json({ error: 'Failed to retrieve hunters directory.' });
  }
});

export default router;
