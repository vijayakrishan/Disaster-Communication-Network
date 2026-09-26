import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import {
  Activity,
  Search,
  Trash2,
  Plus,
  X,
  ArrowUpDown
} from 'lucide-react';

import { formatIndianPhoneNumber } from '../../utils/phone';
import Pagination from '../../components/Pagination';
import '../../components/Dashboard.css';

const WorkerManagement = () => {

  const { teams } = useAppContext();

  // =====================================================
  // WORKERS FROM DATABASE
  // =====================================================

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // SEARCH / FORM / SORT / PAGINATION
  // =====================================================

  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const [newWorker, setNewWorker] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'WORKER',
    teamId: '',
    baseStation: '',
    status: 'AVAILABLE'
  });

  const [sortBy, setSortBy] = useState('workerId');
  const [sortOrder, setSortOrder] = useState('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // =====================================================
  // GET TEAM NAME
  // =====================================================

  const getTeamName = (teamId) => {

    if (!teamId) {
      return 'Unassigned';
    }

    const team = teams?.find(
      (t) => String(t.id) === String(teamId)
    );

    return team?.name || 'Unassigned';
  };

  // =====================================================
  // GET STATUS
  // =====================================================

  const getWorkerStatus = (worker) => {

    return (
      worker?.accountStatus ||
      worker?.status ||
      'OFFLINE'
    );
  };

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const getStatusBadgeClass = (status) => {

    switch (String(status || '').toUpperCase()) {

      case 'AVAILABLE':
      case 'ONLINE':
      case 'ACTIVE':
      case 'FREE':
        return 'badge-online';

      case 'BUSY':
      case 'ON_MISSION':
      case 'IN_PROGRESS':
        return 'badge-pending';

      case 'OFFLINE':
      case 'INACTIVE':
      default:
        return 'badge-critical';
    }
  };

  // =====================================================
  // FETCH WORKERS
  // =====================================================

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        'http://localhost:8081/api/workers'
      );

      if (!response.ok) {

        const errorText = await response.text();

        throw new Error(
          errorText || 'Failed to fetch workers'
        );
      }

      const data = await response.json();

      if (Array.isArray(data)) {

        setWorkers(data);

      } else {

        setWorkers([]);
      }

    } catch (error) {

      console.error(
        'Error fetching workers:',
        error
      );

      setWorkers([]);

    } finally {

      setLoading(false);
    }
  };

  // =====================================================
  // ADD WORKER
  // =====================================================

  const handleAddWorker = async (e) => {

    e.preventDefault();

    if (
      !newWorker.name.trim() ||
      !newWorker.email.trim() ||
      !newWorker.password.trim()
    ) {

      alert(
        'Name, Email and Password are required.'
      );

      return;
    }

    try {

      const selectedTeam = teams?.find(
        (team) =>
          String(team.id) === String(newWorker.teamId)
      );

      const payload = {

        name: newWorker.name.trim(),

        email: newWorker.email.trim(),

        password: newWorker.password,

        phone: newWorker.phone.trim(),

        // IMPORTANT:
        // This is the auth role used to identify workers.
        role: 'WORKER',

        teamId: newWorker.teamId
          ? String(newWorker.teamId)
          : null,

        teamName: selectedTeam?.name || null,

        baseStation: newWorker.baseStation.trim(),

        accountStatus:
          newWorker.status.toUpperCase()
      };

      console.log(
        'ADDING WORKER:',
        payload
      );

      const response = await fetch(
        'http://localhost:8081/api/workers',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {

        const errorText =
          await response.text();

        throw new Error(
          errorText ||
          'Failed to add worker'
        );
      }

      const savedWorker =
        await response.json();

      console.log(
        'WORKER SAVED:',
        savedWorker
      );

      // Refresh from DB
      await fetchWorkers();

      // Reset form
      setNewWorker({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'WORKER',
        teamId: '',
        baseStation: '',
        status: 'AVAILABLE'
      });

      setShowAddForm(false);
      setCurrentPage(1);

      alert(
        `Worker ${savedWorker?.workerId || ''} added successfully.`
      );

    } catch (error) {

      console.error(
        'Error adding worker:',
        error
      );

      alert(
        `Failed to add worker:\n${error.message}`
      );
    }
  };

  // =====================================================
  // DELETE WORKER
  // =====================================================

  const handleDeleteWorker = async (id) => {

    if (!id) {
      return;
    }

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this worker?'
      );

    if (!confirmed) {
      return;
    }

    try {

      const response = await fetch(
        `http://localhost:8081/api/workers/${id}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {

        const errorText =
          await response.text();

        throw new Error(
          errorText ||
          'Failed to delete worker'
        );
      }

      await fetchWorkers();

    } catch (error) {

      console.error(
        'Error deleting worker:',
        error
      );

      alert(
        `Failed to delete worker:\n${error.message}`
      );
    }
  };

  // =====================================================
  // SORT
  // =====================================================

  const handleSort = (field) => {

    const isAscending =
      sortBy === field &&
      sortOrder === 'asc';

    setSortBy(field);

    setSortOrder(
      isAscending
        ? 'desc'
        : 'asc'
    );
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const searchText =
    search.toLowerCase().trim();

  const filteredWorkers =
    workers.filter((worker) => {

      const workerId =
        String(worker?.workerId || '')
          .toLowerCase();

      const name =
        String(worker?.name || '')
          .toLowerCase();

      const email =
        String(worker?.email || '')
          .toLowerCase();

      const role =
        String(worker?.role || '')
          .toLowerCase();

      const teamName =
        getTeamName(worker?.teamId)
          .toLowerCase();

      const phone =
        String(worker?.phone || '')
          .toLowerCase();

      const baseStation =
        String(worker?.baseStation || '')
          .toLowerCase();

      return (
        workerId.includes(searchText) ||
        name.includes(searchText) ||
        email.includes(searchText) ||
        role.includes(searchText) ||
        teamName.includes(searchText) ||
        phone.includes(searchText) ||
        baseStation.includes(searchText)
      );
    });

  // =====================================================
  // SORT WORKERS
  // =====================================================

  const sortedWorkers =
    [...filteredWorkers].sort(
      (a, b) => {

        let fieldA;
        let fieldB;

        switch (sortBy) {

          case 'workerId':

            fieldA =
              String(a?.workerId || '');

            fieldB =
              String(b?.workerId || '');

            break;

          case 'name':

            fieldA =
              String(a?.name || '');

            fieldB =
              String(b?.name || '');

            break;

          case 'team':

            fieldA =
              getTeamName(a?.teamId);

            fieldB =
              getTeamName(b?.teamId);

            break;

          case 'status':

            fieldA =
              getWorkerStatus(a);

            fieldB =
              getWorkerStatus(b);

            break;

          default:

            fieldA =
              String(a?.[sortBy] || '');

            fieldB =
              String(b?.[sortBy] || '');
        }

        fieldA =
          fieldA.toLowerCase();

        fieldB =
          fieldB.toLowerCase();

        if (fieldA < fieldB) {

          return sortOrder === 'asc'
            ? -1
            : 1;
        }

        if (fieldA > fieldB) {

          return sortOrder === 'asc'
            ? 1
            : -1;
        }

        return 0;
      }
    );

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalRecords =
    sortedWorkers.length;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalRecords / pageSize
      )
    );

  const startIndex =
    (currentPage - 1) *
    pageSize;

  const paginatedWorkers =
    sortedWorkers.slice(
      startIndex,
      startIndex + pageSize
    );

  const endIndex =
    Math.min(
      startIndex + pageSize,
      totalRecords
    );

  // =====================================================
  // METRICS
  // =====================================================

  const totalWorkers =
    workers.length;

  const activeWorkers =
    workers.filter((worker) => {

      const status =
        getWorkerStatus(worker)
          .toUpperCase();

      return (
        status === 'AVAILABLE' ||
        status === 'BUSY' ||
        status === 'ONLINE' ||
        status === 'ACTIVE' ||
        status === 'FREE'
      );

    }).length;

  const availableWorkers =
    workers.filter((worker) => {

      const status =
        getWorkerStatus(worker)
          .toUpperCase();

      return (
        status === 'AVAILABLE' ||
        status === 'ONLINE' ||
        status === 'FREE'
      );

    }).length;

  const activeMissionWorkers =
    workers.filter((worker) => {

      const status =
        getWorkerStatus(worker)
          .toUpperCase();

      return (
        status === 'BUSY' ||
        status === 'ON_MISSION' ||
        status === 'IN_PROGRESS'
      );

    }).length;

  // =====================================================
  // RETURN
  // =====================================================

  return (

    <div className="dashboard-page">

      <div className="dashboard-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >

            <Activity
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
              Workers Directory
            </h3>

          </div>


          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}
          >

            {/* SEARCH */}

            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                width: '220px'
              }}
            >

              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  color: '#71717A'
                }}
              />

              <input
                type="text"
                placeholder="Search workers..."
                value={search}
                onChange={(e) => {

                  setSearch(
                    e.target.value
                  );

                  setCurrentPage(1);
                }}
                style={{
                  paddingLeft: '36px',
                  background:
                    'rgba(2, 8, 23, 0.9)',
                  border:
                    '1px solid #3A3A44',
                  color: '#F8FAFC',
                  height: '44px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none',
                  width: '100%'
                }}
              />

            </div>


            {/* ADD WORKER */}

            <button
              onClick={() =>
                setShowAddForm(
                  !showAddForm
                )
              }
              style={{
                background: '#0D9488',
                color: '#fff',
                border: 'none',
                padding: '0 16px',
                height: '44px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >

              {showAddForm
                ? <X size={14} />
                : <Plus size={14} />
              }

              <span>
                {showAddForm
                  ? 'Cancel'
                  : 'Add Worker'
                }
              </span>

            </button>

          </div>

        </div>


        {/* =================================================
            WORKER METRICS
        ================================================= */}

        <div
          className="grid-cols-4"
          style={{
            marginTop: '24px',
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
              Total Workers
            </span>

            <h3
              style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#fff',
                marginTop: '6px'
              }}
            >
              {loading
                ? '...'
                : totalWorkers
              }
            </h3>

          </div>


          {/* ACTIVE */}

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
              Active Workers
            </span>

            <h3
              style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#14B8A6',
                marginTop: '6px'
              }}
            >
              {loading
                ? '...'
                : activeWorkers
              }
            </h3>

          </div>


          {/* AVAILABLE */}

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
              Available Workers
            </span>

            <h3
              style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#22C55E',
                marginTop: '6px'
              }}
            >
              {loading
                ? '...'
                : availableWorkers
              }
            </h3>

          </div>


          {/* ACTIVE MISSION */}

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
              On Active Mission
            </span>

            <h3
              style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#F59E0B',
                marginTop: '6px'
              }}
            >
              {loading
                ? '...'
                : activeMissionWorkers
              }
            </h3>

          </div>

        </div>


        {/* =================================================
            ADD WORKER FORM
        ================================================= */}

        {showAddForm && (

          <div
            className="glass-panel"
            style={{
              padding: '20px',
              background: '#18181B',
              border: '1px solid #3A3A44',
              borderRadius: '8px',
              marginBottom: '24px'
            }}
          >

            <h4
              style={{
                color: '#fff',
                fontWeight: '700',
                fontSize: '14px',
                marginBottom: '14px'
              }}
            >
              Register New Rescue Worker
            </h4>


            <form
              onSubmit={handleAddWorker}
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(5, 1fr)',
                gap: '16px',
                alignItems: 'end'
              }}
            >

              {/* NAME */}

              <div>

                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: '#71717A',
                    marginBottom: '6px'
                  }}
                >
                  NAME
                </label>

                <input
                  type="text"
                  placeholder="e.g. John Miller"
                  value={newWorker.name}
                  onChange={(e) =>
                    setNewWorker(
                      (prev) => ({
                        ...prev,
                        name:
                          e.target.value
                      })
                    )
                  }
                  style={{
                    background:
                      'rgba(2, 8, 23, 0.9)',
                    border:
                      '1px solid #3A3A44',
                    color: '#fff',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    width: '100%'
                  }}
                  required
                />

              </div>


              {/* EMAIL */}

              <div>

                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: '#71717A',
                    marginBottom: '6px'
                  }}
                >
                  EMAIL
                </label>

                <input
                  type="email"
                  placeholder="email@resqmesh.org"
                  value={newWorker.email}
                  onChange={(e) =>
                    setNewWorker(
                      (prev) => ({
                        ...prev,
                        email:
                          e.target.value
                      })
                    )
                  }
                  style={{
                    background:
                      'rgba(2, 8, 23, 0.9)',
                    border:
                      '1px solid #3A3A44',
                    color: '#fff',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    width: '100%'
                  }}
                  required
                />

              </div>


              {/* PASSWORD */}

              <div>

                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: '#71717A',
                    marginBottom: '6px'
                  }}
                >
                  PASSWORD
                </label>

                <input
                  type="password"
                  placeholder="Worker password"
                  value={newWorker.password}
                  onChange={(e) =>
                    setNewWorker(
                      (prev) => ({
                        ...prev,
                        password:
                          e.target.value
                      })
                    )
                  }
                  style={{
                    background:
                      'rgba(2, 8, 23, 0.9)',
                    border:
                      '1px solid #3A3A44',
                    color: '#fff',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    width: '100%'
                  }}
                  required
                />

              </div>


              {/* PHONE */}

              <div>

                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: '#71717A',
                    marginBottom: '6px'
                  }}
                >
                  PHONE
                </label>

                <input
                  type="text"
                  placeholder="98765 43210"
                  value={newWorker.phone}
                  onChange={(e) =>
                    setNewWorker(
                      (prev) => ({
                        ...prev,
                        phone:
                          e.target.value
                      })
                    )
                  }
                  style={{
                    background:
                      'rgba(2, 8, 23, 0.9)',
                    border:
                      '1px solid #3A3A44',
                    color: '#fff',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    width: '100%'
                  }}
                  required
                />

              </div>


              {/* ROLE */}

              <div>

                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: '#71717A',
                    marginBottom: '6px'
                  }}
                >
                  ROLE
                </label>

                <input
                  type="text"
                  value="WORKER"
                  disabled
                  style={{
                    background:
                      'rgba(2, 8, 23, 0.5)',
                    border:
                      '1px solid #3A3A44',
                    color: '#71717A',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    width: '100%',
                    cursor: 'not-allowed'
                  }}
                />

              </div>


              {/* TEAM */}

              <div>

                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: '#71717A',
                    marginBottom: '6px'
                  }}
                >
                  TEAM
                </label>

                <select
                  value={newWorker.teamId}
                  onChange={(e) =>
                    setNewWorker(
                      (prev) => ({
                        ...prev,
                        teamId:
                          e.target.value
                      })
                    )
                  }
                  style={{
                    background:
                      'rgba(2, 8, 23, 0.9)',
                    border:
                      '1px solid #3A3A44',
                    color: '#fff',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    width: '100%'
                  }}
                >

                  <option value="">
                    Select Team
                  </option>

                  {teams?.map((team) => (

                    <option
                      key={team.id}
                      value={team.id}
                    >
                      {team.name}
                    </option>

                  ))}

                </select>

              </div>


              {/* BASE STATION */}

              <div>

                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: '#71717A',
                    marginBottom: '6px'
                  }}
                >
                  BASE STATION
                </label>

                <input
                  type="text"
                  placeholder="e.g. BS-04"
                  value={newWorker.baseStation}
                  onChange={(e) =>
                    setNewWorker(
                      (prev) => ({
                        ...prev,
                        baseStation:
                          e.target.value
                      })
                    )
                  }
                  style={{
                    background:
                      'rgba(2, 8, 23, 0.9)',
                    border:
                      '1px solid #3A3A44',
                    color: '#fff',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    width: '100%'
                  }}
                />

              </div>


              {/* STATUS */}

              <div>

                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    color: '#71717A',
                    marginBottom: '6px'
                  }}
                >
                  STATUS
                </label>

                <select
                  value={newWorker.status}
                  onChange={(e) =>
                    setNewWorker(
                      (prev) => ({
                        ...prev,
                        status:
                          e.target.value
                      })
                    )
                  }
                  style={{
                    background:
                      'rgba(2, 8, 23, 0.9)',
                    border:
                      '1px solid #3A3A44',
                    color: '#fff',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    width: '100%'
                  }}
                >

                  <option value="AVAILABLE">
                    Available
                  </option>

                  <option value="BUSY">
                    Busy
                  </option>

                  <option value="OFFLINE">
                    Offline
                  </option>

                </select>

              </div>


              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#22C55E',
                  color: '#fff',
                  border: 'none',
                  height: '40px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >

                <Plus size={14} />

                Add Personnel

              </button>

            </form>

          </div>

        )}


        {/* =================================================
            TABLE
        ================================================= */}

        <div className="dispatch-queue-card">

          <div className="dark-table-container">

            <table className="dark-table">

              <thead>

                <tr>

                  {/* WORKER ID */}

                  <th
                    onClick={() =>
                      handleSort(
                        'workerId'
                      )
                    }
                    style={{
                      cursor: 'pointer'
                    }}
                  >
                    WORKER ID

                    <ArrowUpDown
                      size={12}
                      style={{
                        display:
                          'inline-block',
                        marginLeft:
                          '4px'
                      }}
                    />

                  </th>


                  {/* NAME */}

                  <th
                    onClick={() =>
                      handleSort(
                        'name'
                      )
                    }
                    style={{
                      cursor: 'pointer'
                    }}
                  >
                    NAME

                    <ArrowUpDown
                      size={12}
                      style={{
                        display:
                          'inline-block',
                        marginLeft:
                          '4px'
                      }}
                    />

                  </th>


                  <th>
                    EMAIL
                  </th>


                  <th>
                    PHONE
                  </th>


                  <th>
                    ROLE
                  </th>


                  {/* TEAM */}

                  <th
                    onClick={() =>
                      handleSort(
                        'team'
                      )
                    }
                    style={{
                      cursor: 'pointer'
                    }}
                  >
                    TEAM

                    <ArrowUpDown
                      size={12}
                      style={{
                        display:
                          'inline-block',
                        marginLeft:
                          '4px'
                      }}
                    />

                  </th>


                  <th>
                    BASE STATION
                  </th>


                  {/* STATUS */}

                  <th
                    onClick={() =>
                      handleSort(
                        'status'
                      )
                    }
                    style={{
                      cursor: 'pointer'
                    }}
                  >
                    STATUS

                    <ArrowUpDown
                      size={12}
                      style={{
                        display:
                          'inline-block',
                        marginLeft:
                          '4px'
                      }}
                    />

                  </th>


                  <th
                    style={{
                      textAlign:
                        'center'
                    }}
                  >
                    ACTIONS
                  </th>

                </tr>

              </thead>


              <tbody>

                {/* LOADING */}

                {loading ? (

                  <tr>

                    <td
                      colSpan={9}
                      className="empty-table-cell"
                    >

                      <div
                        className="empty-state-centered"
                      >

                        <h4>
                          Loading Workers...
                        </h4>

                        <p>
                          Fetching rescue personnel from database.
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : paginatedWorkers.length === 0 ? (

                  /* EMPTY */

                  <tr>

                    <td
                      colSpan={9}
                      className="empty-table-cell"
                    >

                      <div
                        className="empty-state-centered"
                      >

                        <h4>
                          No Workers Available
                        </h4>

                        <p>
                          No rescue personnel accounts registered.
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : (

                  /* DATA */

                  paginatedWorkers.map(
                    (worker) => {

                      const status =
                        getWorkerStatus(
                          worker
                        );

                      return (

                        <tr
                          key={
                            worker.id ||
                            worker.workerId
                          }
                        >

                          {/* WORKER ID */}

                          <td
                            className="font-mono font-bold font-red"
                          >
                            {worker.workerId ||
                              '--'}
                          </td>


                          {/* NAME */}

                          <td
                            style={{
                              color: '#fff',
                              fontWeight: '700'
                            }}
                          >
                            {worker.name ||
                              '--'}
                          </td>


                          {/* EMAIL */}

                          <td>
                            {worker.email ||
                              '--'}
                          </td>


                          {/* PHONE */}

                          <td
                            className="font-mono"
                          >
                            {worker.phone
                              ? formatIndianPhoneNumber(
                                  worker.phone
                                )
                              : '--'}
                          </td>


                          {/* ROLE */}

                          <td>
                            {worker.role ||
                              '--'}
                          </td>


                          {/* TEAM */}

                          <td
                            className="team-td"
                          >
                            {getTeamName(
                              worker.teamId
                            )}
                          </td>


                          {/* BASE STATION */}

                          <td
                            className="font-mono"
                          >
                            {worker.baseStation ||
                              '--'}
                          </td>


                          {/* STATUS */}

                          <td>

                            <span
                              className={
                                `badge ${getStatusBadgeClass(
                                  status
                                )} badge-large`
                              }
                            >
                              {status}
                            </span>

                          </td>


                          {/* ACTIONS */}

                          <td>

                            <div
                              className="table-actions-flex"
                            >

                              <button
                                className="btn-action-dark btn-action-dark-secondary"
                                onClick={() =>
                                  handleDeleteWorker(
                                    worker.id
                                  )
                                }
                                style={{
                                  padding:
                                    '4px 8px',
                                  color:
                                    '#EF4444',
                                  borderColor:
                                    'rgba(239,68,68,0.2)'
                                }}
                                title="Remove account"
                              >

                                <Trash2
                                  size={12}
                                />

                                <span>
                                  Delete
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

              setPageSize={
                setPageSize
              }

              currentPage={
                currentPage
              }

              setCurrentPage={
                setCurrentPage
              }

              totalPages={
                totalPages
              }
            />

          )}

        </div>

      </div>

    </div>
  );
};

export default WorkerManagement;