import React, { useState } from "react";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
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
    
    // Get CSRF token from cookie or meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') 
      || document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];
    
    try {
      const res = await fetch("/admin/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": decodeURIComponent(csrfToken || ''),
          "Accept": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          remember: form.remember,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setForm((prev) => ({ ...prev, errors: data.errors || { credentials: data.message || "Login failed." }, processing: false }));
      } else {
        // Use the redirect from the response
        window.location.href = data.redirect || "/admin/discovery";
      }
    } catch (err) {
      setForm((prev) => ({ ...prev, errors: { credentials: "Network error." }, processing: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-400">Corelink Admin</h1>
          <p className="text-gray-400 mt-2">Sign in to manage discovery sessions</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoFocus
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="admin@example.com"
              />
              {form.errors.email && <p className="mt-2 text-sm text-red-400">{form.errors.email}</p>}
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="••••••••"
              />
              {form.errors.password && <p className="mt-2 text-sm text-red-400">{form.errors.password}</p>}
            </div>
            <div className="flex items-center mb-6">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={form.remember}
                onChange={handleChange}
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 text-purple-600"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-300">
                Remember me
              </label>
            </div>
            {form.errors.credentials && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
                <p className="text-sm text-red-400">{form.errors.credentials}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={form.processing}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {form.processing ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>
            Looking for the support portal?{" "}
            <a href="/helpdesk/login" className="text-purple-400 hover:text-purple-300 transition">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
