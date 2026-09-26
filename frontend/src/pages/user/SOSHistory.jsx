import React, { useState, useEffect } from 'react';
import './SOSHistory.css';
import { useAppContext } from '../../context/AppContext';
import {
  History,
  CheckCircle,
  ChevronRight,
  UserCheck,
  Radio,
  Wifi,
  RefreshCw
} from 'lucide-react';
import Pagination from '../../components/Pagination';

// ============================================================
// RESCUE SERVICE API
// ============================================================

const RESCUE_API = 'http://localhost:8086/api/dashboard';

const SOSHistory = () => {

  const {
    currentUser,
    teams
  } = useAppContext();

  const [sosHistory, setSosHistory] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [currentPage, setCurrentPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(10);

  // ============================================================
  // SEARCH
  // ============================================================

  const [searchQuery, setSearchQuery] =
    useState('');

  // ============================================================
  // STATUS FILTER
  // ============================================================

  const [statusFilter, setStatusFilter] =
    useState('ALL');

  // ============================================================
  // GET LOGGED-IN USER EMAIL
  // ============================================================

  const userEmail =
    currentUser?.email ||
    currentUser?.userEmail ||
    currentUser?.user_email ||
    localStorage.getItem('email') ||
    localStorage.getItem('userEmail') ||
    sessionStorage.getItem('email') ||
    sessionStorage.getItem('userEmail') ||
    null;

  // ============================================================
  // FETCH SOS HISTORY FROM RESCUE SERVICE
  // ============================================================

  const fetchSOSHistory = async () => {

    if (!userEmail) {

      setError(
        'Logged-in user email not found.'
      );

      setSosHistory([]);
      setLoading(false);

      return;
    }

    try {

      setLoading(true);
      setError('');

      console.log(
        'Fetching SOS history from rescue service for:',
        userEmail
      );

      // ========================================================
      // GET SOS FROM rescue_db.sos
      // ========================================================

      const response = await fetch(
        `${RESCUE_API}/sos/user/${encodeURIComponent(
          userEmail
        )}`
      );

      if (!response.ok) {

        throw new Error(
          `Rescue SOS API returned ${response.status}`
        );

      }

      const data =
        await response.json();

      console.log(
        'SOS HISTORY FROM RESCUE SERVICE:',
        data
      );

      // ========================================================
      // STORE RESPONSE
      // ========================================================

      setSosHistory(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        'SOS HISTORY ERROR:',
        err
      );

      setError(
        'Unable to load SOS history from rescue server.'
      );

      setSosHistory([]);

    } finally {

      setLoading(false);

    }
  };

  // ============================================================
  // LOAD SOS HISTORY
  // ============================================================

  useEffect(() => {

    if (!currentUser) {
      return;
    }

    fetchSOSHistory();

  }, [userEmail, currentUser]);

  // ============================================================
  // TEAM NAME
  // ============================================================

  const getTeamName = (teamId) => {

    if (!teamId) {
      return 'Assigning...';
    }

    return (
      teams?.find(
        (team) =>
          String(team.id) ===
          String(teamId)
      )?.name ||
      'Rescue Squad'
    );
  };

  // ============================================================
  // SOURCE
  // ============================================================

  const getSource = (source) => {

    if (
      String(source || '').toUpperCase() ===
      'LORA'
    ) {

      return {
        label: 'LORA',
        icon: <Radio size={13} />,
        className: 'source-lora'
      };

    }

    return {
      label: 'WEB',
      icon: <Wifi size={13} />,
      className: 'source-web'
    };
  };

  // ============================================================
  // STATUS BADGE
  // ============================================================

  const getStatusBadgeClass = (status) => {

    switch (
      String(status || '').toUpperCase()
    ) {

      case 'SUCCESS':
      case 'COMPLETED':
        return 'badge-completed';

      case 'PENDING':
        return 'badge-pending';

      case 'ACTIVE':
      case 'ACCEPTED':
      case 'IN_PROGRESS':
        return 'badge-active';

      case 'CANCELLED':
        return 'badge-info';

      case 'DISPATCHED':
        return 'badge-active';

      default:
        return 'badge-info';

    }
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearchChange = (val) => {

    setSearchQuery(val);
    setCurrentPage(1);

  };

  // ============================================================
  // STATUS FILTER
  // ============================================================

  const handleStatusChange = (val) => {

    setStatusFilter(val);
    setCurrentPage(1);

  };

  // ============================================================
  // FILTER DATA
  // ============================================================

  const filteredAlerts =
    sosHistory.filter((alert) => {

      // ========================================================
      // SEARCH BY SOS ID
      // ========================================================

      if (
        searchQuery &&
        !String(
          alert.sosId ||
          alert.id ||
          ''
        )
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          )
      ) {

        return false;

      }

      // ========================================================
      // CURRENT STATUS
      //
      // New rescue_db.sos uses rescueStatus.
      // status is kept as fallback.
      // ========================================================

      const currentStatus =
        String(
          alert.rescueStatus ||
          alert.status ||
          ''
        ).toUpperCase();

      // ========================================================
      // STATUS FILTER
      // ========================================================

      if (
        statusFilter !== 'ALL' &&
        currentStatus !==
          statusFilter.toUpperCase()
      ) {

        return false;

      }

      return true;

    });

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalRecords =
    filteredAlerts.length;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalRecords / pageSize
      )
    );

  const activePage =
    Math.min(
      currentPage,
      totalPages
    );

  const startIndex =
    (activePage - 1) *
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

  // ============================================================
  // NO USER
  // ============================================================

  if (!currentUser) {
    return null;
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (

    <div className="dashboard-page flex-full-height">

      <div className="glass-panel table-panel flex-column-card">

        {/* ======================================================
            HEADER
            ====================================================== */}

        <div className="panel-header">

          <History
            size={20}
            color="var(--accent-glow)"
          />

          <h3>
            Distress Dispatch Archives
          </h3>

          {/* REFRESH */}

          <button
            type="button"
            onClick={fetchSOSHistory}
            disabled={loading}
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            className="btn-secondary"
          >

            <RefreshCw
              size={14}
              className={
                loading
                  ? 'refresh-spinning'
                  : ''
              }
            />

            Refresh

          </button>

        </div>

        {/* ======================================================
            FILTER CONTROLS
            ====================================================== */}

        <div className="filter-controls-row">

          <input
            type="text"
            placeholder="Search by SOS ID..."
            value={searchQuery}
            onChange={(e) =>
              handleSearchChange(
                e.target.value
              )
            }
            className="search-input"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              handleStatusChange(
                e.target.value
              )
            }
            className="filter-select"
          >

            <option value="ALL">
              All Statuses
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="ACCEPTED">
              Accepted
            </option>

            <option value="IN_PROGRESS">
              In Progress
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="DISPATCHED">
              Dispatched
            </option>

            <option value="COMPLETED">
              Completed
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>

          </select>

        </div>

        {/* ======================================================
            ERROR
            ====================================================== */}

        {error && (

          <div
            className="empty-history text-center"
            style={{
              padding: '25px'
            }}
          >

            <p>
              {error}
            </p>

          </div>

        )}

        {/* ======================================================
            LOADING
            ====================================================== */}

        {loading && (

          <div className="empty-history text-center flex-grow-center">

            <RefreshCw
              size={30}
              className="refresh-spinning"
            />

            <p>
              Loading SOS history...
            </p>

          </div>

        )}

        {/* ======================================================
            EMPTY
            ====================================================== */}

        {!loading &&
          !error &&
          filteredAlerts.length === 0 && (

          <div className="empty-history text-center flex-grow-center">

            <CheckCircle
              size={36}
              color="var(--color-success)"
            />

            <p>
              No Records Found
            </p>

            <span>
              No SOS dispatch calls match
              the filter parameters.
            </span>

          </div>

        )}

        {/* ======================================================
            TABLE
            ====================================================== */}

        {!loading &&
          !error &&
          filteredAlerts.length > 0 && (

          <>

            <div className="modern-table-container custom-table-scroll flex-table-grow">

              <table className="modern-table dynamic-row-height">

                <thead>

                  <tr>

                    <th className="text-left">
                      SOS ID
                    </th>

                    <th className="text-left">
                      TIMESTAMP
                    </th>

                    <th className="text-center">
                      SOURCE
                    </th>

                    <th className="text-left">
                      ASSIGNED TEAM
                    </th>

                    <th className="text-center">
                      STATUS
                    </th>

                    <th className="text-center">
                      ACTIONS
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {paginatedAlerts.map(
                    (alert) => {

                      // ==================================================
                      // SOURCE
                      // ==================================================

                      const source =
                        getSource(
                          alert.source
                        );

                      // ==================================================
                      // TIMESTAMP
                      // ==================================================

                      const timestamp =
                        alert.createdAt ||
                        alert.timestamp;

                      // ==================================================
                      // STATUS
                      // ==================================================

                      const sosStatus =
                        String(
                          alert.rescueStatus ||
                          alert.status ||
                          'PENDING'
                        ).toUpperCase();

                      // ==================================================
                      // TEAM
                      // ==================================================

                      const assignedTeamId =
                        alert.assignedTeamId ||
                        alert.assignedTeam;

                      return (

                        <tr
                          key={
                            alert.sosId ||
                            alert.id
                          }
                          className="table-row-spaced"
                        >

                          {/* ==========================================
                              SOS ID
                              ========================================== */}

                          <td className="text-left font-mono font-bold id-highlight">

                            {alert.sosId ||
                              `SOS-${alert.id}`}

                          </td>

                          {/* ==========================================
                              TIMESTAMP
                              ========================================== */}

                          <td className="text-left timestamp-cell">

                            {timestamp ? (

                              <>

                                <span className="date-text">

                                  {new Date(
                                    timestamp
                                  ).toLocaleDateString()}

                                </span>

                                <span className="time-text font-mono">

                                  {new Date(
                                    timestamp
                                  ).toLocaleTimeString(
                                    [],
                                    {
                                      hour:
                                        '2-digit',
                                      minute:
                                        '2-digit'
                                    }
                                  )}

                                </span>

                              </>

                            ) : (

                              <span>
                                N/A
                              </span>

                            )}

                          </td>

                          {/* ==========================================
                              SOURCE
                              ========================================== */}

                          <td className="text-center">

                            <span
                              className={`badge badge-large ${source.className}`}
                              style={{
                                display:
                                  'inline-flex',
                                alignItems:
                                  'center',
                                gap: '5px'
                              }}
                            >

                              {source.icon}

                              {source.label}

                            </span>

                          </td>

                          {/* ==========================================
                              ASSIGNED TEAM
                              ========================================== */}

                          <td className="text-left">

                            <span className="flex-align text-primary squad-text">

                              <UserCheck
                                size={14}
                                color="var(--accent-glow)"
                              />

                              {getTeamName(
                                assignedTeamId
                              )}

                            </span>

                          </td>

                          {/* ==========================================
                              STATUS
                              ========================================== */}

                          <td className="text-center">

                            <span
                              className={`badge badge-large ${
                                sosStatus ===
                                'CANCELLED'
                                  ? 'badge-cancelled'
                                  : getStatusBadgeClass(
                                      sosStatus
                                    )
                              }`}
                            >

                              {sosStatus}

                            </span>

                          </td>

                          {/* ==========================================
                              ACTIONS
                              ========================================== */}

                          <td className="text-center">

                            <button
                              type="button"
                              className="btn-secondary btn-table-action-large"
                              onClick={() =>
                                console.log(
                                  'Inspect SOS:',
                                  alert
                                )
                              }
                            >

                              <span>
                                Inspect
                              </span>

                              <ChevronRight
                                size={14}
                              />

                            </button>

                          </td>

                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

            {/* ====================================================
                PAGINATION
                ==================================================== */}

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

              setPageSize={
                setPageSize
              }

              currentPage={
                activePage
              }

              setCurrentPage={
                setCurrentPage
              }

              totalPages={
                totalPages
              }

            />

          </>

        )}

      </div>

    </div>

  );
};

export default SOSHistory;