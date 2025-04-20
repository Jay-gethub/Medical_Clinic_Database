import React, { use, useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/AdminDashboard.css';

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [clinicFilter, setClinicFilter] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);


  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/employees');
        setEmployees(res.data);
        setFilteredEmployees(res.data);
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const filtered = employees.filter(emp => {
      const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
      return (
        fullName.includes(nameFilter.toLowerCase()) &&
        (roleFilter === '' || emp.role === roleFilter) &&
        (clinicFilter === '' || emp.clinic_name === clinicFilter)
      );
    });
    setFilteredEmployees(filtered);
  }, [nameFilter, roleFilter, clinicFilter, employees]);

  const handleRowClick = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/employee/detailed/${id}`);
      setEmployeeDetails(res.data);
      setSelectedEmployeeId(id);
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching employee details:', err);
    }
  };
  

  // extract roles and clinics for dropdowns
  const uniqueRoles = [...new Set(employees.map(emp => emp.role))];
  const uniqueClinics = [...new Set(employees.map(emp => emp.clinic_name))];

  return (
    <div className="admin-box">
      <h3>Employee Directory</h3>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          {uniqueRoles.map((role, index) => (
            <option key={index} value={role}>{role}</option>
          ))}
        </select>
        <select value={clinicFilter} onChange={(e) => setClinicFilter(e.target.value)}>
          <option value="">All Clinics</option>
          {uniqueClinics.map((clinic, index) => (
            <option key={index} value={clinic}>{clinic}</option>
          ))}
        </select>
      </div>

      <table className="employee-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Clinic</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((emp, index) => (
            <tr key={index} onClick={() => handleRowClick(emp.employee_id)} style={{ cursor: 'pointer' }}>
              <td>{emp.first_name} {emp.last_name}</td>
              <td>{emp.email}</td>
              <td>{emp.phone}</td>
              <td>{emp.role}</td>
              <td>{emp.clinic_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && employeeDetails && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{employeeDetails.first_name} {employeeDetails.last_name} (ID: {employeeDetails.employee_id})</h3>

            <table className="detail-table">
              <tbody>
                <tr>
                  <td><strong>Email:</strong></td>
                  <td>{employeeDetails.email}</td>
                </tr>
                <tr>
                  <td><strong>Phone:</strong></td>
                  <td>{employeeDetails.phone}</td>
                </tr>
                <tr>
                  <td><strong>Sex:</strong></td>
                  <td>{employeeDetails.sex}</td>
                </tr>
                <tr>
                  <td><strong>Date of Birth:</strong></td>
                  <td>{new Date(employeeDetails.date_of_birth).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td><strong>Role:</strong></td>
                  <td>{employeeDetails.role}</td>
                </tr>
                {employeeDetails.role === 'Doctor' && (
                  <tr>
                    <td><strong>Specialization:</strong></td>
                    <td>{employeeDetails.specialization}</td>
                  </tr>
                )}
                <tr>
                  <td><strong>Clinic:</strong></td>
                  <td>{employeeDetails.clinic_name}</td>
                </tr>
                <tr>
                  <td><strong>Department:</strong></td>
                  <td>{employeeDetails.department_name}</td>
                </tr>
                <tr>
                  <td><strong>Address:</strong></td>
                  <td>
                    {`${employeeDetails.street_num} ${employeeDetails.street_name}, ${employeeDetails.city}, ${employeeDetails.state} ${employeeDetails.postal_code}`}
                  </td>
                </tr>
              </tbody>
            </table>

            <button className="close-btn" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeTable;
