import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import '../../styles/DemographicReport.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#36A2EB'];

const DemographicReport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [genderFilter, setGenderFilter] = useState('all');
  const [raceFilter, setRaceFilter] = useState('all');
  const [insuranceFilter, setInsuranceFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const chartContainerRef = useRef();

  useEffect(() => {
    const today = new Date();
    const last30 = new Date();
    last30.setDate(today.getDate() - 30);
    setStartDate(last30.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchReport();
    }
  }, [startDate, endDate]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/demographic-report', {
        params: { startDate, endDate }
      });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching demographic report:', err);
      setError('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dobString) => {
    try {
      const dob = new Date(dobString);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age;
    } catch {
      return 'N/A';
    }
  };

  const filteredData = data.filter(p => {
    const age = calculateAge(p.dob);
    const matchGender = genderFilter === 'all' || p.sex === genderFilter;
    const matchRace = raceFilter === 'all' || p.race === raceFilter;
    const matchInsurance = insuranceFilter === 'all' || (insuranceFilter === 'yes' ? p.has_insurance : !p.has_insurance);
    const matchAge =
      ageFilter === 'all' ||
      (ageFilter === '0-17' && age <= 17) ||
      (ageFilter === '18-25' && age >= 18 && age <= 25) ||
      (ageFilter === '26-35' && age >= 26 && age <= 35) ||
      (ageFilter === '36-45' && age >= 36 && age <= 45) ||
      (ageFilter === '46-60' && age >= 46 && age <= 60) ||
      (ageFilter === '61+' && age > 60);
    return matchGender && matchRace && matchInsurance && matchAge;
  });

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return 'Invalid Date';
    }
  };

  const exportCSV = () => {
    const header = ['First Name,Last Name,Sex,Race,Age,Has Insurance,Date Registered'];
    const rows = filteredData.map(p => (
      `${p.first_name},${p.last_name},${p.sex},${p.race},${calculateAge(p.dob)},${p.has_insurance ? 'Yes' : 'No'},${formatDate(p.date_registered)}`
    ));
    const csv = [...header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'demographic_report.csv');
  };

  const exportChartsAsPDF = async () => {
    const canvas = await html2canvas(chartContainerRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('charts.pdf');
  };

  const genderData = () => {
    const grouped = filteredData.reduce((acc, p) => {
      acc[p.sex] = (acc[p.sex] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(grouped).map(k => ({ name: k, value: grouped[k] }));
  };

  const raceData = () => {
    const grouped = filteredData.reduce((acc, p) => {
      acc[p.race] = (acc[p.race] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(grouped).map(k => ({ name: k, count: grouped[k] }));
  };

  const insuranceData = () => {
    const counts = { Yes: 0, No: 0 };
    filteredData.forEach(p => {
      if (p.has_insurance) counts.Yes++;
      else counts.No++;
    });
    return [
      { name: 'Yes', value: counts.Yes },
      { name: 'No', value: counts.No },
    ];
  };

  const ageHistogramData = () => {
    const bins = [
      { range: '0-17', count: 0 },
      { range: '18-25', count: 0 },
      { range: '26-35', count: 0 },
      { range: '36-45', count: 0 },
      { range: '46-60', count: 0 },
      { range: '61+', count: 0 },
    ];
    filteredData.forEach(p => {
      const age = calculateAge(p.dob);
      if (age <= 17) bins[0].count++;
      else if (age <= 25) bins[1].count++;
      else if (age <= 35) bins[2].count++;
      else if (age <= 45) bins[3].count++;
      else if (age <= 60) bins[4].count++;
      else bins[5].count++;
    });
    return bins;
  };

  return (
    <div className="demographic-report-container">
      <h1 className="demographic-title">Demographic Report</h1>

      <div className="demographic-filters">
        <div className="demographic-filter-group">
          <label>Start Date:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="demographic-filter-group">
          <label>End Date:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="demographic-filter-group">
          <label>Gender:</label>
          <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="demographic-filter-group">
          <label>Race:</label>
          <select value={raceFilter} onChange={(e) => setRaceFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="American Indian">American Indian</option>
            <option value="Asian">Asian</option>
            <option value="African American">African American</option>
            <option value="Pacific Islander">Pacific Islander</option>
            <option value="White">White</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="demographic-filter-group">
          <label>Insurance:</label>
          <select value={insuranceFilter} onChange={(e) => setInsuranceFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div className="demographic-filter-group">
          <label>Age Range:</label>
          <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="0-17">0-17</option>
            <option value="18-25">18-25</option>
            <option value="26-35">26-35</option>
            <option value="36-45">36-45</option>
            <option value="46-60">46-60</option>
            <option value="61+">61+</option>
          </select>
        </div>
        <button onClick={exportCSV} disabled={!filteredData.length}>Download CSV</button>
        <button onClick={exportChartsAsPDF} disabled={!filteredData.length}>Export Charts as PDF</button>
      </div>

      {loading && <p className="demographic-loading">Loading report...</p>}
      {error && <p className="demographic-error">{error}</p>}

      {!loading && filteredData.length > 0 && (
        <>
          <div className="charts-container" ref={chartContainerRef}>
            <div className="chart-wrapper">
              <h3>Gender Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={genderData()} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                    {genderData().map((entry, index) => (
                      <Cell key={`gender-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-wrapper">
              <h3>Race Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={raceData()} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} height={60} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-wrapper">
              <h3>Has Insurance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={insuranceData()} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100}>
                    {insuranceData().map((entry, index) => (
                      <Cell key={`insurance-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-wrapper">
              <h3>Age Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageHistogramData()} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="demographic-table-container">
            <table className="demographic-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Sex</th>
                  <th>Race</th>
                  <th>Age</th>
                  <th>Has Insurance?</th>
                  <th>Date Registered</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((patient, idx) => (
                  <tr key={idx} title={`Email: ${patient.email}\nPhone: ${patient.phone_num}`}>
                    <td>{patient.first_name} {patient.last_name}</td>
                    <td>{patient.sex}</td>
                    <td>{patient.race}</td>
                    <td>{calculateAge(patient.dob)}</td>
                    <td>{patient.has_insurance ? 'Yes' : 'No'}</td>
                    <td>{formatDate(patient.date_registered)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && filteredData.length === 0 && <p>No records found for this range.</p>}
    </div>
  );
};

export default DemographicReport;