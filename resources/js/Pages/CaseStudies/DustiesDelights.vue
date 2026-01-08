<template>
    <PublicLayout>
        <!-- Hero Section -->
        <section class="pt-36 pb-16 px-6 bg-gradient-to-b from-amber-900/20 to-slate-900">
            <div class="max-w-4xl mx-auto text-center">
                <div class="inline-block mb-6 px-4 py-2 bg-amber-500/20 border border-amber-400/50 rounded-full text-sm text-amber-300">
                    Client Success Story
                </div>
                <h1 class="text-5xl md:text-6xl font-bold mb-6">
                    Dustie's Delights
                </h1>
                <p class="text-2xl text-amber-200 mb-4">
                    From Home Kitchen to Thriving Online Bakery
                </p>
                <p class="text-lg text-slate-300 max-w-2xl mx-auto">
                    Dustie, a passionate young entrepreneur with a knack for baking irresistible cookies and sweet breads, dreamed of turning her homemade treats into a full-fledged business.
                </p>
            </div>
        </section>

        <!-- Challenge Section -->
        <section class="py-16 px-6">
            <div class="max-w-4xl mx-auto">
                <div class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 mb-12">
                    <div class="flex items-center gap-4 mb-6">
                        <div class="w-12 h-12 bg-red-500/20 border border-red-400/50 rounded-xl flex items-center justify-center">
                            <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 class="text-3xl font-bold">The Challenge</h2>
                    </div>
                    <p class="text-slate-300 leading-relaxed text-lg">
                        Dustie approached CoreLink Development with a clear vision: sell her signature chocolate chip cookies, artisanal banana breads, cinnamon rolls, and custom orders directly to customers. She wanted a site that handled everything—from product listings and secure payments to shipping calculations and tax management—without needing constant technical help. Flexibility was key: support for Stripe and PayPal integrations, plus cash-on-delivery options for local pickups.
                    </p>
                </div>
            </div>
        </section>

        <!-- Solution Section -->
        <section class="py-16 px-6 bg-slate-800/30">
            <div class="max-w-4xl mx-auto">
                <div class="text-center mb-12">
                    <div class="flex items-center justify-center gap-4 mb-6">
                        <div class="w-12 h-12 bg-blue-500/20 border border-blue-400/50 rounded-xl flex items-center justify-center">
                            <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h2 class="text-3xl font-bold">Our Solution</h2>
                    </div>
                    <p class="text-slate-300 text-lg max-w-2xl mx-auto">
                        At CoreLink, we built Dustie's Delights a fully custom e-commerce website tailored to her needs. Using modern, scalable technologies, we created an intuitive platform where Dustie can independently manage her entire store.
                    </p>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    <!-- Feature 1 -->
                    <div class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-amber-500/50 transition-colors">
                        <div class="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4">
                            <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">Product Management</h3>
                        <p class="text-slate-400">
                            Easy uploading of photos, descriptions, variants (e.g., dozen packs or gluten-free options), and inventory tracking.
                        </p>
                    </div>

                    <!-- Feature 2 -->
                    <div class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-amber-500/50 transition-colors">
                        <div class="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4">
                            <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">Custom Quotes</h3>
                        <p class="text-slate-400">
                            A built-in form for personalized orders, like wedding cookie favors or bulk sweet bread requests.
                        </p>
                    </div>

                    <!-- Feature 3 -->
                    <div class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-amber-500/50 transition-colors">
                        <div class="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4">
                            <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">Flexible Payments</h3>
                        <p class="text-slate-400">
                            Seamless integration with Stripe and PayPal for secure online transactions, alongside COD for convenience.
                        </p>
                    </div>

                    <!-- Feature 4 -->
                    <div class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-amber-500/50 transition-colors">
                        <div class="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4">
                            <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">Shipping & Taxes</h3>
                        <p class="text-slate-400">
                            Automated rate calculations based on location, with full control over rules and zones.
                        </p>
                    </div>

                    <!-- Feature 5 -->
                    <div class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-amber-500/50 transition-colors md:col-span-2">
                        <div class="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4">
                            <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">User-Friendly Dashboard</h3>
                        <p class="text-slate-400">
                            Dustie handles customers, orders, and site updates herself—no coding required. A beautiful, mobile-responsive site that showcases her baked goods with mouthwatering galleries and smooth checkout flows.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Results Section -->
        <section class="py-16 px-6">
            <div class="max-w-4xl mx-auto">
                <div class="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-8">
                    <div class="flex items-center gap-4 mb-6">
                        <div class="w-12 h-12 bg-green-500/20 border border-green-400/50 rounded-xl flex items-center justify-center">
                            <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                        <h2 class="text-3xl font-bold">Results & Impact</h2>
                    </div>
                    <p class="text-slate-300 leading-relaxed text-lg mb-8">
                        Since launch, Dustie's Delights has seen steady growth: quicker order processing, happier customers with seamless shopping experiences, and the freedom for Dustie to focus on baking rather than backend hassles. The site's scalability means she's ready for expansion—whether adding new products or shipping nationwide.
                    </p>
                    
                    <div class="grid sm:grid-cols-3 gap-6">
                        <div class="text-center p-4">
                            <div class="text-3xl font-bold text-amber-400 mb-2">✓</div>
                            <div class="text-slate-300">Faster Order Processing</div>
                        </div>
                        <div class="text-center p-4">
                            <div class="text-3xl font-bold text-amber-400 mb-2">✓</div>
                            <div class="text-slate-300">Seamless Customer Experience</div>
                        </div>
                        <div class="text-center p-4">
                            <div class="text-3xl font-bold text-amber-400 mb-2">✓</div>
                            <div class="text-slate-300">Scalable for Growth</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Key Takeaways -->
        <section class="py-16 px-6 bg-slate-800/30">
            <div class="max-w-4xl mx-auto text-center">
                <h2 class="text-3xl font-bold mb-6">Key Takeaways</h2>
                <p class="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                    This project highlights how CoreLink empowers startups with custom e-commerce solutions that are powerful yet simple. We deliver tools that let entrepreneurs like Dustie own their online success from day one.
                </p>
                
                <div class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 inline-block">
                    <div class="text-sm text-slate-400 mb-3 font-mono">Project Type:</div>
                    <div class="text-amber-400 font-semibold">Custom E-Commerce Platform</div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="py-20 px-6">
            <div class="max-w-4xl mx-auto text-center">
                <h2 class="text-4xl font-bold mb-6">Ready to Sweeten Your Business?</h2>
                <p class="text-slate-300 text-lg mb-8">
                    Let CoreLink build a custom solution that helps your business thrive.
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/contact" class="px-8 py-4 bg-amber-500 hover:bg-amber-600 rounded-lg font-semibold transition text-slate-900">
                        Contact Us Today
                    </Link>
                    <Link href="/projects" class="px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition">
                        View More Projects
                    </Link>
                </div>
            </div>
        </section>
    </PublicLayout>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
import PublicLayout from '@/Layouts/PublicLayout.vue';
</script>
