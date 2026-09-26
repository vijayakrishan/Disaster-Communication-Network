import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from 'react';

const AppContext = createContext();

const AUTH_API = 'http://localhost:8081';
const RESCUE_API = 'http://localhost:8086';
const DEVICE_API = 'http://localhost:8082';
const SOS_API = 'http://localhost:8085';

export const AppProvider = ({ children }) => {

  // ============================================================
  // AUTH / CURRENT USER
  // ============================================================

  const [currentUser, setCurrentUser] = useState(null);


  // ============================================================
  // USER DEVICES
  // ============================================================

  const [devices, setDevices] = useState([]);


  // ============================================================
  // RESCUE / WORKER DATA
  // ============================================================

  const [alerts, setAlerts] = useState([]);

  const [teams, setTeams] = useState([]);

  const [relays, setRelays] = useState([]);

  const [relayMetrics, setRelayMetrics] = useState({
    onlineRelays: 0,
    offlineRelays: 0,
    averageRssi: 0,
    averageBattery: 0,
    averageSnr: 0,
    totalPackets: 0,
    coverageArea: 0
  });

  const [workerMessages, setWorkerMessages] = useState([]);


  // ============================================================
  // CURRENT RESCUE / CURRENT MISSION
  // ============================================================

  const [currentRescue, setCurrentRescue] = useState(null);


  // ============================================================
  // DASHBOARD SUMMARY
  // ============================================================

  const [dashboardSummary, setDashboardSummary] = useState({
    availableTeams: 0,
    activeSOS: 0,
    teamsOnRescue: 0,
    networkHealth: 'Loading...'
  });


  // ============================================================
  // LOADING / ERROR
  // ============================================================

  const [loadingRescueData, setLoadingRescueData] =
    useState(false);

  const [rescueError, setRescueError] =
    useState('');


  // ============================================================
  // NORMALIZE ROLE
  // ============================================================

  const role = String(
    currentUser?.role || ''
  )
    .trim()
    .toUpperCase();


  // ============================================================
  // GET USER ID
  // ============================================================

  const getUserId = useCallback(() => {

    return (
      currentUser?.id ||
      currentUser?.userId ||
      currentUser?.user_id ||
      localStorage.getItem('userId') ||
      localStorage.getItem('id') ||
      sessionStorage.getItem('userId') ||
      sessionStorage.getItem('id') ||
      null
    );

  }, [
    currentUser
  ]);


  // ============================================================
  // LOAD USER FROM STORAGE
  // ============================================================

  useEffect(() => {

    const storedUser =
      localStorage.getItem('user') ||
      sessionStorage.getItem('user');


    const storedUserId =
      localStorage.getItem('userId') ||
      localStorage.getItem('id') ||
      sessionStorage.getItem('userId') ||
      sessionStorage.getItem('id') ||
      null;


    if (storedUser) {

      try {

        const parsedUser =
          JSON.parse(storedUser);


        // --------------------------------------------------------
        // IMPORTANT
        // Existing stored user may not contain ID.
        // Merge ID from separate storage if available.
        // --------------------------------------------------------

        const normalizedUser = {

          ...parsedUser,

          id:
            parsedUser?.id ||
            parsedUser?.userId ||
            parsedUser?.user_id ||
            storedUserId ||
            null,

          userId:
            parsedUser?.userId ||
            parsedUser?.id ||
            parsedUser?.user_id ||
            storedUserId ||
            null

        };


        console.log(
          'CURRENT USER FROM STORAGE:',
          normalizedUser
        );


        setCurrentUser(
          normalizedUser
        );


        return;

      } catch (error) {

        console.error(
          'Invalid stored user:',
          error
        );

        localStorage.removeItem('user');
        sessionStorage.removeItem('user');

        setCurrentUser(null);
      }
    }


    // ==========================================================
    // FALLBACK STORAGE
    // ==========================================================

    const email =
      localStorage.getItem('email') ||
      sessionStorage.getItem('email');

    const storedRole =
      localStorage.getItem('role') ||
      sessionStorage.getItem('role');

    const teamId =
      localStorage.getItem('teamId') ||
      sessionStorage.getItem('teamId');

    const teamName =
      localStorage.getItem('teamName') ||
      sessionStorage.getItem('teamName');

    const workerId =
      localStorage.getItem('workerId') ||
      sessionStorage.getItem('workerId');

    const deviceId =
      localStorage.getItem('deviceId') ||
      sessionStorage.getItem('deviceId');


    if (email) {

      const fallbackUser = {

        id: storedUserId,

        userId: storedUserId,

        email,

        role: storedRole,

        teamId,

        teamName,

        workerId,

        deviceId,

        name:
          email.split('@')[0]
      };


      console.log(
        'CURRENT USER FROM FALLBACK STORAGE:',
        fallbackUser
      );


      setCurrentUser(
        fallbackUser
      );
    }

  }, []);


  // ============================================================
  // LOGIN
  // ============================================================

  const login = (
    role,
    name,
    userData = null
  ) => {

    const userId =
      userData?.id ||
      userData?.userId ||
      userData?.user_id ||
      null;


    const user = {

      ...(userData || {}),

      id:
        userId,

      userId:
        userId,

      role,

      name:
        userData?.name ||
        name
    };


    console.log(
      'LOGIN USER:',
      user
    );


    setCurrentUser(user);


    // ==========================================================
    // SAVE USER
    // ==========================================================

    try {

      localStorage.setItem(
        'user',
        JSON.stringify(user)
      );


      if (userId) {

        localStorage.setItem(
          'userId',
          String(userId)
        );

        localStorage.setItem(
          'id',
          String(userId)
        );
      }


      if (user.email) {

        localStorage.setItem(
          'email',
          user.email
        );
      }


      if (user.role) {

        localStorage.setItem(
          'role',
          user.role
        );
      }


      if (user.teamId) {

        localStorage.setItem(
          'teamId',
          user.teamId
        );
      }


      if (user.teamName) {

        localStorage.setItem(
          'teamName',
          user.teamName
        );
      }


      if (user.workerId) {

        localStorage.setItem(
          'workerId',
          user.workerId
        );
      }


      if (user.deviceId) {

        localStorage.setItem(
          'deviceId',
          user.deviceId
        );
      }

    } catch (error) {

      console.error(
        'Unable to save user:',
        error
      );
    }
  };


  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = () => {

    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('id');
    localStorage.removeItem('teamId');
    localStorage.removeItem('teamName');
    localStorage.removeItem('workerId');
    localStorage.removeItem('deviceId');
    localStorage.removeItem('activeSOSId');

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('id');
    sessionStorage.removeItem('teamId');
    sessionStorage.removeItem('teamName');
    sessionStorage.removeItem('workerId');
    sessionStorage.removeItem('deviceId');


    setCurrentUser(null);

    setDevices([]);

    setAlerts([]);

    setTeams([]);

    setRelays([]);

    setWorkerMessages([]);

    setCurrentRescue(null);

    setDashboardSummary({
      availableTeams: 0,
      activeSOS: 0,
      teamsOnRescue: 0,
      networkHealth: 'Loading...'
    });

    setRescueError('');
  };


  // ============================================================
  // USER DEVICE SERVICE
  // ============================================================

  const fetchDevices = useCallback(async () => {

    if (role !== 'USER') {

      setDevices([]);

      return;
    }


    const deviceId =
      currentUser?.deviceId ||
      currentUser?.device_id ||
      localStorage.getItem('deviceId') ||
      sessionStorage.getItem('deviceId');


    if (!deviceId) {

      console.warn(
        'No deviceId found for current USER.'
      );

      setDevices([]);

      return;
    }


    try {

      console.log(
        'FETCHING USER DEVICE:',
        deviceId
      );


      const response = await fetch(
        `${DEVICE_API}/api/devices/${encodeURIComponent(
          deviceId
        )}`
      );


      if (!response.ok) {

        throw new Error(
          `Device API returned ${response.status}`
        );
      }


      const data =
        await response.json();


      console.log(
        'DEVICE DATA FROM DATABASE:',
        data
      );


      const device = {

        ...data,

        id:
          data?.id ||
          data?.deviceId ||
          deviceId,

        deviceId:
          data?.deviceId ||
          data?.id ||
          deviceId,

        ownerId:
          data?.ownerId ||
          currentUser?.id
      };


      setDevices([device]);


    } catch (error) {

      console.error(
        'DEVICE FETCH ERROR:',
        error
      );

      setDevices([]);
    }

  }, [
    role,
    currentUser?.deviceId,
    currentUser?.device_id,
    currentUser?.id
  ]);


  // ============================================================
  // LOAD USER DEVICE ONLY FOR USER
  // ============================================================

  useEffect(() => {

    if (!currentUser) {

      setDevices([]);

      return;
    }


    if (role !== 'USER') {

      setDevices([]);

      return;
    }


    fetchDevices();

  }, [
    currentUser,
    role,
    fetchDevices
  ]);


  // ============================================================
  // USER SOS
  // ============================================================


  // ============================================================
  // FETCH USER SOS
  // ============================================================

  const fetchUserSOS = useCallback(async () => {

    if (role !== 'USER') {

      return;
    }


    const userId =
      currentUser?.id ||
      currentUser?.userId ||
      currentUser?.user_id ||
      localStorage.getItem('userId') ||
      localStorage.getItem('id') ||
      sessionStorage.getItem('userId') ||
      sessionStorage.getItem('id');


    const activeSOSId =
      localStorage.getItem('activeSOSId');


    try {

      // --------------------------------------------------------
      // 1. If user ID exists, get SOS history from 8085
      // --------------------------------------------------------

      if (userId) {

        const response = await fetch(
          `${SOS_API}/api/sos/user/${encodeURIComponent(
            userId
          )}`
        );


        if (!response.ok) {

          throw new Error(
            `User SOS API returned ${response.status}`
          );
        }


        const data =
          await response.json();


        console.log(
          'USER SOS FROM 8085 DATABASE:',
          data
        );


        const sosList =
          Array.isArray(data)
            ? data
            : [];


        setAlerts(
          sosList
        );


        // ------------------------------------------------------
        // Check active SOS
        // ------------------------------------------------------

        const activeSOS =
          sosList.find(
            (sos) => {

              const status =
                String(
                  sos?.status || ''
                ).toUpperCase();

              return (
                status === 'PENDING' ||
                status === 'ACTIVE' ||
                status === 'ACCEPTED' ||
                status === 'IN_PROGRESS'
              );
            }
          );


        if (activeSOS?.id) {

          localStorage.setItem(
            'activeSOSId',
            activeSOS.id
          );

        } else {

          localStorage.removeItem(
            'activeSOSId'
          );
        }


        return;
      }


      // --------------------------------------------------------
      // 2. No user ID
      // --------------------------------------------------------
      // We do NOT block SOS.
      // Try to recover currently active SOS using saved ID.
      // --------------------------------------------------------

      if (activeSOSId) {

        const response =
          await fetch(
            `${SOS_API}/api/sos/${encodeURIComponent(
              activeSOSId
            )}`
          );


        if (
          response.ok
        ) {

          const sos =
            await response.json();


          setAlerts(
            sos
              ? [sos]
              : []
          );


          const status =
            String(
              sos?.status || ''
            ).toUpperCase();


          if (
            status === 'COMPLETED' ||
            status === 'CANCELLED'
          ) {

            localStorage.removeItem(
              'activeSOSId'
            );
          }


          return;
        }
      }


      console.warn(
        'No userId available for SOS history.'
      );


    } catch (error) {

      console.error(
        'USER SOS FETCH ERROR:',
        error
      );

      // Do not destroy previous data
    }

  }, [
    role,
    currentUser?.id,
    currentUser?.userId,
    currentUser?.user_id
  ]);


  // ============================================================
  // TRIGGER SOS
  // ============================================================

  const triggerSOS = async (payload) => {

    if (role !== 'USER') {

      throw new Error(
        'Only USER can trigger SOS.'
      );
    }


    // ----------------------------------------------------------
    // USER ID IS OPTIONAL IN DATABASE
    // ----------------------------------------------------------

    const userId =
      currentUser?.id ||
      currentUser?.userId ||
      currentUser?.user_id ||
      localStorage.getItem('userId') ||
      localStorage.getItem('id') ||
      sessionStorage.getItem('userId') ||
      sessionStorage.getItem('id') ||
      null;


    // ----------------------------------------------------------
    // LOCATION IS REQUIRED
    // ----------------------------------------------------------

    const latitude =
      payload?.latitude;

    const longitude =
      payload?.longitude;


    if (
      latitude == null ||
      longitude == null ||
      Number.isNaN(Number(latitude)) ||
      Number.isNaN(Number(longitude))
    ) {

      throw new Error(
        'Location is required to send SOS. Please enable GPS/location access.'
      );
    }


    // ----------------------------------------------------------
    // DEVICE ID
    // ----------------------------------------------------------

    const deviceId =
      payload?.deviceId ||
      currentUser?.deviceId ||
      currentUser?.device_id ||
      localStorage.getItem('deviceId') ||
      sessionStorage.getItem('deviceId') ||
      null;


    // ----------------------------------------------------------
    // VICTIM NAME
    // ----------------------------------------------------------

    const victimName =
      payload?.victimName ||
      currentUser?.fullName ||
      currentUser?.name ||
      currentUser?.username ||
      currentUser?.email?.split('@')[0] ||
      'Unknown User';


    // ----------------------------------------------------------
    // CONTACT
    // ----------------------------------------------------------

    const victimContact =
      payload?.victimContact ||
      currentUser?.phone ||
      currentUser?.mobile ||
      currentUser?.contact ||
      '';


    // ----------------------------------------------------------
    // NEW SOS PAYLOAD
    // Matches sos_alerts database
    // ----------------------------------------------------------

    const sosPayload = {

      senderUserId:
        userId,

      deviceId:
        deviceId,

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
        payload?.message ||
        payload?.emergencyDetails ||
        'Emergency rescue assistance required.',

      status:
        'PENDING'
    };


    console.log(
      'SENDING SOS TO 8085:',
      sosPayload
    );


    // ----------------------------------------------------------
    // SEND TO SOS SERVICE
    // ----------------------------------------------------------

    const controller =
      new AbortController();


    const timeout =
      setTimeout(() => {

        controller.abort();

      }, 20000);


    let response;


    try {

      response =
        await fetch(
          `${SOS_API}/api/sos`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Accept:
                'application/json'
            },

            body:
              JSON.stringify(
                sosPayload
              ),

            signal:
              controller.signal
          }
        );

    } catch (error) {

      if (
        error?.name === 'AbortError'
      ) {

        throw new Error(
          'SOS request timed out. Check whether SOS backend service is running on port 8085.'
        );
      }


      throw new Error(
        `Unable to connect to SOS service: ${error.message}`
      );

    } finally {

      clearTimeout(timeout);
    }


    // ----------------------------------------------------------
    // READ RESPONSE
    // ----------------------------------------------------------

    const responseText =
      await response.text();


    console.log(
      'SOS API RESPONSE:',
      response.status,
      responseText
    );


    if (!response.ok) {

      throw new Error(
        responseText ||
        `SOS API returned ${response.status}`
      );
    }


    let result = null;


    try {

      result =
        responseText
          ? JSON.parse(responseText)
          : null;

    } catch {

      result = null;
    }


    // ----------------------------------------------------------
    // DATABASE ID REQUIRED
    // ----------------------------------------------------------

    if (!result?.id) {

      throw new Error(
        'SOS was sent but backend did not return SOS ID.'
      );
    }


    // ----------------------------------------------------------
    // SAVE ACTIVE SOS ID
    // ----------------------------------------------------------

    localStorage.setItem(
      'activeSOSId',
      result.id
    );


    // ----------------------------------------------------------
    // IMMEDIATELY UPDATE UI
    // ----------------------------------------------------------

    setAlerts(
      previous => {

        const filtered =
          previous.filter(
            item =>
              item?.id !== result.id
          );


        return [
          result,
          ...filtered
        ];
      }
    );


    console.log(
      'SOS CREATED SUCCESSFULLY:',
      result
    );


    return result;
  };


  // ============================================================
  // CANCEL SOS
  // ============================================================

  const cancelSOS = async (
    deviceId
  ) => {

    if (role !== 'USER') {

      throw new Error(
        'Only USER can cancel SOS.'
      );
    }


    try {

      // --------------------------------------------------------
      // First try saved active SOS ID
      // --------------------------------------------------------

      let activeSOSId =
        localStorage.getItem(
          'activeSOSId'
        );


      // --------------------------------------------------------
      // If no saved ID, find from alerts
      // --------------------------------------------------------

      if (!activeSOSId) {

        const activeSOS =
          alerts.find(
            (sos) => {

              const status =
                String(
                  sos?.status || ''
                ).toUpperCase();


              const sameDevice =
                !deviceId ||
                String(
                  sos?.deviceId
                ) === String(deviceId);


              return (
                sameDevice &&
                (
                  status === 'PENDING' ||
                  status === 'ACTIVE' ||
                  status === 'ACCEPTED' ||
                  status === 'IN_PROGRESS'
                )
              );
            }
          );


        activeSOSId =
          activeSOS?.id ||
          activeSOS?.sosId ||
          null;
      }


      // --------------------------------------------------------
      // Nothing active
      // --------------------------------------------------------

      if (!activeSOSId) {

        console.warn(
          'No active SOS found to cancel.'
        );

        return null;
      }


      console.log(
        'CANCELLING SOS:',
        activeSOSId
      );


      // --------------------------------------------------------
      // CANCEL IN 8085
      // --------------------------------------------------------

      const cancelResponse =
        await fetch(
          `${SOS_API}/api/sos/${encodeURIComponent(
            activeSOSId
          )}/status?status=CANCELLED`,
          {
            method: 'PUT'
          }
        );


      const cancelText =
        await cancelResponse.text();


      if (!cancelResponse.ok) {

        throw new Error(
          `SOS cancellation failed: ${cancelResponse.status} ${cancelText}`
        );
      }


      console.log(
        'SOS CANCELLED:',
        cancelText
      );


      // --------------------------------------------------------
      // Remove active ID
      // --------------------------------------------------------

      localStorage.removeItem(
        'activeSOSId'
      );


      // --------------------------------------------------------
      // Refresh
      // --------------------------------------------------------

      await fetchUserSOS();


      return cancelText;

    } catch (error) {

      console.error(
        'CANCEL SOS ERROR:',
        error
      );

      throw error;
    }
  };


  // ============================================================
  // WORKER - TEAMS
  // ============================================================

  const fetchTeams = useCallback(async () => {

    if (
      role !== 'WORKER' &&
      role !== 'ADMIN'
    ) {

      setWorkerMessages([]);

      return;
    }


    try {

      const response =
        await fetch(
          `${AUTH_API}/api/teams`
        );


      if (!response.ok) {

        throw new Error(
          `Teams API returned ${response.status}`
        );
      }


      const data =
        await response.json();


      setTeams(
        Array.isArray(data)
          ? data
          : []
      );


    } catch (error) {

      console.error(
        'Teams fetch error:',
        error
      );
    }

  }, [role]);


  // ============================================================
  // WORKER - RELAYS
  // ============================================================

  const fetchRelays = useCallback(async () => {

    if (
      role !== 'WORKER' &&
      role !== 'ADMIN'
    ) {

      setRelays([]);

      return;
    }


    try {

      const response =
        await fetch(
          `${RESCUE_API}/api/relays`
        );


      if (!response.ok) {

        throw new Error(
          `Relays API returned ${response.status}`
        );
      }


      const data =
        await response.json();


      console.log(
        'RELAYS FROM DATABASE:',
        data
      );


      setRelays(
        Array.isArray(data)
          ? data
          : []
      );


    } catch (error) {

      console.error(
        'Relays fetch error:',
        error
      );

      setRelays([]);
    }

  }, [role]);


  // ============================================================
  // WORKER - RELAY METRICS
  // ============================================================

  const fetchRelayMetrics = useCallback(async () => {

    if (
      role !== 'WORKER' &&
      role !== 'ADMIN'
    ) {

      setRelayMetrics({
        onlineRelays: 0,
        offlineRelays: 0,
        averageRssi: 0,
        averageBattery: 0,
        averageSnr: 0,
        totalPackets: 0,
        coverageArea: 0
      });

      return;
    }


    try {

      const response =
        await fetch(
          `${RESCUE_API}/api/relays/metrics`
        );


      if (!response.ok) {

        throw new Error(
          `Relay metrics API returned ${response.status}`
        );
      }


      const data =
        await response.json();


      console.log(
        'RELAY METRICS FROM DATABASE:',
        data
      );


      setRelayMetrics({

        onlineRelays:
          data?.onlineRelays ?? 0,

        offlineRelays:
          data?.offlineRelays ?? 0,

        averageRssi:
          data?.averageRssi ?? 0,

        averageBattery:
          data?.averageBattery ?? 0,

        averageSnr:
          data?.averageSnr ?? 0,

        totalPackets:
          data?.totalPackets ?? 0,

        coverageArea:
          data?.coverageArea ?? 0
      });


    } catch (error) {

      console.error(
        'Relay metrics fetch error:',
        error
      );
    }

  }, [role]);


  // ============================================================
  // WORKER - DASHBOARD SUMMARY
  // ============================================================

  const fetchDashboardSummary =
    useCallback(async () => {

      if (role !== 'WORKER') {

        return;
      }


      try {

        const response =
          await fetch(
            `${RESCUE_API}/api/dashboard/summary`
          );


        if (!response.ok) {

          throw new Error(
            `Summary API returned ${response.status}`
          );
        }


        const data =
          await response.json();


        setDashboardSummary({

          availableTeams:
            data?.availableTeams ?? 0,

          activeSOS:
            data?.activeSOS ?? 0,

          teamsOnRescue:
            data?.teamsOnRescue ?? 0,

          networkHealth:
            data?.networkHealth ||
            'Unknown'
        });


      } catch (error) {

        console.error(
          'Dashboard summary error:',
          error
        );
      }

    }, [role]);


  // ============================================================
  // WORKER - ALL SOS
  // ============================================================

  const fetchAlerts = useCallback(async () => {

    // ----------------------------------------------------------
    // USER
    // ----------------------------------------------------------

    if (role === 'USER') {

      await fetchUserSOS();

      return;
    }


    // ----------------------------------------------------------
    // WORKER / ADMIN
    // ----------------------------------------------------------

    if (
      role !== 'WORKER' &&
      role !== 'ADMIN'
    ) {

      setAlerts([]);

      return;
    }


    try {

      const response =
        await fetch(
          `${RESCUE_API}/api/dashboard/sos/all`
        );


      if (!response.ok) {

        throw new Error(
          `SOS API returned ${response.status}`
        );
      }


      const data =
        await response.json();


      console.log(
        'ALL WORKER SOS DATA:',
        data
      );


      setAlerts(
        Array.isArray(data)
          ? data
          : []
      );


    } catch (error) {

      console.error(
        'SOS fetch error:',
        error
      );
    }

  }, [
    role,
    fetchUserSOS
  ]);


  // ============================================================
  // WORKER - WORKER MESSAGES
  // ============================================================

  const fetchWorkerMessages =
    useCallback(async () => {

      if (
        role !== 'WORKER' &&
        role !== 'ADMIN'
      ) {

        setWorkerMessages([]);

        return;
      }


      try {

        const response =
          await fetch(
            `${RESCUE_API}/api/worker-messages`
          );


        if (!response.ok) {

          throw new Error(
            `Worker message API returned ${response.status}`
          );
        }


        const data =
          await response.json();


        console.log(
          'ALL WORKER MESSAGES FROM DATABASE:',
          data
        );


        setWorkerMessages(
          Array.isArray(data)
            ? data
            : []
        );


      } catch (error) {

        console.error(
          'Worker message fetch error:',
          error
        );
      }

    }, [role]);


  // ============================================================
  // WORKER - CURRENT RESCUE
  // ============================================================

  const fetchCurrentRescue =
    useCallback(async () => {

      if (role !== 'WORKER') {

        setCurrentRescue(null);

        return;
      }


      const teamId =
        currentUser?.teamId;


      if (!teamId) {

        console.log(
          'No teamId available for current mission.'
        );

        setCurrentRescue(null);

        return;
      }


      try {

        // ------------------------------------------------------
        // 1. CURRENT SOS
        // ------------------------------------------------------

        const sosResponse =
          await fetch(
            `${RESCUE_API}/api/dashboard/team/${encodeURIComponent(
              teamId
            )}/current-sos`
          );


        if (
          sosResponse.status === 200
        ) {

          const sosData =
            await sosResponse.json();


          if (sosData) {

            setCurrentRescue({

              ...sosData,

              missionType:
                'SOS'
            });


            return;
          }
        }


        // ------------------------------------------------------
        // 2. CURRENT WORKER HELP
        // ------------------------------------------------------

        const helpResponse =
          await fetch(
            `${RESCUE_API}/api/dashboard/team/${encodeURIComponent(
              teamId
            )}/current-help`
          );


        if (
          helpResponse.status === 200
        ) {

          const helpData =
            await helpResponse.json();


          if (helpData) {

            setCurrentRescue({

              ...helpData,

              missionType:
                'WORKER_HELP'
            });


            return;
          }
        }


        // ------------------------------------------------------
        // 3. NO ACTIVE MISSION
        // ------------------------------------------------------

        console.log(
          'NO CURRENT SOS OR WORKER HELP'
        );


        setCurrentRescue(null);


      } catch (error) {

        console.error(
          'Current mission fetch error:',
          error
        );
      }

    }, [
      role,
      currentUser?.teamId
    ]);


  // ============================================================
  // WORKER - REFRESH ALL DATA
  // ============================================================

  const refreshRescueData =
    useCallback(async () => {

      if (
        role !== 'WORKER' &&
        role !== 'ADMIN'
      ) {

        return;
      }


      setLoadingRescueData(true);

      setRescueError('');


      try {

        await Promise.all([

          fetchDashboardSummary(),

          fetchAlerts(),

          fetchWorkerMessages(),

          fetchCurrentRescue(),

          fetchTeams(),

          fetchRelays(),

          fetchRelayMetrics()

        ]);


      } catch (error) {

        console.error(
          'Rescue data refresh error:',
          error
        );


        setRescueError(
          'Unable to load rescue service data.'
        );

      } finally {

        setLoadingRescueData(false);
      }

    }, [

      role,

      fetchDashboardSummary,

      fetchAlerts,

      fetchWorkerMessages,

      fetchCurrentRescue,

      fetchTeams,

      fetchRelays,

      fetchRelayMetrics

    ]);


  // ============================================================
  // ROLE BASED POLLING
  // ============================================================

  useEffect(() => {

    if (!currentUser) {

      return;
    }


    // ==========================================================
    // ADMIN
    // ==========================================================

    if (role === 'ADMIN') {

      fetchAlerts();

      fetchWorkerMessages();

      fetchRelays();

      fetchRelayMetrics();


      const interval =
        setInterval(() => {

          fetchAlerts();

          fetchWorkerMessages();

          fetchRelays();

          fetchRelayMetrics();

        }, 5000);


      return () =>
        clearInterval(interval);
    }


    // ==========================================================
    // USER
    // ==========================================================

    if (role === 'USER') {

      fetchDevices();

      fetchUserSOS();


      const interval =
        setInterval(() => {

          fetchDevices();

          fetchUserSOS();

        }, 5000);


      return () => {

        clearInterval(interval);
      };
    }


    // ==========================================================
    // WORKER
    // ==========================================================

    if (role === 'WORKER') {

      refreshRescueData();


      const interval =
        setInterval(() => {

          refreshRescueData();

        }, 5000);


      return () => {

        clearInterval(interval);
      };
    }

  }, [

    currentUser,

    role,

    fetchDevices,

    fetchUserSOS,

    refreshRescueData,

    fetchAlerts,

    fetchWorkerMessages,

    fetchRelays,

    fetchRelayMetrics

  ]);


  // ============================================================
  // WORKER - ACCEPT SOS
  // ============================================================

  const acceptSOS = async (
    sosId,
    teamId,
    teamName
  ) => {

    if (role !== 'WORKER') {

      throw new Error(
        'Only WORKER can accept SOS.'
      );
    }


    if (!sosId) {

      throw new Error(
        'SOS ID is required.'
      );
    }


    if (!teamId) {

      throw new Error(
        'Team ID is required.'
      );
    }


    console.log(
      'ACCEPTING SOS:',
      {
        sosId,
        teamId,
        teamName
      }
    );


    try {

      const response =
        await fetch(
          `${RESCUE_API}/api/dashboard/sos/${encodeURIComponent(
            sosId
          )}/accept`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body:
              JSON.stringify({

                teamId,

                teamName

              })
          }
        );


      if (
        response.status === 409
      ) {

        throw new Error(
          'TEAM_BUSY'
        );
      }


      if (!response.ok) {

        const errorText =
          await response.text();


        throw new Error(
          errorText ||
          'Unable to accept SOS'
        );
      }


      const data =
        await response.json();


      console.log(
        'SOS ACCEPTED:',
        data
      );


      setTeams(
        previousTeams =>

          previousTeams.map(
            team =>

              String(team?.id) ===
              String(teamId)

                ? {

                    ...team,

                    operationalState:
                      'BUSY'

                  }

                : team
          )
      );


      await refreshRescueData();


      return data;


    } catch (error) {

      console.error(
        'ACCEPT SOS ERROR:',
        error
      );

      throw error;
    }
  };


  // ============================================================
  // WORKER - COMPLETE SOS
  // ============================================================

  const completeSOS =
    async (
      sosId
    ) => {

      if (role !== 'WORKER') {

        throw new Error(
          'Only WORKER can complete SOS.'
        );
      }


      const response =
        await fetch(
          `${RESCUE_API}/api/dashboard/sos/${encodeURIComponent(
            sosId
          )}/complete`,
          {
            method: 'PUT'
          }
        );


      if (!response.ok) {

        const errorText =
          await response.text();


        throw new Error(
          errorText ||
          'Unable to complete SOS'
        );
      }


      const data =
        await response.json();


      console.log(
        'SOS COMPLETED:',
        data
      );


      await refreshRescueData();


      return data;
    };


  // ============================================================
  // WORKER - ACCEPT WORKER MESSAGE
  // ============================================================

  const acceptWorkerMessage =
    async (
      messageId,
      teamId,
      teamName
    ) => {

      if (role !== 'WORKER') {

        throw new Error(
          'Only WORKER can accept worker messages.'
        );
      }


      console.log(
        'ACCEPT WORKER MESSAGE:',
        {
          messageId,
          teamId,
          teamName
        }
      );


      const response =
        await fetch(
          `${RESCUE_API}/api/dashboard/worker-messages/${encodeURIComponent(
            messageId
          )}/accept`,
          {

            method: 'POST',

            headers: {

              'Content-Type':
                'application/json'
            },

            body:
              JSON.stringify({

                teamId,

                teamName

              })
          }
        );


      if (
        response.status === 409
      ) {

        throw new Error(
          'TEAM_BUSY'
        );
      }


      if (!response.ok) {

        const errorText =
          await response.text();


        throw new Error(
          errorText ||
          'Unable to accept worker message'
        );
      }


      const data =
        await response.json();


      console.log(
        'WORKER MESSAGE ACCEPTED:',
        data
      );


      await refreshRescueData();


      return data;
    };


  // ============================================================
  // WORKER - COMPLETE WORKER MESSAGE
  // ============================================================

  const completeWorkerMessage =
    async (
      messageId
    ) => {

      if (role !== 'WORKER') {

        throw new Error(
          'Only WORKER can complete worker message.'
        );
      }


      console.log(
        'COMPLETE WORKER MESSAGE:',
        messageId
      );


      const response =
        await fetch(
          `${RESCUE_API}/api/dashboard/worker-messages/${encodeURIComponent(
            messageId
          )}/complete`,
          {

            method: 'PUT'
          }
        );


      if (!response.ok) {

        const errorText =
          await response.text();


        throw new Error(
          errorText ||
          'Unable to complete worker message'
        );
      }


      const data =
        await response.json();


      await refreshRescueData();


      return data;
    };


  // ============================================================
  // CONTEXT VALUE
  // ============================================================

  const value = {

    // ----------------------------------------------------------
    // AUTH
    // ----------------------------------------------------------

    currentUser,

    setCurrentUser,

    login,

    logout,


    // ----------------------------------------------------------
    // USER DEVICES
    // ----------------------------------------------------------

    devices,

    setDevices,

    fetchDevices,


    // ----------------------------------------------------------
    // USER SOS
    // ----------------------------------------------------------

    alerts,

    setAlerts,

    triggerSOS,

    cancelSOS,

    fetchAlerts,


    // ----------------------------------------------------------
    // WORKER TEAMS
    // ----------------------------------------------------------

    teams,

    setTeams,

    fetchTeams,


    // ----------------------------------------------------------
    // WORKER RELAYS
    // ----------------------------------------------------------

    relays,

    setRelays,

    fetchRelays,

    relayMetrics,

    fetchRelayMetrics,


    // ----------------------------------------------------------
    // WORKER MESSAGES
    // ----------------------------------------------------------

    workerMessages,

    setWorkerMessages,

    fetchWorkerMessages,


    // ----------------------------------------------------------
    // CURRENT MISSION
    // ----------------------------------------------------------

    currentRescue,

    fetchCurrentRescue,


    // ----------------------------------------------------------
    // DASHBOARD SUMMARY
    // ----------------------------------------------------------

    dashboardSummary,

    fetchDashboardSummary,


    // ----------------------------------------------------------
    // LOADING / ERROR
    // ----------------------------------------------------------

    loadingRescueData,

    rescueError,


    // ----------------------------------------------------------
    // WORKER REFRESH
    // ----------------------------------------------------------

    refreshRescueData,


    // ----------------------------------------------------------
    // WORKER SOS ACTIONS
    // ----------------------------------------------------------

    acceptSOS,

    completeSOS,


    // ----------------------------------------------------------
    // WORKER HELP ACTIONS
    // ----------------------------------------------------------

    acceptWorkerMessage,

    completeWorkerMessage

  };


  // ============================================================
  // PROVIDER
  // ============================================================

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};


// ================================================================
// USE APP CONTEXT
// ================================================================

export const useAppContext = () => {

  const context =
    useContext(AppContext);


  if (!context) {

    throw new Error(
      'useAppContext must be used inside AppProvider'
    );
  }


  return context;
};


// ================================================================
// COMPATIBILITY EXPORT
// ================================================================

export const AppContextProvider =
  AppProvider;


// ================================================================
// DEFAULT EXPORT
// ================================================================

export default AppProvider;