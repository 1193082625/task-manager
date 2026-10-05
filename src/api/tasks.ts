import type { ListResponse, Task, TaskItem } from '@/types/task.type'
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

type ProjectScheduleParams = {
    projectId: string
    startTime: string
    endTime: string
    signal?: AbortSignal
}

export async function getProjectScheduleTasks({
    projectId,
    startTime,
    endTime,
    signal,
}: ProjectScheduleParams): Promise<TaskItem[]> {
    const createQueryString = (page: number) =>
        new URLSearchParams({
            projectId,
            startTime,
            endTime,
            page: String(page),
            limit: '100',
            orderby: 'startTime',
            order: 'asc',
        }).toString()

    const firstPage = await fetchService.get<ListResponse>(
        `/api/tasks?${createQueryString(1)}`,
        { signal },
    )

    if (!firstPage) {
        throw new Error('获取项目排期任务失败')
    }

    const pageCount = Math.ceil(firstPage.total / 100)
    if (pageCount <= 1) {
        return firstPage.list
    }

    const remainingPages = await Promise.all(
        Array.from({ length: pageCount - 1 }, (_, index) =>
            fetchService.get<ListResponse>(
                `/api/tasks?${createQueryString(index + 2)}`,
                { signal },
            ),
        ),
    )

    return [
        ...firstPage.list,
        ...remainingPages.flatMap((page) => page?.list ?? []),
    ]
}
