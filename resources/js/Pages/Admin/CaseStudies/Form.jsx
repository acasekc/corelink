import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
    processing: false,
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Refresh CSRF token every 60 minutes to prevent expiration during long editing sessions
  useEffect(() => {
    const refreshToken = async () => {
      try {
        await fetch('/sanctum/csrf-cookie', { credentials: 'same-origin' });
      } catch (err) {
        console.error('Failed to refresh CSRF token:', err);
      }
    };

    // Refresh immediately on mount
    refreshToken();

    // Set up interval to refresh every 60 minutes
    tokenRefreshInterval.current = setInterval(refreshToken, 60 * 60 * 1000);

    return () => {
      if (tokenRefreshInterval.current) {
        clearInterval(tokenRefreshInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isEdit) {
      fetch(`/api/admin/case-studies/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setForm((prev) => ({ ...prev, ...data }));
          // Set image preview if hero_image exists
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
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTechnologiesChange = (e) => {
    setForm((prev) => ({ ...prev, technologies: e.target.value }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
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
    const method = isEdit ? "PUT" : "POST";

    // Get CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') 
      || document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];

    // Convert technologies string to array if needed
    const technologies = typeof form.technologies === 'string' 
      ? form.technologies.split(',').map(t => t.trim()).filter(Boolean)
      : form.technologies;

    try {
      // Use FormData to support file upload
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('slug', form.slug || '');
      formData.append('subtitle', form.subtitle || '');
      formData.append('description', form.description || '');
      formData.append('client_name', form.client_name || '');
      formData.append('industry', form.industry || '');
      formData.append('project_type', form.project_type || '');
      formData.append('technologies', JSON.stringify(technologies));
      formData.append('content', form.content);
      formData.append('metrics', JSON.stringify(form.metrics));
      formData.append('is_published', form.is_published ? '1' : '0');
      formData.append('order', form.order);
      
      // Add image file if selected
      if (imageFile) {
        formData.append('hero_image', imageFile);
      } else if (form.hero_image) {
        formData.append('hero_image_url', form.hero_image);
      }
      
      // For PUT requests, Laravel needs _method field
      if (isEdit) {
        formData.append('_method', 'PUT');
      }

      const res = await fetch(url, {
        method: isEdit ? 'POST' : 'POST', // Use POST for both, Laravel will handle _method
        headers: { 
          "X-CSRF-TOKEN": decodeURIComponent(csrfToken || ''),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 419) {
          // CSRF token expired - refresh and retry
          await fetch('/sanctum/csrf-cookie', { credentials: 'same-origin' });
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

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <a href="/admin/case-studies" className="text-gray-400 hover:text-white text-sm">← Back to Case Studies</a>
      </div>
      <h2 className="text-2xl font-bold mb-6">{isEdit ? 'Edit' : 'Create'} Case Study</h2>
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
            />
            {form.errors.title && <p className="mt-1 text-sm text-red-400">{form.errors.title}</p>}
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-2">
              Slug <span className="text-gray-500">(auto-generated if empty)</span>
            </label>
            <input
              id="slug"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
            />
            {form.errors.slug && <p className="mt-1 text-sm text-red-400">{form.errors.slug}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="subtitle" className="block text-sm font-medium text-gray-300 mb-2">Subtitle</label>
          <input
            id="subtitle"
            name="subtitle"
            value={form.subtitle}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label htmlFor="client_name" className="block text-sm font-medium text-gray-300 mb-2">Client Name</label>
            <input
              id="client_name"
              name="client_name"
              value={form.client_name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
            <input
              id="industry"
              name="industry"
              value={form.industry}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label htmlFor="project_type" className="block text-sm font-medium text-gray-300 mb-2">Project Type</label>
            <input
              id="project_type"
              name="project_type"
              value={form.project_type}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="technologies" className="block text-sm font-medium text-gray-300 mb-2">
            Technologies <span className="text-gray-500">(comma-separated)</span>
          </label>
          <input
            id="technologies"
            value={Array.isArray(form.technologies) ? form.technologies.join(", ") : form.technologies}
            onChange={handleTechnologiesChange}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Hero Image</label>
          
          {imagePreview ? (
            <div className="space-y-2">
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-w-xs rounded-lg border border-gray-600"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <input
                type="file"
                id="hero_image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
              />
              <p className="mt-1 text-sm text-gray-400">Supported formats: JPG, PNG, WebP</p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
            Content (Markdown) <span className="text-red-400">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={form.content}
            onChange={handleChange}
            required
            rows={12}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 font-mono text-sm"
          />
          {form.errors.content && <p className="mt-1 text-sm text-red-400">{form.errors.content}</p>}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="order" className="block text-sm font-medium text-gray-300 mb-2">Display Order</label>
            <input
              id="order"
              name="order"
              type="number"
              value={form.order}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                name="is_published"
                type="checkbox"
                checked={form.is_published}
                onChange={handleChange}
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 text-purple-600"
              />
              <span className="ml-2 text-sm text-gray-300">Published</span>
            </label>
          </div>
        </div>

        {form.errors.general && <p className="text-sm text-red-400">{form.errors.general}</p>}

        <div className="flex justify-end space-x-4">
          <a
            href="/admin/case-studies"
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </a>
          <button
            type="submit"
            disabled={form.processing}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {form.processing ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CaseStudyForm;
