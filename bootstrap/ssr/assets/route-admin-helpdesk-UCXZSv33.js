import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import React, { forwardRef, useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link, useParams } from "react-router-dom";
import { Bold, Italic, Strikethrough, List, ListOrdered, CheckCircle, AlertCircle, Loader2, ArrowLeft, Plus, LogOut, Search, X, Paperclip, Image, FileText, Ticket, Clock, FolderOpen, Check, DollarSign, Trash2, Edit2, Send, XCircle, Download, CreditCard, Eye, Save, Filter, ChevronLeft, ChevronRight, User, Mail, MapPin, Key, RefreshCw, Copy, Settings as Settings$1, GripVertical, Pencil, MessageSquare, Lock, Unlock, Tag, Square, Play, Timer, Shield, Users, AlertTriangle, RotateCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode, INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { TRANSFORMERS, STRIKETHROUGH, $convertFromMarkdownString, $convertToMarkdownString } from "@lexical/markdown";
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from "lexical";
const ALL_TRANSFORMERS = [
  ...TRANSFORMERS,
  STRIKETHROUGH
];
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
    }
  }, []);
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);
  const formatBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  };
  const formatItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
  };
  const formatStrikethrough = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
  };
  const formatBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, void 0);
  };
  const formatNumberedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, void 0);
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex gap-1 border-b border-slate-700 pb-2 mb-2 px-3 pt-3", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: formatBold,
        className: `p-2 rounded transition-colors ${isBold ? "bg-slate-600 text-white" : "hover:bg-slate-700"}`,
        title: "Bold (Ctrl+B)",
        children: /* @__PURE__ */ jsx(Bold, { className: "w-4 h-4" })
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: formatItalic,
        className: `p-2 rounded transition-colors ${isItalic ? "bg-slate-600 text-white" : "hover:bg-slate-700"}`,
        title: "Italic (Ctrl+I)",
        children: /* @__PURE__ */ jsx(Italic, { className: "w-4 h-4" })
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: formatStrikethrough,
        className: `p-2 rounded transition-colors ${isStrikethrough ? "bg-slate-600 text-white" : "hover:bg-slate-700"}`,
        title: "Strikethrough",
        children: /* @__PURE__ */ jsx(Strikethrough, { className: "w-4 h-4" })
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "w-px bg-slate-700 mx-1" }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: formatBulletList,
        className: "p-2 hover:bg-slate-700 rounded transition-colors",
        title: "Bullet List",
        children: /* @__PURE__ */ jsx(List, { className: "w-4 h-4" })
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: formatNumberedList,
        className: "p-2 hover:bg-slate-700 rounded transition-colors",
        title: "Numbered List",
        children: /* @__PURE__ */ jsx(ListOrdered, { className: "w-4 h-4" })
      }
    )
  ] });
}
function MarkdownPlugin({ initialMarkdown, onChange }) {
  const [editor] = useLexicalComposerContext();
  const isFirstRenderRef = React.useRef(true);
  useEffect(() => {
    if (isFirstRenderRef.current && initialMarkdown) {
      isFirstRenderRef.current = false;
      editor.update(() => {
        $convertFromMarkdownString(initialMarkdown, ALL_TRANSFORMERS);
      });
    }
  }, [editor, initialMarkdown]);
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const markdown = $convertToMarkdownString(ALL_TRANSFORMERS);
        onChange(markdown);
      });
    });
  }, [editor, onChange]);
  return null;
}
const theme = {
  paragraph: "mb-1",
  text: {
    bold: "font-bold",
    italic: "italic",
    strikethrough: "line-through",
    underline: "underline"
  },
  list: {
    ul: "list-disc list-inside ml-2",
    ol: "list-decimal list-inside ml-2",
    listitem: "my-1"
  },
  link: "text-blue-400 hover:underline cursor-pointer",
  code: "bg-slate-800 text-amber-400 px-1 py-0.5 rounded text-sm font-mono"
};
const LexicalMarkdownEditor = forwardRef(({
  value = "",
  onChange,
  placeholder = "Add a comment... (Markdown supported)",
  className = ""
}, ref) => {
  const [editorKey] = useState(() => Date.now());
  const [initialValue] = useState(value);
  const handleMarkdownChange = useCallback((newMarkdown) => {
    if (onChange) {
      onChange(newMarkdown);
    }
  }, [onChange]);
  const initialConfig = {
    namespace: "MarkdownEditor",
    theme,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode
    ],
    onError: (error) => {
      console.error("Lexical error:", error);
    }
  };
  return /* @__PURE__ */ jsx(LexicalComposer, { initialConfig, children: /* @__PURE__ */ jsxs("div", { className: `bg-slate-900 rounded-lg border border-slate-700 ${className}`, children: [
    /* @__PURE__ */ jsx(ToolbarPlugin, {}),
    /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsx(
      RichTextPlugin,
      {
        contentEditable: /* @__PURE__ */ jsx(
          ContentEditable,
          {
            className: "min-h-24 px-3 pb-3 outline-none text-slate-300"
          }
        ),
        placeholder: /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-3 text-slate-500 pointer-events-none", children: placeholder })
      }
    ) }),
    /* @__PURE__ */ jsx(HistoryPlugin, {}),
    /* @__PURE__ */ jsx(ListPlugin, {}),
    /* @__PURE__ */ jsx(LinkPlugin, {}),
    /* @__PURE__ */ jsx(MarkdownShortcutPlugin, { transformers: ALL_TRANSFORMERS }),
    /* @__PURE__ */ jsx(
      MarkdownPlugin,
      {
        initialMarkdown: initialValue,
        onChange: handleMarkdownChange
      }
    )
  ] }) }, editorKey);
});
LexicalMarkdownEditor.displayName = "LexicalMarkdownEditor";
function FileUploadProgress({ files, fileProgress, isUploading, onCancel }) {
  if (!files || files.length === 0 || fileProgress.size === 0) {
    return null;
  }
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-400", children: [
        "Uploading ",
        files.length,
        " file",
        files.length !== 1 ? "s" : "",
        "…"
      ] }),
      isUploading && onCancel && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onCancel,
          className: "text-xs text-red-400 hover:text-red-300",
          children: "Cancel"
        }
      )
    ] }),
    files.map((file, index) => {
      const percent = fileProgress.get(index) ?? 0;
      const isError = percent === -1;
      const isDone = percent === 100;
      const isActive = !isError && !isDone && percent >= 0;
      return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "shrink-0 w-4", children: [
          isDone && /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4 text-green-400" }),
          isError && /* @__PURE__ */ jsx(AlertCircle, { className: "w-4 h-4 text-red-400" }),
          isActive && /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 text-blue-400 animate-spin" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-0.5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-300 truncate mr-2", children: file.name }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500 shrink-0", children: isError ? "Failed" : isDone ? formatFileSize(file.size) : `${percent}%` })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-1.5 bg-slate-700 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: `h-full rounded-full transition-all duration-300 ${isError ? "bg-red-500" : isDone ? "bg-green-500" : "bg-blue-500"}`,
              style: { width: `${isError ? 100 : Math.max(0, percent)}%` }
            }
          ) })
        ] })
      ] }, `${file.name}-${index}`);
    })
  ] });
}
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv"
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 30;
function validateFiles(files, existingCount = 0) {
  const validFiles = [];
  const errors = [];
  files.forEach((file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push(`${file.name}: Only images and documents are allowed`);
    } else if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name}: File size must not exceed 10MB`);
    } else if (existingCount + validFiles.length >= MAX_FILES) {
      errors.push(`Maximum ${MAX_FILES} files allowed`);
    } else {
      validFiles.push(file);
    }
  });
  return { validFiles, errors };
}
function uploadWithProgress(url, files, csrfToken, onProgress, abortController) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    abortController.current = xhr;
    const formData = new FormData();
    files.forEach((file) => formData.append("files[]", file));
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = Math.round(e.loaded / e.total * 100);
        onProgress(percent, e.loaded, e.total);
      }
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          resolve(null);
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });
    xhr.addEventListener("error", () => reject(new Error("Upload failed")));
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));
    xhr.open("POST", url);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("X-CSRF-TOKEN", csrfToken);
    xhr.withCredentials = true;
    xhr.send(formData);
  });
}
async function uploadFilesIndividually(url, files, csrfToken, onFileProgress, abortRef) {
  const results = [];
  const errors = [];
  for (let i = 0; i < files.length; i++) {
    try {
      const result = await uploadWithProgress(
        url,
        [files[i]],
        csrfToken,
        (percent) => onFileProgress(i, percent),
        abortRef
      );
      if (result?.data) {
        results.push(...Array.isArray(result.data) ? result.data : [result.data]);
      }
      onFileProgress(i, 100);
    } catch (err) {
      if (err.message === "Upload cancelled") {
        break;
      }
      errors.push({ file: files[i].name, error: err.message });
      onFileProgress(i, -1);
    }
  }
  return { data: results, errors };
}
function useFileUpload() {
  const [fileProgress, setFileProgress] = useState(/* @__PURE__ */ new Map());
  const [isUploading, setIsUploading] = useState(false);
  const [overallPercent, setOverallPercent] = useState(0);
  const abortRef = useRef(null);
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
  };
  const upload = useCallback(async (url, files) => {
    if (files.length === 0) {
      return { data: [], errors: [] };
    }
    setIsUploading(true);
    setOverallPercent(0);
    const initialProgress = /* @__PURE__ */ new Map();
    files.forEach((_, i) => initialProgress.set(i, 0));
    setFileProgress(new Map(initialProgress));
    const csrfToken = getCsrfToken();
    const onFileProgress = (fileIndex, percent) => {
      setFileProgress((prev) => {
        const updated = new Map(prev);
        updated.set(fileIndex, percent);
        let total = 0;
        let completed = 0;
        updated.forEach((p) => {
          total += 100;
          completed += Math.max(0, p);
        });
        setOverallPercent(total > 0 ? Math.round(completed / total * 100) : 0);
        return updated;
      });
    };
    try {
      const result = await uploadFilesIndividually(url, files, csrfToken, onFileProgress, abortRef);
      setOverallPercent(100);
      return result;
    } catch (err) {
      return { data: [], errors: [{ file: "upload", error: err.message }] };
    } finally {
      setIsUploading(false);
      abortRef.current = null;
    }
  }, []);
  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsUploading(false);
  }, []);
  const reset = useCallback(() => {
    setFileProgress(/* @__PURE__ */ new Map());
    setOverallPercent(0);
    setIsUploading(false);
  }, []);
  return { fileProgress, isUploading, overallPercent, upload, cancel, reset };
}
function AdminCreateTicket() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProjectId = searchParams.get("project");
  const [projects, setProjects] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [types, setTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [form, setForm] = useState({
    project_id: preselectedProjectId || "",
    title: "",
    content: "",
    priority_id: "",
    type_id: "",
    status_id: "",
    assignee_id: "",
    submitter_user_id: "",
    submitter_name: "",
    submitter_email: ""
  });
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const userSearchRef = useRef(null);
  const ticketUpload = useFileUpload();
  useEffect(() => {
    fetchInitialData();
  }, []);
  useEffect(() => {
    if (form.project_id) {
      fetchProjectRefData();
    }
  }, [form.project_id]);
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (userSearch.length >= 2) {
        searchUsers();
      } else {
        setUsers([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [userSearch]);
  const fetchInitialData = async () => {
    try {
      const response = await fetch("/api/helpdesk/admin/projects", {
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to fetch projects");
      const result = await response.json();
      setProjects(result.data || result || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchProjectRefData = async () => {
    try {
      const projectId = form.project_id;
      const [statusesRes, prioritiesRes, typesRes, adminsRes] = await Promise.all([
        fetch(`/api/helpdesk/admin/statuses?project_id=${projectId}`, { credentials: "same-origin" }),
        fetch(`/api/helpdesk/admin/priorities?project_id=${projectId}`, { credentials: "same-origin" }),
        fetch(`/api/helpdesk/admin/types?project_id=${projectId}`, { credentials: "same-origin" }),
        fetch("/api/helpdesk/admin/admins", { credentials: "same-origin" })
      ]);
      const [statusesJson, prioritiesJson, typesJson, adminsJson] = await Promise.all([
        statusesRes.json(),
        prioritiesRes.json(),
        typesRes.json(),
        adminsRes.json()
      ]);
      setStatuses(statusesJson.data || statusesJson || []);
      setPriorities(prioritiesJson.data || prioritiesJson || []);
      setTypes(typesJson.data || typesJson || []);
      setAdmins(adminsJson.data || adminsJson || []);
      const mediumPriority = (prioritiesJson.data || prioritiesJson || []).find((p) => p.slug === "medium");
      if (mediumPriority && !form.priority_id) {
        setForm((prev) => ({ ...prev, priority_id: String(mediumPriority.id) }));
      }
    } catch (err) {
      console.error("Failed to fetch reference data:", err);
    }
  };
  const searchUsers = async () => {
    setSearchingUsers(true);
    try {
      const response = await fetch(`/api/helpdesk/admin/users-search?q=${encodeURIComponent(userSearch)}`, {
        credentials: "same-origin"
      });
      if (response.ok) {
        const result = await response.json();
        setUsers(result.data || result || []);
        setShowUserDropdown(true);
      }
    } catch (err) {
      console.error("Failed to search users:", err);
    } finally {
      setSearchingUsers(false);
    }
  };
  const selectSubmitter = (user) => {
    setForm((prev) => ({
      ...prev,
      submitter_user_id: String(user.id),
      submitter_name: user.name,
      submitter_email: user.email
    }));
    setUserSearch(user.name);
    setShowUserDropdown(false);
  };
  const clearSubmitter = () => {
    setForm((prev) => ({
      ...prev,
      submitter_user_id: "",
      submitter_name: "",
      submitter_email: ""
    }));
    setUserSearch("");
  };
  const handleLogout = async () => {
    try {
      await fetch("/admin/logout", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
        }
      });
      window.location.href = "/admin/login";
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
      const payload = {
        project_id: parseInt(form.project_id),
        title: form.title,
        content: form.content,
        priority_id: form.priority_id ? parseInt(form.priority_id) : null,
        type_id: form.type_id ? parseInt(form.type_id) : null,
        status_id: form.status_id ? parseInt(form.status_id) : null,
        assignee_id: form.assignee_id ? parseInt(form.assignee_id) : null
      };
      if (form.submitter_user_id) {
        payload.submitter_user_id = parseInt(form.submitter_user_id);
      }
      if (form.submitter_name) {
        payload.submitter_name = form.submitter_name;
      }
      if (form.submitter_email) {
        payload.submitter_email = form.submitter_email;
      }
      const response = await fetch("/api/helpdesk/admin/tickets", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const result2 = await response.json();
        throw new Error(result2.message || "Failed to create ticket");
      }
      const result = await response.json();
      const ticketId = result.data.id;
      if (attachments.length > 0) {
        const result2 = await ticketUpload.upload(
          `/api/helpdesk/admin/tickets/${ticketId}/attachments`,
          attachments
        );
        if (result2.errors.length > 0) {
          console.error("Some files failed to upload:", result2.errors);
        }
      }
      ticketUpload.reset();
      navigate(`/admin/helpdesk/tickets/${ticketId}`);
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
      /* @__PURE__ */ jsx("p", { className: "text-slate-400 mb-4", children: "No projects exist yet. Create a project first." }),
      /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/projects/create", className: "text-purple-400 hover:text-purple-300", children: "Create Project" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/tickets", className: "text-slate-400 hover:text-white transition", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" }) }),
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
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-6", children: "Create New Ticket" }),
      error && /* @__PURE__ */ jsx("div", { className: "bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6", children: /* @__PURE__ */ jsx("p", { className: "text-red-400", children: error }) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        preselectedProjectId ? /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2", children: "Project" }),
          /* @__PURE__ */ jsx("div", { className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-slate-300", children: projects.find((p) => String(p.id) === preselectedProjectId)?.name || "Loading..." })
        ] }) : /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium mb-2", children: [
            "Project ",
            /* @__PURE__ */ jsx("span", { className: "text-red-400", children: "*" })
          ] }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: form.project_id,
              onChange: (e) => setForm((prev) => ({ ...prev, project_id: e.target.value })),
              required: true,
              className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Select a project..." }),
                projects.map((project) => /* @__PURE__ */ jsx("option", { value: project.id, children: project.name }, project.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2", children: "Submitter (on behalf of)" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                ref: userSearchRef,
                type: "text",
                value: userSearch,
                onChange: (e) => {
                  setUserSearch(e.target.value);
                  if (form.submitter_user_id && e.target.value !== form.submitter_name) {
                    clearSubmitter();
                  }
                },
                onFocus: () => userSearch.length >= 2 && setShowUserDropdown(true),
                placeholder: "Search for a user or leave blank for yourself...",
                className: "w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              }
            ),
            form.submitter_user_id && /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: clearSubmitter,
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white",
                children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
              }
            )
          ] }),
          showUserDropdown && users.length > 0 && /* @__PURE__ */ jsx("div", { className: "absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-48 overflow-auto", children: users.map((user) => /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => selectSubmitter(user),
              className: "w-full text-left px-4 py-2 hover:bg-slate-600 transition",
              children: [
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: user.name }),
                /* @__PURE__ */ jsx("div", { className: "text-sm text-slate-400", children: user.email })
              ]
            },
            user.id
          )) }),
          form.submitter_user_id && /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-400 mt-1", children: [
            "Ticket will be created on behalf of ",
            form.submitter_name,
            " (",
            form.submitter_email,
            ")"
          ] })
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
              placeholder: "Brief summary of the issue",
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
              placeholder: "Describe the issue in detail... (Markdown supported)"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2", children: "Status" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: form.status_id,
                onChange: (e) => setForm((prev) => ({ ...prev, status_id: e.target.value })),
                className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Default (Open)" }),
                  statuses.map((status) => /* @__PURE__ */ jsx("option", { value: status.id, children: status.title }, status.id))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2", children: "Priority" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: form.priority_id,
                onChange: (e) => setForm((prev) => ({ ...prev, priority_id: e.target.value })),
                className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Default (Medium)" }),
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
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2", children: "Assign To" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: form.assignee_id,
                onChange: (e) => setForm((prev) => ({ ...prev, assignee_id: e.target.value })),
                className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Unassigned" }),
                  admins.map((admin) => /* @__PURE__ */ jsx("option", { value: admin.id, children: admin.name }, admin.id))
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
              to: "/admin/helpdesk/tickets",
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
const __vite_glob_0_17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: AdminCreateTicket
}, Symbol.toStringTag, { value: "Module" }));
const HelpdeskDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetchDashboard();
  }, []);
  const fetchDashboard = async () => {
    try {
      const response = await fetch("/api/helpdesk/admin/dashboard", {
        credentials: "same-origin"
      });
      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch dashboard");
      }
      const data = await response.json();
      setDashboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
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
    } catch (error2) {
      console.error("Logout failed:", error2);
    }
  };
  const StatCard = ({ icon: Icon, label, value, color, link }) => {
    const CardContent = /* @__PURE__ */ jsx("div", { className: `bg-slate-800/50 border border-slate-700 rounded-xl p-6 ${link ? "hover:border-slate-600 transition-colors" : ""}`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: `p-3 rounded-lg ${color}`, children: /* @__PURE__ */ jsx(Icon, { className: "w-6 h-6 text-white" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-sm", children: label }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-white", children: value })
      ] })
    ] }) });
    if (link) {
      return /* @__PURE__ */ jsx(Link, { to: link, children: CardContent });
    }
    return CardContent;
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
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { to: "/admin", className: "text-slate-400 hover:text-white transition", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxs(Link, { to: "/admin/helpdesk", className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Ticket, { className: "w-6 h-6 text-purple-400" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-lg", children: "Helpdesk" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("nav", { className: "flex items-center gap-6", children: [
          /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/tickets", className: "text-slate-300 hover:text-white transition", children: "Tickets" }),
          /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/projects", className: "text-slate-300 hover:text-white transition", children: "Projects" }),
          /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/invoices", className: "text-slate-300 hover:text-white transition", children: "Invoices" }),
          /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/users", className: "text-slate-300 hover:text-white transition", children: "Users" }),
          /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/settings", className: "text-slate-300 hover:text-white transition", children: "Settings" })
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
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-2", children: "Helpdesk Dashboard" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-400", children: "Overview of support tickets across all projects" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-8", children: [
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: Ticket,
            label: "Total Tickets",
            value: dashboard?.stats?.total_tickets || 0,
            color: "bg-blue-500",
            link: "/admin/helpdesk/tickets"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: Clock,
            label: "Open",
            value: dashboard?.stats?.open_tickets || 0,
            color: "bg-yellow-500",
            link: "/admin/helpdesk/tickets?status=open"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: AlertCircle,
            label: "In Progress",
            value: dashboard?.stats?.in_progress_tickets || 0,
            color: "bg-purple-500",
            link: "/admin/helpdesk/tickets?status=in_progress"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            icon: CheckCircle,
            label: "Resolved",
            value: dashboard?.stats?.resolved_tickets || 0,
            color: "bg-green-500",
            link: "/admin/helpdesk/tickets?status=resolved"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Projects" }),
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/admin/helpdesk/projects",
              className: "text-purple-400 hover:text-purple-300 text-sm font-medium",
              children: "Manage Projects →"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-4", children: [
          dashboard?.projects?.map((project) => /* @__PURE__ */ jsxs(
            Link,
            {
              to: `/admin/helpdesk/projects/${project.id}`,
              className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors group",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
                  /* @__PURE__ */ jsx("div", { className: "p-2 rounded-lg bg-slate-700 group-hover:bg-purple-500/20 transition-colors", children: /* @__PURE__ */ jsx(FolderOpen, { className: "w-5 h-5 text-purple-400" }) }),
                  /* @__PURE__ */ jsx("h3", { className: "font-semibold text-white", children: project.name })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2 text-center", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-white", children: project.total_tickets }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400", children: "Total" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-yellow-400", children: project.open_tickets }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400", children: "Open" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-purple-400", children: project.in_progress }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400", children: "In Progress" })
                  ] })
                ] })
              ]
            },
            project.id
          )),
          (!dashboard?.projects || dashboard.projects.length === 0) && /* @__PURE__ */ jsxs("div", { className: "col-span-full text-center py-8 text-slate-500", children: [
            "No projects yet.",
            " ",
            /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/projects/create", className: "text-purple-400 hover:text-purple-300", children: "Create one" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Recent Tickets" }),
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/admin/helpdesk/tickets",
              className: "text-purple-400 hover:text-purple-300 text-sm font-medium",
              children: "View All →"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden", children: dashboard?.recent_tickets?.length > 0 ? /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-slate-700/50", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Ticket" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Project" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Priority" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Created" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-700", children: dashboard.recent_tickets.map((ticket) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-700/30", children: [
            /* @__PURE__ */ jsxs("td", { className: "px-6 py-4", children: [
              /* @__PURE__ */ jsxs(
                Link,
                {
                  to: `/admin/helpdesk/tickets/${ticket.id}`,
                  className: "text-purple-400 hover:text-purple-300 font-medium",
                  children: [
                    "#",
                    ticket.number
                  ]
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-300 truncate max-w-xs", children: ticket.title })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-slate-300", children: ticket.project?.name }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${getStatusColor$1(ticket.status?.slug)}`, children: ticket.status?.title }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${getPriorityColor$1(ticket.priority?.slug)}`, children: ticket.priority?.title }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-slate-400 text-sm", children: new Date(ticket.created_at).toLocaleDateString() })
          ] }, ticket.id)) })
        ] }) : /* @__PURE__ */ jsx("div", { className: "px-6 py-8 text-center text-slate-500", children: "No tickets yet. Tickets will appear here when external apps submit them." }) })
      ] })
    ] }) })
  ] });
};
const getStatusColor$1 = (slug) => {
  const colors = {
    open: "bg-yellow-500/20 text-yellow-400",
    in_progress: "bg-purple-500/20 text-purple-400",
    pending: "bg-orange-500/20 text-orange-400",
    resolved: "bg-green-500/20 text-green-400",
    closed: "bg-slate-500/20 text-slate-400"
  };
  return colors[slug] || "bg-slate-500/20 text-slate-400";
};
const getPriorityColor$1 = (slug) => {
  const colors = {
    low: "bg-blue-500/20 text-blue-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    high: "bg-orange-500/20 text-orange-400",
    urgent: "bg-red-500/20 text-red-400"
  };
  return colors[slug] || "bg-slate-500/20 text-slate-400";
};
const __vite_glob_0_18 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: HelpdeskDashboard
}, Symbol.toStringTag, { value: "Module" }));
const InvoiceCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);
  const [unbilledEntries, setUnbilledEntries] = useState([]);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [hourlyRates, setHourlyRates] = useState([]);
  const [invoiceSettings, setInvoiceSettings] = useState(null);
  const [formData, setFormData] = useState({
    project_id: searchParams.get("project") || "",
    client_name: "",
    client_email: "",
    client_address: "",
    invoice_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    due_date: "",
    notes: "",
    tax_rate: "0",
    discount_amount: "0",
    discount_description: "",
    credit_amount: "0",
    credit_description: "",
    custom_line_items: []
  });
  useEffect(() => {
    fetchProjects();
  }, []);
  useEffect(() => {
    if (formData.project_id) {
      setFormData((prev) => ({
        ...prev,
        client_name: "",
        client_email: "",
        client_address: ""
      }));
      fetchUnbilledEntries();
      fetchProjectSettings();
    } else {
      setUnbilledEntries([]);
      setSelectedEntries([]);
      setHourlyRates([]);
      setInvoiceSettings(null);
    }
  }, [formData.project_id]);
  useEffect(() => {
    if (invoiceSettings?.payment_terms_days && formData.invoice_date) {
      const invoiceDate = new Date(formData.invoice_date);
      invoiceDate.setDate(invoiceDate.getDate() + invoiceSettings.payment_terms_days);
      setFormData((prev) => ({
        ...prev,
        due_date: invoiceDate.toISOString().split("T")[0],
        notes: prev.notes || invoiceSettings.invoice_notes || ""
      }));
    }
  }, [invoiceSettings, formData.invoice_date]);
  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/helpdesk/admin/projects", { credentials: "same-origin" });
      const json = await response.json();
      setProjects(json.data || json);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };
  const fetchUnbilledEntries = async () => {
    try {
      const response = await fetch(`/api/helpdesk/admin/projects/${formData.project_id}/uninvoiced-time`, {
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to fetch unbilled entries");
      const json = await response.json();
      setUnbilledEntries(json.data || json);
    } catch (err) {
      console.error("Failed to fetch unbilled entries:", err);
      setUnbilledEntries([]);
    }
  };
  const fetchProjectSettings = async () => {
    try {
      const [ratesRes, settingsRes, projectRes] = await Promise.all([
        fetch(`/api/helpdesk/admin/projects/${formData.project_id}/hourly-rates`, { credentials: "same-origin" }),
        fetch(`/api/helpdesk/admin/projects/${formData.project_id}/invoice-settings`, { credentials: "same-origin" }),
        fetch(`/api/helpdesk/admin/projects/${formData.project_id}`, { credentials: "same-origin" })
      ]);
      const [ratesJson, settingsJson, projectJson] = await Promise.all([ratesRes.json(), settingsRes.json(), projectRes.json()]);
      setHourlyRates(ratesJson.data || ratesJson);
      setInvoiceSettings(settingsJson.data || settingsJson);
      const projectData = projectJson.data || projectJson;
      setFormData((prev) => ({
        ...prev,
        client_name: prev.client_name || projectData.client_name || "",
        client_email: prev.client_email || projectData.client_email || "",
        client_address: prev.client_address || projectData.client_address || ""
      }));
    } catch (err) {
      console.error("Failed to fetch project settings:", err);
    }
  };
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
  };
  const handleLogout = async () => {
    try {
      await fetch("/admin/logout", {
        method: "POST",
        headers: { "X-CSRF-TOKEN": getCsrfToken(), "Accept": "application/json" },
        credentials: "same-origin"
      });
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  const toggleEntry = (entryId) => {
    setSelectedEntries(
      (prev) => prev.includes(entryId) ? prev.filter((id) => id !== entryId) : [...prev, entryId]
    );
  };
  const toggleAllEntries = () => {
    if (selectedEntries.length === unbilledEntries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(unbilledEntries.map((e) => e.id));
    }
  };
  const getHourlyRate = (entry) => {
    const categoryId = entry.category?.id;
    if (categoryId) {
      const categoryRate = hourlyRates.find((r) => r.category?.id === categoryId);
      if (categoryRate) return parseFloat(categoryRate.rate) || 0;
    }
    const defaultRate = hourlyRates.find((r) => !r.category);
    if (defaultRate) return parseFloat(defaultRate.rate) || 0;
    if (invoiceSettings?.default_hourly_rate) {
      return parseFloat(invoiceSettings.default_hourly_rate);
    }
    return 0;
  };
  const calculateBillableMinutes = (minutes) => {
    if (!invoiceSettings) return minutes;
    const increment = invoiceSettings.billing_increment_minutes || 15;
    const minimum = invoiceSettings.minimum_billing_minutes || 0;
    let billable = Math.ceil(minutes / increment) * increment;
    if (billable < minimum && minutes > 0) {
      billable = minimum;
    }
    return billable;
  };
  const formatMinutesToHours = (minutes) => {
    const hours = minutes / 60;
    return hours.toFixed(2);
  };
  const addCustomLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      custom_line_items: [
        ...prev.custom_line_items,
        { description: "", quantity: "1", unit_price: "", unit_type: "unit" }
      ]
    }));
  };
  const updateCustomLineItem = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      custom_line_items: prev.custom_line_items.map(
        (item, i) => i === index ? { ...item, [field]: value } : item
      )
    }));
  };
  const removeCustomLineItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      custom_line_items: prev.custom_line_items.filter((_, i) => i !== index)
    }));
  };
  const calculateSubtotal = () => {
    const timeTotal = selectedEntries.reduce((sum, entryId) => {
      const entry = unbilledEntries.find((e) => e.id === entryId);
      if (!entry) return sum;
      const billableMinutes = calculateBillableMinutes(entry.minutes);
      const hours = billableMinutes / 60;
      const rate = getHourlyRate(entry);
      return sum + hours * rate;
    }, 0);
    const customTotal = formData.custom_line_items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return sum + qty * price;
    }, 0);
    return timeTotal + customTotal;
  };
  const calculateAdjustedSubtotal = () => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(formData.discount_amount) || 0;
    const credit = parseFloat(formData.credit_amount) || 0;
    return Math.max(0, subtotal - discount - credit);
  };
  const calculateTax = () => {
    const adjustedSubtotal = calculateAdjustedSubtotal();
    const taxRate = parseFloat(formData.tax_rate) || 0;
    return adjustedSubtotal * (taxRate / 100);
  };
  const calculateTotal = () => {
    return calculateAdjustedSubtotal() + calculateTax();
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount || 0);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.project_id) {
      alert("Please select a project");
      return;
    }
    if (selectedEntries.length === 0 && formData.custom_line_items.length === 0) {
      alert("Please select time entries or add custom line items");
      return;
    }
    setSubmitting(true);
    try {
      const customItems = formData.custom_line_items.filter((item) => item.description && item.unit_price).map((item) => ({
        description: item.description,
        quantity: parseFloat(item.quantity) || 1,
        rate: parseFloat(item.unit_price)
      }));
      const response = await fetch(`/api/helpdesk/admin/projects/${formData.project_id}/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
          time_entry_ids: selectedEntries,
          custom_items: customItems,
          notes: formData.notes || null,
          billing_name: formData.client_name,
          billing_email: formData.client_email,
          billing_address: formData.client_address || null,
          issue_date: formData.invoice_date,
          due_date: formData.due_date,
          tax_rate: parseFloat(formData.tax_rate) || 0,
          discount_amount: parseFloat(formData.discount_amount) || 0,
          discount_description: formData.discount_description || null,
          credit_amount: parseFloat(formData.credit_amount) || 0,
          credit_description: formData.credit_description || null
        })
      });
      if (!response.ok) {
        const data2 = await response.json();
        throw new Error(data2.message || "Failed to create invoice");
      }
      const data = await response.json();
      navigate(`/admin/helpdesk/invoices/${data.data.id}`);
    } catch (err) {
      alert("Failed to create invoice: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "text-slate-400", children: "Loading..." }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/invoices", className: "text-slate-400 hover:text-white transition", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(FileText, { className: "w-6 h-6 text-purple-400" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-lg", children: "Create Invoice" })
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
    /* @__PURE__ */ jsx("main", { className: "container mx-auto px-6 py-8", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "max-w-5xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4", children: "Project" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: formData.project_id,
            onChange: (e) => setFormData((prev) => ({ ...prev, project_id: e.target.value })),
            className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500",
            required: true,
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Select a project..." }),
              projects.map((project) => /* @__PURE__ */ jsx("option", { value: project.id, children: project.name }, project.id))
            ]
          }
        )
      ] }),
      formData.project_id && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4", children: "Client Information" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Client Name *" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: formData.client_name,
                  onChange: (e) => setFormData((prev) => ({ ...prev, client_name: e.target.value })),
                  className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500",
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Client Email *" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "email",
                  value: formData.client_email,
                  onChange: (e) => setFormData((prev) => ({ ...prev, client_email: e.target.value })),
                  className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500",
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Client Address" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: formData.client_address,
                  onChange: (e) => setFormData((prev) => ({ ...prev, client_address: e.target.value })),
                  rows: 2,
                  className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4", children: "Invoice Details" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Invoice Date *" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "date",
                  value: formData.invoice_date,
                  onChange: (e) => setFormData((prev) => ({ ...prev, invoice_date: e.target.value })),
                  className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500",
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Due Date *" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "date",
                  value: formData.due_date,
                  onChange: (e) => setFormData((prev) => ({ ...prev, due_date: e.target.value })),
                  className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500",
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Tax Rate (%)" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  step: "0.01",
                  min: "0",
                  max: "100",
                  value: formData.tax_rate,
                  onChange: (e) => setFormData((prev) => ({ ...prev, tax_rate: e.target.value })),
                  className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4", children: "Discounts & Credits" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-slate-300", children: "Discount" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Amount ($)" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    step: "0.01",
                    min: "0",
                    value: formData.discount_amount,
                    onChange: (e) => setFormData((prev) => ({ ...prev, discount_amount: e.target.value })),
                    className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Description" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: formData.discount_description,
                    onChange: (e) => setFormData((prev) => ({ ...prev, discount_description: e.target.value })),
                    placeholder: "e.g., Promotional discount",
                    className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-slate-300", children: "Credit (Prior Payment/Overpayment)" }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Amount ($)" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    step: "0.01",
                    min: "0",
                    value: formData.credit_amount,
                    onChange: (e) => setFormData((prev) => ({ ...prev, credit_amount: e.target.value })),
                    className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Description" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: formData.credit_description,
                    onChange: (e) => setFormData((prev) => ({ ...prev, credit_description: e.target.value })),
                    placeholder: "e.g., Credit from invoice #123",
                    className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-slate-700 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("h3", { className: "font-semibold flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Clock, { className: "w-5 h-5 text-purple-400" }),
              "Unbilled Time Entries"
            ] }),
            unbilledEntries.length > 0 && /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: toggleAllEntries,
                className: "text-sm text-purple-400 hover:text-purple-300",
                children: selectedEntries.length === unbilledEntries.length ? "Deselect All" : "Select All"
              }
            )
          ] }),
          unbilledEntries.length > 0 ? /* @__PURE__ */ jsx("div", { className: "divide-y divide-slate-700", children: unbilledEntries.map((entry) => {
            const isSelected = selectedEntries.includes(entry.id);
            const billableMinutes = calculateBillableMinutes(entry.minutes);
            const hours = billableMinutes / 60;
            const rate = getHourlyRate(entry);
            const amount = hours * rate;
            return /* @__PURE__ */ jsx(
              "div",
              {
                onClick: () => toggleEntry(entry.id),
                className: `p-4 cursor-pointer transition ${isSelected ? "bg-purple-500/10" : "hover:bg-slate-700/30"}`,
                children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
                  /* @__PURE__ */ jsx("div", { className: `w-5 h-5 rounded border flex items-center justify-center mt-0.5 ${isSelected ? "bg-purple-600 border-purple-600" : "border-slate-500"}`, children: isSelected && /* @__PURE__ */ jsx(Check, { className: "w-3 h-3 text-white" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                      /* @__PURE__ */ jsxs(
                        Link,
                        {
                          to: `/admin/helpdesk/tickets/${entry.ticket_id}`,
                          onClick: (e) => e.stopPropagation(),
                          className: "text-purple-400 hover:text-purple-300 text-sm",
                          children: [
                            "Ticket #",
                            entry.ticket?.number
                          ]
                        }
                      ),
                      entry.category && /* @__PURE__ */ jsx("span", { className: "text-xs px-1.5 py-0.5 bg-slate-600 rounded text-slate-300", children: entry.category.name })
                    ] }),
                    entry.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-300 truncate", children: entry.description }),
                    /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500 mt-1", children: [
                      entry.user?.name,
                      " • ",
                      new Date(entry.created_at).toLocaleDateString()
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                    /* @__PURE__ */ jsxs("div", { className: "text-sm text-slate-300", children: [
                      formatMinutesToHours(billableMinutes),
                      " hrs × ",
                      formatCurrency(rate)
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-green-400", children: formatCurrency(amount) }),
                    billableMinutes !== entry.minutes && /* @__PURE__ */ jsxs("div", { className: "text-xs text-slate-500", children: [
                      "(actual: ",
                      formatMinutesToHours(entry.minutes),
                      " hrs)"
                    ] })
                  ] })
                ] })
              },
              entry.id
            );
          }) }) : /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-slate-500", children: "No unbilled time entries for this project" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-slate-700 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("h3", { className: "font-semibold flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(DollarSign, { className: "w-5 h-5 text-purple-400" }),
              "Custom Line Items"
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: addCustomLineItem,
                className: "flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300",
                children: [
                  /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
                  "Add Item"
                ]
              }
            )
          ] }),
          formData.custom_line_items.length > 0 ? /* @__PURE__ */ jsx("div", { className: "p-4 space-y-3", children: formData.custom_line_items.map((item, index) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-3 items-start", children: [
            /* @__PURE__ */ jsx("div", { className: "col-span-5", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: item.description,
                onChange: (e) => updateCustomLineItem(index, "description", e.target.value),
                placeholder: "Description",
                className: "w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              }
            ) }),
            /* @__PURE__ */ jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                min: "0",
                value: item.quantity,
                onChange: (e) => updateCustomLineItem(index, "quantity", e.target.value),
                placeholder: "Qty",
                className: "w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              }
            ) }),
            /* @__PURE__ */ jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                min: "0",
                value: item.unit_price,
                onChange: (e) => updateCustomLineItem(index, "unit_price", e.target.value),
                placeholder: "Price",
                className: "w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              }
            ) }),
            /* @__PURE__ */ jsx("div", { className: "col-span-2 text-right text-sm text-slate-300 py-2", children: formatCurrency((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)) }),
            /* @__PURE__ */ jsx("div", { className: "col-span-1", children: /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => removeCustomLineItem(index),
                className: "p-2 text-slate-400 hover:text-red-400",
                children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
              }
            ) })
          ] }, index)) }) : /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-slate-500", children: 'No custom line items. Click "Add Item" to add one.' })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4", children: "Notes" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              value: formData.notes,
              onChange: (e) => setFormData((prev) => ({ ...prev, notes: e.target.value })),
              rows: 3,
              className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none",
              placeholder: "Payment terms, bank details, or other notes..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4", children: "Summary" }),
          /* @__PURE__ */ jsxs("dl", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("dt", { className: "text-slate-400", children: "Selected Time Entries" }),
              /* @__PURE__ */ jsx("dd", { className: "text-slate-200", children: selectedEntries.length })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("dt", { className: "text-slate-400", children: "Custom Line Items" }),
              /* @__PURE__ */ jsx("dd", { className: "text-slate-200", children: formData.custom_line_items.length })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between pt-2 border-t border-slate-700", children: [
              /* @__PURE__ */ jsx("dt", { className: "text-slate-400", children: "Subtotal" }),
              /* @__PURE__ */ jsx("dd", { className: "text-slate-200", children: formatCurrency(calculateSubtotal()) })
            ] }),
            parseFloat(formData.discount_amount) > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-orange-400", children: [
              /* @__PURE__ */ jsxs("dt", { children: [
                "Discount ",
                formData.discount_description && `(${formData.discount_description})`
              ] }),
              /* @__PURE__ */ jsxs("dd", { children: [
                "-",
                formatCurrency(parseFloat(formData.discount_amount))
              ] })
            ] }),
            parseFloat(formData.credit_amount) > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-blue-400", children: [
              /* @__PURE__ */ jsxs("dt", { children: [
                "Credit ",
                formData.credit_description && `(${formData.credit_description})`
              ] }),
              /* @__PURE__ */ jsxs("dd", { children: [
                "-",
                formatCurrency(parseFloat(formData.credit_amount))
              ] })
            ] }),
            parseFloat(formData.tax_rate) > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxs("dt", { className: "text-slate-400", children: [
                "Tax (",
                formData.tax_rate,
                "%)"
              ] }),
              /* @__PURE__ */ jsx("dd", { className: "text-slate-200", children: formatCurrency(calculateTax()) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between pt-2 border-t border-slate-700", children: [
              /* @__PURE__ */ jsx("dt", { className: "text-slate-300 font-medium", children: "Total" }),
              /* @__PURE__ */ jsx("dd", { className: "text-lg font-bold text-purple-400", children: formatCurrency(calculateTotal()) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-4", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/admin/helpdesk/invoices",
              className: "px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "submit",
              disabled: submitting || selectedEntries.length === 0 && formData.custom_line_items.length === 0,
              className: "px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition flex items-center gap-2",
              children: [
                /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" }),
                submitting ? "Creating..." : "Create Invoice"
              ]
            }
          )
        ] })
      ] })
    ] }) })
  ] });
};
const __vite_glob_0_19 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: InvoiceCreate
}, Symbol.toStringTag, { value: "Module" }));
const InvoiceDetail = () => {
  const { invoiceId } = useParams();
  useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    amount: "",
    payment_method: "manual",
    reference: "",
    notes: ""
  });
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [sending, setSending] = useState(false);
  const [resending, setResending] = useState(false);
  const [voiding, setVoiding] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, paymentId: null, reason: "", submitting: false });
  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);
  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/helpdesk/admin/invoices/${invoiceId}`, {
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to fetch invoice");
      const json = await response.json();
      setInvoice(json.data || json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
  };
  const handleLogout = async () => {
    try {
      await fetch("/admin/logout", {
        method: "POST",
        headers: { "X-CSRF-TOKEN": getCsrfToken(), "Accept": "application/json" },
        credentials: "same-origin"
      });
      window.location.href = "/admin/login";
    } catch (error2) {
      console.error("Logout failed:", error2);
    }
  };
  const handleSendInvoice = async () => {
    if (!invoice.billing_email) {
      alert("Please add a client email address before sending.");
      return;
    }
    if (!confirm("Send this invoice to " + invoice.billing_email + "?")) return;
    setSending(true);
    try {
      const response = await fetch(`/api/helpdesk/admin/invoices/${invoiceId}/send`, {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to send invoice");
      await fetchInvoice();
      alert("Invoice sent successfully!");
    } catch (err) {
      alert("Failed to send invoice: " + err.message);
    } finally {
      setSending(false);
    }
  };
  const handleResendInvoice = async () => {
    if (!invoice.billing_email) {
      alert("No client email address on this invoice.");
      return;
    }
    if (!confirm("Resend this invoice to " + invoice.billing_email + "?")) return;
    setResending(true);
    try {
      const response = await fetch(`/api/helpdesk/admin/invoices/${invoiceId}/resend`, {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to resend invoice");
      await fetchInvoice();
      alert("Invoice resent successfully!");
    } catch (err) {
      alert("Failed to resend invoice: " + err.message);
    } finally {
      setResending(false);
    }
  };
  const handleVoidInvoice = async () => {
    if (!confirm("Are you sure you want to void this invoice? This cannot be undone.")) return;
    setVoiding(true);
    try {
      const response = await fetch(`/api/helpdesk/admin/invoices/${invoiceId}/void`, {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to void invoice");
      await fetchInvoice();
    } catch (err) {
      alert("Failed to void invoice: " + err.message);
    } finally {
      setVoiding(false);
    }
  };
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setPaymentSubmitting(true);
    try {
      const response = await fetch(`/api/helpdesk/admin/invoices/${invoiceId}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
          amount: parseFloat(paymentFormData.amount),
          payment_method: paymentFormData.payment_method,
          reference: paymentFormData.reference || null,
          notes: paymentFormData.notes || null
        })
      });
      if (!response.ok) throw new Error("Failed to record payment");
      await fetchInvoice();
      setShowPaymentForm(false);
      setPaymentFormData({ amount: "", payment_method: "manual", reference: "", notes: "" });
    } catch (err) {
      alert("Failed to record payment: " + err.message);
    } finally {
      setPaymentSubmitting(false);
    }
  };
  const handleDeletePayment = async (paymentId) => {
    setDeleteModal({ open: true, paymentId, reason: "", submitting: false });
  };
  const confirmDeletePayment = async () => {
    if (deleteModal.reason.trim().length < 3) {
      alert("Please enter a reason (at least 3 characters)");
      return;
    }
    setDeleteModal((prev) => ({ ...prev, submitting: true }));
    try {
      const response = await fetch(`/api/helpdesk/admin/invoices/${invoiceId}/payments/${deleteModal.paymentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({ reason: deleteModal.reason })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete payment");
      }
      await fetchInvoice();
      setDeleteModal({ open: false, paymentId: null, reason: "", submitting: false });
    } catch (err) {
      alert("Failed to delete payment: " + err.message);
      setDeleteModal((prev) => ({ ...prev, submitting: false }));
    }
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount || 0);
  };
  const getStatusColor2 = (status) => {
    switch (status) {
      case "draft":
        return "bg-slate-500/20 text-slate-400 border-slate-500";
      case "sent":
        return "bg-blue-500/20 text-blue-400 border-blue-500";
      case "viewed":
        return "bg-purple-500/20 text-purple-400 border-purple-500";
      case "paid":
        return "bg-green-500/20 text-green-400 border-green-500";
      case "partial":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500";
      case "overdue":
        return "bg-red-500/20 text-red-400 border-red-500";
      case "voided":
        return "bg-gray-500/20 text-gray-400 border-gray-500";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500";
    }
  };
  const amountDue = invoice ? (invoice.total || 0) - (invoice.amount_paid || 0) : 0;
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "text-slate-400", children: "Loading invoice..." }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-red-400", children: [
      "Error: ",
      error
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/invoices", className: "text-slate-400 hover:text-white transition", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(FileText, { className: "w-6 h-6 text-purple-400" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-lg", children: invoice?.invoice_number }),
          /* @__PURE__ */ jsx("span", { className: `px-2 py-1 rounded text-xs font-medium border ${getStatusColor2(invoice?.status)}`, children: invoice?.status?.charAt(0).toUpperCase() + invoice?.status?.slice(1) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        invoice?.status === "draft" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: `/admin/helpdesk/invoices/${invoiceId}/edit`,
              className: "flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-sm",
              children: [
                /* @__PURE__ */ jsx(Edit2, { className: "w-4 h-4" }),
                "Edit"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: handleSendInvoice,
              disabled: sending,
              className: "flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition text-sm",
              children: [
                /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" }),
                sending ? "Sending..." : "Send Invoice"
              ]
            }
          )
        ] }),
        ["sent", "viewed", "partial", "overdue"].includes(invoice?.status) && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: handleResendInvoice,
              disabled: resending,
              className: "flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition text-sm",
              children: [
                /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" }),
                resending ? "Sending..." : "Resend"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => {
                setPaymentFormData((prev) => ({ ...prev, amount: amountDue.toFixed(2) }));
                setShowPaymentForm(true);
              },
              className: "flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition text-sm",
              children: [
                /* @__PURE__ */ jsx(DollarSign, { className: "w-4 h-4" }),
                "Record Payment"
              ]
            }
          )
        ] }),
        invoice?.status !== "voided" && invoice?.status !== "paid" && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleVoidInvoice,
            disabled: voiding,
            className: "flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition text-sm",
            children: [
              /* @__PURE__ */ jsx(XCircle, { className: "w-4 h-4" }),
              voiding ? "Voiding..." : "Void"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: `/helpdesk/invoices/${invoice?.uuid}/pdf`,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-sm",
            children: [
              /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" }),
              "PDF"
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleLogout,
            className: "flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition",
            children: /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" })
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("main", { className: "container mx-auto px-6 py-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400 mb-1", children: "Total Amount" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-slate-200", children: formatCurrency(invoice?.total) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400 mb-1", children: "Amount Paid" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-green-400", children: formatCurrency(invoice?.amount_paid) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400 mb-1", children: "Amount Due" }),
          /* @__PURE__ */ jsx("p", { className: `text-2xl font-bold ${amountDue > 0 ? "text-yellow-400" : "text-green-400"}`, children: formatCurrency(amountDue) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4 text-slate-300", children: "Client Information" }),
          /* @__PURE__ */ jsxs("dl", { className: "space-y-3 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-slate-500", children: "Name" }),
              /* @__PURE__ */ jsx("dd", { className: "text-slate-200", children: invoice?.billing_name || "-" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-slate-500", children: "Email" }),
              /* @__PURE__ */ jsx("dd", { className: "text-slate-200", children: invoice?.billing_email || "-" })
            ] }),
            invoice?.billing_address && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-slate-500", children: "Address" }),
              /* @__PURE__ */ jsx("dd", { className: "text-slate-200 whitespace-pre-line", children: invoice.billing_address })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4 text-slate-300", children: "Invoice Details" }),
          /* @__PURE__ */ jsxs("dl", { className: "space-y-3 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-slate-500", children: "Project" }),
              /* @__PURE__ */ jsx("dd", { className: "text-slate-200", children: /* @__PURE__ */ jsx(Link, { to: `/admin/helpdesk/projects/${invoice?.project?.id}`, className: "text-purple-400 hover:text-purple-300", children: invoice?.project?.name || "-" }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-slate-500", children: "Invoice Date" }),
              /* @__PURE__ */ jsx("dd", { className: "text-slate-200", children: invoice?.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : "-" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-slate-500", children: "Due Date" }),
              /* @__PURE__ */ jsx("dd", { className: `${invoice?.status === "overdue" ? "text-red-400" : "text-slate-200"}`, children: invoice?.due_date ? new Date(invoice.due_date).toLocaleDateString() : "-" })
            ] }),
            invoice?.sent_at && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-slate-500", children: "Sent" }),
              /* @__PURE__ */ jsx("dd", { className: "text-slate-200", children: new Date(invoice.sent_at).toLocaleString() })
            ] }),
            invoice?.paid_at && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-slate-500", children: "Paid" }),
              /* @__PURE__ */ jsx("dd", { className: "text-green-400", children: new Date(invoice.paid_at).toLocaleString() })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "p-4 border-b border-slate-700", children: /* @__PURE__ */ jsx("h3", { className: "font-semibold text-slate-300", children: "Line Items" }) }),
        /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-700 bg-slate-800/80", children: [
            /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-sm font-medium text-slate-400", children: "Description" }),
            /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 text-sm font-medium text-slate-400", children: "Qty" }),
            /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 text-sm font-medium text-slate-400", children: "Rate" }),
            /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 text-sm font-medium text-slate-400", children: "Amount" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-700", children: invoice?.line_items?.map((item) => /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
              /* @__PURE__ */ jsx("div", { className: "text-slate-200", children: item.description }),
              item.ticket && /* @__PURE__ */ jsxs(
                Link,
                {
                  to: `/admin/helpdesk/tickets/${item.ticket.id}`,
                  className: "text-xs text-purple-400 hover:text-purple-300",
                  children: [
                    "Ticket #",
                    item.ticket.number
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right text-slate-300", children: item.quantity }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right text-slate-300", children: formatCurrency(item.rate) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right text-slate-200 font-medium", children: formatCurrency(item.amount) })
          ] }, item.id)) }),
          /* @__PURE__ */ jsxs("tfoot", { className: "border-t border-slate-600", children: [
            /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { colSpan: "3", className: "px-4 py-3 text-right font-medium text-slate-400", children: "Subtotal" }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right text-slate-200 font-medium", children: formatCurrency(invoice?.subtotal) })
            ] }),
            invoice?.discount_amount > 0 && /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsxs("td", { colSpan: "3", className: "px-4 py-3 text-right font-medium text-orange-400", children: [
                "Discount ",
                invoice?.discount_description && `(${invoice.discount_description})`
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-right text-orange-400 font-medium", children: [
                "-",
                formatCurrency(invoice?.discount_amount)
              ] })
            ] }),
            invoice?.credit_amount > 0 && /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsxs("td", { colSpan: "3", className: "px-4 py-3 text-right font-medium text-blue-400", children: [
                "Credit ",
                invoice?.credit_description && `(${invoice.credit_description})`
              ] }),
              /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-right text-blue-400 font-medium", children: [
                "-",
                formatCurrency(invoice?.credit_amount)
              ] })
            ] }),
            invoice?.tax_amount > 0 && /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsxs("td", { colSpan: "3", className: "px-4 py-3 text-right font-medium text-slate-400", children: [
                "Tax (",
                invoice?.tax_rate,
                "%)"
              ] }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right text-slate-200 font-medium", children: formatCurrency(invoice?.tax_amount) })
            ] }),
            /* @__PURE__ */ jsxs("tr", { className: "bg-slate-700/30", children: [
              /* @__PURE__ */ jsx("td", { colSpan: "3", className: "px-4 py-3 text-right font-semibold text-slate-300", children: "Total" }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right text-lg font-bold text-purple-400", children: formatCurrency(invoice?.total) })
            ] })
          ] })
        ] })
      ] }),
      invoice?.notes && /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-3 text-slate-300", children: "Notes" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400 whitespace-pre-line", children: invoice.notes })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-slate-700 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-slate-300 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(CreditCard, { className: "w-5 h-5 text-purple-400" }),
            "Payments"
          ] }),
          ["sent", "viewed", "partial", "overdue"].includes(invoice?.status) && !showPaymentForm && /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => {
                setPaymentFormData((prev) => ({ ...prev, amount: amountDue.toFixed(2) }));
                setShowPaymentForm(true);
              },
              className: "flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300",
              children: [
                /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
                "Add Payment"
              ]
            }
          )
        ] }),
        showPaymentForm && /* @__PURE__ */ jsxs("form", { onSubmit: handleRecordPayment, className: "p-4 border-b border-slate-700 bg-slate-700/30", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Amount" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  step: "0.01",
                  min: "0.01",
                  max: amountDue,
                  value: paymentFormData.amount,
                  onChange: (e) => setPaymentFormData((prev) => ({ ...prev, amount: e.target.value })),
                  className: "w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Payment Method" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: paymentFormData.payment_method,
                  onChange: (e) => setPaymentFormData((prev) => ({ ...prev, payment_method: e.target.value })),
                  className: "w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "manual", children: "Manual/Check" }),
                    /* @__PURE__ */ jsx("option", { value: "bank_transfer", children: "Bank Transfer" }),
                    /* @__PURE__ */ jsx("option", { value: "cash", children: "Cash" }),
                    /* @__PURE__ */ jsx("option", { value: "credit_card", children: "Credit Card" }),
                    /* @__PURE__ */ jsx("option", { value: "other", children: "Other" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Reference #" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: paymentFormData.reference,
                  onChange: (e) => setPaymentFormData((prev) => ({ ...prev, reference: e.target.value })),
                  className: "w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
                  placeholder: "Check # or transaction ID"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Notes" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: paymentFormData.notes,
                  onChange: (e) => setPaymentFormData((prev) => ({ ...prev, notes: e.target.value })),
                  className: "w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
                  placeholder: "Optional notes"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                disabled: paymentSubmitting,
                className: "px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded text-sm",
                children: paymentSubmitting ? "Recording..." : "Record Payment"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowPaymentForm(false),
                className: "px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded text-sm",
                children: "Cancel"
              }
            )
          ] })
        ] }),
        invoice?.payments?.length > 0 ? /* @__PURE__ */ jsx("div", { className: "divide-y divide-slate-700", children: invoice.payments.map((payment) => /* @__PURE__ */ jsxs("div", { className: `p-4 flex items-center justify-between ${payment.is_deleted ? "opacity-50 bg-slate-800/30" : ""}`, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: `font-medium ${payment.is_deleted ? "line-through text-slate-400" : "text-green-400"}`, children: formatCurrency(payment.amount) }),
              /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 bg-slate-600 rounded text-slate-300", children: payment.method_name || payment.payment_method?.replace("_", " ") || "Unknown" }),
              payment.is_deleted && /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 bg-red-500/20 border border-red-500/50 rounded text-red-400", children: "Deleted" }),
              payment.reference_number && /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-500", children: [
                "Ref: ",
                payment.reference_number
              ] })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500 mt-1", children: [
              new Date(payment.paid_at || payment.created_at).toLocaleString(),
              payment.recorded_by && ` by ${payment.recorded_by.name}`
            ] }),
            payment.is_deleted && /* @__PURE__ */ jsxs("div", { className: "mt-2 text-xs text-red-400/80", children: [
              /* @__PURE__ */ jsxs("p", { children: [
                "Deleted ",
                payment.deleted_at && `on ${new Date(payment.deleted_at).toLocaleString()}`,
                payment.deleted_by && ` by ${payment.deleted_by}`
              ] }),
              payment.deleted_reason && /* @__PURE__ */ jsxs("p", { className: "italic mt-0.5", children: [
                "Reason: ",
                payment.deleted_reason
              ] })
            ] })
          ] }),
          !payment.is_deleted && invoice.status !== "voided" && /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleDeletePayment(payment.id),
              className: "p-2 text-slate-400 hover:text-red-400 transition",
              title: "Delete payment",
              children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
            }
          )
        ] }, payment.id)) }) : /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-slate-500", children: "No payments recorded yet" })
      ] }),
      invoice?.uuid && /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-3 text-slate-300", children: "Client View Link" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              readOnly: true,
              value: `${window.location.origin}/helpdesk/invoices/${invoice.uuid}`,
              className: "flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-slate-300"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                navigator.clipboard.writeText(`${window.location.origin}/helpdesk/invoices/${invoice.uuid}`);
                alert("Link copied to clipboard!");
              },
              className: "px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded text-sm",
              children: "Copy"
            }
          ),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: `/helpdesk/invoices/${invoice.uuid}`,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded text-sm flex items-center gap-2",
              children: [
                /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" }),
                "Preview"
              ]
            }
          )
        ] })
      ] })
    ] }) }),
    deleteModal.open && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "bg-slate-800 border border-slate-700 rounded-xl shadow-xl w-full max-w-md mx-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border-b border-slate-700", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-lg text-slate-200", children: "Delete Payment" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setDeleteModal({ open: false, paymentId: null, reason: "", submitting: false }),
            className: "text-slate-400 hover:text-white transition",
            children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400 mb-4", children: "Please provide a reason for deleting this payment. The payment will be marked as deleted but will remain visible for audit purposes." }),
        /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-300 mb-2", children: "Reason for deletion *" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: deleteModal.reason,
            onChange: (e) => setDeleteModal((prev) => ({ ...prev, reason: e.target.value })),
            className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none",
            rows: 3,
            placeholder: "e.g., Duplicate payment entry, payment was reversed by bank...",
            autoFocus: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 p-4 border-t border-slate-700", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setDeleteModal({ open: false, paymentId: null, reason: "", submitting: false }),
            disabled: deleteModal.submitting,
            className: "px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 rounded-lg text-sm transition",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: confirmDeletePayment,
            disabled: deleteModal.submitting || deleteModal.reason.trim().length < 3,
            className: "px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg text-sm transition flex items-center gap-2",
            children: deleteModal.submitting ? /* @__PURE__ */ jsx(Fragment, { children: "Deleting..." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" }),
              "Delete Payment"
            ] })
          }
        )
      ] })
    ] }) })
  ] });
};
const __vite_glob_0_20 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: InvoiceDetail
}, Symbol.toStringTag, { value: "Module" }));
const InvoiceEdit = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [formData, setFormData] = useState({
    billing_name: "",
    billing_email: "",
    billing_address: "",
    issue_date: "",
    due_date: "",
    notes: "",
    tax_rate: "0",
    discount_amount: "0",
    discount_description: "",
    credit_amount: "0",
    credit_description: ""
  });
  const [lineItems, setLineItems] = useState([]);
  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);
  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/helpdesk/admin/invoices/${invoiceId}`, {
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to fetch invoice");
      const json = await response.json();
      const inv = json.data || json;
      setInvoice(inv);
      setFormData({
        billing_name: inv.billing_name || "",
        billing_email: inv.billing_email || "",
        billing_address: inv.billing_address || "",
        issue_date: inv.issue_date || "",
        due_date: inv.due_date || "",
        notes: inv.notes || "",
        tax_rate: inv.tax_rate?.toString() || "0",
        discount_amount: inv.discount_amount?.toString() || "0",
        discount_description: inv.discount_description || "",
        credit_amount: inv.credit_amount?.toString() || "0",
        credit_description: inv.credit_description || ""
      });
      setLineItems(inv.line_items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
  };
  const handleLogout = async () => {
    try {
      await fetch("/admin/logout", {
        method: "POST",
        headers: { "X-CSRF-TOKEN": getCsrfToken(), "Accept": "application/json" },
        credentials: "same-origin"
      });
      window.location.href = "/admin/login";
    } catch (error2) {
      console.error("Logout failed:", error2);
    }
  };
  const updateLineItem = (id, field, value) => {
    setLineItems((prev) => prev.map(
      (item) => item.id === id ? { ...item, [field]: value } : item
    ));
  };
  const removeLineItem = (id) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };
  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        type: "custom",
        description: "",
        quantity: "1",
        rate: "0",
        isNew: true
      }
    ]);
  };
  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      return sum + qty * rate;
    }, 0);
  };
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = parseFloat(formData.discount_amount) || 0;
    const credit = parseFloat(formData.credit_amount) || 0;
    const taxRate = parseFloat(formData.tax_rate) || 0;
    const taxableAmount = subtotal - discount - credit;
    const tax = taxableAmount > 0 ? taxableAmount * (taxRate / 100) : 0;
    return Math.max(0, taxableAmount + tax);
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount || 0);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updatedLineItems = lineItems.map((item) => ({
        id: item.isNew ? null : item.id,
        type: item.type || "custom",
        description: item.description,
        quantity: parseFloat(item.quantity) || 0,
        rate: parseFloat(item.rate) || 0
      }));
      const response = await fetch(`/api/helpdesk/admin/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
          billing_name: formData.billing_name,
          billing_email: formData.billing_email,
          billing_address: formData.billing_address || null,
          issue_date: formData.issue_date,
          due_date: formData.due_date,
          notes: formData.notes || null,
          tax_rate: parseFloat(formData.tax_rate) || 0,
          discount_amount: parseFloat(formData.discount_amount) || 0,
          discount_description: formData.discount_description || null,
          credit_amount: parseFloat(formData.credit_amount) || 0,
          credit_description: formData.credit_description || null,
          line_items: updatedLineItems
        })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update invoice");
      }
      navigate(`/admin/helpdesk/invoices/${invoiceId}`);
    } catch (err) {
      alert("Failed to update invoice: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "text-slate-400", children: "Loading invoice..." }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "text-red-400", children: error }) });
  }
  if (!invoice?.is_editable) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-yellow-400 mb-4", children: "This invoice cannot be edited." }),
      /* @__PURE__ */ jsx(Link, { to: `/admin/helpdesk/invoices/${invoiceId}`, className: "text-purple-400 hover:text-purple-300", children: "Return to Invoice" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "bg-slate-800/80 border-b border-slate-700 sticky top-0 z-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: `/admin/helpdesk/invoices/${invoiceId}`,
            className: "flex items-center gap-2 text-slate-400 hover:text-white transition",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
              "Back to Invoice"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("h1", { className: "text-xl font-bold flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(FileText, { className: "w-5 h-5 text-purple-400" }),
          "Edit Invoice ",
          invoice?.invoice_number
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleLogout,
          className: "flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition",
          children: /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("main", { className: "container mx-auto px-6 py-8", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "max-w-4xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4", children: "Client Information" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Client Name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: formData.billing_name,
                onChange: (e) => setFormData((prev) => ({ ...prev, billing_name: e.target.value })),
                className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Client Email" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                value: formData.billing_email,
                onChange: (e) => setFormData((prev) => ({ ...prev, billing_email: e.target.value })),
                className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "md:col-span-2", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Client Address" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: formData.billing_address,
                onChange: (e) => setFormData((prev) => ({ ...prev, billing_address: e.target.value })),
                rows: 2,
                className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4", children: "Invoice Details" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Invoice Date" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "date",
                value: formData.issue_date,
                onChange: (e) => setFormData((prev) => ({ ...prev, issue_date: e.target.value })),
                className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Due Date" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "date",
                value: formData.due_date,
                onChange: (e) => setFormData((prev) => ({ ...prev, due_date: e.target.value })),
                className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Tax Rate (%)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                min: "0",
                max: "100",
                value: formData.tax_rate,
                onChange: (e) => setFormData((prev) => ({ ...prev, tax_rate: e.target.value })),
                className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4", children: "Discounts & Credits" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-slate-300", children: "Discount" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Amount ($)" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  step: "0.01",
                  min: "0",
                  value: formData.discount_amount,
                  onChange: (e) => setFormData((prev) => ({ ...prev, discount_amount: e.target.value })),
                  className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Description" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: formData.discount_description,
                  onChange: (e) => setFormData((prev) => ({ ...prev, discount_description: e.target.value })),
                  placeholder: "e.g., Promotional discount",
                  className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-slate-300", children: "Credit (Prior Payment/Overpayment)" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Amount ($)" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  step: "0.01",
                  min: "0",
                  value: formData.credit_amount,
                  onChange: (e) => setFormData((prev) => ({ ...prev, credit_amount: e.target.value })),
                  className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-1", children: "Description" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: formData.credit_description,
                  onChange: (e) => setFormData((prev) => ({ ...prev, credit_description: e.target.value })),
                  placeholder: "e.g., Credit from invoice #123",
                  className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                }
              )
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-slate-700 flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Line Items" }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: addLineItem,
              className: "flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300",
              children: [
                /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
                "Add Item"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 space-y-3", children: [
          lineItems.map((item) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-3 items-start", children: [
            /* @__PURE__ */ jsx("div", { className: "col-span-5", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: item.description,
                onChange: (e) => updateLineItem(item.id, "description", e.target.value),
                placeholder: "Description",
                className: "w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              }
            ) }),
            /* @__PURE__ */ jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                min: "0",
                value: item.quantity,
                onChange: (e) => updateLineItem(item.id, "quantity", e.target.value),
                placeholder: "Qty",
                className: "w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              }
            ) }),
            /* @__PURE__ */ jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                step: "0.01",
                min: "0",
                value: item.rate,
                onChange: (e) => updateLineItem(item.id, "rate", e.target.value),
                placeholder: "Rate",
                className: "w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              }
            ) }),
            /* @__PURE__ */ jsx("div", { className: "col-span-2 text-right text-sm text-slate-300 py-2", children: formatCurrency((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)) }),
            /* @__PURE__ */ jsx("div", { className: "col-span-1", children: /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => removeLineItem(item.id),
                className: "p-2 text-slate-400 hover:text-red-400",
                children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
              }
            ) })
          ] }, item.id)),
          lineItems.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-center text-slate-500 py-4", children: 'No line items. Click "Add Item" to add one.' })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4", children: "Notes" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: formData.notes,
            onChange: (e) => setFormData((prev) => ({ ...prev, notes: e.target.value })),
            rows: 3,
            className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none",
            placeholder: "Payment terms, bank details, or other notes..."
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4", children: "Summary" }),
        /* @__PURE__ */ jsxs("dl", { className: "space-y-2 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-slate-400", children: "Subtotal" }),
            /* @__PURE__ */ jsx("dd", { className: "text-slate-200", children: formatCurrency(calculateSubtotal()) })
          ] }),
          parseFloat(formData.discount_amount) > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-orange-400", children: [
            /* @__PURE__ */ jsxs("dt", { children: [
              "Discount ",
              formData.discount_description && `(${formData.discount_description})`
            ] }),
            /* @__PURE__ */ jsxs("dd", { children: [
              "-",
              formatCurrency(parseFloat(formData.discount_amount))
            ] })
          ] }),
          parseFloat(formData.credit_amount) > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-blue-400", children: [
            /* @__PURE__ */ jsxs("dt", { children: [
              "Credit ",
              formData.credit_description && `(${formData.credit_description})`
            ] }),
            /* @__PURE__ */ jsxs("dd", { children: [
              "-",
              formatCurrency(parseFloat(formData.credit_amount))
            ] })
          ] }),
          parseFloat(formData.tax_rate) > 0 && /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxs("dt", { className: "text-slate-400", children: [
              "Tax (",
              formData.tax_rate,
              "%)"
            ] }),
            /* @__PURE__ */ jsx("dd", { className: "text-slate-200", children: formatCurrency(
              Math.max(0, calculateSubtotal() - (parseFloat(formData.discount_amount) || 0) - (parseFloat(formData.credit_amount) || 0)) * ((parseFloat(formData.tax_rate) || 0) / 100)
            ) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between pt-2 border-t border-slate-700", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-slate-300 font-medium", children: "Total" }),
            /* @__PURE__ */ jsx("dd", { className: "text-lg font-bold text-purple-400", children: formatCurrency(calculateTotal()) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-4", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            to: `/admin/helpdesk/invoices/${invoiceId}`,
            className: "px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "submit",
            disabled: submitting,
            className: "px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition flex items-center gap-2",
            children: [
              /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
              submitting ? "Saving..." : "Save Changes"
            ]
          }
        )
      ] })
    ] }) })
  ] });
};
const __vite_glob_0_21 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: InvoiceEdit
}, Symbol.toStringTag, { value: "Module" }));
const InvoicesList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    project_id: searchParams.get("project") || "",
    search: searchParams.get("search") || ""
  });
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    fetchProjects();
  }, []);
  useEffect(() => {
    fetchInvoices();
  }, [searchParams]);
  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/helpdesk/admin/projects", { credentials: "same-origin" });
      const json = await response.json();
      setProjects(json.data || json);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchParams.get("status")) params.append("status", searchParams.get("status"));
      if (searchParams.get("project")) params.append("project_id", searchParams.get("project"));
      if (searchParams.get("search")) params.append("search", searchParams.get("search"));
      if (searchParams.get("page")) params.append("page", searchParams.get("page"));
      const response = await fetch(`/api/helpdesk/admin/invoices?${params}`, {
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to fetch invoices");
      const data = await response.json();
      setInvoices(data.data || []);
      setPagination({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        total: data.total || 0
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newParams.set(k, v);
    });
    setSearchParams(newParams);
  };
  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page);
    setSearchParams(newParams);
  };
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
  };
  const handleLogout = async () => {
    try {
      await fetch("/admin/logout", {
        method: "POST",
        headers: { "X-CSRF-TOKEN": getCsrfToken(), "Accept": "application/json" },
        credentials: "same-origin"
      });
      window.location.href = "/admin/login";
    } catch (error2) {
      console.error("Logout failed:", error2);
    }
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case "draft":
        return /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" });
      case "sent":
        return /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" });
      case "viewed":
        return /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" });
      case "paid":
        return /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4" });
      case "partial":
        return /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" });
      case "overdue":
        return /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" });
      case "voided":
        return /* @__PURE__ */ jsx(XCircle, { className: "w-4 h-4" });
      default:
        return /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" });
    }
  };
  const getStatusColor2 = (status) => {
    switch (status) {
      case "draft":
        return "bg-slate-500/20 text-slate-400";
      case "sent":
        return "bg-blue-500/20 text-blue-400";
      case "viewed":
        return "bg-purple-500/20 text-purple-400";
      case "paid":
        return "bg-green-500/20 text-green-400";
      case "partial":
        return "bg-yellow-500/20 text-yellow-400";
      case "overdue":
        return "bg-red-500/20 text-red-400";
      case "voided":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount || 0);
  };
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-red-400", children: [
      "Error: ",
      error
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk", className: "text-slate-400 hover:text-white transition", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(FileText, { className: "w-6 h-6 text-purple-400" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-lg", children: "Invoices" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/admin/helpdesk/invoices/create",
            className: "flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-sm",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              "New Invoice"
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
    /* @__PURE__ */ jsx("div", { className: "border-b border-slate-700 bg-slate-800/50", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-1 max-w-md", children: [
        /* @__PURE__ */ jsx(Search, { className: "w-4 h-4 text-slate-400" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Search invoices...",
            value: filters.search,
            onChange: (e) => handleFilterChange("search", e.target.value),
            className: "flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Filter, { className: "w-4 h-4 text-slate-400" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filters.status,
            onChange: (e) => handleFilterChange("status", e.target.value),
            className: "bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "All Statuses" }),
              /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" }),
              /* @__PURE__ */ jsx("option", { value: "sent", children: "Sent" }),
              /* @__PURE__ */ jsx("option", { value: "viewed", children: "Viewed" }),
              /* @__PURE__ */ jsx("option", { value: "partial", children: "Partial" }),
              /* @__PURE__ */ jsx("option", { value: "paid", children: "Paid" }),
              /* @__PURE__ */ jsx("option", { value: "overdue", children: "Overdue" }),
              /* @__PURE__ */ jsx("option", { value: "voided", children: "Voided" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: filters.project_id,
            onChange: (e) => handleFilterChange("project_id", e.target.value),
            className: "bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "All Projects" }),
              projects.map((project) => /* @__PURE__ */ jsx("option", { value: project.id, children: project.name }, project.id))
            ]
          }
        )
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("main", { className: "container mx-auto px-6 py-8", children: loading ? /* @__PURE__ */ jsx("div", { className: "text-center text-slate-400 py-12", children: "Loading invoices..." }) : invoices.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx(FileText, { className: "w-12 h-12 text-slate-600 mx-auto mb-4" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-slate-400 mb-2", children: "No invoices found" }),
      /* @__PURE__ */ jsx("p", { className: "text-slate-500 mb-4", children: "Create your first invoice to get started." }),
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/admin/helpdesk/invoices/create",
          className: "inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
            "New Invoice"
          ]
        }
      )
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-700 bg-slate-800/80", children: [
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-sm font-medium text-slate-400", children: "Invoice" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-sm font-medium text-slate-400", children: "Project" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-sm font-medium text-slate-400", children: "Client" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-sm font-medium text-slate-400", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 text-sm font-medium text-slate-400", children: "Amount" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-sm font-medium text-slate-400", children: "Due Date" }),
          /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 text-sm font-medium text-slate-400", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-700", children: invoices.map((invoice) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-700/30", children: [
          /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                to: `/admin/helpdesk/invoices/${invoice.id}`,
                className: "text-purple-400 hover:text-purple-300 font-medium",
                children: invoice.invoice_number
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: new Date(invoice.created_at).toLocaleDateString() })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-slate-300", children: invoice.project?.name || "-" }),
          /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
            /* @__PURE__ */ jsx("div", { className: "text-slate-300", children: invoice.client_name || "-" }),
            invoice.client_email && /* @__PURE__ */ jsx("div", { className: "text-xs text-slate-500", children: invoice.client_email })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs(
            "span",
            {
              className: `inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${getStatusColor2(
                invoice.status
              )}`,
              children: [
                getStatusIcon(invoice.status),
                invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)
              ]
            }
          ) }),
          /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-right", children: [
            /* @__PURE__ */ jsx("div", { className: "text-slate-200 font-medium", children: formatCurrency(invoice.total_amount) }),
            invoice.amount_paid > 0 && invoice.amount_paid < invoice.total_amount && /* @__PURE__ */ jsxs("div", { className: "text-xs text-green-400", children: [
              "Paid: ",
              formatCurrency(invoice.amount_paid)
            ] })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-slate-300", children: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "-" }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                to: `/admin/helpdesk/invoices/${invoice.id}`,
                className: "p-2 text-slate-400 hover:text-purple-400 transition",
                title: "View",
                children: /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
              }
            ),
            invoice.status === "draft" && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => navigate(`/admin/helpdesk/invoices/${invoice.id}`),
                className: "p-2 text-slate-400 hover:text-blue-400 transition",
                title: "Send",
                children: /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" })
              }
            )
          ] }) })
        ] }, invoice.id)) })
      ] }) }),
      pagination.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-6", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-400", children: [
          "Showing page ",
          pagination.current_page,
          " of ",
          pagination.last_page,
          " (",
          pagination.total,
          " total)"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handlePageChange(pagination.current_page - 1),
              disabled: pagination.current_page === 1,
              className: "p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition",
              children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handlePageChange(pagination.current_page + 1),
              disabled: pagination.current_page === pagination.last_page,
              className: "p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition",
              children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mt-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-slate-200", children: pagination.total }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "Total Invoices" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-yellow-400", children: invoices.filter((i) => i.status === "draft").length }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "Drafts" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-blue-400", children: invoices.filter((i) => ["sent", "viewed", "partial"].includes(i.status)).length }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "Outstanding" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-green-400", children: invoices.filter((i) => i.status === "paid").length }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "Paid" })
        ] })
      ] })
    ] }) })
  ] });
};
const __vite_glob_0_22 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: InvoicesList
}, Symbol.toStringTag, { value: "Module" }));
const ProjectDetail = () => {
  const { projectId } = useParams();
  useNavigate();
  const [project, setProject] = useState(null);
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateKeyForm, setShowCreateKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newlyCreatedKeys, setNewlyCreatedKeys] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [editingClientInfo, setEditingClientInfo] = useState(false);
  const [clientInfoFormData, setClientInfoFormData] = useState({
    client_name: "",
    client_email: "",
    client_address: ""
  });
  const [categories, setCategories] = useState([]);
  const [hourlyRates, setHourlyRates] = useState([]);
  const [invoiceSettings, setInvoiceSettings] = useState(null);
  const [showRateForm, setShowRateForm] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [rateFormData, setRateFormData] = useState({ category_id: "", hourly_rate: "" });
  const [editingSettings, setEditingSettings] = useState(false);
  const [settingsFormData, setSettingsFormData] = useState({
    default_hourly_rate: "",
    billing_increment_minutes: "15",
    minimum_billing_minutes: "60",
    invoice_prefix: "",
    invoice_notes: "",
    payment_terms_days: "30"
  });
  useEffect(() => {
    fetchProject();
    fetchApiKeys();
    fetchDashboard();
    fetchCategories();
    fetchHourlyRates();
    fetchInvoiceSettings();
  }, [projectId]);
  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/helpdesk/admin/projects/${projectId}`, {
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to fetch project");
      const json = await response.json();
      setProject(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchApiKeys = async () => {
    try {
      const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/api-keys`, {
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to fetch API keys");
      const json = await response.json();
      setApiKeys(json.data);
    } catch (err) {
      console.error("Failed to fetch API keys:", err);
    }
  };
  const fetchDashboard = async () => {
    try {
      const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/dashboard`, {
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to fetch dashboard");
      const data = await response.json();
      setDashboard(data);
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
    }
  };
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/helpdesk/admin/time-entries/categories", {
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to fetch categories");
      const json = await response.json();
      setCategories(json.data || json);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };
  const fetchHourlyRates = async () => {
    try {
      const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/hourly-rates`, {
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to fetch hourly rates");
      const json = await response.json();
      setHourlyRates(json.data || json);
    } catch (err) {
      console.error("Failed to fetch hourly rates:", err);
    }
  };
  const fetchInvoiceSettings = async () => {
    try {
      const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/invoice-settings`, {
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to fetch invoice settings");
      const json = await response.json();
      setInvoiceSettings(json.data || json);
      if (json.data) {
        setSettingsFormData({
          default_hourly_rate: json.data.default_hourly_rate || "",
          billing_increment_minutes: json.data.billing_increment_minutes || "15",
          minimum_billing_minutes: json.data.minimum_billing_minutes || "60",
          invoice_prefix: json.data.invoice_prefix || "",
          invoice_notes: json.data.invoice_notes || "",
          payment_terms_days: json.data.payment_terms_days || "30"
        });
      }
    } catch (err) {
      console.error("Failed to fetch invoice settings:", err);
    }
  };
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
  };
  const handleCreateKey = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/api-keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({ name: newKeyName })
      });
      if (!response.ok) throw new Error("Failed to create API key");
      const json = await response.json();
      const newKey = json.data;
      setNewlyCreatedKeys({ ...newlyCreatedKeys, [newKey.id]: newKey.key });
      setApiKeys([...apiKeys, { ...newKey, key: newKey.key }]);
      setNewKeyName("");
      setShowCreateKeyForm(false);
    } catch (err) {
      alert("Failed to create API key: " + err.message);
    }
  };
  const handleRegenerateKey = async (keyId) => {
    if (!confirm("Are you sure? The old key will stop working immediately.")) return;
    try {
      const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/api-keys/${keyId}/regenerate`, {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to regenerate API key");
      const json = await response.json();
      const regeneratedKey = json.data;
      setNewlyCreatedKeys({ ...newlyCreatedKeys, [keyId]: regeneratedKey.key });
      setApiKeys(apiKeys.map((k) => k.id === keyId ? { ...regeneratedKey, key: regeneratedKey.key } : k));
    } catch (err) {
      alert("Failed to regenerate API key: " + err.message);
    }
  };
  const handleDeleteKey = async (keyId) => {
    if (!confirm("Are you sure you want to delete this API key?")) return;
    try {
      const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/api-keys/${keyId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to delete API key");
      setApiKeys(apiKeys.filter((k) => k.id !== keyId));
    } catch (err) {
      alert("Failed to delete API key: " + err.message);
    }
  };
  const handleCopyKey = async (key) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2e3);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  const hasFullKey = (keyId) => {
    return !!newlyCreatedKeys[keyId];
  };
  const getDisplayKey = (apiKey) => {
    if (newlyCreatedKeys[apiKey.id]) {
      return newlyCreatedKeys[apiKey.id];
    }
    return apiKey.key_preview || apiKey.key || "••••••••••••••••";
  };
  const handleLogout = async () => {
    try {
      const csrfToken = getCsrfToken();
      await fetch("/admin/logout", {
        method: "POST",
        headers: { "X-CSRF-TOKEN": csrfToken, "Accept": "application/json" },
        credentials: "same-origin"
      });
      window.location.href = "/admin/login";
    } catch (error2) {
      console.error("Logout failed:", error2);
    }
  };
  const handleAddRate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/hourly-rates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
          category_id: rateFormData.category_id || null,
          rate: parseFloat(rateFormData.hourly_rate)
        })
      });
      if (!response.ok) throw new Error("Failed to add rate");
      await fetchHourlyRates();
      setShowRateForm(false);
      setRateFormData({ category_id: "", hourly_rate: "" });
    } catch (err) {
      alert("Failed to add rate: " + err.message);
    }
  };
  const handleUpdateRate = async (e) => {
    e.preventDefault();
    if (!editingRate) return;
    try {
      const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/hourly-rates/${editingRate.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
          rate: parseFloat(rateFormData.hourly_rate)
        })
      });
      if (!response.ok) throw new Error("Failed to update rate");
      await fetchHourlyRates();
      setEditingRate(null);
      setRateFormData({ category_id: "", hourly_rate: "" });
    } catch (err) {
      alert("Failed to update rate: " + err.message);
    }
  };
  const handleDeleteRate = async (rateId) => {
    if (!confirm("Delete this hourly rate?")) return;
    try {
      const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/hourly-rates/${rateId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to delete rate");
      await fetchHourlyRates();
    } catch (err) {
      alert("Failed to delete rate: " + err.message);
    }
  };
  const editRate = (rate) => {
    setRateFormData({
      category_id: rate.category_id || "",
      hourly_rate: rate.rate.toString()
    });
    setEditingRate(rate);
    setShowRateForm(false);
  };
  const cancelRateEdit = () => {
    setEditingRate(null);
    setShowRateForm(false);
    setRateFormData({ category_id: "", hourly_rate: "" });
  };
  const handleSaveSettings = async () => {
    try {
      const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/invoice-settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
          default_hourly_rate: settingsFormData.default_hourly_rate ? parseFloat(settingsFormData.default_hourly_rate) : null,
          billing_increment_minutes: parseInt(settingsFormData.billing_increment_minutes),
          minimum_billing_minutes: parseInt(settingsFormData.minimum_billing_minutes),
          invoice_prefix: settingsFormData.invoice_prefix || null,
          invoice_notes: settingsFormData.invoice_notes || null,
          payment_terms_days: parseInt(settingsFormData.payment_terms_days)
        })
      });
      if (!response.ok) throw new Error("Failed to save settings");
      await fetchInvoiceSettings();
      setEditingSettings(false);
    } catch (err) {
      alert("Failed to save settings: " + err.message);
    }
  };
  const startEditingClientInfo = () => {
    setClientInfoFormData({
      client_name: project?.client_name || "",
      client_email: project?.client_email || "",
      client_address: project?.client_address || ""
    });
    setEditingClientInfo(true);
  };
  const handleSaveClientInfo = async () => {
    try {
      const response = await fetch(`/api/helpdesk/admin/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
          client_name: clientInfoFormData.client_name || null,
          client_email: clientInfoFormData.client_email || null,
          client_address: clientInfoFormData.client_address || null
        })
      });
      if (!response.ok) throw new Error("Failed to save client info");
      await fetchProject();
      setEditingClientInfo(false);
    } catch (err) {
      alert("Failed to save client info: " + err.message);
    }
  };
  const getAvailableCategories = () => {
    const usedCategoryIds = hourlyRates.filter((r) => r.category_id).map((r) => r.category_id);
    return categories.filter((c) => !usedCategoryIds.includes(c.id));
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "text-slate-400", children: "Loading project..." }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-red-400", children: [
      "Error: ",
      error
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/projects", className: "text-slate-400 hover:text-white transition", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(FolderOpen, { className: "w-6 h-6 text-purple-400" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-lg", children: project?.name })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: `/admin/helpdesk/tickets/create?project=${projectId}`,
            className: "flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition",
            children: [
              /* @__PURE__ */ jsx(Ticket, { className: "w-4 h-4" }),
              "Create Ticket"
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
    /* @__PURE__ */ jsx("main", { className: "container mx-auto px-6 py-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-4", children: "Project Details" }),
        /* @__PURE__ */ jsxs("dl", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm text-slate-400", children: "Name" }),
            /* @__PURE__ */ jsx("dd", { className: "font-medium", children: project?.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm text-slate-400", children: "Slug" }),
            /* @__PURE__ */ jsx("dd", { className: "font-mono text-sm text-purple-400", children: project?.slug })
          ] }),
          project?.description && /* @__PURE__ */ jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm text-slate-400", children: "Description" }),
            /* @__PURE__ */ jsx("dd", { className: "text-slate-300", children: project?.description })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-xl font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(User, { className: "w-5 h-5 text-purple-400" }),
            "Client Information"
          ] }),
          !editingClientInfo ? /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: startEditingClientInfo,
              className: "flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300",
              children: [
                /* @__PURE__ */ jsx(Edit2, { className: "w-4 h-4" }),
                "Edit"
              ]
            }
          ) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handleSaveClientInfo,
                className: "flex items-center gap-1 text-sm text-green-400 hover:text-green-300",
                children: [
                  /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
                  "Save"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setEditingClientInfo(false),
                className: "flex items-center gap-1 text-sm text-slate-400 hover:text-slate-300",
                children: [
                  /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }),
                  "Cancel"
                ]
              }
            )
          ] })
        ] }),
        editingClientInfo ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block text-sm text-slate-400 mb-1", children: [
              /* @__PURE__ */ jsx(User, { className: "w-4 h-4 inline mr-1" }),
              "Client Name"
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: clientInfoFormData.client_name,
                onChange: (e) => setClientInfoFormData((prev) => ({ ...prev, client_name: e.target.value })),
                className: "w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none",
                placeholder: "Enter client name"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block text-sm text-slate-400 mb-1", children: [
              /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4 inline mr-1" }),
              "Client Email"
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                value: clientInfoFormData.client_email,
                onChange: (e) => setClientInfoFormData((prev) => ({ ...prev, client_email: e.target.value })),
                className: "w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none",
                placeholder: "Enter client email"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "block text-sm text-slate-400 mb-1", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4 inline mr-1" }),
              "Client Address"
            ] }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: clientInfoFormData.client_address,
                onChange: (e) => setClientInfoFormData((prev) => ({ ...prev, client_address: e.target.value })),
                className: "w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none",
                rows: 3,
                placeholder: "Enter client address"
              }
            )
          ] })
        ] }) : /* @__PURE__ */ jsxs("dl", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("dt", { className: "text-sm text-slate-400 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(User, { className: "w-4 h-4" }),
              "Name"
            ] }),
            /* @__PURE__ */ jsx("dd", { className: "font-medium", children: project?.client_name || /* @__PURE__ */ jsx("span", { className: "text-slate-500 italic", children: "Not set" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("dt", { className: "text-sm text-slate-400 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4" }),
              "Email"
            ] }),
            /* @__PURE__ */ jsx("dd", { className: "font-medium", children: project?.client_email || /* @__PURE__ */ jsx("span", { className: "text-slate-500 italic", children: "Not set" }) })
          ] }),
          project?.client_address && /* @__PURE__ */ jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxs("dt", { className: "text-sm text-slate-400 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4" }),
              "Address"
            ] }),
            /* @__PURE__ */ jsx("dd", { className: "text-slate-300 whitespace-pre-line", children: project.client_address })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mt-4", children: "Client information will be auto-filled when creating invoices for this project." })
      ] }),
      dashboard?.stats && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: `/admin/helpdesk/tickets?project=${projectId}`,
            className: "bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center hover:bg-slate-700/50 transition",
            children: [
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold", children: dashboard.stats.total }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "Total Tickets" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: `/admin/helpdesk/tickets?project=${projectId}&status=open`,
            className: "bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center hover:bg-slate-700/50 transition",
            children: [
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-yellow-400", children: dashboard.stats.open }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "Open" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: `/admin/helpdesk/tickets?project=${projectId}&status=in-progress`,
            className: "bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center hover:bg-slate-700/50 transition",
            children: [
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-purple-400", children: dashboard.stats.in_progress }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "In Progress" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: `/admin/helpdesk/tickets?project=${projectId}&status=resolved`,
            className: "bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center hover:bg-slate-700/50 transition",
            children: [
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-green-400", children: dashboard.stats.resolved }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "Resolved" })
            ]
          }
        )
      ] }),
      dashboard?.recent_tickets?.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-slate-700 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("h3", { className: "font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Ticket, { className: "w-5 h-5 text-purple-400" }),
            "Recent Tickets"
          ] }),
          /* @__PURE__ */ jsx(
            Link,
            {
              to: `/admin/helpdesk/tickets?project=${projectId}`,
              className: "text-sm text-purple-400 hover:text-purple-300",
              children: "View All →"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("table", { className: "w-full", children: /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-700", children: dashboard.recent_tickets.map((ticket) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-700/30", children: [
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs(
            Link,
            {
              to: `/admin/helpdesk/tickets/${ticket.id}`,
              className: "text-purple-400 hover:text-purple-300 font-medium",
              children: [
                "#",
                ticket.number
              ]
            }
          ) }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-slate-300", children: ticket.title }),
          /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(
            "span",
            {
              className: "px-2 py-1 rounded text-xs font-medium",
              style: { backgroundColor: `${ticket.status?.color}30`, color: ticket.status?.color },
              children: ticket.status?.title
            }
          ) })
        ] }, ticket.id)) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-slate-700 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("h3", { className: "font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Key, { className: "w-5 h-5 text-purple-400" }),
            "API Keys"
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setShowCreateKeyForm(true),
              className: "flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-sm",
              children: [
                /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
                "New Key"
              ]
            }
          )
        ] }),
        showCreateKeyForm && /* @__PURE__ */ jsxs("form", { onSubmit: handleCreateKey, className: "p-4 border-b border-slate-700 bg-slate-700/30", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-2", children: "Key Name" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: newKeyName,
                onChange: (e) => setNewKeyName(e.target.value),
                placeholder: "e.g., Production, Development",
                className: "flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
                required: true
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                className: "px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-sm",
                children: "Create"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowCreateKeyForm(false),
                className: "px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition text-sm",
                children: "Cancel"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "divide-y divide-slate-700", children: apiKeys.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-slate-500", children: "No API keys yet. Create one to enable external API access." }) : apiKeys.map((apiKey) => /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: apiKey.name }),
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: `px-2 py-0.5 rounded text-xs ${apiKey.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`,
                  children: apiKey.is_active ? "Active" : "Inactive"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleRegenerateKey(apiKey.id),
                  className: "p-2 text-slate-400 hover:text-yellow-400 transition",
                  title: "Regenerate key",
                  children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleDeleteKey(apiKey.id),
                  className: "p-2 text-slate-400 hover:text-red-400 transition",
                  title: "Delete key",
                  children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 bg-slate-900/50 rounded-lg p-2 font-mono text-sm", children: [
            /* @__PURE__ */ jsx("code", { className: "flex-1 text-slate-300 truncate", children: getDisplayKey(apiKey) }),
            hasFullKey(apiKey.id) ? /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleCopyKey(newlyCreatedKeys[apiKey.id]),
                className: "p-1.5 text-slate-400 hover:text-white transition",
                title: "Copy",
                children: copiedKey === newlyCreatedKeys[apiKey.id] ? /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-green-400" }) : /* @__PURE__ */ jsx(Copy, { className: "w-4 h-4" })
              }
            ) : /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500 italic", children: "Key hidden - regenerate to get new key" })
          ] }),
          hasFullKey(apiKey.id) && /* @__PURE__ */ jsx("p", { className: "text-xs text-amber-400 mt-2", children: "⚠️ Copy this key now - it won't be shown again!" }),
          apiKey.last_used_at && /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500 mt-2", children: [
            "Last used: ",
            new Date(apiKey.last_used_at).toLocaleString()
          ] })
        ] }, apiKey.id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl", children: [
        /* @__PURE__ */ jsx("div", { className: "p-4 border-b border-slate-700", children: /* @__PURE__ */ jsxs("h3", { className: "font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(DollarSign, { className: "w-5 h-5 text-purple-400" }),
          "Billing & Invoicing"
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-slate-700", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-slate-300", children: "Invoice Settings" }),
            !editingSettings ? /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setEditingSettings(true),
                className: "text-sm text-purple-400 hover:text-purple-300",
                children: /* @__PURE__ */ jsx(Edit2, { className: "w-4 h-4" })
              }
            ) : /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: handleSaveSettings,
                  className: "p-1 text-green-400 hover:text-green-300",
                  children: /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setEditingSettings(false),
                  className: "p-1 text-slate-400 hover:text-slate-300",
                  children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
                }
              )
            ] })
          ] }),
          editingSettings ? /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-slate-400 mb-1", children: "Default Hourly Rate ($)" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  step: "0.01",
                  min: "0",
                  value: settingsFormData.default_hourly_rate,
                  onChange: (e) => setSettingsFormData((prev) => ({ ...prev, default_hourly_rate: e.target.value })),
                  className: "w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
                  placeholder: "0.00"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-slate-400 mb-1", children: "Billing Increment (mins)" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: settingsFormData.billing_increment_minutes,
                  onChange: (e) => setSettingsFormData((prev) => ({ ...prev, billing_increment_minutes: e.target.value })),
                  className: "w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "1", children: "1 minute" }),
                    /* @__PURE__ */ jsx("option", { value: "5", children: "5 minutes" }),
                    /* @__PURE__ */ jsx("option", { value: "6", children: "6 minutes (1/10 hr)" }),
                    /* @__PURE__ */ jsx("option", { value: "15", children: "15 minutes" }),
                    /* @__PURE__ */ jsx("option", { value: "30", children: "30 minutes" }),
                    /* @__PURE__ */ jsx("option", { value: "60", children: "1 hour" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-slate-400 mb-1", children: "Minimum Billing (mins)" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: settingsFormData.minimum_billing_minutes,
                  onChange: (e) => setSettingsFormData((prev) => ({ ...prev, minimum_billing_minutes: e.target.value })),
                  className: "w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "0", children: "None" }),
                    /* @__PURE__ */ jsx("option", { value: "15", children: "15 minutes" }),
                    /* @__PURE__ */ jsx("option", { value: "30", children: "30 minutes" }),
                    /* @__PURE__ */ jsx("option", { value: "60", children: "1 hour" }),
                    /* @__PURE__ */ jsx("option", { value: "120", children: "2 hours" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-slate-400 mb-1", children: "Payment Terms (days)" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "1",
                  value: settingsFormData.payment_terms_days,
                  onChange: (e) => setSettingsFormData((prev) => ({ ...prev, payment_terms_days: e.target.value })),
                  className: "w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-slate-400 mb-1", children: "Invoice Prefix" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: settingsFormData.invoice_prefix,
                  onChange: (e) => setSettingsFormData((prev) => ({ ...prev, invoice_prefix: e.target.value })),
                  className: "w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
                  placeholder: "INV-"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-slate-400 mb-1", children: "Default Invoice Notes" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: settingsFormData.invoice_notes,
                  onChange: (e) => setSettingsFormData((prev) => ({ ...prev, invoice_notes: e.target.value })),
                  rows: 2,
                  className: "w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none",
                  placeholder: "Payment terms, bank details, etc."
                }
              )
            ] })
          ] }) : /* @__PURE__ */ jsxs("dl", { className: "grid grid-cols-2 gap-3 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-slate-500", children: "Default Rate" }),
              /* @__PURE__ */ jsx("dd", { className: "text-slate-200", children: invoiceSettings?.default_hourly_rate ? `$${parseFloat(invoiceSettings.default_hourly_rate).toFixed(2)}/hr` : "Not set" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-slate-500", children: "Billing Increment" }),
              /* @__PURE__ */ jsxs("dd", { className: "text-slate-200", children: [
                invoiceSettings?.billing_increment_minutes || 15,
                " mins"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-slate-500", children: "Minimum Billing" }),
              /* @__PURE__ */ jsxs("dd", { className: "text-slate-200", children: [
                invoiceSettings?.minimum_billing_minutes || 60,
                " mins"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("dt", { className: "text-slate-500", children: "Payment Terms" }),
              /* @__PURE__ */ jsxs("dd", { className: "text-slate-200", children: [
                invoiceSettings?.payment_terms_days || 30,
                " days"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-slate-300", children: "Hourly Rates by Category" }),
            !showRateForm && !editingRate && /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setShowRateForm(true),
                className: "flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300",
                children: [
                  /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
                  "Add Rate"
                ]
              }
            )
          ] }),
          (showRateForm || editingRate) && /* @__PURE__ */ jsxs("form", { onSubmit: editingRate ? handleUpdateRate : handleAddRate, className: "mb-4 p-3 bg-slate-700/50 rounded-lg", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 mb-3", children: [
              !editingRate && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs text-slate-400 mb-1", children: "Category" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: rateFormData.category_id,
                    onChange: (e) => {
                      const categoryId = e.target.value;
                      const category = categories.find((c) => c.id.toString() === categoryId);
                      setRateFormData((prev) => ({
                        ...prev,
                        category_id: categoryId,
                        hourly_rate: category?.default_rate || prev.hourly_rate
                      }));
                    },
                    className: "w-full bg-slate-600 border border-slate-500 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", children: "Default (all categories)" }),
                      getAvailableCategories().map((cat) => /* @__PURE__ */ jsxs("option", { value: cat.id, children: [
                        cat.name,
                        cat.default_rate ? ` ($${parseFloat(cat.default_rate).toFixed(2)}/hr)` : ""
                      ] }, cat.id))
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: editingRate ? "col-span-2" : "", children: [
                /* @__PURE__ */ jsxs("label", { className: "block text-xs text-slate-400 mb-1", children: [
                  "Hourly Rate ($) ",
                  editingRate && `- ${editingRate.category?.name || "Default"}`
                ] }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    step: "0.01",
                    min: "0",
                    value: rateFormData.hourly_rate,
                    onChange: (e) => setRateFormData((prev) => ({ ...prev, hourly_rate: e.target.value })),
                    className: "w-full bg-slate-600 border border-slate-500 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
                    placeholder: "0.00",
                    required: true
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  className: "px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm",
                  children: editingRate ? "Update" : "Add Rate"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: cancelRateEdit,
                  className: "px-3 py-1.5 bg-slate-600 hover:bg-slate-500 rounded text-sm",
                  children: "Cancel"
                }
              )
            ] })
          ] }),
          hourlyRates.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: hourlyRates.map((rate) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-2 bg-slate-700/30 rounded", children: [
            /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: rate.category?.name || "Default Rate" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-sm text-green-400 font-medium", children: [
                "$",
                parseFloat(rate.rate).toFixed(2),
                "/hr"
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => editRate(rate),
                  className: "p-1 text-slate-400 hover:text-slate-300",
                  children: /* @__PURE__ */ jsx(Edit2, { className: "w-3.5 h-3.5" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleDeleteRate(rate.id),
                  className: "p-1 text-slate-400 hover:text-red-400",
                  children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
                }
              )
            ] })
          ] }, rate.id)) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 text-center py-4", children: "No hourly rates configured. Add rates to enable billing." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4", children: "API Usage" }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-900/50 rounded-lg p-4 font-mono text-sm", children: [
          /* @__PURE__ */ jsx("p", { className: "text-slate-400 mb-2", children: "# Submit a ticket" }),
          /* @__PURE__ */ jsxs("code", { className: "text-green-400", children: [
            "curl -X POST ",
            window.location.origin,
            "/api/helpdesk/v1/tickets \\",
            /* @__PURE__ */ jsx("br", {}),
            "  ",
            '-H "X-Helpdesk-Key: YOUR_API_KEY" \\',
            /* @__PURE__ */ jsx("br", {}),
            "  ",
            '-H "Content-Type: application/json" \\',
            /* @__PURE__ */ jsx("br", {}),
            "  ",
            "-d '",
            "{",
            /* @__PURE__ */ jsx("br", {}),
            "    ",
            '"subject": "Help with feature",',
            /* @__PURE__ */ jsx("br", {}),
            "    ",
            '"description": "Detailed description...",',
            /* @__PURE__ */ jsx("br", {}),
            "    ",
            '"submitter_name": "John Doe",',
            /* @__PURE__ */ jsx("br", {}),
            "    ",
            '"submitter_email": "john@example.com"',
            /* @__PURE__ */ jsx("br", {}),
            "  ",
            "}",
            "'"
          ] })
        ] })
      ] })
    ] }) })
  ] });
};
const __vite_glob_0_23 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ProjectDetail
}, Symbol.toStringTag, { value: "Module" }));
const ProjectForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const response = await fetch("/api/helpdesk/admin/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        const data = await response.json();
        if (data.errors) {
          setErrors(data.errors);
          return;
        }
        throw new Error(data.message || "Failed to create project");
      }
      const result = await response.json();
      navigate(`/admin/helpdesk/projects/${result.data.id}`);
    } catch (err) {
      alert("Failed to create project: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = async () => {
    try {
      const csrfToken = getCsrfToken();
      await fetch("/admin/logout", {
        method: "POST",
        headers: { "X-CSRF-TOKEN": csrfToken, "Accept": "application/json" },
        credentials: "same-origin"
      });
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/projects", className: "text-slate-400 hover:text-white transition", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(FolderOpen, { className: "w-6 h-6 text-purple-400" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-lg", children: "New Project" })
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
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-6", children: "Create New Project" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-slate-300 mb-2", children: "Project Name *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              id: "name",
              value: formData.name,
              onChange: (e) => setFormData({ ...formData, name: e.target.value }),
              className: `w-full bg-slate-700 border ${errors.name ? "border-red-500" : "border-slate-600"} rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500`,
              placeholder: "e.g., PantryLink, ChampLink",
              required: true
            }
          ),
          errors.name && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-400", children: errors.name[0] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "description", className: "block text-sm font-medium text-slate-300 mb-2", children: "Description" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              id: "description",
              value: formData.description,
              onChange: (e) => setFormData({ ...formData, description: e.target.value }),
              rows: 4,
              className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none",
              placeholder: "Brief description of the project..."
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-slate-700/50 rounded-lg p-4 text-sm text-slate-400", children: /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-slate-300", children: "Note:" }),
          " An API key will be automatically generated for this project. You can create additional keys after the project is created."
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: loading,
              className: "flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed",
              children: loading ? "Creating..." : "Create Project"
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/admin/helpdesk/projects",
              className: "px-6 py-3 bg-slate-600 hover:bg-slate-500 rounded-lg transition font-medium text-center",
              children: "Cancel"
            }
          )
        ] })
      ] })
    ] }) }) })
  ] });
};
const __vite_glob_0_24 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ProjectForm
}, Symbol.toStringTag, { value: "Module" }));
const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetchProjects();
  }, []);
  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/helpdesk/admin/projects", {
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      setProjects(data.data || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
  };
  const handleDelete = async (projectId) => {
    if (!confirm("Are you sure you want to delete this project? All associated tickets and API keys will be deleted.")) {
      return;
    }
    try {
      const response = await fetch(`/api/helpdesk/admin/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to delete project");
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (err) {
      alert("Failed to delete project: " + err.message);
    }
  };
  const handleLogout = async () => {
    try {
      const csrfToken = getCsrfToken();
      await fetch("/admin/logout", {
        method: "POST",
        headers: { "X-CSRF-TOKEN": csrfToken, "Accept": "application/json" },
        credentials: "same-origin"
      });
      window.location.href = "/admin/login";
    } catch (error2) {
      console.error("Logout failed:", error2);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk", className: "text-slate-400 hover:text-white transition", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(FolderOpen, { className: "w-6 h-6 text-purple-400" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-lg", children: "Projects" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("nav", { className: "flex items-center gap-6", children: [
          /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk", className: "text-slate-300 hover:text-white transition", children: "Dashboard" }),
          /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/tickets", className: "text-slate-300 hover:text-white transition", children: "Tickets" }),
          /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/users", className: "text-slate-300 hover:text-white transition", children: "Users" })
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
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-2", children: "Projects" }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-400", children: "Manage external applications and their API keys" })
        ] }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/admin/helpdesk/projects/create",
            className: "flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              "New Project"
            ]
          }
        )
      ] }),
      loading ? /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-slate-400", children: "Loading projects..." }) : error ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12 text-red-400", children: [
        "Error: ",
        error
      ] }) : projects.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center", children: [
        /* @__PURE__ */ jsx(FolderOpen, { className: "w-12 h-12 text-slate-600 mx-auto mb-4" }),
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-2", children: "No projects yet" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-400 mb-4", children: "Create a project to generate API keys for external applications." }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/admin/helpdesk/projects/create",
            className: "inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              "Create First Project"
            ]
          }
        )
      ] }) : /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6", children: projects.map((project) => /* @__PURE__ */ jsx(
        "div",
        {
          className: "bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden",
          children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "p-2 rounded-lg bg-purple-500/20", children: /* @__PURE__ */ jsx(FolderOpen, { className: "w-5 h-5 text-purple-400" }) }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-semibold text-white", children: project.name }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 font-mono", children: project.slug })
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleDelete(project.id),
                  className: "p-2 text-slate-400 hover:text-red-400 transition",
                  children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
                }
              )
            ] }),
            project.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400 mb-4", children: project.description }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4 text-center", children: [
              /* @__PURE__ */ jsxs("div", { className: "bg-slate-700/50 rounded-lg p-3", children: [
                /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-white", children: project.tickets_count || 0 }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400", children: "Tickets" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "bg-slate-700/50 rounded-lg p-3", children: [
                /* @__PURE__ */ jsx("p", { className: "text-lg font-bold text-white", children: project.api_keys_count || 0 }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400", children: "API Keys" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(
                Link,
                {
                  to: `/admin/helpdesk/projects/${project.id}`,
                  className: "flex-1 text-center px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-sm",
                  children: "View Details"
                }
              ),
              /* @__PURE__ */ jsx(
                Link,
                {
                  to: `/admin/helpdesk/tickets/create?project=${project.id}`,
                  className: "flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-sm",
                  title: "Create Ticket",
                  children: /* @__PURE__ */ jsx(Ticket, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsxs(
                Link,
                {
                  to: `/admin/helpdesk/projects/${project.id}/keys`,
                  className: "flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-sm",
                  children: [
                    /* @__PURE__ */ jsx(Key, { className: "w-4 h-4" }),
                    "Keys"
                  ]
                }
              )
            ] })
          ] })
        },
        project.id
      )) })
    ] }) })
  ] });
};
const __vite_glob_0_25 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ProjectsList
}, Symbol.toStringTag, { value: "Module" }));
const Settings = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", slug: "", description: "", default_rate: "", is_active: true });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  useEffect(() => {
    fetchCategories();
  }, []);
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
  };
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/helpdesk/admin/hourly-rate-categories", {
        credentials: "same-origin"
      });
      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch categories");
      const json = await response.json();
      setCategories(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = async () => {
    try {
      await fetch("/admin/logout", {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin"
      });
      window.location.href = "/admin/login";
    } catch (error2) {
      console.error("Logout failed:", error2);
    }
  };
  const openCreateForm = () => {
    setFormData({ name: "", slug: "", description: "", default_rate: "", is_active: true });
    setEditingCategory(null);
    setShowForm(true);
  };
  const openEditForm = (category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      default_rate: category.default_rate || "",
      is_active: category.is_active
    });
    setEditingCategory(category);
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: "", slug: "", description: "", default_rate: "", is_active: true });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingCategory ? `/api/helpdesk/admin/hourly-rate-categories/${editingCategory.id}` : "/api/helpdesk/admin/hourly-rate-categories";
      const method = editingCategory ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save category");
      }
      await fetchCategories();
      closeForm();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (categoryId) => {
    try {
      const response = await fetch(`/api/helpdesk/admin/hourly-rate-categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin"
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete category");
      }
      await fetchCategories();
      setDeleteConfirm(null);
    } catch (err) {
      alert(err.message);
    }
  };
  const handleToggleActive = async (category) => {
    try {
      const response = await fetch(`/api/helpdesk/admin/hourly-rate-categories/${category.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({ is_active: !category.is_active })
      });
      if (!response.ok) throw new Error("Failed to update category");
      await fetchCategories();
    } catch (err) {
      alert(err.message);
    }
  };
  const moveCategory = async (categoryId, direction) => {
    const index = categories.findIndex((c) => c.id === categoryId);
    if (index === -1) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;
    const newOrder = [...categories];
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    try {
      const response = await fetch("/api/helpdesk/admin/hourly-rate-categories/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({ order: newOrder.map((c) => c.id) })
      });
      if (!response.ok) throw new Error("Failed to reorder categories");
      await fetchCategories();
    } catch (err) {
      alert(err.message);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-slate-900 text-white flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-slate-900 text-white flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "w-16 h-16 text-red-500 mx-auto mb-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-red-400", children: error }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => window.location.reload(),
          className: "mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition",
          children: "Retry"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-900 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "bg-slate-800 border-b border-slate-700", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxs(Link, { to: "/admin/helpdesk", className: "flex items-center gap-2 hover:text-purple-400 transition", children: [
        /* @__PURE__ */ jsx(Ticket, { className: "w-6 h-6 text-purple-400" }),
        /* @__PURE__ */ jsx("span", { className: "font-semibold text-lg", children: "Helpdesk" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("nav", { className: "flex items-center gap-6", children: [
          /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/tickets", className: "text-slate-300 hover:text-white transition", children: "Tickets" }),
          /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/projects", className: "text-slate-300 hover:text-white transition", children: "Projects" }),
          /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/invoices", className: "text-slate-300 hover:text-white transition", children: "Invoices" }),
          /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/users", className: "text-slate-300 hover:text-white transition", children: "Users" }),
          /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/settings", className: "text-white font-medium transition", children: "Settings" })
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
    ] }) }) }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-8", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(Settings$1, { className: "w-8 h-8 text-purple-400" }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Settings" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-800 rounded-xl border border-slate-700", children: [
        /* @__PURE__ */ jsx("div", { className: "p-6 border-b border-slate-700", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Billable Time Categories" }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-400 mt-1", children: "Manage categories for time tracking (e.g., Development, Design, Support)" })
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: openCreateForm,
              className: "flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition",
              children: [
                /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
                "Add Category"
              ]
            }
          )
        ] }) }),
        showForm && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md mx-4", children: [
          /* @__PURE__ */ jsx("div", { className: "p-6 border-b border-slate-700", children: /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: editingCategory ? "Edit Category" : "New Category" }) }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-1", children: [
                "Name ",
                /* @__PURE__ */ jsx("span", { className: "text-red-400", children: "*" })
              ] }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: formData.name,
                  onChange: (e) => setFormData((prev) => ({ ...prev, name: e.target.value })),
                  className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500",
                  placeholder: "e.g., Development",
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-1", children: "Slug" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: formData.slug,
                  onChange: (e) => setFormData((prev) => ({ ...prev, slug: e.target.value })),
                  className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500",
                  placeholder: "e.g., development (auto-generated if empty)"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mt-1", children: "Used for internal identification. Auto-generated from name if left empty." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-1", children: "Description" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: formData.description,
                  onChange: (e) => setFormData((prev) => ({ ...prev, description: e.target.value })),
                  rows: 2,
                  className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500",
                  placeholder: "Optional description"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-1", children: "Default Hourly Rate" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400", children: "$" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    step: "0.01",
                    min: "0",
                    value: formData.default_rate,
                    onChange: (e) => setFormData((prev) => ({ ...prev, default_rate: e.target.value })),
                    className: "w-full bg-slate-700 border border-slate-600 rounded-lg pl-7 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500",
                    placeholder: "0.00"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mt-1", children: "Default rate used when adding this category to a project. Can be overridden per project." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  id: "is_active",
                  checked: formData.is_active,
                  onChange: (e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked })),
                  className: "rounded bg-slate-700 border-slate-600 text-purple-500 focus:ring-purple-500"
                }
              ),
              /* @__PURE__ */ jsx("label", { htmlFor: "is_active", className: "text-sm text-slate-300", children: "Active (available for selection)" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: closeForm,
                  className: "px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition",
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  disabled: submitting,
                  className: "flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50",
                  children: submitting ? "Saving..." : editingCategory ? "Update" : "Create"
                }
              )
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "divide-y divide-slate-700", children: categories.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-8 text-center text-slate-400", children: [
          /* @__PURE__ */ jsx(Settings$1, { className: "w-12 h-12 mx-auto mb-3 opacity-50" }),
          /* @__PURE__ */ jsx("p", { children: "No categories yet. Add your first category to get started." })
        ] }) : categories.map((category, index) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: `flex items-center justify-between p-4 ${!category.is_active ? "opacity-60" : ""}`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => moveCategory(category.id, "up"),
                      disabled: index === 0,
                      className: "p-1 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed",
                      title: "Move up",
                      children: /* @__PURE__ */ jsx(GripVertical, { className: "w-4 h-4 rotate-90" })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => moveCategory(category.id, "down"),
                      disabled: index === categories.length - 1,
                      className: "p-1 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed",
                      title: "Move down",
                      children: /* @__PURE__ */ jsx(GripVertical, { className: "w-4 h-4 -rotate-90" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-medium", children: category.name }),
                    /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 bg-slate-700 rounded text-slate-400", children: category.slug }),
                    !category.is_active && /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 bg-yellow-900/50 text-yellow-400 rounded", children: "Inactive" }),
                    category.default_rate && /* @__PURE__ */ jsxs("span", { className: "text-xs px-2 py-0.5 bg-green-900/50 text-green-400 rounded", children: [
                      "$",
                      parseFloat(category.default_rate).toFixed(2),
                      "/hr"
                    ] })
                  ] }),
                  category.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400 mt-1", children: category.description })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handleToggleActive(category),
                    className: `p-2 rounded-lg transition ${category.is_active ? "hover:bg-yellow-900/30 text-yellow-400" : "hover:bg-green-900/30 text-green-400"}`,
                    title: category.is_active ? "Deactivate" : "Activate",
                    children: category.is_active ? /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Check, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => openEditForm(category),
                    className: "p-2 hover:bg-slate-700 rounded-lg transition",
                    title: "Edit",
                    children: /* @__PURE__ */ jsx(Pencil, { className: "w-4 h-4" })
                  }
                ),
                deleteConfirm === category.id ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => handleDelete(category.id),
                      className: "px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded transition",
                      children: "Confirm"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => setDeleteConfirm(null),
                      className: "px-2 py-1 text-xs bg-slate-600 hover:bg-slate-500 rounded transition",
                      children: "Cancel"
                    }
                  )
                ] }) : /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setDeleteConfirm(category.id),
                    className: "p-2 hover:bg-red-900/30 text-red-400 rounded-lg transition",
                    title: "Delete",
                    children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
                  }
                )
              ] })
            ]
          },
          category.id
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-medium text-slate-300 mb-2", children: "About Time Categories" }),
        /* @__PURE__ */ jsxs("ul", { className: "text-sm text-slate-400 space-y-1 list-disc list-inside", children: [
          /* @__PURE__ */ jsx("li", { children: "Categories help classify time entries (e.g., Development, Design, Meetings)" }),
          /* @__PURE__ */ jsx("li", { children: "Each category can have a different hourly rate per project" }),
          /* @__PURE__ */ jsx("li", { children: "Deactivating a category hides it from selection but preserves existing time entries" }),
          /* @__PURE__ */ jsx("li", { children: "Categories in use cannot be deleted - deactivate them instead" })
        ] })
      ] })
    ] })
  ] });
};
const __vite_glob_0_26 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Settings
}, Symbol.toStringTag, { value: "Module" }));
function Markdown({ children, className = "" }) {
  if (!children) return null;
  return /* @__PURE__ */ jsx("div", { className: `prose prose-invert prose-slate max-w-none
            prose-headings:text-slate-200 prose-headings:font-semibold
            prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
            prose-p:text-slate-300 prose-p:my-2
            prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-slate-200
            prose-del:text-slate-400
            prose-code:text-amber-400 prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700 prose-pre:rounded-lg
            prose-ul:text-slate-300 prose-ul:list-disc prose-ul:pl-5 prose-ul:my-2
            prose-ol:text-slate-300 prose-ol:list-decimal prose-ol:pl-5 prose-ol:my-2
            prose-li:my-0.5 prose-li:pl-1
            prose-blockquote:border-l-blue-500 prose-blockquote:text-slate-400
            prose-hr:border-slate-700
            ${className}`, children: /* @__PURE__ */ jsx(
    ReactMarkdown,
    {
      remarkPlugins: [remarkGfm],
      components: {
        // Open links in new tab
        a: ({ node, ...props }) => /* @__PURE__ */ jsx("a", { ...props, target: "_blank", rel: "noopener noreferrer" }),
        // Ensure lists render with proper styling
        ul: ({ node, ...props }) => /* @__PURE__ */ jsx("ul", { ...props, className: "list-disc pl-5 my-2 text-slate-300" }),
        ol: ({ node, ...props }) => /* @__PURE__ */ jsx("ol", { ...props, className: "list-decimal pl-5 my-2 text-slate-300" }),
        li: ({ node, ...props }) => /* @__PURE__ */ jsx("li", { ...props, className: "my-0.5" }),
        // Add copy button or other enhancements to code blocks if needed
        pre: ({ node, children: children2, ...props }) => /* @__PURE__ */ jsx("pre", { ...props, className: "overflow-x-auto", children: children2 })
      },
      children
    }
  ) });
}
const TicketDetail = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [referenceData, setReferenceData] = useState({ statuses: [], priorities: [], admins: [] });
  const [newComment, setNewComment] = useState("");
  const [commentKey, setCommentKey] = useState(0);
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentAttachments, setCommentAttachments] = useState([]);
  const commentFileInputRef = useRef(null);
  const commentUpload = useFileUpload();
  const [showTimeForm, setShowTimeForm] = useState(false);
  const [timeFormData, setTimeFormData] = useState({ hours: "", minutes: "", hourly_rate_category_id: "", description: "", is_billable: true });
  const [editingTimeEntry, setEditingTimeEntry] = useState(null);
  const [timeSubmitting, setTimeSubmitting] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [editingCommentSubmitting, setEditingCommentSubmitting] = useState(false);
  const [editingTicket, setEditingTicket] = useState(false);
  const [editingTicketTitle, setEditingTicketTitle] = useState("");
  const [editingTicketContent, setEditingTicketContent] = useState("");
  const [editingTicketSubmitting, setEditingTicketSubmitting] = useState(false);
  useEffect(() => {
    fetchReferenceData();
    fetchTicket();
    fetchComments();
    fetchTimeEntries();
    fetchCategories();
  }, [ticketId]);
  useEffect(() => {
    let interval;
    if (activeTimer) {
      interval = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1e3);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);
  const fetchReferenceData = async () => {
    try {
      const [statusesRes, prioritiesRes, adminsRes] = await Promise.all([
        fetch("/api/helpdesk/admin/statuses", { credentials: "same-origin" }),
        fetch("/api/helpdesk/admin/priorities", { credentials: "same-origin" }),
        fetch("/api/helpdesk/admin/admins", { credentials: "same-origin" })
      ]);
      const [statusesJson, prioritiesJson, adminsJson] = await Promise.all([
        statusesRes.json(),
        prioritiesRes.json(),
        adminsRes.json()
      ]);
      setReferenceData({
        statuses: statusesJson.data || statusesJson,
        priorities: prioritiesJson.data || prioritiesJson,
        admins: adminsJson.data || adminsJson
      });
    } catch (err) {
      console.error("Failed to fetch reference data:", err);
    }
  };
  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}`, {
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to fetch ticket");
      const json = await response.json();
      setTicket(json.data || json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}/comments`, {
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to fetch comments");
      const json = await response.json();
      setComments(json.data || json);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };
  const fetchTimeEntries = async () => {
    try {
      const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}/time-entries`, {
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to fetch time entries");
      const json = await response.json();
      setTimeEntries(json.data || json);
    } catch (err) {
      console.error("Failed to fetch time entries:", err);
    }
  };
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/helpdesk/admin/time-entries/categories", {
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to fetch categories");
      const json = await response.json();
      setCategories(json.data || json);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };
  const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
  };
  const handleStatusChange = async (statusId) => {
    try {
      const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({ status_id: statusId })
      });
      if (!response.ok) throw new Error("Failed to update status");
      const data = await response.json();
      setTicket(data.data);
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };
  const handlePriorityChange = async (priorityId) => {
    try {
      const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}/priority`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({ priority_id: priorityId })
      });
      if (!response.ok) throw new Error("Failed to update priority");
      const data = await response.json();
      setTicket(data.data);
    } catch (err) {
      alert("Failed to update priority: " + err.message);
    }
  };
  const handleAssigneeChange = async (assigneeId) => {
    try {
      const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({ assignee_id: assigneeId || null })
      });
      if (!response.ok) throw new Error("Failed to update assignee");
      const data = await response.json();
      setTicket(data.data);
    } catch (err) {
      alert("Failed to update assignee: " + err.message);
    }
  };
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
          content: newComment,
          is_internal: isInternal
        })
      });
      if (!response.ok) throw new Error("Failed to add comment");
      const data = await response.json();
      const newCommentData = data.data;
      if (commentAttachments.length > 0) {
        const uploadResult = await commentUpload.upload(
          `/api/helpdesk/admin/comments/${newCommentData.id}/attachments`,
          commentAttachments
        );
        if (uploadResult.data.length > 0) {
          newCommentData.attachments = uploadResult.data;
        }
      }
      setComments([...comments, newCommentData]);
      setNewComment("");
      setCommentKey((k) => k + 1);
      setIsInternal(false);
      setCommentAttachments([]);
      commentUpload.reset();
    } catch (err) {
      alert("Failed to add comment: " + err.message);
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
      const response = await fetch(`/api/helpdesk/admin/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({ content: editingCommentContent })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update comment");
      }
      const data = await response.json();
      setComments(comments.map((c) => c.id === commentId ? data.data : c));
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
      const response = await fetch(`/api/helpdesk/admin/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin"
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete comment");
      }
      setComments(comments.filter((c) => c.id !== commentId));
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
      const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin",
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
      setTicket(data.data);
      setEditingTicket(false);
      setEditingTicketTitle("");
      setEditingTicketContent("");
    } catch (err) {
      alert("Failed to update ticket: " + err.message);
    } finally {
      setEditingTicketSubmitting(false);
    }
  };
  const handleDeleteTicket = async () => {
    if (!confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) return;
    try {
      const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to delete ticket");
      navigate("/admin/helpdesk/tickets");
    } catch (err) {
      alert("Failed to delete ticket: " + err.message);
    }
  };
  const handleLogout = async () => {
    try {
      const csrfToken = getCsrfToken();
      await fetch("/admin/logout", {
        method: "POST",
        headers: { "X-CSRF-TOKEN": csrfToken, "Accept": "application/json" },
        credentials: "same-origin"
      });
      window.location.href = "/admin/login";
    } catch (error2) {
      console.error("Logout failed:", error2);
    }
  };
  const formatTimerDisplay = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor(seconds % 3600 / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  const startTimer = () => {
    setActiveTimer(/* @__PURE__ */ new Date());
    setTimerSeconds(0);
  };
  const stopTimer = () => {
    if (!activeTimer) return;
    const hours = Math.floor(timerSeconds / 3600);
    const minutes = Math.floor(timerSeconds % 3600 / 60);
    setTimeFormData((prev) => ({
      ...prev,
      hours: hours.toString(),
      minutes: minutes.toString()
    }));
    setActiveTimer(null);
    setTimerSeconds(0);
    setShowTimeForm(true);
  };
  const handleAddTimeEntry = async (e) => {
    e.preventDefault();
    setTimeSubmitting(true);
    try {
      const hours = parseInt(timeFormData.hours || 0);
      const mins = parseInt(timeFormData.minutes || 0);
      const timeSpent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
      const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}/time-entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
          time_spent: timeSpent,
          hourly_rate_category_id: timeFormData.hourly_rate_category_id || null,
          description: timeFormData.description,
          is_billable: timeFormData.is_billable
        })
      });
      if (!response.ok) throw new Error("Failed to add time entry");
      await fetchTimeEntries();
      setShowTimeForm(false);
      setTimeFormData({ hours: "", minutes: "", hourly_rate_category_id: "", description: "", is_billable: true });
    } catch (err) {
      alert("Failed to add time entry: " + err.message);
    } finally {
      setTimeSubmitting(false);
    }
  };
  const handleUpdateTimeEntry = async (e) => {
    e.preventDefault();
    if (!editingTimeEntry) return;
    setTimeSubmitting(true);
    try {
      const hours = parseInt(timeFormData.hours || 0);
      const mins = parseInt(timeFormData.minutes || 0);
      const timeSpent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
      const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}/time-entries/${editingTimeEntry.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
          time_spent: timeSpent,
          hourly_rate_category_id: timeFormData.hourly_rate_category_id || null,
          description: timeFormData.description,
          is_billable: timeFormData.is_billable
        })
      });
      if (!response.ok) throw new Error("Failed to update time entry");
      await fetchTimeEntries();
      setEditingTimeEntry(null);
      setShowTimeForm(false);
      setTimeFormData({ hours: "", minutes: "", hourly_rate_category_id: "", description: "", is_billable: true });
    } catch (err) {
      alert("Failed to update time entry: " + err.message);
    } finally {
      setTimeSubmitting(false);
    }
  };
  const handleDeleteTimeEntry = async (entryId) => {
    if (!confirm("Delete this time entry?")) return;
    try {
      const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}/time-entries/${entryId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": getCsrfToken(),
          "Accept": "application/json"
        },
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to delete time entry");
      await fetchTimeEntries();
    } catch (err) {
      alert("Failed to delete time entry: " + err.message);
    }
  };
  const editTimeEntry = (entry) => {
    const hours = Math.floor(entry.minutes / 60);
    const mins = entry.minutes % 60;
    setTimeFormData({
      hours: hours.toString(),
      minutes: mins.toString(),
      hourly_rate_category_id: entry.hourly_rate_category_id || "",
      description: entry.description || "",
      is_billable: entry.is_billable
    });
    setEditingTimeEntry(entry);
    setShowTimeForm(true);
  };
  const cancelTimeForm = () => {
    setShowTimeForm(false);
    setEditingTimeEntry(null);
    setTimeFormData({ hours: "", minutes: "", hourly_rate_category_id: "", description: "", is_billable: true });
  };
  const formatTimeEntryMinutes = (mins) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };
  const handleCommentFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const { validFiles } = validateFiles(files, commentAttachments.length);
    if (validFiles.length > 0) {
      setCommentAttachments((prev) => [...prev, ...validFiles]);
    }
    if (commentFileInputRef.current) commentFileInputRef.current.value = "";
  };
  const removeCommentAttachment = (index) => {
    setCommentAttachments((prev) => prev.filter((_, i) => i !== index));
  };
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };
  const isImageFile = (file) => file.type?.startsWith("image/") || false;
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
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-red-400", children: [
      "Error: ",
      error
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/tickets", className: "text-slate-400 hover:text-white transition", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Ticket, { className: "w-6 h-6 text-purple-400" }),
          /* @__PURE__ */ jsxs("span", { className: "font-semibold text-lg", children: [
            "Ticket #",
            ticket?.number
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleDeleteTicket,
            className: "px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition text-sm",
            children: "Delete Ticket"
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
    /* @__PURE__ */ jsx("main", { className: "container mx-auto px-6 py-8", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6", children: [
          editingTicket ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
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
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-4", children: [
              /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: ticket?.title }),
              /* @__PURE__ */ jsx(
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
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(User, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx("span", { children: ticket?.submitter?.name }),
                /* @__PURE__ */ jsxs("span", { className: "text-slate-500", children: [
                  "(",
                  ticket?.submitter?.email,
                  ")"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx("span", { children: new Date(ticket?.created_at).toLocaleString() })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Markdown, { children: ticket?.content })
          ] }),
          ticket?.attachments?.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-6 pt-6 border-t border-slate-700", children: [
            /* @__PURE__ */ jsxs("h3", { className: "text-sm font-medium text-slate-400 mb-3 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Paperclip, { className: "w-4 h-4" }),
              "Attachments (",
              ticket.attachments.length,
              ")"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3", children: ticket.attachments.map((attachment) => /* @__PURE__ */ jsxs(
              "a",
              {
                href: attachment.url,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition group",
                children: [
                  attachment.is_image ? /* @__PURE__ */ jsx(Image, { className: "w-4 h-4 text-purple-400" }) : /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4 text-blue-400" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm text-slate-300 group-hover:text-white", children: attachment.filename }),
                  /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-500", children: [
                    "(",
                    attachment.human_size,
                    ")"
                  ] }),
                  /* @__PURE__ */ jsx(Download, { className: "w-3 h-3 text-slate-500 group-hover:text-slate-300" })
                ]
              },
              attachment.id
            )) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl", children: [
          /* @__PURE__ */ jsx("div", { className: "p-4 border-b border-slate-700", children: /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "w-5 h-5 text-purple-400" }),
            "Comments (",
            comments.length,
            ")"
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "divide-y divide-slate-700", children: comments.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-6 text-center text-slate-500", children: "No comments yet." }) : comments.map((comment) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: `p-4 ${comment.is_internal ? "bg-amber-500/5" : ""}`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-medium text-slate-200", children: comment.author_name }),
                    comment.is_internal && /* @__PURE__ */ jsxs("span", { className: "px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(Lock, { className: "w-3 h-3" }),
                      "Internal"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                    comment.can_modify && comment.edit_window_seconds > 0 && /* @__PURE__ */ jsx(EditCountdown, { seconds: comment.edit_window_seconds }),
                    /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500", children: new Date(comment.created_at).toLocaleString() }),
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
                comment.attachments?.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: comment.attachments.map((attachment) => /* @__PURE__ */ jsxs(
                  "a",
                  {
                    href: attachment.url,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm transition",
                    children: [
                      attachment.is_image ? /* @__PURE__ */ jsx(Image, { className: "w-4 h-4 text-blue-400" }) : /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4 text-amber-400" }),
                      /* @__PURE__ */ jsx("span", { className: "text-slate-300", children: attachment.filename }),
                      /* @__PURE__ */ jsxs("span", { className: "text-slate-500 text-xs", children: [
                        "(",
                        attachment.human_size,
                        ")"
                      ] })
                    ]
                  },
                  attachment.id
                )) })
              ]
            },
            comment.id
          )) }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmitComment, className: "p-4 border-t border-slate-700", children: [
            /* @__PURE__ */ jsx(
              LexicalMarkdownEditor,
              {
                value: newComment,
                onChange: setNewComment,
                placeholder: "Add a comment... (Markdown supported)",
                className: "mb-3"
              },
              commentKey
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                ref: commentFileInputRef,
                type: "file",
                multiple: true,
                onChange: handleCommentFileSelect,
                accept: "image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv",
                style: { display: "none" }
              }
            ),
            commentAttachments.length > 0 && /* @__PURE__ */ jsx("div", { className: "mb-3 flex flex-wrap gap-2", children: commentAttachments.map((file, index) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg text-sm",
                children: [
                  isImageFile(file) ? /* @__PURE__ */ jsx(Image, { className: "w-4 h-4 text-blue-400" }) : /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4 text-amber-400" }),
                  /* @__PURE__ */ jsx("span", { className: "text-slate-300 max-w-32 truncate", children: file.name }),
                  /* @__PURE__ */ jsxs("span", { className: "text-slate-500 text-xs", children: [
                    "(",
                    formatFileSize(file.size),
                    ")"
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => removeCommentAttachment(index),
                      className: "text-slate-400 hover:text-red-400",
                      children: /* @__PURE__ */ jsx(X, { className: "w-3 h-3" })
                    }
                  )
                ]
              },
              index
            )) }),
            commentUpload.isUploading && commentAttachments.length > 0 && /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsx(
              FileUploadProgress,
              {
                files: commentAttachments,
                fileProgress: commentUpload.fileProgress,
                isUploading: commentUpload.isUploading,
                onCancel: commentUpload.cancel
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: isInternal,
                      onChange: (e) => setIsInternal(e.target.checked),
                      className: "rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500"
                    }
                  ),
                  /* @__PURE__ */ jsxs("span", { className: "text-sm text-slate-400 flex items-center gap-1", children: [
                    isInternal ? /* @__PURE__ */ jsx(Lock, { className: "w-3 h-3" }) : /* @__PURE__ */ jsx(Unlock, { className: "w-3 h-3" }),
                    "Internal note"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (commentFileInputRef.current) {
                        commentFileInputRef.current.click();
                      }
                    },
                    className: "flex items-center gap-1 text-sm text-slate-400 hover:text-purple-400 transition",
                    children: [
                      /* @__PURE__ */ jsx(Paperclip, { className: "w-4 h-4" }),
                      "Attach"
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "submit",
                  disabled: submitting || commentUpload.isUploading || !newComment.trim(),
                  className: "flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed",
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
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4", children: "Quick Actions" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-2", children: "Status" }),
              /* @__PURE__ */ jsx(
                "select",
                {
                  value: ticket?.status?.id || "",
                  onChange: (e) => handleStatusChange(e.target.value),
                  className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
                  children: referenceData.statuses.map((status) => /* @__PURE__ */ jsx("option", { value: status.id, children: status.title }, status.id))
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-2", children: "Priority" }),
              /* @__PURE__ */ jsx(
                "select",
                {
                  value: ticket?.priority?.id || "",
                  onChange: (e) => handlePriorityChange(e.target.value),
                  className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
                  children: referenceData.priorities.map((priority) => /* @__PURE__ */ jsx("option", { value: priority.id, children: priority.title }, priority.id))
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm text-slate-400 mb-2", children: "Assigned To" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: ticket?.assignee?.id || "",
                  onChange: (e) => handleAssigneeChange(e.target.value),
                  className: "w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "Unassigned" }),
                    referenceData.admins.map((admin) => /* @__PURE__ */ jsx("option", { value: admin.id, children: admin.name }, admin.id))
                  ]
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-4", children: "Ticket Info" }),
          /* @__PURE__ */ jsxs("dl", { className: "space-y-3 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("dt", { className: "text-slate-400", children: "Project" }),
              /* @__PURE__ */ jsx("dd", { className: "text-slate-200", children: ticket?.project?.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("dt", { className: "text-slate-400", children: "Type" }),
              /* @__PURE__ */ jsx("dd", { className: "text-slate-200", children: ticket?.type?.title })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("dt", { className: "text-slate-400", children: "External ID" }),
              /* @__PURE__ */ jsx("dd", { className: "text-slate-200 font-mono text-xs", children: ticket?.external_id || "-" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("dt", { className: "text-slate-400", children: "Created" }),
              /* @__PURE__ */ jsx("dd", { className: "text-slate-200", children: new Date(ticket?.created_at).toLocaleDateString() })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("dt", { className: "text-slate-400", children: "Updated" }),
              /* @__PURE__ */ jsx("dd", { className: "text-slate-200", children: new Date(ticket?.updated_at).toLocaleDateString() })
            ] })
          ] })
        ] }),
        ticket?.labels?.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-4", children: [
          /* @__PURE__ */ jsxs("h3", { className: "font-semibold mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Tag, { className: "w-4 h-4 text-purple-400" }),
            "Labels"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: ticket.labels.map((label) => /* @__PURE__ */ jsx(
            "span",
            {
              className: "px-2 py-1 rounded text-xs font-medium",
              style: {
                backgroundColor: `${label.color}20`,
                color: label.color
              },
              children: label.name
            },
            label.id
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-4", children: [
          /* @__PURE__ */ jsxs("h3", { className: "font-semibold mb-4 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-purple-400" }),
              "Time Tracking"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              activeTimer ? /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: stopTimer,
                  className: "flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-medium",
                  children: [
                    /* @__PURE__ */ jsx(Square, { className: "w-3 h-3" }),
                    formatTimerDisplay(timerSeconds)
                  ]
                }
              ) : /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: startTimer,
                  className: "flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-medium",
                  children: [
                    /* @__PURE__ */ jsx(Play, { className: "w-3 h-3" }),
                    "Start"
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setShowTimeForm(true),
                  className: "flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs font-medium",
                  children: /* @__PURE__ */ jsx(Plus, { className: "w-3 h-3" })
                }
              )
            ] })
          ] }),
          showTimeForm && /* @__PURE__ */ jsxs("form", { onSubmit: editingTimeEntry ? handleUpdateTimeEntry : handleAddTimeEntry, className: "mb-4 p-3 bg-slate-700/50 rounded-lg space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs text-slate-400 mb-1", children: "Hours" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    min: "0",
                    value: timeFormData.hours,
                    onChange: (e) => setTimeFormData((prev) => ({ ...prev, hours: e.target.value })),
                    className: "w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
                    placeholder: "0"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: "block text-xs text-slate-400 mb-1", children: "Minutes" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    min: "0",
                    max: "59",
                    value: timeFormData.minutes,
                    onChange: (e) => setTimeFormData((prev) => ({ ...prev, minutes: e.target.value })),
                    className: "w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
                    placeholder: "0"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-slate-400 mb-1", children: "Category" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: timeFormData.hourly_rate_category_id,
                  onChange: (e) => setTimeFormData((prev) => ({ ...prev, hourly_rate_category_id: e.target.value })),
                  className: "w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "No category" }),
                    categories.map((cat) => /* @__PURE__ */ jsx("option", { value: cat.id, children: cat.name }, cat.id))
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-slate-400 mb-1", children: "Description" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  value: timeFormData.description,
                  onChange: (e) => setTimeFormData((prev) => ({ ...prev, description: e.target.value })),
                  rows: 2,
                  className: "w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none",
                  placeholder: "What did you work on?"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  id: "is_billable",
                  checked: timeFormData.is_billable,
                  onChange: (e) => setTimeFormData((prev) => ({ ...prev, is_billable: e.target.checked })),
                  className: "rounded bg-slate-600 border-slate-500 text-purple-600 focus:ring-purple-500"
                }
              ),
              /* @__PURE__ */ jsxs("label", { htmlFor: "is_billable", className: "text-xs text-slate-300 flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(DollarSign, { className: "w-3 h-3" }),
                "Billable"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  disabled: timeSubmitting,
                  className: "flex-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded text-xs font-medium",
                  children: timeSubmitting ? "Saving..." : editingTimeEntry ? "Update" : "Add Time"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: cancelTimeForm,
                  className: "px-3 py-1.5 bg-slate-600 hover:bg-slate-500 rounded text-xs font-medium",
                  children: "Cancel"
                }
              )
            ] })
          ] }),
          timeEntries.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            timeEntries.map((entry) => /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between p-2 bg-slate-700/30 rounded-lg text-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-purple-400", children: entry.formatted_time || formatTimeEntryMinutes(entry.minutes) }),
                  entry.is_billable && /* @__PURE__ */ jsx(DollarSign, { className: "w-3 h-3 text-green-400" }),
                  entry.hourly_rate_category && /* @__PURE__ */ jsx("span", { className: "text-xs px-1.5 py-0.5 bg-slate-600 rounded text-slate-300", children: entry.hourly_rate_category.name })
                ] }),
                entry.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 mt-1 truncate", children: entry.description }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-500 mt-1", children: [
                  entry.user?.name,
                  " • ",
                  new Date(entry.created_at).toLocaleDateString()
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 ml-2", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => editTimeEntry(entry),
                    className: "p-1 hover:bg-slate-600 rounded",
                    children: /* @__PURE__ */ jsx(Edit2, { className: "w-3 h-3 text-slate-400" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handleDeleteTimeEntry(entry.id),
                    className: "p-1 hover:bg-slate-600 rounded",
                    children: /* @__PURE__ */ jsx(Trash2, { className: "w-3 h-3 text-red-400" })
                  }
                )
              ] })
            ] }, entry.id)),
            /* @__PURE__ */ jsxs("div", { className: "pt-2 border-t border-slate-700 text-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-slate-400", children: [
                /* @__PURE__ */ jsx("span", { children: "Total Time:" }),
                /* @__PURE__ */ jsx("span", { className: "font-medium text-slate-200", children: formatTimeEntryMinutes(timeEntries.reduce((sum, e) => sum + e.minutes, 0)) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-slate-400", children: [
                /* @__PURE__ */ jsx("span", { children: "Billable:" }),
                /* @__PURE__ */ jsx("span", { className: "font-medium text-green-400", children: formatTimeEntryMinutes(timeEntries.filter((e) => e.is_billable).reduce((sum, e) => sum + e.minutes, 0)) })
              ] })
            ] })
          ] }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 text-center py-4", children: "No time logged yet" })
        ] })
      ] })
    ] }) }) })
  ] });
};
const __vite_glob_0_27 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: TicketDetail
}, Symbol.toStringTag, { value: "Module" }));
const TicketsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    priority: searchParams.get("priority") || "",
    project: searchParams.get("project") || "",
    search: searchParams.get("search") || ""
  });
  const [referenceData, setReferenceData] = useState({ statuses: [], priorities: [], projects: [] });
  useEffect(() => {
    fetchReferenceData();
  }, []);
  useEffect(() => {
    fetchTickets();
  }, [searchParams]);
  const fetchReferenceData = async () => {
    try {
      const [statusesRes, prioritiesRes, projectsRes] = await Promise.all([
        fetch("/api/helpdesk/admin/statuses", { credentials: "same-origin" }),
        fetch("/api/helpdesk/admin/priorities", { credentials: "same-origin" }),
        fetch("/api/helpdesk/admin/projects", { credentials: "same-origin" })
      ]);
      const [statusesJson, prioritiesJson, projectsJson] = await Promise.all([
        statusesRes.json(),
        prioritiesRes.json(),
        projectsRes.json()
      ]);
      setReferenceData({
        statuses: statusesJson.data || statusesJson,
        priorities: prioritiesJson.data || prioritiesJson,
        projects: projectsJson.data || projectsJson
      });
    } catch (err) {
      console.error("Failed to fetch reference data:", err);
    }
  };
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchParams.get("status")) params.append("status", searchParams.get("status"));
      if (searchParams.get("priority")) params.append("priority", searchParams.get("priority"));
      if (searchParams.get("project")) {
        const projectParam = searchParams.get("project");
        if (/^\d+$/.test(projectParam)) {
          params.append("project_id", projectParam);
        } else {
          params.append("project", projectParam);
        }
      }
      if (searchParams.get("search")) params.append("search", searchParams.get("search"));
      if (searchParams.get("page")) params.append("page", searchParams.get("page"));
      const response = await fetch(`/api/helpdesk/admin/tickets?${params}`, {
        credentials: "same-origin"
      });
      if (!response.ok) throw new Error("Failed to fetch tickets");
      const data = await response.json();
      setTickets(data.data || []);
      setPagination({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        total: data.total || 0
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) {
        newParams.set(k, v);
      }
    });
    setSearchParams(newParams);
  };
  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page);
    setSearchParams(newParams);
  };
  const handleLogout = async () => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      await fetch("/admin/logout", {
        method: "POST",
        headers: { "X-CSRF-TOKEN": csrfToken, "Accept": "application/json" },
        credentials: "same-origin"
      });
      window.location.href = "/admin/login";
    } catch (error2) {
      console.error("Logout failed:", error2);
    }
  };
  const toggleSelectAll = () => {
    if (selectedIds.length === tickets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(tickets.map((t) => t.id));
    }
  };
  const toggleSelect = (id) => {
    setSelectedIds(
      (prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} ticket(s)? This action cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      const response = await fetch("/api/helpdesk/admin/tickets/bulk-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({ ids: selectedIds })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete tickets");
      }
      setSelectedIds([]);
      fetchTickets();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk", className: "text-slate-400 hover:text-white transition", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Ticket, { className: "w-6 h-6 text-purple-400" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-lg", children: "Tickets" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("nav", { className: "flex items-center gap-6", children: [
          /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk", className: "text-slate-300 hover:text-white transition", children: "Dashboard" }),
          /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/projects", className: "text-slate-300 hover:text-white transition", children: "Projects" }),
          /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/users", className: "text-slate-300 hover:text-white transition", children: "Users" })
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
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-2", children: "Support Tickets" }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-400", children: "Manage support tickets from all connected projects" })
        ] }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/admin/helpdesk/tickets/create",
            className: "flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              "New Ticket"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-slate-400", children: [
          /* @__PURE__ */ jsx(Filter, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Filters:" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: filters.status,
              onChange: (e) => handleFilterChange("status", e.target.value),
              className: "bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "All Statuses" }),
                referenceData.statuses.map((status) => /* @__PURE__ */ jsx("option", { value: status.slug, children: status.title }, status.id))
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
                referenceData.priorities.map((priority) => /* @__PURE__ */ jsx("option", { value: priority.slug, children: priority.title }, priority.id))
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
                referenceData.projects.map((project) => /* @__PURE__ */ jsx("option", { value: project.slug, children: project.name }, project.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "Search tickets...",
              value: filters.search,
              onChange: (e) => handleFilterChange("search", e.target.value),
              className: "bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
            }
          )
        ] })
      ] }) }),
      selectedIds.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-slate-300", children: [
          selectedIds.length,
          " ticket",
          selectedIds.length !== 1 ? "s" : "",
          " selected"
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleBulkDelete,
            disabled: deleting,
            className: "flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition",
            children: [
              /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" }),
              deleting ? "Deleting..." : "Delete Selected"
            ]
          }
        )
      ] }),
      loading ? /* @__PURE__ */ jsx("div", { className: "text-center py-12 text-slate-400", children: "Loading tickets..." }) : error ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12 text-red-400", children: [
        "Error: ",
        error
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden mb-4", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsx("thead", { className: "bg-slate-700/50", children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 w-10", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: tickets.length > 0 && selectedIds.length === tickets.length,
                onChange: toggleSelectAll,
                className: "w-4 h-4 rounded border-slate-500 bg-slate-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
              }
            ) }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Ticket" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Project" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Submitter" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Priority" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Assigned" }),
            /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase", children: "Created" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-700", children: tickets.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 8, className: "px-6 py-8 text-center text-slate-500", children: "No tickets found matching your filters." }) }) : tickets.map((ticket) => /* @__PURE__ */ jsxs("tr", { className: `hover:bg-slate-700/30 ${selectedIds.includes(ticket.id) ? "bg-slate-700/20" : ""}`, children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: selectedIds.includes(ticket.id),
                onChange: () => toggleSelect(ticket.id),
                className: "w-4 h-4 rounded border-slate-500 bg-slate-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
              }
            ) }),
            /* @__PURE__ */ jsxs("td", { className: "px-6 py-4", children: [
              /* @__PURE__ */ jsxs(
                Link,
                {
                  to: `/admin/helpdesk/tickets/${ticket.id}`,
                  className: "text-purple-400 hover:text-purple-300 font-medium",
                  children: [
                    "#",
                    ticket.number
                  ]
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-300 truncate max-w-xs", children: ticket.title })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-slate-300", children: ticket.project?.name }),
            /* @__PURE__ */ jsxs("td", { className: "px-6 py-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-slate-300", children: ticket.submitter?.name }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500", children: ticket.submitter?.email })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status?.slug)}`, children: ticket.status?.title }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority?.slug)}`, children: ticket.priority?.title }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-slate-300", children: ticket.assigned_to?.name || /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: "Unassigned" }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-slate-400 text-sm", children: new Date(ticket.created_at).toLocaleDateString() })
          ] }, ticket.id)) })
        ] }) }),
        pagination.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-400", children: [
            "Showing page ",
            pagination.current_page,
            " of ",
            pagination.last_page,
            " (",
            pagination.total,
            " tickets)"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handlePageChange(pagination.current_page - 1),
                disabled: pagination.current_page === 1,
                className: "p-2 bg-slate-700 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition",
                children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handlePageChange(pagination.current_page + 1),
                disabled: pagination.current_page === pagination.last_page,
                className: "p-2 bg-slate-700 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition",
                children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
              }
            )
          ] })
        ] })
      ] })
    ] }) })
  ] });
};
const getStatusColor = (slug) => {
  const colors = {
    open: "bg-yellow-500/20 text-yellow-400",
    in_progress: "bg-purple-500/20 text-purple-400",
    pending: "bg-orange-500/20 text-orange-400",
    resolved: "bg-green-500/20 text-green-400",
    closed: "bg-slate-500/20 text-slate-400"
  };
  return colors[slug] || "bg-slate-500/20 text-slate-400";
};
const getPriorityColor = (slug) => {
  const colors = {
    low: "bg-blue-500/20 text-blue-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    high: "bg-orange-500/20 text-orange-400",
    urgent: "bg-red-500/20 text-red-400"
  };
  return colors[slug] || "bg-slate-500/20 text-slate-400";
};
const __vite_glob_0_28 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: TicketsList
}, Symbol.toStringTag, { value: "Module" }));
const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [showAddProject, setShowAddProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedRole, setSelectedRole] = useState("user");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    fetchUser();
    fetchRoles();
    fetchAvailableProjects();
  }, [userId]);
  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/helpdesk/admin/users/${userId}`, {
        credentials: "same-origin"
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/helpdesk/admin/roles", {
        credentials: "same-origin"
      });
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };
  const fetchAvailableProjects = async () => {
    try {
      const response = await fetch("/api/helpdesk/admin/projects", {
        credentials: "same-origin"
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableProjects(data.data || data);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };
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
    } catch (error2) {
      console.error("Logout failed:", error2);
    }
  };
  const handleDeleteUser = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      const response = await fetch(`/api/helpdesk/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": csrfToken,
          "Accept": "application/json"
        },
        credentials: "same-origin"
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete user");
      }
      navigate("/admin/helpdesk/users");
    } catch (err) {
      alert(err.message);
    }
  };
  const handleAddToProject = async () => {
    if (!selectedProject) {
      return;
    }
    setSaving(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      const response = await fetch(`/api/helpdesk/admin/projects/${selectedProject}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
          user_id: userId,
          role: selectedRole
        })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to add user to project");
      }
      setShowAddProject(false);
      setSelectedProject("");
      setSelectedRole("user");
      fetchUser();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };
  const handleUpdateRole = async (projectId, newRole) => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({ role: newRole })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update role");
      }
      fetchUser();
    } catch (err) {
      alert(err.message);
    }
  };
  const handleRemoveFromProject = async (projectId) => {
    if (!confirm("Are you sure you want to remove this user from the project?")) {
      return;
    }
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/users/${userId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": csrfToken,
          "Accept": "application/json"
        },
        credentials: "same-origin"
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to remove user from project");
      }
      fetchUser();
    } catch (err) {
      alert(err.message);
    }
  };
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "owner":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "manager":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "agent":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "user":
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };
  const projectsNotIn = availableProjects.filter(
    (project) => !user?.helpdesk_projects?.some((p) => p.id === project.id)
  );
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "text-slate-400", children: "Loading user..." }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-red-400", children: [
      "Error: ",
      error
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/users", className: "text-slate-400 hover:text-white transition", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(User, { className: "w-6 h-6 text-purple-400" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-lg", children: "User Details" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("nav", { className: "flex items-center gap-6", children: [
          /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk", className: "text-slate-300 hover:text-white transition", children: "Dashboard" }),
          /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/users", className: "text-slate-300 hover:text-white transition", children: "Users" })
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
    /* @__PURE__ */ jsx("main", { className: "container mx-auto px-6 py-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-purple-300 text-2xl font-bold", children: user?.name?.charAt(0)?.toUpperCase() || "?" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold flex items-center gap-3", children: [
              user?.name,
              user?.is_admin && /* @__PURE__ */ jsxs("span", { className: "px-2 py-1 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Shield, { className: "w-3 h-3" }),
                "Admin"
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-400", children: user?.email }),
            /* @__PURE__ */ jsxs("p", { className: "text-slate-500 text-sm mt-1", children: [
              "Created ",
              new Date(user?.created_at).toLocaleDateString()
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: `/admin/helpdesk/users/${userId}/edit`,
              className: "flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition",
              children: [
                /* @__PURE__ */ jsx(Edit2, { className: "w-4 h-4" }),
                "Edit"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: handleDeleteUser,
              className: "flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition",
              children: [
                /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" }),
                "Delete"
              ]
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-6 border-b border-slate-700 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-xl font-semibold flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(FolderOpen, { className: "w-5 h-5 text-purple-400" }),
              "Project Access"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-sm mt-1", children: "Manage which projects this user can access" })
          ] }),
          projectsNotIn.length > 0 && /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setShowAddProject(true),
              className: "flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition",
              children: [
                /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
                "Add to Project"
              ]
            }
          )
        ] }),
        showAddProject && /* @__PURE__ */ jsx("div", { className: "p-6 border-b border-slate-700 bg-slate-900/50", children: /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Project" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: selectedProject,
                onChange: (e) => setSelectedProject(e.target.value),
                className: "w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Select a project..." }),
                  projectsNotIn.map((project) => /* @__PURE__ */ jsx("option", { value: project.id, children: project.name }, project.id))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "w-48", children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Role" }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: selectedRole,
                onChange: (e) => setSelectedRole(e.target.value),
                className: "w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500",
                children: roles.map((role) => /* @__PURE__ */ jsx("option", { value: role.value, children: role.label }, role.value))
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handleAddToProject,
                disabled: !selectedProject || saving,
                className: "flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 rounded-lg transition",
                children: [
                  /* @__PURE__ */ jsx(Check, { className: "w-4 h-4" }),
                  "Add"
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  setShowAddProject(false);
                  setSelectedProject("");
                  setSelectedRole("user");
                },
                className: "p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition",
                children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "divide-y divide-slate-700", children: user?.helpdesk_projects?.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-12 text-center text-slate-400", children: "This user doesn't have access to any projects yet." }) : user?.helpdesk_projects?.map((project) => /* @__PURE__ */ jsxs("div", { className: "p-4 flex items-center justify-between hover:bg-slate-700/30 transition", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "w-3 h-3 rounded-full",
                style: { backgroundColor: project.color || "#8b5cf6" }
              }
            ),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(
                Link,
                {
                  to: `/admin/helpdesk/projects/${project.id}`,
                  className: "font-medium text-white hover:text-purple-400 transition",
                  children: project.name
                }
              ),
              project.description && /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-sm", children: project.description })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx(
              "select",
              {
                value: project.pivot?.role || "user",
                onChange: (e) => handleUpdateRole(project.id, e.target.value),
                className: `px-3 py-1 text-sm border rounded-full bg-transparent focus:outline-none ${getRoleBadgeColor(project.pivot?.role)}`,
                children: roles.map((role) => /* @__PURE__ */ jsx("option", { value: role.value, className: "bg-slate-800", children: role.label }, role.value))
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleRemoveFromProject(project.id),
                className: "p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition",
                title: "Remove from project",
                children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
              }
            )
          ] })
        ] }, project.id)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-slate-800/30 border border-slate-700/50 rounded-xl p-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-slate-400 mb-3", children: "Role Permissions" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 text-sm", children: roles.map((role) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: `px-2 py-1 text-xs rounded-full border ${getRoleBadgeColor(role.value)}`, children: role.label }),
          /* @__PURE__ */ jsx("span", { className: "text-slate-400", children: role.description })
        ] }, role.value)) })
      ] })
    ] }) })
  ] });
};
const __vite_glob_0_29 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: UserDetail
}, Symbol.toStringTag, { value: "Module" }));
const UserForm = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(userId);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    is_admin: false,
    send_welcome_email: true
  });
  const [validationErrors, setValidationErrors] = useState({});
  useEffect(() => {
    if (isEditing) {
      fetchUser();
    }
  }, [userId]);
  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/helpdesk/admin/users/${userId}`, {
        credentials: "same-origin"
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      const data = await response.json();
      setFormData({
        name: data.name || "",
        email: data.email || "",
        password: "",
        password_confirmation: "",
        is_admin: data.is_admin || false
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setValidationErrors({});
    setError(null);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      const submitData = { ...formData };
      if (isEditing && !submitData.password) {
        delete submitData.password;
        delete submitData.password_confirmation;
      }
      const response = await fetch(
        isEditing ? `/api/helpdesk/admin/users/${userId}` : "/api/helpdesk/admin/users",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": csrfToken,
            "Accept": "application/json"
          },
          credentials: "same-origin",
          body: JSON.stringify(submitData)
        }
      );
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          setValidationErrors(data.errors);
          return;
        }
        throw new Error(data.message || "Failed to save user");
      }
      const newUserId = data.data?.id || data.id || userId;
      navigate(`/admin/helpdesk/users/${newUserId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
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
    } catch (error2) {
      console.error("Logout failed:", error2);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "text-slate-400", children: "Loading user..." }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/users", className: "text-slate-400 hover:text-white transition", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(User, { className: "w-6 h-6 text-purple-400" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-lg", children: isEditing ? "Edit User" : "Create User" })
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
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-6", children: isEditing ? "Edit User" : "Create New User" }),
      error && /* @__PURE__ */ jsx("div", { className: "mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300", children: error }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Name" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "name",
              value: formData.name,
              onChange: handleChange,
              className: `w-full bg-slate-900 border rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 ${validationErrors.name ? "border-red-500" : "border-slate-700"}`,
              placeholder: "Enter user's name"
            }
          ),
          validationErrors.name && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-400", children: validationErrors.name[0] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Email" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "email",
              name: "email",
              value: formData.email,
              onChange: handleChange,
              className: `w-full bg-slate-900 border rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 ${validationErrors.email ? "border-red-500" : "border-slate-700"}`,
              placeholder: "Enter user's email"
            }
          ),
          validationErrors.email && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-400", children: validationErrors.email[0] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: [
            "Password ",
            isEditing && /* @__PURE__ */ jsx("span", { className: "text-slate-500", children: "(leave blank to keep current)" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "password",
              name: "password",
              value: formData.password,
              onChange: handleChange,
              className: `w-full bg-slate-900 border rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 ${validationErrors.password ? "border-red-500" : "border-slate-700"}`,
              placeholder: isEditing ? "••••••••" : "Enter password"
            }
          ),
          validationErrors.password && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-400", children: validationErrors.password[0] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Confirm Password" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "password",
              name: "password_confirmation",
              value: formData.password_confirmation,
              onChange: handleChange,
              className: "w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500",
              placeholder: isEditing ? "••••••••" : "Confirm password"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              id: "is_admin",
              name: "is_admin",
              checked: formData.is_admin,
              onChange: handleChange,
              className: "w-4 h-4 bg-slate-900 border-slate-700 rounded text-purple-500 focus:ring-purple-500"
            }
          ),
          /* @__PURE__ */ jsx("label", { htmlFor: "is_admin", className: "text-sm text-slate-300", children: "Admin user (full system access)" })
        ] }),
        !isEditing && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              id: "send_welcome_email",
              name: "send_welcome_email",
              checked: formData.send_welcome_email,
              onChange: handleChange,
              className: "w-4 h-4 bg-slate-900 border-slate-700 rounded text-purple-500 focus:ring-purple-500"
            }
          ),
          /* @__PURE__ */ jsx("label", { htmlFor: "send_welcome_email", className: "text-sm text-slate-300", children: "Send welcome email with login credentials" })
        ] }),
        !isEditing && /* @__PURE__ */ jsxs("div", { className: "p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm", children: [
          /* @__PURE__ */ jsx("strong", { children: "Note:" }),
          " New users will be required to change their password on first login."
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-4 pt-4 border-t border-slate-700", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/admin/helpdesk/users",
              className: "px-4 py-2 text-slate-300 hover:text-white transition",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: saving,
              className: "flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 rounded-lg transition",
              children: saving ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }),
                "Saving..."
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
                isEditing ? "Update User" : "Create User"
              ] })
            }
          )
        ] })
      ] })
    ] }) }) })
  ] });
};
const __vite_glob_0_30 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: UserForm
}, Symbol.toStringTag, { value: "Module" }));
const UsersList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [trashedFilter, setTrashedFilter] = useState(searchParams.get("trashed") || "");
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  });
  const [roles, setRoles] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [searchParams]);
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const page = searchParams.get("page") || 1;
      const search = searchParams.get("search") || "";
      const trashed = searchParams.get("trashed") || "";
      const params = new URLSearchParams({ page, per_page: 20 });
      if (search) {
        params.append("search", search);
      }
      if (trashed) {
        params.append("trashed", trashed);
      }
      const response = await fetch(`/api/helpdesk/admin/users?${params}`, {
        credentials: "same-origin"
      });
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data.data);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        per_page: data.per_page,
        total: data.total
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/helpdesk/admin/roles", {
        credentials: "same-origin"
      });
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    setSearchParams(params);
  };
  const handleTrashedFilter = (value) => {
    setTrashedFilter(value);
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("trashed", value);
    } else {
      params.delete("trashed");
    }
    params.set("page", "1");
    setSearchParams(params);
  };
  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };
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
    } catch (error2) {
      console.error("Logout failed:", error2);
    }
  };
  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user? They can be restored later.")) {
      return;
    }
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      const response = await fetch(`/api/helpdesk/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": csrfToken,
          "Accept": "application/json"
        },
        credentials: "same-origin"
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete user");
      }
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };
  const handleRestoreUser = async (userId) => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      const response = await fetch(`/api/helpdesk/admin/users/${userId}/restore`, {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": csrfToken,
          "Accept": "application/json"
        },
        credentials: "same-origin"
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to restore user");
      }
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };
  const handleForceDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this user? This action cannot be undone!")) {
      return;
    }
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      const response = await fetch(`/api/helpdesk/admin/users/${userId}/force`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": csrfToken,
          "Accept": "application/json"
        },
        credentials: "same-origin"
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to permanently delete user");
      }
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "owner":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "manager":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "agent":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "user":
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };
  if (loading && users.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "text-slate-400", children: "Loading users..." }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-red-400", children: [
      "Error: ",
      error
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk", className: "text-slate-400 hover:text-white transition", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Users, { className: "w-6 h-6 text-purple-400" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-lg", children: "Users" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("nav", { className: "flex items-center gap-6", children: [
          /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk", className: "text-slate-300 hover:text-white transition", children: "Dashboard" }),
          /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/tickets", className: "text-slate-300 hover:text-white transition", children: "Tickets" }),
          /* @__PURE__ */ jsx(Link, { to: "/admin/helpdesk/projects", className: "text-slate-300 hover:text-white transition", children: "Projects" })
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
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-2", children: "User Management" }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-400", children: "Manage helpdesk users and their project access" })
        ] }),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/admin/helpdesk/users/create",
            className: "flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              "Add User"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6 flex flex-wrap gap-4", children: [
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSearch, className: "flex gap-2 flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative flex-1 max-w-md", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                placeholder: "Search users by name or email...",
                value: searchTerm,
                onChange: (e) => setSearchTerm(e.target.value),
                className: "w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              className: "px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition",
              children: "Search"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: trashedFilter,
            onChange: (e) => handleTrashedFilter(e.target.value),
            className: "bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Active Users" }),
              /* @__PURE__ */ jsx("option", { value: "with", children: "All Users (incl. deleted)" }),
              /* @__PURE__ */ jsx("option", { value: "only", children: "Deleted Users Only" })
            ]
          }
        )
      ] }),
      trashedFilter && /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "w-5 h-5" }),
        /* @__PURE__ */ jsx("span", { children: trashedFilter === "only" ? "Showing deleted users only. These users can be restored or permanently deleted." : "Showing all users including deleted ones. Deleted users are highlighted." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-slate-800", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "text-left px-6 py-4 text-sm font-medium text-slate-400", children: "User" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-6 py-4 text-sm font-medium text-slate-400", children: "Email" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-6 py-4 text-sm font-medium text-slate-400", children: "Projects" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-6 py-4 text-sm font-medium text-slate-400", children: trashedFilter ? "Status" : "Created" }),
          /* @__PURE__ */ jsx("th", { className: "text-right px-6 py-4 text-sm font-medium text-slate-400", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-700", children: users.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: "5", className: "px-6 py-12 text-center text-slate-400", children: trashedFilter === "only" ? "No deleted users found" : "No users found" }) }) : users.map((user) => /* @__PURE__ */ jsxs("tr", { className: `hover:bg-slate-700/50 transition ${user.deleted_at ? "opacity-60 bg-red-900/10" : ""}`, children: [
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center ${user.deleted_at ? "bg-red-500/20" : "bg-purple-500/20"}`, children: /* @__PURE__ */ jsx("span", { className: `font-medium ${user.deleted_at ? "text-red-300" : "text-purple-300"}`, children: user.name?.charAt(0)?.toUpperCase() || "?" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: `font-medium ${user.deleted_at ? "text-slate-400 line-through" : "text-white"}`, children: user.name }),
              user.is_admin && /* @__PURE__ */ jsx("span", { className: "text-xs text-purple-400", children: "Admin" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: `px-6 py-4 ${user.deleted_at ? "text-slate-500" : "text-slate-300"}`, children: user.email }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
            user.helpdesk_projects && user.helpdesk_projects.length > 0 ? user.helpdesk_projects.slice(0, 3).map((project) => /* @__PURE__ */ jsxs(
              "span",
              {
                className: `px-2 py-1 text-xs rounded-full border ${getRoleBadgeColor(project.pivot?.role)}`,
                children: [
                  project.name,
                  " (",
                  project.pivot?.role || "member",
                  ")"
                ]
              },
              project.id
            )) : /* @__PURE__ */ jsx("span", { className: "text-slate-500 text-sm", children: "No projects" }),
            user.helpdesk_projects && user.helpdesk_projects.length > 3 && /* @__PURE__ */ jsxs("span", { className: "px-2 py-1 text-xs rounded-full bg-slate-600 text-slate-300", children: [
              "+",
              user.helpdesk_projects.length - 3,
              " more"
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-sm", children: user.deleted_at ? /* @__PURE__ */ jsxs("span", { className: "text-red-400", children: [
            "Deleted ",
            new Date(user.deleted_at).toLocaleDateString()
          ] }) : /* @__PURE__ */ jsx("span", { className: "text-slate-400", children: new Date(user.created_at).toLocaleDateString() }) }),
          /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-end gap-2", children: user.deleted_at ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleRestoreUser(user.id),
                className: "p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700 rounded-lg transition",
                title: "Restore User",
                children: /* @__PURE__ */ jsx(RotateCcw, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleForceDeleteUser(user.id),
                className: "p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition",
                title: "Permanently Delete",
                children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
              }
            )
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                to: `/admin/helpdesk/users/${user.id}`,
                className: "p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition",
                title: "View & Manage User",
                children: /* @__PURE__ */ jsx(Edit2, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleDeleteUser(user.id),
                className: "p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition",
                title: "Delete User",
                children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
              }
            )
          ] }) }) })
        ] }, user.id)) })
      ] }) }),
      pagination.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-slate-400", children: [
          "Showing ",
          (pagination.current_page - 1) * pagination.per_page + 1,
          " to",
          " ",
          Math.min(pagination.current_page * pagination.per_page, pagination.total),
          " of",
          " ",
          pagination.total,
          " users"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handlePageChange(pagination.current_page - 1),
              disabled: pagination.current_page === 1,
              className: "p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed",
              children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5" })
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "px-4 py-2 text-sm", children: [
            "Page ",
            pagination.current_page,
            " of ",
            pagination.last_page
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handlePageChange(pagination.current_page + 1),
              disabled: pagination.current_page === pagination.last_page,
              className: "p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed",
              children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5" })
            }
          )
        ] })
      ] })
    ] }) })
  ] });
};
const __vite_glob_0_31 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: UsersList
}, Symbol.toStringTag, { value: "Module" }));
export {
  FileUploadProgress as F,
  LexicalMarkdownEditor as L,
  Markdown as M,
  __vite_glob_0_31 as _,
  __vite_glob_0_30 as a,
  __vite_glob_0_29 as b,
  __vite_glob_0_28 as c,
  __vite_glob_0_27 as d,
  __vite_glob_0_26 as e,
  __vite_glob_0_25 as f,
  __vite_glob_0_24 as g,
  __vite_glob_0_23 as h,
  __vite_glob_0_22 as i,
  __vite_glob_0_21 as j,
  __vite_glob_0_20 as k,
  __vite_glob_0_19 as l,
  __vite_glob_0_18 as m,
  __vite_glob_0_17 as n,
  useFileUpload as u,
  validateFiles as v
};
