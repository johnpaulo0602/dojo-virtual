import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Guardian } from "@/types";

export function useGuardians(studentId: string | undefined) {
  return useQuery<Guardian[]>({
    queryKey: ["guardians", studentId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/students/${studentId}/guardians`);
      return data;
    },
    enabled: !!studentId,
  });
}

export function useCreateGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, ...payload }: { studentId: string } & Record<string, unknown>) => {
      const { data } = await api.post(`/api/v1/students/${studentId}/guardians`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guardians"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useUpdateGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, guardianId, ...payload }: { studentId: string; guardianId: string } & Record<string, unknown>) => {
      const { data } = await api.patch(`/api/v1/students/${studentId}/guardians/${guardianId}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guardians"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useDeleteGuardian() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, guardianId }: { studentId: string; guardianId: string }) => {
      await api.delete(`/api/v1/students/${studentId}/guardians/${guardianId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guardians"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
