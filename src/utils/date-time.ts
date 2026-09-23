import dayjs, { type Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export const dateTimeFormat = 'YYYY-MM-DD HH:mm:ss'

// 服务端时刻 --> 北京时间展示
export function toBeijingTime(value: string) {
    return dayjs(value).utcOffset(8 * 60)
}

// 将选择器上显示的年月日、时分秒解释为北京时间
export function pickerTimeToIso(value: Dayjs) {
    return value.utcOffset(8 * 60, true).toISOString()
}

export function formatBeijingTime(value: string | null | undefined) {
    return value ? toBeijingTime(value).format(dateTimeFormat) : '--'
}
