import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, LogOut, Search, Filter, ChevronLeft, ChevronRight, Plus, Eye, Send, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';

const InvoicesList = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [filters, setFilters] = useState({
        status: searchParams.get('status') || '',
        project_id: searchParams.get('project') || '',
        search: searchParams.get('search') || '',
    });
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [searchParams]);

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/helpdesk/admin/projects', { credentials: 'same-origin' });
            const json = await response.json();
            setProjects(json.data || json);
        } catch (err) {
            console.error('Failed to fetch projects:', err);
        }
    };

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchParams.get('status')) params.append('status', searchParams.get('status'));
            if (searchParams.get('project')) params.append('project_id', searchParams.get('project'));
            if (searchParams.get('search')) params.append('search', searchParams.get('search'));
            if (searchParams.get('page')) params.append('page', searchParams.get('page'));

            const response = await fetch(`/api/helpdesk/admin/invoices?${params}`, {
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to fetch invoices');
            const data = await response.json();
            setInvoices(data.data || []);
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
            if (v) newParams.set(k, v);
        });
        setSearchParams(newParams);
    };

    const handlePageChange = (page) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', page);
        setSearchParams(newParams);
    };

    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    };

    const handleLogout = async () => {
        try {
            await fetch('/admin/logout', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': getCsrfToken(), 'Accept': 'application/json' },
                credentials: 'same-origin',
            });
            window.location.href = '/admin/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'draft':
                return <FileText className="w-4 h-4" />;
            case 'sent':
                return <Send className="w-4 h-4" />;
            case 'viewed':
                return <Eye className="w-4 h-4" />;
            case 'paid':
                return <CheckCircle className="w-4 h-4" />;
            case 'partial':
                return <Clock className="w-4 h-4" />;
            case 'overdue':
                return <Clock className="w-4 h-4" />;
            case 'voided':
                return <XCircle className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft':
                return 'bg-slate-500/20 text-slate-400';
            case 'sent':
                return 'bg-blue-500/20 text-blue-400';
            case 'viewed':
                return 'bg-purple-500/20 text-purple-400';
            case 'paid':
                return 'bg-green-500/20 text-green-400';
            case 'partial':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'overdue':
                return 'bg-red-500/20 text-red-400';
            case 'voided':
                return 'bg-gray-500/20 text-gray-400';
            default:
                return 'bg-slate-500/20 text-slate-400';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount || 0);
    };

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
                            <FileText className="w-6 h-6 text-purple-400" />
                            <span className="font-semibold text-lg">Invoices</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/admin/helpdesk/invoices/create"
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            New Invoice
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

            {/* Filters */}
            <div className="border-b border-slate-700 bg-slate-800/50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 flex-1 max-w-md">
                            <Search className="w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search invoices..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="draft">Draft</option>
                                <option value="sent">Sent</option>
                                <option value="viewed">Viewed</option>
                                <option value="partial">Partial</option>
                                <option value="paid">Paid</option>
                                <option value="overdue">Overdue</option>
                                <option value="voided">Voided</option>
                            </select>
                            <select
                                value={filters.project_id}
                                onChange={(e) => handleFilterChange('project_id', e.target.value)}
                                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="">All Projects</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="container mx-auto px-6 py-8">
                {loading ? (
                    <div className="text-center text-slate-400 py-12">Loading invoices...</div>
                ) : invoices.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-400 mb-2">No invoices found</h3>
                        <p className="text-slate-500 mb-4">Create your first invoice to get started.</p>
                        <Link
                            to="/admin/helpdesk/invoices/create"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                        >
                            <Plus className="w-4 h-4" />
                            New Invoice
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Invoice Table */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-700 bg-slate-800/80">
                                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Invoice</th>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Project</th>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Client</th>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Status</th>
                                        <th className="text-right px-4 py-3 text-sm font-medium text-slate-400">Amount</th>
                                        <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Due Date</th>
                                        <th className="text-right px-4 py-3 text-sm font-medium text-slate-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-slate-700/30">
                                            <td className="px-4 py-3">
                                                <Link
                                                    to={`/admin/helpdesk/invoices/${invoice.id}`}
                                                    className="text-purple-400 hover:text-purple-300 font-medium"
                                                >
                                                    {invoice.invoice_number}
                                                </Link>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {new Date(invoice.created_at).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">
                                                {invoice.project?.name || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-slate-300">{invoice.client_name || '-'}</div>
                                                {invoice.client_email && (
                                                    <div className="text-xs text-slate-500">{invoice.client_email}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                                                        invoice.status
                                                    )}`}
                                                >
                                                    {getStatusIcon(invoice.status)}
                                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="text-slate-200 font-medium">
                                                    {formatCurrency(invoice.total_amount)}
                                                </div>
                                                {invoice.amount_paid > 0 && invoice.amount_paid < invoice.total_amount && (
                                                    <div className="text-xs text-green-400">
                                                        Paid: {formatCurrency(invoice.amount_paid)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">
                                                {invoice.due_date
                                                    ? new Date(invoice.due_date).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        to={`/admin/helpdesk/invoices/${invoice.id}`}
                                                        className="p-2 text-slate-400 hover:text-purple-400 transition"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    {invoice.status === 'draft' && (
                                                        <button
                                                            onClick={() => navigate(`/admin/helpdesk/invoices/${invoice.id}`)}
                                                            className="p-2 text-slate-400 hover:text-blue-400 transition"
                                                            title="Send"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <p className="text-sm text-slate-400">
                                    Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.current_page - 1)}
                                        disabled={pagination.current_page === 1}
                                        className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(pagination.current_page + 1)}
                                        disabled={pagination.current_page === pagination.last_page}
                                        className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-slate-200">{pagination.total}</p>
                                <p className="text-sm text-slate-400">Total Invoices</p>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-yellow-400">
                                    {invoices.filter((i) => i.status === 'draft').length}
                                </p>
                                <p className="text-sm text-slate-400">Drafts</p>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-blue-400">
                                    {invoices.filter((i) => ['sent', 'viewed', 'partial'].includes(i.status)).length}
                                </p>
                                <p className="text-sm text-slate-400">Outstanding</p>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-green-400">
                                    {invoices.filter((i) => i.status === 'paid').length}
                                </p>
                                <p className="text-sm text-slate-400">Paid</p>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default InvoicesList;
