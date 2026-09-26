import React from 'react';
import './WorkerSidebar.css';

import { useAppContext } from '../../context/AppContext';

import {
  LayoutDashboard,
  History,
  LogOut,
  Activity,
  UserCheck,
  Mail,
  Sparkles,
  ShieldAlert,
  Network
} from 'lucide-react';


const WorkerSidebar = ({
  activeTab,
  setActiveTab
}) => {

  const {
    currentUser,
    logout
  } = useAppContext();


  // =====================================================
  // NO USER
  // =====================================================

  if (!currentUser) {
    return null;
  }


  // =====================================================
  // ROLE
  // =====================================================

  const role =
    currentUser.role ||
    'WORKER';


  // =====================================================
  // MENU ITEMS
  // =====================================================

  const menuItems = {

    WORKER: [

      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard
      },

      {
        id: 'tracking',
        label: 'Rescue Tracking',
        icon: Activity
      },

      {
        id: 'teams',
        label: 'Teams',
        icon: UserCheck
      },

      {
        id: 'relays',
        label: 'Relay Monitoring',
        icon: Network
      },

      {
        id: 'history',
        label: 'SOS History',
        icon: History
      },

      {
        id: 'messages',
        label: 'Worker Messages',
        icon: Mail
      },

      {
        id: 'prediction',
        label: 'AI Prediction',
        icon: Sparkles
      }

    ]

  };


  const currentMenu =
    menuItems[role] ||
    menuItems.WORKER ||
    [];


  // =====================================================
  // USER NAME
  // =====================================================

  const userName =
    currentUser.name ||
    currentUser.email?.split('@')[0] ||
    'Worker';


  // =====================================================
  // AVATAR
  // =====================================================

  const initials =
    userName
      .split(' ')
      .filter(Boolean)
      .map(
        name => name[0]
      )
      .join('')
      .slice(0, 2)
      .toUpperCase();


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <aside
      className="sidebar-container glass-panel"
    >

      {/* =================================================
          BRAND HEADER
      ================================================= */}

      <div className="sidebar-header">

        <div
          className="brand-logo pulse-blue"
        >
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
          PROFILE SUMMARY
      ================================================= */}

      <div className="sidebar-profile">

        <div className="avatar-glow">

          <div className="profile-avatar">

            {initials}

          </div>

          <span
            className="profile-badge-dot"
          />

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

          {currentMenu.map(
            (item) => {

              const Icon =
                item.icon;


              const isActive =
                activeTab === item.id;


              return (

                <li
                  key={item.id}
                >

                  <button

                    type="button"

                    onClick={() =>
                      setActiveTab(
                        item.id
                      )
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

                      <div
                        className="active-glow-bar"
                      />

                    )}

                  </button>

                </li>

              );

            }
          )}

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


export default WorkerSidebar;