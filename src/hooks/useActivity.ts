import { useQuery } from '@tanstack/react-query';
import { getActivity } from '@/api/activity';

export function useActivity(todoId: string, enabled = true) {
  return useQuery({
    queryKey: ['activity', todoId],
    queryFn: () => getActivity(todoId),
    enabled: enabled && Boolean(todoId),
  });
}
