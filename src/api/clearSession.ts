import { useUserStore } from '@/stores/user'
import { queryClient } from './queryClient'

export function clearSession() {
    useUserStore.getState().clear()
    queryClient.clear()
}
