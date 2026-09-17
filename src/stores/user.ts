import type { UserInfo } from '@/types/user.type'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type UserStore = {
    token: string
    userInfo?: UserInfo | undefined
    setToken: (token: string) => void
    setUserInfo: (info: UserInfo) => void
    clear: () => void
}

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            token: '',
            setToken: (token: string) => set({ token }),
            setUserInfo: (info: UserInfo) => set({ userInfo: info }),
            clear: () =>
                set({
                    token: '',
                    userInfo: undefined,
                }),
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => localStorage),
        },
    ),
)
