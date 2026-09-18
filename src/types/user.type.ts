import type { GetProp, TablePaginationConfig, TableProps } from 'antd'

export type UserInfo = {
    name: string
    phone: string
}

export interface User {
    id: string
    name: string
    phone: string
    role: string
}

export type CreateUser = Omit<User, 'id'>

export interface TableParams {
    pagination?: TablePaginationConfig
    filters?: Parameters<GetProp<TableProps, 'onChange'>>[1]
    name?: string
    phone?: string
}

export interface ListResponse {
    list: User[]
    total: number
}
