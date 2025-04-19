// DoctorAppointments.js
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { format } from 'date-fns';
// import '../../styles/DoctorAppointments.css';

// const DoctorAppointments = () => {
//   const [appointments, setAppointments] = useState([]);
//   const [todayAppointments, setTodayAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const userData = JSON.parse(localStorage.getItem('user'));
//   const doctorId = userData?.employee_id;
  
//   useEffect(() => {
//     if (!doctorId) {
//       console.error('No doctor ID found in localStorage.');
//       setLoading(false);
//       return;
//     }
    
//     const fetchAppointments = async () => {
//       try {
//         const res = await axios.get(`http://localhost:5000/api/appointments/doctor/${doctorId}`);
//         setAppointments(res.data);
        
//         // Filter for today's appointments
//         const today = new Date();
//         const todayStr = format(today, 'yyyy-MM-dd');
        
//         const todayAppts = res.data.filter(appt => 
//           format(new Date(appt.start_time), 'yyyy-MM-dd') === todayStr
//         );
        
//         setTodayAppointments(todayAppts);
//       } catch (err) {
//         console.error('Error fetching appointments:', err);
//         setError('Failed to load appointments');
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchAppointments();
//   }, [doctorId]);

//   if (loading) return <p>Loading appointments...</p>;
//   if (error) return <p>{error}</p>;

//   return (
//     <div className="doctor-dashboard">
//       <div className="welcome-banner">
//         <h2>Hello, Dr. {userData?.first_name || 'Doctor'}</h2>
//         <p>Today is {format(new Date(), 'EEEE, d MMMM yyyy')}</p>
//       </div>
      
//       <div className="today-stats">
//         <div className="stat-card">
//           <h3>Today's Appointments</h3>
//           <p className="stat-number">{todayAppointments.length}</p>
//         </div>
//       </div>
      
//       <div className="appointments-container">
//         <h3>Today's Schedule</h3>
        
//         {todayAppointments.length === 0 ? (
//           <p className="no-appointments">No appointments scheduled for today</p>
//         ) : (
//           <div className="appointment-list">
//             {todayAppointments.map((appt) => (
//               <div key={appt.appointment_id} className="appointment-item">
//                 <div className="patient-initial">
//                   {appt.patient_first_name ? appt.patient_first_name[0] : 'P'}
//                 </div>
//                 <div className="appointment-details">
//                   <h4>{appt.patient_first_name} {appt.patient_last_name}</h4>
//                   <p>Patient ID: {appt.patient_id}</p>
//                   <p>{appt.appointment_type} • {format(new Date(appt.start_time), 'h:mm a')}</p>
//                 </div>
//                 <div className="appointment-actions">
//                   {appt.appointment_status === 'Scheduled' && (
//                     <button className="start-btn">Start</button>
//                   )}
//                   {appt.appointment_status === 'In Progress' && (
//                     <button className="end-btn">End</button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DoctorAppointments;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import '../../styles/DoctorAppointments.css';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const userData = JSON.parse(localStorage.getItem('user'));
  const doctorId = userData?.employee_id;

  useEffect(() => {
    if (!doctorId) {
      console.error('No doctor ID found in localStorage.');
      setLoading(false);
      return;
    }

    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/appointments/doctor/${doctorId}`);
        setAppointments(res.data);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorId]);

  

  const renderDays = () => {
    const days = [];
    const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="day-name" key={i}>
          {weekDays[i]}
        </div>
      );
    }

    return <div className="days">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = 'd';
    const rows = [];

    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        days.push(
          <div
            className={`cell ${!isSameMonth(day, monthStart) ? 'disabled' : ''} ${
              isSameDay(day, selectedDate) ? 'selected' : ''
            }`}
            key={day.toString()}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <span className="number">{formattedDate}</span>
          </div>
        );
        day = new Date(day.getTime() + 24 * 60 * 60 * 1000);
      }
      rows.push(
        <div className="row" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="body">{rows}</div>;
  };

  const renderCalendar = () => {
    return (
      <div className="calendar">
        <div className="calendar-header">
          <div className="calendar-navigation">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
              &lt;
            </button>
            <span>{format(currentMonth, 'MMMM yyyy')}</span>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
              &gt;
            </button>
          </div>
        </div>
        {renderDays()}
        {renderCells()}
      </div>
    );
  };

  const getSelectedDateAppointments = () => {
    return appointments.filter(appt =>
      isSameDay(new Date(appt.start_time), selectedDate)
    );
  };
  
  if (loading) return <p>Loading appointments...</p>;
  if (error) return <p>{error}</p>;
  
  return (
    <div className="doctor-dashboard">
      <div className="schedule-container">
        <div className="schedule-section">
          {renderCalendar()}
        </div>
  
        <div className="appointments-section">
          <h3>{format(selectedDate, 'EEEE, d MMMM yyyy')}</h3>
  
          {getSelectedDateAppointments().length === 0 ? (
            <p className="no-appointments">No appointments scheduled for this day</p>
          ) : (
            <div className="appointments-list">
              {getSelectedDateAppointments().map((appt) => (
                <div key={appt.appointment_id} className="appointment-item">
                  <div className="patient-initial">
                    {appt.patient_first_name ? appt.patient_first_name[0] : 'P'}
                  </div>
                  <div className="appointment-details">
                    <h4>{appt.patient_first_name} {appt.patient_last_name}</h4>
                    <p>Patient ID: {appt.patient_id}</p>
                    <p>{appt.appointment_type}</p>
                  </div>
                  <div className="appointment-time">
                    {format(new Date(appt.start_time), 'h:mm a')}
                  </div>
                  <div className="appointment-status">
                    <span className={`status-badge ${appt.appointment_status
                      .toLowerCase()
                      .replace(/\s/g, '')
                      .replace('canceled', 'cancelled')}`}>
                      {appt.appointment_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 

export default DoctorAppointments;