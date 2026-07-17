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

// GET /api/fitness/exercises
router.get('/exercises', auth, async (req, res) => {
  try {
    const { name, muscle } = req.query;
    const apiKey = process.env.WORKOUT_API_KEY || 'D9CeQR9JdA3SKkkxz2WdK2MW8OvEjxB5OYNx9ywz';
    
    let url = 'https://api.api-ninjas.com/v1/exercises?';
    if (name) {
      url += `name=${encodeURIComponent(name)}&`;
    }
    if (muscle) {
      url += `muscle=${encodeURIComponent(muscle)}&`;
    }
    
    const data = await fetchJson(url, {
      headers: {
        'X-Api-Key': apiKey
      }
    });
    return res.json(data);
  } catch (e) {
    console.error('API Ninjas exercise fetch error:', e);
    return res.json([]);
  }
});

// GET /api/fitness/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await db.findOne('fitness_profile', { userId });
    
    if (!profile) {
      return res.status(404).json({ error: 'Fitness profile not initialized.' });
    }

    return res.json(profile);
  } catch (e) {
    console.error('Fetch fitness profile error:', e);
    return res.status(500).json({ error: 'Failed to retrieve fitness profile.' });
  }
});

// POST /api/fitness/profile
router.post('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;

    const existingProfile = await db.findOne('fitness_profile', { userId });
    
    const newProfile = {
      ...profileData,
      userId,
      customWorkouts: existingProfile?.customWorkouts || []
    };

    if (existingProfile) {
      await db.update('fitness_profile', { userId }, newProfile);
    } else {
      await db.insert('fitness_profile', newProfile);
    }

    return res.json(newProfile);
  } catch (e) {
    console.error('Save fitness profile error:', e);
    return res.status(500).json({ error: 'Failed to save fitness profile.' });
  }
});

// POST /api/fitness/profile/workouts
router.post('/profile/workouts', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, detail } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Workout name is required.' });
    }

    const profile = await db.findOne('fitness_profile', { userId });
    if (!profile) {
      return res.status(404).json({ error: 'Fitness profile not found.' });
    }

    const customWorkouts = profile.customWorkouts || [];
    const newWorkout = {
      id: Date.now(),
      name: name.trim(),
      detail: (detail || '').trim()
    };

    customWorkouts.push(newWorkout);
    await db.update('fitness_profile', { userId }, { customWorkouts });

    return res.json(newWorkout);
  } catch (e) {
    console.error('Add custom workout error:', e);
    return res.status(500).json({ error: 'Failed to add custom workout.' });
  }
});

// DELETE /api/fitness/profile/workouts/:id
router.delete('/profile/workouts/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const workoutId = Number(req.params.id);

    const profile = await db.findOne('fitness_profile', { userId });
    if (!profile) {
      return res.status(404).json({ error: 'Fitness profile not found.' });
    }

    const customWorkouts = (profile.customWorkouts || []).filter(w => w.id !== workoutId);
    await db.update('fitness_profile', { userId }, { customWorkouts });

    return res.json({ message: 'Custom workout deleted successfully.' });
  } catch (e) {
    console.error('Delete custom workout error:', e);
    return res.status(500).json({ error: 'Failed to delete custom workout.' });
  }
});

export default router;
