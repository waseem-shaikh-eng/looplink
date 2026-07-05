import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignApi } from '../api/campaignApi';

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignApi.list(),
  });
}

export function useCampaign(id) {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignApi.get(id),
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => campaignApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => campaignApi.update(id, data),
    onSuccess: (campaign) => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      qc.invalidateQueries({ queryKey: ['campaign', campaign.id] });
    },
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => campaignApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useScheduleCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, starts_at, version }) =>
      campaignApi.schedule(id, { starts_at, version }),
    onSuccess: (campaign) => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      qc.invalidateQueries({ queryKey: ['campaign', campaign.id] });
    },
  });
}

export function useLaunchCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, version }) => campaignApi.launch(id, version),
    onSuccess: (campaign) => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      qc.invalidateQueries({ queryKey: ['campaign', campaign.id] });
    },
  });
}

export function useEndCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, version }) => campaignApi.end(id, version),
    onSuccess: (campaign) => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      qc.invalidateQueries({ queryKey: ['campaign', campaign.id] });
    },
  });
}

export function useSetOffers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, offers, version }) => campaignApi.setOffers(id, offers, version),
    onSuccess: (campaign) => {
      qc.invalidateQueries({ queryKey: ['campaign', campaign.id] });
    },
  });
}
