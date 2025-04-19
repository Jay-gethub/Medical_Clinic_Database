// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const HealthHistory = ({ patientId, patientName }) => {
//   // ALLERGY STATES
//   const [allergyList, setAllergyList] = useState([]);
//   const [patientAllergies, setPatientAllergies] = useState([]);
//   const [allergyForm, setAllergyForm] = useState({ allergy_name: '', severity: '' });
//   const [editAllergyId, setEditAllergyId] = useState(null);

//   // MEDICATION STATES
//   const [medications, setMedications] = useState([]);
//   const [medForm, setMedForm] = useState({ name: '', dosage: '' });
//   const [editMedId, setEditMedId] = useState(null);

//   // FAMILY HISTORY STATES
//   const [familyHistories, setFamilyHistories] = useState([]);
//   const [familyForm, setFamilyForm] = useState({ condition_name: '', relationship: '', comments: '' });
//   const [editFamilyId, setEditFamilyId] = useState(null);
//   const predefinedConditions = ["Diabetes", "Cancer", "Hypertension", "Heart Disease", "Mental Illness"];
//   const relationships = ["Father", "Mother", "Sibling", "Grandparent", "Aunt", "Uncle", "Cousin"];

//   useEffect(() => {
//     fetchAllergyNames();
//     fetchPatientAllergies();
//     fetchMedications();
//     fetchFamilyHistory();
//   }, [patientId]);

//   // --- ALLERGY LOGIC ---
//   const fetchAllergyNames = async () => {
//     const res = await axios.get(`http://localhost:5000/api/patient/allergies/names`);
//     setAllergyList(res.data.map(a => a.allergy_name));
//   };

//   const fetchPatientAllergies = async () => {
//     const res = await axios.get(`http://localhost:5000/api/patient/allergies/${patientId}`);
//     setPatientAllergies(res.data);
//   };

//   const handleAllergyEdit = (a) => {
//     setEditAllergyId(a.allergy_id);
//     setAllergyForm({ allergy_name: a.allergy_name, severity: a.severity });
//   };

//   const handleAllergySubmit = async () => {
//     if (!allergyForm.allergy_name || !allergyForm.severity) return;

//     if (editAllergyId) {
//       await axios.put(`http://localhost:5000/api/patient/allergies/${patientId}/${editAllergyId}`, allergyForm);
//     } else {
//       await axios.post(`http://localhost:5000/api/patient/allergies/${patientId}`, allergyForm);
//     }

//     setAllergyForm({ allergy_name: '', severity: '' });
//     setEditAllergyId(null);
//     fetchPatientAllergies();
//   };

//   const handleAllergyDelete = async (id) => {
//     await axios.delete(`http://localhost:5000/api/patient/allergies/${patientId}/${id}`);
//     fetchPatientAllergies();
//   };

//   // --- MEDICATION LOGIC ---
//   const fetchMedications = async () => {
//     const res = await axios.get(`http://localhost:5000/api/patient/self-medications/${patientId}`);
//     setMedications(res.data || []);
//   };

//   const handleMedEdit = (med) => {
//     setEditMedId(med.medication_id);
//     setMedForm({ name: med.name, dosage: med.dosage || '' });
//   };

//   const saveMedication = async () => {
//     if (!medForm.name) return;
//     if (editMedId) {
//       await axios.put(`http://localhost:5000/api/patient/self-medications/${editMedId}`, medForm);
//     } else {
//       await axios.post(`http://localhost:5000/api/patient/self-medications`, { ...medForm, patient_id: patientId });
//     }

//     setMedForm({ name: '', dosage: '' });
//     setEditMedId(null);
//     fetchMedications();
//   };

//   const deleteMedication = async (id) => {
//     await axios.delete(`http://localhost:5000/api/patient/self-medications/${id}`);
//     fetchMedications();
//   };

//   // --- FAMILY HISTORY LOGIC ---
//   const fetchFamilyHistory = async () => {
//     const res = await axios.get(`http://localhost:5000/api/patient/family-history/${patientId}`);
//     setFamilyHistories(res.data);
//   };

//   const handleFamilyEdit = (item) => {
//     setEditFamilyId(item.fh_id);
//     setFamilyForm({
//       condition_name: item.condition_name,
//       relationship: item.relationship,
//       comments: item.comments || ''
//     });
//   };

//   const saveFamilyHistory = async () => {
//     if (!familyForm.condition_name || !familyForm.relationship) return;

//     if (editFamilyId) {
//       await axios.put(`http://localhost:5000/api/patient/family-history/${editFamilyId}`, familyForm);
//     } else {
//       await axios.post(`http://localhost:5000/api/patient/family-history`, {
//         ...familyForm,
//         patient_id: patientId
//       });
//     }

//     setFamilyForm({ condition_name: '', relationship: '', comments: '' });
//     setEditFamilyId(null);
//     fetchFamilyHistory();
//   };

//   const deleteFamilyHistory = async (fh_id) => {
//     await axios.delete(`http://localhost:5000/api/patient/family-history/${fh_id}`);
//     fetchFamilyHistory();
//   };

//   return (
//     <div className="health-history-container">
//       <h1>Health History for {patientName || "Patient"}</h1>

//       {/* Allergy Section */}
//       <h2>Allergies</h2>
//       <table className="health-table">
//         <thead>
//           <tr>
//             <th>Allergy</th>
//             <th>Severity</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {patientAllergies.length === 0 ? (
//             <tr><td colSpan="3">No allergies recorded.</td></tr>
//           ) : patientAllergies.map(a => (
//             <tr key={a.allergy_id}>
//               <td>{a.allergy_name}</td>
//               <td>{a.severity}</td>
//               <td>
//                 <button onClick={() => handleAllergyEdit(a)}>Edit</button>
//                 <button onClick={() => handleAllergyDelete(a.allergy_id)}>Delete</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <div>
//         <select name="allergy_name" value={allergyForm.allergy_name} onChange={(e) => setAllergyForm({ ...allergyForm, allergy_name: e.target.value })}>
//           <option value="">Select Allergy</option>
//           {allergyList.map((a, i) => <option key={i} value={a}>{a}</option>)}
//         </select>
//         <select name="severity" value={allergyForm.severity} onChange={(e) => setAllergyForm({ ...allergyForm, severity: e.target.value })}>
//           <option value="">Select Severity</option>
//           <option value="Mild">Mild</option>
//           <option value="Moderate">Moderate</option>
//           <option value="Severe">Severe</option>
//         </select>
//         <button onClick={handleAllergySubmit}>{editAllergyId ? "Update" : "Add"}</button>
//       </div>

//       {/* Medication Section */}
//       <h2>Medications</h2>
//       <table className="health-table">
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Dosage</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {medications.length === 0 ? (
//             <tr><td colSpan="3">No medications reported.</td></tr>
//           ) : medications.map(m => (
//             <tr key={m.medication_id}>
//               <td>{m.name}</td>
//               <td>{m.dosage}</td>
//               <td>
//                 <button onClick={() => handleMedEdit(m)}>Edit</button>
//                 <button onClick={() => deleteMedication(m.medication_id)}>Delete</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <div>
//         <input placeholder="Medication Name" value={medForm.name} onChange={(e) => setMedForm({ ...medForm, name: e.target.value })} />
//         <input placeholder="Dosage" value={medForm.dosage} onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })} />
//         <button onClick={saveMedication}>{editMedId ? "Update" : "Add"}</button>
//       </div>

//       {/* Family History Section */}
//       <h2>Family History</h2>
//       <table className="health-table">
//         <thead>
//           <tr>
//             <th>Condition</th>
//             <th>Relationship</th>
//             <th>Comments</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {familyHistories.length === 0 ? (
//             <tr><td colSpan="4">No family history recorded.</td></tr>
//           ) : familyHistories.map(fh => (
//             <tr key={fh.fh_id}>
//               <td>{fh.condition_name}</td>
//               <td>{fh.relationship}</td>
//               <td>{fh.comments}</td>
//               <td>
//                 <button onClick={() => handleFamilyEdit(fh)}>Edit</button>
//                 <button onClick={() => deleteFamilyHistory(fh.fh_id)}>Delete</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <div>
//         <select value={familyForm.condition_name} onChange={(e) => setFamilyForm({ ...familyForm, condition_name: e.target.value })}>
//           <option value="">Select Condition</option>
//           {predefinedConditions.map((c, i) => <option key={i} value={c}>{c}</option>)}
//         </select>
//         <select value={familyForm.relationship} onChange={(e) => setFamilyForm({ ...familyForm, relationship: e.target.value })}>
//           <option value="">Select Relationship</option>
//           {relationships.map((r, i) => <option key={i} value={r}>{r}</option>)}
//         </select>
//         <input placeholder="Comments" value={familyForm.comments} onChange={(e) => setFamilyForm({ ...familyForm, comments: e.target.value })} />
//         <button onClick={saveFamilyHistory}>{editFamilyId ? "Update" : "Add"}</button>
//       </div>
//     </div>
//   );
// };

// export default HealthHistory;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/HealthHistory.css';

const HealthHistory = ({ patientId, patientName }) => {
  // Allergy state
  const [allergyList, setAllergyList] = useState([]);
  const [patientAllergies, setPatientAllergies] = useState([]);
  const [allergyForm, setAllergyForm] = useState({ allergy_name: '', severity: '' });
  const [editAllergyId, setEditAllergyId] = useState(null);

  // Medication state
  const [medications, setMedications] = useState([]);
  const [medForm, setMedForm] = useState({ name: '', dosage: '' });
  const [editMedId, setEditMedId] = useState(null);

  // Family history state
  const [familyHistories, setFamilyHistories] = useState([]);
  const [familyForm, setFamilyForm] = useState({ condition_name: '', relationship: '', comments: '' });
  const [editFamilyId, setEditFamilyId] = useState(null);

  const conditionOptions = ["Diabetes", "Cancer", "Heart Disease", "Depression", "Mental Illness"];
  const relationshipOptions = ["Father", "Mother", "Sibling", "Grandparent", "Uncle", "Aunt", "Cousin"];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchAllergyNames();
    fetchPatientAllergies();
    fetchMedications();
    fetchFamilyHistory();
  }, [patientId]);

  // Allergy logic
  const fetchAllergyNames = async () => {
    const res = await axios.get(`http://localhost:5000/api/patient/allergies/names`);
    setAllergyList(res.data.map(a => a.allergy_name));
  };

  const fetchPatientAllergies = async () => {
    const res = await axios.get(`http://localhost:5000/api/patient/allergies/${patientId}`);
    setPatientAllergies(res.data);
  };

  const handleAllergySubmit = async () => {
    if (!allergyForm.allergy_name || !allergyForm.severity) return;
    if (editAllergyId) {
      await axios.put(`http://localhost:5000/api/patient/allergies/${patientId}/${editAllergyId}`, allergyForm);
    } else {
      await axios.post(`http://localhost:5000/api/patient/allergies/${patientId}`, allergyForm);
    }
    setAllergyForm({ allergy_name: '', severity: '' });
    setEditAllergyId(null);
    fetchPatientAllergies();
  };

  const handleAllergyEdit = (a) => {
    setEditAllergyId(a.allergy_id);
    setAllergyForm({ allergy_name: a.allergy_name, severity: a.severity });
  };

  const handleAllergyDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/patient/allergies/${patientId}/${id}`);
    fetchPatientAllergies();
  };

  // Medication logic
  const fetchMedications = async () => {
    const res = await axios.get(`http://localhost:5000/api/patient/self-medications/${patientId}`);
    setMedications(res.data);
  };

  const handleMedEdit = (m) => {
    setEditMedId(m.medication_id);
    setMedForm({ name: m.name, dosage: m.dosage });
  };

  const handleMedSubmit = async () => {
    if (!medForm.name) return;
    if (editMedId) {
      await axios.put(`http://localhost:5000/api/patient/self-medications/${editMedId}`, medForm);
    } else {
      await axios.post(`http://localhost:5000/api/patient/self-medications`, { ...medForm, patient_id: patientId });
    }
    setMedForm({ name: '', dosage: '' });
    setEditMedId(null);
    fetchMedications();
  };

  const handleMedDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/patient/self-medications/${id}`);
    fetchMedications();
  };

  // Family history logic
  const fetchFamilyHistory = async () => {
    const res = await axios.get(`http://localhost:5000/api/patient/family-history/${patientId}`);
    setFamilyHistories(res.data);
  };

  const handleFamilyEdit = (item) => {
    setEditFamilyId(item.fh_id);
    setFamilyForm({ condition_name: item.condition_name, relationship: item.relationship, comments: item.comments });
  };

  const handleFamilySubmit = async () => {
    if (!familyForm.condition_name || !familyForm.relationship) return;
    if (editFamilyId) {
      await axios.put(`http://localhost:5000/api/patient/family-history/${editFamilyId}`, familyForm);
    } else {
      await axios.post(`http://localhost:5000/api/patient/family-history`, { ...familyForm, patient_id: patientId });
    }
    setFamilyForm({ condition_name: '', relationship: '', comments: '' });
    setEditFamilyId(null);
    fetchFamilyHistory();
  };

  const handleFamilyDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/patient/family-history/${id}`);
    fetchFamilyHistory();
  };

  return (
    <div className="health-history-container">
      <h2>Health History for {patientName || 'Patient'}</h2>

      {/* Allergies */}
      <div className="section-box">
        <h3>Allergies</h3>
        <table>
          <thead><tr><th>Allergy</th><th>Severity</th><th>Actions</th></tr></thead>
          <tbody>
            {patientAllergies.length === 0 ? (
              <tr><td colSpan="3">No allergies recorded.</td></tr>
            ) : (
              patientAllergies.map((a) => (
                <tr key={a.allergy_id}>
                  <td>{a.allergy_name}</td>
                  <td>{a.severity}</td>
                  <td>
                    <button onClick={() => handleAllergyEdit(a)} className="edit-btn">Edit</button>
                    <button onClick={() => handleAllergyDelete(a.allergy_id)} className="delete-btn">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="input-row">
          <select value={allergyForm.allergy_name} onChange={(e) => setAllergyForm({ ...allergyForm, allergy_name: e.target.value })}>
            <option value="">Select Allergy</option>
            {allergyList.map((a, i) => <option key={i} value={a}>{a}</option>)}
          </select>
          <select value={allergyForm.severity} onChange={(e) => setAllergyForm({ ...allergyForm, severity: e.target.value })}>
            <option value="">Select Severity</option>
            <option>Mild</option><option>Moderate</option><option>Severe</option>
          </select>
          <button onClick={handleAllergySubmit} className="save-btn">{editAllergyId ? "Update" : "Add"}</button>
        </div>
      </div>

      {/* Medications */}
      <div className="section-box">
        <h3>Medications</h3>
        <table>
          <thead><tr><th>Name</th><th>Dosage</th><th>Actions</th></tr></thead>
          <tbody>
            {medications.length === 0 ? (
              <tr><td colSpan="3">No medications reported.</td></tr>
            ) : (
              medications.map((m) => (
                <tr key={m.medication_id}>
                  <td>{m.name}</td>
                  <td>{m.dosage}</td>
                  <td>
                    <button onClick={() => handleMedEdit(m)} className="edit-btn">Edit</button>
                    <button onClick={() => handleMedDelete(m.medication_id)} className="delete-btn">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="input-row">
          <input placeholder="Medication Name" value={medForm.name} onChange={(e) => setMedForm({ ...medForm, name: e.target.value })} />
          <input placeholder="Dosage" value={medForm.dosage} onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })} />
          <button onClick={handleMedSubmit} className="save-btn">{editMedId ? "Update" : "Add"}</button>
        </div>
      </div>

      {/* Family History */}
      <div className="section-box">
        <h3>Family History</h3>
        <table>
          <thead><tr><th>Condition</th><th>Relationship</th><th>Comments</th><th>Actions</th></tr></thead>
          <tbody>
            {familyHistories.length === 0 ? (
              <tr><td colSpan="4">No family history recorded.</td></tr>
            ) : (
              familyHistories.map((fh) => (
                <tr key={fh.fh_id}>
                  <td>{fh.condition_name}</td>
                  <td>{fh.relationship}</td>
                  <td>{fh.comments}</td>
                  <td>
                    <button onClick={() => handleFamilyEdit(fh)} className="edit-btn">Edit</button>
                    <button onClick={() => handleFamilyDelete(fh.fh_id)} className="delete-btn">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="input-row">
          <select value={familyForm.condition_name} onChange={(e) => setFamilyForm({ ...familyForm, condition_name: e.target.value })}>
            <option value="">Select Condition</option>
            {conditionOptions.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
          <select value={familyForm.relationship} onChange={(e) => setFamilyForm({ ...familyForm, relationship: e.target.value })}>
            <option value="">Select Relationship</option>
            {relationshipOptions.map((r, i) => <option key={i} value={r}>{r}</option>)}
          </select>
          <input placeholder="Comments" value={familyForm.comments} onChange={(e) => setFamilyForm({ ...familyForm, comments: e.target.value })} />
          <button onClick={handleFamilySubmit} className="save-btn">{editFamilyId ? "Update" : "Add"}</button>
        </div>
      </div>
    </div>
  );
};

export default HealthHistory;
