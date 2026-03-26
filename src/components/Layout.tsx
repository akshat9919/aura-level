import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { User, Dumbbell, Utensils, TrendingUp, Settings as SettingsIcon, MessageSquare, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Logo from './Logo';

const Layout: React.FC = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', icon: User, label: 'Status' },
    { to: '/workout', icon: Dumbbell, label: 'Workout' },
    { to: '/nutrition', icon: Utensils, label: 'Nutrition' },
    { to: '/calendar', icon: Calendar, label: 'Map' },
    { to: '/progress', icon: TrendingUp, label: 'Progress' },
    { to: '/oracle', icon: MessageSquare, label: 'Oracle' },
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="p-4 border-b border-accent/20 flex justify-between items-center sticky top-0 bg-background/60 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <Logo className="w-10 h-10" />
          <div>
            <h1 className="text-sm font-black tracking-tighter uppercase glow-text italic">AuraLevel</h1>
            <p className="text-[8px] text-accent font-bold uppercase tracking-widest leading-none">System Interface</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/settings')}
            className="p-2 hover:text-accent transition-colors"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
          <div className="text-right">
            <p className="text-[8px] text-text-secondary uppercase font-bold tracking-widest">Hunter Rank</p>
            <p className="text-xs font-black text-accent glow-text italic tracking-tighter">{profile?.rank || 'E'}-RANK</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-md mx-auto relative z-10">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/60 backdrop-blur-2xl border-t border-accent/20 p-2 flex justify-around items-center z-50 safe-area-bottom">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all duration-300
              ${isActive ? 'text-accent scale-110 glow-text' : 'text-text-secondary hover:text-text-primary'}
            `}
          >
            <item.icon className={`w-5 h-5 ${location.pathname === item.to ? 'drop-shadow-[0_0_5px_rgba(0,209,255,0.5)]' : ''}`} />
            <span className="text-[8px] uppercase font-black tracking-[0.2em]">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
