import React, { useState } from "react";

const CreateInvite = () => {
  const [form, setForm] = useState({
    code: "",
    email: "",
    send_email: false,
    max_uses: "",
    expires_days: null,
    errors: {},
    processing: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setForm((prev) => ({ ...prev, processing: true, errors: {} }));
    
    // Get CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') 
      || document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];
    
    try {
      const res = await fetch("/admin/discovery/invites", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": decodeURIComponent(csrfToken || ''),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
          code: form.code,
          email: form.email,
          send_email: form.send_email,
          max_uses: form.max_uses,
          expires_days: form.expires_days,
        }),
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

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <a href="/admin/discovery/invites" className="text-gray-400 hover:text-white text-sm">← Back to Invites</a>
      </div>
      <h2 className="text-2xl font-bold mb-6">Create Invite Code</h2>
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="mb-6">
          <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
            Invite Code <span className="text-gray-500">(optional)</span>
          </label>
          <input
            id="code"
            name="code"
            value={form.code}
            onChange={handleChange}
            type="text"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 font-mono uppercase"
            placeholder="Leave blank to auto-generate"
          />
          {form.errors.code && <p className="mt-1 text-sm text-red-400">{form.errors.code}</p>}
        </div>
        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Recipient Email <span className="text-gray-500">(optional)</span>
          </label>
          <input
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
            placeholder="client@example.com"
          />
          {form.errors.email && <p className="mt-1 text-sm text-red-400">{form.errors.email}</p>}
        </div>
        {form.email && (
          <div className="mb-6">
            <label className="flex items-center">
              <input
                name="send_email"
                type="checkbox"
                checked={form.send_email}
                onChange={handleChange}
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 text-purple-600"
              />
              <span className="ml-2 text-sm text-gray-300">Send invite email now</span>
            </label>
          </div>
        )}
        <div className="mb-6">
          <label htmlFor="max_uses" className="block text-sm font-medium text-gray-300 mb-2">
            Max Uses <span className="text-gray-500">(optional)</span>
          </label>
          <input
            id="max_uses"
            name="max_uses"
            value={form.max_uses}
            onChange={handleChange}
            type="number"
            min="1"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
            placeholder="Unlimited"
          />
          {form.errors.max_uses && <p className="mt-1 text-sm text-red-400">{form.errors.max_uses}</p>}
        </div>
        <div className="mb-6">
          <label htmlFor="expires_days" className="block text-sm font-medium text-gray-300 mb-2">
            Expires In <span className="text-gray-500">(optional)</span>
          </label>
          <select
            id="expires_days"
            name="expires_days"
            value={form.expires_days || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500"
          >
            <option value="">Never</option>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
          </select>
        </div>
        {form.errors.general && <p className="mt-2 text-sm text-red-400">{form.errors.general}</p>}
        <button
          type="submit"
          disabled={form.processing}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          {form.processing ? "Creating..." : "Create Invite"}
        </button>
      </form>
    </div>
  );
};

export default CreateInvite;
