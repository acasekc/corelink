import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, GripVertical, Loader2, X, Layers } from 'lucide-react';

const AnthropicPlanTiers = () => {
    const [loading, setLoading] = useState(true);
    const [tiers, setTiers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingTier, setEditingTier] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        monthly_price: '0',
        included_allowance: '0',
        grace_threshold: '0',
        markup_percentage: '0',
        overage_mode: 'silent',
        is_active: true,
    });

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    useEffect(() => {
        fetchTiers();
    }, []);

    const fetchTiers = async () => {
        try {
            const response = await fetch('/api/admin/anthropic-plan-tiers', {
                headers: { 'Accept': 'application/json' },
            });
            if (!response.ok) throw new Error('Failed to fetch plan tiers');
            const json = await response.json();
            setTiers(json.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingTier(null);
        setFormData({
            name: '',
            description: '',
            monthly_price: '0',
            included_allowance: '0',
            grace_threshold: '0',
            markup_percentage: '0',
            overage_mode: 'silent',
            is_active: true,
        });
        setShowModal(true);
    };

    const openEditModal = (tier) => {
        setEditingTier(tier);
        setFormData({
            name: tier.name,
            description: tier.description || '',
            monthly_price: tier.monthly_price,
            included_allowance: tier.included_allowance,
            grace_threshold: tier.grace_threshold,
            markup_percentage: tier.markup_percentage,
            overage_mode: tier.overage_mode,
            is_active: tier.is_active,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const url = editingTier
            ? `/api/admin/anthropic-plan-tiers/${editingTier.id}`
            : '/api/admin/anthropic-plan-tiers';

        const method = editingTier ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    ...formData,
                    monthly_price: parseFloat(formData.monthly_price) || 0,
                    included_allowance: parseFloat(formData.included_allowance) || 0,
                    grace_threshold: parseFloat(formData.grace_threshold) || 0,
                    markup_percentage: parseFloat(formData.markup_percentage) || 0,
                }),
            });

            if (!response.ok) {
                const json = await response.json();
                throw new Error(json.message || 'Failed to save plan tier');
            }

            setShowModal(false);
            fetchTiers();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (tier) => {
        if (!confirm(`Delete "${tier.name}" plan tier? This cannot be undone.`)) return;

        setDeleting(tier.id);
        setError(null);

        try {
            const response = await fetch(`/api/admin/anthropic-plan-tiers/${tier.id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            if (!response.ok) {
                const json = await response.json();
                throw new Error(json.message || 'Failed to delete plan tier');
            }

            fetchTiers();
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-8 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/admin" className="text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Anthropic Plan Tiers</h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Manage billing tiers for Anthropic API configurations
                        </p>
                    </div>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Tier
                </button>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Tiers Table */}
            {tiers.length === 0 ? (
                <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-slate-700">
                    <Layers className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-300 mb-2">No plan tiers yet</h3>
                    <p className="text-slate-400 text-sm mb-6">Create your first tier to define billing defaults for projects.</p>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create First Tier
                    </button>
                </div>
            ) : (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-800">
                            <tr>
                                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3 w-8"></th>
                                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Name</th>
                                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Price</th>
                                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Allowance</th>
                                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Grace</th>
                                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Markup</th>
                                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Overage</th>
                                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">In Use</th>
                                <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Status</th>
                                <th className="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {tiers.map((tier) => (
                                <tr key={tier.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <GripVertical className="w-4 h-4 text-slate-600" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <span className="font-medium text-white">{tier.name}</span>
                                            {tier.description && (
                                                <p className="text-xs text-slate-400 mt-0.5">{tier.description}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-300">
                                        ${parseFloat(tier.monthly_price).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-300">
                                        ${parseFloat(tier.included_allowance).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-300">
                                        ${parseFloat(tier.grace_threshold).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-300">
                                        {tier.markup_percentage}%
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                            tier.overage_mode === 'proactive'
                                                ? 'bg-blue-500/10 text-blue-400'
                                                : 'bg-slate-700 text-slate-400'
                                        }`}>
                                            {tier.overage_mode_label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        {tier.configs_count} {tier.configs_count === 1 ? 'project' : 'projects'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                            tier.is_active
                                                ? 'bg-green-500/10 text-green-400'
                                                : 'bg-red-500/10 text-red-400'
                                        }`}>
                                            {tier.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(tier)}
                                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tier)}
                                                disabled={deleting === tier.id}
                                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
                                                title="Delete"
                                            >
                                                {deleting === tier.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-700">
                            <h2 className="text-lg font-semibold">
                                {editingTier ? 'Edit Plan Tier' : 'New Plan Tier'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm"
                                    placeholder="e.g. Starter, Growth, Pro"
                                    required
                                    maxLength={32}
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm"
                                    placeholder="Brief description of this tier"
                                    rows={2}
                                    maxLength={500}
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Monthly Price ($) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.monthly_price}
                                    onChange={(e) => setFormData(prev => ({ ...prev, monthly_price: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm"
                                    placeholder="What the client pays per month"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Included Allowance ($) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.included_allowance}
                                        onChange={(e) => setFormData(prev => ({ ...prev, included_allowance: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Grace Threshold ($) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.grace_threshold}
                                        onChange={(e) => setFormData(prev => ({ ...prev, grace_threshold: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Markup % *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={formData.markup_percentage}
                                        onChange={(e) => setFormData(prev => ({ ...prev, markup_percentage: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Overage Mode *</label>
                                    <select
                                        value={formData.overage_mode}
                                        onChange={(e) => setFormData(prev => ({ ...prev, overage_mode: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm"
                                    >
                                        <option value="silent">Silent</option>
                                        <option value="proactive">Proactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                    className="rounded border-slate-600 bg-slate-700 text-blue-500"
                                />
                                <label htmlFor="is_active" className="text-sm text-slate-300">Active</label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                                >
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingTier ? 'Update Tier' : 'Create Tier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnthropicPlanTiers;
