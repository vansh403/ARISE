// src/lib/fitness.js

export const calculateStrengthScore = (prs) => {
  if (!prs) return 0;
  // A simple formula to aggregate strength based on typical powerlifting standards
  // For beginners/intermediate: Score = (Squat + Bench + Deadlift) / 10
  const squat = parseFloat(prs.squat) || 0;
  const bench = parseFloat(prs.bench) || 0;
  const deadlift = parseFloat(prs.deadlift) || 0;
  
  return Math.round((squat + bench + deadlift) / 10);
};

export const getRankByXP = (xp, completedQuestsCount = 0) => {
  if (completedQuestsCount < 7) {
    return { rank: 'E', title: 'E-Class Hunter', color: '#22d3ee', nextRankXp: 1700 };
  }
  if (xp >= 12100) return { rank: 'S', title: 'S-Class Hunter', color: '#f59e0b', nextRankXp: null }; // Amber/Gold
  if (xp >= 8750) return { rank: 'A', title: 'A-Class Hunter', color: '#ef4444', nextRankXp: 12100 }; // Red
  if (xp >= 5400) return { rank: 'B', title: 'B-Class Hunter', color: '#ec4899', nextRankXp: 8750 }; // Pink
  if (xp >= 3050) return { rank: 'C', title: 'C-Class Hunter', color: '#8b5cf6', nextRankXp: 5400 }; // Purple
  if (xp >= 1700) return { rank: 'D', title: 'D-Class Hunter', color: '#3b82f6', nextRankXp: 3050 }; // Blue
  return { rank: 'E', title: 'E-Class Hunter', color: '#22d3ee', nextRankXp: 1700 }; // Cyan
};

export const calculateLevel = (xp) => {
  // Simple scaling level: Level 1 + 1 level per 100 XP initially, scaling up
  return 1 + Math.floor(Math.sqrt(xp / 50));
};

export const getProgress = (email) => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(`arise-progress-${email}`));
    if (saved) return saved;
  } catch (e) {}
  
  return {
    xp: 0,
    strength: 0,
    level: 1,
    prs: { squat: 0, bench: 0, deadlift: 0 },
    completedQuestIds: []
  };
};

export const saveProgress = (email, data) => {
  try {
    window.localStorage.setItem(`arise-progress-${email}`, JSON.stringify(data));
  } catch (e) {}
};
