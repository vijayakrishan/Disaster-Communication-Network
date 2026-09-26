import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

export const authService = {
  login: async (credentials) => {
    return apiClient(ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData) => {
    return apiClient(ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  verifyOtp: async (otpData) => {
    return apiClient(ENDPOINTS.AUTH.VERIFY_OTP, {
      method: 'POST',
      body: JSON.stringify(otpData),
    });
  },
};

export default authService;
