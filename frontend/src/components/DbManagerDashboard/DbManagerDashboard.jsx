import React, { useState } from 'react';
import '../../styles/DBDash.css';
import logo from '../../assets/clinic-logo.png';
import DbManagerProfile from './DbManagerProfile';
import Reports from './Reports';

const DbManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('reports');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="clinic-header">
          <img src={logo} alt="Clinic Logo" className="clinic-logo" />
          <h2 className="clinic-name">Care Connect<br />Clinic</h2>
        </div>

        <div className="sidebar-menu">
          <button
            className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg className="menu-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>My Profile</span>
          </button>

          <button
            className={`menu-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <svg className="menu-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <span>Reports</span>
          </button>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="dashboard-header">
          <h1>{activeTab === 'profile' ? 'My Profile' : 'Reports'}</h1>
          <div className="user-profile">
            <div className="avatar">DB</div>
            <div className="user-info">
              <p className="user-name">Database Manager</p>
             
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {activeTab === 'profile' && <DbManagerProfile />}
          {activeTab === 'reports' && <Reports />}
        </div>
      </div>
    </div>
  );
};

export default DbManagerDashboard;
