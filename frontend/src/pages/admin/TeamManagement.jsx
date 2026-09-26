import React, { useEffect, useMemo, useState } from "react";

import {
  Users,
  Activity,
  ShieldCheck,
  Wifi,
  WifiOff,
  ChevronRight,
  Radio,
  UserRound,
  ArrowLeft,
  RefreshCw,
  Search,
  X,
  Plus,
  UserPlus,
   Trash2
} from "lucide-react";

import "./TeamManagement.css";


const API_BASE_URL = "http://localhost:8081";
const RESCUE_API = "http://localhost:8086";


const TeamManagement = () => {

  // =====================================================
  // STATE
  // =====================================================
  const [workerToDelete, setWorkerToDelete] = useState(null);
const [deletingWorker, setDeletingWorker] = useState(false);
const [deleteWorkerError, setDeleteWorkerError] = useState("");
  const [teams, setTeams] = useState([]);
const [showAddTeam, setShowAddTeam] = useState(false);

const [newTeam, setNewTeam] = useState({
  name: "",
  frequencySector: "",
  contactNumber: "",
  operationalState: "STANDBY"
});

const [addingTeam, setAddingTeam] = useState(false);
const [addTeamError, setAddTeamError] = useState("");
  const [selectedTeam, setSelectedTeam] =
    useState(null);
 
  const [teamWorkers, setTeamWorkers] =
    useState([]);

  const [loadingTeams, setLoadingTeams] =
    useState(true);

  const [loadingWorkers, setLoadingWorkers] =
    useState(false);

  const [error, setError] =
    useState("");

  const [workerError, setWorkerError] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [totalWorkers, setTotalWorkers] = useState(0);

  // =====================================================
  // ADD WORKER STATE
  // =====================================================

  const [showAddWorker, setShowAddWorker] = useState(false);

 const [newWorker, setNewWorker] = useState({
  name: "",
  email: "",
  phone: "",
  password: "",
  designation: "",
  isTeamLeader: false,
  baseStation: "",
  status: "AVAILABLE"
});

  const [addingWorker, setAddingWorker] = useState(false);

  const [addWorkerError, setAddWorkerError] = useState("");

const fetchTotalWorkers = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/workers`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch workers");
    }

    const data = await response.json();

    setTotalWorkers(
      Array.isArray(data) ? data.length : 0
    );

  } catch (error) {
    console.error("TOTAL WORKERS FETCH ERROR:", error);
    setTotalWorkers(0);
  }
};

useEffect(() => {
  fetchTeams();
  fetchAdminDashboardSummary();
  fetchTotalWorkers();
}, []);
  // =====================================================
  // DASHBOARD SUMMARY STATE
  // =====================================================

  const [dashboardSummary, setDashboardSummary] = useState({
    availableTeams: 0,
    activeSOS: 0,
    teamsOnRescue: 0,
    networkHealth: "Loading..."
  });

  const [loadingSummary, setLoadingSummary] =
    useState(true);


  // =====================================================
  // FETCH TEAMS FROM DATABASE
  // =====================================================

  const fetchTeams = async () => {

    try {

      setLoadingTeams(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/teams`
      );

      if (!response.ok) {

        const text =
          await response.text();

        throw new Error(
          text || "Failed to fetch teams"
        );
      }

      const data =
        await response.json();

      console.log(
        "TEAMS FROM DATABASE:",
        data
      );

      if (Array.isArray(data)) {

        setTeams(data);

      } else {

        setTeams([]);

      }

    } catch (err) {

      console.error(
        "TEAM FETCH ERROR:",
        err
      );

      setError(
        err.message ||
        "Unable to load teams"
      );

      setTeams([]);

    } finally {

      setLoadingTeams(false);

    }

  };


  // =====================================================
  // FETCH ADMIN DASHBOARD SUMMARY
  // SAME SOURCE USED BY ADMIN DASHBOARD
  // =====================================================

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

      const data =
        await response.json();

      console.log(
        "ADMIN DASHBOARD SUMMARY FROM DATABASE:",
        data
      );


      setDashboardSummary({

        activeSOS:
          Number(data?.activeSOS ?? 0),

        availableTeams:
          Number(data?.availableTeams ?? 0),

        teamsOnRescue:
          Number(data?.teamsOnRescue ?? 0),

        networkHealth:
          data?.networkHealth ?? "Loading..."

      });

    } catch (error) {

      console.error(
        "Admin dashboard summary error:",
        error
      );

      setDashboardSummary({

        activeSOS: 0,

        availableTeams: 0,

        teamsOnRescue: 0,

        networkHealth: "Unavailable"

      });

    } finally {

      setLoadingSummary(false);

    }

  };


  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {

    fetchTeams();

    fetchAdminDashboardSummary();

  }, []);


  // =====================================================
  // GET TEAM ID
  // =====================================================

  const getTeamId = (team, index) => {

    return (
      team?.id ??
      team?.teamId ??
      `TEAM-${String(index + 1).padStart(2, "0")}`
    );

  };


  // =====================================================
  // GET TEAM NAME
  // =====================================================

  const getTeamName = (team, index) => {

    return (
      team?.name ??
      team?.teamName ??
      `Rescue Team ${index + 1}`
    );

  };


  // =====================================================
  // GET TEAM LEADER
  // =====================================================

  const getTeamLeader = (team) => {

    return (
      team?.leaderName ??
      team?.leader ??
      team?.teamLeader ??
      "Not assigned"
    );

  };


  // =====================================================
  // GET STATUS
  // =====================================================

  const getTeamStatus = (team) => {

    return String(
      team?.operationalState ??
      team?.status ??
      "UNKNOWN"
    )
      .trim()
      .toUpperCase()
      .replace(/-/g, "_");

  };


  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {

    switch (status) {

      case "AVAILABLE":

        return "team-status-available";


      case "BUSY":

        return "team-status-rescue";


      case "ON_RESCUE":
      case "ON RESCUE":
      case "RESCUE":
      case "DEPLOYED":
      case "IN_RESCUE":

        return "team-status-rescue";


    
      default:

        return "team-status-unknown";

    }

  };


  // =====================================================
  // STATUS LABEL
  // =====================================================

  const getStatusLabel = (status) => {

    switch (status) {

      case "AVAILABLE":

        return "AVAILABLE";


      case "BUSY":

        return "ON RESCUE";


      case "ON_RESCUE":
      case "ON RESCUE":
      case "RESCUE":
      case "DEPLOYED":
      case "IN_RESCUE":

        return "ON RESCUE";


      case "OFFLINE":

        return "OFFLINE";


      default:

        return status || "UNKNOWN";

    }

  };


  // =====================================================
  // STATUS ICON
  // =====================================================

  const getStatusIcon = (status) => {

    switch (status) {

      case "AVAILABLE":

        return <Wifi size={13} />;


      case "BUSY":

        return <Activity size={13} />;


      case "ON_RESCUE":
      case "ON RESCUE":
      case "RESCUE":
      case "DEPLOYED":
      case "IN_RESCUE":

        return <Activity size={13} />;


      case "OFFLINE":

        return <WifiOff size={13} />;


      default:

        return <Radio size={13} />;

    }

  };


  // =====================================================
  // SEARCH TEAMS
  // =====================================================

  const filteredTeams = useMemo(() => {

    const search =
      searchTerm
        .trim()
        .toLowerCase();


    if (!search) {

      return teams;

    }


    return teams.filter(
      (team, index) => {

        const teamName =
          String(
            getTeamName(
              team,
              index
            )
          ).toLowerCase();


        const teamId =
          String(
            getTeamId(
              team,
              index
            )
          ).toLowerCase();


        const leader =
          String(
            getTeamLeader(
              team
            )
          ).toLowerCase();


        return (
          teamName.includes(search) ||
          teamId.includes(search) ||
          leader.includes(search)
        );

      }
    );

  }, [teams, searchTerm]);


  // =====================================================
  // TEAM COUNTS
  // =====================================================

  // Total teams comes directly from the teams API.
  const totalTeams = teams.length;


  // IMPORTANT:
  // These two values come from the SAME dashboard
  // summary API used by Admin Dashboard.
  //
  // Therefore Team Management and Dashboard will show
  // the exact same AVAILABLE and ON RESCUE counts.

  const availableTeams =
    Number(
      dashboardSummary?.availableTeams ?? 0
    );


  const teamsOnRescue =
    Number(
      dashboardSummary?.teamsOnRescue ?? 0
    );



  // =====================================================
  // FETCH TEAM MEMBERS
  // =====================================================

  const fetchTeamWorkers = async (
    teamId
  ) => {

    try {

      setLoadingWorkers(true);
      setWorkerError("");
      setTeamWorkers([]);


      const response = await fetch(
        `${API_BASE_URL}/api/workers/team/${encodeURIComponent(
          teamId
        )}`
      );


      if (!response.ok) {

        const text =
          await response.text();

        throw new Error(
          text ||
          "Failed to fetch team members"
        );

      }


      const data =
        await response.json();


      console.log(
        "TEAM MEMBERS FROM DATABASE:",
        data
      );


      if (Array.isArray(data)) {

        setTeamWorkers(data);

      } else {

        setTeamWorkers([]);

      }

    } catch (err) {

      console.error(
        "TEAM MEMBERS FETCH ERROR:",
        err
      );


      setWorkerError(
        err.message ||
        "Unable to load team members"
      );


      setTeamWorkers([]);

    } finally {

      setLoadingWorkers(false);

    }

  };


  // =====================================================
  // SELECT TEAM
  // =====================================================

  const handleTeamClick = async (
    team,
    index
  ) => {

    const teamId =
      getTeamId(
        team,
        index
      );


    setSelectedTeam(team);


    await fetchTeamWorkers(
      teamId
    );

  };


  // =====================================================
  // BACK
  // =====================================================

  const handleBackToTeams = () => {

    setSelectedTeam(null);

    setTeamWorkers([]);

    setWorkerError("");

  };


  // =====================================================
  // OPEN ADD WORKER
  // =====================================================

  const openAddWorker = () => {
    setNewWorker({
      name: "",
      email: "",
      phone: "",
      password: "",
      designation: "",
      baseStation: "",
      status: "AVAILABLE"
    });

    setAddWorkerError("");
    setShowAddWorker(true);
  };

const handleAddTeam = async () => {
  try {
    setAddingTeam(true);
    setAddTeamError("");

    if (!newTeam.name.trim()) {
      throw new Error("Team name is required");
    }

    if (!newTeam.frequencySector.trim()) {
      throw new Error("Frequency sector is required");
    }

    if (!newTeam.contactNumber.trim()) {
      throw new Error("Contact number is required");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/teams`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newTeam.name.trim(),
          frequencySector: newTeam.frequencySector.trim(),
          contactNumber: newTeam.contactNumber.trim(),
          operationalState: newTeam.operationalState
        })
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        text || "Failed to add team"
      );
    }

    const savedTeam = await response.json();

    console.log(
      "NEW TEAM SAVED:",
      savedTeam
    );

    setShowAddTeam(false);

    setNewTeam({
      name: "",
      frequencySector: "",
      contactNumber: "",
      operationalState: "STANDBY"
    });

    await fetchTeams();
    await fetchAdminDashboardSummary();

  } catch (error) {
    console.error(
      "ADD TEAM ERROR:",
      error
    );

    setAddTeamError(
      error.message || "Unable to add team"
    );

  } finally {
    setAddingTeam(false);
  }
};
  // =====================================================
  // ADD WORKER
  // =====================================================

  const handleAddWorker = async () => {

    if (!selectedTeam) {
      setAddWorkerError("No team selected");
      return;
    }

    try {

      setAddingWorker(true);
      setAddWorkerError("");

      if (!newWorker.name.trim()) {
        throw new Error("Worker name is required");
      }

      if (!newWorker.email.trim()) {
        throw new Error("Email is required");
      }

      if (!newWorker.phone.trim()) {
        throw new Error("Phone number is required");
      }

      if (!newWorker.password.trim()) {
        throw new Error("Password is required");
      }

      if (!newWorker.designation.trim()) {
        throw new Error("Rescue role is required");
      }

      if (!newWorker.baseStation.trim()) {
        throw new Error("Base station is required");
      }

      const teamId =
        selectedTeam?.id ??
        selectedTeam?.teamId;

      const teamName =
        selectedTeam?.name ??
        selectedTeam?.teamName ??
        "Rescue Team";

      const response = await fetch(
        `${API_BASE_URL}/api/workers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: newWorker.name.trim(),
            email: newWorker.email.trim(),
            phone: newWorker.phone.trim(),
            password: newWorker.password,
            role: "WORKER",
            designation: newWorker.designation.trim(),
            baseStation: newWorker.baseStation.trim(),
            accountStatus: newWorker.status.toUpperCase(),
            teamId: teamId,
            teamName: teamName
          })
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to add worker");
      }

      const savedWorker = await response.json();

      console.log("NEW WORKER SAVED:", savedWorker);
      
      if (newWorker.isTeamLeader) {
  const leaderResponse = await fetch(
    `${API_BASE_URL}/api/teams/${teamId}/leader?leaderName=${encodeURIComponent(
      newWorker.name.trim()
    )}`,
    {
      method: "PUT"
    }
  );

  if (!leaderResponse.ok) {
  const text = await leaderResponse.text();

  console.error("SET TEAM LEADER ERROR:", text);

  throw new Error(
    text || "Failed to set team leader"
  );
}
}
      setShowAddWorker(false);

      setNewWorker({
        name: "",
        email: "",
        phone: "",
        password: "",
        designation: "",
        baseStation: "",
        status: "AVAILABLE"
      });

      await fetchTeamWorkers(teamId);
      await fetchTeams();
      await fetchAdminDashboardSummary();
      await fetchTotalWorkers();

    } catch (error) {

      console.error("ADD WORKER ERROR:", error);

      setAddWorkerError(
        error.message || "Unable to add worker"
      );

    } finally {

      setAddingWorker(false);

    }
  };


  const handleDeleteWorker = async () => {

  if (!workerToDelete) {
    return;
  }

  try {

    setDeletingWorker(true);
    setDeleteWorkerError("");

    const response = await fetch(
      `${API_BASE_URL}/api/workers/${workerToDelete.id}`,
      {
        method: "DELETE"
      }
    );

    if (!response.ok) {

      const text = await response.text();

      throw new Error(
        text || "Failed to delete worker"
      );
    }

   
    const currentTeamId =
      selectedTeam?.id ??
      selectedTeam?.teamId;

    // Confirmation popup close
    setWorkerToDelete(null);

    // Worker list refresh
    await fetchTeamWorkers(currentTeamId);

    // Total workers refresh
    await fetchTotalWorkers();

  } catch (error) {

    console.error(
      "DELETE WORKER ERROR:",
      error
    );

    setDeleteWorkerError(
      error.message ||
      "Unable to delete worker"
    );

  } finally {

    setDeletingWorker(false);

  }

};

  // =====================================================
  // TEAM MEMBERS VIEW
  // =====================================================

  const renderTeamMembers = () => {

    if (!selectedTeam) {

      return null;

    }


    const teamId =
      selectedTeam?.id ??
      selectedTeam?.teamId;


    const teamName =
      selectedTeam?.name ??
      selectedTeam?.teamName ??
      "Rescue Team";


    return (

      <div className="team-members-view">


        {/* HEADER */}

        <div className="members-page-header">

          <button
            className="back-to-teams-btn"
            onClick={
              handleBackToTeams
            }
          >

            <ArrowLeft size={16} />

            Rescue Teams

          </button>


          <div className="members-title-area">

            <div className="members-team-icon">

              <Users size={21} />

            </div>


            <div>

              <h2>
                {teamName}
              </h2>

              <p>
                Team ID: {teamId}
              </p>

            </div>

          </div>


          <button
            className="refresh-members-btn"
            onClick={openAddWorker}
          >
            <UserPlus size={14} />
            Add Worker
          </button>


          <button
            className="refresh-members-btn"
            onClick={() =>
              fetchTeamWorkers(
                teamId
              )
            }
            disabled={
              loadingWorkers
            }
          >

            <RefreshCw
              size={14}
              className={
                loadingWorkers
                  ? "refresh-spin"
                  : ""
              }
            />

            Refresh

          </button>

        </div>


        {/* =====================================================
            ADD WORKER MODAL
        ===================================================== */}

          {showAddWorker && (
  <div
    className="team-modal-overlay"
    onClick={() => {
      if (!addingWorker) {
        setShowAddWorker(false);
        setAddWorkerError("");
      }
    }}
  >
    <div
      className="team-modal"
      onClick={(e) => e.stopPropagation()}
    >

      {/* HEADER */}
      <div className="team-modal-header">
        <div>
          <h3>Add Worker</h3>
          <p>Add new personnel to {teamName}</p>
        </div>

        <button
          className="worker-modal-close"
          onClick={() => {
            if (!addingWorker) {
              setShowAddWorker(false);
              setAddWorkerError("");
            }
          }}
          disabled={addingWorker}
        >
          <X size={18} />
        </button>
      </div>


      {/* BODY */}
      <div className="worker-modal-body">

        <div className="worker-form-group">
          <label>Full Name</label>

          <input
            className="worker-input"
            type="text"
            value={newWorker.name}
            onChange={(e) =>
              setNewWorker((prev) => ({
                ...prev,
                name: e.target.value
              }))
            }
            placeholder="Enter worker name"
          />
        </div>


        <div className="worker-form-group">
          <label>Email</label>

          <input
            className="worker-input"
            type="email"
            value={newWorker.email}
            onChange={(e) =>
              setNewWorker((prev) => ({
                ...prev,
                email: e.target.value
              }))
            }
            placeholder="Enter email address"
          />
        </div>


        <div className="worker-form-group">
          <label>Phone</label>

          <input
            className="worker-input"
            type="tel"
            value={newWorker.phone}
            onChange={(e) =>
              setNewWorker((prev) => ({
                ...prev,
                phone: e.target.value
              }))
            }
            placeholder="Enter phone number"
          />
        </div>


        <div className="worker-form-group">
          <label>Password</label>

          <input
            className="worker-input"
            type="password"
            value={newWorker.password}
            onChange={(e) =>
              setNewWorker((prev) => ({
                ...prev,
                password: e.target.value
              }))
            }
            placeholder="Create password"
          />
        </div>


        <div className="worker-form-group">
          <label>Rescue Role</label>

          <select
            className="worker-input worker-select"
            value={newWorker.designation}
            onChange={(e) =>
              setNewWorker((prev) => ({
                ...prev,
                designation: e.target.value
              }))
            }
          >
            <option value="">Select rescue role</option>
           
            <option value="Medical Specialist">
              Medical Specialist
            </option>
            <option value="Search & Rescue Specialist">
              Search & Rescue Specialist
            </option>
            <option value="Navigator">Navigator</option>
            <option value="Radio Technician">
              Radio Technician
            </option>
            <option value="Logistics Officer">
              Logistics Officer
            </option>
          </select>
          <div className="worker-form-group">
  <label>Team Leader</label>

  <select
    className="worker-input worker-select"
    value={newWorker.isTeamLeader ? "YES" : "NO"}
    onChange={(e) =>
      setNewWorker((prev) => ({
        ...prev,
        isTeamLeader: e.target.value === "YES"
      }))
    }
  >
    <option value="NO">No</option>
    <option value="YES">Yes</option>
  </select>
</div>
        </div>


        <div className="worker-form-group">
          <label>Base Station</label>

          <input
            className="worker-input"
            type="text"
            value={newWorker.baseStation}
            onChange={(e) =>
              setNewWorker((prev) => ({
                ...prev,
                baseStation: e.target.value
              }))
            }
            placeholder="Enter base station"
          />
        </div>


        <div className="worker-form-group">
          <label>Status</label>

          <select
            className="worker-input worker-select"
            value={newWorker.status}
            onChange={(e) =>
              setNewWorker((prev) => ({
                ...prev,
                status: e.target.value
              }))
            }
          >
            <option value="AVAILABLE">Available</option>
            <option value="BUSY">Busy</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>


        {/* TEAM INFO */}
        <div className="worker-modal-info">
          <span>WORKER WILL BE ADDED TO:</span>

          <strong>{teamName}</strong>

          <small>Team ID: {teamId}</small>
        </div>


        {addWorkerError && (
          <div className="worker-modal-error">
            {addWorkerError}
          </div>
        )}

      </div>


      {/* FOOTER */}
      <div className="worker-modal-footer">

        <button
          className="worker-cancel-btn"
          onClick={() => {
            if (!addingWorker) {
              setShowAddWorker(false);
              setAddWorkerError("");
            }
          }}
          disabled={addingWorker}
        >
          Cancel
        </button>


        <button
          className="worker-submit-btn"
          onClick={handleAddWorker}
          disabled={addingWorker}
        >
          {addingWorker ? "Adding..." : "Add Worker"}
        </button>

      </div>

    </div>
  </div>
)}

        {/* =====================================================
            DELETE WORKER CONFIRMATION MODAL
        ===================================================== */}

        {workerToDelete && (
          <div
            className="worker-delete-overlay"
            onClick={() => {
              if (!deletingWorker) {
                setWorkerToDelete(null);
                setDeleteWorkerError("");
              }
            }}
          >
            <div
              className="worker-delete-modal"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="worker-delete-icon">
                <Trash2 size={20} />
              </div>

              <div className="worker-delete-content">
                <h3>Delete Worker?</h3>

                <p>
                  Are you sure you want to delete{" "}
                  <strong>
                    {workerToDelete?.name || "this worker"}
                  </strong>
                  ?
                </p>

                <span>
                  This action cannot be undone.
                </span>
              </div>

              {deleteWorkerError && (
                <div className="worker-delete-error">
                  {deleteWorkerError}
                </div>
              )}

              <div className="worker-delete-actions">

                <button
                  type="button"
                  className="worker-delete-cancel-btn"
                  onClick={() => {
                    if (!deletingWorker) {
                      setWorkerToDelete(null);
                      setDeleteWorkerError("");
                    }
                  }}
                  disabled={deletingWorker}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="worker-delete-confirm-btn"
                  onClick={handleDeleteWorker}
                  disabled={deletingWorker}
                >
                  <Trash2 size={14} />
                  {deletingWorker
                    ? "Deleting..."
                    : "Delete Worker"}
                </button>

              </div>

            </div>
          </div>
        )}


        {/* ERROR */}

        {workerError && (

          <div className="members-error">

            {workerError}

          </div>

        )}


        {/* LOADING */}

        {loadingWorkers ? (

          <div className="members-loading">

            <RefreshCw
              size={22}
              className="refresh-spin"
            />

            Loading team members...

          </div>

        ) : teamWorkers.length === 0 ? (

          <div className="members-empty">

            <UserRound size={30} />

            <h3>
              No Members Found
            </h3>

            <p>
              No workers are currently assigned to this team.
            </p>

          </div>

        ) : (

          <div className="members-table-wrapper">

            <div className="members-table-header">

              <div>

                <h3>
                  Team Personnel
                </h3>

                <p>
                  {teamWorkers.length} registered members
                </p>

              </div>

            </div>


            <div className="members-table-scroll">

              <table className="members-table">

                <thead>

                  <tr>

                    <th>
                      WORKER ID
                    </th>

                    <th>
                      NAME
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

                    <th>
                      STATUS
                    </th>
                    <th>ACTION</th>

                  </tr>

                </thead>


                <tbody>

                  {teamWorkers.map(
                    (worker, index) => {

                      const workerStatus =
                        String(
                          worker?.accountStatus ??
                          worker?.status ??
                          "UNKNOWN"
                        )
                          .trim()
                          .toUpperCase();


                      return (

                        <tr
                          key={
                            worker?.id ??
                            worker?.workerId ??
                            index
                          }
                        >

                          <td className="worker-id-cell">

                            {worker?.workerId ||
                              "--"}

                          </td>


                          <td className="worker-name-cell">

                            {worker?.name ||
                              "--"}

                          </td>


                          <td>

                            {worker?.email ||
                              "--"}

                          </td>


                          <td>

                            {worker?.phone ||
                              "--"}

                          </td>


                          <td>

                            {worker?.designation ||
                              worker?.jobRole ||
                              "WORKER"}

                          </td>


                          <td>

                            <span
                              className={`member-status ${
                                getStatusClass(
                                  workerStatus
                                )
                              }`}
                            >

                              {getStatusIcon(
                                workerStatus
                              )}

                              {workerStatus}

                            </span>

                          </td>
                          <td>

                          <button
                        className="delete-worker-btn"
                        onClick={() => {
                          setWorkerToDelete(worker);
                          setDeleteWorkerError("");
                        }}
                        title="Delete Worker"
                      >

                          <Trash2 size={15} />

                          Delete

                        </button>

                      </td>

                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>

    );

  };


  // =====================================================
  // MAIN UI
  // =====================================================

  return (

    <div className="team-management-page">

      <div className="team-management-container">
        {showAddTeam && (
  <div
    className="team-modal-overlay"
    onClick={() => {
      if (!addingTeam) {
        setShowAddTeam(false);
        setAddTeamError("");
      }
    }}
  >
    <div
      className="team-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <div className="team-modal-header">
        <div>
          <h3>Add Rescue Team</h3>
          <p>Create a new rescue team</p>
        </div>

        <button
          className="worker-modal-close"
          type="button"
          onClick={() => {
            if (!addingTeam) {
              setShowAddTeam(false);
              setAddTeamError("");
            }
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div className="worker-modal-body">

        <div className="worker-form-group">
          <label>Team Name</label>

          <input
            className="worker-input"
            type="text"
            value={newTeam.name}
            onChange={(e) =>
              setNewTeam((prev) => ({
                ...prev,
                name: e.target.value
              }))
            }
            placeholder="Enter team name"
          />
        </div>

        <div className="worker-form-group">
          <label>Frequency Sector</label>

          <input
            className="worker-input"
            type="text"
            value={newTeam.frequencySector}
            onChange={(e) =>
              setNewTeam((prev) => ({
                ...prev,
                frequencySector: e.target.value
              }))
            }
            placeholder="Example: Sector 5 (915.800 MHz)"
          />
        </div>

        <div className="worker-form-group">
          <label>Contact Number</label>

          <input
            className="worker-input"
            type="text"
            value={newTeam.contactNumber}
            onChange={(e) =>
              setNewTeam((prev) => ({
                ...prev,
                contactNumber: e.target.value
              }))
            }
            placeholder="Enter contact number"
          />
        </div>

        <div className="worker-form-group">
          <label>Operational State</label>

          <select
            className="worker-input worker-select"
            value={newTeam.operationalState}
            onChange={(e) =>
              setNewTeam((prev) => ({
                ...prev,
                operationalState: e.target.value
              }))
            }
          >
            <option value="STANDBY">Standby</option>
            <option value="AVAILABLE">Available</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>

        {addTeamError && (
          <div className="worker-modal-error">
            {addTeamError}
          </div>
        )}

      </div>

      <div className="worker-modal-footer">

        <button
          type="button"
          className="worker-cancel-btn"
          onClick={() => {
            if (!addingTeam) {
              setShowAddTeam(false);
              setAddTeamError("");
            }
          }}
          disabled={addingTeam}
        >
          Cancel
        </button>

        <button
          type="button"
          className="worker-submit-btn"
          onClick={handleAddTeam}
          disabled={addingTeam}
        >
          {addingTeam ? "Creating..." : "Create Team"}
        </button>

      </div>

    </div>
  </div>
)}

        {/* =================================================
            SELECTED TEAM
        ================================================= */}

        {selectedTeam ? (

          renderTeamMembers()

        ) : (

          <>


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="team-page-header">

              <div className="team-title-section">

                <div className="team-title-icon">

                  <ShieldCheck size={22} />

                </div>


                <div>

                  <h1>
                    Team Management
                  </h1>

                  <p>
                    Manage rescue teams and monitor operational status
                  </p>

                </div>

              </div>


              <div className="team-header-actions">

                <div className="team-live-indicator">

                  <span className="live-dot"></span>

                  LIVE NETWORK

                </div>
                <button
  className="team-add-btn"
  onClick={() => {
    setAddTeamError("");
    setNewTeam({
      name: "",
      frequencySector: "",
      contactNumber: "",
      operationalState: "STANDBY"
    });
    setShowAddTeam(true);
  }}
>
  <Plus size={15} />
  Add Team
</button>


                <button
                  className="team-refresh-btn"
                  onClick={() => {
                    fetchTeams();
                    fetchAdminDashboardSummary();
                  }}
                  disabled={
                    loadingTeams ||
                    loadingSummary
                  }
                >

                  <RefreshCw
                    size={14}
                    className={
                      loadingTeams ||
                      loadingSummary
                        ? "refresh-spin"
                        : ""
                    }
                  />

                  Refresh

                </button>

              </div>

            </div>


            {/* =================================================
                STATS
            ================================================= */}

            <div className="team-stats-grid">


              {/* TOTAL TEAMS */}

              <div className="team-stat-card">

                <div className="team-stat-icon">

                  <Users size={19} />

                </div>


                <div className="team-stat-content">

                  <span>
                    TOTAL TEAMS
                  </span>

                  <strong>
                    {loadingTeams
                      ? "..."
                      : totalTeams
                    }
                  </strong>

                  <small>
                    Registered units
                  </small>

                </div>

              </div>


              {/* AVAILABLE */}

              <div className="team-stat-card">

                <div className="team-stat-icon">

                  <Wifi size={19} />

                </div>


                <div className="team-stat-content">

                  <span>
                    AVAILABLE
                  </span>

                  <strong>
                    {loadingSummary
                      ? "..."
                      : availableTeams
                    }
                  </strong>

                  <small>
                    Ready for deployment
                  </small>

                </div>

              </div>

                    
              {/* ON RESCUE */}

              <div className="team-stat-card">

                <div className="team-stat-icon">

                  <Activity size={19} />

                </div>

                    
                <div className="team-stat-content">

                  <span>
                    ON RESCUE
                  </span>

                  <strong>
                    {loadingSummary
                      ? "..."
                      : teamsOnRescue
                    }
                  </strong>

                  <small>
                    Currently deployed
                  </small>

                </div>

              </div>


              {/* OFFLINE */}
                    <div className="team-stat-card">

  <div className="team-stat-icon">

    <Users size={19} />

  </div>


  <div className="team-stat-content">

    <span>
      TOTAL WORKERS
    </span>

    <strong>
      {loadingTeams
        ? "..."
        : totalWorkers
      }
    </strong>

    <small>
      Registered personnel
    </small>

  </div>

</div>

            </div>


            {/* =================================================
                RESCUE TEAMS SECTION
            ================================================= */}

            <div className="rescue-teams-section">


              <div className="rescue-section-header">

                <div>

                  <div className="section-title-row">

                    <Radio size={17} />

                    <h2>
                      Rescue Teams
                    </h2>

                  </div>

                  <p>
                    Select a team to view its personnel
                  </p>

                </div>


                <div className="team-count-badge">

                  {filteredTeams.length}
                  {" "}
                  {searchTerm
                    ? "Results"
                    : "Teams"
                  }

                </div>

              </div>


              {/* =================================================
                  SEARCH BAR
              ================================================= */}

              <div className="team-search-wrapper">

                <Search
                  size={17}
                  className="team-search-icon"
                />


                <input
                  type="text"
                  placeholder="Search by team name, team ID or team leader..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                  className="team-search-input"
                />


                {searchTerm && (

                  <button
                    className="clear-search-btn"
                    onClick={() =>
                      setSearchTerm("")
                    }
                  >

                    <X size={16} />

                  </button>

                )}

              </div>


              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (

                <div className="teams-error">

                  <div>

                    <strong>
                      Unable to load rescue teams
                    </strong>

                    <span>
                      {error}
                    </span>

                  </div>


                  <button
                    onClick={
                      fetchTeams
                    }
                  >

                    Try Again

                  </button>

                </div>

              )}


              {/* =================================================
                  LOADING
              ================================================= */}

              {loadingTeams ? (

                <div className="teams-loading">

                  <RefreshCw
                    size={22}
                    className="refresh-spin"
                  />

                  <h3>
                    Loading Rescue Teams
                  </h3>

                  <p>
                    Fetching teams from database...
                  </p>

                </div>

              ) : filteredTeams.length === 0 ? (

                <div className="team-empty-state">

                  <div className="empty-team-icon">

                    <Search size={27} />

                  </div>


                  <h3>
                    No Teams Found
                  </h3>


                  <p>
                    No rescue team matches your search.
                  </p>


                  {searchTerm && (

                    <button
                      className="empty-refresh-btn"
                      onClick={() =>
                        setSearchTerm("")
                      }
                    >

                      <X size={14} />

                      Clear Search

                    </button>

                  )}

                </div>

              ) : (

                /* =================================================
                   TEAM CARDS
                ================================================= */

                <div className="rescue-teams-grid">

                  {filteredTeams.map(
                    (team, index) => {

                      const teamId =
                        getTeamId(
                          team,
                          index
                        );


                      const teamName =
                        getTeamName(
                          team,
                          index
                        );


                      const teamLeader =
                        getTeamLeader(
                          team
                        );


                      const status =
                        getTeamStatus(
                          team
                        );


                      return (

                        <div
                          key={teamId}
                          className="rescue-team-card"
                          onClick={() =>
                            handleTeamClick(
                              team,
                              index
                            )
                          }
                        >


                          {/* CARD TOP */}

                          <div className="team-card-top">

                            <div className="team-card-icon">

                              <Users size={19} />

                            </div>


                            <span
                              className={`team-status-badge ${
                                getStatusClass(
                                  status
                                )
                              }`}
                            >

                              {getStatusIcon(
                                status
                              )}

                              {getStatusLabel(
                                status
                              )}

                            </span>

                          </div>


                          {/* TEAM NAME */}

                          <div className="team-card-name">

                            <span>
                              RESCUE TEAM
                            </span>

                            <h3>
                              {teamName}
                            </h3>

                          </div>


                          {/* TEAM ID */}

                          <div className="team-info-row">

                            <span>
                              TEAM ID
                            </span>

                            <strong>
                              {teamId}
                            </strong>

                          </div>


                          {/* LEADER */}

                          <div className="team-leader-box">

                            <div className="leader-icon">

                              <UserRound
                                size={15}
                              />

                            </div>


                            <div>

                              <span>
                                TEAM LEADER
                              </span>

                              <strong>
                                {teamLeader}
                              </strong>

                            </div>

                          </div>


                          {/* CARD FOOTER */}

                          <div className="team-card-footer">

                            <span>
                              VIEW TEAM
                            </span>

                            <ChevronRight
                              size={16}
                            />

                          </div>


                        </div>

                      );

                    }
                  )}

                </div>

              )}

            </div>

          </>

        )}

      </div>

    </div>

  );

};


export default TeamManagement;