import React from 'react';

interface Props {
  onBack: () => void;
}

const GuidesPage: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-stone-950 text-white p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-emerald-500 font-black uppercase tracking-widest hover:text-emerald-400 transition-colors mb-8 group"
        >
          <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
          Back to Dashboard
        </button>

        <header className="mb-12 border-l-8 border-emerald-600 pl-6">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">System Guides</h1>
          <p className="text-stone-500 font-bold uppercase tracking-widest text-sm md:text-base">Hardware & Software Integration</p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {/* Direct Jumper Wiring (No Breadboard) */}
          <section className="bg-stone-900 rounded-[30px] p-8 border border-white/5 shadow-2xl overflow-hidden">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6 text-white flex items-center gap-3">
              <i className="fa-solid fa-bolt text-yellow-500"></i>
              Direct Jumper Wiring (No Breadboard)
            </h2>
            
            <p className="text-[11px] font-bold text-stone-400 mb-6 leading-relaxed">
              If you don't have a breadboard, use <span className="text-white">Female-to-Male Jumper Wires</span> to connect the boards directly.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                <h3 className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-4">Step 1: Power & Ground</h3>
                <ul className="text-xs font-bold text-stone-300 space-y-3">
                  <li className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                    <span>Arduino <span className="text-red-500">5V</span></span>
                    <span className="text-stone-500">→</span>
                    <span>ESP32 <span className="text-red-500">5V / VCC</span></span>
                  </li>
                  <li className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                    <span>Arduino <span className="text-blue-500">GND</span></span>
                    <span className="text-stone-500">→</span>
                    <span>ESP32 <span className="text-blue-500">GND</span></span>
                  </li>
                </ul>
              </div>

              <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                <h3 className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-4">Step 2: Communication</h3>
                <ul className="text-xs font-bold text-stone-300 space-y-3">
                  <li className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                    <span>Arduino <span className="text-emerald-500">Pin 0 (RX)</span></span>
                    <span className="text-stone-500">→</span>
                    <span>ESP32 <span className="text-emerald-500">U0T (TX)</span></span>
                  </li>
                  <li className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                    <span>Arduino <span className="text-emerald-500">Pin 1 (TX)</span></span>
                    <span className="text-stone-500">→</span>
                    <span>ESP32 <span className="text-emerald-500">U0R (RX)</span></span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 bg-red-600/10 border-2 border-red-500/20 rounded-[25px]">
            <h3 className="text-white font-black uppercase text-sm mb-3 flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation text-red-500"></i>
              For Uploading via Jumper Wires
            </h3>
            <p className="text-stone-400 text-xs font-bold leading-relaxed mb-4">
              If you are using the Arduino as a programmer (No Breadboard), you still need these 2 connections:
            </p>
            <ul className="text-[10px] font-black text-white uppercase space-y-2">
              <li>• <span className="text-red-500">ARDUINO:</span> Connect <span className="bg-white/10 px-2 py-0.5 rounded">RESET</span> to <span className="bg-white/10 px-2 py-0.5 rounded">GND</span> using a small wire loop.</li>
              <li>• <span className="text-red-500">ESP32:</span> Connect <span className="bg-white/10 px-2 py-0.5 rounded">GPIO 0</span> to <span className="bg-white/10 px-2 py-0.5 rounded">GND</span> (Use a female-to-female jumper).</li>
            </ul>
          </div>

          <div className="mt-4 p-6 bg-blue-600/10 border-2 border-blue-500/20 rounded-[25px]">
            <h3 className="text-white font-black uppercase text-sm mb-3 flex items-center gap-2">
              <i className="fa-solid fa-signal text-blue-500"></i>
              Camera Lag & Multi-Device Fix
            </h3>
            <p className="text-stone-400 text-xs font-bold leading-relaxed">
              The ESP32-CAM is power-hungry. If the stream is laggy or stops when 2 devices connect:
            </p>
            <ul className="text-[10px] font-bold text-white uppercase mt-3 space-y-1">
              <li>• Use a <span className="text-blue-500">dedicated 5V 2A power adapter</span> for the ESP32 if possible.</li>
              <li>• Ensure your WiFi router is close to the camera.</li>
              <li>• Avoid using "SVGA" or "UXGA" resolutions in the code.</li>
            </ul>
          </div>
          </section>

          {/* Physical Wiring Map */}
          <section className="bg-stone-900 rounded-[30px] p-8 border border-white/5 shadow-2xl overflow-hidden">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6 text-white flex items-center gap-3">
              <i className="fa-solid fa-diagram-project text-blue-500"></i>
              Full System Connection Map
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-blue-600/10 border border-blue-500/30 p-5 rounded-2xl">
                  <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3">ESP32 <i className="fa-solid fa-arrows-left-right"></i> Arduino (Bridge)</h3>
                  <ul className="text-[11px] font-bold text-stone-300 space-y-2">
                    <li className="flex justify-between border-b border-white/5 pb-2">
                      <span>ESP32 <span className="text-blue-500">U0T (TX)</span></span>
                      <span className="text-white">→</span>
                      <span>Arduino <span className="text-blue-500">Pin 0 (RX)</span></span>
                    </li>
                    <li className="flex justify-between border-b border-white/5 pb-2">
                      <span>ESP32 <span className="text-blue-500">U0R (RX)</span></span>
                      <span className="text-white">→</span>
                      <span>Arduino <span className="text-blue-500">Pin 1 (TX)</span></span>
                    </li>
                    <li className="text-orange-500 italic mt-2">Note: Cross-connect TX to RX for data flow.</li>
                  </ul>
                </div>

                <div className="bg-emerald-600/10 border border-emerald-500/30 p-5 rounded-2xl">
                  <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-3">SIM800L <i className="fa-solid fa-arrows-left-right"></i> Arduino (SMS)</h3>
                  <ul className="text-[11px] font-bold text-stone-300 space-y-2">
                    <li className="flex justify-between border-b border-white/5 pb-2">
                      <span>SIM <span className="text-emerald-500">TX</span></span>
                      <span className="text-white">→</span>
                      <span>Arduino <span className="text-emerald-500">Pin 3 (RX)</span></span>
                    </li>
                    <li className="flex justify-between border-b border-white/5 pb-2">
                      <span>SIM <span className="text-emerald-500">RX</span></span>
                      <span className="text-white">→</span>
                      <span>Arduino <span className="text-emerald-500">Pin 2 (TX)</span></span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-red-600/10 border-2 border-red-500/40 p-6 rounded-[30px] flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-2xl animate-pulse">
                    <i className="fa-solid fa-triangle-exclamation text-white"></i>
                  </div>
                  <h3 className="text-lg font-black text-white uppercase leading-none">Critical Upload Rule</h3>
                </div>
                <p className="text-[11px] font-bold text-stone-300 leading-relaxed">
                  Because the <span className="text-white underline">ESP32</span> and <span className="text-white underline">SIM800L</span> are physically connected to the Arduino's communication pins:
                </p>
                <div className="mt-4 space-y-3">
                  <div className="bg-black/40 p-3 rounded-xl border border-red-500/20">
                    <p className="text-[10px] text-red-400 font-black uppercase mb-1">Step 1:</p>
                    <p className="text-[10px] text-white">Unplug wires from <span className="font-black">Pins 0 and 1</span> before clicking Upload in Arduino IDE.</p>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-red-500/20">
                    <p className="text-[10px] text-red-400 font-black uppercase mb-1">Step 2:</p>
                    <p className="text-[10px] text-white">Wait for "Done Uploading", then plug them back in.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* WiFi & Camera Guide */}
          <section className="bg-stone-900 rounded-[30px] p-8 border border-white/5 shadow-2xl">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6 text-white flex items-center gap-3">
              <i className="fa-solid fa-wifi text-orange-500"></i>
              Wireless Arduino Connectivity
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <p className="text-[11px] font-bold text-stone-400 leading-relaxed">
                  The Arduino Uno connects wirelessly to the dashboard by using the <span className="text-white">ESP32-CAM as a Bridge</span>. The Arduino sends sensor data to the ESP32, which then broadcasts it over WiFi.
                </p>
                <div>
                <h3 className="text-sm font-black text-orange-500 uppercase tracking-widest mb-3">Multi-Breadboard Setup</h3>
                <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                  <p className="text-[11px] text-stone-400 mb-3 leading-relaxed">
                    If using a <span className="text-white">Half Breadboard</span> (Sensors/Servos) and a <span className="text-white">Whole Breadboard</span> (ESP32/SIM800L), you MUST bridge them:
                  </p>
                  <ul className="text-xs font-bold text-stone-300 space-y-3">
                    <li>1. <span className="text-blue-500">Bridge GND:</span> Run a jumper from the Blue Rail of the Half board to the Blue Rail of the Whole board.</li>
                    <li>2. <span className="text-red-500">Bridge 5V:</span> Run a jumper from the Red Rail of the Half board to the Red Rail of the Whole board.</li>
                    <li className="text-orange-400 italic font-black">Without this bridge, the Arduino cannot read the sensors or talk to the SIM800L!</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black text-orange-500 uppercase tracking-widest mb-3">Option 1: Hotspot Mode (Default)</h3>
                  <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                    <ul className="text-xs font-bold text-stone-300 space-y-3">
                      <li>• Connect phone to WiFi: <span className="text-white">APULA_RECOVERY</span></li>
                      <li>• Password: <span className="text-white">FireSafe2026</span></li>
                      <li>• In the App, enter IP: <span className="text-white">192.168.4.1</span></li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-orange-500 uppercase tracking-widest mb-3">Option 2: Existing WiFi</h3>
                  <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                    <p className="text-[11px] text-stone-400 mb-3 leading-relaxed">
                      If you put your own WiFi credentials in the ESP32 code:
                    </p>
                    <ul className="text-xs font-bold text-stone-300 space-y-3">
                      <li>1. Open Arduino Serial Monitor (115200 baud).</li>
                      <li>2. Look for <span className="text-emerald-500">"Local IP: 192.168.X.X"</span>.</li>
                      <li>3. Enter that <span className="text-white">exact IP address</span> in the App's WiFi field.</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-orange-500 uppercase tracking-widest mb-3">Option 3: Wired (Direct USB)</h3>
                  <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                    <p className="text-[11px] text-stone-400 mb-3 leading-relaxed">
                      Connect the ESP32 or Arduino directly via USB:
                    </p>
                    <ul className="text-xs font-bold text-stone-300 space-y-3">
                      <li>• Open the <span className="text-emerald-500">"Wired Hub"</span> panel.</li>
                      <li>• Click <span className="text-white">"Open Serial Port"</span>.</li>
                      <li>• Select your device from the browser popup.</li>
                      <li>• High-speed data sync starts instantly.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-orange-500/5 border-2 border-orange-500/20 rounded-[30px] p-6">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-shield-halved text-orange-500"></i>
                  Critical: HTTPS Security
                </h3>
                <p className="text-[11px] font-bold text-stone-400 leading-relaxed mb-4">
                  Modern browsers (Chrome/Safari) block local network connections on HTTPS websites like GitHub Pages.
                </p>
                <div className="space-y-3">
                  <div className="bg-orange-600/20 p-4 rounded-xl border border-orange-500/30">
                    <p className="text-[10px] font-black text-white uppercase mb-1">Recommended Fix:</p>
                    <p className="text-[10px] text-stone-300">Use the <span className="text-white">Windows EXE</span> or <span className="text-white">Android App</span>. They do not have this security restriction and connect instantly.</p>
                  </div>
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                    <p className="text-[10px] font-black text-white uppercase mb-1">How to build Windows EXE:</p>
                    <p className="text-[10px] text-stone-300">Run <code className="text-orange-500 font-bold">npm run electron:build</code> in your terminal. The file will be in the <span className="text-white">/release</span> folder.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Troubleshooting Section */}
          <section className="bg-red-950/20 rounded-[30px] p-8 border border-red-500/30">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4 text-white flex items-center gap-3">
              <i className="fa-solid fa-bug text-red-500"></i>
              Fix: "No serial data received"
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <p className="text-red-500 font-black text-[10px] uppercase tracking-widest">Check these 4 things immediately:</p>
                <div className="bg-black/40 p-4 rounded-xl border border-red-500/10">
                  <p className="text-stone-300 text-[11px] font-bold leading-relaxed">
                    1. <span className="text-white">Uno RESET to GND:</span> Is there a wire connecting RESET and GND on the Arduino Uno? (Mandatory for bridge mode).<br/><br/>
                    2. <span className="text-white">GPIO 0 to GND:</span> Is the ESP32 GPIO 0 pin connected to GND? (Mandatory for flash mode).<br/><br/>
                    3. <span className="text-white">No Crossing:</span> In Bridge Mode, connect <span className="text-white">Uno RX to ESP32 RX</span> and <span className="text-white">Uno TX to ESP32 TX</span>.<br/><br/>
                    4. <span className="text-white">The "RST" Trick:</span> When you see <span className="italic text-orange-500">"Connecting..."</span> in Arduino IDE, press and release the <span className="text-white">RST button</span> on the back of the ESP32-CAM.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-red-500 font-black text-[10px] uppercase tracking-widest">Arduino IDE Settings:</p>
                <div className="bg-black/40 p-4 rounded-xl border border-red-500/10">
                  <p className="text-stone-300 text-[11px] font-bold leading-relaxed">
                    • <span className="text-white">Board:</span> "AI Thinker ESP32-CAM"<br/>
                    • <span className="text-white">Baud Rate:</span> 115200<br/>
                    • <span className="text-white">Flash Mode:</span> DIO<br/>
                    • <span className="text-white">Partition Scheme:</span> Huge APP (3MB No OTA)
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Arduino Uno Node Guide */}
          <section className="bg-orange-600 rounded-[40px] p-8 md:p-12 text-white shadow-2xl shadow-orange-600/20">
            <header className="mb-10">
              <div className="bg-white/20 w-16 h-16 rounded-3xl flex items-center justify-center mb-6">
                <i className="fa-solid fa-microchip text-3xl"></i>
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Arduino UNO Node</h2>
              <p className="text-orange-100 font-bold uppercase tracking-widest text-sm">Analog Sensors + Local Dashboard Monitoring</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/10 rounded-[30px] p-6 border border-white/10">
                <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-3">
                  <i className="fa-solid fa-download"></i>
                  1. Setup
                </h3>
                <ul className="space-y-3 text-orange-100 font-bold text-sm">
                  <li className="bg-orange-700/50 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                    Flash your Arduino with the **Analog Sensor Firmware**.
                  </li>
                  <li className="bg-orange-700/50 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                    Connect 3 Analog Sensors to Pins **A0, A1, A2**.
                  </li>
                  <li className="bg-orange-700/50 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                    Connect the USB/Serial cable to your computer.
                  </li>
                </ul>
              </div>

              <div className="bg-white/10 rounded-[30px] p-6 border border-white/10">
                <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-3">
                  <i className="fa-solid fa-signal"></i>
                  2. Connectivity
                </h3>
                <ul className="space-y-3 text-orange-100 font-bold text-sm">
                  <li className="bg-orange-700/50 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                    Open the **Arduino Hub** panel on the dashboard.
                  </li>
                  <li className="bg-orange-700/50 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                    Select your Serial Port and Baud Rate (9600).
                  </li>
                  <li className="bg-orange-700/50 rounded-xl p-3 flex items-center gap-3 border border-white/5">
                    The Dashboard will start graphing real-time data.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Wiring Guide */}
          <section className="bg-stone-900 rounded-[30px] p-8 border border-white/5 relative overflow-hidden group">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6 text-white flex items-center gap-3">
              <i className="fa-solid fa-plug text-orange-500"></i>
              Hardware Wiring & Logic
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                <p className="text-orange-500 font-black mb-2 uppercase text-xs tracking-widest">Flame Sensors</p>
                <p className="text-stone-400 text-xs font-bold leading-relaxed">
                  <span className="text-white">Pins:</span> A0, A1, A2 (Analog)<br/>
                  <span className="text-white">Voltage:</span> 5V VCC / GND
                </p>
              </div>
              <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                <p className="text-orange-500 font-black mb-2 uppercase text-xs tracking-widest">Alerts (Buzzer)</p>
                <p className="text-stone-400 text-xs font-bold leading-relaxed">
                  <span className="text-white">Arduino UNO:</span> Digital Pin 5<br/>
                  <span className="text-white">Status LED:</span> Pin 13
                </p>
              </div>
              <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                <p className="text-orange-500 font-black mb-2 uppercase text-xs tracking-widest">Dashboard Sync</p>
                <p className="text-stone-400 text-xs font-bold leading-relaxed">
                  Analog values are normalized to <span className="text-white">0-100%</span> for the real-time graph.
                </p>
              </div>
            </div>

            {/* Sensor Placement Tip */}
            <div className="mt-8 p-6 bg-orange-600/10 border-2 border-orange-600/20 rounded-[25px] flex flex-col md:flex-row gap-6 items-center">
              <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl shrink-0 shadow-lg">
                <i className="fa-solid fa-compass"></i>
              </div>
              <div>
                <h3 className="text-white font-black uppercase text-sm mb-1">Placement Optimization</h3>
                <p className="text-stone-400 text-xs font-bold leading-relaxed">
                  For maximum coverage, do not place sensors facing the same way. Angle <span className="text-white">Sensor 1 (Left)</span>, <span className="text-white">Sensor 2 (Center)</span>, and <span className="text-white">Sensor 3 (Right)</span>. This creates a 180° "Safety Curtain" that prevents blind spots in your fire detection grid.
                </p>
              </div>
            </div>
          </section>

          {/* Wireless Configuration */}
          <section className="bg-stone-900 rounded-[30px] p-8 border border-white/5">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4 text-white flex items-center gap-3">
              <i className="fa-solid fa-wifi text-orange-500"></i>
              Interactive WiFi Setup
            </h2>
            <p className="text-stone-400 text-sm font-bold mb-6">
              You can now configure your Arduino's WiFi connection directly from the dashboard:
            </p>
            <div className="space-y-4">
              <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-black shrink-0">1</div>
                  <div>
                    <p className="text-white font-black text-sm uppercase">Connect to Hub</p>
                    <p className="text-stone-500 text-[11px] font-bold">First, link your phone to the Arduino's current IP address via the "Arduino Hub" panel.</p>
                  </div>
                </div>
              </div>
              <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-black shrink-0">2</div>
                  <div>
                    <p className="text-white font-black text-sm uppercase">Enter Credentials</p>
                    <p className="text-stone-500 text-[11px] font-bold">Type your home/office WiFi name and password into the "Provision WiFi" fields.</p>
                  </div>
                </div>
              </div>
              <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-black shrink-0">3</div>
                  <div>
                    <p className="text-white font-black text-sm uppercase">Sync Hardware</p>
                    <p className="text-stone-500 text-[11px] font-bold">Click "Update Arduino WiFi". The system will send the new credentials and restart the Arduino's wireless chip.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* New Troubleshooting commands section */}
            <div className="mt-10 p-6 bg-red-950/20 border-2 border-red-500/20 rounded-[30px]">
              <h3 className="text-sm font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <i className="fa-solid fa-terminal"></i>
                Serial Debug Commands
              </h3>
              <p className="text-[11px] font-bold text-stone-400 mb-4 leading-relaxed">
                If the ESP32 cannot connect to your WiFi, open the Arduino Serial Monitor (115200) and type these commands:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-black/40 p-4 rounded-xl border border-white/5">
              <code className="text-emerald-500 font-black text-xs block mb-1">WIFI_SCAN</code>
              <p className="text-[10px] text-stone-500">Shows all available WiFi networks visible to the ESP32.</p>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
              <code className="text-cyan-500 font-black text-xs block mb-1">WIFI_STATUS</code>
              <p className="text-[10px] text-stone-500">Shows current connection status and IP address.</p>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
              <code className="text-orange-500 font-black text-xs block mb-1">WIFI_RESET</code>
              <p className="text-[10px] text-stone-500">Clears saved credentials and restarts the hotspot.</p>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
              <code className="text-blue-500 font-black text-xs block mb-1">SET_WIFI:name,pass</code>
              <p className="text-[10px] text-stone-500">Manually set new WiFi name and password via Serial.</p>
            </div>
          </div>
        </div>

        {/* IP Finding Guide */}
        <div className="mt-6 p-6 bg-stone-900 border-2 border-white/5 rounded-[30px]">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <i className="fa-solid fa-network-wired"></i>
            How to Connect via Internet/Router
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0">1</div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Connect the ESP32 to your home WiFi using the <code className="text-orange-500 font-bold">SET_WIFI</code> command in the Serial Monitor.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0">2</div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Type <code className="text-cyan-500 font-bold">WIFI_STATUS</code> to see the assigned <span className="text-white">Local IP</span> (e.g., 192.168.1.50).
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0">3</div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Ensure your computer/phone is on the <span className="text-white">SAME WiFi</span> as the ESP32.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0">4</div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Enter that <span className="text-white">IP Address</span> into the "Connection Address" field on the dashboard.
              </p>
            </div>
          </div>
        </div>
          </section>

          {/* ESP32-CAM Configuration */}
          <section className="bg-stone-900 rounded-[30px] p-8 border border-white/5">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4 text-white flex items-center gap-3">
              <i className="fa-solid fa-camera text-orange-500"></i>
              ESP32-CAM Video Link
            </h2>
            <p className="text-stone-400 text-sm font-bold mb-6">
              The ESP32-CAM acts as a wireless video bridge and system hotspot.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                <p className="text-orange-500 font-black text-[10px] tracking-widest uppercase mb-4">Wiring Diagram</p>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-stone-400">Arduino 5V</span>
                    <i className="fa-solid fa-arrow-right text-stone-700"></i>
                    <span className="text-white">ESP32-CAM 5V</span>
                  </li>
                  <li className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-stone-400">Arduino GND</span>
                    <i className="fa-solid fa-arrow-right text-stone-700"></i>
                    <span className="text-white">ESP32-CAM GND</span>
                  </li>
                  <li className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-stone-400">Arduino TX (1)</span>
                    <i className="fa-solid fa-arrow-right text-stone-700"></i>
                    <span className="text-white">ESP32-CAM RX</span>
                  </li>
                </ul>
              </div>
              <div className="bg-red-950/40 p-6 rounded-2xl border border-red-500/20 mb-4">
                <p className="text-red-500 font-black text-[10px] tracking-widest uppercase mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  Thermal Safety Warning
                </p>
                <p className="text-stone-400 text-[11px] font-bold leading-relaxed">
                  Unplug if board is hot! Never put 5V into the 3.3V pin. Ensure camera ribbon is locked straight.
                </p>
              </div>
              
              <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                 <p className="text-orange-500 font-black text-[10px] tracking-widest uppercase mb-4">Arduino Bridge Mode (Upload Only)</p>
                 
                 <div className="space-y-6">
                   {/* Power Section */}
                   <div>
                     <p className="text-white font-black text-[10px] uppercase mb-3 border-b border-white/10 pb-1">Power Section</p>
                     <div className="space-y-2">
                       <p className="text-stone-500 text-[11px] font-bold leading-relaxed flex items-center gap-3">
                         <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0"></span>
                         <span>Uno <span className="text-white">RESET</span> to Uno <span className="text-white">GND (Any)</span> (Blue)</span>
                       </p>
                       <p className="text-stone-500 text-[11px] font-bold leading-relaxed flex items-center gap-3">
                         <span className="w-3 h-3 rounded-full bg-red-500 shrink-0"></span>
                         <span>Uno <span className="text-white">5V</span> to ESP32 <span className="text-white">5V</span> (Red)</span>
                       </p>
                       <p className="text-stone-500 text-[11px] font-bold leading-relaxed flex items-center gap-3">
                         <span className="w-3 h-3 rounded-full bg-black shrink-0 border border-white/20"></span>
                         <span>Uno <span className="text-white">GND (Any)</span> to ESP32 <span className="text-white">GND</span> (Black)</span>
                       </p>
                     </div>
                   </div>

                   {/* Digital Pins Section */}
                   <div>
                     <p className="text-white font-black text-[10px] uppercase mb-3 border-b border-white/10 pb-1">Digital Pins Section</p>
                     <div className="space-y-2">
                       <p className="text-stone-500 text-[11px] font-bold leading-relaxed flex items-center gap-3">
                         <span className="w-3 h-3 rounded-full bg-green-500 shrink-0"></span>
                         <span>Uno <span className="text-white">RX (0)</span> to ESP32 <span className="text-white">RX (3)</span> (Green)</span>
                       </p>
                       <p className="text-stone-500 text-[11px] font-bold leading-relaxed flex items-center gap-3">
                         <span className="w-3 h-3 rounded-full bg-yellow-500 shrink-0"></span>
                         <span>Uno <span className="text-white">TX (1)</span> to ESP32 <span className="text-white">TX (1)</span> (Yellow)</span>
                       </p>
                     </div>
                   </div>

                   {/* Analog In Section */}
                   <div>
                     <p className="text-white font-black text-[10px] uppercase mb-3 border-b border-white/10 pb-1">Analog In Section</p>
                     <p className="text-stone-500 text-[11px] font-bold leading-relaxed">
                       * Keep <span className="text-white">A0, A1, A2</span> empty during ESP32 flash.
                     </p>
                   </div>

                   {/* ESP32 Specific */}
                    <div className="bg-white/5 p-4 rounded-xl space-y-3">
                      <p className="text-white font-black text-[10px] uppercase mb-1 border-b border-white/10 pb-1">ESP32-CAM Pin Locations</p>
                      <p className="text-stone-500 text-[11px] font-bold leading-relaxed flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-red-500 shrink-0"></span>
                        <span><span className="text-white">5V Pin:</span> Top Left Corner</span>
                      </p>
                      <p className="text-stone-500 text-[11px] font-bold leading-relaxed flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-black shrink-0 border border-white/20"></span>
                        <span><span className="text-white">GND Pin:</span> 2nd pin on the Left (below 5V)</span>
                      </p>
                      <p className="text-stone-500 text-[11px] font-bold leading-relaxed flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0"></span>
                        <span><span className="text-white">U0R (RX):</span> 3rd pin on the Right side</span>
                      </p>
                      <p className="text-stone-500 text-[11px] font-bold leading-relaxed flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0"></span>
                        <span><span className="text-white">U0T (TX):</span> 4th pin on the Right side</span>
                      </p>
                      <p className="text-stone-500 text-[11px] font-bold leading-relaxed flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-white shrink-0"></span>
                        <span><span className="text-white">GPIO 0:</span> 6th pin on the Right side</span>
                      </p>
                    </div>
                 </div>
               </div>
            </div>
          </section>

          {/* Integration Testing */}
          <section className="bg-emerald-900/20 rounded-[30px] p-8 border border-emerald-500/20">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4 text-white flex items-center gap-3">
              <i className="fa-solid fa-vial text-emerald-500"></i>
              System Integration Test
            </h2>
            <p className="text-stone-400 text-sm font-bold mb-6">
              Follow these steps to verify communication between Arduino, ESP32, and the Dashboard:
            </p>
            <div className="space-y-4">
              <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                <p className="text-emerald-500 font-black text-[10px] tracking-widest uppercase mb-2">1. Transition to Run Mode</p>
                <p className="text-stone-300 text-[11px] font-bold leading-relaxed">
                  • Disconnect <span className="text-white">GPIO 0 from GND</span> (Remove Jumper)<br/>
                  • Disconnect Uno <span className="text-white">RESET from GND</span><br/>
                  • <span className="text-orange-500 italic">Cross the wires:</span> Uno Pin 0 (RX) to ESP32 TX, Uno Pin 1 (TX) to ESP32 RX.
                </p>
              </div>
              <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                <p className="text-emerald-500 font-black text-[10px] tracking-widest uppercase mb-2">2. Power & Reset</p>
                <p className="text-stone-300 text-[11px] font-bold leading-relaxed">
                  Press the <span className="text-white">RST button</span> on the back of the ESP32-CAM. The small built-in LED should flash briefly.
                </p>
              </div>
              <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                <p className="text-emerald-500 font-black text-[10px] tracking-widest uppercase mb-2">3. Dashboard Check</p>
                <p className="text-stone-300 text-[11px] font-bold leading-relaxed">
                  Connect to <span className="text-white">APULA_FIRE_SYSTEM</span> WiFi, click "Connect" in the dashboard. You should see the sensor values jump between 0% and 100% automatically.
                </p>
              </div>
            </div>
          </section>

          {/* GSM & SMS Alert System */}
          <section className="bg-stone-900 rounded-[30px] p-8 border border-white/5">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4 text-white flex items-center gap-3">
              <i className="fa-solid fa-tower-cell text-orange-500"></i>
              GSM & SMS Alert System
            </h2>
            <p className="text-stone-400 text-sm font-bold mb-6">
              The APULA system uses a SIM800L module to provide emergency communication even without internet access.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                <p className="text-orange-500 font-black text-[10px] tracking-widest uppercase mb-4">SIM800L Wiring</p>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-stone-400">Arduino 5V</span>
                    <i className="fa-solid fa-arrow-right text-stone-700"></i>
                    <span className="text-white">SIM800L VCC (5V)</span>
                  </li>
                  <li className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-stone-400">Arduino GND</span>
                    <i className="fa-solid fa-arrow-right text-stone-700"></i>
                    <span className="text-white">SIM800L GND</span>
                  </li>
                  <li className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-stone-400">Arduino Pin 2 (TX)</span>
                    <i className="fa-solid fa-arrow-right text-stone-700"></i>
                    <span className="text-white">SIM800L RX</span>
                  </li>
                  <li className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-stone-400">Arduino Pin 3 (RX)</span>
                    <i className="fa-solid fa-arrow-right text-stone-700"></i>
                    <span className="text-white">SIM800L TX</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="bg-orange-500/5 border border-orange-500/20 p-6 rounded-2xl">
                  <p className="text-orange-500 font-black uppercase text-[10px] tracking-widest mb-2">System Response</p>
                  <ul className="text-xs font-bold text-stone-300 space-y-2">
                    <li>• Trigger: <span className="text-white">Flame Detection &gt; 50%</span></li>
                    <li>• SMS: <span className="text-white">"ALERT: FIRE DETECTED!"</span></li>
                    <li>• Voice: <span className="text-white">Automated Emergency Call</span></li>
                  </ul>
                </div>
                <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl">
                  <p className="text-blue-500 font-black text-[10px] tracking-widest uppercase mb-1 flex items-center gap-2">
                    <i className="fa-solid fa-info-circle"></i>
                    Dashboard Sync
                  </p>
                  <p className="text-[10px] text-stone-400 font-bold leading-relaxed">
                    Update the target phone number directly from the <span className="text-white">GSM Settings</span> panel on the dashboard.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-16 pb-12 text-center text-stone-600 font-bold uppercase tracking-[0.4em] text-[10px]">
          APULA // System Documentation // v2.8.0
        </footer>
      </div>
    </div>
  );
};

export default GuidesPage;
