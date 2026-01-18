import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, FolderOpen, Clock, CheckCircle, AlertCircle, LogOut, ArrowLeft } from 'lucide-react';

const HelpdeskDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await fetch('/api/helpdesk/admin/dashboard', {
                credentials: 'same-origin',
            });
            if (response.status === 401) {
                window.location.href = '/admin/login';
                return;
            }
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch dashboard');
            }
            const data = await response.json();
            setDashboard(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
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

    const StatCard = ({ icon: Icon, label, value, color, link }) => {
        const CardContent = (
            <div className={`bg-slate-800/50 border border-slate-700 rounded-xl p-6 ${link ? 'hover:border-slate-600 transition-colors' : ''}`}>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${color}`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">{label}</p>
                        <p className="text-2xl font-bold text-white">{value}</p>
                    </div>
                </div>
            </div>
        );

        if (link) {
            return <Link to={link}>{CardContent}</Link>;
        }
        return CardContent;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
                <div className="text-slate-400">Loading dashboard...</div>
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
                        <Link to="/admin" className="text-slate-400 hover:text-white transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <Link to="/admin/helpdesk" className="flex items-center gap-3">
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
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Helpdesk Dashboard</h1>
                        <p className="text-slate-400">Overview of support tickets across all projects</p>
                    </div>

                    {/* Global Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            icon={Ticket}
                            label="Total Tickets"
                            value={dashboard?.stats?.total_tickets || 0}
                            color="bg-blue-500"
                            link="/admin/helpdesk/tickets"
                        />
                        <StatCard
                            icon={Clock}
                            label="Open"
                            value={dashboard?.stats?.open_tickets || 0}
                            color="bg-yellow-500"
                            link="/admin/helpdesk/tickets?status=open"
                        />
                        <StatCard
                            icon={AlertCircle}
                            label="In Progress"
                            value={dashboard?.stats?.in_progress_tickets || 0}
                            color="bg-purple-500"
                            link="/admin/helpdesk/tickets?status=in_progress"
                        />
                        <StatCard
                            icon={CheckCircle}
                            label="Resolved"
                            value={dashboard?.stats?.resolved_tickets || 0}
                            color="bg-green-500"
                            link="/admin/helpdesk/tickets?status=resolved"
                        />
                    </div>

                    {/* Projects Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Projects</h2>
                            <Link
                                to="/admin/helpdesk/projects"
                                className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                            >
                                Manage Projects →
                            </Link>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {dashboard?.projects?.map((project) => (
                                <Link
                                    key={project.id}
                                    to={`/admin/helpdesk/projects/${project.id}`}
                                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors group"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-lg bg-slate-700 group-hover:bg-purple-500/20 transition-colors">
                                            <FolderOpen className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <h3 className="font-semibold text-white">{project.name}</h3>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <p className="text-lg font-bold text-white">{project.total_tickets}</p>
                                            <p className="text-xs text-slate-400">Total</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-yellow-400">{project.open_tickets}</p>
                                            <p className="text-xs text-slate-400">Open</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-purple-400">{project.in_progress}</p>
                                            <p className="text-xs text-slate-400">In Progress</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {(!dashboard?.projects || dashboard.projects.length === 0) && (
                                <div className="col-span-full text-center py-8 text-slate-500">
                                    No projects yet.{' '}
                                    <Link to="/admin/helpdesk/projects/create" className="text-purple-400 hover:text-purple-300">
                                        Create one
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Tickets Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Recent Tickets</h2>
                            <Link
                                to="/admin/helpdesk/tickets"
                                className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                            >
                                View All →
                            </Link>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                            {dashboard?.recent_tickets?.length > 0 ? (
                                <table className="w-full">
                                    <thead className="bg-slate-700/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Ticket</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Project</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Priority</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {dashboard.recent_tickets.map((ticket) => (
                                            <tr key={ticket.id} className="hover:bg-slate-700/30">
                                                <td className="px-6 py-4">
                                                    <Link
                                                        to={`/admin/helpdesk/tickets/${ticket.id}`}
                                                        className="text-purple-400 hover:text-purple-300 font-medium"
                                                    >
                                                        #{ticket.number}
                                                    </Link>
                                                    <p className="text-sm text-slate-300 truncate max-w-xs">{ticket.title}</p>
                                                </td>
                                                <td className="px-6 py-4 text-slate-300">{ticket.project?.name}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status?.slug)}`}>
                                                        {ticket.status?.title}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority?.slug)}`}>
                                                        {ticket.priority?.title}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-400 text-sm">
                                                    {new Date(ticket.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="px-6 py-8 text-center text-slate-500">
                                    No tickets yet. Tickets will appear here when external apps submit them.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const getStatusColor = (slug) => {
    const colors = {
        open: 'bg-yellow-500/20 text-yellow-400',
        in_progress: 'bg-purple-500/20 text-purple-400',
        pending: 'bg-orange-500/20 text-orange-400',
        resolved: 'bg-green-500/20 text-green-400',
        closed: 'bg-slate-500/20 text-slate-400',
    };
    return colors[slug] || 'bg-slate-500/20 text-slate-400';
};

const getPriorityColor = (slug) => {
    const colors = {
        low: 'bg-blue-500/20 text-blue-400',
        medium: 'bg-yellow-500/20 text-yellow-400',
        high: 'bg-orange-500/20 text-orange-400',
        urgent: 'bg-red-500/20 text-red-400',
    };
    return colors[slug] || 'bg-slate-500/20 text-slate-400';
};

export default HelpdeskDashboard;
