import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes - stop excessive requests
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    refetchOnMount: false, // Don't refetch on mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchInterval: false, // No polling
  });

  return {
    user,
    isLoading,
    isError,
    isAuthenticated: !!user && !isError,
  };
}
