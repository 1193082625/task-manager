import { getProjectMembers, removeProjectMember } from '@/api/projects'
import Loading from '@/components/Loading'
import { useUserStore } from '@/stores/user'
import { formatBeijingTime } from '@/utils/date-time'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Empty, message, Popconfirm, Tag } from 'antd'
import AddMemberForm from './AddMemberForm'
import { HttpError } from '@/api/request'

type ProjectMembersProps = {
    projectId: string
}

function ProjectMembers({ projectId }: ProjectMembersProps) {
    const {
        data: members = [],
        isPending,
        isFetching,
        error,
        refetch,
    } = useQuery({
        queryKey: ['project-members', projectId],
        queryFn: ({ signal }) => getProjectMembers(projectId, signal),
        retry: false,
    })

    const currentUserId = useUserStore((state) => state.userInfo?.id)

    const canManage = members.some(
        (member) => member.userId === currentUserId && member.isPrincipal,
    )

    const queryClient = useQueryClient()

    const removeMutation = useMutation({
        mutationFn: (userId: string) => removeProjectMember(projectId, userId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['project-members', projectId],
            })
            message.success('成员已移除')
        },
        onError: (error) => {
            const handledGlobally =
                error instanceof HttpError &&
                [400, 401, 500].includes(error.status)

            if (!handledGlobally) {
                message.error(error.message || '移除成员失败')
            }

            if (error instanceof HttpError && error.status !== 401) {
                void queryClient.invalidateQueries({
                    queryKey: ['project-members', projectId],
                })
            }
        },
    })

    return (
        <section>
            <div className="mb-[12px] flex items-center justify-between">
                <h3 className="font-bold">项目成员</h3>
                <Button
                    size="small"
                    loading={isFetching}
                    onClick={() => void refetch()}
                >
                    刷新
                </Button>
            </div>
            {!isPending && !error && canManage && (
                <AddMemberForm projectId={projectId} members={members} />
            )}
            {isPending && <Loading />}

            {error && <div role="alert">{error.message}</div>}

            {!isPending &&
                !error &&
                (members.length === 0 ? (
                    <Empty description="暂无项目成员" />
                ) : (
                    <ul className="flex flex-col gap-[12px]">
                        {members.map((member) => (
                            <li
                                key={member.userId}
                                className="rounded border border-gray-200 p-[12px]"
                            >
                                <div className="flex flex-wrap items-center gap-[8px]">
                                    <span className="font-medium">
                                        {member.name}
                                    </span>
                                    {member.isPrincipal && (
                                        <Tag color="blue">项目负责人</Tag>
                                    )}
                                    {!member.isActive && <Tag>已停用</Tag>}
                                    {canManage && !member.isPrincipal && (
                                        <Popconfirm
                                            title={`确定移除 ${member.name} 吗？`}
                                            description="移除后，该用户将失去此项目的成员访问权限。"
                                            okText="移除"
                                            cancelText="取消"
                                            disabled={removeMutation.isPending}
                                            okButtonProps={{
                                                danger: true,
                                                disabled:
                                                    removeMutation.isPending,
                                            }}
                                            onConfirm={() => {
                                                if (
                                                    !canManage ||
                                                    removeMutation.isPending
                                                ) {
                                                    return
                                                }
                                                removeMutation.mutate(
                                                    member.userId,
                                                )
                                            }}
                                        >
                                            <Button
                                                className="ml-auto"
                                                type="link"
                                                danger
                                                size="small"
                                                disabled={
                                                    removeMutation.isPending
                                                }
                                                loading={
                                                    removeMutation.isPending &&
                                                    removeMutation.variables ===
                                                        member.userId
                                                }
                                            >
                                                移除
                                            </Button>
                                        </Popconfirm>
                                    )}
                                </div>
                                <div className="mt-[8px] text-sm text-gray-500">
                                    角色：{member.role}
                                </div>
                                <div className="mt-[4px] text-sm text-gray-500">
                                    加入时间：
                                    {formatBeijingTime(member.joinedAt)}
                                </div>
                            </li>
                        ))}
                    </ul>
                ))}
        </section>
    )
}

export default ProjectMembers
