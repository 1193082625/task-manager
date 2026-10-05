import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/styles/index.css'
import App from './App.tsx'
import { createPaintMonitor } from '@performance-platform/browser'

const monitor = createPaintMonitor({
    endpoint: import.meta.env.VITE_MONITOR_ENDPOINT,
    appKey: import.meta.env.VITE_MONITOR_APP_KEY,
    appId: import.meta.env.VITE_MONITOR_APP_ID,
    appVersion: import.meta.env.VITE_MONITOR_APP_VERSION,
    environment: 'development',
    sampleRate: Number(import.meta.env.VITE_MONITOR_SAMPLE_RATE),
    debug: (message, error) => {
        console.debug('[performance-platform]', message, error)
    },
})
monitor.start()

async function prepare() {
    if (import.meta.env.DEV) {
        const { worker } = await import('@/mocks/browser.ts')
        return worker.start()
    }
}

prepare().then(() => {
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <App />
        </StrictMode>,
    )
})
