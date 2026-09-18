import fetchService from '@/api/request'
import Loading from '@/components/Loading'
import { USER_ROLES } from '@/constant'
import type { CreateUser, User } from '@/types/user.type'
import { useQuery } from '@tanstack/react-query'
import { Drawer, Form, Input, Select, Space, Button, message } from 'antd'
import { useEffect, useRef, useState } from 'react'

type UserFormProps = {
    id?: string
    onClose: () => void
    onSaved: () => Promise<void>
    formOpen: boolean
}

function UserForm({ id, formOpen, onClose, onSaved }: UserFormProps) {
    const [form] = Form.useForm()
    const [isSaving, setIsSaving] = useState(false)
    const savingRef = useRef(false)

    const handleFinish = (data: CreateUser) => {
        console.log('添加用户', data)
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
        queryKey: ['user-detail', id],
        enabled: formOpen && !!id,
        queryFn: async ({ signal }) => {
            const result = await fetchService.get<User>(`/api/user/${id}`, {
                signal,
            })

            if (!result) {
                throw new Error('获取用户详情失败')
            }
            return result
        },
        retry: false,
    })

    const title = id ? detail?.name : '添加用户'
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
                phone: detail.phone,
                role: detail.role,
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

            try {
                if (id) {
                    await fetchService.patch(`/api/user/${id}`, formData)
                } else {
                    await fetchService.post('/api/user', formData)
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
                name="user-form"
                onFinish={handleFinish}
                disabled={isSaving || (!!id && (isPending || !!error))}
                labelCol={{ span: 5 }}
            >
                <Form.Item
                    name="name"
                    label="姓名"
                    rules={[{ required: true }]}
                >
                    <Input placeholder="请输入成员姓名" disabled={!!id} />
                </Form.Item>
                <Form.Item
                    name="phone"
                    label="手机号"
                    rules={[
                        { required: true, message: '请输入手机号' },
                        {
                            pattern: /^1[3-9]\d{9}$/,
                            message: '请输入正确的手机号',
                        },
                    ]}
                >
                    <Input placeholder="请输入成员姓名" maxLength={11} />
                </Form.Item>
                <Form.Item name="role" label="角色">
                    <Select
                        placeholder="请选择成员角色"
                        options={USER_ROLES}
                    ></Select>
                </Form.Item>
            </Form>
        </Drawer>
    )
}

export default UserForm
