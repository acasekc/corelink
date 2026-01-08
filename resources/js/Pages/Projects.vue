<template>
    <PublicLayout>
        <!-- Page Content -->
        <section class="pt-36 pb-20 px-6">
            <div class="max-w-6xl mx-auto">
                <div class="mb-12">
                    <h1 class="text-5xl font-bold mb-4">Our Projects</h1>
                    <p class="text-xl text-slate-300">Innovative solutions powering businesses and individuals</p>
                </div>

                <!-- ChampLink -->
                <div class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 mb-8">
                    <div class="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <div class="inline-block mb-4 px-4 py-2 bg-orange-500/20 border border-orange-400/50 rounded-full text-sm">
                                Tournament Platform
                            </div>
                            <h2 class="text-4xl font-bold mb-4">ChampLink</h2>
                            <p class="text-slate-300 mb-6 leading-relaxed">
                                A powerful tournament bracket management platform for competition organizers. Create and manage single elimination, double elimination, round robin, and group knockout tournaments with real-time updates and participant engagement.
                            </p>
                            <ul class="space-y-3 text-slate-300 mb-6">
                                <li class="flex items-center gap-2">
                                    <span class="text-orange-400">✓</span> Multiple tournament formats (single/double elimination, round robin)
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-orange-400">✓</span> Interactive visual bracket editor
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-orange-400">✓</span> Real-time score updates via WebSockets
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-orange-400">✓</span> Email invitations and participant management
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-orange-400">✓</span> Team and individual competition support
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-orange-400">✓</span> Public spectator mode for followers
                                </li>
                            </ul>
                            <a href="https://champlink.app" class="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition">
                                Visit ChampLink
                            </a>
                        </div>
                        <div class="bg-slate-900/50 rounded-xl p-6 border border-slate-600">
                            <div class="text-sm text-slate-400 mb-4 font-mono">Tech Stack:</div>
                            <div class="space-y-2 text-slate-300">
                                <div>• Laravel 12</div>
                                <div>• React 19 + TypeScript</div>
                                <div>• Laravel Reverb (WebSockets)</div>
                                <div>• MariaDB</div>
                                <div>• Tailwind CSS v4</div>
                                <div>• AWS EC2 + GitHub Actions</div>
                                <div>• Full Testing Coverage</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PantryLink -->
                <div class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8">
                    <div class="grid md:grid-cols-2 gap-8 items-center">
                        <div class="order-2 md:order-1 bg-slate-900/50 rounded-xl p-6 border border-slate-600">
                            <div class="text-sm text-slate-400 mb-4 font-mono">Tech Stack:</div>
                            <div class="space-y-2 text-slate-300">
                                <div>• Laravel 12</div>
                                <div>• Vue 3 + Inertia.js</div>
                                <div>• React Native (Mobile)</div>
                                <div>• Laravel Octane</div>
                                <div>• Progressive Web App (PWA)</div>
                                <div>• Barcode API Integration</div>
                                <div>• Walmart API Integration</div>
                                <div>• Full Testing Coverage</div>
                            </div>
                        </div>
                        <div class="order-1 md:order-2">
                            <div class="inline-block mb-4 px-4 py-2 bg-green-500/20 border border-green-400/50 rounded-full text-sm">
                                Web & Mobile App
                            </div>
                            <h2 class="text-4xl font-bold mb-4">PantryLink</h2>
                            <p class="text-slate-300 mb-6 leading-relaxed">
                                A comprehensive inventory and shopping list management application for household and personal organization. Users can manage multiple inventory locations, create smart shopping lists, integrate with Walmart for direct ordering, and earn achievements through gamification. AI-powered meal generator suggests recipes based on available inventory.
                            </p>
                            <ul class="space-y-3 text-slate-300 mb-6">
                                <li class="flex items-center gap-2">
                                    <span class="text-green-400">✓</span> Hierarchical inventory management by location
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-green-400">✓</span> Smart shopping list generation
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-green-400">✓</span> AI meal generator with recipe suggestions
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-green-400">✓</span> Recipe management and bookmarking
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-green-400">✓</span> Crew system for family collaboration
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-green-400">✓</span> Barcode scanning with image recognition
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-green-400">✓</span> Walmart integration for seamless ordering
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-green-400">✓</span> Gamification with badges and leaderboards
                                </li>
                            </ul>
                            <a href="https://mypantrylink.com" class="inline-block px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition">
                                Visit PantryLink
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </PublicLayout>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
import PublicLayout from '@/Layouts/PublicLayout.vue';
</script>
