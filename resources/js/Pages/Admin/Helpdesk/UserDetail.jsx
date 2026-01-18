import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { User, ArrowLeft, LogOut, Edit2, Trash2, FolderOpen, Plus, X, Shield, Check } from 'lucide-react';

const UserDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [roles, setRoles] = useState([]);
    const [availableProjects, setAvailableProjects] = useState([]);
    const [showAddProject, setShowAddProject] = useState(false);
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedRole, setSelectedRole] = useState('user');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUser();
        fetchRoles();
        fetchAvailableProjects();
    }, [userId]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/helpdesk/admin/users/${userId}`, {
                credentials: 'same-origin',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }
            const data = await response.json();
            setUser(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await fetch('/api/helpdesk/admin/roles', {
                credentials: 'same-origin',
            });
            if (response.ok) {
                const data = await response.json();
                setRoles(data);
            }
        } catch (err) {
            console.error('Failed to fetch roles:', err);
        }
    };

    const fetchAvailableProjects = async () => {
        try {
            const response = await fetch('/api/helpdesk/admin/projects', {
                credentials: 'same-origin',
            });
            if (response.ok) {
                const data = await response.json();
                setAvailableProjects(data.data || data);
            }
        } catch (err) {
            console.error('Failed to fetch projects:', err);
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

    const handleDeleteUser = async () => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch(`/api/helpdesk/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete user');
            }

            navigate('/admin/helpdesk/users');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAddToProject = async () => {
        if (!selectedProject) {
            return;
        }

        setSaving(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch(`/api/helpdesk/admin/projects/${selectedProject}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    user_id: userId,
                    role: selectedRole,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to add user to project');
            }

            setShowAddProject(false);
            setSelectedProject('');
            setSelectedRole('user');
            fetchUser();
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateRole = async (projectId, newRole) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ role: newRole }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update role');
            }

            fetchUser();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleRemoveFromProject = async (projectId) => {
        if (!confirm('Are you sure you want to remove this user from the project?')) {
            return;
        }

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to remove user from project');
            }

            fetchUser();
        } catch (err) {
            alert(err.message);
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'owner':
                return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
            case 'manager':
                return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            case 'agent':
                return 'bg-green-500/20 text-green-300 border-green-500/30';
            case 'user':
                return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
            default:
                return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
        }
    };

    // Filter out projects user is already in
    const projectsNotIn = availableProjects.filter(
        (project) => !user?.helpdesk_projects?.some((p) => p.id === project.id)
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
                <div className="text-slate-400">Loading user...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
                <div className="text-red-400">Error: {error}</div>
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
                            <span className="font-semibold text-lg">User Details</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <nav className="flex items-center gap-6">
                            <Link to="/admin/helpdesk" className="text-slate-300 hover:text-white transition">
                                Dashboard
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
                <div className="max-w-4xl mx-auto">
                    {/* User Info Card */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    <span className="text-purple-300 text-2xl font-bold">
                                        {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                    </span>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold flex items-center gap-3">
                                        {user?.name}
                                        {user?.is_admin && (
                                            <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full flex items-center gap-1">
                                                <Shield className="w-3 h-3" />
                                                Admin
                                            </span>
                                        )}
                                    </h1>
                                    <p className="text-slate-400">{user?.email}</p>
                                    <p className="text-slate-500 text-sm mt-1">
                                        Created {new Date(user?.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    to={`/admin/helpdesk/users/${userId}/edit`}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </Link>
                                {!user?.is_admin && (
                                    <button
                                        onClick={handleDeleteUser}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Project Access */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
                        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <FolderOpen className="w-5 h-5 text-purple-400" />
                                    Project Access
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">
                                    Manage which projects this user can access
                                </p>
                            </div>
                            {projectsNotIn.length > 0 && (
                                <button
                                    onClick={() => setShowAddProject(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add to Project
                                </button>
                            )}
                        </div>

                        {/* Add Project Modal */}
                        {showAddProject && (
                            <div className="p-6 border-b border-slate-700 bg-slate-900/50">
                                <div className="flex items-end gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Project
                                        </label>
                                        <select
                                            value={selectedProject}
                                            onChange={(e) => setSelectedProject(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                        >
                                            <option value="">Select a project...</option>
                                            {projectsNotIn.map((project) => (
                                                <option key={project.id} value={project.id}>
                                                    {project.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-48">
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Role
                                        </label>
                                        <select
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                        >
                                            {roles.map((role) => (
                                                <option key={role.value} value={role.value}>
                                                    {role.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleAddToProject}
                                            disabled={!selectedProject || saving}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 rounded-lg transition"
                                        >
                                            <Check className="w-4 h-4" />
                                            Add
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowAddProject(false);
                                                setSelectedProject('');
                                                setSelectedRole('user');
                                            }}
                                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Project List */}
                        <div className="divide-y divide-slate-700">
                            {user?.helpdesk_projects?.length === 0 ? (
                                <div className="p-12 text-center text-slate-400">
                                    This user doesn't have access to any projects yet.
                                </div>
                            ) : (
                                user?.helpdesk_projects?.map((project) => (
                                    <div key={project.id} className="p-4 flex items-center justify-between hover:bg-slate-700/30 transition">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: project.color || '#8b5cf6' }}
                                            />
                                            <div>
                                                <Link
                                                    to={`/admin/helpdesk/projects/${project.id}`}
                                                    className="font-medium text-white hover:text-purple-400 transition"
                                                >
                                                    {project.name}
                                                </Link>
                                                {project.description && (
                                                    <p className="text-slate-400 text-sm">{project.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <select
                                                value={project.pivot?.role || 'user'}
                                                onChange={(e) => handleUpdateRole(project.id, e.target.value)}
                                                className={`px-3 py-1 text-sm border rounded-full bg-transparent focus:outline-none ${getRoleBadgeColor(project.pivot?.role)}`}
                                            >
                                                {roles.map((role) => (
                                                    <option key={role.value} value={role.value} className="bg-slate-800">
                                                        {role.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => handleRemoveFromProject(project.id)}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition"
                                                title="Remove from project"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Role Legend */}
                    <div className="mt-6 bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                        <h3 className="text-sm font-medium text-slate-400 mb-3">Role Permissions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {roles.map((role) => (
                                <div key={role.value} className="flex items-start gap-2">
                                    <span className={`px-2 py-1 text-xs rounded-full border ${getRoleBadgeColor(role.value)}`}>
                                        {role.label}
                                    </span>
                                    <span className="text-slate-400">{role.description}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDetail;
