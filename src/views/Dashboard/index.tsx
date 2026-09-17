import MetricCard from './MetricCard'

function Dashboard() {
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
        </div>
    )
}

export default Dashboard
