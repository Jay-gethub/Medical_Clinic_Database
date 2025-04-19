import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/MedicalRecords.css';

const MedicalRecords = ({patientId}) => {
  const [medicalRecords, setMedicalRecords] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({
    patientInfo: false,
    allergies: false,
    immunizations: false,
    prescriptions: false,
    diagnostics: false,
    selfMedications: false,
    familyHistory: false
  });

  //const patientId = JSON.parse(localStorage.getItem('user'))?.patient_id;

  useEffect(() => {
    if (!patientId) return;

    axios
      .get(`http://localhost:5000/api/employee/patient-medical-history/${patientId}`)
      .then((res) => setMedicalHistory(res.data))
      .catch((err) => {
        console.error('Error fetching medical history:', err);
        setMedicalHistory(null);
      });

    axios
      .get(`http://localhost:5000/api/employee/patient-medical-record/${patientId}`)
      .then((res) => setMedicalRecords(res.data))
      .catch((err) => {
        console.error('Error fetching medical records:', err);
        setMedicalRecords(null);
      });
  }, [patientId]);

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="medical-records-page">
      <h2>Your Medical Records</h2>

      {medicalRecords && (
        <div className="medical-records">
          {/* Patient Info */}
          <div className="section">
            <button onClick={() => toggleSection('patientInfo')}>
              Patient Information
            </button>
            {!collapsedSections.patientInfo && (
              <table>
                <tbody>
                  <tr><td><strong>Name:</strong></td><td>{medicalRecords.basicInfo.first_name} {medicalRecords.basicInfo.last_name}</td></tr>
                  <tr><td><strong>Gender:</strong></td><td>{medicalRecords.basicInfo.sex}</td></tr>
                  <tr><td><strong>Date of Birth:</strong></td><td>{new Date(medicalRecords.basicInfo.dob).toLocaleDateString()}</td></tr>
                </tbody>
              </table>
            )}
          </div>

          {/* Allergies */}
          <div className="section">
            <button onClick={() => toggleSection('allergies')}>
              Allergies
            </button>
            {!collapsedSections.allergies && (
              medicalRecords.allergies.length ? (
                <table>
                  <thead>
                    <tr><th>Allergy</th><th>Severity</th><th>Date Recorded</th></tr>
                  </thead>
                  <tbody>
                    {medicalRecords.allergies.map((a, i) => (
                      <tr key={i}>
                        <td>{a.allergy_name}</td>
                        <td>{a.severity}</td>
                        <td>{new Date(a.date_recorded).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p>No allergies recorded.</p>
            )}
          </div>

          {/* Self-Reported Medications */}
          {/* {medicalHistory && (
            <div className="section">
              <button onClick={() => toggleSection('selfMedications')}>
                Self-Reported Medications
              </button>
              {!collapsedSections.selfMedications && (
                medicalHistory.self_medications.length ? (
                  <table>
                    <thead>
                      <tr><th>Name</th><th>Dosage</th></tr>
                    </thead>
                    <tbody>
                      {medicalHistory.self_medications.map((m, i) => (
                        <tr key={i}>
                          <td>{m.name}</td>
                          <td>{m.dosage || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p>No self-reported medications.</p>
              )}
            </div>
          )} */}

          {/* Family History */}
          {/* {medicalHistory && (
            <div className="section">
              <button onClick={() => toggleSection('familyHistory')}>
                Family History
              </button>
              {!collapsedSections.familyHistory && (
                medicalHistory.family_history.length ? (
                  <table>
                    <thead>
                      <tr><th>Condition</th><th>Relationship</th><th>Comments</th></tr>
                    </thead>
                    <tbody>
                      {medicalHistory.family_history.map((fh, i) => (
                        <tr key={i}>
                          <td>{fh.condition_name}</td>
                          <td>{fh.relationship || '—'}</td>
                          <td>{fh.comments || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p>No family history reported.</p>
              )}
            </div>
          )} */}

          {/* Immunizations */}
          <div className="section">
            <button onClick={() => toggleSection('immunizations')}>
              Immunizations
            </button>
            {!collapsedSections.immunizations && (
              medicalRecords.immunizations.length ? (
                <table>
                  <thead>
                    <tr><th>Immunization</th><th>Date</th><th>Administered By</th></tr>
                  </thead>
                  <tbody>
                    {medicalRecords.immunizations.map((imm, i) => (
                      <tr key={i}>
                        <td>{imm.immunization_name}</td>
                        <td>{new Date(imm.immunization_date).toLocaleDateString()}</td>
                        <td>{imm.administered_by_first_name} {imm.administered_by_last_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p>No immunizations recorded.</p>
            )}
          </div>

          {/* Prescriptions */}
          <div className="section">
            <button onClick={() => toggleSection('prescriptions')}>
              Prescriptions
            </button>
            {!collapsedSections.prescriptions && (
              medicalRecords.prescriptions.length ? (
                <table>
                  <thead>
                    <tr><th>Prescription</th><th>Dosage</th></tr>
                  </thead>
                  <tbody>
                    {medicalRecords.prescriptions.map((p, i) => (
                      <tr key={i}>
                        <td>{p.prescription_name}</td>
                        <td>{p.dosage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p>No prescriptions recorded.</p>
            )}
          </div>

          {/* Diagnostics */}
          <div className="section">
            <button onClick={() => toggleSection('diagnostics')}>
              Diagnostics
            </button>
            {!collapsedSections.diagnostics && (
              medicalRecords.diagnostics.length ? (
                <table>
                  <thead>
                    <tr><th>Test</th><th>Date</th><th>Results</th><th>Doctor</th></tr>
                  </thead>
                  <tbody>
                    {medicalRecords.diagnostics.map((d, i) => (
                      <tr key={i}>
                        <td>{d.test_type}</td>
                        <td>{new Date(d.test_date).toLocaleDateString()}</td>
                        <td>{d.results}</td>
                        <td>{d.doctor_first_name} {d.doctor_last_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <p>No diagnostics found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
