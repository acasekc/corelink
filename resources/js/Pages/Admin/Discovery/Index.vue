<template>
    <AdminLayout currentPage="dashboard">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="text-3xl font-bold text-purple-400">{{ stats.total_invites }}</div>
                <div class="text-gray-400 text-sm mt-1">Total Invites</div>
            </div>
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="text-3xl font-bold text-green-400">{{ stats.active_invites }}</div>
                <div class="text-gray-400 text-sm mt-1">Active Invites</div>
            </div>
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="text-3xl font-bold text-blue-400">{{ stats.total_sessions }}</div>
                <div class="text-gray-400 text-sm mt-1">Total Sessions</div>
            </div>
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="text-3xl font-bold text-cyan-400">{{ stats.completed_sessions }}</div>
                <div class="text-gray-400 text-sm mt-1">Completed</div>
            </div>
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div class="text-3xl font-bold text-yellow-400">{{ stats.total_plans }}</div>
                <div class="text-gray-400 text-sm mt-1">Plans Generated</div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
            <h2 class="text-lg font-semibold mb-4">Quick Actions</h2>
            <div class="flex space-x-4">
                <a 
                    href="/admin/discovery/invites/create"
                    class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center"
                >
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Invite
                </a>
            </div>
        </div>

        <!-- Recent Sessions -->
        <div class="bg-gray-800 rounded-lg border border-gray-700">
            <div class="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                <h2 class="text-lg font-semibold">Recent Sessions</h2>
                <a href="/admin/discovery/sessions" class="text-purple-400 hover:text-purple-300 text-sm">View All →</a>
            </div>
            <div class="divide-y divide-gray-700">
                <div v-if="recentSessions.length === 0" class="px-6 py-8 text-center text-gray-500">
                    No sessions yet. Create an invite to get started.
                </div>
                <div 
                    v-for="session in recentSessions" 
                    :key="session.id"
                    class="px-6 py-4 hover:bg-gray-700/50 transition"
                >
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="flex items-center space-x-3">
                                <span class="font-mono text-sm text-purple-400">{{ session.invite_code?.code || 'N/A' }}</span>
                                <span 
                                    :class="statusClass(session.status)"
                                    class="px-2 py-0.5 rounded text-xs font-medium"
                                >
                                    {{ session.status }}
                                </span>
                            </div>
                            <div class="text-gray-400 text-sm mt-1">
                                {{ session.metadata?.user_email || 'No email provided' }}
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-gray-400 text-sm">{{ formatDate(session.created_at) }}</div>
                            <div class="text-gray-500 text-xs mt-1">{{ session.turn_count }} turns</div>
                        </div>
                    </div>
                    <div class="mt-2 flex space-x-2">
                        <a 
                            :href="`/admin/discovery/sessions/${session.id}`"
                            class="text-xs text-blue-400 hover:text-blue-300"
                        >
                            View Session
                        </a>
                        <span v-if="session.discovery_plan" class="text-gray-600">•</span>
                        <a 
                            v-if="session.discovery_plan"
                            :href="`/admin/discovery/plans/${session.discovery_plan.id}`"
                            class="text-xs text-green-400 hover:text-green-300"
                        >
                            View Plan
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/Layouts/AdminLayout.vue';

const props = defineProps({
    stats: Object,
    recentSessions: Array,
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
        hour: '2-digit',
        minute: '2-digit',
    });
};
</script>
