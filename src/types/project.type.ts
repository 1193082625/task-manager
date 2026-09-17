import type { GetProp, TableProps } from 'antd'
import type {
    SorterResult,
    TablePaginationConfig,
} from 'antd/es/table/interface'

export interface ProjectItem {
    id: string
    name: string
    startTime: string // 计划开始时间
    endTime: string // 计划结束时间
    realStartTime: string | null // 项目真实开始时间
    realEndTime: string | null // 项目真实结束时间
    stage: 'setup' | 'design' | 'development' | 'test' // 阶段 ： 立项、设计、开发、测试
    status: 'notStarted' | 'doing' | 'stopped' | 'completed' | 'canceled' // 状态 未开始、进行中、已暂停、已完成、已取消
    principalId: string // 项目负责人
    taskCount: number
    completedTaskCount: number
}

export interface ProjectDetail extends ProjectItem {
    description: string
    memberIds: string[] // 项目成员, 从 task 列表中自动统计参与人员
}

export interface TableParams {
    pagination?: TablePaginationConfig
    sortField?: SorterResult<unknown>['field']
    sortOrder?: SorterResult<unknown>['order']
    filters?: Parameters<GetProp<TableProps, 'onChange'>>[1]
    name?: string
    startTime?: string
    endTime?: string
    stage?: ProjectItem['stage']
    status?: ProjectItem['status']
    principalId?: string
}

export interface ListResponse {
    list: ProjectItem[]
    total: number
}
