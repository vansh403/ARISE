import express from 'express';
import { db } from '../lib/data-store.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Helper to determine rank based on XP and completed quests
const getRankByXP = (xp, completedQuestsCount = 0) => {
  if (completedQuestsCount < 7) return 'E';
  if (xp >= 12100) return 'S';
  if (xp >= 8750) return 'A';
  if (xp >= 5400) return 'B';
  if (xp >= 3050) return 'C';
  if (xp >= 1700) return 'D';
  return 'E';
};

// Helper to calculate level from XP
const calculateLevel = (xp) => {
  return 1 + Math.floor(Math.sqrt(xp / 50));
};

// Helper to calculate strength score from PRs
const calculateStrengthScore = (prs) => {
  if (!prs) return 0;
  const squat = parseFloat(prs.squat) || 0;
  const bench = parseFloat(prs.bench) || 0;
  const deadlift = parseFloat(prs.deadlift) || 0;
  return Math.round((squat + bench + deadlift) / 10);
};

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to update user streak
const updateUserStreak = (progress) => {
  const currentDateStr = getLocalDateString();
  const lastActive = progress.lastActiveDate;

  if (!lastActive) {
    progress.streak = 1;
    progress.lastActiveDate = currentDateStr;
    return true;
  }

  if (lastActive === currentDateStr) {
    return false;
  }

  const current = new Date(currentDateStr);
  const last = new Date(lastActive);
  const diffTime = Math.abs(current - last);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    progress.streak = (progress.streak || 0) + 1;
    progress.lastActiveDate = currentDateStr;
    return true;
  } else if (diffDays > 1) {
    progress.streak = 1;
    progress.lastActiveDate = currentDateStr;
    return true;
  }
  return false;
};

// GET /api/user/progress
router.get('/progress', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await db.findOne('users', { id: userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let progress = await db.findOne('progress', { userId });
    let updated = false;

    if (!progress) {
      // Default / initial state before onboarding is completed
      progress = {
        userId,
        currentRank: 'E',
        xp: 0,
        level: 1,
        strength: 0,
        prs: { squat: 0, bench: 0, deadlift: 0 },
        completedQuestIds: [],
        unlockedQuestIds: [3], // Default E-Rank starting quest
        streak: 0,
        lastActiveDate: ''
      };
      await db.insert('progress', progress);
      updated = true;
    } else {
      if (progress.streak === undefined) {
        progress.streak = 0;
        progress.lastActiveDate = '';
        updated = true;
      }
      
      // Reset streak if pattern is broken (last active date was before yesterday)
      if (progress.lastActiveDate) {
        const currentDateStr = getLocalDateString();
        const lastActive = progress.lastActiveDate;
        if (lastActive !== currentDateStr) {
          const current = new Date(currentDateStr);
          const last = new Date(lastActive);
          const diffTime = Math.abs(current - last);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 1) {
            progress.streak = 0;
            updated = true;
          }
        }
      }
    }

    // Ensure fields exist
    if (!progress.completedQuestIds) progress.completedQuestIds = [];
    if (!progress.unlockedQuestIds) progress.unlockedQuestIds = [3];
    if (!progress.prs) progress.prs = { squat: 0, bench: 0, deadlift: 0 };

    const calculatedRank = getRankByXP(progress.xp, progress.completedQuestIds?.length || 0);
    if (progress.currentRank !== calculatedRank) {
      progress.currentRank = calculatedRank;
      updated = true;
    }

    if (updated) {
      await db.update('progress', { userId }, {
        streak: progress.streak,
        lastActiveDate: progress.lastActiveDate,
        currentRank: progress.currentRank
      });
    }

    return res.json({
      progress,
      stats: user.stats || null,
    });
  } catch (e) {
    console.error('Fetch progress error:', e);
    return res.status(500).json({ error: 'Failed to fetch progress.' });
  }
});

// POST /api/user/onboarding
router.post('/onboarding', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { gender, dob, height, weight, daysPerWeek, experience, prs } = req.body;

    const user = await db.findOne('users', { id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Save physical stats onto user model
    const stats = {
      gender,
      dob,
      height: parseFloat(height) || 0,
      weight: parseFloat(weight) || 0,
      daysPerWeek: parseInt(daysPerWeek) || 4,
      experience
    };

    await db.update('users', { id: userId }, { stats });

    // Initialize/reset progress based on onboarding PRs
    const squat = parseFloat(prs?.squat) || 0;
    const bench = parseFloat(prs?.bench) || 0;
    const deadlift = parseFloat(prs?.deadlift) || 0;
    
    const initialStrength = Math.round((squat + bench + deadlift) / 10);

    const initialProgress = {
      userId,
      currentRank: 'E',
      xp: 0,
      level: 1,
      strength: initialStrength,
      prs: { squat, bench, deadlift },
      completedQuestIds: [],
      unlockedQuestIds: [3],
      streak: 0,
      lastActiveDate: ''
    };

    const existingProgress = await db.findOne('progress', { userId });
    if (existingProgress) {
      await db.update('progress', { userId }, initialProgress);
    } else {
      await db.insert('progress', initialProgress);
    }

    return res.json({
      progress: initialProgress,
      stats
    });
  } catch (e) {
    console.error('Onboarding save error:', e);
    return res.status(500).json({ error: 'Failed to complete onboarding.' });
  }
});

// POST /api/user/quest/complete
router.post('/quest/complete', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { questId, xp } = req.body;

    if (!questId || xp === undefined) {
      return res.status(400).json({ error: 'Quest ID and XP amount are required.' });
    }

    let progress = await db.findOne('progress', { userId });
    if (!progress) {
      progress = {
        userId,
        currentRank: 'E',
        xp: 0,
        level: 1,
        strength: 0,
        prs: { squat: 0, bench: 0, deadlift: 0 },
        completedQuestIds: [],
        unlockedQuestIds: [3],
        streak: 0,
        lastActiveDate: ''
      };
      await db.insert('progress', progress);
    }

    // Prevent duplicates
    const completedSet = new Set(progress.completedQuestIds || []);
    if (!completedSet.has(questId)) {
      completedSet.add(questId);
      progress.completedQuestIds = Array.from(completedSet);
      progress.xp += Number(xp);
      progress.level = calculateLevel(progress.xp);
      progress.currentRank = getRankByXP(progress.xp, progress.completedQuestIds.length);
      
      updateUserStreak(progress);

      await db.update('progress', { userId }, {
        completedQuestIds: progress.completedQuestIds,
        xp: progress.xp,
        level: progress.level,
        currentRank: progress.currentRank,
        streak: progress.streak,
        lastActiveDate: progress.lastActiveDate
      });
    }

    return res.json(progress);
  } catch (e) {
    console.error('Quest completion error:', e);
    return res.status(500).json({ error: 'Failed to log quest completion.' });
  }
});

// POST /api/user/set/log
router.post('/set/log', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { exerciseName, weight: rawWeight, reps: rawReps } = req.body;

    if (!exerciseName || !rawWeight || !rawReps) {
      return res.status(400).json({ error: 'Exercise name, reps, and weight are required.' });
    }

    const weight = parseFloat(rawWeight) || 0;
    const reps = parseInt(rawReps) || 0;

    let progress = await db.findOne('progress', { userId });
    if (!progress) {
      progress = {
        userId,
        currentRank: 'E',
        xp: 0,
        level: 1,
        strength: 0,
        prs: { squat: 0, bench: 0, deadlift: 0 },
        completedQuestIds: [],
        unlockedQuestIds: [3],
        streak: 0,
        lastActiveDate: ''
      };
      await db.insert('progress', progress);
    }

    let prs = { ...progress.prs };
    let prUpdated = false;
    let xpAdded = 10; // Logged set gives 10 XP

    if (weight > 0 && reps > 0) {
      // Brzycki formula for estimated 1-Rep Max
      const estimated1RM = weight * (1 + reps / 30);
      const nameLower = exerciseName.toLowerCase();

      if (nameLower.includes('squat') && estimated1RM > (prs.squat || 0)) {
        prs.squat = Math.round(estimated1RM * 10) / 10;
        prUpdated = true;
      } else if (nameLower.includes('bench') && estimated1RM > (prs.bench || 0)) {
        prs.bench = Math.round(estimated1RM * 10) / 10;
        prUpdated = true;
      } else if (nameLower.includes('deadlift') && estimated1RM > (prs.deadlift || 0)) {
        prs.deadlift = Math.round(estimated1RM * 10) / 10;
        prUpdated = true;
      }
    }

    progress.xp += xpAdded;
    progress.level = calculateLevel(progress.xp);
    progress.currentRank = getRankByXP(progress.xp, progress.completedQuestIds?.length || 0);

    updateUserStreak(progress);

    const updates = {
      xp: progress.xp,
      level: progress.level,
      currentRank: progress.currentRank,
      streak: progress.streak,
      lastActiveDate: progress.lastActiveDate
    };

    if (prUpdated) {
      progress.prs = prs;
      progress.strength = calculateStrengthScore(prs);
      updates.prs = prs;
      updates.strength = progress.strength;
    }

    await db.update('progress', { userId }, updates);

    return res.json({
      progress,
      prUpdated,
      xpAdded
    });
  } catch (e) {
    console.error('Log set error:', e);
    return res.status(500).json({ error: 'Failed to log set.' });
  }
});

// POST /api/user/workout/complete
router.post('/workout/complete', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    let progress = await db.findOne('progress', { userId });

    if (!progress) {
      progress = {
        userId,
        currentRank: 'E',
        xp: 0,
        level: 1,
        strength: 0,
        prs: { squat: 0, bench: 0, deadlift: 0 },
        completedQuestIds: [],
        unlockedQuestIds: [3],
        streak: 0,
        lastActiveDate: ''
      };
      await db.insert('progress', progress);
    }

    progress.xp += 150; // Workout completion bonus XP
    progress.level = calculateLevel(progress.xp);
    progress.currentRank = getRankByXP(progress.xp, progress.completedQuestIds?.length || 0);

    updateUserStreak(progress);

    await db.update('progress', { userId }, {
      xp: progress.xp,
      level: progress.level,
      currentRank: progress.currentRank,
      streak: progress.streak,
      lastActiveDate: progress.lastActiveDate
    });

    return res.json(progress);
  } catch (e) {
    console.error('Workout completion bonus error:', e);
    return res.status(500).json({ error: 'Failed to record completed workout.' });
  }
});

export default router;
