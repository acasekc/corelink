<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <!-- Navigation -->
        <nav class="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700 z-50">
            <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center font-bold">
                        CL
                    </div>
                    <span class="text-xl font-bold">CoreLink</span>
                </div>
                <div class="hidden md:flex gap-8">
                    <Link href="/" class="hover:text-blue-400 transition">Home</Link>
                    <Link href="/projects" class="hover:text-blue-400 transition">Projects</Link>
                    <Link href="/about" class="hover:text-blue-400 transition">About</Link>
                    <Link href="/contact" class="hover:text-blue-400 transition">Contact</Link>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <div class="pt-32 pb-20 px-6">
            <div class="max-w-3xl mx-auto">
                <!-- Header -->
                <div class="text-center mb-12">
                    <div class="inline-block mb-4 px-4 py-2 bg-green-500/20 border border-green-400/50 rounded-full text-sm text-green-400">
                        Discovery Complete
                    </div>
                    <h1 class="text-4xl font-bold mb-4">{{ summary?.project_name || 'Your Project Summary' }}</h1>
                    <p class="text-slate-400">Here's what we discussed about your project</p>
                </div>

                <!-- Summary Card -->
                <div class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 mb-8">
                    <!-- Overview -->
                    <div class="mb-8">
                        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span class="text-2xl">📋</span> Overview
                        </h2>
                        <p class="text-slate-300 leading-relaxed">{{ summary?.overview || 'No overview available.' }}</p>
                    </div>

                    <!-- Key Features -->
                    <div v-if="summary?.key_features?.length" class="mb-8">
                        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span class="text-2xl">✨</span> Key Features
                        </h2>
                        <ul class="space-y-3">
                            <li 
                                v-for="(feature, index) in summary.key_features" 
                                :key="index"
                                class="flex items-start gap-3 text-slate-300"
                            >
                                <span class="text-blue-400 mt-1">✓</span>
                                <span>{{ feature }}</span>
                            </li>
                        </ul>
                    </div>

                    <!-- Target Users -->
                    <div v-if="summary?.target_users" class="mb-8">
                        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span class="text-2xl">👥</span> Who This Is For
                        </h2>
                        <p class="text-slate-300 leading-relaxed">{{ summary.target_users }}</p>
                    </div>

                    <!-- Success Metrics -->
                    <div v-if="summary?.success_metrics?.length" class="mb-8">
                        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span class="text-2xl">📊</span> Success Looks Like
                        </h2>
                        <ul class="space-y-2">
                            <li 
                                v-for="(metric, index) in summary.success_metrics" 
                                :key="index"
                                class="text-slate-300"
                            >
                                • {{ metric }}
                            </li>
                        </ul>
                    </div>

                    <!-- Next Steps -->
                    <div v-if="summary?.next_steps" class="pt-6 border-t border-slate-700">
                        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span class="text-2xl">🚀</span> What's Next
                        </h2>
                        <p class="text-slate-300 leading-relaxed">{{ summary.next_steps }}</p>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                        href="/contact"
                        class="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold text-center hover:opacity-90 transition"
                    >
                        Let's Build This Together
                    </Link>
                    <Link 
                        href="/"
                        class="px-8 py-4 bg-slate-700 rounded-lg font-semibold text-center hover:bg-slate-600 transition"
                    >
                        Back to Home
                    </Link>
                </div>

                <!-- Footer Note -->
                <p class="text-center text-slate-500 text-sm mt-8">
                    A copy of this summary has been sent to your email. Our team will review the full details and reach out soon.
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';

const props = defineProps({
    sessionId: String,
    summary: Object,
});
</script>
