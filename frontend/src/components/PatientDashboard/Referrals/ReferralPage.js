import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReferralPage = ({ patientId }) => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataAvailable, setDataAvailable] = useState(true);

  useEffect(() => {
    if (patientId) {
      fetchReferralData(patientId);
    } else {
      setError("Patient ID is missing. Please log in again.");
      setLoading(false);
    }
  }, [patientId]);

  const fetchReferralData = async (patientId) => {
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
      console.error("Error fetching referral data:", err);
      setError(err.response?.data?.error || "Failed to fetch referral data.");
      setDataAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString) => {
    return isoString ? isoString.slice(0, 10) : '';
  };

  if (loading) {
    return <div>Loading referral data...</div>;
  }

  if (!dataAvailable) {
    return <div>No referral data available for Patient ID: {patientId}.</div>;
  }

  return (
    <div className="referral-page">
      <h2>Referral Information</h2>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

{referrals.map((referral, index) => (
  <div
    key={index}
    className="referral-display"
    style={{
      border: '1px solid #ccc',
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '1.5rem',
      backgroundColor: '#f9f9f9'
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

    </div>
  );
};

export default ReferralPage;
