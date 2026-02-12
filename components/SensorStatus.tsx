
import React from 'react';
import { SensorData, SensorStatus } from '../types';

interface Props {
  sensors: SensorData[];
}

const SensorStatusPanel: React.FC<Props> = ({ sensors }) => {
  return (
    <div className="flex flex-col gap-4">
      {sensors.map((sensor) => {
        const isFire = sensor.status === SensorStatus.FIRE_DETECTED;
        const isReady = sensor.status === SensorStatus.READY || sensor.status === SensorStatus.INITIALIZING;
        
        return (
          <div 
            key={sensor.id} 
            className={`kahoot-card rounded-[25px] p-5 md:p-6 border-b-4 md:border-b-8 transition-all relative overflow-hidden flex flex-col sm:flex-row items-center gap-4 md:gap-8 ${
              isFire 
                ? 'bg-red-600 border-red-800 animate-pulse' 
                : 'bg-orange-500 border-orange-700'
            }`}
          >
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="flex items-center gap-4 md:gap-6 flex-1 w-full sm:w-auto">
              <div className={`p-4 md:p-5 rounded-2xl shadow-2xl transition-all shrink-0 ${isFire ? 'bg-white scale-110' : 'bg-orange-600'}`}>
                <i className={`fa-solid ${isFire ? 'fa-fire-alt text-red-600' : 'fa-microchip text-white'} text-2xl md:text-3xl`}></i>
              </div>
              
              <div className="flex flex-col min-w-0">
                <h3 className="text-[9px] md:text-xs font-black text-orange-100 uppercase tracking-widest opacity-70 italic">Security Node</h3>
                <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter uppercase truncate">{sensor.name}</h2>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto sm:ml-auto relative z-10">
              <div className={`flex-1 sm:flex-none px-6 py-4 md:py-5 rounded-2xl font-black uppercase text-center text-lg md:text-2xl shadow-inner flex items-center justify-center gap-3 transition-all min-w-[140px] md:min-w-[180px] ${
                isFire ? 'bg-white text-red-600 ring-4 ring-red-400/30' : 'bg-orange-800/40 text-orange-100'
              }`}>
                <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${isFire ? 'bg-red-600 animate-ping' : isReady ? 'bg-green-400' : 'bg-stone-500'}`}></div>
                {isFire ? 'FIRE!!' : (isReady ? `${sensor.value}%` : 'NOT READY')}
              </div>

              <div className="hidden md:flex flex-col items-end shrink-0">
                <span className="text-[9px] font-bold text-orange-100 uppercase opacity-60 flex items-center gap-2">
                  <i className="fa-regular fa-clock"></i>
                  {sensor.lastUpdated}
                </span>
                <span className="text-[9px] font-black text-orange-100 uppercase tracking-widest opacity-30">
                  REF: S_NODE_{sensor.id}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SensorStatusPanel;
