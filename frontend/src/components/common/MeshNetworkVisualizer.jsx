import React, { useRef, useEffect, useState } from 'react';
import './MeshNetworkVisualizer.css';
import { useAppContext } from '../context/AppContext';
import { Radio, Zap, Cpu, Activity } from 'lucide-react';

const MeshNetworkVisualizer = () => {
  const { relays, devices, packets, triggerPacketAnimation, alerts } = useAppContext();
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  // Nodes lookup coordinates relative to canvas center
  const nodeOffsets = {
    'BASE': { x: 0, y: 0, label: 'Base Command Gateway', type: 'base' },
    'R-1': { x: -140, y: -70, label: 'Relay Alpha (Ridge)', type: 'relay' },
    'R-2': { x: 120, y: -90, label: 'Relay Beta (Canyon)', type: 'relay' },
    'R-3': { x: -110, y: 90, label: 'Relay Gamma (Valley)', type: 'relay' },
    'R-4': { x: 150, y: 80, label: 'Relay Delta (North Peak)', type: 'relay' },
    'DEV-01': { x: -240, y: -130, label: 'ResQ-Beacon #101', type: 'device' },
    'DEV-02': { x: 220, y: -150, label: 'Wilderness Transceiver', type: 'device' },
    'DEV-03': { x: -200, y: 150, label: 'Backpack Node #12', type: 'device' }
  };

  // Add any dynamically registered devices to offsets if not present
  const getExtendedOffsets = () => {
    const offsets = { ...nodeOffsets };
    devices.forEach((dev, idx) => {
      if (!offsets[dev.id]) {
        // Place dynamically registered devices in available slots
        const angle = (idx * 1.2) + Math.PI;
        offsets[dev.id] = {
          x: Math.round(Math.cos(angle) * 220),
          y: Math.round(Math.sin(angle) * 120),
          label: dev.name,
          type: 'device'
        };
      }
    });
    return offsets;
  };

  const getActiveState = (id) => {
    if (id === 'BASE') return { status: 'ONLINE', battery: 100, rssi: 0, snr: 0 };
    const r = relays.find(x => x.id === id);
    if (r) return r;
    const d = devices.find(x => x.id === id);
    if (d) return d;
    return null;
  };

  const isSosEnabled = (id) => {
    const state = getActiveState(id);
    return state?.sosEnabled || false;
  };

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let tick = 0;

    // Local array to track animated packets on canvas
    let activeVisualPackets = [];

    const handleResize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = 420;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const offsets = getExtendedOffsets();

      // Draw Grid Overlay Background (Cyberpunk style)
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Outer Signal Boundary Rings
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 260, 0, Math.PI * 2);
      ctx.stroke();

      // Precalculate exact positions
      const positions = {};
      Object.keys(offsets).forEach(key => {
        positions[key] = {
          x: cx + offsets[key].x,
          y: cy + offsets[key].y
        };
      });

      // 1. Draw Connection Lines (LoRa links)
      // BASE connects to all Relays
      relays.forEach(relay => {
        const start = positions['BASE'];
        const end = positions[relay.id];
        if (!start || !end) return;

        const isOnline = relay.status === 'ONLINE';
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        
        if (isOnline) {
          ctx.strokeStyle = 'rgba(45, 212, 191, 0.25)';
          ctx.lineWidth = 1.5;
          // Dashed marching lines animation
          ctx.setLineDash([6, 12]);
          ctx.lineDashOffset = -tick * 0.4;
        } else {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.15)';
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Devices connect to Relays (routing table lookup)
      const routing = {
        'DEV-01': 'R-1',
        'DEV-02': 'R-2',
        'DEV-03': 'R-3'
      };

      devices.forEach(dev => {
        const relayId = routing[dev.id] || 'R-1';
        const start = positions[dev.id];
        const end = positions[relayId];
        if (!start || !end) return;

        const isDevOnline = dev.status === 'ONLINE';
        const isRelayOnline = relays.find(r => r.id === relayId)?.status === 'ONLINE';
        const sos = dev.sosEnabled;

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);

        if (isDevOnline && isRelayOnline) {
          if (sos) {
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 6]);
            ctx.lineDashOffset = -tick * 0.8;
          } else {
            ctx.strokeStyle = 'rgba(45, 212, 191, 0.2)';
            ctx.lineWidth = 1;
            ctx.setLineDash([]);
          }
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 2. Animate flowing packets
      // Check for new context packets not yet mapped to visual animation
      packets.forEach(packet => {
        const visualExists = activeVisualPackets.find(vp => vp.id === packet.id);
        if (!visualExists) {
          const fromPos = positions[packet.from];
          const toPos = positions[packet.to];
          if (fromPos && toPos) {
            activeVisualPackets.push({
              id: packet.id,
              from: fromPos,
              to: toPos,
              progress: 0,
              speed: 0.025,
              color: isSosEnabled(packet.from) ? '#EF4444' : '#2DD4BF'
            });
          }
        }
      });

      // Draw and update visual packets
      activeVisualPackets = activeVisualPackets.filter(vp => {
        vp.progress += vp.speed;
        if (vp.progress >= 1) return false; // End of path

        const px = vp.from.x + (vp.to.x - vp.from.x) * vp.progress;
        const py = vp.from.y + (vp.to.y - vp.from.y) * vp.progress;

        // Draw packet dot with glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = vp.color;
        ctx.fillStyle = vp.color;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset
        
        return true;
      });

      // 3. Draw Nodes
      Object.keys(offsets).forEach(key => {
        const pos = positions[key];
        const info = offsets[key];
        const state = getActiveState(key);
        if (!pos || !state) return;

        const isOnline = state.status === 'ONLINE';
        const isSos = state.sosEnabled;
        const isHovered = hoveredNode === key;
        const isSelected = selectedNode === key;

        // Draw SOS Glow Pulse
        if (isSos) {
          ctx.shadowBlur = 15 + Math.sin(tick * 0.15) * 6;
          ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 22 + Math.sin(tick * 0.15) * 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0; // reset
        }

        // Selected/Hover halo
        if (isSelected || isHovered) {
          ctx.strokeStyle = isSos ? 'rgba(239, 68, 68, 0.7)' : 'rgba(20, 184, 166, 0.7)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 18, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw Node Core
        let nodeColor = 'var(--accent-primary)';
        let size = 8;

        if (info.type === 'base') {
          nodeColor = '#14B8A6';
          size = 12;
        } else if (info.type === 'relay') {
          nodeColor = isOnline ? '#22C55E' : '#EF4444';
          size = 9;
        } else if (info.type === 'device') {
          nodeColor = isSos ? '#EF4444' : isOnline ? '#14B8A6' : '#52525B';
          size = 6;
        }

        ctx.fillStyle = nodeColor;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Node Inner Circle (Ring detail)
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size - 3, 0, Math.PI * 2);
        ctx.stroke();

        // Base station additional ring
        if (info.type === 'base') {
          ctx.strokeStyle = 'rgba(20, 184, 166, 0.4)';
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 18, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw Node Labels
        ctx.fillStyle = isSos ? '#EF4444' : isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.85)';
        ctx.font = 'bold 10px var(--font-sans)';
        ctx.textAlign = 'center';
        
        // Custom offset label placement to avoid collisions
        let yOffset = -size - 6;
        if (key === 'BASE') yOffset = 24;
        if (key === 'R-3' || key === 'DEV-03') yOffset = 20;

        ctx.fillText(key, pos.x, pos.y + yOffset);
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [relays, devices, packets, hoveredNode, selectedNode]);

  // Click & Hover Listeners
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const offsets = getExtendedOffsets();

    let foundKey = null;
    Object.keys(offsets).forEach(key => {
      const nx = cx + offsets[key].x;
      const ny = cy + offsets[key].y;
      const dist = Math.sqrt((x - nx) ** 2 + (y - ny) ** 2);
      if (dist < 15) {
        foundKey = key;
      }
    });

    setHoveredNode(foundKey);
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const offsets = getExtendedOffsets();

    let foundKey = null;
    Object.keys(offsets).forEach(key => {
      const nx = cx + offsets[key].x;
      const ny = cy + offsets[key].y;
      const dist = Math.sqrt((x - nx) ** 2 + (y - ny) ** 2);
      if (dist < 15) {
        foundKey = key;
      }
    });

    setSelectedNode(foundKey);
  };

  const sendDiagnosticPacket = () => {
    if (!selectedNode || selectedNode === 'BASE') return;
    
    // Find routing
    let destNode = 'BASE';
    if (selectedNode.startsWith('DEV')) {
      const routing = { 'DEV-01': 'R-1', 'DEV-02': 'R-2', 'DEV-03': 'R-3' };
      destNode = routing[selectedNode] || 'R-1';
      
      // Trigger double hop
      triggerPacketAnimation(selectedNode, destNode);
      setTimeout(() => {
        triggerPacketAnimation(destNode, 'BASE');
      }, 500);
    } else {
      triggerPacketAnimation(selectedNode, 'BASE');
    }
  };

  const selectedNodeState = selectedNode ? getActiveState(selectedNode) : null;
  const selectedNodeInfo = selectedNode ? getExtendedOffsets()[selectedNode] : null;

  return (
    <div className="mesh-visualizer-container glass-panel">
      {/* Header controls */}
      <div className="flex-between visualizer-header">
        <div className="flex-align">
          <Activity size={18} color="var(--accent-glow)" />
          <h3>Interactive Mesh Topology</h3>
          <span className="live-pill">LIVE FEED</span>
        </div>
        <span className="visualizer-hint">Click nodes to inspect node parameters</span>
      </div>

      <div className="canvas-wrapper">
        <canvas 
          ref={canvasRef} 
          onMouseMove={handleMouseMove}
          onClick={handleCanvasClick}
          style={{ cursor: hoveredNode ? 'pointer' : 'default' }}
        />
      </div>

      {/* Selected Node Drawer */}
      {selectedNode && (
        <div className="node-detail-drawer glass-panel">
          <div className="flex-between drawer-header">
            <div className="flex-align">
              {selectedNodeInfo?.type === 'base' ? <Cpu size={16} /> : <Radio size={16} />}
              <h4>{selectedNodeInfo?.label} ({selectedNode})</h4>
            </div>
            <button className="close-drawer-btn" onClick={() => setSelectedNode(null)}>Close</button>
          </div>
          
          <div className="drawer-body">
            <div className="info-stat-row">
              <div className="info-stat">
                <span className="stat-label">Node Status</span>
                <span className={`badge badge-${selectedNodeState?.status.toLowerCase()}`}>
                  {selectedNodeState?.status}
                </span>
              </div>
              <div className="info-stat">
                <span className="stat-label">Battery Level</span>
                <span className="stat-value">{selectedNodeState?.battery}%</span>
              </div>
              <div className="info-stat">
                <span className="stat-label">Signal (RSSI)</span>
                <span className="stat-value">{selectedNodeState?.rssi} dBm</span>
              </div>
              <div className="info-stat">
                <span className="stat-label">SNR Ratio</span>
                <span className="stat-value">{selectedNodeState?.snr} dB</span>
              </div>
            </div>

            {selectedNode !== 'BASE' && selectedNodeState?.status === 'ONLINE' && (
              <button className="btn-primary btn-small" onClick={sendDiagnosticPacket}>
                <Zap size={14} />
                <span>Transmit Telemetry Ping</span>
              </button>
            )}
          </div>
        </div>
      )}

      
    </div>
  );
};

export default MeshNetworkVisualizer;
