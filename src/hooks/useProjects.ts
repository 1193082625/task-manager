import { getAllProjects } from '@/api/projects'
import { useQuery } from '@tanstack/react-query'

export function useProjects() {
    return useQuery({
        queryKey: ['projects', 'all'],
        queryFn: ({ signal }) => getAllProjects(signal),
        staleTime: 5 * 60 * 1000, // 表示数据在5分钟内被视为新鲜数据，不是定时刷新间隔
    })
}
