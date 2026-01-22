import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FolderOpen, ArrowLeft, LogOut, Key, Plus, Copy, RefreshCw, Trash2, Check, Ticket, DollarSign, Edit2, Save, X, User, Mail, MapPin } from 'lucide-react';

const ProjectDetail = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [apiKeys, setApiKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateKeyForm, setShowCreateKeyForm] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newlyCreatedKeys, setNewlyCreatedKeys] = useState({}); // Store full keys temporarily
    const [copiedKey, setCopiedKey] = useState(null);
    const [dashboard, setDashboard] = useState(null);

    // Client info editing state
    const [editingClientInfo, setEditingClientInfo] = useState(false);
    const [clientInfoFormData, setClientInfoFormData] = useState({
        client_name: '',
        client_email: '',
        client_address: '',
    });

    // Billing state
    const [categories, setCategories] = useState([]);
    const [hourlyRates, setHourlyRates] = useState([]);
    const [invoiceSettings, setInvoiceSettings] = useState(null);
    const [showRateForm, setShowRateForm] = useState(false);
    const [editingRate, setEditingRate] = useState(null);
    const [rateFormData, setRateFormData] = useState({ category_id: '', hourly_rate: '' });
    const [editingSettings, setEditingSettings] = useState(false);
    const [settingsFormData, setSettingsFormData] = useState({
        default_hourly_rate: '',
        billing_increment_minutes: '15',
        minimum_billing_minutes: '60',
        invoice_prefix: '',
        invoice_notes: '',
        payment_terms_days: '30',
    });

    useEffect(() => {
        fetchProject();
        fetchApiKeys();
        fetchDashboard();
        fetchCategories();
        fetchHourlyRates();
        fetchInvoiceSettings();
    }, [projectId]);

    const fetchProject = async () => {
        try {
            const response = await fetch(`/api/helpdesk/admin/projects/${projectId}`, {
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to fetch project');
            const json = await response.json();
            setProject(json.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchApiKeys = async () => {
        try {
            const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/api-keys`, {
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to fetch API keys');
            const json = await response.json();
            setApiKeys(json.data);
        } catch (err) {
            console.error('Failed to fetch API keys:', err);
        }
    };

    const fetchDashboard = async () => {
        try {
            const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/dashboard`, {
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to fetch dashboard');
            const data = await response.json();
            setDashboard(data);
        } catch (err) {
            console.error('Failed to fetch dashboard:', err);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/helpdesk/admin/time-entries/categories', {
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to fetch categories');
            const json = await response.json();
            setCategories(json.data || json);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const fetchHourlyRates = async () => {
        try {
            const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/hourly-rates`, {
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to fetch hourly rates');
            const json = await response.json();
            setHourlyRates(json.data || json);
        } catch (err) {
            console.error('Failed to fetch hourly rates:', err);
        }
    };

    const fetchInvoiceSettings = async () => {
        try {
            const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/invoice-settings`, {
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to fetch invoice settings');
            const json = await response.json();
            setInvoiceSettings(json.data || json);
            if (json.data) {
                setSettingsFormData({
                    default_hourly_rate: json.data.default_hourly_rate || '',
                    billing_increment_minutes: json.data.billing_increment_minutes || '15',
                    minimum_billing_minutes: json.data.minimum_billing_minutes || '60',
                    invoice_prefix: json.data.invoice_prefix || '',
                    invoice_notes: json.data.invoice_notes || '',
                    payment_terms_days: json.data.payment_terms_days || '30',
                });
            }
        } catch (err) {
            console.error('Failed to fetch invoice settings:', err);
        }
    };

    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    };

    const handleCreateKey = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/api-keys`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ name: newKeyName }),
            });
            if (!response.ok) throw new Error('Failed to create API key');
            const json = await response.json();
            const newKey = json.data;
            // Store the full key temporarily (it's only available now!)
            setNewlyCreatedKeys({ ...newlyCreatedKeys, [newKey.id]: newKey.key });
            setApiKeys([...apiKeys, { ...newKey, key: newKey.key }]);
            setNewKeyName('');
            setShowCreateKeyForm(false);
        } catch (err) {
            alert('Failed to create API key: ' + err.message);
        }
    };

    const handleRegenerateKey = async (keyId) => {
        if (!confirm('Are you sure? The old key will stop working immediately.')) return;

        try {
            const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/api-keys/${keyId}/regenerate`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to regenerate API key');
            const json = await response.json();
            const regeneratedKey = json.data;
            // Store the full key temporarily (it's only available now!)
            setNewlyCreatedKeys({ ...newlyCreatedKeys, [keyId]: regeneratedKey.key });
            setApiKeys(apiKeys.map((k) => (k.id === keyId ? { ...regeneratedKey, key: regeneratedKey.key } : k)));
        } catch (err) {
            alert('Failed to regenerate API key: ' + err.message);
        }
    };

    const handleDeleteKey = async (keyId) => {
        if (!confirm('Are you sure you want to delete this API key?')) return;

        try {
            const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/api-keys/${keyId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to delete API key');
            setApiKeys(apiKeys.filter((k) => k.id !== keyId));
        } catch (err) {
            alert('Failed to delete API key: ' + err.message);
        }
    };

    const handleCopyKey = async (key) => {
        try {
            await navigator.clipboard.writeText(key);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const hasFullKey = (keyId) => {
        return !!newlyCreatedKeys[keyId];
    };

    const getDisplayKey = (apiKey) => {
        // If we have the full key (just created/regenerated), show it
        if (newlyCreatedKeys[apiKey.id]) {
            return newlyCreatedKeys[apiKey.id];
        }
        // Otherwise show the preview from the API
        return apiKey.key_preview || apiKey.key || '••••••••••••••••';
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

    // Billing handlers
    const handleAddRate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/hourly-rates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    category_id: rateFormData.category_id || null,
                    rate: parseFloat(rateFormData.hourly_rate),
                }),
            });
            if (!response.ok) throw new Error('Failed to add rate');
            await fetchHourlyRates();
            setShowRateForm(false);
            setRateFormData({ category_id: '', hourly_rate: '' });
        } catch (err) {
            alert('Failed to add rate: ' + err.message);
        }
    };

    const handleUpdateRate = async (e) => {
        e.preventDefault();
        if (!editingRate) return;
        try {
            const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/hourly-rates/${editingRate.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    rate: parseFloat(rateFormData.hourly_rate),
                }),
            });
            if (!response.ok) throw new Error('Failed to update rate');
            await fetchHourlyRates();
            setEditingRate(null);
            setRateFormData({ category_id: '', hourly_rate: '' });
        } catch (err) {
            alert('Failed to update rate: ' + err.message);
        }
    };

    const handleDeleteRate = async (rateId) => {
        if (!confirm('Delete this hourly rate?')) return;
        try {
            const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/hourly-rates/${rateId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to delete rate');
            await fetchHourlyRates();
        } catch (err) {
            alert('Failed to delete rate: ' + err.message);
        }
    };

    const editRate = (rate) => {
        setRateFormData({
            category_id: rate.category_id || '',
            hourly_rate: rate.rate.toString(),
        });
        setEditingRate(rate);
        setShowRateForm(false);
    };

    const cancelRateEdit = () => {
        setEditingRate(null);
        setShowRateForm(false);
        setRateFormData({ category_id: '', hourly_rate: '' });
    };

    const handleSaveSettings = async () => {
        try {
            const response = await fetch(`/api/helpdesk/admin/projects/${projectId}/invoice-settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    default_hourly_rate: settingsFormData.default_hourly_rate ? parseFloat(settingsFormData.default_hourly_rate) : null,
                    billing_increment_minutes: parseInt(settingsFormData.billing_increment_minutes),
                    minimum_billing_minutes: parseInt(settingsFormData.minimum_billing_minutes),
                    invoice_prefix: settingsFormData.invoice_prefix || null,
                    invoice_notes: settingsFormData.invoice_notes || null,
                    payment_terms_days: parseInt(settingsFormData.payment_terms_days),
                }),
            });
            if (!response.ok) throw new Error('Failed to save settings');
            await fetchInvoiceSettings();
            setEditingSettings(false);
        } catch (err) {
            alert('Failed to save settings: ' + err.message);
        }
    };

    const startEditingClientInfo = () => {
        setClientInfoFormData({
            client_name: project?.client_name || '',
            client_email: project?.client_email || '',
            client_address: project?.client_address || '',
        });
        setEditingClientInfo(true);
    };

    const handleSaveClientInfo = async () => {
        try {
            const response = await fetch(`/api/helpdesk/admin/projects/${projectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    client_name: clientInfoFormData.client_name || null,
                    client_email: clientInfoFormData.client_email || null,
                    client_address: clientInfoFormData.client_address || null,
                }),
            });
            if (!response.ok) throw new Error('Failed to save client info');
            await fetchProject();
            setEditingClientInfo(false);
        } catch (err) {
            alert('Failed to save client info: ' + err.message);
        }
    };

    const getAvailableCategories = () => {
        const usedCategoryIds = hourlyRates.filter(r => r.category_id).map(r => r.category_id);
        return categories.filter(c => !usedCategoryIds.includes(c.id));
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
                        <Link to="/admin/helpdesk/projects" className="text-slate-400 hover:text-white transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <FolderOpen className="w-6 h-6 text-purple-400" />
                            <span className="font-semibold text-lg">{project?.name}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to={`/admin/helpdesk/tickets/create?project=${projectId}`}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                        >
                            <Ticket className="w-4 h-4" />
                            Create Ticket
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
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Project Info */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-4">Project Details</h2>
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm text-slate-400">Name</dt>
                                <dd className="font-medium">{project?.name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-slate-400">Slug</dt>
                                <dd className="font-mono text-sm text-purple-400">{project?.slug}</dd>
                            </div>
                            {project?.description && (
                                <div className="col-span-2">
                                    <dt className="text-sm text-slate-400">Description</dt>
                                    <dd className="text-slate-300">{project?.description}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Client Information */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <User className="w-5 h-5 text-purple-400" />
                                Client Information
                            </h2>
                            {!editingClientInfo ? (
                                <button
                                    onClick={startEditingClientInfo}
                                    className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleSaveClientInfo}
                                        className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingClientInfo(false)}
                                        className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-300"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {editingClientInfo ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">
                                        <User className="w-4 h-4 inline mr-1" />
                                        Client Name
                                    </label>
                                    <input
                                        type="text"
                                        value={clientInfoFormData.client_name}
                                        onChange={(e) => setClientInfoFormData(prev => ({ ...prev, client_name: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none"
                                        placeholder="Enter client name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">
                                        <Mail className="w-4 h-4 inline mr-1" />
                                        Client Email
                                    </label>
                                    <input
                                        type="email"
                                        value={clientInfoFormData.client_email}
                                        onChange={(e) => setClientInfoFormData(prev => ({ ...prev, client_email: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none"
                                        placeholder="Enter client email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">
                                        <MapPin className="w-4 h-4 inline mr-1" />
                                        Client Address
                                    </label>
                                    <textarea
                                        value={clientInfoFormData.client_address}
                                        onChange={(e) => setClientInfoFormData(prev => ({ ...prev, client_address: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none"
                                        rows={3}
                                        placeholder="Enter client address"
                                    />
                                </div>
                            </div>
                        ) : (
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm text-slate-400 flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        Name
                                    </dt>
                                    <dd className="font-medium">{project?.client_name || <span className="text-slate-500 italic">Not set</span>}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-slate-400 flex items-center gap-1">
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </dt>
                                    <dd className="font-medium">{project?.client_email || <span className="text-slate-500 italic">Not set</span>}</dd>
                                </div>
                                {(project?.client_address) && (
                                    <div className="col-span-2">
                                        <dt className="text-sm text-slate-400 flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            Address
                                        </dt>
                                        <dd className="text-slate-300 whitespace-pre-line">{project.client_address}</dd>
                                    </div>
                                )}
                            </dl>
                        )}
                        <p className="text-xs text-slate-500 mt-4">
                            Client information will be auto-filled when creating invoices for this project.
                        </p>
                    </div>

                    {/* Stats */}
                    {dashboard?.stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link
                                to={`/admin/helpdesk/tickets?project=${projectId}`}
                                className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center hover:bg-slate-700/50 transition"
                            >
                                <p className="text-2xl font-bold">{dashboard.stats.total}</p>
                                <p className="text-sm text-slate-400">Total Tickets</p>
                            </Link>
                            <Link
                                to={`/admin/helpdesk/tickets?project=${projectId}&status=open`}
                                className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center hover:bg-slate-700/50 transition"
                            >
                                <p className="text-2xl font-bold text-yellow-400">{dashboard.stats.open}</p>
                                <p className="text-sm text-slate-400">Open</p>
                            </Link>
                            <Link
                                to={`/admin/helpdesk/tickets?project=${projectId}&status=in-progress`}
                                className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center hover:bg-slate-700/50 transition"
                            >
                                <p className="text-2xl font-bold text-purple-400">{dashboard.stats.in_progress}</p>
                                <p className="text-sm text-slate-400">In Progress</p>
                            </Link>
                            <Link
                                to={`/admin/helpdesk/tickets?project=${projectId}&status=resolved`}
                                className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center hover:bg-slate-700/50 transition"
                            >
                                <p className="text-2xl font-bold text-green-400">{dashboard.stats.resolved}</p>
                                <p className="text-sm text-slate-400">Resolved</p>
                            </Link>
                        </div>
                    )}

                    {/* Recent Tickets */}
                    {dashboard?.recent_tickets?.length > 0 && (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Ticket className="w-5 h-5 text-purple-400" />
                                    Recent Tickets
                                </h3>
                                <Link
                                    to={`/admin/helpdesk/tickets?project=${projectId}`}
                                    className="text-sm text-purple-400 hover:text-purple-300"
                                >
                                    View All →
                                </Link>
                            </div>
                            <table className="w-full">
                                <tbody className="divide-y divide-slate-700">
                                    {dashboard.recent_tickets.map((ticket) => (
                                        <tr key={ticket.id} className="hover:bg-slate-700/30">
                                            <td className="px-4 py-3">
                                                <Link
                                                    to={`/admin/helpdesk/tickets/${ticket.id}`}
                                                    className="text-purple-400 hover:text-purple-300 font-medium"
                                                >
                                                    #{ticket.number}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">{ticket.title}</td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className="px-2 py-1 rounded text-xs font-medium"
                                                    style={{ backgroundColor: `${ticket.status?.color}30`, color: ticket.status?.color }}
                                                >
                                                    {ticket.status?.title}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* API Keys */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
                        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Key className="w-5 h-5 text-purple-400" />
                                API Keys
                            </h3>
                            <button
                                onClick={() => setShowCreateKeyForm(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                New Key
                            </button>
                        </div>

                        {showCreateKeyForm && (
                            <form onSubmit={handleCreateKey} className="p-4 border-b border-slate-700 bg-slate-700/30">
                                <label className="block text-sm text-slate-400 mb-2">Key Name</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                        placeholder="e.g., Production, Development"
                                        className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-sm"
                                    >
                                        Create
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateKeyForm(false)}
                                        className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="divide-y divide-slate-700">
                            {apiKeys.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    No API keys yet. Create one to enable external API access.
                                </div>
                            ) : (
                                apiKeys.map((apiKey) => (
                                    <div key={apiKey.id} className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium">{apiKey.name}</span>
                                                <span
                                                    className={`px-2 py-0.5 rounded text-xs ${
                                                        apiKey.is_active
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : 'bg-red-500/20 text-red-400'
                                                    }`}
                                                >
                                                    {apiKey.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleRegenerateKey(apiKey.id)}
                                                    className="p-2 text-slate-400 hover:text-yellow-400 transition"
                                                    title="Regenerate key"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteKey(apiKey.id)}
                                                    className="p-2 text-slate-400 hover:text-red-400 transition"
                                                    title="Delete key"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-2 font-mono text-sm">
                                            <code className="flex-1 text-slate-300 truncate">
                                                {getDisplayKey(apiKey)}
                                            </code>
                                            {hasFullKey(apiKey.id) ? (
                                                <button
                                                    onClick={() => handleCopyKey(newlyCreatedKeys[apiKey.id])}
                                                    className="p-1.5 text-slate-400 hover:text-white transition"
                                                    title="Copy"
                                                >
                                                    {copiedKey === newlyCreatedKeys[apiKey.id] ? (
                                                        <Check className="w-4 h-4 text-green-400" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-500 italic">
                                                    Key hidden - regenerate to get new key
                                                </span>
                                            )}
                                        </div>
                                        {hasFullKey(apiKey.id) && (
                                            <p className="text-xs text-amber-400 mt-2">
                                                ⚠️ Copy this key now - it won't be shown again!
                                            </p>
                                        )}
                                        {apiKey.last_used_at && (
                                            <p className="text-xs text-slate-500 mt-2">
                                                Last used: {new Date(apiKey.last_used_at).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Billing & Invoicing */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
                        <div className="p-4 border-b border-slate-700">
                            <h3 className="font-semibold flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-purple-400" />
                                Billing & Invoicing
                            </h3>
                        </div>

                        {/* Invoice Settings */}
                        <div className="p-4 border-b border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-medium text-slate-300">Invoice Settings</h4>
                                {!editingSettings ? (
                                    <button
                                        onClick={() => setEditingSettings(true)}
                                        className="text-sm text-purple-400 hover:text-purple-300"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveSettings}
                                            className="p-1 text-green-400 hover:text-green-300"
                                        >
                                            <Save className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setEditingSettings(false)}
                                            className="p-1 text-slate-400 hover:text-slate-300"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {editingSettings ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Default Hourly Rate ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={settingsFormData.default_hourly_rate}
                                            onChange={(e) => setSettingsFormData(prev => ({ ...prev, default_hourly_rate: e.target.value }))}
                                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Billing Increment (mins)</label>
                                        <select
                                            value={settingsFormData.billing_increment_minutes}
                                            onChange={(e) => setSettingsFormData(prev => ({ ...prev, billing_increment_minutes: e.target.value }))}
                                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="1">1 minute</option>
                                            <option value="5">5 minutes</option>
                                            <option value="6">6 minutes (1/10 hr)</option>
                                            <option value="15">15 minutes</option>
                                            <option value="30">30 minutes</option>
                                            <option value="60">1 hour</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Minimum Billing (mins)</label>
                                        <select
                                            value={settingsFormData.minimum_billing_minutes}
                                            onChange={(e) => setSettingsFormData(prev => ({ ...prev, minimum_billing_minutes: e.target.value }))}
                                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="0">None</option>
                                            <option value="15">15 minutes</option>
                                            <option value="30">30 minutes</option>
                                            <option value="60">1 hour</option>
                                            <option value="120">2 hours</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Payment Terms (days)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={settingsFormData.payment_terms_days}
                                            onChange={(e) => setSettingsFormData(prev => ({ ...prev, payment_terms_days: e.target.value }))}
                                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Invoice Prefix</label>
                                        <input
                                            type="text"
                                            value={settingsFormData.invoice_prefix}
                                            onChange={(e) => setSettingsFormData(prev => ({ ...prev, invoice_prefix: e.target.value }))}
                                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="INV-"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs text-slate-400 mb-1">Default Invoice Notes</label>
                                        <textarea
                                            value={settingsFormData.invoice_notes}
                                            onChange={(e) => setSettingsFormData(prev => ({ ...prev, invoice_notes: e.target.value }))}
                                            rows={2}
                                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                            placeholder="Payment terms, bank details, etc."
                                        />
                                    </div>
                                </div>
                            ) : (
                                <dl className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <dt className="text-slate-500">Default Rate</dt>
                                        <dd className="text-slate-200">
                                            {invoiceSettings?.default_hourly_rate
                                                ? `$${parseFloat(invoiceSettings.default_hourly_rate).toFixed(2)}/hr`
                                                : 'Not set'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-slate-500">Billing Increment</dt>
                                        <dd className="text-slate-200">{invoiceSettings?.billing_increment_minutes || 15} mins</dd>
                                    </div>
                                    <div>
                                        <dt className="text-slate-500">Minimum Billing</dt>
                                        <dd className="text-slate-200">{invoiceSettings?.minimum_billing_minutes || 60} mins</dd>
                                    </div>
                                    <div>
                                        <dt className="text-slate-500">Payment Terms</dt>
                                        <dd className="text-slate-200">{invoiceSettings?.payment_terms_days || 30} days</dd>
                                    </div>
                                </dl>
                            )}
                        </div>

                        {/* Hourly Rates by Category */}
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-medium text-slate-300">Hourly Rates by Category</h4>
                                {!showRateForm && !editingRate && (
                                    <button
                                        onClick={() => setShowRateForm(true)}
                                        className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Rate
                                    </button>
                                )}
                            </div>

                            {/* Add/Edit Rate Form */}
                            {(showRateForm || editingRate) && (
                                <form onSubmit={editingRate ? handleUpdateRate : handleAddRate} className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        {!editingRate && (
                                            <div>
                                                <label className="block text-xs text-slate-400 mb-1">Category</label>
                                                <select
                                                    value={rateFormData.category_id}
                                                    onChange={(e) => {
                                                        const categoryId = e.target.value;
                                                        const category = categories.find(c => c.id.toString() === categoryId);
                                                        setRateFormData(prev => ({
                                                            ...prev,
                                                            category_id: categoryId,
                                                            hourly_rate: category?.default_rate || prev.hourly_rate,
                                                        }));
                                                    }}
                                                    className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                >
                                                    <option value="">Default (all categories)</option>
                                                    {getAvailableCategories().map((cat) => (
                                                        <option key={cat.id} value={cat.id}>
                                                            {cat.name}{cat.default_rate ? ` ($${parseFloat(cat.default_rate).toFixed(2)}/hr)` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        <div className={editingRate ? 'col-span-2' : ''}>
                                            <label className="block text-xs text-slate-400 mb-1">
                                                Hourly Rate ($) {editingRate && `- ${editingRate.category?.name || 'Default'}`}
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={rateFormData.hourly_rate}
                                                onChange={(e) => setRateFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                                                className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                                        >
                                            {editingRate ? 'Update' : 'Add Rate'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelRateEdit}
                                            className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 rounded text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Rates List */}
                            {hourlyRates.length > 0 ? (
                                <div className="space-y-2">
                                    {hourlyRates.map((rate) => (
                                        <div key={rate.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                                            <div>
                                                <span className="text-sm font-medium">
                                                    {rate.category?.name || 'Default Rate'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-green-400 font-medium">
                                                    ${parseFloat(rate.rate).toFixed(2)}/hr
                                                </span>
                                                <button
                                                    onClick={() => editRate(rate)}
                                                    className="p-1 text-slate-400 hover:text-slate-300"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRate(rate.id)}
                                                    className="p-1 text-slate-400 hover:text-red-400"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 text-center py-4">
                                    No hourly rates configured. Add rates to enable billing.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* API Usage */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <h3 className="font-semibold mb-4">API Usage</h3>
                        <div className="bg-slate-900/50 rounded-lg p-4 font-mono text-sm">
                            <p className="text-slate-400 mb-2"># Submit a ticket</p>
                            <code className="text-green-400">
                                curl -X POST {window.location.origin}/api/helpdesk/v1/tickets \<br />
                                {'  '}-H "X-Helpdesk-Key: YOUR_API_KEY" \<br />
                                {'  '}-H "Content-Type: application/json" \<br />
                                {'  '}-d '{'{'}
                                <br />
                                {'    '}"subject": "Help with feature",
                                <br />
                                {'    '}"description": "Detailed description...",
                                <br />
                                {'    '}"submitter_name": "John Doe",
                                <br />
                                {'    '}"submitter_email": "john@example.com"
                                <br />
                                {'  '}{'}'}'
                            </code>
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

export default ProjectDetail;
