import React, { useState } from 'react';
import '../../styles/PatientPortal.css';
import logo from '../../assets/clinic-logo.png';
import PatientProfile from '../PatientDashboard/PatientProfile';
import ReferralPage from '../PatientDashboard/Referrals/ReferralPage';
import InsuranceDetails from '../PatientDashboard/InsuranceDetails';
import Appointments from '../PatientDashboard/Appointments';
import BillingPage from '../PatientDashboard/Billing/BillingPage';


import Immunizations from '../PatientDashboard/Immunizations';
import MedicalRecords from '../PatientDashboard/MedicalRecords';

const PatientPortalApp = () => {
  const [selectedTab, setSelectedTab] = useState('home');
  const patientId = localStorage.getItem('patientId');

  const renderContent = () => {
    switch (selectedTab) {
      case 'home':
        return <h2>Welcome to your Patient Portal</h2>;
      case 'profile':
        return <PatientProfile patientId={patientId} />;
      case 'immunizations':
        return <Immunizations patientId={patientId} />;
      case 'appointments':
        return <Appointments patientId={patientId} />;
      case 'referrals':
        return <ReferralPage patientId={patientId} />;
      case 'insurance':
        return <InsuranceDetails patientId={patientId} />;
      
     
      case 'medical-records':
        return <MedicalRecords patientId={patientId} />;
      default:
        return <h2>Welcome to your Patient Portal</h2>;
          case 'billing':
            return <BillingPage patientId={patientId} />;
          
    }
  };

  return (
    <div className="patient-portal">
      <aside className="sidebar">
        <div className="logo">
          <img src={logo} alt="Care Connect Clinic Logo" />
          <h1>Care Connect Clinic</h1>
        </div>
        <h3 className="sidebar-header">Patient Portal</h3>
        <ul className="nav-menu">
          <li className={selectedTab === 'home' ? 'active' : ''} onClick={() => setSelectedTab('home')}>
            Home
          </li>
          <li className={selectedTab === 'profile' ? 'active' : ''} onClick={() => setSelectedTab('profile')}>
            Profile
          </li>
          <li className={selectedTab === 'immunizations' ? 'active' : ''} onClick={() => setSelectedTab('immunizations')}>
            Immunizations
          </li>
          <li className={selectedTab === 'appointments' ? 'active' : ''} onClick={() => setSelectedTab('appointments')}>
            Appointments
          </li>
          <li className={selectedTab === 'referrals' ? 'active' : ''} onClick={() => setSelectedTab('referrals')}>
            Referrals
          </li>
          <li className={selectedTab === 'insurance' ? 'active' : ''} onClick={() => setSelectedTab('insurance')}>
            Insurance Details
          </li>
          <li className={selectedTab === 'billing' ? 'active' : ''} onClick={() => setSelectedTab('billing')}>
            Billing
          </li>
          <li className={selectedTab === 'medical-records' ? 'active' : ''} onClick={() => setSelectedTab('medical-records')}>
            Medical Records
          </li>
        </ul>
      </aside>

      <main className="dashboard-content">
      <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <span>You last logged in: 29/03/2025 19:07</span>
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <span style={{ fontWeight: 'bold', color: '#333', fontSize: '1.1rem' }}>Patient ID: {patientId}</span>
    <button
      className="logout-btn"
      onClick={() => {
        localStorage.clear();
        window.location.href = '/login';
      }}
    >
      Log Out
    </button>
  </div>
</div>
        <div className="content-area">{renderContent()}</div>
      </main>
    </div>
  );
};

export default PatientPortalApp;
