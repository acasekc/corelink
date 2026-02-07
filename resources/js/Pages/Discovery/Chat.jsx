import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import SeoHead from '@/components/SeoHead';

const Chat = ({ meta }) => {
  const { url } = usePage();
  const urlParams = new URLSearchParams((url || '').split('?')[1] || '');
  
  // State for invite code entry
  const [inviteCode, setInviteCode] = useState(urlParams.get('code') || '');
  const [userEmail, setUserEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  
  // Session state
  const [sessionId, setSessionId] = useState(urlParams.get('session') || null);
  const [sessionToken, setSessionToken] = useState(urlParams.get('token') || null);
  const [sessionStatus, setSessionStatus] = useState('active');
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [planGenerating, setPlanGenerating] = useState(false);
  const [botOfferedSummary, setBotOfferedSummary] = useState(false);
  
  // Turn state
  const [turnNumber, setTurnNumber] = useState(0);
  const [turnStatus, setTurnStatus] = useState('discovery');
  const maxTurns = 12;
  
  const messagesContainerRef = useRef(null);
  const messageInputRef = useRef(null);
  const echoChannelRef = useRef(null);
  const apiBase = '/api/bot';
  
  // Auto-scroll to bottom when messages change and focus input
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
    // Focus input when not typing
    if (!isTyping && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [messages, isTyping]);
  
  // Subscribe to Echo channel for real-time updates
  const subscribeToChannel = (sid) => {
    if (!window.Echo) {
      console.warn('Echo not available');
      return;
    }
    
    // Leave previous channel if exists
    if (echoChannelRef.current) {
      window.Echo.leave(`discovery.${sessionId}`);
    }
    
    echoChannelRef.current = window.Echo.channel(`discovery.${sid}`)
      .listen('.message.received', (data) => {
        console.log('Real-time message received:', data);
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (!lastMessage || lastMessage.content !== data.message) {
            return [...prev, { role: data.role, content: data.message }];
          }
          return prev;
        });
        if (data.turn_number) setTurnNumber(data.turn_number);
        if (data.turn_status) setTurnStatus(data.turn_status);
      })
      .listen('.plan.ready', (data) => {
        console.log('Plan ready event:', data);
        setPlanGenerating(false);
        if (data.status === 'completed') {
          setSessionStatus('completed');
        }
      });
    
    console.log('Subscribed to channel: discovery.' + sid);
  };
  
  // Load existing session if provided
  useEffect(() => {
    if (sessionId) {
      loadSessionHistory();
      subscribeToChannel(sessionId);
    }
    
    // Cleanup Echo subscription
    return () => {
      if (echoChannelRef.current && sessionId) {
        window.Echo?.leave(`discovery.${sessionId}`);
        echoChannelRef.current = null;
      }
    };
  }, [sessionId]);
  
  // Auto-fetch email when code is provided via URL
  useEffect(() => {
    const codeFromUrl = urlParams.get('code');
    if (codeFromUrl && !sessionId) {
      // Validate the code to get email
      fetch(`${apiBase}/auth/invite-validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ code: codeFromUrl }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.valid && data.email) {
            setUserEmail(data.email);
          }
        })
        .catch(err => console.error('Error validating code:', err));
    }
  }, []);
  
  // Load existing session history
  const loadSessionHistory = async () => {
    try {
      const response = await fetch(`${apiBase}/sessions/${sessionId}/history`);
      const data = await response.json();
      
      if (response.ok && data.turns) {
        const loadedMessages = [];
        data.turns.forEach(turn => {
          if (turn.user_message) {
            loadedMessages.push({ role: 'user', content: turn.user_message });
          }
          if (turn.assistant_message) {
            loadedMessages.push({ role: 'assistant', content: turn.assistant_message });
          }
        });
        setMessages(loadedMessages);
        setTurnNumber(data.turns.length);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };
  
  // Validate invite code and create session
  const validateInviteCode = async (e) => {
    e.preventDefault();
    if (!inviteCode) return;
    
    setIsValidating(true);
    setInviteError('');
    
    try {
      // First validate the code
      const validateResponse = await fetch(`${apiBase}/auth/invite-validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ code: inviteCode }),
      });
      
      const validateData = await validateResponse.json();
      
      if (!validateResponse.ok) {
        setInviteError(validateData.message || 'Invalid invite code');
        return;
      }
      
      // Auto-fill email if provided with invite
      if (validateData.email && !userEmail) {
        setUserEmail(validateData.email);
      }
      
      // Create session
      const sessionResponse = await fetch(`${apiBase}/sessions/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          invite_code: inviteCode,
          email: userEmail || null,
        }),
      });
      
      const sessionData = await sessionResponse.json();
      
      if (!sessionResponse.ok) {
        setInviteError(sessionData.message || 'Failed to create session');
        return;
      }
      
      setSessionId(sessionData.session_id);
      setSessionToken(sessionData.session_token);
      
      // Subscribe to Echo channel for real-time updates
      subscribeToChannel(sessionData.session_id);
      
      // Start the conversation
      await startConversation(sessionData.session_id);
      
    } catch (error) {
      console.error('Error:', error);
      setInviteError('An error occurred. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };
  
  // Start conversation with greeting
  const startConversation = async (sid) => {
    try {
      const response = await fetch(`${apiBase}/sessions/${sid || sessionId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessages([{ role: 'assistant', content: data.message }]);
        setTurnNumber(data.turn_number);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };
  
  // Send user message
  const sendMessage = async () => {
    const message = userMessage.trim();
    if (!message || isTyping || planGenerating) return;
    
    // Add user message to UI
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setUserMessage('');
    setIsTyping(true);
    
    try {
      const response = await fetch(`${apiBase}/sessions/${sessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
        setTurnNumber(data.turn_number);
        setTurnStatus(data.turn_status);
        setBotOfferedSummary(data.bot_offered_summary || false);
        
        if (data.plan_generation_started) {
          setPlanGenerating(true);
          pollForPlanCompletion();
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.'
      }]);
    } finally {
      setIsTyping(false);
    }
  };
  
  // Request plan generation
  const requestPlan = async () => {
    setPlanGenerating(true);
    
    try {
      const response = await fetch(`${apiBase}/sessions/${sessionId}/generate-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I'm now creating your project summary. This may take a moment..."
        }]);
        pollForPlanCompletion();
      } else {
        setPlanGenerating(false);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.error || 'Failed to start plan generation.'
        }]);
      }
    } catch (error) {
      console.error('Error requesting plan:', error);
      setPlanGenerating(false);
    }
  };
  
  // Poll for plan completion
  const pollForPlanCompletion = async () => {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;
    
    const poll = async () => {
      try {
        const response = await fetch(`${apiBase}/sessions/${sessionId}/plan`);
        const data = await response.json();
        
        if (data.status === 'completed') {
          setPlanGenerating(false);
          setSessionStatus('completed');
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '✨ Your project summary is ready! You should receive an email shortly with all the details.'
          }]);
        } else if (data.status === 'failed') {
          setPlanGenerating(false);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Sorry, there was an issue creating your summary. Our team has been notified.'
          }]);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 5000);
        } else {
          setPlanGenerating(false);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: "Summary generation is taking longer than expected. You'll receive an email when it's ready."
          }]);
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
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  return (
    <div className="relative overflow-hidden">
      <SeoHead meta={meta} />
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[128px]" />
      </div>

      <main className="relative pt-32 pb-12">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Project Discovery</h1>
            <p className="text-muted-foreground">Let's explore your project idea together</p>
          </div>
        
        {/* Invite Code Entry (if no session) */}
        {!sessionId && (
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Enter Your Invite Code</h2>
            <p className="text-slate-300 mb-6 text-sm">
              You'll need an invite code to start your project discovery session.
            </p>
            
            <form onSubmit={validateInviteCode}>
              <div className="mb-4">
                <label htmlFor="inviteCode" className="block text-sm font-semibold mb-2">
                  Invite Code <span className="text-red-400">*</span>
                </label>
                <input
                  id="inviteCode"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter invite code"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={isValidating}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="userEmail" className="block text-sm font-semibold mb-2">
                  Your Email <span className="text-slate-400 text-xs">(optional)</span>
                </label>
                <input
                  id="userEmail"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={isValidating}
                />
              </div>
              
              {inviteError && (
                <p className="text-red-400 text-sm mb-4">{inviteError}</p>
              )}
              
              <button
                type="submit"
                disabled={isValidating || !inviteCode}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating ? 'Validating...' : 'Start Discovery'}
              </button>
            </form>
          </div>
        )}
        
        {/* Chat Interface (if session active) */}
        {sessionId && (
          <div className="flex flex-col h-[calc(100vh-12rem)]">
            {/* Status Bar */}
            <div className="flex items-center justify-between mb-4 px-4 py-2 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${sessionStatus === 'active' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                <span className="text-sm text-slate-300">
                  Turn {turnNumber} of {maxTurns}
                </span>
              </div>
              {turnStatus === 'soft_nudge' && (
                <div className="text-sm text-yellow-300">Wrapping up soon...</div>
              )}
              {turnStatus === 'force_summary' && (
                <div className="text-sm text-orange-300">Final questions...</div>
              )}
            </div>
            
            {/* Messages Container */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto space-y-4 mb-4 px-2"
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`max-w-[85%] p-4 rounded-2xl ${
                    message.role === 'assistant'
                      ? 'bg-slate-700/50 mr-auto rounded-bl-sm'
                      : 'bg-blue-600/50 ml-auto rounded-br-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="max-w-[85%] p-4 bg-slate-700/50 rounded-2xl rounded-bl-sm mr-auto">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
            
            {/* Plan Generation Status */}
            {planGenerating && (
              <div className="mb-4 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-blue-300">Creating your project summary...</span>
                </div>
              </div>
            )}
            
            {/* Input Area */}
            {sessionStatus === 'active' && (
              <div className="flex gap-2">
                <textarea
                  ref={messageInputRef}
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  rows={2}
                  className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  disabled={isTyping || planGenerating}
                />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={sendMessage}
                    disabled={!userMessage.trim() || isTyping || planGenerating}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                  {turnNumber >= 3 && botOfferedSummary && (
                    <button
                      onClick={requestPlan}
                      disabled={planGenerating}
                      className="px-4 py-2 bg-green-600 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                    >
                      Generate Plan
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Session Completed */}
            {sessionStatus === 'completed' && (
              <div className="text-center p-6 bg-green-500/20 border border-green-500/50 rounded-lg">
                <h3 className="text-xl font-semibold text-green-300 mb-2">🎉 Discovery Complete!</h3>
                <p className="text-slate-200 mb-4">Your project summary has been created and sent to your email.</p>
                <Link
                  href={`/discovery/${sessionId}/summary`}
                  className="inline-block px-6 py-3 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  View Summary
                </Link>
              </div>
            )}
          </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default Chat;
