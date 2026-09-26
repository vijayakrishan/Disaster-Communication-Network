import React, { useState } from 'react';

import {
  Mail,
  Phone,
  ExternalLink,
  HelpCircle,
  FileText,
  Settings,
  Radio,
  ShieldAlert,
  Brain,
  MessageSquare,
  Users,
  AlertTriangle,
  Activity,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import './HelpSupportPage.css';


const HelpSupportPage = () => {

  const [selectedGuide, setSelectedGuide] = useState(null);


  /* ============================================================
     GUIDE DATA
  ============================================================ */

  const guides = {

    operations: {
      title: 'ResQMesh Operations Guide',
      description:
        'General operational information for using the ResQMesh emergency communication platform.',
      points: [
        'Monitor active emergency SOS alerts from the dashboard.',
        'Check available rescue teams before assigning operations.',
        'Monitor rescue operations until the mission is completed.',
        'Use relay monitoring to identify communication problems.',
        'Use AI prediction as additional operational decision support.'
      ]
    },

    sos: {
      title: 'Emergency SOS Response Guide',
      description:
        'Basic procedure for handling an emergency SOS received through the ResQMesh platform.',
      points: [
        'Review the incoming SOS alert and emergency information.',
        'Check the reported location of the emergency.',
        'Identify an available rescue team.',
        'Assign the appropriate team to the rescue operation.',
        'Monitor the mission status during the response.',
        'Complete the SOS after the rescue operation is finished.'
      ]
    },

    relay: {
      title: 'LoRa Relay Monitoring Guide',
      description:
        'Information about monitoring relay nodes and communication network health.',
      points: [
        'Online relays are available for network communication.',
        'Offline relays may require power, connectivity or hardware inspection.',
        'RSSI indicates received radio signal strength.',
        'SNR indicates the quality of the received radio signal.',
        'Battery level helps identify relays requiring maintenance.',
        'Packet activity provides information about network communication traffic.',
        'Coverage information helps understand the operational network area.'
      ]
    },

    worker: {
      title: 'Worker Communication Guide',
      description:
        'Guidance for communication and assistance requests between rescue workers.',
      points: [
        'Workers can submit assistance requests during field operations.',
        'Incoming worker messages should be reviewed promptly.',
        'Messages can help coordinate additional rescue personnel.',
        'Team availability should be considered before responding.',
        'Operational communication should remain clear and concise.'
      ]
    },

    ai: {
      title: 'AI Prediction Usage Guide',
      description:
        'Information about using AI-assisted predictions available in the ResQMesh system.',
      points: [
        'AI Prediction provides operational decision-support information.',
        'Review predictions together with current SOS information.',
        'Consider team availability and relay network conditions.',
        'AI output should support, not replace, operational judgement.',
        'Field conditions should always be verified by rescue personnel.'
      ]
    }

  };


  /* ============================================================
     VIEW GUIDE
  ============================================================ */

  const handleGuideClick = (guideId) => {

    if (selectedGuide === guideId) {
      setSelectedGuide(null);
    } else {
      setSelectedGuide(guideId);
    }

  };


  return (

    <div className="dashboard-page help-page">


      {/* ========================================================
          PAGE INTRO
      ======================================================== */}

      <div className="help-main-panel">

        <div className="help-section-header">

          <HelpCircle size={19} />

          <div>

            <h3 className="help-section-title">
              HELP & SUPPORT CENTER
            </h3>

            <p className="help-section-subtitle">
              RESQMESH SYSTEM SUPPORT & OPERATIONS
            </p>

          </div>

        </div>


        <p className="help-intro-text">

          Access operational guidance, system documentation,
          troubleshooting information and support resources for
          the ResQMesh emergency communication platform.

        </p>


        {/* ======================================================
            SYSTEM INFO CARDS
        ====================================================== */}

        <div className="help-info-grid">


          <InfoCard
            icon={<ShieldAlert size={17} />}
            title="SOS OPERATIONS"
            text="Monitor emergency alerts and coordinate rescue team response."
            iconClass="help-icon-red"
          />


          <InfoCard
            icon={<Radio size={17} />}
            title="RELAY MONITORING"
            text="Monitor relay status, signal strength, battery and packet activity."
            iconClass="help-icon-teal"
          />


          <InfoCard
            icon={<Brain size={17} />}
            title="AI PREDICTION"
            text="Use AI-assisted information for operational decision support."
            iconClass="help-icon-purple"
          />


          <InfoCard
            icon={<MessageSquare size={17} />}
            title="WORKER MESSAGES"
            text="Coordinate assistance and communication between rescue workers."
            iconClass="help-icon-amber"
          />

        </div>

      </div>



      {/* ========================================================
          SYSTEM DOCUMENTATION
      ======================================================== */}

      <div className="help-main-panel help-document-panel">


        <div className="help-section-header">

          <FileText size={19} />

          <div>

            <h3 className="help-section-title">
              SYSTEM DOCUMENTATION
            </h3>

            <p className="help-section-subtitle">
              OPERATIONS & TECHNICAL GUIDES
            </p>

          </div>

        </div>


        <div className="help-documentation">


          <DocumentItem
            title="ResQMesh Operations Guide"
            guideId="operations"
            selectedGuide={selectedGuide}
            onClick={handleGuideClick}
            guide={guides.operations}
          />


          <DocumentItem
            title="Emergency SOS Response Guide"
            guideId="sos"
            selectedGuide={selectedGuide}
            onClick={handleGuideClick}
            guide={guides.sos}
          />


          <DocumentItem
            title="LoRa Relay Monitoring Guide"
            guideId="relay"
            selectedGuide={selectedGuide}
            onClick={handleGuideClick}
            guide={guides.relay}
          />


          <DocumentItem
            title="Worker Communication Guide"
            guideId="worker"
            selectedGuide={selectedGuide}
            onClick={handleGuideClick}
            guide={guides.worker}
          />


          <DocumentItem
            title="AI Prediction Usage Guide"
            guideId="ai"
            selectedGuide={selectedGuide}
            onClick={handleGuideClick}
            guide={guides.ai}
            last
          />

        </div>

      </div>



      {/* ========================================================
          QUICK OPERATIONS GUIDE
      ======================================================== */}

      <div className="help-main-panel">


        <div className="help-section-header">

          <BookOpen size={19} />

          <div>

            <h3 className="help-section-title">
              QUICK OPERATIONS GUIDE
            </h3>

            <p className="help-section-subtitle">
              COMMON SYSTEM OPERATIONS
            </p>

          </div>

        </div>


        <div className="help-operations-grid">


          <GuideStep
            number="01"
            title="Monitor SOS"
            text="Review incoming emergency alerts and their current status."
            icon={<ShieldAlert size={16} />}
          />


          <GuideStep
            number="02"
            title="Assign Team"
            text="Select an available rescue team for an active emergency."
            icon={<Users size={16} />}
          />


          <GuideStep
            number="03"
            title="Monitor Network"
            text="Check relay availability, RSSI, SNR and battery condition."
            icon={<Radio size={16} />}
          />


          <GuideStep
            number="04"
            title="Review Prediction"
            text="Use AI-assisted prediction together with operational information."
            icon={<Brain size={16} />}
          />

        </div>

      </div>



      {/* ========================================================
          TROUBLESHOOTING
      ======================================================== */}

      <div className="help-main-panel">


        <div className="help-section-header">

          <AlertTriangle size={19} />

          <div>

            <h3 className="help-section-title">
              TROUBLESHOOTING
            </h3>

            <p className="help-section-subtitle">
              COMMON SYSTEM ISSUES
            </p>

          </div>

        </div>


        <div className="help-troubleshooting">


          <TroubleItem
            title="Relay appears offline"
            text="Check relay power, connectivity and the latest relay status information."
          />


          <TroubleItem
            title="Weak RSSI or SNR"
            text="Check relay placement, antenna position and possible physical obstructions."
          />


          <TroubleItem
            title="SOS not appearing"
            text="Refresh the dashboard and verify rescue-service connectivity."
          />


          <TroubleItem
            title="Worker message unavailable"
            text="Verify that the worker message service is running and the request was successfully submitted."
          />


          <TroubleItem
            title="AI Prediction unavailable"
            text="Verify that the prediction service is running and required operational data is available."
          />

        </div>

      </div>



      {/* ========================================================
          SUPPORT + SYSTEM ROLES
      ======================================================== */}

      <div className="help-bottom-grid">


        {/* ======================================================
            USER ROLES
        ====================================================== */}

        <div className="help-main-panel">


          <div className="help-section-header">

            <Users size={19} />

            <div>

              <h3 className="help-section-title">
                USER ROLES
              </h3>

              <p className="help-section-subtitle">
                SYSTEM RESPONSIBILITIES
              </p>

            </div>

          </div>


          <div className="help-role-list">


            <RoleItem
              role="ADMIN"
              text="Monitor SOS history, teams, workers, relay health, worker messages and AI-assisted information."
            />


            <RoleItem
              role="WORKER"
              text="Respond to SOS alerts, coordinate rescue operations, communicate with workers and monitor relays."
            />


            <RoleItem
              role="USER"
              text="Register devices, monitor personal emergency information and trigger SOS alerts."
            />

          </div>

        </div>



        {/* ======================================================
            OPERATIONS SUPPORT
        ====================================================== */}

        <div className="help-main-panel">


          <div className="help-section-header">

            <Settings size={19} />

            <div>

              <h3 className="help-section-title">
                OPERATIONS SUPPORT
              </h3>

              <p className="help-section-subtitle">
                COMMAND & TECHNICAL SUPPORT
              </p>

            </div>

          </div>


          <div className="help-support-content">


            <div className="help-contact-row">

              <div className="help-contact-icon help-contact-green">
                <Phone size={15} />
              </div>

              <div>

                <div className="help-contact-label">
                  COMMAND HQ HOTLINE
                </div>

                <div className="help-contact-value">
                  +91 98765 01990
                </div>

              </div>

            </div>


            <div className="help-contact-row">

              <div className="help-contact-icon">
                <Mail size={15} />
              </div>

              <div>

                <div className="help-contact-label">
                  RADIO OPERATIONS
                </div>

                <div className="help-contact-value">
                  ops@resqmesh.org
                </div>

              </div>

            </div>


            <div className="help-support-note">

              <Activity size={14} />

              <span>
                Operational support is available during emergency
                response deployments. For critical incidents,
                contact Command HQ immediately.
              </span>

            </div>

          </div>

        </div>

      </div>


    </div>

  );

};


/* ================================================================
   INFO CARD
================================================================ */

const InfoCard = ({
  icon,
  title,
  text,
  iconClass = ''
}) => {

  return (

    <div className="help-info-card">

      <div className={`help-info-icon ${iconClass}`}>
        {icon}
      </div>

      <h4>
        {title}
      </h4>

      <p>
        {text}
      </p>

    </div>

  );

};


/* ================================================================
   DOCUMENT ITEM
================================================================ */

const DocumentItem = ({
  title,
  guideId,
  selectedGuide,
  onClick,
  guide,
  last
}) => {

  const isOpen = selectedGuide === guideId;


  return (

    <div
      className={`help-document-wrapper ${isOpen ? 'guide-open' : ''}`}
    >


      {/* ========================================================
          DOCUMENT ROW
      ======================================================== */}

      <div
        className={`help-document-row ${last ? 'last-row' : ''}`}
      >

        <div className="help-document-left">

          <FileText
            size={14}
            className="help-document-icon"
          />

          <span className="help-document-name">
            {title}
          </span>

        </div>


        <button
          type="button"
          className="help-view-btn"
          onClick={() => onClick(guideId)}
        >

          {isOpen ? 'Hide' : 'View'}

          {isOpen ? (
            <ChevronUp size={13} />
          ) : (
            <ChevronDown size={13} />
          )}

        </button>

      </div>



      {/* ========================================================
          GUIDE CONTENT
      ======================================================== */}

      {isOpen && (

        <div className="help-guide-content">

          <div className="help-guide-heading">

            <div className="help-guide-title">
              {guide.title}
            </div>

            <span className="help-guide-badge">
              GUIDE
            </span>

          </div>


          <p className="help-guide-description">
            {guide.description}
          </p>


          <div className="help-guide-label">
            KEY INFORMATION
          </div>


          <ul className="help-guide-points">

            {guide.points.map((point, index) => (

              <li key={index}>
                {point}
              </li>

            ))}

          </ul>

        </div>

      )}

    </div>

  );

};


/* ================================================================
   GUIDE STEP
================================================================ */

const GuideStep = ({
  number,
  title,
  text,
  icon
}) => {

  return (

    <div className="help-step-card">

      <div className="help-step-number">
        {number}
      </div>

      <div className="help-step-icon">
        {icon}
      </div>

      <div className="help-step-content">

        <h4>
          {title}
        </h4>

        <p>
          {text}
        </p>

      </div>

    </div>

  );

};


/* ================================================================
   TROUBLE ITEM
================================================================ */

const TroubleItem = ({
  title,
  text
}) => {

  return (

    <div className="help-trouble-item">

      <div className="help-trouble-icon">
        <AlertTriangle size={14} />
      </div>

      <div>

        <div className="help-trouble-title">
          {title}
        </div>

        <div className="help-trouble-text">
          {text}
        </div>

      </div>

    </div>

  );

};


/* ================================================================
   ROLE ITEM
================================================================ */

const RoleItem = ({
  role,
  text
}) => {

  return (

    <div className="help-role-item">

      <div className="help-role-badge">
        {role}
      </div>

      <div className="help-role-text">
        {text}
      </div>

    </div>

  );

};


export default HelpSupportPage;