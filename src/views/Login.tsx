import fetchService, { HttpError } from '@/api/request'
import router from '@/routes'
import { useUserStore } from '@/stores/user'
import { useForm, type SubmitHandler } from 'react-hook-form'
import bgImage from '@/assets/images/login-bg.png'
import type { UserInfo } from '@/types/user.type'
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
                        placeholder="请输入手机号"
                        autoComplete="username"
                        inputMode="numeric"
                        maxLength={11}
                        type="tel"
                        {...register('phone', {
                            required: '请输入手机号',
                            pattern: {
                                value: /^1[3-9]\d{9}$/,
                                message: '请输入正确的手机号',
                            },
                        })}
                    />
                    {errors.phone && (
                        <p role="alert" className="text-red-500">
                            {errors.phone.message}
                        </p>
                    )}

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
