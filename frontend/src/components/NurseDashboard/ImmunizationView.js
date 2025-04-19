import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/ImmunizationView.css';

const ImmunizationViewPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [allPatients, setAllPatients] = useState([]);
  const [matchingPatients, setMatchingPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [pendingImmunizations, setPendingImmunizations] = useState([]);
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState({ show: false, immunization: null });

  const today = new Date();

  useEffect(() => {
    axios.get('http://localhost:5000/api/employee/all-patients')
      .then(res => setAllPatients(res.data))
      .catch(err => {
        console.error('Error fetching patients:', err);
        setError('Failed to fetch patients.');
      });
  }, []);

  const handleSearch = () => {
    setError('');
    const input = searchInput.trim().toLowerCase();
    if (!input) return setMatchingPatients([]);

    const matches = allPatients.filter(p =>
      p.patient_id.toString() === input ||
      (p.first_name && p.last_name &&
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(input))
    );

    if (matches.length === 0) {
      setError('No patients found matching your input.');
    }

    setMatchingPatients(matches);
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setPendingImmunizations([]);
    setError('');

    axios.get(`http://localhost:5000/api/employee/pending-immunizations/${patient.patient_id}`)
      .then(res => {
        setPendingImmunizations(res.data);
        if (res.data.length === 0) setError('No pending immunizations for this patient.');
      })
      .catch(err => {
        console.error('Error fetching immunizations:', err);
        setError('Failed to load immunizations.');
      });
  };

  const resetView = () => {
    setSearchInput('');
    setMatchingPatients([]);
    setSelectedPatient(null);
    setPendingImmunizations([]);
    setError('');
  };

  const pastAndCurrent = pendingImmunizations.filter(imm => {
    const immDate = imm.immunization_date ? new Date(imm.immunization_date) : null;
    return !immDate || immDate <= today;
  });

  const upcoming = pendingImmunizations.filter(imm => {
    const immDate = imm.immunization_date ? new Date(imm.immunization_date) : null;
    return immDate && immDate > today;
  });

  const confirmMarkAsCompleted = (immunization) => {
    setConfirmModal({ show: true, immunization });
  };

  const handleConfirm = () => {
    const { immunization } = confirmModal;

    // Adjust your API endpoint and payload accordingly
    axios.post(`http://localhost:5000/api/employee/mark-immunization-complete`, {
      patient_id: selectedPatient.patient_id,
      immunization_name: immunization.immunization_name,
      immunization_date: immunization.immunization_date
    }).then(() => {
      // Remove completed immunization from list
      setPendingImmunizations(prev =>
        prev.filter(item => item !== immunization)
      );
      setConfirmModal({ show: false, immunization: null });
    }).catch(err => {
      console.error('Error marking immunization as completed:', err);
      setError('Failed to mark immunization as completed.');
      setConfirmModal({ show: false, immunization: null });
    });
  };

  return (
    <div className="immunization-view-page">
      <h2>View Patient Immunizations</h2>

      {!selectedPatient ? (
        <div className="search-section">
          <input
            type="text"
            placeholder="Enter Patient ID or Full Name"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>

          {error && <p className="error-text">{error}</p>}

          {matchingPatients.length > 0 && (
            <div className="results-list">
              <h4>Select a Patient:</h4>
              <ul>
                {matchingPatients.map((p) => (
                  <li key={p.patient_id}>
                    <button onClick={() => handleSelectPatient(p)}>
                      {p.first_name} {p.last_name} (ID: {p.patient_id})
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="results-section">
          <button className="back-btn" onClick={resetView}>← Back to Search</button>
          <h2>Pending Immunizations for {selectedPatient.first_name} {selectedPatient.last_name}</h2>

          {error && <p className="error-text">{error}</p>}

          {pastAndCurrent.length > 0 && (
            <>
              <h4>Past & Current</h4>
              <table className="immunization-table">
                <thead>
                  <tr>
                    <th>Immunization</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pastAndCurrent.map((imm, idx) => (
                    <tr key={idx}>
                      <td>{imm.immunization_name}</td>
                      <td>{imm.shot_status}</td>
                      <td>{imm.immunization_date?.slice(0, 10) || 'N/A'}</td>
                      <td>
                        <button onClick={() => confirmMarkAsCompleted(imm)}>
                          Mark as Completed
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {upcoming.length > 0 && (
            <>
              <h4>Upcoming</h4>
              <table className="immunization-table">
                <thead>
                  <tr>
                    <th>Immunization</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((imm, idx) => (
                    <tr key={idx}>
                      <td>{imm.immunization_name}</td>
                      <td>{imm.shot_status}</td>
                      <td>{imm.immunization_date?.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Modal Confirmation */}
          {confirmModal.show && (
            <div className="modal-overlay">
              <div className="modal-content">
                <p>
                  Are you sure you want to mark <strong>{confirmModal.immunization.immunization_name}</strong> on{' '}
                  <strong>{confirmModal.immunization.immunization_date?.slice(0, 10)}</strong> as completed?
                </p>
                <div className="modal-actions">
                  <button onClick={handleConfirm}>Yes, Confirm</button>
                  <button onClick={() => setConfirmModal({ show: false, immunization: null })}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImmunizationViewPage;
