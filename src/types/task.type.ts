export interface TaskItem {
    id: string
    name: string
    projectId: string | null
    principalId: string // 负责人
    startTime: string
    endTime: string
    realStartTime: string | null
    realEndTime: string | null
    status: 'notStarted' | 'doing' | 'stopped' | 'completed' | 'canceled' // 状态 未开始、进行中、已暂停、已完成、已取消
}

export interface Task extends TaskItem {
    description: string
}
