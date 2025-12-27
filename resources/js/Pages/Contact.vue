<template>
    <PublicLayout>
        <!-- Page Content -->
        <section class="pt-36 pb-20 px-6">
            <div class="max-w-2xl mx-auto">
                <div class="mb-12 text-center">
                    <h1 class="text-5xl font-bold mb-4">Get In Touch</h1>
                    <p class="text-xl text-slate-300">We'd love to hear about your project</p>
                </div>

                <!-- Contact Form -->
                <div class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 mb-8">
                    <form @submit.prevent="submitForm" class="space-y-6">
                        <div>
                            <label for="name" class="block text-sm font-semibold mb-2">Name</label>
                            <input
                                type="text"
                                id="name"
                                v-model="form.name"
                                class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-400 text-white"
                                placeholder="Your name"
                                required
                            />
                            <p v-if="form.errors.name" class="mt-1 text-sm text-red-400">{{ form.errors.name }}</p>
                        </div>

                        <div>
                            <label for="email" class="block text-sm font-semibold mb-2">Email</label>
                            <input
                                type="email"
                                id="email"
                                v-model="form.email"
                                class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-400 text-white"
                                placeholder="your@email.com"
                                required
                            />
                            <p v-if="form.errors.email" class="mt-1 text-sm text-red-400">{{ form.errors.email }}</p>
                        </div>

                        <div>
                            <label for="subject" class="block text-sm font-semibold mb-2">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                v-model="form.subject"
                                class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-400 text-white"
                                placeholder="What's this about?"
                                required
                            />
                            <p v-if="form.errors.subject" class="mt-1 text-sm text-red-400">{{ form.errors.subject }}</p>
                        </div>

                        <div>
                            <label for="message" class="block text-sm font-semibold mb-2">Message</label>
                            <textarea
                                id="message"
                                v-model="form.message"
                                rows="6"
                                class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-400 text-white"
                                placeholder="Tell us about your project..."
                                required
                            ></textarea>
                            <p v-if="form.errors.message" class="mt-1 text-sm text-red-400">{{ form.errors.message }}</p>
                        </div>

                        <button
                            type="submit"
                            :disabled="form.processing"
                            class="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition disabled:opacity-50"
                        >
                            {{ form.processing ? 'Sending...' : 'Send Message' }}
                        </button>

                        <div v-if="showSuccess" class="p-4 bg-green-500/20 border border-green-400/50 rounded-lg text-green-300">
                            ✓ {{ successText }}
                        </div>
                    </form>
                </div>

                
            </div>
        </section>
    </PublicLayout>
</template>

<script setup>
import { Link, useForm, usePage } from '@inertiajs/vue3';
import { ref, computed, onMounted } from 'vue';
import PublicLayout from '@/Layouts/PublicLayout.vue';

const form = useForm({
    name: '',
    email: '',
    subject: '',
    message: '',
});

const page = usePage();
const showSuccess = ref(false);
const successText = ref('');

// Check for flash message on mount (after redirect)
onMounted(() => {
    if (page.props.flash?.success) {
        showSuccess.value = true;
        successText.value = page.props.flash.success;
    }
});

const submitForm = () => {
    form.post('/contact', {
        preserveScroll: true,
        onSuccess: () => {
            form.reset();
            showSuccess.value = true;
            successText.value = 'Thank you for your message! We\'ll get back to you soon.';
        },
    });
};
</script>
