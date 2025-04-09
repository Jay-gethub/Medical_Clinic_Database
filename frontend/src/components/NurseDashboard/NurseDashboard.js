//NurseDashboard.js
import React, { useState } from 'react';
import '../../styles/NurseDashboard.css';
import logo from '../../assets/clinic-logo.png';
import bgImage from '../../assets/Home.png';
import NurseProfile from './NurseProfile';
import DiagnosticView from './DiagnosticView';
import ReferralView from './ReferralView';
import ImmunizationView from './ImmunizationView';
import AppointmentView from './AppointmentView';
import MedicalRecordsView from './MedicalRecordsView';


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
        <button onClick={() => setActiveTab('diagnostics')} className={activeTab === 'diagnostics' ? 'active' : ''}>Diagnostics</button>
        <button onClick={() => setActiveTab('referrals')} className={activeTab === 'referrals' ? 'active' : ''}>Referrals</button>
        <button onClick={() => setActiveTab('immunizations')}className={activeTab === 'immunizations' ? 'active' : ''}>Immunizations</button>
        <button onClick={() => setActiveTab('appointments')}className={activeTab === 'appointments' ? 'active' : ''}>Appointments</button>
        <button onClick={() => setActiveTab('records')}className={activeTab === 'records' ? 'active' : ''}>Medical Records</button>
  
  Manage Schedules

        </div>

        <div className="nurse-tab-content">
    {activeTab === 'profile' && <NurseProfile />}
    {activeTab === 'diagnostics' && <DiagnosticView />}
    {activeTab === 'referrals' && <ReferralView />}
    {activeTab === 'immunizations' && <ImmunizationView />}
    {activeTab === 'appointments' && <AppointmentView />}
    {activeTab === 'records' && <MedicalRecordsView />}


        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;