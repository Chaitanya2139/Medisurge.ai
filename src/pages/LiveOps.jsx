import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ChevronLeft, MapPin, Phone, Wifi, Mic, ShieldAlert, Activity } from 'lucide-react';

// --- COMPONENT: AI Voice Agent Visualizer ---
const VoiceNode = ({ id, status, sentiment, duration }) => {
  return (
    <div className="bg-black/40 border border-white/10 p-3 rounded-lg mb-3 flex items-center justify-between group hover:border-neon-teal/50 transition-all">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${status === 'Active' ? 'bg-neon-teal/20 text-neon-teal animate-pulse' : 'bg-gray-800 text-gray-500'}`}>
          <Mic size={16} />
        </div>
        <div>
          <div className="text-xs font-mono text-gray-400">PATIENT ID: {id}</div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            {status} 
            {status === 'Active' && <span className="flex gap-0.5 h-3 items-end">
              {[1,2,3,4].map(i => (
                <span key={i} className="w-0.5 bg-neon-teal animate-[bounce_1s_infinite]" style={{height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s`}}></span>
              ))}
            </span>}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-gray-500 font-mono">{duration}</div>
        <div className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${sentiment === 'Calm' ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'}`}>
          {sentiment}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: Interactive Surge Map ---
const SurgeMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Pulse animation for hot zones
    gsap.to(".hot-zone", {
      scale: 1.5,
      opacity: 0,
      duration: 2,
      repeat: -1,
      transformOrigin: "center",
      ease: "power1.out"
    });
  }, []);

  return (
    <div className="relative w-full h-full bg-[#050505] rounded-xl overflow-hidden border border-white/10 group">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* Abstract City Map SVG */}
      <svg ref={mapRef} viewBox="0 0 800 600" className="w-full h-full opacity-60 group-hover:opacity-80 transition-opacity duration-500">
        {/* City Sectors */}
        <path d="M100,100 L300,100 L350,250 L150,300 Z" fill="none" stroke="#333" strokeWidth="2" />
        <path d="M320,100 L600,80 L650,300 L370,260 Z" fill="none" stroke="#333" strokeWidth="2" />
        <path d="M150,320 L350,270 L400,500 L100,550 Z" fill="none" stroke="#333" strokeWidth="2" />
        <path d="M370,280 L650,320 L700,500 L420,520 Z" fill="none" stroke="#333" strokeWidth="2" />
        
        {/* Connecting Lines */}
        <line x1="325" y1="175" x2="485" y2="190" stroke="#00f2ea" strokeWidth="1" strokeDasharray="5,5" className="opacity-30" />
        <line x1="250" y1="410" x2="560" y2="410" stroke="#00f2ea" strokeWidth="1" strokeDasharray="5,5" className="opacity-30" />

        {/* Hot Zones (Red Circles) */}
        <g transform="translate(250, 410)">
            <circle r="8" fill="#ef4444" />
            <circle className="hot-zone" r="8" fill="#ef4444" opacity="0.5" />
            <text x="15" y="5" fill="white" fontSize="12" fontFamily="monospace">SECTOR 7 (CRITICAL)</text>
        </g>
        
        <g transform="translate(485, 190)">
            <circle r="6" fill="#eab308" />
            <circle className="hot-zone" r="6" fill="#eab308" opacity="0.5" />
            <text x="15" y="5" fill="white" fontSize="12" fontFamily="monospace">UPTOWN (WARNING)</text>
        </g>

        {/* Hospitals (Blue Crosses) */}
        <text x="200" y="200" fill="#00f2ea" fontSize="16" fontWeight="bold">+</text>
        <text x="550" y="450" fill="#00f2ea" fontSize="16" fontWeight="bold">+</text>
        <text x="450" y="120" fill="#00f2ea" fontSize="16" fontWeight="bold">+</text>
      </svg>

      {/* Floating HUD Elements */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur border border-white/20 p-3 rounded text-xs font-mono">
        <div className="flex items-center gap-2 text-neon-teal mb-1">
          <Wifi size={12} className="animate-pulse" /> SATELLITE LINK ESTABLISHED
        </div>
        <div className="text-gray-400">LAT: 28.6139° N | LON: 77.2090° E</div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const LiveOps = () => {
  const [activeCalls, setActiveCalls] = useState(124);

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans flex flex-col h-screen overflow-hidden">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white hover:text-black transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-mono tracking-tighter text-white">LIVE OPERATIONS</h1>
            <p className="text-xs text-gray-500 font-mono uppercase">Geospatial Surveillance & Communication Node</p>
          </div>
        </div>
        <div className="flex gap-6 text-sm font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400">SURGE DETECTED</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-neon-teal" />
            <span className="text-neon-teal">{activeCalls} ACTIVE AGENTS</span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        
        {/* Left Column: Interactive Map */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex-1 relative">
             <SurgeMap />
          </div>
          
          {/* Quick Actions Panel */}
          <div className="h-32 bg-[#0A0A0A] border border-white/10 rounded-xl p-4 flex gap-4 overflow-x-auto">
             <div className="min-w-[200px] bg-red-900/10 border border-red-500/30 p-3 rounded hover:bg-red-900/20 cursor-pointer transition-colors">
                <div className="flex items-center gap-2 text-red-400 font-bold mb-1 text-sm"><ShieldAlert size={16}/> DEPLOY AMBULANCE</div>
                <div className="text-xs text-gray-400">Sector 7 Requesting 3 Units</div>
             </div>
             <div className="min-w-[200px] bg-blue-900/10 border border-blue-500/30 p-3 rounded hover:bg-blue-900/20 cursor-pointer transition-colors">
                <div className="flex items-center gap-2 text-blue-400 font-bold mb-1 text-sm"><Activity size={16}/> DIVERT PATIENTS</div>
                <div className="text-xs text-gray-400">Reroute incoming traffic to North Wing</div>
             </div>
          </div>
        </div>

        {/* Right Column: AI Voice Agent Center */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-0 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
            <h3 className="font-bold font-mono flex items-center gap-2">
                <Mic className="text-neon-teal" size={18} /> VOICE AGENT SWARM
            </h3>
            <span className="text-[10px] bg-neon-teal text-black px-2 py-0.5 rounded font-bold">LIVE</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <VoiceNode id="8821" status="Active" sentiment="Anxious" duration="00:42" />
            <VoiceNode id="9923" status="Active" sentiment="Calm" duration="02:15" />
            <VoiceNode id="1102" status="Connecting..." sentiment="-" duration="00:00" />
            <VoiceNode id="7732" status="Completed" sentiment="Relieved" duration="04:20" />
            <VoiceNode id="6654" status="Active" sentiment="Critical" duration="01:10" />
            <VoiceNode id="5543" status="Active" sentiment="Calm" duration="03:00" />
            <VoiceNode id="2211" status="Completed" sentiment="Neutral" duration="01:45" />
          </div>

          <div className="p-4 border-t border-white/10 bg-white/5">
            <div className="text-xs text-gray-500 mb-2 font-mono">SYSTEM CAPACITY</div>
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-neon-teal w-[75%]"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LiveOps;