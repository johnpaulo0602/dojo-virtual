import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AttendanceRecord } from "@/types";

export function useLessonAttendance(lessonId: string | undefined) {
  return useQuery<AttendanceRecord[]>({
    queryKey: ["attendance", lessonId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/class-groups/lessons/${lessonId}/attendance`);
      return data;
    },
    enabled: !!lessonId,
  });
}

export function useBatchAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ lessonId, records }: { lessonId: string; records: { studentId: string; present: boolean }[] }) => {
      const { data } = await api.post(`/api/v1/class-groups/lessons/${lessonId}/attendance`, { records });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attendance", variables.lessonId] });
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
    },
  });
}

export function useToggleAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ recordId, present }: { recordId: string; present: boolean }) => {
      const { data } = await api.patch(`/api/v1/class-groups/attendance/${recordId}`, { present });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}
