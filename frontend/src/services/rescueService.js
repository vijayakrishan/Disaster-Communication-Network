import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

export const rescueService = {
  getSummary: async () => {
    return apiClient(ENDPOINTS.RESCUE.SUMMARY);
  },

  assignTeam: async (assignmentData) => {
    return apiClient(ENDPOINTS.RESCUE.ASSIGN, {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  },

  getMessages: async () => {
    return apiClient(ENDPOINTS.RESCUE.MESSAGES);
  },
};

export default rescueService;
