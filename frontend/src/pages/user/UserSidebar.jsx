import React from 'react';
import './UserSidebar.css';
import { useAppContext } from '../../context/AppContext';

import {
  LayoutDashboard,
  Radio,
  History,
  Settings,
  ShieldAlert,
  Sparkles,
  LogOut
} from 'lucide-react';

const UserSidebar = ({
  activeTab,
  setActiveTab
}) => {

  const {
    currentUser,
    logout,
    relays = [],
    devices = []
  } = useAppContext();

  // =====================================================
  // NO USER
  // =====================================================

  if (!currentUser) {
    return null;
  }

  // =====================================================
  // SAFE DATA
  // =====================================================

  const safeRelays = Array.isArray(relays)
    ? relays
    : [];

  const safeDevices = Array.isArray(devices)
    ? devices
    : [];

  // =====================================================
  // ROLE
  // =====================================================

  const role = String(
    currentUser?.role || 'USER'
  )
    .trim()
    .toUpperCase();

  // =====================================================
  // USER NAME
  // =====================================================

  const userName = String(
    currentUser?.name ||
    currentUser?.email?.split('@')[0] ||
    'User'
  );

  // =====================================================
  // INITIALS
  // =====================================================

  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map(name => name[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // =====================================================
  // LORA MESH STATUS
  // =====================================================

  const onlineRelays = safeRelays.filter(
    relay =>
      String(relay?.status || '')
        .trim()
        .toUpperCase() === 'ONLINE'
  ).length;

  const totalRelays = safeRelays.length;

  const onlineDevices = safeDevices.filter(
    device =>
      String(device?.status || '')
        .trim()
        .toUpperCase() === 'ONLINE'
  ).length;

  const totalNodes =
    onlineRelays + onlineDevices;

  // =====================================================
  // SIGNAL HEALTH
  // =====================================================

  const activeNodesWithSignal = [
    ...safeRelays,
    ...safeDevices
  ].filter(
    node =>
      String(node?.status || '')
        .trim()
        .toUpperCase() === 'ONLINE'
  );

  const avgRssi =
    activeNodesWithSignal.length > 0
      ? Math.round(
          activeNodesWithSignal.reduce(
            (total, node) =>
              total +
              Number(node?.rssi ?? -100),
            0
          ) /
            activeNodesWithSignal.length
        )
      : -100;

  let signalQuality = 'EXCELLENT';

  let signalColor =
    'var(--color-success)';

  if (avgRssi < -95) {
    signalQuality = 'CRITICAL';
    signalColor =
      'var(--color-danger)';
  } else if (avgRssi < -85) {
    signalQuality = 'MODERATE';
    signalColor =
      'var(--color-warning)';
  }

  // =====================================================
  // NETWORK HEALTH
  // =====================================================

  const networkHealth =
    totalRelays === 0
      ? 'OFFLINE'
      : onlineRelays === totalRelays
        ? 'OPTIMAL'
        : onlineRelays > 0
          ? 'DEGRADED'
          : 'OFFLINE';

  const healthColor =
    networkHealth === 'OPTIMAL'
      ? 'var(--color-success)'
      : networkHealth === 'DEGRADED'
        ? 'var(--color-warning)'
        : 'var(--color-danger)';

  // =====================================================
  // MENU
  // =====================================================

  const menuItems = {

    USER: [

      {
        id: 'dashboard',
        label: 'Victim Portal',
        icon: LayoutDashboard
      },

      {
        id: 'devices',
        label: 'My LoRa Devices',
        icon: Radio
      },

      {
        id: 'history',
        label: 'SOS History',
        icon: History
      },

      {
        id: 'profile',
        label: 'Profile',
        icon: Settings
      },

      {
        id: 'aiprediction',
        label: 'AI Prediction',
        icon: Sparkles
      }

    ]

  };

  const currentMenu =
    menuItems[role] ||
    menuItems.USER ||
    [];

  // =====================================================
  // RENDER
  // =====================================================

  return (

    <aside className="sidebar-container glass-panel">

      {/* =================================================
          BRAND
      ================================================= */}

      <div className="sidebar-header">

        <div className="brand-logo pulse-blue">

          <ShieldAlert
            size={20}
            color="var(--accent-glow)"
          />

        </div>

        <div className="brand-info">

          <h2>
            ResQMesh
          </h2>

          <span className="brand-sub">
            Emergency LoRa V2.4
          </span>

        </div>

      </div>

      {/* =================================================
          PROFILE
      ================================================= */}

      <div className="sidebar-profile">

        <div className="avatar-glow">

          <div className="profile-avatar">

            {initials}

          </div>

          <span className="profile-badge-dot" />

        </div>

        <div className="profile-details">

          <div className="profile-name">

            {userName}

          </div>

          <div className="profile-role">

            <span
              className={`role-tag role-${role.toLowerCase()}`}
            >

              {role}

            </span>

          </div>

        </div>

      </div>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <nav className="sidebar-nav">

        <ul>

          {currentMenu.map(item => {

            const Icon = item.icon;

            const isActive =
              activeTab === item.id;

            return (

              <li key={item.id}>

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(item.id)
                  }
                  className={`nav-button ${
                    isActive
                      ? 'active'
                      : ''
                  }`}
                >

                  <Icon
                    size={18}
                    className="nav-icon"
                  />

                  <span>
                    {item.label}
                  </span>

                  {isActive && (

                    <div className="active-glow-bar" />

                  )}

                </button>

              </li>

            );

          })}

        </ul>

      </nav>

      {/* =================================================
          LOGOUT
      ================================================= */}

      <div className="sidebar-footer">

        <button
          type="button"
          className="logout-btn"
          onClick={logout}
        >

          <LogOut size={16} />

          <span>
            Exit Session
          </span>

        </button>

      </div>

    </aside>

  );

};

export default UserSidebar;