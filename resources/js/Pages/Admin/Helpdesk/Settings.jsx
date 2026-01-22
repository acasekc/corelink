import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, LogOut, Settings as SettingsIcon, Plus, Pencil, Trash2, GripVertical, Check, X, AlertCircle } from 'lucide-react';

const Settings = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', slug: '', description: '', default_rate: '', is_active: true });
    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/helpdesk/admin/hourly-rate-categories', {
                credentials: 'same-origin',
            });
            if (response.status === 401) {
                window.location.href = '/admin/login';
                return;
            }
            if (!response.ok) throw new Error('Failed to fetch categories');
            const json = await response.json();
            setCategories(json.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/admin/logout', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });
            window.location.href = '/admin/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const openCreateForm = () => {
        setFormData({ name: '', slug: '', description: '', default_rate: '', is_active: true });
        setEditingCategory(null);
        setShowForm(true);
    };

    const openEditForm = (category) => {
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            default_rate: category.default_rate || '',
            is_active: category.is_active,
        });
        setEditingCategory(category);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingCategory(null);
        setFormData({ name: '', slug: '', description: '', default_rate: '', is_active: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const url = editingCategory
                ? `/api/helpdesk/admin/hourly-rate-categories/${editingCategory.id}`
                : '/api/helpdesk/admin/hourly-rate-categories';
            const method = editingCategory ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to save category');
            }

            await fetchCategories();
            closeForm();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (categoryId) => {
        try {
            const response = await fetch(`/api/helpdesk/admin/hourly-rate-categories/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to delete category');
            }

            await fetchCategories();
            setDeleteConfirm(null);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleToggleActive = async (category) => {
        try {
            const response = await fetch(`/api/helpdesk/admin/hourly-rate-categories/${category.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ is_active: !category.is_active }),
            });

            if (!response.ok) throw new Error('Failed to update category');
            await fetchCategories();
        } catch (err) {
            alert(err.message);
        }
    };

    const moveCategory = async (categoryId, direction) => {
        const index = categories.findIndex(c => c.id === categoryId);
        if (index === -1) return;
        
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= categories.length) return;

        const newOrder = [...categories];
        [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
        
        try {
            const response = await fetch('/api/helpdesk/admin/hourly-rate-categories/reorder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ order: newOrder.map(c => c.id) }),
            });

            if (!response.ok) throw new Error('Failed to reorder categories');
            await fetchCategories();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-red-400">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link to="/admin/helpdesk" className="flex items-center gap-2 hover:text-purple-400 transition">
                                <Ticket className="w-6 h-6 text-purple-400" />
                                <span className="font-semibold text-lg">Helpdesk</span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <nav className="flex items-center gap-6">
                                <Link to="/admin/helpdesk/tickets" className="text-slate-300 hover:text-white transition">
                                    Tickets
                                </Link>
                                <Link to="/admin/helpdesk/projects" className="text-slate-300 hover:text-white transition">
                                    Projects
                                </Link>
                                <Link to="/admin/helpdesk/invoices" className="text-slate-300 hover:text-white transition">
                                    Invoices
                                </Link>
                                <Link to="/admin/helpdesk/users" className="text-slate-300 hover:text-white transition">
                                    Users
                                </Link>
                                <Link to="/admin/helpdesk/settings" className="text-white font-medium transition">
                                    Settings
                                </Link>
                            </nav>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <SettingsIcon className="w-8 h-8 text-purple-400" />
                        <h1 className="text-2xl font-bold">Settings</h1>
                    </div>
                </div>

                {/* Time Categories Section */}
                <div className="bg-slate-800 rounded-xl border border-slate-700">
                    <div className="p-6 border-b border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">Billable Time Categories</h2>
                                <p className="text-slate-400 mt-1">
                                    Manage categories for time tracking (e.g., Development, Design, Support)
                                </p>
                            </div>
                            <button
                                onClick={openCreateForm}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                            >
                                <Plus className="w-4 h-4" />
                                Add Category
                            </button>
                        </div>
                    </div>

                    {/* Category Form Modal */}
                    {showForm && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md mx-4">
                                <div className="p-6 border-b border-slate-700">
                                    <h3 className="text-lg font-semibold">
                                        {editingCategory ? 'Edit Category' : 'New Category'}
                                    </h3>
                                </div>
                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">
                                            Name <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="e.g., Development"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">
                                            Slug
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="e.g., development (auto-generated if empty)"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">
                                            Used for internal identification. Auto-generated from name if left empty.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            rows={2}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="Optional description"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">
                                            Default Hourly Rate
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.default_rate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, default_rate: e.target.value }))}
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-7 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Default rate used when adding this category to a project. Can be overridden per project.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                            className="rounded bg-slate-700 border-slate-600 text-purple-500 focus:ring-purple-500"
                                        />
                                        <label htmlFor="is_active" className="text-sm text-slate-300">
                                            Active (available for selection)
                                        </label>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={closeForm}
                                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50"
                                        >
                                            {submitting ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Categories List */}
                    <div className="divide-y divide-slate-700">
                        {categories.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <SettingsIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No categories yet. Add your first category to get started.</p>
                            </div>
                        ) : (
                            categories.map((category, index) => (
                                <div
                                    key={category.id}
                                    className={`flex items-center justify-between p-4 ${!category.is_active ? 'opacity-60' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => moveCategory(category.id, 'up')}
                                                disabled={index === 0}
                                                className="p-1 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Move up"
                                            >
                                                <GripVertical className="w-4 h-4 rotate-90" />
                                            </button>
                                            <button
                                                onClick={() => moveCategory(category.id, 'down')}
                                                disabled={index === categories.length - 1}
                                                className="p-1 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                                title="Move down"
                                            >
                                                <GripVertical className="w-4 h-4 -rotate-90" />
                                            </button>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{category.name}</span>
                                                <span className="text-xs px-2 py-0.5 bg-slate-700 rounded text-slate-400">
                                                    {category.slug}
                                                </span>
                                                {!category.is_active && (
                                                    <span className="text-xs px-2 py-0.5 bg-yellow-900/50 text-yellow-400 rounded">
                                                        Inactive
                                                    </span>
                                                )}
                                                {category.default_rate && (
                                                    <span className="text-xs px-2 py-0.5 bg-green-900/50 text-green-400 rounded">
                                                        ${parseFloat(category.default_rate).toFixed(2)}/hr
                                                    </span>
                                                )}
                                            </div>
                                            {category.description && (
                                                <p className="text-sm text-slate-400 mt-1">{category.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleActive(category)}
                                            className={`p-2 rounded-lg transition ${
                                                category.is_active 
                                                    ? 'hover:bg-yellow-900/30 text-yellow-400' 
                                                    : 'hover:bg-green-900/30 text-green-400'
                                            }`}
                                            title={category.is_active ? 'Deactivate' : 'Activate'}
                                        >
                                            {category.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => openEditForm(category)}
                                            className="p-2 hover:bg-slate-700 rounded-lg transition"
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        {deleteConfirm === category.id ? (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded transition"
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(null)}
                                                    className="px-2 py-1 text-xs bg-slate-600 hover:bg-slate-500 rounded transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setDeleteConfirm(category.id)}
                                                className="p-2 hover:bg-red-900/30 text-red-400 rounded-lg transition"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <h3 className="font-medium text-slate-300 mb-2">About Time Categories</h3>
                    <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                        <li>Categories help classify time entries (e.g., Development, Design, Meetings)</li>
                        <li>Each category can have a different hourly rate per project</li>
                        <li>Deactivating a category hides it from selection but preserves existing time entries</li>
                        <li>Categories in use cannot be deleted - deactivate them instead</li>
                    </ul>
                </div>
            </main>
        </div>
    );
};

export default Settings;
