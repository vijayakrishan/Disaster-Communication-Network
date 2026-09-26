import React, { useState } from 'react';
import './SOSHistory.css';
import { useAppContext } from '../../context/AppContext';
import {
  History,
  CheckCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import FilterBar from '../../components/FilterBar';

const SOSHistory = () => {

  const {
    alerts = [],
    currentUser,
    teams = []
  } = useAppContext();

  // ============================================================
  // FILTERS + PAGINATION
  // ============================================================

  const [searchSosId, setSearchSosId] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterTeam, setFilterTeam] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  if (!currentUser) {
    return null;
  }

  // ============================================================
  // MY SOS ALERTS
  // ============================================================

  const myAlerts = Array.isArray(alerts)
    ? alerts
    : [];

  // ============================================================
  // GET TEAM NAME
  // ============================================================

  const getTeamName = (teamId) => {

    if (!teamId) {
      return 'Assigning...';
    }

    const team = teams.find(
      (t) =>
        String(t?.id) === String(teamId)
    );

    return (
      team?.name ||
      team?.teamName ||
      'Rescue Squad'
    );
  };

  // ============================================================
  // GET WORKER NAME
  // ============================================================

  const getWorkerName = (alert) => {

    const teamId =
      alert?.assignedTeamId ||
      alert?.assigned_team_id ||
      alert?.acceptedByTeamId ||
      alert?.accepted_by_team_id ||
      alert?.teamId ||
      alert?.team_id;

    if (!teamId) {
      return 'Unassigned';
    }

    const team = teams.find(
      (t) =>
        String(t?.id) === String(teamId)
    );

    return (
      team?.leader ||
      team?.leaderName ||
      'Unassigned'
    );
  };

  // ============================================================
  // STATUS BADGE
  // ============================================================

  const getStatusBadgeClass = (status) => {

    switch (
      String(status || '')
        .toUpperCase()
    ) {

      case 'SUCCESS':
      case 'COMPLETED':
        return 'badge-completed';

      case 'PENDING':
        return 'badge-pending';

      case 'ACTIVE':
      case 'IN_PROGRESS':
      case 'ONGOING':
        return 'badge-active';

      default:
        return 'badge-info';
    }
  };

  // ============================================================
  // GET SOS ID
  // ============================================================

  const getSosId = (alert) => {

    return (
      alert?.id ??
      alert?.sosId ??
      alert?.sos_id ??
      '--'
    );
  };

  // ============================================================
  // GET DATE VALUE
  // ============================================================

  const getTimestamp = (alert) => {

    return (
      alert?.timestamp ||
      alert?.createdAt ||
      alert?.created_at ||
      alert?.createdTime ||
      null
    );
  };

  // ============================================================
  // GET LOCATION
  //
  // IMPORTANT:
  // Backend may return:
  // lat / lng
  // OR
  // latitude / longitude
  //
  // Never call .toFixed() directly on backend values.
  // ============================================================

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

    // ----------------------------------------------------------
    // LOCATION NOT AVAILABLE
    // ----------------------------------------------------------

    if (
      lat === null ||
      lat === undefined ||
      lng === null ||
      lng === undefined
    ) {
      return '--';
    }

    // ----------------------------------------------------------
    // CONVERT TO NUMBER
    // ----------------------------------------------------------

    const latitude = Number(lat);
    const longitude = Number(lng);

    // ----------------------------------------------------------
    // INVALID LOCATION
    // ----------------------------------------------------------

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return '--';
    }

    // ----------------------------------------------------------
    // VALID LOCATION
    // ----------------------------------------------------------

    return (
      `${latitude.toFixed(5)}° N, ` +
      `${longitude.toFixed(5)}° E`
    );
  };

  // ============================================================
  // FILTER
  // ============================================================

  const filteredAlerts = myAlerts.filter((alert) => {

    // ----------------------------------------------------------
    // SEARCH BY SOS ID
    // ----------------------------------------------------------

    if (searchSosId) {

      const sosId =
        String(getSosId(alert))
          .toLowerCase();

      if (
        !sosId.includes(
          searchSosId.toLowerCase()
        )
      ) {
        return false;
      }
    }

    // ----------------------------------------------------------
    // DATE FILTER
    // ----------------------------------------------------------

    if (filterDate) {

      const timestamp =
        getTimestamp(alert);

      if (!timestamp) {
        return false;
      }

      const date =
        new Date(timestamp);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return false;
      }

      const alertDateStr =
        date
          .toISOString()
          .split('T')[0];

      if (
        alertDateStr !== filterDate
      ) {
        return false;
      }
    }

    // ----------------------------------------------------------
    // TEAM FILTER
    // ----------------------------------------------------------

    if (filterTeam !== 'ALL') {

      const assignedTeamId =
        alert?.assignedTeamId ||
        alert?.assigned_team_id ||
        alert?.acceptedByTeamId ||
        alert?.accepted_by_team_id ||
        alert?.teamId ||
        alert?.team_id;

      if (
        String(assignedTeamId) !==
        String(filterTeam)
      ) {
        return false;
      }
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

  // Make sure current page doesn't go beyond available pages
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

  // ============================================================
  // PREVIOUS PAGE
  // ============================================================

  const handlePrev = () => {

    if (safeCurrentPage > 1) {

      setCurrentPage(
        safeCurrentPage - 1
      );
    }
  };

  // ============================================================
  // NEXT PAGE
  // ============================================================

  const handleNext = () => {

    if (
      safeCurrentPage < totalPages
    ) {

      setCurrentPage(
        safeCurrentPage + 1
      );
    }
  };

  // ============================================================
  // STATUS HELPERS
  // ============================================================

  const isActiveStatus = (alert) => {

    const status =
      String(
        alert?.status ||
        alert?.rescueStatus ||
        ''
      )
        .trim()
        .toUpperCase();

    return (
      status === 'ACTIVE' ||
      status === 'ONGOING' ||
      status === 'IN_PROGRESS'
    );
  };

  const isCompletedStatus = (alert) => {

    const status =
      String(
        alert?.status ||
        alert?.rescueStatus ||
        ''
      )
        .trim()
        .toUpperCase();

    return (
      status === 'COMPLETED' ||
      status === 'SUCCESS' ||
      status === 'RESOLVED'
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div className="dashboard-page">

      {/* ======================================================
          HEADER
          ====================================================== */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '24px'
        }}
      >

        <History
          size={22}
          color="var(--accent-glow)"
        />

        <h3
          style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#fff',
            margin: 0
          }}
        >
          SOS History
        </h3>

      </div>

      {/* ======================================================
          SOS METRICS
          ====================================================== */}

      <div
        className="grid-cols-4"
        style={{
          marginBottom: '24px'
        }}
      >

        {/* TOTAL */}

        <div
          className="glass-panel"
          style={{
            padding: '20px',
            background: '#18181B',
            border: '1px solid #3A3A44',
            borderRadius: '6px'
          }}
        >

          <span
            style={{
              fontSize: '11px',
              color: '#71717A',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Total SOS Triggers
          </span>

          <h3
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#fff',
              marginTop: '6px'
            }}
          >
            {myAlerts.length}
          </h3>

        </div>

        {/* ACTIVE */}

        <div
          className="glass-panel"
          style={{
            padding: '20px',
            background: '#18181B',
            border: '1px solid #3A3A44',
            borderRadius: '6px'
          }}
        >

          <span
            style={{
              fontSize: '11px',
              color: '#71717A',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Active SOS Rescues
          </span>

          <h3
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#EF4444',
              marginTop: '6px'
            }}
          >
            {
              myAlerts.filter(
                isActiveStatus
              ).length
            }
          </h3>

        </div>

        {/* COMPLETED */}

        <div
          className="glass-panel"
          style={{
            padding: '20px',
            background: '#18181B',
            border: '1px solid #3A3A44',
            borderRadius: '6px'
          }}
        >

          <span
            style={{
              fontSize: '11px',
              color: '#71717A',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Completed SOS
          </span>

          <h3
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#22C55E',
              marginTop: '6px'
            }}
          >
            {
              myAlerts.filter(
                isCompletedStatus
              ).length
            }
          </h3>

        </div>

        {/* PENDING */}

        <div
          className="glass-panel"
          style={{
            padding: '20px',
            background: '#18181B',
            border: '1px solid #3A3A44',
            borderRadius: '6px'
          }}
        >

          <span
            style={{
              fontSize: '11px',
              color: '#71717A',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Critical Pending
          </span>

          <h3
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#F59E0B',
              marginTop: '6px'
            }}
          >
            {
              myAlerts.filter(
                (a) =>
                  String(
                    a?.status ||
                    a?.rescueStatus ||
                    ''
                  )
                    .toUpperCase() ===
                  'PENDING'
              ).length
            }
          </h3>

        </div>

      </div>

      {/* ======================================================
          SEARCH + FILTER
          ====================================================== */}

      <FilterBar

        searchPlaceholder="Search by SOS ID..."

        searchQuery={searchSosId}

        setSearchQuery={(value) => {

          setSearchSosId(value);

          setCurrentPage(1);

        }}

        filterDate={filterDate}

        setFilterDate={(value) => {

          setFilterDate(value);

          setCurrentPage(1);

        }}

        dropdownValue={filterTeam}

        setDropdownValue={(value) => {

          setFilterTeam(value);

          setCurrentPage(1);

        }}

        dropdownOptions={teams.map(
          (team) => ({
            value: team.id,
            label:
              team.name ||
              team.teamName ||
              team.id
          })
        )}

        dropdownPlaceholder="All Teams"

      />

      {/* ======================================================
          TABLE
          ====================================================== */}

      <div className="glass-panel table-panel-full">

        {paginatedAlerts.length === 0 ? (

          <div className="empty-history text-center">

            <CheckCircle
              size={44}
              color="var(--color-success)"
            />

            <p>
              No Record Matches
            </p>

            <span>
              No SOS dispatch history tickets
              match the filters.
            </span>

          </div>

        ) : (

          <>

            <div className="modern-table-container custom-table-scroll">

              <table className="modern-table full-width-table">

                <thead>

                  <tr>

                    <th>SOS ID</th>

                    <th>LOCATION</th>

                    <th>DATE</th>

                    <th>START TIME</th>
                    <th>END TIME</th>

                    <th>TEAM</th>

                    <th>STATUS</th>

                  </tr>

                </thead>

                <tbody>

                  {paginatedAlerts.map(
                    (alert, index) => {

                      const sosId =
                        getSosId(alert);

                      const timestamp =
                        getTimestamp(alert);

                      let displayDate = '--';
                      let displayTime = '--';

                      if (timestamp) {

                        const date =
                          new Date(timestamp);

                        if (
                          !Number.isNaN(
                            date.getTime()
                          )
                        ) {

                          displayDate =
                            date.toLocaleDateString();

                          displayTime =
                            date.toLocaleTimeString(
                              [],
                              {
                                hour: '2-digit',
                                minute: '2-digit'
                              }
                            );

                        }
                      }

                      const status =
                        String(
                          alert?.status ||
                          alert?.rescueStatus ||
                          'UNKNOWN'
                        ).toUpperCase();

                      return (

                        <tr
                          key={
                            `${sosId}-${index}`
                          }
                          className="table-row-hoverable"
                        >

                          {/* SOS ID */}

                          <td
                            className="font-mono font-bold id-highlight"
                          >
                            {sosId}
                          </td>

                          {/* LOCATION */}

                          <td
                            className="font-mono location-cell"
                          >
                            {getLocation(alert)}
                          </td>

                          {/* DATE */}

                          <td>
                            {displayDate}
                          </td>

                          {/* TIME */}

                          {/* START TIME */}

<td className="font-mono">
  {alert?.startTime
    ? new Date(alert.startTime).toLocaleTimeString(
        [],
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      )
    : '--'
  }
</td>

{/* END TIME */}

<td className="font-mono">
  {alert?.endTime
    ? new Date(alert.endTime).toLocaleTimeString(
        [],
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      )
    : '--'
  }
</td>
                          {/* TEAM */}

                          <td
                            className="team-cell"
                          >
                            {getTeamName(
                              alert?.assignedTeamId ||
                              alert?.assigned_team_id ||
                              alert?.acceptedByTeamId ||
                              alert?.accepted_by_team_id ||
                              alert?.teamId ||
                              alert?.team_id
                            )}
                          </td>
                         

                          {/* STATUS */}

                          <td>

                            <span
                              className={`badge ${getStatusBadgeClass(
                                status
                              )} badge-large`}
                            >
                              {status}
                            </span>

                          </td>

                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

            {/* ==================================================
                PAGINATION
                ================================================== */}

            <div
              className="pagination-wrapper flex-between"
            >

              <div
                className="pagination-left flex-align"
              >

                <span className="pagination-info">

                  Showing{' '}

                  {totalRecords === 0
                    ? 0
                    : startIndex + 1}

                  –

                  {endIndex}

                  {' '}of{' '}

                  {totalRecords}

                  {' '}records

                </span>

                <div
                  className="rows-per-page flex-align"
                >

                  <span className="rows-label">
                    Rows per page:
                  </span>

                  <select
                    value={pageSize}
                    onChange={(e) => {

                      setPageSize(
                        Number(
                          e.target.value
                        )
                      );

                      setCurrentPage(1);

                    }}
                    className="rows-selector"
                  >

                    <option value={10}>
                      10
                    </option>

                    <option value={25}>
                      25
                    </option>

                    <option value={50}>
                      50
                    </option>

                    <option value={100}>
                      100
                    </option>

                  </select>

                </div>

              </div>

              <div
                className="pagination-right flex-align"
              >

                {/* PREVIOUS */}

                <button
                  className={`pagination-btn ${
                    safeCurrentPage === 1
                      ? 'disabled-btn'
                      : ''
                  }`}
                  onClick={handlePrev}
                  disabled={
                    safeCurrentPage === 1
                  }
                >

                  <ChevronLeft size={14} />

                  <span>
                    Previous
                  </span>

                </button>

                {/* PAGE NUMBERS */}

                <div
                  className="page-numbers-row"
                >

                  {Array.from({
                    length: totalPages
                  }).map(
                    (_, idx) => {

                      const pageNum =
                        idx + 1;

                      return (

                        <button
                          key={pageNum}
                          onClick={() =>
                            setCurrentPage(
                              pageNum
                            )
                          }
                          className={`page-num-btn ${
                            safeCurrentPage ===
                            pageNum
                              ? 'active-page-btn'
                              : ''
                          }`}
                        >
                          {pageNum}
                        </button>

                      );

                    }
                  )}

                </div>

                {/* NEXT */}

                <button
                  className={`pagination-btn ${
                    safeCurrentPage ===
                    totalPages
                      ? 'disabled-btn'
                      : ''
                  }`}
                  onClick={handleNext}
                  disabled={
                    safeCurrentPage ===
                    totalPages
                  }
                >

                  <span>
                    Next
                  </span>

                  <ChevronRight size={14} />

                </button>

              </div>

            </div>

          </>

        )}

      </div>

    </div>

  );
};

export default SOSHistory;