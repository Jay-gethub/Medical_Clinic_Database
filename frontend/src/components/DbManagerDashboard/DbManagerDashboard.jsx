import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/DbManagerDashboard.css';
import logo from '../../assets/clinic-logo.png';
import bgImage from '../../assets/Home.png';
import DbManagerProfile from './DbManagerProfile';
import ReportsView from './ReportsView';

const DbManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div
      className="db-dashboard-page"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}
    >
      {/* NAVBAR */}
      <nav className="db-navbar">
        <div className="logo">
          <img src={logo} alt="Clinic Logo" style={{ height: '40px', marginRight: '10px' }} />
          <h2>Care Connect Clinic</h2>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>

      {/* WRAPPER */}
      <div className="db-dashboard-wrapper">
        {/* TABS */}
        <div className="tab-buttons">
          <button
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            My Profile
          </button>
          <button
            className={activeTab === 'reports' ? 'active' : ''}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
        </div>

        {/* CONTENT */}
        <div className="db-dashboard-content">
          <h3 className="section-title">Database Manager Profile</h3>
          <div className="db-info-box">
            {activeTab === 'profile' && <DbManagerProfile />}
            {activeTab === 'reports' && <ReportsView />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DbManagerDashboard;
