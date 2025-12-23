<template>
    <AdminLayout currentPage="plans">
        <h2 class="text-2xl font-bold mb-6">Discovery Plans</h2>

        <!-- Plans Table -->
        <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table class="w-full">
                <thead class="bg-gray-700/50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Session</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email Sent</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Generated</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-700">
                    <tr v-if="plans.data.length === 0">
                        <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                            No plans generated yet.
                        </td>
                    </tr>
                    <tr v-for="plan in plans.data" :key="plan.id" class="hover:bg-gray-700/30">
                        <td class="px-6 py-4">
                            <a 
                                :href="`/admin/discovery/sessions/${plan.session_id}`"
                                class="text-purple-400 hover:text-purple-300"
                            >
                                Session #{{ plan.session_id }}
                            </a>
                        </td>
                        <td class="px-6 py-4 text-gray-300">
                            {{ plan.session?.metadata?.user_email || 'Anonymous' }}
                        </td>
                        <td class="px-6 py-4">
                            <span 
                                :class="statusClass(plan.status)"
                                class="px-2 py-1 rounded text-xs font-medium"
                            >
                                {{ plan.status }}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <span v-if="plan.email_sent_at" class="text-green-400 text-sm">
                                {{ formatDate(plan.email_sent_at) }}
                            </span>
                            <span v-else class="text-gray-500 text-sm">
                                Not sent
                            </span>
                        </td>
                        <td class="px-6 py-4 text-gray-400 text-sm">
                            {{ formatDate(plan.created_at) }}
                        </td>
                        <td class="px-6 py-4 text-right">
                            <a 
                                :href="`/admin/discovery/plans/${plan.id}`"
                                class="text-blue-400 hover:text-blue-300 text-sm"
                            >
                                View Plan
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div v-if="plans.last_page > 1" class="mt-4 flex justify-center space-x-2">
            <a 
                v-for="page in plans.last_page" 
                :key="page"
                :href="`/admin/discovery/plans?page=${page}`"
                :class="page === plans.current_page ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'"
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
    plans: Object,
});

const statusClass = (status) => {
    const classes = {
        'generating': 'bg-yellow-500/20 text-yellow-400',
        'completed': 'bg-green-500/20 text-green-400',
        'failed': 'bg-red-500/20 text-red-400',
    };
    return classes[status] || 'bg-gray-500/20 text-gray-400';
};

const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
</script>
