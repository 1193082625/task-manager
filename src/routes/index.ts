import { createBrowserRouter } from "react-router";
import DefaultLayout from "../layouts/Default";
import { lazy } from "react";

const Login = lazy(() => import("@/views/Login"))
const Dashboard = lazy(() => import("@/views/Dashboard/index"))
const Projects = lazy(() => import("@/views/Projects/index"))
const Tasks = lazy(() => import("@/views/Tasks/index"))

const router = createBrowserRouter([
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
                path: "tasks",
                Component: Tasks,
            },
        ]
    },
    {
        path: "login",
        Component: Login
    }
])

export default router