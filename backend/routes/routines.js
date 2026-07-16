import express from 'express';
import { db } from '../lib/data-store.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

const DEFAULT_ROUTINES = [
  { id: 'r1', name: 'Back', totalSets: 14, exercises: [{ name: 'Pull Ups', sets: 2, icon: '🏋️' }, { name: 'Lat Pulldown', sets: 3, icon: '🪑' }, { name: 'Bent Over Dumbbell Row', sets: 3, icon: '💪' }], moreCount: 2 },
  { id: 'r2', name: 'Chest', totalSets: 24, exercises: [{ name: 'Bench Press', sets: 3, icon: '🏋️' }, { name: 'Incline Dumbbell Bench Press', sets: 3, icon: '🪑' }, { name: 'Push Ups', sets: 3, icon: '🤸' }], moreCount: 5 },
  { id: 'r3', name: 'Legs', totalSets: 14, exercises: [{ name: 'Squat', sets: 3, icon: '🏋️' }, { name: 'Leg Extension', sets: 3, icon: '🪑' }, { name: 'Sled Leg Press', sets: 3, icon: '📐' }], moreCount: 0 },
  { id: 'r4', name: 'Shoulder', totalSets: 15, exercises: [{ name: 'Seated Dumbbell Shoulder Press', sets: 3, icon: '🏋️' }, { name: 'Seated Shoulder Press', sets: 3, icon: '🪑' }, { name: 'Barbell Front Raise', sets: 3, icon: '🧍' }], moreCount: 2 },
  { id: 'r5', name: 'Bicep/tricep', totalSets: 33, exercises: [{ name: 'Dumbbell Curl', sets: 3, icon: '💪' }, { name: 'Hammer Curl', sets: 3, icon: '🔨' }, { name: 'Seated Dumbbell Tricep Extension', sets: 3, icon: '🪑' }], moreCount: 8 }
];

// GET /api/routines
router.get('/', auth, (req, res) => {
  try {
    const userId = req.user.id;
    let routines = db.find('routines', { userId });

    if (routines.length === 0) {
      // Initialize with default templates
      routines = DEFAULT_ROUTINES.map(r => {
        const customRoutine = {
          ...r,
          id: `r-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          userId
        };
        db.insert('routines', customRoutine);
        return customRoutine;
      });
    }

    return res.json(routines);
  } catch (e) {
    console.error('Fetch routines error:', e);
    return res.status(500).json({ error: 'Failed to fetch routines.' });
  }
});

// POST /api/routines
router.post('/', auth, (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Routine name is required.' });
    }

    const newRoutine = {
      id: `r-${Date.now()}`,
      userId,
      name: name.trim(),
      totalSets: 0,
      exercises: [],
      moreCount: 0
    };

    db.insert('routines', newRoutine);
    return res.status(201).json(newRoutine);
  } catch (e) {
    console.error('Create routine error:', e);
    return res.status(500).json({ error: 'Failed to create routine.' });
  }
});

// DELETE /api/routines/:id
router.delete('/:id', auth, (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const count = db.delete('routines', { id, userId });
    if (count === 0) {
      return res.status(404).json({ error: 'Routine not found or access denied.' });
    }

    return res.json({ message: 'Routine deleted successfully.' });
  } catch (e) {
    console.error('Delete routine error:', e);
    return res.status(500).json({ error: 'Failed to delete routine.' });
  }
});

export default router;
