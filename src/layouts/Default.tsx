import { clearSession } from '@/api/clearSession'
import ChangePasswordModal from '@/components/ChangePasswordModal'
import router from '@/routes'
import { useUserStore } from '@/stores/user'
import { KeyOutlined, LogoutOutlined, RightOutlined } from '@ant-design/icons'
import { Dropdown, type MenuProps } from 'antd'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'

function DefaultLayout() {
    const userInfo = useUserStore((state) => state.userInfo)
    const [changePasswordOpen, setChangePasswordOpen] = useState(false)

    const navData = [
        {
            label: '首页',
            name: 'home',
            link: '/',
        },
        {
            label: '项目管理',
            name: 'projects',
            link: '/projects',
        },
        {
            label: '任务管理',
            name: 'tasks',
            link: '/tasks',
        },
        ...(userInfo?.systemRole === 'ADMIN'
            ? [
                  {
                      label: '人员管理',
                      name: 'users',
                      link: '/users',
                  },
              ]
            : []),
    ]

    const handleLogout = () => {
        clearSession()
        router.navigate('/login', { replace: true })
    }

    const items: MenuProps['items'] = [
        {
            key: 'change-password',
            icon: <KeyOutlined />,
            label: '修改密码',
            onClick: () => setChangePasswordOpen(true),
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: '退出登录',
            danger: true,
            onClick: handleLogout,
        },
    ]

    return (
        <div className="flex flex-col w-full h-[100vh] bg-[#F2F4F7] overflow-hidden">
            <header className="shrink-0 bg-white flex items-center justify-between px-[20px] border-b border-[#F3F4F6]">
                {/* logo */}
                <div
                    style={{
                        padding: '22px 20px 18px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 9,
                        }}
                    >
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                background: '#2563EB',
                                borderRadius: 8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <svg
                                width="17"
                                height="17"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="9 11 12 14 22 4" />
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                            </svg>
                        </div>
                        <span
                            style={{
                                fontSize: 16,
                                fontWeight: 700,
                                color: '#111827',
                                letterSpacing: '-0.3px',
                            }}
                        >
                            TaskFlow
                        </span>
                    </div>
                </div>

                {/* user */}
                <div className="flex items-center gap-[10px]">
                    <Dropdown
                        menu={{ items }}
                        placement="bottom"
                        arrow={{ pointAtCenter: true }}
                    >
                        <div className="cursor-pointer">
                            欢迎你，{userInfo?.name} <RightOutlined />
                        </div>
                    </Dropdown>
                </div>
            </header>
            <div className="flex-1 flex min-h-0 min-w-0">
                <aside className="w-[240px] shrink-0 overflow-y-auto bg-white pt-[20px] px-[12px] border-r border-[#F3F4F6]">
                    <nav className="flex flex-col">
                        {navData.map((item) => {
                            return (
                                <NavLink
                                    key={item.name}
                                    to={item.link}
                                    end={item.link === '/'}
                                    className={({ isActive }) =>
                                        `rounded-md px-[14px] py-[10px] transition-colors ${
                                            isActive
                                                ? 'bg-blue-100 text-blue-700 font-semibold'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            )
                        })}
                    </nav>
                </aside>
                <main className="flex-1 min-w-0 min-h-0 overflow-auto m-[14px]  bg-white rounded-[8px] p-[20px]">
                    <Outlet />
                </main>
            </div>
            {/* <footer>底部</footer> */}

            <ChangePasswordModal
                open={changePasswordOpen}
                onClose={() => setChangePasswordOpen(false)}
            />
        </div>
    )
}

export default DefaultLayout
