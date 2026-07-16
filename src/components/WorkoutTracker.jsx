import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, MoreVertical, Check, ArrowRight, X, Clock, Settings, HelpCircle, Activity, Plus } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { apiClient } from '../lib/api';
import { Button } from './ui/button';

export default function WorkoutTracker({ routine, onClose, currentUser }) {
  const { toast } = useToast();
  const [elapsed, setElapsed] = useState(0);
  const [restTimerEnabled, setRestTimerEnabled] = useState(true);

  // Initialize workout data based on the passed routine
  const [workoutData, setWorkoutData] = useState(() => {
    return routine.exercises.map((ex, exIdx) => ({
      id: `ex-${exIdx}`,
      name: ex.name,
      icon: ex.icon,
      expanded: true,
      sets: Array.from({ length: ex.sets }).map((_, sIdx) => ({
        id: `set-${exIdx}-${sIdx}`,
        setNum: sIdx + 1,
        prev: `${Math.floor(Math.random() * 100) + 50} x ${Math.floor(Math.random() * 8) + 5}`, // Mock prev data
        lbs: '',
        reps: '',
        completed: false
      }))
    }));
  });

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleExpand = (exId) => {
    setWorkoutData(prev => prev.map(ex => 
      ex.id === exId ? { ...ex, expanded: !ex.expanded } : ex
    ));
  };

  const updateSet = (exId, setId, field, value) => {
    setWorkoutData(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
      };
    }));
  };

  const toggleComplete = async (exId, setId) => {
    let targetEx = null;
    let targetSet = null;

    workoutData.forEach(ex => {
      if (ex.id === exId) {
        targetEx = ex;
        ex.sets.forEach(s => {
          if (s.id === setId) targetSet = s;
        });
      }
    });

    if (!targetSet) return;
    const isNowCompleted = !targetSet.completed;

    if (isNowCompleted && currentUser) {
      const weight = parseFloat(targetSet.lbs) || 0;
      const reps = parseInt(targetSet.reps) || 0;
      try {
        const res = await apiClient.logSet(targetEx.name, weight, reps);
        if (res.prUpdated) {
          toast({
            title: '[NEW PR ACHIEVED]',
            description: `Strength score increased to ${res.progress.strength}!`,
          });
        } else {
          toast({ title: `+${res.xpAdded} XP`, description: 'Set completed.' });
        }
      } catch (e) {
        toast({ title: '[SYSTEM ERROR]', description: 'Failed to record set on backend.' });
      }
    }

    setWorkoutData(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, completed: isNowCompleted } : s)
      };
    }));
  };

  const handleFinishWorkout = async () => {
    if (currentUser) {
      try {
        await apiClient.completeWorkout();
        toast({ title: '[WORKOUT COMPLETE]', description: '+150 Bonus XP earned!' });
      } catch (e) {
        toast({ title: '[SYSTEM ERROR]', description: 'Failed to complete workout.' });
      }
    }
    onClose();
  };

  const addSet = (exId) => {
    setWorkoutData(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      const newSetNum = ex.sets.length + 1;
      return {
        ...ex,
        sets: [...ex.sets, {
          id: `set-${exId}-${newSetNum}-${Date.now()}`,
          setNum: newSetNum,
          prev: '-',
          lbs: '',
          reps: '',
          completed: false
        }]
      };
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[100] bg-[#0f0f13] flex flex-col font-sans overflow-hidden"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-4 bg-[#16161a] border-b border-slate-800 shrink-0">
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white transition-colors">
          <ChevronDown className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-400" />
          <span className="font-mono text-2xl text-white tracking-wider">{formatTime(elapsed)}</span>
        </div>

        <button className="w-10 h-10 rounded-full bg-cyan-500 hover:bg-cyan-400 flex items-center justify-center text-black transition-colors">
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        <h1 className="font-display font-bold text-3xl text-white mb-6">{routine.name}</h1>

        <div className="space-y-6">
          {workoutData.map((ex) => (
            <div key={ex.id} className="bg-[#1c1c24] border border-slate-800 rounded-2xl overflow-hidden">
              
              {/* Exercise Header */}
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#23232d] transition-colors"
                onClick={() => toggleExpand(ex.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xl">
                    {ex.icon}
                  </div>
                  <span className="font-display text-lg text-slate-200">{ex.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    {ex.expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  <button className="text-slate-500 hover:text-slate-300" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Rest Timer Toggle (Mock) */}
              {ex.expanded && (
                <div className="px-4 py-3 border-t border-slate-800/50 flex items-center justify-between bg-[#16161a]">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-display">Rest Timer <span className="text-white ml-1">1m 30s</span></span>
                  </div>
                  <div 
                    className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${restTimerEnabled ? 'bg-cyan-500' : 'bg-slate-700'}`}
                    onClick={() => setRestTimerEnabled(!restTimerEnabled)}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${restTimerEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>
              )}

              {/* Sets Table */}
              <AnimatePresence>
                {ex.expanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-2 text-center text-xs font-mono text-slate-500 mb-2 uppercase tracking-widest px-2 pt-4">
                        <div className="col-span-2 text-left">Set</div>
                        <div className="col-span-3">Prev</div>
                        <div className="col-span-3">Lbs</div>
                        <div className="col-span-3">Reps</div>
                        <div className="col-span-1"></div>
                      </div>

                      {/* Sets Rows */}
                      <div className="space-y-2">
                        {ex.sets.map((set) => (
                          <div 
                            key={set.id} 
                            className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg transition-colors ${set.completed ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-transparent'}`}
                          >
                            <div className="col-span-2 text-left font-display font-bold text-slate-300 pl-2">
                              {set.setNum}
                            </div>
                            <div className="col-span-3 text-center">
                              <div className="bg-[#16161a] border border-slate-800 rounded-md py-2 px-1 text-xs font-mono text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis">
                                {set.prev}
                              </div>
                            </div>
                            <div className="col-span-3">
                              <input 
                                type="number" 
                                value={set.lbs}
                                onChange={(e) => updateSet(ex.id, set.id, 'lbs', e.target.value)}
                                className="w-full bg-[#23232d] border border-slate-700 focus:border-cyan-500 rounded-md py-2 px-1 text-center font-mono text-white text-sm outline-none transition-colors"
                                placeholder="-"
                              />
                            </div>
                            <div className="col-span-3">
                              <input 
                                type="number" 
                                value={set.reps}
                                onChange={(e) => updateSet(ex.id, set.id, 'reps', e.target.value)}
                                className="w-full bg-[#23232d] border border-slate-700 focus:border-cyan-500 rounded-md py-2 px-1 text-center font-mono text-white text-sm outline-none transition-colors"
                                placeholder="-"
                              />
                            </div>
                            <div className="col-span-1 flex justify-end pr-1">
                              <button 
                                onClick={() => toggleComplete(ex.id, set.id)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${set.completed ? 'bg-cyan-500 text-black' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Set Button */}
                      <button 
                        onClick={() => addSet(ex.id)}
                        className="w-full mt-4 py-2 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 rounded-lg font-mono text-xs text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-widest flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Set
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Add Exercise Button */}
          <div className="pt-4 pb-4">
            <button className="w-full h-14 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-display font-bold text-lg flex items-center justify-center gap-2 transition-colors">
              <Plus className="w-5 h-5" /> Exercise
            </button>
          </div>

          {/* Finish Workout Button */}
          <div className="pb-12">
            <button onClick={handleFinishWorkout} className="w-full h-14 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-display font-bold text-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-cyan-500/20">
              <Check className="w-5 h-5" /> Finish Workout
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#0f0f13] border-t border-slate-800 flex items-center justify-around px-4">
        <button className="flex flex-col items-center gap-1 text-cyan-400">
          <HelpCircle className="w-6 h-6" />
          <span className="text-[10px] font-display">How To</span>
        </button>
        <div className="relative -top-6">
          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30 border-4 border-[#0f0f13]">
            <Activity className="w-8 h-8 text-white" />
          </div>
        </div>
        <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300">
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-display">Settings</span>
        </button>
      </div>

    </motion.div>
  );
}
