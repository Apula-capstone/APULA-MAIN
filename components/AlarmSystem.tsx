
import React, { useEffect, useRef } from 'react';

interface Props {
  isActive: boolean;
  onAcknowledge: () => void;
}

const AlarmSystem: React.FC<Props> = ({ isActive, onAcknowledge }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null); // Kept for JSX compatibility

  const [audioError, setAudioError] = React.useState<string | null>(null);
  const [audioStatus, setAudioStatus] = React.useState<string>("Initializing...");
  const [isBufferLoaded, setIsBufferLoaded] = React.useState(false); // New State to track buffer loading

  useEffect(() => {
    // Initialize Audio Context on first interaction or mount
    const initAudio = () => {
      if (!audioContextRef.current) {
        try {
          // Use window.AudioContext if available
          const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContextClass();
          audioContextRef.current = ctx;

          // Load the MP3 file
          const soundPath = import.meta.env.BASE_URL + 'sound.mp3';
          console.log("Loading sound from:", soundPath);

          fetch(soundPath)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.arrayBuffer();
            })
            .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
              bufferRef.current = audioBuffer;
              setAudioStatus("MP3 Siren Loaded");
              setIsBufferLoaded(true); // Signal readiness
            })
            .catch(e => {
              console.error("Failed to load MP3:", e);
              setAudioStatus("Error Loading MP3: " + e.message);
            });

          // Create Gain Node for Volume
          const gainNode = ctx.createGain();
          gainNode.gain.value = 3.0; // 300% Volume (Max)
          gainNode.connect(ctx.destination);
          gainNodeRef.current = gainNode;

        } catch (e) {
          console.error("Audio Init Error:", e);
        }
      }
    };

    // Try to init immediately (might be blocked by autoplay policy)
    initAudio();
    
    // Also init on any click to unlock AudioContext
    const unlockAudio = () => {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume().then(() => {
             console.log("Audio Context Resumed by User Interaction");
        });
      }
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    return () => {
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
    }

  }, []);

  const playAlarmSound = async () => {
    if (!audioContextRef.current || !bufferRef.current || !gainNodeRef.current) {
      setAudioStatus("Audio Not Ready (Wait for Load)");
      return;
    }

    try {
      // Resume context if suspended (autoplay policy)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Check if already playing to avoid overlapping
      if (sourceRef.current) {
         return; 
      }

      // Create source from buffer
      const source = audioContextRef.current.createBufferSource();
      source.buffer = bufferRef.current;
      source.loop = true;
      source.connect(gainNodeRef.current);
      source.start(0);
      
      sourceRef.current = source;
      setAudioStatus("Playing (MP3 Siren)");
      setAudioError(null);

    } catch (e: any) {
      console.error("Playback Error:", e);
      setAudioError(e.message);
      setAudioStatus("Playback Failed");
      
      // Fallback to HTML5 Audio if Web Audio API fails
       try {
           const soundPath = import.meta.env.BASE_URL + 'sound.mp3';
           const fallbackAudio = new Audio(soundPath);
           fallbackAudio.loop = true;
           fallbackAudio.volume = 1.0;
           await fallbackAudio.play();
           audioRef.current = fallbackAudio; // Store ref to stop later
           setAudioStatus("Playing (HTML5 Fallback)");
       } catch (fallbackError: any) {
           setAudioStatus("ALL AUDIO FAILED: " + fallbackError.message);
       }
    }
  };

  const stopAlarmSound = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
        sourceRef.current = null;
        setAudioStatus("Stopped");
      } catch (e) {
        console.error("Stop Error:", e);
      }
    }
    // Stop Fallback Audio
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
    }
  };

  useEffect(() => {
    if (isActive && isBufferLoaded) { // Only play if active AND loaded
      playAlarmSound();
    } else if (!isActive) {
      stopAlarmSound();
    }
    // Cleanup on unmount or inactive
    return () => stopAlarmSound();
  }, [isActive, isBufferLoaded]); // Add isBufferLoaded dependency


  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-8 bg-red-700/90 backdrop-blur-xl border-[10px] sm:border-[20px] md:border-[32px] border-red-600 animate-emergency-flash overflow-hidden">
      {/* Hidden button to satisfy interaction requirements if needed early */}
      <button className="sr-only" onClick={() => {}}>Focus Trap</button>

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
        
        {/* Error Message if Audio Fails */}
        <div className="w-full space-y-2">
          {/* Always show status for debugging */}
          <div className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-stone-500 bg-stone-100 p-2 rounded">
            Audio Status: {audioStatus}
          </div>

          {/* Force Play Button - Always available if not playing */}
          {audioStatus !== "Playing (MP3 Siren)" && (
             <button 
              onClick={() => playAlarmSound()}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg animate-pulse"
            >
              <i className="fa-solid fa-volume-high mr-2"></i>
              FORCE ENABLE SOUND
            </button>
          )}

          {audioError && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 w-full text-left" role="alert">
              <p className="font-bold">Audio Blocked</p>
              <p>{audioError}</p>
            </div>
          )}
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
