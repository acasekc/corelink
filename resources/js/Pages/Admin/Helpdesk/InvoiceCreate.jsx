import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, ArrowLeft, LogOut, Plus, Trash2, Clock, DollarSign, Check } from 'lucide-react';

const InvoiceCreate = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [projects, setProjects] = useState([]);
    const [unbilledEntries, setUnbilledEntries] = useState([]);
    const [selectedEntries, setSelectedEntries] = useState([]);
    const [hourlyRates, setHourlyRates] = useState([]);
    const [invoiceSettings, setInvoiceSettings] = useState(null);

    const [formData, setFormData] = useState({
        project_id: searchParams.get('project') || '',
        client_name: '',
        client_email: '',
        client_address: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        notes: '',
        tax_rate: '0',
        discount_amount: '0',
        discount_description: '',
        credit_amount: '0',
        credit_description: '',
        custom_line_items: [],
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (formData.project_id) {
            // Reset client info to allow auto-fill from new project
            setFormData(prev => ({
                ...prev,
                client_name: '',
                client_email: '',
                client_address: '',
            }));
            fetchUnbilledEntries();
            fetchProjectSettings();
        } else {
            setUnbilledEntries([]);
            setSelectedEntries([]);
            setHourlyRates([]);
            setInvoiceSettings(null);
        }
    }, [formData.project_id]);

    useEffect(() => {
        // Set due date based on payment terms
        if (invoiceSettings?.payment_terms_days && formData.invoice_date) {
            const invoiceDate = new Date(formData.invoice_date);
            invoiceDate.setDate(invoiceDate.getDate() + invoiceSettings.payment_terms_days);
            setFormData(prev => ({
                ...prev,
                due_date: invoiceDate.toISOString().split('T')[0],
                notes: prev.notes || invoiceSettings.invoice_notes || '',
            }));
        }
    }, [invoiceSettings, formData.invoice_date]);

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/helpdesk/admin/projects', { credentials: 'same-origin' });
            const json = await response.json();
            setProjects(json.data || json);
        } catch (err) {
            console.error('Failed to fetch projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnbilledEntries = async () => {
        try {
            const response = await fetch(`/api/helpdesk/admin/projects/${formData.project_id}/uninvoiced-time`, {
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to fetch unbilled entries');
            const json = await response.json();
            setUnbilledEntries(json.data || json);
        } catch (err) {
            console.error('Failed to fetch unbilled entries:', err);
            setUnbilledEntries([]);
        }
    };

    const fetchProjectSettings = async () => {
        try {
            const [ratesRes, settingsRes, projectRes] = await Promise.all([
                fetch(`/api/helpdesk/admin/projects/${formData.project_id}/hourly-rates`, { credentials: 'same-origin' }),
                fetch(`/api/helpdesk/admin/projects/${formData.project_id}/invoice-settings`, { credentials: 'same-origin' }),
                fetch(`/api/helpdesk/admin/projects/${formData.project_id}`, { credentials: 'same-origin' }),
            ]);
            const [ratesJson, settingsJson, projectJson] = await Promise.all([ratesRes.json(), settingsRes.json(), projectRes.json()]);
            setHourlyRates(ratesJson.data || ratesJson);
            setInvoiceSettings(settingsJson.data || settingsJson);
            
            // Auto-fill client info from project (only if fields are empty)
            const projectData = projectJson.data || projectJson;
            setFormData(prev => ({
                ...prev,
                client_name: prev.client_name || projectData.client_name || '',
                client_email: prev.client_email || projectData.client_email || '',
                client_address: prev.client_address || projectData.client_address || '',
            }));
        } catch (err) {
            console.error('Failed to fetch project settings:', err);
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

    const toggleEntry = (entryId) => {
        setSelectedEntries(prev =>
            prev.includes(entryId) ? prev.filter(id => id !== entryId) : [...prev, entryId]
        );
    };

    const toggleAllEntries = () => {
        if (selectedEntries.length === unbilledEntries.length) {
            setSelectedEntries([]);
        } else {
            setSelectedEntries(unbilledEntries.map(e => e.id));
        }
    };

    const getHourlyRate = (entry) => {
        // Find rate for specific category first, then default
        // API returns rate.category.id (not rate.category_id) and rate.rate (not rate.hourly_rate)
        const categoryId = entry.category?.id;
        
        if (categoryId) {
            const categoryRate = hourlyRates.find(r => r.category?.id === categoryId);
            if (categoryRate) return parseFloat(categoryRate.rate) || 0;
        }

        // Try default rate (one without a category)
        const defaultRate = hourlyRates.find(r => !r.category);
        if (defaultRate) return parseFloat(defaultRate.rate) || 0;

        if (invoiceSettings?.default_hourly_rate) {
            return parseFloat(invoiceSettings.default_hourly_rate);
        }

        return 0;
    };

    const calculateBillableMinutes = (minutes) => {
        if (!invoiceSettings) return minutes;

        const increment = invoiceSettings.billing_increment_minutes || 15;
        const minimum = invoiceSettings.minimum_billing_minutes || 0;

        // Round up to increment
        let billable = Math.ceil(minutes / increment) * increment;

        // Apply minimum
        if (billable < minimum && minutes > 0) {
            billable = minimum;
        }

        return billable;
    };

    const formatMinutesToHours = (minutes) => {
        const hours = minutes / 60;
        return hours.toFixed(2);
    };

    const addCustomLineItem = () => {
        setFormData(prev => ({
            ...prev,
            custom_line_items: [
                ...prev.custom_line_items,
                { description: '', quantity: '1', unit_price: '', unit_type: 'unit' },
            ],
        }));
    };

    const updateCustomLineItem = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            custom_line_items: prev.custom_line_items.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            ),
        }));
    };

    const removeCustomLineItem = (index) => {
        setFormData(prev => ({
            ...prev,
            custom_line_items: prev.custom_line_items.filter((_, i) => i !== index),
        }));
    };

    const calculateSubtotal = () => {
        // Time entries
        const timeTotal = selectedEntries.reduce((sum, entryId) => {
            const entry = unbilledEntries.find(e => e.id === entryId);
            if (!entry) return sum;
            const billableMinutes = calculateBillableMinutes(entry.minutes);
            const hours = billableMinutes / 60;
            const rate = getHourlyRate(entry);
            return sum + (hours * rate);
        }, 0);

        // Custom line items
        const customTotal = formData.custom_line_items.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.unit_price) || 0;
            return sum + (qty * price);
        }, 0);

        return timeTotal + customTotal;
    };

    const calculateAdjustedSubtotal = () => {
        const subtotal = calculateSubtotal();
        const discount = parseFloat(formData.discount_amount) || 0;
        const credit = parseFloat(formData.credit_amount) || 0;
        return Math.max(0, subtotal - discount - credit);
    };

    const calculateTax = () => {
        const adjustedSubtotal = calculateAdjustedSubtotal();
        const taxRate = parseFloat(formData.tax_rate) || 0;
        return adjustedSubtotal * (taxRate / 100);
    };

    const calculateTotal = () => {
        return calculateAdjustedSubtotal() + calculateTax();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount || 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.project_id) {
            alert('Please select a project');
            return;
        }

        if (selectedEntries.length === 0 && formData.custom_line_items.length === 0) {
            alert('Please select time entries or add custom line items');
            return;
        }

        setSubmitting(true);
        try {
            // Prepare custom items for the backend format
            const customItems = formData.custom_line_items
                .filter(item => item.description && item.unit_price)
                .map(item => ({
                    description: item.description,
                    quantity: parseFloat(item.quantity) || 1,
                    rate: parseFloat(item.unit_price),
                }));

            const response = await fetch(`/api/helpdesk/admin/projects/${formData.project_id}/invoices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    time_entry_ids: selectedEntries,
                    custom_items: customItems,
                    notes: formData.notes || null,
                    billing_name: formData.client_name,
                    billing_email: formData.client_email,
                    billing_address: formData.client_address || null,
                    issue_date: formData.invoice_date,
                    due_date: formData.due_date,
                    tax_rate: parseFloat(formData.tax_rate) || 0,
                    discount_amount: parseFloat(formData.discount_amount) || 0,
                    discount_description: formData.discount_description || null,
                    credit_amount: parseFloat(formData.credit_amount) || 0,
                    credit_description: formData.credit_description || null,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to create invoice');
            }

            const data = await response.json();
            navigate(`/admin/helpdesk/invoices/${data.data.id}`);
        } catch (err) {
            alert('Failed to create invoice: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
                <div className="text-slate-400">Loading...</div>
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
                            <span className="font-semibold text-lg">Create Invoice</span>
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
                <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
                    {/* Project Selection */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <h3 className="font-semibold mb-4">Project</h3>
                        <select
                            value={formData.project_id}
                            onChange={(e) => setFormData(prev => ({ ...prev, project_id: e.target.value }))}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                        >
                            <option value="">Select a project...</option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {formData.project_id && (
                        <>
                            {/* Client Info */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                                <h3 className="font-semibold mb-4">Client Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Client Name *</label>
                                        <input
                                            type="text"
                                            value={formData.client_name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Client Email *</label>
                                        <input
                                            type="email"
                                            value={formData.client_email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm text-slate-400 mb-1">Client Address</label>
                                        <textarea
                                            value={formData.client_address}
                                            onChange={(e) => setFormData(prev => ({ ...prev, client_address: e.target.value }))}
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
                                        <label className="block text-sm text-slate-400 mb-1">Invoice Date *</label>
                                        <input
                                            type="date"
                                            value={formData.invoice_date}
                                            onChange={(e) => setFormData(prev => ({ ...prev, invoice_date: e.target.value }))}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Due Date *</label>
                                        <input
                                            type="date"
                                            value={formData.due_date}
                                            onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
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

                            {/* Discounts & Credits */}
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

                            {/* Unbilled Time Entries */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-purple-400" />
                                        Unbilled Time Entries
                                    </h3>
                                    {unbilledEntries.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={toggleAllEntries}
                                            className="text-sm text-purple-400 hover:text-purple-300"
                                        >
                                            {selectedEntries.length === unbilledEntries.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                    )}
                                </div>

                                {unbilledEntries.length > 0 ? (
                                    <div className="divide-y divide-slate-700">
                                        {unbilledEntries.map((entry) => {
                                            const isSelected = selectedEntries.includes(entry.id);
                                            const billableMinutes = calculateBillableMinutes(entry.minutes);
                                            const hours = billableMinutes / 60;
                                            const rate = getHourlyRate(entry);
                                            const amount = hours * rate;

                                            return (
                                                <div
                                                    key={entry.id}
                                                    onClick={() => toggleEntry(entry.id)}
                                                    className={`p-4 cursor-pointer transition ${
                                                        isSelected ? 'bg-purple-500/10' : 'hover:bg-slate-700/30'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 ${
                                                            isSelected ? 'bg-purple-600 border-purple-600' : 'border-slate-500'
                                                        }`}>
                                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Link
                                                                    to={`/admin/helpdesk/tickets/${entry.ticket_id}`}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="text-purple-400 hover:text-purple-300 text-sm"
                                                                >
                                                                    Ticket #{entry.ticket?.number}
                                                                </Link>
                                                                {entry.category && (
                                                                    <span className="text-xs px-1.5 py-0.5 bg-slate-600 rounded text-slate-300">
                                                                        {entry.category.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {entry.description && (
                                                                <p className="text-sm text-slate-300 truncate">{entry.description}</p>
                                                            )}
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                {entry.user?.name} • {new Date(entry.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm text-slate-300">
                                                                {formatMinutesToHours(billableMinutes)} hrs × {formatCurrency(rate)}
                                                            </div>
                                                            <div className="text-sm font-medium text-green-400">
                                                                {formatCurrency(amount)}
                                                            </div>
                                                            {billableMinutes !== entry.minutes && (
                                                                <div className="text-xs text-slate-500">
                                                                    (actual: {formatMinutesToHours(entry.minutes)} hrs)
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-500">
                                        No unbilled time entries for this project
                                    </div>
                                )}
                            </div>

                            {/* Custom Line Items */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-purple-400" />
                                        Custom Line Items
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={addCustomLineItem}
                                        className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Item
                                    </button>
                                </div>

                                {formData.custom_line_items.length > 0 ? (
                                    <div className="p-4 space-y-3">
                                        {formData.custom_line_items.map((item, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-3 items-start">
                                                <div className="col-span-5">
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) => updateCustomLineItem(index, 'description', e.target.value)}
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
                                                        onChange={(e) => updateCustomLineItem(index, 'quantity', e.target.value)}
                                                        placeholder="Qty"
                                                        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={item.unit_price}
                                                        onChange={(e) => updateCustomLineItem(index, 'unit_price', e.target.value)}
                                                        placeholder="Price"
                                                        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    />
                                                </div>
                                                <div className="col-span-2 text-right text-sm text-slate-300 py-2">
                                                    {formatCurrency((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0))}
                                                </div>
                                                <div className="col-span-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCustomLineItem(index)}
                                                        className="p-2 text-slate-400 hover:text-red-400"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-500">
                                        No custom line items. Click "Add Item" to add one.
                                    </div>
                                )}
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
                                        <dt className="text-slate-400">Selected Time Entries</dt>
                                        <dd className="text-slate-200">{selectedEntries.length}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-slate-400">Custom Line Items</dt>
                                        <dd className="text-slate-200">{formData.custom_line_items.length}</dd>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-slate-700">
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
                                            <dd className="text-slate-200">{formatCurrency(calculateTax())}</dd>
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
                                    to="/admin/helpdesk/invoices"
                                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={submitting || (selectedEntries.length === 0 && formData.custom_line_items.length === 0)}
                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition flex items-center gap-2"
                                >
                                    <FileText className="w-4 h-4" />
                                    {submitting ? 'Creating...' : 'Create Invoice'}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </main>
        </div>
    );
};

export default InvoiceCreate;
