<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <!-- Navigation -->
        <nav class="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-700 z-50">
            <div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center font-bold">
                        CL
                    </div>
                    <span class="text-xl font-bold">CoreLink</span>
                </div>
                <div class="hidden md:flex gap-8">
                    <Link href="/" class="hover:text-blue-400 transition">Home</Link>
                    <Link href="/projects" class="hover:text-blue-400 transition">Projects</Link>
                    <Link href="/about" class="hover:text-blue-400 transition">About</Link>
                    <Link href="/contact" class="hover:text-blue-400 transition">Contact</Link>
                </div>
            </div>
        </nav>

        <!-- Page Content -->
        <section class="pt-32 pb-20 px-6">
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

                        <div v-if="successMessage" class="p-4 bg-green-500/20 border border-green-400/50 rounded-lg text-green-300">
                            ✓ {{ successMessage }}
                        </div>
                    </form>
                </div>

                <!-- Contact Info -->
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                        <div class="text-2xl mb-3">📧</div>
                        <h3 class="font-semibold text-lg mb-2">Email</h3>
                        <p class="text-slate-300">
                            <a href="mailto:info@corelink.dev" class="hover:text-blue-400 transition">
                                info@corelink.dev
                            </a>
                        </p>
                    </div>

                    <div class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
                        <div class="text-2xl mb-3">🌐</div>
                        <h3 class="font-semibold text-lg mb-2">Website</h3>
                        <p class="text-slate-300">
                            <a href="https://corelink.dev" class="hover:text-blue-400 transition">
                                corelink.dev
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="border-t border-slate-700 py-8 px-6 text-center text-slate-400 mt-20">
            <p>&copy; 2025 CoreLink Development LLC. All rights reserved.</p>
        </footer>
    </div>
</template>

<script setup>
import { Link, useForm, usePage } from '@inertiajs/vue3';
import { ref, computed } from 'vue';

const form = useForm({
    name: '',
    email: '',
    subject: '',
    message: '',
});

const page = usePage();
const successMessage = computed(() => page.props.flash?.success);

const submitForm = () => {
    form.post('/contact', {
        preserveScroll: true,
        onSuccess: () => {
            form.reset();
        },
    });
};
</script>
