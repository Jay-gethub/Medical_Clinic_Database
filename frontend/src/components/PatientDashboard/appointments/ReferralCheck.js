import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ReferralCheck = ({ patientId, doctorId, time, clinicId }) => {
  const [requiresReferral, setRequiresReferral] = useState(false);
  const [hasReferral, setHasReferral] = useState(null);
  const [appointmentType, setAppointmentType] = useState('General');
  const [bookingMessage, setBookingMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFollowUp, setIsFollowUp] = useState("no");

  // Determine if doctor is a specialist
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/appointments/doctors/by-clinic/${clinicId}`);
        const doctor = res.data.find(d => d.employee_id === doctorId);
        if (!doctor) return;

        const specialistDepts = ['Cardiology', 'Internal Medicine'];
        if (specialistDepts.includes(doctor.department_name)) {
          setRequiresReferral(true);
          setAppointmentType('Specialist');
        } else {
          setRequiresReferral(false);
          // appointmentType will be set later based on isFollowUp
        }
      } catch (err) {
        console.error('Error checking doctor info:', err);
      }
    };

    if (doctorId && clinicId) fetchDoctorDetails();
  }, [doctorId, clinicId]);

  // If referral required, check if patient has one
  useEffect(() => {
    const checkReferral = async () => {
      if (!requiresReferral) return;

      try {
        const res = await axios.get(
          `http://localhost:5000/api/referrals/check?patientId=${patientId}&doctorId=${doctorId}`
        );
        setHasReferral(res.data.valid);
      } catch (err) {
        console.error('Referral check failed:', err);
        setHasReferral(false);
      }
    };

    if (requiresReferral && patientId && doctorId) checkReferral();
  }, [requiresReferral, patientId, doctorId]);

  // Confirm appointment
  const handleConfirm = async () => {
    setLoading(true);

    // Determine appointment type just before sending
    let finalType = appointmentType;
    if (!requiresReferral) {
      finalType = isFollowUp === 'yes' ? 'Follow-up' : 'Regular';
    }

    if (!patientId || !doctorId || !clinicId || !time || !time.start || !time.end) {
      setBookingMessage('⚠️ Missing required information. Please try again.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:5000/api/appointments/create',
        {
          patient_id: patientId,
          doctor_id: doctorId,
          clinic_id: clinicId,
          start_time: time.start,
          end_time: time.end,
          appointment_type: finalType,
          appointment_status: 'Scheduled',
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setBookingMessage('✅ Appointment booked successfully!');
    } catch (err) {
      console.error('Booking failed:', err);
      setBookingMessage(err.response?.data?.error || '❌ Booking failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="referral-check">
      <h4>Finalize Appointment</h4>

      {requiresReferral && <p>This doctor is a specialist. Referral required.</p>}

      {!requiresReferral && (
        <div className="followup-question">
          <label>Is this a follow-up appointment?</label>
          <select value={isFollowUp} onChange={(e) => setIsFollowUp(e.target.value)}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
      )}

      {requiresReferral ? (
        hasReferral ? (
          <button onClick={handleConfirm} disabled={loading}>
            {loading ? 'Booking...' : 'Confirm Appointment'}
          </button>
        ) : (
          <p className="error-msg">❗You need a valid referral to book with this specialist.</p>
        )
      ) : (
        <button onClick={handleConfirm} disabled={loading}>
          {loading ? 'Booking...' : 'Confirm Appointment'}
        </button>
      )}

      {bookingMessage && <p className="booking-msg">{bookingMessage}</p>}
    </div>
  );
};

export default ReferralCheck;
