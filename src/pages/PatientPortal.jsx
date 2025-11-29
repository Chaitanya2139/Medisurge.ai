import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import Vapi from '@vapi-ai/web';
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
// PatientPortal - Emergency Response System with AI Voice Triage
// 
// FLOW:
// 1. User presses SOS button
// 2. Vapi AI Agent starts voice conversation (speaks + listens)
// 3. AI asks questions about emergency and gathers information
// 4. Conversation continues until AI has all needed details
// 5. User or AI ends call → Emergency services dispatched
//
// The AI agent has prompts to conduct thorough triage conversations
// and won't end the call until it has complete emergency information.
// ========================================================================

const PatientPortal = () => {
  const [isAppLaunched, setIsAppLaunched] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, listening, processing, dispatched
  const [transcript, setTranscript] = useState('');
  const [patientLocation, setPatientLocation] = useState({ lat: null, lng: null, address: '' });
  const [emergencyResponse, setEmergencyResponse] = useState(null);
  const [webhookStatus, setWebhookStatus] = useState(''); // For debugging
  const [isListening, setIsListening] = useState(false);
  const [userSpeech, setUserSpeech] = useState('');
  const [vapiCallStatus, setVapiCallStatus] = useState(''); // Vapi call status
  const appRef = useRef(null);
  const recognitionRef = useRef(null);
  const vapiRef = useRef(null);
  const activeCallRef = useRef(null); // Store the active call instance

  // Vapi AI Configuration
  // Get your Public Key from: https://dashboard.vapi.ai/settings
  // NOTE: Public Key is different from Assistant ID!
  const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY || '4193d057-856a-4c00-b6de-903456050653';
  const VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID || '4193d057-856a-4c00-b6de-903456050653';

  // Show setup status immediately
  useEffect(() => {
    if (VAPI_PUBLIC_KEY === 'your_public_key_here' || VAPI_PUBLIC_KEY === VAPI_ASSISTANT_ID) {
      console.warn('\n' + '⚠️ '.repeat(15));
      console.warn('🚨 VAPI SETUP INCOMPLETE!');
      console.warn('📋 TO DO:');
      console.warn('  1. Visit: https://dashboard.vapi.ai/settings');
      console.warn('  2. Copy your Public Key (Web SDK Key)');
      console.warn('  3. Update .env: VITE_VAPI_PUBLIC_KEY=<your_key>');
      console.warn('  4. Run: npm run dev');
      console.warn('⚠️ '.repeat(15) + '\n');
    }
  }, []);

  // Get patient's location on component mount
  useEffect(() => {
    // Initialize Vapi Client (event listeners will be on call instance)
    try {
      vapiRef.current = new Vapi(VAPI_PUBLIC_KEY);
      console.log('✅ Vapi client initialized');
      console.log('📋 Using credentials:', {
        publicKey: VAPI_PUBLIC_KEY?.substring(0, 20) + '...',
        assistantId: VAPI_ASSISTANT_ID?.substring(0, 20) + '...',
        isPlaceholder: VAPI_PUBLIC_KEY === 'your_public_key_here' || VAPI_PUBLIC_KEY === '4193d057-856a-4c00-b6de-903456050653'
      });
      
      if (VAPI_PUBLIC_KEY === 'your_public_key_here') {
        console.error('⚠️ VAPI_PUBLIC_KEY is still set to placeholder!');
        console.error('🔧 Update .env file with your actual Vapi Public Key from https://dashboard.vapi.ai/');
      }
    } catch (error) {
      console.error('Failed to initialize Vapi:', error);
    }

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
      recognitionRef.current.continuous = true; // Keep listening
      recognitionRef.current.interimResults = true; // Show interim results
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        // Get all results (interim + final)
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Update display with what's being said
        const currentSpeech = (finalTranscript + interimTranscript).trim();
        if (currentSpeech) {
          setUserSpeech(currentSpeech);
          setTranscript(`You're saying: "${currentSpeech}"`);
          console.log('🎤 Current speech:', currentSpeech);
        }
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

    // Cleanup Vapi on unmount
    return () => {
      if (activeCallRef.current) {
        activeCallRef.current.stop();
        activeCallRef.current = null;
      }
    };
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

  // ========================================================================
  // LEGACY FUNCTIONS (Now using Vapi AI for direct voice conversation)
  // These are kept as fallback but main flow is through startVapiConversation
  // ========================================================================

  // Analyze emergency from user speech (LEGACY - not used in main flow)
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

  // Send emergency data to hospital via AI calling agent
  const sendEmergencyToHospital = async (emergencyData) => {
    console.log('🚨 EMERGENCY DATA PREPARED:', emergencyData);
    setWebhookStatus('Initiating AI Medical Triage Call...');
    
    try {
      // Initiate Vapi AI call using Web SDK
      const vapiCallResult = await initiateVapiWebCall(emergencyData);
      
      if (vapiCallResult.success) {
        setWebhookStatus('AI Triage Agent Connected - Call in progress');
        return { success: true };
      } else {
        throw new Error(vapiCallResult.error || 'Failed to initiate call');
      }
    } catch (error) {
      console.error('❌ Error initiating AI call:', error);
      setWebhookStatus(`Error: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  // Initiate Vapi AI Medical Triage Call using Web SDK
  const initiateVapiWebCall = async (emergencyData) => {
    if (!vapiRef.current) {
      return {
        success: false,
        error: 'Vapi client not initialized'
      };
    }

    try {
      console.log('🚀 Starting Vapi call...');
      setVapiCallStatus('initiating');

      // Set up event listeners on the client BEFORE starting the call
      vapiRef.current.on('call-start', () => {
        console.log('📞 Vapi call started');
        setVapiCallStatus('connected');
        setWebhookStatus('AI Medical Triage call in progress...');
      });

      vapiRef.current.on('call-end', () => {
        console.log('📞 Vapi call ended');
        setVapiCallStatus('ended');
        setWebhookStatus('AI Triage call completed');
        activeCallRef.current = null;
      });

      vapiRef.current.on('speech-start', () => {
        console.log('🎤 Patient started speaking');
      });

      vapiRef.current.on('speech-end', () => {
        console.log('🎤 Patient stopped speaking');
      });

      vapiRef.current.on('error', (error) => {
        console.error('❌ Vapi error:', error);
        setVapiCallStatus('error');
        setWebhookStatus(`Call error: ${error.message}`);
        activeCallRef.current = null;
      });

      vapiRef.current.on('message', (message) => {
        console.log('💬 Vapi message:', message);
      });

      // Start the call - this may or may not return a call instance
      const call = await vapiRef.current.start({
        agent: {
          id: VAPI_ASSISTANT_ID
        },
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: 'en'
        },
        // Pass emergency context to the assistant
        metadata: {
          patientName: emergencyData.patientInfo.name,
          emergencyType: emergencyData.emergency.type,
          symptoms: emergencyData.emergency.symptoms.join(', '),
          severity: emergencyData.emergency.severity,
          location: emergencyData.location.address,
          coordinates: `${emergencyData.location.latitude}, ${emergencyData.location.longitude}`,
          vitalSigns: JSON.stringify(emergencyData.vitalSigns),
          aiAssessment: emergencyData.aiAssessment,
          timestamp: emergencyData.emergency.timestamp
        }
      });

      // Store the call instance if returned
      if (call) {
        activeCallRef.current = call;
      }

      console.log('✅ Vapi web call initiated successfully');
      return {
        success: true
      };

    } catch (error) {
      console.error('❌ Vapi web call error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Stop Vapi call
  const stopVapiCall = () => {
    if (vapiRef.current) {
      console.log('🛑 Ending Vapi AI conversation...');
      vapiRef.current.stop();
      setVapiCallStatus('ended');
      setStatus('dispatched');
      setTranscript('AI conversation ended. Emergency services have been notified.');
      activeCallRef.current = null;
    }
  };

  const handleSOS = () => {
    setStatus('listening');
    setTranscript('🤖 MediSurge AI Agent is connecting...');
    setIsListening(true);
    
    // Directly start Vapi AI call for voice conversation
    startVapiConversation();
  };

  // Start Vapi AI conversation directly
  const startVapiConversation = async () => {
    if (!vapiRef.current) {
      setTranscript('Error: AI Agent not initialized');
      setTimeout(() => setStatus('idle'), 2000);
      return;
    }

    try {
      console.log('🚀 Starting Vapi AI conversation...');
      setVapiCallStatus('connecting');
      setTranscript('🤖 AI Medical Triage Agent is connecting...');

      // Set up event listeners on the client BEFORE starting the call
      vapiRef.current.on('call-start', () => {
        console.log('📞 Vapi call started - AI is now speaking');
        setVapiCallStatus('connected');
        setStatus('processing'); // Change to processing state
        setTranscript('🎤 AI Agent connected! Speak naturally, the AI will guide you.');
        setIsListening(false); // Not using local recognition anymore
      });

      vapiRef.current.on('call-end', () => {
        console.log('📞 Vapi call ended');
        setVapiCallStatus('ended');
        setStatus('dispatched');
        setTranscript('Call completed. Emergency services dispatched.');
        activeCallRef.current = null;
      });

      vapiRef.current.on('speech-start', () => {
        console.log('🎤 Patient started speaking');
        setTranscript('🎤 You are speaking...');
      });

      vapiRef.current.on('speech-end', () => {
        console.log('🎤 Patient stopped speaking - AI is processing');
        setTranscript('🤖 AI is responding...');
      });

      vapiRef.current.on('error', (error) => {
        console.error('❌ Vapi error:', error);
        setVapiCallStatus('error');
        setTranscript(`Error: ${error.message}`);
        setStatus('idle');
        activeCallRef.current = null;
      });

      vapiRef.current.on('message', (message) => {
        console.log('💬 Vapi message:', message);
        // Display AI responses in transcript
        if (message.type === 'transcript' && message.transcriptType === 'final') {
          if (message.role === 'assistant') {
            setTranscript(`🤖 AI: ${message.transcript}`);
          } else if (message.role === 'user') {
            setTranscript(`👤 You: ${message.transcript}`);
          }
        }
      });

      // Start the call with assistant ID as first parameter
      const call = await vapiRef.current.start(VAPI_ASSISTANT_ID, {
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: 'en'
        },
        // Pass patient context to the AI assistant
        metadata: {
          patientLocation: patientLocation.address,
          coordinates: `${patientLocation.lat}, ${patientLocation.lng}`,
          timestamp: new Date().toISOString(),
          emergencyType: 'SOS Button Pressed',
          vitalSigns: {
            heartRate: 82,
            bloodPressure: '140/90',
            oxygenLevel: 94
          }
        }
      });

      // Store the call instance if returned
      if (call) {
        activeCallRef.current = call;
      }

      console.log('✅ Vapi AI conversation started');

    } catch (error) {
      console.error('❌ Error starting Vapi conversation:', error);
      setVapiCallStatus('error');
      
      let errorMessage = 'Failed to connect AI Agent';
      
      // Check for authentication errors
      if (error.status === 401 || error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        errorMessage = '🔑 Invalid Vapi Credentials';
        console.error('\n' + '='.repeat(60));
        console.error('🚨 AUTHENTICATION ERROR - ACTION REQUIRED:');
        console.error('='.repeat(60));
        console.error('1. Go to: https://dashboard.vapi.ai/settings');
        console.error('2. Copy your PUBLIC KEY (Web SDK Key)');
        console.error('3. Update .env file: VITE_VAPI_PUBLIC_KEY=your_actual_key');
        console.error('4. Restart dev server: npm run dev');
        console.error('='.repeat(60) + '\n');
        setTranscript('⚠️ Setup Required: Update VAPI_PUBLIC_KEY in .env file. See console for instructions.');
      } else if (error.message?.includes('fetch')) {
        errorMessage = 'Network error - Check your Vapi credentials';
        setTranscript(`⚠️ ${errorMessage}. See console for details.`);
      } else if (error.message) {
        errorMessage = error.message;
        setTranscript(`⚠️ ${errorMessage}`);
      } else {
        setTranscript(`⚠️ ${errorMessage}. Please check console for details.`);
      }
      
      setStatus('idle');
      
      // Log detailed error for debugging
      console.error('Vapi Error Details:', {
        publicKey: VAPI_PUBLIC_KEY?.substring(0, 20) + '...',
        assistantId: VAPI_ASSISTANT_ID?.substring(0, 20) + '...',
        isPlaceholder: VAPI_PUBLIC_KEY === 'your_public_key_here',
        error: error
      });
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

            {/* --- SCREEN 2: AI CONVERSATION ACTIVE --- */}
            {(status === 'listening' || status === 'processing') && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-900/50">
                 <div className="w-24 h-24 rounded-full border-2 border-neon-teal flex items-center justify-center mb-8 relative">
                    <Mic size={32} className="text-neon-teal" />
                    <div className="absolute inset-0 border-4 border-neon-teal/20 rounded-full animate-ping"></div>
                 </div>
                 <h3 className="text-xl font-bold mb-4">
                   {status === 'listening' ? '🤖 AI Agent Connecting...' : '🎤 AI Conversation Active'}
                 </h3>
                 <div className="bg-black/50 p-4 rounded-lg w-full border border-white/10 min-h-[120px] mb-4">
                    <p className="text-neon-teal font-mono text-sm leading-relaxed">{transcript}</p>
                    {vapiCallStatus === 'connected' && (
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-green-400 text-xs">Live AI conversation - Speak naturally</p>
                      </div>
                    )}
                    {vapiCallStatus === 'connecting' && (
                      <p className="text-yellow-400 text-xs mt-2 animate-pulse">Connecting to AI Medical Triage...</p>
                    )}
                 </div>
                 
                 {/* End Call Button - Always visible during conversation */}
                 {vapiCallStatus === 'connected' && (
                   <button 
                     onClick={stopVapiCall}
                     className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full mb-4 transition-all shadow-lg shadow-red-500/50"
                   >
                     ⏹ End AI Call
                   </button>
                 )}
                 
                 <VoiceWave active={vapiCallStatus === 'connected'} />
                 
                 <div className="mt-6 text-center text-gray-400 text-xs max-w-[280px]">
                   <p>The AI agent will ask you questions about your emergency.</p>
                   <p className="mt-1">Speak clearly and provide detailed information.</p>
                   <p className="mt-2 text-neon-teal">The conversation continues until the AI has all needed information.</p>
                 </div>
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
                    {vapiCallStatus && (
                      <div className="mt-2 text-[10px] text-purple-400 bg-purple-500/10 p-2 rounded border border-purple-500/20 animate-pulse">
                        📞 AI Medical Triage: {vapiCallStatus === 'connected' ? 'Call Active' : 'Initiating...'}
                      </div>
                    )}
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
                 
                 {/* End Call Button (if Vapi call is active) */}
                 {(vapiCallStatus === 'connected' || vapiCallStatus === 'initiating') && (
                   <button 
                     onClick={stopVapiCall}
                     className="mt-2 py-3 w-full bg-red-500/20 border border-red-500 text-red-400 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-colors"
                   >
                     End AI Triage Call
                   </button>
                 )}
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
         <p className="text-[10px] text-gray-700 mt-2">MediSurge Mobile Simulation v1.0 • AI Medical Triage Active</p>
         
         {/* Debug Info */}
         {webhookStatus && (
           <div className={`mt-3 border rounded-lg p-2 text-left ${
             webhookStatus.includes('Error') || webhookStatus.includes('Failed') 
               ? 'bg-red-500/10 border-red-500/30' 
               : 'bg-neon-teal/10 border-neon-teal/30'
           }`}>
             <div className={`text-[10px] font-mono ${
               webhookStatus.includes('Error') ? 'text-red-400' : 'text-neon-teal'
             }`}>
               {vapiCallStatus === 'connected' ? '📞' : '🔗'} STATUS: {webhookStatus}
             </div>
             {vapiCallStatus && (
               <div className="text-[9px] text-purple-400 mt-1">
                 🤖 Vapi AI Agent: {vapiCallStatus}
               </div>
             )}
             {webhookStatus.includes('Error') && (
               <div className="text-[9px] text-yellow-400 mt-1">
                 ⚠️ Check Vapi API configuration and phone number format
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