import type { Task, TaskItem } from '@/types/task.type'
import fetchService from './request'

export type TaskStatus = TaskItem['status']

export type ChangeTaskStatusParams = {
    id: string
    status: TaskStatus
}

export async function changeTaskStatus({
    id,
    status,
}: ChangeTaskStatusParams): Promise<Task> {
    const result = await fetchService.patch<Task>(`/api/tasks/${id}/status`, {
        status,
    })

    if (!result) {
        throw new Error('修改任务状态后未收到任务数据')
    }

    return result
}
