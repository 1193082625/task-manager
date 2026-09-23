import { changeTaskStatus } from '@/api/tasks'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useTaskStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: changeTaskStatus,
        retry: false,

        onSuccess: async (task) => {
            // 接口返回了完整任务，直接更新详情缓存
            queryClient.setQueryData(['task-detail', task.id], task)

            // 任务状态会影响列表，以及项目的完成数量和实际时间
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['tasks'],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['projects'],
                }),
                ...(task.projectId
                    ? [
                          queryClient.invalidateQueries({
                              queryKey: ['project-detail', task.projectId],
                              exact: true,
                          }),
                      ]
                    : []),
            ])
        },
    })
}
