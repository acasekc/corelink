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

        <!-- Hero Section -->
        <section class="pt-32 pb-20 px-6">
            <div class="max-w-6xl mx-auto text-center">
                <div class="inline-block mb-6 px-4 py-2 bg-blue-500/20 border border-blue-400/50 rounded-full text-sm">
                    🚀 AI-Powered Web Development
                </div>
                
                <h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                    Building the Future of Web Applications
                </h1>
                
                <p class="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                    CoreLink Development specializes in crafting intelligent, scalable web and mobile applications using cutting-edge AI technology with expert developer oversight.
                </p>

                <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                    <Link href="/projects" class="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition">
                        Explore Our Work
                    </Link>
                    <Link href="/contact" class="px-8 py-4 border border-slate-400 rounded-lg font-semibold hover:bg-slate-800 transition">
                        Get In Touch
                    </Link>
                </div>

                <!-- Feature Pills -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
                    <div class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                        <div class="text-3xl mb-2">⚡</div>
                        <h3 class="font-semibold mb-2">AI-Enhanced Development</h3>
                        <p class="text-sm text-slate-400">Leveraging AI to accelerate development while maintaining expert code quality</p>
                    </div>
                    <div class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                        <div class="text-3xl mb-2">🎯</div>
                        <h3 class="font-semibold mb-2">Proven Track Record</h3>
                        <p class="text-sm text-slate-400">Building and scaling SaaS platforms serving hundreds of users</p>
                    </div>
                    <div class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                        <div class="text-3xl mb-2">🔧</div>
                        <h3 class="font-semibold mb-2">Modern Tech Stack</h3>
                        <p class="text-sm text-slate-400">Laravel, Vue 3, Inertia.js, and more for responsive applications</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="border-t border-slate-700 py-8 px-6 text-center text-slate-400">
            <p>&copy; 2025 CoreLink Development LLC. All rights reserved.</p>
        </footer>
    </div>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
</script>
