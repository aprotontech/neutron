import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [
        vue()
    ],
    optimizeDeps: {
        include: ['protobufjs/minimal']
    },
    server: {
        port: 5173,
        host: true,
        proxy: {
            '/api': {
                target: 'http://192.168.1.115:8080',
                changeOrigin: true,
            },
            '/ws': {
                target: 'ws://192.168.1.115:8080',
                ws: true,
                changeOrigin: true
            }
        },
        watch: {
            ignored: [
                '**/.cache/**',
                '**/android/**',
                '**/ios/**',
                '**/www/**',
                '**/node_modules/**'
            ]
        }
    },
    base: './',
    build: {
        outDir: 'www',
        emptyOutDir: true
    }
})
