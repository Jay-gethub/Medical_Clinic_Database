import React, { useState } from 'react';
import '../../styles/AdminDashboard.css';
import logo from '../../assets/clinic-logo.png';
import bgImage from '../../assets/Home.png';
import ReceptionistProfile from './ReceptionistProfile';
import ManageRecSchedules from './ManageRecSchedules';
import PatientTable from './PatientTable';

const ReceptionistDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div
      className="admin-dashboard-page"
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

      <div className="admin-dashboard-content">
        <div className="tab-buttons">
          <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}>My Profile</button>
          <button onClick={() => setActiveTab('patients')} className={activeTab === 'patients' ? 'active' : ''}>View Appointments</button>
          <button onClick={() => setActiveTab('view')} className={activeTab === 'view' ? 'active' : ''}>View Staff</button>
          <button onClick={() => setActiveTab('schedules')} className={activeTab === 'schedules' ? 'active' : ''}>View Schedules</button>

        </div>

        <div className="admin-tab-content">
          {activeTab === 'schedules' && <ManageRecSchedules />}
          {activeTab === 'profile' && <ReceptionistProfile />}
          {activeTab === 'patients' && <PatientTable />}

        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;