<template>
    <PublicLayout>
        <!-- Hero Section -->
        <section class="pt-36 pb-20 px-6" aria-label="Hero section">
            <div class="max-w-6xl mx-auto text-center">
                <div class="inline-block mb-6 px-4 py-2 bg-blue-500/20 border border-blue-400/50 rounded-full text-sm">
                    <span aria-hidden="true">🚀</span> AI-Powered Web Development
                </div>
                
                <h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                    Building the Future of Web Applications
                </h1>
                
                <p class="text-xl text-slate-200 mb-8 max-w-2xl mx-auto leading-relaxed">
                    CoreLink Development specializes in crafting intelligent, scalable web and mobile applications using cutting-edge AI technology with expert developer oversight.
                </p>

                <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                    <Link href="/projects" class="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-blue-400 inline-block">
                        Explore Our Work
                    </Link>
                    <Link href="/contact" class="px-8 py-4 border border-slate-400 rounded-lg font-semibold hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-blue-400 inline-block">
                        Get In Touch
                    </Link>
                </div>

                <!-- Feature Pills -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
                    <div class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                        <div class="text-3xl mb-2" aria-hidden="true">⚡</div>
                        <h3 class="font-semibold mb-2">AI-Enhanced Development</h3>
                        <p class="text-sm text-slate-300">Leveraging AI to accelerate development while maintaining expert code quality</p>
                    </div>
                    <div class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                        <div class="text-3xl mb-2" aria-hidden="true">🎯</div>
                        <h3 class="font-semibold mb-2">Proven Track Record</h3>
                        <p class="text-sm text-slate-300">Building and scaling SaaS platforms serving thousands of users</p>
                    </div>
                    <div class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                        <div class="text-3xl mb-2" aria-hidden="true">🔧</div>
                        <h3 class="font-semibold mb-2">Modern Tech Stack</h3>
                        <p class="text-sm text-slate-300">Laravel, Vue 3, Inertia.js, and more for responsive applications</p>
                    </div>
                </div>
            </div>
        </section>
    </PublicLayout>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
import PublicLayout from '@/Layouts/PublicLayout.vue';
</script>
