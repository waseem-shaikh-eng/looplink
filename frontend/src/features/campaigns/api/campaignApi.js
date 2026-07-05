import { api } from '../../../shared/lib/api';

export const campaignApi = {
  list: () => api.get('/campaigns'),

  get: (id) => api.get(`/campaigns/${id}`),

  create: (data) => api.post('/campaigns', data),

  update: (id, data) => api.put(`/campaigns/${id}`, data),

  delete: (id) => api.delete(`/campaigns/${id}`),

  schedule: (id, data) => api.post(`/campaigns/${id}/schedule`, data),

  launch: (id, version) => api.post(`/campaigns/${id}/launch`, { version }),

  end: (id, version) => api.post(`/campaigns/${id}/end`, { version }),

  setOffers: (id, offers, version) => api.put(`/campaigns/${id}/offers`, { offers, version }),

  getDistribution: (id, baseUrl) => api.get(`/campaigns/${id}/distribution?base_url=${encodeURIComponent(baseUrl)}`),
};
