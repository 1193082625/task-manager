import fetchService from '@/api/request'
import Loading from '@/components/Loading'
import { dateFormat, STAGE, STATUS } from '@/constant'
import { useUsers } from '@/hooks/useUsers'
import type { ProjectDetail } from '@/types/project.type'
import { formatBeijingTime } from '@/utils/date-time'
import { useQuery } from '@tanstack/react-query'
import {
    Drawer,
    DatePicker,
    Form,
    Input,
    Select,
    Space,
    Button,
    message,
    Tag,
} from 'antd'
import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'

type ProjectFormProps = {
    projectId?: string
    onClose: () => void
    onSaved: () => Promise<void>
    formOpen: boolean
}

const { TextArea } = Input

function ProjectForm({
    projectId,
    formOpen,
    onClose,
    onSaved,
}: ProjectFormProps) {
    const [form] = Form.useForm()
    const [isSaving, setIsSaving] = useState(false)
    const savingRef = useRef(false)

    const handleFinish = (data: ProjectDetail) => {
        console.log('创建项目', data)
    }

    const handleRequestClose = () => {
        if (savingRef.current) return
        onClose()
    }

    const { data: users = [] } = useUsers()

    const userOptions = users.map((user) => ({
        value: user.id,
        label: user.name,
    }))

    const handleChangePrincipal = (principalId: string) => {
        console.log('切换负责人', principalId)
    }

    const {
        data: projectDetail,
        isPending,
        error,
    } = useQuery({
        queryKey: ['project-detail', projectId],
        enabled: formOpen && !!projectId,
        queryFn: async ({ signal }) => {
            const result = await fetchService.get<ProjectDetail>(
                `/api/projects/${projectId}`,
                { signal },
            )

            if (!result) {
                throw new Error('获取项目详情失败')
            }
            return result
        },
        retry: false,
    })

    const title = projectId ? projectDetail?.name : '创建项目'
    const stage = STAGE.find((stage) => stage.value === projectDetail?.stage)
    const status = STATUS.find((state) => state.value === projectDetail?.status)
    const dataLoading = !!projectId && isPending

    const initializedFor = useRef<string | null>(null)

    useEffect(() => {
        if (!formOpen) {
            initializedFor.current = null
            return
        }

        // 区分创建模式和不同项目的编辑模式
        const target = projectId ? `edit:${projectId}` : 'create'

        if (initializedFor.current === target) return

        // 编辑时等待详情，创建时直接清空表单
        if (projectId && !projectDetail) return

        form.resetFields()

        if (projectId && projectDetail) {
            form.setFieldsValue({
                name: projectDetail.name,
                description: projectDetail.description,
                principalId: projectDetail.principalId,
                memberIds: projectDetail.memberIds,
                startTime: projectDetail.startTime
                    ? dayjs(projectDetail.startTime)
                    : null,
                endTime: projectDetail.endTime
                    ? dayjs(projectDetail.endTime)
                    : null,
            })
        }

        initializedFor.current = target
    }, [formOpen, projectId, projectDetail, form])

    const handleSave = async () => {
        if (savingRef.current) return
        if (projectId && (isPending || error)) return

        savingRef.current = true
        setIsSaving(true)

        try {
            const formData = await form.validateFields().catch(() => null)
            if (!formData) return

            const payload = {
                name: formData.name,
                description: formData.description,
                principalId: formData.principalId,
                startTime: formData.startTime?.format(dateFormat) ?? null,
                endTime: formData.endTime?.format(dateFormat) ?? null,
                // memberIds: formData.memberIds ?? [],
            }
            try {
                if (projectId) {
                    await fetchService.patch(
                        `/api/projects/${projectId}`,
                        payload,
                    )
                } else {
                    await fetchService.post('/api/projects', payload)
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

    return (
        <Drawer
            title={title}
            closable={!isSaving}
            onClose={handleRequestClose}
            keyboard={!isSaving}
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
                        disabled={!!projectId && (isPending || !!error)}
                    >
                        保存
                    </Button>
                </Space>
            }
        >
            {dataLoading && <Loading />}

            {projectId && error && <div role="alert">{error.message}</div>}

            <Form
                form={form}
                name="project-form"
                onFinish={handleFinish}
                disabled={isSaving || (!!projectId && (isPending || !!error))}
                labelCol={{ span: 5 }}
            >
                <Form.Item
                    name="name"
                    label="项目名称"
                    rules={[{ required: true }]}
                >
                    <Input
                        placeholder="请输入项目名称"
                        disabled={!!projectId}
                    />
                </Form.Item>
                <Form.Item name="description" label="项目介绍">
                    <TextArea rows={4} />
                </Form.Item>
                <Form.Item
                    name="principalId"
                    label="项目负责人"
                    rules={[{ required: true, message: '请选择项目负责人' }]}
                >
                    <Select
                        placeholder="请选择项目负责人"
                        onChange={handleChangePrincipal}
                        options={userOptions}
                    ></Select>
                </Form.Item>
                {projectId && (
                    <>
                        <Form.Item name="stage" label="阶段">
                            <Tag color={stage?.color}>{stage?.label}</Tag>
                        </Form.Item>
                        <Form.Item name="status" label="状态">
                            <Tag color={status?.color}>{status?.label}</Tag>
                        </Form.Item>
                        <Form.Item name="" label="任务状态">
                            <span>
                                {projectDetail?.completedTaskCount}/
                                {projectDetail?.taskCount}
                            </span>
                        </Form.Item>
                    </>
                )}
                <Form.Item
                    name="startTime"
                    label="计划开始时间"
                    rules={[{ required: true, message: '请选择计划开始时间' }]}
                >
                    <DatePicker
                        format={dateFormat}
                        placeholder="请选择计划开始时间"
                        disabled={!!projectId}
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
                        disabled={!!projectId}
                    />
                </Form.Item>
                {projectId && (
                    <>
                        <Form.Item label="实际开始时间">
                            <span>
                                {formatBeijingTime(
                                    projectDetail?.realStartTime,
                                )}
                            </span>
                        </Form.Item>
                        <Form.Item label="实际结束时间">
                            <span>
                                {formatBeijingTime(projectDetail?.realEndTime)}
                            </span>
                        </Form.Item>
                        <p className="text-gray-500">
                            实际时间由项目下任务自动统计，不支持手动修改
                        </p>
                    </>
                )}
            </Form>
        </Drawer>
    )
}

export default ProjectForm
