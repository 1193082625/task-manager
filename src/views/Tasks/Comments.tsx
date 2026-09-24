import {
    createTaskComment,
    deleteTaskComment,
    getTaskComments,
} from '@/api/comments'
import Loading from '@/components/Loading'
import { useUserStore } from '@/stores/user'
import { formatBeijingTime } from '@/utils/date-time'
import { DeleteOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Empty, Input, List, message, Popconfirm } from 'antd'
import { useState } from 'react'

type TaskCommentsProps = {
    taskId: string
}

function TaskComments({ taskId }: TaskCommentsProps) {
    const [content, setContent] = useState('')
    const queryClient = useQueryClient()

    const currentUserId = useUserStore((state) => state.userInfo?.id)

    const { data, isFetching, error } = useQuery({
        queryKey: ['task-comments', taskId],
        queryFn: ({ signal }) => getTaskComments(taskId, signal),
        retry: false,
    })

    // useMutation 用来管理“主动修改服务端数据”的操作， 比如：创建评论、删除评论、修改任务、切换任务状态、用户登录
    // 与 useQuery 的核心区别是：useQuery 读取数据  useMutation 修改数据
    const createMutation = useMutation({
        mutationFn: (commentContent: string) =>
            createTaskComment(taskId, {
                content: commentContent,
            }),
        onSuccess: async () => {
            setContent('')
            await queryClient.invalidateQueries({
                queryKey: ['task-comments', taskId],
            })

            message.success('评论发布成功')
        },
        onError: () => {
            message.error('评论发布失败')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (commentId: string) => deleteTaskComment(taskId, commentId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['task-comments', taskId],
            })
            message.success('评论删除成功')
        },
        onError: () => {
            message.error('评论删除失败')
        },
    })

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const normalizedContent = content.trim()

        if (!normalizedContent || createMutation.isPending) {
            return
        }

        // mutationFn 不会自动执行，只有调用 mutate() 才会执行
        createMutation.mutate(normalizedContent)
    }

    return (
        <section className="border-t border-gray-200 pt-[20px]">
            <h3 className="mb-[12px] font-bold">任务评论</h3>

            <form
                className="mb-[16px] flex flex-col gap-[8px]"
                onSubmit={handleSubmit}
            >
                <Input.TextArea
                    value={content}
                    maxLength={2000}
                    rows={3}
                    showCount
                    placeholder="输入评论内容"
                    disabled={createMutation.isPending}
                    onChange={(event) => setContent(event.target.value)}
                />

                <Button
                    className="self-end mt-[20px]"
                    type="primary"
                    htmlType="submit"
                    loading={createMutation.isPending}
                    disabled={!content.trim()}
                >
                    发布评论
                </Button>
            </form>

            {isFetching && <Loading />}

            {error && (
                <div role="alert">
                    {error instanceof Error
                        ? error.message
                        : '获取评论列表失败'}
                </div>
            )}

            {!isFetching && !error && (
                <List
                    dataSource={data ?? []}
                    locale={{ emptyText: <Empty description="暂无评论" /> }}
                    renderItem={(comment) => (
                        <List.Item
                            actions={
                                comment.author.id === currentUserId
                                    ? [
                                          <Popconfirm
                                              key="delete"
                                              title="确定删除这条评论吗？"
                                              okText="删除"
                                              cancelText="取消"
                                              onConfirm={() =>
                                                  deleteMutation.mutate(
                                                      comment.id,
                                                  )
                                              }
                                          >
                                              <Button
                                                  type="link"
                                                  danger
                                                  icon={<DeleteOutlined />}
                                                  loading={
                                                      deleteMutation.isPending &&
                                                      deleteMutation.variables ===
                                                          comment.id
                                                  }
                                              >
                                                  删除
                                              </Button>
                                          </Popconfirm>,
                                      ]
                                    : undefined
                            }
                        >
                            <List.Item.Meta
                                title={
                                    <div className="flex items-center justify-between gap-[12px]">
                                        <span>{comment.author.name}</span>
                                        <span className="text-xs font-normal text-gray-500">
                                            {formatBeijingTime(
                                                comment.createdAt,
                                            )}
                                        </span>
                                    </div>
                                }
                                description={
                                    <div className="whitespace-pre-wrap break-words text-gray-700">
                                        {comment.content}
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                ></List>
            )}
        </section>
    )
}
export default TaskComments
