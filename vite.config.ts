import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8283',
                changeOrigin: true,
            },
            '/monitorApi': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                rewrite: () => '/api',
            },
        },
    },
})
