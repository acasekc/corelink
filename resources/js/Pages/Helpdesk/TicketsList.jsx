import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Ticket,
    LogOut,
    Plus,
    User,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

export default function HelpdeskUserTicketsList() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [meta, setMeta] = useState({});
    const [projects, setProjects] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [priorities, setPriorities] = useState([]);

    const [filters, setFilters] = useState({
        status: searchParams.get('status') || '',
        priority: searchParams.get('priority') || '',
        project: searchParams.get('project') || '',
        search: searchParams.get('search') || '',
        assigned_to_me: searchParams.get('assigned_to_me') || '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch projects first to get reference data
                const projectsRes = await fetch('/api/helpdesk/user/projects', { credentials: 'include' });
                if (projectsRes.status === 401) {
                    navigate('/admin/login');
                    return;
                }
                const projectsData = await projectsRes.json();
                setProjects(projectsData.data || []);

                // Fetch reference data from first project
                if (projectsData.data?.length > 0) {
                    const refRes = await fetch(`/api/helpdesk/user/projects/${projectsData.data[0].id}/reference-data`, {
                        credentials: 'include',
                    });
                    const refData = await refRes.json();
                    setStatuses(refData.data?.statuses || []);
                    setPriorities(refData.data?.priorities || []);
                }
            } catch (err) {
                console.error('Failed to fetch reference data:', err);
            }
        };
        fetchData();
    }, [navigate]);

    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (filters.status) params.append('status', filters.status);
                if (filters.priority) params.append('priority', filters.priority);
                if (filters.project) params.append('project', filters.project);
                if (filters.search) params.append('search', filters.search);
                if (filters.assigned_to_me) params.append('assigned_to_me', '1');
                params.append('page', searchParams.get('page') || '1');

                const response = await fetch(`/api/helpdesk/user/tickets?${params}`, {
                    credentials: 'include',
                });

                if (response.status === 401) {
                    navigate('/admin/login');
                    return;
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch tickets');
                }

                const result = await response.json();
                setTickets(result.data || []);
                setMeta(result.meta || {});
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [filters, searchParams, navigate]);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v) params.set(k, v);
        });
        setSearchParams(params);
    };

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

    return (
        <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white">
            {/* Header */}
            <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/helpdesk" className="text-slate-400 hover:text-white transition">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <Ticket className="w-6 h-6 text-purple-400" />
                            <span className="font-semibold text-lg">My Tickets</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/helpdesk/tickets/create"
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                        >
                            <Plus className="w-4 h-4" />
                            New Ticket
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
                    {/* Filters */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Filter className="w-5 h-5 text-slate-400" />
                            <span className="text-slate-300">Filters:</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">All Statuses</option>
                                {statuses.map((s) => (
                                    <option key={s.id} value={s.slug}>{s.title}</option>
                                ))}
                            </select>

                            <select
                                value={filters.priority}
                                onChange={(e) => handleFilterChange('priority', e.target.value)}
                                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">All Priorities</option>
                                {priorities.map((p) => (
                                    <option key={p.id} value={p.slug}>{p.title}</option>
                                ))}
                            </select>

                            <select
                                value={filters.project}
                                onChange={(e) => handleFilterChange('project', e.target.value)}
                                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">All Projects</option>
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>

                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search tickets..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tickets Table */}
                    {loading ? (
                        <div className="text-center py-12 text-slate-400">Loading tickets...</div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-400">Error: {error}</div>
                    ) : tickets.length === 0 ? (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                            <Ticket className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                            <p className="text-slate-400 mb-4">No tickets found</p>
                            <Link
                                to="/helpdesk/tickets/create"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                            >
                                <Plus className="w-4 h-4" />
                                Create a Ticket
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-800">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Ticket</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Project</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Status</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Priority</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Assigned</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {tickets.map((ticket) => (
                                        <tr key={ticket.id} className="hover:bg-slate-800/50">
                                            <td className="px-4 py-3">
                                                <Link
                                                    to={`/helpdesk/tickets/${ticket.id}`}
                                                    className="text-purple-400 hover:text-purple-300 font-medium"
                                                >
                                                    #{ticket.project?.ticket_prefix}-{String(ticket.number).padStart(4, '0')}
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
                                            <td className="px-4 py-3 text-sm">
                                                {ticket.assignee?.name || (
                                                    <span className="text-slate-500">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-400">
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {meta.last_page > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700">
                                    <span className="text-sm text-slate-400">
                                        Page {meta.current_page} of {meta.last_page} ({meta.total} tickets)
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            disabled={meta.current_page === 1}
                                            onClick={() => {
                                                const params = new URLSearchParams(searchParams);
                                                params.set('page', String(meta.current_page - 1));
                                                setSearchParams(params);
                                            }}
                                            className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            disabled={meta.current_page === meta.last_page}
                                            onClick={() => {
                                                const params = new URLSearchParams(searchParams);
                                                params.set('page', String(meta.current_page + 1));
                                                setSearchParams(params);
                                            }}
                                            className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
