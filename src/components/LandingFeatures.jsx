import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Zap, Shield, TrendingUp, Dumbbell, Target, Star, ChevronRight, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const RANKS_DISPLAY = [
  { id: 'E', tier: 'Awakened',       color: '#22d3ee', glow: '#22d3ee', xp: '0–999',   desc: 'Your gates open. The system activates.' },
  { id: 'D', tier: 'Novice Hunter',  color: '#60a5fa', glow: '#60a5fa', xp: '1k–4.9k', desc: 'First quests cleared. Strength rising.' },
  { id: 'C', tier: 'Iron Hunter',    color: '#4ade80', glow: '#4ade80', xp: '5k–14.9k',desc: 'You are consistent. The system rewards it.' },
  { id: 'B', tier: 'Elite Hunter',   color: '#a78bfa', glow: '#a78bfa', xp: '15k–39k', desc: 'Elite territory. Few reach this gate.' },
  { id: 'A', tier: 'Ace Hunter',     color: '#f97316', glow: '#f97316', xp: '40k–99k', desc: 'The top 1%. You are the threat now.' },
  { id: 'S', tier: 'Shadow Monarch', color: '#ef4444', glow: '#ef4444', xp: '100k+',   desc: 'Absolute power. Feared by all.' },
];

const FEATURES = [
  {
    icon: Target,
    title: 'Ranked Quest System',
    desc: 'Every workout is a classified mission. Complete them, earn XP, and break through rank walls.',
    color: '#22d3ee',
    tag: 'PROTOCOL 01',
  },
  {
    icon: Zap,
    title: 'Real-Time Level Up',
    desc: 'The system tracks your stats live. Watch your strength, stamina, and agility scores climb.',
    color: '#a78bfa',
    tag: 'PROTOCOL 02',
  },
  {
    icon: Dumbbell,
    title: 'Personalized Protocol',
    desc: 'Your calorie targets, macro splits, and workout plan — generated from your exact body data.',
    color: '#4ade80',
    tag: 'PROTOCOL 03',
  },
  {
    icon: TrendingUp,
    title: 'XP & Progression',
    desc: 'No vague "good job". The system quantifies every rep, every set, every PR. Progress is visible.',
    color: '#f97316',
    tag: 'PROTOCOL 04',
  },
];

const STATS = [
  { value: '128,402', label: 'Registered Hunters', suffix: '' },
  { value: '9.4K',    label: 'Quests Completed Today', suffix: '+' },
  { value: '217',     label: 'S-Rank Achievers', suffix: '' },
  { value: '99.1',    label: 'System Uptime', suffix: '%' },
];

function AnimatedCounter({ value }) {
  return <span>{value}</span>;
}

export default function LandingFeatures() {
  const rankRef = useRef(null);
  const featureRef = useRef(null);
  const statsRef = useRef(null);
  const rankInView = useInView(rankRef, { once: true, margin: '-100px' });
  const featureInView = useInView(featureRef, { once: true, margin: '-100px' });
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' });

  const [hoveredRank, setHoveredRank] = useState(null);

  return (
    <>
      {/* ── LIVE STATS BAR ──────────────────────────────────────────────── */}
      <div ref={statsRef} className="relative border-y border-white/5 bg-slate-950/60 backdrop-blur-md overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-red-500/5" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col"
            >
              <div className="font-display text-4xl md:text-5xl font-black text-slate-50 tracking-tight">
                {s.value}<span className="text-cyan-400">{s.suffix}</span>
              </div>
              <div className="font-mono text-[11px] text-slate-500 tracking-widest mt-2 uppercase">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── RANK PROGRESSION (INTERACTIVE) ─────────────────────────────── */}
      <section ref={rankRef} id="ranks" className="relative bg-black py-28 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-16">
            <div>
              <div className="font-mono text-xs text-cyan-300 tracking-[0.3em] mb-3">// PROTOCOL 01</div>
              <h2 className="font-display text-4xl md:text-6xl font-black text-slate-50 leading-tight">
                THE <span className="text-red-400">RANK</span> SYSTEM
              </h2>
              <p className="mt-4 text-slate-400 max-w-xl text-lg">
                Six tiers. Six thresholds. Each rank unlocks new gates, new protocols, and a stronger version of you.
              </p>
            </div>
          </div>

          {/* Rank Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {RANKS_DISPLAY.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 40 }}
                animate={rankInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                onMouseEnter={() => setHoveredRank(r.id)}
                onMouseLeave={() => setHoveredRank(null)}
                className="relative group cursor-pointer bracket-corners p-5 bg-slate-950/50 backdrop-blur-lg border border-white/5 overflow-hidden transition-all duration-500"
                style={hoveredRank === r.id ? { borderColor: `${r.color}50`, boxShadow: `0 0 40px ${r.glow}30, inset 0 0 30px ${r.glow}10` } : {}}
              >
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" style={{ background: r.color }} />
                <div className="relative z-10">
                  <span className="font-display font-black text-5xl block mb-2 transition-all duration-300" style={{ color: hoveredRank === r.id ? r.color : 'rgba(255,255,255,0.15)', filter: hoveredRank === r.id ? `drop-shadow(0 0 12px ${r.glow})` : 'none' }}>{r.id}</span>
                  <div className="font-mono text-[10px] text-slate-500 tracking-widest group-hover:text-slate-400 transition-colors">{r.tier.toUpperCase()}</div>
                  <div className="font-mono text-[9px] mt-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: r.color }}>{r.xp} XP</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Hovered Rank Detail */}
          <div className="h-16 flex items-center justify-center">
            <motion.div
              key={hoveredRank || 'idle'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-xl text-center text-slate-300 tracking-widest"
            >
              {hoveredRank
                ? RANKS_DISPLAY.find((r) => r.id === hoveredRank)?.desc
                : <span className="text-slate-600 font-mono text-sm tracking-widest">HOVER A RANK TO REVEAL ITS THRESHOLD</span>
              }
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURE CARDS (HOW IT WORKS) ────────────────────────────────── */}
      <section ref={featureRef} id="quests" className="relative bg-black py-28 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 grid-bg opacity-15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] blur-[120px] opacity-10 bg-cyan-400 rounded-full" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <div className="font-mono text-xs text-cyan-300 tracking-[0.3em] mb-3">// HOW THE SYSTEM WORKS</div>
            <h2 className="font-display text-4xl md:text-6xl font-black text-slate-50 leading-tight">
              YOUR <span className="text-cyan-300">PROTOCOL</span>
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto text-lg">
              ARISE doesn't track you. It <em className="text-slate-200 not-italic">upgrades</em> you. Every session feeds the system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={featureInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.12, type: 'spring', stiffness: 200 }}
                  className="group relative bracket-corners p-8 bg-slate-950/40 backdrop-blur-xl border border-white/5 hover:border-cyan-500/30 overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(34,211,238,0.1)] cursor-default"
                >
                  <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-25 transition-opacity duration-700" style={{ background: f.color }} />
                  <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:left-[200%] transition-all duration-1000 ease-in-out" />

                  <div className="relative z-10">
                    <div className="font-mono text-[9px] tracking-widest mb-4" style={{ color: f.color }}>{f.tag}</div>
                    <div className="w-12 h-12 border flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-300" style={{ borderColor: `${f.color}40`, background: `${f.color}10` }}>
                      <Icon className="w-5 h-5" style={{ color: f.color }} />
                    </div>
                    <h3 className="font-display font-bold text-xl text-slate-50 mb-3 leading-tight group-hover:text-white transition-colors">{f.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featureInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 p-8 bg-gradient-to-r from-cyan-950/40 to-slate-950/60 border border-cyan-500/20 backdrop-blur-xl"
          >
            <div>
              <div className="font-mono text-[10px] text-cyan-400 tracking-widest mb-1">// SYSTEM AWAITS</div>
              <div className="font-display text-2xl font-black text-slate-50 tracking-wide">Ready to awaken, hunter?</div>
              <div className="text-slate-400 text-sm mt-1">Join 128,000+ hunters already in the system.</div>
            </div>
            <Link
              to="/signup"
              className="group flex items-center gap-3 h-14 px-8 bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold tracking-widest transition-all whitespace-nowrap shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:shadow-[0_0_50px_rgba(34,211,238,0.6)]"
            >
              ENTER THE SYSTEM
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
