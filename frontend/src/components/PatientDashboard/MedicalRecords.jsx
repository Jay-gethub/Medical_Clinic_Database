import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const MedicalRecords = ({ patientId }) => {
  const [records, setRecords] = useState([]);

  // Fetch medical records for the patient (returns an array)
  const fetchMedicalRecords = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/patient/medical-records/${patientId}`);
      if (Array.isArray(res.data)) {
        setRecords(res.data);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error("Error fetching medical records:", err);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      fetchMedicalRecords();
    }
  }, [patientId, fetchMedicalRecords]);

  return (
    <div className="profile-form">
      <h2>Medical Records</h2>
      {records.length === 0 ? (
        <p>No medical records available.</p>
      ) : (
        records.map(record => (
          <div
            key={record.record_id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              backgroundColor: '#f9f9f9'
            }}
          >
            <div className="form-group">
              <label>Record ID:</label>
              <p>{record.record_id}</p>
            </div>
            <div className="form-group">
              <label>Doctor ID:</label>
              <p>{record.doctor_id}</p>
            </div>
            <div className="form-group">
              <label>Date Posted:</label>
              <p>{record.date_posted ? new Date(record.date_posted).toLocaleString() : ''}</p>
            </div>
            <div className="form-group">
              <label>Diagnosis:</label>
              <p>{record.diagnosis}</p>
            </div>
            <div className="form-group">
              <label>Chief Complaint:</label>
              <p>{record.chief_complaint}</p>
            </div>
            <div className="form-group">
              <label>Vital Signs:</label>
              <p>{record.vital_signs}</p>
            </div>
            <div className="form-group">
              <label>Treatment Plan:</label>
              <p>{record.treatment_plan}</p>
            </div>
            <div className="form-group">
              <label>Follow Up Instructions:</label>
              <p>{record.follow_up_instructions}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MedicalRecords;
