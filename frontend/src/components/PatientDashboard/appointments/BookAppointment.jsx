import React, { useState } from 'react';
import ClinicSelector from './ClinicSelector';
import DoctorSelector from './DoctorSelector';
import TimeSlotSelector from './TimeSlotSelector';
import ReferralCheck from './ReferralCheck';
import '../../../styles/Appointments.css';
const BookAppointment = ({ patientId }) => {
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  return (
    <div className="appointments-container">
      <h2>Book an Appointment</h2>

      <ClinicSelector onClinicSelect={(id) => {
        setSelectedClinic(id);
        setSelectedDoctor(null);
        setSelectedTime(null);
      }} />
      {selectedClinic && (
        <DoctorSelector
          clinicId={selectedClinic}
          onDoctorSelect={setSelectedDoctor}
        />
      )}

{selectedDoctor && (
  <TimeSlotSelector
    employeeId={selectedDoctor}
    onTimeSelect={(slot) => {
      console.log(" Selected time:", slot); //Check
      setSelectedTime(slot);
    }}
  />
)}
      
      

      {selectedDoctor && selectedTime && (
      <ReferralCheck
      patientId={patientId}
      doctorId={selectedDoctor}
      clinicId={selectedClinic}
      time={selectedTime}
    />
    
      
      )}
    </div>
  );
};

export default BookAppointment;