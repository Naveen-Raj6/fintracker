import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
    // This line loads your variables from the .env or Docker environment
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [react()],
        server: {
            port: 5173,
            host: true, // Crucial: same as --host, allows Docker to access the port
            watch: {
                usePolling: true, // Required for Windows 11 + Docker to sync file changes
            },
            proxy: {
                '/api': {
                    // Use the service name 'backend' if communicating container-to-container
                    // Or localhost:3000 if your browser is doing the heavy lifting
                    target: env.VITE_BACKEND_URL || 'http://backend:3000',
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
    }
})