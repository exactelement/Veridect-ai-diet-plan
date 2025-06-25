import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 minutes - good balance
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnMount: false, // Don't always refetch - use cache when possible
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  return {
    user,
    isLoading,
    isError,
    isAuthenticated: !!user && !isError,
  };
}
