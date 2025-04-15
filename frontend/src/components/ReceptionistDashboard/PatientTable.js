import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/AdminDashboard.css';

const PatientTable = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/employee/patient-table');
        setPatients(res.data);
      } catch (err) {
        console.error('Error fetching Patients:', err);
      }
    };

    fetchPatients();
  }, []);

  return (
    <div className="admin-box">
      <h3>Patient Directory</h3>
      <table className="employee-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Doctor</th>
            <th>Appointment Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((pat, index) => (
            <tr key={index}>
              <td>{pat.last_name}, {pat.first_name}</td>
              <td>{pat.phone}, {pat.email}</td>
              <td>{pat.doctor_last_name}, {pat.doctor_first_name}</td>
              <td>{pat.start_time}</td> {/*change to doctor from patient-doctor table*/}
              <td>{pat.appointment_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientTable;
