import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Users, ArrowLeft, LogOut, Search, Plus, Edit2, Trash2, Shield, ChevronLeft, ChevronRight, FolderOpen } from 'lucide-react';

const UsersList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
    });
    const [roles, setRoles] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, [searchParams]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const page = searchParams.get('page') || 1;
            const search = searchParams.get('search') || '';
            
            const params = new URLSearchParams({ page, per_page: 20 });
            if (search) {
                params.append('search', search);
            }

            const response = await fetch(`/api/helpdesk/admin/users?${params}`, {
                credentials: 'same-origin',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            setUsers(data.data);
            setPagination({
                current_page: data.current_page,
                last_page: data.last_page,
                per_page: data.per_page,
                total: data.total,
            });
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

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (searchTerm) {
            params.set('search', searchTerm);
        } else {
            params.delete('search');
        }
        params.set('page', '1');
        setSearchParams(params);
    };

    const handlePageChange = (page) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        setSearchParams(params);
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

    const handleDeleteUser = async (userId) => {
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

            fetchUsers();
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

    if (loading && users.length === 0) {
        return (
            <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
                <div className="text-slate-400">Loading users...</div>
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
                        <Link to="/admin/helpdesk" className="text-slate-400 hover:text-white transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <Users className="w-6 h-6 text-purple-400" />
                            <span className="font-semibold text-lg">Users</span>
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
                            <Link to="/admin/helpdesk/projects" className="text-slate-300 hover:text-white transition">
                                Projects
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
                            <h1 className="text-3xl font-bold mb-2">User Management</h1>
                            <p className="text-slate-400">Manage helpdesk users and their project access</p>
                        </div>
                        <Link
                            to="/admin/helpdesk/users/create"
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                        >
                            <Plus className="w-4 h-4" />
                            Add User
                        </Link>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Users Table */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-800">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">User</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Email</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Projects</th>
                                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Created</th>
                                    <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-700/50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                        <span className="text-purple-300 font-medium">
                                                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white">{user.name}</div>
                                                        {user.is_admin && (
                                                            <span className="text-xs text-purple-400">Admin</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {user.helpdesk_projects && user.helpdesk_projects.length > 0 ? (
                                                        user.helpdesk_projects.slice(0, 3).map((project) => (
                                                            <span
                                                                key={project.id}
                                                                className={`px-2 py-1 text-xs rounded-full border ${getRoleBadgeColor(project.pivot?.role)}`}
                                                            >
                                                                {project.name} ({project.pivot?.role || 'member'})
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-slate-500 text-sm">No projects</span>
                                                    )}
                                                    {user.helpdesk_projects && user.helpdesk_projects.length > 3 && (
                                                        <span className="px-2 py-1 text-xs rounded-full bg-slate-600 text-slate-300">
                                                            +{user.helpdesk_projects.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-sm">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        to={`/admin/helpdesk/users/${user.id}`}
                                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                                                        title="View & Edit User"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        to={`/admin/helpdesk/users/${user.id}/projects`}
                                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                                                        title="Manage Project Access"
                                                    >
                                                        <FolderOpen className="w-4 h-4" />
                                                    </Link>
                                                    {!user.is_admin && (
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-slate-400">
                                Showing {(pagination.current_page - 1) * pagination.per_page + 1} to{' '}
                                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                                {pagination.total} users
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="px-4 py-2 text-sm">
                                    Page {pagination.current_page} of {pagination.last_page}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default UsersList;
