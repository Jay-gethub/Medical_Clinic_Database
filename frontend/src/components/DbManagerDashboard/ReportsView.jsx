import React, { useState } from 'react';
import '../../styles/Reports.css';
import ReportTwo from './ReportTwo';
import RevenueReport from './RevenueReport';
import DemographicReport from './DemographicReport';
import DiagnosticReport from './DiagnosticsReport';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null);

  const renderReport = () => {
    switch (selectedReport) {
      case 'report1':
        return <div className="report-content"><DemographicReport /></div>;
      case 'report2':
        return <div className="report-content"><ReportTwo /></div>;
      case 'revenue':
        return <div className="report-content"><RevenueReport /></div>;
      case 'diagnostic':
        return <div className="report-content"><DiagnosticReport /></div>;
      default:
        return (
          <div className="report-boxes">
            <div className="report-box" onClick={() => setSelectedReport('report1')}>
              Demographic Report
            </div>
            <div className="report-box" onClick={() => setSelectedReport('report2')}>
              Immunization Analysis
            </div>
            <div className="report-box" onClick={() => setSelectedReport('revenue')}>
              Revenue Report
            </div>
            <div className="report-box" onClick={() => setSelectedReport('diagnostic')}>
              Diagnostic Report
            </div>
          </div>
        );
    }
  };

  return (
    <div className="reports-container">
      {selectedReport && (
        <button className="back-btn" onClick={() => setSelectedReport(null)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>
      )}
      {renderReport()}
    </div>
  );
};

export default Reports;
