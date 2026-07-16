import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';

import QuestBoard from './QuestBoard';
import RankSystem from './RankSystem';
import StatsPanel from './StatsPanel';
import HuntersDirectory from './HuntersDirectory';
import NutritionDiary from './NutritionDiary';
import WorkoutRoutines from './WorkoutRoutines';
import { apiClient } from '../lib/api';
import { getRankByXP } from '../lib/fitness';

export default function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('stats');
  const [currentUser, setCurrentUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchUserProgress = async (userObj = currentUser) => {
    if (!userObj) return;
    try {
      setLoading(true);
      const data = await apiClient.getProgress();
      setProgress(data.progress);
      if (data.stats) {
        const updatedUser = { ...userObj, stats: data.stats };
        setCurrentUser(updatedUser);
        window.localStorage.setItem('arise-current-user', JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error('Failed to load user progress:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Dashboard // ARISE Protocol';
    const user = JSON.parse(window.localStorage.getItem('arise-current-user') || 'null');
    if (!user) {
      navigate('/login', { replace: true });
    } else {
      setCurrentUser(user);
      fetchUserProgress(user);
    }
  }, [navigate]);

  const handleLogout = () => {
    apiClient.logout();
    toast({
      title: '[LOGOUT]',
      description: 'You have exited the system. Good luck, hunter.',
    });
    navigate('/');
  };

  const tabs = [
    { id: 'stats', label: 'Overview' },
    { id: 'workout-quests', label: 'Workout Quests' },
    { id: 'food-quests', label: 'Food Quests' },
    { id: 'rank', label: 'Rank' },
    { id: 'hunters', label: 'Hunters' },
  ];

  const renderContent = () => {
    if (!currentUser) return null;
    if (loading && !progress) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="font-mono text-cyan-400 text-sm tracking-widest animate-pulse">// RECONSTRUCTING VESSELS...</div>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'workout-quests':
        return <WorkoutRoutines progressive currentUser={currentUser} progress={progress} onRefreshProgress={fetchUserProgress} />;
      case 'food-quests':
        return <NutritionDiary progressive currentUser={currentUser} progress={progress} onRefreshProgress={fetchUserProgress} />;
      case 'rank': {
        const rankInfo = progress ? getRankByXP(progress.xp, progress.completedQuestIds?.length || 0) : { rank: 'E' };
        return <RankSystem initialRank={rankInfo.rank} />;
      }
      case 'stats':
        return <StatsPanel currentUser={currentUser} progress={progress} />;
      case 'hunters':
        return <HuntersDirectory />;
      default:
        return <StatsPanel currentUser={currentUser} progress={progress} />;
    }
  };

  if (!currentUser) return null;

  // Animation variants
  const menuVariants = {
    closed: { opacity: 0, y: '-100%', transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] } },
    open: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] } }
  };

  const linkContainerVariants = {
    closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
    open: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
  };

  const linkVariants = {
    closed: { opacity: 0, y: 50 },
    open: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans">
      
      {/* Sleek Minimalist Top Nav */}
      <header className="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-6 md:px-12 z-50 mix-blend-difference text-white pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto cursor-pointer" onClick={() => {setActiveTab('stats'); setMenuOpen(false);}}>
          <Shield className="w-6 h-6" />
          <span className="font-display font-black tracking-[0.2em] text-xl hidden sm:block">ARISE</span>
        </div>
        
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="relative w-12 h-12 flex flex-col items-center justify-center gap-2 pointer-events-auto z-[60] group"
        >
          <motion.div 
            animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 10 : 0 }} 
            className="w-8 h-[2px] bg-white group-hover:bg-cyan-300 transition-colors"
          />
          <motion.div 
            animate={{ opacity: menuOpen ? 0 : 1 }} 
            className="w-8 h-[2px] bg-white group-hover:bg-cyan-300 transition-colors"
          />
          <motion.div 
            animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -10 : 0 }} 
            className="w-8 h-[2px] bg-white group-hover:bg-cyan-300 transition-colors"
          />
        </button>
      </header>

      {/* Full-Screen Animated Hamburger Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-40 flex flex-col justify-center px-6 md:px-24"
          >
            <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] aura-cyan blur-[120px] opacity-10 pointer-events-none" />
            
            <motion.nav 
              variants={linkContainerVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="flex flex-col gap-6 md:gap-8 relative z-10"
            >
              <div className="font-mono text-xs text-cyan-400 tracking-[0.4em] mb-4">// SYSTEM DIRECTORY</div>
              
              {tabs.map((tab, i) => (
                <motion.button
                  key={tab.id}
                  variants={linkVariants}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMenuOpen(false);
                  }}
                  className="group flex items-center text-left w-max"
                >
                  <span className="font-mono text-sm text-slate-500 mr-6 md:mr-10 opacity-50 group-hover:opacity-100 transition-opacity">0{i + 1}</span>
                  <span className="font-display font-black text-6xl md:text-8xl tracking-widest text-transparent transition-all duration-500" 
                        style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>
                    <span className={`relative ${activeTab === tab.id ? 'text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]' : 'group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]'}`}>
                      {tab.label.toUpperCase()}
                    </span>
                  </span>
                </motion.button>
              ))}
            </motion.nav>

            <motion.div 
              variants={linkVariants}
              className="absolute bottom-12 left-6 md:left-24 right-6 md:right-24 flex justify-between items-end border-t border-white/10 pt-8"
            >
              <div>
                <div className="font-mono text-[10px] text-slate-500 tracking-widest mb-1">HUNTER LOGGED IN</div>
                <div className="font-display text-xl text-white tracking-widest">{currentUser.name.toUpperCase()}</div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="group flex items-center gap-3 font-mono text-xs tracking-widest text-red-500 hover:text-red-400 transition-colors"
              >
                <span className="hidden sm:inline">TERMINATE SESSION</span>
                <div className="w-10 h-10 border border-red-500/30 bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                  <LogOut className="w-4 h-4" />
                </div>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 relative bg-black pt-20">
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full min-h-screen"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
