import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2, ArrowLeft, Plus, Sparkles, Edit, Trash2, FolderOpen, X, Save, Undo, Redo, Bold, Italic, Underline, Strikethrough, Code, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Link as Link$1, AlignLeft, AlignCenter, AlignRight, AlignJustify, ImagePlus, Image, Eye, Send, CheckCircle, XCircle, Settings, FileText, Clock, Search, RefreshCw, Zap, Mail } from "lucide-react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode, $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode, INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from "@lexical/list";
import { LinkNode, AutoLinkNode, $createLinkNode } from "@lexical/link";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { $generateNodesFromDOM, $generateHtmlFromNodes } from "@lexical/html";
import { $setBlocksType } from "@lexical/selection";
import { createCommand, DecoratorNode, UNDO_COMMAND, REDO_COMMAND, FORMAT_ELEMENT_COMMAND, $insertNodes, $createParagraphNode, $getRoot, $getNodeByKey, FORMAT_TEXT_COMMAND, $getSelection, $isRangeSelection } from "lexical";
function CategoriesIndex() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    prompt_guidance: "",
    image_prompt: "",
    is_active: true
  });
  useEffect(() => {
    fetchCategories();
  }, []);
  const fetchCategories = async () => {
    try {
      const response = await fetch("/admin/articles/categories/api/list", {
        headers: { Accept: "application/json" }
      });
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };
  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      prompt_guidance: "",
      image_prompt: "",
      is_active: true
    });
    setShowModal(true);
  };
  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      prompt_guidance: category.prompt_guidance || "",
      image_prompt: category.image_prompt || "",
      is_active: category.is_active ?? true
    });
    setShowModal(true);
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (name === "name" && !editingCategory) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      const url = editingCategory ? `/admin/articles/categories/${editingCategory.id}` : "/admin/articles/categories";
      const method = editingCategory ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setShowModal(false);
        fetchCategories();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to save category");
      }
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save category");
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (categoryId) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    setDeleting(categoryId);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      const response = await fetch(
        `/admin/articles/categories/${categoryId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "X-CSRF-TOKEN": csrfToken
          }
        }
      );
      if (response.ok) {
        fetchCategories();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(null);
    }
  };
  const handleGenerate = async (categoryId) => {
    setGenerating(categoryId);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      const response = await fetch("/admin/articles/generate", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken
        },
        body: JSON.stringify({ category_id: categoryId })
      });
      if (response.ok) {
        const data = await response.json();
        alert(`Article "${data.article?.title || "New article"}" generated successfully!`);
        fetchCategories();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to generate article");
      }
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate article");
    } finally {
      setGenerating(null);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 text-cyan-500 animate-spin" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-40", children: /* @__PURE__ */ jsx("div", { className: "max-w-5xl mx-auto px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/admin/articles",
            className: "p-2 hover:bg-slate-800 rounded-lg transition-colors",
            children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold", children: "Article Categories" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "Manage blog categories for AI generation" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: openCreateModal,
          className: "flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
            "New Category"
          ]
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsx("main", { className: "max-w-5xl mx-auto px-6 py-8", children: /* @__PURE__ */ jsx("div", { className: "bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-slate-800", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "text-left px-6 py-4 text-sm font-medium text-slate-300", children: "Category" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-6 py-4 text-sm font-medium text-slate-300", children: "Articles" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-6 py-4 text-sm font-medium text-slate-300", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "text-right px-6 py-4 text-sm font-medium text-slate-300", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-700", children: categories.length > 0 ? categories.map((category) => /* @__PURE__ */ jsxs(
        "tr",
        {
          className: "hover:bg-slate-800/50 transition-colors",
          children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-white", children: category.name }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: category.slug })
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: "text-slate-300", children: category.articles_count || 0 }) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx(
              "span",
              {
                className: `inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${category.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`,
                children: category.is_active ? "Active" : "Inactive"
              }
            ) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleGenerate(category.id),
                  disabled: generating === category.id || !category.is_active,
                  title: category.is_active ? "Generate AI article" : "Category is inactive",
                  className: "p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                  children: generating === category.id ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => openEditModal(category),
                  className: "p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors",
                  children: /* @__PURE__ */ jsx(Edit, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => handleDelete(category.id),
                  disabled: deleting === category.id,
                  className: "p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50",
                  children: deleting === category.id ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
                }
              )
            ] }) })
          ]
        },
        category.id
      )) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsxs("td", { colSpan: 4, className: "px-6 py-12 text-center", children: [
        /* @__PURE__ */ jsx(FolderOpen, { className: "w-12 h-12 text-slate-600 mx-auto mb-4" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-400", children: "No categories yet" }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: openCreateModal,
            className: "inline-flex items-center gap-2 mt-4 text-cyan-400 hover:text-cyan-300",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              "Create your first category"
            ]
          }
        )
      ] }) }) })
    ] }) }) }),
    showModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-6 border-b border-slate-700", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: editingCategory ? "Edit Category" : "New Category" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowModal(false),
            className: "p-2 hover:bg-slate-700 rounded-lg transition-colors",
            children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Name *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "name",
              value: formData.name,
              onChange: handleChange,
              required: true,
              className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500",
              placeholder: "Category name"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Slug" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "slug",
              value: formData.slug,
              onChange: handleChange,
              className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500",
              placeholder: "category-slug"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Description" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              name: "description",
              value: formData.description,
              onChange: handleChange,
              rows: 2,
              className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500",
              placeholder: "Brief description..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "AI Prompt Guidance" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              name: "prompt_guidance",
              value: formData.prompt_guidance,
              onChange: handleChange,
              rows: 3,
              className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500",
              placeholder: "Instructions for AI when generating articles..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Image Prompt" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              name: "image_prompt",
              value: formData.image_prompt,
              onChange: handleChange,
              rows: 2,
              className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500",
              placeholder: "Style guidance for DALL-E images..."
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between pt-2", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              name: "is_active",
              checked: formData.is_active,
              onChange: handleChange,
              className: "w-4 h-4 rounded border-slate-600 text-cyan-600 focus:ring-cyan-500 bg-slate-700"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-slate-300", children: "Active" })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-3 pt-4 border-t border-slate-700", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setShowModal(false),
              className: "px-4 py-2 text-slate-300 hover:text-white transition-colors",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "submit",
              disabled: saving,
              className: "flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-lg transition-colors",
              children: [
                saving ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
                "Save Category"
              ]
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CategoriesIndex
}, Symbol.toStringTag, { value: "Module" }));
const INSERT_IMAGE_COMMAND = createCommand("INSERT_IMAGE_COMMAND");
class ImageNode extends DecoratorNode {
  __src;
  __altText;
  __width;
  __height;
  __alignment;
  // 'none', 'left', 'right'
  static getType() {
    return "image";
  }
  static clone(node) {
    return new ImageNode(node.__src, node.__altText, node.__width, node.__height, node.__alignment, node.__key);
  }
  constructor(src, altText = "", width = "auto", height = "auto", alignment = "none", key) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__height = height;
    this.__alignment = alignment;
  }
  createDOM() {
    const div = document.createElement("div");
    div.className = "editor-image-container my-4";
    return div;
  }
  updateDOM() {
    return false;
  }
  setWidthAndHeight(width, height) {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }
  setAlignment(alignment) {
    const writable = this.getWritable();
    writable.__alignment = alignment;
  }
  static importJSON(serializedNode) {
    const { src, altText, width, height, alignment } = serializedNode;
    return $createImageNode({ src, altText, width, height, alignment });
  }
  exportJSON() {
    return {
      type: "image",
      version: 1,
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      alignment: this.__alignment
    };
  }
  exportDOM() {
    const img = document.createElement("img");
    img.src = this.__src;
    img.alt = this.__altText;
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.borderRadius = "8px";
    if (this.__width !== "auto") {
      img.width = this.__width;
    }
    if (this.__height !== "auto") {
      img.height = this.__height;
    }
    if (this.__alignment === "left") {
      img.style.float = "left";
      img.style.marginRight = "1rem";
      img.style.marginBottom = "0.5rem";
    } else if (this.__alignment === "right") {
      img.style.float = "right";
      img.style.marginLeft = "1rem";
      img.style.marginBottom = "0.5rem";
    }
    return { element: img };
  }
  static importDOM() {
    return {
      img: () => ({
        conversion: (domNode) => {
          const src = domNode.getAttribute("src");
          const altText = domNode.getAttribute("alt") || "";
          const width = domNode.getAttribute("width") || "auto";
          const height = domNode.getAttribute("height") || "auto";
          const floatStyle = domNode.style?.float || "";
          let alignment = "none";
          if (floatStyle === "left") alignment = "left";
          else if (floatStyle === "right") alignment = "right";
          if (src) {
            return { node: $createImageNode({ src, altText, width, height, alignment }) };
          }
          return null;
        },
        priority: 0
      })
    };
  }
  decorate() {
    return /* @__PURE__ */ jsx(
      ImageComponent,
      {
        src: this.__src,
        altText: this.__altText,
        width: this.__width,
        height: this.__height,
        alignment: this.__alignment,
        nodeKey: this.__key
      }
    );
  }
}
function $createImageNode({ src, altText = "", width = "auto", height = "auto", alignment = "none" }) {
  return new ImageNode(src, altText, width, height, alignment);
}
function ImageComponent({ src, altText, width, height, alignment, nodeKey }) {
  const [editor] = useLexicalComposerContext();
  const imageRef = useRef(null);
  const [isSelected, setIsSelected] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(width === "auto" ? null : Number(width));
  const [currentHeight, setCurrentHeight] = useState(height === "auto" ? null : Number(height));
  const [currentAlignment, setCurrentAlignment] = useState(alignment || "none");
  const dimensionsRef = useRef({ width: currentWidth, height: currentHeight });
  useEffect(() => {
    dimensionsRef.current = { width: currentWidth, height: currentHeight };
  }, [currentWidth, currentHeight]);
  const handleAlignmentChange = useCallback((newAlignment) => {
    setCurrentAlignment(newAlignment);
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if (node && node instanceof ImageNode) {
        node.setAlignment(newAlignment);
      }
    });
  }, [editor, nodeKey]);
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    setIsSelected(true);
  }, []);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (imageRef.current && !imageRef.current.contains(e.target)) {
        setIsSelected(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleResizeStart = useCallback((e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const img = imageRef.current?.querySelector("img");
    if (!img) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = img.offsetWidth;
    const startHeight = img.offsetHeight;
    const aspectRatio = startWidth / startHeight;
    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      let newWidth, newHeight;
      if (direction.includes("e")) {
        newWidth = Math.max(100, startWidth + deltaX);
        newHeight = newWidth / aspectRatio;
      } else if (direction.includes("w")) {
        newWidth = Math.max(100, startWidth - deltaX);
        newHeight = newWidth / aspectRatio;
      } else if (direction.includes("s")) {
        newHeight = Math.max(50, startHeight + deltaY);
        newWidth = newHeight * aspectRatio;
      } else if (direction.includes("n")) {
        newHeight = Math.max(50, startHeight - deltaY);
        newWidth = newHeight * aspectRatio;
      }
      if (direction === "se" || direction === "nw") {
        const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY * aspectRatio;
        newWidth = Math.max(100, startWidth + (direction === "se" ? delta : -delta));
        newHeight = newWidth / aspectRatio;
      } else if (direction === "sw" || direction === "ne") {
        const delta = Math.abs(deltaX) > Math.abs(deltaY) ? -deltaX : deltaY * aspectRatio;
        newWidth = Math.max(100, startWidth + (direction === "ne" ? delta : -delta));
        newHeight = newWidth / aspectRatio;
      }
      setCurrentWidth(Math.round(newWidth));
      setCurrentHeight(Math.round(newHeight));
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      const { width: finalWidth, height: finalHeight } = dimensionsRef.current;
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if (node && finalWidth && finalHeight && node instanceof ImageNode) {
          node.setWidthAndHeight(finalWidth, finalHeight);
        }
      });
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [editor, nodeKey]);
  const handleImageLoad = useCallback((e) => {
    if (!currentWidth && !currentHeight) {
      const img = e.target;
      const maxWidth = 600;
      if (img.naturalWidth > maxWidth) {
        const ratio = maxWidth / img.naturalWidth;
        setCurrentWidth(maxWidth);
        setCurrentHeight(Math.round(img.naturalHeight * ratio));
      }
    }
  }, [currentWidth, currentHeight]);
  const getFloatStyle = () => {
    if (currentAlignment === "left") {
      return { float: "left", marginRight: "1rem", marginBottom: "0.5rem" };
    } else if (currentAlignment === "right") {
      return { float: "right", marginLeft: "1rem", marginBottom: "0.5rem" };
    }
    return {};
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: imageRef,
      className: `relative inline-block my-2 ${isSelected ? "ring-2 ring-cyan-500 ring-offset-2" : ""}`,
      onClick: handleClick,
      style: {
        cursor: isResizing ? "nwse-resize" : "pointer",
        ...getFloatStyle()
      },
      children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src,
            alt: altText,
            className: "block rounded-lg shadow-md",
            style: {
              width: currentWidth ? `${currentWidth}px` : "auto",
              height: currentHeight ? `${currentHeight}px` : "auto",
              maxWidth: "100%"
            },
            onLoad: handleImageLoad,
            draggable: false
          }
        ),
        isSelected && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1 bg-slate-800 rounded-lg p-1 shadow-lg", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: (e) => {
                  e.stopPropagation();
                  handleAlignmentChange("left");
                },
                className: `p-1.5 rounded ${currentAlignment === "left" ? "bg-cyan-600 text-white" : "text-slate-300 hover:bg-slate-700"}`,
                title: "Float Left (text wraps right)",
                children: /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
                  /* @__PURE__ */ jsx("rect", { x: "3", y: "5", width: "8", height: "8", rx: "1" }),
                  /* @__PURE__ */ jsx("path", { strokeLinecap: "round", d: "M14 7h7M14 11h7M3 17h18M3 21h18" })
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: (e) => {
                  e.stopPropagation();
                  handleAlignmentChange("none");
                },
                className: `p-1.5 rounded ${currentAlignment === "none" ? "bg-cyan-600 text-white" : "text-slate-300 hover:bg-slate-700"}`,
                title: "Inline (no float)",
                children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("rect", { x: "6", y: "8", width: "12", height: "8", rx: "1" }) })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: (e) => {
                  e.stopPropagation();
                  handleAlignmentChange("right");
                },
                className: `p-1.5 rounded ${currentAlignment === "right" ? "bg-cyan-600 text-white" : "text-slate-300 hover:bg-slate-700"}`,
                title: "Float Right (text wraps left)",
                children: /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
                  /* @__PURE__ */ jsx("rect", { x: "13", y: "5", width: "8", height: "8", rx: "1" }),
                  /* @__PURE__ */ jsx("path", { strokeLinecap: "round", d: "M3 7h7M3 11h7M3 17h18M3 21h18" })
                ] })
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute -top-1 -left-1 w-3 h-3 bg-cyan-500 border border-white rounded-sm cursor-nw-resize",
              onMouseDown: (e) => handleResizeStart(e, "nw")
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 border border-white rounded-sm cursor-ne-resize",
              onMouseDown: (e) => handleResizeStart(e, "ne")
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute -bottom-1 -left-1 w-3 h-3 bg-cyan-500 border border-white rounded-sm cursor-sw-resize",
              onMouseDown: (e) => handleResizeStart(e, "sw")
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute -bottom-1 -right-1 w-3 h-3 bg-cyan-500 border border-white rounded-sm cursor-se-resize",
              onMouseDown: (e) => handleResizeStart(e, "se")
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute top-1/2 -left-1 w-2 h-6 -translate-y-1/2 bg-cyan-500 border border-white rounded-sm cursor-w-resize",
              onMouseDown: (e) => handleResizeStart(e, "w")
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute top-1/2 -right-1 w-2 h-6 -translate-y-1/2 bg-cyan-500 border border-white rounded-sm cursor-e-resize",
              onMouseDown: (e) => handleResizeStart(e, "e")
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute -top-1 left-1/2 w-6 h-2 -translate-x-1/2 bg-cyan-500 border border-white rounded-sm cursor-n-resize",
              onMouseDown: (e) => handleResizeStart(e, "n")
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute -bottom-1 left-1/2 w-6 h-2 -translate-x-1/2 bg-cyan-500 border border-white rounded-sm cursor-s-resize",
              onMouseDown: (e) => handleResizeStart(e, "s")
            }
          ),
          currentWidth && currentHeight && /* @__PURE__ */ jsxs("div", { className: "absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap", children: [
            currentWidth,
            " × ",
            currentHeight
          ] })
        ] })
      ]
    }
  );
}
function ImagePlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        const { src, altText } = payload;
        const imageNode = $createImageNode({ src, altText });
        $insertNodes([imageNode]);
        const paragraphNode = $createParagraphNode();
        imageNode.insertAfter(paragraphNode);
        paragraphNode.select();
        return true;
      },
      0
    );
  }, [editor]);
  return null;
}
const theme = {
  ltr: "text-left",
  rtl: "text-right",
  paragraph: "mb-2 text-slate-900",
  quote: "border-l-4 border-slate-300 pl-4 italic text-slate-600 my-4",
  heading: {
    h1: "text-3xl font-bold mb-4 text-slate-900",
    h2: "text-2xl font-bold mb-3 text-slate-900",
    h3: "text-xl font-bold mb-2 text-slate-900",
    h4: "text-lg font-bold mb-2 text-slate-900",
    h5: "text-base font-bold mb-2 text-slate-900"
  },
  list: {
    nested: {
      listitem: "list-none"
    },
    ol: "list-decimal ml-6 mb-4 text-slate-900",
    ul: "list-disc ml-6 mb-4 text-slate-900",
    listitem: "mb-1"
  },
  link: "text-cyan-600 hover:underline cursor-pointer",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "bg-slate-100 px-1 py-0.5 rounded font-mono text-sm text-slate-900"
  },
  code: "bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm block my-4 overflow-x-auto",
  image: "my-4 rounded-lg"
};
const ToolbarButton = ({ icon: Icon, onClick, isActive, title, disabled }) => /* @__PURE__ */ jsx(
  "button",
  {
    type: "button",
    onClick,
    disabled,
    className: `p-2 rounded hover:bg-slate-200 transition-colors ${isActive ? "bg-slate-200 text-cyan-600" : "text-slate-600"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`,
    title,
    children: /* @__PURE__ */ jsx(Icon, { className: `w-4 h-4 ${disabled ? "animate-spin" : ""}` })
  }
);
const ToolbarDivider = () => /* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-slate-300 mx-1" });
function ToolbarPlugin({ onImageUpload, featuredImage }) {
  const [editor] = useLexicalComposerContext();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const formatText = (format) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };
  const insertList = (type) => {
    if (type === "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, void 0);
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, void 0);
    }
  };
  const formatHeading = (headingType) => {
    editor.update(() => {
      const sel = $getSelection();
      if ($isRangeSelection(sel)) {
        $setBlocksType(sel, () => $createHeadingNode(headingType));
      }
    });
  };
  const formatQuote = () => {
    editor.update(() => {
      const sel = $getSelection();
      if ($isRangeSelection(sel)) {
        $setBlocksType(sel, () => $createQuoteNode());
      }
    });
  };
  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const linkNode = $createLinkNode(url);
          selection.insertNodes([linkNode]);
        }
      });
    }
  };
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  const insertFeaturedImage = () => {
    if (!featuredImage) {
      alert("No featured image set. Please generate or upload a featured image first.");
      return;
    }
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
      src: featuredImage,
      altText: "Featured Image"
    });
  };
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB");
      return;
    }
    setIsUploading(true);
    try {
      let imageUrl;
      if (onImageUpload) {
        imageUrl = await onImageUpload(file);
      } else {
        const formData = new FormData();
        formData.append("image", file);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
        const response = await fetch("/api/admin/upload/image", {
          method: "POST",
          headers: {
            "X-CSRF-TOKEN": csrfToken,
            "Accept": "application/json"
          },
          body: formData
        });
        if (!response.ok) {
          throw new Error("Upload failed");
        }
        const data = await response.json();
        imageUrl = data.url;
      }
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
        src: imageUrl,
        altText: file.name
      });
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.5 p-2 border-b border-slate-200 bg-slate-50 rounded-t-lg flex-wrap", children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        ref: fileInputRef,
        type: "file",
        accept: "image/*",
        onChange: handleFileChange,
        className: "hidden"
      }
    ),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: Undo,
        onClick: () => editor.dispatchCommand(UNDO_COMMAND, void 0),
        title: "Undo"
      }
    ),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: Redo,
        onClick: () => editor.dispatchCommand(REDO_COMMAND, void 0),
        title: "Redo"
      }
    ),
    /* @__PURE__ */ jsx(ToolbarDivider, {}),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: Bold,
        onClick: () => formatText("bold"),
        title: "Bold (Ctrl+B)"
      }
    ),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: Italic,
        onClick: () => formatText("italic"),
        title: "Italic (Ctrl+I)"
      }
    ),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: Underline,
        onClick: () => formatText("underline"),
        title: "Underline (Ctrl+U)"
      }
    ),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: Strikethrough,
        onClick: () => formatText("strikethrough"),
        title: "Strikethrough"
      }
    ),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: Code,
        onClick: () => formatText("code"),
        title: "Inline Code"
      }
    ),
    /* @__PURE__ */ jsx(ToolbarDivider, {}),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: Heading1,
        onClick: () => formatHeading("h1"),
        title: "Heading 1"
      }
    ),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: Heading2,
        onClick: () => formatHeading("h2"),
        title: "Heading 2"
      }
    ),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: Heading3,
        onClick: () => formatHeading("h3"),
        title: "Heading 3"
      }
    ),
    /* @__PURE__ */ jsx(ToolbarDivider, {}),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: List,
        onClick: () => insertList("bullet"),
        title: "Bullet List"
      }
    ),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: ListOrdered,
        onClick: () => insertList("number"),
        title: "Numbered List"
      }
    ),
    /* @__PURE__ */ jsx(ToolbarDivider, {}),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: Quote,
        onClick: formatQuote,
        title: "Quote"
      }
    ),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: Link$1,
        onClick: insertLink,
        title: "Insert Link"
      }
    ),
    /* @__PURE__ */ jsx(ToolbarDivider, {}),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: AlignLeft,
        onClick: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left"),
        title: "Align Left"
      }
    ),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: AlignCenter,
        onClick: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center"),
        title: "Align Center"
      }
    ),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: AlignRight,
        onClick: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right"),
        title: "Align Right"
      }
    ),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: AlignJustify,
        onClick: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify"),
        title: "Justify"
      }
    ),
    /* @__PURE__ */ jsx(ToolbarDivider, {}),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: isUploading ? Loader2 : ImagePlus,
        onClick: handleImageClick,
        title: "Insert Image",
        disabled: isUploading
      }
    ),
    /* @__PURE__ */ jsx(
      ToolbarButton,
      {
        icon: Image,
        onClick: insertFeaturedImage,
        title: featuredImage ? "Insert Featured Image" : "No featured image available",
        disabled: !featuredImage
      }
    )
  ] });
}
function InitialContentPlugin({ initialContent }) {
  const [editor] = useLexicalComposerContext();
  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => {
    if (initialContent && !hasLoaded) {
      editor.update(() => {
        try {
          const parser = new DOMParser();
          const wrappedContent = `<div>${initialContent}</div>`;
          const dom = parser.parseFromString(wrappedContent, "text/html");
          const nodes = $generateNodesFromDOM(editor, dom);
          const validNodes = nodes.filter((node) => {
            const type = node.getType();
            return type !== "text" && type !== "linebreak";
          });
          const root = $getRoot();
          root.clear();
          if (validNodes.length > 0) {
            root.append(...validNodes);
          } else {
            const paragraph = $createParagraphNode();
            root.append(paragraph);
          }
        } catch (error) {
          console.error("Failed to load initial content:", error);
        }
      });
      setHasLoaded(true);
    }
  }, [initialContent, hasLoaded, editor]);
  return null;
}
function HtmlExportPlugin({ onChange }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor, null);
        onChange(html);
      });
    });
  }, [editor, onChange]);
  return null;
}
function LexicalEditor({
  initialContent = "",
  onChange,
  placeholder = "Start writing your article...",
  minHeight = "400px",
  onImageUpload = null,
  featuredImage = null
}) {
  const initialConfig = {
    namespace: "ArticleEditor",
    theme,
    onError: (error) => {
      console.error("Lexical Error:", error);
    },
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      AutoLinkNode,
      CodeNode,
      CodeHighlightNode,
      ImageNode
    ]
  };
  return /* @__PURE__ */ jsx("div", { className: "border border-slate-300 rounded-lg overflow-hidden bg-white", children: /* @__PURE__ */ jsxs(LexicalComposer, { initialConfig, children: [
    /* @__PURE__ */ jsx(ToolbarPlugin, { onImageUpload, featuredImage }),
    /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsx(
      RichTextPlugin,
      {
        contentEditable: /* @__PURE__ */ jsx(
          ContentEditable,
          {
            className: "outline-none p-4 prose prose-slate max-w-none",
            style: { minHeight }
          }
        ),
        placeholder: /* @__PURE__ */ jsx("div", { className: "absolute top-4 left-4 text-slate-400 pointer-events-none", children: placeholder }),
        ErrorBoundary: LexicalErrorBoundary
      }
    ) }),
    /* @__PURE__ */ jsx(HistoryPlugin, {}),
    /* @__PURE__ */ jsx(ListPlugin, {}),
    /* @__PURE__ */ jsx(LinkPlugin, {}),
    /* @__PURE__ */ jsx(MarkdownShortcutPlugin, { transformers: TRANSFORMERS }),
    /* @__PURE__ */ jsx(ImagePlugin, {}),
    /* @__PURE__ */ jsx(InitialContentPlugin, { initialContent }),
    /* @__PURE__ */ jsx(HtmlExportPlugin, { onChange })
  ] }) });
}
function ArticleCreate() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    article_category_id: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    featured_image: "",
    is_featured: false
  });
  useEffect(() => {
    fetchCategories();
  }, []);
  const fetchCategories = async () => {
    try {
      const response = await fetch("/admin/articles/api/create-data", {
        headers: { Accept: "application/json" }
      });
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (name === "title") {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      const response = await fetch("/admin/articles", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const data = await response.json();
        navigate(`/admin/articles/${data.article.id}/edit`);
      } else {
        const error = await response.json();
        alert(error.message || "Failed to create article");
      }
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to create article");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-40", children: /* @__PURE__ */ jsx("div", { className: "max-w-5xl mx-auto px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/admin/articles",
            className: "p-2 hover:bg-slate-800 rounded-lg transition-colors",
            children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold", children: "Create Article" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "Write a new blog article" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleSubmit,
          disabled: saving,
          className: "flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-lg transition-colors",
          children: [
            saving ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
            "Save Draft"
          ]
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsx("main", { className: "max-w-5xl mx-auto px-6 py-8", children: /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-6 border border-slate-700", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Title *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "title",
              value: formData.title,
              onChange: handleChange,
              required: true,
              className: "w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-lg placeholder-slate-400 focus:outline-none focus:border-cyan-500",
              placeholder: "Enter article title..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-6 border border-slate-700", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Slug" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-slate-400", children: "/blog/" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                name: "slug",
                value: formData.slug,
                onChange: handleChange,
                className: "flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500",
                placeholder: "article-slug"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-6 border border-slate-700", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Content *" }),
          /* @__PURE__ */ jsx(
            LexicalEditor,
            {
              initialContent: formData.content,
              onChange: (html) => setFormData((prev) => ({ ...prev, content: html })),
              placeholder: "Start writing your article...",
              minHeight: "400px",
              featuredImage: formData.featured_image
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-6 border border-slate-700", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Excerpt" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              name: "excerpt",
              value: formData.excerpt,
              onChange: handleChange,
              rows: 3,
              className: "w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500",
              placeholder: "Brief summary of the article..."
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-6 border border-slate-700", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Category" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              name: "article_category_id",
              value: formData.article_category_id,
              onChange: handleChange,
              className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Select category..." }),
                categories.map((cat) => /* @__PURE__ */ jsx("option", { value: cat.id, children: cat.name }, cat.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-6 border border-slate-700", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Featured Image URL" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "url",
              name: "featured_image",
              value: formData.featured_image,
              onChange: handleChange,
              className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500",
              placeholder: "https://..."
            }
          ),
          formData.featured_image && /* @__PURE__ */ jsx(
            "img",
            {
              src: formData.featured_image,
              alt: "Preview",
              className: "mt-4 rounded-lg w-full h-32 object-cover"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-slate-800/50 rounded-xl p-6 border border-slate-700", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center justify-between cursor-pointer", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-slate-300", children: "Featured Article" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              name: "is_featured",
              checked: formData.is_featured,
              onChange: handleChange,
              className: "sr-only peer"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 relative" })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-6 border border-slate-700", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-slate-300 mb-4", children: "SEO" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-slate-400 mb-1", children: "Meta Title" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  name: "meta_title",
                  value: formData.meta_title,
                  onChange: handleChange,
                  className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-500",
                  placeholder: "SEO title..."
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-slate-400 mb-1", children: "Meta Description" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  name: "meta_description",
                  value: formData.meta_description,
                  onChange: handleChange,
                  rows: 2,
                  className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-500",
                  placeholder: "SEO description..."
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-slate-400 mb-1", children: "Keywords" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  name: "meta_keywords",
                  value: formData.meta_keywords,
                  onChange: handleChange,
                  className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-500",
                  placeholder: "keyword1, keyword2..."
                }
              )
            ] })
          ] })
        ] })
      ] })
    ] }) }) })
  ] });
}
const __vite_glob_0_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ArticleCreate
}, Symbol.toStringTag, { value: "Module" }));
const statusColors$1 = {
  draft: "bg-slate-600",
  pending_review: "bg-yellow-600",
  scheduled: "bg-blue-600",
  published: "bg-green-600",
  rejected: "bg-red-600"
};
function ArticleEdit() {
  const { id } = useParams();
  useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    article_category_id: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    featured_image: "",
    is_featured: false,
    status: "draft"
  });
  useEffect(() => {
    fetchArticle();
    fetchCategories();
  }, [id]);
  const fetchArticle = async () => {
    try {
      const response = await fetch(`/admin/articles/api/${id}/edit-data`, {
        headers: { Accept: "application/json" }
      });
      const data = await response.json();
      setFormData({
        title: data.article.title || "",
        slug: data.article.slug || "",
        content: data.article.content || "",
        excerpt: data.article.excerpt || "",
        article_category_id: data.article.article_category_id || "",
        meta_title: data.article.meta_title || "",
        meta_description: data.article.meta_description || "",
        meta_keywords: data.article.meta_keywords || "",
        featured_image: data.article.featured_image || "",
        is_featured: data.article.is_featured || false,
        status: data.article.status || "draft"
      });
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch article:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchCategories = async () => {
    try {
      const response = await fetch("/admin/articles/categories/api/list", {
        headers: { Accept: "application/json" }
      });
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      const response = await fetch(`/admin/articles/${id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        const error = await response.json();
        alert(error.message || "Failed to save article");
      }
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save article");
    } finally {
      setSaving(false);
    }
  };
  const handleAction = async (action) => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      const response = await fetch(`/admin/articles/${id}/${action}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-CSRF-TOKEN": csrfToken
        }
      });
      if (response.ok) {
        fetchArticle();
      } else {
        const error = await response.json();
        alert(error.message || `Failed to ${action}`);
      }
    } catch (error) {
      console.error(`${action} failed:`, error);
    }
  };
  const handleGenerateImage = async () => {
    setGeneratingImage(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      const response = await fetch(`/admin/articles/${id}/generate-image`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-CSRF-TOKEN": csrfToken
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          featured_image: data.article.featured_image
        }));
      } else {
        const error = await response.json();
        alert(error.message || "Failed to generate image");
      }
    } catch (error) {
      console.error("Image generation failed:", error);
      alert("Image generation failed. Check console for details.");
    } finally {
      setGeneratingImage(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 text-cyan-500 animate-spin" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-40", children: /* @__PURE__ */ jsx("div", { className: "max-w-5xl mx-auto px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/admin/articles",
            className: "p-2 hover:bg-slate-800 rounded-lg transition-colors",
            children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold", children: "Edit Article" }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mt-1", children: /* @__PURE__ */ jsx(
            "span",
            {
              className: `px-2 py-0.5 rounded text-xs font-medium ${statusColors$1[formData.status]}`,
              children: formData.status.replace("_", " ")
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        formData.status === "published" && /* @__PURE__ */ jsxs(
          "a",
          {
            href: `/blog/${formData.slug}`,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors",
            children: [
              /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" }),
              "View"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: handleSubmit,
            disabled: saving,
            className: "flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-lg transition-colors",
            children: [
              saving ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
              "Save"
            ]
          }
        )
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("main", { className: "max-w-5xl mx-auto px-6 py-8", children: /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-6 border border-slate-700", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Title *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "title",
              value: formData.title,
              onChange: handleChange,
              required: true,
              className: "w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-lg placeholder-slate-400 focus:outline-none focus:border-cyan-500",
              placeholder: "Enter article title..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-6 border border-slate-700", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Slug" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-slate-400", children: "/blog/" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                name: "slug",
                value: formData.slug,
                onChange: handleChange,
                className: "flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500",
                placeholder: "article-slug"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-6 border border-slate-700", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Content *" }),
          /* @__PURE__ */ jsx(
            LexicalEditor,
            {
              initialContent: formData.content,
              onChange: (html) => setFormData((prev) => ({ ...prev, content: html })),
              placeholder: "Start writing your article...",
              minHeight: "400px",
              featuredImage: formData.featured_image
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-6 border border-slate-700", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Excerpt" }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              name: "excerpt",
              value: formData.excerpt,
              onChange: handleChange,
              rows: 3,
              className: "w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500",
              placeholder: "Brief summary of the article..."
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-6 border border-slate-700", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-slate-300 mb-4", children: "Actions" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            formData.status === "draft" && /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => handleAction("submit-for-review"),
                className: "w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-colors",
                children: [
                  /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" }),
                  "Submit for Review"
                ]
              }
            ),
            formData.status === "pending_review" && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => handleAction("approve"),
                  className: "w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors",
                  children: [
                    /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4" }),
                    "Approve"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => handleAction("reject"),
                  className: "w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors",
                  children: [
                    /* @__PURE__ */ jsx(XCircle, { className: "w-4 h-4" }),
                    "Reject"
                  ]
                }
              )
            ] }),
            (formData.status === "draft" || formData.status === "scheduled") && /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => handleAction("publish"),
                className: "w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors",
                children: [
                  /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4" }),
                  "Publish Now"
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-6 border border-slate-700", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Category" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              name: "article_category_id",
              value: formData.article_category_id,
              onChange: handleChange,
              className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Select category..." }),
                categories.map((cat) => /* @__PURE__ */ jsx("option", { value: cat.id, children: cat.name }, cat.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-6 border border-slate-700", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Featured Image" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "url",
              name: "featured_image",
              value: formData.featured_image,
              onChange: handleChange,
              className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 mb-3",
              placeholder: "https://..."
            }
          ),
          formData.featured_image && /* @__PURE__ */ jsx(
            "img",
            {
              src: formData.featured_image,
              alt: "Preview",
              className: "rounded-lg w-full h-32 object-cover mb-3"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: handleGenerateImage,
              disabled: generatingImage,
              className: "w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg transition-colors",
              children: [
                generatingImage ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4" }),
                "Generate with DALL-E"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-slate-800/50 rounded-xl p-6 border border-slate-700", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center justify-between cursor-pointer", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-slate-300", children: "Featured Article" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              name: "is_featured",
              checked: formData.is_featured,
              onChange: handleChange,
              className: "sr-only peer"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 relative" })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-6 border border-slate-700", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-slate-300 mb-4", children: "SEO" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-slate-400 mb-1", children: "Meta Title" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  name: "meta_title",
                  value: formData.meta_title,
                  onChange: handleChange,
                  className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-500",
                  placeholder: "SEO title..."
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-slate-400 mb-1", children: "Meta Description" }),
              /* @__PURE__ */ jsx(
                "textarea",
                {
                  name: "meta_description",
                  value: formData.meta_description,
                  onChange: handleChange,
                  rows: 2,
                  className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-500",
                  placeholder: "SEO description..."
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs text-slate-400 mb-1", children: "Keywords" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  name: "meta_keywords",
                  value: formData.meta_keywords,
                  onChange: handleChange,
                  className: "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-500",
                  placeholder: "keyword1, keyword2..."
                }
              )
            ] })
          ] })
        ] })
      ] })
    ] }) }) })
  ] });
}
const __vite_glob_0_3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ArticleEdit
}, Symbol.toStringTag, { value: "Module" }));
const statusColors = {
  draft: { bg: "bg-slate-100", text: "text-slate-600", icon: FileText },
  pending_review: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
  scheduled: { bg: "bg-blue-100", text: "text-blue-700", icon: Clock },
  published: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
  rejected: { bg: "bg-red-100", text: "text-red-700", icon: XCircle }
};
const StatusBadge = ({ status }) => {
  const config = statusColors[status] || statusColors.draft;
  const Icon = config.icon;
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`,
      children: [
        /* @__PURE__ */ jsx(Icon, { className: "w-3.5 h-3.5" }),
        status.replace("_", " ")
      ]
    }
  );
};
const StatCard = ({ label, value, icon: Icon, color }) => /* @__PURE__ */ jsx("div", { className: "bg-slate-800 rounded-xl p-4 border border-slate-700", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
  /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-sm", children: label }),
    /* @__PURE__ */ jsx("p", { className: `text-2xl font-bold ${color}`, children: value })
  ] }),
  /* @__PURE__ */ jsx(Icon, { className: `w-8 h-8 ${color} opacity-50` })
] }) });
function ArticlesIndex() {
  useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [data, setData] = useState({
    articles: { data: [] },
    categories: [],
    statistics: {},
    settings: {}
  });
  useEffect(() => {
    fetchData();
  }, [statusFilter, categoryFilter]);
  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (categoryFilter) params.append("category_id", categoryFilter);
      const response = await fetch(`/admin/articles/api/list?${params.toString()}`, {
        headers: { Accept: "application/json" }
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleGenerate = async (categoryId) => {
    if (!categoryId) {
      alert("Please select a category");
      return;
    }
    setGenerating(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      const response = await fetch("/admin/articles/generate", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken
        },
        body: JSON.stringify({ category_id: categoryId })
      });
      if (response.ok) {
        fetchData();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to generate article");
      }
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate article");
    } finally {
      setGenerating(false);
    }
  };
  const handleDelete = async (articleId) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    setDeleting(articleId);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      const response = await fetch(`/admin/articles/${articleId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "X-CSRF-TOKEN": csrfToken
        }
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(null);
    }
  };
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };
  const filteredArticles = data.articles.data?.filter(
    (article) => article.title.toLowerCase().includes(searchQuery.toLowerCase()) || article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 text-cyan-500 animate-spin" }) });
  }
  const { articles, categories, statistics, settings } = data;
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-40", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/admin",
            className: "p-2 hover:bg-slate-800 rounded-lg transition-colors",
            children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold", children: "Blog Articles" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "Manage AI-generated blog content" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/admin/articles/categories",
            className: "flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors",
            children: [
              /* @__PURE__ */ jsx(FolderOpen, { className: "w-4 h-4" }),
              "Categories"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/admin/articles/settings",
            className: "flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors",
            children: [
              /* @__PURE__ */ jsx(Settings, { className: "w-4 h-4" }),
              "Settings"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Link,
          {
            to: "/admin/articles/create",
            className: "flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
              "New Article"
            ]
          }
        )
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("main", { className: "max-w-7xl mx-auto px-6 py-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-8", children: [
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Total Articles",
            value: statistics.total || 0,
            icon: FileText,
            color: "text-white"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Published",
            value: statistics.published || 0,
            icon: CheckCircle,
            color: "text-green-400"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "Pending Review",
            value: statistics.pending_review || 0,
            icon: Clock,
            color: "text-yellow-400"
          }
        ),
        /* @__PURE__ */ jsx(
          StatCard,
          {
            label: "AI Generated",
            value: statistics.ai_generated || 0,
            icon: Sparkles,
            color: "text-purple-400"
          }
        )
      ] }),
      settings?.is_enabled && /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-xl p-6 border border-purple-500/30 mb-8", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-3 bg-purple-600 rounded-xl", children: /* @__PURE__ */ jsx(Sparkles, { className: "w-6 h-6 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "AI Article Generator" }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-sm", children: "Generate high-quality articles automatically" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "generateCategory",
              className: "px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Select category..." }),
                categories.map((cat) => /* @__PURE__ */ jsx("option", { value: cat.id, children: cat.name }, cat.id))
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => {
                const select = document.getElementById("generateCategory");
                handleGenerate(select.value);
              },
              disabled: generating,
              className: "flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg transition-colors",
              children: [
                generating ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4" }),
                "Generate Article"
              ]
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1 min-w-64", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              placeholder: "Search articles...",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              className: "w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: statusFilter,
            onChange: (e) => setStatusFilter(e.target.value),
            className: "px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "All Statuses" }),
              /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" }),
              /* @__PURE__ */ jsx("option", { value: "pending_review", children: "Pending Review" }),
              /* @__PURE__ */ jsx("option", { value: "scheduled", children: "Scheduled" }),
              /* @__PURE__ */ jsx("option", { value: "published", children: "Published" }),
              /* @__PURE__ */ jsx("option", { value: "rejected", children: "Rejected" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: categoryFilter,
            onChange: (e) => setCategoryFilter(e.target.value),
            className: "px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "All Categories" }),
              categories.map((cat) => /* @__PURE__ */ jsx("option", { value: cat.id, children: cat.name }, cat.id))
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: fetchData,
            className: "p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors",
            children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-5 h-5" })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-slate-800", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "text-left px-6 py-4 text-sm font-medium text-slate-300", children: "Article" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-6 py-4 text-sm font-medium text-slate-300", children: "Category" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-6 py-4 text-sm font-medium text-slate-300", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "text-left px-6 py-4 text-sm font-medium text-slate-300", children: "Date" }),
          /* @__PURE__ */ jsx("th", { className: "text-right px-6 py-4 text-sm font-medium text-slate-300", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-700", children: filteredArticles?.length > 0 ? filteredArticles.map((article) => /* @__PURE__ */ jsxs(
          "tr",
          {
            className: "hover:bg-slate-800/50 transition-colors",
            children: [
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                article.featured_image && /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: article.featured_image,
                    alt: "",
                    className: "w-12 h-12 rounded-lg object-cover"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "font-medium text-white", children: article.title }),
                  article.is_ai_generated && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-purple-400", children: [
                    /* @__PURE__ */ jsx(Sparkles, { className: "w-3 h-3" }),
                    "AI Generated"
                  ] })
                ] })
              ] }) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx("span", { className: "text-slate-300", children: article.category?.name || "—" }) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsx(StatusBadge, { status: article.status }) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 text-slate-400 text-sm", children: formatDate(article.created_at) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
                article.status === "published" && /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: `/blog/${article.slug}`,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors",
                    children: /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    to: `/admin/articles/${article.id}/edit`,
                    className: "p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors",
                    children: /* @__PURE__ */ jsx(Edit, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => handleDelete(article.id),
                    disabled: deleting === article.id,
                    className: "p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50",
                    children: deleting === article.id ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" })
                  }
                )
              ] }) })
            ]
          },
          article.id
        )) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsxs("td", { colSpan: 5, className: "px-6 py-12 text-center", children: [
          /* @__PURE__ */ jsx(FileText, { className: "w-12 h-12 text-slate-600 mx-auto mb-4" }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-400", children: "No articles found" }),
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/admin/articles/create",
              className: "inline-flex items-center gap-2 mt-4 text-cyan-400 hover:text-cyan-300",
              children: [
                /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
                "Create your first article"
              ]
            }
          )
        ] }) }) })
      ] }) })
    ] })
  ] });
}
const __vite_glob_0_4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ArticlesIndex
}, Symbol.toStringTag, { value: "Module" }));
function ArticleSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [statistics, setStatistics] = useState({});
  const [formData, setFormData] = useState({
    is_enabled: false,
    dalle_enabled: false,
    auto_publish_enabled: false,
    auto_publish_hours: 24,
    max_articles_per_day: 3,
    max_articles_per_week: 15,
    admin_notification_email: "",
    openai_model: "gpt-4o",
    dalle_model: "dall-e-3",
    dalle_size: "1792x1024",
    dalle_quality: "standard"
  });
  useEffect(() => {
    fetchSettings();
  }, []);
  const fetchSettings = async () => {
    try {
      const response = await fetch("/admin/articles/settings", {
        headers: { Accept: "application/json" }
      });
      const data = await response.json();
      if (data.settings) {
        setFormData(data.settings);
      }
      if (data.statistics) {
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
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
  };
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      const response = await fetch("/admin/articles/settings", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        alert("Failed to save settings");
      }
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };
  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
      const response = await fetch("/admin/articles/settings/test-connection", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-CSRF-TOKEN": csrfToken
        }
      });
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({ success: false, message: "Connection test failed" });
    } finally {
      setTesting(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 text-cyan-500 animate-spin" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-40", children: /* @__PURE__ */ jsx("div", { className: "max-w-5xl mx-auto px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/admin/articles",
            className: "p-2 hover:bg-slate-800 rounded-lg transition-colors",
            children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold", children: "Article Settings" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "Configure AI generation settings" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleSubmit,
          disabled: saving,
          className: "flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-lg transition-colors",
          children: [
            saving ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "w-4 h-4" }),
            "Save Settings"
          ]
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsx("main", { className: "max-w-5xl mx-auto px-6 py-8", children: /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-8", children: [
      /* @__PURE__ */ jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-4 border border-slate-700", children: [
          /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-sm", children: "Generated Today" }),
          /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold text-white mt-1", children: [
            statistics?.ai_generated_today || 0,
            " /",
            " ",
            formData.max_articles_per_day
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-4 border border-slate-700", children: [
          /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-sm", children: "Generated This Week" }),
          /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold text-white mt-1", children: [
            statistics?.ai_generated_this_week || 0,
            " /",
            " ",
            formData.max_articles_per_week
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-4 border border-slate-700", children: [
          /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-sm", children: "Pending Review" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-yellow-400 mt-1", children: statistics?.pending_review || 0 })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-4 border border-slate-700", children: [
          /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-sm", children: "Total Published" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-green-400 mt-1", children: statistics?.published_articles || 0 })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-6 border border-slate-700", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 bg-purple-600 rounded-lg", children: /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-white" }) }),
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "AI Generation" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Enable AI Generation" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "Allow generating articles using OpenAI" })
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    name: "is_enabled",
                    checked: formData.is_enabled,
                    onChange: handleChange,
                    className: "sr-only peer"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "OpenAI Model" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  name: "openai_model",
                  value: formData.openai_model,
                  onChange: handleChange,
                  className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "gpt-4o", children: "GPT-4o (Recommended)" }),
                    /* @__PURE__ */ jsx("option", { value: "gpt-4o-mini", children: "GPT-4o Mini (Faster)" }),
                    /* @__PURE__ */ jsx("option", { value: "gpt-4-turbo", children: "GPT-4 Turbo" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: handleTestConnection,
                  disabled: testing,
                  className: "flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg transition-colors",
                  children: [
                    testing ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Zap, { className: "w-4 h-4" }),
                    "Test Connection"
                  ]
                }
              ),
              testResult && /* @__PURE__ */ jsxs(
                "div",
                {
                  className: `mt-3 flex items-center gap-2 text-sm ${testResult.success ? "text-green-400" : "text-red-400"}`,
                  children: [
                    testResult.success ? /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(XCircle, { className: "w-4 h-4" }),
                    testResult.message
                  ]
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-6 border border-slate-700", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 bg-pink-600 rounded-lg", children: /* @__PURE__ */ jsx(Image, { className: "w-5 h-5 text-white" }) }),
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Image Generation" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Enable DALL-E Images" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "Auto-generate featured images" })
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    name: "dalle_enabled",
                    checked: formData.dalle_enabled,
                    onChange: handleChange,
                    className: "sr-only peer"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "DALL-E Model" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  name: "dalle_model",
                  value: formData.dalle_model,
                  onChange: handleChange,
                  className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "dall-e-3", children: "DALL-E 3 (Recommended)" }),
                    /* @__PURE__ */ jsx("option", { value: "dall-e-2", children: "DALL-E 2" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Image Size" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  name: "dalle_size",
                  value: formData.dalle_size,
                  onChange: handleChange,
                  className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "1792x1024", children: "1792x1024 (Landscape)" }),
                    /* @__PURE__ */ jsx("option", { value: "1024x1024", children: "1024x1024 (Square)" }),
                    /* @__PURE__ */ jsx("option", { value: "1024x1792", children: "1024x1792 (Portrait)" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Image Quality" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  name: "dalle_quality",
                  value: formData.dalle_quality,
                  onChange: handleChange,
                  className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "standard", children: "Standard" }),
                    /* @__PURE__ */ jsx("option", { value: "hd", children: "HD (Higher cost)" })
                  ]
                }
              )
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-6 border border-slate-700", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-600 rounded-lg", children: /* @__PURE__ */ jsx(Clock, { className: "w-5 h-5 text-white" }) }),
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Auto-Publish" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Enable Auto-Publish" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-400", children: "Schedule articles automatically" })
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    name: "auto_publish_enabled",
                    checked: formData.auto_publish_enabled,
                    onChange: handleChange,
                    className: "sr-only peer"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Hours Until Auto-Publish" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  name: "auto_publish_hours",
                  value: formData.auto_publish_hours,
                  onChange: handleChange,
                  min: 1,
                  max: 720,
                  className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-slate-500 text-xs mt-1", children: "Generated articles will be scheduled to publish after this many hours" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-6 border border-slate-700", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 bg-orange-600 rounded-lg", children: /* @__PURE__ */ jsx(Settings, { className: "w-5 h-5 text-white" }) }),
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Rate Limits" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Max Articles Per Day" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  name: "max_articles_per_day",
                  value: formData.max_articles_per_day,
                  onChange: handleChange,
                  min: 1,
                  max: 50,
                  className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Max Articles Per Week" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  name: "max_articles_per_week",
                  value: formData.max_articles_per_week,
                  onChange: handleChange,
                  min: 1,
                  max: 200,
                  className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-slate-800/50 rounded-xl p-6 border border-slate-700", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 bg-green-600 rounded-lg", children: /* @__PURE__ */ jsx(Mail, { className: "w-5 h-5 text-white" }) }),
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Notifications" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Admin Notification Email" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                name: "admin_notification_email",
                value: formData.admin_notification_email,
                onChange: handleChange,
                placeholder: "admin@example.com",
                className: "w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-slate-500 text-xs mt-1", children: "Receive notifications when articles need review" })
          ] })
        ] })
      ] })
    ] }) }) })
  ] });
}
const __vite_glob_0_5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ArticleSettings
}, Symbol.toStringTag, { value: "Module" }));
export {
  __vite_glob_0_5 as _,
  __vite_glob_0_4 as a,
  __vite_glob_0_3 as b,
  __vite_glob_0_2 as c,
  __vite_glob_0_1 as d
};
