import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Ticket,
    FolderOpen,
    Clock,
    CheckCircle2,
    AlertCircle,
    LogOut,
    ChevronRight,
    Plus,
    User,
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, link }) => {
    const Wrapper = link ? Link : 'div';
    const wrapperProps = link ? { to: link } : {};

    return (
        <Wrapper
            {...wrapperProps}
            className={`bg-slate-800/50 border border-slate-700 rounded-xl p-4 ${link ? 'hover:border-slate-600 transition cursor-pointer' : ''}`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="text-sm text-slate-400">{label}</p>
                    <p className="text-xl font-bold">{value}</p>
                </div>
            </div>
        </Wrapper>
    );
};

export default function HelpdeskUserDashboard() {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await fetch('/api/helpdesk/user/dashboard', {
                    credentials: 'include',
                });

                if (response.status === 401) {
                    navigate('/admin/login');
                    return;
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard');
                }

                const result = await response.json();
                setDashboard(result.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await fetch('/helpdesk/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
            });
            window.location.href = '/helpdesk/login';
        } catch (err) {
            console.error('Logout failed:', err);
        }
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
                        <Link to="/helpdesk" className="flex items-center gap-3">
                            <Ticket className="w-6 h-6 text-purple-400" />
                            <span className="font-semibold text-lg">Support Center</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <nav className="flex items-center gap-6">
                            <Link to="/helpdesk/tickets" className="text-slate-300 hover:text-white transition">
                                My Tickets
                            </Link>
                            <Link to="/helpdesk/tickets/create" className="text-slate-300 hover:text-white transition flex items-center gap-1">
                                <Plus className="w-4 h-4" />
                                New Ticket
                            </Link>
                        </nav>
                        <Link to="/helpdesk/profile" className="flex items-center gap-3 px-3 py-1 bg-slate-800 rounded-lg hover:bg-slate-700 transition">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-sm">{dashboard?.user?.name}</span>
                            {dashboard?.user?.is_staff && (
                                <span className="px-2 py-0.5 bg-purple-600 text-xs rounded">Staff</span>
                            )}
                        </Link>
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
                    {/* Welcome */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Welcome back, {dashboard?.user?.name}!</h1>
                        <p className="text-slate-400">Track and manage your support tickets</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            icon={Ticket}
                            label="Total Tickets"
                            value={dashboard?.stats?.total_tickets || 0}
                            color="bg-purple-600"
                            link="/helpdesk/tickets"
                        />
                        <StatCard
                            icon={AlertCircle}
                            label="Open"
                            value={dashboard?.stats?.open_tickets || 0}
                            color="bg-amber-500"
                            link="/helpdesk/tickets?status=open"
                        />
                        <StatCard
                            icon={Clock}
                            label="In Progress"
                            value={dashboard?.stats?.in_progress_tickets || 0}
                            color="bg-blue-500"
                            link="/helpdesk/tickets?status=in_progress"
                        />
                        <StatCard
                            icon={CheckCircle2}
                            label="Resolved"
                            value={dashboard?.stats?.resolved_tickets || 0}
                            color="bg-green-500"
                            link="/helpdesk/tickets?status=resolved"
                        />
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* My Projects */}
                        <div className="lg:col-span-1">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">My Projects</h2>
                            </div>
                            <div className="space-y-3">
                                {dashboard?.projects?.length > 0 ? (
                                    dashboard.projects.map((project) => (
                                        <Link
                                            key={project.id}
                                            to={`/helpdesk/projects/${project.id}`}
                                            className="block bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <FolderOpen 
                                                    className="w-5 h-5" 
                                                    style={{ color: project.color || '#3b82f6' }}
                                                />
                                                <h3 className="font-semibold">{project.name}</h3>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <span className="px-2 py-0.5 bg-slate-700 rounded text-xs">
                                                    {project.role_label}
                                                </span>
                                                <span>{project.open} open tickets</span>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No projects assigned yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Tickets */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Recent Tickets</h2>
                                <Link to="/helpdesk/tickets" className="text-purple-400 hover:text-purple-300 text-sm">
                                    View All →
                                </Link>
                            </div>

                            {dashboard?.recent_tickets?.length > 0 ? (
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-slate-800">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Ticket</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Project</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Status</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Priority</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Created</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700">
                                            {dashboard.recent_tickets.map((ticket) => (
                                                <tr key={ticket.id} className="hover:bg-slate-800/50">
                                                    <td className="px-4 py-3">
                                                        <Link
                                                            to={`/helpdesk/tickets/${ticket.id}`}
                                                            className="text-purple-400 hover:text-purple-300 font-medium"
                                                        >
                                                            #{ticket.number}
                                                        </Link>
                                                        <p className="text-sm text-slate-400 truncate max-w-xs">
                                                            {ticket.title}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">{ticket.project?.name}</td>
                                                    <td className="px-4 py-3">
                                                        <span 
                                                            className="px-2 py-1 rounded-full text-xs font-medium"
                                                            style={{ 
                                                                backgroundColor: `${ticket.status?.color}20`,
                                                                color: ticket.status?.color 
                                                            }}
                                                        >
                                                            {ticket.status?.title}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span 
                                                            className="px-2 py-1 rounded-full text-xs font-medium"
                                                            style={{ 
                                                                backgroundColor: `${ticket.priority?.color}20`,
                                                                color: ticket.priority?.color 
                                                            }}
                                                        >
                                                            {ticket.priority?.title}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-slate-400">
                                                        {new Date(ticket.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                                    <Ticket className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                                    <p className="text-slate-400 mb-4">No tickets yet</p>
                                    <Link
                                        to="/helpdesk/tickets/create"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create Your First Ticket
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assigned to Me (for staff) */}
                    {dashboard?.user?.is_staff && dashboard?.assigned_to_me?.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold mb-4">Assigned to Me</h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {dashboard.assigned_to_me.map((ticket) => (
                                    <Link
                                        key={ticket.id}
                                        to={`/helpdesk/tickets/${ticket.id}`}
                                        className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-purple-500/50 transition"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-purple-400 font-medium">#{ticket.number}</span>
                                            <span className="text-xs text-slate-400">{ticket.project?.name}</span>
                                        </div>
                                        <p className="text-sm mb-2 line-clamp-2">{ticket.title}</p>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="px-2 py-0.5 bg-slate-700 rounded">{ticket.status}</span>
                                            <span className="px-2 py-0.5 bg-slate-700 rounded">{ticket.priority}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
