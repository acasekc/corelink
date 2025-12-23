<template>
    <AdminLayout currentPage="invites">
        <div class="max-w-xl">
            <div class="mb-6">
                <a href="/admin/discovery/invites" class="text-gray-400 hover:text-white text-sm">← Back to Invites</a>
            </div>

            <h2 class="text-2xl font-bold mb-6">Create Invite Code</h2>

            <form @submit.prevent="submit" class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <!-- Code -->
                <div class="mb-6">
                    <label for="code" class="block text-sm font-medium text-gray-300 mb-2">
                        Invite Code <span class="text-gray-500">(optional)</span>
                    </label>
                    <input
                        id="code"
                        v-model="form.code"
                        type="text"
                        class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 font-mono uppercase"
                        placeholder="Leave blank to auto-generate"
                    />
                    <p v-if="form.errors.code" class="mt-1 text-sm text-red-400">{{ form.errors.code }}</p>
                </div>

                <!-- Email -->
                <div class="mb-6">
                    <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                        Recipient Email <span class="text-gray-500">(optional)</span>
                    </label>
                    <input
                        id="email"
                        v-model="form.email"
                        type="email"
                        class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
                        placeholder="client@example.com"
                    />
                    <p v-if="form.errors.email" class="mt-1 text-sm text-red-400">{{ form.errors.email }}</p>
                </div>

                <!-- Send Email Checkbox -->
                <div class="mb-6" v-if="form.email">
                    <label class="flex items-center">
                        <input
                            v-model="form.send_email"
                            type="checkbox"
                            class="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 text-purple-600"
                        />
                        <span class="ml-2 text-sm text-gray-300">Send invite email now</span>
                    </label>
                </div>

                <!-- Max Uses -->
                <div class="mb-6">
                    <label for="max_uses" class="block text-sm font-medium text-gray-300 mb-2">
                        Max Uses <span class="text-gray-500">(optional)</span>
                    </label>
                    <input
                        id="max_uses"
                        v-model="form.max_uses"
                        type="number"
                        min="1"
                        class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
                        placeholder="Unlimited"
                    />
                    <p v-if="form.errors.max_uses" class="mt-1 text-sm text-red-400">{{ form.errors.max_uses }}</p>
                </div>

                <!-- Expires -->
                <div class="mb-6">
                    <label for="expires_days" class="block text-sm font-medium text-gray-300 mb-2">
                        Expires In <span class="text-gray-500">(optional)</span>
                    </label>
                    <select
                        id="expires_days"
                        v-model="form.expires_days"
                        class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
                    >
                        <option :value="null">Never</option>
                        <option :value="7">7 days</option>
                        <option :value="14">14 days</option>
                        <option :value="30">30 days</option>
                        <option :value="60">60 days</option>
                        <option :value="90">90 days</option>
                    </select>
                    <p v-if="form.errors.expires_days" class="mt-1 text-sm text-red-400">{{ form.errors.expires_days }}</p>
                </div>

                <!-- Submit -->
                <div class="flex justify-end space-x-3">
                    <a 
                        href="/admin/discovery/invites"
                        class="px-4 py-2 text-gray-400 hover:text-white"
                    >
                        Cancel
                    </a>
                    <button
                        type="submit"
                        :disabled="form.processing"
                        class="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                        {{ form.processing ? 'Creating...' : 'Create Invite' }}
                    </button>
                </div>
            </form>
        </div>
    </AdminLayout>
</template>

<script setup>
import { useForm } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';

const form = useForm({
    code: '',
    email: '',
    send_email: true,
    max_uses: null,
    expires_days: null,
});

const submit = () => {
    form.post('/admin/discovery/invites');
};
</script>
