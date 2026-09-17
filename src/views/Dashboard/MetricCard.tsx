const IconArrowRight = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
)

const IconAlertCircle = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
)
function MetricCard({
    label,
    value,
    sub,
    danger,
    link,
}: {
    label: string
    value: number
    sub: string
    danger?: boolean
    link?: string
}) {
    return (
        <div
            className={`bg-white rounded-[10px] border border-[#E5E7EB] p-5 flex flex-col gap-3 ${danger ? 'border-red-200' : ''}`}
            style={danger ? { borderColor: '#FECACA' } : {}}
        >
            <div className="flex items-center justify-between">
                <span
                    style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}
                >
                    {label}
                </span>
                {danger && (
                    <span style={{ color: '#DC2626' }}>
                        <IconAlertCircle />
                    </span>
                )}
            </div>
            <div
                style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: danger ? '#DC2626' : '#111827',
                    lineHeight: 1,
                }}
            >
                {value}
            </div>
            <div className="flex items-center justify-between">
                <span
                    style={{
                        fontSize: 12,
                        color: danger ? '#DC2626' : '#9CA3AF',
                    }}
                >
                    {sub}
                </span>
                {link && (
                    <button
                        style={{
                            fontSize: 12,
                            color: '#2563EB',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: 0,
                            fontWeight: 500,
                        }}
                    >
                        {link} <IconArrowRight />
                    </button>
                )}
            </div>
        </div>
    )
}

export default MetricCard
