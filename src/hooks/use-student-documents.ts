import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { StudentDocument } from "@/types";

export function useStudentDocuments(studentId: string | undefined) {
  return useQuery<StudentDocument[]>({
    queryKey: ["studentDocuments", studentId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/students/${studentId}/documents`);
      return data;
    },
    enabled: !!studentId,
  });
}

export function useCreateStudentDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, ...payload }: { studentId: string } & Record<string, unknown>) => {
      const { data } = await api.post(`/api/v1/students/${studentId}/documents`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentDocuments"] });
    },
  });
}

export function useDeleteStudentDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, docId }: { studentId: string; docId: string }) => {
      await api.delete(`/api/v1/students/${studentId}/documents/${docId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentDocuments"] });
    },
  });
}
