import type { User } from '@/types/user.type'
import fetchService from './request'

export async function getAllUsers(signal?: AbortSignal): Promise<User[]> {
    const result = await fetchService.get<User[]>('/api/users/all', { signal })

    if (!result) {
        throw new Error('获取用户列表失败')
    }

    return result
}
