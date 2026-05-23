import { useMutationState } from "@tanstack/react-query";

/**
 * Returns the set of item IDs currently being mutated under the given mutation key.
 * Derives state from TanStack Query's mutation cache — no local state or syncing needed.
 */
export function useInFlightIds<TVariables>(
  mutationKey: readonly unknown[],
  extractId: (variables: TVariables) => string
): Set<string> {
  const ids = useMutationState({
    filters: { mutationKey: mutationKey as unknown[], status: "pending" },
    select: (mutation) => extractId(mutation.state.variables as TVariables)
  });

  return new Set(ids);
}
