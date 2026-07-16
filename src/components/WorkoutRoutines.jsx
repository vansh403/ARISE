import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Dumbbell, ClipboardList, ChevronDown, ChevronUp, Folder, Plus, Zap, Check, X, Trash2 } from 'lucide-react';
import { buildBodyQuests } from './QuestBoard';
import { RANKS } from '../mock';
import { useToast } from '../hooks/use-toast';
import { apiClient } from '../lib/api';
import WorkoutTracker from './WorkoutTracker';
import WorkoutGenerator from './WorkoutGenerator';

const rankColor = (id) => RANKS.find((r) => r.id === id)?.color || '#22d3ee';

const DEFAULT_ROUTINES = [
  { id: 'r1', name: 'Back', totalSets: 14, exercises: [{ name: 'Pull Ups', sets: 2, icon: '🏋️' }, { name: 'Lat Pulldown', sets: 3, icon: '🪑' }, { name: 'Bent Over Dumbbell Row', sets: 3, icon: '💪' }], moreCount: 2 },
  { id: 'r2', name: 'Chest', totalSets: 24, exercises: [{ name: 'Bench Press', sets: 3, icon: '🏋️' }, { name: 'Incline Dumbbell Bench Press', sets: 3, icon: '🪑' }, { name: 'Push Ups', sets: 3, icon: '🤸' }], moreCount: 5 },
  { id: 'r3', name: 'Legs', totalSets: 14, exercises: [{ name: 'Squat', sets: 3, icon: '🏋️' }, { name: 'Leg Extension', sets: 3, icon: '🪑' }, { name: 'Sled Leg Press', sets: 3, icon: '📐' }], moreCount: 0 },
  { id: 'r4', name: 'Shoulder', totalSets: 15, exercises: [{ name: 'Seated Dumbbell Shoulder Press', sets: 3, icon: '🏋️' }, { name: 'Seated Shoulder Press', sets: 3, icon: '🪑' }, { name: 'Barbell Front Raise', sets: 3, icon: '🧍' }], moreCount: 2 },
  { id: 'r5', name: 'Bicep/tricep', totalSets: 33, exercises: [{ name: 'Dumbbell Curl', sets: 3, icon: '💪' }, { name: 'Hammer Curl', sets: 3, icon: '🔨' }, { name: 'Seated Dumbbell Tricep Extension', sets: 3, icon: '🪑' }], moreCount: 8 }
];

export default function WorkoutRoutines({ currentUser, progressive = true, progress = null, onRefreshProgress = null }) {
  const { toast } = useToast();
  
  const completed = useMemo(() => {
    return new Set(progress?.completedQuestIds || []);
  }, [progress]);

  const [routines, setRoutines] = useState(DEFAULT_ROUTINES);
  const [routinesOpen, setRoutinesOpen] = useState(true);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isRoutineBuilderOpen, setIsRoutineBuilderOpen] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');

  const fetchRoutines = async () => {
    try {
      const data = await apiClient.getRoutines();
      setRoutines(data);
    } catch (e) {
      console.error('Failed to fetch routines:', e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchRoutines();
    }
  }, [currentUser]);

  // Dynamic Today's Workout based on Day of Week
  const [todaysWorkout, setTodaysWorkout] = useState(DEFAULT_ROUTINES[0]);
  useEffect(() => {
    if (routines.length === 0) return;
    const day = new Date().getDay(); // 0 is Sunday, 1 is Monday
    const index = day % routines.length;
    setTodaysWorkout(routines[index] || DEFAULT_ROUTINES[0]);
  }, [routines]);

  // Take the first 8 body quests for the scroll view
  const quests = buildBodyQuests(progress?.currentRank || 'E').slice(0, 8);

  const handleCompleteQuest = async (questId, xp) => {
    if (!progressive || !currentUser) {
      toast({ title: '[SYSTEM]', description: 'Logged in user required to earn XP.' });
      return;
    }
    try {
      await apiClient.completeQuest(questId, xp);
      toast({ title: '[QUEST CLEARED]', description: `Quest completed. Earned ${xp} XP.` });
      if (onRefreshProgress) {
        onRefreshProgress();
      }
    } catch {
      toast({ title: 'Error saving progress' });
    }
  };

  const handleCreateRoutine = async () => {
    if (!newRoutineName.trim()) {
      toast({ title: 'Invalid Name', description: 'Please enter a routine name.' });
      return;
    }
    try {
      const newRoutine = await apiClient.createRoutine(newRoutineName);
      setRoutines(prev => [newRoutine, ...prev]);
      setNewRoutineName('');
      setIsRoutineBuilderOpen(false);
      toast({ title: '[SYSTEM]', description: `Created new routine: ${newRoutineName}` });
    } catch (e) {
      toast({ title: 'Error creating routine' });
    }
  };

  const handleDeleteRoutine = async (id) => {
    try {
      await apiClient.deleteRoutine(id);
      setRoutines(prev => prev.filter(r => r.id !== id));
      toast({ title: '[ROUTINE DELETED]', description: 'Routine removed from active list.' });
    } catch (e) {
      toast({ title: 'Error deleting routine' });
    }
  };

  return (
    <>
      <section className="relative w-full max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <div className="font-mono text-xs text-cyan-300 tracking-[0.3em] mb-3">// PROTOCOL 05</div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-slate-50 leading-tight mb-2">
            WORKOUT <span className="text-cyan-300">ROUTINES</span>
          </h2>
          <p className="text-slate-400">Execute your daily training protocol.</p>
        </div>

        {/* Quests Scroll View */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-sm tracking-widest text-slate-400">ACTIVE WORKOUT QUESTS</h3>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
            {quests.map(q => {
              const isCompleted = completed.has(q.id);
              const clr = rankColor(q.rank);
              return (
                <div 
                  key={q.id} 
                  className={`snap-start flex-none w-64 p-4 border bg-slate-950/40 backdrop-blur-md transition-all ${isCompleted ? 'opacity-50 border-slate-800' : 'border-slate-800 hover:border-cyan-500/30'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-mono text-[10px] tracking-widest" style={{ color: clr }}>{q.title.toUpperCase()}</div>
                    <div className="flex items-center gap-1 text-cyan-300 font-mono text-[10px]">
                      <Zap size={10} /> +{q.xp}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-4 h-10">{q.desc}</p>
                  {isCompleted ? (
                    <div className="flex items-center justify-center gap-1 text-cyan-400 font-mono text-[10px] bg-cyan-400/10 py-2">
                      <Check size={12} /> CLEARED
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleCompleteQuest(q.id, q.xp)}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-cyan-500/50 py-2 font-mono text-[10px] text-slate-300 hover:text-cyan-300 transition-all uppercase tracking-widest"
                    >
                      Execute & Log
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Workout */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-display font-bold text-2xl text-slate-100">Today's Workout</h3>
            <div className="w-5 h-5 rounded-full border border-slate-700 text-slate-400 flex items-center justify-center text-xs font-mono">?</div>
          </div>
          
          <button 
            onClick={() => setActiveWorkout(todaysWorkout)}
            className="w-full bg-green-700/80 hover:bg-green-600 transition-colors border border-green-500/50 rounded-2xl p-4 flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-black/30 rounded-xl flex items-center justify-center text-3xl">
                🏋️
              </div>
              <div className="text-left">
                <div className="font-display font-bold text-xl text-white">{todaysWorkout.name}</div>
                <div className="font-mono text-sm text-green-200/70">{todaysWorkout.totalSets} Sets • 1h</div>
              </div>
            </div>
            <div className="flex items-center gap-2 font-display font-bold text-white text-lg mr-2">
              Start <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
            </div>
          </button>
        </div>

        {/* New Workout */}
        <div className="mb-10">
          <h3 className="font-display font-bold text-2xl text-slate-100 mb-4">New Workout</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setActiveWorkout({ name: 'Empty Workout', exercises: [] })}
              className="w-full bg-[#1c1c24] border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 flex items-center justify-between group transition-colors"
            >
              <span className="font-display text-xl text-slate-200 group-hover:text-cyan-300 transition-colors">Start Empty Workout</span>
              <Dumbbell className="w-10 h-10 text-cyan-500 transform -rotate-45 group-hover:scale-110 transition-transform" />
            </button>

            <button 
              onClick={() => setIsGeneratorOpen(true)}
              className="w-full bg-[#1c1c24] border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 flex items-center justify-between group transition-colors"
            >
              <span className="font-display text-xl text-slate-200 group-hover:text-cyan-300 transition-colors">Generate Workout</span>
              <ClipboardList className="w-10 h-10 text-blue-400 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Routines */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-2xl text-slate-100">Routines</h3>
            <div className="flex gap-4 text-slate-300">
              <button className="hover:text-cyan-300 transition-colors"><Folder className="w-6 h-6" /></button>
              <button onClick={() => setIsRoutineBuilderOpen(true)} className="hover:text-cyan-300 transition-colors"><Plus className="w-6 h-6" /></button>
            </div>
          </div>

          <div className="bg-[#1c1c24] border border-slate-800 rounded-2xl overflow-hidden">
            <button 
              onClick={() => setRoutinesOpen(!routinesOpen)}
              className="w-full p-4 flex items-center justify-between bg-[#23232d] hover:bg-[#2a2a36] transition-colors"
            >
              <div className="flex items-center gap-3">
                {routinesOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                <span className="font-display text-lg text-slate-200">My Routines ({routines.length})</span>
              </div>
            </button>

            <AnimatePresence>
              {routinesOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {routines.map((routine, idx) => (
                    <div key={routine.id} className={`p-5 ${idx !== routines.length - 1 ? 'border-b border-slate-800' : ''}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-display font-bold text-xl text-slate-100">{routine.name}</h4>
                          <div className="font-mono text-sm text-slate-500">{routine.totalSets} sets</div>
                        </div>
                        <button 
                          onClick={() => handleDeleteRoutine(routine.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-4 mb-4">
                        {routine.exercises.length === 0 ? (
                          <div className="font-mono text-xs text-slate-600 italic">No exercises added yet.</div>
                        ) : (
                          routine.exercises.map((ex, i) => (
                            <div key={i} className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xl">
                                {ex.icon || '🏋️'}
                              </div>
                              <div>
                                <div className="font-display text-slate-200">{ex.name}</div>
                                <div className="font-mono text-xs text-slate-500">{ex.sets} sets</div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="font-mono text-sm text-slate-500">
                          {routine.moreCount > 0 ? `and ${routine.moreCount} more` : ''}
                        </div>
                        <button 
                          onClick={() => setActiveWorkout(routine)}
                          className="bg-[#2bc4ff] hover:bg-[#1ab4f0] text-black font-display font-bold px-6 py-2 rounded-lg text-sm uppercase tracking-wider transition-colors"
                        >
                          START
                        </button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Routine Builder Modal */}
      <AnimatePresence>
        {isRoutineBuilderOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-[#1c1c24] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#23232d]">
                <h3 className="font-display font-bold text-lg text-white">Create Routine</h3>
                <button onClick={() => setIsRoutineBuilderOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6">
                <label className="font-mono text-xs text-slate-400 uppercase tracking-widest mb-2 block">Routine Name</label>
                <input 
                  type="text" 
                  value={newRoutineName}
                  onChange={(e) => setNewRoutineName(e.target.value)}
                  placeholder="e.g. Heavy Legs"
                  autoFocus
                  className="w-full bg-[#0f0f13] border border-slate-700 rounded-lg h-12 px-4 text-white font-display focus:border-cyan-500 focus:outline-none mb-6"
                />
                
                <div className="flex gap-4">
                  <button onClick={() => setIsRoutineBuilderOpen(false)} className="flex-1 py-3 font-display font-bold text-slate-400 hover:text-white transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleCreateRoutine} className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold rounded-lg transition-colors">
                    Create
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlays */}
      <AnimatePresence>
        {activeWorkout && (
          <WorkoutTracker 
            routine={activeWorkout} 
            onClose={() => {
              setActiveWorkout(null);
              if (onRefreshProgress) {
                onRefreshProgress();
              }
            }} 
            currentUser={currentUser}
          />
        )}
        {isGeneratorOpen && (
          <WorkoutGenerator onClose={() => setIsGeneratorOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
