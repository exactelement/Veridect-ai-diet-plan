import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes - longer cache
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false, // Don't refetch on network reconnect
    networkMode: 'online', // Only fetch when online
  });

  return {
    user,
    isLoading,
    isError,
    isAuthenticated: !!user && !isError,
  };
}
