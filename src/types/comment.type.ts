export interface CommentAuthor {
    id: string
    name: string
    role: string
}

export interface TaskComment {
    id: string
    taskId: string
    content: string
    author: CommentAuthor
    createdAt: string
}

export interface CreateComment {
    content: string
}
