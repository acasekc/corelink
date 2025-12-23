<template>
    <AdminLayout currentPage="sessions">
        <!-- Breadcrumb -->
        <div class="mb-6">
            <a href="/admin/discovery/sessions" class="text-gray-400 hover:text-white text-sm">← Back to Sessions</a>
        </div>

        <!-- Session Header -->
        <div class="flex justify-between items-start mb-8">
            <div>
                <h2 class="text-2xl font-bold">Session #{{ session.id }}</h2>
                <p class="text-gray-400 mt-1">{{ session.metadata?.user_email || 'Anonymous' }}</p>
            </div>
            <span 
                :class="statusClass(session.status)"
                class="px-3 py-1 rounded text-sm font-medium"
            >
                {{ session.status }}
            </span>
        </div>

        <!-- Session Info -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p class="text-gray-400 text-sm">Invite Code</p>
                <p class="font-mono text-purple-400 mt-1">{{ session.invite_code?.code }}</p>
            </div>
            <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p class="text-gray-400 text-sm">Turn Count</p>
                <p class="text-2xl font-bold mt-1">{{ session.turn_count }}</p>
            </div>
            <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p class="text-gray-400 text-sm">Started</p>
                <p class="text-gray-300 mt-1">{{ formatDate(session.created_at) }}</p>
            </div>
            <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p class="text-gray-400 text-sm">Last Activity</p>
                <p class="text-gray-300 mt-1">{{ formatDate(session.updated_at) }}</p>
            </div>
        </div>

        <!-- Plan Link -->
        <div v-if="session.discovery_plan" class="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-8">
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="font-semibold text-green-400">Discovery Plan Generated</h3>
                    <p class="text-green-300 text-sm mt-1">Plan was generated on {{ formatDate(session.discovery_plan.created_at) }}</p>
                </div>
                <a 
                    :href="`/admin/discovery/plans/${session.discovery_plan.id}`"
                    class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-medium"
                >
                    View Plan
                </a>
            </div>
        </div>

        <!-- Conversation History -->
        <div class="bg-gray-800 rounded-lg border border-gray-700">
            <div class="px-6 py-4 border-b border-gray-700">
                <h3 class="font-semibold">Conversation History</h3>
            </div>
            <div class="p-6 space-y-4 max-h-150 overflow-y-auto">
                <div v-if="!session.messages || session.messages.length === 0" class="text-center text-gray-500 py-8">
                    No messages in this session.
                </div>
                <div 
                    v-for="message in session.messages" 
                    :key="message.id"
                    :class="message.role === 'user' ? 'ml-8' : 'mr-8'"
                >
                    <div 
                        :class="message.role === 'user' 
                            ? 'bg-purple-600/20 border-purple-500/30' 
                            : 'bg-gray-700/50 border-gray-600'"
                        class="rounded-lg p-4 border"
                    >
                        <div class="flex justify-between items-center mb-2">
                            <span 
                                :class="message.role === 'user' ? 'text-purple-400' : 'text-gray-400'"
                                class="text-sm font-medium capitalize"
                            >
                                {{ message.role }}
                            </span>
                            <span class="text-gray-500 text-xs">
                                {{ formatTime(message.created_at) }}
                            </span>
                        </div>
                        <p class="text-gray-200 whitespace-pre-wrap">{{ message.content }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Metadata -->
        <div v-if="session.metadata && Object.keys(session.metadata).length > 0" class="mt-8 bg-gray-800 rounded-lg border border-gray-700">
            <div class="px-6 py-4 border-b border-gray-700">
                <h3 class="font-semibold">Session Metadata</h3>
            </div>
            <div class="p-6">
                <pre class="text-gray-300 text-sm overflow-x-auto">{{ JSON.stringify(session.metadata, null, 2) }}</pre>
            </div>
        </div>
    </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/Layouts/AdminLayout.vue';

const props = defineProps({
    session: Object,
});

const statusClass = (status) => {
    const classes = {
        'active': 'bg-blue-500/20 text-blue-400',
        'completed': 'bg-green-500/20 text-green-400',
        'generating': 'bg-yellow-500/20 text-yellow-400',
        'failed': 'bg-red-500/20 text-red-400',
        'abandoned': 'bg-gray-500/20 text-gray-400',
    };
    return classes[status] || 'bg-gray-500/20 text-gray-400';
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};
</script>
