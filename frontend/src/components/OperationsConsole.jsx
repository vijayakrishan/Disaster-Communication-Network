import React from 'react';
import './Dashboard.css';

const OperationsConsole = ({ teamName = 'Squad Alpha', baseStation = 'BS-04' }) => {
  return (
    <div className="operations-console glass-panel">
      <h3 className="console-title">Operations Console</h3>
      <div className="console-meta-flex">
        <span className="console-meta-item">Team: <span className="blue-highlight">{teamName}</span></span>
        <span className="console-meta-divider">•</span>
        <span className="console-meta-item">Base Station: <span className="blue-highlight">{baseStation}</span></span>
      </div>
    </div>
  );
};

export default OperationsConsole;
