import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Shield, Zap, Eye, Heart, Trophy, Flame, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { userService } from '../services/userService';

import { toast } from 'sonner';

const Status: React.FC = () => {
  const [completingQuestId, setCompletingQuestId] = React.useState<string | null>(null);
  const { profile, user } = useAuth();

  if (!profile || !user) return null;

  const xpPercentage = (profile.xp / (profile.level * 1000)) * 100;
  const manaPercentage = (profile.mana / 100) * 100;

  const stats = [
    { label: 'Strength', value: profile.stats.strength, icon: Zap, color: 'text-orange-500' },
    { label: 'Agility', value: profile.stats.agility, icon: Flame, color: 'text-accent' },
    { label: 'Sense', value: profile.stats.sense, icon: Eye, color: 'text-purple-500' },
    { label: 'Vitality', value: profile.stats.vitality, icon: Heart, color: 'text-red-500' },
  ];

  const quests = [
    { 
      id: 'daily_strength', 
      title: 'Daily Training: Strength', 
      reward: '+500 XP / +1 STR',
      xp: 500,
      stats: { strength: 1 }
    },
    { 
      id: 'daily_hydration', 
      title: 'Mana Recharge: Hydration', 
      reward: '+200 XP / +1 VIT',
      xp: 200,
      stats: { vitality: 1 }
    },
  ];

  const handleQuestComplete = async (questId: string, xp: number, stats: any) => {
    if (profile.completedQuests?.includes(questId) || completingQuestId) return;
    
    setCompletingQuestId(questId);
    try {
      await userService.completeQuest(user.uid, profile, questId, xp, stats);
      toast.success('Quest Completed!', {
        description: `You gained ${xp} XP and stat points.`,
      });
    } catch (error) {
      console.error("Error completing quest:", error);
      toast.error('Failed to complete quest', {
        description: 'Please try again later.',
      });
    } finally {
      setCompletingQuestId(null);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Level & XP Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="system-window overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-1">
          <div className="w-2 h-2 border-t border-r border-accent/40" />
        </div>
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-[10px] text-accent uppercase font-bold tracking-widest mb-1">Player Status</p>
            <h2 className="text-5xl font-black glow-text italic tracking-tighter">LV. {profile.level}</h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest mb-1">Experience</p>
            <p className="text-sm font-bold tracking-tighter">{profile.xp} <span className="text-text-secondary">/ {profile.level * 1000}</span></p>
          </div>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${xpPercentage}%` }}
            className="xp-bar-fill"
          />
        </div>
      </motion.div>

      {/* Mana Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="system-window"
      >
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Shield className="text-accent w-4 h-4" />
            <p className="text-[10px] text-accent uppercase font-bold tracking-widest">Mana Core Density</p>
          </div>
          <p className="text-xs font-black text-accent">{Math.round(profile.mana)}%</p>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden border border-white/10">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${manaPercentage}%` }}
            className="mana-bar-fill"
          />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="system-window flex flex-col items-center justify-center py-8 group hover:border-accent/60 transition-colors"
          >
            <stat.icon className={`${stat.color} w-6 h-6 mb-3 group-hover:scale-110 transition-transform`} />
            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Daily Quests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="system-window"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Trophy className="text-accent w-5 h-5" />
            <h3 className="text-sm font-black uppercase tracking-widest italic">Current Quests</h3>
          </div>
          <div className="text-[10px] text-accent font-bold animate-pulse">[ACTIVE]</div>
        </div>
        <div className="space-y-4">
          {quests.map((quest) => {
            const isCompleted = profile.completedQuests?.includes(quest.id);
            const isCompleting = completingQuestId === quest.id;
            return (
              <div 
                key={quest.id}
                onClick={() => !isCompleted && !isCompleting && handleQuestComplete(quest.id, quest.xp, quest.stats)}
                className={`flex items-center gap-4 p-4 bg-white/5 rounded-lg border transition-colors cursor-pointer group ${isCompleted ? 'border-accent/20 opacity-60' : 'border-white/10 hover:border-accent/30'} ${isCompleting ? 'animate-pulse cursor-wait' : ''}`}
              >
                <div className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-colors ${isCompleted ? 'border-accent bg-accent' : 'border-accent/40 group-hover:border-accent'}`}>
                  {isCompleted ? <Check className="w-3 h-3 text-black" /> : isCompleting ? <div className="w-2 h-2 border-2 border-accent border-t-transparent rounded-full animate-spin" /> : <div className="w-2 h-2 bg-accent scale-0 group-hover:scale-100 transition-transform" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold tracking-tight ${isCompleted ? 'line-through text-text-secondary' : ''}`}>{quest.title}</p>
                  <p className="text-[10px] text-accent font-medium mt-0.5">REWARD: {quest.reward}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Streak Section */}
      <div className="flex justify-center pt-4">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="px-8 py-3 rounded-sm border border-accent/30 bg-accent/5 flex items-center gap-3 cursor-default"
        >
          <Flame className="text-accent w-5 h-5 animate-bounce" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-accent glow-text">Streak: {profile.streak} Days</span>
        </motion.div>
      </div>
    </div>
  );
};

export default Status;
