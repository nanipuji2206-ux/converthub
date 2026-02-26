import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useGetTotalConversions() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["totalConversions"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalConversions();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useGetToolUsage(toolName: string) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["toolUsage", toolName],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getToolUsage(toolName);
    },
    enabled: !!actor && !isFetching && !!toolName,
  });
}

export function useRecordConversion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (toolName: string) => {
      if (!actor) return;
      await actor.recordConversion(toolName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["totalConversions"] });
      queryClient.invalidateQueries({ queryKey: ["toolUsage"] });
    },
  });
}
