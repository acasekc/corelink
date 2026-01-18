import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, ArrowLeft, LogOut, Plus, Key, Trash2, RefreshCw } from 'lucide-react';

const ProjectsList = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/helpdesk/admin/projects', {
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to fetch projects');
            const data = await response.json();
            setProjects(data.data || data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    };

    const handleDelete = async (projectId) => {
        if (!confirm('Are you sure you want to delete this project? All associated tickets and API keys will be deleted.')) {
            return;
        }

        try {
            const response = await fetch(`/api/helpdesk/admin/projects/${projectId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to delete project');
            setProjects(projects.filter((p) => p.id !== projectId));
        } catch (err) {
            alert('Failed to delete project: ' + err.message);
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
                        <Link to="/admin/helpdesk" className="text-slate-400 hover:text-white transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <FolderOpen className="w-6 h-6 text-purple-400" />
                            <span className="font-semibold text-lg">Projects</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <nav className="flex items-center gap-6">
                            <Link to="/admin/helpdesk" className="text-slate-300 hover:text-white transition">
                                Dashboard
                            </Link>
                            <Link to="/admin/helpdesk/tickets" className="text-slate-300 hover:text-white transition">
                                Tickets
                            </Link>
                            <Link to="/admin/helpdesk/users" className="text-slate-300 hover:text-white transition">
                                Users
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
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Projects</h1>
                            <p className="text-slate-400">Manage external applications and their API keys</p>
                        </div>
                        <Link
                            to="/admin/helpdesk/projects/create"
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                        >
                            <Plus className="w-4 h-4" />
                            New Project
                        </Link>
                    </div>

                    {/* Projects Grid */}
                    {loading ? (
                        <div className="text-center py-12 text-slate-400">Loading projects...</div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-400">Error: {error}</div>
                    ) : projects.length === 0 ? (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                            <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
                            <p className="text-slate-400 mb-4">
                                Create a project to generate API keys for external applications.
                            </p>
                            <Link
                                to="/admin/helpdesk/projects/create"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                            >
                                <Plus className="w-4 h-4" />
                                Create First Project
                            </Link>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-purple-500/20">
                                                    <FolderOpen className="w-5 h-5 text-purple-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white">{project.name}</h3>
                                                    <p className="text-xs text-slate-500 font-mono">{project.slug}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(project.id)}
                                                className="p-2 text-slate-400 hover:text-red-400 transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {project.description && (
                                            <p className="text-sm text-slate-400 mb-4">{project.description}</p>
                                        )}

                                        <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                                            <div className="bg-slate-700/50 rounded-lg p-3">
                                                <p className="text-lg font-bold text-white">{project.tickets_count || 0}</p>
                                                <p className="text-xs text-slate-400">Tickets</p>
                                            </div>
                                            <div className="bg-slate-700/50 rounded-lg p-3">
                                                <p className="text-lg font-bold text-white">{project.api_keys_count || 0}</p>
                                                <p className="text-xs text-slate-400">API Keys</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Link
                                                to={`/admin/helpdesk/projects/${project.id}`}
                                                className="flex-1 text-center px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-sm"
                                            >
                                                View Details
                                            </Link>
                                            <Link
                                                to={`/admin/helpdesk/projects/${project.id}/keys`}
                                                className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-sm"
                                            >
                                                <Key className="w-4 h-4" />
                                                Keys
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ProjectsList;
