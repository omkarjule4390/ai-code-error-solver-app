import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// Set base to your GitHub repo name for Project Pages, e.g. '/ai-code-error-solver/'
// If deploying to a *.github.io user/organization page, leave base as '/'.
export default defineConfig({
    base: '/ai-code-error-solver/',
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
    },
});
