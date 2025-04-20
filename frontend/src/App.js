import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Main/Home';
import Services from './components/Main/Services';
import About from './components/Main/About';
import PatientLogin from './components/Auth/PatientLogin';
import PatientRegister from './components/Auth/PatientRegister';
import EmployeeLogin from './components/Auth/EmployeeLogin';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import PatientPortalApp from './components/PatientDashboard/PatientPortalApp';
import DoctorDashboard from './components/DoctorDashboard/DoctorDashboard';
import NurseDashboard from './components/NurseDashboard/NurseDashboard';
import ReceptionistDashboard from './components/ReceptionistDashboard/ReceptionistDashboard';
import DbManagerDashboard from './components/DbManagerDashboard/DbManagerDashboard';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PatientLogin />} />
          <Route path="/register" element={<PatientRegister />} />
          <Route path="/login/employee" element={<EmployeeLogin />} />
          <Route path="/patient/dashboard" element={<PatientPortalApp />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/nurse/dashboard" element={<NurseDashboard />} />
          <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
          <Route path="/dbmanager/dashboard" element={<DbManagerDashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          {/* Add other routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

