import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import "./AIPrediction.css";

import {
  Activity,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  Maximize2,
  Minimize2,
  Radio,
  BrainCircuit,
  Siren,
  Users,
  TrendingUp,
  RefreshCw,
  Clock3,
  MapPin,
  Zap,
  Wifi,
  BatteryMedium,
  Navigation,
  Target,
  ChevronRight,
} from "lucide-react";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

const AIPrediction = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const { setAiRecommendation } = useAppContext();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("Just now");

  // ---------------------------------------------------------
  // RISK ZONES
  // ---------------------------------------------------------

  const riskZones = [
    {
      id: "Z-01",
      name: "DANGER ZONE",
      type: "Landslide Sector",
      lat: 11.0168,
      lng: 76.9558,
      radius: 450,
      color: "#ef4444",
      risk: "HIGH",
      probability: 92,
      impact: "Critical",
      telemetry:
        "High probability of soil slippage detected on northern slopes.",
    },
    {
      id: "Z-02",
      name: "WARNING ZONE",
      type: "Flood Basin",
      lat: 11.025,
      lng: 76.9705,
      radius: 600,
      color: "#f59e0b",
      risk: "MEDIUM",
      probability: 54,
      impact: "Moderate",
      telemetry:
        "Potential flash wash run-off channels forming near low elevation.",
    },
    {
      id: "Z-03",
      name: "SAFE ZONE",
      type: "Command Base",
      lat: 11.0045,
      lng: 76.965,
      radius: 350,
      color: "#22c55e",
      risk: "LOW",
      probability: 5,
      impact: "Nominal",
      telemetry:
        "Stable seismic and topography measurements detected.",
    },
  ];

  // ---------------------------------------------------------
  // RELAY NODES
  // ---------------------------------------------------------

  const relayNodes = [
    {
      id: "RN-01",
      lat: 11.012,
      lng: 76.947,
      battery: 82,
      packetLoss: 3,
      rssi: -76,
      health: "HEALTHY",
      failureRisk: 8,
    },
    {
      id: "RN-02",
      lat: 11.0205,
      lng: 76.958,
      battery: 61,
      packetLoss: 7,
      rssi: -88,
      health: "STABLE",
      failureRisk: 26,
    },
    {
      id: "RN-03",
      lat: 11.029,
      lng: 76.978,
      battery: 34,
      packetLoss: 18,
      rssi: -104,
      health: "WARNING",
      failureRisk: 74,
    },
    {
      id: "RN-04",
      lat: 10.997,
      lng: 76.974,
      battery: 91,
      packetLoss: 2,
      rssi: -69,
      health: "HEALTHY",
      failureRisk: 5,
    },
  ];

  // ---------------------------------------------------------
  // EMERGENCY ANALYSIS
  // ---------------------------------------------------------

  const emergencyAnalysis = [
    {
      id: "INC-1042",
      location: "North Slope Sector",
      victims: 7,
      distance: "2.4 km",
      probability: 94,
      severity: "CRITICAL",
      color: "#ef4444",
      reason:
        "Multiple SOS signals detected inside high-risk landslide zone.",
    },
    {
      id: "INC-1047",
      location: "Eastern Flood Basin",
      victims: 3,
      distance: "4.8 km",
      probability: 71,
      severity: "HIGH",
      color: "#f97316",
      reason:
        "Rising water-level telemetry combined with multiple distress events.",
    },
    {
      id: "INC-1051",
      location: "Command Base",
      victims: 1,
      distance: "6.2 km",
      probability: 31,
      severity: "MEDIUM",
      color: "#f59e0b",
      reason:
        "Single SOS with stable surrounding environmental conditions.",
    },
  ];

  // ---------------------------------------------------------
  // RESCUE TEAMS
  // ---------------------------------------------------------

  const rescueTeams = [
    {
      id: "TEAM-A",
      name: "Alpha Rescue",
      distance: "3.2 km",
      eta: "08 min",
      members: 6,
      availability: "AVAILABLE",
      score: 91,
    },
    {
      id: "TEAM-B",
      name: "Bravo Rescue",
      distance: "1.8 km",
      eta: "05 min",
      members: 4,
      availability: "BUSY",
      score: 63,
    },
    {
      id: "TEAM-C",
      name: "Charlie Rescue",
      distance: "2.1 km",
      eta: "06 min",
      members: 7,
      availability: "AVAILABLE",
      score: 96,
    },
  ];

  // ---------------------------------------------------------
  // MAP INITIALIZATION
  // ---------------------------------------------------------

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
    }).setView([11.015, 76.965], 13);

    mapRef.current = map;

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution: "© OpenStreetMap contributors © CARTO",
        maxZoom: 20,
      }
    ).addTo(map);

    // -------------------------
    // Risk Zones
    // -------------------------

    riskZones.forEach((zone) => {
      L.circle([zone.lat, zone.lng], {
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: 0.18,
        radius: zone.radius,
        weight: 2,
      }).addTo(map);

      const riskIcon = L.divIcon({
        className: "custom-ai-marker",
        html: `
          <div class="risk-marker" style="
            background:${zone.color};
            box-shadow:0 0 16px ${zone.color};
          ">
          </div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      L.marker([zone.lat, zone.lng], {
        icon: riskIcon,
      })
        .addTo(map)
        .bindPopup(`
          <div class="map-popup">
            <strong>${zone.name}</strong>
            <br/>
            ${zone.type}
            <br/><br/>
            Risk:
            <strong style="color:${zone.color}">
              ${zone.risk}
            </strong>
            <br/>
            Probability: ${zone.probability}%
          </div>
        `);
    });

    // -------------------------
    // Relay Nodes
    // -------------------------

    relayNodes.forEach((node) => {
      const nodeColor =
        node.failureRisk >= 70
          ? "#ef4444"
          : node.failureRisk >= 40
          ? "#f59e0b"
          : "#14b8a6";

      const nodeIcon = L.divIcon({
        className: "custom-ai-marker",
        html: `
          <div class="relay-marker" style="
            border-color:${nodeColor};
            box-shadow:0 0 12px ${nodeColor};
          ">
            <div style="background:${nodeColor}"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      L.marker([node.lat, node.lng], {
        icon: nodeIcon,
      })
        .addTo(map)
        .bindPopup(`
          <div class="map-popup">
            <strong>${node.id}</strong>
            <br/>
            Battery: ${node.battery}%
            <br/>
            Packet Loss: ${node.packetLoss}%
            <br/>
            Failure Risk:
            <strong style="color:${nodeColor}">
              ${node.failureRisk}%
            </strong>
          </div>
        `);
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ---------------------------------------------------------
  // FULLSCREEN MAP UPDATE
  // ---------------------------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // ---------------------------------------------------------
  // AI ANALYSIS
  // ---------------------------------------------------------

 const runAIAnalysis = () => {
  setIsAnalyzing(true);

  setTimeout(() => {
    setIsAnalyzing(false);
    setLastUpdated("Just now");

    // AI recommended team
    const recommendation = {
      incidentId: "INC-1042",
      teamId: "TEAM-C",
      teamName: "Charlie Rescue",
      location: "North Slope Sector",
      victims: 7,
      severity: "CRITICAL",
      confidence: 96,
      eta: "06 min",
      message:
        "AI has selected your team as the optimal rescue team for this incident.",
      timestamp: new Date().toISOString(),
      status: "PENDING",
    };

    setAiRecommendation(recommendation);
  }, 1800);
};

  // ---------------------------------------------------------
  // ICON FOR RISK
  // ---------------------------------------------------------

  const getRiskIcon = (risk) => {
    if (risk === "HIGH") return <ShieldAlert size={17} />;
    if (risk === "MEDIUM") return <AlertTriangle size={17} />;
    return <CheckCircle size={17} />;
  };

  return (
    <div
      className={`ai-page ${
        isFullscreen ? "ai-fullscreen-active" : ""
      }`}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="ai-header">
        <div>
          <div className="ai-title-row">
            <BrainCircuit size={21} />
            <h2>AI Prediction & Intelligence</h2>
          </div>

          <p>
            AI-powered emergency intelligence and LoRa network
            prediction console
          </p>
        </div>

        <div className="ai-header-actions">
          <div className="ai-live-status">
            <span></span>
            AI ENGINE ONLINE
          </div>

          <button
            className="ai-run-btn"
            onClick={runAIAnalysis}
            disabled={isAnalyzing}
          >
            <RefreshCw
              size={14}
              className={isAnalyzing ? "spin" : ""}
            />

            {isAnalyzing ? "Analyzing..." : "Run AI Analysis"}
          </button>
        </div>
      </div>

      {/* =====================================================
          METRICS
      ===================================================== */}

      <div className="ai-metrics-grid">
        <div className="ai-metric-card">
          <div className="metric-icon green">
            <Target size={19} />
          </div>

          <div>
            <span>Prediction Accuracy</span>
            <strong className="green-text">94.8%</strong>
          </div>

          <div className="metric-trend">
            <TrendingUp size={12} />
            +2.4%
          </div>
        </div>

        <div className="ai-metric-card">
          <div className="metric-icon red">
            <Siren size={19} />
          </div>

          <div>
            <span>Critical Alerts</span>
            <strong className="red-text">01 Active</strong>
          </div>

          <div className="metric-trend danger">
            LIVE
          </div>
        </div>

        <div className="ai-metric-card">
          <div className="metric-icon orange">
            <Activity size={19} />
          </div>

          <div>
            <span>Risk Zones</span>
            <strong>03 Active Zones</strong>
          </div>

          <div className="metric-trend warning">
            MONITORED
          </div>
        </div>

        <div className="ai-metric-card">
          <div className="metric-icon cyan">
            <Radio size={19} />
          </div>

          <div>
            <span>Relay Nodes</span>
            <strong className="cyan-text">04 Online</strong>
          </div>

          <div className="metric-trend">
            96.2%
          </div>
        </div>
      </div>

      {/* =====================================================
          MAP + RISK
      ===================================================== */}

      <div className="ai-main-grid">
        <div
          className={`ai-map-panel ${
            isFullscreen ? "ai-map-fullscreen" : ""
          }`}
        >
          <div className="ai-map-header">
            <div className="map-heading">
              <span className="live-dot"></span>

              <div>
                <strong>TACTICAL AI RISK MAP</strong>
                <small>
                  Risk zones + relay network topology
                </small>
              </div>
            </div>

            <button
              className="map-max-btn"
              onClick={() =>
                setIsFullscreen(!isFullscreen)
              }
            >
              {isFullscreen ? (
                <Minimize2 size={13} />
              ) : (
                <Maximize2 size={13} />
              )}

              {isFullscreen
                ? "Exit Fullscreen"
                : "Maximize Map"}
            </button>
          </div>

          <div
            ref={mapContainerRef}
            className="ai-leaflet-map"
          />

          <div className="map-legend">
            <div>
              <span className="legend-dot high"></span>
              High Risk
            </div>

            <div>
              <span className="legend-dot medium"></span>
              Medium Risk
            </div>

            <div>
              <span className="legend-dot low"></span>
              Safe
            </div>

            <div>
              <span className="legend-square"></span>
              Relay Node
            </div>
          </div>
        </div>

        {/* =================================================
            RISK ANALYSIS
        ================================================= */}

        <div className="ai-risk-column">
          <div className="ai-console-card">
            <div className="console-title">
              <Activity size={17} />
              <strong>AI Risk Analysis Console</strong>
              <span className="console-live">LIVE</span>
            </div>

            <p>
              AI models continuously analyze LoRa telemetry,
              terrain indicators, emergency signals and relay
              health to generate predictive intelligence.
            </p>

            <div className="model-status">
              <span>
                <BrainCircuit size={13} />
                Risk Model
              </span>

              <b>ACTIVE</b>
            </div>

            <div className="model-status">
              <span>
                <Radio size={13} />
                LoRa Telemetry
              </span>

              <b>SYNCED</b>
            </div>
          </div>

          <div className="section-label">
            <ShieldAlert size={14} />
            RISK ZONE PREDICTION
          </div>

          <div className="risk-cards">
            {riskZones.map((zone) => (
              <div
                className="risk-card"
                key={zone.id}
                style={{
                  "--risk-color": zone.color,
                }}
              >
                <div className="risk-card-top">
                  <div className="risk-name">
                    {getRiskIcon(zone.risk)}

                    <strong>
                      {zone.risk} RISK
                    </strong>
                  </div>

                  <span>{zone.id}</span>
                </div>

                <h4>{zone.type}</h4>

                <p>{zone.telemetry}</p>

                <div className="risk-progress">
                  <div>
                    <span>
                      AI Probability
                    </span>

                    <b>
                      {zone.probability}%
                    </b>
                  </div>

                  <div className="progress-track">
                    <div
                      style={{
                        width: `${zone.probability}%`,
                        background:
                          zone.color,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="risk-footer">
                  <span>
                    Impact: {zone.impact}
                  </span>

                  <b>MONITORED</b>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =====================================================
          AI FEATURE GRID
      ===================================================== */}

      <div className="ai-section-heading">
        <div>
          <span>INTELLIGENCE MODULES</span>
          <h3>AI Decision Support</h3>
        </div>

        <small>
          Last analysis: {lastUpdated}
        </small>
      </div>

      <div className="ai-feature-grid">

        {/* =================================================
            EMERGENCY SEVERITY
        ================================================= */}

        <div className="ai-feature-card">
          <div className="feature-header">
            <div className="feature-icon red-bg">
              <Siren size={18} />
            </div>

            <div>
              <strong>
                Emergency Severity Prediction
              </strong>

              <span>
                AI evaluates incoming SOS events
              </span>
            </div>

            <span className="feature-badge">
              AI ACTIVE
            </span>
          </div>

          <div className="incident-list">
            {emergencyAnalysis.map((incident) => (
              <div
                className="incident-item"
                key={incident.id}
              >
                <div
                  className="severity-indicator"
                  style={{
                    background:
                      incident.color,
                    boxShadow: `0 0 8px ${incident.color}`,
                  }}
                ></div>

                <div className="incident-main">
                  <div className="incident-title">
                    <strong>
                      {incident.id}
                    </strong>

                    <span
                      style={{
                        color:
                          incident.color,
                      }}
                    >
                      {incident.severity}
                    </span>
                  </div>

                  <p>
                    {incident.location}
                  </p>

                  <small>
                    {incident.victims} victims •{" "}
                    {incident.distance}
                  </small>
                </div>

                <div className="confidence">
                  <span>Confidence</span>
                  <b>
                    {incident.probability}%
                  </b>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =================================================
            NODE FAILURE
        ================================================= */}

        <div className="ai-feature-card">
          <div className="feature-header">
            <div className="feature-icon cyan-bg">
              <Radio size={18} />
            </div>

            <div>
              <strong>
                Relay Node Failure Prediction
              </strong>

              <span>
                Predicts communication node failures
              </span>
            </div>

            <span className="feature-badge warning-badge">
              MONITORING
            </span>
          </div>

          <div className="node-list">
            {relayNodes.map((node) => {
              const failureColor =
                node.failureRisk >= 70
                  ? "#ef4444"
                  : node.failureRisk >= 40
                  ? "#f59e0b"
                  : "#22c55e";

              return (
                <div
                  className="node-item"
                  key={node.id}
                >
                  <div className="node-info">
                    <div className="node-icon">
                      <Wifi size={15} />
                    </div>

                    <div>
                      <strong>{node.id}</strong>

                      <span>
                        {node.health}
                      </span>
                    </div>
                  </div>

                  <div className="node-stats">
                    <div>
                      <BatteryMedium
                        size={12}
                      />
                      {node.battery}%
                    </div>

                    <div>
                      Loss {node.packetLoss}%
                    </div>
                  </div>

                  <div className="failure-score">
                    <span>
                      Failure Risk
                    </span>

                    <b
                      style={{
                        color:
                          failureColor,
                      }}
                    >
                      {node.failureRisk}%
                    </b>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="prediction-warning">
            <AlertTriangle size={15} />

            <div>
              <strong>
                RN-03 requires attention
              </strong>

              <span>
                AI predicts elevated failure probability
                due to battery and packet-loss trends.
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            RESCUE TEAM RECOMMENDATION
        ================================================= */}

        <div className="ai-feature-card rescue-card">
          <div className="feature-header">
            <div className="feature-icon orange-bg">
              <Users size={18} />
            </div>

            <div>
              <strong>
                Smart Rescue Recommendation
              </strong>

              <span>
                AI-ranked team allocation
              </span>
            </div>

            <span className="feature-badge green-badge">
              OPTIMIZED
            </span>
          </div>

          <div className="recommendation-banner">
            <div className="recommendation-icon">
              <Target size={20} />
            </div>

            <div>
              <span>
                RECOMMENDED FOR INC-1042
              </span>

              <strong>
                Charlie Rescue
              </strong>

              <small>
                Highest response suitability score
              </small>
            </div>

            <b>96%</b>
          </div>

          <div className="team-list">
            {rescueTeams.map((team, index) => (
              <div
                className={`team-item ${
                  index === 2
                    ? "recommended-team"
                    : ""
                }`}
                key={team.id}
              >
                <div className="team-rank">
                  #{index + 1}
                </div>

                <div className="team-info">
                  <strong>
                    {team.name}
                  </strong>

                  <span>
                    {team.members} members •{" "}
                    {team.distance}
                  </span>
                </div>

                <div className="team-eta">
                  <Clock3 size={12} />
                  {team.eta}
                </div>

               <div
                className={`team-status ${
                team.availability === "AVAILABLE"
                ? "available"
                : "busy"
                }`}
              >
  {team.availability}
</div>

                <ChevronRight
                  size={15}
                  className="team-arrow"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =====================================================
          AI DECISION SUMMARY
      ===================================================== */}

      <div className="ai-decision-panel">
        <div className="decision-icon">
          <BrainCircuit size={22} />
        </div>

        <div className="decision-content">
          <span>AI DECISION SUMMARY</span>

          <h3>
            Immediate attention recommended for North
            Slope Sector
          </h3>

          <p>
            Current telemetry indicates a{" "}
            <strong>92% landslide probability</strong>.
            Incident INC-1042 has been classified as{" "}
            <strong>CRITICAL</strong>. Charlie Rescue is
            currently the optimal team based on distance,
            availability and response capacity.
          </p>
        </div>

        <button className="decision-action">
          View Incident
          <Navigation size={14} />
        </button>
      </div>
    </div>
  );
};

export default AIPrediction;