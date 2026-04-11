import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface FinancialCategory {
  id: string;
  name: string;
  type: "receita" | "despesa";
  description: string;
}

export function useCategories() {
  return useQuery<FinancialCategory[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/config/categories");
      return data.categories;
    },
  });
}

export function useSaveCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categories: FinancialCategory[]) => {
      const { data } = await api.put("/api/v1/config/categories", { categories });
      return data.categories;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
