import './App.css'
import { RouterProvider } from 'react-router'
import router from './routes'
import { Suspense } from 'react'
import Loading from './components/Loading'

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}

export default App
