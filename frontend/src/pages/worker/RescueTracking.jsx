import React, { useState, useEffect } from 'react';

import './RescueTracking.css';

import { useAppContext } from '../../context/AppContext';

import {
  Clock,
  ShieldAlert,
  CheckCircle,
  Navigation,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import FilterBar from '../../components/FilterBar';


const RescueTracking = () => {

  const {
    alerts = [],
    teams = [],
    fetchAlerts
  } = useAppContext();
useEffect(() => {
  fetchAlerts?.();
}, []);

  // =====================================================
  // FILTER STATE
  // =====================================================

  const [searchRescueId, setSearchRescueId] =
    useState('');

  const [filterDate, setFilterDate] =
    useState('');

  const [filterTeam, setFilterTeam] =
    useState('ALL');


  // =====================================================
  // PAGINATION
  // =====================================================

  const [currentPage, setCurrentPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(10);


  // =====================================================
  // DEBUG
  // =====================================================

  useEffect(() => {

    console.log(
      'RESCUE TRACKING ALERTS:',
      alerts
    );

    console.log(
      'RESCUE TRACKING TEAMS:',
      teams
    );

  }, [alerts, teams]);


 
const getStatus = (alert) => {

  const rawStatus =
    alert?.rescueStatus ??
    alert?.rescue_status ??
    alert?.status ??
    alert?.rescueState ??
    alert?.rescue_state ??
    '';

  const status = String(rawStatus)
    .trim()
    .toUpperCase();

  console.log(
    'SOS STATUS:',
    getRescueId(alert),
    status
  );

  if (
    status === 'ACTIVE' ||
    status === 'IN_PROGRESS' ||
    status === 'ONGOING' ||
    status === 'EN_ROUTE' ||
    status === 'IN PROGRESS' ||
    status === 'ACCEPTED' ||
    status === 'ASSIGNED'
  ) {
    return 'ONGOING';
  }

  if (
    status === 'COMPLETED' ||
    status === 'COMPLETE' ||
    status === 'RESOLVED'
  ) {
    return 'COMPLETED';
  }

  if (status === 'PENDING') {
    return 'PENDING';
  }

  return status || 'PENDING';
};
  // =====================================================
  // GET RESCUE ID
  // =====================================================

  const getRescueId = (alert) => {

    return (
      alert?.sosId ||
      alert?.id ||
      '--'
    );

  };



  // =====================================================
  // GET TEAM NAME
  // =====================================================

 const getTeamName = (teamId) => {

  if (!teamId) {
    return 'Unassigned';
  }

  const team =
    teams.find(
      t =>
        String(t.id)
          .trim()
          .toLowerCase() ===
        String(teamId)
          .trim()
          .toLowerCase()
    );

  return (
    team?.name ||
    team?.teamName ||
    'Unknown Team'
  );
};
  


  // =====================================================
  // GET TEAM ID
  // =====================================================

 const getTeamId = (alert) => {

  return (
    alert?.assignedTeamId ||
    alert?.assigned_team_id ||
    alert?.acceptedByTeamId ||
    alert?.accepted_by_team_id ||
    alert?.teamId ||
    alert?.team_id ||
    null
  );

};
// =====================================================
// SUMMARY COUNTS
// =====================================================

// ONGOING RESCUES
const ongoingAlerts = alerts.filter(
  (alert) => getStatus(alert) === 'ONGOING'
);


// ACTIVE MISSIONS
// Number of currently ongoing rescue missions
const activeCount = ongoingAlerts.length;


// TEAMS EN ROUTE
// Count UNIQUE teams currently handling an ongoing rescue
const enRouteTeamIds = new Set(
  ongoingAlerts
    .map((alert) => getTeamId(alert))
    .filter(Boolean)
);

const enRouteCount = enRouteTeamIds.size;


// COMPLETED RESCUES
// Number of completed rescue records
const completedCount = alerts.filter(
  (alert) => getStatus(alert) === 'COMPLETED'
).length;

  // =====================================================
  // GET DATE
  // =====================================================

  const getAlertDate = (alert) => {

    const value =
      alert?.timestamp ||
      alert?.createdAt ||
      alert?.created_at;


    if (!value) {

      return null;

    }


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return null;

    }


    return date;

  };


// =====================================================
// GET LOCATION
// =====================================================

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

  // ---------------------------------------------------
  // LOCATION NOT AVAILABLE
  // ---------------------------------------------------

  if (
    lat === null ||
    lat === undefined ||
    lng === null ||
    lng === undefined
  ) {
    return '--';
  }

  // ---------------------------------------------------
  // CONVERT BACKEND VALUES TO NUMBER
  // ---------------------------------------------------

  const latitude = Number(lat);
  const longitude = Number(lng);

  // ---------------------------------------------------
  // INVALID NUMBER
  // ---------------------------------------------------

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return '--';
  }

  // ---------------------------------------------------
  // VALID LOCATION
  // ---------------------------------------------------

  return (
    `${latitude.toFixed(5)}° N, ` +
    `${longitude.toFixed(5)}° E`
  );
};

  // =====================================================
  // GET START TIME
  // =====================================================

 const getStartTime = (alert) => {
  return alert?.startTime || '--';
};

  // =====================================================
  // GET END TIME
  // =====================================================
const getEndTime = (alert) => {
  if (getStatus(alert) !== 'COMPLETED') {
    return '--';
  }

  return alert?.endTime || '--';
};
  // =====================================================
  // STATUS BADGE
  // =====================================================
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

    case 'PENDING':

      return (
        <span className="badge badge-pending badge-large">
          PENDING
        </span>
      );

    default:

      return (
        <span className="badge badge-info badge-large">
          {status}
        </span>
      );
  }
};
 


  // =====================================================
  // FILTER ALERTS
  // =====================================================

  const filteredAlerts =
    alerts.filter((alert) => {


      // -------------------------------------------------
      // SEARCH BY RESCUE ID
      // -------------------------------------------------

      if (searchRescueId) {

        const rescueId =
          String(
            getRescueId(alert)
          ).toLowerCase();


        if (
          !rescueId.includes(
            searchRescueId.toLowerCase()
          )
        ) {

          return false;

        }

      }


      // -------------------------------------------------
      // DATE FILTER
      // -------------------------------------------------

      if (filterDate) {

        const date =
          getAlertDate(alert);


        if (!date) {

          return false;

        }


        const dateString =
          date
            .toISOString()
            .split('T')[0];


        if (
          dateString !== filterDate
        ) {

          return false;

        }

      }


      // -------------------------------------------------
      // TEAM FILTER
      // -------------------------------------------------

      if (
        filterTeam !== 'ALL'
      ) {

        const teamId =
          getTeamId(alert);


        if (
          String(teamId) !==
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


  const startIndex =
    (currentPage - 1) *
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
  // PREVIOUS
  // =====================================================

  const handlePrev = () => {

    if (
      currentPage > 1
    ) {

      setCurrentPage(
        currentPage - 1
      );

    }

  };


  // =====================================================
  // NEXT
  // =====================================================

  const handleNext = () => {

    if (
      currentPage < totalPages
    ) {

      setCurrentPage(
        currentPage + 1
      );

    }

  };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="dashboard-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '24px'
        }}
      >

        <Navigation
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
          Rescue Tracking
        </h3>

      </div>


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="grid-cols-3 statistics-row">


        {/* ACTIVE */}

        <div
          className="glass-panel status-summary-card"
        >

          <div className="summary-icon bg-danger-light">

            <ShieldAlert
              size={20}
              color="var(--color-danger)"
            />

          </div>


          <div className="summary-text">

            <span className="label text-muted">
              Active Missions
            </span>

            <span className="val">
              {activeCount}
            </span>

          </div>

        </div>


        {/* EN ROUTE */}

        <div
          className="glass-panel status-summary-card"
        >

          <div className="summary-icon bg-info-light">

            <Navigation
              size={20}
              color="var(--color-info)"
            />

          </div>


          <div className="summary-text">

            <span className="label text-muted">
              Teams En Route
            </span>

            <span className="val">
              {enRouteCount}
            </span>

          </div>

        </div>


        {/* COMPLETED */}

        <div
          className="glass-panel status-summary-card"
        >

          <div className="summary-icon bg-success-light">

            <CheckCircle
              size={20}
              color="var(--color-success)"
            />

          </div>


          <div className="summary-text">

            <span className="label text-muted">
              Completed Rescues
            </span>

            <span
              className="val text-success"
              style={{
                color:
                  'var(--color-success)'
              }}
            >
              {completedCount}
            </span>

          </div>

        </div>

      </div>


      {/* =================================================
          FILTER BAR
      ================================================= */}

      <FilterBar

        searchPlaceholder=
          "Search by Rescue ID..."

        searchQuery={
          searchRescueId
        }

        setSearchQuery={(value) => {

          setSearchRescueId(
            value
          );

          setCurrentPage(1);

        }}


        filterDate={
          filterDate
        }

        setFilterDate={(value) => {

          setFilterDate(
            value
          );

          setCurrentPage(1);

        }}


        dropdownValue={
          filterTeam
        }

        setDropdownValue={(value) => {

          setFilterTeam(
            value
          );

          setCurrentPage(1);

        }}


        dropdownOptions={

          teams.map(
            (team) => ({

              value:
                team.id,

              label:
                team.name ||
                team.teamName ||
                team.id

            })
          )

        }


        dropdownPlaceholder=
          "All Teams"

      />


      {/* =================================================
          TABLE
      ================================================= */}

      <div
        className="glass-panel table-panel"
      >

        {paginatedAlerts.length === 0 ? (

          <div
            className="empty-state-panel text-center"
          >

            <Clock
              size={48}
              className=
                "empty-icon text-muted"
            />

            <h3>
              No Rescue Records
            </h3>

            <p>
              No rescue records found.
            </p>

          </div>

        ) : (

          <>

            <div
              className=
                "modern-table-container"
            >

              <table
                className=
                  "modern-table full-width-table"
              >

                <thead>

                  <tr>

                    <th>
                      RESCUE ID
                    </th>

                    <th>
                      TEAM NAME
                    </th>

                    <th>
                      CURRENT LOCATION
                    </th>

                    <th>
                      START TIME
                    </th>

                    <th>
                      END TIME
                    </th>

                    <th>
                      STATUS
                    </th>

                  </tr>

                </thead>


                <tbody>
{paginatedAlerts.map(alert => {

  const teamId = getTeamId(alert);

  return (
    <tr key={alert.id || alert.sosId}>

      <td>
        {getRescueId(alert)}
      </td>

      <td className="team-cell">
        {getTeamName(teamId)}
      </td>

      <td>
        {getLocation(alert)}
      </td>

      <td>
        {getStartTime(alert)}
      </td>

      <td>
        {getEndTime(alert)}
      </td>

      <td>
        {getStatusBadge(getStatus(alert))}
      </td>

    </tr>
  );

})}

                </tbody>

              </table>

            </div>


            {/* =================================================
                PAGINATION
            ================================================= */}

            <div
              className=
                "pagination-wrapper flex-between"
            >

              <div
                className=
                  "pagination-left flex-align"
              >

                <span
                  className=
                    "pagination-info"
                >

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
                  className=
                    "rows-per-page flex-align"
                >

                  <span
                    className=
                      "rows-label"
                  >
                    Rows per page:
                  </span>


                  <select

                    value={
                      pageSize
                    }

                    onChange={(e) => {

                      setPageSize(
                        Number(
                          e.target.value
                        )
                      );

                      setCurrentPage(1);

                    }}

                    className=
                      "rows-selector"

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
                className=
                  "pagination-right flex-align"
              >

                <button

                  className={
                    `pagination-btn ${
                      currentPage === 1
                        ? 'disabled-btn'
                        : ''
                    }`
                  }

                  onClick={
                    handlePrev
                  }

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
                  className=
                    "page-numbers-row"
                >

                  {Array.from({
                    length: totalPages
                  }).map(
                    (_, index) => {

                      const pageNum =
                        index + 1;


                      return (

                        <button

                          key={
                            pageNum
                          }

                          onClick={() =>
                            setCurrentPage(
                              pageNum
                            )
                          }

                          className={
                            `page-num-btn ${
                              currentPage === pageNum
                                ? 'active-page-btn'
                                : ''
                            }`
                          }

                        >

                          {pageNum}

                        </button>

                      );

                    }
                  )}

                </div>


                <button

                  className={
                    `pagination-btn ${
                      currentPage === totalPages
                        ? 'disabled-btn'
                        : ''
                    }`
                  }

                  onClick={
                    handleNext
                  }

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

          </>

        )}

      </div>

    </div>

  );

};


export default RescueTracking;