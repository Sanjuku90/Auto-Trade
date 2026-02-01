import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Position } from "@shared/schema";

export function usePositions(botId?: number) {
  return useQuery<Position[]>({
    queryKey: botId ? ["/api/positions", { botId }] : ["/api/positions"],
  });
}
