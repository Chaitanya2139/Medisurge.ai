import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Activity, Users, AlertTriangle, Zap, Server, Radio, BarChart3, Map, BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';


// --- Components ---

const StatCard = ({ icon: Icon, label, value, trend, color, delay }) => (
  <div className={`stat-card bg-[#0A0A0A] border border-white/10 p-6 rounded-xl relative overflow-hidden group hover:border-${color} transition-colors opacity-0`}>
    <div className={`absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity text-${color}`}>
      <Icon size={40} />
    </div>
    <div className="flex items-center gap-3 mb-2">
      <div className={`p-2 rounded-lg bg-${color}/10 text-${color}`}>
        <Icon size={20} />
      </div>
      <span className="text-gray-400 text-sm font-mono">{label}</span>
    </div>
    <div className="text-3xl font-bold text-white mb-1 font-mono tracking-tighter">{value}</div>
    {trend && <div className={`text-xs ${trend.includes('+') ? 'text-red-400' : 'text-green-400'}`}>{trend} vs last hour</div>}
  </div>
);

const AgentLog = () => {
  const [logs, setLogs] = useState([
    { time: '10:42:01', agent: 'PREDICTIVE', msg: 'Detected viral spike in Sector 7' },
    { time: '10:42:05', agent: 'RESOURCE', msg: 'Reallocated 3 RNs to ICU' },
    { time: '10:42:12', agent: 'VOICE_AI', msg: 'Contacted 45 high-risk patients' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const actions = [
        { agent: 'PREDICTIVE', msg: 'Incoming weather front: Asthma risk +15%' },
        { agent: 'RESOURCE', msg: 'Supply chain order #4492 authorized' },
        { agent: 'VOICE_AI', msg: 'Patient 892 triage completed: Stable' },
        { agent: 'FLOW_COORD', msg: 'Bed capacity optimized: 92%' }
      ];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const time = new Date().toLocaleTimeString('en-US', { hour12: false });
      
      setLogs(prev => [{ time, ...randomAction }, ...prev.slice(0, 4)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 h-full font-mono text-sm">
      <h3 className="text-gray-400 mb-4 flex items-center gap-2">
        <Server size={16} className="text-neon-teal" /> LIVE SYSTEM LOGS
      </h3>
      <div className="space-y-3">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-4 border-b border-white/5 pb-2 animate-pulse-fast">
            <span className="text-gray-600">{log.time}</span>
            <span className={`font-bold ${log.agent === 'PREDICTIVE' ? 'text-blue-400' : log.agent === 'RESOURCE' ? 'text-green-400' : 'text-purple-400'}`}>
              [{log.agent}]
            </span>
            <span className="text-gray-300 truncate">{log.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Dashboard Page ---
const Dashboard = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stagger Reveal
      gsap.to(".stat-card", {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out"
      });

      // Chart Animation (Simulated)
      gsap.fromTo(".chart-bar", 
        { scaleY: 0 },
        { scaleY: 1, duration: 1, stagger: 0.05, ease: "circ.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white p-6 pt-24 font-sans">
      
      {/* Header */}
      <header className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-tighter">COMMAND CENTER <span className="text-neon-teal">LIVE</span></h1>
          <p className="text-gray-500 text-sm">Hospital System: General Metro • Status: <span className="text-green-500 animate-pulse">OPTIMAL</span></p>
        </div>
        <div className="flex gap-4">
            <Link to="/weather" className="px-4 py-2 bg-orange-500/10 border border-orange-500/50 text-orange-400 rounded hover:bg-orange-500 hover:text-white transition-colors text-sm font-mono flex items-center gap-2">
              <Activity size={16} /> WEATHER SURGE
            </Link>
            <Link to="/patient" className="px-4 py-2 bg-green-500/10 border border-green-500/50 text-green-400 rounded hover:bg-green-500 hover:text-white transition-colors text-sm font-mono flex items-center gap-2">
              <Users size={16} /> PATIENT PORTAL
            </Link>
            <button className="px-4 py-2 border border-white/20 rounded hover:bg-white hover:text-black transition-colors text-sm font-mono">
              GENERATE REPORT
            </button>
            <button className="px-4 py-2 bg-red-500/10 border border-red-500/50 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors text-sm font-mono flex items-center gap-2">
              <AlertTriangle size={16} /> SURGE OVERRIDE
            </button>
            <Link to="/live-ops" className="px-4 py-2 bg-neon-teal/10 border border-neon-teal/50 text-neon-teal rounded hover:bg-neon-teal hover:text-black transition-colors text-sm font-mono flex items-center gap-2">
              <Map size={16} /> LIVE OPS VIEW
            </Link>
            <Link to="/predictions" className="px-4 py-2 bg-purple-500/10 border border-purple-500/50 text-purple-400 rounded hover:bg-purple-500 hover:text-white transition-colors text-sm font-mono flex items-center gap-2">
              <BrainCircuit size={16} /> PREDICTIONS
            </Link>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Activity} label="SURGE PROBABILITY" value="12%" trend="-2%" color="neon-teal" />
        <StatCard icon={Users} label="ER OCCUPANCY" value="64%" trend="+5%" color="blue-500" />
        <StatCard icon={Zap} label="ACTIVE AGENTS" value="4" trend="All Systems Go" color="yellow-500" />
        <StatCard icon={BarChart3} label="PREDICTED VOL (24H)" value="142" trend="+15%" color="purple-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[400px]">
        {/* Main Graph Area */}
        <div className="md:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-xl p-6 relative overflow-hidden">
          <h3 className="text-gray-400 mb-6 flex items-center gap-2">
            <Radio size={16} className="text-neon-teal animate-pulse" /> REAL-TIME PATIENT INFLUX
          </h3>
          
          {/* Simulated Graph */}
          <div className="flex items-end justify-between h-[280px] w-full gap-1">
            {[...Array(30)].map((_, i) => (
              <div 
                key={i} 
                className="chart-bar w-full bg-gradient-to-t from-neon-teal/20 to-neon-teal rounded-t-sm"
                style={{ height: `${Math.random() * 60 + 20}%`, opacity: 0.8 }}
              ></div>
            ))}
          </div>
          
          {/* Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_40px] pointer-events-none"></div>
        </div>

        {/* Live Logs */}
        <div className="h-full">
           <AgentLog />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;