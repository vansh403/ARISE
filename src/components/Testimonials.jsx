import React from 'react';
import { Link } from 'react-router-dom';
import { TESTIMONIALS, RANKS } from '../mock';
import { Quote, Flame, Zap, ArrowRight, Shield } from 'lucide-react';
import { Button } from './ui/button';

const rankColor = (id) => RANKS.find((r) => r.id === id)?.color || '#22d3ee';

export default function Testimonials() {
  return (
    <section id="hunters" className="relative bg-black py-24 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-25" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] aura-cyan blur-3xl opacity-20" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <div className="font-mono text-xs text-cyan-300 tracking-[0.3em] mb-3">// PROTOCOL 05</div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-slate-50 leading-tight">
            HUNTERS <span className="text-red-400">WHO AROSE</span>
          </h2>
          <p className="mt-3 text-slate-400">Voices from the ranks. Real hunters, real transformations.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => {
            const clr = rankColor(t.rank);
            return (
              <div key={t.name} className={`bracket-corners ${t.rank === 'S' || t.rank === 'A' ? 'bracket-corners-red' : ''} p-7 bg-gradient-to-br from-slate-950 to-black tilt`}>
                <Quote className="w-6 h-6 text-cyan-300/60 mb-4" />
                <p className="text-slate-200 text-lg leading-relaxed">“{t.quote}”</p>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 border-2 flex items-center justify-center" style={{ borderColor: clr, boxShadow: `0 0 18px ${clr}44` }}>
                      <span className="font-display text-lg font-black" style={{ color: clr }}>{t.rank}</span>
                    </div>
                    <div>
                      <div className="font-display font-bold text-slate-50">{t.name}</div>
                      <div className="font-mono text-[10px] text-slate-500 tracking-widest">{t.rank}-RANK HUNTER</div>
                    </div>
                  </div>
                  <div className="font-mono text-xs text-red-400 flex items-center gap-1"><Flame className="w-3 h-3" />{t.streak}d</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Big CTA */}
        <div className="mt-20 relative bracket-corners bracket-corners-red p-10 md:p-16 text-center bg-gradient-to-br from-slate-950 via-black to-slate-950 overflow-hidden">
          <div className="absolute inset-0 stripes opacity-40" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] aura-red blur-3xl opacity-40" />
          <div className="relative">
            <Shield className="w-10 h-10 text-red-400 mx-auto mb-6 rune-glow" />
            <h3 className="font-display text-3xl md:text-5xl font-black text-slate-50 leading-tight">
              THE GATE IS <span className="text-red-400">OPEN.</span>
            </h3>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">Awaken your hunter. Accept the first quest. There is no going back to the couch after this.</p>
            <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
              <Button
                asChild
                className="h-12 px-8 bg-red-500 hover:bg-red-400 text-white font-display tracking-widest rounded-none">
                <Link to="/signup">ARISE <Zap className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button variant="outline" className="h-12 px-8 border-cyan-400/60 text-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-200 bg-transparent font-display tracking-widest rounded-none">
                LEARN THE PROTOCOL <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
