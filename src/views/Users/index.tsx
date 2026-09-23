import fetchService from '@/api/request'
import {
    Button,
    Empty,
    Form,
    Input,
    message,
    Popconfirm,
    Table,
    type GetProp,
    type TableProps,
} from 'antd'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ListResponse, TableParams } from '@/types/user.type'
import { USER_ROLES } from '@/constant'
import UserDetail from './Detail'
import { PlusOutlined } from '@ant-design/icons'
import UserForm from './Form'
import type { User } from '@/types/user.type'

type UserSearchValues = {
    name?: string
    phone?: string
}

export type ColumnsType<T extends object = object> = TableProps<T>['columns']
export type TablePaginationConfig = Exclude<
    GetProp<TableProps, 'pagination'>,
    boolean
>
const isNonNullable = <T,>(val: T): val is NonNullable<T> => {
    return val !== undefined && val !== null
}

const getUserParams = (params: TableParams) => {
    const { pagination, filters, ...restParams } = params
    const result: Record<string, unknown> = {}

    result.limit = pagination?.pageSize
    result.page = pagination?.current

    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (isNonNullable(value)) {
                result[key] = value
            }
        })
    }

    // 处理其他参数
    Object.entries(restParams).forEach(([key, value]) => {
        if (isNonNullable(value)) {
            result[key] = value
        }
    })

    return result
}

function Users() {
    const [form] = Form.useForm()
    const [detailOpen, setDetailOpen] = useState(false)
    const [formOpen, setFormOpen] = useState(false)
    const [activeUserId, setActiveUserId] = useState<string | undefined>()
    const [editUserId, setEditUserId] = useState<string>()
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    })
    const queryClient = useQueryClient()

    const columns: ColumnsType<User> = [
        {
            title: '成员名称',
            dataIndex: 'name',
            fixed: 'start',
            ellipsis: true,
            width: 120,
        },
        {
            title: '电话',
            dataIndex: 'phone',
            width: 180,
        },
        {
            title: '角色',
            dataIndex: 'role',
            width: 180,
            render: (value: string) => {
                return USER_ROLES.find((role) => role.value === value)?.label
            },
        },
        {
            title: '操作',
            key: 'action',
            width: 240,
            fixed: 'end',
            render: (_, record: User) => (
                <div className="flex flex-wrap">
                    <Button type="link" onClick={() => handleDetail(record.id)}>
                        详情
                    </Button>
                    <Button type="link" onClick={() => handleEdit(record.id)}>
                        编辑
                    </Button>
                    <Popconfirm
                        title="删除成员"
                        description={`确认删除成员-${record.name}吗？`}
                        onConfirm={() => handleDelete(record.id)}
                        okText="删除"
                        cancelText="取消"
                    >
                        <Button type="link" danger>
                            删除
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ]

    const toURLSearchParams = (record: Record<string, unknown>) => {
        const params = new URLSearchParams()

        for (const [key, value] of Object.entries(record)) {
            if (value === undefined || value === null) {
                continue
            }

            // 数组会变成重复参数，例如 type=design&type=test
            if (Array.isArray(value)) {
                value.forEach((item) => {
                    params.append(key, String(item))
                })
            } else {
                params.set(key, String(value))
            }
        }

        return params
    }

    const queryString = toURLSearchParams(getUserParams(tableParams)).toString()

    const { data, isFetching, error } = useQuery({
        queryKey: ['users', queryString],
        queryFn: async ({ signal }) => {
            const result = await fetchService.get<ListResponse>(
                `/api/users?${queryString}`,
                { signal }, // 用于取消请求
            )

            console.log('加载用户列表', result)

            if (!result) {
                throw new Error('暂无项目')
            }

            return result
        },
        // 调试阶段失败后直接展示错误
        retry: false,
    })

    const handleTableChange: TableProps<User>['onChange'] = (
        pagination,
        filters,
    ) => {
        setTableParams((prev) => ({
            ...prev,
            pagination: {
                current: pagination.current,
                pageSize: pagination.pageSize,
            },
            filters,
        }))
    }

    const handleFinish = (formData: UserSearchValues) => {
        console.log('触发了查询', formData)
        setTableParams((prev) => ({
            ...prev,
            name: formData.name,
            phone: formData.phone,
            pagination: {
                ...prev.pagination,
                current: 1,
                pageSize: prev.pagination?.pageSize ?? 10,
            },
        }))
    }

    const handleRest = () => {
        form.resetFields()
        setTableParams({
            pagination: {
                current: 1,
                pageSize: 10,
            },
        })
    }

    const handleDetail = (id: string) => {
        setActiveUserId(id)
        setDetailOpen(true)
    }

    const handleEdit = (id: string) => {
        setEditUserId(id)
        setFormOpen(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await fetchService.delete(`/api/users/${id}`)
        } catch {
            message.error('删除失败')
            return
        }
        message.success('删除成功')

        const current = tableParams.pagination?.current ?? 1
        const shouldGoBack = current > 1 && data?.list.length === 1

        if (shouldGoBack) {
            setTableParams((prev) => ({
                ...prev,
                pagination: {
                    ...prev.pagination,
                    current: current - 1,
                },
            }))
        }

        await queryClient.invalidateQueries({
            queryKey: ['users'],
        })
    }

    const handleDetailClose = () => {
        setDetailOpen(false)
    }

    const handleCreateUser = () => {
        setFormOpen(true)
    }

    const handleFormClose = async () => {
        setEditUserId(undefined)
        setFormOpen(false)
    }

    const handleFormSaved = async () => {
        await Promise.all([
            queryClient.invalidateQueries(
                { queryKey: ['users'] },
                { throwOnError: true },
            ),
            ...(editUserId
                ? [
                      queryClient.resetQueries(
                          {
                              queryKey: ['user-detail', editUserId],
                              exact: true,
                          },
                          { throwOnError: true },
                      ),
                  ]
                : []),
        ])
    }

    return (
        <>
            <div className="w-full min-h-full flex flex-col gap-[20px]">
                <div className="flex items-center justify-between">
                    <h2>成员管理</h2>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreateUser}
                    >
                        添加成员
                    </Button>
                </div>
                <Form<UserSearchValues>
                    layout="inline"
                    onFinish={handleFinish}
                    form={form}
                    className="flex item-center gap-[16px]"
                >
                    <Form.Item name="name" label="">
                        <Input
                            placeholder="请输入成员姓名"
                            allowClear
                            maxLength={60}
                        />
                    </Form.Item>

                    <Form.Item name="phone">
                        <Input placeholder="请输入成员手机号" allowClear />
                    </Form.Item>

                    <Form.Item label={null}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="mr-[14px]"
                        >
                            查询
                        </Button>
                        <Button htmlType="button" onClick={handleRest}>
                            重置
                        </Button>
                    </Form.Item>
                </Form>

                {error && (
                    <p role="alert" className="text-red-500">
                        {error.message}
                    </p>
                )}
                <Table<User>
                    columns={columns}
                    rowKey="id"
                    dataSource={data?.list ?? []}
                    pagination={{
                        ...tableParams.pagination,
                        total: data?.total ?? 0,
                        hideOnSinglePage: true,
                    }}
                    loading={isFetching}
                    onChange={handleTableChange}
                    scroll={{ x: 1600 }}
                    locale={{
                        emptyText: <Empty />,
                    }}
                />
            </div>
            <UserDetail
                id={activeUserId}
                detailOpen={detailOpen}
                onClose={handleDetailClose}
            />
            <UserForm
                id={editUserId}
                formOpen={formOpen}
                onClose={handleFormClose}
                onSaved={handleFormSaved}
            />
        </>
    )
}

export default Users
