import fetchService, { HttpError } from '@/api/request'
import bgImage from '@/assets/images/login-bg.png'
import router from '@/routes'
import { useUserStore } from '@/stores/user'
import type { UserInfo } from '@/types/user.type'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Alert, Button, Form, Input } from 'antd'
import { useState } from 'react'
import { useLocation } from 'react-router'

type LoginForm = {
    phone: string
    password: string
}

interface LoginResponse {
    token: string
    user: UserInfo
}

function Login() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [serverError, setServerError] = useState<string>()

    const setToken = useUserStore((state) => state.setToken)
    const setUserInfo = useUserStore((state) => state.setUserInfo)
    const location = useLocation()

    const handleSubmit = async (data: LoginForm) => {
        if (isSubmitting) return

        setIsSubmitting(true)
        setServerError(undefined)

        try {
            const result = await fetchService.post<LoginResponse>(
                '/api/auth/login',
                data,
            )

            if (!result?.token || !result.user) {
                throw new Error('登录响应不完整')
            }

            setToken(result.token)
            setUserInfo(result.user)

            const from = location.state?.from

            const target =
                typeof from === 'string' &&
                from.startsWith('/') &&
                !from.startsWith('//') &&
                from !== '/login'
                    ? from
                    : '/'

            router.navigate(target, { replace: true })
        } catch (error) {
            useUserStore.getState().clear()

            setServerError(
                error instanceof HttpError && error.status === 401
                    ? '登录认证失败，请检查手机号和密码'
                    : '登录失败，请检查网络或稍后重试',
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="relative flex h-[100vh] w-[100vw] items-center justify-center">
            <img src={bgImage} alt="" className="h-full w-full object-cover" />

            <div className="fixed top-[30%] right-[12%] z-10 w-[360px] rounded-[10px] bg-[rgba(255,255,255,0.8)] px-[30px] py-[40px]">
                <h2 className="mb-[24px] text-center">欢迎使用任务管理</h2>

                <Form<LoginForm>
                    layout="vertical"
                    requiredMark={false}
                    onFinish={handleSubmit}
                    onValuesChange={() => {
                        if (serverError) {
                            setServerError(undefined)
                        }
                    }}
                >
                    <Form.Item
                        name="phone"
                        label=""
                        rules={[
                            {
                                required: true,
                                message: '请输入手机号',
                            },
                            {
                                pattern: /^1[3-9]\d{9}$/,
                                message: '请输入正确的手机号',
                            },
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="请输入手机号"
                            autoComplete="username"
                            inputMode="numeric"
                            maxLength={11}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label=""
                        rules={[
                            {
                                required: true,
                                message: '请输入密码',
                            },
                            {
                                min: 8,
                                message: '密码不能少于 8 个字符',
                            },
                            {
                                max: 128,
                                message: '密码不能超过 128 个字符',
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="请输入密码"
                            autoComplete="current-password"
                        />
                    </Form.Item>

                    {serverError && (
                        <Alert
                            className="mb-[16px]"
                            type="error"
                            showIcon
                            message={serverError}
                        />
                    )}

                    <Button
                        block
                        type="primary"
                        htmlType="submit"
                        loading={isSubmitting}
                    >
                        登录
                    </Button>
                </Form>
            </div>
        </div>
    )
}

export default Login
