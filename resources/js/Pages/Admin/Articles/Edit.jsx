import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Image,
  Sparkles,
} from "lucide-react";
import LexicalEditor from "../../../components/LexicalEditor";

const statusColors = {
  draft: "bg-slate-600",
  pending_review: "bg-yellow-600",
  scheduled: "bg-blue-600",
  published: "bg-green-600",
  rejected: "bg-red-600",
};

export default function ArticleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
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
    status: "draft",
  });

  useEffect(() => {
    fetchArticle();
    fetchCategories();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/admin/articles/api/${id}/edit-data`, {
        headers: { Accept: "application/json" },
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
        status: data.article.status || "draft",
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
        headers: { Accept: "application/json" },
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
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSaving(true);

    try {
      const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");

      const response = await fetch(`/admin/articles/${id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify(formData),
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
      const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");

      const response = await fetch(`/admin/articles/${id}/${action}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
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
      const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");

      const response = await fetch(`/admin/articles/${id}/generate-image`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-CSRF-TOKEN": csrfToken,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          featured_image: data.article.featured_image,
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
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/admin/articles"
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold">Edit Article</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[formData.status]}`}
                  >
                    {formData.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {formData.status === "published" && (
                <a
                  href={`/blog/${formData.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View
                </a>
              )}
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-lg transition-colors"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-lg placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  placeholder="Enter article title..."
                />
              </div>

              {/* Slug */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">/blog/</span>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    placeholder="article-slug"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Content *
                </label>
                <LexicalEditor
                  initialContent={formData.content}
                  onChange={(html) =>
                    setFormData((prev) => ({ ...prev, content: html }))
                  }
                  placeholder="Start writing your article..."
                  minHeight="400px"
                  featuredImage={formData.featured_image}
                />
              </div>

              {/* Excerpt */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Excerpt
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  placeholder="Brief summary of the article..."
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-sm font-medium text-slate-300 mb-4">
                  Actions
                </h3>
                <div className="space-y-2">
                  {formData.status === "draft" && (
                    <button
                      type="button"
                      onClick={() => handleAction("submit-for-review")}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Submit for Review
                    </button>
                  )}
                  {formData.status === "pending_review" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAction("approve")}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction("reject")}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                  {(formData.status === "draft" ||
                    formData.status === "scheduled") && (
                    <button
                      type="button"
                      onClick={() => handleAction("publish")}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Publish Now
                    </button>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category
                </label>
                <select
                  name="article_category_id"
                  value={formData.article_category_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Featured Image */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Featured Image
                </label>
                <input
                  type="url"
                  name="featured_image"
                  value={formData.featured_image}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 mb-3"
                  placeholder="https://..."
                />
                {formData.featured_image && (
                  <img
                    src={formData.featured_image}
                    alt="Preview"
                    className="rounded-lg w-full h-32 object-cover mb-3"
                  />
                )}
                <button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={generatingImage}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg transition-colors"
                >
                  {generatingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Generate with DALL-E
                </button>
              </div>

              {/* Featured Toggle */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-slate-300">
                    Featured Article
                  </span>
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 relative"></div>
                </label>
              </div>

              {/* SEO */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-sm font-medium text-slate-300 mb-4">SEO</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      name="meta_title"
                      value={formData.meta_title}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      placeholder="SEO title..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      placeholder="SEO description..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Keywords
                    </label>
                    <input
                      type="text"
                      name="meta_keywords"
                      value={formData.meta_keywords}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      placeholder="keyword1, keyword2..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
