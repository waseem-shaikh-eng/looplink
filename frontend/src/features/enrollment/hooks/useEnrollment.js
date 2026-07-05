import { useMutation, useQuery } from '@tanstack/react-query';
import { enrollmentApi } from '../api/enrollmentApi';

export function usePublicCampaign(token) {
  return useQuery({
    queryKey: ['public-campaign', token],
    queryFn: () => enrollmentApi.getCampaign(token),
    enabled: !!token,
    retry: false,
  });
}

export function useEnroll() {
  return useMutation({
    mutationFn: ({ token, data }) => enrollmentApi.enroll(token, data),
  });
}
