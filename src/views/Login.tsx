import fetchService, { HttpError } from '@/api/request'
import router from '@/routes'
import { useUserStore } from '@/stores/user'
import { useForm, type SubmitHandler } from 'react-hook-form'
import bgImage from '@/assets/images/login-bg.png'
import type { UserInfo } from '@/types/user.type'
import { useLocation } from 'react-router'

type LoginForm = {
    username: string
    password: string
}

interface LoginResponse {
    token: string
}

function Login() {
    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>()

    const setToken = useUserStore((state) => state.setToken)
    const setUserInfo = useUserStore((state) => state.setUserInfo)

    const location = useLocation()

    const onSubmit: SubmitHandler<LoginForm> = async (data) => {
        clearErrors('root.server')

        try {
            const result = await fetchService.post<LoginResponse>(
                '/api/login',
                data,
            )
            if (!result?.token) {
                throw new Error('登录响应中缺少 token')
            }

            setToken(result.token)
            const userInfo = await fetchService.get<UserInfo>('/api/userInfo')
            if (!userInfo) {
                throw new Error('未获取到用户信息')
            }

            setUserInfo(userInfo)

            const from = location.state?.from

            const target =
                typeof from === 'string' &&
                from.startsWith('/') &&
                !from.startsWith('//') &&
                from !== '/login'
                    ? from
                    : '/'

            console.log(444, target)

            router.navigate(target, { replace: true })
        } catch (error) {
            useUserStore.getState().clear()

            setError('root.server', {
                type: 'server',
                message:
                    error instanceof HttpError && error.status === 401
                        ? '登录认证失败，请检查账户密码后重试'
                        : '登录失败，请检查网络或稍后重试',
            })
        }
    }
    return (
        <div className="w-[100vw] h-[100vh] flex items-center justify-center relative">
            <img src={bgImage} alt="" className="w-full h-full" />
            <div className="flex flex-col gap-[20px] fixed top-[30%] right-[12%] z-10 bg-[rgba(255,255,255,0.6)] px-[30px] py-[40px] rounded-[10px]">
                <h2 className="text-center">欢迎使用任务管理</h2>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-[16px]"
                >
                    <input
                        className="rounded border border-gray-300 px-3 py-2"
                        placeholder="请输入用户名"
                        autoComplete="username"
                        type="text"
                        {...register('username', {
                            required: '请输入用户名',
                            maxLength: {
                                value: 60,
                                message: '用户名不能超过 60 个字符',
                            },
                        })}
                    />
                    {errors.username && <p>{errors.username.message}</p>}

                    <input
                        className="rounded border border-gray-300 px-3 py-2"
                        placeholder="请输入密码"
                        autoComplete="current-password"
                        type="password"
                        {...register('password', {
                            required: '请输入密码',
                            // pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
                        })}
                    />
                    {errors.password && (
                        <p role="alert" className="text-red-500">
                            {errors.password.message}
                        </p>
                    )}

                    {errors.root?.server && (
                        <p role="alert" className="text-red-500">
                            {errors.root.server.message}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="primary bg-blue-500 rounded-[4px] text-[#fff] py-[4px]"
                    >
                        {isSubmitting ? '登录中...' : '登录'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login
