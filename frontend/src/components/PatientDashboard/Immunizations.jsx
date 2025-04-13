import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const immunizationTypes = ['Hepatitis B', 'Influenza', 'COVID-19', 'Tetanus', 'Polio', 'HPV'];

const Immunizations = ({ patientId }) => {
  const [immunizations, setImmunizations] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editedRecords, setEditedRecords] = useState([]);
  const [errors, setErrors] = useState({});

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


  const startEdit = () => {
    setEditedRecords([...immunizations]);
    setEditMode(true);
  };

  const handleChange = (index, field, value) => {
    const updated = [...editedRecords];
    updated[index] = { ...updated[index], [field]: value };
    setEditedRecords(updated);
  };

  const validateRecords = () => {
    const newErrors = {};
    editedRecords.forEach(record => {
      if (!record.immunization_type) {
        newErrors[record.immunization_id] = "Immunization type is required.";
      }
      if (!record.immunization_date) {
        newErrors[record.immunization_id] = (newErrors[record.immunization_id] || "") + " Immunization date is required.";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveEdits = async () => {
    if (!validateRecords()) return;
    try {
      const updatePromises = editedRecords.map(record =>
        axios.put(`http://localhost:5000/api/patient/immunizations/${record.immunization_id}`, {
          immunization_type: record.immunization_type,
          immunization_date: record.immunization_date,
          administered_by: record.administered_by,
        })
      );
      await Promise.all(updatePromises);
      alert("Immunizations updated successfully!");
      setEditMode(false);
      fetchImmunizations();
    } catch (err) {
      console.error("Error updating immunizations:", err);
      alert("Failed to update immunizations.");
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setErrors({});
  };

  const deleteRecord = async (immunization_id) => {
    if (window.confirm("Are you sure you want to delete this immunization record?")) {
      try {
        await axios.delete(`http://localhost:5000/api/patient/immunizations/${immunization_id}`);
        alert("Record deleted successfully.");
        fetchImmunizations();
      } catch (err) {
        console.error("Error deleting record:", err);
        alert("Failed to delete record.");
      }
    }
  };

  return (
    <div className="profile-form">
      <h2>Immunizations</h2>
      {immunizations.length === 0 ? (
        <p>No immunization records available.</p>
      ) : (
        immunizations.map((record, index) => (
          <div
            key={record.immunization_id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              backgroundColor: '#f9f9f9'
            }}
          >
            <label>Immunization ID:</label>
            <input type="text" value={record.immunization_id} disabled /><br />

            <label>Immunization Type:</label>
            {editMode ? (
              <select
                value={editedRecords[index].immunization_type || ''}
                onChange={(e) => handleChange(index, 'immunization_type', e.target.value)}
              >
                <option value="">--Select--</option>
                {immunizationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            ) : (
              <input type="text" value={record.immunization_type} disabled />
            )}<br />

            <label>Immunization Date:</label>
            {editMode ? (
              <input
                type="date"
                value={editedRecords[index].immunization_date ? editedRecords[index].immunization_date.split('T')[0] : ''}
                onChange={(e) => handleChange(index, 'immunization_date', e.target.value)}
              />
            ) : (
              <input
                type="text"
                value={record.immunization_date ? new Date(record.immunization_date).toLocaleDateString() : ''}
                disabled
              />
            )}<br />

            <label>Administered By (ID):</label>
            {editMode ? (
              <input
                type="number"
                value={editedRecords[index].administered_by || ''}
                onChange={(e) => handleChange(index, 'administered_by', e.target.value)}
              />
            ) : (
              <input type="text" value={record.administered_by || ''} disabled />
            )}<br />

            {editMode && errors[record.immunization_id] && (
              <small style={{ color: 'red' }}>{errors[record.immunization_id]}</small>
            )}
            {editMode && (
              <button className="delete-btn" onClick={() => deleteRecord(record.immunization_id)}>
                Delete
              </button>
            )}
          </div>
        ))
      )}

      {editMode ? (
        <>
          <button className="save-btn" onClick={saveEdits}>Save</button>
          <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
        </>
      ) : (
        <button className="edit-btn" onClick={startEdit}>Edit</button>
      )}
    </div>
  );
};

export default Immunizations;
