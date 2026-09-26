import React from 'react';

import {
  Search,
  Calendar,
  ShieldAlert,
  Play,
  Eye,
  Navigation,
  CheckCircle
} from 'lucide-react';

import './Dashboard.css';


const ActiveSOSDispatchQueue = ({
  alerts = [],
  teams = [],

  searchSosId = '',
  setSearchSosId,

  filterDate = '',
  setFilterDate,

  filterTeam = 'ALL',
  setFilterTeam,

  onAssign,
  onView,
  onTrack,
  onComplete
}) => {


  // =====================================================
  // TEAM NAME
  // =====================================================

  const getTeamName = (teamId) => {

    if (!teamId) {
      return 'Unassigned';
    }

    const team =
      teams.find(
        (t) =>
          String(t.id) ===
          String(teamId)
      );

    return (
      team?.name ||
      team?.teamName ||
      'Unassigned'
    );

  };


  // =====================================================
  // PRIORITY BADGE
  // =====================================================

  const getPriorityBadgeClass =
    (priority) => {

      switch (
        String(
          priority || ''
        ).toUpperCase()
      ) {

        case 'CRITICAL':
          return 'badge-critical';

        case 'HIGH':
          return 'badge-pending';

        case 'MEDIUM':
          return 'badge-completed';

        case 'LOW':
          return 'badge-online';

        default:
          return 'badge-info';

      }

    };


  // =====================================================
  // MISSION STATUS BADGE
  // =====================================================

  const getMissionBadgeClass =
    (status) => {

      switch (
        String(
          status || ''
        ).toUpperCase()
      ) {

        case 'ACTIVE':
          return 'badge-active';

        case 'PENDING':
          return 'badge-pending';

        case 'IN_PROGRESS':
          return 'badge-active';

        case 'COMPLETED':
          return 'badge-completed';

        case 'CANCELLED':
          return 'badge-cancelled';

        default:
          return 'badge-info';

      }

    };


  // =====================================================
  // GPS FORMAT
  // =====================================================

  const formatCoordinate = (
    value
  ) => {

    const number =
      Number(value);

    if (
      Number.isNaN(number)
    ) {
      return '—';
    }

    return number.toFixed(5);

  };


  // =====================================================
  // EMPTY STATE
  // =====================================================

  const isEmpty =
    alerts.length === 0;


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="dispatch-queue-card">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="queue-header-row">

        <ShieldAlert
          size={22}
          className="queue-icon"
        />

        <h3>
          Active SOS Dispatch Queue
        </h3>

      </div>


      {/* =================================================
          FILTER ROW
      ================================================= */}

      <div className="queue-filter-row">


        {/* SEARCH */}

        <div className="filter-left">

          <div className="filter-search-box">

            <Search
              size={16}
              className="search-field-icon"
            />

            <input
              type="text"
              placeholder="Search by SOS ID..."
              value={searchSosId}
              onChange={(e) => {

                if (
                  typeof setSearchSosId ===
                  'function'
                ) {

                  setSearchSosId(
                    e.target.value
                  );

                }

              }}
              className="search-field-input"
            />

          </div>

        </div>


        {/* DATE + TEAM */}

        <div className="filter-right">


          {/* DATE */}

          <div className="filter-date-input-wrapper">

            <Calendar
              size={14}
              className="calendar-field-icon"
            />

            <input
              type="date"
              value={filterDate}
              onChange={(e) => {

                if (
                  typeof setFilterDate ===
                  'function'
                ) {

                  setFilterDate(
                    e.target.value
                  );

                }

              }}
              className="filter-date-input"
            />

          </div>


          {/* TEAM */}

          <select
            value={filterTeam}
            onChange={(e) => {

              if (
                typeof setFilterTeam ===
                'function'
              ) {

                setFilterTeam(
                  e.target.value
                );

              }

            }}
            className="filter-team-dropdown"
          >

            <option value="ALL">
              All Teams
            </option>


            {teams.map((team) => (

              <option
                key={team.id}
                value={team.id}
              >
                {team.name ||
                 team.teamName ||
                 'Unnamed Team'}
              </option>

            ))}

          </select>

        </div>

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="dark-table-container">

        <table className="dark-table">


          {/* =================================================
              TABLE HEADER
          ================================================= */}

          <thead>

            <tr>

              <th>
                SOS ID
              </th>

              <th>
                VICTIM NAME
              </th>

              <th>
                GPS COORDINATES
              </th>


              <th>
                MISSION STATE
              </th>

              <th>
                ASSIGNED TEAM
              </th>

              <th
                style={{
                  textAlign: 'center'
                }}
              >
                ACTION
              </th>

            </tr>

          </thead>


          {/* =================================================
              TABLE BODY
          ================================================= */}

          <tbody>


            {isEmpty ? (

              <tr>

                <td
                  colSpan={7}
                  className="empty-table-cell"
                >

                  <div
                    className="empty-state-centered"
                  >

                    <h4>
                      No Pending SOS
                    </h4>

                    <p>
                      All sectors report clear.
                    </p>

                  </div>

                </td>

              </tr>

            ) : (

              alerts.map(
                (alert) => {

                  const alertId =
                    alert.id ??
                    alert.sosId;


                  const status =
                    String(
                      alert.status ||
                      alert.rescueStatus ||
                      'PENDING'
                    ).toUpperCase();


                  const priority =
                    String(
                      alert.priority ||
                      'LOW'
                    ).toUpperCase();


                 const victimName =
                 alert.victimName ||
                 alert.userName ||
                 alert.victim ||
                 alert.name ||
                'Unknown';


                  const latitude =
                    alert.lat ??
                    alert.latitude;


                  const longitude =
                    alert.lng ??
                    alert.longitude;


                  return (

                    <tr
                      key={alertId}
                    >


                      {/* SOS ID */}

                      <td
                        className="font-mono font-bold font-red"
                      >
                        {alertId || '—'}
                      </td>


                      {/* VICTIM */}

                      <td
                        className="victim-td font-bold"
                        style={{
                          color: '#fff'
                        }}
                      >
                        {victimName}
                      </td>


                      {/* GPS */}

                      <td
                        className="font-mono location-td"
                      >

                        {formatCoordinate(
                          latitude
                        )}

                        ° N,

                        {' '}

                        {formatCoordinate(
                          longitude
                        )}

                        ° W

                      </td>


                     


                      {/* STATUS */}

                      <td>

                        <span
                          className={`badge ${getMissionBadgeClass(
                            status
                          )} badge-large`}
                        >
                          {status}
                        </span>

                      </td>


                      {/* TEAM */}

                      <td
                        className="team-td"
                      >
                        {getTeamName(
                          alert.assignedTeamId ||
                          alert.teamId
                        )}
                      </td>


                      {/* ACTION */}

                      <td>

                        <div
                          className="table-actions-flex"
                        >


                          {/* =================================
                              PENDING → ACCEPT
                          ================================= */}

                          {status ===
                            'PENDING' && (

                            <button

                              type="button"

                              className="btn-action-dark btn-action-dark-primary"

                              onClick={() => {

                                if (
                                  typeof onAssign ===
                                  'function'
                                ) {

                                  onAssign(
                                    alertId
                                  );

                                }

                              }}

                            >

                              <Play
                                size={12}
                              />

                              <span>
                                Assign Team
                              </span>

                            </button>

                          )}


                          {/* =================================
                              ACTIVE → COMPLETE
                          ================================= */}

                          


                          {/* =================================
                              COMPLETED
                          ================================= */}

                          {status ===
                            'COMPLETED' && (

                            <button

                              type="button"

                              className="btn-action-dark btn-action-dark-disabled"

                              disabled

                            >

                              <CheckCircle
                                size={12}
                              />

                              <span>
                                Completed
                              </span>

                            </button>

                          )}


                          {/* =================================
                              VIEW
                          ================================= */}

                          <button

                            type="button"

                            className="btn-action-dark btn-action-dark-secondary"

                            onClick={() => {

                              if (
                                typeof onView ===
                                'function'
                              ) {

                                onView(
                                  alertId
                                );

                              }

                            }}

                          >

                            <Eye
                              size={12}
                            />

                            <span>
                              View
                            </span>

                          </button>


                          {/* =================================
                              TRACK
                          ================================= */}

                          <button

                            type="button"

                            className="btn-action-dark btn-action-dark-secondary"

                            onClick={() => {

                              if (
                                typeof onTrack ===
                                'function'
                              ) {

                                onTrack(
                                  alertId
                                );

                              }

                            }}

                          >

                            <Navigation
                              size={12}
                            />

                            <span>
                              Track
                            </span>

                          </button>


                        </div>

                      </td>

                    </tr>

                  );

                }

              )

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

};


export default ActiveSOSDispatchQueue;