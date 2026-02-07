import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Loader2, Key, AlertTriangle, CheckCircle, Lock, EyeOff, Eye, LogOut, FileText, Briefcase, MessageSquare, Ticket, Sparkles, ArrowLeft, X, Plus, Upload, ExternalLink, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
const CaseStudyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const tokenRefreshInterval = useRef(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    client_name: "",
    industry: "",
    project_type: "",
    technologies: [],
    hero_image: "",
    content: "",
    metrics: [],
    is_published: false,
    order: 0,
    errors: {},
    processing: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  useEffect(() => {
    const refreshToken = async () => {
      try {
        await fetch("/sanctum/csrf-cookie", { credentials: "same-origin" });
      } catch (err) {
        console.error("Failed to refresh CSRF token:", err);
      }
    };
    refreshToken();
    tokenRefreshInterval.current = setInterval(refreshToken, 60 * 60 * 1e3);
    return () => {
      if (tokenRefreshInterval.current) {
        clearInterval(tokenRefreshInterval.current);
      }
    };
  }, []);
  useEffect(() => {
    if (isEdit) {
      fetch(`/api/admin/case-studies/${id}`).then((res) => res.json()).then((data) => {
        setForm((prev) => ({ ...prev, ...data }));
        if (data.hero_image) {
          setImagePreview(data.hero_image);
        }
      });
    }
  }, [id, isEdit]);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  const handleTechnologiesChange = (e) => {
    setForm((prev) => ({ ...prev, technologies: e.target.value }));
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setForm((prev) => ({ ...prev, hero_image: "" }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setForm((prev) => ({ ...prev, processing: true, errors: {} }));
    const url = isEdit ? `/api/admin/case-studies/${id}` : "/api/admin/case-studies";
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || document.cookie.split("; ").find((row) => row.startsWith("XSRF-TOKEN="))?.split("=")[1];
    const technologies = typeof form.technologies === "string" ? form.technologies.split(",").map((t) => t.trim()).filter(Boolean) : form.technologies;
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("slug", form.slug || "");
      formData.append("subtitle", form.subtitle || "");
      formData.append("description", form.description || "");
      formData.append("client_name", form.client_name || "");
      formData.append("industry", form.industry || "");
      formData.append("project_type", form.project_type || "");
      formData.append("technologies", JSON.stringify(technologies));
      formData.append("content", form.content);
      formData.append("metrics", JSON.stringify(form.metrics));
      formData.append("is_published", form.is_published ? "1" : "0");
      formData.append("order", form.order);
      if (imageFile) {
        formData.append("hero_image", imageFile);
      } else if (form.hero_image) {
        formData.append("hero_image_url", form.hero_image);
      }
      if (isEdit) {
        formData.append("_method", "PUT");
      }
      const res = await fetch(url, {
        method: isEdit ? "POST" : "POST",
        // Use POST for both, Laravel will handle _method
        headers: {
          "X-CSRF-TOKEN": decodeURIComponent(csrfToken || ""),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: formData
      });
      if (!res.ok) {
        if (res.status === 419) {
          await fetch("/sanctum/csrf-cookie", { credentials: "same-origin" });
          setForm((prev) => ({
            ...prev,
            errors: { general: "Your session expired. Please try submitting again." },
            processing: false
          }));
        } else {
          const data = await res.json();
          setForm((prev) => ({ ...prev, errors: data.errors || {}, processing: false }));
        }
      } else {
        navigate("/admin/case-studies");
      }
    } catch (err) {
      setForm((prev) => ({ ...prev, errors: { general: "Network error." }, processing: false }));
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-8 max-w-4xl", children: [
    /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsx("a", { href: "/admin/case-studies", className: "text-gray-400 hover:text-white text-sm", children: "← Back to Case Studies" }) }),
    /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold mb-6", children: [
      isEdit ? "Edit" : "Create",
      " Case Study"
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "title", className: "block text-sm font-medium text-gray-300 mb-2", children: [
            "Title ",
            /* @__PURE__ */ jsx("span", { className: "text-red-400", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "title",
              name: "title",
              value: form.title,
              onChange: handleChange,
              required: true,
              className: "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
            }
          ),
          form.errors.title && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-400", children: form.errors.title })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "slug", className: "block text-sm font-medium text-gray-300 mb-2", children: [
            "Slug ",
            /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "(auto-generated if empty)" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "slug",
              name: "slug",
              value: form.slug,
              onChange: handleChange,
              className: "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
            }
          ),
          form.errors.slug && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-400", children: form.errors.slug })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "subtitle", className: "block text-sm font-medium text-gray-300 mb-2", children: "Subtitle" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "subtitle",
            name: "subtitle",
            value: form.subtitle,
            onChange: handleChange,
            className: "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-gray-300 mb-2", children: "Description" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "description",
            name: "description",
            value: form.description,
            onChange: handleChange,
            rows: 3,
            className: "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "client_name", className: "block text-sm font-medium text-gray-300 mb-2", children: "Client Name" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "client_name",
              name: "client_name",
              value: form.client_name,
              onChange: handleChange,
              className: "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "industry", className: "block text-sm font-medium text-gray-300 mb-2", children: "Industry" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "industry",
              name: "industry",
              value: form.industry,
              onChange: handleChange,
              className: "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "project_type", className: "block text-sm font-medium text-gray-300 mb-2", children: "Project Type" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "project_type",
              name: "project_type",
              value: form.project_type,
              onChange: handleChange,
              className: "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { htmlFor: "technologies", className: "block text-sm font-medium text-gray-300 mb-2", children: [
          "Technologies ",
          /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "(comma-separated)" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "technologies",
            value: Array.isArray(form.technologies) ? form.technologies.join(", ") : form.technologies,
            onChange: handleTechnologiesChange,
            className: "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: "Hero Image" }),
        imagePreview ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: /* @__PURE__ */ jsxs("div", { className: "relative inline-block", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: imagePreview,
              alt: "Preview",
              className: "max-w-xs rounded-lg border border-gray-600"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: removeImage,
              className: "absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition",
              children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
            }
          )
        ] }) }) : /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              id: "hero_image",
              accept: "image/*",
              onChange: handleImageChange,
              className: "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-400", children: "Supported formats: JPG, PNG, WebP" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { htmlFor: "content", className: "block text-sm font-medium text-gray-300 mb-2", children: [
          "Content (Markdown) ",
          /* @__PURE__ */ jsx("span", { className: "text-red-400", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "content",
            name: "content",
            value: form.content,
            onChange: handleChange,
            required: true,
            rows: 12,
            className: "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 font-mono text-sm"
          }
        ),
        form.errors.content && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-400", children: form.errors.content })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "order", className: "block text-sm font-medium text-gray-300 mb-2", children: "Display Order" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "order",
              name: "order",
              type: "number",
              value: form.order,
              onChange: handleChange,
              className: "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              name: "is_published",
              type: "checkbox",
              checked: form.is_published,
              onChange: handleChange,
              className: "w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 text-purple-600"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "ml-2 text-sm text-gray-300", children: "Published" })
        ] }) })
      ] }),
      form.errors.general && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-400", children: form.errors.general }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-4", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/admin/case-studies",
            className: "px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: form.processing,
            className: "px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors",
            children: form.processing ? "Saving..." : isEdit ? "Update" : "Create"
          }
        )
      ] })
    ] })
  ] });
};
const __vite_glob_0_6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CaseStudyForm
}, Symbol.toStringTag, { value: "Module" }));
const CaseStudiesList = () => {
  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/admin/case-studies").then((res) => res.json()).then((data) => {
      setCaseStudies(data);
      setLoading(false);
    });
  }, []);
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this case study?")) return;
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || document.cookie.split("; ").find((row) => row.startsWith("XSRF-TOKEN="))?.split("=")[1];
    try {
      await fetch(`/api/admin/case-studies/${id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": decodeURIComponent(csrfToken || ""),
          "Accept": "application/json"
        },
        credentials: "same-origin"
      });
      setCaseStudies(caseStudies.filter((cs) => cs.id !== id));
    } catch (err) {
      alert("Failed to delete case study");
    }
  };
  if (loading) return /* @__PURE__ */ jsx("div", { className: "pt-32 px-6", children: "Loading..." });
  return /* @__PURE__ */ jsxs("div", { className: "pt-32 pb-12 px-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: "Case Studies" }),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: "/admin/case-studies/create",
          className: "px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center",
          children: [
            /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 4v16m8-8H4" }) }),
            "Create Case Study"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-gray-800 rounded-lg border border-gray-700 overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-gray-700/50", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Title" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Slug" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Client" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Order" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-700", children: caseStudies.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "px-6 py-8 text-center text-gray-500", children: "No case studies yet. Create one to get started." }) }) : caseStudies.map((cs) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-700/30", children: [
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-gray-300", children: cs.title }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: "font-mono text-purple-400 text-sm", children: cs.slug }) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-gray-300", children: cs.client_name || "—" }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx(
          "span",
          {
            className: `px-2 py-1 rounded text-xs font-medium ${cs.is_published ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`,
            children: cs.is_published ? "Published" : "Draft"
          }
        ) }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-gray-300", children: cs.order }),
        /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-2", children: [
          /* @__PURE__ */ jsx(
            "a",
            {
              href: `/admin/case-studies/${cs.id}/edit`,
              className: "text-blue-400 hover:text-blue-300 text-sm",
              children: "Edit"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleDelete(cs.id),
              className: "text-red-400 hover:text-red-300 text-sm",
              children: "Delete"
            }
          )
        ] }) })
      ] }, cs.id)) })
    ] }) })
  ] });
};
const __vite_glob_0_7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CaseStudiesList
}, Symbol.toStringTag, { value: "Module" }));
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
    fetch("/api/admin/profile", {
      credentials: "same-origin"
    }).then((res) => {
      if (res.status === 401) {
        window.location.href = "/admin/login";
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
      const res = await fetch("/api/admin/change-password", {
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
            navigate("/admin");
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
      ] }) : /* @__PURE__ */ jsx("p", { className: "text-slate-400 mt-2", children: "Update your admin account password" })
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
          to: "/admin",
          className: "text-sm text-purple-400 hover:text-purple-300 transition-colors",
          children: "← Back to Dashboard"
        }
      ) })
    ] })
  ] }) });
};
const __vite_glob_0_8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ChangePassword
}, Symbol.toStringTag, { value: "Module" }));
const Dashboard = () => {
  const handleLogout = async () => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      await fetch("/admin/logout", {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": csrfToken,
          "Accept": "application/json"
        },
        credentials: "same-origin"
      });
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  const adminSections = [
    {
      title: "Case Studies",
      description: "Manage portfolio case studies and client success stories",
      icon: FileText,
      link: "/admin/case-studies",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Projects",
      description: "Manage portfolio projects with screenshots and tech stacks",
      icon: Briefcase,
      link: "/admin/projects",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Discovery Sessions",
      description: "Manage AI-powered project discovery conversations and plans",
      icon: MessageSquare,
      link: "/admin/discovery",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Helpdesk",
      description: "Manage support tickets from external applications",
      icon: Ticket,
      link: "/admin/helpdesk",
      color: "from-orange-500 to-amber-500"
    },
    {
      title: "Blog Articles",
      description: "AI-powered blog with automated article generation",
      icon: Sparkles,
      link: "/admin/articles",
      color: "from-violet-500 to-purple-500"
    }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsx(Link, { to: "/", className: "flex items-center gap-3", children: /* @__PURE__ */ jsx(
        "img",
        {
          src: "/images/logo_100_h.png",
          alt: "CoreLink Logo",
          width: 400,
          height: 100,
          decoding: "async",
          loading: "lazy",
          className: "h-8 w-auto"
        }
      ) }),
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
    /* @__PURE__ */ jsx("main", { className: "container mx-auto px-6 py-12", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-12", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold mb-2", children: "Admin Dashboard" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-400", children: "Manage your CoreLink content and features" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 gap-6", children: adminSections.map((section, index) => {
        const Icon = section.icon;
        return /* @__PURE__ */ jsxs(
          Link,
          {
            to: section.link,
            className: "group relative bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 hover:border-slate-600 transition-all duration-300 overflow-hidden",
            children: [
              /* @__PURE__ */ jsx("div", { className: `absolute inset-0 bg-linear-to-br ${section.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300` }),
              /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
                /* @__PURE__ */ jsx("div", { className: `inline-flex p-4 rounded-xl bg-linear-to-br ${section.color} mb-4`, children: /* @__PURE__ */ jsx(Icon, { className: "w-8 h-8 text-white" }) }),
                /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-2 group-hover:text-white transition-colors", children: section.title }),
                /* @__PURE__ */ jsx("p", { className: "text-slate-400 group-hover:text-slate-300 transition-colors", children: section.description }),
                /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center text-sm font-medium text-slate-500 group-hover:text-blue-400 transition-colors", children: [
                  "Manage",
                  /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })
                ] })
              ] })
            ]
          },
          index
        );
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-12 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-2", children: "Welcome Back!" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-sm", children: "Use the cards above to navigate to different admin sections. Each section provides full management capabilities for its respective feature." })
      ] })
    ] }) })
  ] });
};
const __vite_glob_0_9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Dashboard
}, Symbol.toStringTag, { value: "Module" }));
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
const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleString();
};
const DiscoveryDashboard = () => {
  const [stats, setStats] = useState({
    total_invites: 0,
    active_invites: 0,
    total_sessions: 0,
    completed_sessions: 0,
    total_plans: 0
  });
  const [recentSessions, setRecentSessions] = useState([]);
  useEffect(() => {
    fetch("/admin/discovery/dashboard").then((res) => res.json()).then((data) => {
      setStats(data.stats || stats);
      setRecentSessions(data.recentSessions || []);
    });
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "pt-32 pb-12 px-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-6 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [
        /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-purple-400", children: stats.total_invites }),
        /* @__PURE__ */ jsx("div", { className: "text-gray-400 text-sm mt-1", children: "Total Invites" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [
        /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-green-400", children: stats.active_invites }),
        /* @__PURE__ */ jsx("div", { className: "text-gray-400 text-sm mt-1", children: "Active Invites" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [
        /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-blue-400", children: stats.total_sessions }),
        /* @__PURE__ */ jsx("div", { className: "text-gray-400 text-sm mt-1", children: "Total Sessions" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [
        /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-cyan-400", children: stats.completed_sessions }),
        /* @__PURE__ */ jsx("div", { className: "text-gray-400 text-sm mt-1", children: "Completed" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700", children: [
        /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-yellow-400", children: stats.total_plans }),
        /* @__PURE__ */ jsx("div", { className: "text-gray-400 text-sm mt-1", children: "Plans Generated" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-4", children: "Quick Actions" }),
      /* @__PURE__ */ jsx("div", { className: "flex space-x-4", children: /* @__PURE__ */ jsxs(
        "a",
        {
          href: "/admin/discovery/invites/create",
          className: "px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center",
          children: [
            /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 4v16m8-8H4" }) }),
            "Create New Invite"
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gray-800 rounded-lg border border-gray-700", children: [
      /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 border-b border-gray-700 flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Recent Sessions" }),
        /* @__PURE__ */ jsx("a", { href: "/admin/discovery/sessions", className: "text-purple-400 hover:text-purple-300 text-sm", children: "View All →" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "divide-y divide-gray-700", children: recentSessions.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-6 py-8 text-center text-gray-500", children: "No sessions yet. Create an invite to get started." }) : recentSessions.map((session) => /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 hover:bg-gray-700/50 transition", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
              /* @__PURE__ */ jsx("span", { className: "font-mono text-sm text-purple-400", children: session.invite_code?.code || "N/A" }),
              /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded text-xs font-medium ${statusClass(session.status)}`, children: session.status })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-gray-400 text-sm mt-1", children: session.metadata?.user_email || "No email provided" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("div", { className: "text-gray-400 text-sm", children: formatDate(session.created_at) }),
            /* @__PURE__ */ jsxs("div", { className: "text-gray-500 text-xs mt-1", children: [
              session.turn_count,
              " turns"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 flex space-x-2", children: /* @__PURE__ */ jsx(
          "a",
          {
            href: `/admin/discovery/sessions/${session.id}`,
            className: "text-blue-400 hover:underline text-xs",
            children: "View Session"
          }
        ) })
      ] }, session.id)) })
    ] })
  ] });
};
const __vite_glob_0_16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: DiscoveryDashboard
}, Symbol.toStringTag, { value: "Module" }));
function ProjectForm({ project: propProject }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState(propProject);
  const [isLoading, setIsLoading] = useState(!!id && !propProject);
  const isEditing = !!project || !!id;
  const [formData, setFormData] = useState({
    title: project?.title || "",
    category: project?.category || "",
    description: project?.description || "",
    features: project?.features || [""],
    tech_stack: project?.tech_stack || [""],
    link: project?.link || "",
    is_published: project?.is_published || false,
    order: project?.order || 1,
    screenshots: project?.screenshots || []
  });
  const [newScreenshots, setNewScreenshots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (id && !propProject) {
      console.log(propProject);
      const fetchProject = async () => {
        try {
          const response = await fetch(`/api/admin/projects/${id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch project");
          }
          const data = await response.json();
          setProject(data);
          setFormData({
            title: data.title || "",
            category: data.category || "",
            description: data.description || "",
            features: data.features || [""],
            tech_stack: data.tech_stack || [""],
            link: data.link || "",
            is_published: data.is_published || false,
            order: data.order || 1,
            screenshots: data.screenshots || []
          });
        } catch (err) {
          console.error("Error fetching project:", err);
          alert("Failed to load project data");
          navigate("/admin/projects");
        } finally {
          setIsLoading(false);
        }
      };
      fetchProject();
    }
  }, [id, propProject, navigate]);
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null
      }));
    }
  };
  const handleArrayChange = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };
  const addArrayItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""]
    }));
  };
  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };
  const handleScreenshotUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewScreenshots((prev) => [...prev, ...files]);
  };
  const removeNewScreenshot = (index) => {
    setNewScreenshots((prev) => prev.filter((_, i) => i !== index));
  };
  const removeExistingScreenshot = (index) => {
    setFormData((prev) => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index)
    }));
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    const validFeatures = formData.features.filter((f) => f.trim());
    if (validFeatures.length === 0) {
      newErrors.features = "At least one feature is required";
    }
    const validTechStack = formData.tech_stack.filter((t) => t.trim());
    if (validTechStack.length === 0) {
      newErrors.tech_stack = "At least one technology is required";
    }
    if (formData.order < 1) {
      newErrors.order = "Order must be at least 1";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      const cleanFormData = {
        ...formData,
        features: formData.features.filter((f) => f.trim()),
        tech_stack: formData.tech_stack.filter((t) => t.trim())
      };
      Object.keys(cleanFormData).forEach((key) => {
        if (key === "screenshots") {
          return;
        }
        if (key === "features" || key === "tech_stack") {
          submitData.append(key, JSON.stringify(cleanFormData[key]));
        } else if (key === "is_published") {
          submitData.append(key, cleanFormData[key] ? "1" : "0");
        } else {
          submitData.append(key, cleanFormData[key]);
        }
      });
      if (isEditing && formData.screenshots && formData.screenshots.length > 0) {
        submitData.append("existing_screenshots", JSON.stringify(formData.screenshots));
      }
      newScreenshots.forEach((file, index) => {
        submitData.append(`new_screenshots[${index}]`, file);
      });
      const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
      const projectId = id || project?.id;
      const url = isEditing ? `/api/admin/projects/${projectId}` : "/api/admin/projects";
      if (isEditing) {
        submitData.append("_method", "PUT");
      }
      console.log("Submitting to:", url);
      console.log("Is editing:", isEditing);
      console.log("Project ID:", projectId);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": csrfToken,
          "Accept": "application/json"
        },
        body: submitData
      });
      console.log("Response status:", response.status);
      console.log("Response content-type:", response.headers.get("content-type"));
      const responseText = await response.text();
      console.log("Response preview:", responseText.substring(0, 200));
      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e2) {
          console.error("Failed to parse error response. Full response:", responseText);
          throw new Error(`Server error (${response.status}). Check console for details.`);
        }
        console.error("Error response:", errorData);
        throw new Error(errorData.message || "Failed to save project");
      }
      const result = JSON.parse(responseText);
      console.log("Success:", result);
      navigate("/admin/projects");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Error saving project: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center py-16", children: [
      /* @__PURE__ */ jsx("div", { className: "animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" }),
      /* @__PURE__ */ jsx("p", { className: "ml-4 text-slate-400", children: "Loading project..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate("/admin/projects"),
          className: "p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors",
          children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-white", children: isEditing ? "Edit Project" : "Create Project" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-400 mt-1", children: isEditing ? "Update project information" : "Add a new project to your portfolio" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "max-w-4xl", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-white mb-6", children: "Basic Information" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-slate-400 mb-2", children: [
              "Project Title ",
              /* @__PURE__ */ jsx("span", { className: "text-red-400", children: "*" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: formData.title,
                onChange: (e) => handleInputChange("title", e.target.value),
                className: `w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${errors.title ? "border-red-500" : "border-slate-600"}`,
                placeholder: "Enter project title"
              }
            ),
            errors.title && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.title })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-slate-400 mb-2", children: [
              "Category ",
              /* @__PURE__ */ jsx("span", { className: "text-red-400", children: "*" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: formData.category,
                onChange: (e) => handleInputChange("category", e.target.value),
                className: `w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${errors.category ? "border-red-500" : "border-slate-600"}`,
                placeholder: "e.g. Web Application, Mobile App"
              }
            ),
            errors.category && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.category })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6", children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-slate-400 mb-2", children: [
            "Description ",
            /* @__PURE__ */ jsx("span", { className: "text-red-400", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: formData.description,
              onChange: (e) => handleInputChange("description", e.target.value),
              rows: 4,
              className: `w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none ${errors.description ? "border-red-500" : "border-slate-600"}`,
              placeholder: "Describe your project..."
            }
          ),
          errors.description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.description })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mt-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-400 mb-2", children: "Project Link" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "url",
                value: formData.link,
                onChange: (e) => handleInputChange("link", e.target.value),
                className: "w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500",
                placeholder: "https://example.com"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-400 mb-2", children: "Display Order" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "1",
                value: formData.order,
                onChange: (e) => handleInputChange("order", parseInt(e.target.value)),
                className: `w-full px-4 py-3 bg-slate-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${errors.order ? "border-red-500" : "border-slate-600"}`
              }
            ),
            errors.order && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.order })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: formData.is_published,
              onChange: (e) => handleInputChange("is_published", e.target.checked),
              className: "w-4 h-4 bg-slate-800 border border-slate-600 rounded focus:ring-2 focus:ring-cyan-500 text-cyan-500"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-slate-400", children: "Publish this project" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-white mb-6", children: "Features" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-3", children: formData.features.map((feature, index) => /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: feature,
              onChange: (e) => handleArrayChange("features", index, e.target.value),
              className: "flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500",
              placeholder: "Enter a feature"
            }
          ),
          formData.features.length > 1 && /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => removeArrayItem("features", index),
              className: "p-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors",
              children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
            }
          )
        ] }, index)) }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => addArrayItem("features"),
            className: "mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              "Add Feature"
            ]
          }
        ),
        errors.features && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-red-400", children: errors.features })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-white mb-6", children: "Tech Stack" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-3", children: formData.tech_stack.map((tech, index) => /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: tech,
              onChange: (e) => handleArrayChange("tech_stack", index, e.target.value),
              className: "flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500",
              placeholder: "e.g. React, Laravel, MySQL"
            }
          ),
          formData.tech_stack.length > 1 && /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => removeArrayItem("tech_stack", index),
              className: "p-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors",
              children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
            }
          )
        ] }, index)) }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => addArrayItem("tech_stack"),
            className: "mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              "Add Technology"
            ]
          }
        ),
        errors.tech_stack && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-red-400", children: errors.tech_stack })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-white mb-6", children: "Screenshots" }),
        formData.screenshots.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-slate-400 mb-3", children: "Current Screenshots" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: formData.screenshots.map((screenshot, index) => /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: screenshot,
                alt: `Screenshot ${index + 1}`,
                className: "w-full aspect-video object-cover rounded-lg border border-slate-600"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => removeExistingScreenshot(index),
                className: "absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
              }
            )
          ] }, index)) })
        ] }),
        newScreenshots.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-slate-400 mb-3", children: "New Screenshots" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: newScreenshots.map((file, index) => /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: URL.createObjectURL(file),
                alt: `New screenshot ${index + 1}`,
                className: "w-full aspect-video object-cover rounded-lg border border-slate-600"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => removeNewScreenshot(index),
                className: "absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
              }
            )
          ] }, index)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors", children: [
          /* @__PURE__ */ jsx(Upload, { className: "w-8 h-8 text-slate-400 mx-auto mb-3" }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-400 mb-3", children: "Drag and drop screenshots here, or click to select" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              multiple: true,
              accept: "image/*",
              onChange: handleScreenshotUpload,
              className: "hidden",
              id: "screenshot-upload"
            }
          ),
          /* @__PURE__ */ jsxs(
            "label",
            {
              htmlFor: "screenshot-upload",
              className: "inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer transition-colors",
              children: [
                /* @__PURE__ */ jsx(Upload, { className: "w-4 h-4" }),
                "Choose Files"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 pt-6", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: isSubmitting,
            className: `px-6 py-3 rounded-lg font-medium transition-colors ${isSubmitting ? "bg-slate-600 text-slate-400 cursor-not-allowed" : "bg-cyan-500 hover:bg-cyan-600 text-white"}`,
            children: isSubmitting ? "Saving..." : isEditing ? "Update Project" : "Create Project"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => navigate("/admin/projects"),
            className: "px-6 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg font-medium transition-colors",
            children: "Cancel"
          }
        )
      ] })
    ] }) })
  ] });
}
const __vite_glob_0_33 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ProjectForm
}, Symbol.toStringTag, { value: "Module" }));
function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useNavigate();
  useEffect(() => {
    fetchProjects();
  }, []);
  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/admin/projects");
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const togglePublished = async (projectId, currentStatus) => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken
        },
        body: JSON.stringify({
          is_published: !currentStatus
        })
      });
      if (!response.ok) {
        throw new Error("Failed to update project");
      }
      fetchProjects();
    } catch (err) {
      alert("Error updating project: " + err.message);
    }
  };
  const deleteProject = async (projectId) => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": csrfToken
        }
      });
      if (!response.ok) {
        throw new Error("Failed to delete project");
      }
      fetchProjects();
    } catch (err) {
      alert("Error deleting project: " + err.message);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-16", children: /* @__PURE__ */ jsx("div", { className: "animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" }) }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsx("div", { className: "bg-red-900/20 border border-red-500/20 rounded-lg p-4", children: /* @__PURE__ */ jsxs("p", { className: "text-red-400", children: [
      "Error: ",
      error
    ] }) }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-white", children: "Projects" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-400 mt-1", children: "Manage your portfolio projects" })
      ] }),
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/admin/projects/create",
          className: "inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
            "Add Project"
          ]
        }
      )
    ] }),
    projects.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-16", children: /* @__PURE__ */ jsxs("div", { className: "max-w-sm mx-auto", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Plus, { className: "w-8 h-8 text-slate-400" }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-white mb-2", children: "No projects yet" }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-400 mb-6", children: "Get started by creating your first project." }),
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/admin/projects/create",
          className: "inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
            "Create Project"
          ]
        }
      )
    ] }) }) : /* @__PURE__ */ jsx("div", { className: "bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-700", children: [
        /* @__PURE__ */ jsx("th", { className: "text-left py-4 px-6 text-sm font-medium text-slate-400 uppercase tracking-wide", children: "Project" }),
        /* @__PURE__ */ jsx("th", { className: "text-left py-4 px-6 text-sm font-medium text-slate-400 uppercase tracking-wide", children: "Category" }),
        /* @__PURE__ */ jsx("th", { className: "text-left py-4 px-6 text-sm font-medium text-slate-400 uppercase tracking-wide", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "text-left py-4 px-6 text-sm font-medium text-slate-400 uppercase tracking-wide", children: "Order" }),
        /* @__PURE__ */ jsx("th", { className: "text-right py-4 px-6 text-sm font-medium text-slate-400 uppercase tracking-wide", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: projects.map((project, index) => /* @__PURE__ */ jsxs(
        motion.tr,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: index * 0.05 },
          className: "border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors",
          children: [
            /* @__PURE__ */ jsx("td", { className: "py-4 px-6", children: /* @__PURE__ */ jsx("div", { className: "flex items-start gap-3", children: /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-medium text-white", children: project.title }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400 mt-1 line-clamp-2", children: project.description }),
              project.link && /* @__PURE__ */ jsxs(
                "a",
                {
                  href: project.link,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 mt-1",
                  children: [
                    /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3" }),
                    "View Live"
                  ]
                }
              )
            ] }) }) }),
            /* @__PURE__ */ jsx("td", { className: "py-4 px-6", children: /* @__PURE__ */ jsx("span", { className: "inline-block px-2 py-1 rounded-md text-xs font-medium bg-slate-800 text-cyan-500 border border-slate-700", children: project.category }) }),
            /* @__PURE__ */ jsx("td", { className: "py-4 px-6", children: /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => togglePublished(project.id, project.is_published),
                className: `inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${project.is_published ? "bg-green-900/30 text-green-400 hover:bg-green-900/50" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`,
                children: [
                  project.is_published ? /* @__PURE__ */ jsx(Eye, { className: "w-3 h-3" }) : /* @__PURE__ */ jsx(EyeOff, { className: "w-3 h-3" }),
                  project.is_published ? "Published" : "Draft"
                ]
              }
            ) }),
            /* @__PURE__ */ jsx("td", { className: "py-4 px-6", children: /* @__PURE__ */ jsx("span", { className: "text-sm text-slate-400", children: project.order }) }),
            /* @__PURE__ */ jsx("td", { className: "py-4 px-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 justify-end", children: [
              /* @__PURE__ */ jsx(
                Link,
                {
                  to: `/admin/projects/${project.id}/edit`,
                  className: "p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors",
                  title: "Edit project",
                  children: /* @__PURE__ */ jsx(Edit, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => deleteProject(project.id),
                  className: "p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors",
                  title: "Delete project",
                  children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
                }
              )
            ] }) })
          ]
        },
        project.id
      )) })
    ] }) }) })
  ] });
}
const __vite_glob_0_34 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ProjectsList
}, Symbol.toStringTag, { value: "Module" }));
export {
  __vite_glob_0_34 as _,
  __vite_glob_0_33 as a,
  __vite_glob_0_16 as b,
  __vite_glob_0_9 as c,
  __vite_glob_0_8 as d,
  __vite_glob_0_7 as e,
  __vite_glob_0_6 as f
};
