import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreateAllocationRequest, type CreateDepositRequest, type CreateWithdrawalRequest } from "@shared/routes";

// GET /api/portfolio
export function usePortfolio() {
  return useQuery({
    queryKey: [api.user.portfolio.path],
    queryFn: async () => {
      const res = await fetch(api.user.portfolio.path, { credentials: "include" });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch portfolio");
      return api.user.portfolio.responses[200].parse(await res.json());
    },
    retry: false,
  });
}

// POST /api/allocations
export function useAllocate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAllocationRequest) => {
      const res = await fetch(api.user.allocate.path, {
        method: api.user.allocate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to allocate");
      }
      return api.user.allocate.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.user.portfolio.path] });
      queryClient.invalidateQueries({ queryKey: [api.bots.list.path] });
    },
  });
}

// POST /api/deposit
export function useDeposit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDepositRequest) => {
      const res = await fetch(api.user.deposit.path, {
        method: api.user.deposit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to deposit");
      return api.user.deposit.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.user.portfolio.path] });
    },
  });
}

// POST /api/withdraw
export function useWithdraw() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateWithdrawalRequest) => {
      const res = await fetch(api.user.withdraw.path, {
        method: api.user.withdraw.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to withdraw");
      }
      return api.user.withdraw.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.user.portfolio.path] });
    },
  });
}
