import express from 'express';
import { db } from '../lib/data-store.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Helper to get standard date string in local/server time (YYYY-MM-DD)
const getTodayDateString = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

// GET /api/nutrition
router.get('/', auth, (req, res) => {
  try {
    const userId = req.user.id;
    const date = req.query.date || getTodayDateString();

    let diary = db.findOne('nutrition', { userId, date });
    if (!diary) {
      // Create a fresh template for the day
      diary = {
        id: `diary-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        userId,
        date,
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
        exercise: 0,
        water: 0
      };
      db.insert('nutrition', diary);
    }

    return res.json(diary);
  } catch (e) {
    console.error('Fetch nutrition diary error:', e);
    return res.status(500).json({ error: 'Failed to fetch diary.' });
  }
});

// POST /api/nutrition/food
router.post('/food', auth, (req, res) => {
  try {
    const userId = req.user.id;
    const { date, mealKey, food } = req.body;

    if (!mealKey || !food || !['breakfast', 'lunch', 'dinner', 'snacks'].includes(mealKey)) {
      return res.status(400).json({ error: 'Valid meal category (breakfast, lunch, dinner, snacks) and food details are required.' });
    }

    const queryDate = date || getTodayDateString();
    let diary = db.findOne('nutrition', { userId, date: queryDate });

    if (!diary) {
      diary = {
        id: `diary-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        userId,
        date: queryDate,
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
        exercise: 0,
        water: 0
      };
      db.insert('nutrition', diary);
    }

    const newFoodItem = {
      ...food,
      logId: `food-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    };

    const updatedMeal = [...(diary[mealKey] || []), newFoodItem];
    db.update('nutrition', { userId, date: queryDate }, { [mealKey]: updatedMeal });

    diary[mealKey] = updatedMeal;
    return res.json(diary);
  } catch (e) {
    console.error('Add food error:', e);
    return res.status(500).json({ error: 'Failed to log food.' });
  }
});

// POST /api/nutrition/water
router.post('/water', auth, (req, res) => {
  try {
    const userId = req.user.id;
    const { date, amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Water log amount is required.' });
    }

    const queryDate = date || getTodayDateString();
    let diary = db.findOne('nutrition', { userId, date: queryDate });

    if (!diary) {
      diary = {
        id: `diary-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        userId,
        date: queryDate,
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
        exercise: 0,
        water: 0
      };
      db.insert('nutrition', diary);
    }

    const updatedWater = (diary.water || 0) + Number(amount);
    db.update('nutrition', { userId, date: queryDate }, { water: updatedWater });

    diary.water = updatedWater;
    return res.json(diary);
  } catch (e) {
    console.error('Log water error:', e);
    return res.status(500).json({ error: 'Failed to log water.' });
  }
});

// POST /api/nutrition/exercise
router.post('/exercise', auth, (req, res) => {
  try {
    const userId = req.user.id;
    const { date, calories } = req.body;

    if (!calories) {
      return res.status(400).json({ error: 'Exercise calories amount is required.' });
    }

    const queryDate = date || getTodayDateString();
    let diary = db.findOne('nutrition', { userId, date: queryDate });

    if (!diary) {
      diary = {
        id: `diary-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        userId,
        date: queryDate,
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
        exercise: 0,
        water: 0
      };
      db.insert('nutrition', diary);
    }

    const updatedExercise = (diary.exercise || 0) + Number(calories);
    db.update('nutrition', { userId, date: queryDate }, { exercise: updatedExercise });

    diary.exercise = updatedExercise;
    return res.json(diary);
  } catch (e) {
    console.error('Log exercise error:', e);
    return res.status(500).json({ error: 'Failed to log exercise.' });
  }
});

export default router;
