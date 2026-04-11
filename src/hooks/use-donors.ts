import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Donor, DonorDetail } from "@/types";

export function useDonors() {
  return useQuery<Donor[]>({
    queryKey: ["donors"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/donors");
      return data;
    },
  });
}

export function useDonor(id: string | undefined) {
  return useQuery<DonorDetail>({
    queryKey: ["donors", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/donors/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateDonor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post("/api/v1/donors", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donors"] });
    },
  });
}

export function useUpdateDonor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Record<string, unknown>) => {
      const { data } = await api.patch(`/api/v1/donors/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donors"] });
    },
  });
}

export function useDeleteDonor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/donors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
  });
}

export function useCreateDonation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ donorId, ...payload }: { donorId: string } & Record<string, unknown>) => {
      const { data } = await api.post(`/api/v1/donors/${donorId}/donations`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donors"] });
      queryClient.invalidateQueries({ queryKey: ["financialTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
  });
}
