// DoctorSelector.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DoctorSelector = ({ clinicId, onDoctorSelect }) => {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null); // Track selected doctor
  const [gender, setGender] = useState('');
  const [department, setDepartment] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/appointments/doctors/by-clinic/${clinicId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        console.log('Fetched doctors:', res.data);
        setDoctors(res.data);
        setFiltered(res.data);
        setSelectedDoctorId(null);   
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      }
    };

    if (clinicId) fetchDoctors();
  }, [clinicId]);

  useEffect(() => {
    let result = [...doctors];
    if (gender) result = result.filter((doc) => doc.sex === gender);
    if (department) result = result.filter((doc) => doc.department_name === department);
    setFiltered(result);
  }, [gender, department]);

  const handleDoctorClick = (id) => {
    setSelectedDoctorId(id);
    onDoctorSelect(id);
  };

  return (
    <div className="doctor-selector">
      <h4>Choose a Doctor</h4>

      <div className="filters" style={{ marginBottom: '10px' }}>
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">All Departments</option>
          {[...new Set(doctors.map((d) => d.department_name))].map((dep) => (
            <option key={dep} value={dep}>
              {dep}
            </option>
          ))}
        </select>
      </div>

      <ul className="doctor-list" style={{ listStyleType: 'none', padding: 0 }}>
        {filtered.map((doc) => (
          <li
            key={doc.employee_id}
            onClick={() => handleDoctorClick(doc.employee_id)}
            style={{
              backgroundColor: doc.employee_id === selectedDoctorId ? '#007BFF' : '#f5f5f5',
              color: doc.employee_id === selectedDoctorId ? '#fff' : '#000',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '6px',
              cursor: 'pointer',
              border: doc.employee_id === selectedDoctorId ? '2px solid #0056b3' : '1px solid #ccc',
              transition: 'background-color 0.2s ease',
            }}
          >
            <strong>{doc.first_name} {doc.last_name}</strong> — {doc.specialization || 'General'} ({doc.department_name})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DoctorSelector;
