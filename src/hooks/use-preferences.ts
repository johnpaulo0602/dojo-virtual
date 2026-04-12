import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface UserPreferences {
  notifyNewStudent: boolean;
  notifyAttendance: boolean;
  notifyFinancial: boolean;
  notifyBeltPromotion: boolean;
}

export function usePreferences() {
  return useQuery<UserPreferences>({
    queryKey: ["preferences"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/config/user_prefs");
      return data;
    },
  });
}

export function useSavePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prefs: UserPreferences) => {
      const { data } = await api.put("/api/v1/config/user_prefs", prefs);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preferences"] });
    },
  });
}
