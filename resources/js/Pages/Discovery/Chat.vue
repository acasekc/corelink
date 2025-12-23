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

        <!-- Main Content -->
        <div class="pt-24 pb-12 px-4 max-w-4xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold mb-2">Project Discovery</h1>
                <p class="text-slate-400">Let's explore your project idea together</p>
            </div>

            <!-- Invite Code Entry (if no session) -->
            <div v-if="!sessionId" class="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 max-w-md mx-auto">
                <h2 class="text-xl font-semibold mb-4">Enter Your Invite Code</h2>
                <p class="text-slate-400 mb-6 text-sm">You'll need an invite code to start your project discovery session.</p>
                
                <form @submit.prevent="validateInviteCode">
                    <input
                        v-model="inviteCode"
                        type="text"
                        placeholder="Enter invite code"
                        class="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        :disabled="isValidating"
                    />
                    
                    <input
                        v-model="userEmail"
                        type="email"
                        placeholder="Your email (optional)"
                        class="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        :disabled="isValidating"
                    />
                    
                    <p v-if="inviteError" class="text-red-400 text-sm mb-4">{{ inviteError }}</p>
                    
                    <button
                        type="submit"
                        :disabled="isValidating || !inviteCode"
                        class="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {{ isValidating ? 'Validating...' : 'Start Discovery' }}
                    </button>
                </form>
            </div>

            <!-- Chat Interface (if session active) -->
            <div v-else class="flex flex-col h-[calc(100vh-12rem)]">
                <!-- Status Bar -->
                <div class="flex items-center justify-between mb-4 px-4 py-2 bg-slate-800/50 rounded-lg">
                    <div class="flex items-center gap-2">
                        <div :class="['w-2 h-2 rounded-full', sessionStatus === 'active' ? 'bg-green-400' : 'bg-yellow-400']"></div>
                        <span class="text-sm text-slate-400">
                            Turn {{ turnNumber }} of {{ maxTurns }}
                        </span>
                    </div>
                    <div v-if="turnStatus === 'soft_nudge'" class="text-sm text-yellow-400">
                        Wrapping up soon...
                    </div>
                    <div v-else-if="turnStatus === 'force_summary'" class="text-sm text-orange-400">
                        Final questions...
                    </div>
                </div>

                <!-- Messages Container -->
                <div 
                    ref="messagesContainer"
                    class="flex-1 overflow-y-auto space-y-4 mb-4 px-2"
                >
                    <div
                        v-for="(message, index) in messages"
                        :key="index"
                        :class="[
                            'max-w-[85%] p-4 rounded-2xl',
                            message.role === 'assistant' 
                                ? 'bg-slate-700/50 mr-auto rounded-bl-sm' 
                                : 'bg-blue-600/50 ml-auto rounded-br-sm'
                        ]"
                    >
                        <p class="whitespace-pre-wrap">{{ message.content }}</p>
                    </div>

                    <!-- Typing Indicator -->
                    <div v-if="isTyping" class="max-w-[85%] p-4 bg-slate-700/50 rounded-2xl rounded-bl-sm mr-auto">
                        <div class="flex gap-1">
                            <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                            <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                            <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                        </div>
                    </div>
                </div>

                <!-- Plan Generation Status -->
                <div v-if="planGenerating" class="mb-4 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg text-center">
                    <div class="flex items-center justify-center gap-2">
                        <svg class="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span class="text-blue-400">Creating your project summary...</span>
                    </div>
                </div>

                <!-- Input Area -->
                <div v-if="sessionStatus === 'active'" class="flex gap-2">
                    <textarea
                        v-model="userMessage"
                        @keydown.enter.exact.prevent="sendMessage"
                        placeholder="Type your message..."
                        rows="2"
                        class="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        :disabled="isTyping || planGenerating"
                    ></textarea>
                    <div class="flex flex-col gap-2">
                        <button
                            @click="sendMessage"
                            :disabled="!userMessage.trim() || isTyping || planGenerating"
                            class="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Send
                        </button>
                        <button
                            v-if="turnNumber >= 3 && botOfferedSummary"
                            @click="requestPlan"
                            :disabled="planGenerating"
                            class="px-4 py-2 bg-green-600 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                        >
                            Generate Plan
                        </button>
                    </div>
                </div>

                <!-- Session Completed -->
                <div v-else-if="sessionStatus === 'completed'" class="text-center p-6 bg-green-500/20 border border-green-500/50 rounded-lg">
                    <h3 class="text-xl font-semibold text-green-400 mb-2">Discovery Complete! 🎉</h3>
                    <p class="text-slate-300 mb-4">Your project summary has been created and sent to your email.</p>
                    <Link 
                        :href="`/discovery/${sessionId}/summary`"
                        class="inline-block px-6 py-3 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                        View Summary
                    </Link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { Link } from '@inertiajs/vue3';

const props = defineProps({
    initialSessionId: String,
    initialToken: String,
});

// Echo channel reference for cleanup
let echoChannel = null;

// State
const inviteCode = ref('');
const userEmail = ref('');
const inviteError = ref('');
const isValidating = ref(false);

const sessionId = ref(props.initialSessionId || null);
const sessionToken = ref(props.initialToken || null);
const sessionStatus = ref('active');

const messages = ref([]);
const userMessage = ref('');
const isTyping = ref(false);
const planGenerating = ref(false);
const botOfferedSummary = ref(false);

const turnNumber = ref(0);
const turnStatus = ref('discovery');
const maxTurns = 12;

const messagesContainer = ref(null);

// Plan data for display
const planSummary = ref(null);

// API Base URL
const apiBase = '/api/bot';

// Subscribe to Echo channel for real-time updates
const subscribeToChannel = (sid) => {
    if (!window.Echo) {
        console.warn('Echo not available');
        return;
    }

    // Leave previous channel if exists
    if (echoChannel) {
        window.Echo.leave(`discovery.${sessionId.value}`);
    }

    echoChannel = window.Echo.channel(`discovery.${sid}`)
        .listen('.message.received', (data) => {
            console.log('Real-time message received:', data);
            // Only add if not already present (avoid duplicates from HTTP response)
            const lastMessage = messages.value[messages.value.length - 1];
            if (!lastMessage || lastMessage.content !== data.message) {
                messages.value.push({
                    role: data.role,
                    content: data.message,
                });
                if (data.turn_number) {
                    turnNumber.value = data.turn_number;
                }
                if (data.turn_status) {
                    turnStatus.value = data.turn_status;
                }
            }
        })
        .listen('.plan.ready', (data) => {
            console.log('Plan ready event:', data);
            planGenerating.value = false;
            if (data.status === 'completed') {
                sessionStatus.value = 'completed';
                planSummary.value = data.summary;
            }
        });

    console.log('Subscribed to channel: discovery.' + sid);
};

// Scroll to bottom of messages
const scrollToBottom = () => {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    });
};

// Watch messages for auto-scroll
watch(messages, scrollToBottom, { deep: true });

// Validate invite code and create session
const validateInviteCode = async () => {
    if (!inviteCode.value) return;
    
    isValidating.value = true;
    inviteError.value = '';

    try {
        // First validate the code
        const validateResponse = await fetch(`${apiBase}/auth/invite-validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ code: inviteCode.value }),
        });

        const validateData = await validateResponse.json();

        if (!validateResponse.ok) {
            inviteError.value = validateData.message || 'Invalid invite code';
            return;
        }

        // Create session
        const sessionResponse = await fetch(`${apiBase}/sessions/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                invite_code: inviteCode.value,
                email: userEmail.value || null,
            }),
        });

        const sessionData = await sessionResponse.json();

        if (!sessionResponse.ok) {
            inviteError.value = sessionData.message || 'Failed to create session';
            return;
        }

        sessionId.value = sessionData.session_id;
        sessionToken.value = sessionData.session_token;

        // Subscribe to Echo channel for real-time updates
        subscribeToChannel(sessionData.session_id);

        // Start the conversation
        await startConversation();

    } catch (error) {
        console.error('Error:', error);
        inviteError.value = 'An error occurred. Please try again.';
    } finally {
        isValidating.value = false;
    }
};

// Start conversation with greeting
const startConversation = async () => {
    try {
        const response = await fetch(`${apiBase}/sessions/${sessionId.value}/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        const data = await response.json();

        if (response.ok) {
            messages.value.push({
                role: 'assistant',
                content: data.message,
            });
            turnNumber.value = data.turn_number;
        }
    } catch (error) {
        console.error('Error starting conversation:', error);
    }
};

// Send user message
const sendMessage = async () => {
    const message = userMessage.value.trim();
    if (!message || isTyping.value || planGenerating.value) return;

    // Add user message to UI
    messages.value.push({
        role: 'user',
        content: message,
    });
    userMessage.value = '';
    isTyping.value = true;

    try {
        const response = await fetch(`${apiBase}/sessions/${sessionId.value}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        const data = await response.json();

        if (response.ok) {
            // Add assistant response
            messages.value.push({
                role: 'assistant',
                content: data.message,
            });

            turnNumber.value = data.turn_number;
            turnStatus.value = data.turn_status;
            botOfferedSummary.value = data.bot_offered_summary || false;

            // Check if plan generation was triggered
            if (data.plan_generation_started) {
                planGenerating.value = true;
                pollForPlanCompletion();
            }
        } else {
            messages.value.push({
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
            });
        }
    } catch (error) {
        console.error('Error sending message:', error);
        messages.value.push({
            role: 'assistant',
            content: 'Sorry, something went wrong. Please try again.',
        });
    } finally {
        isTyping.value = false;
    }
};

// Request plan generation
const requestPlan = async () => {
    planGenerating.value = true;

    try {
        const response = await fetch(`${apiBase}/sessions/${sessionId.value}/generate-plan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        const data = await response.json();

        if (response.ok) {
            messages.value.push({
                role: 'assistant',
                content: 'I\'m now creating your project summary. This may take a moment...',
            });
            pollForPlanCompletion();
        } else {
            planGenerating.value = false;
            messages.value.push({
                role: 'assistant',
                content: data.error || 'Failed to start plan generation.',
            });
        }
    } catch (error) {
        console.error('Error requesting plan:', error);
        planGenerating.value = false;
    }
};

// Poll for plan completion
const pollForPlanCompletion = async () => {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    const poll = async () => {
        try {
            const response = await fetch(`${apiBase}/sessions/${sessionId.value}/plan`);
            const data = await response.json();

            if (data.status === 'completed') {
                planGenerating.value = false;
                sessionStatus.value = 'completed';
                messages.value.push({
                    role: 'assistant',
                    content: '✨ Your project summary is ready! You should receive an email shortly with all the details.',
                });
            } else if (data.status === 'failed') {
                planGenerating.value = false;
                messages.value.push({
                    role: 'assistant',
                    content: 'Sorry, there was an issue creating your summary. Our team has been notified.',
                });
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(poll, 5000); // Poll every 5 seconds
            } else {
                planGenerating.value = false;
                messages.value.push({
                    role: 'assistant',
                    content: 'Summary generation is taking longer than expected. You\'ll receive an email when it\'s ready.',
                });
            }
        } catch (error) {
            console.error('Error polling for plan:', error);
            if (attempts < maxAttempts) {
                attempts++;
                setTimeout(poll, 5000);
            }
        }
    };

    poll();
};

// Load existing session if provided
onMounted(() => {
    if (sessionId.value) {
        loadSessionHistory();
        // Subscribe to channel for existing session
        subscribeToChannel(sessionId.value);
    }
});

// Cleanup Echo subscription on unmount
onUnmounted(() => {
    if (echoChannel && sessionId.value) {
        window.Echo?.leave(`discovery.${sessionId.value}`);
        echoChannel = null;
    }
});

// Load existing session history
const loadSessionHistory = async () => {
    try {
        const response = await fetch(`${apiBase}/sessions/${sessionId.value}/history`);
        const data = await response.json();

        if (response.ok && data.turns) {
            data.turns.forEach(turn => {
                if (turn.user_message) {
                    messages.value.push({ role: 'user', content: turn.user_message });
                }
                if (turn.assistant_message) {
                    messages.value.push({ role: 'assistant', content: turn.assistant_message });
                }
            });
            turnNumber.value = data.turns.length;
        }
    } catch (error) {
        console.error('Error loading history:', error);
    }
};
</script>
