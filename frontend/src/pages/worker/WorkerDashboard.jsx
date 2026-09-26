import React, { useState } from 'react';

import {
  Users,
  ShieldAlert,
  Network,
  UserCheck,
  CheckCircle,
  MessageSquare,
  X,
  Send,
  MapPin,
  AlertTriangle,
  LocateFixed,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { useAppContext } from '../../context/AppContext';

import DashboardHeader
  from './WorkerDashboardHeader';

import OperationsConsole
  from '../../components/OperationsConsole';

import StatCard
  from '../../components/StatCard';

import ActiveSOSDispatchQueue
  from '../../components/ActiveSOSDispatchQueue';

import Pagination
  from '../../components/Pagination';

import '../../components/Dashboard.css';


const WorkerDashboard = () => {

  const {
    alerts = [],
    teams = [],
    currentUser,
    workerMessages = [],
    currentRescue,

    dashboardSummary = {
      availableTeams: 0,
      activeSOS: 0,
      teamsOnRescue: 0,
      networkHealth: 'Loading...'
    },

    acceptSOS,
    completeSOS,
    acceptWorkerMessage,
    completeWorkerMessage,

    loadingRescueData

  } = useAppContext();


  // =====================================================
  // SOS FILTER STATE
  // =====================================================

  const [searchSosId, setSearchSosId] =
    useState('');

  const [filterDate, setFilterDate] =
    useState('');

  const [filterTeam, setFilterTeam] =
    useState('ALL');

  const [currentPage, setCurrentPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(10);

  // =====================================================
  // WORKER HELP MESSAGE FILTER STATE
  // =====================================================

  const [workerSearchId, setWorkerSearchId] = useState('');
  const [workerFilterDate, setWorkerFilterDate] = useState('');
  const [workerFilterTeam, setWorkerFilterTeam] = useState('ALL');
  const [workerCurrentPage, setWorkerCurrentPage] = useState(1);
  const [workerPageSize, setWorkerPageSize] = useState(10);


  // =====================================================
  // REQUEST HELP STATE
  // =====================================================

  const [showHelpModal, setShowHelpModal] =
    useState(false);

  const [helpMessage, setHelpMessage] =
    useState('');

  const [location, setLocation] =
    useState(null);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationError, setLocationError] =
    useState('');

  const [helpSent, setHelpSent] =
    useState(false);

  const [sendingHelp, setSendingHelp] =
    useState(false);


  // =====================================================
  // CURRENT USER CHECK
  // =====================================================

  if (!currentUser) {
    return null;
  }


  // =====================================================
  // WORKER TEAM
  // =====================================================

  const workerTeamId =
  currentUser?.teamId ||
  currentUser?.team?.id ||
  null;

const currentWorkerTeam =
  teams.find(
    team =>
      String(team?.id) === String(workerTeamId)
  );

const workerTeamName =
  currentWorkerTeam?.name ||
  currentUser?.teamName ||
  currentUser?.team?.name ||
  '';


  // =====================================================
  // WORKER DETAILS
  // =====================================================
console.log("CURRENT USER FULL DATA:", currentUser);
  const workerId =
    currentUser?.id ||
    currentUser?.workerId ||
    null;


const allActiveAlerts =
  alerts.filter((alert) => {
    const status =
      String(
        alert.rescueStatus ||
        alert.status ||
        ''
      ).toUpperCase();

    return status === 'PENDING';
  });

  // =====================================================
  // ACTIVE SOS
  // =====================================================
// =====================================================
// ACTIVE SOS
// =====================================================



const activeSOSCount = allActiveAlerts.length;


  // =====================================================
  // FILTER SOS
  // =====================================================

  const filteredAlerts =
    allActiveAlerts.filter((alert) => {
       // Only pending SOS should appear in dispatch queue
  if (alert.rescueStatus !== 'PENDING') {
    return false;
  }
      const sosId =
        String(
          alert.sosId ||
          alert.id ||
          ''
        );


      // SEARCH

      if (
        searchSosId &&
        !sosId
          .toLowerCase()
          .includes(
            searchSosId.toLowerCase()
          )
      ) {

        return false;

      }


      // DATE

      if (filterDate) {

        const created =
          alert.createdAt ||
          alert.timestamp;


        if (!created) {
          return false;
        }


        const alertDate =
          new Date(created)
            .toISOString()
            .split('T')[0];


        if (
          alertDate !== filterDate
        ) {

          return false;

        }

      }


      // TEAM

      if (
        filterTeam !== 'ALL'
      ) {

        const assignedTeamId =
          String(
            alert.assignedTeamId ||
            alert.teamId ||
            ''
          );


        const assignedTeamName =
          String(
            alert.assignedTeamName ||
            alert.teamName ||
            ''
          );


        if (
          assignedTeamId !==
            String(filterTeam) &&

          assignedTeamName !==
            String(filterTeam)
        ) {

          return false;

        }

      }


      return true;

    });


  // =====================================================
  // PAGINATION
  // =====================================================

  const totalRecords =
    filteredAlerts.length;


  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalRecords /
        pageSize
      )
    );


  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );


  const startIndex =
    (safeCurrentPage - 1) *
    pageSize;


  const paginatedAlerts =
    filteredAlerts.slice(
      startIndex,
      startIndex + pageSize
    );


  const endIndex =
    Math.min(
      startIndex + pageSize,
      totalRecords
    );


  // =====================================================
  // ACCEPT SOS
  // =====================================================

  const handleAssignTeam =
    async (alertId) => {

      if (!workerTeamId) {

        window.alert(
          'Your account is not linked to a rescue team.'
        );

        return;
      }


      try {

        await acceptSOS(
          alertId,
          workerTeamId,
          workerTeamName
        );


        window.alert(
          'SOS accepted successfully.'
        );


      } catch (error) {

        console.error(
          'SOS accept error:',
          error
        );


        if (
          error.message ===
          'TEAM_BUSY'
        ) {

          window.alert(
            'Your team is already handling another SOS or worker request.'
          );

          return;
        }


        window.alert(
          error.message ||
          'Unable to accept SOS.'
        );

      }

    };


  // =====================================================
  // COMPLETE SOS
  // =====================================================

  const handleCompleteSOS =
    async (alertId) => {

      if (!alertId) {

        window.alert(
          'Invalid SOS ID.'
        );

        return;
      }


      const confirmed =
        window.confirm(
          'Are you sure you want to complete this rescue?'
        );


      if (!confirmed) {
        return;
      }


      try {

        await completeSOS(
          alertId
        );


        window.alert(
          'SOS completed successfully. Your team is now available.'
        );


      } catch (error) {

        console.error(
          'SOS complete error:',
          error
        );


        window.alert(
          error.message ||
          'Unable to complete SOS.'
        );

      }

    };


  // =====================================================
  // VIEW SOS
  // =====================================================

  const handleView =
    (alertId) => {

      console.log(
        'Viewing SOS:',
        alertId
      );

    };


  // =====================================================
  // TRACK SOS
  // =====================================================

  const handleTrack =
    (alertId) => {

      console.log(
        'Tracking SOS:',
        alertId
      );

    };


  // =====================================================
  // ACCEPT WORKER MESSAGE
  // =====================================================

  const handleAcceptWorkerMessage =
    async (messageId) => {

      if (!workerTeamId) {

        window.alert(
          'Your account is not linked to a rescue team.'
        );

        return;
      }


      try {

        await acceptWorkerMessage(
          messageId,
          workerTeamId,
          workerTeamName
        );


        window.alert(
          'Worker request accepted successfully.'
        );


      } catch (error) {

        console.error(
          'Worker message accept error:',
          error
        );


        if (
          error.message ===
          'TEAM_BUSY'
        ) {

          window.alert(
            'Your team is already handling another SOS or worker request.'
          );

          return;
        }


        window.alert(
          error.message ||
          'Unable to accept worker request.'
        );

      }

    };


  // =====================================================
  // COMPLETE WORKER MESSAGE
  // =====================================================

  const handleCompleteWorkerMessage =
    async (messageId) => {

      try {

        await completeWorkerMessage(
          messageId
        );


        window.alert(
          'Worker request completed successfully.'
        );


      } catch (error) {

        console.error(
          'Worker message complete error:',
          error
        );


        window.alert(
          error.message ||
          'Unable to complete worker request.'
        );

      }

    };


  // =====================================================
  // GET WORKER GPS LOCATION
  // =====================================================

  const getWorkerLocation = () => {

    setLocationError('');
    setLocationLoading(true);
    setLocation(null);


    if (!navigator.geolocation) {

      setLocationLoading(false);

      setLocationError(
        'GPS location is not supported by this browser.'
      );

      return;
    }


    navigator.geolocation.getCurrentPosition(

      (position) => {

        const gpsData = {

          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude

        };


        console.log(
          'WORKER GPS LOCATION:',
          gpsData
        );


        setLocation(
          gpsData
        );

        setLocationLoading(false);

      },


      (error) => {

        console.error(
          'GPS LOCATION ERROR:',
          error
        );


        setLocationLoading(false);


        switch (error.code) {

          case error.PERMISSION_DENIED:

            setLocationError(
              'Location permission denied. Please allow location access.'
            );

            break;


          case error.POSITION_UNAVAILABLE:

            setLocationError(
              'Current location is unavailable.'
            );

            break;


          case error.TIMEOUT:

            setLocationError(
              'Location request timed out. Please try again.'
            );

            break;


          default:

            setLocationError(
              'Unable to get your current location.'
            );

        }

      },


      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }

    );

  };


  // =====================================================
  // OPEN HELP MODAL
  // =====================================================

  const openHelpModal = () => {

    setHelpMessage('');

    setLocation(null);

    setLocationError('');

    setHelpSent(false);

    setShowHelpModal(true);

    getWorkerLocation();

  };


  // =====================================================
  // CLOSE HELP MODAL
  // =====================================================

  const closeHelpModal = () => {

    if (sendingHelp) {
      return;
    }

    setShowHelpModal(false);

  };


  // =====================================================
  // SEND HELP REQUEST
  // =====================================================

  const handleSendHelpRequest =
    async (e) => {

      e.preventDefault();


      // -------------------------------------------------
      // MESSAGE CHECK
      // -------------------------------------------------

      if (!helpMessage.trim()) {

        setLocationError('');

        window.alert(
          'Please enter your help message.'
        );

        return;

      }


      // -------------------------------------------------
      // TEAM CHECK
      // -------------------------------------------------

      if (!workerTeamId) {

        window.alert(
          'Your account is not linked to a rescue team.'
        );

        return;

      }


      // -------------------------------------------------
      // WORKER CHECK
      // -------------------------------------------------

      if (!workerId) {

        window.alert(
          'Worker ID is missing from your account.'
        );

        return;

      }


      // -------------------------------------------------
      // GPS CHECK
      // -------------------------------------------------

      if (!location) {

        setLocationError(
          'Waiting for your GPS location. Please allow location access.'
        );

        getWorkerLocation();

        return;

      }


      // -------------------------------------------------
      // REQUEST DATA
      // -------------------------------------------------

      const requestData = {

        workerId:
          String(workerId),

        workerName:
          workerName,

        teamId:
          String(workerTeamId),

        teamName:
          workerTeamName,

        message:
          helpMessage.trim(),

        latitude:
          location.latitude,

        longitude:
          location.longitude,

        source:
          'WEB'

      };


      console.log(
        '================================='
      );

      console.log(
        'WORKER HELP REQUEST'
      );

      console.log(
        'Worker ID:',
        requestData.workerId
      );

      console.log(
        'Worker Name:',
        requestData.workerName
      );

      console.log(
        'Team ID:',
        requestData.teamId
      );

      console.log(
        'Team Name:',
        requestData.teamName
      );

      console.log(
        'Message:',
        requestData.message
      );

      console.log(
        'Latitude:',
        requestData.latitude
      );

      console.log(
        'Longitude:',
        requestData.longitude
      );

      console.log(
        'Source:',
        requestData.source
      );

      console.log(
        '================================='
      );


      // -------------------------------------------------
      // SEND TO BACKEND
      // -------------------------------------------------

      setSendingHelp(true);


      try {

        const response =
          await fetch(
            'http://localhost:8086/api/worker-messages',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json'
              },

              body:
                JSON.stringify(
                  requestData
                )
            }
          );


        let data;

        try {

          data =
            await response.json();

        } catch {

          data = null;

        }


        console.log(
          'BACKEND RESPONSE:',
          data
        );


        if (!response.ok) {

          throw new Error(
            typeof data === 'string'
              ? data
              : data?.message ||
                'Failed to send help request.'
          );

        }


        // -------------------------------------------------
        // SUCCESS
        // -------------------------------------------------

        setHelpSent(true);

      } catch (error) {

        console.error(
          'HELP REQUEST ERROR:',
          error
        );


        setLocationError(
          error.message ||
          'Unable to send help request.'
        );

      } finally {

        setSendingHelp(false);

      }

    };


 // =====================================================
// CURRENT MISSION TYPE
// =====================================================

const isWorkerHelp =
  currentRescue?.missionType === 'WORKER_HELP' ||
  currentRescue?.workerId != null ||
  currentRescue?.acceptedByTeamId != null;


// =====================================================
// CURRENT MISSION ID
// =====================================================

// Worker Message:
// use worker_messages primary key -> id
//
// SOS:
// use display ID -> sosId

const currentRescueId = isWorkerHelp
  ? currentRescue?.id
  : (
      currentRescue?.sosId ||
      alerts.find(
        alert =>
          String(alert.id) ===
          String(currentRescue?.id)
      )?.sosId
    );
    const workerName =
    currentUser?.name ||
    currentUser?.workerName ||
    'Unknown Worker';

  // =====================================================
  // WORKER HELP MESSAGES - PENDING ONLY
  // =====================================================

  const pendingWorkerMessages = Array.isArray(workerMessages)
    ? workerMessages.filter((msg) =>
        String(msg?.status || '')
          .trim()
          .toUpperCase() === 'PENDING'
      )
    : [];

  const filteredWorkerMessages =
    pendingWorkerMessages.filter((msg) => {

      const messageId = String(
        msg?.id ?? msg?.messageId ?? ''
      );

      if (
        workerSearchId &&
        !messageId
          .toLowerCase()
          .includes(workerSearchId.toLowerCase())
      ) {
        return false;
      }

      if (workerFilterDate) {
        const createdAt =
          msg?.createdAt ||
          msg?.createdTime ||
          msg?.timestamp;

        if (!createdAt) return false;

        const d = new Date(createdAt);

        if (
          Number.isNaN(d.getTime()) ||
          d.toISOString().split('T')[0] !== workerFilterDate
        ) {
          return false;
        }
      }

      if (workerFilterTeam !== 'ALL') {
        const teamId = String(msg?.teamId || '');
        const teamName = String(msg?.teamName || '');

        if (
          teamId !== String(workerFilterTeam) &&
          teamName !== String(workerFilterTeam)
        ) {
          return false;
        }
      }

      return true;
    });

  const workerTotalRecords =
    filteredWorkerMessages.length;

  const workerTotalPages = Math.max(
    1,
    Math.ceil(workerTotalRecords / workerPageSize)
  );

  const safeWorkerCurrentPage = Math.min(
    workerCurrentPage,
    workerTotalPages
  );

  const workerStartIndex =
    (safeWorkerCurrentPage - 1) * workerPageSize;

  const paginatedWorkerMessages =
    filteredWorkerMessages.slice(
      workerStartIndex,
      workerStartIndex + workerPageSize
    );

  const workerEndIndex = Math.min(
    workerStartIndex + workerPageSize,
    workerTotalRecords
  );

  const workerFilterTeams = Array.from(
    new Map(
      pendingWorkerMessages.map((msg) => {
        const id = String(
          msg?.teamId ||
          msg?.teamName ||
          ''
        );

        return [
          id,
          {
            id,
            name:
              msg?.teamName ||
              msg?.teamId ||
              'Unknown Team'
          }
        ];
      })
    ).values()
  );

  const formatWorkerMessageTime = (value) => {
    if (!value) return '—';

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
      return String(value);
    }

    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="dashboard-page">

      <div className="dashboard-container">


        {/* =================================================
            HEADER
        ================================================= */}

        <DashboardHeader

          currentUser={
            currentUser
          }

         activeAlertsCount={activeSOSCount}

          onBellClick={() =>
            console.log(
              'Notifications clicked'
            )
          }

        />


        {/* =================================================
            REQUEST HELP BUTTON
        ================================================= */}

        <div
          style={{
            marginTop: '22px',
            marginBottom: '22px'
          }}
        >

          <button
            type="button"

            onClick={
              openHelpModal
            }

            style={{
              width: '100%',
              minHeight: '88px',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',

              padding: '20px 26px',

              borderRadius: '16px',

              border:
                '1px solid rgba(245,158,11,0.45)',

              background:
                'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(15,15,18,0.98))',

              color: '#FAFAFA',

              cursor: 'pointer',

              boxShadow:
                '0 10px 35px rgba(245,158,11,0.08)',

              transition:
                'all 0.2s ease',

              textAlign: 'left'
            }}

            onMouseEnter={(e) => {

              e.currentTarget.style.transform =
                'translateY(-2px)';

              e.currentTarget.style.borderColor =
                'rgba(245,158,11,0.8)';

              e.currentTarget.style.boxShadow =
                '0 14px 40px rgba(245,158,11,0.16)';

            }}

            onMouseLeave={(e) => {

              e.currentTarget.style.transform =
                'translateY(0)';

              e.currentTarget.style.borderColor =
                'rgba(245,158,11,0.45)';

              e.currentTarget.style.boxShadow =
                '0 10px 35px rgba(245,158,11,0.08)';

            }}

          >

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '18px'
              }}
            >

              <div
                style={{
                  width: '54px',
                  height: '54px',
                  minWidth: '54px',

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',

                  borderRadius: '13px',

                  background:
                    'rgba(245,158,11,0.15)',

                  border:
                    '1px solid rgba(245,158,11,0.3)'
                }}
              >

                <MessageSquare
                  size={27}
                  color="#F59E0B"
                />

              </div>


              <div>

                <div
                  style={{
                    fontSize: '19px',
                    fontWeight: '800',
                    letterSpacing: '0.4px'
                  }}
                >
                  REQUEST HELP
                </div>

                <div
                  style={{
                    marginTop: '5px',
                    fontSize: '12px',
                    color: '#A1A1AA'
                  }}
                >
                  Send an assistance request to the base station
                </div>

              </div>

            </div>


            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',

                padding: '10px 17px',

                borderRadius: '8px',

                background:
                  '#F59E0B',

                color: '#18181B',

                fontSize: '11px',

                fontWeight: '900',

                letterSpacing: '0.6px'
              }}
            >

              <Send size={13} />

              SEND

            </div>

          </button>

        </div>

 {currentRescue && (

          <div
            className="current-rescue-card"

            style={{
              marginTop: '20px',
              marginBottom: '20px',
              padding: '24px',

              border:
                '1px solid rgba(20,184,166,0.35)',

              borderRadius: '14px',

              background:
                'rgba(15,15,18,0.96)'
            }}
          >

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',

                alignItems:
                  'center',

                gap: '15px',

                marginBottom:
                  '22px',

                flexWrap:
                  'wrap'
              }}
            >

              <div
                style={{
                  display: 'flex',
                  alignItems:
                    'center',
                  gap: '12px'
                }}
              >

                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius:
                      '10px',

                    display: 'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',

                    background:
                      'rgba(20,184,166,0.12)'
                  }}
                >

                  <CheckCircle
                    size={22}
                    color="#2dd4bf"
                  />

                </div>


                <div>

                  <h3
                    style={{
                      margin: 0,
                      color: '#2dd4bf',
                      fontSize: '18px',
                      fontWeight: '700'
                    }}
                  >
                    {isWorkerHelp
  ? 'CURRENT WORKER HELP'
  : 'CURRENT RESCUE'}
                  </h3>

                  <span
                    style={{
                      fontSize: '12px',
                      opacity: 0.65
                    }}
                  >
                    {isWorkerHelp
  ? 'Your team is currently assisting this worker'
  : 'Your team is currently handling this SOS'}
                  </span>

                </div>

              </div>


              <span
                style={{
                  padding:
                    '7px 13px',

                  borderRadius:
                    '7px',

                  fontSize:
                    '11px',

                  fontWeight:
                    '700',

                  background:
                    'rgba(245,158,11,0.14)',

                  color:
                    '#f59e0b'
                }}
              >
                IN PROGRESS
              </span>

            </div>


           <div
  style={{
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px'
  }}
>

  {isWorkerHelp ? (

    <>
      {/* WORKER NAME */}

      <div>
        <div
          style={{
            fontSize: '10px',
            opacity: 0.55,
            marginBottom: '5px'
          }}
        >
          WORKER
        </div>

        <div
          style={{
            fontWeight: '600'
          }}
        >
          {currentRescue.workerName ||
            currentRescue.worker ||
            'Unknown Worker'}
        </div>
      </div>


      {/* WORKER ID */}

      <div>
        <div
          style={{
            fontSize: '10px',
            opacity: 0.55,
            marginBottom: '5px'
          }}
        >
          WORKER ID
        </div>

        <div
          style={{
            fontWeight: '600'
          }}
        >
          {currentRescue.workerId ||
            '—'}
        </div>
      </div>


      {/* TEAM */}

      <div>
        <div
          style={{
            fontSize: '10px',
            opacity: 0.55,
            marginBottom: '5px'
          }}
        >
          REQUESTING TEAM
        </div>

        <div
          style={{
            fontWeight: '600'
          }}
        >
          {currentRescue.teamName ||
            currentRescue.teamId ||
            '—'}
        </div>
      </div>


      {/* GPS */}

      <div>
        <div
          style={{
            fontSize: '10px',
            opacity: 0.55,
            marginBottom: '5px'
          }}
        >
          GPS COORDINATES
        </div>

        <div
          style={{
            fontWeight: '600'
          }}
        >
          {currentRescue.latitude != null &&
           currentRescue.longitude != null
            ? `${currentRescue.latitude}, ${currentRescue.longitude}`
            : '—'}
        </div>
      </div>

    </>

  ) : (

    <>
      {/* EXISTING SOS DETAILS */}

      <div>
        <div
          style={{
            fontSize: '10px',
            opacity: 0.55,
            marginBottom: '5px'
          }}
        >
          SOS ID
        </div>

        <div
          style={{
            fontWeight: '600'
          }}
        >
          {currentRescue.sosId ||
            currentRescue.id ||
            '—'}
        </div>
      </div>


      <div>
        <div
          style={{
            fontSize: '10px',
            opacity: 0.55,
            marginBottom: '5px'
          }}
        >
          VICTIM
        </div>

        <div
          style={{
            fontWeight: '600'
          }}
        >
          {currentRescue.userName ||
            currentRescue.victimName ||
            currentRescue.name ||
            'Unknown'}
        </div>
      </div>


      <div>
        <div
          style={{
            fontSize: '10px',
            opacity: 0.55,
            marginBottom: '5px'
          }}
        >
          ASSIGNED TEAM
        </div>

        <div
          style={{
            fontWeight: '600'
          }}
        >
          {currentRescue.assignedTeamName ||
            currentRescue.teamName ||
            workerTeamName ||
            '—'}
        </div>
      </div>


      <div>
        <div
          style={{
            fontSize: '10px',
            opacity: 0.55,
            marginBottom: '5px'
          }}
        >
          GPS COORDINATES
        </div>

        <div
          style={{
            fontWeight: '600'
          }}
        >
          {currentRescue.latitude != null &&
           currentRescue.longitude != null
            ? `${currentRescue.latitude}, ${currentRescue.longitude}`
            : currentRescue.gpsCoordinates ||
              currentRescue.coordinates ||
              '—'}
        </div>
      </div>

    </>

  )}

</div>


            {(currentRescue.message ||
              currentRescue.description) && (

              <div
                style={{
                  marginTop:
                    '20px',

                  padding:
                    '14px 16px',

                  borderRadius:
                    '9px',

                  background:
                    'rgba(255,255,255,0.03)'
                }}
              >

                <div
                  style={{
                    fontSize: '10px',
                    opacity: 0.55,
                    marginBottom: '6px'
                  }}
                >
                 {isWorkerHelp
  ? 'WORKER HELP MESSAGE'
  : 'SOS MESSAGE'}
                </div>

                <div
                  style={{
                    lineHeight: '1.5'
                  }}
                >
                  {currentRescue.message ||
                    currentRescue.description}
                </div>

              </div>

            )}


            <div
              style={{
                marginTop: '22px',

                paddingTop: '18px',

                borderTop:
                  '1px solid rgba(255,255,255,0.07)',

                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >

             <button
  type="button"
  className="btn-primary"

  disabled={!currentRescueId}

  onClick={() => {

    if (isWorkerHelp) {

      handleCompleteWorkerMessage(
        currentRescueId
      );

    } else {

      handleCompleteSOS(
        currentRescueId
      );

    }

  }}

  style={{
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: '700'
  }}
>
  {isWorkerHelp
    ? '✓ COMPLETE HELP'
    : '✓ COMPLETE RESCUE'}
</button>

            </div>

          </div>

        )}
        {/* =================================================
            OPERATIONS CONSOLE
        ================================================= */}

        <OperationsConsole

          teamName={
            workerTeamName ||
            'Team'
          }

          baseStation={
            currentUser?.baseStation ||
            '—'
          }

        />


        {/* =================================================
            CURRENT RESCUE
        ================================================= */}

       


        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="stat-cards-grid">

          <StatCard
            label="Available Teams"
            value={
              loadingRescueData
                ? '...'
                : dashboardSummary.availableTeams
            }
            icon={Users }
            type="free"
          />

<StatCard
  label="Active SOS"
  value={
    loadingRescueData
      ? '...'
      : activeSOSCount
  }
  icon={ShieldAlert}
  type="active"
/>

          <StatCard
            label="Network Health"
            value={
              dashboardSummary.networkHealth
            }
            icon={Network}
            type="health"
          />


          <StatCard
            label="Teams On Rescue"
            value={
              loadingRescueData
                ? '...'
                : dashboardSummary.teamsOnRescue
            }
            icon={UserCheck}
            type="busy"
          />

        </div>


        {/* =================================================
            ACTIVE SOS QUEUE
        ================================================= */}

        <ActiveSOSDispatchQueue

          alerts={
            paginatedAlerts
          }

          teams={
            teams
          }

          searchSosId={
            searchSosId
          }

          setSearchSosId={(value) => {

            setSearchSosId(
              value
            );

            setCurrentPage(
              1
            );

          }}

          filterDate={
            filterDate
          }

          setFilterDate={(value) => {

            setFilterDate(
              value
            );

            setCurrentPage(
              1
            );

          }}

          filterTeam={
            filterTeam
          }

          setFilterTeam={(value) => {

            setFilterTeam(
              value
            );

            setCurrentPage(
              1
            );

          }}

          onAssign={
            handleAssignTeam
          }

          onView={
            handleView
          }

          onTrack={
            handleTrack
          }

          onComplete={
            handleCompleteSOS
          }

        />


        {/* =================================================
            PAGINATION
        ================================================= */}

        {totalRecords > 0 && (

          <Pagination

            totalRecords={
              totalRecords
            }

            startIndex={
              startIndex
            }

            endIndex={
              endIndex
            }

            pageSize={
              pageSize
            }

            setPageSize={(value) => {

              setPageSize(
                Number(value)
              );

              setCurrentPage(
                1
              );

            }}

            currentPage={
              safeCurrentPage
            }

            setCurrentPage={
              setCurrentPage
            }

            totalPages={
              totalPages
            }

          />

        )}


        {/* =================================================
            WORKER HELP MESSAGES
        ================================================= */}

   {/* ============================================================
    WORKER HELP MESSAGES
    PENDING ONLY
    ============================================================ */}

{/* =================================================
    WORKER MESSAGES - PENDING ONLY
================================================= */}

<div className="dispatch-queue-card">

          <div className="queue-header-row">
            <MessageSquare
              size={20}
              className="queue-icon"
            />
            <h3>Worker Help Messages</h3>
          </div>

          <div className="queue-filter-row">

            <div className="filter-left">
              <div className="filter-search-box">
                <span className="search-field-icon">#</span>

                <input
                  type="text"
                  className="search-field-input"
                  placeholder="Search by ID..."
                  value={workerSearchId}
                  onChange={(e) => {
                    setWorkerSearchId(e.target.value);
                    setWorkerCurrentPage(1);
                  }}
                />
              </div>
            </div>

            <div className="filter-right">

              <div className="filter-date-input-wrapper">
                <input
                  type="date"
                  className="filter-date-input"
                  value={workerFilterDate}
                  onChange={(e) => {
                    setWorkerFilterDate(e.target.value);
                    setWorkerCurrentPage(1);
                  }}
                />
              </div>

              <select
                className="filter-team-dropdown"
                value={workerFilterTeam}
                onChange={(e) => {
                  setWorkerFilterTeam(e.target.value);
                  setWorkerCurrentPage(1);
                }}
              >
                <option value="ALL">All Teams</option>

                {workerFilterTeams.map((team) => (
                  <option
                    key={team.id}
                    value={team.id}
                  >
                    {team.name}
                  </option>
                ))}
              </select>

            </div>
          </div>

          <div className="dark-table-container">

            <table className="dark-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>WORKER</th>
                  <th>TEAM</th>
                  <th>MESSAGE</th>
                  <th>STATUS</th>
                  <th>REQUESTED TIME</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>

                {paginatedWorkerMessages.length === 0 ? (

                  <tr>
                    <td
                      colSpan="7"
                      className="empty-table-cell"
                    >
                      <div className="empty-state-centered">
                        <MessageSquare size={30} />
                        <span>
                          No pending worker messages
                        </span>
                      </div>
                    </td>
                  </tr>

                ) : (

                  paginatedWorkerMessages.map((msg) => {

                    const messageId =
                      msg?.id ??
                      msg?.messageId ??
                      '—';

                    const workerName =
                      msg?.workerName ||
                      msg?.workerId ||
                      'Unknown Worker';

                    const teamName =
                      msg?.teamName ||
                      msg?.teamId ||
                      'Unknown Team';

                    const messageText =
                      msg?.message ||
                      'No message';

                    const createdAt =
                      msg?.createdAt ||
                      msg?.createdTime ||
                      msg?.timestamp;

                    return (
                      <tr key={String(messageId)}>

                        <td className="font-red">
                          {messageId}
                        </td>

                        <td>
                          {workerName}
                        </td>

                        <td className="team-td">
                          {teamName}
                        </td>

                        <td>
                          {messageText}
                        </td>

                        <td>
                          <span className="font-red">
                            PENDING
                          </span>
                        </td>

                        <td>
                          {formatWorkerMessageTime(createdAt)}
                        </td>

                        <td>
                          <div className="table-actions-flex">
                            <button
                              type="button"
                              className="btn-action-dark btn-action-dark-primary"
                              onClick={() =>
                                handleAcceptWorkerMessage(messageId)
                              }
                            >
                              ACCEPT
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })

                )}

              </tbody>

            </table>
          </div>

          {workerTotalRecords > 0 && (

            <div className="pagination-container-dark">

              <div className="pagination-left-info">
                Showing {workerStartIndex + 1}–{workerEndIndex}
                {' of '}
                {workerTotalRecords} pending messages
              </div>

              <div className="rows-page-selector-flex">

                <span className="rows-label-text">
                  Rows:
                </span>

                <select
                  className="rows-dropdown-field"
                  value={workerPageSize}
                  onChange={(e) => {
                    setWorkerPageSize(Number(e.target.value));
                    setWorkerCurrentPage(1);
                  }}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>

              </div>

              <div className="pagination-right-buttons">

                <button
                  type="button"
                  className="pagination-control-button"
                  disabled={safeWorkerCurrentPage === 1}
                  onClick={() =>
                    setWorkerCurrentPage(
                      safeWorkerCurrentPage - 1
                    )
                  }
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>

                <div className="pagination-numbers-row">

                  {Array.from(
                    { length: workerTotalPages },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      type="button"
                      key={page}
                      className={
                        `number-selector-btn ${
                          safeWorkerCurrentPage === page
                            ? 'number-selector-btn-active'
                            : ''
                        }`
                      }
                      onClick={() =>
                        setWorkerCurrentPage(page)
                      }
                    >
                      {page}
                    </button>
                  ))}

                </div>

                <button
                  type="button"
                  className="pagination-control-button"
                  disabled={
                    safeWorkerCurrentPage ===
                    workerTotalPages
                  }
                  onClick={() =>
                    setWorkerCurrentPage(
                      safeWorkerCurrentPage + 1
                    )
                  }
                >
                  Next
                  <ChevronRight size={14} />
                </button>

              </div>

            </div>

          )}

        </div>
      </div>


      {/* =====================================================
          REQUEST HELP MODAL
      ===================================================== */}

      {showHelpModal && (

        <div

          style={{
            position: 'fixed',

            inset: 0,

            zIndex: 9999,

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'center',

            padding: '20px',

            background:
              'rgba(0,0,0,0.76)',

            backdropFilter:
              'blur(7px)'
          }}

          onClick={
            closeHelpModal
          }

        >

          <div

            style={{
              width: '100%',

              maxWidth: '570px',

              maxHeight: '90vh',

              overflowY: 'auto',

              borderRadius: '17px',

              border:
                '1px solid rgba(245,158,11,0.38)',

              background:
                '#111114',

              boxShadow:
                '0 25px 80px rgba(0,0,0,0.6)'
            }}

            onClick={(e) =>
              e.stopPropagation()
            }

          >

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div

              style={{
                display: 'flex',

                alignItems: 'center',

                justifyContent:
                  'space-between',

                padding: '20px 22px',

                borderBottom:
                  '1px solid rgba(255,255,255,0.08)'
              }}

            >

              <div

                style={{
                  display: 'flex',

                  alignItems: 'center',

                  gap: '12px'
                }}

              >

                <div

                  style={{
                    width: '44px',

                    height: '44px',

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'center',

                    borderRadius: '11px',

                    background:
                      'rgba(245,158,11,0.14)',

                    border:
                      '1px solid rgba(245,158,11,0.25)'
                  }}

                >

                  <AlertTriangle

                    size={22}

                    color="#F59E0B"

                  />

                </div>


                <div>

                  <h2

                    style={{
                      margin: 0,

                      color: '#FAFAFA',

                      fontSize: '18px',

                      fontWeight: '800'
                    }}

                  >
                    REQUEST ASSISTANCE
                  </h2>


                  <p

                    style={{
                      margin:
                        '4px 0 0',

                      color:
                        '#71717A',

                      fontSize:
                        '12px'
                    }}

                  >
                    Send a help request to the base station

                  </p>

                </div>

              </div>


              <button

                type="button"

                onClick={
                  closeHelpModal
                }

                disabled={
                  sendingHelp
                }

                style={{
                  width: '34px',

                  height: '34px',

                  display: 'flex',

                  alignItems: 'center',

                  justifyContent: 'center',

                  borderRadius: '8px',

                  border:
                    '1px solid rgba(255,255,255,0.1)',

                  background:
                    'rgba(255,255,255,0.04)',

                  color:
                    '#A1A1AA',

                  cursor:
                    'pointer'
                }}

              >

                <X size={18} />

              </button>

            </div>


            {!helpSent ? (

              <form

                onSubmit={
                  handleSendHelpRequest
                }

                style={{
                  padding: '22px'
                }}

              >

                {/* =================================================
                    WORKER + TEAM
                ================================================= */}

                <div

                  style={{
                    display: 'grid',

                    gridTemplateColumns:
                      '1fr 1fr',

                    gap: '12px',

                    marginBottom:
                      '20px'
                  }}

                >

                  <div

                    style={{
                      padding: '13px',

                      borderRadius: '9px',

                      background:
                        'rgba(255,255,255,0.03)',

                      border:
                        '1px solid rgba(255,255,255,0.07)'
                    }}

                  >

                    <div

                      style={{
                        fontSize: '9px',

                        color:
                          '#71717A',

                        letterSpacing:
                          '1px',

                        marginBottom:
                          '5px'
                      }}

                    >
                      WORKER
                    </div>


                    <div

                      style={{
                        fontSize:
                          '13px',

                        fontWeight:
                          '700',

                        color:
                          '#FAFAFA'
                      }}

                    >
                      {workerName}

                    </div>

                  </div>


                  <div

                    style={{
                      padding: '13px',

                      borderRadius: '9px',

                      background:
                        'rgba(255,255,255,0.03)',

                      border:
                        '1px solid rgba(255,255,255,0.07)'
                    }}

                  >

                    <div

                      style={{
                        fontSize: '9px',

                        color:
                          '#71717A',

                        letterSpacing:
                          '1px',

                        marginBottom:
                          '5px'
                      }}

                    >
                      TEAM
                    </div>


                    <div

                      style={{
                        fontSize:
                          '13px',

                        fontWeight:
                          '700',

                        color:
                          '#2DD4BF'
                      }}

                    >

                      {workerTeamName ||
                        workerTeamId ||
                        'Not assigned'}

                    </div>

                  </div>

                </div>


                {/* =================================================
                    MESSAGE
                ================================================= */}

                <div

                  style={{
                    marginBottom:
                      '18px'
                  }}

                >

                  <label

                    style={{
                      display: 'block',

                      marginBottom:
                        '8px',

                      color:
                        '#D4D4D8',

                      fontSize:
                        '11px',

                      fontWeight:
                        '700',

                      letterSpacing:
                        '0.7px'
                    }}

                  >
                    HELP MESSAGE
                  </label>


                  <textarea

                    value={
                      helpMessage
                    }

                    onChange={(e) =>
                      setHelpMessage(
                        e.target.value
                      )
                    }

                    placeholder="Describe what assistance your team needs..."

                    rows={5}

                    disabled={
                      sendingHelp
                    }

                    style={{
                      width: '100%',

                      boxSizing:
                        'border-box',

                      resize:
                        'vertical',

                      padding:
                        '13px 14px',

                      borderRadius:
                        '9px',

                      border:
                        '1px solid rgba(255,255,255,0.1)',

                      background:
                        'rgba(255,255,255,0.035)',

                      color:
                        '#FAFAFA',

                      outline:
                        'none',

                      fontSize:
                        '13px',

                      lineHeight:
                        '1.5',

                      fontFamily:
                        'inherit'
                    }}

                  />

                </div>


                {/* =================================================
                    AUTOMATIC GPS
                ================================================= */}

                <div

                  style={{
                    marginBottom:
                      '22px',

                    padding:
                      '14px 15px',

                    borderRadius:
                      '10px',

                    border:
                      location

                        ? '1px solid rgba(34,197,94,0.3)'

                        : '1px solid rgba(245,158,11,0.25)',

                    background:
                      location

                        ? 'rgba(34,197,94,0.06)'

                        : 'rgba(245,158,11,0.05)'
                  }}

                >

                  <div

                    style={{
                      display: 'flex',

                      alignItems:
                        'center',

                      gap: '10px'
                    }}

                  >

                    <div

                      style={{
                        width: '35px',

                        height: '35px',

                        minWidth: '35px',

                        display: 'flex',

                        alignItems:
                          'center',

                        justifyContent:
                          'center',

                        borderRadius:
                          '9px',

                        background:
                          location

                            ? 'rgba(34,197,94,0.12)'

                            : 'rgba(245,158,11,0.12)'
                      }}

                    >

                      {locationLoading ? (

                        <LocateFixed
                          size={17}
                          color="#F59E0B"
                        />

                      ) : (

                        <MapPin
                          size={17}

                          color={
                            location
                              ? '#22C55E'
                              : '#F59E0B'
                          }

                        />

                      )}

                    </div>


                    <div
                      style={{
                        flex: 1
                      }}
                    >

                      <div

                        style={{
                          fontSize:
                            '11px',

                          fontWeight:
                            '800',

                          color:
                            '#FAFAFA'
                        }}

                      >

                        {locationLoading

                          ? 'GETTING GPS LOCATION...'

                          : location

                            ? 'GPS LOCATION READY'

                            : 'GPS LOCATION REQUIRED'}

                      </div>


                      <div

                        style={{
                          marginTop:
                            '4px',

                          fontSize:
                            '11px',

                          color:
                            '#71717A'
                        }}

                      >

                        {location

                          ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`

                          : 'Your current location will be attached automatically'}

                      </div>

                    </div>


                    {!location &&
                     !locationLoading && (

                      <button

                        type="button"

                        onClick={
                          getWorkerLocation
                        }

                        style={{
                          padding:
                            '7px 10px',

                          borderRadius:
                            '7px',

                          border:
                            '1px solid rgba(245,158,11,0.3)',

                          background:
                            'rgba(245,158,11,0.08)',

                          color:
                            '#F59E0B',

                          fontSize:
                            '10px',

                          fontWeight:
                            '800',

                          cursor:
                            'pointer'
                        }}

                      >
                        RETRY GPS

                      </button>

                    )}

                  </div>


                  {locationError && (

                    <div

                      style={{
                        marginTop:
                          '10px',

                        paddingTop:
                          '10px',

                        borderTop:
                          '1px solid rgba(255,255,255,0.06)',

                        color:
                          '#FCA5A5',

                        fontSize:
                          '11px',

                        lineHeight:
                          '1.4'
                      }}

                    >

                      {locationError}

                    </div>

                  )}

                </div>


                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div

                  style={{
                    display: 'flex',

                    justifyContent:
                      'flex-end',

                    gap: '10px'
                  }}

                >

                  <button

                    type="button"

                    onClick={
                      closeHelpModal
                    }

                    disabled={
                      sendingHelp
                    }

                    style={{
                      padding:
                        '11px 18px',

                      borderRadius:
                        '8px',

                      border:
                        '1px solid rgba(255,255,255,0.1)',

                      background:
                        'rgba(255,255,255,0.04)',

                      color:
                        '#A1A1AA',

                      fontWeight:
                        '700',

                      cursor:
                        'pointer'
                    }}

                  >
                    CANCEL

                  </button>


                  <button

                    type="submit"

                    disabled={
                      sendingHelp ||
                      locationLoading ||
                      !location
                    }

                    style={{
                      display: 'flex',

                      alignItems:
                        'center',

                      gap: '8px',

                      padding:
                        '11px 20px',

                      borderRadius:
                        '8px',

                      border:
                        'none',

                      background:
                        sendingHelp ||
                        locationLoading ||
                        !location

                          ? '#52525B'

                          : '#F59E0B',

                      color:
                        sendingHelp ||
                        locationLoading ||
                        !location

                          ? '#A1A1AA'

                          : '#18181B',

                      fontWeight:
                        '800',

                      cursor:
                        sendingHelp ||
                        locationLoading ||
                        !location

                          ? 'not-allowed'

                          : 'pointer'
                    }}

                  >

                    <Send size={15} />

                    {sendingHelp
                      ? 'SENDING...'
                      : 'SEND REQUEST'}

                  </button>

                </div>

              </form>

            ) : (

              /* =================================================
                 SUCCESS
              ================================================= */

              <div

                style={{
                  padding:
                    '45px 25px',

                  textAlign:
                    'center'
                }}

              >

                <div

                  style={{
                    width:
                      '66px',

                    height:
                      '66px',

                    margin:
                      '0 auto 18px',

                    display:
                      'flex',

                    alignItems:
                      'center',

                    justifyContent:
                      'center',

                    borderRadius:
                      '50%',

                    background:
                      'rgba(34,197,94,0.12)',

                    border:
                      '1px solid rgba(34,197,94,0.3)'
                  }}

                >

                  <CheckCircle
                    size={33}
                    color="#22C55E"
                  />

                </div>


                <h3

                  style={{
                    margin:
                      0,

                    color:
                      '#FAFAFA',

                    fontSize:
                      '19px',

                    fontWeight:
                      '800'
                  }}

                >
                  REQUEST SENT

                </h3>


                <p

                  style={{
                    margin:
                      '9px auto 0',

                    maxWidth:
                      '400px',

                    color:
                      '#A1A1AA',

                    fontSize:
                      '13px',

                    lineHeight:
                      '1.5'
                  }}

                >

                  Your assistance request has been sent with your current GPS location.

                </p>


                <div

                  style={{
                    margin:
                      '18px auto 0',

                    maxWidth:
                      '320px',

                    padding:
                      '11px 14px',

                    borderRadius:
                      '9px',

                    background:
                      'rgba(255,255,255,0.03)',

                    border:
                      '1px solid rgba(255,255,255,0.07)',

                    fontSize:
                      '11px',

                    color:
                      '#A1A1AA'
                  }}

                >

                  <div>
                    SOURCE:
                    <strong
                      style={{
                        color:
                          '#F59E0B'
                      }}
                    >
                      {' '}WEB
                    </strong>
                  </div>


                  {location && (

                    <div
                      style={{
                        marginTop: '5px'
                      }}
                    >
                      GPS:
                      {' '}
                      {location.latitude.toFixed(6)},
                      {' '}
                      {location.longitude.toFixed(6)}
                    </div>

                  )}

                </div>


                <button

                  type="button"

                  onClick={
                    closeHelpModal
                  }

                  style={{
                    marginTop:
                      '24px',

                    padding:
                      '11px 25px',

                    borderRadius:
                      '8px',

                    border:
                      'none',

                    background:
                      '#22C55E',

                    color:
                      '#052E16',

                    fontWeight:
                      '800',

                    cursor:
                      'pointer'
                  }}

                >
                  CLOSE

                </button>

              </div>

            )}

          </div>

        </div>

      )}

    </div>

  );

};
export default WorkerDashboard;