import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { ChevronLeft, BrainCircuit, CloudRain, Calendar, AlertOctagon, TrendingUp, RefreshCw } from 'lucide-react';

// --- Sub-Component: The Factor Card ---
const FactorCard = ({ icon: Icon, title, impact, score }) => (
  <div className="bg-black/40 border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:border-neon-teal/50 transition-all">
    <div className="flex items-center gap-4">
      <div className="p-2 bg-white/5 rounded-lg text-gray-400 group-hover:text-neon-teal transition-colors">
        <Icon size={20} />
      </div>
      <div>
        <div className="text-sm font-bold text-white">{title}</div>
        <div className="text-xs text-gray-500 font-mono">{impact} Impact</div>
      </div>
    </div>
    <div className="text-right">
      <div className={`text-xl font-bold font-mono ${score > 70 ? 'text-red-500' : score > 40 ? 'text-yellow-500' : 'text-green-500'}`}>
        {score}%
      </div>
    </div>
  </div>
);

// --- Main Component ---
const Predictions = () => {
  const [horizon, setHorizon] = useState(24); // 24h, 48h, 72h
  const lineRef = useRef(null);

  // Animation when horizon changes
  useEffect(() => {
    // Animate the graph line redrawing
    gsap.fromTo(".graph-path", 
      { strokeDasharray: 1000, strokeDashoffset: 1000 },
      { strokeDashoffset: 0, duration: 2, ease: "power2.out" }
    );
    
    // Animate the "Confidence" meter
    gsap.fromTo(".confidence-meter",
      { width: "0%" },
      { width: "94%", duration: 1.5, ease: "power2.out", delay: 0.5 }
    );
  }, [horizon]);

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white hover:text-black transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-mono tracking-tighter flex items-center gap-3">
              PREDICTIVE ENGINE <BrainCircuit className="text-neon-teal" size={24} />
            </h1>
            <p className="text-xs text-gray-500 font-mono uppercase">AI Model: Llama-Med-V4 • Training Data: Live</p>
          </div>
        </div>
        
        {/* Time Horizon Slider Controls */}
        <div className="bg-[#111] border border-white/10 p-1 rounded-lg flex gap-1">
            {[24, 48, 72].map((h) => (
                <button 
                    key={h}
                    onClick={() => setHorizon(h)}
                    className={`px-4 py-2 rounded text-sm font-mono transition-all ${horizon === h ? 'bg-neon-teal text-black font-bold shadow-[0_0_15px_rgba(0,242,234,0.4)]' : 'text-gray-500 hover:text-white'}`}
                >
                    +{h}HRS
                </button>
            ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: The Big Graph */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 relative overflow-hidden min-h-[400px]">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp size={18} className="text-neon-teal" /> PATIENT VOLUME FORECAST
                        </h3>
                        <p className="text-sm text-gray-500">Projected influx based on current variables.</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-white font-mono">
                            {horizon === 24 ? '142' : horizon === 48 ? '189' : '256'}
                        </div>
                        <div className="text-xs text-red-400 font-mono">
                            {horizon === 24 ? '+15%' : horizon === 48 ? '+32%' : '+85%'} SURGE
                        </div>
                    </div>
                </div>

                {/* Custom SVG Chart */}
                <div className="relative h-[250px] w-full mt-8">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 border-l border-b border-white/10"></div>
                    <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 border-t border-dashed border-white/10"></div>
                    
                    {/* The Graph Line */}
                    <svg className="w-full h-full overflow-visible">
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#00f2ea" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="#00f2ea" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        {/* Dynamic Path based on horizon */}
                        <path 
                            d={horizon === 24 
                                ? "M0,200 C100,200 150,180 200,150 C300,90 400,120 500,80 C600,40 700,50 800,20" 
                                : horizon === 48
                                ? "M0,200 C100,190 200,180 300,100 C400,50 500,20 800,0"
                                : "M0,200 L800,0"
                            } 
                            fill="url(#gradient)" 
                            className="opacity-20 transition-all duration-1000"
                        />
                        <path 
                            d={horizon === 24 
                                ? "M0,200 C100,200 150,180 200,150 C300,90 400,120 500,80 C600,40 700,50 800,20" 
                                : horizon === 48
                                ? "M0,200 C100,190 200,180 300,100 C400,50 500,20 800,0"
                                : "M0,200 L800,0"
                            }
                            fill="none" 
                            stroke="#00f2ea" 
                            strokeWidth="3" 
                            className="graph-path drop-shadow-[0_0_10px_rgba(0,242,234,0.5)] transition-all duration-1000 ease-out"
                        />
                        
                        {/* Points */}
                        <circle cx="200" cy={horizon === 24 ? "150" : "180"} r="4" fill="#050505" stroke="white" strokeWidth="2" />
                        <circle cx="500" cy={horizon === 24 ? "80" : "20"} r="6" fill="#fff" className="animate-pulse" />
                    </svg>
                    
                    {/* X-Axis Labels */}
                    <div className="flex justify-between text-xs text-gray-600 font-mono mt-2">
                        <span>NOW</span>
                        <span>+{horizon / 2}H</span>
                        <span>+{horizon}H</span>
                    </div>
                </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                 <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                    <AlertOctagon size={16} /> RECOMMENDED ACTIONS
                 </h3>
                 <div className="flex gap-4 overflow-x-auto">
                    <div className="min-w-[200px] bg-black border border-l-4 border-l-neon-teal border-white/10 p-4 rounded hover:bg-white/5 transition-colors">
                        <div className="font-bold text-neon-teal text-sm mb-1">INCREASE STAFFING</div>
                        <div className="text-xs text-gray-400">Call in 3 RNs for Night Shift (Sector 7)</div>
                    </div>
                    <div className="min-w-[200px] bg-black border border-l-4 border-l-yellow-500 border-white/10 p-4 rounded hover:bg-white/5 transition-colors">
                        <div className="font-bold text-yellow-500 text-sm mb-1">SUPPLY CHECK</div>
                        <div className="text-xs text-gray-400">O2 Tank reserves low for predicted influx</div>
                    </div>
                    <div className="min-w-[200px] bg-black border border-l-4 border-l-purple-500 border-white/10 p-4 rounded hover:bg-white/5 transition-colors">
                        <div className="font-bold text-purple-500 text-sm mb-1">VOICE AI CAMPAIGN</div>
                        <div className="text-xs text-gray-400">Auto-call 500 Asthma patients (Air Quality Warning)</div>
                    </div>
                 </div>
            </div>
        </div>

        {/* Right Column: Contributing Factors */}
        <div className="space-y-6">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold">Surge Drivers</h3>
                    <RefreshCw size={14} className="text-gray-500 cursor-pointer hover:rotate-180 transition-transform" />
                </div>
                <div className="space-y-3">
                    <FactorCard icon={CloudRain} title="Weather Front" impact="High" score={85} />
                    <FactorCard icon={Calendar} title="Local Festival" impact="Medium" score={62} />
                    <FactorCard icon={AlertOctagon} title="Flu Strain A" impact="Critical" score={92} />
                </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6">
                <h3 className="font-bold mb-2">Model Confidence</h3>
                <div className="text-5xl font-mono font-bold text-white mb-2">94.2%</div>
                <p className="text-xs text-gray-500 mb-4">Based on historical validation of last 50 events.</p>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="confidence-meter h-full bg-neon-teal shadow-[0_0_10px_#00f2ea]"></div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Predictions;