import fetchService from '@/api/request'
import type { User } from '@/types/user.type'
import { Form, Input, message, Modal } from 'antd'
import { useState } from 'react'

type ResetPasswordValues = {
    newPassword: string
    confirmPassword: string
}

type ResetPasswordModalProps = {
    open: boolean
    user: Pick<User, 'id' | 'name'> | undefined
    onClose: () => void
}

function ResetPasswordModal({ open, user, onClose }: ResetPasswordModalProps) {
    const [form] = Form.useForm<ResetPasswordValues>()
    const [isSaving, setIsSaving] = useState(false)

    const handleClose = () => {
        if (isSaving) return

        form.resetFields()
        onClose()
    }

    const handleSubmit = async () => {
        if (!user || isSaving) return

        const values = await form.validateFields().catch(() => null)

        if (!values) return

        setIsSaving(true)

        try {
            await fetchService.patch(`/api/users/${user.id}/reset-password`, {
                newPassword: values.newPassword,
            })

            message.success('密码重置成功')
            form.resetFields()
            onClose()
        } catch {
            message.error('密码重置失败')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Modal
            title={`重置 ${user?.name ?? ''} 密码`}
            open={open}
            okText="确认重置"
            cancelText="取消"
            confirmLoading={isSaving}
            closable={!isSaving}
            keyboard={!isSaving}
            maskClosable={false}
            onOk={handleSubmit}
            onCancel={handleClose}
        >
            <Form form={form} layout="vertical" preserve={false}>
                <Form.Item
                    name="newPassword"
                    label="新密码"
                    rules={[
                        {
                            required: true,
                            message: '请输入新密码',
                        },
                        { min: 8, message: '密码不能少于 8 个字符' },
                        { max: 128, message: '密码不能超过 128 个字符' },
                    ]}
                >
                    <Input.Password
                        placeholder="请输入新密码"
                        autoComplete="new-password"
                    />
                </Form.Item>
                <Form.Item
                    name="confirmPassword"
                    label="确认新密码"
                    dependencies={['newPassword']}
                    rules={[
                        {
                            required: true,
                            message: '请输入新密码',
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (
                                    !value ||
                                    getFieldValue('newPassword') === value
                                ) {
                                    return Promise.resolve()
                                }

                                return Promise.reject(
                                    new Error('两次输入的密码不一致'),
                                )
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        placeholder="请再次输入新密码"
                        autoComplete="new-password"
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ResetPasswordModal
