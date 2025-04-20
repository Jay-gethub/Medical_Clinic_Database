import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';


const Immunizations = ({ patientId }) => {
  const [immunizations, setImmunizations] = useState([]);

  const fetchImmunizations = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/patient/immunizations/${patientId}`);
      if (Array.isArray(response.data)) {
        setImmunizations(response.data);
      } else {
        setImmunizations([]);
      }
    } catch (err) {
      console.error("Error fetching immunizations:", err);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      fetchImmunizations();
    }
  }, [patientId, fetchImmunizations]);

  const groupedByStatus = immunizations.reduce((groups, record) => {
    const status = record.shot_status || 'Unknown';
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(record);
    return groups;
  }, {});

  return (
    <div className="immunizations-container">
      <h2>Immunizations</h2>
      {immunizations.length === 0 ? (
        <p>No immunization records available.</p>
      ) : (
        Object.entries(groupedByStatus).map(([status, records]) => (
          <div key={status} className="immunization-group">
            <h3 className="group-heading">{status} Immunizations</h3>
            <table className="immunization-table">
              <thead>
                <tr>
                  <th>Immunization</th>
                  <th>Date</th>
                  <th>Ordered By</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => (
                  <tr key={record.immunization_id}>
                    <td>{record.immunization_name}</td>
                    <td>{record.immunization_date ? new Date(record.immunization_date).toLocaleDateString() : ''}</td>
                    <td>Dr.{record.administered_by || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default Immunizations;
