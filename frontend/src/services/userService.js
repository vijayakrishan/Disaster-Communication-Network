import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

export const userService = {
  getProfile: async (email) => {
    return apiClient(ENDPOINTS.USER.PROFILE(email));
  },

  updateProfile: async (profileData) => {
    return apiClient(ENDPOINTS.USER.UPDATE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

export default userService;
