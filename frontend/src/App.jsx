import React, { useState, useEffect } from 'react';
import { useAppContext } from './context/AppContext';
import LandingPage from './pages/auth/LandingPage';
import UserDashboard from './pages/user/UserDashboard';
import DeviceDetails from './pages/user/DeviceDetails';
import UserSOSHistory from './pages/user/SOSHistory';
import UserProfile from './pages/user/Profile';
import AIPrediction from './pages/user/AIPrediction';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import RescueTracking from './pages/worker/RescueTracking';
import WorkerTeams from './pages/worker/TeamManagement';
import WorkerRelayMonitoring from './pages/worker/RelayMonitoring';
import WorkerSOSHistory from './pages/worker/SOSHistory';
import WorkerMessages from './pages/worker/WorkerMessages';
import WorkerAIPrediction from './pages/worker/AIPrediction';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import WorkerManagement from './pages/admin/WorkerManagement';
import AdminTeamManagement from './pages/admin/TeamManagement';
import AdminRelayNodes from './pages/admin/RelayMonitoring';
import AdminSOSHistory from './pages/admin/SOSHistory';
import AdminWorkerMessages from './pages/admin/WorkerMessages';
import AdminAIMonitoring from './pages/admin/AIPrediction';
import AdminHelpSupport from './pages/admin/HelpSupportPage';
import AdminSidebar from './pages/admin/AdminSidebar';
import AdminHeader from './pages/admin/AdminHeader';

import WorkerSidebar from './pages/worker/WorkerSidebar';
import WorkerHeader from './pages/worker/WorkerHeader';

import UserSidebar from './pages/user/UserSidebar';
import UserHeader from './pages/user/UserHeader';

import { X } from 'lucide-react';

// =====================================================
// APP
// =====================================================

function App() {

  // =====================================================
  // CONTEXT
  // =====================================================

  const {
    currentUser
  } = useAppContext();


  // =====================================================
  // ACTIVE TAB
  // =====================================================

  const [
    activeTab,
    setActiveTab
  ] = useState('dashboard');


  // =====================================================
  // MOBILE SIDEBAR
  // =====================================================

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen
  ] = useState(false);


  // =====================================================
  // NORMALIZE ROLE
  // IMPORTANT:
  // KEEP THIS BEFORE ANY CONDITIONAL RETURN
  // =====================================================

  const role = String(
    currentUser?.role || 'WORKER'
  )
    .trim()
    .toUpperCase();


  console.log(
    'CURRENT USER ROLE:',
    role
  );


  // =====================================================
  // VALID TABS
  // =====================================================

  const validTabsForRole = {

    // ===================================================
    // USER
    // ===================================================

    USER: [
      'dashboard',
      'devices',
      'history',
      'profile',
      'aiprediction'
    ],


    // ===================================================
    // WORKER
    // ===================================================

    WORKER: [
      'dashboard',
      'tracking',
      'teams',
      'relays',
      'history',
      'messages',
      'prediction'
    ],


    // ===================================================
    // ADMIN
    // ===================================================

    ADMIN: [
      'dashboard',
      'users',
      'workers',
      'teams',
      'history',
      'messages',
      'prediction',
      'relays',
      'support',
      'profile'
    ]

  };


  const currentRoleTabs =
    validTabsForRole[role] || [];


  // =====================================================
  // SYNC TAB WITH ROLE
  // =====================================================

  useEffect(() => {

    if (
      currentUser &&
      !currentRoleTabs.includes(activeTab)
    ) {

      setActiveTab(
        'dashboard'
      );

    }

  }, [
    currentUser,
    role,
    activeTab
  ]);


  // =====================================================
  // LOGIN CHECK
  // =====================================================

  if (!currentUser) {

    return <LandingPage />;

  }


  // =====================================================
  // PAGE VARIABLES
  // =====================================================

  let pageComponent = null;

  let activeTabLabel =
    'Dashboard';

  let pageTitle =
    'ResQMesh Operations';


  // =====================================================
  // USER
  // =====================================================

  if (role === 'USER') {

    switch (activeTab) {

      // =================================================
      // USER DASHBOARD
      // =================================================

      case 'dashboard':

        pageComponent =
          <UserDashboard />;

        activeTabLabel =
          'Emergency Communication Network';

        pageTitle =
          'Victim Dashboard';

        break;


      // =================================================
      // USER DEVICES
      // =================================================

      case 'devices':

        pageComponent =
          <DeviceDetails />;

        activeTabLabel =
          'Hardware Registry';

        pageTitle =
          'My LoRa Beacons';

        break;


      // =================================================
      // USER SOS HISTORY
      // =================================================

      case 'history':

        pageComponent =
          <UserSOSHistory />;

        activeTabLabel =
          'Distress Logs';

        pageTitle =
          'Rescue Timeline History';

        break;


      // =================================================
      // USER PROFILE
      // =================================================

      case 'profile':

        pageComponent =
          <UserProfile />;

        activeTabLabel =
          'Profile';

        pageTitle =
          'Profile';

        break;


      // =================================================
      // USER AI PREDICTION
      // =================================================

      case 'aiprediction':

        console.log(
          '🔥 LOADING USER AI PREDICTION'
        );

        pageComponent =
          <AIPrediction />;

        activeTabLabel =
          'AI Prediction';

        pageTitle =
          'AI Prediction';

        break;


      // =================================================
      // DEFAULT USER PAGE
      // =================================================

      default:

        pageComponent =
          <UserDashboard />;

        activeTabLabel =
          'Emergency Communication Network';

        pageTitle =
          'Victim Dashboard';

        break;

    }

  }


  // =====================================================
  // WORKER
  // =====================================================

  else if (role === 'WORKER') {

    switch (activeTab) {

      // =================================================
      // WORKER DASHBOARD
      // =================================================

      case 'dashboard':

        pageComponent =
          <WorkerDashboard />;

        activeTabLabel =
          'Dashboard';

        pageTitle =
          'Dashboard';

        break;


      // =================================================
      // WORKER TRACKING
      // =================================================

      case 'tracking':

        pageComponent =
          <RescueTracking />;

        activeTabLabel =
          'Rescue Tracking';

        pageTitle =
          'Rescue Tracking';

        break;


      // =================================================
      // WORKER TEAMS
      // =================================================

      case 'teams':

        pageComponent =
          <WorkerTeams />;

        activeTabLabel =
          'Rescue Teams';

        pageTitle =
          'Rescue Teams';

        break;


      // =================================================
      // WORKER RELAYS
      // =================================================

      case 'relays':

        console.log(
          '🔥 LOADING WORKER RELAY MONITORING'
        );

        pageComponent =
          <WorkerRelayMonitoring />;

        activeTabLabel =
          'Relay Network Monitoring';

        pageTitle =
          'Relay Network Monitoring';

        break;


      // =================================================
      // WORKER HISTORY
      // =================================================

      case 'history':

        pageComponent =
          <WorkerSOSHistory />;

        activeTabLabel =
          'SOS History';

        pageTitle =
          'SOS History';

        break;


      // =================================================
      // WORKER MESSAGES
      // =================================================

      case 'messages':

        pageComponent =
          <WorkerMessages />;

        activeTabLabel =
          'Worker Messages';

        pageTitle =
          'Worker Messages';

        break;


      // =================================================
      // WORKER AI PREDICTION
      // =================================================

      case 'prediction':

        pageComponent =
          <WorkerAIPrediction />;

        activeTabLabel =
          'AI Prediction';

        pageTitle =
          'AI Prediction';

        break;


      // =================================================
      // DEFAULT WORKER
      // =================================================

      default:

        pageComponent =
          <WorkerDashboard />;

        activeTabLabel =
          'Dashboard';

        pageTitle =
          'Dashboard';

        break;

    }

  }


  // =====================================================
  // ADMIN
  // =====================================================

  else if (role === 'ADMIN') {

    switch (activeTab) {

      // =================================================
      // ADMIN DASHBOARD
      // =================================================

      case 'dashboard':

        pageComponent =
          <AdminDashboard
            setActiveTab={setActiveTab}
          />;

        activeTabLabel =
          'Dashboard';

        pageTitle =
          'Dashboard';

        break;


      // =================================================
      // ADMIN USERS
      // =================================================

      case 'users':

        pageComponent =
          <UserManagement />;

        activeTabLabel =
          'Manage Victims';

        pageTitle =
          'Registered Survivors Registry';

        break;


      // =================================================
      // ADMIN WORKERS
      // =================================================

      case 'workers':

        pageComponent =
          <WorkerManagement />;

        activeTabLabel =
          'Workers';

        pageTitle =
          'Workers';

        break;


      // =================================================
      // ADMIN TEAMS
      // =================================================

      case 'teams':

        pageComponent =
          <AdminTeamManagement />;

        activeTabLabel =
          'Rescue Teams';

        pageTitle =
          'Rescue Teams';

        break;


      // =================================================
      // ADMIN HISTORY
      // =================================================

      case 'history':

        pageComponent =
          <AdminSOSHistory />;

        activeTabLabel =
          'SOS History';

        pageTitle =
          'SOS History';

        break;


      // =================================================
      // ADMIN MESSAGES
      // =================================================

      case 'messages':

        pageComponent =
          <AdminWorkerMessages />;

        activeTabLabel =
          'Worker Messages';

        pageTitle =
          'Worker Messages';

        break;


      // =================================================
      // ADMIN AI MONITORING
      // =================================================

      case 'prediction':

        pageComponent =
          <AdminAIMonitoring />;

        activeTabLabel =
          'AI Monitoring';

        pageTitle =
          'AI Monitoring';

        break;


      // =================================================
      // ADMIN RELAYS
      // =================================================

      case 'relays':

        pageComponent =
          <AdminRelayNodes />;

        activeTabLabel =
          'Relay Nodes';

        pageTitle =
          'Relay Nodes';

        break;


      // =================================================
      // ADMIN SUPPORT
      // =================================================

      case 'support':

        pageComponent =
          <AdminHelpSupport />;

        activeTabLabel =
          'Help & Support';

        pageTitle =
          'Help & Support';

        break;


      // =================================================
      // ADMIN PROFILE
      // =================================================

      case 'profile':

        pageComponent =
          <UserProfile />;

        activeTabLabel =
          'Profile';

        pageTitle =
          'Profile';

        break;


      // =================================================
      // DEFAULT ADMIN
      // =================================================

      default:

        pageComponent =
          <AdminDashboard
            setActiveTab={setActiveTab}
          />;

        activeTabLabel =
          'Dashboard';

        pageTitle =
          'Dashboard';

        break;

    }

  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="app-container">


      {/* =================================================
          DESKTOP SIDEBAR
      ================================================= */}

      {role === 'ADMIN' && (

        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

      )}


      {role === 'WORKER' && (

        <WorkerSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

      )}


      {role === 'USER' && (

        <UserSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

      )}


      {/* =================================================
          MOBILE SIDEBAR
      ================================================= */}

      {mobileSidebarOpen && (

        <div
          className="mobile-sidebar-backdrop"
          onClick={() =>
            setMobileSidebarOpen(false)
          }
        >

          <div
            className="mobile-sidebar-drawer"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* ===========================================
                MOBILE HEADER
            =========================================== */}

            <div
              className="mobile-drawer-header flex-between"
            >

              <h3>
                Navigation Menu
              </h3>

              <button
                type="button"
                className="close-drawer-btn"
                onClick={() =>
                  setMobileSidebarOpen(false)
                }
              >

                <X size={20} />

              </button>

            </div>


            {/* ===========================================
                ADMIN MOBILE SIDEBAR
            =========================================== */}

            {role === 'ADMIN' && (

              <AdminSidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {

                  setActiveTab(tab);

                  setMobileSidebarOpen(
                    false
                  );

                }}
              />

            )}


            {/* ===========================================
                WORKER MOBILE SIDEBAR
            =========================================== */}

            {role === 'WORKER' && (

              <WorkerSidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {

                  setActiveTab(tab);

                  setMobileSidebarOpen(
                    false
                  );

                }}
              />

            )}


            {/* ===========================================
                USER MOBILE SIDEBAR
            =========================================== */}

            {role === 'USER' && (

              <UserSidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {

                  setActiveTab(tab);

                  setMobileSidebarOpen(
                    false
                  );

                }}
              />

            )}

          </div>

        </div>

      )}


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div
        className="main-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh'
        }}
      >


        {/* =================================================
            HEADERS
        ================================================= */}

        {role === 'ADMIN' && (

          <AdminHeader
            activeTab={activeTab}
            activeTabLabel={activeTabLabel}
            title={pageTitle}
            onMenuClick={() =>
              setMobileSidebarOpen(true)
            }
            setActiveTab={setActiveTab}
          />

        )}


        {role === 'WORKER' && (

          <WorkerHeader
            activeTab={activeTab}
            activeTabLabel={activeTabLabel}
            title={pageTitle}
            onMenuClick={() =>
              setMobileSidebarOpen(true)
            }
            setActiveTab={setActiveTab}
          />

        )}


        {role === 'USER' && (

          <UserHeader
            activeTab={activeTab}
            activeTabLabel={activeTabLabel}
            title={pageTitle}
            onMenuClick={() =>
              setMobileSidebarOpen(true)
            }
            setActiveTab={setActiveTab}
          />

        )}


        {/* =================================================
            PAGE
        ================================================= */}

        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}
        >

          {pageComponent}

        </main>


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer
          style={{
            padding: '16px 32px',
            borderTop:
              '1px solid var(--border-muted)',
            background:
              'rgba(2, 8, 23, 0.4)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '40px',
            width: '100%'
          }}
        >

          <span>
            © 2026 ResQMesh.
            Emergency LoRa Communications System.
            All rights reserved.
          </span>

          <span>
            Base Station Base Console v2.4.1
          </span>

        </footer>


      </div>


      {/* =================================================
          MOBILE DRAWER CSS
      ================================================= */}

      <style>{`

        .mobile-sidebar-backdrop {

          position: fixed;

          top: 0;
          left: 0;
          right: 0;
          bottom: 0;

          background:
            rgba(2, 8, 23, 0.75);

          backdrop-filter:
            blur(8px);

          z-index: 1000;

          display: flex;

        }


        .mobile-sidebar-drawer {

          width: 300px;

          height: 100%;

          background: #020817;

          border-right:
            1px solid var(--border-muted);

          position: relative;

          display: flex;

          flex-direction: column;

        }


        .mobile-drawer-header {

          padding: 16px;

          border-bottom:
            1px solid var(--border-muted);

        }


        .mobile-sidebar-drawer
        .sidebar-container {

          position: relative;

          display: flex;

          width: 100%;

          border: none;

          background: transparent;

        }


        .close-drawer-btn {

          background: none;

          border: none;

          color: var(--text-primary);

          cursor: pointer;

        }

      `}</style>


    </div>

  );

}


export default App;