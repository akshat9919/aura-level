import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Droplets, Utensils, Zap, Flame, Plus, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { generateMealPlan } from '../services/aiService';
import { saveMealPlan, getLatestMealPlan } from '../services/nutritionService';
import { MealPlan } from '../types';

const Nutrition: React.FC = () => {
  const { profile } = useAuth();
  const [water, setWater] = useState(1.5);
  const [calories, setCalories] = useState(1850);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.uid) {
      fetchLatestMealPlan();
    }
  }, [profile?.uid]);

  const fetchLatestMealPlan = async () => {
    if (!profile?.uid) return;
    const plan = await getLatestMealPlan(profile.uid);
    setMealPlan(plan);
  };

  const handleGenerateMealPlan = async () => {
    if (!profile || loading) return;
    setLoading(true);
    try {
      const plan = await generateMealPlan(profile);
      await saveMealPlan(plan);
      setMealPlan(plan);
    } catch (error) {
      console.error("Meal Plan Generation Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  const data = [
    { name: 'Protein', value: 150, color: '#00D1FF' },
    { name: 'Carbs', value: 200, color: '#FFFFFF' },
    { name: 'Fats', value: 60, color: '#888888' },
  ];

  const addWater = () => setWater(prev => Math.min(prev + 0.25, 4));

  return (
    <div className="space-y-6">
      {/* Calorie Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="system-window"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Flame className="text-orange-500 w-5 h-5" />
            <h3 className="text-sm font-black uppercase tracking-widest">Mana Core Energy</h3>
          </div>
          <p className="text-xs text-text-secondary uppercase font-bold tracking-widest">TDEE: 2400</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={35}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold uppercase tracking-widest text-accent">Protein</p>
              <p className="text-xs font-bold">150g / 180g</p>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-accent w-[83%]" />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold uppercase tracking-widest text-white">Carbs</p>
              <p className="text-xs font-bold">200g / 250g</p>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white w-[80%]" />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Fats</p>
              <p className="text-xs font-bold">60g / 70g</p>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-text-secondary w-[85%]" />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-accent/10 flex justify-between items-center">
          <div>
            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Remaining Energy</p>
            <p className="text-xl font-black glow-text italic tracking-tighter">550 KCAL</p>
          </div>
          <button className="system-button p-2 min-w-0">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Hydration Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="system-window"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Droplets className="text-accent w-5 h-5" />
            <h3 className="text-sm font-black uppercase tracking-widest italic">Mana Bar</h3>
          </div>
          <p className="text-xs font-black text-accent">{water.toFixed(1)}L <span className="text-text-secondary">/ 3.0L</span></p>
        </div>
        
        <div className="flex gap-1.5 mb-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 h-10 rounded-sm border border-accent/10 transition-all duration-500 ${i < (water / 0.25) ? 'bg-accent shadow-[0_0_15px_rgba(0,209,255,0.4)]' : 'bg-white/5'}`}
            />
          ))}
        </div>

        <button 
          onClick={addWater}
          className="system-button w-full py-3 flex items-center justify-center gap-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          [CONSUME MANA]
        </button>
      </motion.div>

      {/* Diet Plan Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="system-window"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Zap className="text-accent w-5 h-5" />
            <h3 className="text-sm font-black uppercase tracking-widest italic">Oracle's Diet Plan</h3>
          </div>
          <button 
            onClick={handleGenerateMealPlan}
            disabled={loading}
            className="system-button py-1.5 px-3 min-w-0 flex items-center gap-2 text-[10px]"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            [REGENERATE]
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mealPlan ? (
            <motion.div 
              key="meal-plan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[
                { type: 'Breakfast', meal: mealPlan.breakfast },
                { type: 'Lunch', meal: mealPlan.lunch },
                { type: 'Dinner', meal: mealPlan.dinner },
                ...mealPlan.snacks.map((s, i) => ({ type: `Snack ${i + 1}`, meal: s }))
              ].map((item, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-accent/30 transition-colors group">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest">{item.type} Quest</p>
                    <p className="text-[10px] text-text-secondary font-bold">{item.meal.calories} KCAL</p>
                  </div>
                  <p className="text-sm font-black uppercase italic tracking-tighter mb-1">{item.meal.name}</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{item.meal.description}</p>
                  <div className="mt-3 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-[8px] uppercase font-bold text-accent">P: {item.meal.protein}g</div>
                    <div className="text-[8px] uppercase font-bold text-white">C: {item.meal.carbs}g</div>
                    <div className="text-[8px] uppercase font-bold text-text-secondary">F: {item.meal.fats}g</div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="no-plan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 flex flex-col items-center justify-center text-center"
            >
              <Utensils className="w-12 h-12 text-accent/20 mb-4" />
              <p className="text-sm text-text-secondary mb-6">The Oracle has not yet provided a nutritional path for today.</p>
              <button 
                onClick={handleGenerateMealPlan}
                disabled={loading}
                className="system-button py-3 px-8"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                [CONSULT ORACLE]
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Nutrition;
