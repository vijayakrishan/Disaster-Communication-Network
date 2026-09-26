import React, { useState } from 'react';
import {
  Search,
  Calendar,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageSquare,
  CheckCircle,
  MapPin,
  User,
  Users,
  Radio,
  Clock
} from 'lucide-react';

import './Dashboard.css';


const WorkerHelpMessages = ({ initialMessages = [] }) => {

  const [messages, setMessages] =
    useState(initialMessages);


  // =====================================================
  // FILTER STATE
  // =====================================================

  const [searchQuery, setSearchQuery] =
    useState('');

  const [filterDate, setFilterDate] =
    useState('');

  const [currentPage, setCurrentPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(10);


  // =====================================================
  // NORMALIZE BACKEND DATA
  // =====================================================

  const normalizeMessage = (msg) => {

    return {

      id:
        msg.id ??
        msg.messageId ??
        'N/A',


      workerId:
        msg.workerId ??
        msg.worker_id ??
        msg.worker?.id ??
        'N/A',


      workerName:
        msg.workerName ??
        msg.worker_name ??
        msg.worker?.name ??
        msg.worker ??
        'N/A',


      teamId:
        msg.teamId ??
        msg.team_id ??
        msg.requestingTeamId ??
        'N/A',


      teamName:
        msg.teamName ??
        msg.team_name ??
        msg.requestingTeamName ??
        msg.team ??
        'N/A',


      message:
        msg.message ??
        msg.messageText ??
        msg.message_text ??
        'No message',


      location:
        msg.location ??
        (
          msg.latitude != null &&
          msg.longitude != null
            ? `${msg.latitude}, ${msg.longitude}`
            : 'Location unavailable'
        ),


      latitude:
        msg.latitude ??
        null,


      longitude:
        msg.longitude ??
        null,


      source:
        msg.source ??
        msg.requestSource ??
        'WEB',


      createdAt:
        msg.createdAt ??
        msg.created_at ??
        msg.time ??
        null,


      status:
        msg.status ??
        'PENDING',


      acceptedByTeamId:
        msg.acceptedByTeamId ??
        msg.accepted_by_team_id ??
        null,


      acceptedByTeamName:
        msg.acceptedByTeamName ??
        msg.accepted_by_team_name ??
        null,


      acceptedAt:
        msg.acceptedAt ??
        msg.accepted_at ??
        null

    };
  };


  // =====================================================
  // PREPARE MESSAGES
  // =====================================================

  const normalizedMessages =
    messages.map(normalizeMessage);


  // =====================================================
  // FORMAT DATE / TIME
  // =====================================================

  const formatDateTime = (value) => {

    if (!value) {
      return 'N/A';
    }

    try {

      const date =
        new Date(value);

      if (isNaN(date.getTime())) {
        return String(value);
      }

      return date.toLocaleString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
      );

    } catch {

      return String(value);
    }
  };


  // =====================================================
  // FILTER
  // =====================================================

  const filteredMessages =
    normalizedMessages.filter(msg => {

      if (searchQuery) {

        const q =
          searchQuery.toLowerCase();

        const matchId =
          String(msg.id)
            .toLowerCase()
            .includes(q);

        const matchWorker =
          String(msg.workerName)
            .toLowerCase()
            .includes(q);

        const matchWorkerId =
          String(msg.workerId)
            .toLowerCase()
            .includes(q);

        const matchTeam =
          String(msg.teamName)
            .toLowerCase()
            .includes(q);

        const matchTeamId =
          String(msg.teamId)
            .toLowerCase()
            .includes(q);

        const matchText =
          String(msg.message)
            .toLowerCase()
            .includes(q);

        if (
          !matchId &&
          !matchWorker &&
          !matchWorkerId &&
          !matchTeam &&
          !matchTeamId &&
          !matchText
        ) {
          return false;
        }
      }


      // -------------------------------------------------
      // DATE FILTER
      // -------------------------------------------------

      if (filterDate) {

        if (!msg.createdAt) {
          return false;
        }

        const messageDate =
          new Date(msg.createdAt)
            .toISOString()
            .split('T')[0];

        if (messageDate !== filterDate) {
          return false;
        }
      }


      return true;
    });


  // =====================================================
  // PAGINATION
  // =====================================================

  const totalRecords =
    filteredMessages.length;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalRecords / pageSize
      )
    );

  const startIndex =
    (currentPage - 1) * pageSize;

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


  // =====================================================
  // PAGINATION ACTIONS
  // =====================================================

  const handlePrev = () => {

    if (currentPage > 1) {

      setCurrentPage(
        currentPage - 1
      );
    }
  };


  const handleNext = () => {

    if (currentPage < totalPages) {

      setCurrentPage(
        currentPage + 1
      );
    }
  };


  // =====================================================
  // ACCEPT
  // =====================================================

  const handleRespond = (id) => {

    setMessages(prev =>
      prev.map(msg =>
        String(msg.id) === String(id)
          ? {
              ...msg,
              status: 'ACCEPTED'
            }
          : msg
      )
    );
  };


  // =====================================================
  // RESOLVE
  // =====================================================

  const handleResolve = (id) => {

    setMessages(prev =>
      prev.map(msg =>
        String(msg.id) === String(id)
          ? {
              ...msg,
              status: 'RESOLVED'
            }
          : msg
      )
    );
  };


  // =====================================================
  // STATUS BADGE
  // =====================================================

  const getStatusBadgeClass = (status) => {

    switch (
      status?.toUpperCase()
    ) {

      case 'PENDING':
        return 'badge-pending';

      case 'ACCEPTED':
        return 'badge-completed';

      case 'RESOLVED':
      case 'COMPLETED':
        return 'badge-online';

      case 'REJECTED':
      case 'CANCELLED':
        return 'badge-critical';

      default:
        return 'badge-pending';
    }
  };


  // =====================================================
  // SOURCE BADGE
  // =====================================================

  const getSourceBadge = (source) => {

    const value =
      String(source || 'WEB')
        .toUpperCase();

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '700',
          background:
            value === 'DEVICE'
              ? 'rgba(245,158,11,0.12)'
              : 'rgba(34,197,94,0.12)',
          color:
            value === 'DEVICE'
              ? '#F59E0B'
              : '#22C55E',
          border:
            value === 'DEVICE'
              ? '1px solid rgba(245,158,11,0.25)'
              : '1px solid rgba(34,197,94,0.25)'
        }}
      >

        <Radio size={11} />

        {value}

      </span>
    );
  };


  // =====================================================
  // VIEW DETAILS
  // =====================================================

  const handleView = (msg) => {

    const details = [

      `Worker Name: ${msg.workerName}`,

      `Worker ID: ${msg.workerId}`,

      `Team Name: ${msg.teamName}`,

      `Team ID: ${msg.teamId}`,

      `Message: ${msg.message}`,

      `Location: ${msg.location}`,

      `Source: ${msg.source}`,

      `Requested: ${formatDateTime(msg.createdAt)}`,

      `Status: ${msg.status}`

    ].join('\n');


    window.alert(details);
  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div
      className="dispatch-queue-card"
      style={{
        marginTop: '24px'
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="queue-header-row">

        <HelpCircle
          size={22}
          className="queue-icon"
          style={{
            color: '#F59E0B'
          }}
        />

        <div>

          <h3
            style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#FAFAFA'
            }}
          >
            Worker Help Requests
          </h3>

          <p
            style={{
              fontSize: '12px',
              color: '#71717A',
              marginTop: '2px'
            }}
          >
            Assistance requests sent by workers
            from active rescue teams.
          </p>

        </div>

      </div>


      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="queue-filter-row">

        <div className="filter-left">

          <div className="filter-search-box">

            <Search
              size={16}
              className="search-field-icon"
            />

            <input
              type="text"
              placeholder="Search worker, team, ID or message..."
              value={searchQuery}
              onChange={(e) => {

                setSearchQuery(
                  e.target.value
                );

                setCurrentPage(1);
              }}
              className="search-field-input"
            />

          </div>

        </div>


        <div className="filter-right">

          <div className="filter-date-input-wrapper">

            <Calendar
              size={14}
              className="calendar-field-icon"
            />

            <input
              type="date"
              value={filterDate}
              onChange={(e) => {

                setFilterDate(
                  e.target.value
                );

                setCurrentPage(1);
              }}
              className="filter-date-input"
            />

          </div>

        </div>

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="dark-table-container">

        <table className="dark-table">

          <thead>

            <tr>

              <th>ID</th>

              <th>WORKER</th>

              <th>TEAM</th>

              <th>HELP MESSAGE</th>

              <th>LOCATION</th>

              <th>SOURCE</th>

              <th>REQUESTED TIME</th>

              <th>STATUS</th>

              <th
                style={{
                  textAlign: 'center'
                }}
              >
                ACTION
              </th>

            </tr>

          </thead>


          <tbody>

            {paginatedMessages.length === 0 ? (

              <tr>

                <td
                  colSpan={9}
                  className="empty-table-cell"
                >

                  <div
                    className="empty-state-centered"
                  >

                    <HelpCircle
                      size={38}
                      style={{
                        color: '#52525B',
                        marginBottom: '10px'
                      }}
                    />

                    <h4>
                      No Worker Help Requests
                    </h4>

                    <p>
                      No active assistance requests
                      from rescue teams.
                    </p>

                  </div>

                </td>

              </tr>

            ) : (

              paginatedMessages.map(msg => (

                <tr
                  key={msg.id}
                >

                  {/* ID */}

                  <td>

                    <span
                      className="font-mono font-bold font-red"
                    >
                      {msg.id}
                    </span>

                  </td>


                  {/* WORKER */}

                  <td>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px'
                      }}
                    >

                      <span
                        style={{
                          color: '#FFFFFF',
                          fontWeight: '700'
                        }}
                      >
                        {msg.workerName}
                      </span>

                      <span
                        style={{
                          color: '#71717A',
                          fontSize: '11px',
                          fontFamily: 'monospace'
                        }}
                      >
                        ID: {msg.workerId}
                      </span>

                    </div>

                  </td>


                  {/* TEAM */}

                  <td>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px'
                      }}
                    >

                      <span
                        style={{
                          color: '#22D3EE',
                          fontWeight: '700'
                        }}
                      >
                        {msg.teamName}
                      </span>

                      <span
                        style={{
                          color: '#71717A',
                          fontSize: '11px',
                          fontFamily: 'monospace'
                        }}
                      >
                        ID: {msg.teamId}
                      </span>

                    </div>

                  </td>


                  {/* MESSAGE */}

                  <td>

                    <div
                      style={{
                        maxWidth: '300px',
                        color: '#D4D4D8',
                        lineHeight: '1.5'
                      }}
                    >
                      {msg.message}
                    </div>

                  </td>


                  {/* LOCATION */}

                  <td>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '6px',
                        maxWidth: '180px'
                      }}
                    >

                      <MapPin
                        size={14}
                        style={{
                          color: '#EF4444',
                          marginTop: '2px',
                          flexShrink: 0
                        }}
                      />

                      <span
                        style={{
                          color: '#A1A1AA',
                          fontSize: '11px'
                        }}
                      >
                        {msg.location}
                      </span>

                    </div>

                  </td>


                  {/* SOURCE */}

                  <td>

                    {getSourceBadge(
                      msg.source
                    )}

                  </td>


                  {/* TIME */}

                  <td>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        whiteSpace: 'nowrap'
                      }}
                    >

                      <Clock
                        size={13}
                        style={{
                          color: '#71717A'
                        }}
                      />

                      <span
                        className="font-mono"
                        style={{
                          fontSize: '11px'
                        }}
                      >
                        {formatDateTime(
                          msg.createdAt
                        )}
                      </span>

                    </div>

                  </td>


                  {/* STATUS */}

                  <td>

                    <span
                      className={`badge ${getStatusBadgeClass(
                        msg.status
                      )} badge-large`}
                    >
                      {msg.status}
                    </span>

                  </td>


                  {/* ACTION */}

                  <td>

                    <div
                      className="table-actions-flex"
                    >

                      <button
                        className="btn-action-dark btn-action-dark-secondary"
                        onClick={() =>
                          handleView(msg)
                        }
                        title="View complete details"
                      >

                        <Eye size={12} />

                        <span>
                          View
                        </span>

                      </button>


                      {msg.status === 'PENDING' ? (

                        <button
                          className="btn-action-dark btn-action-dark-primary"
                          onClick={() =>
                            handleRespond(
                              msg.id
                            )
                          }
                          title="Accept help request"
                        >

                          <MessageSquare
                            size={12}
                          />

                          <span>
                            Accept
                          </span>

                        </button>

                      ) : msg.status === 'ACCEPTED' ? (

                        <button
                          className="btn-action-dark btn-action-dark-primary"
                          onClick={() =>
                            handleResolve(
                              msg.id
                            )
                          }
                          style={{
                            background:
                              '#22C55E'
                          }}
                          title="Mark request resolved"
                        >

                          <CheckCircle
                            size={12}
                          />

                          <span>
                            Resolve
                          </span>

                        </button>

                      ) : (

                        <button
                          className="btn-action-dark btn-action-dark-disabled"
                          disabled
                        >

                          <CheckCircle
                            size={12}
                          />

                          <span>
                            Resolved
                          </span>

                        </button>

                      )}

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>


      {/* =================================================
          PAGINATION
      ================================================= */}

      {totalRecords > 0 && (

        <div
          className="pagination-container-dark"
        >

          <div
            className="pagination-left-info"
          >

            <span>

              Showing {startIndex + 1}-
              {endIndex} of {totalRecords}
              records

            </span>


            <div
              className="rows-page-selector-flex"
            >

              <span
                className="rows-label-text"
              >
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
                className="rows-dropdown-field"
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
            className="pagination-right-buttons"
          >

            <button
              className="pagination-control-button"
              onClick={handlePrev}
              disabled={
                currentPage === 1
              }
            >

              <ChevronLeft
                size={14}
              />

              <span>
                Previous
              </span>

            </button>


            <div
              className="pagination-numbers-row"
            >

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
                    className={`number-selector-btn ${
                      currentPage === pageNum
                        ? 'number-selector-btn-active'
                        : ''
                    }`}
                  >
                    {pageNum}
                  </button>

                );

              })}

            </div>


            <button
              className="pagination-control-button"
              onClick={handleNext}
              disabled={
                currentPage === totalPages
              }
            >

              <span>
                Next
              </span>

              <ChevronRight
                size={14}
              />

            </button>

          </div>

        </div>

      )}

    </div>

  );
};


export default WorkerHelpMessages;