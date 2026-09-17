import type { ProjectDetail, ProjectItem } from '@/types/project.type'
import type { TaskItem } from '@/types/task.type'
import type { User } from '@/types/user.type'
import { http, HttpResponse } from 'msw'

type LoginBody = {
    username: string
    password: string
}

type listQueryParams = {
    current: number
    pageSize: number
}

type CreateProjectItem = Omit<ProjectDetail, 'id'>

const projectList: ProjectItem[] = [
    {
        id: '1',
        name: '项目1',
        startTime: '2026-09-01',
        endTime: '2026-09-30',
        realStartTime: '2026-09-01',
        realEndTime: '2026-09-30',
        stage: 'setup',
        status: 'doing',
        principalId: '1',
        taskCount: 3,
        completedTaskCount: 0,
    },
    {
        id: '2',
        name: '项目2',
        startTime: '2026-09-05',
        endTime: '2026-09-27',
        realStartTime: '2026-09-05',
        realEndTime: '2026-09-27',
        stage: 'setup',
        status: 'notStarted',
        principalId: '1',
        taskCount: 3,
        completedTaskCount: 0,
    },
    {
        id: '3',
        name: '项目3',
        startTime: '2026-09-01',
        endTime: '2026-09-30',
        realStartTime: '2026-09-01',
        realEndTime: '2026-09-30',
        stage: 'setup',
        status: 'doing',
        principalId: '1',
        taskCount: 3,
        completedTaskCount: 0,
    },
    {
        id: '4',
        name: '项目4',
        startTime: '2026-09-01',
        endTime: '2026-09-30',
        realStartTime: '2026-09-01',
        realEndTime: '2026-09-30',
        stage: 'setup',
        status: 'completed',
        principalId: '1',
        taskCount: 3,
        completedTaskCount: 0,
    },
    {
        id: '5',
        name: '项目5',
        startTime: '2026-09-01',
        endTime: '2026-09-30',
        realStartTime: '2026-09-01',
        realEndTime: '2026-09-30',
        stage: 'setup',
        status: 'doing',
        principalId: '1',
        taskCount: 3,
        completedTaskCount: 0,
    },
    {
        id: '6',
        name: '项目6',
        startTime: '2026-09-01',
        endTime: '2026-09-30',
        realStartTime: '2026-09-01',
        realEndTime: '2026-09-30',
        stage: 'setup',
        status: 'stopped',
        principalId: '1',
        taskCount: 3,
        completedTaskCount: 0,
    },
    {
        id: '7',
        name: '项目7',
        startTime: '2026-09-01',
        endTime: '2026-09-30',
        realStartTime: '2026-09-01',
        realEndTime: '2026-09-30',
        stage: 'setup',
        status: 'stopped',
        principalId: '1',
        taskCount: 3,
        completedTaskCount: 0,
    },
]

const taskList: TaskItem[] = [
    {
        id: '1',
        name: '任务1',
        projectId: '1',
        principalId: '1',
        startTime: '2026-09-01',
        endTime: '2026-09-30',
        realStartTime: '',
        realEndTime: '',
        status: 'doing',
    },
    {
        id: '2',
        name: '任务2',
        projectId: '1',
        principalId: '1',
        startTime: '2026-09-01',
        endTime: '2026-09-30',
        realStartTime: '',
        realEndTime: '',
        status: 'doing',
    },
    {
        id: '3',
        name: '任务3',
        projectId: '1',
        principalId: '1',
        startTime: '2026-09-01',
        endTime: '2026-09-30',
        realStartTime: '',
        realEndTime: '',
        status: 'doing',
    },
    {
        id: '4',
        name: '任务4',
        projectId: '1',
        principalId: '1',
        startTime: '2026-09-01',
        endTime: '2026-09-30',
        realStartTime: '',
        realEndTime: '',
        status: 'doing',
    },
    {
        id: '5',
        name: '任务5',
        projectId: '1',
        principalId: '1',
        startTime: '2026-09-01',
        endTime: '2026-09-30',
        realStartTime: '',
        realEndTime: '',
        status: 'doing',
    },
    {
        id: '6',
        name: '任务6',
        projectId: '1',
        principalId: '1',
        startTime: '2026-09-01',
        endTime: '2026-09-30',
        realStartTime: '',
        realEndTime: '',
        status: 'doing',
    },
    {
        id: '7',
        name: '任务7',
        projectId: '1',
        principalId: '1',
        startTime: '2026-09-01',
        endTime: '2026-09-30',
        realStartTime: '',
        realEndTime: '',
        status: 'doing',
    },
]

const userList: User[] = [
    {
        id: '1',
        name: '张三',
        phone: '15378764444',
        role: 'designer',
    },
    {
        id: '2',
        name: '张兰',
        phone: '15370000444',
        role: 'developer',
    },
    {
        id: '3',
        name: '李清',
        phone: '15500000000',
        role: 'tester',
    },
    {
        id: '4',
        name: '李清',
        phone: '15500000000',
        role: 'tester',
    },
    {
        id: '5',
        name: '李清',
        phone: '15500000000',
        role: 'tester',
    },
    {
        id: '6',
        name: '李清',
        phone: '15500000000',
        role: 'tester',
    },
    {
        id: '7',
        name: '李清',
        phone: '15500000000',
        role: 'tester',
    },
]

export const handlers = [
    // 模拟 get 请求
    http.get('/api/userInfo', async ({ request }) => {
        console.log('mock handler', request)
        return HttpResponse.json({
            name: 'admin',
            phone: '15345642456',
        })
    }),
    http.get('/api/users', async ({ request }) => {
        const url = new URL(request.url)

        const searchParams = url.searchParams
        const page = Number(searchParams.get('page') ?? '1')
        const limit = Number(searchParams.get('limit') ?? '10')
        const name = searchParams.get('name')?.trim() ?? ''
        const phone = searchParams.get('phone')

        let filterList = userList.filter((item) => item.name.includes(name))

        if (phone) {
            filterList = filterList.filter((item) => item.phone.includes(phone))
        }

        const start = (page - 1) * limit
        const list = filterList.slice(start, start + limit)

        return HttpResponse.json({
            list: list,
            total: filterList.length,
        })
    }),
    http.get('/api/users/all', () => {
        return HttpResponse.json(userList)
    }),
    http.get('/api/userInfo/1', async ({ request }) => {
        console.log('mock handler', request)
        return HttpResponse.json({
            name: 'user1',
            phone: '15345642455',
        })
    }),
    http.get<never, listQueryParams>('/api/projects', async ({ request }) => {
        const url = new URL(request.url)

        const searchParams = url.searchParams
        const page = Number(searchParams.get('page') ?? '1')
        const limit = Number(searchParams.get('limit') ?? '10')
        const name = searchParams.get('name')?.trim() ?? ''
        const status = searchParams.get('status')
        const stage = searchParams.get('stage')
        const principalId = searchParams.get('principalId')
        const orderby = searchParams.get('orderby')
        const order = searchParams.get('order')

        const startTime = searchParams.get('startTime')
        const endTime = searchParams.get('endTime')

        let filterList = projectList.filter((item) => item.name.includes(name))

        if (status) {
            filterList = filterList.filter((item) => item.status === status)
        }

        if (stage) {
            filterList = filterList.filter((item) => item.stage === stage)
        }

        if (principalId) {
            filterList = filterList.filter(
                (item) => item.principalId === principalId,
            )
        }

        if (startTime) {
            filterList = filterList.filter((item) => item.endTime >= startTime)
        }

        if (endTime) {
            filterList = filterList.filter((item) => item.startTime <= endTime)
        }

        const sortFields = [
            'startTime',
            'endTime',
            'realStartTime',
            'realEndTime',
            'taskCount',
        ] as const

        // 从允许排序的字段中查找，避免随意访问对象属性
        const sortField = sortFields.find((field) => field === orderby)

        if (sortField && (order === 'asc' || order === 'desc')) {
            const direction = order === 'asc' ? 1 : -1

            filterList.sort((a, b) => {
                const aValue = a[sortField]
                const bValue = b[sortField]

                const aEmpty = aValue === null || aValue === ''
                const bEmpty = bValue === null || bValue === ''

                if (aEmpty && bEmpty) {
                    return a.id.localeCompare(b.id)
                }

                if (aEmpty) return 1
                if (bEmpty) return -1

                const comparison =
                    typeof aValue === 'number' && typeof bValue === 'number'
                        ? aValue - bValue
                        : String(aValue).localeCompare(String(bValue))

                return comparison * direction || a.id.localeCompare(b.id)
            })
        }

        const start = (page - 1) * limit
        const list = filterList.slice(start, start + limit)

        return HttpResponse.json({
            list: list,
            total: filterList.length,
        })
    }),
    http.get('/api/projects/1', () => {
        const project = projectList.find((item) => item.id === '1')
        return HttpResponse.json({
            ...project,
            description: '项目简介',
            memberIds: ['1', '2'],
        })
    }),
    http.post<never, CreateProjectItem>(
        '/api/projects',
        async ({ request }) => {
            const data = await request.json()
            const projectId = (projectList.length + 1).toString()
            const newProject = {
                id: projectId,
                ...data,
            }
            projectList.push(newProject)
            return HttpResponse.json(newProject)
        },
    ),
    http.patch<never, CreateProjectItem>(
        '/api/project/2',
        async ({ request }) => {
            const data = await request.json()
            const projectIndex = projectList.findIndex(
                (item) => item.id === '2',
            )
            const newProject = {
                ...projectList[projectIndex],
                ...data,
            }
            projectList[projectIndex] = newProject
            return HttpResponse.json({
                result: 'success',
            })
        },
    ),
    http.get('/api/tasks', () => {
        return HttpResponse.json({
            list: taskList,
            total: taskList.length,
        })
    }),
    // 模拟 post 请求
    // http.post<路径参数类型，请求体类型，响应体类型>
    // never 表示不使用路径参数（比如 /api/user/userid , 其中 userId 就是路径参数）
    http.post<never, LoginBody>('/api/login', async ({ request }) => {
        const { username, password } = await request.json()

        if (username === 'admin' && password === '123456') {
            return HttpResponse.json({ token: 'mock-token' })
        }
        return new HttpResponse(null, { status: 401 })
    }),
]
