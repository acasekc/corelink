<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <!-- Skip to main content link -->
        <a href="#main-content" class="skip-to-main">Skip to main content</a>

        <!-- Navigation -->
        <nav class="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700 z-50" aria-label="Main navigation">
            <div class="max-w-6xl mx-auto px-6 py-2 flex justify-between items-center">
                <Link href="/" class="flex items-center focus-visible:ring-2 focus-visible:ring-blue-400 rounded">
                    <img src="/images/logo_100_h.png" alt="CoreLink Development - Home" class="h-[100px]" />
                </Link>
                
                <!-- Desktop Navigation -->
                <div class="hidden md:flex gap-8">
                    <Link href="/" class="hover:text-blue-400 transition focus-visible:ring-2 focus-visible:ring-blue-400 px-2 py-1 rounded">Home</Link>
                    <Link href="/projects" class="hover:text-blue-400 transition focus-visible:ring-2 focus-visible:ring-blue-400 px-2 py-1 rounded">Projects</Link>
                    <Link href="/case-studies/dusties-delights" class="hover:text-blue-400 transition focus-visible:ring-2 focus-visible:ring-blue-400 px-2 py-1 rounded">Case Studies</Link>
                    <Link href="/about" class="hover:text-blue-400 transition focus-visible:ring-2 focus-visible:ring-blue-400 px-2 py-1 rounded">About</Link>
                    <Link href="/contact" class="hover:text-blue-400 transition focus-visible:ring-2 focus-visible:ring-blue-400 px-2 py-1 rounded">Contact</Link>
                </div>

                <!-- Mobile Menu Button -->
                <button 
                    @click="mobileMenuOpen = !mobileMenuOpen"
                    class="md:hidden p-2 rounded-lg hover:bg-slate-700 transition focus-visible:ring-2 focus-visible:ring-blue-400"
                    :aria-expanded="mobileMenuOpen"
                    aria-label="Toggle navigation menu"
                >
                    <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Mobile Navigation Menu -->
            <div 
                v-show="mobileMenuOpen" 
                class="md:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-700"
                role="navigation"
                aria-label="Mobile navigation"
            >
                <div class="px-6 py-4 flex flex-col gap-4">
                    <Link 
                        href="/" 
                        class="py-2 hover:text-blue-400 transition focus-visible:ring-2 focus-visible:ring-blue-400 px-2 rounded"
                        @click="mobileMenuOpen = false"
                    >Home</Link>
                    <Link 
                        href="/projects" 
                        class="py-2 hover:text-blue-400 transition focus-visible:ring-2 focus-visible:ring-blue-400 px-2 rounded"
                        @click="mobileMenuOpen = false"
                    >Projects</Link>
                    <Link 
                        href="/case-studies/dusties-delights" 
                        class="py-2 hover:text-blue-400 transition focus-visible:ring-2 focus-visible:ring-blue-400 px-2 rounded"
                        @click="mobileMenuOpen = false"
                    >Case Studies</Link>
                    <Link 
                        href="/about" 
                        class="py-2 hover:text-blue-400 transition focus-visible:ring-2 focus-visible:ring-blue-400 px-2 rounded"
                        @click="mobileMenuOpen = false"
                    >About</Link>
                    <Link 
                        href="/contact" 
                        class="py-2 hover:text-blue-400 transition focus-visible:ring-2 focus-visible:ring-blue-400 px-2 rounded"
                        @click="mobileMenuOpen = false"
                    >Contact</Link>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <main id="main-content" class="pt-24">
            <slot />
        </main>

        <!-- Footer -->
        <footer class="border-t border-slate-700 py-8 px-6 text-center text-slate-200">
            <p>&copy; 2025 CoreLink Development LLC. All rights reserved.</p>
        </footer>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Link } from '@inertiajs/vue3';

const mobileMenuOpen = ref(false);

// Handle escape key to close mobile menu
const handleEscapeKey = (event) => {
    if (event.key === 'Escape' && mobileMenuOpen.value) {
        mobileMenuOpen.value = false;
    }
};

onMounted(() => {
    document.addEventListener('keydown', handleEscapeKey);
});

onUnmounted(() => {
    document.removeEventListener('keydown', handleEscapeKey);
});
</script>
