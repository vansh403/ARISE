import express from 'express';
import https from 'https';
import { db } from '../lib/data-store.js';
import { auth } from '../middleware/auth.js';

const fetchJson = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const headers = options.headers || {};
    https.get(url, { headers }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`Status Code: ${res.statusCode}`));
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => { reject(err); });
  });
};

const router = express.Router();

// Helper to get standard date string in local/server time (YYYY-MM-DD)
const getTodayDateString = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

// GET /api/nutrition
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const date = req.query.date || getTodayDateString();

    let diary = await db.findOne('nutrition', { userId, date });
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
      await db.insert('nutrition', diary);
    }

    return res.json(diary);
  } catch (e) {
    console.error('Fetch nutrition diary error:', e);
    return res.status(500).json({ error: 'Failed to fetch diary.' });
  }
});

// GET /api/nutrition/search
router.get('/search', auth, async (req, res) => {
  try {
    const query = req.query.query || '';
    if (!query) {
      return res.json([]);
    }
    const apiKey = process.env.FOOD_API_KEY || '7ShsWXJi35T2MkjN0qdGj6lLnFLhuioLon8qOxe0';
    const data = await fetchJson(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&pageSize=20`);
    const mapped = (data.foods || []).map(food => {
      const nutrients = food.foodNutrients || [];
      const getNutrient = (ids) => {
        const nut = nutrients.find(n => ids.includes(n.nutrientId) || (n.nutrientName && ids.some(id => String(n.nutrientName).toLowerCase().includes(String(id).toLowerCase()))));
        return nut ? Math.round(nut.value) : 0;
      };
      const calories = getNutrient([1008, 'Energy']);
      const protein = getNutrient([1003, 'Protein']);
      const carbs = getNutrient([1005, 'Carbohydrate, by difference']);
      return {
        id: `fdc-${food.fdcId}`,
        name: food.description,
        amount: food.servingSize ? `${food.servingSize}${food.servingSizeUnit || 'g'}` : '100g',
        calories,
        protein,
        carbs
      };
    });
    return res.json(mapped);
  } catch (e) {
    console.error('USDA Food search error:', e);
    return res.json([]);
  }
});

// POST /api/nutrition/food
router.post('/food', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, mealKey, food } = req.body;

    if (!mealKey || !food || !['breakfast', 'lunch', 'dinner', 'snacks'].includes(mealKey)) {
      return res.status(400).json({ error: 'Valid meal category (breakfast, lunch, dinner, snacks) and food details are required.' });
    }

    const queryDate = date || getTodayDateString();
    let diary = await db.findOne('nutrition', { userId, date: queryDate });

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
      await db.insert('nutrition', diary);
    }

    const newFoodItem = {
      ...food,
      logId: `food-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    };

    const updatedMeal = [...(diary[mealKey] || []), newFoodItem];
    await db.update('nutrition', { userId, date: queryDate }, { [mealKey]: updatedMeal });

    diary[mealKey] = updatedMeal;
    return res.json(diary);
  } catch (e) {
    console.error('Add food error:', e);
    return res.status(500).json({ error: 'Failed to log food.' });
  }
});

// POST /api/nutrition/water
router.post('/water', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Water log amount is required.' });
    }

    const queryDate = date || getTodayDateString();
    let diary = await db.findOne('nutrition', { userId, date: queryDate });

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
      await db.insert('nutrition', diary);
    }

    const updatedWater = (diary.water || 0) + Number(amount);
    await db.update('nutrition', { userId, date: queryDate }, { water: updatedWater });

    diary.water = updatedWater;
    return res.json(diary);
  } catch (e) {
    console.error('Log water error:', e);
    return res.status(500).json({ error: 'Failed to log water.' });
  }
});

// POST /api/nutrition/exercise
router.post('/exercise', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, calories } = req.body;

    if (!calories) {
      return res.status(400).json({ error: 'Exercise calories amount is required.' });
    }

    const queryDate = date || getTodayDateString();
    let diary = await db.findOne('nutrition', { userId, date: queryDate });

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
      await db.insert('nutrition', diary);
    }

    const updatedExercise = (diary.exercise || 0) + Number(calories);
    await db.update('nutrition', { userId, date: queryDate }, { exercise: updatedExercise });

    diary.exercise = updatedExercise;
    return res.json(diary);
  } catch (e) {
    console.error('Log exercise error:', e);
    return res.status(500).json({ error: 'Failed to log exercise.' });
  }
});

export default router;
