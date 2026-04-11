import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ClassGroup, Lesson, LessonDetail } from "@/types";

export function useClassGroups() {
  return useQuery<ClassGroup[]>({
    queryKey: ["classGroups"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/class-groups");
      return data;
    },
  });
}

export function useClassGroup(id: string | undefined) {
  return useQuery<ClassGroup>({
    queryKey: ["classGroups", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/class-groups/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useLessons() {
  return useQuery<Lesson[]>({
    queryKey: ["lessons"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/class-groups/lessons");
      return data;
    },
  });
}

export function useLesson(id: string | undefined) {
  return useQuery<LessonDetail>({
    queryKey: ["lessons", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/class-groups/lessons/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateClassGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post("/api/v1/class-groups", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classGroups"] });
    },
  });
}

export function useUpdateClassGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Record<string, unknown>) => {
      const { data } = await api.patch(`/api/v1/class-groups/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classGroups"] });
    },
  });
}

export function useDeleteClassGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/class-groups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classGroups"] });
    },
  });
}
