import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

export const deviceService = {
  getDevices: async () => {
    return apiClient(ENDPOINTS.DEVICE.LIST);
  },

  registerDevice: async (deviceData) => {
    return apiClient(ENDPOINTS.DEVICE.REGISTER, {
      method: 'POST',
      body: JSON.stringify(deviceData),
    });
  },
};

export default deviceService;
