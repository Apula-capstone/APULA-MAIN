
import React, { useEffect, useRef } from 'react';

interface Props {
  isActive: boolean;
  onAcknowledge: () => void;
}

const AlarmSystem: React.FC<Props> = ({ isActive, onAcknowledge }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (isActive) {
      // Check if running on Android
      const isAndroid = !!(window as any).Android;

      // If on Android, we rely on Native Audio (triggered by App.tsx -> MainActivity.java)
      // This ensures 100% native volume without Web Audio interference/doubling.
      if (isAndroid) {
        return; 
      }

      if (!audioRef.current) {
          // Create Audio element
          // Use absolute path for reliability across routes
          audioRef.current = new Audio('/sound.mp3');
          audioRef.current.loop = true;
          // Basic volume
          audioRef.current.volume = 1.0; 

          // Web Audio API for extra amplification (Gain)
          try {
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
              const audioCtx = new AudioContextClass();
              audioContextRef.current = audioCtx;
              
              const source = audioCtx.createMediaElementSource(audioRef.current);
              sourceNodeRef.current = source;
              
              const gainNode = audioCtx.createGain();
              // Set gain to 2.0 (200% volume) as requested for Web
              gainNode.gain.value = 2.0; 
              gainNodeRef.current = gainNode;
              
              source.connect(gainNode);
              gainNode.connect(audioCtx.destination);
            }
          } catch (e) {
            console.error("Web Audio API setup failed, falling back to standard audio", e);
          }
      }
      
      const playAudio = async () => {
        try {
          if (audioRef.current) {
            // Resume context if suspended (browser policy)
            if (audioContextRef.current?.state === 'suspended') {
              await audioContextRef.current.resume();
            }
            await audioRef.current.play();
          }
        } catch (error) {
          console.error("Audio playback failed:", error);
        }
      };

      playAudio();

    } else {
      // Stop and reset
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }

    return () => {
      // Cleanup is handled better in a separate effect or just ensure pause on unmount
      // But for this component which might unmount/remount, we should be careful.
      // If isActive becomes false, we pause.
      // If component unmounts, we should cleanup context.
    };
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-8 bg-red-700/90 backdrop-blur-xl border-[10px] sm:border-[20px] md:border-[32px] border-red-600 animate-emergency-flash overflow-hidden">
      {/* White Alert Box: Using max-h-full and flex-shrink to ensure it fits in landscape mobile */}
      <div className="bg-white p-6 sm:p-10 md:p-14 rounded-[30px] sm:rounded-[50px] shadow-[0_0_100px_rgba(0,0,0,0.8)] border-4 sm:border-8 border-black flex flex-col items-center gap-4 sm:gap-6 md:gap-8 w-full max-w-lg md:max-w-2xl text-center relative overflow-hidden flex-shrink max-h-full">
        
        {/* Decorative caution stripes - Header */}
        <div className="absolute top-0 left-0 right-0 h-4 md:h-6 bg-yellow-400 flex overflow-hidden shrink-0">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="min-w-[40px] h-full bg-black -skew-x-45 mr-4"></div>
          ))}
        </div>

        {/* Scalable Icon container */}
        <div className="bg-red-600 p-4 sm:p-6 md:p-10 rounded-full shadow-lg ring-4 md:ring-12 ring-red-100 animate-bounce mt-6 sm:mt-8 shrink-0">
          <i className="fa-solid fa-skull-crossbones text-4xl sm:text-6xl md:text-9xl text-white"></i>
        </div>
        
        {/* Text Section: Adjusting sizes for different viewports */}
        <div className="space-y-1 md:space-y-4 overflow-y-auto min-h-0">
          <h2 className="text-3xl sm:text-5xl md:text-8xl font-black text-red-600 tracking-tighter leading-none uppercase italic">
            Lethal Fire
          </h2>
          <p className="text-xs sm:text-lg md:text-3xl font-black text-stone-900 uppercase tracking-tight">
            Immediate Evacuation Required
          </p>
          <div className="bg-red-50 border-2 border-red-200 p-2 md:p-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-3 animate-pulse mt-4">
            <i className="fa-solid fa-bell text-red-600 text-sm md:text-xl"></i>
            <span className="text-[10px] md:text-sm font-black text-red-600 uppercase tracking-widest">Smart Notifications Dispatched to All Devices</span>
          </div>
        </div>

        {/* Button: Smaller on mobile, massive on desktop */}
        <button
          onClick={onAcknowledge}
          className="w-full bg-red-600 hover:bg-red-700 text-white text-lg sm:text-2xl md:text-5xl font-black py-4 sm:py-6 md:py-10 rounded-xl sm:rounded-2xl md:rounded-[40px] border-b-[6px] md:border-b-[16px] border-red-900 transition-all hover:translate-y-1 active:border-b-0 active:translate-y-3 uppercase shadow-2xl mt-auto mb-6 sm:mb-8 shrink-0"
        >
          Acknowledge
        </button>

        {/* Decorative stripes - Footer */}
        <div className="absolute bottom-0 left-0 right-0 h-4 md:h-6 bg-yellow-400 flex overflow-hidden shrink-0">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="min-w-[40px] h-full bg-black -skew-x-45 mr-4"></div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes extreme-flash {
          0%, 100% { background-color: rgba(153, 27, 27, 0.95); }
          50% { background-color: rgba(239, 68, 68, 0.95); }
        }
        .animate-emergency-flash {
          animation: extreme-flash 0.15s infinite;
        }
      `}</style>
    </div>
  );
};

export default AlarmSystem;
