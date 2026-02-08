import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useParams, useSearchParams } from "react-router-dom";
import { Loader2, Key, AlertTriangle, CheckCircle, Lock, EyeOff, Eye, AlertCircle, ChevronLeft, Plus, LogOut, Paperclip, Image, FileText, X, Ticket, User, Clock, CheckCircle2, FolderOpen, LogIn, ArrowLeft, Mail, Save, ChevronRight, Edit2, Download, MessageSquare, Trash2, Send, Timer, Filter, Search } from "lucide-react";
import { u as useFileUpload, L as LexicalMarkdownEditor, F as FileUploadProgress, v as validateFiles, M as Markdown } from "./route-admin-helpdesk-UCXZSv33.js";
const ChangePassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [forceChange, setForceChange] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
    errors: {},
    processing: false,
    success: false
  });
  useEffect(() => {
    fetch("/api/helpdesk/user/profile", {
      credentials: "same-origin"
    }).then((res) => {
      if (res.status === 401) {
        window.location.href = "/helpdesk/login";
        return null;
      }
      return res.json();
    }).then((data) => {
      if (data) {
        setForceChange(data.force_password_change || false);
        setLoading(false);
      }
    }).catch(() => {
      setLoading(false);
    });
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      errors: { ...prev.errors, [name]: null }
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setForm((prev) => ({ ...prev, processing: true, errors: {}, success: false }));
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || document.cookie.split("; ").find((row) => row.startsWith("XSRF-TOKEN="))?.split("=")[1];
    try {
      const res = await fetch("/api/helpdesk/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": decodeURIComponent(csrfToken || ""),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
          current_password: form.current_password,
          new_password: form.new_password,
          new_password_confirmation: form.new_password_confirmation
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setForm((prev) => ({
          ...prev,
          errors: data.errors || { general: data.message || "Failed to change password." },
          processing: false
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          processing: false,
          success: true,
          current_password: "",
          new_password: "",
          new_password_confirmation: ""
        }));
        if (forceChange) {
          setTimeout(() => {
            navigate("/helpdesk");
          }, 1500);
        }
      }
    } catch (err) {
      setForm((prev) => ({
        ...prev,
        errors: { general: "Network error. Please try again." },
        processing: false
      }));
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 text-purple-400 animate-spin" }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4 py-12", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center gap-3 mb-4", children: /* @__PURE__ */ jsx("div", { className: "p-3 bg-purple-500/20 rounded-xl", children: /* @__PURE__ */ jsx(Key, { className: "w-8 h-8 text-purple-400" }) }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-white", children: "Change Password" }),
      forceChange ? /* @__PURE__ */ jsxs("div", { className: "mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-amber-400", children: [
          /* @__PURE__ */ jsx(AlertTriangle, { className: "w-5 h-5" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Password change required" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-amber-300/70 text-sm mt-1", children: "You must change your password before continuing." })
      ] }) : /* @__PURE__ */ jsx("p", { className: "text-slate-400 mt-2", children: "Update your account password" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl border border-slate-700 p-8", children: [
      form.success && /* @__PURE__ */ jsxs("div", { className: "mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-green-400", children: [
          /* @__PURE__ */ jsx(CheckCircle, { className: "w-5 h-5" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Password changed successfully!" })
        ] }),
        forceChange && /* @__PURE__ */ jsx("p", { className: "text-green-300/70 text-sm mt-1", children: "Redirecting to dashboard..." })
      ] }),
      form.errors.general && /* @__PURE__ */ jsx("div", { className: "mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm", children: form.errors.general }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        !forceChange && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "current_password", className: "block text-sm font-medium text-slate-300 mb-2", children: "Current Password" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: showCurrentPassword ? "text" : "password",
                id: "current_password",
                name: "current_password",
                value: form.current_password,
                onChange: handleChange,
                className: "w-full pl-10 pr-10 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                placeholder: "Enter current password"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowCurrentPassword(!showCurrentPassword),
                className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300",
                children: showCurrentPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Eye, { className: "w-5 h-5" })
              }
            )
          ] }),
          form.errors.current_password && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-400", children: form.errors.current_password[0] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "new_password", className: "block text-sm font-medium text-slate-300 mb-2", children: "New Password" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Key, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: showNewPassword ? "text" : "password",
                id: "new_password",
                name: "new_password",
                value: form.new_password,
                onChange: handleChange,
                className: "w-full pl-10 pr-10 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                placeholder: "Enter new password"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowNewPassword(!showNewPassword),
                className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300",
                children: showNewPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Eye, { className: "w-5 h-5" })
              }
            )
          ] }),
          form.errors.new_password && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-400", children: form.errors.new_password[0] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "new_password_confirmation", className: "block text-sm font-medium text-slate-300 mb-2", children: "Confirm New Password" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Key, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: showConfirmPassword ? "text" : "password",
                id: "new_password_confirmation",
                name: "new_password_confirmation",
                value: form.new_password_confirmation,
                onChange: handleChange,
                className: "w-full pl-10 pr-10 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                placeholder: "Confirm new password"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowConfirmPassword(!showConfirmPassword),
                className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300",
                children: showConfirmPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Eye, { className: "w-5 h-5" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: form.processing,
            className: "w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2",
            children: form.processing ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "w-5 h-5 animate-spin" }),
              "Changing Password..."
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Key, { className: "w-5 h-5" }),
              "Change Password"
            ] })
          }
        )
      ] }),
      !forceChange && /* @__PURE__ */ jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsx(
        Link,
        {
          to: "/helpdesk",
          className: "text-sm text-purple-400 hover:text-purple-300 transition-colors",
          children: "← Back to Dashboard"
        }
      ) })
    ] })
  ] }) });
};
const __vite_glob_0_44 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ChangePassword
}, Symbol.toStringTag, { value: "Module" }));
function HelpdeskUserCreateTicket() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [priorities, setPriorities] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    project_id: "",
    title: "",
    content: "",
    priority_id: "",
    type_id: ""
  });
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const ticketUpload = useFileUpload();
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/helpdesk/user/projects", {
          credentials: "include"
        });
        if (response.status === 401) {
          navigate("/admin/login");
          return;
        }
        const result = await response.json();
        setProjects(result.data || []);
        if (result.data?.length === 1) {
          setForm((prev) => ({ ...prev, project_id: String(result.data[0].id) }));
          setSelectedProject(result.data[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [navigate]);
  useEffect(() => {
    if (!form.project_id) {
      setPriorities([]);
      setTypes([]);
      return;
    }
    const fetchRefData = async () => {
      try {
        const response = await fetch(`/api/helpdesk/user/projects/${form.project_id}/reference-data`, {
          credentials: "include"
        });
        const result = await response.json();
        setPriorities(result.data?.priorities || []);
        setTypes(result.data?.types || []);
        const mediumPriority = result.data?.priorities?.find((p) => p.slug === "medium");
        if (mediumPriority && !form.priority_id) {
          setForm((prev) => ({ ...prev, priority_id: String(mediumPriority.id) }));
        }
      } catch (err) {
        console.error("Failed to fetch reference data:", err);
      }
    };
    fetchRefData();
  }, [form.project_id]);
  const handleLogout = async () => {
    try {
      await fetch("/helpdesk/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
        }
      });
      window.location.href = "/helpdesk/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const { validFiles, errors } = validateFiles(files, attachments.length);
    if (errors.length > 0) {
      setError(errors.join(", "));
    }
    if (validFiles.length > 0) {
      setAttachments((prev) => [...prev, ...validFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };
  const isImageFile = (file) => file.type.startsWith("image/");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/helpdesk/user/tickets", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
        },
        body: JSON.stringify({
          ...form,
          project_id: parseInt(form.project_id),
          priority_id: form.priority_id ? parseInt(form.priority_id) : null,
          type_id: form.type_id ? parseInt(form.type_id) : null
        })
      });
      if (response.status === 401) {
        window.location.href = "/helpdesk/login";
        return;
      }
      if (!response.ok) {
        const result2 = await response.json();
        throw new Error(result2.message || "Failed to create ticket");
      }
      const result = await response.json();
      const ticketId = result.data.id;
      if (attachments.length > 0) {
        const result2 = await ticketUpload.upload(
          `/api/helpdesk/user/tickets/${ticketId}/attachments`,
          attachments
        );
        if (result2.errors.length > 0) {
          console.error("Some files failed to upload:", result2.errors);
        }
      }
      ticketUpload.reset();
      navigate(`/helpdesk/tickets/${ticketId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "text-slate-400", children: "Loading..." }) });
  }
  if (projects.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 mx-auto mb-4 text-amber-400" }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-400 mb-4", children: "You don't have access to any projects yet." }),
      /* @__PURE__ */ jsx(Link, { to: "/helpdesk", className: "text-purple-400 hover:text-purple-300", children: "Back to Dashboard" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { to: "/helpdesk/tickets", className: "text-slate-400 hover:text-white transition", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Plus, { className: "w-6 h-6 text-purple-400" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-lg", children: "New Ticket" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleLogout,
          className: "flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition",
          children: [
            /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" }),
            "Logout"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("main", { className: "container mx-auto px-6 py-8", children: /* @__PURE__ */ jsx("div", { className: "max-w-2xl mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-6", children: "Create Support Ticket" }),
      error && /* @__PURE__ */ jsx("div", { className: "bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6", children: /* @__PURE__ */ jsx("p", { className: "text-red-400", children: error }) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium mb-2", children: [
            "Project ",
            /* @__PURE__ */ jsx("span", { className: "text-red-400", children: "*" })
          ] }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: form.project_id,
              onChange: (e) => {
                setForm((prev) => ({ ...prev, project_id: e.target.value }));
                setSelectedProject(projects.find((p) => p.id === parseInt(e.target.value)));
              },
              required: true,
              className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Select a project..." }),
                projects.map((project) => /* @__PURE__ */ jsx("option", { value: project.id, children: project.name }, project.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium mb-2", children: [
            "Title ",
            /* @__PURE__ */ jsx("span", { className: "text-red-400", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: form.title,
              onChange: (e) => setForm((prev) => ({ ...prev, title: e.target.value })),
              required: true,
              placeholder: "Brief summary of your issue",
              className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium mb-2", children: [
            "Description ",
            /* @__PURE__ */ jsx("span", { className: "text-red-400", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            LexicalMarkdownEditor,
            {
              value: form.content,
              onChange: (content) => setForm((prev) => ({ ...prev, content })),
              placeholder: "Please describe your issue in detail... (Markdown supported)"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2", children: "Priority" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: form.priority_id,
                onChange: (e) => setForm((prev) => ({ ...prev, priority_id: e.target.value })),
                className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Default" }),
                  priorities.map((priority) => /* @__PURE__ */ jsx("option", { value: priority.id, children: priority.title }, priority.id))
                ]
              }
            )
          ] }),
          types.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2", children: "Type" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: form.type_id,
                onChange: (e) => setForm((prev) => ({ ...prev, type_id: e.target.value })),
                className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Select type..." }),
                  types.map((type) => /* @__PURE__ */ jsx("option", { value: type.id, children: type.title }, type.id))
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2", children: "Attachments" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: fileInputRef,
              type: "file",
              multiple: true,
              onChange: handleFileSelect,
              accept: "image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv",
              className: "hidden"
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              onClick: () => fileInputRef.current?.click(),
              className: "border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition",
              children: [
                /* @__PURE__ */ jsx(Paperclip, { className: "w-8 h-8 mx-auto mb-2 text-slate-400" }),
                /* @__PURE__ */ jsx("p", { className: "text-slate-400", children: "Click to upload files" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mt-1", children: "Images and documents (PDF, Word, Excel, etc.) up to 10MB each" })
              ]
            }
          ),
          attachments.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-4 space-y-2", children: attachments.map((file, index) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex items-center gap-3 bg-slate-700/50 rounded-lg px-4 py-2",
              children: [
                isImageFile(file) ? /* @__PURE__ */ jsx(Image, { className: "w-5 h-5 text-blue-400" }) : /* @__PURE__ */ jsx(FileText, { className: "w-5 h-5 text-amber-400" }),
                /* @__PURE__ */ jsx("span", { className: "flex-1 truncate text-sm", children: file.name }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400", children: formatFileSize(file.size) }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => removeAttachment(index),
                    className: "text-slate-400 hover:text-red-400 transition",
                    children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
                  }
                )
              ]
            },
            index
          )) }),
          ticketUpload.isUploading && attachments.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(
            FileUploadProgress,
            {
              files: attachments,
              fileProgress: ticketUpload.fileProgress,
              isUploading: ticketUpload.isUploading,
              onCancel: ticketUpload.cancel
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-4 pt-4 border-t border-slate-700", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/helpdesk/tickets",
              className: "px-4 py-2 text-slate-400 hover:text-white transition",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "submit",
              disabled: submitting || ticketUpload.isUploading || !form.project_id || !form.title || !form.content,
              className: "flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition",
              children: [
                /* @__PURE__ */ jsx(Ticket, { className: "w-4 h-4" }),
                submitting || ticketUpload.isUploading ? "Creating..." : "Create Ticket"
              ]
            }
          )
        ] })
      ] })
    ] }) }) })
  ] });
}
const __vite_glob_0_45 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: HelpdeskUserCreateTicket
}, Symbol.toStringTag, { value: "Module" }));
const StatCard$1 = ({ icon: Icon, label, value, color, link }) => {
  const Wrapper = link ? Link : "div";
  const wrapperProps = link ? { to: link } : {};
  return /* @__PURE__ */ jsx(
    Wrapper,
    {
      ...wrapperProps,
      className: `bg-slate-800/50 border border-slate-700 rounded-xl p-4 ${link ? "hover:border-slate-600 transition cursor-pointer" : ""}`,
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: `p-2 rounded-lg ${color}`, children: /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: label }),
          /* @__PURE__ */ jsx("p", { className: "text-xl font-bold", children: value })
        ] })
      ] })
    }
  );
};
function HelpdeskUserDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch("/api/helpdesk/user/dashboard", {
          credentials: "include"
        });
        if (response.status === 401) {
          navigate("/admin/login");
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard");
        }
        const result = await response.json();
        setDashboard(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [navigate]);
  const handleLogout = async () => {
    try {
      await fetch("/helpdesk/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
        }
      });
      window.location.href = "/helpdesk/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "text-slate-400", children: "Loading dashboard..." }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-red-400", children: [
      "Error: ",
      error
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsxs(Link, { to: "/helpdesk", className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(Ticket, { className: "w-6 h-6 text-purple-400" }),
        /* @__PURE__ */ jsx("span", { className: "font-semibold text-lg", children: "Support Center" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("nav", { className: "flex items-center gap-6", children: [
          /* @__PURE__ */ jsx(Link, { to: "/helpdesk/tickets", className: "text-slate-300 hover:text-white transition", children: "My Tickets" }),
          /* @__PURE__ */ jsxs(Link, { to: "/helpdesk/tickets/create", className: "text-slate-300 hover:text-white transition flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
            "New Ticket"
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Link, { to: "/helpdesk/profile", className: "flex items-center gap-3 px-3 py-1 bg-slate-800 rounded-lg hover:bg-slate-700 transition", children: [
          /* @__PURE__ */ jsx(User, { className: "w-4 h-4 text-slate-400" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: dashboard?.user?.name }),
          dashboard?.user?.is_staff && /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 bg-purple-600 text-xs rounded", children: "Staff" })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleLogout,
            className: "flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition",
            children: [
              /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" }),
              "Logout"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("main", { className: "container mx-auto px-6 py-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-bold mb-2", children: [
          "Welcome back, ",
          dashboard?.user?.name,
          "!"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-400", children: "Track and manage your support tickets" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-8", children: [
        /* @__PURE__ */ jsx(
          StatCard$1,
          {
            icon: Ticket,
            label: "Total Tickets",
            value: dashboard?.stats?.total_tickets || 0,
            color: "bg-purple-600",
            link: "/helpdesk/tickets"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard$1,
          {
            icon: AlertCircle,
            label: "Open",
            value: dashboard?.stats?.open_tickets || 0,
            color: "bg-amber-500",
            link: "/helpdesk/tickets?status=open"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard$1,
          {
            icon: Clock,
            label: "In Progress",
            value: dashboard?.stats?.in_progress_tickets || 0,
            color: "bg-blue-500",
            link: "/helpdesk/tickets?status=in_progress"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard$1,
          {
            icon: CheckCircle2,
            label: "Resolved",
            value: dashboard?.stats?.resolved_tickets || 0,
            color: "bg-green-500",
            link: "/helpdesk/tickets?status=resolved"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-1", children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "My Projects" }) }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: dashboard?.projects?.length > 0 ? dashboard.projects.map((project) => /* @__PURE__ */ jsxs(
            Link,
            {
              to: `/helpdesk/projects/${project.id}`,
              className: "block bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
                  /* @__PURE__ */ jsx(
                    FolderOpen,
                    {
                      className: "w-5 h-5",
                      style: { color: project.color || "#3b82f6" }
                    }
                  ),
                  /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: project.name })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-slate-400", children: [
                  /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 bg-slate-700 rounded text-xs", children: project.role_label }),
                  /* @__PURE__ */ jsxs("span", { children: [
                    project.open,
                    " open tickets"
                  ] })
                ] })
              ]
            },
            project.id
          )) : /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-slate-500", children: [
            /* @__PURE__ */ jsx(FolderOpen, { className: "w-12 h-12 mx-auto mb-2 opacity-50" }),
            /* @__PURE__ */ jsx("p", { children: "No projects assigned yet" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Recent Tickets" }),
            /* @__PURE__ */ jsx(Link, { to: "/helpdesk/tickets", className: "text-purple-400 hover:text-purple-300 text-sm", children: "View All →" })
          ] }),
          dashboard?.recent_tickets?.length > 0 ? /* @__PURE__ */ jsx("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
            /* @__PURE__ */ jsx("thead", { className: "bg-slate-800", children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-sm font-medium text-slate-400", children: "Ticket" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-sm font-medium text-slate-400", children: "Project" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-sm font-medium text-slate-400", children: "Status" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-sm font-medium text-slate-400", children: "Priority" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-sm font-medium text-slate-400", children: "Created" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-700", children: dashboard.recent_tickets.map((ticket) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-800/50", children: [
              /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
                /* @__PURE__ */ jsxs(
                  Link,
                  {
                    to: `/helpdesk/tickets/${ticket.id}`,
                    className: "text-purple-400 hover:text-purple-300 font-medium",
                    children: [
                      "#",
                      ticket.number
                    ]
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400 truncate max-w-xs", children: ticket.title })
              ] }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm", children: ticket.project?.name }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(
                "span",
                {
                  className: "px-2 py-1 rounded-full text-xs font-medium",
                  style: {
                    backgroundColor: `${ticket.status?.color}20`,
                    color: ticket.status?.color
                  },
                  children: ticket.status?.title
                }
              ) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(
                "span",
                {
                  className: "px-2 py-1 rounded-full text-xs font-medium",
                  style: {
                    backgroundColor: `${ticket.priority?.color}20`,
                    color: ticket.priority?.color
                  },
                  children: ticket.priority?.title
                }
              ) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-slate-400", children: new Date(ticket.created_at).toLocaleDateString() })
            ] }, ticket.id)) })
          ] }) }) : /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center", children: [
            /* @__PURE__ */ jsx(Ticket, { className: "w-12 h-12 mx-auto mb-4 text-slate-600" }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-400 mb-4", children: "No tickets yet" }),
            /* @__PURE__ */ jsxs(
              Link,
              {
                to: "/helpdesk/tickets/create",
                className: "inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition",
                children: [
                  /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
                  "Create Your First Ticket"
                ]
              }
            )
          ] })
        ] })
      ] }),
      dashboard?.user?.is_staff && dashboard?.assigned_to_me?.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-4", children: "Assigned to Me" }),
        /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-4", children: dashboard.assigned_to_me.map((ticket) => /* @__PURE__ */ jsxs(
          Link,
          {
            to: `/helpdesk/tickets/${ticket.id}`,
            className: "bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-purple-500/50 transition",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-purple-400 font-medium", children: [
                  "#",
                  ticket.number
                ] }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-400", children: ticket.project?.name })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm mb-2 line-clamp-2", children: ticket.title }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
                /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 bg-slate-700 rounded", children: ticket.status }),
                /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 bg-slate-700 rounded", children: ticket.priority })
              ] })
            ]
          },
          ticket.id
        )) })
      ] })
    ] }) })
  ] });
}
const __vite_glob_0_46 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: HelpdeskUserDashboard
}, Symbol.toStringTag, { value: "Module" }));
const HelpdeskLogin = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
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
      const res = await fetch("/helpdesk/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": decodeURIComponent(csrfToken || ""),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          remember: form.remember
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setForm((prev) => ({
          ...prev,
          errors: data.errors || { credentials: data.message || "Login failed." },
          processing: false
        }));
      } else {
        window.location.href = data.redirect || "/helpdesk";
      }
    } catch (err) {
      setForm((prev) => ({
        ...prev,
        errors: { credentials: "Network error. Please try again." },
        processing: false
      }));
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center gap-3 mb-4", children: /* @__PURE__ */ jsx("div", { className: "p-3 bg-purple-500/20 rounded-xl", children: /* @__PURE__ */ jsx(Ticket, { className: "w-8 h-8 text-purple-400" }) }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-white", children: "Support Portal" }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-400 mt-2", children: "Sign in to access your tickets and projects" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-8", children: [
      form.errors.credentials && /* @__PURE__ */ jsx("div", { className: "mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm", children: form.errors.credentials }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-slate-300 mb-2", children: "Email" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "email",
              name: "email",
              type: "email",
              required: true,
              autoFocus: true,
              autoComplete: "email",
              value: form.email,
              onChange: handleChange,
              className: `w-full px-4 py-3 bg-slate-900 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 ${form.errors.email ? "border-red-500" : "border-slate-700"}`,
              placeholder: "you@example.com"
            }
          ),
          form.errors.email && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-red-400", children: form.errors.email })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-slate-300 mb-2", children: "Password" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "password",
              name: "password",
              type: "password",
              required: true,
              autoComplete: "current-password",
              value: form.password,
              onChange: handleChange,
              className: `w-full px-4 py-3 bg-slate-900 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 ${form.errors.password ? "border-red-500" : "border-slate-700"}`,
              placeholder: "••••••••"
            }
          ),
          form.errors.password && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-red-400", children: form.errors.password })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "remember",
              name: "remember",
              type: "checkbox",
              checked: form.remember,
              onChange: handleChange,
              className: "w-4 h-4 bg-slate-900 border-slate-700 rounded text-purple-500 focus:ring-purple-500"
            }
          ),
          /* @__PURE__ */ jsx("label", { htmlFor: "remember", className: "ml-2 text-sm text-slate-400", children: "Remember me" })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: form.processing,
            className: "w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-medium rounded-lg transition",
            children: form.processing ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "w-5 h-5 animate-spin" }),
              "Signing in..."
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(LogIn, { className: "w-5 h-5" }),
              "Sign In"
            ] })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-6 text-center text-slate-500 text-sm", children: /* @__PURE__ */ jsxs("p", { children: [
      "Are you an administrator?",
      " ",
      /* @__PURE__ */ jsx("a", { href: "/admin/login", className: "text-purple-400 hover:text-purple-300 transition", children: "Sign in here" })
    ] }) })
  ] }) });
};
const __vite_glob_0_47 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: HelpdeskLogin
}, Symbol.toStringTag, { value: "Module" }));
const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    errors: {},
    processing: false,
    success: false
  });
  useEffect(() => {
    fetchProfile();
  }, []);
  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/helpdesk/user/profile", {
        credentials: "same-origin"
      });
      if (res.status === 401) {
        window.location.href = "/helpdesk/login";
        return;
      }
      if (res.status === 403) {
        const data2 = await res.json();
        if (data2.redirect) {
          navigate(data2.redirect);
          return;
        }
      }
      const data = await res.json();
      setProfile(data);
      setForm((prev) => ({
        ...prev,
        name: data.name,
        email: data.email
      }));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setLoading(false);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      errors: { ...prev.errors, [name]: null },
      success: false
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setForm((prev) => ({ ...prev, processing: true, errors: {}, success: false }));
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || document.cookie.split("; ").find((row) => row.startsWith("XSRF-TOKEN="))?.split("=")[1];
    try {
      const res = await fetch("/api/helpdesk/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": decodeURIComponent(csrfToken || ""),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
          name: form.name,
          email: form.email
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setForm((prev) => ({
          ...prev,
          errors: data.errors || { general: data.message || "Failed to update profile." },
          processing: false
        }));
      } else {
        setProfile(data.data);
        setForm((prev) => ({
          ...prev,
          processing: false,
          success: true
        }));
      }
    } catch (err) {
      setForm((prev) => ({
        ...prev,
        errors: { general: "Network error. Please try again." },
        processing: false
      }));
    }
  };
  const handleLogout = async () => {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || document.cookie.split("; ").find((row) => row.startsWith("XSRF-TOKEN="))?.split("=")[1];
    try {
      await fetch("/helpdesk/logout", {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": decodeURIComponent(csrfToken || ""),
          "Accept": "application/json"
        },
        credentials: "same-origin"
      });
      window.location.href = "/helpdesk/login";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 text-purple-400 animate-spin" }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 px-4 py-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/helpdesk",
          className: "inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
            "Back to Dashboard"
          ]
        }
      ),
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-white", children: "Profile Settings" }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-400 mt-1", children: "Manage your account information" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl border border-slate-700 p-8 mb-6", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold text-white mb-6 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(User, { className: "w-5 h-5 text-purple-400" }),
        "Personal Information"
      ] }),
      form.success && /* @__PURE__ */ jsx("div", { className: "mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-green-400", children: [
        /* @__PURE__ */ jsx(CheckCircle, { className: "w-5 h-5" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Profile updated successfully!" })
      ] }) }),
      form.errors.general && /* @__PURE__ */ jsx("div", { className: "mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm", children: form.errors.general }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-slate-300 mb-2", children: "Name" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(User, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                id: "name",
                name: "name",
                value: form.name,
                onChange: handleChange,
                className: "w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                placeholder: "Your name"
              }
            )
          ] }),
          form.errors.name && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-400", children: form.errors.name[0] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-slate-300 mb-2", children: "Email Address" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                id: "email",
                name: "email",
                value: form.email,
                onChange: handleChange,
                className: "w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                placeholder: "your@email.com"
              }
            )
          ] }),
          form.errors.email && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-400", children: form.errors.email[0] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: form.processing,
            className: "py-2.5 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-medium rounded-lg transition-colors flex items-center gap-2",
            children: form.processing ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }),
              "Saving..."
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
              "Save Changes"
            ] })
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl border border-slate-700 p-8 mb-6", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold text-white mb-6 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Key, { className: "w-5 h-5 text-purple-400" }),
        "Security"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-white font-medium", children: "Password" }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-sm", children: "Change your account password" })
        ] }),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/helpdesk/change-password",
            className: "py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm",
            children: "Change Password"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl border border-red-500/20 p-8", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold text-white mb-6 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(LogOut, { className: "w-5 h-5 text-red-400" }),
        "Session"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-white font-medium", children: "Log Out" }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-sm", children: "Sign out of your account" })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleLogout,
            className: "py-2 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg transition-colors text-sm",
            children: "Log Out"
          }
        )
      ] })
    ] })
  ] }) });
};
const __vite_glob_0_48 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Profile
}, Symbol.toStringTag, { value: "Module" }));
const StatCard = ({ icon: Icon, label, value, color, link }) => {
  const Wrapper = link ? Link : "div";
  const wrapperProps = link ? { to: link } : {};
  return /* @__PURE__ */ jsx(
    Wrapper,
    {
      ...wrapperProps,
      className: `bg-slate-800/50 border border-slate-700 rounded-xl p-4 ${link ? "hover:border-slate-600 transition cursor-pointer" : ""}`,
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: `p-2 rounded-lg ${color}`, children: /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: label }),
          /* @__PURE__ */ jsx("p", { className: "text-xl font-bold", children: value })
        ] })
      ] })
    }
  );
};
const getStatusColor = (slug) => {
  switch (slug) {
    case "open":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "in_progress":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "pending":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "resolved":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "closed":
      return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
};
const getPriorityColor = (slug) => {
  switch (slug) {
    case "critical":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "high":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "medium":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "low":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
};
function UserProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/helpdesk/user/projects/${projectId}`, {
          credentials: "include"
        });
        if (response.status === 401) {
          navigate("/helpdesk/login");
          return;
        }
        if (response.status === 403) {
          setError("You do not have access to this project");
          setLoading(false);
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch project");
        }
        const result = await response.json();
        setProject(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId, navigate]);
  const handleLogout = async () => {
    try {
      await fetch("/helpdesk/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
        }
      });
      window.location.href = "/helpdesk/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "text-slate-400", children: "Loading project..." }) });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white", children: [
      /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-6 py-4 flex items-center justify-between", children: /* @__PURE__ */ jsxs(Link, { to: "/helpdesk", className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(Ticket, { className: "w-6 h-6 text-purple-400" }),
        /* @__PURE__ */ jsx("span", { className: "font-semibold text-lg", children: "Support Center" })
      ] }) }) }),
      /* @__PURE__ */ jsx("main", { className: "container mx-auto px-6 py-8", children: /* @__PURE__ */ jsx("div", { className: "max-w-4xl mx-auto text-center", children: /* @__PURE__ */ jsxs("div", { className: "bg-red-500/10 border border-red-500/30 rounded-xl p-8", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-red-400 mx-auto mb-4" }),
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-2", children: "Error" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-400 mb-4", children: error }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/helpdesk",
            className: "inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
              "Back to Dashboard"
            ]
          }
        )
      ] }) }) })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsxs(Link, { to: "/helpdesk", className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(Ticket, { className: "w-6 h-6 text-purple-400" }),
        /* @__PURE__ */ jsx("span", { className: "font-semibold text-lg", children: "Support Center" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("nav", { className: "flex items-center gap-6", children: [
          /* @__PURE__ */ jsx(Link, { to: "/helpdesk/tickets", className: "text-slate-300 hover:text-white transition", children: "My Tickets" }),
          project?.permissions?.can_create_ticket && /* @__PURE__ */ jsxs(
            Link,
            {
              to: `/helpdesk/tickets/create?project=${projectId}`,
              className: "text-slate-300 hover:text-white transition flex items-center gap-1",
              children: [
                /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
                "New Ticket"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleLogout,
            className: "flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition",
            children: [
              /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" }),
              "Logout"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("main", { className: "container mx-auto px-6 py-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/helpdesk",
            className: "inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
              "Back to Dashboard"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-12 h-12 rounded-xl flex items-center justify-center",
              style: { backgroundColor: `${project?.color || "#3b82f6"}20` },
              children: /* @__PURE__ */ jsx(
                FolderOpen,
                {
                  className: "w-6 h-6",
                  style: { color: project?.color || "#3b82f6" }
                }
              )
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold", children: project?.name }),
            project?.description && /* @__PURE__ */ jsx("p", { className: "text-slate-400 mt-1", children: project.description })
          ] })
        ] }),
        project?.role_label && /* @__PURE__ */ jsx("span", { className: "mt-3 inline-block px-3 py-1 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-lg text-sm", children: project.role_label })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-8", children: [
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: Ticket,
            label: "Total Tickets",
            value: project?.stats?.total || 0,
            color: "bg-purple-600",
            link: `/helpdesk/tickets?project=${projectId}`
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: AlertCircle,
            label: "Open",
            value: project?.stats?.open || 0,
            color: "bg-amber-500",
            link: `/helpdesk/tickets?project=${projectId}&status=open`
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: Clock,
            label: "In Progress",
            value: project?.stats?.in_progress || 0,
            color: "bg-blue-500",
            link: `/helpdesk/tickets?project=${projectId}&status=in_progress`
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: CheckCircle2,
            label: "Resolved",
            value: project?.stats?.resolved || 0,
            color: "bg-green-500",
            link: `/helpdesk/tickets?project=${projectId}&status=resolved`
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Recent Tickets" }),
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: `/helpdesk/tickets?project=${projectId}`,
              className: "text-sm text-purple-400 hover:text-purple-300 transition flex items-center gap-1",
              children: [
                "View All",
                /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
              ]
            }
          )
        ] }),
        project?.recent_tickets?.length > 0 ? /* @__PURE__ */ jsx("div", { className: "divide-y divide-slate-700", children: project.recent_tickets.map((ticket) => /* @__PURE__ */ jsx(
          Link,
          {
            to: `/helpdesk/tickets/${ticket.id}`,
            className: "block py-4 first:pt-0 last:pb-0 hover:bg-slate-700/30 -mx-2 px-2 rounded-lg transition",
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                  /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-500 font-mono", children: [
                    "#",
                    ticket.number || ticket.id
                  ] }),
                  /* @__PURE__ */ jsx("h3", { className: "font-medium truncate", children: ticket.title })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-sm", children: [
                  ticket.status && /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: `px-2 py-0.5 rounded border text-xs ${getStatusColor(ticket.status.slug)}`,
                      children: ticket.status.title
                    }
                  ),
                  ticket.priority && /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: `px-2 py-0.5 rounded border text-xs ${getPriorityColor(ticket.priority.slug)}`,
                      children: ticket.priority.title
                    }
                  ),
                  ticket.assignee && /* @__PURE__ */ jsxs("span", { className: "text-slate-400 flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(User, { className: "w-3 h-3" }),
                    ticket.assignee.name
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-right text-sm text-slate-500", children: new Date(ticket.created_at).toLocaleDateString() })
            ] })
          },
          ticket.id
        )) }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-slate-400", children: [
          /* @__PURE__ */ jsx(Ticket, { className: "w-12 h-12 mx-auto mb-3 opacity-50" }),
          /* @__PURE__ */ jsx("p", { className: "mb-4", children: "No tickets yet" }),
          project?.permissions?.can_create_ticket && /* @__PURE__ */ jsxs(
            Link,
            {
              to: `/helpdesk/tickets/create?project=${projectId}`,
              className: "inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition",
              children: [
                /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
                "Create a Ticket"
              ]
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
const __vite_glob_0_49 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: UserProjectDetail
}, Symbol.toStringTag, { value: "Module" }));
function HelpdeskUserTicketDetail() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [commentKey, setCommentKey] = useState(0);
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [commentFiles, setCommentFiles] = useState([]);
  const fileInputRef = useRef(null);
  const commentFileInputRef = useRef(null);
  const ticketUpload = useFileUpload();
  const commentUpload = useFileUpload();
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [editingCommentSubmitting, setEditingCommentSubmitting] = useState(false);
  const [editingTicket, setEditingTicket] = useState(false);
  const [editingTicketTitle, setEditingTicketTitle] = useState("");
  const [editingTicketContent, setEditingTicketContent] = useState("");
  const [editingTicketSubmitting, setEditingTicketSubmitting] = useState(false);
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`/api/helpdesk/user/tickets/${ticketId}`, {
          credentials: "include"
        });
        if (response.status === 401) {
          navigate("/admin/login");
          return;
        }
        if (response.status === 403) {
          setError("You do not have access to this ticket");
          setLoading(false);
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch ticket");
        }
        const result = await response.json();
        setTicket(result.data);
        if (result.data.project?.id) {
          const refRes = await fetch(`/api/helpdesk/user/projects/${result.data.project.id}/reference-data`, {
            credentials: "include"
          });
          const refData = await refRes.json();
          setStatuses(refData.data?.statuses || []);
          setPriorities(refData.data?.priorities || []);
          setAssignees(refData.data?.assignees || []);
        }
        const attachRes = await fetch(`/api/helpdesk/user/tickets/${ticketId}/attachments`, {
          credentials: "include"
        });
        if (attachRes.ok) {
          const attachData = await attachRes.json();
          setAttachments(attachData.data || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [ticketId, navigate]);
  const handleLogout = async () => {
    try {
      await fetch("/helpdesk/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
        }
      });
      window.location.href = "/helpdesk/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  const [uploadingTicketFiles, setUploadingTicketFiles] = useState([]);
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const { validFiles } = validateFiles(files, attachments.length);
    if (validFiles.length === 0) return;
    setUploadingTicketFiles(validFiles);
    ticketUpload.reset();
    try {
      const result = await ticketUpload.upload(
        `/api/helpdesk/user/tickets/${ticketId}/attachments`,
        validFiles
      );
      if (result.data.length > 0) {
        setAttachments((prev) => [...prev, ...result.data]);
      }
    } catch (err) {
      console.error("Failed to upload files:", err);
    } finally {
      setUploadingTicketFiles([]);
      ticketUpload.reset();
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  const handleDeleteAttachment = async (attachmentId) => {
    if (!confirm("Are you sure you want to delete this attachment?")) return;
    try {
      const response = await fetch(`/api/helpdesk/user/attachments/${attachmentId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
        }
      });
      if (response.ok) {
        setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      }
    } catch (err) {
      console.error("Failed to delete attachment:", err);
    }
  };
  const handleCommentFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const { validFiles } = validateFiles(files, commentFiles.length);
    setCommentFiles((prev) => [...prev, ...validFiles]);
    if (commentFileInputRef.current) commentFileInputRef.current.value = "";
  };
  const removeCommentFile = (index) => {
    setCommentFiles((prev) => prev.filter((_, i) => i !== index));
  };
  const uploadCommentAttachments = async (commentId) => {
    if (commentFiles.length === 0) return [];
    try {
      const result = await commentUpload.upload(
        `/api/helpdesk/user/comments/${commentId}/attachments`,
        commentFiles
      );
      return result.data || [];
    } catch (err) {
      console.error("Failed to upload comment attachments:", err);
    }
    return [];
  };
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() && commentFiles.length === 0) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/helpdesk/user/tickets/${ticketId}/comments`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
        },
        body: JSON.stringify({
          content: newComment || "(attachment)",
          is_internal: isInternal
        })
      });
      if (response.ok) {
        const result = await response.json();
        let newCommentData = result.data;
        if (commentFiles.length > 0) {
          const uploadedAttachments = await uploadCommentAttachments(newCommentData.id);
          newCommentData = {
            ...newCommentData,
            attachments: [...newCommentData.attachments || [], ...uploadedAttachments]
          };
        }
        setTicket((prev) => ({
          ...prev,
          comments: [...prev.comments || [], newCommentData]
        }));
        setNewComment("");
        setCommentKey((k) => k + 1);
        setIsInternal(false);
        setCommentFiles([]);
        commentUpload.reset();
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setSubmitting(false);
    }
  };
  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
  };
  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent("");
  };
  const handleSaveComment = async (commentId) => {
    if (!editingCommentContent.trim()) return;
    setEditingCommentSubmitting(true);
    try {
      const response = await fetch(`/api/helpdesk/user/comments/${commentId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
        },
        body: JSON.stringify({ content: editingCommentContent })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update comment");
      }
      const data = await response.json();
      setTicket((prev) => ({
        ...prev,
        comments: prev.comments.map((c) => c.id === commentId ? data.data : c)
      }));
      setEditingCommentId(null);
      setEditingCommentContent("");
    } catch (err) {
      alert("Failed to update comment: " + err.message);
    } finally {
      setEditingCommentSubmitting(false);
    }
  };
  const handleDeleteComment = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      const response = await fetch(`/api/helpdesk/user/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete comment");
      }
      setTicket((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c.id !== commentId)
      }));
    } catch (err) {
      alert("Failed to delete comment: " + err.message);
    }
  };
  const handleEditTicket = () => {
    setEditingTicket(true);
    setEditingTicketTitle(ticket?.title || "");
    setEditingTicketContent(ticket?.content || "");
  };
  const handleCancelEditTicket = () => {
    setEditingTicket(false);
    setEditingTicketTitle("");
    setEditingTicketContent("");
  };
  const handleSaveTicket = async () => {
    if (!editingTicketTitle.trim()) return;
    setEditingTicketSubmitting(true);
    try {
      const response = await fetch(`/api/helpdesk/user/tickets/${ticketId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
        },
        body: JSON.stringify({
          title: editingTicketTitle,
          content: editingTicketContent
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update ticket");
      }
      const data = await response.json();
      setTicket((prev) => ({ ...prev, ...data.data }));
      setEditingTicket(false);
      setEditingTicketTitle("");
      setEditingTicketContent("");
    } catch (err) {
      alert("Failed to update ticket: " + err.message);
    } finally {
      setEditingTicketSubmitting(false);
    }
  };
  const handleUpdateTicket = async (field, value) => {
    try {
      const response = await fetch(`/api/helpdesk/user/tickets/${ticketId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
        },
        body: JSON.stringify({ [field]: value })
      });
      if (response.ok) {
        const result = await response.json();
        setTicket((prev) => ({ ...prev, ...result.data }));
      }
    } catch (err) {
      console.error("Failed to update ticket:", err);
    }
  };
  const EditCountdown = ({ seconds }) => {
    const [remaining, setRemaining] = useState(seconds);
    useEffect(() => {
      if (remaining <= 0) return;
      const timer = setInterval(() => {
        setRemaining((prev) => Math.max(0, prev - 1));
      }, 1e3);
      return () => clearInterval(timer);
    }, [remaining]);
    if (remaining <= 0) return null;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-500 flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(Timer, { className: "w-3 h-3" }),
      mins,
      ":",
      secs.toString().padStart(2, "0")
    ] });
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "text-slate-400", children: "Loading ticket..." }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 mx-auto mb-4 text-red-400" }),
      /* @__PURE__ */ jsx("p", { className: "text-red-400 mb-4", children: error }),
      /* @__PURE__ */ jsx(Link, { to: "/helpdesk/tickets", className: "text-purple-400 hover:text-purple-300", children: "Back to Tickets" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { to: "/helpdesk/tickets", className: "text-slate-400 hover:text-white transition", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Ticket, { className: "w-6 h-6 text-purple-400" }),
          /* @__PURE__ */ jsxs("span", { className: "font-semibold text-lg", children: [
            "#",
            ticket.number
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleLogout,
          className: "flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition",
          children: [
            /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" }),
            "Logout"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("main", { className: "container mx-auto px-6 py-8", children: /* @__PURE__ */ jsx("div", { className: "max-w-6xl mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: editingTicket ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-2", children: "Title" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: editingTicketTitle,
                onChange: (e) => setEditingTicketTitle(e.target.value),
                className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-2", children: "Description" }),
            /* @__PURE__ */ jsx(
              LexicalMarkdownEditor,
              {
                value: editingTicketContent,
                onChange: setEditingTicketContent,
                placeholder: "Ticket description..."
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleSaveTicket,
                disabled: editingTicketSubmitting || !editingTicketTitle.trim(),
                className: "px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50",
                children: editingTicketSubmitting ? "Saving..." : "Save Changes"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleCancelEditTicket,
                className: "px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition",
                children: "Cancel"
              }
            )
          ] })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-2", children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: ticket.title }),
            ticket.permissions?.can_update && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleEditTicket,
                className: "p-2 text-slate-400 hover:text-purple-400 transition",
                title: "Edit ticket",
                children: /* @__PURE__ */ jsx(Edit2, { className: "w-5 h-5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm text-slate-400 mb-6", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(User, { className: "w-4 h-4" }),
              ticket.submitter?.name || "Unknown"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
              new Date(ticket.created_at).toLocaleString()
            ] })
          ] }),
          /* @__PURE__ */ jsx(Markdown, { children: ticket.content })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Paperclip, { className: "w-5 h-5" }),
              "Attachments (",
              attachments.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  ref: fileInputRef,
                  type: "file",
                  multiple: true,
                  onChange: handleFileUpload,
                  accept: "image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv",
                  className: "hidden"
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => fileInputRef.current?.click(),
                  disabled: ticketUpload.isUploading,
                  className: "flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition disabled:opacity-50",
                  children: [
                    /* @__PURE__ */ jsx(Paperclip, { className: "w-4 h-4" }),
                    ticketUpload.isUploading ? "Uploading..." : "Add Files"
                  ]
                }
              )
            ] })
          ] }),
          ticketUpload.isUploading && uploadingTicketFiles.length > 0 && /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(
            FileUploadProgress,
            {
              files: uploadingTicketFiles,
              fileProgress: ticketUpload.fileProgress,
              isUploading: ticketUpload.isUploading,
              onCancel: ticketUpload.cancel
            }
          ) }),
          attachments.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: attachments.map((attachment) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex items-center gap-3 bg-slate-700/50 rounded-lg px-4 py-3",
              children: [
                attachment.is_image ? /* @__PURE__ */ jsx(Image, { className: "w-5 h-5 text-blue-400" }) : /* @__PURE__ */ jsx(FileText, { className: "w-5 h-5 text-amber-400" }),
                /* @__PURE__ */ jsx("span", { className: "flex-1 truncate", children: attachment.filename }),
                /* @__PURE__ */ jsx("span", { className: "text-sm text-slate-400", children: attachment.human_size }),
                /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: attachment.url,
                    className: "text-purple-400 hover:text-purple-300 transition",
                    title: "Download",
                    children: /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => handleDeleteAttachment(attachment.id),
                    className: "text-slate-400 hover:text-red-400 transition",
                    title: "Delete",
                    children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
                  }
                )
              ]
            },
            attachment.id
          )) }) : /* @__PURE__ */ jsx("p", { className: "text-center text-slate-500 py-4", children: "No attachments" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "w-5 h-5" }),
            "Comments (",
            ticket.comments?.length || 0,
            ")"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-4 mb-6", children: ticket.comments?.length > 0 ? ticket.comments.map((comment) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: `p-4 rounded-lg ${comment.is_internal ? "bg-amber-900/20 border border-amber-700/50" : "bg-slate-700/50"}`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-medium", children: comment.user?.name }),
                    comment.is_internal && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 px-2 py-0.5 bg-amber-600 text-xs rounded", children: [
                      /* @__PURE__ */ jsx(Lock, { className: "w-3 h-3" }),
                      "Internal"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                    comment.can_modify && comment.edit_window_seconds > 0 && /* @__PURE__ */ jsx(EditCountdown, { seconds: comment.edit_window_seconds }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm text-slate-400", children: new Date(comment.created_at).toLocaleString() }),
                    comment.can_modify && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: () => handleEditComment(comment),
                          className: "p-1 text-slate-500 hover:text-purple-400 transition",
                          title: "Edit comment",
                          children: /* @__PURE__ */ jsx(Edit2, { className: "w-4 h-4" })
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "button",
                        {
                          onClick: () => handleDeleteComment(comment.id),
                          className: "p-1 text-slate-500 hover:text-red-400 transition",
                          title: "Delete comment",
                          children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
                        }
                      )
                    ] })
                  ] })
                ] }),
                editingCommentId === comment.id ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsx(
                    LexicalMarkdownEditor,
                    {
                      value: editingCommentContent,
                      onChange: setEditingCommentContent
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: () => handleSaveComment(comment.id),
                        disabled: editingCommentSubmitting,
                        className: "px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition disabled:opacity-50",
                        children: editingCommentSubmitting ? "Saving..." : "Save"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: handleCancelEditComment,
                        className: "px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition",
                        children: "Cancel"
                      }
                    )
                  ] })
                ] }) : /* @__PURE__ */ jsx(Markdown, { children: comment.content }),
                comment.attachments?.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-3 pt-3 border-t border-slate-600/50", children: /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: comment.attachments.map((attachment) => /* @__PURE__ */ jsxs(
                  "a",
                  {
                    href: attachment.url,
                    className: "flex items-center gap-2 px-3 py-1.5 bg-slate-600/50 hover:bg-slate-600 rounded-lg text-sm transition",
                    title: attachment.filename,
                    children: [
                      attachment.is_image ? /* @__PURE__ */ jsx(Image, { className: "w-4 h-4 text-blue-400" }) : /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4 text-amber-400" }),
                      /* @__PURE__ */ jsx("span", { className: "max-w-[150px] truncate", children: attachment.filename }),
                      /* @__PURE__ */ jsx(Download, { className: "w-3 h-3 text-slate-400" })
                    ]
                  },
                  attachment.id
                )) }) })
              ]
            },
            comment.id
          )) : /* @__PURE__ */ jsx("p", { className: "text-center text-slate-500 py-4", children: "No comments yet" }) }),
          ticket.permissions?.can_comment && /* @__PURE__ */ jsxs("form", { onSubmit: handleAddComment, children: [
            /* @__PURE__ */ jsx(
              LexicalMarkdownEditor,
              {
                value: newComment,
                onChange: setNewComment,
                placeholder: "Write a comment... (Markdown supported)",
                className: "mb-3"
              },
              commentKey
            ),
            commentFiles.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: commentFiles.map((file, index) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "flex items-center gap-2 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm",
                children: [
                  file.type.startsWith("image/") ? /* @__PURE__ */ jsx(Image, { className: "w-4 h-4 text-blue-400" }) : /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4 text-amber-400" }),
                  /* @__PURE__ */ jsx("span", { className: "max-w-[150px] truncate", children: file.name }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => removeCommentFile(index),
                      className: "text-slate-400 hover:text-red-400",
                      children: /* @__PURE__ */ jsx(X, { className: "w-3 h-3" })
                    }
                  )
                ]
              },
              index
            )) }),
            commentUpload.isUploading && commentFiles.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsx(
              FileUploadProgress,
              {
                files: commentFiles,
                fileProgress: commentUpload.fileProgress,
                isUploading: commentUpload.isUploading,
                onCancel: commentUpload.cancel
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                ticket.permissions?.can_internal_comment && /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: isInternal,
                      onChange: (e) => setIsInternal(e.target.checked),
                      className: "rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500"
                    }
                  ),
                  /* @__PURE__ */ jsx(Lock, { className: "w-4 h-4 text-amber-500" }),
                  "Internal note"
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      ref: commentFileInputRef,
                      type: "file",
                      multiple: true,
                      onChange: handleCommentFileSelect,
                      accept: "image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv",
                      className: "hidden"
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => commentFileInputRef.current?.click(),
                      className: "flex items-center gap-1 text-sm text-slate-400 hover:text-white transition",
                      children: [
                        /* @__PURE__ */ jsx(Paperclip, { className: "w-4 h-4" }),
                        "Attach"
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "submit",
                  disabled: !newComment.trim() && commentFiles.length === 0 || submitting || commentUpload.isUploading,
                  className: "flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition",
                  children: [
                    /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" }),
                    submitting || commentUpload.isUploading ? "Sending..." : "Send"
                  ]
                }
              )
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4", children: "Details" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Status" }),
              ticket.permissions?.can_change_status ? /* @__PURE__ */ jsx(
                "select",
                {
                  value: ticket.status?.id || "",
                  onChange: (e) => handleUpdateTicket("status_id", e.target.value),
                  className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
                  children: statuses.map((s) => /* @__PURE__ */ jsx("option", { value: s.id, children: s.title }, s.id))
                }
              ) : /* @__PURE__ */ jsx(
                "span",
                {
                  className: "inline-block px-3 py-1 rounded-full text-sm",
                  style: {
                    backgroundColor: `${ticket.status?.color}20`,
                    color: ticket.status?.color
                  },
                  children: ticket.status?.title
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Priority" }),
              ticket.permissions?.can_change_priority ? /* @__PURE__ */ jsx(
                "select",
                {
                  value: ticket.priority?.id || "",
                  onChange: (e) => handleUpdateTicket("priority_id", e.target.value),
                  className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
                  children: priorities.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, children: p.title }, p.id))
                }
              ) : /* @__PURE__ */ jsx(
                "span",
                {
                  className: "inline-block px-3 py-1 rounded-full text-sm",
                  style: {
                    backgroundColor: `${ticket.priority?.color}20`,
                    color: ticket.priority?.color
                  },
                  children: ticket.priority?.title
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Assigned To" }),
              ticket.permissions?.can_assign && assignees.length > 0 ? /* @__PURE__ */ jsxs(
                "select",
                {
                  value: ticket.assignee?.id || "",
                  onChange: (e) => handleUpdateTicket("assignee_id", e.target.value || null),
                  className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Unassigned" }),
                    assignees.map((a) => /* @__PURE__ */ jsx("option", { value: a.id, children: a.name }, a.id))
                  ]
                }
              ) : /* @__PURE__ */ jsx("span", { className: "text-slate-300", children: ticket.assignee?.name || "Unassigned" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Project" }),
              /* @__PURE__ */ jsx(
                Link,
                {
                  to: `/helpdesk/projects/${ticket.project?.id}`,
                  className: "text-purple-400 hover:text-purple-300",
                  children: ticket.project?.name
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Submitted By" }),
              /* @__PURE__ */ jsx("p", { className: "text-slate-300", children: ticket.submitter?.name }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: ticket.submitter?.email })
            ] })
          ] })
        ] }),
        ticket.labels?.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-3", children: "Labels" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: ticket.labels.map((label) => /* @__PURE__ */ jsx(
            "span",
            {
              className: "px-2 py-1 rounded text-sm",
              style: {
                backgroundColor: `${label.color}20`,
                color: label.color
              },
              children: label.name
            },
            label.id
          )) })
        ] })
      ] })
    ] }) }) })
  ] });
}
const __vite_glob_0_50 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: HelpdeskUserTicketDetail
}, Symbol.toStringTag, { value: "Module" }));
function HelpdeskUserTicketsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({});
  const [projects, setProjects] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    priority: searchParams.get("priority") || "",
    project: searchParams.get("project") || "",
    search: searchParams.get("search") || "",
    assigned_to_me: searchParams.get("assigned_to_me") || ""
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsRes = await fetch("/api/helpdesk/user/projects", { credentials: "include" });
        if (projectsRes.status === 401) {
          navigate("/admin/login");
          return;
        }
        const projectsData = await projectsRes.json();
        setProjects(projectsData.data || []);
        if (projectsData.data?.length > 0) {
          const refRes = await fetch(`/api/helpdesk/user/projects/${projectsData.data[0].id}/reference-data`, {
            credentials: "include"
          });
          const refData = await refRes.json();
          setStatuses(refData.data?.statuses || []);
          setPriorities(refData.data?.priorities || []);
        }
      } catch (err) {
        console.error("Failed to fetch reference data:", err);
      }
    };
    fetchData();
  }, [navigate]);
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.status) params.append("status", filters.status);
        if (filters.priority) params.append("priority", filters.priority);
        if (filters.project) params.append("project", filters.project);
        if (filters.search) params.append("search", filters.search);
        if (filters.assigned_to_me) params.append("assigned_to_me", "1");
        params.append("page", searchParams.get("page") || "1");
        const response = await fetch(`/api/helpdesk/user/tickets?${params}`, {
          credentials: "include"
        });
        if (response.status === 401) {
          navigate("/admin/login");
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch tickets");
        }
        const result = await response.json();
        setTickets(result.data || []);
        setMeta(result.meta || {});
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [filters, searchParams, navigate]);
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };
  const handleLogout = async () => {
    try {
      await fetch("/helpdesk/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
        }
      });
      window.location.href = "/helpdesk/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { to: "/helpdesk", className: "text-slate-400 hover:text-white transition", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Ticket, { className: "w-6 h-6 text-purple-400" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-lg", children: "My Tickets" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/helpdesk/tickets/create",
            className: "flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              "New Ticket"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleLogout,
            className: "flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition",
            children: [
              /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" }),
              "Logout"
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("main", { className: "container mx-auto px-6 py-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
          /* @__PURE__ */ jsx(Filter, { className: "w-5 h-5 text-slate-400" }),
          /* @__PURE__ */ jsx("span", { className: "text-slate-300", children: "Filters:" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: filters.status,
              onChange: (e) => handleFilterChange("status", e.target.value),
              className: "bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "All Statuses" }),
                statuses.map((s) => /* @__PURE__ */ jsx("option", { value: s.slug, children: s.title }, s.id))
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: filters.priority,
              onChange: (e) => handleFilterChange("priority", e.target.value),
              className: "bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "All Priorities" }),
                priorities.map((p) => /* @__PURE__ */ jsx("option", { value: p.slug, children: p.title }, p.id))
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: filters.project,
              onChange: (e) => handleFilterChange("project", e.target.value),
              className: "bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "All Projects" }),
                projects.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, children: p.name }, p.id))
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "relative flex-1 min-w-[200px]", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "Search tickets...",
                value: filters.search,
                onChange: (e) => handleFilterChange("search", e.target.value),
                className: "w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              }
            )
          ] })
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-slate-400", children: "Loading tickets..." }) : error ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12 text-red-400", children: [
        "Error: ",
        error
      ] }) : tickets.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center", children: [
        /* @__PURE__ */ jsx(Ticket, { className: "w-12 h-12 mx-auto mb-4 text-slate-600" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-400 mb-4", children: "No tickets found" }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/helpdesk/tickets/create",
            className: "inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              "Create a Ticket"
            ]
          }
        )
      ] }) : /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden", children: [
        /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-slate-800", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-sm font-medium text-slate-400", children: "Ticket" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-sm font-medium text-slate-400", children: "Project" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-sm font-medium text-slate-400", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-sm font-medium text-slate-400", children: "Priority" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-sm font-medium text-slate-400", children: "Assigned" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left text-sm font-medium text-slate-400", children: "Created" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-700", children: tickets.map((ticket) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-800/50", children: [
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
              /* @__PURE__ */ jsxs(
                Link,
                {
                  to: `/helpdesk/tickets/${ticket.id}`,
                  className: "text-purple-400 hover:text-purple-300 font-medium",
                  children: [
                    "#",
                    ticket.project?.ticket_prefix,
                    "-",
                    String(ticket.number).padStart(4, "0")
                  ]
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400 truncate max-w-xs", children: ticket.title })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm", children: ticket.project?.name }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(
              "span",
              {
                className: "px-2 py-1 rounded-full text-xs font-medium",
                style: {
                  backgroundColor: `${ticket.status?.color}20`,
                  color: ticket.status?.color
                },
                children: ticket.status?.title
              }
            ) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(
              "span",
              {
                className: "px-2 py-1 rounded-full text-xs font-medium",
                style: {
                  backgroundColor: `${ticket.priority?.color}20`,
                  color: ticket.priority?.color
                },
                children: ticket.priority?.title
              }
            ) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm", children: ticket.assignee?.name || /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: "Unassigned" }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-slate-400", children: new Date(ticket.created_at).toLocaleDateString() })
          ] }, ticket.id)) })
        ] }),
        meta.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-t border-slate-700", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-sm text-slate-400", children: [
            "Page ",
            meta.current_page,
            " of ",
            meta.last_page,
            " (",
            meta.total,
            " tickets)"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                disabled: meta.current_page === 1,
                onClick: () => {
                  const params = new URLSearchParams(searchParams);
                  params.set("page", String(meta.current_page - 1));
                  setSearchParams(params);
                },
                className: "p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg",
                children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                disabled: meta.current_page === meta.last_page,
                onClick: () => {
                  const params = new URLSearchParams(searchParams);
                  params.set("page", String(meta.current_page + 1));
                  setSearchParams(params);
                },
                className: "p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg",
                children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
              }
            )
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
const __vite_glob_0_51 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: HelpdeskUserTicketsList
}, Symbol.toStringTag, { value: "Module" }));
export {
  __vite_glob_0_51 as _,
  __vite_glob_0_50 as a,
  __vite_glob_0_49 as b,
  __vite_glob_0_48 as c,
  __vite_glob_0_47 as d,
  __vite_glob_0_46 as e,
  __vite_glob_0_45 as f,
  __vite_glob_0_44 as g
};
