import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BeltPromotion } from "@/types";

export function usePromotions(studentId: string | undefined) {
  return useQuery<BeltPromotion[]>({
    queryKey: ["promotions", studentId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/students/${studentId}/promotions`);
      return data;
    },
    enabled: !!studentId,
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, ...payload }: { studentId: string } & Record<string, unknown>) => {
      const { data } = await api.post(`/api/v1/students/${studentId}/promotions`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
