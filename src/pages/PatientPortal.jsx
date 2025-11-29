import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Phone, Mic, MapPin, ShieldAlert, Activity, Navigation, X, Bell, Home, User, Settings, Grip } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- SUB-COMPONENT: Phone Home Screen (The Launcher) ---
const PhoneHomeScreen = ({ onLaunch }) => {
  return (
    <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover flex flex-col justify-between p-6 pt-16">
      {/* Status Bar */}
      <div className="absolute top-0 left-0 w-full h-14 flex justify-between items-center px-6 text-white text-xs font-bold z-20">
        <span>9:41</span>
        <div className="flex gap-2"><Activity size={12} /> 5G</div>
      </div>

      {/* App Grid */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        {[...Array(11)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 opacity-80">
            <div className={`w-14 h-14 rounded-2xl ${['bg-blue-500','bg-green-500','bg-yellow-500','bg-purple-500'][i%4]} shadow-lg`}></div>
            <div className="w-8 h-1 bg-white/50 rounded-full"></div>
          </div>
        ))}
        
        {/* THE MEDISURGE APP ICON */}
        <button onClick={onLaunch} className="flex flex-col items-center gap-1 group">
           <div className="w-14 h-14 rounded-2xl bg-black border-2 border-neon-teal shadow-[0_0_20px_rgba(0,242,234,0.6)] flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-300">
              <div className="absolute inset-0 bg-neon-teal/20 animate-pulse"></div>
              <Activity className="text-neon-teal relative z-10" size={28} />
           </div>
           <span className="text-[10px] font-bold text-white shadow-black drop-shadow-md">MediSurge</span>
        </button>
      </div>

      {/* Dock */}
      <div className="bg-white/20 backdrop-blur-md rounded-[2rem] p-4 flex justify-around mb-4">
        {[1,2,3,4].map(i => <div key={i} className="w-12 h-12 rounded-xl bg-white/80 shadow-sm"></div>)}
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: Voice Wave ---
const VoiceWave = ({ active }) => (
  <div className="flex justify-center items-center gap-1 h-12">
    {[...Array(5)].map((_, i) => (
      <div 
        key={i} 
        className={`w-2 bg-neon-teal rounded-full transition-all duration-100 ${active ? 'animate-pulse' : ''}`}
        style={{ height: active ? `${Math.random() * 100}%` : '10%', animationDuration: `${0.2 + Math.random() * 0.3}s`}}
      ></div>
    ))}
  </div>
);

// --- MAIN COMPONENT ---
const PatientPortal = () => {
  const [isAppLaunched, setIsAppLaunched] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, listening, processing, dispatched
  const [transcript, setTranscript] = useState('');
  const [patientLocation, setPatientLocation] = useState({ lat: null, lng: null, address: '' });
  const [emergencyResponse, setEmergencyResponse] = useState(null);
  const [webhookStatus, setWebhookStatus] = useState(''); // For debugging
  const [isListening, setIsListening] = useState(false);
  const [userSpeech, setUserSpeech] = useState('');
  const appRef = useRef(null);
  const recognitionRef = useRef(null);

  // Get patient's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPatientLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Current Location' // In production, use reverse geocoding
          });
        },
        (error) => {
          console.log('Location access denied, using default location');
          setPatientLocation({
            lat: 28.7041,
            lng: 77.1025,
            address: 'Delhi, India'
          });
        }
      );
    }

    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        console.log('🎤 User said:', speechResult);
        setUserSpeech(speechResult);
        setTranscript(`User: ${speechResult}`);
        
        // Analyze the speech and proceed
        setTimeout(() => {
          analyzeEmergency(speechResult);
        }, 1000);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setTranscript('Sorry, I could not hear you. Please try again.');
        setTimeout(() => setStatus('idle'), 2000);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }, []);

  // App Launch Animation
  const launchApp = () => {
    setIsAppLaunched(true);
  };

  useEffect(() => {
    if (isAppLaunched && appRef.current) {
      gsap.fromTo(appRef.current, 
        { scale: 0.8, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.2)" }
      );
    }
  }, [isAppLaunched]);

  // Analyze emergency from user speech
  const analyzeEmergency = async (speechText) => {
    setStatus('processing');
    setTranscript('AI: Analyzing your emergency...');

    // Simple keyword detection (in production, use NLP/AI)
    const emergencyKeywords = {
      cardiac: ['chest pain', 'heart', 'cardiac', 'breathing'],
      injury: ['injury', 'bleeding', 'accident', 'fall', 'broken'],
      respiratory: ['breathing', 'asthma', 'cough', 'oxygen'],
      other: ['emergency', 'help', 'urgent', 'pain']
    };

    let emergencyType = 'General Emergency';
    let severity = 'Moderate';
    const lowerSpeech = speechText.toLowerCase();

    if (emergencyKeywords.cardiac.some(keyword => lowerSpeech.includes(keyword))) {
      emergencyType = 'Cardiac Emergency';
      severity = 'Critical';
    } else if (emergencyKeywords.injury.some(keyword => lowerSpeech.includes(keyword))) {
      emergencyType = 'Injury/Trauma';
      severity = 'High';
    } else if (emergencyKeywords.respiratory.some(keyword => lowerSpeech.includes(keyword))) {
      emergencyType = 'Respiratory Emergency';
      severity = 'High';
    }

    const emergencyData = {
      patientInfo: {
        name: 'Patient User',
        age: 65,
        gender: 'Male',
        phone: '+91-XXXXXXXXXX'
      },
      emergency: {
        type: emergencyType,
        description: speechText,
        severity: severity,
        symptoms: [speechText],
        timestamp: new Date().toISOString(),
        voiceTranscript: speechText
      },
      location: {
        latitude: patientLocation.lat,
        longitude: patientLocation.lng,
        address: patientLocation.address
      },
      vitalSigns: {
        heartRate: 82,
        bloodPressure: '140/90',
        oxygenLevel: 94
      },
      requestedService: 'Ambulance',
      aiAssessment: `${severity} emergency detected. ${emergencyType} identified from voice analysis.`
    };

    await sendEmergencyToHospital(emergencyData);
    setTranscript(`AI: ${emergencyType} detected. Dispatching ambulance immediately.`);
    
    setTimeout(() => setStatus('dispatched'), 2000);
  };

  // Send emergency data to hospital via AI calling agent (webhook to be added later)
  const sendEmergencyToHospital = async (emergencyData) => {
    // TODO: Add AI calling agent webhook URL here
    const webhookUrl = ''; // To be configured later
    
    console.log('🚨 EMERGENCY DATA PREPARED:', emergencyData);
    setWebhookStatus('Emergency prepared - Awaiting AI calling agent integration');
    
    if (!webhookUrl) {
      console.log('⚠️ Webhook URL not configured yet');
      setWebhookStatus('Local emergency mode - AI calling agent not yet connected');
      return { success: true, mode: 'local' };
    }
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emergencyData)
      });
      
      console.log('📡 Webhook Response Status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Emergency dispatched successfully:', result);
      setEmergencyResponse(result);
      setWebhookStatus('AI calling agent activated!');
      return result;
    } catch (error) {
      console.error('❌ Error sending emergency alert:', error);
      setWebhookStatus(`Error: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  const handleSOS = () => {
    setStatus('listening');
    setTranscript('MediSurge AI: Listening... Please describe your emergency.');
    setIsListening(true);
    
    // Start voice recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        // Fallback to demo mode if speech recognition fails
        setTimeout(() => {
          setUserSpeech('My father is having chest pains');
          analyzeEmergency('My father is having chest pains and difficulty breathing');
        }, 2000);
      }
    } else {
      // Fallback demo mode for browsers without speech recognition
      setTimeout(() => {
        setUserSpeech('My father is having chest pains');
        setTranscript('User: My father is having chest pains');
        analyzeEmergency('My father is having chest pains and difficulty breathing');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#111] flex justify-center items-center p-4 font-sans">
      
      {/* PHONE FRAME */}
      <div className="w-full max-w-[380px] h-[800px] bg-black rounded-[3rem] border-8 border-[#222] relative overflow-hidden shadow-2xl ring-4 ring-gray-800">
        
        {/* Dynamic Island / Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-50"></div>
        
        {/* CONTENT SWITCHER */}
        {!isAppLaunched ? (
          <PhoneHomeScreen onLaunch={launchApp} />
        ) : (
          <div ref={appRef} className="w-full h-full bg-black text-white flex flex-col relative">
            
            {/* --- APP HEADER --- */}
            <div className="pt-12 px-6 flex justify-between items-center bg-gradient-to-b from-gray-900 to-black pb-4">
               <div>
                  <h1 className="text-xl font-bold font-mono text-white">MediSurge</h1>
                  <p className="text-[10px] text-gray-400">Personal Guardian</p>
               </div>
               <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-white/10">
                  <User size={16} />
               </div>
            </div>

            {/* --- SCREEN 1: IDLE --- */}
            {status === 'idle' && (
              <div className="flex-1 flex flex-col items-center justify-center relative p-6">
                 {/* Quick Vitals Widget */}
                 <div className="absolute top-0 w-full px-6">
                    <div className="bg-gray-900/50 border border-white/10 rounded-xl p-3 flex justify-between items-center backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <Activity className="text-neon-teal" size={20} />
                            <div>
                                <div className="text-[10px] text-gray-400">HEART RATE</div>
                                <div className="font-bold text-sm">82 BPM</div>
                            </div>
                        </div>
                        <div className="text-[10px] text-green-500 bg-green-900/20 px-2 py-1 rounded">NORMAL</div>
                    </div>
                 </div>

                 {/* THE BIG BUTTON */}
                 <div className="relative group cursor-pointer" onClick={handleSOS}>
                    <div className="absolute inset-0 bg-red-600 rounded-full blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="w-56 h-56 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.4)] border-4 border-red-500/20 active:scale-95 transition-transform">
                        <Phone size={48} className="text-white mb-2" />
                        <span className="text-2xl font-black tracking-widest text-white">SOS</span>
                        <span className="text-[10px] text-red-200 mt-1 uppercase tracking-wider">Tap for Help</span>
                    </div>
                 </div>

                 <p className="mt-8 text-gray-500 text-xs text-center max-w-[200px]">
                    Hold for 3 seconds or tap once for AI Voice Assistant.
                 </p>
              </div>
            )}

            {/* --- SCREEN 2: ACTIVE --- */}
            {(status === 'listening' || status === 'processing') && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-900/50">
                 <div className="w-24 h-24 rounded-full border-2 border-neon-teal flex items-center justify-center mb-8 relative">
                    <Mic size={32} className="text-neon-teal" />
                    <div className="absolute inset-0 border-4 border-neon-teal/20 rounded-full animate-ping"></div>
                 </div>
                 <h3 className="text-xl font-bold mb-4">
                   {status === 'listening' ? '🎤 Speak Now...' : '⚡ Analyzing...'}
                 </h3>
                 <div className="bg-black/50 p-4 rounded-lg w-full border border-white/10 min-h-[80px] mb-8">
                    <p className="text-neon-teal font-mono text-sm">{transcript}</p>
                    {isListening && (
                      <p className="text-gray-500 text-xs mt-2 animate-pulse">Microphone active - Listening...</p>
                    )}
                 </div>
                 <VoiceWave active={status === 'listening'} />
              </div>
            )}

            {/* --- SCREEN 3: DISPATCHED --- */}
            {status === 'dispatched' && (
              <div className="flex-1 flex flex-col p-6 bg-gradient-to-b from-gray-900 to-black">
                 <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center mb-6">
                    <ShieldAlert size={48} className="text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white">Emergency Dispatched</h2>
                    <p className="text-sm text-green-400 mt-1">ETA: 4 Minutes</p>
                    <div className="mt-3 text-xs text-gray-400 bg-black/30 p-2 rounded">
                      Hospital notified • Ambulance ID: AMB-{Math.floor(Math.random() * 1000)}
                    </div>
                    {webhookStatus && (
                      <div className="mt-2 text-[10px] text-neon-teal bg-neon-teal/10 p-2 rounded border border-neon-teal/20">
                        🔗 {webhookStatus}
                      </div>
                    )}
                    {emergencyResponse && (
                      <div className="mt-2 text-[10px] text-green-400 bg-green-900/20 p-2 rounded">
                        ✓ Webhook Response: {JSON.stringify(emergencyResponse).substring(0, 50)}...
                      </div>
                    )}
                 </div>
                 
                 {/* Fake Map */}
                 <div className="flex-1 bg-gray-800 rounded-xl overflow-hidden relative border border-white/10">
                     <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                         <Navigation className="text-blue-500 fill-blue-500 transform rotate-45" size={32} />
                     </div>
                     <div className="absolute bottom-4 left-4 right-4 bg-black/90 p-3 rounded-lg border border-white/10 flex items-center gap-3">
                         <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                           <Activity className="text-red-500" size={20} />
                         </div>
                         <div className="flex-1">
                             <div className="text-sm font-bold">Paramedic Unit 4</div>
                             <div className="text-xs text-gray-400">Approaching via Main St.</div>
                         </div>
                         <div className="text-green-500 text-xs font-mono">LIVE</div>
                     </div>
                 </div>
                 
                 <button onClick={() => setStatus('idle')} className="mt-4 py-4 w-full bg-gray-800 rounded-xl font-bold hover:bg-gray-700">Cancel / Resolved</button>
              </div>
            )}

            {/* --- BOTTOM NAVIGATION (APP FEEL) --- */}
            <div className="h-20 bg-black border-t border-white/10 flex justify-around items-center px-4 pb-4">
               <div className="flex flex-col items-center gap-1 text-neon-teal">
                  <Home size={20} />
                  <span className="text-[10px]">Home</span>
               </div>
               <div className="flex flex-col items-center gap-1 text-gray-600">
                  <Grip size={20} />
                  <span className="text-[10px]">Services</span>
               </div>
               <div className="flex flex-col items-center gap-1 text-gray-600">
                  <Bell size={20} />
                  <span className="text-[10px]">Alerts</span>
               </div>
               <div className="flex flex-col items-center gap-1 text-gray-600">
                  <Settings size={20} />
                  <span className="text-[10px]">Settings</span>
               </div>
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full"></div>
          </div>
        )}
      </div>

      {/* Helper Text for Desktop Demo */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-center w-full max-w-md px-4">
         <Link to="/dashboard" className="text-gray-500 text-xs font-mono hover:text-white transition-colors">
            [ RETURN TO COMMAND CENTER ]
         </Link>
         <p className="text-[10px] text-gray-700 mt-2">MediSurge Mobile Simulation v1.0 • Connected to Hospital Portal</p>
         
         {/* Debug Info */}
         {webhookStatus && (
           <div className={`mt-3 border rounded-lg p-2 text-left ${
             webhookStatus.includes('Error') || webhookStatus.includes('500') 
               ? 'bg-red-500/10 border-red-500/30' 
               : 'bg-neon-teal/10 border-neon-teal/30'
           }`}>
             <div className={`text-[10px] font-mono ${
               webhookStatus.includes('Error') ? 'text-red-400' : 'text-neon-teal'
             }`}>
               🔗 WEBHOOK: {webhookStatus}
             </div>
             {webhookStatus.includes('Error') && (
               <div className="text-[9px] text-yellow-400 mt-1">
                 ⚠️ Check your n8n workflow - it may need to be activated or the endpoint might have an issue
               </div>
             )}
             {emergencyResponse && (
               <div className="text-[9px] text-gray-400 mt-1 font-mono break-all">
                 Response: {JSON.stringify(emergencyResponse)}
               </div>
             )}
           </div>
         )}
      </div>

    </div>
  );
};

export default PatientPortal;