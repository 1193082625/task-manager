import { clearSession } from '@/api/clearSession'
import fetchService, { HttpError } from '@/api/request'
import router from '@/routes'
import { Form, Input, message, Modal } from 'antd'
import { useState } from 'react'

type ChangePasswordValues = {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

type ChangePasswordModalProps = {
    open: boolean
    onClose: () => void
}

function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
    const [form] = Form.useForm<ChangePasswordValues>()
    const [isSaving, setIsSaving] = useState(false)

    const handleClose = () => {
        if (isSaving) return

        form.resetFields()
        onClose()
    }

    const handleSubmit = async () => {
        if (isSaving) return

        const values = await form.validateFields().catch(() => null)

        if (!values) return

        setIsSaving(true)

        try {
            await fetchService.post(`/api/auth/change-password`, {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            })

            message.success('密码修改成功，请重新登录')

            form.resetFields()
            onClose()
            clearSession()

            router.navigate('/login', { replace: true })
        } catch (error) {
            if (!(error instanceof HttpError && error.status === 400)) {
                message.error('密码修改失败')
            }
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Modal
            title="修改密码"
            open={open}
            okText="确认修改"
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
                    name="currentPassword"
                    label="当前密码"
                    rules={[
                        {
                            required: true,
                            message: '请输入当前密码',
                        },
                        {
                            min: 8,
                            message: '密码不能少于 8 个字符',
                        },
                        {
                            max: 128,
                            message: '密码不能超过 128 个字符',
                        },
                    ]}
                >
                    <Input.Password
                        placeholder="请输入当前密码"
                        autoComplete="current-password"
                    />
                </Form.Item>

                <Form.Item
                    name="newPassword"
                    label="新密码"
                    rules={[
                        {
                            required: true,
                            message: '请输入新密码',
                        },
                        {
                            min: 8,
                            message: '密码不能少于 8 个字符',
                        },
                        {
                            max: 128,
                            message: '密码不能超过 128 个字符',
                        },
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
                            message: '请再次输入新密码',
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

export default ChangePasswordModal
