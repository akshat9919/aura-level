import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Smartphone, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show the prompt after a short delay if not dismissed
      if (sessionStorage.getItem('installPromptDismissed') !== 'true') {
        setTimeout(() => setIsVisible(true), 2000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS, we can show instructions immediately since beforeinstallprompt won't fire
    if (isIOSDevice && sessionStorage.getItem('installPromptDismissed') !== 'true') {
      setTimeout(() => setIsVisible(true), 3000);
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Store in session storage to not show again in this session
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed inset-x-4 bottom-24 z-[100] md:left-auto md:right-8 md:bottom-8 md:w-96"
        >
          <div className="system-window bg-black/95 backdrop-blur-2xl border-accent/60 p-6 shadow-[0_0_50px_rgba(0,209,255,0.2)] relative overflow-hidden">
            {/* Background Glow Effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 blur-[100px] rounded-full pointer-events-none" />
            
            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-5">
              <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/30 shrink-0 shadow-[0_0_15px_rgba(0,209,255,0.1)]">
                <Smartphone className="text-accent w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <h3 className="text-lg font-black uppercase tracking-tighter text-white mb-1 glow-text">SYSTEM AWAKENING</h3>
                <p className="text-xs text-text-secondary leading-relaxed font-medium">
                  {isIOS 
                    ? "Install the System on your device to unlock full potential and offline synchronization."
                    : "A new System update is available for your device. Install now for the ultimate hunter experience."}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {isIOS ? (
                <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                    <Share className="w-3 h-3" />
                    iOS Installation Protocol:
                  </p>
                  <ol className="text-[10px] text-text-secondary space-y-1 ml-4 list-decimal">
                    <li>Tap the <span className="text-white font-bold">Share</span> button in Safari</li>
                    <li>Scroll down and select <span className="text-white font-bold">"Add to Home Screen"</span></li>
                    <li>Confirm installation to begin</li>
                  </ol>
                </div>
              ) : (
                <button
                  onClick={handleInstallClick}
                  disabled={!deferredPrompt}
                  className={`system-button w-full py-3 text-xs flex items-center justify-center gap-3 ${!deferredPrompt ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Download className="w-4 h-4" />
                  {deferredPrompt ? "[INITIALIZE INSTALLATION]" : "[SYSTEM INITIALIZING...]"}
                </button>
              )}
              
              <button
                onClick={handleDismiss}
                className="w-full py-2 text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary hover:text-white transition-colors"
              >
                [LATER]
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
