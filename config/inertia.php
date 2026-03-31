<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Server Side Rendering
    |--------------------------------------------------------------------------
    |
    | These options configures if and how Inertia uses Server Side Rendering
    | to pre-render the initial visits made to your application's pages.
    |
    | Do note: enabling these options will NOT automatically make SSR work,
    | as a separate SSR build is also required. See the Inertia docs for info.
    |
    */

    'ssr' => [
        'enabled' => true,

        'url' => 'http://127.0.0.1:13717/render',

        'ensure_bundle_exists' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Testing
    |--------------------------------------------------------------------------
    |
    | The values described here are used to locate Inertia components on the
    | filesystem. For instance, when using `assertInertia`, the assertion
    | attempts to locate the component as a file relative to any of the
    | paths AND any of the extensions specified here.
    |
    */

    'testing' => [
        'ensure_pages_exist' => false,

        'page_paths' => [
            resource_path('js/Pages'),
        ],

        'page_extensions' => [
            'jsx',
        ],
    ],

];
