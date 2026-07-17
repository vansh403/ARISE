import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HUNTER, RANKS } from '../mock';
import { Flame, Crown, TrendingUp, Activity, Dumbbell, Target } from 'lucide-react';
import { apiClient } from '../lib/api';

const rankColor = (id) => RANKS.find((r) => r.id === id)?.color || '#22d3ee';
import { getProgress, getRankByXP, calculateLevel } from '../lib/fitness';

export default function StatsPanel({ currentUser, progress: propProgress }) {
  const progress = propProgress || { xp: 0, level: 1, strength: 0, prs: { squat: 0, bench: 0, deadlift: 0 } };
  const currentRankInfo = getRankByXP(progress.xp, progress.completedQuestIds?.length || 0);
  const xpPct = currentRankInfo.nextRankXp ? Math.round((progress.xp / currentRankInfo.nextRankXp) * 100) : 100;
  
  const displayName = currentUser?.name || HUNTER.name;
  const stats = currentUser?.stats;

  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await apiClient.getHunters();
        setLeaderboard(data.slice(0, 4));
      } catch (e) {
        console.error('Failed to load leaderboard', e);
      }
    };
    loadLeaderboard();
  }, []);

  // Calculate Protocol if available
  const weight = stats ? parseFloat(stats.weight) : 70;
  const height = stats ? parseFloat(stats.height) : 170;
  const gender = stats ? stats.gender : 'male';
  const bmr = 10 * weight + 6.25 * height - 5 * 25 + (gender === 'male' ? 5 : -161);
  const maintenance = Math.round(bmr * 1.55);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <section id="stats" className="relative w-full max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="font-mono text-xs text-cyan-300 tracking-[0.3em] mb-2">// COMMAND CENTER</div>
        <h2 className="font-display text-4xl font-black text-slate-50 leading-tight">
          SYSTEM <span className="text-cyan-300">OVERVIEW</span>
        </h2>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        {/* Bento Box 1: The ID Card (Main Profile) */}
        <motion.div variants={itemVariants} className="md:col-span-8 lg:col-span-7 bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 relative overflow-hidden group shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start relative z-10">
            {/* Animated XP Ring */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="60" className="stroke-slate-800" strokeWidth="6" fill="transparent" />
                <motion.circle 
                  cx="64" cy="64" r="60"
                  className="stroke-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                  strokeWidth="6" fill="transparent"
                  strokeDasharray="377"
                  initial={{ strokeDashoffset: 377 }}
                  animate={{ strokeDashoffset: 377 - (377 * xpPct) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-black text-3xl text-cyan-300 drop-shadow-md">{currentRankInfo.rank}</span>
              </div>
            </div>

            <div className="flex-1 w-full text-center sm:text-left">
              <div className="font-mono text-[10px] text-slate-500 tracking-widest mb-1">HUNTER IDENTIFICATION</div>
              <div className="font-display text-3xl font-black text-slate-50 mb-1">{displayName}</div>
              <div className="font-mono text-xs text-cyan-400 tracking-widest bg-cyan-950/30 inline-block px-3 py-1 rounded-full border border-cyan-500/20 mb-4">
                LEVEL {calculateLevel(progress.xp)} · {currentRankInfo.title.toUpperCase()}
              </div>

              <div className="bg-black/50 rounded-xl p-4 border border-white/5">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-mono text-[10px] text-slate-400 tracking-widest">NEXT MILESTONE</span>
                  <span className="font-mono text-xs text-cyan-300">{progress.xp.toLocaleString()} / {currentRankInfo.nextRankXp ? currentRankInfo.nextRankXp.toLocaleString() : 'MAX'} XP</span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" style={{ width: `${xpPct}%` }} />
                </div>
                {progress.xp >= 1700 && (progress.completedQuestIds?.length || 0) < 7 && (
                  <div className="mt-3 text-[10px] font-mono text-amber-400 flex items-center gap-1.5 border border-amber-500/20 bg-amber-500/5 p-2 rounded">
                    <span className="animate-pulse">⚠️</span> GATE LOCKED: COMPLETE 7 QUESTS IN TOTAL TO ASCEND TO D-RANK (CURRENT: {progress.completedQuestIds?.length || 0}/7)
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bento Box 2: Quick Metrics */}
        <motion.div variants={itemVariants} className="md:col-span-4 lg:col-span-5 grid grid-cols-2 gap-4">
          <div className="bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-red-500/30 transition-colors group">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <Flame className="w-4 h-4" />
              <span className="font-mono text-[10px] tracking-widest">ACTIVE STREAK</span>
            </div>
            <div>
              <span className="font-display text-4xl font-black text-slate-50 group-hover:text-red-400 transition-colors drop-shadow-lg">{progress.streak ?? 0}</span>
              <span className="text-slate-500 font-mono text-xs ml-1">DAYS</span>
            </div>
          </div>
          <div className="bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-400/30 transition-colors group">
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Target className="w-4 h-4" />
              <span className="font-mono text-[10px] tracking-widest">QUESTS CLEARED</span>
            </div>
            <div>
              <span className="font-display text-4xl font-black text-slate-50 group-hover:text-cyan-300 transition-colors drop-shadow-lg">{progress.completedQuestIds?.length ?? 0}</span>
            </div>
          </div>
        </motion.div>

        {/* Bento Box 3: Physical Parameters (Assigned Protocol) */}
        <motion.div variants={itemVariants} className="md:col-span-6 lg:col-span-4 bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-24 h-24 text-cyan-400" />
          </div>
          <div className="font-mono text-[10px] text-cyan-400 tracking-widest mb-6 border-b border-white/5 pb-2">ACTIVE PROTOCOL</div>
          
          <div className="space-y-4 relative z-10">
            <div>
              <div className="text-[10px] font-mono text-slate-500 mb-1">TARGET CALORIES</div>
              <div className="font-display text-2xl font-black text-slate-100 drop-shadow-md">
                {stats ? maintenance : 0} <span className="text-sm font-normal text-slate-500">KCAL</span>
              </div>
            </div>
            
            <div className="pt-2">
              <div className="text-[10px] font-mono text-slate-500 mb-1">TRAINING SPLIT</div>
              <div className="font-display text-lg text-cyan-300 leading-tight">
                {stats ? (stats.daysPerWeek >= 5 ? 'Advanced PPL (6 Days)' : 'Upper/Lower (4 Days)') : 'No Split Assigned'}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-6 lg:col-span-4 bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
          <div className="font-mono text-[10px] text-slate-400 tracking-widest mb-6 border-b border-white/5 pb-2">SYSTEM ATTRIBUTES</div>
          <div className="space-y-4">
            <div className="group">
              <div className="flex justify-between mb-1.5">
                <span className="font-mono text-[10px] text-slate-300 tracking-widest group-hover:text-cyan-300 transition-colors">STRENGTH SCORE</span>
                <span className="font-mono text-[10px] text-slate-500 group-hover:text-cyan-300 transition-colors">{progress.strength || 0}/100</span>
              </div>
              <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-cyan-400" style={{ width: `${Math.min(progress.strength || 0, 100)}%` }} />
              </div>
            </div>
            {HUNTER.stats.map((s, i) => {
              let val = 0;
              if (s.name === 'Strength') {
                val = progress.strength || 0;
              } else if (s.name === 'Endurance') {
                val = (progress.completedQuestIds && progress.completedQuestIds.length > 0) ? Math.min(60 + progress.completedQuestIds.length * 2, 100) : 0;
              } else if (s.name === 'Agility') {
                val = (progress.completedQuestIds && progress.completedQuestIds.length > 0) ? Math.min(50 + progress.completedQuestIds.length * 2, 100) : 0;
              } else if (s.name === 'Discipline') {
                val = (progress.streak && progress.streak > 0) ? Math.min(50 + progress.streak * 4, 100) : 0;
              } else if (s.name === 'Recovery') {
                val = (progress.streak && progress.streak > 0) ? Math.min(55 + progress.streak * 2, 100) : 0;
              }
              return (
                <div key={s.name} className="group">
                  <div className="flex justify-between mb-1.5">
                    <span className="font-mono text-[10px] text-slate-300 tracking-widest group-hover:text-cyan-300 transition-colors">{s.name.toUpperCase()}</span>
                    <span className="font-mono text-[10px] text-slate-500 group-hover:text-cyan-300 transition-colors">{val}/{s.cap}</span>
                  </div>
                  <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(val / s.cap) * 100}%` }}
                      transition={{ delay: 0.5 + (i * 0.1), duration: 0.8 }}
                      className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]" 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Bento Box 5: Leaderboard Mini */}
        <motion.div variants={itemVariants} className="md:col-span-12 lg:col-span-4 bg-slate-950/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col h-full">
          <div className="flex justify-between items-baseline mb-4 border-b border-white/5 pb-2">
            <span className="font-mono text-[10px] text-slate-400 tracking-widest">GLOBAL ELITE</span>
            <Crown className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            {leaderboard.length > 0 ? (
              leaderboard.map((h) => {
                const clr = rankColor(h.tier);
                return (
                  <div key={h.id} className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${h.isLocal ? 'bg-cyan-500/10 border border-cyan-500/20' : 'hover:bg-white/5 border border-transparent'}`}>
                    <div className="font-mono text-[10px] text-slate-500 w-4">#{h.rank}</div>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center border bg-black/50 shadow-inner" style={{ borderColor: `${clr}40` }}>
                      <span className="font-display font-black text-xs" style={{ color: clr }}>{h.tier}</span>
                    </div>
                    <div className="flex-1 font-display tracking-widest text-sm text-slate-200 truncate">{h.name}</div>
                    <div className="font-mono text-[10px] text-cyan-400">LVL {h.level}</div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs font-mono text-slate-600 italic py-4 text-center">// RECONSTRUCTING LEADERBOARD...</div>
            )}
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}
