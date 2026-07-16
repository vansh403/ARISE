import React from 'react';
import { motion } from 'framer-motion';
import { X, RefreshCw, Plane } from 'lucide-react';

export default function WorkoutGenerator({ onClose }) {
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[100] bg-[#0f0f13] flex flex-col font-sans overflow-hidden"
    >
      <div className="p-4 flex items-center justify-between border-b border-slate-800">
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <h2 className="font-display font-bold text-2xl text-white mb-6">Generate Workout</h2>

        <div className="space-y-4 mb-8">
          <button className="w-full bg-[#1c1c24] border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 flex items-center justify-between group transition-colors">
            <span className="font-display text-lg text-slate-200 group-hover:text-cyan-300">Generate new workout</span>
            <div className="w-12 h-12 flex items-center justify-center">
              <RefreshCw className="w-10 h-10 text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
            </div>
          </button>

          <button className="w-full bg-[#1c1c24] border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 flex items-center justify-between group transition-colors">
            <span className="font-display text-lg text-slate-200 group-hover:text-cyan-300">Target Muscle Group</span>
            <div className="text-4xl group-hover:scale-110 transition-transform">
              💪
            </div>
          </button>
        </div>

        <h3 className="font-display font-bold text-xl text-white mb-4">Quick Generation</h3>
        
        <div className="grid grid-cols-2 gap-4">
          
          <button className="bg-[#1c1c24] border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 flex flex-col justify-between aspect-[4/3] group transition-colors text-left">
            <span className="font-display text-sm text-slate-200 group-hover:text-cyan-300">At Home</span>
            <div className="text-4xl self-end group-hover:scale-110 transition-transform">🏠</div>
          </button>

          <button className="bg-[#1c1c24] border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 flex flex-col justify-between aspect-[4/3] group transition-colors text-left">
            <span className="font-display text-sm text-slate-200 group-hover:text-cyan-300">Gym</span>
            <div className="text-4xl self-end group-hover:scale-110 transition-transform">🏢</div>
          </button>

          <button className="bg-[#1c1c24] border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 flex flex-col justify-between aspect-[4/3] group transition-colors text-left">
            <span className="font-display text-sm text-slate-200 group-hover:text-cyan-300">Cardio</span>
            <div className="text-4xl self-end group-hover:scale-110 transition-transform">🏃</div>
          </button>

          <button className="bg-[#1c1c24] border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 flex flex-col justify-between aspect-[4/3] group transition-colors text-left">
            <span className="font-display text-sm text-slate-200 group-hover:text-cyan-300">Travel</span>
            <div className="self-end text-blue-400 group-hover:scale-110 transition-transform">
              <Plane className="w-10 h-10" />
            </div>
          </button>

          <button className="bg-[#1c1c24] border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 flex flex-col justify-between aspect-[4/3] group transition-colors text-left">
            <span className="font-display text-sm text-slate-200 group-hover:text-cyan-300">Bodyweight</span>
            <div className="text-4xl self-end group-hover:scale-110 transition-transform">🤸</div>
          </button>

          <button className="bg-[#1c1c24] border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 flex flex-col justify-between aspect-[4/3] group transition-colors text-left">
            <span className="font-display text-sm text-slate-200 group-hover:text-cyan-300">Dumbbells Only</span>
            <div className="text-4xl self-end group-hover:scale-110 transition-transform">🏋️</div>
          </button>

        </div>
      </div>
    </motion.div>
  );
}
