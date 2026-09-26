import React from 'react';
import './Dashboard.css';

const StatCard = ({ label, value, icon: Icon, type }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-inner">
        <div className={`stat-icon-container stat-icon-${type}`}>
          <Icon size={22} />
        </div>
        <div className="stat-content">
          <span className="stat-label">{label}</span>
          {type === 'health' ? (
            <span className="stat-value health-status-flex">
              <span className="health-dot"></span>
              {value}
            </span>
          ) : (
            <span className="stat-value">{value}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
