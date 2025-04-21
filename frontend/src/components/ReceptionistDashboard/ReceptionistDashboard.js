// import React, { useState } from 'react';
// import '../../styles/AdminDashboard.css';
// import logo from '../../assets/clinic-logo.png';
// import bgImage from '../../assets/Home.png';
// import ReceptionistProfile from './ReceptionistProfile';
// import ManageRecSchedules from './ManageRecSchedules';
// import AppointmentTable from './AppointmentTable';
// import PatientReferralViewer from './ReceptionistReferrals';

// const ReceptionistDashboard = () => {
//   const [activeTab, setActiveTab] = useState('profile');

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     window.location.href = '/';
//   };

//   return (
//     <div
//       className="admin-dashboard-page"
//       style={{
//         backgroundImage: `url(${bgImage})`,
//         backgroundSize: 'cover',
//         backgroundPosition: 'center',
//         minHeight: '100vh'
//       }}
//     >
//       <nav className="navbar">
//         <div className="logo">
//           <img src={logo} alt="Clinic Logo" />
//           <h1>Care Connect Clinic</h1>
//         </div>
//         <ul className="nav-links">
        
//         <li>
//   <button onClick={handleLogout} className="logout-btn">Logout</button> </li>
//         </ul>
//       </nav>

//       <div className="admin-dashboard-content">
//         <div className="tab-buttons">
//           <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}>My Profile</button>
//           <button onClick={() => setActiveTab('patients')} className={activeTab === 'patients' ? 'active' : ''}>View Appointments</button>
//           <button onClick={() => setActiveTab('view')} className={activeTab === 'view' ? 'active' : ''}>View Staff</button>
//           <button onClick={() => setActiveTab('referrals')} className={activeTab === 'referrals' ? 'active' : ''}>View Referrals</button>
//           <button onClick={() => setActiveTab('schedules')} className={activeTab === 'schedules' ? 'active' : ''}>View Schedules</button>

//         </div>

//         <div className="admin-tab-content">
//           {activeTab === 'schedules' && <ManageRecSchedules />}
//           {activeTab === 'profile' && <ReceptionistProfile />}
//           {activeTab === 'patients' && <AppointmentTable />}
//           {activeTab === 'referrals' && <PatientReferralViewer />}

//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReceptionistDashboard;
import React, { useState } from 'react';
import '../../styles/ReceptionistDashboard.css'; // Make sure to use the new CSS file
import logo from '../../assets/clinic-logo.png';
import ReceptionistProfile from './ReceptionistProfile';
import ManageRecSchedules from './ManageRecSchedules';
import AppointmentTable from './AppointmentTable';
import PatientReferralViewer from './ReceptionistReferrals';
import BookAppointmentReceptionist from './BookReceptionistAppointment';
import PatientDirectory from './PatientDirectory';

// Icons for the sidebar
const Icon = ({ name }) => {
  const icons = {
    profile: <i className="fas fa-user"></i>,
    appointments: <i className="fas fa-calendar-check"></i>,
    staff: <i className="fas fa-user-md"></i>,
    referrals: <i className="fas fa-file-medical"></i>,
    schedules: <i className="fas fa-calendar-alt"></i>
  };
  
  return icons[name] || null;
};

const ReceptionistDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };
  
  return (
    <div className="receptionist-dashboard-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <img src={logo} alt="Clinic Logo" />
          <h1>Care Connect Clinic</h1>
        </div>
        <ul className="nav-links">
          <li>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </li>
        </ul>
      </nav>
      
      {/* Main Content with Sidebar */}
      <div className="receptionist-container">
        {/* Sidebar Navigation */}
        <div className="sidebar">
          <ul className="nav-menu">
            <li className="nav-item">
              <div 
                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <Icon name="profile" />
                My Profile
              </div>
            </li>
            <li className="nav-item">
              <div 
                className={`nav-link ${activeTab === 'patients' ? 'active' : ''}`}
                onClick={() => setActiveTab('patients')}
              >
                <Icon name="appointments" />
                View Appointments
              </div>
            </li>
            <li className="nav-item">
  <div 
    className={`nav-link ${activeTab === 'book' ? 'active' : ''}`}
    onClick={() => setActiveTab('book')}
  >
    <Icon name="appointments" />
    Book Appointment
  </div>
</li>

            <li className="nav-item">
              <div 
                className={`nav-link ${activeTab === 'view' ? 'active' : ''}`}
                onClick={() => setActiveTab('view')}
              >
                <Icon name="staff" />
                View Patients
              </div>
            </li>
            <li className="nav-item">
              <div 
                className={`nav-link ${activeTab === 'referrals' ? 'active' : ''}`}
                onClick={() => setActiveTab('referrals')}
              >
                <Icon name="referrals" />
                View Referrals
              </div>
            </li>
            <li className="nav-item">
              <div 
                className={`nav-link ${activeTab === 'schedules' ? 'active' : ''}`}
                onClick={() => setActiveTab('schedules')}
              >
                <Icon name="schedules" />
                View Schedule
              </div>
            </li>
          </ul>
        </div>
        
        {/* Main Content Area */}
        <div className="main-content">
          {activeTab === 'profile' && (
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">My Profile</h2>
              </div>
              <ReceptionistProfile />
            </div>
          )}
          
          {activeTab === 'patients' && (
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Patient Appointments</h2>
              </div>
              <AppointmentTable />
            </div>
          )}
          
          {activeTab === 'schedules' && (
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">View Schedule</h2>
              </div>
              <ManageRecSchedules />
            </div>
          )}
          {activeTab === 'book' && (
  <div className="content-card">
    <div className="card-header">
      <h2 className="card-title">Book an Appointment</h2>
    </div>
    <BookAppointmentReceptionist />
  </div>
)}
          
          {activeTab === 'referrals' && (
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Patient Referrals</h2>
              </div>
              <PatientReferralViewer />
            </div>
          )}
          
          {activeTab === 'view' && (
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Patient Directory</h2>
              </div>
              <PatientDirectory />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;