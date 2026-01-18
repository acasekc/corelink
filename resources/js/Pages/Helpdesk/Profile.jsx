import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Key, Save, Loader2, CheckCircle, ArrowLeft, LogOut } from "lucide-react";

const Profile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    
    const [form, setForm] = useState({
        name: "",
        email: "",
        errors: {},
        processing: false,
        success: false,
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/helpdesk/user/profile", {
                credentials: "same-origin",
            });

            if (res.status === 401) {
                window.location.href = "/helpdesk/login";
                return;
            }

            if (res.status === 403) {
                // Force password change required
                const data = await res.json();
                if (data.redirect) {
                    navigate(data.redirect);
                    return;
                }
            }

            const data = await res.json();
            setProfile(data);
            setForm((prev) => ({
                ...prev,
                name: data.name,
                email: data.email,
            }));
            setLoading(false);
        } catch (err) {
            console.error("Error fetching profile:", err);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
            errors: { ...prev.errors, [name]: null },
            success: false,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setForm((prev) => ({ ...prev, processing: true, errors: {}, success: false }));

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            || document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];

        try {
            const res = await fetch("/api/helpdesk/user/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": decodeURIComponent(csrfToken || ''),
                    "Accept": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setForm((prev) => ({
                    ...prev,
                    errors: data.errors || { general: data.message || "Failed to update profile." },
                    processing: false
                }));
            } else {
                setProfile(data.data);
                setForm((prev) => ({
                    ...prev,
                    processing: false,
                    success: true,
                }));
            }
        } catch (err) {
            setForm((prev) => ({
                ...prev,
                errors: { general: "Network error. Please try again." },
                processing: false
            }));
        }
    };

    const handleLogout = async () => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            || document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1];

        try {
            await fetch("/helpdesk/logout", {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": decodeURIComponent(csrfToken || ''),
                    "Accept": "application/json"
                },
                credentials: "same-origin",
            });
            window.location.href = "/helpdesk/login";
        } catch (err) {
            console.error("Logout error:", err);
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
        <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 px-4 py-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/helpdesk"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
                    <p className="text-slate-400 mt-1">Manage your account information</p>
                </div>

                {/* Profile Card */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-400" />
                        Personal Information
                    </h2>

                    {form.success && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <div className="flex items-center gap-2 text-green-400">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">Profile updated successfully!</span>
                            </div>
                        </div>
                    )}

                    {form.errors.general && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {form.errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                                Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Your name"
                                />
                            </div>
                            {form.errors.name && (
                                <p className="mt-1 text-sm text-red-400">{form.errors.name[0]}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="your@email.com"
                                />
                            </div>
                            {form.errors.email && (
                                <p className="mt-1 text-sm text-red-400">{form.errors.email[0]}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="py-2.5 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                            >
                                {form.processing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Security Card */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Key className="w-5 h-5 text-purple-400" />
                        Security
                    </h2>

                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-white font-medium">Password</h3>
                            <p className="text-slate-400 text-sm">Change your account password</p>
                        </div>
                        <Link
                            to="/helpdesk/change-password"
                            className="py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
                        >
                            Change Password
                        </Link>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-slate-800/50 rounded-xl border border-red-500/20 p-8">
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <LogOut className="w-5 h-5 text-red-400" />
                        Session
                    </h2>

                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-white font-medium">Log Out</h3>
                            <p className="text-slate-400 text-sm">Sign out of your account</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="py-2 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg transition-colors text-sm"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
