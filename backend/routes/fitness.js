import express from 'express';
import { db } from '../lib/data-store.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/fitness/profile
router.get('/profile', auth, (req, res) => {
  try {
    const userId = req.user.id;
    const profile = db.findOne('fitness_profile', { userId });
    
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
router.post('/profile', auth, (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;

    const existingProfile = db.findOne('fitness_profile', { userId });
    
    const newProfile = {
      ...profileData,
      userId,
      customWorkouts: existingProfile?.customWorkouts || []
    };

    if (existingProfile) {
      db.update('fitness_profile', { userId }, newProfile);
    } else {
      db.insert('fitness_profile', newProfile);
    }

    return res.json(newProfile);
  } catch (e) {
    console.error('Save fitness profile error:', e);
    return res.status(500).json({ error: 'Failed to save fitness profile.' });
  }
});

// POST /api/fitness/profile/workouts
router.post('/profile/workouts', auth, (req, res) => {
  try {
    const userId = req.user.id;
    const { name, detail } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Workout name is required.' });
    }

    const profile = db.findOne('fitness_profile', { userId });
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
    db.update('fitness_profile', { userId }, { customWorkouts });

    return res.json(newWorkout);
  } catch (e) {
    console.error('Add custom workout error:', e);
    return res.status(500).json({ error: 'Failed to add custom workout.' });
  }
});

// DELETE /api/fitness/profile/workouts/:id
router.delete('/profile/workouts/:id', auth, (req, res) => {
  try {
    const userId = req.user.id;
    const workoutId = Number(req.params.id);

    const profile = db.findOne('fitness_profile', { userId });
    if (!profile) {
      return res.status(404).json({ error: 'Fitness profile not found.' });
    }

    const customWorkouts = (profile.customWorkouts || []).filter(w => w.id !== workoutId);
    db.update('fitness_profile', { userId }, { customWorkouts });

    return res.json({ message: 'Custom workout deleted successfully.' });
  } catch (e) {
    console.error('Delete custom workout error:', e);
    return res.status(500).json({ error: 'Failed to delete custom workout.' });
  }
});

export default router;
