import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.axios = axios;
window.Pusher = Pusher;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Configure Laravel Echo with Reverb
window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});

export function resolvePageComponent(path, pages) {
    console.log('Resolving page:', path);
    console.log('Available pages:', Object.keys(pages));
    
    // Normalize path - remove leading ./
    const normalizedPath = path.startsWith('./') ? path.slice(2) : path;
    
    for (const file in pages) {
        // Check if file ends with the normalized path
        const fileNormalized = file.startsWith('./') ? file.slice(2) : file;
        
        if (fileNormalized === normalizedPath || fileNormalized.endsWith('/' + normalizedPath) || file.endsWith(normalizedPath)) {
            console.log('Found match:', file);
            const resolved = pages[file];
            // Handle both lazy and eager imports
            if (typeof resolved === 'function') {
                return resolved();
            } else if (resolved && resolved.default) {
                return resolved.default;
            } else {
                return resolved;
            }
        }
    }
    
    const availablePages = Object.keys(pages).map(f => f.replace(/^\.\//g, '').replace(/\.vue$/g, ''));
    console.error('Available pages:', availablePages);
    throw new Error(`Page not found: ${path}`);
}

