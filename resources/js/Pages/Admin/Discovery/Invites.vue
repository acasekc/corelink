<template>
    <AdminLayout currentPage="invites">
        <!-- Header with Create Button -->
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold">Invite Codes</h2>
            <a 
                href="/admin/discovery/invites/create"
                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center"
            >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Create Invite
            </a>
        </div>

        <!-- Success Message -->
        <div v-if="$page.props.flash?.success" class="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
            {{ $page.props.flash.success }}
        </div>

        <!-- Invites Table -->
        <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table class="w-full">
                <thead class="bg-gray-700/50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Code</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Uses</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Sessions</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Expires</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-700">
                    <tr v-if="invites.data.length === 0">
                        <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                            No invite codes yet. Create one to get started.
                        </td>
                    </tr>
                    <tr v-for="invite in invites.data" :key="invite.id" class="hover:bg-gray-700/30">
                        <td class="px-6 py-4">
                            <div class="flex items-center space-x-2">
                                <span class="font-mono text-purple-400 font-medium">{{ invite.code }}</span>
                                <button 
                                    @click="copyCode(invite.code)"
                                    class="text-gray-500 hover:text-white"
                                    title="Copy code"
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <span 
                                :class="invite.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'"
                                class="px-2 py-1 rounded text-xs font-medium"
                            >
                                {{ invite.is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-gray-300">
                            {{ invite.current_uses }} / {{ invite.max_uses || '∞' }}
                        </td>
                        <td class="px-6 py-4 text-gray-300">
                            {{ invite.sessions_count }}
                        </td>
                        <td class="px-6 py-4 text-gray-400 text-sm">
                            {{ invite.expires_at ? formatDate(invite.expires_at) : 'Never' }}
                        </td>
                        <td class="px-6 py-4 text-gray-400 text-sm">
                            {{ formatDate(invite.created_at) }}
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div class="flex justify-end space-x-2">
                                <button 
                                    @click="showResendModal(invite)"
                                    class="text-blue-400 hover:text-blue-300 text-sm"
                                >
                                    Send
                                </button>
                                <button 
                                    @click="toggleInvite(invite)"
                                    :class="invite.is_active ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'"
                                    class="text-sm"
                                >
                                    {{ invite.is_active ? 'Disable' : 'Enable' }}
                                </button>
                                <button 
                                    @click="deleteInvite(invite)"
                                    class="text-red-400 hover:text-red-300 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div v-if="invites.last_page > 1" class="mt-4 flex justify-center space-x-2">
            <a 
                v-for="page in invites.last_page" 
                :key="page"
                :href="`/admin/discovery/invites?page=${page}`"
                :class="page === invites.current_page ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'"
                class="px-3 py-1 rounded text-sm"
            >
                {{ page }}
            </a>
        </div>

        <!-- Resend Modal -->
        <div v-if="resendModalOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
                <h3 class="text-lg font-semibold mb-4">Send Invite</h3>
                <p class="text-gray-400 text-sm mb-4">
                    Send invite code <span class="text-purple-400 font-mono">{{ selectedInvite?.code }}</span> to:
                </p>
                <input 
                    v-model="resendEmail"
                    type="email"
                    placeholder="email@example.com"
                    class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 mb-4"
                />
                <div class="flex justify-end space-x-3">
                    <button 
                        @click="resendModalOpen = false"
                        class="px-4 py-2 text-gray-400 hover:text-white"
                    >
                        Cancel
                    </button>
                    <button 
                        @click="resendInvite"
                        :disabled="!resendEmail"
                        class="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                        Send Email
                    </button>
                </div>
            </div>
        </div>
    </AdminLayout>
</template>

<script setup>
import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';

const props = defineProps({
    invites: Object,
});

const resendModalOpen = ref(false);
const selectedInvite = ref(null);
const resendEmail = ref('');

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const copyCode = (code) => {
    navigator.clipboard.writeText(code);
};

const toggleInvite = (invite) => {
    router.post(`/admin/discovery/invites/${invite.id}/toggle`);
};

const deleteInvite = (invite) => {
    if (confirm('Are you sure you want to delete this invite?')) {
        router.delete(`/admin/discovery/invites/${invite.id}`);
    }
};

const showResendModal = (invite) => {
    selectedInvite.value = invite;
    resendEmail.value = '';
    resendModalOpen.value = true;
};

const resendInvite = () => {
    router.post(`/admin/discovery/invites/${selectedInvite.value.id}/resend`, {
        email: resendEmail.value,
    }, {
        onSuccess: () => {
            resendModalOpen.value = false;
        }
    });
};
</script>
