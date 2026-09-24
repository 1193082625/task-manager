import type { GetProp, TablePaginationConfig, TableProps } from 'antd'

export type SystemRole = 'USER' | 'ADMIN'

export interface User {
    id: string
    name: string
    phone: string
    role: string
    systemRole: SystemRole
}

export type UserInfo = User

export type CreateUser = Omit<User, 'id' | 'systemRole'> & {
    password: string
}

export type UpdateUser = Omit<User, 'id' | 'systemRole'>

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
