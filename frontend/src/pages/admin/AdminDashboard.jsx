import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';

import {
  ShieldAlert,
  Activity,
  Users,
  UserCheck,
  MessageSquare
} from 'lucide-react';

// Reusable Dashboard Elements
import DashboardHeader from './AdminHeader';
import OperationsConsole from '../../components/OperationsConsole';
import StatCard from '../../components/StatCard';

// Dedicated styles
import '../../components/Dashboard.css';

const AUTH_API = 'http://localhost:8081';
const RESCUE_API = 'http://localhost:8086';

const AdminDashboard = ({ setActiveTab }) => {

  const {
    currentUser
  } = useAppContext();

  // =========================================================
  // ADMIN DASHBOARD DATA
  // =========================================================

  const [adminSOS, setAdminSOS] = useState([]);
  const [adminTeams, setAdminTeams] = useState([]);
  const [adminWorkerMessages, setAdminWorkerMessages] = useState([]);

  const [dashboardSummary, setDashboardSummary] = useState({
    availableTeams: 0,
    activeSOS: 0,
    teamsOnRescue: 0,
    networkHealth: 'Loading...'
  });

  const [loadingSOS, setLoadingSOS] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingWorkerMessages, setLoadingWorkerMessages] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // =========================================================
  // FETCH DASHBOARD SUMMARY
  // =========================================================

  useEffect(() => {

    const fetchAdminDashboardSummary = async () => {

      try {

        setLoadingSummary(true);

        const response = await fetch(
          `${RESCUE_API}/api/dashboard/summary`
        );

        if (!response.ok) {
          throw new Error(
            `Dashboard summary API returned ${response.status}`
          );
        }

        const data = await response.json();

        console.log(
          'ADMIN DASHBOARD SUMMARY FROM DATABASE:',
          data
        );

        setDashboardSummary({

          activeSOS:
            Number(data?.activeSOS ?? 0),

          availableTeams:
            Number(data?.availableTeams ?? 0),

          teamsOnRescue:
            Number(data?.teamsOnRescue ?? 0)

        });

      } catch (error) {

        console.error(
          'Admin dashboard summary error:',
          error
        );

        setDashboardSummary({
          activeSOS: 0,
          availableTeams: 0,
          teamsOnRescue: 0
        });

      } finally {

        setLoadingSummary(false);

      }

    };

    fetchAdminDashboardSummary();

  }, []);

  // =========================================================
  // FETCH ALL SOS
  // =========================================================

  useEffect(() => {

    const fetchAdminSOS = async () => {

      try {

        setLoadingSOS(true);

        const response = await fetch(
          `${RESCUE_API}/api/dashboard/sos/all`
        );

        if (!response.ok) {
          throw new Error(
            `SOS API returned ${response.status}`
          );
        }

        const data = await response.json();

        console.log(
          'ADMIN - ALL SOS FROM DATABASE:',
          data
        );

        setAdminSOS(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(
          'Admin SOS fetch error:',
          error
        );

        setAdminSOS([]);

      } finally {

        setLoadingSOS(false);

      }

    };

    fetchAdminSOS();

  }, []);

  // =========================================================
  // FETCH ALL TEAMS
  // =========================================================

  useEffect(() => {

    const fetchAdminTeams = async () => {

      try {

        setLoadingTeams(true);

        const response = await fetch(
          `${AUTH_API}/api/teams`
        );

        if (!response.ok) {
          throw new Error(
            `Teams API returned ${response.status}`
          );
        }

        const data = await response.json();

        console.log(
          'ADMIN - ALL TEAMS FROM DATABASE:',
          data
        );

        setAdminTeams(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(
          'Admin teams fetch error:',
          error
        );

        setAdminTeams([]);

      } finally {

        setLoadingTeams(false);

      }

    };

    fetchAdminTeams();

  }, []);

  // =========================================================
  // FETCH ALL WORKER MESSAGES
  // =========================================================

  useEffect(() => {

    const fetchAdminWorkerMessages = async () => {

      try {

        setLoadingWorkerMessages(true);

        const response = await fetch(
          `${RESCUE_API}/api/dashboard/worker-messages/all`
        );

        if (!response.ok) {
          throw new Error(
            `Worker message API returned ${response.status}`
          );
        }

        const data = await response.json();

        console.log(
          'ADMIN - ALL WORKER MESSAGES FROM DATABASE:',
          data
        );

        setAdminWorkerMessages(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(
          'Admin worker message fetch error:',
          error
        );

        setAdminWorkerMessages([]);

      } finally {

        setLoadingWorkerMessages(false);

      }

    };

    fetchAdminWorkerMessages();

  }, []);

  // =========================================================
  // CURRENT USER
  // =========================================================

  if (!currentUser) {
    return null;
  }

  // =========================================================
  // ACTIVE SOS COUNT
  // =========================================================

  const activeSOSList = adminSOS.filter((alert) => {

    const status = String(
      alert?.rescueStatus ||
      alert?.status ||
      ''
    )
      .trim()
      .toUpperCase();

    return (
      status === 'PENDING' ||
      status === 'ACTIVE' ||
      status === 'IN_PROGRESS'
    );

  });

  // =========================================================
  // TEAM METRICS
  // =========================================================

  const teamsOnRescue = Number(
    dashboardSummary?.teamsOnRescue ?? 0
  );

  const availableTeams = Number(
    dashboardSummary?.availableTeams ?? 0
  );

  const totalTeams =
    availableTeams + teamsOnRescue;

  // =========================================================
  // ACTIVE WORKER MESSAGES
  // =========================================================

  const activeWorkerMessages =
    adminWorkerMessages.filter((message) => {

      const status = String(
        message?.status ||
        message?.messageStatus ||
        ''
      )
        .trim()
        .toUpperCase();

      return (
        status === 'PENDING' ||
        status === 'ACCEPTED' ||
        status === 'ONGOING' ||
        status === 'IN_PROGRESS' ||
        status === 'ACTIVE'
      );

    }).length;

  // =========================================================
  // TEAM NAME
  // =========================================================

  const getTeamName = (teamId) => {

    if (!teamId) {
      return 'Unassigned';
    }

    const team = adminTeams.find(
      (item) =>
        String(item?.id) === String(teamId)
    );

    return (
      team?.name ||
      team?.teamName ||
      'Unassigned'
    );

  };

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const getStatusBadgeClass = (status) => {

    const normalizedStatus =
      String(status || '')
        .trim()
        .toUpperCase();

    switch (normalizedStatus) {

      case 'SUCCESS':
      case 'COMPLETED':
        return 'badge-completed';

      case 'PENDING':
        return 'badge-pending';

      case 'ACTIVE':
      case 'IN_PROGRESS':
      case 'ACCEPTED':
      case 'ONGOING':
        return 'badge-active';

      case 'CANCELLED':
      case 'CANCELED':
        return 'badge-critical';

      default:
        return 'badge-info';

    }

  };

  // =========================================================
  // SAFE LOCATION
  // =========================================================

  const getLocation = (alert) => {

    const lat =
      alert?.lat ??
      alert?.latitude ??
      alert?.location?.lat ??
      alert?.location?.latitude;

    const lng =
      alert?.lng ??
      alert?.longitude ??
      alert?.location?.lng ??
      alert?.location?.longitude;

    if (
      lat === null ||
      lat === undefined ||
      lng === null ||
      lng === undefined
    ) {
      return '--';
    }

    const latitude = Number(lat);
    const longitude = Number(lng);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return '--';
    }

    return (
      `${latitude.toFixed(5)}° N, ` +
      `${longitude.toFixed(5)}° E`
    );

  };

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (value) => {

    if (!value) {
      return '--';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '--';
    }

    return date.toLocaleTimeString(
      [],
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    );

  };

  // =========================================================
  // FORMAT DATE + TIME
  // =========================================================

  const formatDateTime = (value) => {

    if (!value || value === '--') {
      return '--';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '--';
    }

    return date.toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }
    );

  };

  // =========================================================
  // GET SOS TIMESTAMP
  // =========================================================

  const getSOSDate = (alert) => {

    return (
      alert?.createdAt ||
      alert?.createdTime ||
      alert?.timestamp ||
      alert?.created_at ||
      null
    );

  };

  // =========================================================
  // GET WORKER MESSAGE TIMESTAMP
  // =========================================================

  const getWorkerMessageDate = (message) => {

    return (
      message?.createdAt ||
      message?.createdTime ||
      message?.timestamp ||
      message?.created_at ||
      null
    );

  };

  // =========================================================
  // GET SOS ASSIGNED TIME
  // =========================================================

  const getAssignedTime = (alert) => {

    const timeline =
      Array.isArray(alert?.timeline)
        ? alert.timeline
        : [];

    if (timeline.length > 0) {

      return (
        timeline[0]?.time ||
        timeline[0]?.timestamp ||
        null
      );

    }

    return (
      alert?.startTime ||
      alert?.acceptedAt ||
      alert?.assignedTime ||
      alert?.assignedAt ||
      alert?.acceptedTime ||
      alert?.createdAt ||
      null
    );

  };

  // =========================================================
  // GET SOS ID
  // =========================================================

  const getSOSId = (alert) => {

    return (
      alert?.sosId ||
      alert?.sosCode ||
      alert?.id ||
      alert?.alertId ||
      alert?.rescueId ||
      null
    );

  };

  // =========================================================
  // GET SOS COMPLETED TIME
  // =========================================================

  const getSOSCompletedTime = (alert) => {

    // -----------------------------------------
    // 1. Direct SOS completed time
    // -----------------------------------------

    const directCompletedTime =
      alert?.completedAt ||
      alert?.completed_at ||
      alert?.completionTime ||
      alert?.completedTime ||
      alert?.resolvedAt ||
      alert?.resolved_at ||
      alert?.endTime ||
      alert?.endedAt ||
      null;

    if (directCompletedTime) {
      return directCompletedTime;
    }

    // -----------------------------------------
    // 2. Check timeline for COMPLETED event
    // -----------------------------------------

    const timeline =
      Array.isArray(alert?.timeline)
        ? alert.timeline
        : [];

    if (timeline.length > 0) {

      const completedEvent =
        timeline.find((item) => {

          const eventStatus = String(
            item?.status ||
            item?.event ||
            item?.type ||
            item?.action ||
            ''
          )
            .trim()
            .toUpperCase();

          return (
            eventStatus === 'COMPLETED' ||
            eventStatus === 'RESOLVED' ||
            eventStatus === 'END' ||
            eventStatus === 'ENDED'
          );

        });

      if (completedEvent) {

        return (
          completedEvent?.time ||
          completedEvent?.timestamp ||
          completedEvent?.completedAt ||
          completedEvent?.completed_at ||
          null
        );

      }

    }

    // -----------------------------------------
    // 3. Match related worker message
    // -----------------------------------------

    const sosId = getSOSId(alert);

    if (sosId) {

      const matchingMessage =
        adminWorkerMessages.find((message) => {

          const messageSOSId =
            message?.sosId ||
            message?.sosCode ||
            message?.alertId ||
            message?.rescueId ||
            message?.referenceId ||
            message?.sos?.id ||
            message?.sos?.sosId ||
            null;

          if (!messageSOSId) {
            return false;
          }

          return (
            String(messageSOSId) ===
            String(sosId)
          );

        });

      if (matchingMessage) {

        return (
          matchingMessage?.completedAt ||
          matchingMessage?.completed_at ||
          matchingMessage?.completionTime ||
          matchingMessage?.completedTime ||
          matchingMessage?.resolvedAt ||
          matchingMessage?.resolved_at ||
          null
        );

      }

    }

    return null;

  };

  // =========================================================
  // GET WORKER COMPLETED TIME
  // =========================================================

  const getWorkerCompletedTime = (message) => {

    return (
      message?.completedAt ||
      message?.completed_at ||
      message?.completionTime ||
      message?.completedTime ||
      message?.resolvedAt ||
      message?.resolved_at ||
      null
    );

  };

  // =========================================================
  // RECENT SOS
  // LATEST 10
  // =========================================================

  const recentSOS = [...adminSOS]
    .sort((a, b) => {

      const dateA = new Date(
        getSOSDate(a) || 0
      ).getTime();

      const dateB = new Date(
        getSOSDate(b) || 0
      ).getTime();

      return dateB - dateA;

    })
    .slice(0, 10);

  // =========================================================
  // RECENT WORKER MESSAGES
  // LATEST 10
  // =========================================================

  const recentWorkerMessages =
    [...adminWorkerMessages]
      .sort((a, b) => {

        const dateA = new Date(
          getWorkerMessageDate(a) || 0
        ).getTime();

        const dateB = new Date(
          getWorkerMessageDate(b) || 0
        ).getTime();

        return dateB - dateA;

      })
      .slice(0, 10);

  // =========================================================
  // WORKER MESSAGE DISPLAY STATUS
  // =========================================================

  const getWorkerDisplayStatus = (message) => {

    const status = String(
      message?.status ||
      message?.messageStatus ||
      ''
    )
      .trim()
      .toUpperCase();

    if (
      status === 'ACCEPTED' ||
      status === 'ONGOING' ||
      status === 'IN_PROGRESS' ||
      status === 'ACTIVE'
    ) {
      return 'ONGOING';
    }

    if (
      status === 'COMPLETED' ||
      status === 'RESOLVED'
    ) {
      return 'COMPLETED';
    }

    if (status === 'PENDING') {
      return 'PENDING';
    }

    if (
      status === 'CANCELLED' ||
      status === 'CANCELED'
    ) {
      return 'CANCELLED';
    }

    return status || 'UNKNOWN';

  };

  // =========================================================
  // WORKER LAST ACTIVE
  // =========================================================

  const getWorkerLastActive = (message) => {

    return (
      message?.acceptedAt ||
      message?.assignedAt ||
      message?.assignedTime ||
      message?.createdAt ||
      message?.createdTime ||
      message?.timestamp ||
      null
    );

  };

  // =========================================================
  // WORKER ASSIGNMENT
  // =========================================================

  const getWorkerAssignment = (message) => {

    return (
      message?.acceptedByTeamName ||
      message?.assignedTeamName ||
      message?.acceptedByTeamId ||
      message?.assignedTeamId ||
      'Unassigned'
    );

  };

  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="dashboard-page">

      <div className="dashboard-container">

        {/* =====================================================
            ADMIN HEADER
        ===================================================== */}

        <DashboardHeader
          currentUser={currentUser}
          activeAlertsCount={activeSOSList.length}
          onBellClick={() =>
            console.log(
              'Admin bell notifications clicked'
            )
          }
          setActiveTab={setActiveTab}
        />

        {/* =====================================================
            OPERATIONS CONSOLE
        ===================================================== */}

        <OperationsConsole
          teamName="Squad Alpha"
          baseStation="BS-04"
        />

        {/* =====================================================
            OVERVIEW CARDS
        ===================================================== */}

        <div className="stat-cards-grid-5">

          <StatCard
            label="Active SOS"
            value={
              loadingSOS
                ? 0
                : activeSOSList.length
            }
            icon={ShieldAlert}
            type="active"
          />

          <StatCard
            label="Total Teams"
            value={
              loadingSummary
                ? 0
                : totalTeams
            }
            icon={Users}
            type="health"
          />

          <StatCard
            label="Teams On Rescue"
            value={
              loadingSummary
                ? 0
                : teamsOnRescue
            }
            icon={UserCheck}
            type="busy"
          />

          <StatCard
            label="Active Worker Messages"
            value={
              loadingWorkerMessages
                ? 0
                : activeWorkerMessages
            }
            icon={MessageSquare}
            type="workers"
          />

          <StatCard
            label="Available Teams"
            value={
              loadingSummary
                ? 0
                : availableTeams
            }
            icon={Users}
            type="free"
          />

        </div>

        {/* =====================================================
            RECENT SOS HISTORY
        ===================================================== */}

        <div className="dispatch-queue-card">

          <div className="queue-header-row">

            <ShieldAlert
              size={22}
              className="queue-icon"
            />

            <h3>
              Recent SOS History
            </h3>

          </div>

          <div className="dark-table-container">

            <table className="dark-table">

              <thead>

                <tr>

                  <th>SOS ID</th>
                  <th>TEAM</th>
                  <th>LOCATION</th>
                  <th>STATUS</th>
                  <th>ASSIGNED TIME</th>
                  <th>COMPLETED TIME</th>

                </tr>

              </thead>

              <tbody>

                {loadingSOS ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="empty-table-cell"
                    >

                      <div className="empty-state-centered">

                        <h4>
                          Loading SOS records...
                        </h4>

                      </div>

                    </td>

                  </tr>

                ) : recentSOS.length === 0 ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="empty-table-cell"
                    >

                      <div className="empty-state-centered">

                        <h4>
                          No records available
                        </h4>

                        <p>
                          No logged distress alerts
                          in database registry.
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : (

                  recentSOS.map((alert, index) => {

                    const sosId =
                      getSOSId(alert) ||
                      `SOS-${index + 1}`;

                    const teamName =
                      alert?.assignedTeam ||
                      alert?.assignedTeamName ||
                      getTeamName(
                        alert?.assignedTeamId
                      );

                    const status =
                      alert?.rescueStatus ||
                      alert?.status ||
                      'UNKNOWN';

                    const assignedTime =
                      getAssignedTime(alert);

                    const completedTime =
                      getSOSCompletedTime(alert);

                    console.log(
                      'SOS HISTORY:',
                      {
                        sosId,
                        assignedTime,
                        completedTime,
                        fullAlert: alert
                      }
                    );

                    return (

                      <tr
                        key={String(sosId)}
                      >

                        {/* SOS ID */}

                        <td
                          className="font-mono font-bold font-red"
                        >
                          {sosId}
                        </td>

                        {/* TEAM */}

                        <td className="team-td">
                          {teamName}
                        </td>

                        {/* LOCATION */}

                        <td
                          className="font-mono location-td"
                        >
                          {getLocation(alert)}
                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={
                              `badge ` +
                              `${getStatusBadgeClass(status)} ` +
                              `badge-large`
                            }
                          >
                            {status}
                          </span>

                        </td>

                        {/* ASSIGNED TIME */}

                        <td className="font-mono">

                          {formatDateTime(
                            assignedTime
                          )}

                        </td>

                        {/* COMPLETED TIME */}

                        <td className="font-mono">

                          {formatDateTime(
                            completedTime
                          )}

                        </td>

                      </tr>

                    );

                  })

                )}

              </tbody>

            </table>

          </div>

          {!loadingSOS &&
            adminSOS.length > 10 && (

            <div className="pagination-container-dark">

              <div className="pagination-left-info">

                Showing latest 10 of{' '}
                {adminSOS.length} SOS records

              </div>

            </div>

          )}

        </div>

        {/* =====================================================
            RECENT WORKER ACTIVITY
        ===================================================== */}

        <div className="dispatch-queue-card">

          <div className="queue-header-row">

            <Activity
              size={22}
              className="queue-icon"
              style={{
                color: '#8B5CF6'
              }}
            />

            <h3>
              Recent Worker Activity
            </h3>

          </div>

          <div className="dark-table-container">

            <table className="dark-table">

              <thead>

                <tr>

                  <th>WORKER ID</th>
                  <th>TEAM</th>
                  <th>STATUS</th>
                  <th>ASSIGNED TEAM</th>
                  <th>ASSIGNED TIME</th>
                  <th>COMPLETED TIME</th>

                </tr>

              </thead>

              <tbody>

                {loadingWorkerMessages ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="empty-table-cell"
                    >

                      <div className="empty-state-centered">

                        <h4>
                          Loading worker activity...
                        </h4>

                      </div>

                    </td>

                  </tr>

                ) : recentWorkerMessages.length === 0 ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="empty-table-cell"
                    >

                      <div className="empty-state-centered">

                        <h4>
                          No worker activity available
                        </h4>

                        <p>
                          No worker messages found
                          in database.
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : (

                  recentWorkerMessages.map(
                    (message, index) => {

                      const workerId =
                        message?.workerId ||
                        message?.id ||
                        message?.messageId ||
                        'UNKNOWN';

                      const teamName =
                        message?.teamName ||
                        message?.team?.name ||
                        message?.teamId ||
                        'Unknown Team';

                      const displayStatus =
                        getWorkerDisplayStatus(
                          message
                        );

                      const lastActive =
                        getWorkerLastActive(
                          message
                        );

                      const assignment =
                        getWorkerAssignment(
                          message
                        );

                      const completedTime =
                        getWorkerCompletedTime(
                          message
                        );

                      let badgeClass =
                        'badge-info';

                      if (
                        displayStatus ===
                        'ONGOING'
                      ) {

                        badgeClass =
                          'badge-pending';

                      } else if (
                        displayStatus ===
                        'COMPLETED'
                      ) {

                        badgeClass =
                          'badge-online';

                      } else if (
                        displayStatus ===
                        'PENDING'
                      ) {

                        badgeClass =
                          'badge-pending';

                      } else if (
                        displayStatus ===
                        'CANCELLED'
                      ) {

                        badgeClass =
                          'badge-critical';

                      }

                      const messageId =
                        message?.id ||
                        message?.messageId ||
                        `${workerId}-${index}`;

                      console.log(
                        'WORKER HISTORY:',
                        {
                          workerId,
                          assignedTime: lastActive,
                          completedTime,
                          fullMessage: message
                        }
                      );

                      return (

                        <tr
                          key={String(messageId)}
                        >

                          {/* WORKER ID */}

                          <td
                            style={{
                              color: '#e60b0b'
                            }}
                          >
                            {workerId}
                          </td>

                          {/* TEAM */}

                          <td className="team-td">
                            {teamName}
                          </td>

                          {/* STATUS */}

                          <td>

                            <span
                              className={
                                `badge ` +
                                `${badgeClass} ` +
                                `badge-large`
                              }
                            >
                              {displayStatus}
                            </span>

                          </td>

                          {/* ASSIGNED TEAM */}

                          <td className="font-mono">
                            {assignment}
                          </td>

                          {/* ASSIGNED TIME */}

                          <td className="font-mono">

                            {formatDateTime(
                              lastActive
                            )}

                          </td>

                          {/* COMPLETED TIME */}

                          <td className="font-mono">

                            {formatDateTime(
                              completedTime
                            )}

                          </td>

                        </tr>

                      );

                    }
                  )

                )}

              </tbody>

            </table>

          </div>

          {!loadingWorkerMessages &&
            adminWorkerMessages.length > 10 && (

            <div className="pagination-container-dark">

              <div className="pagination-left-info">

                Showing latest 10 of{' '}
                {adminWorkerMessages.length}{' '}
                worker messages

              </div>

            </div>

          )}

        </div>

      </div>

    </div>

  );

};

export default AdminDashboard;