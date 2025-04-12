import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PatientReferralViewer = () => {
  const [patients, setPatients] = useState([]);
  const [searchMode, setSearchMode] = useState('id');
  const [patientIdInput, setPatientIdInput] = useState('');
  const [firstNameInput, setFirstNameInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataAvailable, setDataAvailable] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/employee/all-patients');
        setPatients(response.data);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to fetch patient list.');
      }
    };

    fetchPatients();
  }, []);

  const fetchReferralData = async (patientId) => {
    setLoading(true);
    setError(null);
    setReferrals([]);

    try {
      const response = await axios.get(`http://localhost:5000/api/patient/referrals/${patientId}`);
      const data = response.data;

      if (Array.isArray(data) && data.length > 0) {
        setReferrals(data);
        setDataAvailable(true);
      } else {
        setDataAvailable(false);
      }
    } catch (err) {
      console.error('Error fetching referrals:', err);
      setError(err.response?.data?.error || 'Failed to fetch referral data.');
      setDataAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setError('');

    if (searchMode === 'id') {
      if (patientIdInput.trim()) {
        setSelectedPatientId(patientIdInput.trim());
        fetchReferralData(patientIdInput.trim());
      } else {
        setError('Please enter a valid patient ID.');
      }
    } else {
      if (!firstNameInput.trim() || !lastNameInput.trim()) {
        setError('Please enter both first and last name.');
        return;
      }

      const first = firstNameInput.trim().toLowerCase();
      const last = lastNameInput.trim().toLowerCase();

      const match = patients.find(
        (p) =>
          p.first_name.toLowerCase() === first &&
          p.last_name.toLowerCase() === last
      );

      if (match) {
        setSelectedPatientId(match.patient_id);
        fetchReferralData(match.patient_id);
      } else {
        setReferrals([]);
        setError('Patient not found with that name.');
      }
    }
  };

  const formatDate = (isoString) => (isoString ? isoString.slice(0, 10) : '');

  return (
    <div className="referral-page">
      <h2>View Patient Referrals</h2>

      {error && <p className="error-message">{error}</p>}

      {/* Toggle between ID or name search */}
      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label>
          <input
            type="radio"
            value="id"
            checked={searchMode === 'id'}
            onChange={() => {
              setSearchMode('id');
              setPatientIdInput('');
              setFirstNameInput('');
              setLastNameInput('');
              setReferrals([]);
              setError(null);
            }}
          />
          Search by Patient ID
        </label>
        {' '}
        <label style={{ marginLeft: '1rem' }}>
          <input
            type="radio"
            value="name"
            checked={searchMode === 'name'}
            onChange={() => {
              setSearchMode('name');
              setPatientIdInput('');
              setFirstNameInput('');
              setLastNameInput('');
              setReferrals([]);
              setError(null);
            }}
          />
          Search by Name
        </label>
      </div>

      {/* Search inputs */}
      {searchMode === 'id' ? (
        <div className="form-group">
          <label htmlFor="patientIdInput">Enter Patient ID:</label>
          <input
            type="text"
            id="patientIdInput"
            value={patientIdInput}
            onChange={(e) => setPatientIdInput(e.target.value)}
          />
        </div>
      ) : (
        <div className="form-group">
          <label>Enter Patient Name:</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="First Name"
              value={firstNameInput}
              onChange={(e) => setFirstNameInput(e.target.value)}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastNameInput}
              onChange={(e) => setLastNameInput(e.target.value)}
            />
          </div>
        </div>
      )}

      <button onClick={handleSearch} style={{ marginTop: '0.75rem' }}>
        Search Referrals
      </button>

      {/* Referral data */}
      {loading && <div>Loading referral data...</div>}

      {!loading && selectedPatientId && !dataAvailable && (
        <div>No referral data available for Patient ID: {selectedPatientId}.</div>
      )}

      {!loading && referrals.length > 0 && (
        <>
          {referrals.map((referral, index) => (
            <div
              key={index}
              className="referral-display"
              style={{
                border: '1px solid #ccc',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                backgroundColor: '#f9f9f9',
              }}
            >
              <h3>Referral #{referral.referral_id}</h3>
              <p><strong>Referred Doctor Name:</strong> {referral.referring_doctor_name}</p>
              <p><strong>Reason:</strong> {referral.referral_reason}</p>
              <p><strong>Referral Date:</strong> {formatDate(referral.referral_date)}</p>
              <p><strong>Extra Notes:</strong> {referral.referral_notes}</p>
              <p><strong>Expiration Date:</strong> {formatDate(referral.expiration_date)}</p>
              <p><strong>Status:</strong> {referral.referral_status}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default PatientReferralViewer;
