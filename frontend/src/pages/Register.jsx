import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HeartPulse, User, Mail, Lock, Activity, AlertCircle } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient' // Default role
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ==========================================
  // DEPLOYMENT UPDATE: Dynamic API URL Routing
  // ==========================================
  const API_URL = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Connects to your backend registration route via dynamic URL
      await axios.post(`${API_URL}/api/auth/register`, formData);
      // Automatically redirect to login page after successful registration
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 font-sans antialiased">

      {/* Floating Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main Glassmorphism Card */}
      <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 flex flex-col items-center">

        {/* Glowing Icon */}
        <div className="bg-emerald-500 p-3.5 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-6">
          <HeartPulse size={32} className="text-white" />
        </div>

        {/* PERFECTLY CENTERED HEADERS FOR MOBILE */}
        <div className="text-center w-full mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Create Account</h1>
          <p className="text-blue-200/70 font-medium text-sm sm:text-base mt-2">Join the SmartCare Network</p>
        </div>

        {/* Error Message Display */}
        {error && (
          <div className="w-full bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl flex items-center gap-2 mb-6 text-xs sm:text-sm font-medium animate-in fade-in">
            <AlertCircle size={16} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="w-full space-y-4">

          {/* Full Name Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
              <User size={18} />
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Full Name"
              className="w-full bg-slate-950/50 border border-slate-700/50 focus:border-blue-500 rounded-xl py-3.5 pl-12 pr-4 text-white text-sm font-medium outline-none transition-all placeholder:text-slate-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Email Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
              <Mail size={18} />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Email Address"
              className="w-full bg-slate-950/50 border border-slate-700/50 focus:border-blue-500 rounded-xl py-3.5 pl-12 pr-4 text-white text-sm font-medium outline-none transition-all placeholder:text-slate-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
              <Lock size={18} />
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Password"
              minLength="6"
              className="w-full bg-slate-950/50 border border-slate-700/50 focus:border-blue-500 rounded-xl py-3.5 pl-12 pr-4 text-white text-sm font-medium outline-none transition-all placeholder:text-slate-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Role Selector (Patient / Doctor) */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
              <Activity size={18} />
            </div>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-slate-950/50 border border-slate-700/50 focus:border-blue-500 rounded-xl py-3.5 pl-12 pr-4 text-white text-sm font-medium outline-none transition-all appearance-none cursor-pointer focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="patient" className="text-slate-900">I am a Patient</option>
              <option value="doctor" className="text-slate-900">I am a Doctor</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 text-white font-black py-4 rounded-xl mt-4 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-[0.98] flex justify-center items-center gap-2 tracking-wide"
          >
            {loading ? "Creating Account..." : "Register Now"}
          </button>
        </form>

        {/* FIXED REDIRECTION LINK */}
        <p className="mt-8 text-sm text-slate-400 font-medium">
          Already have an account?{' '}
          {/* React Router Link ensures smooth navigation without page reload */}
          <Link to="/login" className="text-emerald-400 font-bold hover:text-emerald-300 hover:underline transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;