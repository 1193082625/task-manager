import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type UserStore = {
    token: string
    setToken: (token: string) => void
    clearToken: () => void
}

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            token: '',
            setToken: (token: string) => set({ token }),
            clearToken: () => set({ token: '' }),
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => localStorage),
        },
    ),
)
