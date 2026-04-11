import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DashboardSummary } from "@/types";

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: ["dashboardSummary"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/dashboard/summary");
      return data;
    },
  });
}
