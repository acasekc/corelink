<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <!-- Navigation -->
        <nav class="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700 z-50">
            <div class="max-w-6xl mx-auto px-6 py-2 flex justify-between items-center">
                <Link href="/" class="flex items-center">
                    <img src="/images/logo_100_h.png" alt="CoreLink" class="h-[100px]" />
                </Link>
                
                <!-- Desktop Navigation -->
                <div class="hidden md:flex gap-8">
                    <Link href="/" class="hover:text-blue-400 transition">Home</Link>
                    <Link href="/projects" class="hover:text-blue-400 transition">Projects</Link>
                    <Link href="/about" class="hover:text-blue-400 transition">About</Link>
                    <Link href="/contact" class="hover:text-blue-400 transition">Contact</Link>
                </div>

                <!-- Mobile Menu Button -->
                <button 
                    @click="mobileMenuOpen = !mobileMenuOpen"
                    class="md:hidden p-2 rounded-lg hover:bg-slate-700 transition"
                    aria-label="Toggle menu"
                >
                    <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Mobile Navigation Menu -->
            <div 
                v-show="mobileMenuOpen" 
                class="md:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-700"
            >
                <div class="px-6 py-4 flex flex-col gap-4">
                    <Link 
                        href="/" 
                        class="py-2 hover:text-blue-400 transition"
                        @click="mobileMenuOpen = false"
                    >Home</Link>
                    <Link 
                        href="/projects" 
                        class="py-2 hover:text-blue-400 transition"
                        @click="mobileMenuOpen = false"
                    >Projects</Link>
                    <Link 
                        href="/about" 
                        class="py-2 hover:text-blue-400 transition"
                        @click="mobileMenuOpen = false"
                    >About</Link>
                    <Link 
                        href="/contact" 
                        class="py-2 hover:text-blue-400 transition"
                        @click="mobileMenuOpen = false"
                    >Contact</Link>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <main>
            <slot />
        </main>

        <!-- Footer -->
        <footer class="border-t border-slate-700 py-8 px-6 text-center text-slate-400">
            <p>&copy; 2025 CoreLink Development LLC. All rights reserved.</p>
        </footer>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { Link } from '@inertiajs/vue3';

const mobileMenuOpen = ref(false);
</script>
