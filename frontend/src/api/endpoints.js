/**
 * ResQMesh Microservice API Endpoints Configuration
 */

export const BASE_URLS = {
  AUTH: import.meta.env.VITE_AUTH_API || 'http://localhost:8081',
  DEVICE: import.meta.env.VITE_DEVICE_API || 'http://localhost:8082',
  USER: import.meta.env.VITE_USER_API || 'http://localhost:8083',
  STATION: import.meta.env.VITE_STATION_API || 'http://localhost:8084',
  SOS: import.meta.env.VITE_SOS_API || 'http://localhost:8085',
  RESCUE: import.meta.env.VITE_RESCUE_API || 'http://localhost:8086',
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE_URLS.AUTH}/api/auth/login`,
    REGISTER: `${BASE_URLS.AUTH}/api/auth/register`,
    VERIFY_OTP: `${BASE_URLS.AUTH}/api/auth/verify-otp`,
    WORKERS: `${BASE_URLS.AUTH}/api/workers`,
    TEAMS: `${BASE_URLS.AUTH}/api/teams`,
  },
  DEVICE: {
    LIST: `${BASE_URLS.DEVICE}/api/devices`,
    REGISTER: `${BASE_URLS.DEVICE}/api/devices/register`,
    TELEMETRY: `${BASE_URLS.DEVICE}/api/devices/telemetry`,
  },
  USER: {
    PROFILE: (email) => `${BASE_URLS.USER}/api/users/profile/${encodeURIComponent(email)}`,
    UPDATE: `${BASE_URLS.USER}/api/users/profile`,
  },
  STATION: {
    LIST: `${BASE_URLS.STATION}/api/stations`,
    NEAREST: `${BASE_URLS.STATION}/api/stations/nearest`,
  },
  SOS: {
    CREATE: `${BASE_URLS.SOS}/api/sos/create`,
    ACTIVE: `${BASE_URLS.SOS}/api/sos/active`,
    HISTORY: `${BASE_URLS.SOS}/api/sos/history`,
  },
  RESCUE: {
    SUMMARY: `${BASE_URLS.RESCUE}/api/rescue/dashboard/summary`,
    ASSIGN: `${BASE_URLS.RESCUE}/api/rescue/assign`,
    RELAYS: `${BASE_URLS.RESCUE}/api/relays`,
    MESSAGES: `${BASE_URLS.RESCUE}/api/messages`,
  },
};

export default ENDPOINTS;
