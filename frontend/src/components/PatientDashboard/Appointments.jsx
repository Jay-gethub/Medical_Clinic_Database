
import React, { useState } from 'react';
import BookAppointment from './appointments/BookAppointment';
import ViewAppointments from './appointments/ViewAppointments';
import '../../styles/Appointments.css';

const Appointments = ({ patientId }) => {
  const [view, setView] = useState(null); // 'book' | 'view' | null

  return (
    <div className="appointments-container">
      {/* Menu view: show both options */}
      {!view && (
        <div className="options">
          <h2>Appointments</h2>
          <div className="large-buttons-container">
            <button 
              className="large-button book-button"
              onClick={() => setView('book')}
            >
              <div className="button-content">
                <span className="button-icon">📅</span>
                <span className="button-text">Book Appointment</span>
              </div>
            </button>

            <button 
              className="large-button view-button"
              onClick={() => setView('view')}
            >
              <div className="button-content">
                <span className="button-icon">📖</span>
                <span className="button-text">View Appointments</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Back button when in book/view mode */}
      {view && (
        <div className="back-button-container">
          <button className="back-button" onClick={() => setView(null)}>
            🔙 Back to Appointment Menu
          </button>
        </div>
      )}

      {view === 'book' && <BookAppointment patientId={patientId} />}
      {view === 'view' && <ViewAppointments patientId={patientId} />}
    </div>
  );
};

export default Appointments;
