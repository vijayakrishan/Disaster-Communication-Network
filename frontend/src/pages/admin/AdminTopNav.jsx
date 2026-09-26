import React, { useState } from 'react';
import './AdminTopNav.css';
import { useAppContext } from '../../context/AppContext';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  ShieldAlert, 
  Radio, 
  Activity, 
  Menu,
  X
} from 'lucide-react';

const AdminTopNav = ({ title, activeTab, activeTabLabel, onMenuClick, setActiveTab }) => {
  const { currentUser, login, logout, alerts, systemLogs } = useAppContext();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  if (!currentUser) return null;

  // Active (uncompleted) SOS Alerts
  const activeAlerts = alerts.filter(a => a.status === 'PENDING' || a.status === 'ACTIVE');
  const emergencyCount = activeAlerts.length;

  const handleRoleChange = (role) => {
    login(role);
    setShowRoleSelector(false);
  };

  return (
    <header className="topnav-container glass-panel">
      {/* Left side: Hamburger menu + Title */}
      <div className="topnav-left">
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        {!(currentUser?.role === 'WORKER' && title === 'Dashboard') && (
          <div className="title-wrapper">
            <h1 className="topnav-title">{title}</h1>
            {currentUser?.role !== 'WORKER' && (
              <span className="breadcrumb">
                {currentUser.role} &nbsp;/&nbsp; {activeTabLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right side: Notifications, Profile, Tester Role Switcher */}
      <div className="topnav-right">

        {/* Notifications Dropdown */}
        <div className="nav-icon-wrapper">
          <button 
            className="nav-icon-btn" 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowRoleSelector(false);
            }}
          >
            <Bell size={18} />
            {emergencyCount > 0 && <span className="notification-badge">{emergencyCount}</span>}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown glass-panel">
              <div className="dropdown-header">
                <h3>System Alerts</h3>
                <span className="alert-count">{activeAlerts.length} Unresolved</span>
              </div>
              <div className="dropdown-list">
                {activeAlerts.length === 0 ? (
                  <div className="empty-alerts">
                    <Radio size={24} color="var(--text-muted)" />
                    <p>No active emergencies. Mesh quiet.</p>
                  </div>
                ) : (
                  activeAlerts.map(alert => (
                    <div key={alert.id} className="alert-item cursor-pointer">
                      <div className="alert-item-header">
                        <span className="alert-id">{alert.id}</span>
                        <span className="alert-priority-tag">{alert.priority}</span>
                      </div>
                      <p className="alert-desc">{alert.victimName}: {alert.details}</p>
                      <span className="alert-time">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))
                )}
                
                <div className="dropdown-divider">Recent Activity</div>
                {systemLogs.slice(0, 3).map(log => (
                  <div key={log.id} className="log-item">
                    <span className={`log-type log-type-${log.type.toLowerCase()}`}>{log.type}</span>
                    <p className="log-text">{log.msg}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar / Role Quick Switcher */}
        <div className="profile-selector-container">
          <button 
            className="profile-selector-btn"
            onClick={() => {
              setShowRoleSelector(!showRoleSelector);
              setShowNotifications(false);
            }}
          >
            <div className="avatar-small">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="profile-trigger-info-flex">
              <span className="user-name-small">{currentUser.name}</span>
              {currentUser.role === 'WORKER' && (
                <span className="profile-trigger-team">
                  {currentUser.teamId === 't1' ? 'Squad Alpha' : currentUser.teamId === 't2' ? 'Squad Bravo' : 'Rescue Squad'}
                </span>
              )}
            </div>
            <ChevronDown size={14} className="chevron-icon" />
          </button>

          {showRoleSelector && (
            <div className="role-dropdown glass-panel">
              {currentUser.role === 'ADMIN' ? (
                <div className="role-options">
                  <button 
                    onClick={() => {
                      if (setActiveTab) setActiveTab('profile');
                      setShowRoleSelector(false);
                    }}
                    className={`role-option-btn ${activeTab === 'profile' ? 'selected' : ''}`}
                  >
                    <span>Profile</span>
                  </button>
                  <button 
                    onClick={() => {
                      logout();
                      setShowRoleSelector(false);
                    }}
                    className="role-option-btn logout-item-btn"
                  >
                    <span>Logout</span>
                  </button>
                </div>
              ) : currentUser.role === 'USER' || currentUser.role === 'WORKER' ? (
                <div className="role-options">
                  <button 
                    onClick={() => {
                      if (setActiveTab) setActiveTab('dashboard');
                      setShowRoleSelector(false);
                    }}
                    className={`role-option-btn ${activeTab === 'dashboard' ? 'selected' : ''}`}
                  >
                    <span>Profile</span>
                  </button>
                  {currentUser.role !== 'WORKER' && (
                    <button 
                      onClick={() => {
                        if (setActiveTab) setActiveTab('settings');
                        setShowRoleSelector(false);
                      }}
                      className={`role-option-btn ${activeTab === 'settings' ? 'selected' : ''}`}
                    >
                      <span>Settings</span>
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      logout();
                      setShowRoleSelector(false);
                    }}
                    className="role-option-btn logout-item-btn"
                  >
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="dropdown-header">
                    <h3>Quick Switch Role</h3>
                    <span className="helper-text">Testing convenience</span>
                  </div>
                  <div className="role-options">
                    <button 
                      onClick={() => handleRoleChange('USER')}
                      className={`role-option-btn ${currentUser.role === 'USER' ? 'selected' : ''}`}
                    >
                      <Radio size={16} />
                      <span>Victim (USER)</span>
                    </button>
                    <button 
                      onClick={() => handleRoleChange('WORKER')}
                      className={`role-option-btn ${currentUser.role === 'WORKER' ? 'selected' : ''}`}
                    >
                      <Activity size={16} />
                      <span>Rescue Team (WORKER)</span>
                    </button>
                    <button 
                      onClick={() => handleRoleChange('ADMIN')}
                      className={`role-option-btn ${currentUser.role === 'ADMIN' ? 'selected' : ''}`}
                    >
                      <ShieldAlert size={16} />
                      <span>Command Center (ADMIN)</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      
    </header>
  );
};

export default AdminTopNav;
