import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
const CreateInvite = () => {
  const [form, setForm] = useState({
    code: "",
    email: "",
    send_email: false,
    max_uses: "",
    expires_days: null,
    errors: {},
    processing: false
  });
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setForm((prev) => ({ ...prev, processing: true, errors: {} }));
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || document.cookie.split("; ").find((row) => row.startsWith("XSRF-TOKEN="))?.split("=")[1];
    try {
      const res = await fetch("/admin/discovery/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": decodeURIComponent(csrfToken || ""),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
          code: form.code,
          email: form.email,
          send_email: form.send_email,
          max_uses: form.max_uses,
          expires_days: form.expires_days
        })
      });
      if (!res.ok) {
        const data = await res.json();
        setForm((prev) => ({ ...prev, errors: data.errors || {}, processing: false }));
      } else {
        window.location.href = "/admin/discovery/invites";
      }
    } catch (err) {
      setForm((prev) => ({ ...prev, errors: { general: "Network error." }, processing: false }));
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-xl", children: [
    /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsx("a", { href: "/admin/discovery/invites", className: "text-gray-400 hover:text-white text-sm", children: "← Back to Invites" }) }),
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-6", children: "Create Invite Code" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { htmlFor: "code", className: "block text-sm font-medium text-gray-300 mb-2", children: [
          "Invite Code ",
          /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "(optional)" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "code",
            name: "code",
            value: form.code,
            onChange: handleChange,
            type: "text",
            className: "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 font-mono uppercase",
            placeholder: "Leave blank to auto-generate"
          }
        ),
        form.errors.code && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-400", children: form.errors.code })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-300 mb-2", children: [
          "Recipient Email ",
          /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "(optional)" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "email",
            name: "email",
            value: form.email,
            onChange: handleChange,
            type: "email",
            className: "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500",
            placeholder: "client@example.com"
          }
        ),
        form.errors.email && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-400", children: form.errors.email })
      ] }),
      form.email && /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            name: "send_email",
            type: "checkbox",
            checked: form.send_email,
            onChange: handleChange,
            className: "w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 text-purple-600"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "ml-2 text-sm text-gray-300", children: "Send invite email now" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { htmlFor: "max_uses", className: "block text-sm font-medium text-gray-300 mb-2", children: [
          "Max Uses ",
          /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "(optional)" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "max_uses",
            name: "max_uses",
            value: form.max_uses,
            onChange: handleChange,
            type: "number",
            min: "1",
            className: "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500",
            placeholder: "Unlimited"
          }
        ),
        form.errors.max_uses && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-400", children: form.errors.max_uses })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs("label", { htmlFor: "expires_days", className: "block text-sm font-medium text-gray-300 mb-2", children: [
          "Expires In ",
          /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "(optional)" })
        ] }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            id: "expires_days",
            name: "expires_days",
            value: form.expires_days || "",
            onChange: handleChange,
            className: "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Never" }),
              /* @__PURE__ */ jsx("option", { value: "7", children: "7 days" }),
              /* @__PURE__ */ jsx("option", { value: "30", children: "30 days" })
            ]
          }
        )
      ] }),
      form.errors.general && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-red-400", children: form.errors.general }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: form.processing,
          className: "w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors",
          children: form.processing ? "Creating..." : "Create Invite"
        }
      )
    ] })
  ] });
};
const __vite_glob_0_10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CreateInvite
}, Symbol.toStringTag, { value: "Module" }));
const formatDate$4 = (dateStr) => new Date(dateStr).toLocaleString();
const Invites = () => {
  const [invites, setInvites] = useState({ data: [] });
  useEffect(() => {
    fetch("/api/admin/discovery/invites", {
      headers: {
        "Accept": "application/json"
      },
      credentials: "same-origin"
    }).then((res) => res.json()).then((data) => setInvites(data));
  }, []);
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
  };
  const copyLink = (code) => {
    const link = `${window.location.origin}/discovery?code=${code}`;
    navigator.clipboard.writeText(link);
  };
  return /* @__PURE__ */ jsxs("div", { className: "pt-24 px-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: "Invite Codes" }),
      /* @__PURE__ */ jsxs("a", { href: "/admin/discovery/invites/create", className: "px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center", children: [
        /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 4v16m8-8H4" }) }),
        "Create Invite"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-gray-800 rounded-lg border border-gray-700 overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-gray-700/50", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Code" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Uses" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Sessions" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Expires" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Created" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-700", children: invites.data.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 7, className: "px-6 py-8 text-center text-gray-500", children: "No invite codes yet. Create one to get started." }) }) : invites.data.map((invite) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-700/30", children: [
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsx("span", { className: "font-mono text-purple-400 font-medium", children: invite.code }),
          /* @__PURE__ */ jsx("button", { onClick: () => copyCode(invite.code), className: "text-gray-500 hover:text-white", title: "Copy code", children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" }) }) }),
          /* @__PURE__ */ jsx("button", { onClick: () => copyLink(invite.code), className: "text-gray-500 hover:text-white", title: "Copy discovery link", children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" }) }) })
        ] }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${invite.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`, children: invite.is_active ? "Active" : "Inactive" }) }),
        /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 text-gray-300", children: [
          invite.current_uses,
          " / ",
          invite.max_uses || "∞"
        ] }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-gray-300", children: invite.sessions_count }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-gray-400 text-sm", children: invite.expires_at ? formatDate$4(invite.expires_at) : "Never" }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-gray-400 text-sm", children: formatDate$4(invite.created_at) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-right" })
      ] }, invite.id)) })
    ] }) })
  ] });
};
const __vite_glob_0_11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Invites
}, Symbol.toStringTag, { value: "Module" }));
const formatDate$3 = (dateStr) => new Date(dateStr).toLocaleString();
const statusClass$3 = (status) => {
  switch (status) {
    case "active":
      return "bg-blue-600 text-white";
    case "completed":
      return "bg-green-600 text-white";
    case "pending":
      return "bg-yellow-500 text-black";
    default:
      return "bg-gray-600 text-white";
  }
};
const PlanDetail = () => {
  const { planId } = useParams();
  const [plan, setPlan] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  useEffect(() => {
    fetch(`/admin/discovery/plans/${planId}`).then((res) => res.json()).then((data) => setPlan(data));
  }, [planId]);
  if (!plan) return /* @__PURE__ */ jsx("div", { children: "Loading..." });
  const tabs = [
    { id: "summary", label: "User Summary" },
    { id: "requirements", label: "Requirements" },
    { id: "plan", label: "Plan" },
    { id: "history", label: "History" }
  ];
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsx("a", { href: "/admin/discovery/plans", className: "text-gray-400 hover:text-white text-sm", children: "← Back to Plans" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: plan.projectName }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-400 mt-1", children: [
          "From ",
          /* @__PURE__ */ jsxs("a", { href: `/admin/discovery/sessions/${plan.session_id}`, className: "text-purple-400 hover:text-purple-300", children: [
            "Session #",
            String(plan.session_id).slice(0, 8),
            "..."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        plan.complexity && /* @__PURE__ */ jsx("span", { className: "px-3 py-1 rounded text-sm font-medium bg-blue-500/20 text-blue-400", children: plan.complexity }),
        /* @__PURE__ */ jsx("span", { className: `px-3 py-1 rounded text-sm font-medium ${statusClass$3(plan.status)}`, children: plan.status })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg p-4 border border-gray-700", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm", children: "User Email" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-300 mt-1", children: plan.session?.metadata?.user_email || "Anonymous" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg p-4 border border-gray-700", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm", children: "Target Users" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-300 mt-1", children: plan.requirements?.users?.primary_users || "—" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg p-4 border border-gray-700", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm", children: "Generated" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-300 mt-1", children: formatDate$3(plan.created_at) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg p-4 border border-gray-700", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm", children: "Email Sent" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-300 mt-1", children: plan.email_sent_at ? formatDate$3(plan.email_sent_at) : "Not sent" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-2 mb-6 border-b border-gray-700 pb-4", children: tabs.map((tab) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setActiveTab(tab.id),
        className: `px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.id ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"}`,
        children: tab.label
      },
      tab.id
    )) }),
    activeTab === "summary" && /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg border border-gray-700", children: [
      /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-gray-700", children: /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-green-400 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { role: "img", "aria-label": "clipboard", children: "📋" }),
        " Project Overview"
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed", children: plan.userSummary?.project_overview || "No overview available." }) })
    ] }) })
  ] });
};
const __vite_glob_0_12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: PlanDetail
}, Symbol.toStringTag, { value: "Module" }));
const formatDate$2 = (dateStr) => new Date(dateStr).toLocaleString();
const statusClass$2 = (status) => {
  switch (status) {
    case "active":
      return "bg-blue-600 text-white";
    case "completed":
      return "bg-green-600 text-white";
    case "pending":
      return "bg-yellow-500 text-black";
    default:
      return "bg-gray-600 text-white";
  }
};
const Plans = () => {
  const [plans, setPlans] = useState({ data: [], last_page: 1, current_page: 1 });
  useEffect(() => {
    fetch(`/admin/discovery/plans?page=${plans.current_page}`).then((res) => res.json()).then((data) => setPlans(data));
  }, [plans.current_page]);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-6", children: "Discovery Plans" }),
    /* @__PURE__ */ jsx("div", { className: "bg-gray-800 rounded-lg border border-gray-700 overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-gray-700/50", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Session" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "User" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Email Sent" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Generated" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-700", children: plans.data.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "px-6 py-8 text-center text-gray-500", children: "No plans generated yet." }) }) : plans.data.map((plan) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-700/30", children: [
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("a", { href: `/admin/discovery/sessions/${plan.session_id}`, className: "text-purple-400 hover:text-purple-300", children: [
          "Session #",
          plan.session_id
        ] }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-gray-300", children: plan.session?.metadata?.user_email || "Anonymous" }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${statusClass$2(plan.status)}`, children: plan.status }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: plan.email_sent_at ? /* @__PURE__ */ jsx("span", { className: "text-green-400 text-sm", children: formatDate$2(plan.email_sent_at) }) : /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-sm", children: "Not sent" }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-gray-400 text-sm", children: formatDate$2(plan.created_at) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsx("a", { href: `/admin/discovery/plans/${plan.id}`, className: "text-blue-400 hover:text-blue-300 text-sm", children: "View Plan" }) })
      ] }, plan.id)) })
    ] }) }),
    plans.last_page > 1 && /* @__PURE__ */ jsx("div", { className: "mt-4 flex justify-center space-x-2", children: Array.from({ length: plans.last_page }, (_, i) => i + 1).map((page) => /* @__PURE__ */ jsx(
      "a",
      {
        href: `?page=${page}`,
        className: `px-3 py-1 rounded text-sm ${page === plans.current_page ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"}`,
        children: page
      },
      page
    )) })
  ] });
};
const __vite_glob_0_13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Plans
}, Symbol.toStringTag, { value: "Module" }));
const formatDate$1 = (dateStr) => new Date(dateStr).toLocaleString();
const statusClass$1 = (status) => {
  switch (status) {
    case "active":
      return "bg-blue-600 text-white";
    case "completed":
      return "bg-green-600 text-white";
    case "pending":
      return "bg-yellow-500 text-black";
    default:
      return "bg-gray-600 text-white";
  }
};
const SessionDetail = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  useEffect(() => {
    fetch(`/admin/discovery/sessions/${sessionId}`).then((res) => res.json()).then((data) => setSession(data));
  }, [sessionId]);
  if (!session) return /* @__PURE__ */ jsx("div", { children: "Loading..." });
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsx("a", { href: "/admin/discovery/sessions", className: "text-gray-400 hover:text-white text-sm", children: "← Back to Sessions" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold", children: [
          "Session #",
          session.id
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 mt-1", children: session.metadata?.user_email || "Anonymous" })
      ] }),
      /* @__PURE__ */ jsx("span", { className: `px-3 py-1 rounded text-sm font-medium ${statusClass$1(session.status)}`, children: session.status })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg p-4 border border-gray-700", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm", children: "Invite Code" }),
        /* @__PURE__ */ jsx("p", { className: "font-mono text-purple-400 mt-1", children: session.invite_code?.code })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg p-4 border border-gray-700", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm", children: "Turn Count" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold mt-1", children: session.turn_count })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg p-4 border border-gray-700", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm", children: "Started" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-300 mt-1", children: formatDate$1(session.created_at) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg p-4 border border-gray-700", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm", children: "Last Activity" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-300 mt-1", children: formatDate$1(session.updated_at) })
      ] })
    ] }),
    session.discovery_plan && /* @__PURE__ */ jsx("div", { className: "bg-green-900/20 border border-green-700 rounded-lg p-4 mb-8", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-green-400", children: "Discovery Plan Generated" }),
        /* @__PURE__ */ jsxs("p", { className: "text-green-300 text-sm mt-1", children: [
          "Plan was generated on ",
          formatDate$1(session.discovery_plan.created_at)
        ] })
      ] }),
      /* @__PURE__ */ jsx("a", { href: `/admin/discovery/plans/${session.discovery_plan.id}`, className: "bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-medium", children: "View Plan" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg border border-gray-700", children: [
      /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-gray-700", children: /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Conversation History" }) }),
      /* @__PURE__ */ jsx("div", { className: "p-6 space-y-4 max-h-150 overflow-y-auto", children: !session.messages || session.messages.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center text-gray-500 py-8", children: "No messages in this session." }) : session.messages.map((message) => /* @__PURE__ */ jsx("div", { className: message.role === "user" ? "ml-8" : "mr-8", children: /* @__PURE__ */ jsxs("div", { className: `rounded-lg p-4 border ${message.role === "user" ? "bg-purple-600/20 border-purple-500/30" : "bg-gray-700/50 border-gray-600"}`, children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-between items-center mb-2", children: /* @__PURE__ */ jsx("span", { className: message.role === "user" ? "text-purple-400" : "text-gray-400", children: message.role }) }),
        /* @__PURE__ */ jsx("div", { className: "text-gray-300 whitespace-pre-line", children: message.content })
      ] }) }, message.id)) })
    ] })
  ] });
};
const __vite_glob_0_14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: SessionDetail
}, Symbol.toStringTag, { value: "Module" }));
const formatDate = (dateStr) => new Date(dateStr).toLocaleString();
const statusClass = (status) => {
  switch (status) {
    case "active":
      return "bg-blue-600 text-white";
    case "completed":
      return "bg-green-600 text-white";
    case "pending":
      return "bg-yellow-500 text-black";
    default:
      return "bg-gray-600 text-white";
  }
};
const Sessions = () => {
  const [sessions, setSessions] = useState({ data: [], last_page: 1, current_page: 1 });
  useEffect(() => {
    fetch(`/admin/discovery/sessions?page=${sessions.current_page}`).then((res) => res.json()).then((data) => setSessions(data));
  }, [sessions.current_page]);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-6", children: "Discovery Sessions" }),
    /* @__PURE__ */ jsx("div", { className: "bg-gray-800 rounded-lg border border-gray-700 overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-gray-700/50", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "User" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Invite Code" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Turns" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Plan" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Started" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-700", children: sessions.data.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 7, className: "px-6 py-8 text-center text-gray-500", children: "No sessions yet." }) }) : sessions.data.map((session) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-700/30", children: [
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("div", { className: "text-gray-300", children: session.metadata?.user_email || "Anonymous" }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: "font-mono text-purple-400 text-sm", children: session.invite_code?.code }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${statusClass(session.status)}`, children: session.status }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-gray-300", children: session.turn_count }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: session.discovery_plan ? /* @__PURE__ */ jsx("span", { className: "text-green-400 text-sm", children: "Generated" }) : /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-sm", children: "—" }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-gray-400 text-sm", children: formatDate(session.created_at) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsx("a", { href: `/admin/discovery/sessions/${session.id}`, className: "text-blue-400 hover:text-blue-300 text-sm", children: "View Details" }) })
      ] }, session.id)) })
    ] }) }),
    sessions.last_page > 1 && /* @__PURE__ */ jsx("div", { className: "mt-4 flex justify-center space-x-2", children: Array.from({ length: sessions.last_page }, (_, i) => i + 1).map((page) => /* @__PURE__ */ jsx(
      "a",
      {
        href: `?page=${page}`,
        className: `px-3 py-1 rounded text-sm ${page === sessions.current_page ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"}`,
        children: page
      },
      page
    )) })
  ] });
};
const __vite_glob_0_15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Sessions
}, Symbol.toStringTag, { value: "Module" }));
export {
  __vite_glob_0_15 as _,
  __vite_glob_0_14 as a,
  __vite_glob_0_13 as b,
  __vite_glob_0_12 as c,
  __vite_glob_0_11 as d,
  __vite_glob_0_10 as e
};
