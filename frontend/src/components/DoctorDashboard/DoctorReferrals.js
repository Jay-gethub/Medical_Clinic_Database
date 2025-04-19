import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/DoctorReferrals.css'; // Make sure this is correctly pointing to your CSS file

const DoctorReferralForm = () => {
  const [formData, setFormData] = useState({
    patient_id: '',
    referralReason: '',
    referralDate: '',
    extraNotes: '',
    expirationDate: '',
    specialist_id: '',
  });

  const [assignedPatients, setAssignedPatients] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [pendingReferrals, setPendingReferrals] = useState([]);
  const [isSpecialist, setIsSpecialist] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const [loading, setLoading] = useState(true);

  const doctorId = JSON.parse(localStorage.getItem('user'))?.employee_id;

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage('');
      setToastType('');
    }, 3000);
  };

  const Toast = ({ message, type, onClose }) => {
    if (!message) return null;

    return (
      <div className={`toast ${type}`}>
        {message}
        <button onClick={onClose}>&times;</button>
      </div>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, specialistsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/employee/assigned-patients/${doctorId}`),
          axios.get(`http://localhost:5000/api/employee/all-specialists`)
        ]);

        const specialists = specialistsRes.data;
        const isCurrentDoctorSpecialist = specialists.some(doc => doc.employee_id === doctorId);

        if (isCurrentDoctorSpecialist) {
          setIsSpecialist(true);
          const referralsRes = await axios.get(`http://localhost:5000/api/employee/pending-referrals/${doctorId}`);
          //console.log('Fetched referrals:', referralsRes.data);
          setPendingReferrals(referralsRes.data);
        } else {
          setIsSpecialist(false);
          setAssignedPatients(patientsRes.data);
          setAvailableDoctors(specialists); // use the full list of specialists as options
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch data.');
      } finally {
        setLoading(false); // ✅ Stop loading
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
      showToast('Referral successfully created!', 'success');

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
      showToast(err, 'error');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (isSpecialist) {
    const handleDecision = async (referralId, decision) => {
      const confirmed = window.confirm(`Are you sure you want to ${decision} this referral?`);
      if (!confirmed) return;

      try {
        await axios.put(`http://localhost:5000/api/employee/update-referral-status/${referralId}`, {
          status: decision
        });

        // Remove the referral from the list (optimistic update)
        setPendingReferrals((prev) =>
          prev.filter((ref) => ref.referral_id !== referralId)
        );

        alert(`Referral ${decision}d successfully.`);
      } catch (err) {
        console.error('Failed to update referral:', err);
        alert('Failed to update referral status.');
      }
    };

    return (
      <div className="doctor-referral-container">
        {/* Toast Notification */}
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />

        <div className="specialist-view">
          <h2>Pending Referrals</h2>
          {pendingReferrals.length === 0 ? (
            <p>No pending referrals.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Reason</th>
                  <th>Referred By</th>
                  <th>Date</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingReferrals.map((ref) => (
                  <tr key={ref.referral_id}>

                    <td>{ref.patient_first_name} {ref.patient_last_name}</td>
                    
                    <td>{ref.referral_reason}</td>
                    <td>Dr. {ref.doctor_first_name} {ref.doctor_last_name}</td>
                    <td>{new Date(ref.referral_date).toLocaleDateString()}</td>
                    <td>{ref.referral_notes}</td>
                    <td>
                      <button className="approve-btn" onClick={() => handleDecision(ref.referral_id, 'Approved')}>
                        Approve
                      </button>
                      <button className="decline-btn" onClick={() => handleDecision(ref.referral_id, 'Declined')}>
                        Decline
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-referral-container">
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
                Dr. {doc.first_name} {doc.last_name} || {doc.specialization}
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
