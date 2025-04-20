import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const DiagnosticReport = () => {
  const [reportData,       setReportData]       = useState([]);
  const [filteredData,     setFilteredData]     = useState([]);
  const [locations,        setLocations]        = useState([]);
  const [doctors,          setDoctors]          = useState([]);
  const [selectedDoctor,   setSelectedDoctor]   = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');

  // 1) Load list of doctors for dropdown
  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/doctors')
      .then(res => {
        setDoctors([{ employee_id: 'All', doctor_name: 'All' }, ...res.data]);
      })
      .catch(err => console.error('Failed to fetch doctors:', err));
  }, []);

  // 2) Fetch report data whenever selectedDoctor changes (incl. initial mount)
  useEffect(() => {
    let url = 'http://localhost:5000/api/admin/diagnostic-report';
    if (selectedDoctor !== 'All') {
      url += `?doctor_id=${selectedDoctor}`;
    }

    axios.get(url)
      .then(res => {
        const data = res.data;
        setReportData(data);
        setFilteredData(data);
        setLocations(['All', ...new Set(data.map(item => item.clinic_location))]);
        // **Reset clinic filter** when doctor changes
        setSelectedLocation('All');
      })
      .catch(err => console.error('Failed to fetch diagnostic data:', err));
  }, [selectedDoctor]);

  // 3) Client-side filter by location
  const handleLocationChange = (e) => {
    const loc = e.target.value;
    setSelectedLocation(loc);
    setFilteredData(
      loc === 'All'
        ? reportData
        : reportData.filter(item => item.clinic_location === loc)
    );
  };

  // 4) Prepare bar chart data
  const getChartData = () => {
    const totals = {};
    filteredData.forEach(({ test_type, total_tests }) => {
      totals[test_type] = (totals[test_type] || 0) + total_tests;
    });
    return Object.entries(totals).map(([test_type, total_tests]) => ({ test_type, total_tests }));
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Diagnostic Test Summary</h2>

      {/* Doctor Filter */}
      <div className="form-group mb-3">
        <label htmlFor="doctorFilter">Filter by Doctor:</label>
        <select
          id="doctorFilter"
          className="form-control"
          value={selectedDoctor}
          onChange={e => setSelectedDoctor(e.target.value)}
        >
          {doctors.map(doc => (
            <option key={doc.employee_id} value={doc.employee_id}>
              {doc.doctor_name}
            </option>
          ))}
        </select>
      </div>

      {/* Clinic Location Filter */}
      <div className="form-group mb-4">
        <label htmlFor="locationFilter">Filter by Clinic Location:</label>
        <select
          id="locationFilter"
          className="form-control"
          value={selectedLocation}
          onChange={handleLocationChange}
        >
          {locations.map((loc, idx) => (
            <option key={idx} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Bar Chart */}
      <div className="mb-5">
        <h5 className="mb-3">Test Type Distribution</h5>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={getChartData()} margin={{ top:20, right:30, left:20, bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="test_type" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_tests" fill="#4287f5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
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
              <td colSpan="3" className="text-center">
                No diagnostic data found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DiagnosticReport;
