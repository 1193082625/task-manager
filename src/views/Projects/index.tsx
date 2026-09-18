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
import type {
    ListResponse,
    ProjectItem,
    TableParams,
} from '@/types/project.type'
import { STAGE, STATUS } from '@/constant'
import type { Dayjs } from 'dayjs'
import ProjectDetail from './Detail'
import { PlusOutlined } from '@ant-design/icons'
import { useUsers } from '@/hooks/useUsers'
import ProjectForm from './Form'

type ProjectSearchValues = {
    name?: string
    principalId?: string
    status?: ProjectItem['status']
    stage?: ProjectItem['stage']
    rangeTime?: [Dayjs, Dayjs] | null
}

export type ColumnsType<T extends object = object> = TableProps<T>['columns']
export type TablePaginationConfig = Exclude<
    GetProp<TableProps, 'pagination'>,
    boolean
>

const { RangePicker } = DatePicker

const isNonNullable = <T,>(val: T): val is NonNullable<T> => {
    return val !== undefined && val !== null
}

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

const getProjectParams = (params: TableParams) => {
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

function Projects() {
    const [form] = Form.useForm()
    const [detailOpen, setDetailOpen] = useState(false)
    const [formOpen, setFormOpen] = useState(false)
    const [activeProjectId, setActiveProjectId] = useState<string | undefined>()
    const [editProjectId, setEditProjectId] = useState<string>()
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    })
    const queryClient = useQueryClient()

    const columns: ColumnsType<ProjectItem> = [
        {
            title: '项目名称',
            dataIndex: 'name',
            fixed: 'start',
            ellipsis: true,
        },
        {
            title: '负责人',
            dataIndex: 'principalId',
            fixed: 'start',
            render: (principalId: string) => {
                const user = userList?.find(
                    (item) => item.value === principalId,
                )
                return user?.label ?? '--'
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
            title: '任务数',
            dataIndex: 'taskCount',
            sorter: true,
            width: 120,
            render: (value: number, record: ProjectItem) => {
                return `${record.completedTaskCount} / ${value}`
            },
        },
        {
            title: '阶段',
            dataIndex: 'stage',
            width: 120,
            render: (value: string) => {
                const data = STAGE.find((item) => item.value === value)
                return data ? <Tag color={data.color}>{data?.label}</Tag> : '--'
            },
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
            render: (_, record: ProjectItem) => (
                <div className="flex flex-wrap">
                    <Button type="link" onClick={() => handleDetail(record.id)}>
                        详情
                    </Button>
                    <Button type="link" onClick={() => handleEdit(record.id)}>
                        编辑
                    </Button>
                    <Popconfirm
                        title="删除项目"
                        description={`确认删除${record.name}项目吗？`}
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

    const queryString = toURLSearchParams(
        getProjectParams(tableParams),
    ).toString()

    const { data, isFetching, error } = useQuery({
        queryKey: ['projects', queryString],
        queryFn: async ({ signal }) => {
            const result = await fetchService.get<ListResponse>(
                `/api/projects?${queryString}`,
                { signal }, // 用于取消请求
            )

            if (!result) {
                throw new Error('暂无项目')
            }

            return result
        },
        // 调试阶段失败后直接展示错误
        retry: false,
    })

    const { data: userResult = [], isFetching: isUserFetching } = useUsers()
    const userList = userResult.map((user) => ({
        value: user.id,
        label: user.name,
    }))

    const handleTableChange: TableProps<ProjectItem>['onChange'] = (
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

    const handleFinish = (formData: ProjectSearchValues) => {
        console.log('触发了查询', formData)
        setTableParams((prev) => ({
            ...prev,
            name: formData.name,
            status: formData.status,
            stage: formData.stage,
            principalId: formData.principalId,
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
        setActiveProjectId(id)
        setDetailOpen(true)
    }

    const handleEdit = (id: string) => {
        setEditProjectId(id)
        setFormOpen(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await fetchService.delete(`/api/project/${id}`)
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
            queryKey: ['projects'],
        })
    }

    const handleDetailClose = () => {
        setDetailOpen(false)
    }

    const handleCreateProject = () => {
        setFormOpen(true)
    }

    const handleFormClose = async () => {
        setEditProjectId(undefined)
        setFormOpen(false)
    }

    const handleFormSaved = async () => {
        await Promise.all([
            queryClient.invalidateQueries(
                { queryKey: ['projects'] },
                { throwOnError: true },
            ),
            ...(editProjectId
                ? [
                      queryClient.resetQueries(
                          {
                              queryKey: ['project-detail', editProjectId],
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
                    <h2>项目管理</h2>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreateProject}
                    >
                        添加项目
                    </Button>
                </div>
                <Form<ProjectSearchValues>
                    layout="inline"
                    onFinish={handleFinish}
                    form={form}
                    className="flex item-center gap-[16px]"
                >
                    <Form.Item name="name" label="">
                        <Input
                            placeholder="请输入项目名称"
                            allowClear
                            maxLength={60}
                        />
                    </Form.Item>

                    <Form.Item name="principalId">
                        <Select
                            allowClear
                            placeholder="请选择负责人"
                            options={userList}
                            loading={isUserFetching}
                        ></Select>
                    </Form.Item>

                    <Form.Item name="stage">
                        <Select
                            allowClear
                            placeholder="请选择阶段"
                            options={STAGE}
                        ></Select>
                    </Form.Item>

                    <Form.Item name="status">
                        <Select
                            allowClear
                            placeholder="请选择状态"
                            options={STATUS}
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
                <Table<ProjectItem>
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
            <ProjectDetail
                projectId={activeProjectId}
                detailOpen={detailOpen}
                onClose={handleDetailClose}
            />
            <ProjectForm
                projectId={editProjectId}
                formOpen={formOpen}
                onClose={handleFormClose}
                onSaved={handleFormSaved}
            />
        </>
    )
}

export default Projects
