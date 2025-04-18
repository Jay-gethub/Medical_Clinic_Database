import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/AdminDashboard.css';

const AppointmentTable = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);

  // Filters
  const [clinicOptions, setClinicOptions] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [searchText, setSearchText] = useState('');
  const [searchMode, setSearchMode] = useState('patient'); // 'patient' or 'doctor'
  const [appointmentStatus, setAppointmentStatus] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  // Formatted date
  const formatDateTime = (datetimeString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    const date = new Date(datetimeString);
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/employee/appointment-table');
        setPatients(res.data);
        setFilteredPatients(res.data);

        // Generate unique clinics for dropdown
        const clinics = [...new Set(res.data.map(p => p.clinic_name))];
        setClinicOptions(clinics);
      } catch (err) {
        console.error('Error fetching Patients:', err);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter(p => {
      const matchesClinic = selectedClinic ? p.clinic_name === selectedClinic : true;
      const matchesStatus = appointmentStatus ? p.appointment_status === appointmentStatus : true;

      const fullPatientName = `${p.patient_first_name} ${p.patient_last_name}`.toLowerCase();
      const fullDoctorName = `${p.doctor_first_name} ${p.doctor_last_name}`.toLowerCase();
      const searchTarget = searchMode === 'patient' ? fullPatientName : fullDoctorName;

      const matchesSearch = searchText
        ? searchTarget.includes(searchText.toLowerCase())
        : true;

      return matchesClinic && matchesStatus && matchesSearch;
    });

    setFilteredPatients(filtered);
  }, [patients, selectedClinic, appointmentStatus, searchText, searchMode]);

  return (
    <div className="admin-box">
      <h3>Patient Directory</h3>

      {/* Filter Controls */}
      <div className="filter-controls">
        <select value={selectedClinic} onChange={e => setSelectedClinic(e.target.value)}>
          <option value="">All Clinics</option>
          {clinicOptions.map((clinic, i) => (
            <option key={i} value={clinic}>{clinic}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder={`Search ${searchMode} name`}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />

        <label>
          <input
            type="radio"
            value="patient"
            checked={searchMode === 'patient'}
            onChange={() => setSearchMode('patient')}
          />
          Patient
        </label>
        <label>
          <input
            type="radio"
            value="doctor"
            checked={searchMode === 'doctor'}
            onChange={() => setSearchMode('doctor')}
          />
          Doctor
        </label>

        <select value={appointmentStatus} onChange={e => setAppointmentStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="InProgress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Canceled">Canceled</option>
        </select>
      </div>

      {/* Table */}
      <table className="employee-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Contact</th>
            <th>Doctor</th>
            <th>Clinic</th>
            <th>Appointment Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredPatients.map((pat, index) => (
            <tr key={index} onClick={() => {
              setSelectedAppointment(pat);
              setNewStatus(pat.appointment_status); // Pre-fill current status
            }} style={{ cursor: 'pointer' }}>
              <td>{pat.patient_last_name}, {pat.patient_first_name}</td>
              <td>{pat.phone_num}, {pat.email}</td>
              <td>{pat.doctor_last_name}, {pat.doctor_first_name}</td>
              <td>{pat.clinic_name}</td>
              <td>{formatDateTime(pat.start_time)}</td>
              <td>{pat.appointment_status}</td>
            </tr>
          ))}
        </tbody>
      </table>

    {/* Modal for Appointment details and status update */}
    {selectedAppointment && (
        <div className="modal">
          <div className="modal-content">
            <h4>Appointment Details</h4>
            <p><strong>Patient:</strong> {selectedAppointment.patient_first_name} {selectedAppointment.patient_last_name}</p>
            <p><strong>Doctor:</strong> {selectedAppointment.doctor_first_name} {selectedAppointment.doctor_last_name}</p>
            <p><strong>Clinic:</strong> {selectedAppointment.clinic_name}</p>
            <p><strong>Time:</strong> {formatDateTime(selectedAppointment.start_time)}</p>
            <p><strong>Contact:</strong> {selectedAppointment.phone_num} | {selectedAppointment.email}</p>

            <label>
              <strong>Status:</strong>{' '}
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                <option value="Scheduled">Scheduled</option>
                <option value="InProgress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Canceled">Canceled</option>
              </select>
            </label>

            <div className="modal-actions">
              <button onClick={() => setSelectedAppointment(null)}>Close</button>
              <button
                onClick={async () => {
                  try {
                    await axios.put('http://localhost:5000/api/employee/update-appointment', {
                      appointment_id: selectedAppointment.appointment_id,
                      appointment_status: newStatus,
                    });

                    // Refresh appointments
                    const res = await axios.get('http://localhost:5000/api/employee/appointment-table');
                    setPatients(res.data);
                    setSelectedAppointment(null);
                  } catch (err) {
                    console.error('Failed to update:', err);
                  }
                }}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentTable;