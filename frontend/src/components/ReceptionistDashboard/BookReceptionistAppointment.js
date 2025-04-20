import React, { useState, useEffect } from 'react';
import DoctorSelector from '../PatientDashboard/appointments/DoctorSelector';
import TimeSlotSelector from '../PatientDashboard/appointments/TimeSlotSelector';
import ReferralCheck from './ReferralCheck';
import '../../styles/Appointments.css';
import axios from 'axios';

const BookAppointmentReceptionist = () => {
  const [clinicId, setClinicId] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');

  useEffect(() => {
    const fetchAssignedClinic = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        console.log("🧠 Logged-in user:", user);
  
        const res = await axios.get(`http://localhost:5000/api/employee/receptionist/clinic/${user.user_id}`);
        console.log("✅ Assigned clinic fetched:", res.data);
  
        setClinicId(res.data.clinic_id);
      } catch (err) {
        console.error("❌ Failed to fetch clinicId:", err);
      }
    };
  
    fetchAssignedClinic();
  }, []);
  
  useEffect(() => {
    console.log("🎯 clinicId now:", clinicId);
  }, [clinicId]);

  return (
    <div className="form-card">
      <h2>Book Appointment</h2>

      {/* Patient ID input */}
      <div className="patient-id-input">
        <label>Enter Patient ID:</label>
        <input
          type="text"
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          placeholder="Patient ID"
        />
      </div>

      {/* Doctor Selector */}
      {clinicId && (
        <DoctorSelector
          clinicId={clinicId}
          onDoctorSelect={setSelectedDoctor}
        />
      )}

      {/* Time Slot Selector */}
      {selectedDoctor && (
        <TimeSlotSelector
          employeeId={selectedDoctor}
          onTimeSelect={(slot) => {
            setSelectedTime(slot);
          }}
        />
      )}

      {/* Referral Check */}
      {selectedDoctor && selectedTime && selectedPatientId.trim() !== '' && (
        <ReferralCheck
          patientId={selectedPatientId}
          doctorId={selectedDoctor}
          clinicId={clinicId}
          time={selectedTime}
          isReceptionist={true} // Ensures receptionist API is used
        />
      )}
    </div>
  );
};

export default BookAppointmentReceptionist;
