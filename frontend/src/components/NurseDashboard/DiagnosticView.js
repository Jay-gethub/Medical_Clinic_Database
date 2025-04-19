import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/NurseDiagnostics.css';

const DiagnosticsViewPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [allPatients, setAllPatients] = useState([]);
  const [matchingPatients, setMatchingPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [pendingDiagnostics, setPendingDiagnostics] = useState([]);
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState({ show: false, diagnostic: null });
  const [resultInput, setResultInput] = useState('');


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

    if (matches.length === 0) setError('No patients found matching your input.');

    setMatchingPatients(matches);
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setPendingDiagnostics([]);
    setError('');

    axios.get(`http://localhost:5000/api/employee/pending-diagnostics/${patient.patient_id}`)
      .then(res => {
        setPendingDiagnostics(res.data);
        if (res.data.length === 0) setError('No pending diagnostics for this patient.');
      })
      .catch(err => {
        console.error('Error fetching diagnostics:', err);
        setError('Failed to load diagnostics.');
      });
  };

  const resetView = () => {
    setSearchInput('');
    setMatchingPatients([]);
    setSelectedPatient(null);
    setPendingDiagnostics([]);
    setError('');
  };

  const pastAndCurrent = pendingDiagnostics.filter(d => {
    const testDate = d.test_date ? new Date(d.test_date) : null;
    return !testDate || testDate <= today;
  });

  const upcoming = pendingDiagnostics.filter(d => {
    const testDate = d.test_date ? new Date(d.test_date) : null;
    return testDate && testDate > today;
  });

  const confirmMarkAsCompleted = (diagnostic) => {
    setResultInput('');
    setConfirmModal({ show: true, diagnostic });
  };
  
  const handleConfirm = () => {
    const { diagnostic } = confirmModal;
  
    if (!resultInput.trim()) {
      setError('Results field cannot be empty.');
      return;
    }
  
    axios.post(`http://localhost:5000/api/employee/mark-diagnostic-complete`, {
      patient_id: selectedPatient.patient_id,
      test_type: diagnostic.test_type,
      test_date: diagnostic.test_date,
      test_id: diagnostic.test_id,
      results_: resultInput
    }).then(() => {
      setPendingDiagnostics(prev => prev.filter(item => item !== diagnostic));
      setConfirmModal({ show: false, diagnostic: null });
      setResultInput('');
    }).catch(err => {
      console.error('Error marking diagnostic as completed:', err);
      setError('Failed to mark diagnostic as completed.');
      setConfirmModal({ show: false, diagnostic: null });
    });
  };
  

  return (
    <div className="diagnostics-view-page">
      <h2>View Patient Diagnostics</h2>

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
          <h2>Pending Diagnostics for {selectedPatient.first_name} {selectedPatient.last_name}</h2>

          {error && <p className="error-text">{error}</p>}

          {pastAndCurrent.length > 0 && (
            <>
              <h4>Past & Current</h4>
              <table className="diagnostics-table">
                <thead>
                  <tr>
                    <th>Test Type</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pastAndCurrent.map((d, idx) => (
                    <tr key={idx}>
                      <td>{d.test_type}</td>
                      <td>{d.test_status}</td>
                      <td>{d.test_date?.slice(0, 10) || 'N/A'}</td>
                      <td>
                        <button onClick={() => confirmMarkAsCompleted(d)}>
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
              <table className="diagnostics-table">
                <thead>
                  <tr>
                    <th>Test Type</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((d, idx) => (
                    <tr key={idx}>
                      <td>{d.test_type}</td>
                      <td>{d.test_status}</td>
                      <td>{d.test_date?.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

{confirmModal.show && (
  <div className="modal-overlay-for-shots">
    <div className="modal-content-for-shots">
      <p>
        Are you sure you want to mark <strong>{confirmModal.diagnostic.test_type}</strong> on{' '}
        <strong>{confirmModal.diagnostic.test_date?.slice(0, 10)}</strong> as completed?
      </p>

      <div className="form-group">
        <label htmlFor="results">Enter Results:</label>
        <textarea
          id="results"
          value={resultInput}
          onChange={(e) => setResultInput(e.target.value)}
          rows={4}
          style={{ width: '100%', padding: '8px', marginTop: '8px' }}
          required
        />
      </div>

      <div className="modal-actions-for-shots">
        <button onClick={handleConfirm}>Yes, Confirm</button>
        <button onClick={() => setConfirmModal({ show: false, diagnostic: null })}>Cancel</button>
      </div>
    </div>
  </div>
)}

        </div>
      )}
    </div>
  );
};

export default DiagnosticsViewPage;
