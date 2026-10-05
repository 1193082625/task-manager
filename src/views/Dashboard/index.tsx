import { useProjects } from '@/hooks/useProjects'
import { Select } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import MetricCard from './MetricCard'
import dayjs from 'dayjs'
import { useQuery } from '@tanstack/react-query'
import { getProjectScheduleTasks } from '@/api/tasks'
import ProjectGantt from './ProjectGantt'

function Dashboard() {
    const { data: projects = [], isPending: projectsLoading } = useProjects()

    const ongoingProjects = useMemo(
        () => projects.filter((project) => project.status === 'doing'),
        [projects],
    )

    const [selectedProjectId, setSelectedProjectId] = useState<string>()

    useEffect(() => {
        setSelectedProjectId((currentId) => {
            const currentProjectStillAvailable = ongoingProjects.some(
                (project) => project.id === currentId,
            )

            return currentProjectStillAvailable
                ? currentId
                : ongoingProjects[0]?.id
        })
    }, [ongoingProjects])

    const scheduleRange = useMemo(() => {
        const today = dayjs().startOf('day')
        return {
            startTime: today.subtract(7, 'day').format('YYYY-MM-DD'),
            endTime: today.add(6, 'day').format('YYYY-MM-DD'),
        }
    }, [])

    const {
        data: scheduleTasks = [],
        isPending: scheduleLoading,
        error: scheduleError,
    } = useQuery({
        queryKey: [
            'project-schedule-tasks',
            selectedProjectId,
            scheduleRange.startTime,
            scheduleRange.endTime,
        ],
        enabled: Boolean(selectedProjectId),
        queryFn: ({ signal }) =>
            getProjectScheduleTasks({
                projectId: selectedProjectId!,
                startTime: scheduleRange.startTime,
                endTime: scheduleRange.endTime,
                signal,
            }),
        retry: false,
    })

    return (
        <div>
            <div className="grid grid-cols-4 gap-[12px]">
                <MetricCard label="全部任务" value={83} sub="较上周 +5 项" />
                <MetricCard label="进行中" value={24} sub="12 人参与其中" />
                <MetricCard
                    label="本周已完成"
                    value={11}
                    sub="目标 15 项，完成 73%"
                />
                <MetricCard
                    label="已逾期"
                    value={6}
                    sub="需要立即处理"
                    danger
                    link="查看任务"
                />
            </div>
            <section className="mt-[20px] rounded-[10px] border border-[#E5E7EB] bg-white p-[20px]">
                <div className="flex items-center justify-between gap-[16px]">
                    <h2 className="text-[18px] font-semibold text-[#111827]">
                        进行中项目 · 任务排期
                    </h2>

                    <Select
                        className="w-[240px]"
                        placeholder="请选择进行中的项目"
                        loading={projectsLoading}
                        value={selectedProjectId}
                        onChange={setSelectedProjectId}
                        options={ongoingProjects.map((project) => ({
                            value: project.id,
                            label: project.name,
                        }))}
                    />
                </div>

                {!selectedProjectId && (
                    <p className="mt-[16px] text-sm text-[#6B7280]">
                        暂无进行中的项目
                    </p>
                )}

                {selectedProjectId && scheduleLoading && (
                    <p className="mt-[16px] text-sm text-[#6B7280]">
                        正在加载近两周任务…
                    </p>
                )}

                {selectedProjectId && scheduleError && (
                    <p className="mt-[16px] text-sm text-red-500">
                        {scheduleError.message}
                    </p>
                )}

                {selectedProjectId && !scheduleLoading && !scheduleError && (
                    <ProjectGantt
                        tasks={scheduleTasks}
                        startDate={scheduleRange.startTime}
                    />
                )}
            </section>
        </div>
    )
}

export default Dashboard
