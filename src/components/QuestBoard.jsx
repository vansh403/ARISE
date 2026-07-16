import React, { useState, useMemo } from 'react';
import { RANKS } from '../mock';
import { Lock, Zap, Check, Trophy, Scale, Droplets, Dumbbell } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import { apiClient } from '../lib/api';

const rankColor = (id) => RANKS.find((r) => r.id === id)?.color || '#22d3ee';
const BODY_PARTS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio'];

const questMoves = {
  Chest: ['Push-up ladder', 'Incline press', 'Floor press tempo reps', 'Chest squeeze holds', 'Wide push-up finisher'],
  Back: ['Backpack rows', 'Reverse snow angels', 'Pull-ups', 'Superman pulls', 'Scapular squeeze finisher'],
  Shoulders: ['Pike push-ups', 'Lateral raise pulses', 'Overhead press', 'Shoulder taps', 'Wall walk practice'],
  Arms: ['Close-grip push-ups', 'Curl ladder', 'Triceps dips', 'Hammer curl tempo reps', 'Forearm plank holds'],
  Legs: ['Squat ladder', 'Reverse lunges', 'Deadlifts', 'Calf raise pyramid', 'Wall sit finisher'],
  Core: ['Plank intervals', 'Dead bugs', 'Mountain climbers', 'Leg raise tempo reps', 'Hollow hold finisher'],
  Cardio: ['Fast walk intervals', 'High knees', 'Jumping jacks', 'Burpee practice', 'Shadow sprint finisher'],
};

export const buildNutritionTargets = (stats) => {
  if (!stats) return { protein: 140, carbs: 200, calories: 2500, water: 3.5 };
  const weight = parseFloat(stats.weight) || 70;
  return {
    protein: Math.round(weight * 1.8),
    carbs: Math.round(weight * 3),
    calories: Math.round((10 * weight + 6.25 * 170 - 5 * 25 + 5) * 1.55),
    water: Number(((weight * 38) / 1000).toFixed(1)),
  };
};

export const buildNutritionQuests = (targets, currentRank = 'E') => {
  const xpMultiplier = { E: 1, D: 1.5, C: 2, B: 2.5, A: 3, S: 4 }[currentRank] || 1;
  return [
    { id: 'nutrition-protein', title: 'Protein Intake Quest', type: 'Nutrition', rank: currentRank, xp: Math.round(90 * xpMultiplier), duration: 'All day', desc: `Eat about ${targets.protein}g protein today to support recovery.` },
    { id: 'nutrition-carbs', title: 'Carb Fuel Quest', type: 'Nutrition', rank: currentRank, xp: Math.round(70 * xpMultiplier), duration: 'All day', desc: `Target about ${targets.carbs}g carbs today for training energy.` },
    { id: 'nutrition-calories', title: 'Calorie Control Quest', type: 'Nutrition', rank: currentRank, xp: Math.round(80 * xpMultiplier), duration: 'All day', desc: `Stay near ${targets.calories} calories today.` },
    { id: 'nutrition-water', title: 'Hydration Gate', type: 'Hydration', rank: currentRank, xp: Math.round(60 * xpMultiplier), duration: 'All day', desc: `Drink about ${targets.water}L water today.` },
  ];
};

export const buildBodyQuests = (currentRank = 'E') => {
  const xpMultiplier = { E: 1, D: 1.5, C: 2, B: 2.5, A: 3, S: 4 }[currentRank] || 1;
  const duration = { E: '15 min', D: '20 min', C: '25 min', B: '30 min', A: '35 min', S: '40 min' }[currentRank] || '15 min';
  const modifier = {
    E: 'Execute with perfect form.',
    D: '[DIFFICULTY: D-RANK] Add 2 reps or +5kg. Limit rest to 60s.',
    C: '[DIFFICULTY: C-RANK] Add 4 reps or +10kg. Limit rest to 45s.',
    B: '[DIFFICULTY: B-RANK] Add 6 reps or +15kg. Focus on slow negatives (3s).',
    A: '[DIFFICULTY: A-RANK] Add 8 reps or +20kg. Focus on explosive concentric power.',
    S: '[DIFFICULTY: S-RANK - MONARCH] Double target load or go to absolute muscular failure.'
  }[currentRank] || 'Execute with perfect form.';

  return BODY_PARTS.flatMap((part) =>
    questMoves[part].map((move, index) => ({
      id: `body-${part.toLowerCase()}-${index + 1}`,
      title: `${part} Quest ${index + 1}`,
      type: part,
      rank: currentRank,
      xp: Math.round((100 + index * 25) * xpMultiplier),
      duration: duration,
      desc: `${move}. ${modifier}`,
    }))
  );
};

export default function QuestBoard({ category = 'workout', progressive = false, currentUser = null, progress = null, onRefreshProgress = null }) {
  const completed = useMemo(() => {
    return new Set(progress?.completedQuestIds || []);
  }, [progress]);

  const [activeLogQuest, setActiveLogQuest] = useState(null);
  const [logData, setLogData] = useState({ reps: '', weight: '' });
  
  const { toast } = useToast();

  const targets = buildNutritionTargets(currentUser?.stats);
  const nutritionQuests = buildNutritionQuests(targets, progress?.currentRank || 'E');
  const workoutQuests = buildBodyQuests(progress?.currentRank || 'E');

  const questsToDisplay = category === 'workout' ? workoutQuests.slice(0, 8) : nutritionQuests; // Show first 8 workouts for demo

  const handleComplete = async (questId, xp) => {
    if (!progressive || !currentUser) return;
    try {
      await apiClient.completeQuest(questId, xp);
      toast({
        title: '[QUEST CLEARED]',
        description: `Quest completed. Earned ${xp} XP.`,
      });
      setActiveLogQuest(null);
      if (onRefreshProgress) {
        onRefreshProgress();
      }
    } catch (e) {
      toast({ title: 'Error saving progress' });
    }
  };

  const handleLogSubmit = (e, q) => {
    e.preventDefault();
    if (!logData.reps || !logData.weight) {
      toast({ title: '[SYSTEM]', description: 'Please enter reps and weight.' });
      return;
    }
    // In a real app, save logData to history here
    handleComplete(q.id, q.xp);
  };

  return (
    <section id="quests" className="relative w-full max-w-7xl mx-auto px-6 py-12 md:py-20">
      <div className="relative">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-10">
          <div>
            <div className="font-mono text-xs text-cyan-300 tracking-[0.3em] mb-3">// PROTOCOL 03</div>
            <h2 className="font-display text-4xl md:text-5xl font-black text-slate-50 leading-tight">
              {category === 'workout' ? 'WORKOUT' : 'NUTRITION'} <span className="text-cyan-300">QUESTS</span>
            </h2>
            <p className="mt-3 text-slate-400 max-w-xl">Daily classified missions. Execute with precision.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questsToDisplay.map((q) => {
            const isCompleted = completed.has(q.id);
            const isLogging = activeLogQuest === q.id;
            const clr = rankColor(q.rank);

            return (
              <div key={q.id} 
                className={`relative group bracket-corners p-6 bg-slate-950/40 backdrop-blur-xl border border-white/5 hover:border-cyan-500/30 transition-all duration-300 overflow-hidden shadow-xl`}
                style={isCompleted ? { opacity: 0.55, filter: 'grayscale(100%)' } : {}}>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent group-hover:left-[200%] transition-all duration-1000 ease-in-out" />
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" style={{ background: clr }} />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 flex items-center justify-center border" style={{ borderColor: clr }}>
                        <span className="font-display font-black text-lg" style={{ color: clr }}>{q.rank}</span>
                      </div>
                      <div>
                        <div className="font-mono text-[10px] text-slate-500 tracking-widest">{q.type.toUpperCase()}</div>
                        <div className="font-mono text-[10px] tracking-widest" style={{ color: clr }}>QUEST // {String(q.id).slice(-4)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-cyan-300">
                      <Zap className="w-3.5 h-3.5" />
                      <span className="font-mono text-xs">+{q.xp} XP</span>
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-xl mb-2 text-slate-50">{q.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">{q.desc}</p>

                  {isCompleted ? (
                    <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs border border-cyan-400/30 bg-cyan-400/10 p-3 justify-center">
                      <Check className="w-4 h-4" /> QUEST CLEARED
                    </div>
                  ) : isLogging ? (
                    <form onSubmit={(e) => handleLogSubmit(e, q)} className="space-y-3 bg-black/60 p-4 border border-cyan-500/20">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-mono text-[10px] text-slate-400 mb-1">REPS</label>
                          <input type="number" min="1" value={logData.reps} onChange={(e) => setLogData({ ...logData, reps: e.target.value })} className="w-full bg-slate-900 border border-slate-700 text-white p-2 font-mono text-sm focus:border-cyan-400 focus:outline-none" placeholder="e.g. 10" />
                        </div>
                        <div>
                          <label className="block font-mono text-[10px] text-slate-400 mb-1">WEIGHT (KG)</label>
                          <input type="number" min="0" step="0.5" value={logData.weight} onChange={(e) => setLogData({ ...logData, weight: e.target.value })} className="w-full bg-slate-900 border border-slate-700 text-white p-2 font-mono text-sm focus:border-cyan-400 focus:outline-none" placeholder="e.g. 20" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" className="flex-1 rounded-none border-slate-700" onClick={() => setActiveLogQuest(null)}>CANCEL</Button>
                        <Button type="submit" className="flex-1 rounded-none bg-cyan-500 hover:bg-cyan-400 text-black">CONFIRM</Button>
                      </div>
                    </form>
                  ) : (
                    <Button 
                      onClick={() => {
                        if (category === 'workout') {
                          setActiveLogQuest(q.id);
                          setLogData({ reps: '', weight: '' });
                        } else {
                          handleComplete(q.id, q.xp);
                        }
                      }}
                      className="w-full rounded-none font-mono text-xs tracking-widest bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-all"
                    >
                      {category === 'workout' ? 'EXECUTE & LOG' : 'MARK COMPLETE'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
