import { useUserStore } from '@/stores/user'

function Dashboard() {
    const token = useUserStore((state) => state.token)
    return <div>看板 - {token}</div>
}

export default Dashboard
