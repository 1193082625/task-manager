import { addProjectMember } from '@/api/projects'
import { HttpError } from '@/api/request'
import { useUsers } from '@/hooks/useUsers'
import type { ProjectMember } from '@/types/project.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, message, Select } from 'antd'
import { useState } from 'react'

type AddMemberFormProps = {
    projectId: string
    members: ProjectMember[]
}

function AddMemberForm({ projectId, members }: AddMemberFormProps) {
    const [selectedUserId, setSelectedUserId] = useState<string>()
    const queryClient = useQueryClient()

    const { data: users = [], isFetching, error, refetch } = useUsers()

    const memberIds = new Set(members.map((member) => member.userId))

    const options = users
        .filter((user) => user.isActive && !memberIds.has(user.id))
        .map((user) => ({
            value: user.id,
            label: `${user.name} (${user.phone})`,
        }))

    // 列表刷新后，原来选中的用户可能已经不是可添加对象
    const selectedValue = options.some(
        (option) => option.value === selectedUserId,
    )
        ? selectedUserId
        : undefined

    const addMutation = useMutation({
        mutationFn: (userId: string) => addProjectMember(projectId, { userId }),
        onSuccess: async () => {
            setSelectedUserId(undefined)
            await queryClient.invalidateQueries({
                queryKey: ['project-members', projectId],
            })
            message.success('成员添加成功')
        },
        onError: (error) => {
            // 这些状态已由请求层提示或处理登录失效
            const handledGlobally =
                error instanceof HttpError &&
                [400, 401, 500].includes(error.status)

            if (!handledGlobally) {
                message.error(error.message || '添加成员失败')
            }

            if (error instanceof HttpError && error.status !== 401) {
                void queryClient.invalidateQueries({
                    queryKey: ['project-members', projectId],
                })
                void queryClient.invalidateQueries({
                    queryKey: ['users', 'all'],
                })
            }
        },
    })

    return (
        <div className="mb-[16px]">
            {error ? (
                <div role="alert">
                    <span>加载可选用户失败：{error.message}</span>
                    <Button
                        type="link"
                        loading={isFetching}
                        onClick={() => void refetch()}
                    >
                        重试
                    </Button>
                </div>
            ) : (
                <div className="flex gap-[8px]">
                    <Select
                        className="min-w-0 flex-1"
                        aria-label="选择要添加的项目成员"
                        placeholder="选择要添加的成员"
                        showSearch
                        optionFilterProp="label"
                        allowClear
                        options={options}
                        value={selectedValue}
                        onChange={(value: string | undefined) =>
                            setSelectedUserId(value)
                        }
                        loading={isFetching}
                        disabled={isFetching || addMutation.isPending}
                        notFoundContent="暂无可添加的用户"
                    />
                    <Button
                        type="primary"
                        loading={addMutation.isPending}
                        disabled={!selectedValue || isFetching}
                        onClick={() => {
                            if (!selectedValue || addMutation.isPending) {
                                return
                            }
                            addMutation.mutate(selectedValue)
                        }}
                    >
                        添加
                    </Button>
                </div>
            )}
        </div>
    )
}
export default AddMemberForm
