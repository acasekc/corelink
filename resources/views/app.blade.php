<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="{{ $ogMeta['description'] ?? 'CoreLink Development specializes in crafting intelligent, scalable web and mobile applications using cutting-edge AI technology.' }}">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ isset($ogMeta['title']) ? $ogMeta['title'] . ' | ' . config('app.name') : config('app.name', 'Laravel') }}</title>

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="{{ $ogMeta['type'] ?? 'website' }}">
        <meta property="og:url" content="{{ $ogMeta['url'] ?? url()->current() }}">
        <meta property="og:title" content="{{ $ogMeta['title'] ?? config('app.name') }}">
        <meta property="og:description" content="{{ $ogMeta['description'] ?? 'CoreLink Development specializes in crafting intelligent, scalable web and mobile applications using cutting-edge AI technology.' }}">
        @if(isset($ogMeta['image']) && $ogMeta['image'])
        <meta property="og:image" content="{{ $ogMeta['image'] }}">
        @else
        <meta property="og:image" content="{{ url('/images/og-default.png') }}">
        @endif

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="{{ $ogMeta['url'] ?? url()->current() }}">
        <meta property="twitter:title" content="{{ $ogMeta['title'] ?? config('app.name') }}">
        <meta property="twitter:description" content="{{ $ogMeta['description'] ?? 'CoreLink Development specializes in crafting intelligent, scalable web and mobile applications using cutting-edge AI technology.' }}">
        @if(isset($ogMeta['image']) && $ogMeta['image'])
        <meta property="twitter:image" content="{{ $ogMeta['image'] }}">
        @else
        <meta property="twitter:image" content="{{ url('/images/og-default.png') }}">
        @endif

        <!-- Favicon -->
        <link rel="icon" type="image/png" href="/images/favicon.png">

        <!-- Google Tag Manager -->
        <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-WDTLBL3P');</script>
        <!-- End Google Tag Manager -->

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/main.jsx'])
    </head>
    <body class="font-sans antialiased">
        <!-- Google Tag Manager (noscript) -->
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WDTLBL3P"
        height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
        <!-- End Google Tag Manager (noscript) -->
        <div id="app"></div>
    </body>
</html>
