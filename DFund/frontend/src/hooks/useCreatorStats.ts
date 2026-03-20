import { useQuery } from '@tanstack/react-query';
import { getCreatorStats } from '@/lib/api';

export function useCreatorStats(address: string) {
  return useQuery({
    queryKey: ['creator-stats', address],
    queryFn: () => getCreatorStats(address),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
