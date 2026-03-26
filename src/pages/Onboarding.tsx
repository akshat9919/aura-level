import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Zap, Flame, ChevronRight, User, Target, Activity } from 'lucide-react';
import { ClassType } from '../types';
import Logo from '../components/Logo';

const Onboarding: React.FC = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: 25,
    height: 175,
    weight: 70,
    bodyFat: 15,
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    class: 'Fighter' as ClassType,
    goal: 'Muscle Gain',
  });

  const handleNext = () => setStep(prev => prev + 1);

  const finishOnboarding = async () => {
    if (!user) return;

    const profile = {
      uid: user.uid,
      displayName: user.displayName || 'Player',
      email: user.email || '',
      ...formData,
      level: 1,
      xp: 0,
      rank: 'E',
      stats: {
        strength: formData.class === 'Fighter' ? 15 : 10,
        agility: formData.class === 'Assassin' ? 15 : 10,
        sense: 10,
        vitality: formData.class === 'Tanker' ? 15 : 10,
      },
      streak: 0,
      mana: 100,
      auraDensity: 1.0,
      manaCore: 1.0,
      personality: 'humble' as const,
      units: 'metric' as const,
    };

    try {
      await setDoc(doc(db, 'users', user.uid), profile);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center space-y-8 max-w-sm"
          >
            <Logo className="w-32 h-32 mx-auto" />
            <div className="space-y-2">
              <h1 className="text-3xl font-black glow-text tracking-tighter uppercase">AuraLevel</h1>
              <p className="text-accent font-bold uppercase tracking-[0.2em] text-xs">Shadow Monarch Edition</p>
            </div>
            <div className="system-window py-10 px-8">
              <p className="text-lg font-medium italic mb-8">“Do you wish to survive the Red Gate?”</p>
              <button 
                onClick={handleNext}
                className="system-button w-full"
              >
                [ACCEPT QUEST]
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-sm space-y-6"
          >
            <div className="flex items-center gap-2 mb-8">
              <User className="text-accent w-5 h-5" />
              <h2 className="text-sm font-black uppercase tracking-widest">Physical Data</h2>
            </div>
            
            <div className="space-y-4">
              <div className="system-window">
                <label className="text-[10px] text-text-secondary uppercase font-bold tracking-widest block mb-2">Gender</label>
                <div className="flex gap-2">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setFormData({ ...formData, gender: g as any })}
                      className={`flex-1 py-2 text-xs font-black uppercase tracking-widest border border-white/10 rounded-sm transition-all ${formData.gender === g ? 'bg-accent text-black border-accent' : 'bg-white/5 hover:bg-white/10'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="system-window">
                <label className="text-[10px] text-text-secondary uppercase font-bold tracking-widest block mb-2">Age</label>
                <input 
                  type="number" 
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  className="w-full bg-transparent text-2xl font-black focus:outline-none text-accent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="system-window">
                  <label className="text-[10px] text-text-secondary uppercase font-bold tracking-widest block mb-2">Height (cm)</label>
                  <input 
                    type="number" 
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                    className="w-full bg-transparent text-2xl font-black focus:outline-none text-accent"
                  />
                </div>
                <div className="system-window">
                  <label className="text-[10px] text-text-secondary uppercase font-bold tracking-widest block mb-2">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                    className="w-full bg-transparent text-2xl font-black focus:outline-none text-accent"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleNext}
              className="system-button w-full flex items-center justify-center gap-2"
            >
              [NEXT] <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-sm space-y-6"
          >
            <div className="flex items-center gap-2 mb-8">
              <Shield className="text-accent w-5 h-5" />
              <h2 className="text-sm font-black uppercase tracking-widest">Select Class</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {(['Fighter', 'Assassin', 'Tanker'] as ClassType[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setFormData({ ...formData, class: c })}
                  className={`system-window text-left p-6 transition-all ${formData.class === c ? 'border-accent bg-accent/10' : 'hover:border-accent/40'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-wider">{c}</h3>
                      <p className="text-xs text-text-secondary mt-1">
                        {c === 'Fighter' && 'Balanced strength and vitality.'}
                        {c === 'Assassin' && 'High agility and precision.'}
                        {c === 'Tanker' && 'Maximum durability and defense.'}
                      </p>
                    </div>
                    {formData.class === c && <Zap className="text-accent w-6 h-6 animate-pulse" />}
                  </div>
                </button>
              ))}
            </div>

            <button 
              onClick={finishOnboarding}
              className="system-button w-full"
            >
              [AWAKEN]
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
