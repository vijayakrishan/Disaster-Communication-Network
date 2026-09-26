import React, { useState, useEffect, useCallback } from 'react';
import './UserDashboard.css';
import { useAppContext } from '../../context/AppContext';

import {
  ShieldAlert,
  MapPin,
  Battery,
  Radio,
  Clock
} from 'lucide-react';

const SOS_API = 'http://localhost:8085/api/sos';
const DEVICE_API = 'http://localhost:8082/api/devices';
const STATION_API = 'http://localhost:8084/api/stations';

const ACTIVE_STATUSES = [
  'PENDING',
  'ACCEPTED',
  'IN_PROGRESS',
  'ACTIVE'
];

const normalizeSOSStatus = (sos) =>
  String(
    sos?.rescueStatus ??
    sos?.rescue_status ??
    sos?.status ??
    ''
  )
    .trim()
    .toUpperCase();

const UserDashboard = () => {

  const {
    currentUser,
    devices = []
  } = useAppContext();

  // ============================================================
  // BASIC STATE
  // ============================================================

  const [details, setDetails] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  // ============================================================
  // DEVICE SERVICE DATA
  // ============================================================

  const [deviceData, setDeviceData] = useState(null);
  const [loadingDevice, setLoadingDevice] = useState(true);
  const [deviceError, setDeviceError] = useState('');

  // ============================================================
  // NEAREST BASE STATIONS
  // ============================================================

  const [nearestStations, setNearestStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [stationError, setStationError] = useState('');

  // ============================================================
  // CURRENT BROWSER LOCATION
  // ============================================================

  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  // ============================================================
  // SOS BACKEND STATE
  // ============================================================

  const [backendSOS, setBackendSOS] = useState(null);
  const [latestSOS, setLatestSOS] = useState(null);
  const [sosLoading, setSosLoading] = useState(false);

  // ============================================================
  // INTERNET STATUS
  // ============================================================

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined'
      ? navigator.onLine
      : true
  );

  useEffect(() => {

    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };

  }, []);

  // ============================================================
  // USER ID
  // ============================================================

  const senderUserId =
    currentUser?.id ||
    currentUser?.userId ||
    currentUser?.user_id ||
    localStorage.getItem('userId') ||
    localStorage.getItem('id') ||
    sessionStorage.getItem('userId') ||
    sessionStorage.getItem('id') ||
    null;

  const senderEmail =
    currentUser?.email ||
    currentUser?.userEmail ||
    currentUser?.user_email ||
    localStorage.getItem('email') ||
    localStorage.getItem('userEmail') ||
    sessionStorage.getItem('email') ||
    sessionStorage.getItem('userEmail') ||
    null;

  // ============================================================
  // ACTIVE SOS ID
  // ============================================================

  const storedActiveSOSId =
    localStorage.getItem('activeSOSId') ||
    sessionStorage.getItem('activeSOSId') ||
    null;

  // ============================================================
  // FIND PRIMARY DEVICE
  // ============================================================

  const myDevices = currentUser
    ? devices.filter((device) => {

        if (!device) {
          return false;
        }

        if (!currentUser?.id) {
          return true;
        }

        return (
          String(device.ownerId) ===
          String(currentUser.id)
        );

      })
    : [];

  const primaryDevice =
    myDevices.find(
      (device) =>
        String(device?.id) ===
        String(currentUser?.deviceId)
    ) ||
    myDevices[0] ||
    devices[0] ||
    null;

  // ============================================================
  // DEVICE ID
  // ============================================================

  const backendDeviceId =
    currentUser?.deviceId ||
    currentUser?.device_id ||
    primaryDevice?.deviceId ||
    primaryDevice?.id ||
    localStorage.getItem('deviceId') ||
    sessionStorage.getItem('deviceId') ||
    null;

  // ============================================================
  // USER PROFILE
  // ============================================================

  useEffect(() => {

    if (!currentUser) {
      setUserProfile(null);
      return;
    }

    setUserProfile(currentUser);

  }, [currentUser]);

  // ============================================================
  // GET DEVICE DATA
  // ============================================================

  useEffect(() => {

    if (!backendDeviceId) {

      setDeviceData(null);
      setLoadingDevice(false);

      return;
    }

    let cancelled = false;

    const fetchDeviceData = async () => {

      try {

        if (!cancelled) {
          setDeviceError('');
        }

        const response = await fetch(
          `${DEVICE_API}/${encodeURIComponent(
            backendDeviceId
          )}`
        );

        if (!response.ok) {

          throw new Error(
            `Device API returned ${response.status}`
          );

        }

        const data = await response.json();

        console.log(
          'DEVICE DATA FROM BACKEND:',
          data
        );

        if (!cancelled) {

          setDeviceData(data);
          setDeviceError('');

        }

      } catch (error) {

        console.error(
          'DEVICE SERVICE ERROR:',
          error
        );

        if (!cancelled) {

          setDeviceError(
            'Unable to load device data.'
          );

        }

      } finally {

        if (!cancelled) {
          setLoadingDevice(false);
        }

      }

    };

    setLoadingDevice(true);

    fetchDeviceData();

    const interval = setInterval(
      fetchDeviceData,
      5000
    );

    return () => {

      cancelled = true;
      clearInterval(interval);

    };

  }, [backendDeviceId]);

  // ============================================================
  // GET CURRENT BROWSER LOCATION
  // ============================================================

  useEffect(() => {

    if (!currentUser) {
      return;
    }

    if (!navigator.geolocation) {

      setLocationError(
        'Geolocation is not supported by this browser.'
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(

      (position) => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        const accuracy =
          position.coords.accuracy;

        console.log(
          'CURRENT BROWSER LOCATION:',
          {
            latitude,
            longitude,
            accuracy
          }
        );

        setCurrentLocation({
          latitude,
          longitude,
          accuracy
        });

        setLocationError('');

      },

      (error) => {

        console.error(
          'LOCATION ERROR:',
          error
        );

        let message =
          'Unable to get your current location.';

        switch (error.code) {

          case 1:
            message =
              'Location permission denied. Please allow location access.';
            break;

          case 2:
            message =
              'Current location is unavailable.';
            break;

          case 3:
            message =
              'Location request timed out. Please try again.';
            break;

          default:
            message =
              'Unable to get your current location.';

        }

        setLocationError(message);
        setCurrentLocation(null);
        setNearestStations([]);

      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }

    );

  }, [currentUser]);

  // ============================================================
  // GET NEAREST BASE STATIONS
  // ============================================================

  useEffect(() => {

    if (!currentLocation) {
      return;
    }

    if (!navigator.onLine) {

      setStationError(
        'Internet connection is required to load base stations.'
      );

      setNearestStations([]);

      return;
    }

    const fetchNearestStations = async () => {

      try {

        setLoadingStations(true);
        setStationError('');

        const response = await fetch(
          `${STATION_API}/nearest?latitude=${currentLocation.latitude}&longitude=${currentLocation.longitude}`
        );

        if (!response.ok) {

          throw new Error(
            `Base station API returned ${response.status}`
          );

        }

        const data = await response.json();

        console.log(
          'NEAREST BASE STATIONS:',
          data
        );

        setNearestStations(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(
          'BASE STATION API ERROR:',
          error
        );

        setStationError(
          'Unable to load base station data.'
        );

        setNearestStations([]);

      } finally {

        setLoadingStations(false);

      }

    };

    fetchNearestStations();

  }, [currentLocation]);

  // ============================================================
  // FETCH MY SOS
  // ============================================================

  const fetchMyActiveSOS = useCallback(async () => {

    try {

      let data = [];

      // --------------------------------------------------------
      // OPTION 1: USER ID AVAILABLE
      // --------------------------------------------------------
console.log(
  "MY SOS FROM 8085:",
  data
);
      if (senderUserId) {

        const response = await fetch(
          `${SOS_API}/user/${encodeURIComponent(
            senderUserId
          )}`
        );

        if (!response.ok) {

          throw new Error(
            `SOS user API returned ${response.status}`
          );

        }

        const result =
          await response.json();

        data =
          Array.isArray(result)
            ? result
            : [];

      }

      // --------------------------------------------------------
      // OPTION 2: NO USER ID
      // --------------------------------------------------------

      else if (storedActiveSOSId) {

        const response = await fetch(
          `${SOS_API}/${encodeURIComponent(
            storedActiveSOSId
          )}`
        );

        if (response.ok) {

          const result =
            await response.json();

          data = result
            ? [result]
            : [];

        } else if (response.status === 404) {

          localStorage.removeItem(
            'activeSOSId'
          );

          sessionStorage.removeItem(
            'activeSOSId'
          );

          setBackendSOS(null);

          return;

        }

      }

      // --------------------------------------------------------
      // NOTHING AVAILABLE
      // --------------------------------------------------------

      else {

        console.log(
          'No user ID or active SOS ID available.'
        );

        setBackendSOS(null);
        setLatestSOS(null);

        return;
      }

      console.log(
        'MY SOS FROM 8085:',
        data
      );

      // --------------------------------------------------------
      // SORT NEWEST FIRST
      // --------------------------------------------------------

      const sortedSOS =
        [...data].sort((a, b) => {

          const timeA =
            a?.createdAt
              ? new Date(
                  a.createdAt
                ).getTime()
              : 0;

          const timeB =
            b?.createdAt
              ? new Date(
                  b.createdAt
                ).getTime()
              : 0;

          return timeB - timeA;

        });

      // --------------------------------------------------------
      // LATEST SOS CONTROLS THE BUTTON
      // --------------------------------------------------------

      // Always use the newest record returned by the database/API.
      // NEVER search older records for PENDING/ACTIVE SOS.
      const latest = sortedSOS[0] || null;
      const latestStatus = normalizeSOSStatus(latest);

      console.log('LATEST SOS FOR BUTTON:', {
        id: latest?.id,
        rescueStatus: latest?.rescueStatus,
        rescue_status: latest?.rescue_status,
        status: latest?.status,
        normalizedStatus: latestStatus
      });

      setLatestSOS(latest);

      // The latest record is the only record that controls the UI.
      // COMPLETED means the user can press the button again.
      if (latest) {
        setBackendSOS(latest);

        if (ACTIVE_STATUSES.includes(latestStatus)) {
          localStorage.setItem('activeSOSId', latest.id);
          sessionStorage.setItem('activeSOSId', latest.id);
        } else {
          localStorage.removeItem('activeSOSId');
          sessionStorage.removeItem('activeSOSId');
        }
      } else {
        setBackendSOS(null);
        localStorage.removeItem('activeSOSId');
        sessionStorage.removeItem('activeSOSId');
      }

    } catch (error) {

      console.error(
        'SOS FETCH ERROR:',
        error
      );

    }

  }, [
    senderUserId,
    storedActiveSOSId
  ]);

  // ============================================================
  // LOAD SOS + POLL EVERY 3 SECONDS
  // ============================================================

  useEffect(() => {

    if (!currentUser) {
      return;
    }

    fetchMyActiveSOS();

    const interval =
      setInterval(
        fetchMyActiveSOS,
        3000
      );

    return () => {
      clearInterval(interval);
    };

  }, [
    currentUser,
    fetchMyActiveSOS
  ]);

  // ============================================================
  // SOS STATUS FOR UI
  // ============================================================

  const currentSOSStatus = normalizeSOSStatus(backendSOS);

  const isRescueActive =
    ACTIVE_STATUSES.includes(currentSOSStatus);

  // Active means the latest DB status is one of the blocking states.
  const activeSOS =
    isRescueActive
      ? backendSOS
      : null;

  const completedSOS =
    backendSOS &&
    currentSOSStatus === 'COMPLETED'
      ? backendSOS
      : null;

  // Button/status classes and labels are driven ONLY by DB status.
  const getSOSButtonClass = () => {
    switch (currentSOSStatus) {
      case 'PENDING':
        return 'sos-status-pending';
      case 'ACCEPTED':
        return 'sos-status-accepted';
      case 'IN_PROGRESS':
        return 'sos-status-in-progress';
      case 'ACTIVE':
        return 'sos-status-active';
      case 'COMPLETED':
        return 'sos-status-completed';
      default:
        return 'pulsing-blue';
    }
  };

  const getSOSButtonText = () => {
    if (sosLoading) return 'SENDING...';

    switch (currentSOSStatus) {
      case 'PENDING':
        return 'SOS PENDING';
      case 'ACCEPTED':
        return 'SOS ACCEPTED';
      case 'IN_PROGRESS':
        return 'SOS IN PROGRESS';
      case 'ACTIVE':
        return 'SOS ACTIVE';
      case 'COMPLETED':
        return 'SOS COMPLETED';
      default:
        return !isOnline
          ? 'USE DEVICE SOS'
          : 'SEND SOS';
    }
  };

  const isSOSButtonDisabled =
    sosLoading ||
    isRescueActive ||
    !isOnline;

  // ============================================================
  // SEND WEB SOS
  // ============================================================

  const handleSOS = async () => {

    // ----------------------------------------------------------
    // ALREADY ACTIVE
    // ----------------------------------------------------------

    if (activeSOS) {

      console.log(
        'SOS already active:',
        activeSOS
      );

      return;
    }

    // ----------------------------------------------------------
    // INTERNET REQUIRED
    // ----------------------------------------------------------

    if (!isOnline) {

      alert(
        'Internet unavailable. Please press the physical SOS button on your device.'
      );

      return;
    }

    // ----------------------------------------------------------
    // VICTIM NAME
    // ----------------------------------------------------------

    const victimName =
      currentUser?.fullName ||
      currentUser?.name ||
      currentUser?.username ||
      localStorage.getItem('name') ||
      'Unknown User';

    // ----------------------------------------------------------
    // VICTIM CONTACT
    // ----------------------------------------------------------

    const victimContact =
      currentUser?.phone ||
      currentUser?.mobile ||
      currentUser?.contact ||
      localStorage.getItem('phone') ||
      '';

    // ----------------------------------------------------------
    // GET LOCATION
    // ----------------------------------------------------------

    let latitude =
      currentLocation?.latitude ?? null;

    let longitude =
      currentLocation?.longitude ?? null;

    if (
      latitude === null ||
      longitude === null
    ) {

      try {

        if (!navigator.geolocation) {

          throw new Error(
            'Geolocation is not supported.'
          );

        }

        const position =
          await new Promise(
            (resolve, reject) => {

              navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 0
                }
              );

            }
          );

        latitude =
          position.coords.latitude;

        longitude =
          position.coords.longitude;

        setCurrentLocation({
          latitude,
          longitude,
          accuracy:
            position.coords.accuracy
        });

      } catch (locationError) {

        console.error(
          'SOS GPS ERROR:',
          locationError
        );

        alert(
          'Location is required to send SOS. Please allow browser location access and try again.'
        );

        return;
      }
    }

    // ----------------------------------------------------------
    // GPS VALIDATION
    // ----------------------------------------------------------

    if (
      latitude === null ||
      longitude === null ||
      Number.isNaN(
        Number(latitude)
      ) ||
      Number.isNaN(
        Number(longitude)
      )
    ) {

      alert(
        'Unable to get your location. SOS cannot be sent without location.'
      );

      return;
    }

    try {

      setSosLoading(true);

      // --------------------------------------------------------
      // CORRECT SOS PAYLOAD
      // --------------------------------------------------------

      const payload = {

        senderUserId:
          senderUserId || null,

        senderEmail:
          senderEmail || null,

        deviceId:
          backendDeviceId || null,

        victimName:
          victimName,

        victimContact:
          victimContact,

        latitude:
          Number(latitude),

        longitude:
          Number(longitude),

        priority:
          'HIGH',

        emergencyDetails:
          details?.trim() ||
          'Emergency rescue assistance required.',

        status:
          'PENDING'

      };

      console.log(
        'NEW SOS PAYLOAD:',
        payload
      );

      // --------------------------------------------------------
      // POST 8085
      // --------------------------------------------------------

      const response =
        await fetch(
          SOS_API,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Accept:
                'application/json'
            },

            body:
              JSON.stringify(payload)
          }
        );

      const responseText =
        await response.text();

      console.log(
        'SOS HTTP STATUS:',
        response.status
      );

      console.log(
        'SOS RESPONSE:',
        responseText
      );

      // --------------------------------------------------------
      // BACKEND ERROR
      // --------------------------------------------------------

      if (!response.ok) {

        throw new Error(
          responseText ||
          `SOS API returned ${response.status}`
        );

      }

      // --------------------------------------------------------
      // PARSE RESPONSE
      // --------------------------------------------------------

      let createdSOS = null;

      try {

        createdSOS =
          responseText
            ? JSON.parse(
                responseText
              )
            : null;

      } catch {

        throw new Error(
          'Backend returned an invalid SOS response.'
        );

      }

      // --------------------------------------------------------
      // ID REQUIRED
      // --------------------------------------------------------

      if (!createdSOS?.id) {

        throw new Error(
          'SOS created but backend did not return SOS ID.'
        );

      }

      console.log(
        'SOS CREATED SUCCESSFULLY:',
        createdSOS
      );

      // --------------------------------------------------------
      // SAVE ACTIVE SOS ID
      // --------------------------------------------------------

      localStorage.setItem(
        'activeSOSId',
        createdSOS.id
      );

      sessionStorage.setItem(
        'activeSOSId',
        createdSOS.id
      );

      // --------------------------------------------------------
      // IMMEDIATELY MAKE RED
      // --------------------------------------------------------

      setBackendSOS(
        createdSOS
      );

      setLatestSOS(
        createdSOS
      );

      setDetails('');

    } catch (error) {

      console.error(
        'WEB SOS ERROR:',
        error
      );

      alert(
        error?.message ||
        'Unable to send SOS. Please try again.'
      );

    } finally {

      setSosLoading(false);

    }
  };

  // ============================================================
  // STATION BADGE
  // ============================================================

  const getStationBadgeClass =
    (status) => {

      switch (status) {

        case 'ONLINE':
          return 'badge-online';

        case 'DEGRADED':
          return 'badge-warning';

        case 'OFFLINE':
          return 'badge-offline';

        default:
          return 'badge-info';

      }

    };

  // ============================================================
  // USER NAME
  // ============================================================

  const displayName =
    currentUser?.fullName ||
    currentUser?.name ||
    currentUser?.username ||
    'User';

  // ============================================================
  // DEVICE DATA
  // ============================================================

  const battery =
    deviceData?.battery !== null &&
    deviceData?.battery !== undefined
      ? Number(deviceData.battery)
      : null;

  const deviceStatus =
    String(
      deviceData?.status ||
      'OFFLINE'
    ).toUpperCase();

  const deviceId =
    deviceData?.deviceId ||
    backendDeviceId ||
    'N/A';

  const lastUpdated =
    deviceData?.lastUpdated ||
    deviceData?.updatedAt ||
    deviceData?.lastSeen ||
    null;

  const formattedLastUpdated =
    lastUpdated
      ? new Date(
          lastUpdated
        ).toLocaleString(
          undefined,
          {
            dateStyle: 'medium',
            timeStyle: 'short'
          }
        )
      : 'Waiting for telemetry';

  const deviceIsOnline =
    deviceStatus === 'ONLINE' ||
    deviceStatus === 'ACTIVE';

  const gpsStatus =
    deviceData?.gpsStatus ||
    'OFF';

  const gpsPrecision =
    deviceData?.gpsPrecision;

  const rssi =
    deviceData?.rssi;

  const snr =
    deviceData?.snr;

  // ============================================================
  // GPS DISPLAY
  // ============================================================

  const getGpsDisplay = () => {

    if (gpsStatus === 'LOCKED') {

      return {
        icon: '📍',
        text: 'LOCKED',
        description:
          gpsPrecision !== null &&
          gpsPrecision !== undefined
            ? `Location acquired • Accuracy: ${gpsPrecision} m`
            : 'Location acquired'
      };

    }

    if (gpsStatus === 'SEARCHING') {

      return {
        icon: '🟡',
        text: 'SEARCHING',
        description:
          'Waiting for location fix'
      };

    }

    return {
      icon: '🔴',
      text: 'OFF',
      description:
        'GPS module unavailable'
    };

  };

  const gpsDisplay =
    getGpsDisplay();

  // ============================================================
  // NO USER
  // ============================================================

  if (!currentUser) {
    return null;
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div className="dashboard-page">

      {/* ======================================================
          WELCOME
          ====================================================== */}

      <div className="welcome-banner glass-panel">

        <div className="welcome-left">

          <h2>
            Welcome, {displayName} 👋
          </h2>

          <p className="welcome-status">

            <span
              className={`status-dot ${
                deviceIsOnline
                  ? 'online'
                  : 'offline'
              }`}
            />

            {deviceIsOnline
              ? 'Device Linked / Online'
              : 'Device Offline'}

          </p>

        </div>

        <div className="welcome-right font-mono">

          <span className="current-date">

            {new Date().toLocaleDateString(
              undefined,
              {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }
            )}

          </span>

        </div>

      </div>

      {/* ======================================================
          SOS CONTROLLER
          ====================================================== */}

      <div className="centered-layout-wrapper">

        <div
          className={`glass-panel sos-panel ${
            currentSOSStatus === 'PENDING'
              ? 'sos-pending-panel'
              : currentSOSStatus === 'ACCEPTED'
              ? 'sos-accepted-panel'
              : currentSOSStatus === 'IN_PROGRESS'
              ? 'sos-in-progress-panel'
              : currentSOSStatus === 'ACTIVE'
              ? 'sos-active-panel'
              : currentSOSStatus === 'COMPLETED'
              ? 'sos-completed-panel'
              : 'sos-idle-panel'
          }`}
        >

          <div className="panel-header">

            <ShieldAlert
              size={22}
              className={
                currentSOSStatus === 'PENDING'
                  ? 'sos-icon-pending'
                  : currentSOSStatus === 'ACCEPTED'
                  ? 'sos-icon-accepted'
                  : currentSOSStatus === 'IN_PROGRESS'
                  ? 'sos-icon-in-progress'
                  : currentSOSStatus === 'ACTIVE'
                  ? 'sos-icon-active'
                  : currentSOSStatus === 'COMPLETED'
                  ? 'sos-icon-completed'
                  : 'sos-icon-idle'
              }
            />

            <h3>
              EMERGENCY SOS BEACON
            </h3>

          </div>

          <div className="sos-action-area">

            {/* =================================================
                SOS BUTTON
                ================================================= */}

            <button
              onClick={handleSOS}

              disabled={isSOSButtonDisabled}

              title={
                !isOnline
                  ? 'Internet unavailable. Use physical SOS button.'
                  : isRescueActive
                  ? `SOS status: ${currentSOSStatus}`
                  : currentSOSStatus === 'COMPLETED'
                  ? 'Rescue completed. Click to send a new SOS.'
                  : 'Send emergency SOS'
              }

              className={`sos-trigger-btn ${
                getSOSButtonClass()
              }`}
            >

              <div className="sos-inner-btn">

                <ShieldAlert
                  size={44}
                />

                <span className="sos-btn-text">

                  {getSOSButtonText()}

                </span>

              </div>

            </button>

            {/* =================================================
                STATUS
                ================================================= */}

            <p
              className={`sos-helper-text ${
                currentSOSStatus
                  ? `sos-text-${currentSOSStatus.toLowerCase()}`
                  : ''
              }`}
            >

              {currentSOSStatus === 'PENDING'
                ? 'SOS SENT. Waiting for a rescue worker to accept your emergency.'
                : currentSOSStatus === 'ACCEPTED'
                ? 'SOS ACCEPTED. A rescue worker has accepted your emergency.'
                : currentSOSStatus === 'IN_PROGRESS'
                ? 'RESCUE IN PROGRESS. The rescue team is responding to your emergency.'
                : currentSOSStatus === 'ACTIVE'
                ? 'RESCUE ACTIVE. Rescuers are responding to your emergency.'
                : currentSOSStatus === 'COMPLETED'
                ? 'RESCUE COMPLETED. Press the button to send a new SOS.'
                : isOnline
                ? 'Click to broadcast an emergency request over the internet.'
                : 'Internet unavailable. Press the physical SOS button on your device.'}

            </p>

          </div>

          {/* ==================================================
              MEDICAL NOTES
              ================================================== */}

          {!activeSOS && (

            <div className="input-group">

              <span className="input-label">
                Emergency Medical Notes (Optional)
              </span>

              <textarea
                placeholder="Describe injuries, weather condition, food/water resources..."
                value={details}
                onChange={(e) =>
                  setDetails(
                    e.target.value
                  )
                }
                className="input-control text-area-custom"
                rows={3}
              />

            </div>

          )}

          {/* ==================================================
              ACTIVE SOS DETAILS
              ================================================== */}

          {backendSOS && currentSOSStatus && (

            <div className="active-sos-stats">

              <div className="sos-stat-pill">

                <MapPin size={14} />

                <span>

                  {backendSOS.latitude !== null &&
                  backendSOS.latitude !== undefined &&
                  backendSOS.longitude !== null &&
                  backendSOS.longitude !== undefined

                    ? `${Number(
                        backendSOS.latitude
                      ).toFixed(5)}, ${Number(
                        backendSOS.longitude
                      ).toFixed(5)}`

                    : 'Location unavailable'}

                </span>

              </div>

              <div className="sos-stat-pill">

                <Clock size={14} />

                <span>

                  Triggered:{' '}

                  {backendSOS.createdAt

                    ? new Date(
                        backendSOS.createdAt
                      ).toLocaleTimeString()

                    : 'N/A'}

                </span>

              </div>

              <div className="sos-stat-pill">

                <ShieldAlert size={14} />

                <span>

                  Priority:{' '}

                  {backendSOS.priority ||
                    'HIGH'}

                </span>

              </div>

              <div className="sos-stat-pill">

                <Radio size={14} />

                <span>

                  Status:{' '}

                  {currentSOSStatus ||
                    'PENDING'}

                </span>

              </div>

            </div>

          )}

        </div>

      </div>

      {/* ======================================================
          DEVICE SUMMARY
          ====================================================== */}

      <div className="summary-section">

        <h3 className="section-title">
          DEVICE SUMMARY
        </h3>

        <div className="summary-grid">

          <div className="stat-card glass-panel">

            <div className="stat-card-header">

              <span className="stat-label">
                BATTERY LEVEL
              </span>

              <Battery
                size={16}
                color="var(--accent-glow)"
              />

            </div>

            <div className="stat-val font-bold">

              {loadingDevice
                ? 'Loading...'
                : deviceError
                ? '--'
                : battery !== null
                ? `🔋 ${battery}%`
                : 'N/A'}

            </div>

            <div className="stat-subtext">

              {loadingDevice
                ? 'Loading device telemetry...'
                : deviceError
                ? 'Device data unavailable'
                : `Last updated: ${formattedLastUpdated}`}

            </div>

          </div>

          <div className="stat-card glass-panel">

            <div className="stat-card-header">

              <span className="stat-label">
                GPS STATUS
              </span>

              <MapPin
                size={16}
                color="var(--accent-glow)"
              />

            </div>

            <div className="stat-val font-bold">

              {loadingDevice
                ? 'Loading...'
                : deviceError
                ? '🔴 OFF'
                : `${gpsDisplay.icon} ${gpsDisplay.text}`}

            </div>

            <div className="stat-subtext">

              {loadingDevice
                ? 'Loading hardware GPS status...'
                : deviceError
                ? 'Device data unavailable'
                : gpsDisplay.description}

            </div>

          </div>

          <div className="stat-card glass-panel">

            <div className="stat-card-header">

              <span className="stat-label">
                CONNECTION STATUS
              </span>

              <Radio
                size={16}
                color={
                  deviceIsOnline
                    ? '#22C55E'
                    : '#EF4444'
                }
              />

            </div>

            <div className="stat-val font-bold">

              <span
                className={`device-status-dot ${
                  deviceIsOnline
                    ? 'online'
                    : 'offline'
                }`}
              />

              {deviceIsOnline
                ? 'ONLINE'
                : 'OFFLINE'}

            </div>

            <div className="stat-subtext">

              {deviceIsOnline
                ? 'Device connected via Wi-Fi'
                : 'Device not connected / no heartbeat'}

            </div>

          </div>

          <div className="stat-card glass-panel">

            <div className="stat-card-header">

              <span className="stat-label">
                DEVICE ID
              </span>

              <Radio
                size={16}
                color="var(--accent-glow)"
              />

            </div>

            <div className="stat-val font-mono font-bold">

              {loadingDevice
                ? 'Loading...'
                : deviceId}

            </div>

            <div className="stat-subtext">

              LoRa mesh registered •{' '}
              {formattedLastUpdated}

            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          DEVICE TELEMETRY
          ====================================================== */}

      {deviceData && (

        <div
          className="glass-panel"
          style={{
            marginTop: '20px',
            padding: '20px'
          }}
        >

          <div className="panel-header">

            <Radio
              size={20}
              color="var(--accent-glow)"
            />

            <h3>
              DEVICE TELEMETRY
            </h3>

          </div>

          <div
            className="summary-grid"
            style={{
              marginTop: '15px'
            }}
          >

            <div className="stat-card">

              <div className="stat-label">
                RSSI
              </div>

              <div className="stat-val font-mono">

                {rssi !== null &&
                rssi !== undefined
                  ? `${rssi} dBm`
                  : 'N/A'}

              </div>

            </div>

            <div className="stat-card">

              <div className="stat-label">
                SNR
              </div>

              <div className="stat-val font-mono">

                {snr !== null &&
                snr !== undefined
                  ? `${snr} dB`
                  : 'N/A'}

              </div>

            </div>

            <div className="stat-card">

              <div className="stat-label">
                GPS PRECISION
              </div>

              <div className="stat-val font-mono">

                {gpsPrecision !== null &&
                gpsPrecision !== undefined
                  ? `${gpsPrecision} m`
                  : 'N/A'}

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ======================================================
          NEAREST BASE STATIONS
          ====================================================== */}

      <div className="glass-panel stations-section">

        <div className="panel-header flex-between">

          <div className="flex-align">

            <Radio
              size={20}
              color="var(--accent-glow)"
            />

            <h3>
              NEAREST BASE STATIONS
            </h3>

          </div>

        </div>

        <div className="stations-grid">

          {locationError && (

            <div className="station-card glass-panel">

              <div className="station-specs">

                <span className="spec-label">
                  {locationError}
                </span>

              </div>

            </div>

          )}

          {!locationError &&
          !currentLocation && (

            <div className="station-card glass-panel">

              <div className="station-specs">

                <span className="spec-label">
                  Getting your current location...
                </span>

              </div>

            </div>

          )}

          {!locationError &&
          currentLocation &&
          loadingStations && (

            <div className="station-card glass-panel">

              <div className="station-specs">

                <span className="spec-label">
                  Finding nearest base stations...
                </span>

              </div>

            </div>

          )}

          {!locationError &&
          currentLocation &&
          !loadingStations &&
          stationError && (

            <div className="station-card glass-panel">

              <div className="station-specs">

                <span className="spec-label">
                  {stationError}
                </span>

              </div>

            </div>

          )}

          {!locationError &&
          currentLocation &&
          !loadingStations &&
          !stationError &&
          nearestStations.length === 0 && (

            <div className="station-card glass-panel">

              <div className="station-specs">

                <span className="spec-label">
                  No base stations available
                </span>

              </div>

            </div>

          )}

          {!locationError &&
          currentLocation &&
          !loadingStations &&
          !stationError &&
          nearestStations.length > 0 &&

          nearestStations
            .slice(0, 3)
            .map((station) => {

              const status =
                station.status ||
                'OFFLINE';

              const distance =
                Number(
                  station.distance
                );

              const signalStrength =
                Number(
                  station.signalStrength
                );

              const signalQuality =
                Number(
                  station.signalQuality
                );

              return (

                <div
                  key={
                    station.stationId
                  }
                  className="station-card glass-panel glass-panel-hover"
                >

                  <div className="station-card-header flex-between">

                    <div className="flex-align">

                      <Radio
                        size={16}
                        color="var(--accent-glow)"
                      />

                      <h4>
                        {station.stationName}
                      </h4>

                    </div>

                    <span
                      className={`badge ${getStationBadgeClass(
                        status
                      )}`}
                    >
                      {status}
                    </span>

                  </div>

                  <div className="station-specs">

                    <div className="spec-row">

                      <span className="spec-label">
                        Distance
                      </span>

                      <span className="spec-val highlight-blue">

                        {!Number.isNaN(
                          distance
                        ) && distance < 1

                          ? `${Math.round(
                              distance * 1000
                            )} m`

                          : !Number.isNaN(
                              distance
                            )

                          ? `${distance.toFixed(
                              1
                            )} km`

                          : 'N/A'}

                      </span>

                    </div>

                    <div className="spec-row">

                      <span className="spec-label">
                        Signal Strength
                      </span>

                      <span className="spec-val font-mono">

                        {!Number.isNaN(
                          signalQuality
                        )
                          ? `${signalQuality}%`
                          : 'N/A'}

                        {' '}

                        {!Number.isNaN(
                          signalStrength
                        )
                          ? `(${signalStrength} dBm)`
                          : ''}

                      </span>

                    </div>

                    <div className="spec-row">

                      <span className="spec-label">
                        Station ID
                      </span>

                      <span className="spec-val font-mono">
                        {station.stationId}
                      </span>

                    </div>

                  </div>

                </div>

              );

            })}

        </div>

      </div>

    </div>

  );

};

export default UserDashboard;