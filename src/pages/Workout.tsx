import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PoseTracker from '../components/PoseTracker';
import { Play, Square, CheckCircle, ChevronRight, Info, Timer, Zap, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, addDoc, increment } from 'firebase/firestore';
import { userService } from '../services/userService';

const EXERCISES = [
  { 
    id: 'squat', 
    name: 'Shadow Squats', 
    reps: 15, 
    sets: 3, 
    xp: 100, 
    desc: 'Lower your hips as if sitting back into a chair, keeping your chest up.',
    howTo: 'Stand with feet shoulder-width apart. Lower your hips until thighs are parallel to the floor. Keep your back straight and knees behind toes.',
    targetArea: 'Quads, Glutes, Hamstrings'
  },
  { 
    id: 'pushup', 
    name: 'Monarch Pushups', 
    reps: 10, 
    sets: 3, 
    xp: 150, 
    desc: 'Lower your body until your chest nearly touches the floor, then push back up.',
    howTo: 'Place hands slightly wider than shoulders. Maintain a straight line from head to heels. Lower chest to floor and push back up.',
    targetArea: 'Chest, Shoulders, Triceps, Core'
  },
  { 
    id: 'lunges', 
    name: 'Aura Lunges', 
    reps: 12, 
    sets: 3, 
    xp: 120, 
    desc: 'Step forward with one leg and lower your hips until both knees are bent at a 90-degree angle.',
    howTo: 'Step forward with one leg. Lower hips until both knees are bent at 90 degrees. Keep front knee above ankle. Push back to start.',
    targetArea: 'Quads, Glutes, Hamstrings'
  },
  { 
    id: 'plank', 
    name: 'Mana Core Plank', 
    reps: 30, 
    sets: 3, 
    xp: 200, 
    desc: 'Hold a pushup position but on your forearms, keeping your body in a straight line.',
    howTo: 'Rest on forearms and toes. Keep body straight and core tight. Do not let hips sag or rise. Hold position.',
    targetArea: 'Core, Shoulders, Back'
  },
  { 
    id: 'cobra', 
    name: 'Cobra Stretch', 
    reps: 1, 
    sets: 3, 
    xp: 80, 
    desc: 'Lie face down, then push your upper body up while keeping your hips on the floor.',
    howTo: 'Lie face down. Place hands under shoulders. Push chest up while keeping hips on floor. Look up slightly.',
    targetArea: 'Abdominals, Lower Back, Chest'
  },
  { 
    id: 'jumping_jack', 
    name: 'Sonic Jumping Jacks', 
    reps: 20, 
    sets: 3, 
    xp: 130, 
    desc: 'Jump with legs spread and hands touching overhead, then return to a standing position.',
    howTo: 'Start with feet together and arms at sides. Jump while spreading legs and raising arms above head. Jump back to starting position.',
    targetArea: 'Full Body, Cardio'
  },
  { 
    id: 'high_knees', 
    name: 'Velocity High Knees', 
    reps: 30, 
    sets: 3, 
    xp: 110, 
    desc: 'Run in place while bringing your knees up to hip level.',
    howTo: 'Stand with feet hip-width apart. Run in place, lifting knees as high as possible. Pump your arms to increase intensity.',
    targetArea: 'Legs, Core, Cardio'
  },
  { 
    id: 'burpee', 
    name: 'Titan Burpees', 
    reps: 8, 
    sets: 3, 
    xp: 250, 
    desc: 'A full body exercise combining a squat, jump, and pushup.',
    howTo: 'From standing, drop into a squat. Kick feet back into pushup position. Do a pushup. Jump feet back to squat. Jump up explosively.',
    targetArea: 'Full Body, Strength, Cardio'
  },
];

import { toast } from 'sonner';

const Workout: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isStarted, setIsStarted] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [reps, setReps] = useState(0);
  const [sets, setSets] = useState(1);
  const [completedExercises, setCompletedExercises] = useState<any[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [setTimeLeft, setSetTimeLeft] = useState(60);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentLevel = profile?.level || 1;
  
  // Scale exercises based on level
  const scaledExercises = EXERCISES.map(ex => ({
    ...ex,
    reps: Math.floor(ex.reps * (1 + (currentLevel - 1) * 0.2)), // 20% increase per level
    sets: Math.floor(ex.sets + (currentLevel - 1) / 5), // Extra set every 5 levels
    xp: Math.floor(ex.xp * (1 + (currentLevel - 1) * 0.1)) // 10% more XP per level
  }));

  const currentExercise = scaledExercises[currentExerciseIndex];
  const currentExerciseRef = useRef(currentExercise);

  useEffect(() => {
    currentExerciseRef.current = currentExercise;
  }, [currentExercise]);

  const speak = (text: string) => {
    try {
      if ('speechSynthesis' in window) {
        // Cancel any pending speech to stay in sync with the timer
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.8; // Increased speed for better sync
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.warn("Speech synthesis error:", error);
    }
  };

  useEffect(() => {
    if (!isStarted || showSummary || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTotalElapsed(prev => prev + 1);
      
      if (countdown > 0) {
        const nextVal = countdown - 1;
        setCountdown(nextVal);
        if (nextVal > 0) speak(nextVal.toString());
        if (nextVal === 0) {
          setSetTimeLeft(60);
          speak("Go!");
        }
      } else if (setTimeLeft > 0) {
        const nextVal = setTimeLeft - 1;
        setSetTimeLeft(nextVal);
        // Only speak every 10 seconds or last 5 seconds to avoid noise
        if (nextVal > 0 && (nextVal % 10 === 0 || nextVal <= 5)) {
          speak(nextVal.toString());
        }
        if (nextVal === 0) {
          handleSetComplete();
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStarted, isPaused, showSummary, countdown, setTimeLeft]);

  const handleSetComplete = () => {
    if (sets < currentExerciseRef.current.sets) {
      setReps(0);
      setCountdown(10);
      speak("Set complete. Rest time. 10");
      setSets(prev => prev + 1);
    } else {
      nextExercise();
    }
  };

  const startWorkout = () => {
    setIsStarted(true);
    setReps(0);
    setSets(1);
    setCurrentExerciseIndex(0);
    setTotalElapsed(0);
    setSetTimeLeft(60);
    setCountdown(10);
    speak("Ready to go. 10");
  };

  const nextExercise = () => {
    setCompletedExercises(prev => [...prev, { name: currentExercise.name, reps, xpGained: currentExercise.xp }]);
    
    if (currentExerciseIndex < EXERCISES.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setReps(0);
      setSets(1);
      setSetTimeLeft(60);
      setCountdown(10);
      speak("Exercise complete. Rest time. 10");
    } else {
      finishWorkout();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const finishWorkout = async () => {
    if (!profile) return;

    const totalXp = completedExercises.reduce((acc, curr) => acc + curr.xpGained, 0) + currentExercise.xp;
    const finalExercises = [...completedExercises, { name: currentExercise.name, reps, xpGained: currentExercise.xp }];

    try {
      await addDoc(collection(db, 'users', profile.uid, 'workouts'), {
        uid: profile.uid,
        date: new Date().toISOString(),
        type: 'Dungeon Run',
        duration: 15,
        exercises: finalExercises,
        totalXp,
        calories: totalXp / 5
      });

      await userService.addXP(profile.uid, profile, totalXp, undefined, {
        streak: increment(1),
        lastWorkout: new Date().toISOString()
      });

      toast.success('Dungeon Cleared!', {
        description: `You gained ${totalXp} XP and increased your streak.`,
      });

      setShowSummary(true);
      setIsStarted(false);
    } catch (error) {
      console.error("Error finishing workout:", error);
      toast.error('Failed to save workout', {
        description: 'Please check your connection and try again.',
      });
    }
  };

  if (showSummary) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="system-window text-center py-16 space-y-8"
      >
        <div className="relative">
          <CheckCircle className="text-accent w-20 h-20 mx-auto animate-pulse" />
          <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full" />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black glow-text italic tracking-tighter uppercase">DUNGEON CLEARED</h2>
          <p className="text-accent text-[10px] uppercase font-bold tracking-[0.3em]">System Reward Processing...</p>
        </div>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="text-center">
            <p className="text-text-secondary uppercase text-[10px] font-bold tracking-widest mb-1">XP Gained</p>
            <p className="text-3xl font-black text-accent tracking-tighter">+{completedExercises.reduce((acc, curr) => acc + curr.xpGained, 0)}</p>
          </div>
          <div className="text-center">
            <p className="text-text-secondary uppercase text-[10px] font-bold tracking-widest mb-1">Mana Core</p>
            <p className="text-3xl font-black text-accent tracking-tighter">+1.2%</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="system-button w-full py-4 text-sm"
        >
          [RETURN TO STATUS]
        </button>
      </motion.div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-4">
      {!isStarted ? (
        <div className="space-y-6 overflow-y-auto pb-8">
          <div className="system-window">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-accent" />
              <h2 className="text-xl font-black glow-text italic tracking-tight uppercase">Instant Dungeon: Red Gate</h2>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed font-medium">
              The system has detected a high-rank dungeon. Complete the training to increase your Aura Density and stabilize your Mana Core.
            </p>
            <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
              <p className="text-[10px] text-accent font-black uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-3 h-3" />
                New Feature: Anatomical Form Visualization Active
              </p>
            </div>
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3" />
                System Requirement: Ensure camera is connected for pose tracking
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <span className="px-2 py-0.5 bg-accent/10 border border-accent/30 text-[8px] font-bold text-accent uppercase">Rank: E</span>
              <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-[8px] font-bold text-red-500 uppercase">Danger: Low</span>
            </div>
          </div>

          <div className="space-y-3">
            {scaledExercises.map((ex, i) => (
              <div key={ex.id} className="system-window flex items-center justify-between py-4 group cursor-pointer hover:border-accent/60 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center border border-white/10 group-hover:border-accent/40 transition-colors">
                    <span className="text-accent font-black">{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-tight">{ex.name}</p>
                    <p className="text-[10px] text-accent font-black uppercase tracking-widest">{ex.sets} Sets x {ex.reps} Reps</p>
                  </div>
                </div>
                <ChevronRight className="text-text-secondary w-5 h-5 group-hover:text-accent transition-colors" />
              </div>
            ))}
          </div>

          <button 
            onClick={startWorkout}
            className="system-button w-full py-5 flex items-center justify-center gap-3 text-lg mt-auto sticky bottom-0"
          >
            <Play className="fill-current w-5 h-5" />
            [ENTER DUNGEON]
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 relative">
          {/* Top: Exercise Name */}
          <div className="system-window py-3 flex justify-between items-center bg-black/60 backdrop-blur-md">
            <div>
              <p className="text-[8px] text-accent uppercase font-black tracking-widest leading-none mb-1">Current Quest</p>
              <h2 className="text-lg font-black uppercase italic tracking-tighter glow-text">{currentExercise.name}</h2>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-text-secondary uppercase font-black tracking-widest leading-none mb-1">Set</p>
              <p className="text-lg font-black italic tracking-tighter">{sets} / {currentExercise.sets}</p>
            </div>
          </div>

          {/* Middle: Camera Feed (Bigger) + Exercise Info Overlay */}
          <div className="flex-1 relative min-h-[400px] flex flex-col gap-4">
            <div className="flex-1 system-window relative overflow-hidden bg-black/40 backdrop-blur-sm p-0">
              {isCameraLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30">
                  <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <PoseTracker 
                isActive={isStarted} 
                exerciseType={currentExercise.id as any} 
                onRepCount={(count) => setReps(count)} 
                onReady={() => setIsCameraLoading(false)}
                sets={sets}
                minimal={false}
              />
              
              {/* Exercise Info Overlay (Smaller) */}
              <div className="absolute top-4 left-4 max-w-[200px] pointer-events-none z-10">
                <div className="system-window bg-black/60 backdrop-blur-md border-accent/20 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="text-accent w-3 h-3" />
                    <h3 className="text-accent text-[8px] font-black uppercase tracking-[0.2em]">Protocol</h3>
                  </div>
                  <p className="text-[10px] text-text-secondary leading-tight italic">
                    {currentExercise.howTo}
                  </p>
                </div>
              </div>
            </div>

            {/* Countdown Overlay */}
            <AnimatePresence>
              {countdown > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 1.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50"
                >
                  <p className="text-accent text-xs font-black uppercase tracking-[0.5em] mb-4">Rest Period</p>
                  <p className="text-8xl font-black glow-text italic tracking-tighter">{countdown}</p>
                  <button 
                    onClick={() => setCountdown(0)}
                    className="mt-8 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-accent transition-colors"
                  >
                    [SKIP REST]
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom: Stats & Controls */}
          <div className="grid grid-cols-2 gap-4 h-32">
            <div className="system-window flex flex-col items-center justify-center gap-1">
              <Activity className="text-accent w-5 h-5" />
              <p className="text-[8px] text-text-secondary uppercase font-black tracking-widest">Reps</p>
              <p className="text-4xl font-black italic tracking-tighter glow-text">{reps} <span className="text-sm text-text-secondary">/ {currentExercise.reps}</span></p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="system-window flex-1 flex flex-col items-center justify-center gap-1">
                <Timer className="text-accent w-4 h-4" />
                <p className="text-[8px] text-text-secondary uppercase font-black tracking-widest">Set Timer</p>
                <p className="text-xl font-black italic tracking-tighter text-accent">{formatTime(setTimeLeft)}</p>
              </div>
              <button 
                onClick={nextExercise}
                className="system-button flex-1 flex items-center justify-center gap-2 text-xs"
              >
                [{currentExerciseIndex === EXERCISES.length - 1 ? 'FINISH' : 'NEXT'}] <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <button 
            onClick={() => setIsStarted(false)}
            className="py-1 text-[8px] font-black tracking-[0.3em] uppercase text-red-500/40 hover:text-red-500 transition-colors"
          >
            [ABORT QUEST]
          </button>
        </div>
      )}
    </div>
  );
};

export default Workout;
