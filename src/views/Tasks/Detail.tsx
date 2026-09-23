import fetchService from '@/api/request'
import Loading from '@/components/Loading'
import { STATUS } from '@/constant'
import { useProjects } from '@/hooks/useProjects'
import { useUsers } from '@/hooks/useUsers'
import type { Task } from '@/types/task.type'
import { formatBeijingTime } from '@/utils/date-time'
import { useQuery } from '@tanstack/react-query'
import { Drawer, Tag } from 'antd'

type TaskDetailProps = {
    id: string | undefined
    detailOpen: boolean
    onClose: () => void
}

function TaskDetail({ id, detailOpen, onClose }: TaskDetailProps) {
    const { data, isFetching, error } = useQuery({
        queryKey: ['task-detail', id],
        // 只有弹窗打开，并且选中了项目，才自动请求
        enabled: detailOpen && !!id,
        queryFn: async ({ signal }) => {
            if (!id) {
                throw new Error('缺少任务 ID')
            }
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
    const title = data?.name ?? '任务详情'

    const { data: users } = useUsers()
    const { data: projects } = useProjects()

    const status = STATUS.find((status) => status.value === data?.status)

    return (
        <Drawer
            title={title}
            closable={{ 'aria-label': 'Close Button' }}
            onClose={onClose}
            open={detailOpen}
        >
            {isFetching && <Loading />}

            {error && <div role="alert">{error.message}</div>}
            {!error && data && (
                <div className="flex flex-col gap-[20px]">
                    <div>
                        <span className="font-bold">任务名称：</span>
                        <span>{data.name}</span>
                    </div>
                    <div>
                        <span className="font-bold">任务介绍：</span>
                        <span>{data?.description}</span>
                    </div>
                    <div>
                        <span className="font-bold">当前状态：</span>
                        <Tag color={status?.color}>{status?.label}</Tag>
                    </div>
                    <div>
                        <span className="font-bold">所属项目：</span>
                        <span>
                            {
                                projects?.find(
                                    (project) => project.id === data.projectId,
                                )?.name
                            }
                        </span>
                    </div>
                    <div>
                        <span className="font-bold">负责人：</span>
                        <span>
                            {
                                users?.find(
                                    (user) => user.id === data.principalId,
                                )?.name
                            }
                        </span>
                    </div>
                    <div>
                        <span className="font-bold">计划开始时间：</span>
                        <span>{formatBeijingTime(data.startTime)}</span>
                    </div>
                    <div>
                        <span className="font-bold">计划结束时间：</span>
                        <span>{formatBeijingTime(data.endTime)}</span>
                    </div>
                    <div>
                        <span className="font-bold">真实开始时间：</span>
                        <span>{formatBeijingTime(data.realStartTime)}</span>
                    </div>
                    <div>
                        <span className="font-bold">真实结束时间：</span>
                        <span>{formatBeijingTime(data.realEndTime)}</span>
                    </div>
                </div>
            )}
        </Drawer>
    )
}

export default TaskDetail
