import fetchService from '@/api/request'
import {
    Button,
    DatePicker,
    Empty,
    Form,
    Input,
    message,
    Popconfirm,
    Select,
    Table,
    Tag,
    type GetProp,
    type TableProps,
} from 'antd'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ListResponse, TableParams } from '@/types/task.type'
import { PlusOutlined } from '@ant-design/icons'
import type { TaskItem } from '@/types/task.type'
import { useUsers } from '@/hooks/useUsers'
import { STATUS } from '@/constant'
import type { Dayjs } from 'dayjs'
import TaskDetail from './Detail'
import TaskForm from './Form'

type TaskSearchValues = {
    name?: string
    projectId?: string
    principalId?: string
    status?: string
    rangeTime?: [Dayjs, Dayjs] | null
}

export type ColumnsType<T extends object = object> = TableProps<T>['columns']
export type TablePaginationConfig = Exclude<
    GetProp<TableProps, 'pagination'>,
    boolean
>
const isNonNullable = <T,>(val: T): val is NonNullable<T> => {
    return val !== undefined && val !== null
}

const { RangePicker } = DatePicker

const getTaskParams = (params: TableParams) => {
    const { pagination, filters, sortField, sortOrder, ...restParams } = params
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

    if (sortField && sortOrder) {
        result.orderby = sortField
        result.order = sortOrder === 'ascend' ? 'asc' : 'desc'
    }

    // 处理其他参数
    Object.entries(restParams).forEach(([key, value]) => {
        if (isNonNullable(value)) {
            result[key] = value
        }
    })

    return result
}

function Tasks() {
    const [form] = Form.useForm()
    const [detailOpen, setDetailOpen] = useState(false)
    const [formOpen, setFormOpen] = useState(false)
    const [activeTaskId, setActiveTaskId] = useState<string | undefined>()
    const [editTaskId, setEditTaskId] = useState<string>()
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    })
    const queryClient = useQueryClient()

    const { data: users } = useUsers()

    const columns: ColumnsType<TaskItem> = [
        {
            title: '任务名称',
            dataIndex: 'name',
            fixed: 'start',
            ellipsis: true,
            width: 120,
        },
        {
            title: '所属项目',
            dataIndex: 'projectId',
            width: 180,
        },
        {
            title: '负责人',
            dataIndex: 'principalId',
            width: 180,
            render: (value: string) => {
                return users?.find((user) => user.id === value)?.name ?? '--'
            },
        },
        {
            title: '计划开始时间',
            key: 'startTime',
            dataIndex: 'startTime',
            sorter: true,
            sortOrder:
                tableParams.sortField === 'startTime'
                    ? (tableParams.sortOrder ?? null)
                    : null,
            width: 160,
        },
        {
            title: '计划结束时间',
            key: 'endTime',
            dataIndex: 'endTime',
            sorter: true,
            sortOrder:
                tableParams.sortField === 'endTime'
                    ? (tableParams.sortOrder ?? null)
                    : null,
            width: 160,
        },
        {
            title: '实际开始时间',
            key: 'realStartTime',
            dataIndex: 'realStartTime',
            sorter: true,
            sortOrder:
                tableParams.sortField === 'realStartTime'
                    ? (tableParams.sortOrder ?? null)
                    : null,
            width: 160,
        },
        {
            title: '实际结束时间',
            key: 'realEndTime',
            dataIndex: 'realEndTime',
            sorter: true,
            sortOrder:
                tableParams.sortField === 'realEndTime'
                    ? (tableParams.sortOrder ?? null)
                    : null,
            width: 160,
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: 120,
            render: (value: string) => {
                const data = STATUS.find((item) => item.value === value)
                return data ? <Tag color={data.color}>{data?.label}</Tag> : '--'
            },
        },
        {
            title: '操作',
            key: 'action',
            width: 240,
            fixed: 'end',
            render: (_, record: TaskItem) => (
                <div className="flex flex-wrap">
                    <Button type="link" onClick={() => handleDetail(record.id)}>
                        详情
                    </Button>
                    <Button type="link" onClick={() => handleEdit(record.id)}>
                        编辑
                    </Button>
                    <Popconfirm
                        title="删除成员"
                        description={`确认删除任务-${record.name}吗？`}
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

    const queryString = toURLSearchParams(getTaskParams(tableParams)).toString()

    const { data, isFetching, error } = useQuery({
        queryKey: ['tasks', queryString],
        queryFn: async ({ signal }) => {
            const result = await fetchService.get<ListResponse>(
                `/api/tasks?${queryString}`,
                { signal }, // 用于取消请求
            )

            console.log('加载任务列表', result)

            if (!result) {
                throw new Error('暂无任务')
            }

            return result
        },
        // 调试阶段失败后直接展示错误
        retry: false,
    })

    const handleTableChange: TableProps<TaskItem>['onChange'] = (
        pagination,
        filters,
        sorter,
        extra,
    ) => {
        setTableParams((prev) => ({
            ...prev,
            pagination: {
                current: extra.action === 'sort' ? 1 : pagination.current,
                pageSize: pagination.pageSize,
            },
            filters,
            sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
            sortField: Array.isArray(sorter) ? undefined : sorter.field,
        }))
    }

    const handleFinish = (formData: TaskSearchValues) => {
        console.log('触发了查询', formData)
        setTableParams((prev) => ({
            ...prev,
            name: formData.name,
            projectId: formData.projectId,
            principalId: formData.principalId,
            status: formData.status,
            startTime: formData.rangeTime?.[0]?.format('YYYY-MM-DD'),
            endTime: formData.rangeTime?.[1]?.format('YYYY-MM-DD'),
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
        setActiveTaskId(id)
        setDetailOpen(true)
    }

    const handleEdit = (id: string) => {
        setEditTaskId(id)
        setFormOpen(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await fetchService.delete(`/api/task/${id}`)
        } catch {
            message.error('删除失败')
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
            queryKey: ['tasks'],
        })
    }

    const handleDetailClose = () => {
        setDetailOpen(false)
    }

    const handleCreateTask = () => {
        setFormOpen(true)
    }

    const handleFormClose = async () => {
        setEditTaskId(undefined)
        setFormOpen(false)
    }

    const handleFormSaved = async () => {
        await Promise.all([
            queryClient.invalidateQueries(
                { queryKey: ['tasks'] },
                { throwOnError: true },
            ),
            ...(editTaskId
                ? [
                      queryClient.resetQueries(
                          {
                              queryKey: ['task-detail', editTaskId],
                              exact: true,
                          },
                          { throwOnError: true },
                      ),
                  ]
                : []),
        ])
    }

    const { data: userResult = [], isFetching: isUserFetching } = useUsers()
    const userList = userResult.map((user) => ({
        value: user.id,
        label: user.name,
    }))

    return (
        <>
            <div className="w-full min-h-full flex flex-col gap-[20px]">
                <div className="flex items-center justify-between">
                    <h2>任务管理</h2>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreateTask}
                    >
                        添加成员
                    </Button>
                </div>
                <Form<TaskSearchValues>
                    layout="inline"
                    onFinish={handleFinish}
                    form={form}
                    className="flex item-center gap-[16px]"
                >
                    <Form.Item name="name" label="">
                        <Input
                            placeholder="请输入任务名称"
                            allowClear
                            maxLength={60}
                        />
                    </Form.Item>

                    {/* <Form.Item name="projectId">
                        <Select
                            allowClear
                            placeholder="请选择所属项目"
                            options={projectList}
                            loading={isProjectFetching}
                        ></Select>
                    </Form.Item> */}

                    <Form.Item name="principalId">
                        <Select
                            allowClear
                            placeholder="请选择所属负责人"
                            options={userList}
                            loading={isUserFetching}
                        ></Select>
                    </Form.Item>

                    <Form.Item name="rangeTime">
                        <RangePicker
                            allowClear
                            placeholder={[
                                '请选择计划开始时间',
                                '请选择计划结束时间',
                            ]}
                            id={{
                                start: 'startTime',
                                end: 'endTime',
                            }}
                        />
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
                <Table<TaskItem>
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
            <TaskDetail
                id={activeTaskId}
                detailOpen={detailOpen}
                onClose={handleDetailClose}
            />
            <TaskForm
                id={editTaskId}
                formOpen={formOpen}
                onClose={handleFormClose}
                onSaved={handleFormSaved}
            />
        </>
    )
}

export default Tasks
