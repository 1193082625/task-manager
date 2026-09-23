import type { TaskStatus } from '@/api/tasks'

type TaskStatusAction = {
    label: string
    status: TaskStatus
    danger?: boolean
}

export const TASK_STATUS_ACTIONS: Record<TaskStatus, TaskStatusAction[]> = {
    notStarted: [
        { label: '开始', status: 'doing' },
        { label: '取消', status: 'canceled', danger: true },
    ],
    doing: [
        { label: '暂停', status: 'stopped' },
        { label: '完成', status: 'completed' },
        { label: '取消', status: 'canceled', danger: true },
    ],
    stopped: [
        { label: '恢复', status: 'doing' },
        { label: '取消', status: 'canceled', danger: true },
    ],
    completed: [{ label: '重新打开', status: 'doing' }],
    canceled: [],
}
