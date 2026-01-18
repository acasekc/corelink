import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderOpen, ArrowLeft, LogOut } from 'lucide-react';

const ProjectForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await fetch('/api/helpdesk/admin/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                if (data.errors) {
                    setErrors(data.errors);
                    return;
                }
                throw new Error(data.message || 'Failed to create project');
            }

            const result = await response.json();
            navigate(`/admin/helpdesk/projects/${result.data.id}`);
        } catch (err) {
            alert('Failed to create project: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const csrfToken = getCsrfToken();
            await fetch('/admin/logout', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
                credentials: 'same-origin',
            });
            window.location.href = '/admin/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white">
            {/* Header */}
            <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/helpdesk/projects" className="text-slate-400 hover:text-white transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <FolderOpen className="w-6 h-6 text-purple-400" />
                            <span className="font-semibold text-lg">New Project</span>
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
                        <h1 className="text-2xl font-bold mb-6">Create New Project</h1>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                                    Project Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`w-full bg-slate-700 border ${
                                        errors.name ? 'border-red-500' : 'border-slate-600'
                                    } rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                    placeholder="e.g., PantryLink, ChampLink"
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-400">{errors.name[0]}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    placeholder="Brief description of the project..."
                                />
                            </div>

                            <div className="bg-slate-700/50 rounded-lg p-4 text-sm text-slate-400">
                                <p>
                                    <strong className="text-slate-300">Note:</strong> An API key will be automatically
                                    generated for this project. You can create additional keys after the project is created.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Creating...' : 'Create Project'}
                                </button>
                                <Link
                                    to="/admin/helpdesk/projects"
                                    className="px-6 py-3 bg-slate-600 hover:bg-slate-500 rounded-lg transition font-medium text-center"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProjectForm;
