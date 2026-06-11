import { useState } from 'react';
import { Mail, Lock, HeartPulse } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // ==========================================
            // DEPLOYMENT UPDATE: Dynamic API URL Routing
            // ==========================================
            // This pulls 'http://localhost:5000' from your local .env file during testing,
            // and pulls your live Render URL from Vercel's dashboard during production.
            const API_URL = import.meta.env.VITE_API_URL;

            // Dispatch login requests to backend service via dynamic URL
            const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });

            if (res.data && res.data.token) {
                // Wipe existing stale sessions instantly before writing new items
                localStorage.clear();

                // Lock in secure authentication data strings
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));

                alert("Portal Access Granted. Loading Profile Matrix...");

                // Execute institutional destination parsing configurations
                if (res.data.user.role === 'doctor') {
                    navigate('/doctor');
                } else {
                    navigate('/dashboard');
                }
            } else {
                alert("Server structural configuration error: Empty dataset returned.");
            }
        } catch (err) {
            console.error("Login Module Failure Window:", err);
            alert("Authentication Terminated: " + (err.response?.data?.msg || "Institutional Network Line Fault. Check Server Status."));
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl">

                <div className="flex flex-col items-center mb-8">
                    <div className="bg-blue-600 p-3 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">
                        <HeartPulse className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-white text-center tracking-tight">SmartCare Login</h2>
                    <p className="text-slate-400 text-sm mt-2 text-center font-medium">
                        Secure Electronic Medical Records Portal Access
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="relative">
                        <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                        <input
                            type="email"
                            placeholder="Registered Email Address"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium transition-all"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                        <input
                            type="password"
                            placeholder="Password Credentials"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-medium transition-all"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-blue-900/40 active:scale-[0.99]"
                    >
                        Authenticate Account Session
                    </button>
                </form>

                <p className="text-center text-slate-400 mt-6 text-sm font-medium">
                    New clinical care applicant? <Link to="/register" className="text-blue-400 hover:underline font-bold">Register New File</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;