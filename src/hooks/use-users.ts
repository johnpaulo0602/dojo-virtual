import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User } from "@/types";

export function useUsers(role?: string) {
  return useQuery<User[]>({
    queryKey: ["users", role],
    queryFn: async () => {
      const params = role ? `?role=${role}` : "";
      const { data } = await api.get(`/api/v1/users${params}`);
      return data;
    },
  });
}
