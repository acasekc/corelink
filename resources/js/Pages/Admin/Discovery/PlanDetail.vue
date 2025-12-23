<template>
    <AdminLayout currentPage="plans">
        <!-- Breadcrumb -->
        <div class="mb-6">
            <a href="/admin/discovery/plans" class="text-gray-400 hover:text-white text-sm">← Back to Plans</a>
        </div>

        <!-- Plan Header -->
        <div class="flex justify-between items-start mb-8">
            <div>
                <h2 class="text-2xl font-bold">{{ projectName }}</h2>
                <p class="text-gray-400 mt-1">
                    From 
                    <a :href="`/admin/discovery/sessions/${plan.session_id}`" class="text-purple-400 hover:text-purple-300">
                        Session #{{ plan.session_id.slice(0, 8) }}...
                    </a>
                </p>
            </div>
            <div class="flex items-center gap-3">
                <span v-if="complexity" class="px-3 py-1 rounded text-sm font-medium bg-blue-500/20 text-blue-400">
                    {{ complexity }}
                </span>
                <span 
                    :class="statusClass(plan.status)"
                    class="px-3 py-1 rounded text-sm font-medium"
                >
                    {{ plan.status }}
                </span>
            </div>
        </div>

        <!-- Plan Info -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p class="text-gray-400 text-sm">User Email</p>
                <p class="text-gray-300 mt-1">{{ plan.session?.metadata?.user_email || 'Anonymous' }}</p>
            </div>
            <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p class="text-gray-400 text-sm">Target Users</p>
                <p class="text-gray-300 mt-1">{{ requirements?.users?.primary_users || '—' }}</p>
            </div>
            <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p class="text-gray-400 text-sm">Generated</p>
                <p class="text-gray-300 mt-1">{{ formatDate(plan.created_at) }}</p>
            </div>
            <div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p class="text-gray-400 text-sm">Email Sent</p>
                <p class="text-gray-300 mt-1">{{ plan.email_sent_at ? formatDate(plan.email_sent_at) : 'Not sent' }}</p>
            </div>
        </div>

        <!-- Tab Navigation -->
        <div class="flex gap-2 mb-6 border-b border-gray-700 pb-4">
            <button 
                v-for="tab in tabs" 
                :key="tab.id"
                @click="activeTab = tab.id"
                :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition',
                    activeTab === tab.id 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                ]"
            >
                {{ tab.label }}
            </button>
        </div>

        <!-- User Summary Tab -->
        <div v-if="activeTab === 'summary'" class="space-y-6">
            <!-- Project Overview -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700">
                    <h3 class="font-semibold text-green-400 flex items-center gap-2">
                        <span>📋</span> Project Overview
                    </h3>
                </div>
                <div class="p-6">
                    <p class="text-gray-300 leading-relaxed">{{ userSummary?.project_overview || 'No overview available.' }}</p>
                </div>
            </div>

            <!-- High Level Features -->
            <div v-if="userSummary?.high_level_features?.length" class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700">
                    <h3 class="font-semibold text-green-400 flex items-center gap-2">
                        <span>✨</span> Key Features
                    </h3>
                </div>
                <div class="p-6">
                    <ul class="space-y-3">
                        <li v-for="(feature, idx) in userSummary.high_level_features" :key="idx" class="flex items-start gap-3">
                            <span class="text-green-400 mt-0.5">✓</span>
                            <span class="text-gray-300">{{ feature }}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Goals & Success -->
            <div v-if="userSummary?.goals_and_success?.length" class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700">
                    <h3 class="font-semibold text-green-400 flex items-center gap-2">
                        <span>🎯</span> Goals & Success Metrics
                    </h3>
                </div>
                <div class="p-6">
                    <ul class="space-y-3">
                        <li v-for="(goal, idx) in userSummary.goals_and_success" :key="idx" class="text-gray-300">
                            {{ goal }}
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Next Steps -->
            <div v-if="userSummary?.next_steps_message" class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700">
                    <h3 class="font-semibold text-green-400 flex items-center gap-2">
                        <span>🚀</span> Next Steps Message
                    </h3>
                </div>
                <div class="p-6">
                    <p class="text-gray-300 leading-relaxed">{{ userSummary.next_steps_message }}</p>
                </div>
            </div>
        </div>

        <!-- Requirements Tab -->
        <div v-if="activeTab === 'requirements'" class="space-y-6">
            <!-- Project Info -->
            <div v-if="requirements?.project" class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700">
                    <h3 class="font-semibold text-blue-400 flex items-center gap-2">
                        <span>📁</span> Project Details
                    </h3>
                </div>
                <div class="p-6 space-y-4">
                    <div>
                        <p class="text-gray-500 text-sm mb-1">Project Name</p>
                        <p class="text-gray-300">{{ requirements.project.name || '—' }}</p>
                    </div>
                    <div>
                        <p class="text-gray-500 text-sm mb-1">Vision</p>
                        <p class="text-gray-300">{{ requirements.project.vision || '—' }}</p>
                    </div>
                    <div>
                        <p class="text-gray-500 text-sm mb-1">Problem Statement</p>
                        <p class="text-gray-300">{{ requirements.project.problem_statement || '—' }}</p>
                    </div>
                </div>
            </div>

            <!-- Users -->
            <div v-if="requirements?.users" class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700">
                    <h3 class="font-semibold text-blue-400 flex items-center gap-2">
                        <span>👥</span> Target Users
                    </h3>
                </div>
                <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p class="text-gray-500 text-sm mb-1">Primary Users</p>
                        <p class="text-gray-300">{{ requirements.users.primary_users || '—' }}</p>
                    </div>
                    <div>
                        <p class="text-gray-500 text-sm mb-1">User Locations</p>
                        <p class="text-gray-300">{{ requirements.users.user_locations || '—' }}</p>
                    </div>
                    <div>
                        <p class="text-gray-500 text-sm mb-1">User Count Estimate</p>
                        <p class="text-gray-300">{{ requirements.users.user_count_estimate || '—' }}</p>
                    </div>
                </div>
            </div>

            <!-- Core Features -->
            <div v-if="requirements?.features?.core_features?.length" class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700">
                    <h3 class="font-semibold text-blue-400 flex items-center gap-2">
                        <span>⚙️</span> Core Features
                    </h3>
                </div>
                <div class="p-6">
                    <div class="flex flex-wrap gap-2">
                        <span 
                            v-for="(feature, idx) in requirements.features.core_features" 
                            :key="idx"
                            class="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                        >
                            {{ feature }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Nice to Have -->
            <div v-if="requirements?.features?.nice_to_have?.length" class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700">
                    <h3 class="font-semibold text-blue-400 flex items-center gap-2">
                        <span>💡</span> Nice to Have
                    </h3>
                </div>
                <div class="p-6">
                    <div class="flex flex-wrap gap-2">
                        <span 
                            v-for="(feature, idx) in requirements.features.nice_to_have" 
                            :key="idx"
                            class="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                        >
                            {{ feature }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Technical Requirements -->
            <div v-if="requirements?.technical" class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700">
                    <h3 class="font-semibold text-blue-400 flex items-center gap-2">
                        <span>🔧</span> Technical Requirements
                    </h3>
                </div>
                <div class="p-6 space-y-4">
                    <div v-if="requirements.technical.performance_critical?.length">
                        <p class="text-gray-500 text-sm mb-2">Performance Critical</p>
                        <div class="flex flex-wrap gap-2">
                            <span 
                                v-for="(item, idx) in requirements.technical.performance_critical" 
                                :key="idx"
                                class="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm"
                            >
                                {{ item }}
                            </span>
                        </div>
                    </div>
                    <div v-if="requirements.technical.security_requirements?.length && requirements.technical.security_requirements[0] !== 'Not provided'">
                        <p class="text-gray-500 text-sm mb-2">Security Requirements</p>
                        <div class="flex flex-wrap gap-2">
                            <span 
                                v-for="(item, idx) in requirements.technical.security_requirements" 
                                :key="idx"
                                class="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm"
                            >
                                {{ item }}
                            </span>
                        </div>
                    </div>
                    <div v-if="requirements.technical.scale_expectations && requirements.technical.scale_expectations !== 'Not provided'">
                        <p class="text-gray-500 text-sm mb-1">Scale Expectations</p>
                        <p class="text-gray-300">{{ requirements.technical.scale_expectations }}</p>
                    </div>
                </div>
            </div>

            <!-- Constraints -->
            <div v-if="requirements?.constraints" class="bg-gray-800 rounded-lg border border-gray-700">
                <div class="px-6 py-4 border-b border-gray-700">
                    <h3 class="font-semibold text-blue-400 flex items-center gap-2">
                        <span>⚠️</span> Constraints
                    </h3>
                </div>
                <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p class="text-gray-500 text-sm mb-1">Budget</p>
                        <p class="text-gray-300">{{ requirements.constraints.budget || '—' }}</p>
                    </div>
                    <div>
                        <p class="text-gray-500 text-sm mb-1">Team Size</p>
                        <p class="text-gray-300">{{ requirements.constraints.team_size || '—' }}</p>
                    </div>
                    <div v-if="requirements.timeline">
                        <p class="text-gray-500 text-sm mb-1">Desired Launch</p>
                        <p class="text-gray-300">{{ requirements.timeline.desired_launch || '—' }}</p>
                    </div>
                </div>
            </div>

            <!-- Gaps -->
            <div v-if="requirements?.gaps?.length" class="bg-gray-800 rounded-lg border border-orange-700">
                <div class="px-6 py-4 border-b border-orange-700 bg-orange-900/20">
                    <h3 class="font-semibold text-orange-400 flex items-center gap-2">
                        <span>❓</span> Information Gaps
                    </h3>
                </div>
                <div class="p-6">
                    <ul class="space-y-2">
                        <li v-for="(gap, idx) in requirements.gaps" :key="idx" class="flex items-start gap-2 text-orange-300">
                            <span class="mt-1">•</span>
                            <span>{{ gap }}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Raw JSON Toggle -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <button 
                    @click="showRawRequirements = !showRawRequirements"
                    class="w-full px-6 py-4 flex justify-between items-center text-gray-400 hover:text-white"
                >
                    <span class="font-semibold">View Raw JSON</span>
                    <span>{{ showRawRequirements ? '▲' : '▼' }}</span>
                </button>
                <div v-if="showRawRequirements" class="px-6 pb-6">
                    <pre class="text-gray-300 text-sm bg-gray-900 rounded-lg p-4 overflow-x-auto">{{ JSON.stringify(requirements, null, 2) }}</pre>
                </div>
            </div>
        </div>

        <!-- Technical Plan Tab -->
        <div v-if="activeTab === 'technical'" class="space-y-6">
            <!-- Executive Summary -->
            <div v-if="technicalPlan?.executive_summary" class="bg-gray-800 rounded-lg border border-purple-700">
                <div class="px-6 py-4 border-b border-purple-700 bg-purple-900/20">
                    <h3 class="font-semibold text-purple-400 flex items-center gap-2">
                        <span>📊</span> Executive Summary
                    </h3>
                </div>
                <div class="p-6">
                    <p class="text-gray-300 leading-relaxed">{{ technicalPlan.executive_summary }}</p>
                </div>
            </div>

            <!-- Tech Stack -->
            <div v-if="technicalPlan?.tech_stack_details" class="bg-gray-800 rounded-lg border border-purple-700">
                <div class="px-6 py-4 border-b border-purple-700 bg-purple-900/20">
                    <h3 class="font-semibold text-purple-400 flex items-center gap-2">
                        <span>🛠️</span> Recommended Tech Stack
                    </h3>
                </div>
                <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Backend -->
                    <div v-if="technicalPlan.tech_stack_details.backend" class="bg-gray-900 rounded-lg p-4">
                        <h4 class="text-purple-300 font-medium mb-3">Backend</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-gray-500">Language</span>
                                <span class="text-gray-300">{{ technicalPlan.tech_stack_details.backend.language }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-500">Framework</span>
                                <span class="text-gray-300">{{ technicalPlan.tech_stack_details.backend.framework }}</span>
                            </div>
                        </div>
                        <p v-if="technicalPlan.tech_stack_details.backend.rationale" class="text-gray-500 text-sm mt-3 italic">
                            {{ technicalPlan.tech_stack_details.backend.rationale }}
                        </p>
                    </div>
                    <!-- Frontend -->
                    <div v-if="technicalPlan.tech_stack_details.frontend" class="bg-gray-900 rounded-lg p-4">
                        <h4 class="text-purple-300 font-medium mb-3">Frontend</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-gray-500">Framework</span>
                                <span class="text-gray-300">{{ technicalPlan.tech_stack_details.frontend.framework }}</span>
                            </div>
                        </div>
                        <p v-if="technicalPlan.tech_stack_details.frontend.rationale" class="text-gray-500 text-sm mt-3 italic">
                            {{ technicalPlan.tech_stack_details.frontend.rationale }}
                        </p>
                    </div>
                    <!-- Database -->
                    <div v-if="technicalPlan.tech_stack_details.database" class="bg-gray-900 rounded-lg p-4">
                        <h4 class="text-purple-300 font-medium mb-3">Database</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-gray-500">Primary</span>
                                <span class="text-gray-300">{{ technicalPlan.tech_stack_details.database.primary }}</span>
                            </div>
                            <div v-if="technicalPlan.tech_stack_details.database.cache" class="flex justify-between">
                                <span class="text-gray-500">Cache</span>
                                <span class="text-gray-300">{{ technicalPlan.tech_stack_details.database.cache }}</span>
                            </div>
                        </div>
                        <p v-if="technicalPlan.tech_stack_details.database.rationale" class="text-gray-500 text-sm mt-3 italic">
                            {{ technicalPlan.tech_stack_details.database.rationale }}
                        </p>
                    </div>
                    <!-- Deployment -->
                    <div v-if="technicalPlan.tech_stack_details.deployment" class="bg-gray-900 rounded-lg p-4">
                        <h4 class="text-purple-300 font-medium mb-3">Deployment</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-gray-500">Hosting</span>
                                <span class="text-gray-300">{{ technicalPlan.tech_stack_details.deployment.hosting }}</span>
                            </div>
                            <div v-if="technicalPlan.tech_stack_details.deployment.infrastructure" class="flex justify-between">
                                <span class="text-gray-500">Infrastructure</span>
                                <span class="text-gray-300">{{ technicalPlan.tech_stack_details.deployment.infrastructure }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Architecture -->
            <div v-if="technicalPlan?.architecture_recommendations" class="bg-gray-800 rounded-lg border border-purple-700">
                <div class="px-6 py-4 border-b border-purple-700 bg-purple-900/20">
                    <h3 class="font-semibold text-purple-400 flex items-center gap-2">
                        <span>🏗️</span> Architecture
                    </h3>
                </div>
                <div class="p-6 space-y-4">
                    <div>
                        <p class="text-gray-500 text-sm mb-1">Pattern</p>
                        <p class="text-gray-300 font-medium">{{ technicalPlan.architecture_recommendations.pattern }}</p>
                    </div>
                    <div>
                        <p class="text-gray-500 text-sm mb-1">Rationale</p>
                        <p class="text-gray-300">{{ technicalPlan.architecture_recommendations.rationale }}</p>
                    </div>
                </div>
            </div>

            <!-- Key Components -->
            <div v-if="technicalPlan?.full_technical_breakdown?.key_components?.length" class="bg-gray-800 rounded-lg border border-purple-700">
                <div class="px-6 py-4 border-b border-purple-700 bg-purple-900/20">
                    <h3 class="font-semibold text-purple-400 flex items-center gap-2">
                        <span>🧩</span> Key Components
                    </h3>
                </div>
                <div class="p-6">
                    <div class="flex flex-wrap gap-2">
                        <span 
                            v-for="(component, idx) in technicalPlan.full_technical_breakdown.key_components" 
                            :key="idx"
                            class="px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg text-sm"
                        >
                            {{ component }}
                        </span>
                    </div>
                    <p v-if="technicalPlan.full_technical_breakdown.description" class="text-gray-400 mt-4 text-sm">
                        {{ technicalPlan.full_technical_breakdown.description }}
                    </p>
                </div>
            </div>

            <!-- Timeline -->
            <div v-if="technicalPlan?.timeline_week_ranges?.phases?.length" class="bg-gray-800 rounded-lg border border-purple-700">
                <div class="px-6 py-4 border-b border-purple-700 bg-purple-900/20 flex justify-between items-center">
                    <h3 class="font-semibold text-purple-400 flex items-center gap-2">
                        <span>📅</span> Project Timeline
                    </h3>
                    <span class="text-purple-300 text-sm">Total: {{ technicalPlan.timeline_week_ranges.total_weeks }}</span>
                </div>
                <div class="p-6">
                    <div class="space-y-4">
                        <div 
                            v-for="phase in technicalPlan.timeline_week_ranges.phases" 
                            :key="phase.phase"
                            class="bg-gray-900 rounded-lg p-4"
                        >
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <span class="text-purple-400 text-sm">Phase {{ phase.phase }}</span>
                                    <h4 class="text-gray-200 font-medium">{{ phase.name }}</h4>
                                </div>
                                <span class="text-gray-400 text-sm">{{ phase.duration }}</span>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <span 
                                    v-for="(deliverable, idx) in phase.deliverables" 
                                    :key="idx"
                                    class="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs"
                                >
                                    {{ deliverable }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cost Estimates -->
            <div v-if="technicalPlan?.cost_estimates" class="bg-gray-800 rounded-lg border border-purple-700">
                <div class="px-6 py-4 border-b border-purple-700 bg-purple-900/20">
                    <h3 class="font-semibold text-purple-400 flex items-center gap-2">
                        <span>💰</span> Cost Estimates
                    </h3>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div class="bg-gray-900 rounded-lg p-4 text-center">
                            <p class="text-gray-500 text-sm mb-1">Development</p>
                            <p class="text-2xl font-bold text-green-400">{{ technicalPlan.cost_estimates.development?.subtotal_range }}</p>
                            <p class="text-gray-500 text-xs mt-1">{{ technicalPlan.cost_estimates.development?.hours }} hrs @ {{ technicalPlan.cost_estimates.development?.rate_range }}/hr</p>
                        </div>
                        <div class="bg-gray-900 rounded-lg p-4 text-center">
                            <p class="text-gray-500 text-sm mb-1">Infrastructure (Monthly)</p>
                            <p class="text-2xl font-bold text-blue-400">{{ technicalPlan.cost_estimates.infrastructure_monthly }}</p>
                        </div>
                        <div class="bg-gray-900 rounded-lg p-4 text-center">
                            <p class="text-gray-500 text-sm mb-1">Total Estimate</p>
                            <p class="text-2xl font-bold text-purple-400">{{ technicalPlan.cost_estimates.total_estimate_range }}</p>
                        </div>
                    </div>
                    <!-- Third Party Services -->
                    <div v-if="technicalPlan.cost_estimates.third_party_services?.length">
                        <p class="text-gray-500 text-sm mb-2">Third Party Services</p>
                        <div class="space-y-2">
                            <div 
                                v-for="(service, idx) in technicalPlan.cost_estimates.third_party_services" 
                                :key="idx"
                                class="flex justify-between bg-gray-900 rounded px-3 py-2"
                            >
                                <span class="text-gray-400">{{ service.service }}</span>
                                <span class="text-gray-300">{{ service.cost }}</span>
                            </div>
                        </div>
                    </div>
                    <!-- Assumptions -->
                    <div v-if="technicalPlan.cost_estimates.assumptions?.length" class="mt-4">
                        <p class="text-gray-500 text-sm mb-2">Assumptions</p>
                        <ul class="text-gray-400 text-sm space-y-1">
                            <li v-for="(assumption, idx) in technicalPlan.cost_estimates.assumptions" :key="idx">
                                • {{ assumption }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Risk Assessment -->
            <div v-if="technicalPlan?.risk_assessment?.length" class="bg-gray-800 rounded-lg border border-purple-700">
                <div class="px-6 py-4 border-b border-purple-700 bg-purple-900/20">
                    <h3 class="font-semibold text-purple-400 flex items-center gap-2">
                        <span>⚡</span> Risk Assessment
                    </h3>
                </div>
                <div class="p-6">
                    <div class="space-y-4">
                        <div 
                            v-for="(risk, idx) in technicalPlan.risk_assessment" 
                            :key="idx"
                            class="bg-gray-900 rounded-lg p-4"
                        >
                            <div class="flex justify-between items-start mb-2">
                                <p class="text-gray-200 font-medium">{{ risk.risk }}</p>
                                <span 
                                    :class="[
                                        'px-2 py-1 rounded text-xs font-medium',
                                        risk.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                                        risk.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-green-500/20 text-green-400'
                                    ]"
                                >
                                    {{ risk.impact }} impact
                                </span>
                            </div>
                            <p class="text-gray-400 text-sm">
                                <span class="text-gray-500">Mitigation:</span> {{ risk.mitigation }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recommendations -->
            <div v-if="technicalPlan?.recommendations" class="bg-gray-800 rounded-lg border border-purple-700">
                <div class="px-6 py-4 border-b border-purple-700 bg-purple-900/20">
                    <h3 class="font-semibold text-purple-400 flex items-center gap-2">
                        <span>💡</span> Recommendations
                    </h3>
                </div>
                <div class="p-6 space-y-4">
                    <div v-if="technicalPlan.recommendations.team_composition">
                        <p class="text-gray-500 text-sm mb-1">Team Composition</p>
                        <p class="text-gray-300">{{ technicalPlan.recommendations.team_composition }}</p>
                    </div>
                    <div v-if="technicalPlan.recommendations.prioritization?.length">
                        <p class="text-gray-500 text-sm mb-2">Prioritization</p>
                        <ul class="space-y-1">
                            <li v-for="(item, idx) in technicalPlan.recommendations.prioritization" :key="idx" class="text-gray-300 flex items-center gap-2">
                                <span class="text-purple-400">{{ idx + 1 }}.</span> {{ item }}
                            </li>
                        </ul>
                    </div>
                    <div v-if="technicalPlan.recommendations.architectural_decisions?.length">
                        <p class="text-gray-500 text-sm mb-2">Architectural Decisions</p>
                        <ul class="space-y-1">
                            <li v-for="(decision, idx) in technicalPlan.recommendations.architectural_decisions" :key="idx" class="text-gray-300 flex items-start gap-2">
                                <span class="text-purple-400 mt-0.5">•</span> {{ decision }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Raw JSON Toggle -->
            <div class="bg-gray-800 rounded-lg border border-gray-700">
                <button 
                    @click="showRawTechnical = !showRawTechnical"
                    class="w-full px-6 py-4 flex justify-between items-center text-gray-400 hover:text-white"
                >
                    <span class="font-semibold">View Raw JSON</span>
                    <span>{{ showRawTechnical ? '▲' : '▼' }}</span>
                </button>
                <div v-if="showRawTechnical" class="px-6 pb-6">
                    <pre class="text-gray-300 text-sm bg-gray-900 rounded-lg p-4 overflow-x-auto">{{ JSON.stringify(technicalPlan, null, 2) }}</pre>
                </div>
            </div>
        </div>

        <!-- Error Message -->
        <div v-if="plan.error_message" class="bg-red-900/20 border border-red-700 rounded-lg p-4 mt-6">
            <h3 class="font-semibold text-red-400 mb-2">Error</h3>
            <pre class="text-red-300 text-sm whitespace-pre-wrap">{{ plan.error_message }}</pre>
        </div>
    </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import AdminLayout from '@/Layouts/AdminLayout.vue';

const props = defineProps({
    plan: Object,
});

const activeTab = ref('summary');
const showRawRequirements = ref(false);
const showRawTechnical = ref(false);

const tabs = [
    { id: 'summary', label: 'User Summary' },
    { id: 'requirements', label: 'Requirements' },
    { id: 'technical', label: 'Technical Plan' },
];

const userSummary = computed(() => props.plan?.user_summary);
const requirements = computed(() => props.plan?.structured_requirements);
const technicalPlan = computed(() => props.plan?.technical_plan);

const projectName = computed(() => {
    return requirements.value?.project?.name || 'Discovery Plan';
});

const complexity = computed(() => {
    return userSummary.value?.complexity || requirements.value?.complexity;
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
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
};
</script>
