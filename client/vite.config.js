import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env file from the root directory
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [react()],
        server: {
            // 1. Host must be true for Docker to map the port to your browser
            host: true,
            port: 5173,
            strictPort: true,
            // 2. The "Magic" for Windows + Docker Hot Reloading
            watch: {
                usePolling: true, // Force Vite to check for file changes every few milliseconds
            },
            // 3. Proxying API calls to the Backend container
            proxy: {
                '/api': {
                    target: env.VITE_BACKEND_URL || 'http://backend:3000',
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
    };
});