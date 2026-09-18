import type { GetProp, TablePaginationConfig, TableProps } from 'antd'
import type { SorterResult } from 'antd/es/table/interface'

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

export type CreateTask = Omit<Task, 'id'>

export interface TableParams {
    pagination?: TablePaginationConfig
    sortField?: SorterResult<unknown>['field']
    sortOrder?: SorterResult<unknown>['order']
    filters?: Parameters<GetProp<TableProps, 'onChange'>>[1]
    name?: string
    startTime?: string
    endTime?: string
}

export interface ListResponse {
    list: TaskItem[]
    total: number
}
