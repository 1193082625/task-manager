import { useUserStore } from '@/stores/user'
import { Navigate, Outlet } from 'react-router'

function RequireAdmin() {
    const systemRole = useUserStore((state) => state.userInfo?.systemRole)
    if (systemRole !== 'ADMIN') {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default RequireAdmin
