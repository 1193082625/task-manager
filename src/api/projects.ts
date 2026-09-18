import type { ProjectItem } from '@/types/project.type'
import fetchService from './request'

export async function getAllProjects(
    signal?: AbortSignal,
): Promise<ProjectItem[]> {
    const result = await fetchService.get<ProjectItem[]>('/api/projects/all', {
        signal,
    })

    if (!result) {
        throw new Error('获取项目列表失败')
    }

    return result
}
