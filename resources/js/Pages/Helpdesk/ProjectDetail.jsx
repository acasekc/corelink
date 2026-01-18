import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
    Ticket,
    FolderOpen,
    Clock,
    CheckCircle2,
    AlertCircle,
    LogOut,
    ArrowLeft,
    Plus,
    User,
    ChevronRight,
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

const getStatusColor = (slug) => {
    switch (slug) {
        case 'open':
            return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        case 'in_progress':
            return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'pending':
            return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        case 'resolved':
            return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'closed':
            return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        default:
            return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
};

const getPriorityColor = (slug) => {
    switch (slug) {
        case 'critical':
            return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'high':
            return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        case 'medium':
            return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        case 'low':
            return 'bg-green-500/20 text-green-400 border-green-500/30';
        default:
            return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
};

export default function UserProjectDetail() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await fetch(`/api/helpdesk/user/projects/${projectId}`, {
                    credentials: 'include',
                });

                if (response.status === 401) {
                    navigate('/helpdesk/login');
                    return;
                }

                if (response.status === 403) {
                    setError('You do not have access to this project');
                    setLoading(false);
                    return;
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch project');
                }

                const result = await response.json();
                setProject(result.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [projectId, navigate]);

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
                <div className="text-slate-400">Loading project...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white">
                <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
                    <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                        <Link to="/helpdesk" className="flex items-center gap-3">
                            <Ticket className="w-6 h-6 text-purple-400" />
                            <span className="font-semibold text-lg">Support Center</span>
                        </Link>
                    </div>
                </header>
                <main className="container mx-auto px-6 py-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8">
                            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold mb-2">Error</h2>
                            <p className="text-slate-400 mb-4">{error}</p>
                            <Link
                                to="/helpdesk"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </main>
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
                            {project?.permissions?.can_create_ticket && (
                                <Link
                                    to={`/helpdesk/tickets/create?project=${projectId}`}
                                    className="text-slate-300 hover:text-white transition flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" />
                                    New Ticket
                                </Link>
                            )}
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
                    {/* Breadcrumb & Project Header */}
                    <div className="mb-6">
                        <Link
                            to="/helpdesk"
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Link>
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: `${project?.color || '#3b82f6'}20` }}
                            >
                                <FolderOpen
                                    className="w-6 h-6"
                                    style={{ color: project?.color || '#3b82f6' }}
                                />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{project?.name}</h1>
                                {project?.description && (
                                    <p className="text-slate-400 mt-1">{project.description}</p>
                                )}
                            </div>
                        </div>
                        {project?.role_label && (
                            <span className="mt-3 inline-block px-3 py-1 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-lg text-sm">
                                {project.role_label}
                            </span>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            icon={Ticket}
                            label="Total Tickets"
                            value={project?.stats?.total || 0}
                            color="bg-purple-600"
                            link={`/helpdesk/tickets?project=${projectId}`}
                        />
                        <StatCard
                            icon={AlertCircle}
                            label="Open"
                            value={project?.stats?.open || 0}
                            color="bg-amber-500"
                            link={`/helpdesk/tickets?project=${projectId}&status=open`}
                        />
                        <StatCard
                            icon={Clock}
                            label="In Progress"
                            value={project?.stats?.in_progress || 0}
                            color="bg-blue-500"
                            link={`/helpdesk/tickets?project=${projectId}&status=in_progress`}
                        />
                        <StatCard
                            icon={CheckCircle2}
                            label="Resolved"
                            value={project?.stats?.resolved || 0}
                            color="bg-green-500"
                            link={`/helpdesk/tickets?project=${projectId}&status=resolved`}
                        />
                    </div>

                    {/* Recent Tickets */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Recent Tickets</h2>
                            <Link
                                to={`/helpdesk/tickets?project=${projectId}`}
                                className="text-sm text-purple-400 hover:text-purple-300 transition flex items-center gap-1"
                            >
                                View All
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {project?.recent_tickets?.length > 0 ? (
                            <div className="divide-y divide-slate-700">
                                {project.recent_tickets.map((ticket) => (
                                    <Link
                                        key={ticket.id}
                                        to={`/helpdesk/tickets/${ticket.id}`}
                                        className="block py-4 first:pt-0 last:pb-0 hover:bg-slate-700/30 -mx-2 px-2 rounded-lg transition"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs text-slate-500 font-mono">
                                                        #{ticket.number || ticket.id}
                                                    </span>
                                                    <h3 className="font-medium truncate">{ticket.title}</h3>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm">
                                                    {ticket.status && (
                                                        <span
                                                            className={`px-2 py-0.5 rounded border text-xs ${getStatusColor(ticket.status.slug)}`}
                                                        >
                                                            {ticket.status.title}
                                                        </span>
                                                    )}
                                                    {ticket.priority && (
                                                        <span
                                                            className={`px-2 py-0.5 rounded border text-xs ${getPriorityColor(ticket.priority.slug)}`}
                                                        >
                                                            {ticket.priority.title}
                                                        </span>
                                                    )}
                                                    {ticket.assignee && (
                                                        <span className="text-slate-400 flex items-center gap-1">
                                                            <User className="w-3 h-3" />
                                                            {ticket.assignee.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right text-sm text-slate-500">
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="mb-4">No tickets yet</p>
                                {project?.permissions?.can_create_ticket && (
                                    <Link
                                        to={`/helpdesk/tickets/create?project=${projectId}`}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create a Ticket
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
