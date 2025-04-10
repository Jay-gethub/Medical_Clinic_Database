//DiagnosticsView.js
/*import React from 'react';
import axios from 'axios';
import '../../styles/AdminDashboard.css';

const DiagnosticsView = () => {
  return (
    <div className="tab-view">
      <h2>Diagnostics</h2>
      <p>This section will display diagnostic test results for patients.</p>
      {/* Add table, cards, or data rendering here */
   // </div>
  //);
//};

//export default DiagnosticsView;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/AdminDashboard.css';

const DiagnosticsView = () => {
  const [diagnostics, setDiagnostics] = useState([]);
    const [search, setSearch] = useState('');

    // Fetch diagnostics data when the component mounts
    useEffect(() => {
      // Make an Axios request to fetch diagnostics data
      axios.get('/api/diagnostics')
        .then((response) => {
          setDiagnostics(response.data); // Assuming the response data is an array of diagnostics
        })
        .catch((error) => {
          console.error('Error fetching diagnostics:', error);
        });
    }, []);

  const filteredDiagnostics = diagnostics.filter(d =>
    d.patientName.toLowerCase().includes(search.toLowerCase()) ||
    d.testType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="tab-view p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Diagnostics</h2>

      <input
        type="text"
        placeholder="Search by patient or test type..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full p-2 border border-gray-300 rounded-md"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border-b">Patient Name</th>
              <th className="p-3 border-b">Test Type</th>
              <th className="p-3 border-b">Result</th>
              <th className="p-3 border-b">Date</th>
              <th className="p-3 border-b">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredDiagnostics.length > 0 ? (
              filteredDiagnostics.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-3 border-b">{item.patientName}</td>
                  <td className="p-3 border-b">{item.testType}</td>
                  <td className="p-3 border-b">{item.result}</td>
                  <td className="p-3 border-b">{item.date}</td>
                  <td className="p-3 border-b">{item.notes}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  No diagnostics found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DiagnosticsView;


