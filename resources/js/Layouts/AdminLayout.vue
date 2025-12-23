<template>
    <div class="min-h-screen bg-gray-900 text-white">
        <!-- Header -->
        <header class="bg-gray-800 border-b border-gray-700">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center space-x-8">
                        <h1 class="text-xl font-bold text-purple-400">Discovery Admin</h1>
                        <nav class="flex space-x-4">
                            <a 
                                href="/admin/discovery" 
                                :class="currentPage === 'dashboard' ? 'bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'"
                                class="px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Dashboard
                            </a>
                            <a 
                                href="/admin/discovery/invites" 
                                :class="currentPage === 'invites' ? 'bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'"
                                class="px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Invites
                            </a>
                            <a 
                                href="/admin/discovery/sessions" 
                                :class="currentPage === 'sessions' ? 'bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'"
                                class="px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Sessions
                            </a>
                            <a 
                                href="/admin/discovery/plans" 
                                :class="currentPage === 'plans' ? 'bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'"
                                class="px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Plans
                            </a>
                        </nav>
                    </div>
                    <div class="flex items-center space-x-4">
                        <a href="/" class="text-gray-400 hover:text-white text-sm">← Back to Site</a>
                        <button 
                            @click="logout"
                            class="text-gray-400 hover:text-white text-sm flex items-center"
                        >
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <slot />
        </main>
    </div>
</template>

<script setup>
import { router } from '@inertiajs/vue3';

defineProps({
    currentPage: {
        type: String,
        default: 'dashboard',
    },
});

const logout = () => {
    router.post('/admin/logout');
};
</script>
