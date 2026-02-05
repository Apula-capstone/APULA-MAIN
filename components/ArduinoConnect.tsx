
import React from 'react';
import { ConnectionState } from '../types';

interface Props {
  state: ConnectionState;
  onConnect: (ssid: string, pass: string) => void;
  onDisconnect: () => void;
  label?: string;
  defaultSsid?: string;
  defaultPass?: string;
}

const ArduinoConnect: React.FC<Props> = ({ state, onConnect, onDisconnect, label, defaultSsid = '10.18.179.30', defaultPass = 'FireSafe2026' }) => {
  const [ssid, setSsid] = React.useState(defaultSsid);
  const [pass, setPass] = React.useState(defaultPass);
  
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isElectron = typeof window !== 'undefined' && navigator.userAgent.toLowerCase().includes('electron');

  return (
    <div className="bg-stone-900 rounded-[35px] md:rounded-[45px] p-6 md:p-8 border-b-8 md:border-b-[12px] border-stone-950 flex flex-col gap-6 shadow-2xl relative overflow-hidden group">
      {isHttps && !isElectron && state !== ConnectionState.CONNECTED && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 mb-2">
          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-tight flex items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation"></i>
            Browser Security Alert
          </p>
          <p className="text-[9px] text-stone-400 mt-1 leading-relaxed">
            Web browsers block local WiFi connections on HTTPS websites. 
            <span className="text-white"> Please use the Windows EXE or Android App</span> for full functionality.
            <br/>
            <a href="https://github.com/Apula-capstone/APULA-MAIN/releases" target="_blank" className="text-orange-500 underline">Download Desktop App →</a>
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${
            state === ConnectionState.CONNECTED ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/40' : 
            state === ConnectionState.CONNECTING ? 'bg-orange-600 text-white animate-pulse' : 'bg-stone-800 text-stone-500'
          }`}>
            <i className={`fa-solid ${state === ConnectionState.CONNECTED ? 'fa-wifi' : 'fa-wifi'} text-xl md:text-2xl`}></i>
          </div>
          <div>
            <h3 className="text-[10px] md:text-xs font-black text-stone-500 uppercase tracking-widest">{label}</h3>
            <p className="text-white font-black uppercase text-sm md:text-xl tracking-tighter">
              {state === ConnectionState.CONNECTED ? 'SYSTEM CONNECTED' : state === ConnectionState.CONNECTING ? 'CONNECTING...' : 'WIFI DISCONNECTED'}
            </p>
          </div>
        </div>
        
        {state === ConnectionState.CONNECTED && (
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-orange-500 uppercase tracking-[0.2em]">Live Data</span>
            <div className="flex gap-1">
              {[1,2,3].map(i => <div key={i} className="w-1 h-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: `${i*0.1}s`}}></div>)}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="bg-black/40 border-2 border-white/5 rounded-2xl p-4 md:p-6 transition-all group-hover:border-white/10">
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label className="text-[9px] font-bold text-stone-500 uppercase mb-2 block tracking-widest">System IP Address (or Hotspot SSID)</label>
              <input 
                type="text" 
                value={ssid} 
                onChange={(e) => setSsid(e.target.value)}
                disabled={state === ConnectionState.CONNECTED}
                placeholder="e.g. 192.168.1.50"
                className="w-full bg-stone-800 text-white font-bold px-4 py-2 md:py-3 rounded-xl border-2 border-white/5 focus:border-orange-600 outline-none transition-all text-xs md:text-sm"
              />
              <p className="text-[8px] text-stone-500 mt-2 italic">
                * Enter the <span className="text-orange-500">IP Address</span> shown in your Arduino Serial Monitor.
              </p>
            </div>
            <div>
              <label className="text-[9px] font-bold text-stone-500 uppercase mb-2 block tracking-widest">System Password (Hotspot Only)</label>
              <input 
                type="password" 
                value={pass} 
                onChange={(e) => setPass(e.target.value)}
                disabled={state === ConnectionState.CONNECTED}
                placeholder="Enter Password"
                className="w-full bg-stone-800 text-white font-bold px-4 py-2 md:py-3 rounded-xl border-2 border-white/5 focus:border-orange-600 outline-none transition-all text-xs md:text-sm"
              />
            </div>
          </div>

          {state === ConnectionState.CONNECTED ? (
            <button 
              onClick={onDisconnect}
              className="w-full bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white py-3 md:py-4 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest transition-all border border-red-600/30"
            >
              Disconnect System
            </button>
          ) : (
            <button 
              onClick={() => onConnect(ssid, pass)}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 md:py-4 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest transition-all shadow-lg shadow-orange-600/20"
            >
              Connect to APULA
            </button>
          )}
        </div>
      </div>
      
      <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
        <i className="fa-solid fa-microchip text-8xl md:text-9xl text-white"></i>
      </div>
    </div>
  );
};

export default ArduinoConnect;
