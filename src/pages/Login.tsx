import React from 'react';
import { signInWithGoogle } from '../firebase';
import { motion } from 'motion/react';
import Logo from '../components/Logo';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Shadow Effect */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(0,209,255,0.15)_0%,transparent_50%)]" />
        <img 
          src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop" 
          alt="Shadow Monarch" 
          className="w-full h-full object-cover mix-blend-overlay opacity-30"
          referrerPolicy="no-referrer"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-12 max-w-sm w-full z-10"
      >
        <div className="space-y-4">
          <Logo className="w-24 h-24 mx-auto" />
          <h1 className="text-4xl font-black glow-text tracking-tighter uppercase">AuraLevel</h1>
          <p className="text-accent text-sm uppercase tracking-[0.3em] font-bold">Shadow Monarch Edition</p>
        </div>

        <div className="system-window py-12 px-8 space-y-10">
          <div className="space-y-4">
            <p className="text-xl font-medium tracking-wide">The System has chosen you.</p>
            <p className="text-sm text-accent/80 font-medium">Your current level is insufficient.</p>
            <p className="text-lg font-medium">Do you wish to begin the awakening?</p>
          </div>

          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => signInWithGoogle()}
              className="system-button flex-1"
            >
              [ACCEPT]
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="system-button flex-1 opacity-50 hover:opacity-100"
            >
              [DECLINE]
            </button>
          </div>
        </div>

        <p className="text-[10px] text-text-secondary uppercase tracking-widest opacity-50">
          By entering, you agree to the System's Terms of Service.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
