//NurseDashboard.js
import React, { useState } from 'react';
import '../../styles/NurseDashboard.css';
import logo from '../../assets/clinic-logo.png';
import bgImage from '../../assets/Home.png';
import NurseProfile from './NurseProfile';
import PatientCheckInList from './PatientCheckInList';
import RecordVitalsForm from './RecordVitalsForm';
import AppointmentsToday from './AppointmentsToday';

const NurseDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div
      className="nurse-dashboard-page"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh'
      }}
    >
      <nav className="navbar">
        <div className="logo">
          <img src={logo} alt="Clinic Logo" />
          <h1>Care Connect Clinic</h1>
        </div>
        <ul className="nav-links">
        
        <li>
  <button onClick={handleLogout} className="logout-btn">Logout</button> </li>
        </ul>
      </nav>

      <div className="nurse-dashboard-content">
        <div className="tab-buttons">
        <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}>My Profile</button>
        <button onClick={() => setActiveTab('checkins')} className={activeTab === 'checkins' ? 'active' : ''}>Patient Check-Ins</button>
        <button onClick={() => setActiveTab('vitals')} className={activeTab === 'vitals' ? 'active' : ''}>Record Vitals</button>
        <button onClick={() => setActiveTab('appointments')} className={activeTab === 'appointments' ? 'active' : ''}>Appointments</button>
  
  Manage Schedules

        </div>

        <div className="admin-tab-content">
    {activeTab === 'profile' && <NurseProfile />}
    {activeTab === 'checkins' && <PatientCheckInList />}
    {activeTab === 'vitals' && <RecordVitalsForm />}
    {activeTab === 'appointments' && <AppointmentsToday />}


        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;
