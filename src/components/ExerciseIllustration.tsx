import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Loader2, AlertCircle, Info, Image as ImageIcon } from 'lucide-react';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

interface ExerciseIllustrationProps {
  exerciseName: string;
  description?: string;
  howTo?: string;
  targetArea?: string;
}

const ExerciseIllustration: React.FC<ExerciseIllustrationProps> = ({ 
  exerciseName, 
  description, 
  howTo, 
  targetArea 
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Initializing System...");
  const [hasKey, setHasKey] = useState<boolean>(false);

  const loadingMessages = [
    "Analyzing Anatomy...",
    "Rendering Illustration...",
    "Highlighting Muscle Groups...",
    "Stabilizing Visualization...",
    "Optimizing Form Reference..."
  ];

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const generateIllustration = async () => {
    if (!hasKey) return;
    
    setLoading(true);
    setError(null);
    setImageUrl(null);
    
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      setLoadingMessage(loadingMessages[messageIndex % loadingMessages.length]);
      messageIndex++;
    }, 3000);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = 'gemini-2.5-flash-image';
      
      const prompt = `High-quality static fitness illustration of a female model performing ${exerciseName}. 
      Style: Medical-style anatomical fitness illustration, primary muscles highlighted in red, secondary muscles highlighted in light pink, 
      remaining body in gray, athletic female wearing black sports bra and black shorts, neutral face expression, 
      clean white or light gray background, full body visible, show the correct exercise position. 
      Rules: Only static illustration, no animation, no moving character.`;

      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      let base64Data = "";
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          base64Data = part.inlineData.data;
          break;
        }
      }

      if (!base64Data) throw new Error("Failed to retrieve image data");

      setImageUrl(`data:image/png;base64,${base64Data}`);
    } catch (err: any) {
      console.error("Image generation error:", err);
      if (err.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        setError("API Key session expired. Please re-select your key.");
      } else {
        setError("System Overload: Failed to render illustration. Please try again.");
      }
    } finally {
      setLoading(false);
      clearInterval(messageInterval);
    }
  };

  useEffect(() => {
    if (hasKey && exerciseName) {
      generateIllustration();
    }
  }, [exerciseName, hasKey]);

  if (!hasKey) {
    return (
      <div className="system-window flex flex-col items-center justify-center p-8 text-center min-h-[300px] border-dashed border-accent/30">
        <Info className="w-8 h-8 text-accent mb-4" />
        <h3 className="text-sm font-black uppercase tracking-widest mb-2 italic">Neural Uplink Required</h3>
        <p className="text-[10px] text-text-secondary mb-6 max-w-[200px]">
          To visualize anatomical form, you must connect your System Key.
        </p>
        <button 
          onClick={handleSelectKey}
          className="system-button px-6 py-2 text-[10px]"
        >
          [CONNECT KEY]
        </button>
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[8px] text-accent/50 mt-4 hover:text-accent transition-colors"
        >
          Billing Documentation
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-square system-window overflow-hidden bg-black/20 group">
        {/* 3D Grid Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
               backgroundSize: '20px 20px',
               transform: 'perspective(500px) rotateX(60deg) translateY(-100px)',
               transformOrigin: 'top'
             }} 
        />
        
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-black/40 backdrop-blur-sm"
            >
              <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-accent animate-pulse">
                {loadingMessage}
              </p>
              <div className="w-32 h-1 bg-white/10 mt-4 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-accent"
                  animate={{ x: [-128, 128] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
            >
              <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-4">{error}</p>
              <button 
                onClick={generateIllustration}
                className="system-button px-4 py-2 text-[8px]"
              >
                [RETRY UPLINK]
              </button>
            </motion.div>
          ) : imageUrl ? (
            <motion.div 
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full"
            >
              <img 
                src={imageUrl} 
                alt={exerciseName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={generateIllustration}
                  className="p-1.5 bg-black/60 rounded-sm border border-white/10 hover:border-accent transition-colors"
                  title="Regenerate Illustration"
                >
                  <RefreshCw className="w-3 h-3 text-white" />
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <button 
                onClick={generateIllustration}
                className="system-button flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" /> [INITIALIZE ILLUSTRATION]
              </button>
            </div>
          )}
        </AnimatePresence>
        
        {/* Overlay labels */}
        <div className="absolute bottom-2 left-2 pointer-events-none">
          <div className="flex flex-col gap-1">
            <div className="bg-black/60 px-2 py-0.5 rounded-sm border border-white/5 backdrop-blur-sm">
              <p className="text-[8px] font-black uppercase tracking-widest text-accent">Anatomical Scan: Complete</p>
            </div>
            <div className="bg-black/60 px-2 py-0.5 rounded-sm border border-white/5 backdrop-blur-sm">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/70">Mode: Static Illustration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Anatomical Data Chart */}
      {imageUrl && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="system-window bg-black/40 border-accent/20 p-4 space-y-4"
        >
          {howTo && (
            <div className="space-y-2">
              {howTo.split('.').filter(s => s.trim()).map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-[10px] font-black text-accent">0{i + 1}</span>
                  <p className="text-[10px] text-text-secondary leading-tight">{step.trim()}.</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ExerciseIllustration;
