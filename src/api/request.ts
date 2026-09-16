import { useUserStore } from '@/stores/user'
import { message } from 'antd'

type requestInterceptor = (
    url: string,
    options: RequestInit,
) => void | Promise<void>

type responseInterceptor = (response: Response) => void | Promise<void>

// omit： 从现有类型中剔除指定的属性
// 意思是：沿用原生请求配置，但 Method 和 body 由封装方法管理
type RequestOptions = Omit<RequestInit, 'method' | 'body'>

export class HttpError extends Error {
    public status: number

    constructor(status: number, message: string) {
        super(message)
        this.name = 'HttpError'
        this.status = status
    }
}

class FetchService {
    private requestInterceptors: requestInterceptor[] = []
    private responseInterceptors: responseInterceptor[] = []

    private async runRequestInterceptors(url: string, options: RequestInit) {
        for (const interceptor of this.requestInterceptors) {
            await interceptor(url, options)
        }
    }

    private async runResponseInterceptors(response: Response) {
        for (const interceptor of this.responseInterceptors) {
            await interceptor(response)
        }
    }

    private async _request<T>(
        method: string,
        url: string,
        body?: unknown,
        config: RequestOptions = {},
    ): Promise<T | undefined> {
        // 这里 new Headers() 是因为原生 headers 不仅支持普通对象，还支持数组和 Headers 对象，这样能统一处理。
        const headers = new Headers(config.headers)
        if (body !== undefined && !headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json')
        }
        const options: RequestInit = {
            ...config,
            method,
            headers,
        }

        if (body !== undefined) {
            options.body = JSON.stringify(body)
        }

        await this.runRequestInterceptors(url, options)
        const response = await fetch(url, options)
        await this.runResponseInterceptors(response)
        if (!response.ok) {
            throw new HttpError(
                response.status,
                response.statusText || `请求失败 (${response.status})`,
            )
        }

        // 处理响应成功但无内容情况，比如204
        const text = await response.text()
        if (text.trim() === '') {
            return undefined
        }

        return JSON.parse(text) as T
    }

    get<T>(url: string, config?: RequestOptions): Promise<T | undefined> {
        return this._request('GET', url, undefined, config)
    }

    post<T>(
        url: string,
        body: unknown,
        config?: RequestOptions,
    ): Promise<T | undefined> {
        return this._request('POST', url, body, config)
    }

    put<T>(
        url: string,
        body: unknown,
        config?: RequestOptions,
    ): Promise<T | undefined> {
        return this._request('PUT', url, body, config)
    }

    patch<T>(
        url: string,
        body: unknown,
        config?: RequestOptions,
    ): Promise<T | undefined> {
        return this._request('PATCH', url, body, config)
    }

    delete<T>(url: string, config?: RequestOptions): Promise<T | undefined> {
        return this._request('DELETE', url, undefined, config)
    }

    addRequestInterceptor(interceptor: requestInterceptor) {
        this.requestInterceptors.push(interceptor)
    }

    addResponseInterceptor(interceptor: responseInterceptor) {
        this.responseInterceptors.push(interceptor)
    }
}

const fetchService = new FetchService()

fetchService.addRequestInterceptor((_url, options) => {
    const token = useUserStore.getState().token
    if (token) {
        const headers = new Headers(options.headers)
        headers.set('Authorization', `Bearer ${token}`)
        options.headers = headers
    }
})

fetchService.addResponseInterceptor(async (response) => {
    switch (response.status) {
        case 400: {
            const text = await response.clone().text()
            let errorMessage = '请求参数错误'

            if (text.trim()) {
                try {
                    const data = JSON.parse(text)

                    if (typeof data === 'string' && data.trim()) {
                        errorMessage = data
                    } else if (data && typeof data === 'object') {
                        if (
                            typeof data.message === 'string' &&
                            data.message.trim()
                        ) {
                            errorMessage = data.message
                        }
                    }
                } catch {
                    // 非 JSON 响应保留默认提示
                }
            }
            message.error(errorMessage)
            break
        }
        case 401:
            useUserStore.getState().clearToken()
            // 在单页应用内部切换
            // if (router.state.location.pathname !== '/login') {
            //     await router.navigate('/login', {replace: true})
            // }
            // 以刷新页面方式切换
            if (window.location.pathname !== '/login') {
                window.location.replace('/login')
            }
            break
        case 500:
            message.error('服务端错误，请稍后再试！')
    }
})

export default fetchService
