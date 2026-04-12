import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface OrganizationSettings {
  projectName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  cnpj: string;
  socials: { platform: string; url: string }[];
  managers: { name: string; phone: string; email: string }[];
  defaultBelt: string;
  maxStudentsPerClass: number;
  attendanceThreshold: number;
  defaultContribution: string;
}

export function useOrganization() {
  return useQuery<OrganizationSettings>({
    queryKey: ["organization"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/config/organization");
      return data;
    },
  });
}

export function useSaveOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: OrganizationSettings) => {
      const { data } = await api.put("/api/v1/config/organization", settings);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}
