import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FolderOpen, ArrowLeft, LogOut, Key, Plus, Copy, RefreshCw, Trash2, Check, Eye, EyeOff, Ticket } from 'lucide-react';

const ProjectDetail = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [apiKeys, setApiKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateKeyForm, setShowCreateKeyForm] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [visibleKeys, setVisibleKeys] = useState({});
    const [copiedKey, setCopiedKey] = useState(null);
    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {
        fetchProject();
        fetchApiKeys();
        fetchDashboard();
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
            setApiKeys([...apiKeys, newKey]);
            setNewKeyName('');
            setShowCreateKeyForm(false);
            // Show the new key immediately
            setVisibleKeys({ ...visibleKeys, [newKey.id]: true });
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
            setApiKeys(apiKeys.map((k) => (k.id === keyId ? json.data : k)));
            setVisibleKeys({ ...visibleKeys, [keyId]: true });
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

    const toggleKeyVisibility = (keyId) => {
        setVisibleKeys({ ...visibleKeys, [keyId]: !visibleKeys[keyId] });
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
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
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

                    {/* Stats */}
                    {dashboard?.stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold">{dashboard.stats.total}</p>
                                <p className="text-sm text-slate-400">Total Tickets</p>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-yellow-400">{dashboard.stats.open}</p>
                                <p className="text-sm text-slate-400">Open</p>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-purple-400">{dashboard.stats.in_progress}</p>
                                <p className="text-sm text-slate-400">In Progress</p>
                            </div>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                                <p className="text-2xl font-bold text-green-400">{dashboard.stats.resolved}</p>
                                <p className="text-sm text-slate-400">Resolved</p>
                            </div>
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
                                                    #{ticket.ticket_number}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">{ticket.subject}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status?.slug)}`}>
                                                    {ticket.status?.name}
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
                                                {visibleKeys[apiKey.id] ? apiKey.key : '••••••••••••••••••••••••••••••••••••••••'}
                                            </code>
                                            <button
                                                onClick={() => toggleKeyVisibility(apiKey.id)}
                                                className="p-1.5 text-slate-400 hover:text-white transition"
                                                title={visibleKeys[apiKey.id] ? 'Hide' : 'Show'}
                                            >
                                                {visibleKeys[apiKey.id] ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleCopyKey(apiKey.key)}
                                                className="p-1.5 text-slate-400 hover:text-white transition"
                                                title="Copy"
                                            >
                                                {copiedKey === apiKey.key ? (
                                                    <Check className="w-4 h-4 text-green-400" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
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
