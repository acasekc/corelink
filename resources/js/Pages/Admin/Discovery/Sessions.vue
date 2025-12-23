<template>
    <AdminLayout currentPage="sessions">
        <h2 class="text-2xl font-bold mb-6">Discovery Sessions</h2>

        <!-- Sessions Table -->
        <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table class="w-full">
                <thead class="bg-gray-700/50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Invite Code</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Turns</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plan</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Started</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-700">
                    <tr v-if="sessions.data.length === 0">
                        <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                            No sessions yet.
                        </td>
                    </tr>
                    <tr v-for="session in sessions.data" :key="session.id" class="hover:bg-gray-700/30">
                        <td class="px-6 py-4">
                            <div class="text-gray-300">{{ session.metadata?.user_email || 'Anonymous' }}</div>
                        </td>
                        <td class="px-6 py-4">
                            <span class="font-mono text-purple-400 text-sm">{{ session.invite_code?.code }}</span>
                        </td>
                        <td class="px-6 py-4">
                            <span 
                                :class="statusClass(session.status)"
                                class="px-2 py-1 rounded text-xs font-medium"
                            >
                                {{ session.status }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-gray-300">
                            {{ session.turn_count }}
                        </td>
                        <td class="px-6 py-4">
                            <span v-if="session.discovery_plan" class="text-green-400 text-sm">
                                Generated
                            </span>
                            <span v-else class="text-gray-500 text-sm">
                                —
                            </span>
                        </td>
                        <td class="px-6 py-4 text-gray-400 text-sm">
                            {{ formatDate(session.created_at) }}
                        </td>
                        <td class="px-6 py-4 text-right">
                            <a 
                                :href="`/admin/discovery/sessions/${session.id}`"
                                class="text-blue-400 hover:text-blue-300 text-sm"
                            >
                                View Details
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div v-if="sessions.last_page > 1" class="mt-4 flex justify-center space-x-2">
            <a 
                v-for="page in sessions.last_page" 
                :key="page"
                :href="`/admin/discovery/sessions?page=${page}`"
                :class="page === sessions.current_page ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'"
                class="px-3 py-1 rounded text-sm"
            >
                {{ page }}
            </a>
        </div>
    </AdminLayout>
</template>

<script setup>
import AdminLayout from '@/Layouts/AdminLayout.vue';

const props = defineProps({
    sessions: Object,
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
