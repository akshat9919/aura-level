import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Zap, Coffee } from 'lucide-react';
import { getTrainingSchedule, saveTrainingSchedule } from '../services/scheduleService';
import { TrainingDay } from '../types';

const CalendarPage: React.FC = () => {
  const { profile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<TrainingDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.uid) {
      loadSchedule();
    }
  }, [profile?.uid]);

  const loadSchedule = async () => {
    if (!profile?.uid) return;
    const data = await getTrainingSchedule(profile.uid);
    setSchedule(data);
    setLoading(false);
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const isTrainingDay = (date: Date) => {
    const day = date.getDay();
    return day === 1 || day === 3 || day === 5; // Mon, Wed, Fri
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const days = [];

    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 border border-white/5 opacity-20" />);
    }

    // Actual days
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const training = isTrainingDay(date);
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      days.push(
        <motion.div 
          key={d}
          whileHover={{ scale: 1.02 }}
          className={`h-20 border border-white/10 p-1 transition-colors relative group
            ${isToday ? 'bg-accent/5 border-accent/40' : ''}
            ${training ? 'bg-accent/10' : 'bg-white/2'}
          `}
        >
          <span className={`text-[10px] font-black ${isToday ? 'text-accent' : 'text-text-secondary'}`}>{d}</span>
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {training ? (
              <Zap className="w-6 h-6 text-accent animate-pulse opacity-60" />
            ) : (
              <Coffee className="w-6 h-6 text-text-secondary opacity-40" />
            )}
          </div>

          <div className="absolute bottom-1 right-1">
             <p className="text-[6px] uppercase font-bold text-accent">
               {training ? '[DUNGEON]' : '[REST]'}
             </p>
          </div>
        </motion.div>
      );
    }

    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="system-window"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-accent w-5 h-5" />
            <h2 className="text-sm font-black uppercase tracking-widest italic">Dungeon Map</h2>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="p-1 hover:text-accent transition-colors"><ChevronLeft /></button>
            <span className="text-xs font-black uppercase tracking-tighter italic w-32 text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button onClick={nextMonth} className="p-1 hover:text-accent transition-colors"><ChevronRight /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/10 rounded-sm overflow-hidden">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-2 text-center text-[8px] font-black uppercase tracking-widest text-text-secondary border-b border-white/10">
              {d}
            </div>
          ))}
          {renderCalendar()}
        </div>

        <div className="mt-6 flex justify-around items-center p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent/20 border border-accent/40 rounded-sm flex items-center justify-center">
              <Zap className="w-2 h-2 text-accent" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Training Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center">
              <Coffee className="w-2 h-2 text-text-secondary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Rest Day</span>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="system-window"
      >
        <h3 className="text-xs font-black uppercase tracking-widest italic mb-4">Oracle's Insight</h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          The system has calculated your optimal training path. Your schedule is automatically synchronized with your Mana Core. 
          Follow the [DUNGEON] markers to ascend.
        </p>
      </motion.div>
    </div>
  );
};

export default CalendarPage;
