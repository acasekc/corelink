import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, LogOut, Plus, Trash2, Save } from 'lucide-react';

const InvoiceEdit = () => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [invoice, setInvoice] = useState(null);

    const [formData, setFormData] = useState({
        billing_name: '',
        billing_email: '',
        billing_address: '',
        issue_date: '',
        due_date: '',
        notes: '',
        tax_rate: '0',
        discount_amount: '0',
        discount_description: '',
        credit_amount: '0',
        credit_description: '',
    });

    const [lineItems, setLineItems] = useState([]);

    useEffect(() => {
        fetchInvoice();
    }, [invoiceId]);

    const fetchInvoice = async () => {
        try {
            const response = await fetch(`/api/helpdesk/admin/invoices/${invoiceId}`, {
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to fetch invoice');
            const json = await response.json();
            const inv = json.data || json;
            
            setInvoice(inv);
            setFormData({
                billing_name: inv.billing_name || '',
                billing_email: inv.billing_email || '',
                billing_address: inv.billing_address || '',
                issue_date: inv.issue_date || '',
                due_date: inv.due_date || '',
                notes: inv.notes || '',
                tax_rate: inv.tax_rate?.toString() || '0',
                discount_amount: inv.discount_amount?.toString() || '0',
                discount_description: inv.discount_description || '',
                credit_amount: inv.credit_amount?.toString() || '0',
                credit_description: inv.credit_description || '',
            });
            setLineItems(inv.line_items || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
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

    const updateLineItem = (id, field, value) => {
        setLineItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const removeLineItem = (id) => {
        setLineItems(prev => prev.filter(item => item.id !== id));
    };

    const addLineItem = () => {
        setLineItems(prev => [
            ...prev,
            {
                id: `new-${Date.now()}`,
                type: 'custom',
                description: '',
                quantity: '1',
                rate: '0',
                isNew: true,
            },
        ]);
    };

    const calculateSubtotal = () => {
        return lineItems.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const rate = parseFloat(item.rate) || 0;
            return sum + (qty * rate);
        }, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const discount = parseFloat(formData.discount_amount) || 0;
        const credit = parseFloat(formData.credit_amount) || 0;
        const taxRate = parseFloat(formData.tax_rate) || 0;
        const taxableAmount = subtotal - discount - credit;
        const tax = taxableAmount > 0 ? taxableAmount * (taxRate / 100) : 0;
        return Math.max(0, taxableAmount + tax);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount || 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Prepare line items for backend
            const updatedLineItems = lineItems.map(item => ({
                id: item.isNew ? null : item.id,
                type: item.type || 'custom',
                description: item.description,
                quantity: parseFloat(item.quantity) || 0,
                rate: parseFloat(item.rate) || 0,
            }));

            const response = await fetch(`/api/helpdesk/admin/invoices/${invoiceId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    billing_name: formData.billing_name,
                    billing_email: formData.billing_email,
                    billing_address: formData.billing_address || null,
                    issue_date: formData.issue_date,
                    due_date: formData.due_date,
                    notes: formData.notes || null,
                    tax_rate: parseFloat(formData.tax_rate) || 0,
                    discount_amount: parseFloat(formData.discount_amount) || 0,
                    discount_description: formData.discount_description || null,
                    credit_amount: parseFloat(formData.credit_amount) || 0,
                    credit_description: formData.credit_description || null,
                    line_items: updatedLineItems,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update invoice');
            }

            navigate(`/admin/helpdesk/invoices/${invoiceId}`);
        } catch (err) {
            alert('Failed to update invoice: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
                <div className="text-slate-400">Loading invoice...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
                <div className="text-red-400">{error}</div>
            </div>
        );
    }

    if (!invoice?.is_editable) {
        return (
            <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-yellow-400 mb-4">This invoice cannot be edited.</p>
                    <Link to={`/admin/helpdesk/invoices/${invoiceId}`} className="text-purple-400 hover:text-purple-300">
                        Return to Invoice
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white">
            {/* Header */}
            <header className="bg-slate-800/80 border-b border-slate-700 sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to={`/admin/helpdesk/invoices/${invoiceId}`}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Invoice
                        </Link>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-400" />
                            Edit Invoice {invoice?.invoice_number}
                        </h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
                    {/* Client Information */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <h3 className="font-semibold mb-4">Client Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Client Name</label>
                                <input
                                    type="text"
                                    value={formData.billing_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, billing_name: e.target.value }))}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Client Email</label>
                                <input
                                    type="email"
                                    value={formData.billing_email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, billing_email: e.target.value }))}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm text-slate-400 mb-1">Client Address</label>
                                <textarea
                                    value={formData.billing_address}
                                    onChange={(e) => setFormData(prev => ({ ...prev, billing_address: e.target.value }))}
                                    rows={2}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <h3 className="font-semibold mb-4">Invoice Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Invoice Date</label>
                                <input
                                    type="date"
                                    value={formData.issue_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Tax Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.tax_rate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: e.target.value }))}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Discount & Credits */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <h3 className="font-semibold mb-4">Discounts & Credits</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-slate-300">Discount</h4>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Amount ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.discount_amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, discount_amount: e.target.value }))}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={formData.discount_description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, discount_description: e.target.value }))}
                                        placeholder="e.g., Promotional discount"
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-slate-300">Credit (Prior Payment/Overpayment)</h4>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Amount ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.credit_amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, credit_amount: e.target.value }))}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={formData.credit_description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, credit_description: e.target.value }))}
                                        placeholder="e.g., Credit from invoice #123"
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                            <h3 className="font-semibold">Line Items</h3>
                            <button
                                type="button"
                                onClick={addLineItem}
                                className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
                            >
                                <Plus className="w-4 h-4" />
                                Add Item
                            </button>
                        </div>
                        <div className="p-4 space-y-3">
                            {lineItems.map((item) => (
                                <div key={item.id} className="grid grid-cols-12 gap-3 items-start">
                                    <div className="col-span-5">
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                            placeholder="Description"
                                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={item.quantity}
                                            onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                                            placeholder="Qty"
                                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={item.rate}
                                            onChange={(e) => updateLineItem(item.id, 'rate', e.target.value)}
                                            placeholder="Rate"
                                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div className="col-span-2 text-right text-sm text-slate-300 py-2">
                                        {formatCurrency((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0))}
                                    </div>
                                    <div className="col-span-1">
                                        <button
                                            type="button"
                                            onClick={() => removeLineItem(item.id)}
                                            className="p-2 text-slate-400 hover:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {lineItems.length === 0 && (
                                <div className="text-center text-slate-500 py-4">
                                    No line items. Click "Add Item" to add one.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <h3 className="font-semibold mb-4">Notes</h3>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            rows={3}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                            placeholder="Payment terms, bank details, or other notes..."
                        />
                    </div>

                    {/* Summary */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <h3 className="font-semibold mb-4">Summary</h3>
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-slate-400">Subtotal</dt>
                                <dd className="text-slate-200">{formatCurrency(calculateSubtotal())}</dd>
                            </div>
                            {parseFloat(formData.discount_amount) > 0 && (
                                <div className="flex justify-between text-orange-400">
                                    <dt>Discount {formData.discount_description && `(${formData.discount_description})`}</dt>
                                    <dd>-{formatCurrency(parseFloat(formData.discount_amount))}</dd>
                                </div>
                            )}
                            {parseFloat(formData.credit_amount) > 0 && (
                                <div className="flex justify-between text-blue-400">
                                    <dt>Credit {formData.credit_description && `(${formData.credit_description})`}</dt>
                                    <dd>-{formatCurrency(parseFloat(formData.credit_amount))}</dd>
                                </div>
                            )}
                            {parseFloat(formData.tax_rate) > 0 && (
                                <div className="flex justify-between">
                                    <dt className="text-slate-400">Tax ({formData.tax_rate}%)</dt>
                                    <dd className="text-slate-200">
                                        {formatCurrency(
                                            Math.max(0, calculateSubtotal() - (parseFloat(formData.discount_amount) || 0) - (parseFloat(formData.credit_amount) || 0)) *
                                            ((parseFloat(formData.tax_rate) || 0) / 100)
                                        )}
                                    </dd>
                                </div>
                            )}
                            <div className="flex justify-between pt-2 border-t border-slate-700">
                                <dt className="text-slate-300 font-medium">Total</dt>
                                <dd className="text-lg font-bold text-purple-400">{formatCurrency(calculateTotal())}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Link
                            to={`/admin/helpdesk/invoices/${invoiceId}`}
                            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default InvoiceEdit;
