import React, { useState } from 'react';
import '../../styles/AdminDashboard.css';
import logo from '../../assets/clinic-logo.png';
import bgImage from '../../assets/Home.png';
//import { FaSignOutAlt } from 'react-icons/faSignOutAlt';
// import CreateEmployeeForm from './CreateEmployeeForm';
import DoctorProfile from './DoctorProfile';
// import EmployeeTable from './EmployeeTable';
import ManageDocSchedules from './ManageDocSchedules';
import DoctorPatients from './DoctorPatients';
import DoctorReferralForm from './DoctorReferrals';
import MedicalRecords from './DoctorMedicalRecords';
import DoctorAppointments from './DoctorAppointments';
import '../../styles/DoctorAppointments.css';

const DoctorDashboard = () => {
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
          <button onClick={() => setActiveTab('patients')} className={activeTab === 'patients' ? 'active' : ''}>View Patients</button>
          <button onClick={() => setActiveTab('referral')} className={activeTab === 'referral' ? 'active' : ''}>Referrals</button>
          <button onClick={() => setActiveTab('medical_records')} className={activeTab === 'medical_records' ? 'active' : ''}>Medical Records</button>
          <button onClick={() => setActiveTab('')} className={activeTab === '' ? 'active' : ''}>Prescriptions</button>
          {/* <button onClick={() => setActiveTab('view')} className={activeTab === 'view' ? 'active' : ''}>View Employees</button> */}
          <button onClick={() => setActiveTab('schedules')} className={activeTab === 'schedules' ? 'active' : ''}>View Schedules</button>
          <button onClick={() => setActiveTab('appointments')} className={activeTab === 'appointments' ? 'active' : ''}>View Appointments</button>

        </div>

        <div className="admin-tab-content">
          {activeTab === 'patients' && <DoctorPatients />}
          {activeTab === 'profile' && <DoctorProfile />}
          {activeTab === 'referral' && <DoctorReferralForm />}
          {activeTab === 'medical_records' && <MedicalRecords />}
          {activeTab === 'appointments' && <DoctorAppointments />}


        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;