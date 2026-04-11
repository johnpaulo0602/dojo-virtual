import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Student, StudentDetail } from "@/types";

export interface School {
  id: string;
  name: string;
  address?: string;
}

export function useSchools() {
  return useQuery<School[]>({
    queryKey: ["schools"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/students/schools");
      return data;
    },
  });
}

export function useStudents() {
  return useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/students");
      return data;
    },
  });
}

export function useStudent(id: string | undefined) {
  return useQuery<StudentDetail>({
    queryKey: ["students", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/students/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post("/api/v1/students", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
