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
  const [bookingSuccess, setBookingSuccess] = useState(false);
  return (
    <div className="appointments-container">
      <h2>Book an Appointment</h2>

      <ClinicSelector onClinicSelect={(id) => {
        setSelectedClinic(id);
        setSelectedDoctor(null);
        setSelectedTime(null);
        setBookingSuccess(false);
      }} />
  
      {selectedClinic && (
        <DoctorSelector
        clinicId={selectedClinic}
        onDoctorSelect={(id) => {
          setSelectedDoctor(id);
          setSelectedTime(null);
          setBookingSuccess(false); //
        }}
      />
      )}

{selectedDoctor && (
  <TimeSlotSelector
    employeeId={selectedDoctor}
    onTimeSelect={(slot) => {
      console.log(" Selected time:", slot); //Check
      setSelectedTime(slot);
      setBookingSuccess(false); 
    }}
  />
)}
      
      

      {selectedDoctor && selectedTime && (
        <ReferralCheck
        patientId={patientId}
        doctorId={selectedDoctor}
        clinicId={selectedClinic}
        time={selectedTime}
        onBookingSuccess={() => setBookingSuccess(true)}  //
      />
    
      
      )}
      {bookingSuccess && (
  <div className="booking-success-msg">
   {/* ✅ Appointment booked successfully! */}
  </div>
)}

    </div>
  );
};

export default BookAppointment