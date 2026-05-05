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
          max_uses: form.max_uses === "" ? null : Number(form.max_uses),
          expires_days: !form.expires_days ? null : Number(form.expires_days)
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
const __vite_glob_0_11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
const __vite_glob_0_12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Invites
}, Symbol.toStringTag, { value: "Module" }));
const formatDate$3 = (dateStr) => dateStr ? new Date(dateStr).toLocaleString() : "—";
const toArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  if (typeof value === "string" && value.trim() !== "") {
    return [value.trim()];
  }
  return [];
};
const formatList = (value) => {
  const items = toArray(value);
  return items.length > 0 ? items.join(", ") : "—";
};
const extractedReferenceSections = [
  { key: "current_property", label: "Current Property / Existing Site" },
  { key: "reference_examples", label: "Reference Examples" },
  { key: "competitors", label: "Competitors" },
  { key: "design_inspirations", label: "Design Inspirations" },
  { key: "feature_patterns_to_consider", label: "Feature Patterns to Consider" },
  { key: "notes", label: "Reference Notes" }
];
const statusClass$3 = (status) => {
  switch (status) {
    case "generating":
      return "bg-purple-600 text-white";
    case "completed":
      return "bg-green-600 text-white";
    case "failed":
      return "bg-red-600 text-white";
    default:
      return "bg-gray-600 text-white";
  }
};
const PlanDetail = () => {
  const { planId } = useParams();
  const [plan, setPlan] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");
  const [showRawTechnical, setShowRawTechnical] = useState(false);
  const userSummary = plan?.user_summary;
  const requirements = plan?.structured_requirements;
  const technicalPlan = plan?.technical_plan;
  const referenceSummaries = toArray(plan?.session?.metadata?.reference_summaries);
  const extractedReferences = requirements?.references || {};
  const visibleReferenceSections = extractedReferenceSections.map((section) => ({
    ...section,
    items: toArray(extractedReferences?.[section.key])
  })).filter((section) => section.items.length > 0);
  const projectName = requirements?.project?.name || "Discovery Plan";
  const complexity = userSummary?.complexity || requirements?.estimation?.complexity;
  useEffect(() => {
    fetch(`/api/admin/discovery/plans/${planId}`, {
      headers: {
        Accept: "application/json"
      },
      credentials: "same-origin"
    }).then((res) => res.json()).then((data) => setPlan(data));
  }, [planId]);
  if (!plan) return /* @__PURE__ */ jsx("div", { children: "Loading..." });
  const tabs = [
    { id: "summary", label: "User Summary" },
    { id: "requirements", label: "Requirements" },
    { id: "technical", label: "Technical Plan" }
  ];
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsx("a", { href: "/admin/discovery/plans", className: "text-gray-400 hover:text-white text-sm", children: "← Back to Plans" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: projectName }),
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
        complexity && /* @__PURE__ */ jsx("span", { className: "px-3 py-1 rounded text-sm font-medium bg-blue-500/20 text-blue-400", children: complexity }),
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
        /* @__PURE__ */ jsx("p", { className: "text-gray-300 mt-1", children: formatList(requirements?.users?.primary_users) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg p-4 border border-gray-700", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm", children: "Generated" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-300 mt-1", children: formatDate$3(plan.created_at) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg p-4 border border-gray-700", children: [
        /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm", children: "Email Sent" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-300 mt-1", children: "Not tracked" })
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
    activeTab === "summary" && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg border border-gray-700", children: [
        /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-gray-700", children: /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-green-400 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { role: "img", "aria-label": "clipboard", children: "📋" }),
          " Project Overview"
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed", children: userSummary?.project_overview || "No overview available." }) })
      ] }),
      userSummary?.high_level_features?.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg border border-gray-700", children: [
        /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-gray-700", children: /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-green-400 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { role: "img", "aria-label": "sparkles", children: "✨" }),
          " Key Features"
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: userSummary.high_level_features.map((feature, index) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-green-400 mt-0.5", children: "✓" }),
          /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: feature })
        ] }, index)) }) })
      ] }),
      userSummary?.goals_and_success?.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg border border-gray-700", children: [
        /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-gray-700", children: /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-green-400 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { role: "img", "aria-label": "target", children: "🎯" }),
          " Goals & Success Metrics"
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: userSummary.goals_and_success.map((goal, index) => /* @__PURE__ */ jsx("li", { className: "text-gray-300", children: goal }, index)) }) })
      ] }),
      referenceSummaries.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg border border-gray-700", children: [
        /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-gray-700", children: /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-green-400 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { role: "img", "aria-label": "link", children: "🔗" }),
          " Reference Inputs"
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "p-6 space-y-4", children: referenceSummaries.map((reference, index) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-gray-900 p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-200", children: reference.title || reference.url || `Reference ${index + 1}` }),
              reference.url && /* @__PURE__ */ jsx("a", { href: reference.url, target: "_blank", rel: "noreferrer", className: "text-sm text-purple-400 hover:text-purple-300 break-all", children: reference.url })
            ] }),
            reference.source_type && /* @__PURE__ */ jsx("span", { className: "rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-300", children: reference.source_type.replaceAll("_", " ") })
          ] }),
          reference.summary && /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-gray-300", children: reference.summary }),
          toArray(reference.observed_patterns).length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
            /* @__PURE__ */ jsx("p", { className: "mb-2 text-xs font-medium uppercase tracking-wide text-gray-500", children: "Observed Patterns" }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: toArray(reference.observed_patterns).map((pattern, patternIndex) => /* @__PURE__ */ jsx("span", { className: "rounded bg-gray-800 px-2 py-1 text-xs text-gray-300", children: pattern }, patternIndex)) })
          ] })
        ] }, `${reference.url || "reference"}-${index}`)) })
      ] })
    ] }),
    activeTab === "requirements" && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      requirements?.project && /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg border border-gray-700", children: [
        /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-gray-700", children: /* @__PURE__ */ jsx("h3", { className: "font-semibold text-blue-400", children: "Project Details" }) }),
        /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-4 text-gray-300", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mb-1", children: "Project Name" }),
            /* @__PURE__ */ jsx("p", { children: requirements.project.name || "—" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mb-1", children: "Vision" }),
            /* @__PURE__ */ jsx("p", { children: requirements.project.vision || "—" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mb-1", children: "Problem Statement" }),
            /* @__PURE__ */ jsx("p", { children: requirements.project.problem_statement || "—" })
          ] })
        ] })
      ] }),
      requirements?.features?.must_have?.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg border border-gray-700", children: [
        /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-gray-700", children: /* @__PURE__ */ jsx("h3", { className: "font-semibold text-blue-400", children: "Must-Have Features" }) }),
        /* @__PURE__ */ jsx("div", { className: "p-6 flex flex-wrap gap-2", children: requirements.features.must_have.map((feature, index) => /* @__PURE__ */ jsx("span", { className: "px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm", children: feature }, index)) })
      ] }),
      requirements?.features?.nice_to_have?.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg border border-gray-700", children: [
        /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-gray-700", children: /* @__PURE__ */ jsx("h3", { className: "font-semibold text-blue-400", children: "Nice-to-Have Features" }) }),
        /* @__PURE__ */ jsx("div", { className: "p-6 flex flex-wrap gap-2", children: requirements.features.nice_to_have.map((feature, index) => /* @__PURE__ */ jsx("span", { className: "px-3 py-1 rounded-full bg-gray-700 text-gray-300 text-sm", children: feature }, index)) })
      ] }),
      (visibleReferenceSections.length > 0 || referenceSummaries.length > 0) && /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg border border-gray-700", children: [
        /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-b border-gray-700", children: /* @__PURE__ */ jsx("h3", { className: "font-semibold text-blue-400", children: "Reference Context" }) }),
        /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-5", children: [
          visibleReferenceSections.length > 0 ? visibleReferenceSections.map((section) => /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "mb-2 text-sm text-gray-500", children: section.label }),
            /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: section.items.map((item, index) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-gray-300", children: [
              /* @__PURE__ */ jsx("span", { className: "mt-0.5 text-blue-400", children: "•" }),
              /* @__PURE__ */ jsx("span", { children: item })
            ] }, index)) })
          ] }, section.key)) : /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400", children: "This plan predates explicit reference extraction, so the analyzed sites are shown below from session metadata." }),
          referenceSummaries.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "mb-2 text-sm text-gray-500", children: "Analyzed Inputs" }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: referenceSummaries.map((reference, index) => /* @__PURE__ */ jsx("span", { className: "rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-300", children: reference.url || reference.title || `Reference ${index + 1}` }, `${reference.url || "analyzed-reference"}-${index}`)) })
          ] })
        ] })
      ] })
    ] }),
    activeTab === "technical" && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      technicalPlan?.executive_summary && /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg border border-purple-700", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b border-purple-700 bg-purple-900/20 px-6 py-4", children: /* @__PURE__ */ jsxs("h3", { className: "flex items-center gap-2 font-semibold text-purple-400", children: [
          /* @__PURE__ */ jsx("span", { role: "img", "aria-label": "bar chart", children: "📊" }),
          " Executive Summary"
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsx("p", { className: "leading-relaxed text-gray-300", children: technicalPlan.executive_summary }) })
      ] }),
      technicalPlan?.tech_stack_details && /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg border border-purple-700", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b border-purple-700 bg-purple-900/20 px-6 py-4", children: /* @__PURE__ */ jsxs("h3", { className: "flex items-center gap-2 font-semibold text-purple-400", children: [
          /* @__PURE__ */ jsx("span", { role: "img", "aria-label": "tools", children: "🛠️" }),
          " Recommended Tech Stack"
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6 p-6 md:grid-cols-2", children: [
          technicalPlan.tech_stack_details.backend && /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-gray-900 p-4", children: [
            /* @__PURE__ */ jsx("h4", { className: "mb-3 font-medium text-purple-300", children: "Backend" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4", children: [
                /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Language" }),
                /* @__PURE__ */ jsx("span", { className: "text-right text-gray-300", children: technicalPlan.tech_stack_details.backend.language || "—" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4", children: [
                /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Framework" }),
                /* @__PURE__ */ jsx("span", { className: "text-right text-gray-300", children: technicalPlan.tech_stack_details.backend.framework || "—" })
              ] })
            ] }),
            technicalPlan.tech_stack_details.backend.rationale && /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm italic text-gray-500", children: technicalPlan.tech_stack_details.backend.rationale })
          ] }),
          technicalPlan.tech_stack_details.frontend && /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-gray-900 p-4", children: [
            /* @__PURE__ */ jsx("h4", { className: "mb-3 font-medium text-purple-300", children: "Frontend" }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2 text-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Framework" }),
              /* @__PURE__ */ jsx("span", { className: "text-right text-gray-300", children: technicalPlan.tech_stack_details.frontend.framework || "—" })
            ] }) }),
            technicalPlan.tech_stack_details.frontend.rationale && /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm italic text-gray-500", children: technicalPlan.tech_stack_details.frontend.rationale })
          ] }),
          technicalPlan.tech_stack_details.database && /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-gray-900 p-4", children: [
            /* @__PURE__ */ jsx("h4", { className: "mb-3 font-medium text-purple-300", children: "Database" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4", children: [
                /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Primary" }),
                /* @__PURE__ */ jsx("span", { className: "text-right text-gray-300", children: technicalPlan.tech_stack_details.database.primary || "—" })
              ] }),
              technicalPlan.tech_stack_details.database.cache && /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4", children: [
                /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Cache" }),
                /* @__PURE__ */ jsx("span", { className: "text-right text-gray-300", children: technicalPlan.tech_stack_details.database.cache })
              ] })
            ] }),
            technicalPlan.tech_stack_details.database.rationale && /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm italic text-gray-500", children: technicalPlan.tech_stack_details.database.rationale })
          ] }),
          technicalPlan.tech_stack_details.deployment && /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-gray-900 p-4", children: [
            /* @__PURE__ */ jsx("h4", { className: "mb-3 font-medium text-purple-300", children: "Deployment" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4", children: [
                /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Hosting" }),
                /* @__PURE__ */ jsx("span", { className: "text-right text-gray-300", children: technicalPlan.tech_stack_details.deployment.hosting || "—" })
              ] }),
              technicalPlan.tech_stack_details.deployment.infrastructure && /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4", children: [
                /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Infrastructure" }),
                /* @__PURE__ */ jsx("span", { className: "text-right text-gray-300", children: technicalPlan.tech_stack_details.deployment.infrastructure })
              ] })
            ] })
          ] })
        ] })
      ] }),
      technicalPlan?.architecture_recommendations && /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg border border-purple-700", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b border-purple-700 bg-purple-900/20 px-6 py-4", children: /* @__PURE__ */ jsxs("h3", { className: "flex items-center gap-2 font-semibold text-purple-400", children: [
          /* @__PURE__ */ jsx("span", { role: "img", "aria-label": "building", children: "🏗️" }),
          " Architecture"
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4 p-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "mb-1 text-sm text-gray-500", children: "Pattern" }),
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-300", children: technicalPlan.architecture_recommendations.pattern || "—" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "mb-1 text-sm text-gray-500", children: "Rationale" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-300", children: technicalPlan.architecture_recommendations.rationale || "—" })
          ] })
        ] })
      ] }),
      technicalPlan?.full_technical_breakdown?.key_components?.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg border border-purple-700", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b border-purple-700 bg-purple-900/20 px-6 py-4", children: /* @__PURE__ */ jsxs("h3", { className: "flex items-center gap-2 font-semibold text-purple-400", children: [
          /* @__PURE__ */ jsx("span", { role: "img", "aria-label": "puzzle", children: "🧩" }),
          " Key Components"
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: technicalPlan.full_technical_breakdown.key_components.map((component, index) => /* @__PURE__ */ jsx("span", { className: "rounded-lg bg-purple-500/20 px-3 py-2 text-sm text-purple-300", children: component }, index)) }),
          technicalPlan.full_technical_breakdown.description && /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm text-gray-400", children: technicalPlan.full_technical_breakdown.description })
        ] })
      ] }),
      technicalPlan?.timeline_week_ranges?.phases?.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg border border-purple-700", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-purple-700 bg-purple-900/20 px-6 py-4", children: [
          /* @__PURE__ */ jsxs("h3", { className: "flex items-center gap-2 font-semibold text-purple-400", children: [
            /* @__PURE__ */ jsx("span", { role: "img", "aria-label": "calendar", children: "📅" }),
            " Project Timeline"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-sm text-purple-300", children: [
            "Total: ",
            technicalPlan.timeline_week_ranges.total_weeks || "—"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4 p-6", children: technicalPlan.timeline_week_ranges.phases.map((phase) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-gray-900 p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("span", { className: "text-sm text-purple-400", children: [
                "Phase ",
                phase.phase
              ] }),
              /* @__PURE__ */ jsx("h4", { className: "font-medium text-gray-200", children: phase.name })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-400", children: phase.duration })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: (phase.deliverables || []).map((deliverable, index) => /* @__PURE__ */ jsx("span", { className: "rounded bg-gray-800 px-2 py-1 text-xs text-gray-400", children: deliverable }, index)) })
        ] }, phase.phase)) })
      ] }),
      technicalPlan?.cost_estimates && /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg border border-purple-700", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b border-purple-700 bg-purple-900/20 px-6 py-4", children: /* @__PURE__ */ jsxs("h3", { className: "flex items-center gap-2 font-semibold text-purple-400", children: [
          /* @__PURE__ */ jsx("span", { role: "img", "aria-label": "money bag", children: "💰" }),
          " Cost Estimates"
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-1 gap-4 md:grid-cols-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-gray-900 p-4 text-center", children: [
              /* @__PURE__ */ jsx("p", { className: "mb-1 text-sm text-gray-500", children: "Development" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-green-400", children: technicalPlan.cost_estimates.development?.subtotal_range || "—" }),
              /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-gray-500", children: [
                technicalPlan.cost_estimates.development?.hours || "—",
                " hrs @ ",
                technicalPlan.cost_estimates.development?.rate_range || "—",
                "/hr"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-gray-900 p-4 text-center", children: [
              /* @__PURE__ */ jsx("p", { className: "mb-1 text-sm text-gray-500", children: "Infrastructure (Monthly)" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-blue-400", children: technicalPlan.cost_estimates.infrastructure_monthly || "—" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-gray-900 p-4 text-center", children: [
              /* @__PURE__ */ jsx("p", { className: "mb-1 text-sm text-gray-500", children: "Total Estimate" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-purple-400", children: technicalPlan.cost_estimates.total_estimate_range || "—" })
            ] })
          ] }),
          technicalPlan.cost_estimates.third_party_services?.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsx("p", { className: "mb-2 text-sm text-gray-500", children: "Third Party Services" }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2", children: technicalPlan.cost_estimates.third_party_services.map((service, index) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-4 rounded bg-gray-900 px-3 py-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: service.service }),
              /* @__PURE__ */ jsx("span", { className: "text-gray-300", children: service.cost })
            ] }, index)) })
          ] }),
          technicalPlan.cost_estimates.assumptions?.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "mb-2 text-sm text-gray-500", children: "Assumptions" }),
            /* @__PURE__ */ jsx("ul", { className: "space-y-1 text-sm text-gray-400", children: technicalPlan.cost_estimates.assumptions.map((assumption, index) => /* @__PURE__ */ jsxs("li", { children: [
              "• ",
              assumption
            ] }, index)) })
          ] })
        ] })
      ] }),
      technicalPlan?.risk_assessment?.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg border border-purple-700", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b border-purple-700 bg-purple-900/20 px-6 py-4", children: /* @__PURE__ */ jsxs("h3", { className: "flex items-center gap-2 font-semibold text-purple-400", children: [
          /* @__PURE__ */ jsx("span", { role: "img", "aria-label": "lightning", children: "⚡" }),
          " Risk Assessment"
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4 p-6", children: technicalPlan.risk_assessment.map((risk, index) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-gray-900 p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-200", children: risk.risk }),
            /* @__PURE__ */ jsxs("span", { className: `rounded px-2 py-1 text-xs font-medium ${risk.impact === "high" ? "bg-red-500/20 text-red-400" : risk.impact === "medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`, children: [
              risk.impact,
              " impact"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-400", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Mitigation:" }),
            " ",
            risk.mitigation
          ] })
        ] }, index)) })
      ] }),
      technicalPlan?.recommendations && /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg border border-purple-700", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b border-purple-700 bg-purple-900/20 px-6 py-4", children: /* @__PURE__ */ jsxs("h3", { className: "flex items-center gap-2 font-semibold text-purple-400", children: [
          /* @__PURE__ */ jsx("span", { role: "img", "aria-label": "light bulb", children: "💡" }),
          " Recommendations"
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4 p-6", children: [
          technicalPlan.recommendations.team_composition && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "mb-1 text-sm text-gray-500", children: "Team Composition" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-300", children: technicalPlan.recommendations.team_composition })
          ] }),
          technicalPlan.recommendations.prioritization?.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "mb-2 text-sm text-gray-500", children: "Prioritization" }),
            /* @__PURE__ */ jsx("ul", { className: "space-y-1", children: technicalPlan.recommendations.prioritization.map((item, index) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2 text-gray-300", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-purple-400", children: [
                index + 1,
                "."
              ] }),
              /* @__PURE__ */ jsx("span", { children: item })
            ] }, index)) })
          ] }),
          technicalPlan.recommendations.architectural_decisions?.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "mb-2 text-sm text-gray-500", children: "Architectural Decisions" }),
            /* @__PURE__ */ jsx("ul", { className: "space-y-1", children: technicalPlan.recommendations.architectural_decisions.map((decision, index) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-gray-300", children: [
              /* @__PURE__ */ jsx("span", { className: "mt-0.5 text-purple-400", children: "•" }),
              /* @__PURE__ */ jsx("span", { children: decision })
            ] }, index)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg border border-gray-700", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setShowRawTechnical((current) => !current),
            className: "flex w-full items-center justify-between px-6 py-4 text-gray-400 transition hover:text-white",
            children: [
              /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "View Raw JSON" }),
              /* @__PURE__ */ jsx("span", { children: showRawTechnical ? "▲" : "▼" })
            ]
          }
        ),
        showRawTechnical && /* @__PURE__ */ jsx("div", { className: "px-6 pb-6", children: /* @__PURE__ */ jsx("pre", { className: "overflow-x-auto whitespace-pre-wrap rounded-lg bg-gray-900 p-4 text-sm text-gray-300", children: JSON.stringify(technicalPlan || {}, null, 2) }) })
      ] })
    ] })
  ] });
};
const __vite_glob_0_13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: PlanDetail
}, Symbol.toStringTag, { value: "Module" }));
const formatDate$2 = (dateStr) => dateStr ? new Date(dateStr).toLocaleString() : "—";
const statusClass$2 = (status) => {
  switch (status) {
    case "generating":
      return "bg-purple-600 text-white";
    case "completed":
      return "bg-green-600 text-white";
    case "failed":
      return "bg-red-600 text-white";
    default:
      return "bg-gray-600 text-white";
  }
};
const Plans = () => {
  const [plans, setPlans] = useState({ data: [], last_page: 1, current_page: 1 });
  const loadPlans = async (page = plans.current_page) => {
    const response = await fetch(`/api/admin/discovery/plans?page=${page}`, {
      headers: {
        Accept: "application/json"
      },
      credentials: "same-origin"
    });
    const data = await response.json();
    setPlans(data);
  };
  useEffect(() => {
    loadPlans();
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
      "button",
      {
        type: "button",
        onClick: () => setPlans((prev) => ({ ...prev, current_page: page })),
        className: `px-3 py-1 rounded text-sm ${page === plans.current_page ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"}`,
        children: page
      },
      page
    )) })
  ] });
};
const __vite_glob_0_14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Plans
}, Symbol.toStringTag, { value: "Module" }));
const formatDate$1 = (dateStr) => new Date(dateStr).toLocaleString();
const statusClass$1 = (status) => {
  switch (status) {
    case "active":
      return "bg-blue-600 text-white";
    case "generating":
      return "bg-purple-600 text-white";
    case "completed":
      return "bg-green-600 text-white";
    case "failed":
      return "bg-red-600 text-white";
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
    fetch(`/api/admin/discovery/sessions/${sessionId}`, {
      headers: {
        Accept: "application/json"
      },
      credentials: "same-origin"
    }).then((res) => res.json()).then((data) => setSession(data));
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
        /* @__PURE__ */ jsx("p", { className: "text-gray-300 mt-1", children: formatDate$1(session.last_activity_at || session.updated_at) }),
        session.is_active_now && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs font-medium text-emerald-300", children: "Active in the last 5 minutes" })
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
const __vite_glob_0_15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: SessionDetail
}, Symbol.toStringTag, { value: "Module" }));
const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleString() : "—";
const formatRelativeTime = (dateStr) => {
  if (!dateStr) {
    return "—";
  }
  const deltaSeconds = Math.round((new Date(dateStr).getTime() - Date.now()) / 1e3);
  const rtf = new Intl.RelativeTimeFormat(void 0, { numeric: "auto" });
  if (Math.abs(deltaSeconds) < 60) {
    return rtf.format(deltaSeconds, "second");
  }
  const deltaMinutes = Math.round(deltaSeconds / 60);
  if (Math.abs(deltaMinutes) < 60) {
    return rtf.format(deltaMinutes, "minute");
  }
  const deltaHours = Math.round(deltaMinutes / 60);
  if (Math.abs(deltaHours) < 24) {
    return rtf.format(deltaHours, "hour");
  }
  return rtf.format(Math.round(deltaHours / 24), "day");
};
const statusClass = (status) => {
  switch (status) {
    case "active":
      return "bg-blue-600 text-white";
    case "completed":
      return "bg-green-600 text-white";
    case "generating":
      return "bg-purple-600 text-white";
    case "failed":
      return "bg-red-600 text-white";
    case "pending":
      return "bg-yellow-500 text-black";
    default:
      return "bg-gray-600 text-white";
  }
};
const getCsrfToken = () => decodeURIComponent(document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "");
const Sessions = () => {
  const [sessions, setSessions] = useState({ data: [], last_page: 1, current_page: 1, summary: { total: 0, active: 0, active_now: 0, active_window_minutes: 5, generating: 0, completed: 0, failed: 0 } });
  const [generatingSessionId, setGeneratingSessionId] = useState(null);
  const [actionError, setActionError] = useState("");
  const loadSessions = async (page = sessions.current_page) => {
    const response = await fetch(`/api/admin/discovery/sessions?page=${page}`, {
      headers: {
        Accept: "application/json"
      },
      credentials: "same-origin"
    });
    const data = await response.json();
    setSessions(data);
  };
  useEffect(() => {
    loadSessions();
  }, [sessions.current_page]);
  const generatePlan = async (sessionId) => {
    setGeneratingSessionId(sessionId);
    setActionError("");
    try {
      const response = await fetch(`/api/admin/discovery/sessions/${sessionId}/generate-plan`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken()
        },
        credentials: "same-origin"
      });
      const data = await response.json();
      if (!response.ok) {
        setActionError(data.message || "Unable to start estimate generation.");
        return;
      }
      await loadSessions();
    } catch (error) {
      setActionError("Unable to start estimate generation.");
    } finally {
      setGeneratingSessionId(null);
    }
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-6", children: "Discovery Sessions" }),
    actionError && /* @__PURE__ */ jsx("div", { className: "mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200", children: actionError }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4 mb-6 md:grid-cols-6", children: [
      { label: "Total", value: sessions.summary?.total ?? 0, tone: "text-white" },
      { label: `Active Now (${sessions.summary?.active_window_minutes ?? 5}m)`, value: sessions.summary?.active_now ?? 0, tone: "text-cyan-300" },
      { label: "Active", value: sessions.summary?.active ?? 0, tone: "text-blue-400" },
      { label: "Generating", value: sessions.summary?.generating ?? 0, tone: "text-purple-400" },
      { label: "Completed", value: sessions.summary?.completed ?? 0, tone: "text-green-400" },
      { label: "Failed", value: sessions.summary?.failed ?? 0, tone: "text-red-400" }
    ].map((item) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-gray-700 bg-gray-800 p-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400", children: item.label }),
      /* @__PURE__ */ jsx("p", { className: `mt-2 text-2xl font-bold ${item.tone}`, children: item.value })
    ] }, item.label)) }),
    /* @__PURE__ */ jsx("div", { className: "bg-gray-800 rounded-lg border border-gray-700 overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-gray-700/50", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "User" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Invite Code" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Turns" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Plan" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Started" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Last Activity" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-700", children: sessions.data.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 8, className: "px-6 py-8 text-center text-gray-500", children: "No sessions yet." }) }) : sessions.data.map((session) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-700/30", children: [
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-gray-300", children: [
          /* @__PURE__ */ jsx("span", { children: session.metadata?.user_email || "Anonymous" }),
          session.is_active_now && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300", children: [
            /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-400" }),
            "Live now"
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: "font-mono text-purple-400 text-sm", children: session.invite_code?.code }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${statusClass(session.status)}`, children: session.status }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-gray-300", children: session.turn_count }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: session.discovery_plan ? /* @__PURE__ */ jsx("span", { className: `text-sm ${session.discovery_plan.status === "failed" ? "text-red-400" : "text-green-400"}`, children: session.discovery_plan.status === "failed" ? "Failed" : "Generated" }) : /* @__PURE__ */ jsx("span", { className: "text-gray-500 text-sm", children: "—" }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-gray-400 text-sm", children: formatDate(session.created_at) }),
        /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 text-gray-400 text-sm", children: [
          /* @__PURE__ */ jsx("div", { children: formatDate(session.last_activity_at || session.updated_at) }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500", children: formatRelativeTime(session.last_activity_at || session.updated_at) })
        ] }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-3", children: [
          session.can_generate_plan && /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => generatePlan(session.id),
              disabled: generatingSessionId === session.id,
              className: "rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60",
              children: generatingSessionId === session.id ? "Starting…" : session.discovery_plan?.status === "failed" ? "Retry Estimate" : "Generate Estimate"
            }
          ),
          /* @__PURE__ */ jsx("a", { href: `/admin/discovery/sessions/${session.id}`, className: "text-blue-400 hover:text-blue-300 text-sm", children: "View Details" })
        ] }) })
      ] }, session.id)) })
    ] }) }),
    sessions.last_page > 1 && /* @__PURE__ */ jsx("div", { className: "mt-4 flex justify-center space-x-2", children: Array.from({ length: sessions.last_page }, (_, i) => i + 1).map((page) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => setSessions((prev) => ({ ...prev, current_page: page })),
        className: `px-3 py-1 rounded text-sm ${page === sessions.current_page ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"}`,
        children: page
      },
      page
    )) })
  ] });
};
const __vite_glob_0_16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Sessions
}, Symbol.toStringTag, { value: "Module" }));
export {
  __vite_glob_0_16 as _,
  __vite_glob_0_15 as a,
  __vite_glob_0_14 as b,
  __vite_glob_0_13 as c,
  __vite_glob_0_12 as d,
  __vite_glob_0_11 as e
};
