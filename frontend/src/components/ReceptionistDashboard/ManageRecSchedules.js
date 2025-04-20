//      This file contains the code for the ManageDocSchedules component which is a child component of the AdminDashboard component.
// import React, { use, useEffect, useState } from 'react';
// import axios from 'axios';
// import '../../styles/AdminDashboard.css';

// const ManageRecSchedules = () => {
//   const [clinics, setClinics] = useState([]);
//   const [, setEmployees] = useState([]);
//   const [schedules, setSchedules] = useState([]);
//   const [selectedClinic, setSelectedClinic] = useState('');
//   const [, setSelectedEmployee] = useState('');
//   const [message] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // Fetch clinics on component mount
//   useEffect(() => {
//     const fetchClinics = async () => {
//       try {
//         setLoading(true);
//         setError('');
//         const response = await axios.get('http://localhost:5000/api/admin/clinics');
//         setClinics(response.data);
//       } catch (err) {
//         console.error('Error fetching clinics:', err);
//         setError('Failed to load clinics. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchClinics();
//   }, []);

//   //fetch employee
//   useEffect(() => {
//     const userData = JSON.parse(localStorage.getItem('user'));
//     if (userData) {
//       setSelectedEmployee(userData.employee_id);
//       fetchSchedules(userData.employee_id);
//     }
//   }, []);

//   const fetchSchedules = async (employeeId) => {
//     if (!employeeId) return;
    
//     try {
//       setLoading(true);
//       setError('');
//       const response = await axios.get(`http://localhost:5000/api/admin/schedules/${employeeId}`);
//       setSchedules(response.data);
//     } catch (err) {
//       console.error('Error fetching schedules:', err);
//       setError('Failed to load schedules. Please try again later.');
//       setSchedules([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClinicChange = (e) => {
//     const clinicId = e.target.value;
//     setSelectedClinic(clinicId);
//     setSelectedEmployee('');
//     setEmployees([]);
//     setSchedules([]);
//     if (clinicId) {
//       fetchSchedules(clinicId);
//     }
//   };

//   return (
//     <div className="schedule-container">
//       <div className="admin-tab-content">
//         <h2 className="section-title">Manage Employee Schedules</h2>
  
//         {error && <p className="error-message">{error}</p>}
//         {message && <p className="success-message">{message}</p>}
//         {loading && <p>Loading...</p>}
  
//         {/* Dropdown group */}
//         <div className="dropdown-group">
//           <div className="dropdown-field">
//             <label htmlFor="clinic-select">Clinic</label>
//             <select
//               id="clinic-select"
//               value={selectedClinic}
//               onChange={handleClinicChange}
//               disabled={loading}
//             >
//               <option value="">Select Clinic</option>
//               {clinics.map(c => (
//                 <option key={c.clinic_id} value={c.clinic_id}>{c.clinic_name}</option>
//               ))}
//             </select>
//           </div>
  
//           <div className="dropdown-field">
//             <label>Employee</label>
//             <p style ={{ color: 'white'}}>
//               ID: {JSON.parse(localStorage.getItem('user'))?.user_id}, {JSON.parse(localStorage.getItem('user'))?.username}
//             </p>
//           </div>
//         </div>
  
//         {/* Existing schedules */}
//         {schedules.length > 0 && (
//           <div className="schedule-table">
//             <h3>Existing Schedules</h3>
//             <table>
//               <thead>
//                 <tr>
//                   <th>Day</th>
//                   <th>Start</th>
//                   <th>End</th>

//                 </tr>
//               </thead>
//               <tbody>
//                 {schedules.map(sch => (
//                   <tr key={sch.schedule_id}>
//                     <td>{sch.day_of_week}</td>
//                     <td>{sch.start_time}</td>
//                     <td>{sch.end_time}</td>
                  
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
  
// };

// export default ManageRecSchedules;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/ManageRecSchedules.css';

const ManageRecSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user')) || {};
  const employeeId = userData.employee_id || userData.user_id;

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!employeeId) {
        setError('Employee ID not found. Please log in again.');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/admin/schedules/${employeeId}`);
        setSchedules(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching schedules:', err);
        setError('Failed to load schedules. Please try again later.');
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [employeeId]);

  return (
    <div className="view-schedules-container">
      <h2 className="page-title">My Schedule</h2>

      {error && (
        <div className="error-alert">
          {error}
        </div>
      )}

      <div className="schedule-card">
        
        <div className="column-content">
          {loading ? (
            <div className="loading-indicator">Loading schedules...</div>
          ) : schedules.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.schedule_id || schedule.id}>
                    <td>{schedule.day_of_week}</td>
                    <td>{schedule.start_time}</td>
                    <td>{schedule.end_time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data-message">
              No schedules found. Please contact your administrator.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageRecSchedules;
