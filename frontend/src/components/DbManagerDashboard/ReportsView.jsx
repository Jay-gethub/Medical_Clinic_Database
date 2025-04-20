import React from 'react';

const ReportsView = () => {
  // TODO: connect to real report endpoints
  return (
    <div className="db-reports-view">
      <h2>System Reports</h2>
      <ul>
        <li>Monthly User Activity</li>
        <li>Database Health Metrics</li>
        <li>Access Logs</li>
      </ul>
    </div>
  );
};

export default ReportsView;
