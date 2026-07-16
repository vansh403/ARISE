import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreHorizontal, BookMarked, PieChart, Check, Zap, Flame, Droplets, Search, X } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import { buildNutritionTargets, buildNutritionQuests } from './QuestBoard';
import { RANKS } from '../mock';

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
    if (!activeModalMeal) return;
    try {
      const updatedDiary = await apiClient.addFood(null, activeModalMeal, food);
      setFoodLog(updatedDiary);
      toast({ title: '[SYSTEM]', description: `Added ${food.name} to ${activeModalMeal}.` });
      setActiveModalMeal(null);
    } catch (e) {
      toast({ title: '[SYSTEM ERROR]', description: 'Failed to log food.' });
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

  const filteredFoods = useMemo(() => {
    if (!searchQuery) return MOCK_FOOD_DB;
    return MOCK_FOOD_DB.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

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
            <div className="py-4 px-4 flex items-center gap-3 border-b border-slate-800/50">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <Flame size={20} />
              </div>
              <div>
                <div className="text-sm font-display text-slate-200">Connect a step tracker</div>
                <div className="text-xs text-slate-500 font-mono">Automatically track steps and calories burned</div>
              </div>
            </div>
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
        <div className="mt-8 flex gap-4">
          <Button variant="outline" className="flex-1 bg-slate-900 border-slate-700 hover:bg-slate-800 h-14 rounded-none">
            <PieChart className="w-4 h-4 mr-2" /> Nutrition
          </Button>
          <Button variant="outline" className="flex-1 bg-slate-900 border-slate-700 hover:bg-slate-800 h-14 rounded-none">
            <BookMarked className="w-4 h-4 mr-2" /> Notes
          </Button>
        </div>

        <Button className="w-full mt-4 h-14 bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold tracking-widest text-lg rounded-none transition-all">
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
                {filteredFoods.length > 0 ? (
                  filteredFoods.map(food => (
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
    </>
  );
}
