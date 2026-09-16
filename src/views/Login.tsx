import fetchService from '@/api/request'
import router from '@/routes'
import { useUserStore } from '@/stores/user'
import { useForm, type SubmitHandler } from 'react-hook-form'

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
        formState: { errors },
    } = useForm<LoginForm>()

    const setToken = useUserStore((state) => state.setToken)

    const onSubmit: SubmitHandler<LoginForm> = async (data) => {
        const result = await fetchService.post<LoginResponse>(
            '/api/login',
            data,
        )
        if (result?.token) {
            setToken(result.token)
            router.navigate('/', { replace: true })
        }
    }
    return (
        <div className="w-[100vw] h-[100vh] flex items-center justify-center">
            <div className="flex flex-col gap-[10px]">
                <h2 className="text-center">登陆</h2>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-[10px]"
                >
                    <input
                        className="rounded border px-3 py-2"
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
                        className="rounded border px-3 py-2"
                        placeholder="请输入密码"
                        autoComplete="current-password"
                        type="password"
                        {...register('password', {
                            required: '请输入密码',
                            // pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
                        })}
                    />
                    {errors.password && <p>{errors.password.message}</p>}

                    <button
                        type="submit"
                        className="bg-blue-600 text-[#fff] cursor-pointer"
                    >
                        登录
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login
