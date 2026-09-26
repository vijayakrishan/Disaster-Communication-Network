import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

export const workerService = {
  getWorkers: async () => {
    return apiClient(ENDPOINTS.AUTH.WORKERS);
  },

  createWorker: async (workerData) => {
    return apiClient(ENDPOINTS.AUTH.WORKERS, {
      method: 'POST',
      body: JSON.stringify(workerData),
    });
  },
};

export default workerService;
