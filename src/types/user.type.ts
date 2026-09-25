import type { GetProp, TablePaginationConfig, TableProps } from 'antd'

export type SystemRole = 'USER' | 'ADMIN'

export interface User {
    id: string
    name: string
    phone: string
    role: string
    systemRole: SystemRole
    isActive: boolean
}

export type UserInfo = User

export type CreateUser = Omit<User, 'id' | 'systemRole' | 'isActive'> & {
    password: string
}

export type UpdateUser = Omit<User, 'id' | 'systemRole' | 'isActive'>

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
