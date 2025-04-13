import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DoctorReferralForm = () => {
  const [formData, setFormData] = useState({
    patient_id: '',
    referralReason: '',
    referralDate: '',
    extraNotes: '',
    expirationDate: '',
    specialist_id: '', // added field
  });

  const [assignedPatients, setAssignedPatients] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const doctorId = JSON.parse(localStorage.getItem('user'))?.employee_id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/employee/assigned-patients/${doctorId}`),
          axios.get(`http://localhost:5000/api/employee/all-doctors`)
        ]);

        setAssignedPatients(patientsRes.data);
        // Filter out the current doctor from the doctor list
        const filteredDoctors = doctorsRes.data.filter(doc => doc.employee_id !== doctorId);
        setAvailableDoctors(filteredDoctors);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch data.');
      }
    };

    if (doctorId) fetchData();
  }, [doctorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post('http://localhost:5000/api/employee/create-referrals', {
        patient_id: formData.patient_id,
        referring_doctor_id: doctorId,
        referral_reason: formData.referralReason,
        referral_date: formData.referralDate,
        referral_notes: formData.extraNotes,
        expiration_date: formData.expirationDate,
        specialist_id: formData.specialist_id
      });

      setSuccess('Referral successfully created!');
      setFormData({
        patient_id: '',
        referralReason: '',
        referralDate: '',
        extraNotes: '',
        expirationDate: '',
        specialist_id: '',
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to create referral.');
    }
  };

  return (
    <div className="referral-page">
      <h2>Create a Referral</h2>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit}>
        {/* Patient Dropdown */}
        <div className="form-group">
          <label htmlFor="patient_id">Select Patient:</label>
          <select
            id="patient_id"
            name="patient_id"
            value={formData.patient_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Select a Patient --</option>
            {assignedPatients.map((patient) => (
              <option key={patient.patient_id} value={patient.patient_id}>
                {patient.first_name} {patient.last_name} (ID: {patient.patient_id})
              </option>
            ))}
          </select>
        </div>

        {/* Doctor Dropdown */}
        <div className="form-group">
          <label htmlFor="specialist_id">Refer to Doctor:</label>
          <select
            id="specialist_id"
            name="specialist_id"
            value={formData.specialist_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Select a Doctor --</option>
            {availableDoctors.map((doc) => (
              <option key={doc.employee_id} value={doc.employee_id}>
                Dr. {doc.first_name} {doc.last_name} (ID: {doc.employee_id})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="referralReason">Reason for Referral:</label>
          <textarea
            id="referralReason"
            name="referralReason"
            value={formData.referralReason}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="referralDate">Referral Date:</label>
          <input
            type="date"
            id="referralDate"
            name="referralDate"
            value={formData.referralDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="extraNotes">Extra Notes:</label>
          <textarea
            id="extraNotes"
            name="extraNotes"
            value={formData.extraNotes}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="expirationDate">Expiration Date:</label>
          <input
            type="date"
            id="expirationDate"
            name="expirationDate"
            value={formData.expirationDate}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="submit-btn">Submit Referral</button>
      </form>
    </div>
  );
};

export default DoctorReferralForm;
