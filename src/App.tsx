import { RouterProvider } from 'react-router'
import router from './routes'
import { Suspense } from 'react'
import Loading from './components/Loading'
// QueryClientProvider 让内部组件可以使用同一个查询客户端
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

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
