import React from 'react';
import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import ReactDOMServer from 'react-dom/server';
import InertiaPublicLayout from './Layouts/InertiaPublicLayout';

createServer(page =>
    createInertiaApp({
        page,
        title: title => title ? `${title} | CoreLink Development` : 'CoreLink Development',
        render: ReactDOMServer.renderToString,
        resolve: name => {
            const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
            const module = pages[`./Pages/${name}.jsx`];
            module.default.layout = module.default.layout || (page => <InertiaPublicLayout>{page}</InertiaPublicLayout>);
            return module;
        },
        setup: ({ App, props }) => <App {...props} />,
    }),
);
