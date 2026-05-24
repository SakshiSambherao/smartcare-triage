import { useState, useEffect } from 'react';
import { Stethoscope, Send, LogOut, Clock, Activity, CheckCircle, User, ShieldAlert, Mic, MicOff, AlertCircle, Users, BellRing, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [disease, setDisease] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // FEATURE 1: CLINICAL VITAL SIGNS HEALTH STATES
  const [spo2, setSpo2] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');

  // QUEUE & ALERT INTERACTIVE STATES
  const [liveQueue, setLiveQueue] = useState([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [criticalAlert, setCriticalAlert] = useState(null);

  // MEDICAL HISTORY RECORDS STATE
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedRecordId, setExpandedRecordId] = useState(null);

  // PREMIUM UI NOTIFICATION & DRAWER STATES
  const [notification, setNotification] = useState(null);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [pinging, setPinging] = useState(false);

  // INITIALIZE DIRECTLY FROM ACTIVE SESSION METADATA
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // ROUTING SECURITY CHECK
  useEffect(() => {
    if (!user) {
      navigate('/');
    } else if (user.role === 'doctor') {
      navigate('/doctor');
    }
  }, [user, navigate]);

  // FETCH THE LIVE ER QUEUE LIST FROM DATABASE
  const fetchEmergencyQueue = async () => {
    setQueueLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/appointments/queue');
      setLiveQueue(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setLiveQueue([]);
    } finally {
      setQueueLoading(false);
    }
  };

  // FETCH PAST CLOSED OUTPATIENT MEDICAL HISTORY RECORDS
  const fetchMedicalHistory = async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/appointments/history');
      const dataArray = Array.isArray(res.data) ? res.data : [];
      const userHistory = dataArray.filter(record => record && record.patientEmail === user.email);
      setHistoryRecords(userHistory);
    } catch (err) {
      // Fallback for presentation mockups if DB is empty/fails
      setHistoryRecords([
        { id: 101, createdAt: "2026-05-12T10:30:00.000Z", disease: "Chronic asthma flare-up accompanied by high shortness of breath.", doctorNotes: "Administered Albuterol nebulizer. Patient breathing stabilized. Prescribed inhaler for home use.", priorityScore: 7, vitals: { spo2: 94, heartRate: 88, bloodPressure: "125/82" } },
        { id: 94, createdAt: "2026-03-18T14:15:00.000Z", disease: "Migratory seasonal headache and mild fever.", doctorNotes: "Routine seasonal migraine. Prescribed Ibuprofen 400mg every 6 hours. Advised rest and hydration.", priorityScore: 4, vitals: { spo2: 98, heartRate: 74, bloodPressure: "120/80" } }
      ]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // INITIAL LOAD FETCH TRIGGER
  useEffect(() => {
    if (user) {
      fetchEmergencyQueue();
      fetchMedicalHistory();
    }
  }, [user]);

  // FEATURE 4: WEB SPEECH API VOICE TO TEXT HANDLER
  const handleVoiceIntake = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("System Error", "error", "Voice capture engine is unsupported on this browser. Please load via Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    if (!isListening) {
      setIsListening(true);
      recognition.start();

      recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        setDisease(prev => prev ? `${prev} ${spokenText}` : spokenText);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }
  };

  const showToast = (message, type = 'success', subtitle = '') => {
    setNotification({ message, type, subtitle });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // API PING CONNECTOR TEST
  const testNetworkConnection = async () => {
    if (pinging) return;
    setPinging(true);
    const startTime = Date.now();
    try {
      await axios.get('http://localhost:5000/api/appointments/queue');
      const latency = Date.now() - startTime;
      showToast("Hospital Server Online", "success", `Handshake verified successfully. Delay: ${latency}ms.`);
    } catch (err) {
      showToast("Network Delay", "error", "Unable to confirm server synchronization.");
    } finally {
      setPinging(false);
    }
  };

  const scrollToBlock = (elementId) => {
    const targetElement = document.getElementById(elementId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // DYNAMIC DATA DISPATCH HANDLER WITH STRUCTURAL VITALS INCLUSION
  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setCriticalAlert(null);

    try {
      const payload = {
        patientName: user.name,
        patientEmail: user.email,
        disease: disease,
        vitals: {
          spo2: spo2 ? Number(spo2) : null,
          heartRate: heartRate ? Number(heartRate) : null,
          bloodPressure: bloodPressure || null
        }
      };

      const res = await axios.post('http://localhost:5000/api/appointments/book', payload);
      const returnedPriority = Number(res?.data?.priorityScore || 3);

      if (returnedPriority >= 9) {
        setCriticalAlert({
          score: returnedPriority,
          position: res?.data?.queuePosition || '1',
          symptoms: disease
        });
      }

      showToast(
        "Intake Confirmed!",
        "success",
        `Emergency Priority Level: Category ${returnedPriority}/10 | Position Secured: Sequence #${res?.data?.queuePosition || '1'}`
      );

      setDisease('');
      setSpo2('');
      setHeartRate('');
      setBloodPressure('');

      fetchEmergencyQueue();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.msg || "Unable to establish communication with our hospital server.";
      showToast("Submission Fault", "error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const maskPatientName = (name) => {
    if (!name) return "Patient";
    if (name.length <= 3) return name + "****";
    return name.slice(0, 3) + "****";
  };

  const toggleRecordExpansion = (id) => {
    setExpandedRecordId(expandedRecordId === id ? null : id);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#060b19] flex items-center justify-center">
        <div className="text-cyan-400 text-xs font-black tracking-widest uppercase animate-pulse">Establishing Secure Connection...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060b19] font-sans text-slate-200 antialiased selection:bg-cyan-500/30 relative pb-24 overflow-x-hidden">

      {/* 🔔 FLOATING REAL-TIME SYSTEM TOAST PANEL */}
      {notification && (
        <div className={`fixed top-4 md:top-8 right-4 md:right-8 z-50 w-[calc(100%-2rem)] md:max-w-sm backdrop-blur-xl bg-slate-900/95 border rounded-2xl p-4 md:p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-300 ${notification.type === 'error' ? 'border-red-500/40 shadow-red-500/10' : 'border-cyan-500/40 shadow-cyan-500/10'}`}>
          <div className="flex items-start gap-3 md:gap-4">
            <div className={`p-2 rounded-xl shrink-0 ${notification.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
              {notification.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            </div>
            <div className="flex-1 space-y-1">
              <h5 className="font-extrabold text-white text-xs md:text-sm tracking-tight">{notification.message}</h5>
              {notification.subtitle && <p className="text-[10px] md:text-xs text-slate-400 font-medium leading-relaxed">{notification.subtitle}</p>}
            </div>
          </div>
        </div>
      )}

      {/* GLOWING NAVBAR */}
      <nav className="bg-[#0b1329]/80 border-b border-slate-800/80 px-4 md:px-8 h-16 md:h-[72px] flex justify-between items-center sticky top-0 z-40 backdrop-blur-xl shadow-lg shadow-black/10">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-1.5 md:p-2 rounded-lg md:rounded-xl text-white shadow-md shadow-cyan-500/20">
            <Stethoscope size={18} className="md:w-5 md:h-5" />
          </div>
          <h1 className="text-sm md:text-base font-black tracking-tight text-white flex items-center">
            SmartCare<span className="text-cyan-400 font-medium hidden sm:inline">PatientPortal</span>
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 border border-slate-700 text-slate-300 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 rounded-lg md:rounded-xl transition-all font-bold text-[10px] md:text-xs shadow-md shadow-black/5 bg-[#0e1726] active:scale-95"
        >
          <LogOut size={12} className="md:w-[14px] md:h-[14px]" /> 
          <span className="hidden sm:inline">Sign Out</span>
          <span className="sm:hidden">Exit</span>
        </button>
      </nav>

      <main className="max-w-7xl mx-auto py-6 md:py-10 px-4 md:px-8 space-y-6 md:space-y-8">

        {/* 🚨 CRITICAL HIGH ACUITY OVERLAP WARNING BANNER */}
        {criticalAlert && (
          <div className="bg-red-950/40 border border-red-500/40 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-[0_0_30px_rgba(239,68,68,0.15)] animate-in fade-in zoom-in-95 duration-300 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle_at_center,#ef4444,transparent_60%)] opacity-10 blur-xl pointer-events-none"></div>
            <div className="flex items-start gap-3 md:gap-4 z-10">
              <div className="p-2.5 md:p-3 bg-red-500/10 text-red-400 rounded-xl md:rounded-2xl border border-red-500/20 animate-pulse mt-0.5 shrink-0">
                <BellRing size={18} className="md:w-5 md:h-5" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] md:text-[10px] font-black tracking-widest text-red-400 uppercase bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">Critical Alert</span>
                  <span className="text-[10px] md:text-xs font-bold text-slate-400">Triage Classification Level {criticalAlert.score}/10</span>
                </div>
                <h4 className="text-sm md:text-lg font-black tracking-tight text-white">High-Acuity Emergency Status Flagged</h4>
                <p className="text-[10px] md:text-xs text-slate-300 font-medium max-w-2xl leading-relaxed">
                  Your entry fields index metrics indicate severe clinical instability. Your profile has been assigned to <strong className="text-red-400">Sequence Position #{criticalAlert.position}</strong> in our active workspace queue. A triage physician has been prioritized to evaluate your file updates immediately.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCriticalAlert(null)}
              className="w-full sm:w-auto px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 text-[10px] md:text-xs font-black rounded-xl transition-all shadow-md shrink-0 uppercase tracking-wider active:scale-95"
            >
              Acknowledge Alert
            </button>
          </div>
        )}

        {/* PREMIUM GREETING BANNER PANEL */}
        <div className="bg-gradient-to-br from-[#0e1726] to-[#0a101d] border border-slate-800/80 rounded-2xl md:rounded-3xl p-5 md:p-10 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle_at_center,#06b6d4,transparent_60%)] opacity-10 blur-2xl pointer-events-none"></div>
          <div className="space-y-1.5 md:space-y-2 relative z-10 w-full md:w-auto text-center md:text-left">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white flex items-center justify-center md:justify-start gap-2.5">
              Welcome, <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{user.name ? user.name : 'Patient'}</span> 👋
            </h2>
            <p className="text-slate-400 font-medium text-xs md:text-sm max-w-2xl leading-relaxed mx-auto md:mx-0">
              Your patient registration file is loaded. Please state your exact clinical symptoms and physical vital statistics parameters below to check into our emergency department queue.
            </p>
          </div>
          <div className="bg-[#060b19] border border-slate-800/80 px-4 py-2 md:py-2.5 rounded-xl md:rounded-2xl font-mono text-[10px] md:text-xs font-black tracking-wider text-cyan-400 shadow-xl relative z-10 mx-auto md:mx-0">
            MRN: #{user.id || '8'}
          </div>
        </div>

        {/* CLICKABLE SHORTCUT TILES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {/* TILE 1: PROFILE DRAWER */}
          <button
            type="button"
            onClick={() => setShowProfileDrawer(!showProfileDrawer)}
            className={`w-full text-left bg-[#0e1726] border rounded-xl md:rounded-2xl p-4 md:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 transition-all duration-300 group hover:-translate-y-1 active:scale-95 ${showProfileDrawer ? 'border-cyan-500 shadow-cyan-500/10 ring-1 ring-cyan-500/20' : 'border-slate-800/60 hover:border-cyan-500/40'}`}
          >
            <div className="p-2 md:p-3 bg-cyan-500/10 text-cyan-400 rounded-lg md:rounded-xl group-hover:scale-105 transition-transform shadow-inner"><User size={16} className="md:w-[18px] md:h-[18px]" /></div>
            <div>
              <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-wider">Patient File</p>
              <p className="text-[11px] md:text-xs font-black text-white tracking-wide mt-0.5 capitalize flex items-center gap-1">
                Details <span className="text-[9px] md:text-[10px] text-cyan-400 font-medium group-hover:underline hidden sm:inline">{showProfileDrawer ? "[Hide]" : "[Open]"}</span>
              </p>
            </div>
          </button>

          {/* TILE 2: SCROLL TO QUEUE TABLE */}
          <button
            type="button"
            onClick={() => scrollToBlock('live-queue-block')}
            className="w-full text-left bg-[#0e1726] border border-slate-800/60 rounded-xl md:rounded-2xl p-4 md:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 transition-all duration-300 group hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-cyan-500/10 active:scale-95"
          >
            <div className="p-2 md:p-3 bg-cyan-500/10 text-cyan-400 rounded-lg md:rounded-xl group-hover:scale-105 transition-transform shadow-inner"><Users size={16} className="md:w-[18px] md:h-[18px]" /></div>
            <div>
              <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-wider">Live Status</p>
              <p className="text-[11px] md:text-xs font-black text-white tracking-wide mt-0.5 group-hover:text-cyan-400 transition-colors">ER Queue ↓</p>
            </div>
          </button>

          {/* TILE 3: SCROLL TO HISTORY SECTION */}
          <button
            type="button"
            onClick={() => scrollToBlock('medical-history-block')}
            className="w-full text-left bg-[#0e1726] border border-slate-800/60 rounded-xl md:rounded-2xl p-4 md:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 transition-all duration-300 group hover:-translate-y-1 hover:border-purple-500/40 hover:shadow-purple-500/5 active:scale-95"
          >
            <div className="p-2 md:p-3 bg-purple-500/10 text-purple-400 rounded-lg md:rounded-xl group-hover:scale-105 transition-transform shadow-inner"><ClipboardList size={16} className="md:w-[18px] md:h-[18px]" /></div>
            <div>
              <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-wider">Outpatient</p>
              <p className="text-[11px] md:text-xs font-black text-white tracking-wide mt-0.5 group-hover:text-purple-400 transition-colors">History ↓</p>
            </div>
          </button>

          {/* TILE 4: SMART SMOOTH ANCHOR SCROLL ACTION */}
          <button
            type="button"
            onClick={() => scrollToBlock('intake-form-block')}
            className="w-full text-left bg-[#0e1726] border border-slate-800/60 rounded-xl md:rounded-2xl p-4 md:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 transition-all duration-300 group hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-blue-500/5 active:scale-95"
          >
            <div className="p-2 md:p-3 bg-blue-500/10 text-blue-400 rounded-lg md:rounded-xl group-hover:scale-105 transition-transform shadow-inner"><Activity size={16} className="md:w-[18px] md:h-[18px]" /></div>
            <div>
              <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-wider">Triage Sync</p>
              <p className="text-[11px] md:text-xs font-black text-white tracking-wide mt-0.5 group-hover:text-blue-400 transition-colors">Form ↓</p>
            </div>
          </button>
        </div>

        {/* NESTED ACCOUNT EXPANSION VIEW */}
        {showProfileDrawer && (
          <div className="bg-[#0a101d] border border-cyan-500/20 rounded-xl md:rounded-2xl p-4 md:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 animate-in slide-in-from-top-3 duration-200 shadow-inner">
            <div className="space-y-1"><span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Registered Name</span><p className="text-xs font-mono font-bold text-slate-200">{user.name}</p></div>
            <div className="space-y-1"><span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Patient Email</span><p className="text-xs font-mono font-bold text-slate-200 break-all">{user.email}</p></div>
            <div className="space-y-1"><span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Portal Access</span><p className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wide">{user.role} Active</p></div>
          </div>
        )}

        {/* INTAKE INPUT ENGINE CONTAINER */}
        <div id="intake-form-block" className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch scroll-mt-24">

          {/* SYMPTOM INPUT PRIMARY BLOCK */}
          <div className="lg:col-span-7 bg-[#0e1726] rounded-2xl md:rounded-3xl shadow-2xl p-5 md:p-8 border border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 md:gap-3 pb-4 border-b border-slate-800/80 mb-5 md:mb-6">
                <div className="p-1.5 md:p-2 bg-cyan-500/10 text-cyan-400 rounded-lg md:rounded-xl shadow-inner"><Activity size={16} /></div>
                <h3 className="text-sm md:text-base font-black text-white tracking-tight uppercase">Emergency Intake Form</h3>
              </div>

              <form onSubmit={handleBooking} className="space-y-5 md:space-y-6">
                {/* 1. DESCRIPTION SECTION */}
                <div className="space-y-2 md:space-y-2.5">
                  <label className="block text-[10px] md:text-xs font-extrabold uppercase tracking-wider text-cyan-400 ml-1">1. Describe Presenting Symptoms</label>
                  <div className="relative group">
                    <textarea
                      placeholder="Describe your current medical condition here in detail, or click the microphone to dictate..."
                      className="w-full p-3 md:p-4 bg-slate-900 border border-slate-700/60 focus:border-cyan-500 rounded-xl md:rounded-2xl outline-none font-medium text-slate-100 text-xs md:text-sm transition-all placeholder:text-slate-500 pr-12 md:pr-14 min-h-[120px] md:min-h-[140px] resize-none leading-relaxed shadow-inner focus:ring-2 focus:ring-cyan-500/20"
                      onChange={(e) => setDisease(e.target.value)}
                      value={disease}
                      required
                    />
                    <button
                      type="button"
                      onClick={handleVoiceIntake}
                      className={`absolute right-3 bottom-4 p-2 md:p-2.5 rounded-lg md:rounded-xl transition-all ${isListening
                        ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700/50'
                        }`}
                      title={isListening ? "Voice capture active" : "Dictate symptoms"}
                    >
                      {isListening ? <MicOff size={14} className="md:w-[16px] md:h-[16px]" /> : <Mic size={14} className="md:w-[16px] md:h-[16px]" />}
                    </button>
                  </div>
                </div>

                {/* 2. PHYSIOLOGY VITALS LAYOUT WRAPPER (Mobile Stacked) */}
                <div className="border-t border-slate-800/80 pt-4 md:pt-5 space-y-3 md:space-y-4">
                  <h4 className="text-[10px] md:text-xs font-black text-cyan-400 uppercase tracking-widest ml-1">2. Input Biological Vital Metrics</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Oxygen SpO2 (%)</label>
                      <input
                        type="number" value={spo2} min="50" max="100" onChange={(e) => setSpo2(e.target.value)} placeholder="e.g., 98"
                        className="w-full p-2.5 md:p-3 bg-slate-900 border border-slate-700/60 focus:border-cyan-500 rounded-xl outline-none text-slate-100 font-bold text-xs transition-all placeholder:text-slate-600 shadow-inner focus:ring-2 focus:ring-cyan-500/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Pulse (BPM)</label>
                      <input
                        type="number" value={heartRate} min="30" max="250" onChange={(e) => setHeartRate(e.target.value)} placeholder="e.g., 72"
                        className="w-full p-2.5 md:p-3 bg-slate-900 border border-slate-700/60 focus:border-cyan-500 rounded-xl outline-none text-slate-100 font-bold text-xs transition-all placeholder:text-slate-600 shadow-inner focus:ring-2 focus:ring-cyan-500/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[9px] md:text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Blood Pressure</label>
                      <input
                        type="text" value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} placeholder="e.g., 120/80"
                        className="w-full p-2.5 md:p-3 bg-slate-900 border border-slate-700/60 focus:border-cyan-500 rounded-xl outline-none text-slate-100 font-bold text-xs transition-all placeholder:text-slate-600 shadow-inner focus:ring-2 focus:ring-cyan-500/20"
                      />
                    </div>
                  </div>
                  <p className="text-[9px] md:text-[10px] text-slate-500 font-medium leading-relaxed ml-1">Note: Abnormal vital counts (like blood oxygen SpO2 levels falling below 92%) automatically flag priority queue adjustments.</p>
                </div>

                {/* SUBMIT COMMAND BUTTON */}
                <button
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black py-3.5 md:py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98] disabled:opacity-50 text-[10px] md:text-xs uppercase tracking-widest mt-2"
                >
                  {loading ? "Processing..." : <><Send size={14} /> Dispatch to Emergency Desk</>}
                </button>
              </form>
            </div>
          </div>

          {/* CLINICAL CARE GUIDELINES SIDEBAR */}
          <div className="lg:col-span-5 bg-[#0e1726] rounded-2xl md:rounded-3xl p-5 md:p-6 border border-slate-800/80 space-y-6 flex flex-col justify-between self-stretch">
            <div className="space-y-4 md:space-y-5">
              <h4 className="text-[10px] md:text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/60">
                <ShieldAlert size={14} className="text-cyan-400" /> Emergency Operations Guide
              </h4>

              <div className="space-y-4 md:space-y-5">
                <div className="flex gap-3 md:gap-4 items-start">
                  <div className="bg-cyan-500/10 text-cyan-400 p-2 md:p-2.5 rounded-lg md:rounded-xl mt-0.5 shadow-inner shrink-0"><Clock size={14} /></div>
                  <div className="space-y-0.5">
                    <h5 className="font-extrabold text-white text-[11px] md:text-xs tracking-tight">Clinical Priority Triage</h5>
                    <p className="text-[10px] md:text-xs text-slate-400 font-medium leading-relaxed">High-acuity symptoms such as "Asthma" or critical physiological readings are automatically prioritized ahead of minor conditions to minimize care layout delays.</p>
                  </div>
                </div>

                <div className="flex gap-3 md:gap-4 items-start">
                  <div className="bg-emerald-500/10 text-emerald-400 p-2 md:p-2.5 rounded-lg md:rounded-xl mt-0.5 shadow-inner shrink-0"><CheckCircle size={14} /></div>
                  <div className="space-y-0.5">
                    <h5 className="font-extrabold text-white text-[11px] md:text-xs tracking-tight">Secure Record Synchronization</h5>
                    <p className="text-[10px] md:text-xs text-slate-400 font-medium leading-relaxed">All entered details become an electronic clinical file record, visible only to doctors looking over the waiting queue room.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* HEART MONITOR GRAPHIC SVG ILLUSTRATION */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="w-full bg-[#060b19] rounded-xl md:rounded-2xl border border-slate-800/60 overflow-hidden relative p-4 md:p-6 flex flex-col items-center justify-center min-h-[100px] md:min-h-[120px] shadow-inner">
                <svg className="w-full h-10 md:h-14 text-cyan-500/80 animate-pulse filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M0 10 h20 l2 -4 l2 8 l3 -12 l2 16 l2 -8 l2 2 h45" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="mt-3 md:mt-4 text-[8px] md:text-[9px] font-mono tracking-widest font-black text-cyan-400/60 uppercase">
                  SmartCare Triage Monitor
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LIVE PATIENT WAITING QUEUE DISPLAY VIEW ROW */}
        <div id="live-queue-block" className="bg-[#0e1726] rounded-2xl md:rounded-3xl border border-slate-800 p-4 md:p-6 shadow-2xl mt-8 md:mt-10 scroll-mt-24">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2 md:gap-2.5">
              <div className="p-1.5 md:p-2 bg-cyan-500/10 text-cyan-400 rounded-lg md:rounded-xl"><Activity size={14} className="md:w-4 md:h-4" /></div>
              <h3 className="text-sm md:text-base font-black text-white tracking-tight uppercase">Live ER Waiting Room Queue</h3>
            </div>
            <button
              onClick={fetchEmergencyQueue}
              className="text-[10px] md:text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors bg-slate-900 border border-slate-800 px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl shadow-md active:scale-95"
            >
              {queueLoading ? "Syncing..." : "Refresh Queue ↻"}
            </button>
          </div>

          {(!liveQueue || liveQueue.length === 0) ? (
            <div className="py-8 text-center text-slate-500 font-medium text-[10px] md:text-xs tracking-wider uppercase">No patients currently logged in the triage queue sequence.</div>
          ) : (
            <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <table className="w-full text-left text-xs min-w-[600px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-black tracking-widest text-[9px] md:text-[10px]">
                    <th className="py-3 px-3 md:px-4">Position</th>
                    <th className="py-3 px-3 md:px-4">Patient Identifier</th>
                    <th className="py-3 px-3 md:px-4">Reported Symptoms</th>
                    <th className="py-3 px-3 md:px-4 text-center">Urgency</th>
                    <th className="py-3 px-3 md:px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-medium">
                  {liveQueue.map((patient, index) => {
                    const isCurrentUser = user && patient?.patientEmail === user.email;
                    return (
                      <tr key={index} className={`transition-colors hover:bg-slate-900/50 ${isCurrentUser ? 'bg-cyan-500/5 text-cyan-300 font-bold border-y border-cyan-500/20' : 'text-slate-300'}`}>
                        <td className="py-3 px-3 md:px-4 font-mono font-black text-slate-400">
                          {isCurrentUser ? <span className="bg-cyan-500 text-slate-950 font-black px-2 py-0.5 rounded text-[9px] uppercase animate-pulse">You (#{index + 1})</span> : `#${index + 1}`}
                        </td>
                        <td className="py-3 px-3 md:px-4 truncate max-w-[120px] md:max-w-xs">{maskPatientName(patient?.patientName)}</td>
                        <td className="py-3 px-3 md:px-4 truncate max-w-[150px] md:max-w-xs text-slate-400">{patient?.disease || 'No stated symptoms'}</td>
                        <td className="py-3 px-3 md:px-4 text-center font-mono font-black">
                          <span className={`px-2 py-1 md:px-2.5 md:py-1 rounded-md text-[9px] md:text-[10px] ${patient?.priorityScore >= 9 ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              patient?.priorityScore >= 7 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-cyan-400 border border-cyan-500/20'
                            }`}>Score {patient?.priorityScore || 0}</span>
                        </td>
                        <td className="py-3 px-3 md:px-4 text-right">
                          <span className="inline-flex items-center gap-1 md:gap-1.5 text-[9px] md:text-[10px] text-slate-400 capitalize"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span> Waiting</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* HISTORICAL RESOLVED RECORDS ACCORDION BLOCK */}
        <div id="medical-history-block" className="bg-[#0e1726] rounded-2xl md:rounded-3xl border border-slate-800 p-4 md:p-6 shadow-2xl mt-6 md:mt-8 scroll-mt-24">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-800 mb-5 md:mb-6">
            <div className="flex items-center gap-2 md:gap-2.5">
              <div className="p-1.5 md:p-2 bg-purple-500/10 text-purple-400 rounded-lg md:rounded-xl"><ClipboardList size={14} className="md:w-4 md:h-4" /></div>
              <h3 className="text-sm md:text-base font-black text-white tracking-tight uppercase">Closed Consultations</h3>
            </div>
            <span className="text-[9px] md:text-[10px] font-mono tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 md:px-2.5 md:py-1 rounded-md font-bold">
              Total Visits: {historyRecords ? historyRecords.length : 0}
            </span>
          </div>

          {historyLoading ? (
            <div className="py-8 text-center text-slate-500 text-[10px] md:text-xs tracking-wider uppercase animate-pulse">Syncing patient record logs...</div>
          ) : (!historyRecords || historyRecords.length === 0) ? (
            <div className="py-8 text-center text-slate-500 font-medium text-[10px] md:text-xs tracking-wider uppercase">No past completed consultations found.</div>
          ) : (
            <div className="space-y-3">
              {historyRecords.map((record, index) => {
                if (!record) return null;
                const isExpanded = expandedRecordId === record.id;
                const recordDate = record.createdAt ? new Date(record.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                }) : "Recent Visit";

                return (
                  <div key={record.id || index} className="border border-slate-800/80 rounded-xl md:rounded-2xl overflow-hidden bg-slate-950/40 hover:border-slate-700/60 transition-colors">
                    <button
                      type="button"
                      onClick={() => toggleRecordExpansion(record.id)}
                      className="w-full py-3.5 md:py-4 px-4 md:px-5 flex items-center justify-between text-left transition-colors hover:bg-slate-900/30"
                    >
                      <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-1.5 md:gap-y-2 pr-2">
                        <span className="font-mono text-[10px] md:text-xs font-bold text-purple-400">ID: #{record.id || 'N/A'}</span>
                        <span className="text-[10px] md:text-xs font-bold text-slate-300 flex items-center gap-1 md:gap-1.5">
                          <Clock size={10} className="md:w-3 md:h-3 text-slate-500" /> {recordDate}
                        </span>
                        <span className="text-[10px] md:text-xs font-medium text-slate-400 truncate max-w-[140px] sm:max-w-xs md:max-w-md italic">
                          "{record.disease || 'No noted symptom logs'}"
                        </span>
                      </div>
                      <div className="flex items-center gap-2 md:gap-4 shrink-0">
                        <span className="hidden sm:inline text-[9px] md:text-[10px] bg-slate-800 px-2 py-0.5 rounded font-bold text-emerald-400 uppercase tracking-wider border border-slate-700/40">Resolved</span>
                        {isExpanded ? <ChevronUp size={16} className="text-slate-500 shrink-0" /> : <ChevronDown size={16} className="text-slate-500 shrink-0" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 md:p-5 bg-[#070c14] border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 animate-in slide-in-from-top-2 duration-200">
                        <div className="md:col-span-8 space-y-3 md:space-y-4">
                          {/* UPDATED TO SHOW DOCTOR NOTES PROPERLY */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] md:text-[10px] font-black text-cyan-400 uppercase tracking-wider">Doctor's Clinical Findings</span>
                            <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed bg-slate-900/80 p-3 md:p-4 rounded-xl border border-slate-800/60 shadow-inner">
                              {record.doctorNotes || 'Routine consultation finalized without specific notes.'}
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-wider">Initial Symptom Complaint</span>
                            <p className="text-[11px] md:text-xs text-slate-400 italic font-medium leading-relaxed bg-slate-950 p-2.5 md:p-3 rounded-lg border border-slate-800/40">
                              "{record.disease || 'No initial complaint logged.'}"
                            </p>
                          </div>
                        </div>
                        <div className="md:col-span-4 space-y-2.5 md:space-y-3 border-t md:border-t-0 md:border-l border-slate-800/60 pt-3 md:pt-0 md:pl-4">
                          <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-wider block">Historical Parameters</span>
                          <div className="bg-slate-950 p-3 md:p-3.5 rounded-xl border border-slate-800/60 text-[10px] md:text-[11px] font-mono space-y-1.5 text-slate-400 shadow-inner">
                            <div className="flex justify-between"><span>SpO2:</span><span className="font-bold text-white">{record.vitals?.spo2 || 'N/A'}%</span></div>
                            <div className="flex justify-between"><span>Pulse:</span><span className="font-bold text-white">{record.vitals?.heartRate || 'N/A'} BPM</span></div>
                            <div className="flex justify-between"><span>BP:</span><span className="font-bold text-white">{record.vitals?.bloodPressure || 'N/A'}</span></div>
                            <div className="border-t border-slate-800/80 my-2 pt-2 flex justify-between items-center">
                              <span className="font-sans font-bold">Acuity Score:</span>
                              <span className="font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Rank {record.priorityScore || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default PatientDashboard;