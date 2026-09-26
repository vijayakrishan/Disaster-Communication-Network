import React, { useMemo, useState } from 'react';
import './WorkerMessages.css';
import { Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import FilterBar from '../../components/FilterBar';
import { useAppContext } from '../../context/AppContext';

const WorkerMessages = () => {

  const {
    workerMessages,
    acceptWorkerMessage,
    completeWorkerMessage,
    currentUser
  } = useAppContext();

  // ============================================================
  // BACKEND DATA
  // ============================================================

  const messages = Array.isArray(workerMessages)
    ? workerMessages
    : [];

  // ============================================================
  // FILTER + PAGINATION STATE
  // ============================================================

  const [searchMsgId, setSearchMsgId] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterTeam, setFilterTeam] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ============================================================
  // NORMALIZE STATUS
  // ============================================================

  const getNormalizedStatus = (status) => {

    const value = String(status || '')
      .trim()
      .toUpperCase();

   if (value === 'PENDING') {
  return <span style={{ color: '#f59e0b' }}>PENDING</span>;
}
    if (
      value === 'ACCEPTED' ||
      value === 'IN_PROGRESS' ||
      value === 'ONGOING' ||
      value === 'ACTIVE'
    ) {
      return 'ONGOING';
    }

    if (
      value === 'COMPLETED' ||
      value === 'RESOLVED'
    ) {
      return 'COMPLETED';
    }

    if (
      value === 'CANCELLED' ||
      value === 'CANCELED'
    ) {
      return 'CANCELLED';
    }

    return value || 'PENDING';
  };

  // ============================================================
  // DATE FORMAT
  // ============================================================

  const formatDateTime = (value) => {

    if (!value) {
      return '—';
    }

    try {

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

    } catch {
      return String(value);
    }
  };

  const formatTime = (value) => {

    if (!value) {
      return '—';
    }

    try {

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

    } catch {
      return String(value);
    }
  };

  // ============================================================
  // NORMALIZED MESSAGES
  // ============================================================

  const normalizedMessages = useMemo(() => {

    return messages.map((msg) => {

      const status = getNormalizedStatus(
        msg?.status
      );

      const workerName =
        msg?.workerName ||
        msg?.worker?.name ||
        msg?.workerId ||
        'UNKNOWN WORKER';

      const teamName =
        msg?.teamName ||
        msg?.team?.name ||
        msg?.teamId ||
        'UNKNOWN TEAM';

      const acceptedTeam =
        msg?.acceptedByTeamName?.trim?.() ||
        'NOT ASSIGNED';

      return {

        ...msg,

        displayId:
          msg?.id ??
          msg?.messageId ??
          'N/A',

        workerName,

        teamName,

        message:
          msg?.message ||
          'No message',

        status,

        assignedTeam:
          acceptedTeam,

        createdAt:
          msg?.createdAt ||
          msg?.createdTime ||
          null,

        startTime:
          msg?.acceptedAt ||
          null,

        endTime:
          msg?.completedAt ||
          null,

        date:
          msg?.createdAt
            ? String(msg.createdAt).substring(0, 10)
            : ''

      };

    });

  }, [messages]);

  // ============================================================
  // HISTORY MESSAGES
  //
  // IMPORTANT:
  // PENDING IS NOT SHOWN ON THIS PAGE.
  //
  // ONLY:
  // ONGOING
  // COMPLETED
  // ============================================================

  const historyMessages = useMemo(() => {

    return normalizedMessages.filter((msg) => {

      return (
        msg.status === 'PENDING' ||
        msg.status === 'COMPLETED'
      );

    });

  }, [normalizedMessages]);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredMessages = useMemo(() => {

    return historyMessages.filter((msg) => {

      // --------------------------------------------------------
      // SEARCH BY ID
      // --------------------------------------------------------

      if (
        searchMsgId &&
        !String(msg.displayId)
          .toLowerCase()
          .includes(
            searchMsgId.toLowerCase()
          )
      ) {
        return false;
      }

      // --------------------------------------------------------
      // DATE FILTER
      // --------------------------------------------------------

      if (
        filterDate &&
        msg.date !== filterDate
      ) {
        return false;
      }

      // --------------------------------------------------------
      // TEAM FILTER
      // --------------------------------------------------------

      if (filterTeam !== 'ALL') {

        const teamName =
          String(msg.teamName || '')
            .trim()
            .toLowerCase();

        const selectedTeam =
          String(filterTeam || '')
            .trim()
            .toLowerCase();

        const teamId =
          String(msg.teamId || '')
            .trim()
            .toLowerCase();

        if (
          selectedTeam !== teamName &&
          selectedTeam !== teamId
        ) {
          return false;
        }

      }

      return true;

    });

  }, [
    historyMessages,
    searchMsgId,
    filterDate,
    filterTeam
  ]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalRecords =
    filteredMessages.length;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalRecords / pageSize
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

  const paginatedMessages =
    filteredMessages.slice(
      startIndex,
      startIndex + pageSize
    );

  const endIndex =
    Math.min(
      startIndex + pageSize,
      totalRecords
    );

  // ============================================================
  // PAGINATION HANDLERS
  // ============================================================

  const handlePrev = () => {

    if (safeCurrentPage > 1) {

      setCurrentPage(
        safeCurrentPage - 1
      );

    }

  };

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
  // STATUS BADGE
  // ============================================================

  const getStatusBadge = (status) => {

    switch (status) {

      case 'ONGOING':

        return (
          <span className="badge badge-active badge-large">
            ONGOING
          </span>
        );

      case 'COMPLETED':

        return (
          <span className="badge badge-completed badge-large">
            COMPLETED
          </span>
        );

      default:

        return (
          <span className="badge badge-info badge-large">
            {status || 'UNKNOWN'}
          </span>
        );

    }

  };

  // ============================================================
  // COUNTS
  //
  // ONLY HISTORY COUNTS
  // ============================================================

  const totalHistoryCount =
    historyMessages.length;

  const ongoingCount =
    historyMessages.filter(
      (msg) =>
        msg.status === 'ONGOING'
    ).length;

  const completedCount =
    historyMessages.filter(
      (msg) =>
        msg.status === 'COMPLETED'
    ).length;

  // ============================================================
  // ACCEPT
  //
  // This should normally not appear here because
  // PENDING messages are filtered out.
  //
  // Kept only as a safety fallback.
  // ============================================================

  const handleAccept = async (msg) => {

    try {

      const teamId =
        currentUser?.teamId ||
        localStorage.getItem('teamId') ||
        sessionStorage.getItem('teamId');

      const teamName =
        currentUser?.teamName ||
        localStorage.getItem('teamName') ||
        sessionStorage.getItem('teamName') ||
        '';

      if (!teamId) {

        alert(
          'Team ID not found.'
        );

        return;

      }

      await acceptWorkerMessage(
        msg.id,
        teamId,
        teamName
      );

    } catch (error) {

      console.error(
        'Failed to accept worker message:',
        error
      );

      alert(
        error?.message ||
        'Unable to accept worker message'
      );

    }

  };

  // ============================================================
  // COMPLETE
  // ============================================================

  const handleComplete = async (msg) => {

    try {

      await completeWorkerMessage(
        msg.id
      );

    } catch (error) {

      console.error(
        'Failed to complete worker message:',
        error
      );

      alert(
        error?.message ||
        'Unable to complete worker message'
      );

    }

  };

  // ============================================================
  // TEAM OPTIONS
  //
  // Build ONLY from ONGOING + COMPLETED messages.
  // ============================================================

  const teamOptions = useMemo(() => {

    const map = new Map();

    historyMessages.forEach((msg) => {

      const value =
        String(
          msg.teamId ||
          msg.teamName ||
          ''
        );

      if (!value) {
        return;
      }

      if (!map.has(value)) {

        map.set(value, {

          value,

          label:
            msg.teamName ||
            msg.teamId ||
            'UNKNOWN TEAM'

        });

      }

    });

    return Array.from(
      map.values()
    );

  }, [historyMessages]);

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

        <Mail
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
          Worker Messages
        </h3>

      </div>

      {/* ======================================================
          METRICS
          ====================================================== */}

      <div
        className="grid-cols-3"
        style={{
          marginBottom: '24px'
        }}
      >

        {/* TOTAL HISTORY */}

        <div
          className="glass-panel"
          style={{
            padding: '20px',
            background: '#18181B',
            border: '1px solid #3A3A44',
            borderRadius: '12px'
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
            Total History
          </span>

          <h3
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#fff',
              marginTop: '6px'
            }}
          >
            {totalHistoryCount}
          </h3>

        </div>

        {/* ONGOING */}

        <div
          className="glass-panel"
          style={{
            padding: '20px',
            background: '#18181B',
            border: '1px solid #3A3A44',
            borderRadius: '12px'
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
            Ongoing
          </span>

          <h3
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#3B82F6',
              marginTop: '6px'
            }}
          >
            {ongoingCount}
          </h3>

        </div>

        {/* COMPLETED */}

        <div
          className="glass-panel"
          style={{
            padding: '20px',
            background: '#18181B',
            border: '1px solid #3A3A44',
            borderRadius: '12px'
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
            Completed
          </span>

          <h3
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#22C55E',
              marginTop: '6px'
            }}
          >
            {completedCount}
          </h3>

        </div>

      </div>

      {/* ======================================================
          SEARCH + FILTER
          ====================================================== */}

      <FilterBar

        searchPlaceholder="Search by ID..."

        searchQuery={searchMsgId}

        setSearchQuery={(value) => {

          setSearchMsgId(value);

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

        dropdownOptions={teamOptions}

        dropdownPlaceholder="All Teams"

      />

      {/* ======================================================
          TABLE
          ====================================================== */}

      <div className="glass-panel table-panel-full">

        {paginatedMessages.length === 0 ? (

          <div className="empty-history text-center">

            <Mail
              size={44}
              className="text-muted"
            />

            <p>
              No Worker History Found
            </p>

            <span>
              No ongoing or completed worker messages
              match the selected filters.
            </span>

          </div>

        ) : (

          <>

            <div className="modern-table-container custom-table-scroll">

              <table className="modern-table full-width-table">

                <thead>

                  <tr>

                    <th>ID</th>

                    <th>WORKER</th>

                    <th>TEAM</th>

                    <th>MESSAGE</th>

                    <th>STATUS</th>

                    <th>ASSIGNED TEAM</th>

                    <th>START TIME</th>

                    <th>END TIME</th>

                    <th>CREATED TIME</th>

                    <th>ACTION</th>

                  </tr>

                </thead>

                <tbody>

                  {paginatedMessages.map((msg) => (

                    <tr
                      key={msg.displayId}
                      className="table-row-hoverable"
                    >

                      {/* ID */}

                      <td
                        className="font-mono font-bold id-highlight"
                      >
                        {msg.displayId}
                      </td>

                      {/* WORKER */}

                      <td className="worker-cell">
                        {msg.workerName}
                      </td>

                      {/* REQUESTING TEAM */}

                      <td className="team-cell">
                        {msg.teamName}
                      </td>

                      {/* MESSAGE */}

                      <td
                        className="msg-text-cell"
                        style={{
                          minWidth: '250px',
                          maxWidth: '400px'
                        }}
                      >
                        {msg.message}
                      </td>

                      {/* STATUS */}

                      <td>
                        {getStatusBadge(
                          msg.status
                        )}
                      </td>

                      {/* ASSIGNED TEAM */}

                      <td className="team-cell">

                        {msg.assignedTeam ===
                        'NOT ASSIGNED' ? (

                          <span
                            style={{
                              color: '#71717A',
                              fontWeight: '700',
                              fontSize: '12px'
                            }}
                          >
                            NOT ASSIGNED
                          </span>

                        ) : (

                          msg.assignedTeam

                        )}

                      </td>

                      {/* START TIME */}

                      <td
                        className="font-mono time-cell"
                      >

                        {msg.startTime
                          ? formatDateTime(
                              msg.startTime
                            )
                          : '—'}

                      </td>

                      {/* END TIME */}

                      {/* END TIME */}

<td
  className="font-mono time-cell"
>

  {msg.endTime
    ? formatDateTime(msg.endTime)
    : '—'}

</td>

                      {/* CREATED TIME */}

                      <td
                        className="font-mono time-cell"
                      >

                        {msg.createdAt
                          ? formatTime(
                              msg.createdAt
                            )
                          : '—'}

                      </td>

                      {/* ACTION */}

                      <td>

                        {msg.status ===
                          'ONGOING' && (

                          <button
                            type="button"
                            className="action-btn"
                            onClick={() =>
                              handleComplete(msg)
                            }
                          >
                            COMPLETE
                          </button>

                        )}

                        {msg.status ===
                          'COMPLETED' && (

                          <span
                            style={{
                              color: '#22C55E',
                              fontSize: '11px',
                              fontWeight: '800'
                            }}
                          >
                            COMPLETED
                          </span>

                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {/* ==================================================
                PAGINATION
                ================================================== */}

            <div className="pagination-wrapper flex-between">

              <div className="pagination-left flex-align">

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

                <div className="rows-per-page flex-align">

                  <span className="rows-label">
                    Rows per page:
                  </span>

                  <select
                    value={pageSize}
                    onChange={(e) => {

                      setPageSize(
                        Number(e.target.value)
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

              <div className="pagination-right flex-align">

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

                <div className="page-numbers-row">

                  {Array.from({
                    length: totalPages
                  }).map((_, idx) => {

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
                          safeCurrentPage === pageNum
                            ? 'active-page-btn'
                            : ''
                        }`}
                      >
                        {pageNum}
                      </button>

                    );

                  })}

                </div>

                <button
                  className={`pagination-btn ${
                    safeCurrentPage === totalPages
                      ? 'disabled-btn'
                      : ''
                  }`}
                  onClick={handleNext}
                  disabled={
                    safeCurrentPage === totalPages
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

export default WorkerMessages;