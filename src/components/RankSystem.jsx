import React, { useState } from 'react';
import { RANKS, FEATURES } from '../mock';
import { Lock, ChevronRight, Swords, Zap, Shield, Trophy } from 'lucide-react';

const iconMap = { Swords, Zap, Shield, Trophy };

export default function RankSystem({ initialRank = 'C', lockedToInitial = false }) {
  const [active, setActive] = useState(initialRank);
  const current = RANKS.find((r) => r.id === active);

  return (
    <section id="ranks" className="relative w-full max-w-7xl mx-auto px-6 py-12 md:py-20 overflow-hidden">
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
          <div>
            <div className="font-mono text-xs text-cyan-300 tracking-[0.3em] mb-3">// PROTOCOL 02</div>
            <h2 className="font-display text-4xl md:text-5xl font-black text-slate-50 leading-tight">
              THE <span className="text-red-400">RANK</span> SYSTEM
            </h2>
            <p className="mt-3 text-slate-400 max-w-xl">Six tiers. Six thresholds. Each rank unlocks new gates, new protocols, and unlocks a stronger version of you.</p>
          </div>
          <div className="font-mono text-xs text-slate-500 tracking-widest">CURRENT · <span className="text-cyan-300">{active}-RANK</span></div>
        </div>

        {/* Rank chips row */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-10">
          {RANKS.map((r) => {
            const isActive = r.id === active;
            const isS = r.id === 'S';
            return (
              <button
                key={r.id}
                onClick={() => {
                  if (!lockedToInitial) setActive(r.id);
                }}
                className={`group relative tilt ${isS ? 'bracket-corners-red' : 'bracket-corners'} p-4 text-left transition-all duration-300 ${isActive ? 'bg-slate-900 border-white/20' : 'bg-slate-950/40 backdrop-blur-xl border border-white/5 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]'}`}
                style={isActive ? { boxShadow: `0 0 24px ${r.glow}55, inset 0 0 24px ${r.glow}22` } : {}}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-3xl font-black" style={{ color: r.color }}>{r.id}</span>
                  {isActive && <div className="w-2 h-2 rounded-full flicker" style={{ background: r.color }} />}
                </div>
                <div className="font-mono text-[10px] text-slate-500 mt-2 tracking-widest">{r.tier.toUpperCase()}</div>
              </button>
            );
          })}
        </div>

        {/* Active rank details */}
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="bracket-corners p-8 md:p-12 relative overflow-hidden bg-slate-950/40 backdrop-blur-xl border border-white/5 shadow-2xl lg:col-span-8">
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full blur-3xl opacity-30" style={{ background: current.color }} />
            <div className="absolute inset-0 stripes opacity-40" />
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 flex items-center justify-center border-2" style={{ borderColor: current.color, boxShadow: `0 0 30px ${current.glow}55` }}>
                  <span className="font-display text-4xl font-black" style={{ color: current.color }}>{current.id}</span>
                </div>
                <div>
                  <div className="font-mono text-xs text-slate-500 tracking-widest">RANK · TIER</div>
                  <div className="font-display text-2xl md:text-3xl font-black text-slate-50">{current.name}</div>
                  <div className="font-mono text-xs tracking-widest" style={{ color: current.color }}>{current.tier.toUpperCase()}</div>
                </div>
              </div>
              <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">{current.desc}</p>
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                <div className="neon-border p-4">
                  <div className="font-mono text-[10px] text-cyan-300 tracking-widest">XP REQUIREMENT</div>
                  <div className="font-display text-xl text-slate-50 mt-1">{current.reqs}</div>
                </div>
                <div className="neon-border p-4">
                  <div className="font-mono text-[10px] text-cyan-300 tracking-widest">UNLOCKS</div>
                  <div className="font-display text-base text-slate-100 mt-1">{current.unlock}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features side */}
          <div className="lg:col-span-4 space-y-3">
            {FEATURES.map((f) => {
              const Icon = iconMap[f.icon] || Swords;
              return (
                <div key={f.title} className="p-5 group cursor-default bg-slate-950/40 backdrop-blur-md border border-white/5 hover:border-cyan-500/30 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 flex items-center justify-center border border-cyan-400/40 bg-cyan-400/5 group-hover:bg-cyan-400/15 transition-colors">
                      <Icon className="w-4.5 h-4.5 text-cyan-300" />
                    </div>
                    <div className="flex-1">
                      <div className="font-display font-bold text-slate-50 tracking-wide">{f.title}</div>
                      <div className="text-sm text-slate-400 leading-relaxed mt-1">{f.desc}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-300 transition-colors mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
