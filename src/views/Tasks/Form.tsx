import fetchService from '@/api/request'
import Loading from '@/components/Loading'
import { STATUS } from '@/constant'
import { useProjects } from '@/hooks/useProjects'
import type { Task } from '@/types/task.type'
import { getProjectMembers } from '@/api/projects'
import { useUserStore } from '@/stores/user'
import {
    dateTimeFormat,
    formatBeijingTime,
    pickerTimeToIso,
    toBeijingTime,
} from '@/utils/date-time'
import { useQuery } from '@tanstack/react-query'
import {
    Drawer,
    Form,
    Input,
    Select,
    Space,
    Button,
    message,
    Tag,
    DatePicker,
} from 'antd'
import type { Dayjs } from 'dayjs'
import { useEffect, useRef, useState } from 'react'

type TaskFormProps = {
    id?: string
    projectId?: string
    onClose: () => void
    onSaved: () => Promise<void>
    formOpen: boolean
}

type TaskFormValues = {
    name: string
    description?: string
    projectId?: string | null
    principalId: string
    startTime: Dayjs
    endTime: Dayjs
}

function TaskForm({
    id,
    projectId,
    formOpen,
    onClose,
    onSaved,
}: TaskFormProps) {
    const [form] = Form.useForm<TaskFormValues>()
    const [isSaving, setIsSaving] = useState(false)
    const savingRef = useRef(false)

    const handleFinish = (data: TaskFormValues) => {
        console.log('添加任务', data)
    }

    const handleRequestClose = () => {
        if (savingRef.current) return
        onClose()
    }

    const {
        data: detail,
        isPending,
        error,
    } = useQuery({
        queryKey: ['task-detail', id],
        enabled: formOpen && !!id,
        queryFn: async ({ signal }) => {
            const result = await fetchService.get<Task>(`/api/tasks/${id}`, {
                signal,
            })

            if (!result) {
                throw new Error('获取任务详情失败')
            }
            return result
        },
        retry: false,
    })

    const title = id ? detail?.name : '添加任务'
    const dataLoading = !!id && isPending

    const initializedFor = useRef<string | null>(null)

    useEffect(() => {
        if (!formOpen) {
            initializedFor.current = null
            return
        }

        // 区分创建模式和不同项目的编辑模式
        const target = id ? `edit:${id}` : `create:${projectId ?? 'none'}`

        if (initializedFor.current === target) return

        // 编辑时等待详情，创建时直接清空表单
        if (id && !detail) return

        form.resetFields()

        if (id && detail) {
            form.setFieldsValue({
                name: detail.name,
                description: detail.description,
                projectId: detail.projectId,
                principalId: detail.principalId,
                startTime: toBeijingTime(detail.startTime),
                endTime: toBeijingTime(detail.endTime),
            })
        }

        if (!id && projectId) {
            form.setFieldsValue({
                projectId: projectId,
            })
        }

        initializedFor.current = target
    }, [formOpen, id, projectId, detail, form])

    const handleSave = async () => {
        if (savingRef.current) return
        if (id && (isPending || error)) return

        savingRef.current = true
        setIsSaving(true)

        try {
            const formData = await form.validateFields().catch(() => null)

            if (!formData) return

            const payload = {
                name: formData.name,
                description: formData.description,
                projectId: formData.projectId ?? null,
                principalId: formData.principalId,
                startTime: pickerTimeToIso(formData.startTime),
                endTime: pickerTimeToIso(formData.endTime),
            }
            try {
                if (id) {
                    await fetchService.patch(`/api/tasks/${id}`, payload)
                } else {
                    await fetchService.post('/api/tasks', payload)
                }
            } catch {
                message.error('保存失败')
                return
            }
            try {
                await onSaved()
                message.success('保存成功')
            } catch {
                message.warning('保存成功，但刷新失败，请重新加载页面')
            }
            onClose()
        } finally {
            savingRef.current = false
            setIsSaving(false)
        }
    }

    const currentUser = useUserStore((state) => state.userInfo)

    const selectedProjectId: string | null | undefined = Form.useWatch(
        'projectId',
        form,
    )

    const {
        data: projectMembers = [],
        isFetching: membersFetching,
        error: membersError,
    } = useQuery({
        queryKey: ['project-members', selectedProjectId],
        enabled: formOpen && !!selectedProjectId,
        queryFn: ({ signal }) => {
            if (!selectedProjectId) {
                throw new Error('缺少项目 ID')
            }
            return getProjectMembers(selectedProjectId, signal)
        },
        retry: false,
    })

    const userOptions = selectedProjectId
        ? projectMembers.map((member) => ({
              value: member.userId,
              label: member.isActive ? member.name : `${member.name}（已停用）`,
          }))
        : currentUser
          ? [{ value: currentUser.id, label: currentUser.name }]
          : []

    const { data: projects = [] } = useProjects()
    const projectOptions = projects.map((project) => ({
        value: project.id,
        label: project.name,
    }))
    const status = STATUS.find((status) => status.value === detail?.status)

    return (
        <Drawer
            title={title}
            closable={!isSaving}
            keyboard={!isSaving}
            onClose={handleRequestClose}
            open={formOpen}
            forceRender
            size={600}
            extra={
                <Space>
                    <Button onClick={handleRequestClose} disabled={isSaving}>
                        取消
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleSave}
                        loading={isSaving}
                        disabled={!!id && (isPending || !!error)}
                    >
                        保存
                    </Button>
                </Space>
            }
        >
            {dataLoading && <Loading />}

            {id && error && <div role="alert">{error.message}</div>}
            {selectedProjectId && membersError && (
                <div role="alert">加载项目成员失败：{membersError.message}</div>
            )}

            <Form
                form={form}
                name="task-form"
                onFinish={handleFinish}
                disabled={isSaving || (!!id && (isPending || !!error))}
                labelCol={{ span: 5 }}
            >
                <Form.Item
                    name="name"
                    label="任务名称"
                    rules={[{ required: true }]}
                >
                    <Input placeholder="请输入任务名称" disabled={!!id} />
                </Form.Item>
                <Form.Item name="description" label="任务描述">
                    <Input placeholder="请输入任务描述" />
                </Form.Item>
                <Form.Item name="projectId" label="所属项目">
                    <Select
                        allowClear
                        placeholder="请选择所属项目"
                        options={projectOptions}
                        onChange={() => {
                            form.setFieldValue('principalId', undefined)
                        }}
                    ></Select>
                </Form.Item>
                <Form.Item
                    name="principalId"
                    label="负责人"
                    rules={[
                        { required: true, message: '请选择负责人' },
                        {
                            validator: (_, value) => {
                                if (!value) {
                                    return Promise.resolve()
                                }

                                if (selectedProjectId && membersFetching) {
                                    return Promise.reject(
                                        new Error(
                                            '正在加载项目成员，请稍后保存',
                                        ),
                                    )
                                }

                                if (selectedProjectId && membersError) {
                                    return Promise.reject(
                                        new Error(
                                            '项目成员加载失败，请重新打开表单',
                                        ),
                                    )
                                }

                                const available = userOptions.some(
                                    (option) => option.value === value,
                                )

                                return available
                                    ? Promise.resolve()
                                    : Promise.reject(
                                          new Error(
                                              '该负责人已不适用，请重新选择',
                                          ),
                                      )
                            },
                        },
                    ]}
                >
                    <Select
                        allowClear
                        placeholder={
                            selectedProjectId
                                ? '请选择项目成员'
                                : '独立任务请选择自己'
                        }
                        options={userOptions}
                        loading={!!selectedProjectId && membersFetching}
                    />
                </Form.Item>
                {id && (
                    <Form.Item label="状态">
                        <Tag color={status?.color}>{status?.label}</Tag>
                    </Form.Item>
                )}
                <Form.Item label="提示">
                    <p className="text-gray-500">
                        时间统一按北京时间填写和显示。
                    </p>
                </Form.Item>

                <Form.Item
                    name="startTime"
                    label="计划开始时间"
                    rules={[{ required: true, message: '请选择计划开始时间' }]}
                >
                    <DatePicker
                        showTime
                        format={dateTimeFormat}
                        placeholder="请选择计划开始时间"
                    />
                </Form.Item>
                <Form.Item
                    name="endTime"
                    label="计划结束时间"
                    dependencies={['startTime']}
                    rules={[
                        { required: true, message: '请选择计划结束时间' },
                        ({ getFieldValue }) => ({
                            validator(_, endTime) {
                                const startTime = getFieldValue('startTime')

                                if (!startTime || !endTime) {
                                    return Promise.resolve()
                                }

                                if (
                                    new Date(
                                        pickerTimeToIso(endTime),
                                    ).getTime() <
                                    new Date(
                                        pickerTimeToIso(startTime),
                                    ).getTime()
                                ) {
                                    return Promise.reject(
                                        new Error(
                                            '计划结束时间不能早于计划开始时间',
                                        ),
                                    )
                                }

                                return Promise.resolve()
                            },
                        }),
                    ]}
                >
                    <DatePicker
                        showTime
                        format={dateTimeFormat}
                        placeholder="请选择计划结束时间"
                    />
                </Form.Item>
                {id && (
                    <>
                        <Form.Item label="实际开始时间">
                            <span>
                                {formatBeijingTime(detail?.realStartTime)}
                            </span>
                        </Form.Item>

                        <Form.Item label="实际结束时间">
                            <span>
                                {formatBeijingTime(detail?.realEndTime)}
                            </span>
                        </Form.Item>
                    </>
                )}
            </Form>
        </Drawer>
    )
}

export default TaskForm
