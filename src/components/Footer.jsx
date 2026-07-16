import React from 'react';
import { Shield, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  const cols = [
    { title: 'PROTOCOL', links: ['Ranks', 'Quests', 'Gates', 'Stats'] },
    { title: 'HUNTER', links: ['Dashboard', 'Leaderboard', 'Achievements', 'Guild'] },
    { title: 'SYSTEM', links: ['About', 'Manifesto', 'Support', 'Contact'] },
  ];
  return (
    <footer className="relative bg-black border-t border-cyan-400/10">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 flex items-center justify-center border border-cyan-400/50 bg-cyan-400/10">
                <Shield className="w-4.5 h-4.5 text-cyan-300" strokeWidth={2.5} />
              </div>
              <div>
                <div className="font-display text-lg font-black text-slate-50 tracking-widest">ARISE</div>
                <div className="font-mono text-[9px] tracking-[0.25em] text-cyan-300">RANKED PROTOCOL</div>
              </div>
            </div>
            <p className="mt-5 text-slate-400 text-sm max-w-sm leading-relaxed">
              A ranked training system for hunters who refuse to stay weak. Level up in silence, and let your strength do the talking.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 flex items-center justify-center border border-slate-800 hover:border-cyan-400 hover:text-cyan-300 text-slate-500 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title} className="md:col-span-2">
              <div className="font-mono text-xs text-cyan-300 tracking-widest mb-4">// {c.title}</div>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}><a href="#" className="text-slate-400 hover:text-slate-100 text-sm transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-1">
            <div className="font-mono text-xs text-red-400 tracking-widest mb-4">// LEGAL</div>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-slate-400 hover:text-slate-100 text-sm">Terms</a></li>
              <li><a href="#" className="text-slate-400 hover:text-slate-100 text-sm">Privacy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-900 flex items-center justify-between flex-wrap gap-3">
          <div className="font-mono text-[10px] text-slate-600 tracking-widest">© 2026 ARISE PROTOCOL · ALL HUNTERS RESERVED</div>
          <div className="font-mono text-[10px] text-slate-600 tracking-widest">SYS.VER 01.04.2 · STABLE</div>
        </div>
      </div>
    </footer>
  );
}
