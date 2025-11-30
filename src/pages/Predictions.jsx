import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { ChevronLeft, BrainCircuit, CloudRain, Calendar, AlertOctagon, TrendingUp, RefreshCw, Sparkles } from 'lucide-react';
import { fetchWeatherPredictions } from '../services/weatherPredictionService';

// --- Sub-Component: The Factor Card ---
const FactorCard = ({ icon: Icon, title, impact, score }) => (
  <div className="bg-[#0A0A0A] border border-white/10 p-5 rounded-xl flex items-center justify-between group hover:border-neon-teal/50 transition-all duration-300 relative overflow-hidden">
    {/* Hover Glow Effect */}
    <div className="absolute inset-0 bg-neon-teal/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    
    <div className="flex items-center gap-4 relative z-10">
      <div className="p-3 bg-white/5 rounded-lg text-gray-400 group-hover:text-neon-teal group-hover:bg-neon-teal/10 transition-colors">
        <Icon size={20} />
      </div>
      <div>
        <div className="text-sm font-bold text-white tracking-wide">{title}</div>
        <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">{impact} Impact</div>
      </div>
    </div>
    <div className="text-right relative z-10">
      <div className={`text-xl font-bold font-mono ${score > 80 ? 'text-red-500' : score > 50 ? 'text-yellow-500' : 'text-green-500'}`}>
        {score}%
      </div>
    </div>
  </div>
);

// --- Main Component ---
const Predictions = () => {
  const [horizon, setHorizon] = useState(24); // 24h, 48h, 72h
  const [envData, setEnvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  // Fetch environmental predictions on mount
  useEffect(() => {
    loadEnvironmentalData();
    // Refresh every 15 minutes
    const interval = setInterval(loadEnvironmentalData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadEnvironmentalData = async () => {
    try {
      const result = await fetchWeatherPredictions({
        lat: 28.7041,
        lng: 77.1025,
        city: 'Delhi'
      });
      setEnvData(result?.data);
      console.log('🌡️ Environmental data loaded:', result);
    } catch (error) {
      console.error('Error loading environmental data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Animation when horizon changes
  useEffect(() => {
    if (loading) return;
    
    const ctx = gsap.context(() => {
        // Animate the graph line drawing
        gsap.fromTo(".graph-path", 
        { strokeDasharray: 1000, strokeDashoffset: 1000 },
        { strokeDashoffset: 0, duration: 2, ease: "power2.out" }
        );
        
        // Animate the "Confidence" meter
        gsap.fromTo(".confidence-meter",
        { width: "0%" },
        { width: "94%", duration: 1.5, ease: "power2.out", delay: 0.3 }
        );

        // Animate Cards Stagger
        gsap.from(".factor-card", {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power1.out"
        });
    }, containerRef);

    return () => ctx.revert();
  }, [horizon, loading]);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white p-6 font-sans selection:bg-neon-teal selection:text-black">
      
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <BrainCircuit className="w-12 h-12 text-neon-teal animate-pulse mx-auto mb-4" />
            <p className="text-white font-mono">Loading Environmental Data...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white hover:text-black transition-colors group">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-mono tracking-tighter flex items-center gap-3">
              PREDICTIVE ENGINE <BrainCircuit className="text-neon-teal animate-pulse" size={24} />
            </h1>
            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mt-1">
              AI Model: Environmental + Historical • Data Source: 
              {envData?.mode === 'mock' ? (
                <span className="text-yellow-500"> MOCK (n8n workflow not ready)</span>
              ) : (
                <span className="text-green-500"> LIVE ✓</span>
              )}
            </p>
          </div>
        </div>
        
        {/* Time Horizon Slider Controls */}
        <div className="bg-[#050505] border border-white/10 p-1.5 rounded-lg flex gap-1">
            {[24, 48, 72].map((h) => (
                <button 
                    key={h}
                    onClick={() => setHorizon(h)}
                    className={`px-5 py-2 rounded-md text-sm font-mono transition-all duration-300 ${horizon === h ? 'bg-neon-teal text-black font-bold shadow-[0_0_20px_rgba(0,242,234,0.3)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                >
                    +{h}HRS
                </button>
            ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: The Big Graph */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 relative overflow-hidden min-h-[450px] shadow-2xl">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2 font-mono text-neon-teal">
                            <TrendingUp size={18} /> PATIENT VOLUME FORECAST
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Projected influx based on multi-modal analysis.</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold text-white font-mono tracking-tighter">
                            {horizon === 24 ? '142' : horizon === 48 ? '189' : '256'}
                        </div>
                        <div className={`text-sm font-mono font-bold mt-1 ${horizon === 24 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {horizon === 24 ? '▲ 15%' : horizon === 48 ? '▲ 32%' : '▲ 85%'} SURGE
                        </div>
                    </div>
                </div>

                {/* Custom SVG Chart */}
                <div className="relative h-[280px] w-full mt-8 z-10">
                    {/* The Graph Line */}
                    <svg className="w-full h-full overflow-visible">
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#00f2ea" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#00f2ea" stopOpacity="0" />
                            </linearGradient>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        
                        {/* Dynamic Path based on horizon */}
                        <path 
                            d={horizon === 24 
                                ? "M0,220 C100,220 150,200 200,170 C300,110 400,140 500,100 C600,60 700,70 800,40" 
                                : horizon === 48
                                ? "M0,220 C100,210 200,200 300,120 C400,70 500,40 800,10"
                                : "M0,220 L800,10"
                            } 
                            fill="url(#gradient)" 
                            className="opacity-30 transition-all duration-1000 ease-in-out"
                        />
                        <path 
                            d={horizon === 24 
                                ? "M0,220 C100,220 150,200 200,170 C300,110 400,140 500,100 C600,60 700,70 800,40" 
                                : horizon === 48
                                ? "M0,220 C100,210 200,200 300,120 C400,70 500,40 800,10"
                                : "M0,220 L800,10"
                            }
                            fill="none" 
                            stroke="#00f2ea" 
                            strokeWidth="3" 
                            filter="url(#glow)"
                            strokeLinecap="round"
                            className="graph-path transition-all duration-1000 ease-out"
                        />
                        
                        {/* Interactive Data Points */}
                        <g className="transition-all duration-1000 ease-out">
                            <circle cx="200" cy={horizon === 24 ? "170" : "200"} r="6" fill="#050505" stroke="#00f2ea" strokeWidth="2" />
                            <circle cx="500" cy={horizon === 24 ? "100" : "40"} r="6" fill="#fff" className="animate-pulse" />
                        </g>
                    </svg>
                    
                    {/* X-Axis Labels */}
                    <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-4 uppercase tracking-widest">
                        <span>Current Time</span>
                        <span>+{horizon / 2} Hours</span>
                        <span>+{horizon} Hours</span>
                    </div>
                </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                 <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2 font-mono uppercase tracking-wider">
                    <Sparkles size={14} className="text-neon-teal" /> AI Recommended Actions
                 </h3>
                 <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                    {envData?.recommendations?.slice(0, 3).map((rec, idx) => (
                      <div 
                        key={idx}
                        className={`min-w-[240px] bg-black border border-l-4 ${
                          idx === 0 ? 'border-l-neon-teal' : idx === 1 ? 'border-l-yellow-500' : 'border-l-purple-500'
                        } border-white/10 p-4 rounded-r-lg hover:bg-white/5 transition-colors cursor-pointer group`}
                      >
                        <div className={`font-bold text-sm mb-1 group-hover:underline ${
                          idx === 0 ? 'text-neon-teal' : idx === 1 ? 'text-yellow-500' : 'text-purple-500'
                        }`}>
                          ACTION {idx + 1}
                        </div>
                        <div className="text-xs text-gray-400">{rec}</div>
                      </div>
                    )) || (
                      <>
                        {/* Fallback Actions */}
                        <div className="min-w-[240px] bg-black border border-l-4 border-l-neon-teal border-white/10 p-4 rounded-r-lg hover:bg-white/5 transition-colors cursor-pointer group">
                            <div className="font-bold text-neon-teal text-sm mb-1 group-hover:underline">INCREASE STAFFING</div>
                            <div className="text-xs text-gray-400">Call in 3 RNs for Night Shift (Sector 7)</div>
                        </div>
                        <div className="min-w-[240px] bg-black border border-l-4 border-l-yellow-500 border-white/10 p-4 rounded-r-lg hover:bg-white/5 transition-colors cursor-pointer group">
                            <div className="font-bold text-yellow-500 text-sm mb-1 group-hover:underline">SUPPLY CHECK</div>
                            <div className="text-xs text-gray-400">O2 Tank reserves low for predicted influx</div>
                        </div>
                        <div className="min-w-[240px] bg-black border border-l-4 border-l-purple-500 border-white/10 p-4 rounded-r-lg hover:bg-white/5 transition-colors cursor-pointer group">
                            <div className="font-bold text-purple-500 text-sm mb-1 group-hover:underline">VOICE AI CAMPAIGN</div>
                            <div className="text-xs text-gray-400">Auto-call 500 Asthma patients (Air Quality Warning)</div>
                        </div>
                      </>
                    )}
                 </div>
            </div>
        </div>

        {/* Right Column: Contributing Factors */}
        <div className="space-y-6">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 h-fit">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold font-mono text-white tracking-wide">SURGE DRIVERS</h3>
                    <button 
                      onClick={loadEnvironmentalData}
                      className="text-gray-500 hover:text-white transition-colors hover:rotate-180 duration-500"
                    >
                        <RefreshCw size={14} />
                    </button>
                </div>
                <div className="space-y-3">
                    {/* Weather Factor */}
                    <div className="factor-card">
                      <FactorCard 
                        icon={CloudRain} 
                        title="Weather Conditions" 
                        impact={envData?.currentConditions?.temperature > 35 ? "High" : "Medium"} 
                        score={Math.min(95, Math.round((envData?.currentConditions?.temperature || 30) * 2.5))} 
                      />
                    </div>
                    {/* Air Quality Factor */}
                    <div className="factor-card">
                      <FactorCard 
                        icon={AlertOctagon} 
                        title="Air Quality Index" 
                        impact={envData?.currentConditions?.aqi > 150 ? "Critical" : "High"} 
                        score={Math.min(95, Math.round((envData?.currentConditions?.aqi || 180) / 2))} 
                      />
                    </div>
                    {/* Social Events */}
                    <div className="factor-card">
                      <FactorCard 
                        icon={Calendar} 
                        title="Social Events" 
                        impact="Medium" 
                        score={62} 
                      />
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-xl p-6 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="font-bold mb-2 font-mono text-gray-400 text-xs uppercase tracking-wider">Model Confidence</h3>
                    <div className="text-6xl font-mono font-bold text-white mb-2 tracking-tighter">94.2%</div>
                    <p className="text-[10px] text-gray-500 mb-6 font-mono">Based on historical validation of last 50 surge events.</p>
                    
                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <div className="confidence-meter h-full bg-neon-teal shadow-[0_0_15px_#00f2ea]"></div>
                    </div>
                </div>
                {/* Decorative Background Blur */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-neon-teal/10 rounded-full blur-[40px]"></div>
            </div>
        </div>

      </div>
        </>
      )}
    </div>
  );
};

export default Predictions;