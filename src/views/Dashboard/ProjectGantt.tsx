import type { TaskItem } from '@/types/task.type'
import dayjs from 'dayjs'

type ProjectGanttProps = {
    tasks: TaskItem[]
    startDate: string
}

type VisibleTaskRange = {
    startOffset: number
    span: number
}

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']
const TOTAL_DAYS = 14
const TASK_STATUS_COLORS: Record<TaskItem['status'], string> = {
    notStarted: 'bg-cyan-500',
    doing: 'bg-blue-500',
    stopped: 'bg-purple-500',
    completed: 'bg-green-500',
    canceled: 'bg-gray-400',
}

function getVisibleTaskRange(
    task: TaskItem,
    startDate: string,
): VisibleTaskRange | null {
    const windowStart = dayjs(startDate).startOf('day')
    const windowEnd = windowStart.add(TOTAL_DAYS - 1, 'day')
    const taskStart = dayjs(task.startTime).startOf('day')
    const taskEnd = dayjs(task.endTime).startOf('day')

    if (
        !taskStart.isValid() ||
        !taskEnd.isValid() ||
        taskEnd.isBefore(windowStart, 'day') ||
        taskStart.isAfter(windowEnd, 'day')
    ) {
        return null
    }

    const visibleStart = taskStart.isBefore(windowStart, 'day')
        ? windowStart
        : taskStart
    const visibleEnd = taskEnd.isAfter(windowEnd, 'day') ? windowEnd : taskEnd

    return {
        startOffset: visibleStart.diff(windowStart, 'day'),
        span: visibleEnd.diff(visibleStart, 'day') + 1,
    }
}

function ProjectGantt({ tasks, startDate }: ProjectGanttProps) {
    const today = dayjs().startOf('day')

    const days = Array.from({ length: TOTAL_DAYS }, (_, index) =>
        dayjs(startDate).add(index, 'day'),
    )

    const visibleTasks = tasks.filter(
        (task) => getVisibleTaskRange(task, startDate) !== null,
    )

    return (
        <div className="mt-[20px] overflow-x-auto">
            <div className="min-w-[980px]">
                <div
                    className="grid overflow-hidden rounded-t-[8px] border border-[#E5E7EB] bg-[#F9FAFB]"
                    style={{
                        gridTemplateColumns:
                            '220px repeat(14, minmax(52px, 1fr))',
                    }}
                >
                    <div className="border-r border-[#E5E7EB] px-[16px] py-[12px] text-sm text-[#6B7280]">
                        任务
                    </div>
                    {days.map((day) => {
                        const isToday = day.isSame(today, 'day')

                        return (
                            <div
                                key={day.format('YYYY-MM-DD')}
                                className={`border-r border-[#E5E7EB] px-[4px] py-[10px] text-center text-xs ${
                                    isToday
                                        ? 'bg-blue-50 font-semibold text-blue-600'
                                        : 'text-[#6B7280]'
                                }`}
                            >
                                <div>周{WEEKDAY_LABELS[day.day()]}</div>
                                <div className="mt-[2px]">
                                    {day.format('MM/DD')}
                                </div>
                            </div>
                        )
                    })}
                </div>
                {visibleTasks.length === 0 ? (
                    <div className="flex min-h-[240px] items-center justify-center rounded-b-[8px] border-x border-b border-[#E5E7EB] bg-white text-sm text-[#6B7280]">
                        近两周没有计划任务
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-b-[8px] border-x border-b border-[#E5E7EB] bg-white">
                        {visibleTasks.map((task) => {
                            const visibleRange = getVisibleTaskRange(
                                task,
                                startDate,
                            )

                            if (!visibleRange) {
                                return null
                            }

                            return (
                                <div
                                    key={task.id}
                                    className="grid min-h-[56px] border-b border-[#E5E7EB] last:border-b-0"
                                    style={{
                                        gridTemplateColumns:
                                            '220px repeat(14, minmax(52px, 1fr))',
                                    }}
                                >
                                    <div className="flex items-center border-r border-[#E5E7EB] px-[16px] text-sm font-medium text-[#374151]">
                                        {task.name}
                                    </div>

                                    {days.map((day) => (
                                        <div
                                            key={`${task.id}-${day.format('YYYY-MM-DD')}`}
                                            className="border-r border-[#F3F4F6] last:border-r-0"
                                        />
                                    ))}

                                    <div
                                        className={`z-10 my-[12px] flex min-w-0 items-center rounded-[4px] px-[8px] text-xs text-white ${TASK_STATUS_COLORS[task.status]}`}
                                        style={{
                                            gridColumn: `${visibleRange.startOffset + 2} / span ${visibleRange.span}`,
                                            gridRow: 1,
                                        }}
                                        title={task.name}
                                    >
                                        <span className="truncate">
                                            {task.name}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
export default ProjectGantt
