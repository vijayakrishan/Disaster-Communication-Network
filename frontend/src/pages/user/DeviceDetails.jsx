import React, { useEffect, useState } from 'react';
import './DeviceDetails.css';
import { useAppContext } from '../../context/AppContext';

import {
  Cpu,
  Battery,
  Send,
  MapPin,
  Clock3,
  Radio,
  Activity,
  Satellite,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const DeviceDetails = () => {

  const {
    devices = [],
    currentUser
  } = useAppContext();


  // ============================================================
  // SELECTED DEVICE
  // ============================================================

  const [selectedDevId, setSelectedDevId] = useState('');


  // ============================================================
  // SELECT FIRST DEVICE
  // ============================================================

  useEffect(() => {

    if (
      devices.length > 0 &&
      !selectedDevId
    ) {

      setSelectedDevId(
        devices[0]?.id ||
        devices[0]?.deviceId ||
        ''
      );

    }

  }, [devices, selectedDevId]);


  // ============================================================
  // CURRENT DEVICE
  // ============================================================

  const currentDevice =
    devices.find(
      (device) =>
        String(
          device?.id ||
          device?.deviceId
        ) === String(selectedDevId)
    ) ||
    devices[0] ||
    null;


  // ============================================================
  // DEVICE STATUS
  // ============================================================

  const rawStatus =
    currentDevice?.status ||
    currentDevice?.deviceStatus ||
    '';

  const deviceStatus =
    String(rawStatus)
      .trim()
      .toUpperCase();

  const isConnected =
    deviceStatus === 'CONNECTED' ||
    deviceStatus === 'ONLINE' ||
    deviceStatus === 'ACTIVE';


  // ============================================================
  // USER CHECK
  // ============================================================

  if (!currentUser) {
    return null;
  }


  // ============================================================
  // DEVICE VALUES
  // ============================================================

  const deviceId =
    currentDevice?.deviceId ||
    currentDevice?.id ||
    'N/A';


  const battery =
    currentDevice?.battery != null
      ? Number(currentDevice.battery)
      : null;


  const packetsSent =
    currentDevice?.packetsSent ??
    currentDevice?.packets_sent ??
    currentDevice?.txPackets ??
    0;


  const latitude =
    currentDevice?.latitude ??
    currentDevice?.lat ??
    null;


  const longitude =
    currentDevice?.longitude ??
    currentDevice?.lng ??
    null;


  const gpsStatus =
    currentDevice?.gpsStatus ||
    currentDevice?.gps_status ||
    (
      latitude != null &&
      longitude != null
        ? 'FIXED'
        : 'NO FIX'
    );


  const isGpsFixed =
    String(gpsStatus)
      .toUpperCase() === 'FIXED' ||
    String(gpsStatus)
      .toUpperCase() === 'AVAILABLE';


  const lastSeen =
    currentDevice?.lastSeen ||
    currentDevice?.last_seen ||
    currentDevice?.lastConnected ||
    currentDevice?.updatedAt ||
    'N/A';


  const loraModule =
    currentDevice?.loraModule ||
    currentDevice?.loraChip ||
    currentDevice?.lora_module ||
    'SX1278';


  const loraFrequency =
    currentDevice?.loraFrequency ||
    currentDevice?.frequency ||
    currentDevice?.lora_frequency ||
    '433 MHz';


  // ============================================================
  // FORMAT LAST SEEN
  // ============================================================

  const formatLastSeen = (value) => {

    if (!value || value === 'N/A') {
      return 'N/A';
    }

    try {

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleString([], {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

    } catch {
      return value;
    }
  };


  // ============================================================
  // FORMAT GPS
  // ============================================================

  const formatCoordinate = (value) => {

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return 'N/A';
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return value;
    }

    return number.toFixed(6);
  };


  // ============================================================
  // BATTERY STATUS
  // ============================================================

  const batteryValue =
    battery != null
      ? Math.min(
          100,
          Math.max(0, battery)
        )
      : 0;


  const batteryLabel =
    battery == null
      ? 'N/A'
      : `${batteryValue}%`;


  const getBatteryStatus = () => {

    if (battery == null) {
      return 'UNKNOWN';
    }

    if (battery <= 20) {
      return 'LOW';
    }

    if (battery <= 50) {
      return 'NORMAL';
    }

    return 'GOOD';
  };


  const batteryStatus =
    getBatteryStatus();


  // ============================================================
  // DEVICE OFFLINE
  // ============================================================

  if (!currentDevice) {

    return (

      <div className="dashboard-page">

        <div
          className="glass-panel"
          style={{
            padding: '50px',
            textAlign: 'center',
            borderRadius: '18px'
          }}
        >

          <Cpu
            size={48}
            style={{
              marginBottom: '15px',
              opacity: 0.7
            }}
          />

          <h2>
            No Hardware Device Found
          </h2>

          <p className="brighter-sub">
            Connect your ESP32 LoRa device to view
            hardware information.
          </p>

        </div>

      </div>

    );
  }


  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (

    <div className="dashboard-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        className="glass-panel"
        style={{
          padding: '22px 26px',
          borderRadius: '18px',
          marginBottom: '20px'
        }}
      >

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap'
          }}
        >

          {/* LEFT */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}
          >

            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isConnected
                  ? 'rgba(34,197,94,0.12)'
                  : 'rgba(239,68,68,0.12)',
                border: isConnected
                  ? '1px solid rgba(34,197,94,0.25)'
                  : '1px solid rgba(239,68,68,0.25)'
              }}
            >

              <Cpu
                size={25}
                color={
                  isConnected
                    ? '#22C55E'
                    : '#EF4444'
                }
              />

            </div>


            <div>

              <h2
                style={{
                  margin: 0,
                  fontSize: '21px',
                  fontWeight: 700
                }}
              >
                Hardware Device
              </h2>

              <p
                style={{
                  margin: '5px 0 0',
                  opacity: 0.65,
                  fontSize: '13px'
                }}
              >
                ResQMesh ESP32 LoRa Device
              </p>

            </div>

          </div>


          {/* DEVICE SELECTOR */}

          {devices.length > 1 && (

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >

              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  opacity: 0.7
                }}
              >
                DEVICE
              </span>

              <select
                value={selectedDevId}
                onChange={(e) =>
                  setSelectedDevId(e.target.value)
                }
                className="input-control select-custom"
                style={{
                  minWidth: '210px'
                }}
              >

                {devices.map((device) => {

                  const id =
                    device?.id ||
                    device?.deviceId;

                  return (

                    <option
                      key={id}
                      value={id}
                    >
                      {device?.name ||
                        device?.deviceName ||
                        'ESP32 LoRa Device'}
                      {' '}
                      ({id})
                    </option>

                  );

                })}

              </select>

            </div>

          )}

        </div>

      </div>


      {/* ======================================================
          STATUS BANNER
      ====================================================== */}

      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          borderRadius: '18px',
          marginBottom: '20px',
          border: isConnected
            ? '1px solid rgba(34,197,94,0.28)'
            : '1px solid rgba(239,68,68,0.28)',
          background: isConnected
            ? 'rgba(34,197,94,0.045)'
            : 'rgba(239,68,68,0.045)'
        }}
      >

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '15px',
            flexWrap: 'wrap'
          }}
        >

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '13px'
            }}
          >

            {isConnected ? (

              <CheckCircle2
                size={25}
                color="#22C55E"
              />

            ) : (

              <XCircle
                size={25}
                color="#EF4444"
              />

            )}


            <div>

              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 700
                }}
              >
                {isConnected
                  ? 'Device Connected'
                  : 'Device Offline'}
              </div>

              <div
                style={{
                  marginTop: '4px',
                  fontSize: '12px',
                  opacity: 0.65
                }}
              >
                {isConnected
                  ? 'ESP32 hardware is currently connected and reporting telemetry.'
                  : 'ESP32 hardware is not currently connected.'}
              </div>

            </div>

          </div>


          <span
            style={{
              padding: '7px 14px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.6px',
              background: isConnected
                ? 'rgba(34,197,94,0.12)'
                : 'rgba(239,68,68,0.12)',
              color: isConnected
                ? '#22C55E'
                : '#EF4444',
              border: isConnected
                ? '1px solid rgba(34,197,94,0.25)'
                : '1px solid rgba(239,68,68,0.25)'
            }}
          >
            {isConnected
              ? '● ONLINE'
              : '● OFFLINE'}
          </span>

        </div>

      </div>


      {/* ======================================================
          MAIN DEVICE INFORMATION
      ====================================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '18px',
          marginBottom: '20px'
        }}
      >


        {/* ====================================================
            DEVICE ID
        ==================================================== */}

        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: '18px'
          }}
        >

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '11px',
              marginBottom: '20px'
            }}
          >

            <Cpu
              size={20}
              color="var(--accent-glow)"
            />

            <span
              style={{
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              DEVICE ID
            </span>

          </div>


          <div
            style={{
              fontSize: '21px',
              fontWeight: 700,
              wordBreak: 'break-all'
            }}
          >
            {deviceId}
          </div>


          <div
            style={{
              marginTop: '7px',
              fontSize: '12px',
              opacity: 0.55
            }}
          >
            Registered hardware identifier
          </div>

        </div>


        {/* ====================================================
            BATTERY
        ==================================================== */}

        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: '18px'
          }}
        >

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px'
            }}
          >

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '11px'
              }}
            >

              <Battery
                size={20}
                color="#22C55E"
              />

              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700
                }}
              >
                BATTERY
              </span>

            </div>


            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color:
                  batteryStatus === 'LOW'
                    ? '#EF4444'
                    : '#22C55E'
              }}
            >
              {batteryStatus}
            </span>

          </div>


          <div
            style={{
              fontSize: '28px',
              fontWeight: 750
            }}
          >
            {batteryLabel}
          </div>


          <div
            style={{
              height: '7px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.08)',
              marginTop: '15px',
              overflow: 'hidden'
            }}
          >

            <div
              style={{
                width: `${batteryValue}%`,
                height: '100%',
                borderRadius: '10px',
                background:
                  batteryValue <= 20
                    ? '#EF4444'
                    : '#22C55E',
                transition:
                  'width 0.4s ease'
              }}
            />

          </div>

        </div>


        {/* ====================================================
            PACKETS SENT
        ==================================================== */}

        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: '18px'
          }}
        >

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '11px',
              marginBottom: '20px'
            }}
          >

            <Send
              size={20}
              color="var(--accent-glow)"
            />

            <span
              style={{
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              PACKETS SENT
            </span>

          </div>


          <div
            style={{
              fontSize: '30px',
              fontWeight: 750
            }}
          >
            {Number(packetsSent).toLocaleString()}
          </div>


          <div
            style={{
              marginTop: '7px',
              fontSize: '12px',
              opacity: 0.55
            }}
          >
            LoRa packets transmitted
          </div>

        </div>


        {/* ====================================================
            LAST SEEN
        ==================================================== */}

        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: '18px'
          }}
        >

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '11px',
              marginBottom: '20px'
            }}
          >

            <Clock3
              size={20}
              color="var(--accent-glow)"
            />

            <span
              style={{
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              LAST SEEN
            </span>

          </div>


          <div
            style={{
              fontSize: '17px',
              fontWeight: 700,
              lineHeight: 1.5
            }}
          >
            {formatLastSeen(lastSeen)}
          </div>


          <div
            style={{
              marginTop: '7px',
              fontSize: '12px',
              opacity: 0.55
            }}
          >
            Last telemetry received
          </div>

        </div>

      </div>


      {/* ======================================================
          GPS + LORA
      ====================================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '18px',
          marginBottom: '20px'
        }}
      >


        {/* ====================================================
            GPS
        ==================================================== */}

        <div
          className="glass-panel"
          style={{
            padding: '25px',
            borderRadius: '18px'
          }}
        >

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}
          >

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '11px'
              }}
            >

              <Satellite
                size={21}
                color="#38BDF8"
              />

              <h3
                style={{
                  margin: 0,
                  fontSize: '16px'
                }}
              >
                GPS Location
              </h3>

            </div>


            <span
              style={{
                padding: '6px 10px',
                borderRadius: '14px',
                fontSize: '10px',
                fontWeight: 700,
                color: isGpsFixed
                  ? '#22C55E'
                  : '#EF4444',
                background: isGpsFixed
                  ? 'rgba(34,197,94,0.10)'
                  : 'rgba(239,68,68,0.10)'
              }}
            >
              {isGpsFixed
                ? '● FIXED'
                : '● NO FIX'}
            </span>

          </div>


          {/* GPS STATUS */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '14px 0',
              borderBottom:
                '1px solid rgba(255,255,255,0.07)'
            }}
          >

            <span
              style={{
                fontSize: '12px',
                opacity: 0.6
              }}
            >
              GPS STATUS
            </span>

            <strong
              style={{
                color: isGpsFixed
                  ? '#22C55E'
                  : '#EF4444'
              }}
            >
              {gpsStatus}
            </strong>

          </div>


          {/* LATITUDE */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 0',
              borderBottom:
                '1px solid rgba(255,255,255,0.07)'
            }}
          >

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >

              <MapPin
                size={16}
                color="#38BDF8"
              />

              <span
                style={{
                  fontSize: '12px',
                  opacity: 0.6
                }}
              >
                LATITUDE
              </span>

            </div>


            <span
              style={{
                fontFamily: 'monospace',
                fontWeight: 700
              }}
            >
              {formatCoordinate(latitude)}
              {latitude != null ? '°' : ''}
            </span>

          </div>


          {/* LONGITUDE */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 0'
            }}
          >

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >

              <MapPin
                size={16}
                color="#38BDF8"
              />

              <span
                style={{
                  fontSize: '12px',
                  opacity: 0.6
                }}
              >
                LONGITUDE
              </span>

            </div>


            <span
              style={{
                fontFamily: 'monospace',
                fontWeight: 700
              }}
            >
              {formatCoordinate(longitude)}
              {longitude != null ? '°' : ''}
            </span>

          </div>

        </div>


        {/* ====================================================
            LORA
        ==================================================== */}

        <div
          className="glass-panel"
          style={{
            padding: '25px',
            borderRadius: '18px'
          }}
        >

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}
          >

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '11px'
              }}
            >

              <Radio
                size={21}
                color="var(--accent-glow)"
              />

              <h3
                style={{
                  margin: 0,
                  fontSize: '16px'
                }}
              >
                LoRa Module
              </h3>

            </div>


            <span
              style={{
                padding: '6px 10px',
                borderRadius: '14px',
                fontSize: '10px',
                fontWeight: 700,
                color: '#22C55E',
                background:
                  'rgba(34,197,94,0.10)'
              }}
            >
              ACTIVE
            </span>

          </div>


          {/* LORA SPECIFICATION */}

          <div
            style={{
              padding: '22px',
              borderRadius: '14px',
              background:
                'rgba(255,255,255,0.025)',
              border:
                '1px solid rgba(255,255,255,0.07)',
              textAlign: 'center'
            }}
          >

            <Radio
              size={35}
              style={{
                marginBottom: '12px',
                opacity: 0.9
              }}
            />

            <div
              style={{
                fontSize: '24px',
                fontWeight: 750
              }}
            >
              {loraModule}
            </div>


            <div
              style={{
                marginTop: '8px',
                fontSize: '13px',
                opacity: 0.6
              }}
            >
              LoRa Transceiver Module
            </div>

          </div>


          {/* FREQUENCY */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '18px',
              padding: '14px 0'
            }}
          >

            <span
              style={{
                fontSize: '12px',
                opacity: 0.6
              }}
            >
              FREQUENCY
            </span>

            <strong>
              {loraFrequency}
            </strong>

          </div>

        </div>

      </div>


      {/* ======================================================
          DEVICE SUMMARY
      ====================================================== */}

      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          borderRadius: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >

        <Activity
          size={20}
          color={
            isConnected
              ? '#22C55E'
              : '#EF4444'
          }
        />

        <div>

          <div
            style={{
              fontSize: '13px',
              fontWeight: 700
            }}
          >
            Device Monitoring Active
          </div>

          <div
            style={{
              marginTop: '4px',
              fontSize: '11px',
              opacity: 0.55
            }}
          >
            Monitoring device status, battery,
            LoRa packets and GPS telemetry.
          </div>

        </div>

      </div>

    </div>

  );
};

export default DeviceDetails;