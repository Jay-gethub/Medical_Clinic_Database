import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import '../../styles/Reports.css';

const ReportTwo = () => {
  const [data, setData] = useState([]);
  const [source, setSource] = useState('immunization');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedImmunizationId, setSelectedImmunizationId] = useState(null);
  const [modalData, setModalData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = 'http://localhost:5000/api/admin/immunization-report';
        const params = new URLSearchParams();
  
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
  
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
  
        const res = await axios.get(url);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch immunization report:', err);
      }
    };
  
    if (source === 'immunization') {
      fetchData();
    }
  }, [source, startDate, endDate]);

  // filtering logic (date range? status?)
  const filteredData = data.filter(row => {
    const validStatus = statusFilter === 'all' || row.shot_status === statusFilter;
    return validStatus;
  });

  // Modal logic (second layer report)
  const handleRowClick = async (immunizationId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/immunization-report2?immunization_id=${immunizationId}`);
      setModalData(res.data);
      setSelectedImmunizationId(immunizationId);
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching detailed report:', err);
    }
  };
  

  return (
    <div className="report-section">
      <div className="filters">
        <label>Data Source:</label>
        <select value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="immunization">Immunization Report</option>
          {/*<option value="unknown">[Placeholder for Another Source?]</option>*/}
        </select>

        <label>Start Date:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

        <label>End Date:</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

        <label>Status:</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="Complete">Complete</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      <div className="graph-section">
        <h3>Number of Patients by Immunization</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="immunization_name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="patient_count" fill="#0077cc" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="table-section">
        <table className="report-table">
          <thead>
            <tr>
              <th>Immunization</th>
              <th>Patient Count</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index} onClick={() => handleRowClick(row.immunization_id)} style={{ cursor: 'pointer' }}>
                <td>{row.immunization_name}</td>
                <td>{row.patient_count}</td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Immunization Details</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Date</th>
                  <th>Doctor</th>
                </tr>
              </thead>
              <tbody>
                {modalData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.patient_id}</td>
                    <td>{item.patient_first_name}</td>
                    <td>{item.patient_last_name}</td>
                    <td>{new Date(item.immunization_date).toLocaleDateString()}</td>
                    <td>{item.doctor_first_name} {item.doctor_last_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setShowModal(false)} className="close-btn">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportTwo;
