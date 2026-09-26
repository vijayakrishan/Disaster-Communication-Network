import React, { useState, useEffect } from 'react';
import { Bell, Sun, Moon } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import '../Dashboard.css';

const AdminDashboardHeader = ({ currentUser, activeAlertsCount, onBellClick, setActiveTab }) => {
  const { logout } = useAppContext();
  const [showDropdown, setShowDropdown] = useState(false);
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

      setDateTime(`${day}/${month}/${year}, ${hoursStr}:${minutes}:${seconds} ${ampm}`);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Toggle light-theme class on body
    document.body.classList.toggle('light-theme');
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('') : 'U';
  };

  const getSquadName = (teamId) => {
    return teamId === 't1' ? 'Squad Alpha' : teamId === 't2' ? 'Squad Bravo' : 'Rescue Squad';
  };

  return (
    <div className="dashboard-header">
      <div className="header-left">
        <h1 className="header-title">Dashboard</h1>
        <span className="header-clock">{dateTime}</span>
      </div>

      <div className="header-right">
        {/* Online Status Badge */}
        <div className="online-status-badge">
          <span className="online-dot"></span>
          <span>Online</span>
        </div>

        {/* Theme Toggle */}
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification Bell */}
        <button className="bell-btn" onClick={onBellClick}>
          <Bell size={18} />
          {activeAlertsCount > 0 && <span className="notification-badge">{activeAlertsCount}</span>}
        </button>

        {/* Worker Profile Card */}
        {currentUser && (
          <div className="worker-profile-card" onClick={() => setShowDropdown(!showDropdown)} style={{ position: 'relative', cursor: 'pointer' }}>
            <div className="worker-avatar">
              {getInitials(currentUser.name)}
            </div>
            <div className="profile-info">
              <span className="profile-name">{currentUser.name}</span>
              <span className="profile-squad">{getSquadName(currentUser.teamId)}</span>
            </div>
            {showDropdown && (
              <div className="role-dropdown glass-panel" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', zIndex: 1000, minWidth: '140px' }}>
                <div className="role-options">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (setActiveTab) setActiveTab('profile');
                      setShowDropdown(false);
                    }}
                    className="role-option-btn"
                  >
                    <span>Profile</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      logout();
                      setShowDropdown(false);
                    }}
                    className="role-option-btn logout-item-btn"
                  >
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardHeader;
