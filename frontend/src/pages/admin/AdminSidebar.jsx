import React from 'react';
import './AdminSidebar.css';
import { useAppContext } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Radio, 
  History, 
  Settings, 
  Users, 
  ShieldAlert, 
  Network, 
  FileBarChart, 
  LogOut, 
  Activity, 
  Signal, 
  Heart,
  UserCheck,
  Mail,
  Sparkles
} from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout, relays, devices } = useAppContext();

  if (!currentUser) return null;

  const role = currentUser.role;

  // Compute LoRa Mesh Status parameters
  const onlineRelays = relays.filter(r => r.status === 'ONLINE').length;
  const totalRelays = relays.length;
  const onlineDevices = devices.filter(d => d.status === 'ONLINE').length;
  const totalNodes = onlineRelays + onlineDevices;
  
  // Calculate average signal health index
  const activeNodesWithSignal = [...relays, ...devices].filter(n => n.status === 'ONLINE');
  const avgRssi = activeNodesWithSignal.length > 0 
    ? Math.round(activeNodesWithSignal.reduce((acc, curr) => acc + (curr.rssi || -100), 0) / activeNodesWithSignal.length)
    : -100;
  
  let signalQuality = 'EXCELLENT';
  let signalColor = 'var(--color-success)';
  if (avgRssi < -95) {
    signalQuality = 'CRITICAL';
    signalColor = 'var(--color-danger)';
  } else if (avgRssi < -85) {
    signalQuality = 'MODERATE';
    signalColor = 'var(--color-warning)';
  }

  const networkHealth = onlineRelays === totalRelays ? 'OPTIMAL' : onlineRelays > 0 ? 'DEGRADED' : 'OFFLINE';
  const healthColor = networkHealth === 'OPTIMAL' ? 'var(--color-success)' : networkHealth === 'DEGRADED' ? 'var(--color-warning)' : 'var(--color-danger)';

  // Define sidebar menu options based on role
  const menuItems = {
    ADMIN: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'workers', label: 'Workers', icon: Activity },
      { id: 'teams', label: 'Rescue Teams', icon: UserCheck },
      { id: 'history', label: 'SOS History', icon: History },
      { id: 'messages', label: 'Worker Messages', icon: Mail },
      { id: 'prediction', label: 'AI Monitoring', icon: Sparkles },
      { id: 'relays', label: 'Relay Nodes', icon: Network },
      { id: 'support', label: 'Help & Support', icon: Settings }
    ]
  };

  const currentMenu = menuItems[role] || [];

  return (
    <aside className="sidebar-container glass-panel">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-logo pulse-blue">
          <ShieldAlert size={20} color="var(--accent-glow)" />
        </div>
        <div className="brand-info">
          <h2>ResQMesh</h2>
          <span className="brand-sub">Emergency LoRa V2.4</span>
        </div>
      </div>

      {/* Profile Summary Card */}
      <div className="sidebar-profile">
        <div className="avatar-glow">
          <div className="profile-avatar">
            {currentUser.name.split(' ').map(n => n[0]).join('')}
          </div>
          <span className="profile-badge-dot"></span>
        </div>
        <div className="profile-details">
          <div className="profile-name">{currentUser.name}</div>
          <div className="profile-role">
            <span className={`role-tag role-${role.toLowerCase()}`}>{role}</span>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="sidebar-nav">
        <ul>
          {currentMenu.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button 
                  onClick={() => setActiveTab(item.id)}
                  className={`nav-button ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} className="nav-icon" />
                  <span>{item.label}</span>
                  {isActive && <div className="active-glow-bar" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

   
      {/* Logout Action */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <LogOut size={16} />
          <span>Exit Session</span>
        </button>
      </div>

      
    </aside>
  );
};

export default AdminSidebar;
