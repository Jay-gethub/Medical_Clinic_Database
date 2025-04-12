import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../../styles/ViewAppointments.css';


const ViewAppointments = ({ patientId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (patientId) {
      fetchAppointments();
    } else {
      setError("Patient ID is missing. Please log in again.");
      setLoading(false);
    }
  }, [patientId]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`http://localhost:5000/api/appointments/my-appointments?patientId=${patientId}`);
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err.response?.data?.error || "Failed to load appointments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put(
        `http://localhost:5000/api/appointments/cancel/${appointmentId}`,
        { patientId }
      );

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.appointment_id === appointmentId
            ? { ...appt, appointment_status: 'Canceled' }
            : appt
        )
      );

      alert(res.data.message + (res.data.note ? ` ${res.data.note}` : ''));
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      alert(err.response?.data?.error || "Failed to cancel appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const upcomingAppointments = appointments.filter(
    (appt) =>
      appt.appointment_status === 'Scheduled' &&
      new Date(appt.start_time) > new Date()
  );

  const pastAppointments = appointments.filter(
    (appt) =>
      appt.appointment_status !== 'Scheduled' ||
      new Date(appt.start_time) <= new Date()
  );
  const formatDateTime = (startStr, endStr) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
  
    return {
      date: start.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      timeRange: `${start.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })} - ${end.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })}`,
    };
  };
  
  

  // const formatDateTime = (dateStr) => {
  //   const date = new Date(dateStr);
  //   return {
  //     date: date.toLocaleDateString('en-US', {
  //       weekday: 'short',
  //       month: 'short',
  //       day: 'numeric',
  //       year: 'numeric',
  //     }),
  //     time: date.toLocaleTimeString('en-US', {
  //       hour: '2-digit',
  //       minute: '2-digit',
  //     }),
  //   };
  // };

  return (
    <div className="view-appointments">
      <div className="appointments-header">
        <h2>Your Appointments</h2>
        <button onClick={fetchAppointments} className="refresh-btn">
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <section className="appointment-section">
        <h3>Upcoming Appointments</h3>
        {upcomingAppointments.length === 0 ? (
          <p className="no-appointments">You don't have any upcoming appointments.</p>
        ) : (
          upcomingAppointments.map((appt) => {
            const { date, timeRange } = formatDateTime(appt.start_time, appt.end_time);
            return (
              <div key={appt.appointment_id} className="appointment-card">
                <div className="appointment-header">
                  <span className="appointment-type">{appt.appointment_type || 'Regular Checkup'}</span>
                  <span className={`badge ${appt.appointment_status.toLowerCase()}`}>{appt.appointment_status}</span>
                </div>
                <div className="appointment-body">
                  <div className="appointment-doctor">
                    Dr. {appt.doctor_first_name || ''} {appt.doctor_last_name || ''}
                  </div>
                  <div className="appointment-time">
                    <div>📅 {date}</div>
                    <div>🕒 {timeRange}</div>
                  </div>
                </div>
                <div className="appointment-footer">
                  <button
                    onClick={() => handleCancel(appt.appointment_id)}
                    className="cancel-btn"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Cancel Appointment'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>

      <section className="appointment-section">
        <h3>Appointment History</h3>
        {pastAppointments.length === 0 ? (
          <p className="no-appointments">You don't have any past appointments.</p>
        ) : (
          pastAppointments.map((appt) => {
            const { date, timeRange } = formatDateTime(appt.start_time, appt.end_time);

            return (
              <div key={appt.appointment_id} className="appointment-card">
                <div className="appointment-header">
                  <span className="appointment-type">{appt.appointment_type || 'Regular Checkup'}</span>
                  <span className={`badge ${appt.appointment_status.toLowerCase()}`}>{appt.appointment_status}</span>
                </div>
                <div className="appointment-body">
                  <div className="appointment-doctor">
                    Dr. {appt.doctor_first_name || ''} {appt.doctor_last_name || ''}
                  </div>
                  <div className="appointment-time">
                    <div>📅 {date}</div>
                    <div>🕒 {timeRange}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};

export default ViewAppointments;
