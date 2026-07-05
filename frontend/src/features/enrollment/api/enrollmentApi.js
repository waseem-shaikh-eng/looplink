import { api } from '../../../shared/lib/api';

export const enrollmentApi = {
  getCampaign: (token) => api.get(`/c/${token}`),
  enroll: (token, data) => api.post(`/c/${token}/enroll`, data),
};
