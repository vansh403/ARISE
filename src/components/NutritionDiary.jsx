import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreHorizontal, BookMarked, PieChart, Check, Zap, Flame, Droplets, Search, X } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import { buildNutritionTargets, buildNutritionQuests } from './QuestBoard';
import { RANKS } from '../mock';
import { apiClient } from '../lib/api';

const rankColor = (id) => RANKS.find((r) => r.id === id)?.color || '#22d3ee';

const MOCK_FOOD_DB = [
  { id: 'f1', name: 'Chicken Breast (Grilled)', amount: '100g', calories: 165, protein: 31, carbs: 0 },
  { id: 'f2', name: 'White Rice (Cooked)', amount: '1 cup', calories: 205, protein: 4, carbs: 45 },
  { id: 'f3', name: 'Whole Egg (Large)', amount: '1 egg', calories: 72, protein: 6, carbs: 0 },
  { id: 'f4', name: 'Oatmeal', amount: '1 cup cooked', calories: 158, protein: 6, carbs: 27 },
  { id: 'f5', name: 'Whey Protein Shake', amount: '1 scoop', calories: 120, protein: 24, carbs: 3 },
  { id: 'f6', name: 'Avocado', amount: '1/2 medium', calories: 120, protein: 1, carbs: 6 },
  { id: 'f7', name: 'Salmon (Baked)', amount: '100g', calories: 206, protein: 22, carbs: 0 },
  { id: 'f8', name: 'Sweet Potato', amount: '1 medium', calories: 103, protein: 2, carbs: 24 },
  { id: 'f9', name: 'Broccoli', amount: '1 cup', calories: 31, protein: 3, carbs: 6 },
  { id: 'f10', name: 'Almonds', amount: '1 oz', calories: 164, protein: 6, carbs: 6 },
  { id: 'f11', name: 'Greek Yogurt (Plain, 0%)', amount: '1 cup', calories: 100, protein: 17, carbs: 6 },
  { id: 'f12', name: 'Banana', amount: '1 medium', calories: 105, protein: 1, carbs: 27 },
  { id: 'f13', name: 'Peanut Butter', amount: '2 tbsp', calories: 188, protein: 8, carbs: 6 },
];

export default function NutritionDiary({ currentUser, progressive = false, progress = null, onRefreshProgress = null }) {
  const { toast } = useToast();
  
  const completed = useMemo(() => {
    return new Set(progress?.completedQuestIds || []);
  }, [progress]);

  const targets = buildNutritionTargets(currentUser?.stats);
  const quests = buildNutritionQuests(targets);
  
  const [foodLog, setFoodLog] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
    exercise: 0,
    water: 0,
  });

  const fetchNutritionDiary = async () => {
    try {
      const data = await apiClient.getNutrition();
      setFoodLog(data);
    } catch (e) {
      console.error('Failed to fetch nutrition diary:', e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchNutritionDiary();
    }
  }, [currentUser]);

  const [activeModalMeal, setActiveModalMeal] = useState(null); // 'breakfast', 'lunch', etc.
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const totalProtein = useMemo(() => {
    const calc = (meal) => (foodLog[meal] || []).reduce((acc, food) => acc + (food.protein || 0), 0);
    return calc('breakfast') + calc('lunch') + calc('dinner') + calc('snacks');
  }, [foodLog]);

  const totalCarbs = useMemo(() => {
    const calc = (meal) => (foodLog[meal] || []).reduce((acc, food) => acc + (food.carbs || 0), 0);
    return calc('breakfast') + calc('lunch') + calc('dinner') + calc('snacks');
  }, [foodLog]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await apiClient.searchFood(searchQuery);
        setSearchResults(data);
      } catch (e) {
        console.error('Failed to search food', e);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const calcMealCalories = (mealArray) => mealArray.reduce((acc, food) => acc + food.calories, 0);

  const breakfastCals = calcMealCalories(foodLog.breakfast || []);
  const lunchCals = calcMealCalories(foodLog.lunch || []);
  const dinnerCals = calcMealCalories(foodLog.dinner || []);
  const snacksCals = calcMealCalories(foodLog.snacks || []);

  const totalFood = breakfastCals + lunchCals + dinnerCals + snacksCals;
  const remaining = targets.calories - totalFood + (foodLog.exercise || 0);

  const handleAddExercise = async () => {
    try {
      const updatedDiary = await apiClient.addExercise(null, 150);
      setFoodLog(updatedDiary);
      toast({ title: '[SYSTEM]', description: `Added 150 calories burned.` });
    } catch (e) {
      toast({ title: '[SYSTEM ERROR]', description: 'Failed to log exercise.' });
    }
  };

  const handleAddWater = async () => {
    try {
      const updatedDiary = await apiClient.addWater(null, 250);
      setFoodLog(updatedDiary);
      toast({ title: '[SYSTEM]', description: `Logged 250ml water.` });
    } catch (e) {
      toast({ title: '[SYSTEM ERROR]', description: 'Failed to log water.' });
    }
  };

  const handleAddFoodClick = (meal) => {
    setActiveModalMeal(meal);
    setSearchQuery('');
  };

  const addSpecificFood = async (food) => {
    try {
      const updatedDiary = await apiClient.addFood(null, activeModalMeal, food);
      setFoodLog(updatedDiary);
      toast({ title: '[SYSTEM]', description: `Added ${food.name} to ${activeModalMeal}.` });
      setActiveModalMeal(null);
    } catch (e) {
      toast({ title: '[SYSTEM ERROR]', description: 'Failed to log food.' });
    }
  };

  const handleCompleteDiary = async () => {
    try {
      await apiClient.completeQuest('nutrition-calories', 150);
      toast({
        title: '[DIARY COMPLETED]',
        description: 'Daily nutritional log saved. Earned +150 XP!'
      });
      setShowCompleteModal(true);
      if (onRefreshProgress) {
        onRefreshProgress();
      }
    } catch (e) {
      toast({
        title: '[SYSTEM ERROR]',
        description: 'Failed to complete diary.'
      });
    }
  };

  const downloadPDFReport = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Brand Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(34, 211, 238); // Cyan
      doc.text("ARISE PROTOCOL - DAILY NUTRITION REPORT", 14, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 27);
      doc.text(`Hunter Profile: ${currentUser?.name || 'Verified Hunter'}`, 14, 32);

      // Separator Line
      doc.setDrawColor(203, 213, 225);
      doc.line(14, 37, 196, 37);

      // Summary Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text("Daily Protocol Summary:", 14, 46);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`• Total Energy Intake: ${totalFood} kcal / ${targets.calories} kcal`, 16, 54);
      doc.text(`• Total Protein Intake: ${totalProtein}g / ${targets.protein}g`, 16, 61);
      doc.text(`• Total Carbohydrates: ${totalCarbs}g / ${targets.carbs}g`, 16, 68);
      doc.text(`• Total Hydration: ${foodLog.water}ml / ${targets.water * 1000}ml`, 16, 75);

      doc.line(14, 82, 196, 82);

      // Meal Breakdown
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Registered Food Logs:", 14, 91);

      let y = 100;
      const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];
      meals.forEach(meal => {
        const items = foodLog[meal] || [];
        if (items.length > 0) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(30, 41, 59);
          doc.text(`${meal.toUpperCase()}:`, 14, y);
          y += 6;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(71, 85, 105);
          items.forEach(item => {
            doc.text(`- ${item.name} (${item.amount}): ${item.calories} kcal | P: ${item.protein || 0}g | C: ${item.carbs || 0}g`, 18, y);
            y += 6;
            if (y > 280) {
              doc.addPage();
              y = 20;
            }
          });
          y += 4;
        }
      });

      if (y < 250) {
        y = 250;
      } else {
        doc.addPage();
        y = 20;
      }

      doc.setDrawColor(203, 213, 225);
      doc.line(14, y, 196, y);
      y += 10;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text("// PROTOCOL FINALIZED. SYSTEM SYNCHRONIZATION COMPLETE.", 14, y);

      doc.save(`arise-nutrition-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      toast({ title: '[ERROR]', description: 'Failed to generate PDF document.' });
    }
  };

  const handleCompleteQuest = async (questId, xp) => {
    if (!progressive || !currentUser) {
      toast({ title: '[SYSTEM]', description: 'Logged in user required to earn XP.' });
      return;
    }
    try {
      await apiClient.completeQuest(questId, xp);
      toast({ title: '[QUEST CLEARED]', description: `Quest completed. Earned ${xp} XP.` });
      if (onRefreshProgress) {
        onRefreshProgress();
      }
    } catch {
      toast({ title: 'Error saving progress' });
    }
  };

  const displayFoods = searchQuery ? searchResults : MOCK_FOOD_DB;

  const SectionHeader = ({ title, value }) => (
    <div className="flex justify-between items-center py-3 px-4 border-b border-slate-800">
      <h3 className="font-display font-bold text-lg text-slate-100">{title}</h3>
      <span className="font-mono text-slate-300">{value}</span>
    </div>
  );

  const AddAction = ({ label, onClick }) => (
    <div className="flex justify-between items-center py-3 px-4 bg-black/20 hover:bg-black/40 transition-colors cursor-pointer group" onClick={onClick}>
      <button className="font-mono text-xs text-cyan-400 group-hover:text-cyan-300 transition-colors uppercase tracking-widest flex items-center gap-1">
        ADD {label}
      </button>
      <button className="text-slate-500 group-hover:text-cyan-400 transition-colors"><Plus size={18} /></button>
    </div>
  );

  const renderMealList = (mealKey) => {
    const items = foodLog[mealKey];
    if (items.length === 0) return null;
    return (
      <div className="border-b border-slate-800/50">
        {items.map(item => (
          <div key={item.logId} className="py-3 px-4 flex justify-between items-center bg-slate-900/40">
            <div>
              <div className="text-sm font-display text-slate-200">{item.name}</div>
              <div className="text-xs text-slate-500 font-mono">{item.amount} • {item.protein}g Pro • {item.carbs}g Carbs</div>
            </div>
            <div className="font-mono text-sm text-slate-300">{item.calories}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <section className="relative w-full max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <div className="font-mono text-xs text-cyan-300 tracking-[0.3em] mb-3">// PROTOCOL 04</div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-slate-50 leading-tight mb-2">
            FOOD <span className="text-cyan-300">DIARY</span>
          </h2>
          <p className="text-slate-400">Track your daily intake. Execute your nutrition protocol.</p>
        </div>

        {/* Quests Scroll View */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-sm tracking-widest text-slate-400">ACTIVE NUTRITION QUESTS</h3>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
            {quests.map(q => {
              const isCompleted = completed.has(q.id);
              const clr = rankColor(q.rank);
              return (
                <div 
                  key={q.id} 
                  className={`snap-start flex-none w-64 p-4 border bg-slate-950/40 backdrop-blur-md transition-all ${isCompleted ? 'opacity-50 border-slate-800' : 'border-slate-800 hover:border-cyan-500/30'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-mono text-[10px] tracking-widest" style={{ color: clr }}>{q.title.toUpperCase()}</div>
                    <div className="flex items-center gap-1 text-cyan-300 font-mono text-[10px]">
                      <Zap size={10} /> +{q.xp}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-4 h-10">{q.desc}</p>
                  {isCompleted ? (
                    <div className="flex items-center justify-center gap-1 text-cyan-400 font-mono text-[10px] bg-cyan-400/10 py-2">
                      <Check size={12} /> CLEARED
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleCompleteQuest(q.id, q.xp)}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-cyan-500/50 py-2 font-mono text-[10px] text-slate-300 hover:text-cyan-300 transition-all uppercase tracking-widest"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Calories Remaining Equation */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-5 mb-6 shadow-lg backdrop-blur-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-slate-300">Calories Remaining</h3>
            <button className="text-slate-500 hover:text-slate-300"><MoreHorizontal size={18} /></button>
          </div>
          <div className="flex items-center justify-between text-center">
            <div>
              <div className="font-display font-bold text-xl text-slate-100">{targets.calories}</div>
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Goal</div>
            </div>
            <div className="font-mono text-slate-600">-</div>
            <div>
              <div className="font-display font-bold text-xl text-slate-100">{totalFood}</div>
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Food</div>
            </div>
            <div className="font-mono text-slate-600">+</div>
            <div>
              <div className="font-display font-bold text-xl text-slate-100">{foodLog.exercise}</div>
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Exercise</div>
            </div>
            <div className="font-mono text-slate-600">=</div>
            <div>
              <div className="font-display font-bold text-3xl text-cyan-400">{remaining}</div>
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Remaining</div>
            </div>
          </div>
        </div>

        {/* Diary Sections */}
        <div className="space-y-4">
          
          {/* Breakfast */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden backdrop-blur-md">
            <SectionHeader title="Breakfast" value={breakfastCals} />
            {renderMealList('breakfast')}
            <AddAction label="Food" onClick={() => handleAddFoodClick('breakfast')} />
          </div>

          {/* Lunch */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden backdrop-blur-md">
            <SectionHeader title="Lunch" value={lunchCals} />
            {renderMealList('lunch')}
            <AddAction label="Food" onClick={() => handleAddFoodClick('lunch')} />
          </div>

          {/* Dinner */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden backdrop-blur-md">
            <SectionHeader title="Dinner" value={dinnerCals} />
            {renderMealList('dinner')}
            <AddAction label="Food" onClick={() => handleAddFoodClick('dinner')} />
          </div>

          {/* Snacks */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden backdrop-blur-md">
            <SectionHeader title="Snacks" value={snacksCals} />
            {renderMealList('snacks')}
            <AddAction label="Food" onClick={() => handleAddFoodClick('snacks')} />
          </div>

          {/* Exercise */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden backdrop-blur-md">
            <SectionHeader title="Exercise" value={foodLog.exercise} />
            <AddAction label="Exercise" onClick={handleAddExercise} />
          </div>

          {/* Water */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden backdrop-blur-md">
            <SectionHeader title="Water" value={`${foodLog.water} ml`} />
            <div className="py-4 px-4 flex items-center gap-3 border-b border-slate-800/50">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Droplets size={20} />
              </div>
              <div>
                <div className="text-sm font-display text-slate-200">Water Log</div>
                <div className="text-xs text-slate-500 font-mono">Target: {targets.water * 1000} ml</div>
              </div>
            </div>
            <AddAction label="Water" onClick={handleAddWater} />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-8">
          <Button 
            onClick={() => setShowNutritionModal(true)}
            variant="outline" 
            className="w-full bg-slate-900 border-slate-700 hover:bg-slate-800 h-14 rounded-none"
          >
            <PieChart className="w-4 h-4 mr-2" /> Nutrition Summary
          </Button>
        </div>

        <Button 
          onClick={handleCompleteDiary}
          className="w-full mt-4 h-14 bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold tracking-widest text-lg rounded-none transition-all"
        >
          <BookMarked className="w-5 h-5 mr-2" />
          COMPLETE DIARY
        </Button>

      </section>

      {/* Add Food Modal */}
      <AnimatePresence>
        {activeModalMeal && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col"
          >
            <div className="p-4 border-b border-slate-800 flex items-center gap-4 bg-slate-950">
              <button onClick={() => setActiveModalMeal(null)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
              <h2 className="font-display font-bold text-xl text-white capitalize flex-1">Add to {activeModalMeal}</h2>
            </div>
            
            <div className="p-4 border-b border-slate-800 bg-slate-950/80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Search for a food..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2">
              <div className="font-mono text-[10px] text-cyan-400 tracking-widest uppercase mb-4 mt-2">// SYSTEM DATABASE</div>
              
              <div className="space-y-2">
                {searching ? (
                  <div className="text-center py-12 text-slate-500 font-mono text-sm animate-pulse">// RETRIEVING USDA DATA...</div>
                ) : displayFoods.length > 0 ? (
                  displayFoods.map(food => (
                    <div 
                      key={food.id} 
                      onClick={() => addSpecificFood(food)}
                      className="p-4 border border-slate-800 bg-slate-900/50 rounded-lg cursor-pointer hover:border-cyan-500/50 hover:bg-slate-900 transition-all flex justify-between items-center group"
                    >
                      <div>
                        <div className="font-display text-white group-hover:text-cyan-300 transition-colors">{food.name}</div>
                        <div className="font-mono text-xs text-slate-500">{food.amount} • {food.protein}g Protein • {food.carbs}g Carbs</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="font-mono text-slate-300 text-sm">{food.calories} <span className="text-[10px] text-slate-600 uppercase">kcal</span></div>
                        <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                          <Plus size={16} />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="font-display text-slate-500 text-lg mb-2">No items found</div>
                    <div className="font-mono text-xs text-slate-600">Try searching for chicken, rice, eggs, etc.</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNutritionModal && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-[#1c1c24] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden text-slate-200">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#23232d]">
                <h3 className="font-display font-bold text-lg text-white">Daily Nutrient Analysis</h3>
                <button onClick={() => setShowNutritionModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5"/>
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Calories */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-display text-slate-300">Calories</span>
                    <span className="font-mono text-sm">{totalFood} / {targets.calories} kcal</span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-cyan-500 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min((totalFood / targets.calories) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Protein */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-display text-slate-300">Protein</span>
                    <span className="font-mono text-sm">{totalProtein}g / {targets.protein}g</span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min((totalProtein / targets.protein) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Carbohydrates */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-display text-slate-300">Carbohydrates</span>
                    <span className="font-mono text-sm">{totalCarbs}g / {targets.carbs}g</span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-yellow-500 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min((totalCarbs / targets.carbs) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Water */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-display text-slate-300">Water</span>
                    <span className="font-mono text-sm">{foodLog.water}ml / {targets.water * 1000}ml</span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min((foodLog.water / (targets.water * 1000)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 bg-[#23232d] border-t border-slate-800 flex justify-end">
                <button 
                  onClick={() => setShowNutritionModal(false)}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-sm rounded-lg transition-colors"
                >
                  Close Analysis
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompleteModal && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-[#1c1c24] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden text-slate-200 animate-fade-in">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#23232d]">
                <h3 className="font-display font-bold text-lg text-white">Protocol Finalized</h3>
                <button onClick={() => setShowCompleteModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  🏆
                </div>
                <h4 className="font-display font-bold text-xl text-white mb-2">DIARY PROTOCOL CLEARED</h4>
                <p className="text-slate-400 text-sm mb-6">Your daily food and calorie logs have been successfully synced to the system.</p>
                
                <button 
                  onClick={downloadPDFReport}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold rounded-lg transition-colors flex items-center justify-center gap-2 mb-3 shadow-lg shadow-cyan-500/20"
                >
                  Download Nutrient PDF
                </button>
                <button 
                  onClick={() => setShowCompleteModal(false)}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 font-display font-bold rounded-lg transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
