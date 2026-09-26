import React, { useEffect, useState } from 'react';
import {
  Shield,
  Eye,
  AlertCircle,
  Users,
  X,
  Phone,
  Radio,
  User,
  Activity,
  UsersRound,
  UserCheck,
  Siren
} from 'lucide-react';

import { useAppContext } from '../../context/AppContext';
import './TeamManagement.css';

const StatCard = ({ title, value, color = '#fff', icon: Icon }) => {
  return (
    <div
      style={{
        padding: '16px 20px',
        background: '#0D0D0F',
        border: '1px solid #303038',
        borderRadius: '6px',
        minHeight: '76px',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: '14px'
      }}
    >
      {/* LEFT ICON */}
      {Icon && (
        <div
          style={{
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            background: `${color}15`,
            flexShrink: 0
          }}
        >
          <Icon
            size={21}
            color={color}
            strokeWidth={1.8}
          />
        </div>
      )}

      {/* CONTENT */}
      <div>
        <span
          style={{
            fontSize: '13px',
            color: '#7E8290',
            fontWeight: '700',
            marginLeft: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}
        >
          {title}
        </span>

        <h3
          style={{
            fontSize: '26px',
            lineHeight: '1',
            fontWeight: '800',
            marginLeft: '10px',
            color: color,
            margin: '7px 0 0 0',
            letterSpacing: '-0.02em'
          }}
        >
          {value}
        </h3>
      </div>
    </div>
  );
};

const TeamManagement = () => {

  const {
    teams = [],
    alerts = [],
    dashboardSummary = {}
  } = useAppContext();

    
  const safeTeams = Array.isArray(teams) ? teams : [];

  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [teamWorkers, setTeamWorkers] = useState([]);

  const selectedTeam = safeTeams.find(
    team =>
      String(team?.id) ===
      String(selectedTeamId)
  );

  useEffect(() => {
    if (!selectedTeamId) {
      setTeamWorkers([]);
      return;
    }

    const fetchTeamWorkers = async () => {
      try {
        const response = await fetch(
          `http://localhost:8081/api/workers/team/${selectedTeamId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch team workers');
        }

        const data = await response.json();

        setTeamWorkers(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          'Error fetching team workers:',
          error
        );
        setTeamWorkers([]);
      }
    };

    fetchTeamWorkers();
  }, [selectedTeamId]);

  // =====================================================
  // FIND TEAMS CURRENTLY HANDLING ACTIVE SOS
  // =====================================================

  const activeTeamIds = new Set(
    (Array.isArray(alerts) ? alerts : [])
      .filter(alert => {

        const status = String(
          alert?.rescueStatus ||
          alert?.status ||
          ''
        )
          .trim()
          .toUpperCase();

        return (
          status === 'IN_PROGRESS' ||
          status === 'ACTIVE' ||
          status === 'ONGOING'
        );
      })
      .map(alert =>
        String(
          alert?.assignedTeamId ||
          alert?.teamId ||
          alert?.assigned_team_id ||
          ''
        ).trim()
      )
      .filter(Boolean)
  );


  // =====================================================
  // TEAM COUNTS
  // =====================================================

  const totalTeams = safeTeams.length;

  // Dashboard backend is the source for summary count
  const availableTeams =
    Number(
      dashboardSummary?.availableTeams ?? 0
    );


  const teamsOnRescue =
    Number(
      dashboardSummary?.teamsOnRescue ?? 0
    );

  // =====================================================
  // SELECTED TEAM
  // =====================================================

 

  // =====================================================
  // FETCH WORKERS FOR SELECTED TEAM
  // =====================================================



  // =====================================================
  // TEAM STATUS
  // =====================================================

  const getTeamStatus = team => {

    const teamId = String(
      team?.id ||
      team?.teamId ||
      ''
    )
      .trim();

    // -----------------------------------------------------
    // ACTIVE SOS HAS PRIORITY
    // -----------------------------------------------------

    if (activeTeamIds.has(teamId)) {
      return 'BUSY';
    }

    // -----------------------------------------------------
    // OTHERWISE USE DATABASE STATUS
    // -----------------------------------------------------

    return String(
      team?.operationalState ||
      team?.status ||
      'UNKNOWN'
    )
      .trim()
      .toUpperCase();
  };

  // =====================================================
  // STATUS LABEL
  // =====================================================

  const getStatusLabel = team => {

    const status = getTeamStatus(team);

    if (
      status === 'AVAILABLE' ||
      status === 'FREE'
    ) {
      return 'STANDBY';
    }

    if (
      status === 'BUSY' ||
      status === 'ON_RESCUE' ||
      status === 'ON RESCUE' ||
      status === 'RESCUE'
    ) {
      return 'ON RESCUE';
    }

    if (status === 'OFFLINE') {
      return 'OFFLINE';
    }

    return status;
  };

  // =====================================================
  // STATUS CSS CLASS
  // =====================================================

  const getStatusClass = team => {

    const status = getTeamStatus(team);

    if (
      status === 'AVAILABLE' ||
      status === 'FREE'
    ) {
      return 'badge-online';
    }

    if (
      status === 'BUSY' ||
      status === 'ON_RESCUE' ||
      status === 'ON RESCUE' ||
      status === 'RESCUE'
    ) {
      return 'badge-pending';
    }

    if (status === 'OFFLINE') {
      return 'badge-danger';
    }

    return 'badge-info';
  };

  // =====================================================
  // MEMBER COUNT
  // =====================================================

  const getMemberCount = team => {

    if (Array.isArray(team?.members)) {
      return team.members.length;
    }

    if (
      team?.memberCount !== undefined &&
      team?.memberCount !== null
    ) {
      return Number(
        team.memberCount
      ) || 0;
    }

    return 0;
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

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '24px'
          }}
        >

          <Shield
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
            Team Management
          </h3>

        </div>


        {/* =================================================
            TEAM METRICS
        ================================================= */}
<div 
  className="grid-cols-23" 
  style={{ marginBottom: '24px' }}
>
  <StatCard 
    title="Total Teams" 
    value={totalTeams} 
    color="#0dd8e7" 
     icon={UsersRound}
  />

  <StatCard 
    title="Available Teams" 
    value={availableTeams} 
    color="#22C55E" 
     icon={UserCheck}
  />

  <StatCard 
    title="Teams On Rescue" 
    value={teamsOnRescue} 
    color="#F59E0B"
      icon={Siren} 
  />
</div>

        {/* =================================================
            TEAM LIST
        ================================================= */}
{!selectedTeam && (
  safeTeams.length === 0 ? (

    <div
      className="glass-panel empty-state-card text-center"
      style={{
        padding: '50px 20px'
      }}
    >

      <AlertCircle
        size={48}
        className="empty-icon text-muted"
      />

      <h3>
        No Rescue Teams Registered
      </h3>

      <p>
        Contact your Command Center system
        administrator to allocate rescue squads.
      </p>

    </div>

  ) : (

    <div className="grid-cols-3 team-grid-spaced">

      {safeTeams.map(team => (

        <div
          key={team?.id}
          className="team-card glass-panel glass-panel-hover"
        >

          {/* =================================================
              CARD HEADER
          ================================================= */}

          <div
            className="team-card-header flex-between"
          >

            <div className="flex-align">

              <Shield
                size={20}
                color="var(--accent-glow)"
              />

              <h4>
                {team?.name || 'Unnamed Team'}
              </h4>

            </div>

            <span
              className={`badge ${getStatusClass(
                team
              )} badge-large`}
            >
              {getStatusLabel(team)}
            </span>

          </div>


          {/* =================================================
              LEADER
          ================================================= */}

          <div
            className="team-leader-info"
            style={{
              marginTop: '16px'
            }}
          >

            <span
              className="info-label text-muted"
              style={{
                display: 'block',
                fontSize: '10px',
                fontWeight: '700',
                letterSpacing: '0.05em'
              }}
            >
              TEAM LEADER
            </span>

            <span
              style={{
                fontSize: '14px',
                color: '#fff',
                fontWeight: '700',
                marginTop: '4px',
                display: 'block'
              }}
            >
              {team?.leaderName || 'Unknown Leader'}
            </span>

          </div>


          {/* =================================================
              MEMBERS
          ================================================= */}

          <div
            className="team-members-list list-contrast"
            style={{
              marginTop: '14px',
              borderTop:
                '1px solid rgba(255,255,255,0.05)',
              paddingTop: '10px'
            }}
          >

            <span
              style={{
                fontSize: '12.5px',
                color: '#A1A1AA'
              }}
            >
              Members:{' '}

              <b>
                {getMemberCount(team)}
              </b>

            </span>

          </div>


          {/* =================================================
              FREQUENCY
          ================================================= */}

          <div
            style={{
              marginTop: '12px'
            }}
          >

            <span
              style={{
                fontSize: '10px',
                color: '#71717A',
                display: 'block',
                fontWeight: '700'
              }}
            >
              FREQUENCY SECTOR
            </span>

            <span
              style={{
                fontSize: '12px',
                color: '#D4D4D8',
                display: 'block',
                marginTop: '4px'
              }}
            >
              {team?.frequencySector || '—'}
            </span>

          </div>


          {/* =================================================
              CONTACT
          ================================================= */}

          <div
            style={{
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '7px'
            }}
          >

            <Phone
              size={13}
              color="#71717A"
            />

            <span
              style={{
                fontSize: '12px',
                color: '#A1A1AA'
              }}
            >
              {team?.contactNumber || 'No contact number'}
            </span>

          </div>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              justifyContent: 'flex-end',
              borderTop:
                '1px solid rgba(255,255,255,0.05)',
              paddingTop: '14px'
            }}
          >

            <button
              type="button"
              onClick={() => setSelectedTeamId(team?.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-glow)',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0
              }}
            >

              View Details

              <Eye size={14} />

            </button>

          </div>

        </div>

      ))}

    </div>

  )
)}


        {/* =================================================
            TEAM DETAILS MODAL
        ================================================= */}

        {selectedTeam && (

         <div
  style={{
    width: '100%',
    marginTop: '20px'
  }}
>

           <div
  style={{
    width: '100%'
  }}
>

              {/* =================================================
                  MODAL HEADER
              ================================================= */}

              <div
                style={{
                  padding: '20px',
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
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

                  <Shield
                    size={22}
                    color="var(--accent-glow)"
                  />

                  <div>

                    <h3
                      style={{
                        margin: 0,
                        color: '#fff'
                      }}
                    >
                      {selectedTeam?.name}
                    </h3>

                    <span
                      style={{
                        fontSize: '11px',
                        color: '#71717A'
                      }}
                    >
                      Team ID:{' '}
                      {selectedTeam?.id ||
                        '—'}
                    </span>

                  </div>

                </div>


                <button
  type="button"
  onClick={() => setSelectedTeamId(null)}
  style={{
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #3A3A44',
    background: '#18181B',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: '700'
  }}
>
  ← Back to Teams
</button>

              </div>


              {/* =================================================
                  MODAL BODY
              ================================================= */}

              <div
                style={{
                  padding: '22px'
                }}
              >

                {/* STATUS */}

                <div
                  style={{
                    padding: '14px',
                    marginBottom: '12px',
                    background:
                      'rgba(255,255,255,0.03)',
                    borderRadius: '9px',
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems: 'center'
                  }}
                >

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >

                    <Activity size={16} />

                    <span>
                      Operational State
                    </span>

                  </div>

                  <span
                    className={`badge ${getStatusClass(
                      selectedTeam
                    )} badge-large`}
                  >
                    {getStatusLabel(
                      selectedTeam
                    )}
                  </span>

                </div>


                {/* LEADER */}

                <div
                  style={{
                    padding: '14px',
                    marginBottom: '12px',
                    background:
                      'rgba(255,255,255,0.03)',
                    borderRadius: '9px'
                  }}
                >

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#71717A',
                      fontSize: '10px',
                      fontWeight: '700'
                    }}
                  >

                    <User size={15} />

                    TEAM LEADER

                  </div>

                  <div
                    style={{
                      color: '#fff',
                      fontWeight: '700',
                      marginTop: '8px'
                    }}
                  >
                    {selectedTeam?.leaderName ||
                      'Unknown Leader'}
                  </div>

                </div>


                {/* FREQUENCY */}

                <div
                  style={{
                    padding: '14px',
                    marginBottom: '12px',
                    background:
                      'rgba(255,255,255,0.03)',
                    borderRadius: '9px'
                  }}
                >

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#71717A',
                      fontSize: '10px',
                      fontWeight: '700'
                    }}
                  >

                    <Radio size={15} />

                    FREQUENCY SECTOR

                  </div>

                  <div
                    style={{
                      color: '#fff',
                      fontWeight: '600',
                      marginTop: '8px'
                    }}
                  >
                    {selectedTeam?.frequencySector ||
                      '—'}
                  </div>

                </div>


                {/* CONTACT */}

                <div
                  style={{
                    padding: '14px',
                    marginBottom: '12px',
                    background:
                      'rgba(255,255,255,0.03)',
                    borderRadius: '9px'
                  }}
                >

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#71717A',
                      fontSize: '10px',
                      fontWeight: '700'
                    }}
                  >

                    <Phone size={15} />

                    CONTACT NUMBER

                  </div>

                  <div
                    style={{
                      color: '#fff',
                      fontWeight: '600',
                      marginTop: '8px'
                    }}
                  >
                    {selectedTeam?.contactNumber ||
                      '—'}
                  </div>

                </div>


                {/* TEAM MEMBERS */}

                <div
                  style={{
                    padding: '14px',
                    background:
                      'rgba(255,255,255,0.03)',
                    borderRadius: '9px'
                  }}
                >

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#71717A',
                      fontSize: '10px',
                      fontWeight: '700'
                    }}
                  >
                    <Users size={15} />
                    TEAM MEMBERS
                  </div>

                  <div
                    style={{
                      marginTop: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    {teamWorkers.length === 0 ? (
                      <span
                        style={{
                          color: '#71717A',
                          fontSize: '12px'
                        }}
                      >
                        No workers assigned
                      </span>
                    ) : (
                      teamWorkers.map(worker => (
                        <div
                          key={worker?.id || worker?.workerId || worker?.email}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '9px',
                            padding: '8px 10px',
                            background:
                              'rgba(255,255,255,0.04)',
                            borderRadius: '7px'
                          }}
                        >
                          <User
                            size={14}
                            color="var(--accent-glow)"
                          />

                          <div>
                            <div
                              style={{
                                color: '#fff',
                                fontSize: '13px',
                                fontWeight: '700'
                              }}
                            >
                              {worker?.name ||
                                'Unknown Worker'}
                            </div>

                            <div
                              style={{
                                color: '#71717A',
                                fontSize: '10px',
                                marginTop: '2px'
                              }}
                            >
                              {worker?.designation ||
                                'WORKER'}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
};

export default TeamManagement;