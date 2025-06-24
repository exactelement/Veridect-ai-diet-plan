import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes - reduce excessive API calls
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnMount: false, // Don't always refetch on mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
