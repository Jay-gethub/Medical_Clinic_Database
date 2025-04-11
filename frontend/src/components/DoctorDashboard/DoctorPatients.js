import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/DoctorPatients.css'; // Make sure to create this CSS file

const AssignedPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const employeeId = storedUser?.employee_id;

  useEffect(() => {
    if (employeeId) {
      fetchPatients();
    } else {
      setError("Employee ID is missing. Please log in again.");
      setLoading(false);
    }
  }, [employeeId]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/employee/assigned-patients/${employeeId}`);
      console.log("Fetched patients:", response.data);
      setPatients(Array.isArray(response.data) ? response.data : [response.data]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch patients.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="loading-text">Loading assigned patients...</p>;
  if (error) return <p className="error-text">Error: {error}</p>;

  return (
    <div className="assigned-patients-page">
      <h2 className="page-title">Assigned Patients</h2>
      <div className="patients-container">
        {patients.map((patient) => (
          <div key={patient.patient_id} className="patient-card">
            <h3>{patient.first_name} {patient.last_name}</h3>
            <p><strong>Gender:</strong> {patient.sex}</p>
            <p><strong>DOB:</strong> {patient.dob?.slice(0, 10)}</p>
            <p><strong>Contact:</strong> {patient.phone_num}</p>
            <p><strong>Address:</strong> {patient.street_num}, {patient.street_name}, {patient.city}, {patient.state}, {patient.postal_code}</p>
            <p><strong>Allergies:</strong> {patient.allergies || 'None'}</p>
            <p><strong>Assignment Date:</strong> {patient.assignment_date?.slice(0, 10)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignedPatientsPage;

