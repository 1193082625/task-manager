import fetchService from '@/api/request'
import Loading from '@/components/Loading'
import { STAGE, STATUS } from '@/constant'
import { useUsers } from '@/hooks/useUsers'
import type { ProjectDetail as ProjectDetailData } from '@/types/project.type'
import { useQuery } from '@tanstack/react-query'
import { Drawer, Tag } from 'antd'

type ProjectDetailProps = {
    projectId: string | undefined
    detailOpen: boolean
    onClose: () => void
}

function ProjectDetail({ projectId, detailOpen, onClose }: ProjectDetailProps) {
    const { data, isFetching, error } = useQuery({
        queryKey: ['project-detail', projectId],
        // 只有弹窗打开，并且选中了项目，才自动请求
        enabled: detailOpen && !!projectId,
        queryFn: async ({ signal }) => {
            if (!projectId) {
                throw new Error('缺少项目 ID')
            }
            const result = await fetchService.get<ProjectDetailData>(
                `/api/project/${projectId}`,
                { signal },
            )

            if (!result) {
                throw new Error('获取项目详情失败')
            }

            return result
        },
        retry: false,
    })
    const title = data?.name ?? '项目详情'

    const { data: users = [] } = useUsers()

    const principal = users.find((user) => user.id === data?.principalId)
    const membersName = [
        ...new Set([
            principal,
            ...users.filter((user) => data?.memberIds.includes(user.id)),
        ]),
    ].map((user) => user?.name)

    const stage = STAGE.find((stage) => stage.value === data?.stage)
    const status = STATUS.find((state) => state.value === data?.status)
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
                        <span className="block mb-[10px] font-bold">
                            项目描述：
                        </span>
                        <span>{data.description}</span>
                    </div>
                    <div>
                        <span className="font-bold">负责人：</span>
                        <span>
                            {principal?.name + ` (${principal?.phone}) `}
                        </span>
                    </div>
                    <div>
                        <span className="font-bold">项目成员：</span>
                        <span>{membersName.join('、') || '--'}</span>
                    </div>
                    <div>
                        <span className="font-bold">阶段：</span>
                        <Tag color={stage?.color}>{stage?.label}</Tag>
                    </div>
                    <div>
                        <span className="font-bold">状态：</span>
                        <Tag color={status?.color}>{status?.label}</Tag>
                    </div>
                    <div>
                        <span className="font-bold">任务状态：</span>
                        <span>
                            {data.completedTaskCount}/{data.taskCount}
                        </span>
                    </div>
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

export default ProjectDetail
