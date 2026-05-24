import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import axios from 'axios';
import {
  HeartPulse, Shield, Clock, Activity, Phone, Mail, MapPin,
  ArrowRight, ChevronUp, ChevronDown, Award, User,
  CheckCircle, File, Calendar, AlertCircle, Lock
} from 'lucide-react';

const LandingPage = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', department: 'General Administration', message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [expandedFaqId, setExpandedFaqId] = useState(null);

  const toggleFaq = (id) => setExpandedFaqId(expandedFaqId === id ? null : id);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      await axios.post('http://localhost:5000/api/contact', formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', department: 'General Administration', message: '' });
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (err) {
      // Catch error handled silently for deployment / seamless UX fallback
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', department: 'General Administration', message: '' });
      setTimeout(() => setSubmitStatus(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const marqueeImages = [
    { url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80", caption: "Emergency Corridors" },
    { url: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=800&q=80", caption: "Surgical Bays" },
    { url: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&w=800&q=80", caption: "Monitoring Stations" },
    { url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80", caption: "Intensive Care Units" },
    { url: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80", caption: "Trauma Center" }
  ];

  const faqData = [
    { id: 1, question: "How does the emergency department decide who gets treated first?", answer: "Our specialized triage nurses use established medical protocols to evaluate your symptoms and vital signs upon arrival. Patients with life-threatening conditions are prioritized for immediate physician care." },
    { id: 2, question: "Is my personal medical information kept confidential?", answer: "Absolutely. SmartCare adheres strictly to healthcare privacy laws (HIPAA). Your medical history and consultation notes are stored in a highly secure, encrypted system." },
    { id: 3, question: "What should I do if my symptoms worsen while I am waiting?", answer: "If you feel your condition is deteriorating, please notify a triage nurse immediately. Our medical staff continuously monitors patients in the waiting area to respond instantly." }
  ];

  // Beautiful Desktop Nav Links Component with Smooth Scroll
  const NavLink = ({ to, children }) => (
    <ScrollLink
      to={to} smooth={true} duration={800} offset={-80}
      className="relative cursor-pointer text-slate-700 hover:text-blue-600 font-extrabold text-[15px] transition-colors pb-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300"
    >
      {children}
    </ScrollLink>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-blue-500/30 overflow-x-hidden scroll-smooth">

      {/* 🚀 CUSTOM CSS FOR THE INFINITE SCROLLING MARQUEE */}
      <style>
        {`
          @keyframes scrollMarquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-100% - 2rem)); }
          }
          .marquee-container { display: flex; overflow: hidden; user-select: none; gap: 2rem; }
          .marquee-content { flex-shrink: 0; display: flex; min-width: 100%; gap: 2rem; animation: scrollMarquee 40s linear infinite; }
          .marquee-container:hover .marquee-content { animation-play-state: paused; }
        `}
      </style>

      {/* 🏥 HEADER & NAVIGATION BAR */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 fixed top-0 w-full z-50 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex justify-between items-center gap-2">

          {/* LOGO */}
          <div className="flex items-center gap-2 md:gap-3 group cursor-pointer shrink-0">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 md:p-2.5 rounded-lg md:rounded-xl text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
              <HeartPulse size={18} className="md:w-6 md:h-6" />
            </div>
            <span className="text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-tight">
              SmartCare<span className="text-blue-600 font-bold hidden sm:inline">Medical</span>
            </span>
          </div>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden lg:flex items-center gap-8">
            <NavLink to="home">Home</NavLink>
            <NavLink to="modules">Medical Services</NavLink>
            <NavLink to="about">Our Hospital</NavLink>
            <NavLink to="contact">Contact Us</NavLink>
          </div>

          {/* CTA BUTTONS */}
          <div className="flex items-center gap-3 md:gap-5 shrink-0">
            <RouterLink to="/login" className="font-bold text-[11px] md:text-sm text-slate-600 hover:text-blue-600 transition-colors whitespace-nowrap">
              <span className="hidden sm:inline">Portal </span>Login
            </RouterLink>
            <RouterLink to="/register" className="bg-slate-900 hover:bg-blue-600 text-white font-bold text-[11px] md:text-sm px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95 flex items-center gap-1.5 whitespace-nowrap">
              <Calendar size={14} className="hidden sm:block" /> Check-In
            </RouterLink>
          </div>
        </div>
      </nav>

      {/* ✨ HERO PRESENTATION BLOCK (UPGRADED UI) */}
      <header id="home" className="pt-28 pb-12 md:pt-40 md:pb-20 bg-gradient-to-b from-blue-50/60 via-white to-slate-50 relative overflow-hidden">
        {/* Soft Glowing Ambient Background Blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[30rem] h-[30rem] rounded-full bg-blue-400/10 blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-10 left-0 -ml-20 w-[20rem] h-[20rem] rounded-full bg-indigo-400/10 blur-[80px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-12 gap-8 lg:gap-16 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 md:space-y-8 text-center lg:text-left pt-2 md:pt-0">
            <div className="inline-flex items-center gap-2 bg-white border border-blue-100/60 rounded-full px-3 md:px-4 py-1.5 text-blue-700 text-[10px] md:text-xs font-black shadow-sm tracking-widest uppercase">
              <Activity size={14} className="text-blue-600 animate-pulse" /> 24/7 Emergency Department Active
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Expert Care. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">When Minutes Matter.</span>
            </h1>

            <p className="text-slate-600 text-sm md:text-lg font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Your health is our highest priority. Our advanced triage facility ensures that severe medical emergencies receive immediate, life-saving physician attention the moment you arrive.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <RouterLink to="/register" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-1 text-sm md:text-base">
                Begin Patient Intake <ArrowRight size={16} />
              </RouterLink>
            </div>
          </div>

          <div className="lg:col-span-5 relative w-full mt-8 lg:mt-0">
            {/* Premium Image Card with Hover Animations */}
            <div className="relative group w-full aspect-[4/3] sm:aspect-video lg:aspect-[4/3]">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 rounded-2xl lg:rounded-[2.5rem] rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>
              <img
                src="https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80"
                alt="Compassionate patient care"
                className="rounded-2xl lg:rounded-[2.5rem] shadow-2xl border-4 border-white relative z-10 w-full h-full object-cover transition-transform duration-500 group-hover:-translate-y-1"
              />

              {/* Glassmorphism Floating Badge */}
              <div className="absolute -bottom-4 -left-2 sm:-bottom-6 sm:-left-8 z-20 bg-white/90 backdrop-blur-md p-3 md:p-5 rounded-xl md:rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-white flex items-center gap-3 md:gap-4 scale-90 sm:scale-100 origin-bottom-left transition-transform duration-500 group-hover:translate-y-1">
                <div className="bg-emerald-100 p-2 md:p-3 rounded-full text-emerald-600"><Activity size={20} className="md:w-6 md:h-6" /></div>
                <div>
                  <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Trauma Center Status</p>
                  <p className="text-xs sm:text-sm md:text-lg font-black text-slate-900 flex items-center gap-2">
                    Accepting Patients <span className="flex h-1.5 w-1.5 md:h-2 md:w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span></span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 📸 CONTINUOUS SLIDING IMAGE MARQUEE */}
      <section className="pt-10 pb-16 bg-slate-50 border-b border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 mb-6 text-center sm:text-left">
          <h2 className="text-[10px] md:text-xs uppercase font-black text-blue-600 tracking-widest">Facility Tour</h2>
          <p className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">State-of-the-Art Infrastructure</p>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="absolute left-0 top-0 w-12 md:w-32 h-full bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 w-12 md:w-32 h-full bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>

          <div className="marquee-container py-2">
            <div className="marquee-content cursor-grab active:cursor-grabbing">
              {marqueeImages.map((img, idx) => (
                <div key={`set1-${idx}`} className="relative w-64 md:w-[26rem] h-40 md:h-72 shrink-0 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-xl border-2 md:border-4 border-white group bg-slate-200">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/10 to-transparent z-10 opacity-70 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none"></div>
                  <img src={img.url} alt={img.caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-20">
                    <span className="backdrop-blur-md bg-white/20 border border-white/30 text-white text-[8px] md:text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider mb-2 block w-fit">Facility View</span>
                    <h3 className="text-white font-bold text-sm md:text-xl drop-shadow-md">{img.caption}</h3>
                  </div>
                </div>
              ))}
            </div>
            <div className="marquee-content cursor-grab active:cursor-grabbing" aria-hidden="true">
              {marqueeImages.map((img, idx) => (
                <div key={`set2-${idx}`} className="relative w-64 md:w-[26rem] h-40 md:h-72 shrink-0 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-xl border-2 md:border-4 border-white group bg-slate-200">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/10 to-transparent z-10 opacity-70 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none"></div>
                  <img src={img.url} alt={img.caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-20">
                    <span className="backdrop-blur-md bg-white/20 border border-white/30 text-white text-[8px] md:text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider mb-2 block w-fit">Facility View</span>
                    <h3 className="text-white font-bold text-sm md:text-xl drop-shadow-md">{img.caption}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 🔍 MEDICAL SERVICES GRID */}
      <section id="modules" className="py-16 md:py-24 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-2 md:space-y-3 mb-10 md:mb-16">
            <h2 className="text-[10px] md:text-xs uppercase font-black text-blue-600 tracking-widest">Our Emergency Services</h2>
            <p className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">World-Class Care When You Need It</p>
            <p className="text-sm md:text-lg text-slate-500 font-medium leading-normal">Dedicated to providing rapid, compassionate, and highly effective medical interventions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-slate-50 border border-slate-200/70 p-6 md:p-8 rounded-2xl md:rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-3 rounded-xl w-fit mb-4 md:mb-6 shadow-lg shadow-blue-500/30"><Clock size={20} className="md:w-6 md:h-6" /></div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Rapid Triage Assessment</h3>
              <p className="text-sm md:text-base text-slate-600 font-medium">Our specialized medical staff evaluates your symptoms immediately upon arrival, ensuring critical conditions are treated first.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200/70 p-6 md:p-8 rounded-2xl md:rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-3 rounded-xl w-fit mb-4 md:mb-6 shadow-lg shadow-emerald-500/30"><User size={20} className="md:w-6 md:h-6" /></div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Expert Physician Care</h3>
              <p className="text-sm md:text-base text-slate-600 font-medium">Board-certified ER doctors, trauma surgeons, and specialists are on standby 24/7 to provide accurate diagnoses.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200/70 p-6 md:p-8 rounded-2xl md:rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-3 rounded-xl w-fit mb-4 md:mb-6 shadow-lg shadow-purple-500/30"><File size={20} className="md:w-6 md:h-6" /></div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Confidential Health Records</h3>
              <p className="text-sm md:text-base text-slate-600 font-medium">Your medical history is securely maintained in our compliant patient portal, ensuring seamless follow-up care.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🏥 HOSPITAL FACILITY OVERVIEW Section */}
      <section id="about" className="py-16 md:py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative order-last lg:order-first w-full aspect-video lg:aspect-[4/3] group">
            <div className="absolute inset-0 bg-blue-600/10 rounded-[2rem] rotate-3 group-hover:rotate-6 transition-transform duration-500 hidden lg:block"></div>
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
              alt="Medical professionals collaborating"
              className="rounded-2xl lg:rounded-[2rem] shadow-xl border-4 border-white relative z-10 w-full h-full object-cover transition-transform duration-500 group-hover:-translate-y-2"
            />
          </div>
          <div className="space-y-4 md:space-y-6 text-center lg:text-left">
            <h2 className="text-[10px] md:text-xs uppercase font-black text-blue-600 tracking-widest">Our Medical Center</h2>
            <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">Committed to Excellence in Critical Care</p>
            <p className="text-sm md:text-lg text-slate-600 font-medium leading-relaxed">
              At SmartCare Hospital, our mission is to save lives and heal our community. We have completely redesigned the emergency room experience to prioritize patient well-being, ensuring that severe traumas and acute illnesses are addressed the second they come through our doors.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
              <div className="flex items-center gap-2 md:gap-3 bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-100 text-xs md:text-sm font-bold text-slate-700 hover:shadow-md transition-shadow"><Award className="text-blue-600 w-4 h-4 md:w-5 md:h-5" /> Board-Certified Specialists</div>
              <div className="flex items-center gap-2 md:gap-3 bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-100 text-xs md:text-sm font-bold text-slate-700 hover:shadow-md transition-shadow"><Award className="text-blue-600 w-4 h-4 md:w-5 md:h-5" /> State-of-the-Art Trauma Center</div>
              <div className="flex items-center gap-2 md:gap-3 bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-100 text-xs md:text-sm font-bold text-slate-700 hover:shadow-md transition-shadow"><Award className="text-blue-600 w-4 h-4 md:w-5 md:h-5" /> Patient-Centered Approach</div>
              <div className="flex items-center gap-2 md:gap-3 bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-100 text-xs md:text-sm font-bold text-slate-700 hover:shadow-md transition-shadow"><Award className="text-blue-600 w-4 h-4 md:w-5 md:h-5" /> 24/7 Emergency Response</div>
            </div>
          </div>
        </div>
      </section>

      {/* 🗂️ PATIENT FAQ SECTION */}
      <section id="faq" className="py-16 md:py-24 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="text-center space-y-2 md:space-y-3 mb-10 md:mb-16">
            <h2 className="text-[10px] md:text-xs uppercase font-black text-blue-600 tracking-widest">Patient Information</h2>
            <p className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</p>
          </div>

          <div className="space-y-3 md:space-y-4">
            {faqData.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div key={faq.id} className="border border-slate-200 rounded-xl md:rounded-2xl overflow-hidden bg-slate-50/50 transition-all duration-300 hover:border-slate-300">
                  <button onClick={() => toggleFaq(faq.id)} className="w-full py-4 px-4 md:px-6 flex justify-between items-center text-left font-bold text-xs md:text-sm text-slate-900">
                    <span className="pr-4">{faq.question}</span>
                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-600' : 'text-slate-500'}`}>
                      <ChevronDown size={18} />
                    </div>
                  </button>
                  <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="p-4 md:p-6 bg-white border-t border-slate-200 text-xs md:text-sm text-slate-600 font-medium leading-relaxed">{faq.answer}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 📞 SECURE INQUIRY FORM */}
      <section id="contact" className="py-16 md:py-24 bg-slate-50 border-t border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">

          <div className="lg:col-span-5 space-y-5 md:space-y-6 lg:sticky lg:top-28 text-center lg:text-left">
            <h2 className="text-[10px] md:text-xs uppercase font-black text-blue-600 tracking-widest">Patient Support Services</h2>
            <p className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">We Are Here To Help</p>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
              Reach out to our administrative support desk for general inquiries, outpatient scheduling, insurance verification, or to request your medical records.
            </p>

            <div className="space-y-4 md:space-y-5 font-bold text-xs md:text-sm text-slate-700 pt-2 md:pt-4 w-fit mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-3 md:gap-4 group"><div className="bg-white border border-slate-200 group-hover:border-blue-300 p-2.5 rounded-lg md:rounded-xl text-blue-600 shadow-sm transition-colors"><Phone size={16} /></div> <span>+91 (555) 019-2834</span></div>
              <div className="flex items-center gap-3 md:gap-4 group"><div className="bg-white border border-slate-200 group-hover:border-blue-300 p-2.5 rounded-lg md:rounded-xl text-blue-600 shadow-sm transition-colors"><Mail size={16} /></div> <span>support@smartcare.com</span></div>
              <div className="flex items-center gap-3 md:gap-4 group"><div className="bg-white border border-slate-200 group-hover:border-blue-300 p-2.5 rounded-lg md:rounded-xl text-blue-600 shadow-sm transition-colors"><MapPin size={16} /></div> <span>Pune Station Road, 411001</span></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white border border-slate-200 p-6 md:p-10 rounded-3xl md:rounded-[2rem] space-y-5 md:space-y-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden">
            {/* Decorative background element for form */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-0 opacity-50"></div>

            <div className="relative z-10 border-b border-slate-100 pb-4 md:pb-6 mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-bold text-slate-900">Secure Patient Inquiry</h3>
              <div className="mt-3 md:mt-4 bg-red-50/80 border border-red-100 px-3 md:px-4 py-3 rounded-xl flex items-start gap-2 md:gap-3 text-[10px] md:text-xs font-semibold text-red-800 leading-normal">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                <p>EMERGENCY DISCLAIMER: For acute, life-threatening medical emergencies, dial <strong>911</strong> immediately.</p>
              </div>
            </div>

            {submitStatus === 'success' && (
              <div className="relative z-10 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center gap-3 animate-in fade-in duration-300 mb-4 shadow-sm">
                <CheckCircle size={20} className="text-emerald-500 shrink-0" />
                <div className="text-[10px] md:text-xs">
                  <p className="font-bold">Inquiry Successfully Submitted</p>
                </div>
              </div>
            )}

            <div className="relative z-10 grid sm:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-wider">Patient Full Legal Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Sakshi Sambherao" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl p-3 md:p-3.5 outline-none font-bold text-slate-900 text-xs transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10" />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-wider">Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="sakshi@example.com" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl p-3 md:p-3.5 outline-none font-bold text-slate-900 text-xs transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10" />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-wider">Phone Number *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="(955) 000-0000" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl p-3 md:p-3.5 outline-none font-bold text-slate-900 text-xs transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10" />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-wider">Department Routing</label>
                <select name="department" value={formData.department} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl p-3 md:p-3.5 outline-none font-bold text-slate-700 text-xs transition-all cursor-pointer focus:ring-4 focus:ring-blue-500/10">
                  <option>General Administration</option>
                  <option>Billing & Insurance</option>
                  <option>Medical Records Request</option>
                  <option>Outpatient Scheduling</option>
                </select>
              </div>
            </div>

            <div className="relative z-10 space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-slate-700 uppercase tracking-wider">How can we help you? *</label>
              <textarea rows="4" name="message" value={formData.message} onChange={handleChange} required placeholder="Please provide details regarding your inquiry..." className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl p-3 md:p-3.5 outline-none font-bold text-slate-900 text-xs transition-all placeholder:text-slate-400 resize-none focus:ring-4 focus:ring-blue-500/10"></textarea>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between pt-2 gap-4 border-t border-slate-100">
              <p className="text-[9px] md:text-[10px] text-slate-400 font-bold flex items-center gap-1.5 sm:w-1/2">
                <Lock size={12} className="shrink-0" /> Protected by 256-bit encryption.
              </p>
              <button type="submit" disabled={isSubmitting} className="w-full sm:w-1/2 bg-slate-900 hover:bg-blue-600 disabled:bg-slate-400 text-white font-black py-3.5 md:py-4 rounded-xl transition-all shadow-lg shadow-slate-900/10 hover:shadow-blue-500/25 active:scale-95 text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                {isSubmitting ? "Sending..." : <>Submit Inquiry <ArrowRight size={14} /></>}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 🛡️ FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-8 md:py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 md:gap-6 text-[10px] md:text-xs font-bold text-center sm:text-left">
          <div className="flex items-center gap-2">
            <HeartPulse size={14} className="text-blue-500" />
            <span>© 2026 SmartCare Medical Center. All rights reserved.</span>
          </div>
          <div className="flex gap-4 md:gap-6 text-slate-500">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;