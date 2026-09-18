import fetchService from '@/api/request'
import Loading from '@/components/Loading'
import type { Task } from '@/types/task.type'
import { useQuery } from '@tanstack/react-query'
import { Drawer } from 'antd'

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
    const title = data?.name ?? '任务详情'

    // const { data: userResult = [] } = useUsers()
    // const userList = userResult.map((user) => ({
    //     value: user.id,
    //     label: user.name,
    // }))

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
                    {/* <div>
                        <span className="font-bold">所属项目：</span>
                        <span>
                            {
                                USER_ROLES.find(
                                    (role) => role.value === data.role,
                                )?.label
                            }
                        </span>
                    </div> */}
                    {/* <div>
                        <span className="font-bold">负责人：</span>
                        <span>
                            {
                                userList.find(
                                    (user) => user.id === data.principalId,
                                )?.label
                            }
                        </span>
                    </div> */}
                    <div>
                        <span className="font-bold">计划开始时间：</span>
                        <span>{data.startTime}</span>
                    </div>
                    <div>
                        <span className="font-bold">计划结束时间：</span>
                        <span>{data.endTime}</span>
                    </div>
                    <div>
                        <span className="font-bold">真实开始时间：</span>
                        <span>{data.realStartTime}</span>
                    </div>
                    <div>
                        <span className="font-bold">真实结束时间：</span>
                        <span>{data.realEndTime}</span>
                    </div>
                </div>
            )}
        </Drawer>
    )
}

export default TaskDetail
