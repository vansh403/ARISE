import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IMAGES } from '../mock';
import { Button } from './ui/button';
import { ArrowRight, Zap, Sparkles } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export default function SpotlightHero() {
  const wrapRef = useRef(null);
  const [pos, setPos] = useState({ x: 0.5, y: 0.5, active: false });
  const [radius, setRadius] = useState(230);
  const { toast } = useToast();

  const handleMove = useCallback((e) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    setPos({ x, y, active: true });
  }, []);

  const handleLeave = useCallback(() => {
    setPos((p) => ({ ...p, active: false }));
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onResize = () => {
      const w = el.getBoundingClientRect().width;
      setRadius(Math.max(180, Math.min(300, w * 0.2)));
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const style = {
    '--x': `${pos.x * 100}%`,
    '--y': `${pos.y * 100}%`,
    '--r': `${radius}px`,
  };

  return (
    <section className="relative w-full overflow-hidden bg-black">
      {/* grid backdrop */}
      <div className="absolute inset-0 grid-bg opacity-70" />
      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] aura-cyan blur-3xl opacity-40" />
      <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] aura-red blur-3xl opacity-30" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-28 pb-24 grid lg:grid-cols-12 gap-10 items-center">
        {/* Left copy */}
        <div className="lg:col-span-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-cyan-400/30 bg-cyan-400/5 text-cyan-300 text-xs font-mono uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            System · Notification
          </div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] text-slate-50">
            <span className="block">YOU HAVE</span>
            <span className="block">
              <span className="text-cyan-300" style={{ textShadow: '0 0 24px rgba(34,211,238,0.55)' }}>BEEN CHOSEN</span>
            </span>
            <span className="block text-slate-300">TO LEVEL UP.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-md leading-relaxed">
            A ranked training protocol inspired by the hunter system. Complete quests, break through gates, and ascend from <span className="text-slate-200">E-Rank</span> to <span className="text-red-400">Shadow Monarch</span>.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              onClick={() => toast({ title: '[SYSTEM]', description: 'Awakening sequence initiated. Prepare yourself, Hunter.' })}
              className="h-12 px-6 bg-cyan-400 text-black hover:bg-cyan-300 font-display font-bold tracking-wider rounded-none">
              ACCEPT QUEST <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="h-12 px-6 border-red-500/60 text-red-300 hover:bg-red-500/10 hover:text-red-200 font-display font-bold tracking-wider rounded-none bg-transparent">
              VIEW STATS
            </Button>
          </div>

          {/* mini stats */}
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            {[{k:'HUNTERS',v:'128,402'},{k:'QUESTS/DAY',v:'9.4K'},{k:'S-RANKS',v:'217'}].map((s)=>(
              <div key={s.k} className="bracket-corners p-3 bg-slate-950/60">
                <div className="text-[10px] font-mono text-cyan-300/80 tracking-widest">{s.k}</div>
                <div className="font-display text-xl text-slate-50 mt-0.5">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right spotlight reveal */}
        <div className="lg:col-span-7 relative z-10">
          <div
            ref={wrapRef}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            onMouseEnter={handleMove}
            onTouchMove={handleMove}
            onTouchEnd={handleLeave}
            className="spotlight-wrap relative aspect-[3/4] w-full max-w-[980px] mx-auto bracket-corners bg-black"
            style={style}
          >
            <div className="spotlight-base" style={{ backgroundImage: `url(${IMAGES.BG_IMAGE_1})` }} />
            <div className="spotlight-reveal" style={{ backgroundImage: `url(${IMAGES.BG_IMAGE_2})` }} />
            {/* ring overlay */}
            <div
              className="spotlight-ring"
              style={{ opacity: pos.active ? 1 : 0, width: radius * 2, height: radius * 2 }}
            />
            {/* corner HUD */}
            <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
              <div className="w-2 h-2 bg-red-500 rounded-full flicker" />
              <span className="font-mono text-[10px] tracking-widest text-red-300">REC · SCAN MODE</span>
            </div>
            <div className="absolute top-3 right-3 z-10">
              <span className="font-mono text-[10px] tracking-widest text-cyan-300">SUBJECT · 0117</span>
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10">
              <div className="font-mono text-[10px] text-slate-400 tracking-widest">HOVER · REVEAL POTENTIAL</div>
              <div className="font-mono text-[10px] text-slate-400 tracking-widest">CH · 01 / 06</div>
            </div>
            {/* scanline gradient */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
          </div>
          <div className="mt-4 flex items-center gap-2 justify-center text-slate-500 text-xs font-mono tracking-widest">
            <Zap className="w-3.5 h-3.5 text-cyan-300" /> MOVE YOUR CURSOR TO REVEAL THE HUNTER WITHIN
          </div>
        </div>
      </div>
    </section>
  );
}
