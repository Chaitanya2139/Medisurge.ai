import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { X, ScanLine, Lock } from 'lucide-react';

const LoginModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      // Entrance Animation
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, pointerEvents: 'auto' });
      gsap.fromTo(modalRef.current, 
        { scale: 0.8, opacity: 0, y: 50, rotationX: 20 },
        { scale: 1, opacity: 1, y: 0, rotationX: 0, duration: 0.5, ease: "back.out(1.7)" }
      );
    } else {
      // Exit Animation
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, pointerEvents: 'none' });
      gsap.to(modalRef.current, { scale: 0.8, opacity: 0, duration: 0.3 });
    }
  }, [isOpen]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate "Authorizing" effect
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = "AUTHENTICATING...";
    btn.classList.add("animate-pulse");

    setTimeout(() => {
      onClose(); // Close modal
      navigate('/dashboard'); // Go to dashboard
      btn.innerText = originalText;
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm opacity-0 pointer-events-none">
      <div ref={modalRef} className="relative w-full max-w-md bg-[#0A0A0A] border border-white/20 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,242,234,0.1)] overflow-hidden">
        
        {/* Decorative Scanner Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-teal to-transparent animate-[scan_2s_linear_infinite] opacity-50"></div>

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10 text-neon-teal">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold font-mono tracking-tighter">SECURE ACCESS</h2>
          <p className="text-gray-500 text-sm">MediSurge Command Node</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-400 ml-1">OPERATOR ID</label>
            <div className="relative">
              <input type="text" className="w-full bg-black border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-neon-teal focus:outline-none focus:ring-1 focus:ring-neon-teal transition-all font-mono" placeholder="ADMIN_01" />
              <ScanLine className="absolute left-3 top-3.5 text-gray-500" size={18} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-gray-400 ml-1">ACCESS KEY</label>
            <input type="password" className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-neon-teal focus:outline-none focus:ring-1 focus:ring-neon-teal transition-all font-mono" placeholder="••••••••" />
          </div>

          <button type="submit" className="w-full bg-neon-teal text-black font-bold py-3 rounded-lg hover:bg-white hover:scale-[1.02] transition-all duration-300 shadow-[0_0_20px_rgba(0,242,234,0.3)]">
            INITIALIZE SESSION
          </button>
        </form>

        <div className="mt-6 text-center text-[10px] text-gray-600 font-mono">
          ENCRYPTED CONNECTION • V2.0.4
        </div>
      </div>
    </div>
  );
};

export default LoginModal;