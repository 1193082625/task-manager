import type { CreateComment, TaskComment } from '@/types/comment.type'
import fetchService from './request'

export async function getTaskComments(
    taskId: string,
    signal?: AbortSignal,
): Promise<TaskComment[]> {
    const result = await fetchService.get<TaskComment[]>(
        `/api/tasks/${taskId}/comments`,
        { signal },
    )

    if (!result) {
        throw new Error('获取评论列表失败')
    }

    return result
}

export async function createTaskComment(
    taskId: string,
    data: CreateComment,
): Promise<TaskComment> {
    const result = await fetchService.post<TaskComment>(
        `/api/tasks/${taskId}/comments`,
        data,
    )

    if (!result) {
        throw new Error('发布评论后未收到评论数据')
    }

    return result
}

export async function deleteTaskComment(
    taskId: string,
    commentId: string,
): Promise<void> {
    await fetchService.delete(`/api/tasks/${taskId}/comments/${commentId}`)
}
