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
        <meta property="og:image" content="{{ (isset($ogMeta['image']) && $ogMeta['image']) ? $ogMeta['image'] : url('/images/og-default.png') }}">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="{{ $ogMeta['url'] ?? url()->current() }}">
        <meta property="twitter:title" content="{{ $ogMeta['title'] ?? config('app.name') }}">
        <meta property="twitter:description" content="{{ $ogMeta['description'] ?? 'CoreLink Development specializes in crafting intelligent, scalable web and mobile applications using cutting-edge AI technology.' }}">
        <meta property="twitter:image" content="{{ (isset($ogMeta['image']) && $ogMeta['image']) ? $ogMeta['image'] : url('/images/og-default.png') }}">

        <!-- Favicon -->
        <link rel="icon" type="image/png" href="/images/favicon.png">

        @unless(request()->is('admin/*') || request()->is('helpdesk/*'))
        <!-- Google Tag Manager (non-blocking) -->
        <script async defer>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-WDTLBL3P');</script>
        <!-- End Google Tag Manager -->

        <!-- DNS Prefetch for GTM -->
        <link rel="dns-prefetch" href="https://www.googletagmanager.com">
        @endunless

        <!-- DNS Prefetch for external resources -->
        <link rel="dns-prefetch" href="https://fonts.googleapis.com">
        <link rel="dns-prefetch" href="https://fonts.gstatic.com">

        <!-- Fonts - Preload critical fonts for LCP improvement -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <!-- Preload critical font weights to reduce render blocking -->
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;600&display=swap" as="style">
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
        <noscript><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet"></noscript>

        @unless(request()->is('admin/*') || request()->is('helpdesk/*'))
        <!-- Local Business Schema for Google Business -->
        <script type="application/ld+json">
        {
            "@@context": "https://schema.org",
            "@@graph": [
                {
                    "@@type": "Organization",
                    "@@id": "https://corelink.dev/#organization",
                    "name": "CoreLink Development LLC",
                    "url": "https://corelink.dev",
                    "logo": {
                        "@@type": "ImageObject",
                        "url": "https://corelink.dev/images/logo_blue.png",
                        "width": 300,
                        "height": 100
                    },
                    "image": "https://corelink.dev/images/og-default.png",
                    "description": "CoreLink Development specializes in crafting intelligent, scalable web and mobile applications using cutting-edge AI technology with expert developer oversight.",
                    "email": "info@corelink.dev",
                    "sameAs": [
                        "https://www.facebook.com/corelink.dev",
                        "https://instagram.com/Corelink.dev"
                    ],
                    "contactPoint": {
                        "@@type": "ContactPoint",
                        "contactType": "customer service",
                        "email": "info@corelink.dev",
                        "availableLanguage": "English"
                    }
                },
                {
                    "@@type": "ProfessionalService",
                    "@@id": "https://corelink.dev/#localbusiness",
                    "name": "CoreLink Development LLC",
                    "url": "https://corelink.dev",
                    "logo": "https://corelink.dev/images/logo_blue.png",
                    "image": "https://corelink.dev/images/og-default.png",
                    "description": "AI-powered web and mobile application development services. We combine cutting-edge AI technology with expert developer oversight to deliver intelligent, scalable solutions.",
                    "priceRange": "$$",
                    "email": "info@corelink.dev",
                    "address": {
                        "@@type": "PostalAddress",
                        "addressLocality": "Bates City",
                        "addressRegion": "MO",
                        "postalCode": "64011",
                        "addressCountry": "US"
                    },
                    "geo": {
                        "@@type": "GeoCoordinates",
                        "latitude": 39.0067,
                        "longitude": -94.0747
                    },
                    "areaServed": [
                        {
                            "@@type": "Country",
                            "name": "United States"
                        },
                        {
                            "@@type": "AdministrativeArea",
                            "name": "Missouri"
                        },
                        {
                            "@@type": "AdministrativeArea",
                            "name": "Kansas"
                        },
                        {
                            "@@type": "AdministrativeArea",
                            "name": "Colorado"
                        },
                        {
                            "@@type": "AdministrativeArea",
                            "name": "Iowa"
                        },
                        {
                            "@@type": "AdministrativeArea",
                            "name": "Nebraska"
                        },
                        {
                            "@@type": "AdministrativeArea",
                            "name": "Illinois"
                        },
                        {
                            "@@type": "AdministrativeArea",
                            "name": "Kentucky"
                        },
                        {
                            "@@type": "AdministrativeArea",
                            "name": "Tennessee"
                        },
                        {                            
                            "@@type": "AdministrativeArea",
                            "name": "Indiana"
                        },
                        {
                            "@@type": "AdministrativeArea",
                            "name": "Oklahoma"
                        },
                        {
                            "@@type": "AdministrativeArea",
                            "name": "Arkansas"
                        },
                        {
                            "@@type": "AdministrativeArea",
                            "name": "Minnesota"
                        },
                        {
                            "@@type": "AdministrativeArea",
                            "name": "Wisconsin"
                        },
                        {
                            "@@type": "AdministrativeArea",
                            "name": "Ohio"
                        },
                        {
                            "@@type": "AdministrativeArea",
                            "name": "Michigan"
                        }
                    ],
                    "serviceType": [
                        "Web Application Development",
                        "Mobile Application Development",
                        "AI-Powered Software Development",
                        "SaaS Development",
                        "Custom Software Development",
                        "API Development",
                        "E-commerce Development"
                    ],
                    "knowsAbout": [                        
                        "Web Application Development",
                        "Mobile Application Development",
                        "AI-Powered Software Development",
                        "SaaS Development",
                        "Custom Software Development",
                        "API Development",
                        "E-commerce Development",
                        "Laravel",
                        "React",
                        "Vue.js",
                        "Node.js",
                        "AI Development",
                        "Machine Learning Integration",
                        "PostgreSQL",
                        "AWS",
                        "Tailwind CSS"
                    ],
                    "sameAs": [
                        "https://www.facebook.com/corelink.dev",
                        "https://instagram.com/Corelink.dev"
                    ],
                    "openingHoursSpecification": [
                        {
                            "@@type": "OpeningHoursSpecification",
                            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                            "opens": "08:00",
                            "closes": "17:00"
                        },
                        {
                            "@@type": "OpeningHoursSpecification",
                            "dayOfWeek": ["Saturday"],
                            "opens": "08:00",
                            "closes": "12:00"
                        }
                    ]
                },
                {
                    "@@type": "WebSite",
                    "@@id": "https://corelink.dev/#website",
                    "url": "https://corelink.dev",
                    "name": "CoreLink Development",
                    "description": "AI-powered web and mobile application development",
                    "publisher": {
                        "@@id": "https://corelink.dev/#organization"
                    },
                    "potentialAction": {
                        "@@type": "SearchAction",
                        "target": {
                            "@@type": "EntryPoint",
                            "urlTemplate": "https://corelink.dev/blog?search={search_term_string}"
                        },
                        "query-input": "required name=search_term_string"
                    }
                }
            ]
        }
        </script>
        @endunless

        <!-- Scripts -->
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/main.jsx'])
    </head>
    <body class="font-sans antialiased">
        @unless(request()->is('admin/*') || request()->is('helpdesk/*'))
        <!-- Google Tag Manager (noscript) -->
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WDTLBL3P"
        height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
        <!-- End Google Tag Manager (noscript) -->
        @endunless
        <div id="app"></div>
    </body>
</html>
