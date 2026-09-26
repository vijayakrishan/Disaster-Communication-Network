import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

export const relayService = {
  getRelays: async () => {
    return apiClient(ENDPOINTS.RESCUE.RELAYS);
  },
};

export default relayService;
