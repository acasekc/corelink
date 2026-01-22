import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Ticket, ArrowLeft, LogOut, Search, Filter, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

const TicketsList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [selectedIds, setSelectedIds] = useState([]);
    const [deleting, setDeleting] = useState(false);
    const [filters, setFilters] = useState({
        status: searchParams.get('status') || '',
        priority: searchParams.get('priority') || '',
        project: searchParams.get('project') || '',
        search: searchParams.get('search') || '',
    });
    const [referenceData, setReferenceData] = useState({ statuses: [], priorities: [], projects: [] });

    useEffect(() => {
        fetchReferenceData();
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [searchParams]);

    const fetchReferenceData = async () => {
        try {
            const [statusesRes, prioritiesRes, projectsRes] = await Promise.all([
                fetch('/api/helpdesk/admin/statuses', { credentials: 'same-origin' }),
                fetch('/api/helpdesk/admin/priorities', { credentials: 'same-origin' }),
                fetch('/api/helpdesk/admin/projects', { credentials: 'same-origin' }),
            ]);
            const [statusesJson, prioritiesJson, projectsJson] = await Promise.all([
                statusesRes.json(),
                prioritiesRes.json(),
                projectsRes.json(),
            ]);
            setReferenceData({
                statuses: statusesJson.data || statusesJson,
                priorities: prioritiesJson.data || prioritiesJson,
                projects: projectsJson.data || projectsJson,
            });
        } catch (err) {
            console.error('Failed to fetch reference data:', err);
        }
    };

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchParams.get('status')) params.append('status', searchParams.get('status'));
            if (searchParams.get('priority')) params.append('priority', searchParams.get('priority'));
            if (searchParams.get('project')) params.append('project', searchParams.get('project'));
            if (searchParams.get('search')) params.append('search', searchParams.get('search'));
            if (searchParams.get('page')) params.append('page', searchParams.get('page'));

            const response = await fetch(`/api/helpdesk/admin/tickets?${params}`, {
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to fetch tickets');
            const data = await response.json();
            setTickets(data.data || []);
            setPagination({
                current_page: data.current_page || 1,
                last_page: data.last_page || 1,
                total: data.total || 0,
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        const newParams = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v) {
                newParams.set(k, v);
            }
        });
        setSearchParams(newParams);
    };

    const handlePageChange = (page) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', page);
        setSearchParams(newParams);
    };

    const handleLogout = async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
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

    const toggleSelectAll = () => {
        if (selectedIds.length === tickets.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(tickets.map((t) => t.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} ticket(s)? This action cannot be undone.`)) {
            return;
        }

        setDeleting(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch('/api/helpdesk/admin/tickets/bulk-delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ ids: selectedIds }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete tickets');
            }

            setSelectedIds([]);
            fetchTickets();
        } catch (err) {
            alert(err.message);
        } finally {
            setDeleting(false);
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
                            <Ticket className="w-6 h-6 text-purple-400" />
                            <span className="font-semibold text-lg">Tickets</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <nav className="flex items-center gap-6">
                            <Link to="/admin/helpdesk" className="text-slate-300 hover:text-white transition">
                                Dashboard
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
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Support Tickets</h1>
                            <p className="text-slate-400">Manage support tickets from all connected projects</p>
                        </div>
                        <Link
                            to="/admin/helpdesk/tickets/create"
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                        >
                            <Plus className="w-4 h-4" />
                            New Ticket
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Filter className="w-4 h-4" />
                                <span className="text-sm font-medium">Filters:</span>
                            </div>
                            <div className="flex-1 flex flex-wrap items-center gap-3">
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">All Statuses</option>
                                    {referenceData.statuses.map((status) => (
                                        <option key={status.id} value={status.slug}>
                                            {status.title}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={filters.priority}
                                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">All Priorities</option>
                                    {referenceData.priorities.map((priority) => (
                                        <option key={priority.id} value={priority.slug}>
                                            {priority.title}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={filters.project}
                                    onChange={(e) => handleFilterChange('project', e.target.value)}
                                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">All Projects</option>
                                    {referenceData.projects.map((project) => (
                                        <option key={project.id} value={project.slug}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search tickets..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedIds.length > 0 && (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-4 flex items-center justify-between">
                            <span className="text-slate-300">
                                {selectedIds.length} ticket{selectedIds.length !== 1 ? 's' : ''} selected
                            </span>
                            <button
                                onClick={handleBulkDelete}
                                disabled={deleting}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition"
                            >
                                <Trash2 className="w-4 h-4" />
                                {deleting ? 'Deleting...' : 'Delete Selected'}
                            </button>
                        </div>
                    )}

                    {/* Tickets Table */}
                    {loading ? (
                        <div className="text-center py-12 text-slate-400">Loading tickets...</div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-400">Error: {error}</div>
                    ) : (
                        <>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden mb-4">
                                <table className="w-full">
                                    <thead className="bg-slate-700/50">
                                        <tr>
                                            <th className="px-4 py-3 w-10">
                                                <input
                                                    type="checkbox"
                                                    checked={tickets.length > 0 && selectedIds.length === tickets.length}
                                                    onChange={toggleSelectAll}
                                                    className="w-4 h-4 rounded border-slate-500 bg-slate-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Ticket</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Project</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Submitter</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Priority</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Assigned</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {tickets.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                                                    No tickets found matching your filters.
                                                </td>
                                            </tr>
                                        ) : (
                                            tickets.map((ticket) => (
                                                <tr key={ticket.id} className={`hover:bg-slate-700/30 ${selectedIds.includes(ticket.id) ? 'bg-slate-700/20' : ''}`}>
                                                    <td className="px-4 py-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(ticket.id)}
                                                            onChange={() => toggleSelect(ticket.id)}
                                                            className="w-4 h-4 rounded border-slate-500 bg-slate-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                                                        />
                                                    </td>
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
                                                        <p className="text-slate-300">{ticket.submitter?.name}</p>
                                                        <p className="text-xs text-slate-500">{ticket.submitter?.email}</p>
                                                    </td>
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
                                                    <td className="px-6 py-4 text-slate-300">
                                                        {ticket.assigned_to?.name || <span className="text-slate-500">Unassigned</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-400 text-sm">
                                                        {new Date(ticket.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination.last_page > 1 && (
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-slate-400">
                                        Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} tickets)
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(pagination.current_page - 1)}
                                            disabled={pagination.current_page === 1}
                                            className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(pagination.current_page + 1)}
                                            disabled={pagination.current_page === pagination.last_page}
                                            className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
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

export default TicketsList;
