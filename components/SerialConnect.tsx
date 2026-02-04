import React, { useState, useRef } from 'react';
import { ConnectionState } from '../types';

interface Props {
  state: ConnectionState;
  onData: (data: string) => void;
  onConnect: (port: any) => void;
  onDisconnect: () => void;
}

const SerialConnect: React.FC<Props> = ({ state, onData, onConnect, onDisconnect }) => {
  const [error, setError] = useState<string | null>(null);
  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);

  const connectSerial = async () => {
    setError(null);
    try {
      if (!('serial' in navigator)) {
        throw new Error('Web Serial not supported in this browser.');
      }

      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      portRef.current = port;
      onConnect(port);

      readLoop();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Connection failed');
    }
  };

  const readLoop = async () => {
    while (portRef.current?.readable) {
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = portRef.current.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) onData(value);
        }
      } catch (err) {
        console.error('Serial Read Error:', err);
        break;
      } finally {
        reader.releaseLock();
      }
    }
  };

  const disconnectSerial = async () => {
    if (readerRef.current) {
      await readerRef.current.cancel();
    }
    if (portRef.current) {
      await portRef.current.close();
    }
    portRef.current = null;
    onDisconnect();
  };

  return (
    <div className="bg-stone-900 rounded-[35px] md:rounded-[45px] p-6 md:p-8 border-b-8 md:border-b-[12px] border-stone-950 flex flex-col gap-6 shadow-2xl relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${
            state === ConnectionState.CONNECTED ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40' : 
            state === ConnectionState.CONNECTING ? 'bg-emerald-600 text-white animate-pulse' : 'bg-stone-800 text-stone-500'
          }`}>
            <i className="fa-solid fa-plug text-xl md:text-2xl"></i>
          </div>
          <div>
            <h3 className="text-[10px] md:text-xs font-black text-stone-500 uppercase tracking-widest">Wired Hub</h3>
            <p className="text-white font-black uppercase text-sm md:text-xl tracking-tighter">
              {state === ConnectionState.CONNECTED ? 'USB CONNECTED' : 'DIRECT ARDUINO LINK'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-black/40 border-2 border-white/5 rounded-2xl p-4 md:p-6 transition-all group-hover:border-white/10">
          <p className="text-[10px] text-stone-400 mb-4 leading-relaxed font-bold uppercase tracking-tight">
            Connect your Arduino Uno directly via USB for high-speed local monitoring.
          </p>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
              <p className="text-[10px] font-bold text-red-500 uppercase">{error}</p>
            </div>
          )}

          {state === ConnectionState.CONNECTED ? (
            <button 
              onClick={disconnectSerial}
              className="w-full bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white py-3 md:py-4 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest transition-all border border-red-600/30"
            >
              Close Serial Link
            </button>
          ) : (
            <button 
              onClick={connectSerial}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 md:py-4 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest transition-all shadow-lg shadow-emerald-600/20"
            >
              Open Serial Port
            </button>
          )}
        </div>
      </div>
      
      <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
        <i className="fa-solid fa-usb text-8xl md:text-9xl text-white"></i>
      </div>
    </div>
  );
};

export default SerialConnect;
