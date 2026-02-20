import React, { useState } from 'react';

interface LiveCameraProps {
  ipAddress?: string;
}

const LiveCamera: React.FC<LiveCameraProps> = ({ ipAddress = "10.255.240.30" }) => {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIp, setCurrentIp] = useState(ipAddress);
  const [isWebcamMode, setIsWebcamMode] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    let stream: MediaStream | null = null;

    if (isWebcamMode) {
      setIsLoading(true);
      setIsError(false);
      
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error("Play error:", e));
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error("Webcam Error:", err);
          setIsError(true);
          setIsLoading(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isWebcamMode]);
  
  const streamUrl = `http://${currentIp}:81/stream`;

  // Automatic fallback to AP mode IP if primary fails
  const handleStreamError = () => {
    if (isWebcamMode) return;
    if (currentIp === "10.255.240.30") {
      console.log("Primary camera stream failed. Falling back to AP IP 192.168.4.1");
      setCurrentIp("192.168.4.1");
      setIsLoading(true);
    } else {
      setIsError(true);
      setIsLoading(false);
    }
  };

  // Force automatic loading attempt
  return (
    <div className="bg-stone-900 rounded-[30px] p-6 border border-white/5 overflow-hidden relative group">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
            <i className="fa-solid fa-camera text-orange-500"></i>
            Live Stream
          </h2>
          <div className="flex bg-stone-800 rounded-lg p-1 border border-white/5">
            <button 
              onClick={() => setIsWebcamMode(false)}
              className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${!isWebcamMode ? 'bg-orange-600 text-white shadow-lg' : 'text-stone-500 hover:text-white'}`}
            >
              ESP32
            </button>
            <button 
              onClick={() => setIsWebcamMode(true)}
              className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${isWebcamMode ? 'bg-orange-600 text-white shadow-lg' : 'text-stone-500 hover:text-white'}`}
            >
              Webcam
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isError ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></span>
          <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">
            {isError ? 'Offline' : 'Live'}
          </span>
        </div>
      </div>

      <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 relative flex items-center justify-center">
        {isLoading && !isError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-black">
            <i className="fa-solid fa-circle-notch fa-spin text-orange-500 text-2xl"></i>
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Connecting to {isWebcamMode ? 'Webcam' : 'Cam'}...</p>
          </div>
        )}
        
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isWebcamMode && !isError ? 'block' : 'hidden'}`}
        />

        <img 
          src={streamUrl} 
          alt="ESP32-CAM Stream" 
          className={`w-full h-full object-cover ${!isWebcamMode && !isError ? 'block' : 'hidden'}`}
          onLoad={() => {
            if (!isWebcamMode) {
              setIsLoading(false);
              setIsError(false);
            }
          }}
          onError={handleStreamError}
        />

        {isError && (
          <div className="flex flex-col items-center gap-3 text-stone-600 px-6 text-center">
            <i className="fa-solid fa-video-slash text-4xl"></i>
            <p className="text-[10px] font-black uppercase tracking-widest text-center">
              {isWebcamMode ? 'Webcam Access Denied' : 'Stream Blocked or Offline'}<br/>
              <span className="text-stone-800 text-[8px]">
                {isWebcamMode ? 'Please allow camera access in your browser settings' : 'Mobile browsers & HTTPS often block camera feeds by default'}
              </span>
            </p>
            {!isWebcamMode && (
              <div className="flex flex-col gap-2 w-full mt-2">
                <a 
                  href={streamUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[9px] font-black bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-full transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-external-link text-[8px]"></i>
                  1. Tap to Authorize
                </a>
                <p className="text-[7px] text-stone-700 font-bold uppercase tracking-tight">
                  (Click 'Allow' or 'Advanced/Proceed' if prompted)
                </p>
                <button 
                  onClick={() => { setIsError(false); setIsLoading(true); }}
                  className="text-[9px] font-black bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-full transition-all uppercase tracking-widest"
                >
                  2. Retry View
                </button>
              </div>
            )}
            {isWebcamMode && (
               <button 
               onClick={() => setIsWebcamMode(false)}
               className="text-[9px] font-black bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-full transition-all uppercase tracking-widest mt-4"
             >
               Switch to ESP32
             </button>
            )}
          </div>
        )}
        
        {/* Overlay Info */}
        {!isError && !isLoading && (
          <div className="absolute bottom-4 left-4 flex flex-col gap-2">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-2">
              <i className="fa-solid fa-wifi text-[10px] text-orange-500"></i>
              <span className="text-[9px] font-black text-white uppercase tracking-tight">
                {isWebcamMode ? "LOCAL WEBCAM" : (currentIp === "192.168.4.1" ? "AP MODE (LOCAL)" : "STATION MODE (WIFI)")}
              </span>
            </div>
            <div className="bg-black/40 backdrop-blur-md px-3 py-0.5 rounded-full w-fit">
               <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">{currentIp}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveCamera;
