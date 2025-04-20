import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const DiagnosticReport = () => {
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('All');

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/diagnostic-report')
      .then(res => {
        const data = res.data;
        setReportData(data);
        setFilteredData(data);

        const uniqueLocations = ['All', ...new Set(data.map(item => item.clinic_location))];
        setLocations(uniqueLocations);
      })
      .catch(err => {
        console.error('Failed to fetch diagnostic data:', err);
      });
  }, []);

  const handleFilterChange = (e) => {
    const location = e.target.value;
    setSelectedLocation(location);

    if (location === 'All') {
      setFilteredData(reportData);
    } else {
      setFilteredData(reportData.filter(item => item.clinic_location === location));
    }
  };

  const getChartData = () => {
    const totals = {};

    filteredData.forEach(item => {
      if (totals[item.test_type]) {
        totals[item.test_type] += item.total_tests;
      } else {
        totals[item.test_type] = item.total_tests;
      }
    });

    return Object.entries(totals).map(([test_type, total_tests]) => ({
      test_type,
      total_tests
    }));
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Diagnostic Test Summary</h2>

      <div className="form-group mb-4">
        <label htmlFor="locationFilter">Filter by Clinic Location:</label>
        <select
          id="locationFilter"
          className="form-control"
          value={selectedLocation}
          onChange={handleFilterChange}
        >
          {locations.map((loc, index) => (
            <option key={index} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* Recharts Bar Chart */}
      <div className="mb-5">
        <h5 className="mb-3">Test Type Distribution</h5>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="test_type" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_tests" fill="#4287f5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <table className="table table-bordered table-striped">
        <thead className="thead-dark">
          <tr>
            <th>Test Type</th>
            <th>Total Tests</th>
            <th>Clinic Location</th>
          </tr>
        </thead>
        <tbody>
        {filteredData.filter(item => item.total_tests > 0).length > 0 ? (
  filteredData
    .filter(item => item.total_tests > 0)
    .map((item, idx) => (
      <tr key={idx}>
        <td>{item.test_type}</td>
        <td>{item.total_tests}</td>
        <td>{item.clinic_location}</td>
      </tr>
    ))
) : (
  <tr>
    <td colSpan="3" className="text-center">No diagnostic data found.</td>
  </tr>
)}

        </tbody>
      </table>
    </div>
  );
};

export default DiagnosticReport;
