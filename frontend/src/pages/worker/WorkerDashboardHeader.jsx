import React, { useState, useEffect } from 'react';
import { Bell, Sun, Moon } from 'lucide-react';
import '../../components/Dashboard.css';

const WorkerDashboardHeader = ({
  currentUser,
  activeAlertsCount,
  onBellClick
}) => {
  const [dateTime, setDateTime] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Live ticking clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      // Format: DD/MM/YYYY, hh:mm:ss AM/PM
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();

      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12;

      const hoursStr = String(hours).padStart(2, '0');

      setDateTime(
        `${day}/${month}/${year}, ${hoursStr}:${minutes}:${seconds} ${ampm}`
      );
    };

    updateTime();

    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Theme toggle
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
    document.body.classList.toggle('light-theme');
  };

  // Get worker initials
  const getInitials = (name) => {
    if (!name) {
      return 'U';
    }

    return name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Get squad name
  const getSquadName = (teamId) => {
    if (teamId === 't1') {
      return 'Squad Alpha';
    }

    if (teamId === 't2') {
      return 'Squad Bravo';
    }

    return 'Rescue Squad';
  };

  return (
    <div className="dashboard-header">

      {/* LEFT SIDE */}
      <div className="header-left">

        <h1 className="header-title" style={{ marginLeft: '10px' }}>
          Dashboard
        </h1>

        <span className="header-clock"  style={{ marginLeft: '10px' }}>
          {dateTime}
        </span>

      </div>

      {/* RIGHT SIDE */}
      <div className="header-right">

        {/* Online Status */}
        <div className="online-status-badge">
          <span className="online-dot"></span>
          <span>Online</span>
        </div>

       
         

        {/* Notification Bell */}
        <button
          type="button"
          className="bell-btn"
          onClick={onBellClick}
        >
          <Bell size={18} />

          {activeAlertsCount > 0 && (
            <span className="notification-badge">
              {activeAlertsCount}
            </span>
          )}
        </button>

        {/* Worker Profile */}
        {currentUser && (
          <div className="worker-profile-card">

            <div className="worker-avatar">
              {getInitials(currentUser.name)}
            </div>

            <div className="profile-info">

              <span className="profile-name">
                {currentUser.name || 'Worker'}
              </span>

              <span className="profile-squad">
                {getSquadName(currentUser.teamId)}
              </span>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default WorkerDashboardHeader;