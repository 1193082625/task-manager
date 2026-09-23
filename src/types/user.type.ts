import type { GetProp, TablePaginationConfig, TableProps } from 'antd'

export interface User {
    id: string
    name: string
    phone: string
    role: string
}

export type UserInfo = User

export type CreateUser = Omit<User, 'id'> & {
    password: string
}

export type UpdateUser = Omit<User, 'id'>

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
