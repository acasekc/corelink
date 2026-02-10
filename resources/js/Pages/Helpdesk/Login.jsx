import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Ticket, LogIn, Loader2 } from "lucide-react";

const HelpdeskLogin = () => {
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

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            || document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];

        try {
            const res = await fetch("/helpdesk/login", {
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
                setForm((prev) => ({
                    ...prev,
                    errors: data.errors || { credentials: data.message || "Login failed." },
                    processing: false
                }));
            } else {
                // Redirect based on response
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

    return (
        <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                            <Ticket className="w-8 h-8 text-purple-400" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Support Portal</h1>
                    <p className="text-slate-400 mt-2">Sign in to access your tickets and projects</p>
                </div>

                {/* Login Card */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
                    {form.errors.credentials && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                            {form.errors.credentials}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoFocus
                                autoComplete="email"
                                value={form.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-slate-900 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 ${
                                    form.errors.email ? 'border-red-500' : 'border-slate-700'
                                }`}
                                placeholder="you@example.com"
                            />
                            {form.errors.email && (
                                <p className="mt-2 text-sm text-red-400">{form.errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                value={form.password}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-slate-900 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 ${
                                    form.errors.password ? 'border-red-500' : 'border-slate-700'
                                }`}
                                placeholder="••••••••"
                            />
                            {form.errors.password && (
                                <p className="mt-2 text-sm text-red-400">{form.errors.password}</p>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    name="remember"
                                    type="checkbox"
                                    checked={form.remember}
                                    onChange={handleChange}
                                    className="w-4 h-4 bg-slate-900 border-slate-700 rounded text-purple-500 focus:ring-purple-500"
                                />
                                <label htmlFor="remember" className="ml-2 text-sm text-slate-400">
                                    Remember me
                                </label>
                            </div>
                            <a href="/helpdesk/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition">
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-medium rounded-lg transition"
                        >
                            {form.processing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-slate-500 text-sm">
                    <p>
                        Are you an administrator?{" "}
                        <a href="/admin/login" className="text-purple-400 hover:text-purple-300 transition">
                            Sign in here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HelpdeskLogin;
