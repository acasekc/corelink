import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Ticket,
    LogOut,
    ChevronLeft,
    Plus,
    AlertCircle,
    Paperclip,
    X,
    FileText,
    Image,
} from 'lucide-react';

export default function HelpdeskUserCreateTicket() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [priorities, setPriorities] = useState([]);
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        project_id: '',
        title: '',
        content: '',
        priority_id: '',
        type_id: '',
    });
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);

    const ALLOWED_TYPES = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'text/csv'
    ];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('/api/helpdesk/user/projects', {
                    credentials: 'include',
                });

                if (response.status === 401) {
                    navigate('/admin/login');
                    return;
                }

                const result = await response.json();
                setProjects(result.data || []);
                
                // Auto-select if only one project
                if (result.data?.length === 1) {
                    setForm((prev) => ({ ...prev, project_id: String(result.data[0].id) }));
                    setSelectedProject(result.data[0]);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [navigate]);

    useEffect(() => {
        if (!form.project_id) {
            setPriorities([]);
            setTypes([]);
            return;
        }

        const fetchRefData = async () => {
            try {
                const response = await fetch(`/api/helpdesk/user/projects/${form.project_id}/reference-data`, {
                    credentials: 'include',
                });
                const result = await response.json();
                setPriorities(result.data?.priorities || []);
                setTypes(result.data?.types || []);
                
                // Set default priority
                const mediumPriority = result.data?.priorities?.find((p) => p.slug === 'medium');
                if (mediumPriority && !form.priority_id) {
                    setForm((prev) => ({ ...prev, priority_id: String(mediumPriority.id) }));
                }
            } catch (err) {
                console.error('Failed to fetch reference data:', err);
            }
        };

        fetchRefData();
    }, [form.project_id]);

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

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = [];
        const errors = [];

        files.forEach(file => {
            if (!ALLOWED_TYPES.includes(file.type)) {
                errors.push(`${file.name}: Only images and documents are allowed`);
            } else if (file.size > MAX_FILE_SIZE) {
                errors.push(`${file.name}: File size must not exceed 10MB`);
            } else if (attachments.length + validFiles.length >= 10) {
                errors.push(`Maximum 10 files allowed`);
            } else {
                validFiles.push(file);
            }
        });

        if (errors.length > 0) {
            setError(errors.join(', '));
        }

        if (validFiles.length > 0) {
            setAttachments(prev => [...prev, ...validFiles]);
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const isImageFile = (file) => file.type.startsWith('image/');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            // Create ticket first
            const response = await fetch('/api/helpdesk/user/tickets', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({
                    ...form,
                    project_id: parseInt(form.project_id),
                    priority_id: form.priority_id ? parseInt(form.priority_id) : null,
                    type_id: form.type_id ? parseInt(form.type_id) : null,
                }),
            });

            if (response.status === 401) {
                window.location.href = '/helpdesk/login';
                return;
            }

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'Failed to create ticket');
            }

            const result = await response.json();
            const ticketId = result.data.id;

            // Upload attachments if any
            if (attachments.length > 0) {
                const formData = new FormData();
                attachments.forEach(file => {
                    formData.append('files[]', file);
                });

                await fetch(`/api/helpdesk/user/tickets/${ticketId}/attachments`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                    },
                    body: formData,
                });
            }

            navigate(`/helpdesk/tickets/${ticketId}`);
        } catch (err) {
            setError(err.message);
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

    if (projects.length === 0) {
        return (
            <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                    <p className="text-slate-400 mb-4">You don't have access to any projects yet.</p>
                    <Link to="/helpdesk" className="text-purple-400 hover:text-purple-300">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white">
            {/* Header */}
            <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/helpdesk/tickets" className="text-slate-400 hover:text-white transition">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <Plus className="w-6 h-6 text-purple-400" />
                            <span className="font-semibold text-lg">New Ticket</span>
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
                <div className="max-w-2xl mx-auto">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <h1 className="text-2xl font-bold mb-6">Create Support Ticket</h1>

                        {error && (
                            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
                                <p className="text-red-400">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Project */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Project <span className="text-red-400">*</span>
                                </label>
                                <select
                                    value={form.project_id}
                                    onChange={(e) => {
                                        setForm((prev) => ({ ...prev, project_id: e.target.value }));
                                        setSelectedProject(projects.find((p) => p.id === parseInt(e.target.value)));
                                    }}
                                    required
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Select a project...</option>
                                    {projects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Title <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                                    required
                                    placeholder="Brief summary of your issue"
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Description <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={form.content}
                                    onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                                    required
                                    rows={6}
                                    placeholder="Please describe your issue in detail..."
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Priority */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Priority</label>
                                    <select
                                        value={form.priority_id}
                                        onChange={(e) => setForm((prev) => ({ ...prev, priority_id: e.target.value }))}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Default</option>
                                        {priorities.map((priority) => (
                                            <option key={priority.id} value={priority.id}>
                                                {priority.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Type */}
                                {types.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Type</label>
                                        <select
                                            value={form.type_id}
                                            onChange={(e) => setForm((prev) => ({ ...prev, type_id: e.target.value }))}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">Select type...</option>
                                            {types.map((type) => (
                                                <option key={type.id} value={type.id}>
                                                    {type.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* File Attachments */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Attachments</label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    onChange={handleFileSelect}
                                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                                    className="hidden"
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition"
                                >
                                    <Paperclip className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                                    <p className="text-slate-400">
                                        Click to upload files
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Images and documents (PDF, Word, Excel, etc.) up to 10MB each
                                    </p>
                                </div>

                                {/* Attachment List */}
                                {attachments.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {attachments.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3 bg-slate-700/50 rounded-lg px-4 py-2"
                                            >
                                                {isImageFile(file) ? (
                                                    <Image className="w-5 h-5 text-blue-400" />
                                                ) : (
                                                    <FileText className="w-5 h-5 text-amber-400" />
                                                )}
                                                <span className="flex-1 truncate text-sm">{file.name}</span>
                                                <span className="text-xs text-slate-400">{formatFileSize(file.size)}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttachment(index)}
                                                    className="text-slate-400 hover:text-red-400 transition"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-700">
                                <Link
                                    to="/helpdesk/tickets"
                                    className="px-4 py-2 text-slate-400 hover:text-white transition"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={submitting || !form.project_id || !form.title || !form.content}
                                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
                                >
                                    <Ticket className="w-4 h-4" />
                                    {submitting ? 'Creating...' : 'Create Ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
