import { createBrowserRouter } from 'react-router'
import DefaultLayout from '../layouts/Default'
import { lazy } from 'react'
import RequireAuth from '@/components/RequireAuth'
import RequireAdmin from '@/components/RequireAdmin'

const Login = lazy(() => import('@/views/Login'))
const Dashboard = lazy(() => import('@/views/Dashboard/index'))
const Projects = lazy(() => import('@/views/Projects/index'))
const Tasks = lazy(() => import('@/views/Tasks/index'))
const Users = lazy(() => import('@/views/Users/index'))

const router = createBrowserRouter([
    {
        Component: RequireAuth,
        children: [
            {
                path: '/',
                Component: DefaultLayout,
                children: [
                    {
                        index: true,
                        Component: Dashboard,
                    },
                    {
                        path: 'projects',
                        Component: Projects,
                    },
                    {
                        path: 'tasks',
                        Component: Tasks,
                    },
                    {
                        Component: RequireAdmin,
                        children: [
                            {
                                path: 'users',
                                Component: Users,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        path: 'login',
        Component: Login,
    },
])

export default router
