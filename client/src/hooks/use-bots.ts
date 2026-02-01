import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateBotRequest } from "@shared/routes";

// GET /api/bots
export function useBots() {
  return useQuery({
    queryKey: [api.bots.list.path],
    queryFn: async () => {
      const res = await fetch(api.bots.list.path);
      if (!res.ok) throw new Error("Failed to fetch bots");
      return api.bots.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/bots/:id
export function useBot(id: number) {
  return useQuery({
    queryKey: [api.bots.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.bots.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch bot");
      return api.bots.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// POST /api/admin/bots (Admin only)
export function useCreateBot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBotRequest) => {
      const res = await fetch(api.admin.bots.create.path, {
        method: api.admin.bots.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create bot");
      return api.admin.bots.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bots.list.path] });
    },
  });
}
