import React, { useEffect, useRef, useLayoutEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LoginModal from '../components/LoginModal';

gsap.registerPlugin(ScrollTrigger);

// --- Sub-Components ---

// 1. Custom Cursor Component
const CustomCursor = () => {
  const cursorRef = useRef(null);
  
  useEffect(() => {
    const moveCursor = (e) => {
      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "power2.out"
      });
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <div 
      ref={cursorRef} 
      className="fixed top-0 left-0 w-8 h-8 border-2 border-neon-teal rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
    />
  );
};

// 2. Scramble Text Effect Component
const ScrambleText = ({ text, className }) => {
  const elementRef = useRef(null);
  
  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
    const targetText = text;
    let iteration = 0;
    
    const interval = setInterval(() => {
      elementRef.current.innerText = targetText
        .split("")
        .map((letter, index) => {
          if (index < iteration) {
            return targetText[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
      
      if (iteration >= targetText.length) {
        clearInterval(interval);
      }
      
      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [text]);

  return <span ref={elementRef} className={className}>{text}</span>;
};

// --- Main Application ---

const LandingPage = () => {
  const mainRef = useRef(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      
      // Hero Animation
      const tl = gsap.timeline();
      tl.from(".hero-title span", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power4.out"
      })
      .from(".hero-sub", { opacity: 0, y: 20 }, "-=0.5")
      .from(".hero-stat", { scale: 0, opacity: 0, stagger: 0.2, ease: "back.out(1.7)" }, "-=0.3");

      // Reveal Sections on Scroll
      gsap.utils.toArray('.reveal-section').forEach(section => {
        gsap.fromTo(section, 
          { opacity: 0, y: 100, filter: "blur(10px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
            }
          }
        );
      });

      // Horizontal Scroll for "Features" (The 'Crazy' part)
      const races = document.querySelector(".races");
      if (races) {
        let racesWidth = races.scrollWidth;
        let amountToScroll = racesWidth - window.innerWidth;
        
        gsap.to(races, {
          x: -amountToScroll,
          ease: "none",
          scrollTrigger: {
            trigger: ".racesWrapper",
            start: "top top",
            end: "+=" + amountToScroll,
            pin: true,
            scrub: 1,
            snap: 1 / (4), // Snap to sections
          }
        });
      }

    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="bg-deep-void min-h-screen text-white font-sans selection:bg-neon-teal selection:text-black">
      <CustomCursor />
      
      {/* Cinematic Grain Overlay */}
      <div className="fixed inset-0 opacity-5 pointer-events-none z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full p-6 flex justify-between items-center z-40 mix-blend-difference">
        <div className="text-2xl font-bold tracking-tighter uppercase font-mono">
          MediSurge<span className="text-neon-teal">.AI</span>
        </div>
        <button 
          onClick={() => setIsLoginModalOpen(true)}
          className="border border-white/20 px-6 py-2 rounded-full text-xs font-mono hover:bg-white hover:text-black transition-all cursor-pointer"
        >
          GET ACCESS
        </button>
      </nav>

      {/* 1. HERO SECTION */}
      <header className="relative min-h-screen flex flex-col justify-center items-center px-4 pt-20 overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-teal/10 blur-[120px] rounded-full"></div>

        <div className="z-10 text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-mono text-gray-400">SYSTEM ONLINE • V2.0 LIVE</span>
          </div>

          <h1 className="hero-title text-6xl md:text-8xl lg:text-9xl font-black leading-none tracking-tighter mb-6">
            <span className="block">PREDICT</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-400 to-gray-600">PREPARE</span>
            <span className="block text-neon-teal">PREVENT</span>
          </h1>

          <p className="hero-sub text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-light">
            Autonomous Patient Surge Management with <span className="text-white font-semibold">AI Agentic Power</span>. 
            We don't just alert. We take action.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: "Predictive Accuracy", val: "94%" },
              { label: "Surge Warning", val: "72 Hrs" },
              { label: "Cost Reduction", val: "15%" },
              { label: "Wait Time Cut", val: "300%" }
            ].map((stat, i) => (
              <div key={i} className="hero-stat bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm hover:border-neon-teal/50 transition-colors group">
                <div className="text-3xl font-bold text-white group-hover:text-neon-teal transition-colors">{stat.val}</div>
                <div className="text-xs text-gray-500 font-mono uppercase mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* 2. THE PROBLEM (Bento Grid) */}
      <section className="py-24 px-4 bg-deep-void relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 reveal-section">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">THE PERFECT <span className="text-red-500 font-serif italic">STORM</span></h2>
            <p className="text-gray-400 max-w-xl">Healthcare is reactive. Unpredictable surges cause burnout, resource shortages, and compromised care. The cost of inaction is too high.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-6 h-[800px] md:h-[600px] reveal-section">
            <div className="md:col-span-2 bg-[#0A0A0A] border border-white/10 p-8 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-red-500"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Unpredictable Surges</h3>
              <p className="text-gray-500 mb-8">Festivals, pollution spikes, and epidemics create 200-500% spikes in patient volume.</p>
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-red-900/20 to-transparent"></div>
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 p-8 rounded-3xl flex flex-col justify-between group hover:border-red-500/30 transition-colors">
              <h3 className="text-5xl font-mono font-bold text-red-500">$165B</h3>
              <p className="text-sm text-gray-400">Lost annually due to operational inefficiencies.</p>
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 p-8 rounded-3xl flex flex-col justify-center group hover:border-red-500/30 transition-colors">
               <h3 className="text-5xl font-mono font-bold text-white">76%</h3>
               <p className="text-sm text-gray-400">Physicians report burnout.</p>
            </div>

            <div className="md:col-span-2 bg-[#0A0A0A] border border-white/10 p-8 rounded-3xl relative overflow-hidden flex items-center">
              <div>
                <h3 className="text-2xl font-bold mb-2">Reactive Management</h3>
                <p className="text-gray-500">Traditional systems respond after problems occur. We fix the communication gaps that lead to delayed care.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HORIZONTAL SCROLL - THE SOLUTION */}
      <section className="racesWrapper overflow-hidden bg-white text-black py-10 relative">
        <div className="races flex w-fit flex-nowrap h-[90vh]">
          
          {/* Slide 1: Intro */}
          <div className="w-[100vw] h-full flex flex-col justify-center p-10 md:p-20 border-r border-black/10 shrink-0">
            <h2 className="text-[10vw] font-black leading-none tracking-tighter">MEDISURGE</h2>
            <h2 className="text-[10vw] font-black leading-none tracking-tighter text-neon-blue">SOLUTION</h2>
            <p className="text-xl md:text-3xl mt-8 max-w-2xl font-medium">A multi-agent AI system that predicts, prepares, and responds autonomously.</p>
          </div>

          {/* Slide 2: Agent 1 */}
          <div className="w-[80vw] md:w-[60vw] h-full flex flex-col justify-center p-10 md:p-20 bg-gray-50 border-r border-black/10 shrink-0">
            <div className="text-xs font-mono border border-black px-2 py-1 w-fit mb-4">AGENT 01</div>
            <h3 className="text-5xl md:text-7xl font-bold mb-6">Predictive Intelligence</h3>
            <p className="text-lg text-gray-600 max-w-lg">Analyzes 50+ data sources including weather, social media, and epidemic indicators. Identifies department demands before they happen.</p>
          </div>

           {/* Slide 3: Agent 2 */}
           <div className="w-[80vw] md:w-[60vw] h-full flex flex-col justify-center p-10 md:p-20 bg-gray-100 border-r border-black/10 shrink-0">
            <div className="text-xs font-mono border border-black px-2 py-1 w-fit mb-4">AGENT 02</div>
            <h3 className="text-5xl md:text-7xl font-bold mb-6">Resource Optimization</h3>
            <p className="text-lg text-gray-600 max-w-lg">Automatically adjusts staffing schedules and optimizes supply chain orders 48 hours before surge events.</p>
          </div>

           {/* Slide 4: Voice Agent */}
           <div className="w-[80vw] md:w-[60vw] h-full flex flex-col justify-center p-10 md:p-20 bg-black text-white shrink-0">
            <div className="text-xs font-mono border border-white px-2 py-1 w-fit mb-4">REVOLUTIONARY</div>
            <h3 className="text-5xl md:text-7xl font-bold mb-6 text-neon-teal">Voice Agent Network</h3>
            <p className="text-lg text-gray-400 max-w-lg">Proactive patient outreach. Our AI calls high-risk patients, assesses symptoms, and guides them, reducing unnecessary ER visits.</p>
          </div>

        </div>
      </section>

      {/* 4. TECH STACK & ROADMAP */}
      <section className="py-32 px-4 bg-deep-void">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20">
            
            {/* Tech Stack */}
            <div className="reveal-section">
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <span className="w-2 h-8 bg-neon-teal block"></span>
                ARCHITECTURE
              </h2>
              <div className="space-y-6">
                <div className="p-6 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm">
                  <h4 className="text-xl font-bold mb-2 text-neon-teal">AI / ML Core</h4>
                  <p className="text-sm text-gray-400">Deep Learning (LSTM) for time-series, GPT-4 for conversational AI, Reinforcement Learning for resource allocation.</p>
                </div>
                <div className="p-6 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm">
                  <h4 className="text-xl font-bold mb-2 text-neon-teal">Infrastructure</h4>
                  <p className="text-sm text-gray-400">Cloud-Native (AWS/Azure), HIPAA Compliant, Sub-second response times, Integration with Epic & Cerner.</p>
                </div>
              </div>
            </div>

            {/* Roadmap */}
            <div className="reveal-section">
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <span className="w-2 h-8 bg-white block"></span>
                ROADMAP
              </h2>
              <ul className="space-y-0 border-l border-white/10 ml-4">
                {[
                  { title: "Phase 1: Foundation", desc: "MVP & Pilot Partnerships (M 1-6)" },
                  { title: "Phase 2: Pilot Deployment", desc: "Real-world data & Model Refinement (M 7-12)" },
                  { title: "Phase 3: Market Entry", desc: "Commercial Launch & AI Voice Rollout (M 13-18)" },
                  { title: "Phase 4: Global Scale", desc: "International Expansion (M 19-24)" }
                ].map((item, i) => (
                  <li key={i} className="relative pl-8 pb-10">
                    <span className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-neon-teal shadow-[0_0_10px_#00f2ea]"></span>
                    <h4 className="text-xl font-bold">{item.title}</h4>
                    <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden bg-black">
        {/* Background Radial */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-teal/20 blur-[150px] rounded-full"></div>
        
        <div className="z-10 max-w-4xl">
          <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter">
            <ScrambleText text="THE FUTURE IS HERE" className="block" />
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Join the revolution. Prevent the preventable. <br />
            Investment Ask: <span className="text-white font-bold">$5M Seed Round</span>
          </p>
          
          <button 
            onClick={() => setIsLoginModalOpen(true)}
            className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full transition-all hover:scale-105 cursor-pointer"
          >
            <div className="absolute inset-0 w-full h-full bg-neon-teal/20 group-hover:bg-neon-teal transition-all duration-300"></div>
            <div className="absolute inset-0 w-full h-full border border-neon-teal rounded-full"></div>
            <span className="relative font-bold font-mono tracking-widest text-neon-teal group-hover:text-black z-10">INITIATE PARTNERSHIP</span>
          </button>
        </div>
      </section>

      <footer className="py-8 text-center text-xs font-mono text-gray-600 bg-black border-t border-white/5">
        MEDISURGE AI © 2025. ALL SYSTEMS OPERATIONAL.
      </footer>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};

export default LandingPage;