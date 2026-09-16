import {http, HttpResponse} from 'msw'

export const handlers = [
    // 模拟 get 请求
    http.get('/api/projects', () => {
        return HttpResponse.json([
            {
                id: 1,
                name: '项目1'
            }
        ])
    }),
    // 模拟 post 请求
    http.post('/api/login', async ({request}) => {
        const {username, password} = await request.json()

        if (username === 'admin' && password === '123456') {
            return HttpResponse.json({ token: 'mock-token' })
        }
        return new HttpResponse(null, {status: 401})
    })
]