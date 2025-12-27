<template>
    <PublicLayout>
        <!-- Page Content -->
        <section class="pt-36 pb-20 px-6">
            <div class="max-w-6xl mx-auto">
                <div class="mb-12">
                    <h1 class="text-5xl font-bold mb-4">Our Projects</h1>
                    <p class="text-xl text-slate-300">Innovative solutions powering businesses and individuals</p>
                </div>

                <!-- AuctionLink -->
                <div class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 mb-8">
                    <div class="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <div class="inline-block mb-4 px-4 py-2 bg-purple-500/20 border border-purple-400/50 rounded-full text-sm">
                                SaaS Platform
                            </div>
                            <h2 class="text-4xl font-bold mb-4">AuctionLink</h2>
                            <p class="text-slate-300 mb-6 leading-relaxed">
                                A powerful multi-tenant online auction platform enabling auctioneers and consignors to manage auctions, lots, and bidding in real-time. Features include advanced bidding mechanics, real-time WebSocket updates, payment processing, and comprehensive auction automation.
                            </p>
                            <ul class="space-y-3 text-slate-300 mb-6">
                                <li class="flex items-center gap-2">
                                    <span class="text-blue-400">✓</span> Multi-tenant architecture for multiple auction houses
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-blue-400">✓</span> Real-time bidding with WebSocket broadcasts
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-blue-400">✓</span> Advanced lot management with custom fields
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-blue-400">✓</span> Stripe & manual payment processing
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-blue-400">✓</span> Automated auction lifecycle management
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-blue-400">✓</span> Email and in-app notifications
                                </li>
                            </ul>
                            <a href="#" class="inline-block px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold transition">
                                Coming Soon
                            </a>
                        </div>
                        <div class="bg-slate-900/50 rounded-xl p-6 border border-slate-600">
                            <div class="text-sm text-slate-400 mb-4 font-mono">Tech Stack:</div>
                            <div class="space-y-2 text-slate-300">
                                <div>• Laravel 12</div>
                                <div>• Vue 3 + Inertia.js</div>
                                <div>• Laravel Reverb (WebSockets)</div>
                                <div>• PostgreSQL</div>
                                <div>• Stripe Integration</div>
                                <div>• Laravel Broadcasting</div>
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
