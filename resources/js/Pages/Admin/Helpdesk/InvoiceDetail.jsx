import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, LogOut, Send, Download, Eye, DollarSign, Plus, Trash2, Edit2, CheckCircle, XCircle, Clock, CreditCard, AlertTriangle, X } from 'lucide-react';

const InvoiceDetail = () => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentFormData, setPaymentFormData] = useState({
        amount: '',
        payment_method: 'manual',
        reference: '',
        notes: '',
    });
    const [paymentSubmitting, setPaymentSubmitting] = useState(false);
    const [sending, setSending] = useState(false);
    const [resending, setResending] = useState(false);
    const [voiding, setVoiding] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, paymentId: null, reason: '', submitting: false });

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
            setInvoice(json.data || json);
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

    const handleSendInvoice = async () => {
        if (!invoice.billing_email) {
            alert('Please add a client email address before sending.');
            return;
        }
        if (!confirm('Send this invoice to ' + invoice.billing_email + '?')) return;

        setSending(true);
        try {
            const response = await fetch(`/api/helpdesk/admin/invoices/${invoiceId}/send`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to send invoice');
            await fetchInvoice();
            alert('Invoice sent successfully!');
        } catch (err) {
            alert('Failed to send invoice: ' + err.message);
        } finally {
            setSending(false);
        }
    };

    const handleResendInvoice = async () => {
        if (!invoice.billing_email) {
            alert('No client email address on this invoice.');
            return;
        }
        if (!confirm('Resend this invoice to ' + invoice.billing_email + '?')) return;

        setResending(true);
        try {
            const response = await fetch(`/api/helpdesk/admin/invoices/${invoiceId}/resend`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to resend invoice');
            await fetchInvoice();
            alert('Invoice resent successfully!');
        } catch (err) {
            alert('Failed to resend invoice: ' + err.message);
        } finally {
            setResending(false);
        }
    };

    const handleVoidInvoice = async () => {
        if (!confirm('Are you sure you want to void this invoice? This cannot be undone.')) return;

        setVoiding(true);
        try {
            const response = await fetch(`/api/helpdesk/admin/invoices/${invoiceId}/void`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to void invoice');
            await fetchInvoice();
        } catch (err) {
            alert('Failed to void invoice: ' + err.message);
        } finally {
            setVoiding(false);
        }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        setPaymentSubmitting(true);
        try {
            const response = await fetch(`/api/helpdesk/admin/invoices/${invoiceId}/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    amount: parseFloat(paymentFormData.amount),
                    payment_method: paymentFormData.payment_method,
                    reference: paymentFormData.reference || null,
                    notes: paymentFormData.notes || null,
                }),
            });
            if (!response.ok) throw new Error('Failed to record payment');
            await fetchInvoice();
            setShowPaymentForm(false);
            setPaymentFormData({ amount: '', payment_method: 'manual', reference: '', notes: '' });
        } catch (err) {
            alert('Failed to record payment: ' + err.message);
        } finally {
            setPaymentSubmitting(false);
        }
    };

    const handleDeletePayment = async (paymentId) => {
        setDeleteModal({ open: true, paymentId, reason: '', submitting: false });
    };

    const confirmDeletePayment = async () => {
        if (deleteModal.reason.trim().length < 3) {
            alert('Please enter a reason (at least 3 characters)');
            return;
        }
        setDeleteModal(prev => ({ ...prev, submitting: true }));
        try {
            const response = await fetch(`/api/helpdesk/admin/invoices/${invoiceId}/payments/${deleteModal.paymentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ reason: deleteModal.reason }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete payment');
            }
            await fetchInvoice();
            setDeleteModal({ open: false, paymentId: null, reason: '', submitting: false });
        } catch (err) {
            alert('Failed to delete payment: ' + err.message);
            setDeleteModal(prev => ({ ...prev, submitting: false }));
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount || 0);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft':
                return 'bg-slate-500/20 text-slate-400 border-slate-500';
            case 'sent':
                return 'bg-blue-500/20 text-blue-400 border-blue-500';
            case 'viewed':
                return 'bg-purple-500/20 text-purple-400 border-purple-500';
            case 'paid':
                return 'bg-green-500/20 text-green-400 border-green-500';
            case 'partial':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
            case 'overdue':
                return 'bg-red-500/20 text-red-400 border-red-500';
            case 'voided':
                return 'bg-gray-500/20 text-gray-400 border-gray-500';
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500';
        }
    };

    const amountDue = invoice ? (invoice.total || 0) - (invoice.amount_paid || 0) : 0;

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
                        <Link to="/admin/helpdesk/invoices" className="text-slate-400 hover:text-white transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-purple-400" />
                            <span className="font-semibold text-lg">{invoice?.invoice_number}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(invoice?.status)}`}>
                                {invoice?.status?.charAt(0).toUpperCase() + invoice?.status?.slice(1)}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {invoice?.status === 'draft' && (
                            <>
                                <Link
                                    to={`/admin/helpdesk/invoices/${invoiceId}/edit`}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-sm"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </Link>
                                <button
                                    onClick={handleSendInvoice}
                                    disabled={sending}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition text-sm"
                                >
                                    <Send className="w-4 h-4" />
                                    {sending ? 'Sending...' : 'Send Invoice'}
                                </button>
                            </>
                        )}
                        {['sent', 'viewed', 'partial', 'overdue'].includes(invoice?.status) && (
                            <>
                                <button
                                    onClick={handleResendInvoice}
                                    disabled={resending}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition text-sm"
                                >
                                    <Send className="w-4 h-4" />
                                    {resending ? 'Sending...' : 'Resend'}
                                </button>
                                <button
                                    onClick={() => {
                                        setPaymentFormData(prev => ({ ...prev, amount: amountDue.toFixed(2) }));
                                        setShowPaymentForm(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition text-sm"
                                >
                                    <DollarSign className="w-4 h-4" />
                                    Record Payment
                                </button>
                            </>
                        )}
                        {invoice?.status !== 'voided' && invoice?.status !== 'paid' && (
                            <button
                                onClick={handleVoidInvoice}
                                disabled={voiding}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition text-sm"
                            >
                                <XCircle className="w-4 h-4" />
                                {voiding ? 'Voiding...' : 'Void'}
                            </button>
                        )}
                        <a
                            href={`/helpdesk/invoices/${invoice?.uuid}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-sm"
                        >
                            <Download className="w-4 h-4" />
                            PDF
                        </a>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Invoice Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <p className="text-sm text-slate-400 mb-1">Total Amount</p>
                            <p className="text-2xl font-bold text-slate-200">{formatCurrency(invoice?.total)}</p>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <p className="text-sm text-slate-400 mb-1">Amount Paid</p>
                            <p className="text-2xl font-bold text-green-400">{formatCurrency(invoice?.amount_paid)}</p>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <p className="text-sm text-slate-400 mb-1">Amount Due</p>
                            <p className={`text-2xl font-bold ${amountDue > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                                {formatCurrency(amountDue)}
                            </p>
                        </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Client Info */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                            <h3 className="font-semibold mb-4 text-slate-300">Client Information</h3>
                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="text-slate-500">Name</dt>
                                    <dd className="text-slate-200">{invoice?.billing_name || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Email</dt>
                                    <dd className="text-slate-200">{invoice?.billing_email || '-'}</dd>
                                </div>
                                {invoice?.billing_address && (
                                    <div>
                                        <dt className="text-slate-500">Address</dt>
                                        <dd className="text-slate-200 whitespace-pre-line">{invoice.billing_address}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Invoice Info */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                            <h3 className="font-semibold mb-4 text-slate-300">Invoice Details</h3>
                            <dl className="space-y-3 text-sm">
                                <div>
                                    <dt className="text-slate-500">Project</dt>
                                    <dd className="text-slate-200">
                                        <Link to={`/admin/helpdesk/projects/${invoice?.project?.id}`} className="text-purple-400 hover:text-purple-300">
                                            {invoice?.project?.name || '-'}
                                        </Link>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Invoice Date</dt>
                                    <dd className="text-slate-200">
                                        {invoice?.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Due Date</dt>
                                    <dd className={`${invoice?.status === 'overdue' ? 'text-red-400' : 'text-slate-200'}`}>
                                        {invoice?.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}
                                    </dd>
                                </div>
                                {invoice?.sent_at && (
                                    <div>
                                        <dt className="text-slate-500">Sent</dt>
                                        <dd className="text-slate-200">{new Date(invoice.sent_at).toLocaleString()}</dd>
                                    </div>
                                )}
                                {invoice?.paid_at && (
                                    <div>
                                        <dt className="text-slate-500">Paid</dt>
                                        <dd className="text-green-400">{new Date(invoice.paid_at).toLocaleString()}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-700">
                            <h3 className="font-semibold text-slate-300">Line Items</h3>
                        </div>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700 bg-slate-800/80">
                                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Description</th>
                                    <th className="text-right px-4 py-3 text-sm font-medium text-slate-400">Qty</th>
                                    <th className="text-right px-4 py-3 text-sm font-medium text-slate-400">Rate</th>
                                    <th className="text-right px-4 py-3 text-sm font-medium text-slate-400">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {invoice?.line_items?.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3">
                                            <div className="text-slate-200">{item.description}</div>
                                            {item.ticket && (
                                                <Link
                                                    to={`/admin/helpdesk/tickets/${item.ticket.id}`}
                                                    className="text-xs text-purple-400 hover:text-purple-300"
                                                >
                                                    Ticket #{item.ticket.number}
                                                </Link>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-300">
                                            {item.quantity}
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-300">
                                            {formatCurrency(item.rate)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-200 font-medium">
                                            {formatCurrency(item.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t border-slate-600">
                                <tr>
                                    <td colSpan="3" className="px-4 py-3 text-right font-medium text-slate-400">
                                        Subtotal
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-200 font-medium">
                                        {formatCurrency(invoice?.subtotal)}
                                    </td>
                                </tr>
                                {invoice?.discount_amount > 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-4 py-3 text-right font-medium text-orange-400">
                                            Discount {invoice?.discount_description && `(${invoice.discount_description})`}
                                        </td>
                                        <td className="px-4 py-3 text-right text-orange-400 font-medium">
                                            -{formatCurrency(invoice?.discount_amount)}
                                        </td>
                                    </tr>
                                )}
                                {invoice?.credit_amount > 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-4 py-3 text-right font-medium text-blue-400">
                                            Credit {invoice?.credit_description && `(${invoice.credit_description})`}
                                        </td>
                                        <td className="px-4 py-3 text-right text-blue-400 font-medium">
                                            -{formatCurrency(invoice?.credit_amount)}
                                        </td>
                                    </tr>
                                )}
                                {invoice?.tax_amount > 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-4 py-3 text-right font-medium text-slate-400">
                                            Tax ({invoice?.tax_rate}%)
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-200 font-medium">
                                            {formatCurrency(invoice?.tax_amount)}
                                        </td>
                                    </tr>
                                )}
                                <tr className="bg-slate-700/30">
                                    <td colSpan="3" className="px-4 py-3 text-right font-semibold text-slate-300">
                                        Total
                                    </td>
                                    <td className="px-4 py-3 text-right text-lg font-bold text-purple-400">
                                        {formatCurrency(invoice?.total)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Notes */}
                    {invoice?.notes && (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                            <h3 className="font-semibold mb-3 text-slate-300">Notes</h3>
                            <p className="text-sm text-slate-400 whitespace-pre-line">{invoice.notes}</p>
                        </div>
                    )}

                    {/* Payments */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-300 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-purple-400" />
                                Payments
                            </h3>
                            {['sent', 'viewed', 'partial', 'overdue'].includes(invoice?.status) && !showPaymentForm && (
                                <button
                                    onClick={() => {
                                        setPaymentFormData(prev => ({ ...prev, amount: amountDue.toFixed(2) }));
                                        setShowPaymentForm(true);
                                    }}
                                    className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Payment
                                </button>
                            )}
                        </div>

                        {/* Payment Form */}
                        {showPaymentForm && (
                            <form onSubmit={handleRecordPayment} className="p-4 border-b border-slate-700 bg-slate-700/30">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Amount</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            max={amountDue}
                                            value={paymentFormData.amount}
                                            onChange={(e) => setPaymentFormData(prev => ({ ...prev, amount: e.target.value }))}
                                            className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Payment Method</label>
                                        <select
                                            value={paymentFormData.payment_method}
                                            onChange={(e) => setPaymentFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                                            className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="manual">Manual/Check</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="cash">Cash</option>
                                            <option value="credit_card">Credit Card</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Reference #</label>
                                        <input
                                            type="text"
                                            value={paymentFormData.reference}
                                            onChange={(e) => setPaymentFormData(prev => ({ ...prev, reference: e.target.value }))}
                                            className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="Check # or transaction ID"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Notes</label>
                                        <input
                                            type="text"
                                            value={paymentFormData.notes}
                                            onChange={(e) => setPaymentFormData(prev => ({ ...prev, notes: e.target.value }))}
                                            className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="Optional notes"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={paymentSubmitting}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded text-sm"
                                    >
                                        {paymentSubmitting ? 'Recording...' : 'Record Payment'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowPaymentForm(false)}
                                        className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Payments List */}
                        {invoice?.payments?.length > 0 ? (
                            <div className="divide-y divide-slate-700">
                                {invoice.payments.map((payment) => (
                                    <div key={payment.id} className={`p-4 flex items-center justify-between ${payment.is_deleted ? 'opacity-50 bg-slate-800/30' : ''}`}>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <span className={`font-medium ${payment.is_deleted ? 'line-through text-slate-400' : 'text-green-400'}`}>
                                                    {formatCurrency(payment.amount)}
                                                </span>
                                                <span className="text-xs px-2 py-0.5 bg-slate-600 rounded text-slate-300">
                                                    {payment.method_name || payment.payment_method?.replace('_', ' ') || 'Unknown'}
                                                </span>
                                                {payment.is_deleted && (
                                                    <span className="text-xs px-2 py-0.5 bg-red-500/20 border border-red-500/50 rounded text-red-400">
                                                        Deleted
                                                    </span>
                                                )}
                                                {payment.reference_number && (
                                                    <span className="text-xs text-slate-500">Ref: {payment.reference_number}</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {new Date(payment.paid_at || payment.created_at).toLocaleString()}
                                                {payment.recorded_by && ` by ${payment.recorded_by.name}`}
                                            </p>
                                            {payment.is_deleted && (
                                                <div className="mt-2 text-xs text-red-400/80">
                                                    <p>Deleted {payment.deleted_at && `on ${new Date(payment.deleted_at).toLocaleString()}`}{payment.deleted_by && ` by ${payment.deleted_by}`}</p>
                                                    {payment.deleted_reason && <p className="italic mt-0.5">Reason: {payment.deleted_reason}</p>}
                                                </div>
                                            )}
                                        </div>
                                        {!payment.is_deleted && invoice.status !== 'voided' && (
                                            <button
                                                onClick={() => handleDeletePayment(payment.id)}
                                                className="p-2 text-slate-400 hover:text-red-400 transition"
                                                title="Delete payment"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-500">
                                No payments recorded yet
                            </div>
                        )}
                    </div>

                    {/* Public Link */}
                    {invoice?.uuid && (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                            <h3 className="font-semibold mb-3 text-slate-300">Client View Link</h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={`${window.location.origin}/helpdesk/invoices/${invoice.uuid}`}
                                    className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-slate-300"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/helpdesk/invoices/${invoice.uuid}`);
                                        alert('Link copied to clipboard!');
                                    }}
                                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded text-sm"
                                >
                                    Copy
                                </button>
                                <a
                                    href={`/helpdesk/invoices/${invoice.uuid}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded text-sm flex items-center gap-2"
                                >
                                    <Eye className="w-4 h-4" />
                                    Preview
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Delete Payment Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl w-full max-w-md mx-4">
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <h3 className="font-semibold text-lg text-slate-200">Delete Payment</h3>
                            <button
                                onClick={() => setDeleteModal({ open: false, paymentId: null, reason: '', submitting: false })}
                                className="text-slate-400 hover:text-white transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4">
                            <p className="text-sm text-slate-400 mb-4">
                                Please provide a reason for deleting this payment. The payment will be marked as deleted but will remain visible for audit purposes.
                            </p>
                            <label className="block text-sm text-slate-300 mb-2">Reason for deletion *</label>
                            <textarea
                                value={deleteModal.reason}
                                onChange={(e) => setDeleteModal(prev => ({ ...prev, reason: e.target.value }))}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                rows={3}
                                placeholder="e.g., Duplicate payment entry, payment was reversed by bank..."
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-slate-700">
                            <button
                                onClick={() => setDeleteModal({ open: false, paymentId: null, reason: '', submitting: false })}
                                disabled={deleteModal.submitting}
                                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 disabled:opacity-50 rounded-lg text-sm transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeletePayment}
                                disabled={deleteModal.submitting || deleteModal.reason.trim().length < 3}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg text-sm transition flex items-center gap-2"
                            >
                                {deleteModal.submitting ? (
                                    <>Deleting...</>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Delete Payment
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceDetail;
