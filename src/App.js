import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientSessions from './pages/patient/PatientSessions';
import PatientSessionDetail from './pages/patient/PatientSessionDetail';

// Therapist Pages
import TherapistDashboard from './pages/therapist/TherapistDashboard';
import TherapistSessionManage from './pages/therapist/TherapistSessionManage';

import AudioPlayer from './components/AudioPlayer';

function App() {
  return (
    <Router>
      <div className="App">
        <AudioPlayer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient Routes */}
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/sessions" element={<PatientSessions />} />
          <Route path="/patient/sessions/:id" element={<PatientSessionDetail />} />

          {/* Therapist Routes */}
          <Route path="/therapist/dashboard" element={<TherapistDashboard />} />
          <Route path="/therapist/sessions/manage" element={<TherapistSessionManage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
