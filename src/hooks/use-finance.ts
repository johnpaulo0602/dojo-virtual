import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { FinancialTransaction } from "@/types";

export function useFinancialTransactions() {
  return useQuery<FinancialTransaction[]>({
    queryKey: ["financialTransactions"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/financial-transactions");
      return data;
    },
  });
}

export function useFinancialTransaction(id: string | undefined) {
  return useQuery<FinancialTransaction>({
    queryKey: ["financialTransactions", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/financial-transactions/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post("/api/v1/financial-transactions", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Record<string, unknown>) => {
      const { data } = await api.patch(`/api/v1/financial-transactions/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/financial-transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardSummary"] });
    },
  });
}
