import React, { useEffect, useState } from 'react';
import axios from 'axios';


const ClinicSelector = ({ onClinicSelect }) => {
  const [clinics, setClinics] = useState([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/clinics');
        setClinics(res.data);
      } catch (err) {
        console.error("Failed to fetch clinics:", err);
      }
    };

    fetchClinics();
  }, []);

  const handleChange = (e) => {
    const clinicId = e.target.value;
    setSelected(clinicId);
    onClinicSelect(clinicId);
  };

  return (
    <div className="clinic-selector">
      <label>Select Clinic Location:</label>
      <select value={selected} onChange={handleChange}>
        <option value="">-- Choose a Clinic --</option>
        {clinics.map((clinic) => (
          <option key={clinic.clinic_id} value={clinic.clinic_id}>
            {clinic.clinic_name} ({clinic.city}, {clinic.state})
          </option>
        ))}
      </select>
    </div>
  );
};

export default ClinicSelector;
