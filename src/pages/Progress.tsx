import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { TrendingUp, Trophy, Calendar, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Progress: React.FC = () => {
  const { profile } = useAuth();

  if (!profile) return null;

  const data = [
    { name: 'Mon', xp: 400 },
    { name: 'Tue', xp: 1200 },
    { name: 'Wed', xp: 800 },
    { name: 'Thu', xp: 1500 },
    { name: 'Fri', xp: 2000 },
    { name: 'Sat', xp: 1800 },
    { name: 'Sun', xp: 2500 },
  ];

  return (
    <div className="space-y-6">
      {/* XP Progress Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="system-window h-[320px]"
      >
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="text-accent w-5 h-5" />
          <h3 className="text-sm font-black uppercase tracking-widest italic">XP Evolution</h3>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#ffffff40" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#ffffff40" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0a0a0a', 
                  border: '1px solid rgba(0,209,255,0.3)',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'inherit'
                }}
                itemStyle={{ color: '#00D1FF' }}
              />
              <Line 
                type="monotone" 
                dataKey="xp" 
                stroke="#00D1FF" 
                strokeWidth={3}
                dot={{ fill: '#00D1FF', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#00D1FF', strokeWidth: 0, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Achievements Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="system-window"
      >
        <div className="flex items-center gap-2 mb-6">
          <Award className="text-accent w-5 h-5" />
          <h3 className="text-sm font-black uppercase tracking-widest italic">Unlocked Titles</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 1, name: 'Awakened', icon: '✨', unlocked: true, color: 'text-accent' },
            { id: 2, name: 'Shadow Walker', icon: '👣', unlocked: true, color: 'text-accent' },
            { id: 3, name: 'Monarch', icon: '👑', unlocked: false, color: 'text-purple-500' },
          ].map((achievement) => (
            <div 
              key={achievement.id}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${achievement.unlocked ? 'bg-accent/5 border-accent/30' : 'bg-white/5 border-white/10 opacity-40'}`}
            >
              <span className="text-2xl">{achievement.icon}</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-center leading-tight">{achievement.name}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* History Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="system-window"
      >
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="text-accent w-5 h-5" />
          <h3 className="text-sm font-black uppercase tracking-widest italic">Dungeon History</h3>
        </div>
        <div className="space-y-4">
          {[
            { name: 'Lower Body', date: 'Mar 24, 2026', time: '25 mins', xp: '+850' },
            { name: 'Upper Body', date: 'Mar 23, 2026', time: '18 mins', xp: '+620' },
          ].map((run, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10 hover:border-accent/30 transition-colors">
              <div>
                <p className="text-sm font-black uppercase italic tracking-tighter">Run: {run.name}</p>
                <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">{run.date} • {run.time}</p>
              </div>
              <p className="text-accent font-black glow-text italic tracking-tighter">{run.xp} XP</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Progress;
