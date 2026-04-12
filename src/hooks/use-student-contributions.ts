import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { StudentContribution } from "@/types";

export function useStudentContributions(studentId: string | undefined) {
  return useQuery<StudentContribution[]>({
    queryKey: ["studentContributions", studentId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/students/${studentId}/contributions`);
      return data;
    },
    enabled: !!studentId,
  });
}

export function useCreateStudentContribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, ...payload }: { studentId: string } & Record<string, unknown>) => {
      const { data } = await api.post(`/api/v1/students/${studentId}/contributions`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentContributions"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
