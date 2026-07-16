import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { LOCK_IN_MESSAGE } from '../lib/fitnessPlans';
import { apiClient } from '../lib/api';

const PROFILE_KEY = 'arise-fitness-profile';

const container = { animate: { transition: { staggerChildren: 0.12 } } };
const card = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function FitnessDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [customName, setCustomName] = useState('');
  const [customDetail, setCustomDetail] = useState('');

  useEffect(() => {
    document.title = 'Dashboard // ARISE Fitness';
    const loadProfile = async () => {
      try {
        const data = await apiClient.getFitnessProfile();
        setProfile(data);
      } catch (e) {
        const saved = JSON.parse(window.localStorage.getItem(PROFILE_KEY) || 'null');
        if (saved) {
          try {
            await apiClient.saveFitnessProfile(saved);
            setProfile(saved);
          } catch {
            setProfile(saved);
          }
        } else {
          navigate('/fitness-onboarding');
        }
      }
    };
    loadProfile();
  }, [navigate]);

  const addCustomWorkout = async () => {
    if (!customName.trim()) return;
    try {
      const newWorkout = await apiClient.addCustomWorkout(customName, customDetail);
      setProfile(prev => ({
        ...prev,
        customWorkouts: [...(prev.customWorkouts || []), newWorkout]
      }));
      setCustomName('');
      setCustomDetail('');
    } catch (e) {
      console.error('Failed to add custom workout:', e);
    }
  };

  const removeCustomWorkout = async (id) => {
    try {
      await apiClient.deleteCustomWorkout(id);
      setProfile(prev => ({
        ...prev,
        customWorkouts: (prev.customWorkouts || []).filter((w) => w.id !== id)
      }));
    } catch (e) {
      console.error('Failed to delete custom workout:', e);
    }
  };

  if (!profile) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black text-slate-100 px-4 py-16"
    >
      <div className="max-w-5xl mx-auto space-y-10">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="font-mono text-xs text-cyan-300 tracking-[0.3em] mb-2">// HUNTER PROFILE</p>
          <h1 className="font-display text-4xl font-black">{profile.name}</h1>
          <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-400">
            <span>{profile.age} yrs</span>
            <span>·</span>
            <span className="capitalize">{profile.gender}</span>
            <span>·</span>
            <span>{Math.round(profile.weightKg)}kg</span>
            <span>·</span>
            <span>{Math.round(profile.heightCm)}cm</span>
            <span>·</span>
            <span className="capitalize text-cyan-300">{profile.level}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className={`rounded-xl border p-4 ${profile.bmiCategory.warn ? 'border-amber-500/40 bg-amber-500/5' : 'border-slate-800 bg-slate-900/40'}`}
        >
          <p className="text-sm">BMI: <span className="font-semibold text-cyan-300">{profile.bmi}</span> — {profile.bmiCategory.label}</p>
          {profile.bmiCategory.warn && <p className="text-xs text-amber-400 mt-2">{LOCK_IN_MESSAGE}</p>}
        </motion.div>

        <motion.div variants={container} initial="initial" animate="animate" className="grid md:grid-cols-2 gap-6">
          <motion.div variants={card} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <h2 className="font-display text-xl font-bold text-cyan-300 mb-4">Workout Plan · {profile.daysPerWeek} days/week</h2>
            <div className="space-y-3">
              {profile.workoutPlan.map((d) => (
                <div key={d.day} className="border-b border-slate-800 pb-3 last:border-0">
                  <p className="text-sm font-semibold">Day {d.day} — {d.focus}</p>
                  <ul className="mt-1 text-sm text-slate-400 list-disc list-inside">
                    {d.exercises.map((ex) => <li key={ex}>{ex}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={card} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <h2 className="font-display text-xl font-bold text-cyan-300 mb-4">Diet Plan · {profile.dietPlan.goal}</h2>
            <p className="text-sm mb-2">Target: <span className="font-semibold">{profile.dietPlan.calories} kcal/day</span></p>
            <p className="text-sm text-slate-400 mb-3">
              Protein {profile.dietPlan.macros.proteinG}g · Carbs {profile.dietPlan.macros.carbsG}g · Fat {profile.dietPlan.macros.fatG}g
            </p>
            <ul className="text-sm text-slate-400 list-disc list-inside space-y-1">
              {profile.dietPlan.meals.map((m) => <li key={m}>{m}</li>)}
            </ul>
            <p className="text-xs text-slate-500 mt-3">{profile.dietPlan.notes}</p>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h2 className="font-display text-xl font-bold text-cyan-300 mb-4">Add your own workout</h2>
          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Exercise name (e.g. Farmer's carry)"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            />
            <input
              value={customDetail}
              onChange={(e) => setCustomDetail(e.target.value)}
              placeholder="Sets x reps or notes"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm"
            />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addCustomWorkout} className="px-4 py-2 rounded-lg bg-cyan-400 text-black flex items-center gap-1 justify-center">
              <Plus size={16} /> Add
            </motion.button>
          </div>
          <AnimatePresence>
            {(profile.customWorkouts || []).map((w) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between border-b border-slate-800 py-2 text-sm"
              >
                <span>{w.name}{w.detail ? ` — ${w.detail}` : ''}</span>
                <button onClick={() => removeCustomWorkout(w.id)} className="text-slate-500 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {(!profile.customWorkouts || profile.customWorkouts.length === 0) && (
            <p className="text-xs text-slate-500">No custom workouts added yet.</p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
