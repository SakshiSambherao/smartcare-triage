import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';

import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Facing Portal (Landing Page Hub) */}
        <Route path="/" element={<LandingPage />} />

        {/* Authentication Gateways */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Role-Based Execution Workspaces */}
        <Route path="/dashboard" element={<PatientDashboard />} />        <Route path="/doctor" element={<DoctorDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;