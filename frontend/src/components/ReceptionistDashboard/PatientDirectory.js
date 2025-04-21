import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/ReceptionistDashboard.css';

const PatientDirectory = () => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
  
    useEffect(() => {
      const fetchPatients = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/employee/patient-details');
          setPatients(res.data);
        } catch (err) {
          console.error('Error fetching patient data:', err);
        }
      };
  
      fetchPatients();
    }, []);
  
    const formatAddress = (p) => {
      return `${p.street_num} ${p.street_name}, ${p.city}, ${p.state} ${p.postal_code}`;
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
    };
  
    return (
      <div className="admin-box">
        <h3>Patient Directory</h3>
        <table className="employee-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>DOB</th>
              <th>Sex</th>
              <th>Phone</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p, idx) => (
              <tr key={idx} onClick={() => setSelectedPatient(p)} style={{ cursor: 'pointer' }}>
                <td>{p.first_name} {p.last_name}</td>
                <td>{formatDate(p.dob)}</td>
                <td>{p.sex}</td>
                <td>{p.phone_num}</td>
                <td>{p.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
  
        {/* Modal popup thingy */}
        {selectedPatient && (
          <div className="modal-overlay" onClick={() => setSelectedPatient(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>{selectedPatient.first_name} {selectedPatient.last_name} — ID #{selectedPatient.patient_id}</h3>
              <p><strong>Address:</strong> {formatAddress(selectedPatient)}</p>
              <p><strong>DOB:</strong> {formatDate(selectedPatient.dob)}</p>
              <p><strong>Sex:</strong> {selectedPatient.sex}</p>
              <p><strong>Phone:</strong> {selectedPatient.phone_num}</p>
              <p><strong>Email:</strong> {selectedPatient.email}</p>
              <hr />
              <h4>Emergency Contact</h4>
              {selectedPatient.contact_first_name ? (
                <>
                  <p><strong>Name:</strong> {selectedPatient.contact_first_name} {selectedPatient.contact_last_name}</p>
                  <p><strong>Relationship:</strong> {selectedPatient.relationship}</p>
                  <p><strong>Phone:</strong> {selectedPatient.emergency_phone}</p>
                </>
              ) : (
                <p>No emergency contact on file.</p>
              )}
              <button onClick={() => setSelectedPatient(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    );
  };
  

export default PatientDirectory;