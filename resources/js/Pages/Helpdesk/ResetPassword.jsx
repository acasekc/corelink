import React, { useState } from "react";
import { Ticket, ArrowLeft, Loader2, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

const ResetPassword = () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token") || "";
    const email = params.get("email") || "";

    const [form, setForm] = useState({
        password: "",
        password_confirmation: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            || document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];

        try {
            const res = await fetch("/helpdesk/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": decodeURIComponent(csrfToken || ''),
                    "Accept": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    token,
                    email,
                    password: form.password,
                    password_confirmation: form.password_confirmation,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrors(data.errors || { email: data.message || "Something went wrong." });
                setProcessing(false);
            } else {
                setSuccess(true);
                setProcessing(false);
            }
        } catch {
            setErrors({ email: "Network error. Please try again." });
            setProcessing(false);
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
                    <h1 className="text-3xl font-bold text-white">Reset Password</h1>
                    <p className="text-slate-400 mt-2">Choose a new password for your account</p>
                </div>

                {/* Card */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
                    {success ? (
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-4">
                                <div className="p-3 bg-green-500/20 rounded-full">
                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                </div>
                            </div>
                            <h2 className="text-xl font-semibold text-white mb-2">Password reset!</h2>
                            <p className="text-slate-400 text-sm mb-6">
                                Your password has been reset successfully. You can now sign in with your new password.
                            </p>
                            <a
                                href="/helpdesk/login"
                                className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
                            >
                                Sign In
                            </a>
                        </div>
                    ) : (
                        <>
                            {!token || !email ? (
                                <div className="text-center">
                                    <p className="text-red-300 mb-4">Invalid password reset link.</p>
                                    <a
                                        href="/helpdesk/forgot-password"
                                        className="text-purple-400 hover:text-purple-300 transition text-sm"
                                    >
                                        Request a new reset link
                                    </a>
                                </div>
                            ) : (
                                <>
                                    {errors.email && (
                                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                                            {errors.email}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* New Password */}
                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="password"
                                                    name="password"
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    autoFocus
                                                    autoComplete="new-password"
                                                    value={form.password}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-3 pr-12 bg-slate-900 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 ${
                                                        errors.password ? 'border-red-500' : 'border-slate-700'
                                                    }`}
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <p className="mt-2 text-sm text-red-400">{errors.password}</p>
                                            )}
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-300 mb-2">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="password_confirmation"
                                                    name="password_confirmation"
                                                    type={showConfirm ? "text" : "password"}
                                                    required
                                                    autoComplete="new-password"
                                                    value={form.password_confirmation}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 pr-12 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirm(!showConfirm)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                                >
                                                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-medium rounded-lg transition"
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Resetting...
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-5 h-5" />
                                                    Reset Password
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {!success && (
                    <div className="mt-6 text-center">
                        <a
                            href="/helpdesk/login"
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-400 transition text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to sign in
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
