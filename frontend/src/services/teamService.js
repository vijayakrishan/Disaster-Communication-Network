import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

export const teamService = {
  getTeams: async () => {
    return apiClient(ENDPOINTS.AUTH.TEAMS);
  },

  createTeam: async (teamData) => {
    return apiClient(ENDPOINTS.AUTH.TEAMS, {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  },
};

export default teamService;
