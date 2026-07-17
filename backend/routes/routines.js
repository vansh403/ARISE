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
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const routines = await db.find('routines', { userId });
    return res.json(routines);
  } catch (e) {
    console.error('Fetch routines error:', e);
    return res.status(500).json({ error: 'Failed to fetch routines.' });
  }
});

// POST /api/routines
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, exercises } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Routine name is required.' });
    }

    const parsedExercises = exercises || [];
    const totalSets = parsedExercises.reduce((sum, ex) => sum + (Number(ex.sets) || 0), 0);
    const moreCount = Math.max(0, parsedExercises.length - 3);

    const newRoutine = {
      id: `r-${Date.now()}`,
      userId,
      name: name.trim(),
      totalSets,
      exercises: parsedExercises,
      moreCount
    };

    await db.insert('routines', newRoutine);
    return res.status(201).json(newRoutine);
  } catch (e) {
    console.error('Create routine error:', e);
    return res.status(500).json({ error: 'Failed to create routine.' });
  }
});

// PUT /api/routines/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, exercises } = req.body;

    const routine = await db.findOne('routines', { id, userId });
    if (!routine) {
      return res.status(404).json({ error: 'Routine not found.' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (exercises !== undefined) {
      updates.exercises = exercises;
      updates.totalSets = exercises.reduce((sum, ex) => sum + (Number(ex.sets) || 0), 0);
      updates.moreCount = Math.max(0, exercises.length - 3);
    }

    await db.update('routines', { id, userId }, updates);
    return res.json({ ...routine, ...updates });
  } catch (e) {
    console.error('Update routine error:', e);
    return res.status(500).json({ error: 'Failed to update routine.' });
  }
});

// DELETE /api/routines/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const count = await db.delete('routines', { id, userId });
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
