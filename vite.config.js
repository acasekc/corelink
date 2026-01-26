import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/main.jsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // Vendor chunks
                    if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
                        return 'vendor-react';
                    }
                    if (id.includes('node_modules/lucide-react')) {
                        return 'vendor-ui';
                    }
                    if (id.includes('node_modules/')) {
                        return 'vendor-other';
                    }
                    
                    // Layout chunks
                    if (id.includes('components/PublicLayout') || id.includes('components/AdminLayout')) {
                        return 'layout';
                    }
                    
                    // Blog route chunk
                    if (id.includes('Pages/Blog/')) {
                        return 'route-blog';
                    }
                    
                    // Admin helpdesk route chunk
                    if (id.includes('Pages/Admin/Helpdesk/')) {
                        return 'route-admin-helpdesk';
                    }
                    
                    // Admin discovery route chunk
                    if (id.includes('Pages/Admin/Discovery/')) {
                        return 'route-admin-discovery';
                    }
                    
                    // Admin articles route chunk
                    if (id.includes('Pages/Admin/Articles/')) {
                        return 'route-admin-articles';
                    }
                    
                    // Admin management routes chunk (projects, case studies)
                    if (id.includes('Pages/Admin/')) {
                        return 'route-admin';
                    }
                    
                    // User helpdesk route chunk
                    if (id.includes('Pages/Helpdesk/')) {
                        return 'route-user-helpdesk';
                    }
                    
                    // Discovery chunk
                    if (id.includes('Pages/Discovery/')) {
                        return 'route-discovery';
                    }
                    
                    // Other public routes chunk
                    if (id.includes('Pages/')) {
                        return 'route-public';
                    }
                },
            },
        },
        chunkSizeWarningLimit: 600,
    },
    server: {
        host: '127.0.0.1',
        port: 5173,
        hmr: {
            host: 'localhost',
            port: 5173,
        },
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
