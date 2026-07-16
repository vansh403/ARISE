import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Crown, Shield, Activity, Users } from 'lucide-react';
import { RANKS } from '../mock';
import { apiClient } from '../lib/api';

export default function HuntersDirectory() {
  const [hunters, setHunters] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchHunters = async () => {
      try {
        const data = await apiClient.getHunters();
        setHunters(data);
      } catch (e) {
        console.error('Failed to fetch hunters:', e);
      }
    };
    fetchHunters();
  }, []);

  const filteredHunters = hunters.filter(h => h.name.toLowerCase().includes(search.toLowerCase()));
  const getRankColor = (tier) => RANKS.find((r) => r.id === tier)?.color || '#94a3b8';

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 md:py-20 relative">
      <div className="mb-12 relative z-10">
        <div className="font-mono text-xs text-cyan-300 tracking-[0.3em] mb-3">// GUILD DIRECTORY</div>
        <h2 className="font-display text-4xl md:text-5xl font-black text-slate-50 leading-tight">
          REGISTERED <span className="text-cyan-300">HUNTERS</span>
        </h2>
        <p className="mt-3 text-slate-400 max-w-xl">The global registry of awakened individuals. Track rivals, form guilds.</p>
      </div>

      {/* Search & Filter Bento Box */}
      <div className="bg-slate-950/40 backdrop-blur-xl border border-white/5 p-6 mb-10 relative group overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by hunter name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-14 bg-black/50 border border-slate-800 text-slate-100 pl-12 pr-4 focus:outline-none focus:border-cyan-400 transition-colors font-display tracking-widest placeholder:text-slate-600"
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="h-14 px-6 bg-black/50 border border-slate-800 flex items-center justify-center gap-3 w-full md:w-auto whitespace-nowrap">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-xs tracking-widest text-slate-300">ACTIVE: {hunters.filter(h => h.status === 'Online').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hunters Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {filteredHunters.map((hunter, i) => {
          const color = getRankColor(hunter.tier);
          const isS = hunter.tier === 'S';
          return (
            <motion.div
              key={hunter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`group relative p-6 bg-slate-950/40 backdrop-blur-xl border border-white/5 hover:border-cyan-500/30 transition-all duration-300 overflow-hidden shadow-xl hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] ${isS ? 'border-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]' : ''}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-500" style={{ background: color }} />
              
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-black/50 border flex items-center justify-center shadow-inner" style={{ borderColor: `${color}40` }}>
                    <span className="font-display font-black text-2xl" style={{ color }}>{hunter.tier}</span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-slate-100 group-hover:text-white transition-colors">{hunter.name}</h3>
                    <div className="font-mono text-[10px] text-slate-500 tracking-widest flex items-center gap-2 mt-1">
                      LEVEL {hunter.level} 
                      {hunter.isLocal && <span className="bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 ml-2 border border-cyan-500/30">YOU</span>}
                    </div>
                  </div>
                </div>
                
                {hunter.rank !== '-' && (
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-[10px] text-slate-500 tracking-widest">GLOBAL RANK</span>
                    <span className="font-display text-lg text-white">#{hunter.rank}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${hunter.status === 'Online' ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-orange-400 shadow-[0_0_8px_#fb923c]'}`} />
                  <span className="font-mono text-[10px] text-slate-400 tracking-widest uppercase">{hunter.status}</span>
                </div>
                <div className="font-mono text-[10px] text-slate-500 tracking-widest flex items-center gap-1 group-hover:text-cyan-400 transition-colors cursor-pointer">
                  <Activity className="w-3 h-3" /> VIEW STATS
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
