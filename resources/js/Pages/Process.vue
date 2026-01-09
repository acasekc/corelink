<template>
    <PublicLayout>
        <Head title="Our Process" />

        <!-- Hero Section -->
        <section class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-24">
            <div class="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
            <div class="relative mx-auto max-w-7xl px-6 lg:px-8">
                <div class="mx-auto max-w-3xl text-center">
                    <h1 class="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                        AI-Powered Development,<br />Expert-Guided Results
                    </h1>
                    <p class="mt-6 text-lg leading-8 text-slate-300">
                        We harness the power of cutting-edge AI tools while maintaining the oversight 
                        and strategic thinking that only comes from 25+ years of software development experience. 
                        The best of both worlds: speed and precision, innovation and wisdom.
                    </p>
                </div>
            </div>
        </section>

        <!-- Expert + AI Section -->
        <section class="bg-gradient-to-b from-slate-900 to-slate-800 py-16">
            <div class="mx-auto max-w-7xl px-6 lg:px-8">
                <div class="mx-auto max-w-3xl text-center">
                    <div class="inline-flex items-center gap-3 rounded-full bg-blue-500/10 px-6 py-2 text-blue-400 ring-1 ring-blue-500/20">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                        <span class="text-sm font-semibold">Human Expertise Meets AI Efficiency</span>
                    </div>
                    <p class="mt-6 text-slate-300">
                        Every AI-assisted decision is validated by a seasoned developer who has navigated 
                        the evolution of web technology from the early days to today's modern frameworks. 
                        This means you get rapid development without sacrificing architectural integrity, 
                        security best practices, or long-term maintainability.
                    </p>
                </div>
            </div>
        </section>

        <!-- Process Timeline -->
        <section class="bg-white py-24">
            <div class="mx-auto max-w-7xl px-6 lg:px-8">
                <div class="mx-auto max-w-2xl text-center mb-16">
                    <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        How We Work
                    </h2>
                    <p class="mt-4 text-lg text-slate-600">
                        A streamlined process that leverages AI at every stage while keeping experienced 
                        human judgment at the helm.
                    </p>
                </div>

                <div class="relative">
                    <!-- Vertical line for desktop -->
                    <div class="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-blue-600 via-blue-400 to-blue-600 lg:block" />

                    <div class="space-y-12 lg:space-y-24">
                        <div
                            v-for="(step, index) in processSteps"
                            :key="step.number"
                            class="relative flex flex-col lg:items-center"
                            :class="index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'"
                        >
                            <!-- Content -->
                            <div class="flex-1" :class="index % 2 === 0 ? 'lg:pr-16 lg:text-right' : 'lg:pl-16'">
                                <div class="rounded-2xl bg-slate-50 p-8 shadow-sm transition-shadow hover:shadow-md">
                                    <div class="flex items-center gap-4" :class="index % 2 === 0 ? 'lg:justify-end' : ''">
                                        <span class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white lg:hidden">
                                            {{ step.number }}
                                        </span>
                                        <h3 class="text-2xl font-bold text-slate-900">{{ step.title }}</h3>
                                    </div>
                                    <p class="mt-4 text-slate-600">{{ step.description }}</p>
                                    <ul class="mt-6 space-y-2" :class="index % 2 === 0 ? 'lg:text-right' : ''">
                                        <li
                                            v-for="(detail, detailIndex) in step.details"
                                            :key="detailIndex"
                                            class="flex items-start gap-2 text-sm text-slate-600"
                                            :class="index % 2 === 0 ? 'lg:flex-row-reverse' : ''"
                                        >
                                            <svg
                                                class="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fill-rule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clip-rule="evenodd"
                                                />
                                            </svg>
                                            <span>{{ detail }}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <!-- Center number (desktop only) -->
                            <div class="absolute left-1/2 hidden -translate-x-1/2 lg:block">
                                <div class="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-xl font-bold text-white shadow-lg">
                                    {{ step.number }}
                                </div>
                            </div>

                            <!-- Empty space for alternating layout -->
                            <div class="hidden flex-1 lg:block" />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Why Choose Us -->
        <section class="bg-slate-50 py-24">
            <div class="mx-auto max-w-7xl px-6 lg:px-8">
                <div class="mx-auto max-w-2xl text-center">
                    <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        The CoreLink Advantage
                    </h2>
                    <p class="mt-4 text-lg text-slate-600">
                        Combining decades of hands-on experience with the latest AI capabilities 
                        to deliver exceptional results.
                    </p>
                </div>

                <div class="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    <div
                        v-for="(item, index) in advantages"
                        :key="index"
                        class="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                            <svg
                                class="h-6 w-6 text-blue-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    :d="item.icon"
                                />
                            </svg>
                        </div>
                        <h3 class="mt-4 text-lg font-semibold text-slate-900">{{ item.title }}</h3>
                        <p class="mt-2 text-slate-600">{{ item.description }}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="bg-blue-600 py-16">
            <div class="mx-auto max-w-7xl px-6 lg:px-8">
                <div class="mx-auto max-w-2xl text-center">
                    <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Ready to Start Your Project?
                    </h2>
                    <p class="mt-4 text-lg text-blue-100">
                        Begin with our AI-powered discovery process and see how we can bring your vision to life.
                    </p>
                    <div class="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link
                            href="/contact"
                            class="rounded-lg bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-sm transition-colors hover:bg-blue-50"
                        >
                            Start the Discovery Process
                        </Link>
                        <Link
                            href="/projects"
                            class="rounded-lg border-2 border-white px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white hover:text-blue-600"
                        >
                            View Our Work
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    </PublicLayout>
</template>

<script setup>
import { Head, Link } from '@inertiajs/vue3';
import PublicLayout from '@/Layouts/PublicLayout.vue';

const processSteps = [
    {
        number: 1,
        title: 'Discovery Process',
        description: 'Our AI-driven discovery bot guides you through an intelligent conversation to understand your vision, challenges, and goals—generating a comprehensive project brief that captures every detail.',
        details: [
            'Interactive AI-guided requirements gathering',
            'Automatic identification of key features and priorities',
            'Expert review of AI-generated recommendations',
            'Comprehensive project brief delivered to your inbox',
        ],
    },
    {
        number: 2,
        title: 'Strategy & Architecture',
        description: 'With 25+ years of experience informing every decision, we translate your requirements into a solid technical foundation—selecting the right technologies and designing scalable architecture.',
        details: [
            'Technology stack selection based on project needs',
            'System architecture designed for growth',
            'AI-assisted research and analysis',
            'Expert validation of all technical decisions',
        ],
    },
    {
        number: 3,
        title: 'Design & Prototyping',
        description: 'We create intuitive, beautiful interfaces using AI-enhanced design tools, with every decision guided by decades of UX expertise and real-world project experience.',
        details: [
            'AI-accelerated UI/UX design workflows',
            'Interactive prototypes for early feedback',
            'Responsive designs for all devices',
            'Accessibility built in from the start',
        ],
    },
    {
        number: 4,
        title: 'AI-Enhanced Development',
        description: 'This is where AI truly shines. We leverage advanced AI coding assistants to write, review, and optimize code—always under the watchful eye of a veteran developer who ensures quality, security, and best practices.',
        details: [
            'AI pair programming for rapid development',
            'Every line reviewed by experienced human developer',
            'Modern, maintainable code architecture',
            'Continuous integration and automated testing',
        ],
    },
    {
        number: 5,
        title: 'Quality Assurance',
        description: 'Comprehensive testing combines AI-powered analysis with manual expert review to catch issues before they reach production.',
        details: [
            'AI-assisted code review and security scanning',
            'Automated and manual testing coverage',
            'Performance optimization and load testing',
            'Cross-browser and device compatibility',
        ],
    },
    {
        number: 6,
        title: 'Launch & Beyond',
        description: 'We handle deployment with care and continue supporting your project with ongoing maintenance, updates, and strategic improvements as your needs evolve.',
        details: [
            'Smooth, monitored deployment process',
            'Training and documentation provided',
            'Ongoing support and maintenance',
            'Strategic guidance for future growth',
        ],
    },
];

const advantages = [
    {
        title: '25+ Years Experience',
        description: 'Every project benefits from decades of real-world development experience, from startups to enterprise solutions.',
        icon: 'M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5',
    },
    {
        title: 'AI-Accelerated Delivery',
        description: 'Cutting-edge AI tools dramatically speed up development while maintaining the highest quality standards.',
        icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z',
    },
    {
        title: 'Human Oversight',
        description: 'AI assists, but an experienced developer reviews every decision to ensure nothing slips through the cracks.',
        icon: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    },
    {
        title: 'Transparent Process',
        description: 'Clear communication at every stage keeps you informed and involved throughout your project.',
        icon: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z',
    },
    {
        title: 'Built for Scale',
        description: 'Architecture decisions made with growth in mind, so your application can evolve as your business does.',
        icon: 'M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941',
    },
    {
        title: 'Long-term Partner',
        description: "We're invested in your success beyond launch, providing ongoing support and strategic guidance.",
        icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    },
];
</script>
