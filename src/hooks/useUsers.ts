import { getAllUsers } from '@/api/users'
import { useQuery } from '@tanstack/react-query'

export function useUsers() {
    return useQuery({
        queryKey: ['users', 'all'],
        queryFn: ({ signal }) => getAllUsers(signal),
        staleTime: 5 * 60 * 1000, // 表示数据在5分钟内被视为新鲜数据，不是定时刷新间隔
    })
}
