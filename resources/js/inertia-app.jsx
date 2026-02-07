import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import InertiaPublicLayout from './Layouts/InertiaPublicLayout';
import '../css/globals.css';

createInertiaApp({
    title: title => title ? `${title} | CoreLink Development` : 'CoreLink Development',
    resolve: name => {
        const pages = import.meta.glob('./Pages/**/*.jsx');
        return pages[`./Pages/${name}.jsx`]().then(module => {
            const page = module.default;
            page.layout = page.layout || (page => <InertiaPublicLayout>{page}</InertiaPublicLayout>);
            return module;
        });
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
