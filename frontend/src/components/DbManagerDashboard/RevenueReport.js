// RevenueReport.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import '../../styles/RevenueReport.css';

const RevenueReport = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Filters
  const [clinics, setClinics] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [chartView, setChartView] = useState('clinic');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FCCDE5', '#8DD1E1'];

  const fetchFilters = async () => {
    try {
      const [clinicRes, deptRes, docRes] = await Promise.all([
        axios.get('http://localhost:5000/api/reports/filters/clinics'),
        axios.get('http://localhost:5000/api/reports/filters/departments'),
        axios.get('http://localhost:5000/api/reports/filters/doctors'),
      ]);

      setClinics(clinicRes.data);
      setDepartments(deptRes.data);
      setDoctors(docRes.data);
    } catch (err) {
      console.error("Error fetching filters:", err);
    }
  };

  const fetchData = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/reports/revenue-summary', {
      params: {
        startDate,
        endDate,
        clinic: selectedClinic,
        department: selectedDepartment,
        doctor: selectedDoctor
      }
    })
    .then(res => {
      setRevenueData(res.data);
      setFilteredData(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Error fetching revenue data:", err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchFilters();
    fetchData();
  }, []);

  const prepareBarChartData = () => {
    const groupData = {};
    filteredData.forEach(item => {
      const key =
        chartView === 'clinic' ? item.clinic_name :
        chartView === 'department' ? item.department_name :
        item.doctor_name;
      groupData[key] = (groupData[key] || 0) + parseFloat(item.total_revenue);
    });

    return Object.keys(groupData).map(key => ({
      name: key,
      revenue: groupData[key]
    }));
  };

  const totalRevenue = filteredData.reduce(
    (sum, item) => sum + parseFloat(item.total_revenue),
    0
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (loading) {
    return <div className="loading">Loading revenue data...</div>;
  }

  return (
    <div className="revenue-report-container">
      <h1>Revenue Report Dashboard</h1>

      <div className="revenue-summary">
        <div className="total-revenue-card">
          <h2>Total Revenue</h2>
          <div className="total-amount">{formatCurrency(totalRevenue)}</div>
        </div>
      </div>

      <div className="filters-container">
        <div className="filter-group">
          <label>Start Date:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>End Date:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Clinic:</label>
          <select value={selectedClinic} onChange={(e) => setSelectedClinic(e.target.value)}>
            <option value="all">All Clinics</option>
            {clinics.map(clinic => (
              <option key={clinic} value={clinic}>{clinic}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Department:</label>
          <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Doctor:</label>
          <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
            <option value="all">All Doctors</option>
            {doctors.map(doc => (
              <option key={doc} value={doc}>{doc}</option>
            ))}
          </select>
        </div>
        <button className="apply-btn" onClick={fetchData}>Apply Filters</button>
      </div>

      <div className="chart-controls">
        <h2>Revenue Breakdown</h2>
        <div className="view-toggle">
  <button 
    className={chartView === 'clinic' ? 'active' : ''} 
    onClick={() => setChartView('clinic')}
  >
    By Clinic
  </button>

  <button 
    className={chartView === 'department' ? 'active' : ''} 
    onClick={() => setChartView('department')}
  >
    By Department
  </button>

  <button 
    className={chartView === 'doctor' ? 'active' : ''} 
    onClick={() => setChartView('doctor')}
  >
    By Doctor
  </button>
</div>
</div>
      <div className="charts-container">
        <div className="chart-wrapper">
          <h3>Revenue Distribution ({chartView})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareBarChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
  dataKey="name" 
  tick={{ angle: 0 }} 
  height={60} 
  interval={0}
/>
              <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <Tooltip formatter={(value) => [`${formatCurrency(value)}`, 'Revenue']} />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-wrapper">
          <h3>Revenue Distribution (Pie Chart)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={prepareBarChartData()}
                dataKey="revenue"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {prepareBarChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="table-container">
        <h2>Detailed Revenue Table</h2>
        <table className="revenue-table">
          <thead>
            <tr>
              <th>Clinic</th>
              <th>Department</th>
              <th>Doctor</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index}>
                <td>{item.clinic_name}</td>
                <td>{item.department_name}</td>
                <td>{item.doctor_name}</td>
                <td className="revenue-cell">{formatCurrency(item.total_revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="report-meta">
  <h4>📋 Tables and Attributes Used</h4>
  <ul>
    <li><strong>BILLING:</strong> <code>total_amount</code>, <code>billing_date</code>, <code>appointment_id</code></li>
    <li><strong>APPOINTMENTS:</strong> <code>appointment_id</code>, <code>doctor_id</code>, <code>clinic_id</code></li>
    <li><strong>DOCTORS:</strong> <code>employee_id</code>, <code>department_id</code></li>
    <li><strong>EMPLOYEES:</strong> <code>first_name</code>, <code>last_name</code></li>
    <li><strong>DEPARTMENTS:</strong> <code>department_name</code></li>
    <li><strong>CLINIC:</strong> <code>clinic_name</code></li>
  </ul>
</div>

    </div>
  );
};

export default RevenueReport;
