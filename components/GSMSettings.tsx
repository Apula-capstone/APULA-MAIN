
import React, { useState } from 'react';

interface Props {
  currentPhone: string;
  onSync: (phone: string) => void;
  isConnected: boolean;
}

const GSMSettings: React.FC<Props> = ({ currentPhone, onSync, isConnected }) => {
  const [phone, setPhone] = useState(currentPhone);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    onSync(phone);
    setTimeout(() => setIsSyncing(false), 1000);
  };

  return (
    <div className="bg-stone-900 rounded-[35px] md:rounded-[45px] p-8 md:p-12 border-b-[10px] md:border-b-[15px] border-stone-950 flex flex-col gap-6 shadow-2xl relative overflow-hidden group">
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-10 h-10 md:w-14 md:h-14 bg-orange-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-600/20">
          <i className="fa-solid fa-tower-cell text-xl md:text-2xl"></i>
        </div>
        <div>
          <h4 className="text-[10px] md:text-xs font-black text-stone-500 uppercase tracking-widest leading-none mb-1">Alert Protocol</h4>
          <p className="text-white font-black uppercase text-sm md:text-xl tracking-tighter leading-none">GSM SMS Settings</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div>
          <label className="text-[9px] font-bold text-stone-500 uppercase mb-2 block tracking-widest">Emergency Phone Number</label>
          <div className="flex gap-3">
            <input 
              type="text" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              className="flex-1 bg-stone-800 text-white font-bold px-4 py-3 rounded-xl border-2 border-white/5 focus:border-orange-600 outline-none transition-all text-xs md:text-sm"
            />
            <button 
              onClick={handleSync}
              disabled={!isConnected || isSyncing}
              className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                isConnected 
                ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg' 
                : 'bg-stone-800 text-stone-600 cursor-not-allowed'
              }`}
            >
              {isSyncing ? 'Syncing...' : 'Sync'}
            </button>
          </div>
        </div>
        
        <div className="bg-black/40 p-4 rounded-xl border border-white/5">
          <p className="text-[9px] text-stone-500 font-bold uppercase tracking-tight leading-relaxed">
            <span className="text-orange-500">Status:</span> {isConnected ? 'Ready for Broadcast' : 'System Offline'}
            <br/>
            <span className="text-stone-600 italic">* System will automatically call and SMS this number upon fire detection.</span>
          </p>
        </div>
      </div>

      <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none rotate-12">
        <i className="fa-solid fa-sim-card text-8xl md:text-9xl text-white"></i>
      </div>
    </div>
  );
};

export default GSMSettings;
