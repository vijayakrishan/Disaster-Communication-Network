/**
 * ResQMesh Generic Fetch API Client
 */

export const apiClient = async (url, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    const errorBody = await response.text().catch(() => null);
    throw new Error(`API Error [${response.status}] ${response.statusText}: ${errorBody || ''}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

export default apiClient;
