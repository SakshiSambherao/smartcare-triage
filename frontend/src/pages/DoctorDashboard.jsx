import { useState, useEffect } from 'react';
import { Stethoscope, Coffee, Users, CheckCircle, Clock, FileText, Activity, CheckSquare, LogOut } from 'lucide-react';
import axios from 'axios';

const DoctorDashboard = () => {
    const [queue, setQueue] = useState([]);
    const [analytics, setAnalytics] = useState({ total: 0, treated: 0, waiting: 0, logs: [] });
    const [onBreak, setOnBreak] = useState(false);

    // 🏥 CLINICAL INTERACTION INTERCEPT MODAL STATES
    const [showTreatModal, setShowTreatModal] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const [selectedPatientName, setSelectedPatientName] = useState('');
    const [doctorNotes, setDoctorNotes] = useState('');

    // 🫁 NEW EDITABLE VITALS STATES FOR THE DOCTOR OVERRIDE
    const [spo2, setSpo2] = useState('');
    const [heartRate, setHeartRate] = useState('');
    const [bloodPressure, setBloodPressure] = useState('');

    // ==========================================
    // DEPLOYMENT UPDATE: Dynamic API URL Routing
    // ==========================================
    const API_URL = import.meta.env.VITE_API_URL;

    // 1. FRESH UNIFIED DATA FETCH LAYER
    const fetchHospitalData = async () => {
        try {
            const breakRes = await axios.get(`${API_URL}/api/appointments/break-status`);
            setOnBreak(breakRes.data.isDoctorOnBreak);

            const qRes = await axios.get(`${API_URL}/api/appointments/queue`);
            setQueue(qRes.data || []);

            const aRes = await axios.get(`${API_URL}/api/appointments/analytics`);
            setAnalytics(aRes.data);
        } catch (err) {
            // Silenced for production
        }
    };

    useEffect(() => {
        fetchHospitalData();
        const interval = setInterval(fetchHospitalData, 3000);
        return () => clearInterval(interval);
    }, []);

    // 2. TOGGLE CLINICAL BREAK OPERATION
    const handleToggleBreak = async () => {
        const nextBreakState = !onBreak;
        try {
            await axios.post(`${API_URL}/api/appointments/toggle-break`, { onBreak: nextBreakState });
            setOnBreak(nextBreakState);
        } catch (err) {
            alert("Network delay tracking state change. Please try again.");
        }
    };

    // 3. LAUNCH INTERACTIVE TREATMENT DIALOG INTERCEPT
    const handleOpenTreatmentConsole = (patient) => {
        if (onBreak) {
            alert("Action Denied: Please toggle off your Clinical Break status before executing active treatment modifications.");
            return;
        }
        const currentId = patient.id || patient.appointmentId || patient.appointment?.id;
        
        setSelectedAppointmentId(currentId);
        setSelectedPatientName(patient.patientName || "Unregistered Case");
        setDoctorNotes(''); 

        setSpo2(patient.vitals?.spo2 || '');
        setHeartRate(patient.vitals?.heartRate || '');
        setBloodPressure(patient.vitals?.bloodPressure || '');
        
        setShowTreatModal(true);
    };

    // 4. SUBMIT COMMITTED PRESCRIPTION & UPDATED VITALS
    const handleTreatSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAppointmentId) return;

        const currentTargetId = selectedAppointmentId;
        
        setQueue(prevQueue => prevQueue.filter(p => (p.id !== currentTargetId && p.appointmentId !== currentTargetId)));
        setAnalytics(prev => ({
            ...prev,
            treated: prev.treated + 1,
            waiting: Math.max(0, prev.waiting - 1)
        }));

        try {
            const payload = { 
                id: currentTargetId,
                doctorNotes: doctorNotes.trim(),
                vitals: {
                    spo2: spo2 ? Number(spo2) : null,
                    heartRate: heartRate ? Number(heartRate) : null,
                    bloodPressure: bloodPressure || null
                }
            };

            await axios.post(`${API_URL}/api/appointments/treat`, payload);
            
            setShowTreatModal(false);
            setSelectedAppointmentId(null);
            setSelectedPatientName('');
            setDoctorNotes('');
            setSpo2('');
            setHeartRate('');
            setBloodPressure('');
            fetchHospitalData();

        } catch (err) {
            setShowTreatModal(false);
            fetchHospitalData();
        }
    };

    // 5. SECURE OPERATIONS REPORT EXPORT LOGIC
    const downloadMedicalReport = () => {
        if (!analytics.logs || analytics.logs.length === 0) {
            alert("No medical history parameters located to compile.");
            return;
        }
        const headers = ["Record ID", "Patient Name", "Email Address", "Symptom Complaint", "Acuity Score", "Status", "Timestamp"];
        const rows = analytics.logs.map(log => [
            log.id, `"${log.patientName}"`, `"${log.patientEmail}"`, `"${log.disease}"`, log.priorityScore, log.status, `"${log.createdAt}"`
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `SmartCare_Clinical_Report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased relative selection:bg-blue-500/30">
            
            {/* 🏥 CLINICAL ASSESSMENT INPUT DIALOG MODAL */}
            {showTreatModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-[#0e1726] border border-slate-800 rounded-[2rem] p-5 md:p-8 max-w-xl w-full space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-200 my-auto">
                        
                        {/* Modal Header */}
                        <div className="flex items-center gap-3 md:gap-4 pb-4 border-b border-slate-800/80">
                            <div className="p-2.5 md:p-3 bg-blue-500/10 text-blue-400 rounded-xl md:rounded-2xl">
                                <Activity size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm md:text-base font-black text-white tracking-tight uppercase">Patient Evaluation Console</h3>
                                <p className="text-[10px] md:text-xs text-slate-400 font-bold tracking-wide mt-0.5">Examining: <span className="text-slate-200">{selectedPatientName}</span> | Node: #{selectedAppointmentId}</p>
                            </div>
                        </div>

                        {/* Text Submission Sheet */}
                        <form onSubmit={handleTreatSubmit} className="space-y-5">
                            
                            {/* 🫁 INTERACTIVE LAYER: EDITABLE VITALS ENTRY ROW (Mobile stacked, Desktop grid) */}
                            <div className="bg-slate-900/50 p-4 md:p-5 rounded-2xl border border-slate-800/80 space-y-3 shadow-inner">
                                <h4 className="text-[10px] md:text-[11px] font-black text-blue-400 uppercase tracking-wider">Current Biological Vital Metrics</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Oxygen SpO2 (%)</label>
                                        <input
                                            type="number" value={spo2} min="50" max="100" onChange={(e) => setSpo2(e.target.value)} placeholder="e.g., 98"
                                            className="w-full p-2.5 md:p-3 bg-[#0a101d] border border-slate-700/60 focus:border-blue-500 rounded-xl outline-none font-bold text-white text-xs transition-all shadow-inner focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Pulse (BPM)</label>
                                        <input
                                            type="number" value={heartRate} min="30" max="250" onChange={(e) => setHeartRate(e.target.value)} placeholder="e.g., 72"
                                            className="w-full p-2.5 md:p-3 bg-[#0a101d] border border-slate-700/60 focus:border-blue-500 rounded-xl outline-none font-bold text-white text-xs transition-all shadow-inner focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Blood Pressure</label>
                                        <input
                                            type="text" value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} placeholder="e.g., 120/80"
                                            className="w-full p-2.5 md:p-3 bg-[#0a101d] border border-slate-700/60 focus:border-blue-500 rounded-xl outline-none font-bold text-white text-xs transition-all shadow-inner focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] md:text-xs font-black uppercase tracking-wider text-slate-300 ml-1">
                                    Official Diagnostic Findings & Prescription
                                </label>
                                <textarea
                                    placeholder="Type clinical diagnosis descriptions, pharmaceutical guidelines, dosage schedules, or specific care instructions here..."
                                    value={doctorNotes}
                                    onChange={(e) => setDoctorNotes(e.target.value)}
                                    required
                                    className="w-full p-4 bg-[#0a101d] border border-slate-700/60 focus:border-blue-500 rounded-2xl outline-none font-bold text-slate-200 text-xs md:text-sm transition-all placeholder:text-slate-600 min-h-[120px] md:min-h-[140px] resize-none leading-relaxed focus:ring-2 focus:ring-blue-500/20 shadow-inner"
                                />
                            </div>

                            {/* Form Options Layer (Stack on very small screens) */}
                            <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowTreatModal(false);
                                        setSelectedAppointmentId(null);
                                    }}
                                    className="w-full sm:w-1/2 py-3.5 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-bold text-[10px] md:text-xs rounded-xl border border-slate-700/60 uppercase tracking-wider transition-all"
                                >
                                    Hold Case File
                                </button>
                                <button
                                    type="submit"
                                    className="w-full sm:w-1/2 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-[10px] md:text-xs rounded-xl uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
                                >
                                    Complete Treatment <CheckSquare size={14} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MANAGEMENT NAVBAR BAR LAYER */}
            <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 md:p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/20 shrink-0">
                        <Stethoscope size={20} className="md:w-6 md:h-6" />
                    </div>
                    <h1 className="text-sm md:text-lg font-black tracking-tight shrink-0">SmartCare <span className="text-blue-500 hidden sm:inline">Command</span></h1>
                </div>

                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    <button
                        onClick={handleToggleBreak}
                        className={`flex items-center justify-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl font-bold text-[10px] md:text-xs transition-all shadow-md uppercase tracking-wider ${onBreak
                            ? 'bg-amber-500 text-slate-950 shadow-amber-500/20 animate-pulse'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                            }`}
                    >
                        <Coffee size={14} className="md:w-4 md:h-4" />
                        <span className="hidden sm:inline">{onBreak ? "Status: On Break" : "Go on Break"}</span>
                        <span className="sm:hidden">{onBreak ? "Paused" : "Break"}</span>
                    </button>
                    <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="p-2 md:px-4 md:py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg md:rounded-xl font-bold text-[10px] md:text-xs transition-colors flex items-center gap-2 uppercase tracking-wider">
                        <LogOut size={14} className="md:w-4 md:h-4" />
                        <span className="hidden md:inline">Sign Out</span>
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 md:py-10 px-4 md:px-8 space-y-8 md:space-y-10">
                
                {/* LIVE HOSPITAL MANAGEMENT ANALYTICS COUNTERS (Mobile responsive grid) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <div className="bg-[#0e1726] border border-slate-800/80 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between shadow-xl gap-3">
                        <div className="order-last md:order-first">
                            <p className="text-[9px] md:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Intake</p>
                            <p className="text-2xl md:text-3xl font-black text-white">{analytics.total}</p>
                        </div>
                        <div className="p-2.5 md:p-4 bg-blue-500/10 text-blue-400 rounded-lg md:rounded-xl w-fit"><Users size={20} className="md:w-6 md:h-6" /></div>
                    </div>

                    <div className="bg-[#0e1726] border border-slate-800/80 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between shadow-xl gap-3">
                        <div className="order-last md:order-first">
                            <p className="text-[9px] md:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Treated</p>
                            <p className="text-2xl md:text-3xl font-black text-emerald-400">{analytics.treated}</p>
                        </div>
                        <div className="p-2.5 md:p-4 bg-emerald-500/10 text-emerald-400 rounded-lg md:rounded-xl w-fit"><CheckCircle size={20} className="md:w-6 md:h-6" /></div>
                    </div>

                    <div className="bg-[#0e1726] border border-slate-800/80 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between shadow-xl gap-3">
                        <div className="order-last md:order-first">
                            <p className="text-[9px] md:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Waiting</p>
                            <p className="text-2xl md:text-3xl font-black text-amber-400">{analytics.waiting}</p>
                        </div>
                        <div className="p-2.5 md:p-4 bg-amber-500/10 text-amber-400 rounded-lg md:rounded-xl w-fit"><Clock size={20} className="md:w-6 md:h-6" /></div>
                    </div>

                    <div className="bg-[#0e1726] border border-slate-800/80 rounded-2xl p-4 md:p-6 flex flex-col justify-center shadow-xl col-span-2 lg:col-span-1">
                        <button onClick={downloadMedicalReport} className="w-full bg-slate-800/50 hover:bg-slate-700 text-slate-200 font-bold py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 transition-all text-[10px] md:text-xs uppercase tracking-wider border border-slate-700/60 active:scale-95">
                            <FileText size={16} /> Export Logs
                        </button>
                    </div>
                </div>

                {/* BREAK INDICATOR NOTICE ALERT BANNER PANEL */}
                {onBreak && (
                    <div className="bg-gradient-to-r from-amber-950/40 to-slate-900/40 border border-amber-500/30 rounded-2xl md:rounded-3xl p-4 md:p-6 text-amber-400 text-xs md:text-sm font-semibold flex items-start md:items-center gap-3 md:gap-4 animate-pulse shadow-lg shadow-amber-500/5">
                        <Coffee size={20} className="shrink-0 mt-0.5 md:mt-0" />
                        <span className="leading-relaxed">System Operations Paused: New patient registrations are currently queue-locked until the active break session transitions offline.</span>
                    </div>
                )}

                {/* DYNAMIC QUEUE GRID BLOCK */}
                <div className="space-y-4 md:space-y-6">
                    <h3 className="text-lg md:text-xl font-extrabold tracking-tight flex items-center gap-2 text-slate-100">
                        <Activity size={20} className="text-blue-500" /> Sorted Treatment Queue Sequence
                    </h3>

                    {queue.length === 0 ? (
                        <div className="bg-[#0e1726] border border-slate-800/80 rounded-3xl p-10 md:p-16 text-center text-slate-500 font-bold text-sm shadow-inner">
                            No patients are currently registered in the emergency waiting area.
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                            {queue.map((patient, index) => {
                                const currentId = patient.id || patient.appointmentId || patient.appointment?.id;

                                return (
                                    <div key={currentId || index} className={`bg-[#0e1726] border rounded-2xl md:rounded-3xl p-5 md:p-6 flex flex-col justify-between shadow-xl transition-all relative overflow-hidden group ${index === 0 ? 'border-red-500/50 bg-gradient-to-br from-red-950/30 to-[#0e1726] shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-slate-800/80 hover:border-slate-700'}`}>
                                        
                                        {/* CLEAN FIXED HEADER GRID */}
                                        <div className="flex flex-col gap-3 mb-5">
                                            <div className="flex justify-between items-center w-full">
                                                <span className="font-mono text-[10px] md:text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                                                    SEQ: #{index + 1}
                                                </span>
                                                <span className={`font-mono text-[10px] md:text-[11px] font-black px-2.5 py-1 rounded-md shadow-sm ${index === 0 ? "text-red-100 bg-red-500/20 border border-red-500/30" : "text-slate-300 bg-slate-800/80 border border-slate-700/50"}`}>
                                                    ACUITY: {patient.priorityScore}
                                                </span>
                                            </div>

                                            {index === 0 && (
                                                <div className="w-fit bg-red-500 text-white font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded shadow-md animate-pulse">
                                                    Highest Acuity Priority
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4 flex-grow mb-6">
                                            <div>
                                                <h4 className="text-base md:text-lg font-black text-white leading-tight">{patient.patientName}</h4>
                                                <p className="text-[10px] md:text-xs text-slate-500 truncate font-mono mt-1 pr-2">{patient.patientEmail}</p>
                                            </div>
                                            
                                            <div className="bg-slate-950/80 rounded-xl p-3 md:p-4 border border-slate-800/60 text-[11px] md:text-xs font-bold text-slate-300 flex items-start gap-3 shadow-inner">
                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${index === 0 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-blue-500'}`}></div>
                                                <span className="leading-relaxed line-clamp-3">Complaint: {patient.disease}</span>
                                            </div>
                                        </div>

                                        {/* ACTION BUTTON */}
                                        <button
                                            disabled={onBreak}
                                            onClick={() => handleOpenTreatmentConsole(patient)}
                                            className={`w-full font-black py-3.5 rounded-xl text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
                                                onBreak 
                                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-40' 
                                                : index === 0 
                                                    ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/20 border border-red-500/50' 
                                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60'
                                            }`}
                                        >
                                            <CheckSquare size={14} className="md:w-4 md:h-4" />
                                            <span>{onBreak ? "System Paused" : "Examine Patient"}</span>
                                        </button>
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

export default DoctorDashboard;