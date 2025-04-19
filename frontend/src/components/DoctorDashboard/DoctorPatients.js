import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/DoctorPatients.css';

Modal.setAppElement('#root');

const AssignedPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const [prescriptions, setPrescriptions] = useState([]);
  const [pendingImmunizations, setPendingImmunizations] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAllergy, setSelectedAllergy] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [allergyOptions, setAllergyOptions] = useState([]);

  const [isImmunizationModalOpen, setIsImmunizationModalOpen] = useState(false);
  const [immunizationOptions, setImmunizationOptions] = useState([]);
  const [selectedImmunization, setSelectedImmunization] = useState('');
  const [immunizationDate, setImmunizationDate] = useState(null);

  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [prescriptionName, setPrescriptionName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [refills, setRefills] = useState('');

  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState('');
  const [testDate, setTestDate] = useState(null);

  const [pendingDiagnostics, setPendingDiagnostics] = useState([]);


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
      setPatients(Array.isArray(response.data) ? response.data : [response.data]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch patients.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptions = async (patientId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/employee/patient-prescriptions/${patientId}`);
      setPrescriptions(response.data);
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err);
      setPrescriptions([]);
    }
  };

  const fetchPendingImmunizations = async (patientId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/employee/pending-immunizations/${patientId}`);
      setPendingImmunizations(response.data);
    } catch (err) {
      console.error("Failed to fetch pending immunizations:", err);
      setPendingImmunizations([]);
    }
  };

  const fetchPendingDiagnostics = async (patientId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/employee/pending-diagnostics/${patientId}`);
      setPendingDiagnostics(response.data);
    } catch (err) {
      console.error("Failed to fetch pending diagnostics:", err);
      setPendingDiagnostics([]);
    }
  };
  

  const handleCardClick = async (patientId) => {
    setSelectedPatientId(patientId);
    await fetchPrescriptions(patientId);
    await fetchPendingImmunizations(patientId);
    await fetchPendingDiagnostics(patientId);
  };

  const handleBackClick = () => {
    setSelectedPatientId(null);
    setPrescriptions([]);
    setPendingImmunizations([]);
  };

  const calculateAge = (dob) => {
    if (!dob) return 'Unknown';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Allergy Modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAllergy('');
    setSelectedSeverity('');
  };

  useEffect(() => {
    if (isModalOpen) fetchAllergyOptions();
  }, [isModalOpen]);

  const fetchAllergyOptions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/employee/allergy-names');
      setAllergyOptions(response.data);
    } catch (err) {
      console.error("Failed to fetch allergy options:", err);
    }
  };

  const handleSubmitAllergy = async () => {
    if (!selectedAllergy || !selectedSeverity || !selectedPatientId) {
      alert("Please select both allergy and severity.");
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/employee/add-patient-allergy/${selectedPatientId}`, {
        allergy_name: selectedAllergy,
        severity: selectedSeverity
      });

      alert("Allergy added successfully!");
      closeModal();
      await refreshPatientData();

    } catch (err) {
      console.error("Error adding allergy:", err);
      alert("Failed to add allergy.");
    }
  };

  // Immunization Modal
  const openImmunizationModal = () => {
    setIsImmunizationModalOpen(true);
    fetchImmunizationOptions();
  };

  const closeImmunizationModal = () => {
    setIsImmunizationModalOpen(false);
    setSelectedImmunization('');
    setImmunizationDate(null);
  };
  const openDiagnosticModal = () => setIsDiagnosticModalOpen(true);
  const closeDiagnosticModal = () => {
  setIsDiagnosticModalOpen(false);
  setSelectedTestType('');
  setTestDate(null);
  };

  const refreshPatientData = async () => {
    if (!selectedPatientId) return;
    await fetchPatients();
    await fetchPrescriptions(selectedPatientId);
    await fetchPendingImmunizations(selectedPatientId);
    await fetchPendingDiagnostics(selectedPatientId);
  };
  

  const fetchImmunizationOptions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/employee/immunization-names');
      setImmunizationOptions(response.data);
    } catch (err) {
      console.error("Failed to fetch immunization options:", err);
    }
  };

  const handleSubmitImmunization = async () => {
    if (!selectedImmunization || !immunizationDate || !selectedPatientId) {
      alert("Please select both immunization and date.");
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/employee/add-patient-immunization/${selectedPatientId}`, {
        immunization_name: selectedImmunization,
        immunization_date: immunizationDate,
        doctor_id: employeeId
      });

      alert("Immunization ordered successfully!");
      closeImmunizationModal();
      await refreshPatientData();

    } catch (err) {
      console.error("Error ordering immunization:", err);
      alert("Failed to order immunization.");
    }
  };

  // Prescription Modal
  const openPrescriptionModal = () => setIsPrescriptionModalOpen(true);
  const closePrescriptionModal = () => {
    setIsPrescriptionModalOpen(false);
    setPrescriptionName('');
    setInstructions('');
    setDosage('');
    setFrequency('');
    setRefills('');
  };

  const handleSubmitPrescription = async () => {
    if (!prescriptionName || !instructions || !dosage || !frequency || refills === '') {
      alert("Please fill out all fields.");
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/employee/add-prescription/${selectedPatientId}`, {
        prescription_name: prescriptionName,
        instructions,
        patient_id: selectedPatientId,
        doctor_id: employeeId,
        dosage,
        frequency,
        refills: parseInt(refills, 10)
      });

      alert("Prescription added successfully!");
      closePrescriptionModal();
      await refreshPatientData();

    } catch (err) {
      console.error("Error submitting prescription:", err);
      alert("Failed to add prescription.");
    }
  };
  const handleSubmitDiagnosticTest = async () => {
    if (!selectedTestType || !testDate || !selectedPatientId) {
      alert("Please fill out both fields.");
      return;
    }
  
    try {
      await axios.post(`http://localhost:5000/api/employee/order-diagnostic/${selectedPatientId}`, {
        test_type: selectedTestType,
        test_date: testDate,
        doctor_id: employeeId
      });
  
      alert("Diagnostic test ordered successfully!");
      await refreshPatientData();
      closeDiagnosticModal();

    } catch (err) {
      console.error("Error ordering diagnostic test:", err);
      alert("Failed to order diagnostic test.");
    }
  };
  

  if (loading) return <p className="loading-text">Loading assigned patients...</p>;
  if (error) return <p className="error-text">Error: {error}</p>;

  const filteredPatients = selectedPatientId
    ? patients.filter((p) => p.patient_id === selectedPatientId)
    : patients;

  return (
    <div className="assigned-patients-page">
      <h2 className="page-title">Assigned Patients</h2>

      {selectedPatientId && (
        <button className="back-button" onClick={handleBackClick}>
          ← Back to all patients
        </button>
      )}

      <div className={`patients-container ${selectedPatientId ? 'fade-single' : 'fade-all'}`}>
        {filteredPatients.map((patient) => {
          const isExpanded = selectedPatientId === patient.patient_id;

          return (
            <div
              key={patient.patient_id}
              className={`patient-card ${isExpanded ? 'expanded' : ''}`}
              onClick={() => handleCardClick(patient.patient_id)}
            >
              <h3 className="patient-name">{patient.first_name} {patient.last_name}</h3>

              <div className="patient-details-column">
                <div><strong>Gender:</strong> {patient.sex}</div>
                <div><strong>Age:</strong> {calculateAge(patient.dob)}</div>
                <div><strong>Date of Birth:</strong> {patient.dob?.slice(0, 10)}</div>
                <div><strong>Allergies:</strong> {patient.allergies || 'None'}</div>
                <div><strong>Assignment Date:</strong> {patient.assignment_date?.slice(0, 10)}</div>
              </div>

              {isExpanded && (
              <>
                {prescriptions.length > 0 && (
                  <div className="prescription-table-container">
                    <h4>Prescriptions</h4>
                    <table className="prescription-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Instructions</th>
                          <th>Date Issued</th>
                          <th>Refills</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescriptions.map((rx, index) => (
                          <tr key={index}>
                            <td>{rx.prescription_name}</td>
                            <td>{rx.dosage}</td>
                            <td>{rx.frequency}</td>
                            <td>{rx.instructions}</td>
                            <td>{rx.date_issued?.slice(0, 10)}</td>
                            <td>{rx.refills}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                  {pendingImmunizations.length > 0 && (
                    <div className="pending-immunizations">
                      <h4>Pending Immunizations</h4>
                      <table className="immunization-table">
                        <thead>
                          <tr>
                            <th>Immunization Name</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingImmunizations.map((imm, index) => (
                            <tr key={index}>
                              <td>{imm.immunization_name}</td>
                              <td>{imm.shot_status}</td>
                              <td>{imm.immunization_date?.slice(0, 10) || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {pendingDiagnostics.length > 0 && (
                    <div className="pending-diagnostics-for-doctor-view">
                      <h4>Pending Diagnostic Tests</h4>
                      <table className="diagnostic-table-for-doctor-view">
                        <thead>
                          <tr>
                            <th>Test Type</th>
                            <th>Test Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingDiagnostics.map((test, index) => (
                            <tr key={index}>
                              <td>{test.test_type}</td>
                              <td>{test.test_date?.slice(0, 10) || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}


                <div className="patient-action-buttons">
                  <button className="action-btn" onClick={openModal}>Add Allergies</button>
                  <button className="action-btn" onClick={openImmunizationModal}>Order Immunizations</button>
                  <button className="action-btn" onClick={openPrescriptionModal}>Prescribe</button>
                  <button className="action-btn" onClick={openDiagnosticModal}>Order Diagnostic Test</button>
                </div>
              </>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Allergy Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {}}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={false}
        contentLabel="Add Allergy"
        className="modal"
        overlayClassName="overlay2"
      >
        <h2>Add Allergy</h2>

        <label>
          Allergy:
          <select value={selectedAllergy} onChange={(e) => setSelectedAllergy(e.target.value)}>
            <option value="">-- Select Allergy --</option>
            {allergyOptions.map((allergy, index) => (
              <option key={`${allergy.allergy_name}-${index}`} value={allergy.allergy_name}>
                {allergy.allergy_name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Severity:
          <select value={selectedSeverity} onChange={(e) => setSelectedSeverity(e.target.value)}>
            <option value="">-- Select Severity --</option>
            <option value="Mild">Mild</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
          </select>
        </label>

        <div className="modal-buttons">
          <button onClick={handleSubmitAllergy}>Submit</button>
          <button onClick={closeModal}>Cancel</button>
        </div>
      </Modal>

      {/* Immunization Modal */}
      <Modal
        isOpen={isImmunizationModalOpen}
        onRequestClose={() => {}}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={false}
        contentLabel="Order Immunization"
        className="modal"
        overlayClassName="overlay2"
      >
        <h2>Order Immunization</h2>

        <label>
          Immunization:
          <select value={selectedImmunization} onChange={(e) => setSelectedImmunization(e.target.value)}>
            <option value="">-- Select Immunization --</option>
            {immunizationOptions.map((item, index) => (
              <option key={`${item.immunization_name}-${index}`} value={item.immunization_name}>
                {item.immunization_name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Date:
          <DatePicker
            selected={immunizationDate}
            onChange={(date) => setImmunizationDate(date)}
            minDate={new Date()}
            placeholderText="Select a date"
          />
        </label>

        <div className="modal-buttons">
          <button onClick={handleSubmitImmunization}>Submit</button>
          <button onClick={closeImmunizationModal}>Cancel</button>
        </div>
      </Modal>

      {/* Prescription Modal */}
      <Modal
        isOpen={isPrescriptionModalOpen}
        onRequestClose={() => {}}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={false}
        contentLabel="Prescribe Medication"
        className="modal"
        overlayClassName="overlay2"
      >
        <h2>Prescribe Medication</h2>

        <label>
          Prescription Name:
          <input
            type="text"
            maxLength="100"
            value={prescriptionName}
            onChange={(e) => setPrescriptionName(e.target.value)}
          />
        </label>

        <label>
          Instructions:
          <textarea
            rows="3"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </label>

        <label>
          Dosage:
          <input
            type="text"
            maxLength="50"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
          />
        </label>

        <label>
          Frequency:
          <input
            type="text"
            maxLength="50"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          />
        </label>

        <label>
          Refills:
          <input
            type="number"
            min="0"
            value={refills}
            onChange={(e) => setRefills(e.target.value)}
          />
        </label>

        <div className="modal-buttons">
          <button onClick={handleSubmitPrescription}>Submit</button>
          <button onClick={closePrescriptionModal}>Cancel</button>
        </div>
      </Modal>
      <Modal
          isOpen={isDiagnosticModalOpen}
          onRequestClose={() => {}}
          shouldCloseOnOverlayClick={false}
          shouldCloseOnEsc={false}
          contentLabel="Order Diagnostic Test"
          className="modal"
          overlayClassName="overlay2"
        >
          <h2>Order Diagnostic Test</h2>

          <label>
            Test Type:
            <select value={selectedTestType} onChange={(e) => setSelectedTestType(e.target.value)}>
              <option value="">-- Select Test --</option>
              <option value="Biopsy">Biopsy</option>
              <option value="CT_Scan">CT Scan</option>
              <option value="Colonoscopy">Colonoscopy</option>
              <option value="Eye Exam">Eye Exam</option>
              <option value="X-Ray">X-Ray</option>
            </select>
          </label>

          <label>
            Test Date:
            <DatePicker
              selected={testDate}
              onChange={(date) => setTestDate(date)}
              minDate={new Date()}
              placeholderText="Select a date"
            />
          </label>

          <div className="modal-buttons">
            <button onClick={handleSubmitDiagnosticTest}>Submit</button>
            <button onClick={closeDiagnosticModal}>Cancel</button>
          </div>
        </Modal>

    </div>
  );
};

export default AssignedPatientsPage;
