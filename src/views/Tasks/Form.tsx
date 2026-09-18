import fetchService from '@/api/request'
import Loading from '@/components/Loading'
import { dateFormat, STATUS } from '@/constant'
import { useProjects } from '@/hooks/useProjects'
import { useUsers } from '@/hooks/useUsers'
import type { CreateTask, Task } from '@/types/task.type'
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
import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'

type TaskFormProps = {
    id?: string
    onClose: () => void
    onSaved: () => Promise<void>
    formOpen: boolean
}

function TaskForm({ id, formOpen, onClose, onSaved }: TaskFormProps) {
    const [form] = Form.useForm()
    const [isSaving, setIsSaving] = useState(false)
    const savingRef = useRef(false)

    const handleFinish = (data: CreateTask) => {
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
            const result = await fetchService.get<Task>(`/api/task/${id}`, {
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
        const target = id ? `edit:${id}` : 'create'

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
                startTime: detail.startTime ? dayjs(detail.startTime) : null,
                endTime: detail.endTime ? dayjs(detail.endTime) : null,
                realStartTime: detail.realStartTime
                    ? dayjs(detail.realStartTime)
                    : null,
                realEndTime: detail.realEndTime
                    ? dayjs(detail.realEndTime)
                    : null,
            })
        }

        initializedFor.current = target
    }, [formOpen, id, detail, form])

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
                startTime: formData.startTime?.format(dateFormat) ?? null,
                endTime: formData.endTime?.format(dateFormat) ?? null,
            }
            try {
                if (id) {
                    await fetchService.patch(`/api/task/${id}`, {
                        ...payload,
                        realStartTime:
                            formData.realStartTime?.format(dateFormat) ?? null,
                        realEndTime:
                            formData.realEndTime?.format(dateFormat) ?? null,
                    })
                } else {
                    await fetchService.post('/api/task', payload)
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

    const { data: users = [] } = useUsers()
    const userOptions = users.map((user) => ({
        value: user.id,
        label: user.name,
    }))

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
                        placeholder="请选择所属项目"
                        options={projectOptions}
                    ></Select>
                </Form.Item>
                <Form.Item
                    name="principalId"
                    label="负责人"
                    rules={[{ required: true, message: '请选择负责人' }]}
                >
                    <Select
                        placeholder="请选择负责人"
                        options={userOptions}
                    ></Select>
                </Form.Item>
                {id && (
                    <Form.Item name="status" label="状态">
                        <Tag color={status?.color}>{status?.label}</Tag>
                    </Form.Item>
                )}
                <Form.Item
                    name="startTime"
                    label="计划开始时间"
                    rules={[{ required: true, message: '请选择计划开始时间' }]}
                >
                    <DatePicker
                        format={dateFormat}
                        placeholder="请选择计划开始时间"
                        disabled={!!id}
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

                                if (endTime.isBefore(startTime, 'day')) {
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
                        format={dateFormat}
                        placeholder="请选择计划结束时间"
                        disabled={!!id}
                    />
                </Form.Item>
                {id && (
                    <>
                        <Form.Item name="realStartTime" label="实际开始时间">
                            <DatePicker
                                format={dateFormat}
                                placeholder="请选择实际开始时间"
                            />
                        </Form.Item>
                        <Form.Item
                            name="realEndTime"
                            label="实际结束时间"
                            dependencies={['realStartTime']}
                            rules={[
                                ({ getFieldValue }) => ({
                                    validator(_, endTime) {
                                        const startTime =
                                            getFieldValue('realStartTime')
                                        if (!endTime) {
                                            return Promise.resolve()
                                        }

                                        if (!startTime) {
                                            return Promise.reject(
                                                new Error(
                                                    '请先填写实际开始时间',
                                                ),
                                            )
                                        }

                                        if (
                                            endTime.isBefore(startTime, 'day')
                                        ) {
                                            return Promise.reject(
                                                new Error(
                                                    '实际结束时间不能早于实际开始时间',
                                                ),
                                            )
                                        }
                                        return Promise.resolve()
                                    },
                                }),
                            ]}
                        >
                            <DatePicker
                                format={dateFormat}
                                placeholder="请选择实际结束时间"
                            />
                        </Form.Item>
                    </>
                )}
            </Form>
        </Drawer>
    )
}

export default TaskForm
