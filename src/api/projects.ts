import type {
    AddProjectMember,
    ProjectItem,
    ProjectMember,
} from '@/types/project.type'
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

export async function getProjectMembers(
    projectId: string,
    signal?: AbortSignal,
): Promise<ProjectMember[]> {
    const result = await fetchService.get<ProjectMember[]>(
        `/api/projects/${projectId}/members`,
        { signal },
    )

    if (!result) {
        throw new Error('获取项目成员失败')
    }
    return result
}

export async function addProjectMember(
    projectId: string,
    data: AddProjectMember,
): Promise<ProjectMember> {
    const result = await fetchService.post<ProjectMember>(
        `/api/projects/${projectId}/members`,
        data,
    )

    if (!result) {
        throw new Error('添加项目成员失败')
    }

    return result
}

export async function removeProjectMember(
    projectId: string,
    userId: string,
): Promise<void> {
    await fetchService.delete<void>(
        `/api/projects/${projectId}/members/${userId}`,
    )
}
