import { RouterProvider } from 'react-router'
import router from './routes'
import { Suspense } from 'react'
import Loading from './components/Loading'
// QueryClientProvider 让内部组件可以使用同一个查询客户端
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './api/queryClient'

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Suspense fallback={<Loading />}>
                <RouterProvider router={router} />
            </Suspense>
        </QueryClientProvider>
    )
}

export default App
