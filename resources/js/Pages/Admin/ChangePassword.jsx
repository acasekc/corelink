import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Key, Loader2, Eye, EyeOff, AlertTriangle, CheckCircle } from "lucide-react";

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
        success: false,
    });

    useEffect(() => {
        // Check if force password change is required
        fetch("/api/admin/profile", {
            credentials: "same-origin",
        })
            .then((res) => {
                if (res.status === 401) {
                    window.location.href = "/admin/login";
                    return null;
                }
                return res.json();
            })
            .then((data) => {
                if (data) {
                    setForceChange(data.force_password_change || false);
                    setLoading(false);
                }
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
            errors: { ...prev.errors, [name]: null },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setForm((prev) => ({ ...prev, processing: true, errors: {}, success: false }));

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            || document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];

        try {
            const res = await fetch("/api/admin/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": decodeURIComponent(csrfToken || ''),
                    "Accept": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    current_password: form.current_password,
                    new_password: form.new_password,
                    new_password_confirmation: form.new_password_confirmation,
                }),
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
                    new_password_confirmation: "",
                }));
                
                // If it was a forced password change, redirect to dashboard after short delay
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
        return (
            <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                            <Key className="w-8 h-8 text-purple-400" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Change Password</h1>
                    {forceChange ? (
                        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <div className="flex items-center gap-2 text-amber-400">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="text-sm font-medium">Password change required</span>
                            </div>
                            <p className="text-amber-300/70 text-sm mt-1">
                                You must change your password before continuing.
                            </p>
                        </div>
                    ) : (
                        <p className="text-slate-400 mt-2">Update your admin account password</p>
                    )}
                </div>

                {/* Form Card */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8">
                    {form.success && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <div className="flex items-center gap-2 text-green-400">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">Password changed successfully!</span>
                            </div>
                            {forceChange && (
                                <p className="text-green-300/70 text-sm mt-1">
                                    Redirecting to dashboard...
                                </p>
                            )}
                        </div>
                    )}

                    {form.errors.general && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {form.errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Current Password - only show if not forced */}
                        {!forceChange && (
                            <div>
                                <label htmlFor="current_password" className="block text-sm font-medium text-slate-300 mb-2">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        id="current_password"
                                        name="current_password"
                                        value={form.current_password}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-10 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                    >
                                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {form.errors.current_password && (
                                    <p className="mt-1 text-sm text-red-400">{form.errors.current_password[0]}</p>
                                )}
                            </div>
                        )}

                        {/* New Password */}
                        <div>
                            <label htmlFor="new_password" className="block text-sm font-medium text-slate-300 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    id="new_password"
                                    name="new_password"
                                    value={form.new_password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-10 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                >
                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {form.errors.new_password && (
                                <p className="mt-1 text-sm text-red-400">{form.errors.new_password[0]}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="new_password_confirmation" className="block text-sm font-medium text-slate-300 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="new_password_confirmation"
                                    name="new_password_confirmation"
                                    value={form.new_password_confirmation}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-10 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {form.processing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Changing Password...
                                </>
                            ) : (
                                <>
                                    <Key className="w-5 h-5" />
                                    Change Password
                                </>
                            )}
                        </button>
                    </form>

                    {/* Back Link - only show if not forced */}
                    {!forceChange && (
                        <div className="mt-6 text-center">
                            <Link
                                to="/admin"
                                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                ← Back to Dashboard
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
