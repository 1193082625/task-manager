import { NavLink, Outlet } from "react-router"

function DefaultLayout() {
    return (
        <div className="flex flex-col w-full h-[100vh]">
            <header>
                头部
            </header>
            <div className="flex-1 flex">
                <aside className="w-[25%]">
                    <nav className="flex flex-col">
                        <NavLink to="/" end>首页</NavLink>
                        <NavLink to="/projects">项目管理</NavLink>
                        <NavLink to="/tasks">任务管理</NavLink>
                    </nav>
                </aside>
                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
            <footer>底部</footer>
        </div>
    )
}

export default DefaultLayout