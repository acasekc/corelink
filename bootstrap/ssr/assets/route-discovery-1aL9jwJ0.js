import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import { S as SeoHead } from "./route-blog-jpwBX5H6.js";
const Chat = ({ meta }) => {
  const { url } = usePage();
  const urlParams = new URLSearchParams((url || "").split("?")[1] || "");
  const [inviteCode, setInviteCode] = useState(urlParams.get("code") || "");
  const [userEmail, setUserEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [sessionId, setSessionId] = useState(urlParams.get("session") || null);
  const [sessionToken, setSessionToken] = useState(urlParams.get("token") || null);
  const [sessionStatus, setSessionStatus] = useState("active");
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [planGenerating, setPlanGenerating] = useState(false);
  const [botOfferedSummary, setBotOfferedSummary] = useState(false);
  const [turnNumber, setTurnNumber] = useState(0);
  const [turnStatus, setTurnStatus] = useState("discovery");
  const maxTurns = 12;
  const messagesContainerRef = useRef(null);
  const messageInputRef = useRef(null);
  const echoChannelRef = useRef(null);
  const apiBase = "/api/bot";
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
    if (!isTyping && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [messages, isTyping]);
  const subscribeToChannel = (sid) => {
    if (!window.Echo) {
      console.warn("Echo not available");
      return;
    }
    if (echoChannelRef.current) {
      window.Echo.leave(`discovery.${sessionId}`);
    }
    echoChannelRef.current = window.Echo.channel(`discovery.${sid}`).listen(".message.received", (data) => {
      console.log("Real-time message received:", data);
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (!lastMessage || lastMessage.content !== data.message) {
          return [...prev, { role: data.role, content: data.message }];
        }
        return prev;
      });
      if (data.turn_number) setTurnNumber(data.turn_number);
      if (data.turn_status) setTurnStatus(data.turn_status);
    }).listen(".plan.ready", (data) => {
      console.log("Plan ready event:", data);
      setPlanGenerating(false);
      if (data.status === "completed") {
        setSessionStatus("completed");
      }
    });
    console.log("Subscribed to channel: discovery." + sid);
  };
  useEffect(() => {
    if (sessionId) {
      loadSessionHistory();
      subscribeToChannel(sessionId);
    }
    return () => {
      if (echoChannelRef.current && sessionId) {
        window.Echo?.leave(`discovery.${sessionId}`);
        echoChannelRef.current = null;
      }
    };
  }, [sessionId]);
  useEffect(() => {
    const codeFromUrl = urlParams.get("code");
    if (codeFromUrl && !sessionId) {
      fetch(`${apiBase}/auth/invite-validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ code: codeFromUrl })
      }).then((res) => res.json()).then((data) => {
        if (data.valid && data.email) {
          setUserEmail(data.email);
        }
      }).catch((err) => console.error("Error validating code:", err));
    }
  }, []);
  const loadSessionHistory = async () => {
    try {
      const response = await fetch(`${apiBase}/sessions/${sessionId}/history`);
      const data = await response.json();
      if (response.ok && data.turns) {
        const loadedMessages = [];
        data.turns.forEach((turn) => {
          if (turn.user_message) {
            loadedMessages.push({ role: "user", content: turn.user_message });
          }
          if (turn.assistant_message) {
            loadedMessages.push({ role: "assistant", content: turn.assistant_message });
          }
        });
        setMessages(loadedMessages);
        setTurnNumber(data.turns.length);
      }
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };
  const validateInviteCode = async (e) => {
    e.preventDefault();
    if (!inviteCode) return;
    setIsValidating(true);
    setInviteError("");
    try {
      const validateResponse = await fetch(`${apiBase}/auth/invite-validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ code: inviteCode })
      });
      const validateData = await validateResponse.json();
      if (!validateResponse.ok) {
        setInviteError(validateData.message || "Invalid invite code");
        return;
      }
      if (validateData.email && !userEmail) {
        setUserEmail(validateData.email);
      }
      const sessionResponse = await fetch(`${apiBase}/sessions/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          invite_code: inviteCode,
          email: userEmail || null
        })
      });
      const sessionData = await sessionResponse.json();
      if (!sessionResponse.ok) {
        setInviteError(sessionData.message || "Failed to create session");
        return;
      }
      setSessionId(sessionData.session_id);
      setSessionToken(sessionData.session_token);
      subscribeToChannel(sessionData.session_id);
      await startConversation(sessionData.session_id);
    } catch (error) {
      console.error("Error:", error);
      setInviteError("An error occurred. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };
  const startConversation = async (sid) => {
    try {
      const response = await fetch(`${apiBase}/sessions/${sid || sessionId}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });
      const data = await response.json();
      if (response.ok) {
        setMessages([{ role: "assistant", content: data.message }]);
        setTurnNumber(data.turn_number);
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };
  const sendMessage = async () => {
    const message = userMessage.trim();
    if (!message || isTyping || planGenerating) return;
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setUserMessage("");
    setIsTyping(true);
    try {
      const response = await fetch(`${apiBase}/sessions/${sessionId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
        setTurnNumber(data.turn_number);
        setTurnStatus(data.turn_status);
        setBotOfferedSummary(data.bot_offered_summary || false);
        if (data.plan_generation_started) {
          setPlanGenerating(true);
          pollForPlanCompletion();
        }
      } else {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again."
        }]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again."
      }]);
    } finally {
      setIsTyping(false);
    }
  };
  const requestPlan = async () => {
    setPlanGenerating(true);
    try {
      const response = await fetch(`${apiBase}/sessions/${sessionId}/generate-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });
      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: "I'm now creating your project summary. This may take a moment..."
        }]);
        pollForPlanCompletion();
      } else {
        setPlanGenerating(false);
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: data.error || "Failed to start plan generation."
        }]);
      }
    } catch (error) {
      console.error("Error requesting plan:", error);
      setPlanGenerating(false);
    }
  };
  const pollForPlanCompletion = async () => {
    const maxAttempts = 60;
    let attempts = 0;
    const poll = async () => {
      try {
        const response = await fetch(`${apiBase}/sessions/${sessionId}/plan`);
        const data = await response.json();
        if (data.status === "completed") {
          setPlanGenerating(false);
          setSessionStatus("completed");
          setMessages((prev) => [...prev, {
            role: "assistant",
            content: "✨ Your project summary is ready! You should receive an email shortly with all the details."
          }]);
        } else if (data.status === "failed") {
          setPlanGenerating(false);
          setMessages((prev) => [...prev, {
            role: "assistant",
            content: "Sorry, there was an issue creating your summary. Our team has been notified."
          }]);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 5e3);
        } else {
          setPlanGenerating(false);
          setMessages((prev) => [...prev, {
            role: "assistant",
            content: "Summary generation is taking longer than expected. You'll receive an email when it's ready."
          }]);
        }
      } catch (error) {
        console.error("Error polling for plan:", error);
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 5e3);
        }
      }
    };
    poll();
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden", children: [
    /* @__PURE__ */ jsx(SeoHead, { meta }),
    /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 pointer-events-none", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" }),
      /* @__PURE__ */ jsx("div", { className: "absolute bottom-1/3 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-[128px]" })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "relative pt-32 pb-12", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 max-w-4xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-2", children: "Project Discovery" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Let's explore your project idea together" })
      ] }),
      !sessionId && /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 max-w-md mx-auto", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-4", children: "Enter Your Invite Code" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-300 mb-6 text-sm", children: "You'll need an invite code to start your project discovery session." }),
        /* @__PURE__ */ jsxs("form", { onSubmit: validateInviteCode, children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsxs("label", { htmlFor: "inviteCode", className: "block text-sm font-semibold mb-2", children: [
              "Invite Code ",
              /* @__PURE__ */ jsx("span", { className: "text-red-400", children: "*" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "inviteCode",
                type: "text",
                value: inviteCode,
                onChange: (e) => setInviteCode(e.target.value),
                placeholder: "Enter invite code",
                className: "w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none",
                disabled: isValidating,
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsxs("label", { htmlFor: "userEmail", className: "block text-sm font-semibold mb-2", children: [
              "Your Email ",
              /* @__PURE__ */ jsx("span", { className: "text-slate-400 text-xs", children: "(optional)" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "userEmail",
                type: "email",
                value: userEmail,
                onChange: (e) => setUserEmail(e.target.value),
                placeholder: "your@email.com",
                className: "w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none",
                disabled: isValidating
              }
            )
          ] }),
          inviteError && /* @__PURE__ */ jsx("p", { className: "text-red-400 text-sm mb-4", children: inviteError }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: isValidating || !inviteCode,
              className: "w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed",
              children: isValidating ? "Validating..." : "Start Discovery"
            }
          )
        ] })
      ] }),
      sessionId && /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-[calc(100vh-12rem)]", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4 px-4 py-2 bg-slate-800/50 rounded-lg", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: `w-2 h-2 rounded-full ${sessionStatus === "active" ? "bg-green-400" : "bg-yellow-400"}` }),
            /* @__PURE__ */ jsxs("span", { className: "text-sm text-slate-300", children: [
              "Turn ",
              turnNumber,
              " of ",
              maxTurns
            ] })
          ] }),
          turnStatus === "soft_nudge" && /* @__PURE__ */ jsx("div", { className: "text-sm text-yellow-300", children: "Wrapping up soon..." }),
          turnStatus === "force_summary" && /* @__PURE__ */ jsx("div", { className: "text-sm text-orange-300", children: "Final questions..." })
        ] }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            ref: messagesContainerRef,
            className: "flex-1 overflow-y-auto space-y-4 mb-4 px-2",
            children: [
              messages.map((message, index) => /* @__PURE__ */ jsx(
                "div",
                {
                  className: `max-w-[85%] p-4 rounded-2xl ${message.role === "assistant" ? "bg-slate-700/50 mr-auto rounded-bl-sm" : "bg-blue-600/50 ml-auto rounded-br-sm"}`,
                  children: /* @__PURE__ */ jsx("p", { className: "whitespace-pre-wrap", children: message.content })
                },
                index
              )),
              isTyping && /* @__PURE__ */ jsx("div", { className: "max-w-[85%] p-4 bg-slate-700/50 rounded-2xl rounded-bl-sm mr-auto", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
                /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-slate-400 rounded-full animate-bounce", style: { animationDelay: "0ms" } }),
                /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-slate-400 rounded-full animate-bounce", style: { animationDelay: "150ms" } }),
                /* @__PURE__ */ jsx("span", { className: "w-2 h-2 bg-slate-400 rounded-full animate-bounce", style: { animationDelay: "300ms" } })
              ] }) })
            ]
          }
        ),
        planGenerating && /* @__PURE__ */ jsx("div", { className: "mb-4 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg text-center", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxs("svg", { className: "animate-spin h-5 w-5 text-blue-400", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [
            /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
            /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-blue-300", children: "Creating your project summary..." })
        ] }) }),
        sessionStatus === "active" && /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            "textarea",
            {
              ref: messageInputRef,
              value: userMessage,
              onChange: (e) => setUserMessage(e.target.value),
              onKeyDown: handleKeyPress,
              placeholder: "Type your message...",
              rows: 2,
              className: "flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none",
              disabled: isTyping || planGenerating
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: sendMessage,
                disabled: !userMessage.trim() || isTyping || planGenerating,
                className: "px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed",
                children: "Send"
              }
            ),
            turnNumber >= 3 && botOfferedSummary && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: requestPlan,
                disabled: planGenerating,
                className: "px-4 py-2 bg-green-600 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50",
                children: "Generate Plan"
              }
            )
          ] })
        ] }),
        sessionStatus === "completed" && /* @__PURE__ */ jsxs("div", { className: "text-center p-6 bg-green-500/20 border border-green-500/50 rounded-lg", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-green-300 mb-2", children: "🎉 Discovery Complete!" }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-200 mb-4", children: "Your project summary has been created and sent to your email." }),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: `/discovery/${sessionId}/summary`,
              className: "inline-block px-6 py-3 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition",
              children: "View Summary"
            }
          )
        ] })
      ] })
    ] }) })
  ] });
};
const __vite_glob_0_42 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Chat
}, Symbol.toStringTag, { value: "Module" }));
const Summary = ({ meta, sessionId, summary }) => {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx(SeoHead, { meta }),
    /* @__PURE__ */ jsx("div", { className: "pt-12 pb-20 px-6", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-block mb-4 px-4 py-2 bg-green-500/20 border border-green-400/50 rounded-full text-sm text-green-400", children: "Discovery Complete" }),
        /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold mb-4", children: summary?.project_name || "Your Project Summary" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-400", children: "Here's what we discussed about your project" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 mb-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-xl font-semibold mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "📋" }),
            " Overview"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-300 leading-relaxed", children: summary?.overview || "No overview available." })
        ] }),
        summary?.key_features?.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-xl font-semibold mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "✨" }),
            " Key Features"
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: summary.key_features.map((feature, index) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3 text-slate-300", children: [
            /* @__PURE__ */ jsx("span", { className: "text-blue-400 mt-1", children: "✓" }),
            /* @__PURE__ */ jsx("span", { children: feature })
          ] }, index)) })
        ] }),
        summary?.target_users && /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-xl font-semibold mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "👥" }),
            " Who This Is For"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-300 leading-relaxed", children: summary.target_users })
        ] }),
        summary?.success_metrics?.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-xl font-semibold mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "📊" }),
            " Success Looks Like"
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: summary.success_metrics.map((metric, index) => /* @__PURE__ */ jsxs("li", { className: "text-slate-300", children: [
            "• ",
            metric
          ] }, index)) })
        ] }),
        summary?.next_steps && /* @__PURE__ */ jsxs("div", { className: "pt-6 border-t border-slate-700", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-xl font-semibold mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🚀" }),
            " What's Next"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-300 leading-relaxed", children: summary.next_steps })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            href: "/contact",
            className: "px-8 py-4 bg-linear-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold text-center hover:opacity-90 transition",
            children: "Let's Build This Together"
          }
        ),
        /* @__PURE__ */ jsx(
          Link,
          {
            href: "/",
            className: "px-8 py-4 bg-slate-700 rounded-lg font-semibold text-center hover:bg-slate-600 transition",
            children: "Back to Home"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-center text-slate-500 text-sm mt-8", children: "A copy of this summary has been sent to your email. Our team will review the full details and reach out soon." })
    ] }) })
  ] });
};
const __vite_glob_0_43 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Summary
}, Symbol.toStringTag, { value: "Module" }));
export {
  __vite_glob_0_43 as _,
  __vite_glob_0_42 as a
};
