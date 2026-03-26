import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, LogOut, User, Ruler, Brain, ChevronLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AIPersonality, UnitType } from '../types';

const Settings: React.FC = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const updateProfile = async (data: any) => {
    if (!profile?.uid) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), data);
    } catch (error) {
      console.error("Error updating settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const personalities: { id: AIPersonality; label: string; desc: string }[] = [
    { id: 'strict', label: 'Strict', desc: 'Direct and disciplined guidance.' },
    { id: 'sigma', label: 'Sigma', desc: 'Expect some cold roasts.' },
    { id: 'chad', label: 'Chad', desc: 'Deep, motivational wisdom.' },
    { id: 'humble', label: 'Humble', desc: 'Polite and encouraging support.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:text-accent transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-sm font-black uppercase tracking-widest italic">System Settings</h2>
      </div>

      {/* Profile Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="system-window p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-sm border border-accent/40 overflow-hidden bg-card rotate-45 p-1">
            <div className="-rotate-45 w-full h-full overflow-hidden rounded-sm">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.displayName || 'player'}`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tighter italic">{profile?.displayName}</h3>
            <p className="text-[10px] text-accent font-bold uppercase tracking-widest">{profile?.rank}-RANK {profile?.class}</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/profile')}
          className="system-button w-full flex items-center justify-center gap-2"
        >
          <User className="w-4 h-4" /> [VIEW PROFILE]
        </button>
      </motion.div>

      {/* Units Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="system-window"
      >
        <div className="flex items-center gap-2 mb-4">
          <Ruler className="text-accent w-4 h-4" />
          <h3 className="text-xs font-black uppercase tracking-widest">Measurement Units</h3>
        </div>
        <div className="flex gap-2">
          {(['metric', 'imperial'] as UnitType[]).map((u) => (
            <button
              key={u}
              onClick={() => updateProfile({ units: u })}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest border border-white/10 rounded-sm transition-all ${profile?.units === u ? 'bg-accent text-black border-accent' : 'bg-white/5 hover:bg-white/10'}`}
            >
              {u === 'metric' ? 'Metric (kg/cm)' : 'Imperial (lb/ft)'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Gender Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="system-window"
      >
        <div className="flex items-center gap-2 mb-4">
          <User className="text-accent w-4 h-4" />
          <h3 className="text-xs font-black uppercase tracking-widest">Character Gender</h3>
        </div>
        <div className="flex gap-2">
          {(['Male', 'Female'] as const).map((g) => (
            <button
              key={g}
              onClick={() => updateProfile({ gender: g })}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest border border-white/10 rounded-sm transition-all ${profile?.gender === g ? 'bg-accent text-black border-accent' : 'bg-white/5 hover:bg-white/10'}`}
            >
              {g}
            </button>
          ))}
        </div>
      </motion.div>

      {/* AI Personality Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="system-window"
      >
        <div className="flex items-center gap-2 mb-4">
          <Brain className="text-accent w-4 h-4" />
          <h3 className="text-xs font-black uppercase tracking-widest">Oracle Personality</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {personalities.map((p) => (
            <button
              key={p.id}
              onClick={() => updateProfile({ personality: p.id })}
              className={`p-4 text-left border border-white/10 rounded-sm transition-all ${profile?.personality === p.id ? 'bg-accent/10 border-accent' : 'bg-white/5 hover:bg-white/10'}`}
            >
              <p className={`text-[10px] font-black uppercase tracking-widest ${profile?.personality === p.id ? 'text-accent' : 'text-text-secondary'}`}>{p.label}</p>
              <p className="text-[8px] text-text-secondary mt-1 leading-tight">{p.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notifications Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="system-window"
      >
        <div className="flex items-center gap-2 mb-4">
          <Bell className="text-accent w-4 h-4" />
          <h3 className="text-xs font-black uppercase tracking-widest">System Alerts</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-sm">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">Daily Reminders</p>
              <p className="text-[8px] text-text-secondary mt-1">Receive alerts on workout days.</p>
            </div>
            <button
              onClick={() => updateProfile({ notificationsEnabled: !profile?.notificationsEnabled })}
              className={`w-12 h-6 rounded-full transition-all relative ${profile?.notificationsEnabled ? 'bg-accent' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${profile?.notificationsEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          
          {profile?.notificationsEnabled && (
            <button
              onClick={() => {
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification("System Test", { body: "AuraLevel notifications are active." });
                } else {
                  alert("Please enable notifications in your browser settings.");
                }
              }}
              className="w-full py-2 text-[8px] font-black uppercase tracking-widest border border-accent/20 text-accent hover:bg-accent/5 transition-all"
            >
              [SEND TEST ALERT]
            </button>
          )}
        </div>
      </motion.div>

      {/* Advanced Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="system-window"
      >
        <div className="flex items-center gap-2 mb-4">
          <Brain className="text-accent w-4 h-4" />
          <h3 className="text-xs font-black uppercase tracking-widest">Advanced Optimization</h3>
        </div>
        <button
          onClick={() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
          }}
          className="w-full py-3 text-[10px] font-black uppercase tracking-widest border border-white/10 text-text-secondary hover:text-white hover:border-white/20 transition-all"
        >
          [CLEAR SYSTEM CACHE & REBOOT]
        </button>
      </motion.div>

      {/* Logout Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button 
          onClick={logout}
          className="w-full p-4 border border-red-500/30 bg-red-500/5 text-red-500 rounded-lg flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" /> [TERMINATE SESSION]
        </button>
      </motion.div>
    </div>
  );
};

export default Settings;
