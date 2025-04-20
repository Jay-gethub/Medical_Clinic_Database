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

  useEffect(() => {
    if (source === 'immunization') {
      axios.get('http://localhost:5000/api/admin/immunization-report')
        .then(res => {
          setData(res.data);
        })
        .catch(err => {
          console.error('Failed to fetch immunization report:', err);
        });
    }
    // Add logic for future data sources here
  }, [source]);

  // filtering logic (date range? status?)
  const filteredData = data.filter(row => {
    const validStart = startDate ? new Date(row.date) >= new Date(startDate) : true;
    const validEnd = endDate ? new Date(row.date) <= new Date(endDate) : true;
    const validStatus = statusFilter === 'all' || row.shot_status === statusFilter;
    return validStart && validEnd && validStatus;
  });

  return (
    <div className="report-section">
      <div className="filters">
        <label>Data Source:</label>
        <select value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="immunization">Immunization Report</option>
          <option value="unknown">[Placeholder for Another Source]</option>
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
              <tr key={index}>
                <td>{row.immunization_name}</td>
                <td>{row.patient_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportTwo;
