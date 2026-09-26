import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Radio } from 'lucide-react';
import { formatIndianPhoneNumber } from '../../utils/phone';

// Reusable layout components
import FilterBar from '../../components/FilterBar';
import Pagination from '../../components/Pagination';

// Dedicated styles
import '../../components/Dashboard.css';

const UserManagement = () => {
  const { devices, alerts } = useAppContext();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Core victim accounts mock roster derived from devices
  const initialUsers = [
    { id: 'u1', name: 'Sarah Connor', contact: '+91 98765 43210', location: 'Ridge Cabin Sector 4', registerDate: '2026-05-12' },
    { id: 'u2', name: 'John Doe', contact: '+91 98765 43211', location: 'Canyon Trail Pass', registerDate: '2026-06-18' },
    { id: 'u3', name: 'Marcus Wright', contact: '+91 98765 43212', location: 'Valley Ground Camp', registerDate: '2026-07-01' }
  ];

  // Helper to determine safety status
  const getUserStatus = (userId) => {
    // Find if user has device with SOS active
    const userDevices = devices.filter(d => d.ownerId === userId);
    const activeSOS = alerts.find(a => userDevices.some(d => d.id === a.deviceId) && a.status !== 'COMPLETED');
    return activeSOS ? 'SOS_ACTIVE' : 'NOMINAL';
  };

  const filteredUsers = initialUsers.filter(u => {
    const status = getUserStatus(u.id);
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.contact.includes(search) || 
                          u.id.toLowerCase().includes(search.toLowerCase());
    
    if (filterStatus === 'ALL') return matchesSearch;
    if (filterStatus === 'SOS_ACTIVE') return matchesSearch && status === 'SOS_ACTIVE';
    if (filterStatus === 'NOMINAL') return matchesSearch && status === 'NOMINAL';
    return matchesSearch;
  });

  // Pagination logic
  const totalRecords = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);
  const endIndex = Math.min(startIndex + pageSize, totalRecords);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        
        {/* Search & Filters Row using unified FilterBar */}
        <FilterBar 
          searchPlaceholder="Search victims..."
          searchQuery={search}
          setSearchQuery={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          dropdownValue={filterStatus}
          setDropdownValue={(val) => {
            setFilterStatus(val);
            setCurrentPage(1);
          }}
          dropdownOptions={[
            { value: 'SOS_ACTIVE', label: 'Emergency Active' },
            { value: 'NOMINAL', label: 'Nominal Standby' }
          ]}
          dropdownPlaceholder="All Statuses"
        />

        {/* Roster Table */}
        <div className="dispatch-queue-card">
          <div className="dark-table-container">
            <table className="dark-table">
              <thead>
                <tr>
                  <th>USER ID</th>
                  <th>FULL NAME</th>
                  <th>CONTACT NUMBER</th>
                  <th>DEFAULT LOCATION</th>
                  <th>REGISTER DATE</th>
                  <th>LORA NODES</th>
                  <th>SAFETY STATUS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-table-cell text-center">
                      <div className="empty-state-centered">
                        <h4>No records available</h4>
                        <p>No survivors match the selected search parameters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => {
                    const userStatus = getUserStatus(user.id);
                    const userDevs = devices.filter(d => d.ownerId === user.id);
                    
                    return (
                      <tr key={user.id}>
                        <td className="font-mono font-bold font-red">{user.id}</td>
                        <td style={{ color: '#fff', fontWeight: '700' }}>{user.name}</td>
                        <td className="font-mono">{formatIndianPhoneNumber(user.contact)}</td>
                        <td>{user.location}</td>
                        <td className="font-mono">{user.registerDate}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {userDevs.map(d => (
                              <span key={d.id} className="badge badge-info font-mono" style={{ fontSize: '10px', padding: '2px 6px' }}>
                                <Radio size={10} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {d.id}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${userStatus === 'SOS_ACTIVE' ? 'badge-critical' : 'badge-online'} badge-large`}>
                            {userStatus === 'SOS_ACTIVE' ? 'EMERGENCY SOS' : 'NOMINAL STANDBY'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Standardized Pagination */}
          {totalRecords > 0 && (
            <Pagination 
              totalRecords={totalRecords}
              startIndex={startIndex}
              endIndex={endIndex}
              pageSize={pageSize}
              setPageSize={setPageSize}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          )}
        </div>

        {/* Visual Analytics & Operational Insights Section to eliminate empty space */}
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Row 1: Victim Registry Metrics */}
          <div className="grid-cols-3">
            <div className="glass-panel" style={{ padding: '20px', background: '#18181B', border: '1px solid #3A3A44', borderRadius: '12px' }}>
              <span style={{ fontSize: '11px', color: '#71717A', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered Survivors</span>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginTop: '6px' }}>{initialUsers.length}</h3>
            </div>
            <div className="glass-panel" style={{ padding: '20px', background: '#18181B', border: '1px solid #3A3A44', borderRadius: '12px' }}>
              <span style={{ fontSize: '11px', color: '#71717A', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Emergency SOS Active</span>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#EF4444', marginTop: '6px' }}>{initialUsers.filter(u => getUserStatus(u.id) === 'SOS_ACTIVE').length}</h3>
            </div>
            <div className="glass-panel" style={{ padding: '20px', background: '#18181B', border: '1px solid #3A3A44', borderRadius: '12px' }}>
              <span style={{ fontSize: '11px', color: '#71717A', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nominal Standby</span>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#22C55E', marginTop: '6px' }}>{initialUsers.filter(u => getUserStatus(u.id) === 'NOMINAL').length}</h3>
            </div>
          </div>

          {/* Row 2: Secondary Content Panels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            
            {/* Panel 1: Location Distribution */}
            <div className="glass-panel" style={{ padding: '20px', background: '#18181B', border: '1px solid #3A3A44', borderRadius: '12px' }}>
              <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: '700', marginBottom: '14px' }}>Survivor Location Distribution</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                  <span style={{ color: '#A1A1AA' }}>Ridge Cabin Sector 4:</span>
                  <span style={{ color: '#fff', fontWeight: '700' }}>1 Survivor (Sarah Connor)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                  <span style={{ color: '#A1A1AA' }}>Canyon Trail Pass:</span>
                  <span style={{ color: '#fff', fontWeight: '700' }}>1 Survivor (John Doe)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '2px' }}>
                  <span style={{ color: '#A1A1AA' }}>Valley Ground Camp:</span>
                  <span style={{ color: '#fff', fontWeight: '700' }}>1 Survivor (Marcus Wright)</span>
                </div>
              </div>
            </div>

            {/* Panel 2: Device Health Status & Logs */}
            <div className="glass-panel" style={{ padding: '20px', background: '#18181B', border: '1px solid #3A3A44', borderRadius: '12px' }}>
              <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: '700', marginBottom: '14px' }}>Survivor Device Handshake Log</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', color: '#A1A1AA' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
                  <span>DEV-01 (Sarah Connor):</span>
                  <span style={{ color: '#EF4444' }}>SOS Active • RSSI -68 dBm • Batt 89%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '4px' }}>
                  <span>DEV-02 (John Doe):</span>
                  <span style={{ color: '#22C55E' }}>Nominal • RSSI -89 dBm • Batt 54%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>DEV-03 (Marcus Wright):</span>
                  <span style={{ color: '#22C55E' }}>Nominal • RSSI -62 dBm • Batt 98%</span>
                </div>
              </div>
            </div>

        </div>
      </div>
    </div>
  </div>
  );
};

export default UserManagement;
