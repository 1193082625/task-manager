import { useUserStore } from '@/stores/user'
import { Navigate, Outlet, useLocation } from 'react-router'

function RequireAuth() {
    const token = useUserStore((state) => state.token)
    const location = useLocation()

    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname + location.search + location.hash,
                }}
            ></Navigate>
        )
    }

    return <Outlet />
}

export default RequireAuth
