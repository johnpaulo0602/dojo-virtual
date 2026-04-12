import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { EmergencyContact } from "@/types";

export function useEmergencyContacts(studentId: string | undefined) {
  return useQuery<EmergencyContact[]>({
    queryKey: ["emergencyContacts", studentId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/students/${studentId}/emergency-contacts`);
      return data;
    },
    enabled: !!studentId,
  });
}

export function useCreateEmergencyContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, ...payload }: { studentId: string } & Record<string, unknown>) => {
      const { data } = await api.post(`/api/v1/students/${studentId}/emergency-contacts`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useUpdateEmergencyContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, contactId, ...payload }: { studentId: string; contactId: string } & Record<string, unknown>) => {
      const { data } = await api.patch(`/api/v1/students/${studentId}/emergency-contacts/${contactId}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] });
    },
  });
}

export function useDeleteEmergencyContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, contactId }: { studentId: string; contactId: string }) => {
      await api.delete(`/api/v1/students/${studentId}/emergency-contacts/${contactId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
