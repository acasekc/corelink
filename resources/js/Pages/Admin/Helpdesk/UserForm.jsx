import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { User, ArrowLeft, LogOut, Save, Loader2 } from 'lucide-react';

const UserForm = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(userId);

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        is_admin: false,
        send_welcome_email: true,
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
                credentials: 'same-origin',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }
            const data = await response.json();
            setFormData({
                name: data.name || '',
                email: data.email || '',
                password: '',
                password_confirmation: '',
                is_admin: data.is_admin || false,
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
            [name]: type === 'checkbox' ? checked : value,
        }));
        // Clear validation error when field is modified
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
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            // Prepare data - don't send empty passwords on edit
            const submitData = { ...formData };
            if (isEditing && !submitData.password) {
                delete submitData.password;
                delete submitData.password_confirmation;
            }

            const response = await fetch(
                isEditing ? `/api/helpdesk/admin/users/${userId}` : '/api/helpdesk/admin/users',
                {
                    method: isEditing ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify(submitData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 422 && data.errors) {
                    setValidationErrors(data.errors);
                    return;
                }
                throw new Error(data.message || 'Failed to save user');
            }

            // Backend wraps response in 'data' for create, but not for edit
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
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            await fetch('/admin/logout', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });
            window.location.href = '/admin/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
                <div className="text-slate-400">Loading user...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white">
            {/* Header */}
            <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/helpdesk/users" className="text-slate-400 hover:text-white transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <User className="w-6 h-6 text-purple-400" />
                            <span className="font-semibold text-lg">
                                {isEditing ? 'Edit User' : 'Create User'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <h1 className="text-2xl font-bold mb-6">
                            {isEditing ? 'Edit User' : 'Create New User'}
                        </h1>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full bg-slate-900 border rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 ${
                                        validationErrors.name ? 'border-red-500' : 'border-slate-700'
                                    }`}
                                    placeholder="Enter user's name"
                                />
                                {validationErrors.name && (
                                    <p className="mt-1 text-sm text-red-400">{validationErrors.name[0]}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full bg-slate-900 border rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 ${
                                        validationErrors.email ? 'border-red-500' : 'border-slate-700'
                                    }`}
                                    placeholder="Enter user's email"
                                />
                                {validationErrors.email && (
                                    <p className="mt-1 text-sm text-red-400">{validationErrors.email[0]}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Password {isEditing && <span className="text-slate-500">(leave blank to keep current)</span>}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full bg-slate-900 border rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 ${
                                        validationErrors.password ? 'border-red-500' : 'border-slate-700'
                                    }`}
                                    placeholder={isEditing ? '••••••••' : 'Enter password'}
                                />
                                {validationErrors.password && (
                                    <p className="mt-1 text-sm text-red-400">{validationErrors.password[0]}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                                    placeholder={isEditing ? '••••••••' : 'Confirm password'}
                                />
                            </div>

                            {/* Admin Checkbox */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_admin"
                                    name="is_admin"
                                    checked={formData.is_admin}
                                    onChange={handleChange}
                                    className="w-4 h-4 bg-slate-900 border-slate-700 rounded text-purple-500 focus:ring-purple-500"
                                />
                                <label htmlFor="is_admin" className="text-sm text-slate-300">
                                    Admin user (full system access)
                                </label>
                            </div>

                            {/* Send Welcome Email - only show for new users */}
                            {!isEditing && (
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="send_welcome_email"
                                        name="send_welcome_email"
                                        checked={formData.send_welcome_email}
                                        onChange={handleChange}
                                        className="w-4 h-4 bg-slate-900 border-slate-700 rounded text-purple-500 focus:ring-purple-500"
                                    />
                                    <label htmlFor="send_welcome_email" className="text-sm text-slate-300">
                                        Send welcome email with login credentials
                                    </label>
                                </div>
                            )}

                            {!isEditing && (
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-sm">
                                    <strong>Note:</strong> New users will be required to change their password on first login.
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-700">
                                <Link
                                    to="/admin/helpdesk/users"
                                    className="px-4 py-2 text-slate-300 hover:text-white transition"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 rounded-lg transition"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            {isEditing ? 'Update User' : 'Create User'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserForm;
