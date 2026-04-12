import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { InstructorFeedback } from "@/types";

export function useFeedbacks(studentId: string | undefined) {
  return useQuery<InstructorFeedback[]>({
    queryKey: ["feedbacks", studentId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/students/${studentId}/feedbacks`);
      return data;
    },
    enabled: !!studentId,
  });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, ...payload }: { studentId: string } & Record<string, unknown>) => {
      const { data } = await api.post(`/api/v1/students/${studentId}/feedbacks`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
  });
}
