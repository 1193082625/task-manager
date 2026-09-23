import fetchService from '@/api/request'
import Loading from '@/components/Loading'
import { USER_ROLES } from '@/constant'
import type { User } from '@/types/user.type'
import { useQuery } from '@tanstack/react-query'
import { Drawer } from 'antd'

type UserDetailProps = {
    id: string | undefined
    detailOpen: boolean
    onClose: () => void
}

function UserDetail({ id, detailOpen, onClose }: UserDetailProps) {
    const { data, isFetching, error } = useQuery({
        queryKey: ['user-detail', id],
        // 只有弹窗打开，并且选中了项目，才自动请求
        enabled: detailOpen && !!id,
        queryFn: async ({ signal }) => {
            if (!id) {
                throw new Error('缺少用户 ID')
            }
            const result = await fetchService.get<User>(`/api/users/${id}`, {
                signal,
            })

            if (!result) {
                throw new Error('获取用户详情失败')
            }

            return result
        },
        retry: false,
    })
    const title = data?.name ?? '用户详情'

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
                        <span className="font-bold">成员名称：</span>
                        <span>{data.name}</span>
                    </div>
                    <div>
                        <span className="font-bold">手机号：</span>
                        <span>{data?.phone}</span>
                    </div>
                    <div>
                        <span className="font-bold">角色：</span>
                        <span>
                            {
                                USER_ROLES.find(
                                    (role) => role.value === data.role,
                                )?.label
                            }
                        </span>
                    </div>
                </div>
            )}
        </Drawer>
    )
}

export default UserDetail
