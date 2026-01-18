import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Ticket, ArrowLeft, LogOut, User, Clock, Tag, MessageSquare, Send, Lock, Unlock, Paperclip, X, FileText, Image, Download, Trash2 } from 'lucide-react';

const TicketDetail = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [referenceData, setReferenceData] = useState({ statuses: [], priorities: [], admins: [] });
    const [newComment, setNewComment] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [commentAttachments, setCommentAttachments] = useState([]);
    const commentFileInputRef = useRef(null);

    const ALLOWED_TYPES = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 'text/csv'
    ];
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    useEffect(() => {
        fetchReferenceData();
        fetchTicket();
        fetchComments();
    }, [ticketId]);

    const fetchReferenceData = async () => {
        try {
            const [statusesRes, prioritiesRes, adminsRes] = await Promise.all([
                fetch('/api/helpdesk/admin/statuses', { credentials: 'same-origin' }),
                fetch('/api/helpdesk/admin/priorities', { credentials: 'same-origin' }),
                fetch('/api/helpdesk/admin/admins', { credentials: 'same-origin' }),
            ]);
            const [statusesJson, prioritiesJson, adminsJson] = await Promise.all([
                statusesRes.json(),
                prioritiesRes.json(),
                adminsRes.json(),
            ]);
            setReferenceData({
                statuses: statusesJson.data || statusesJson,
                priorities: prioritiesJson.data || prioritiesJson,
                admins: adminsJson.data || adminsJson,
            });
        } catch (err) {
            console.error('Failed to fetch reference data:', err);
        }
    };

    const fetchTicket = async () => {
        try {
            const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}`, {
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to fetch ticket');
            const json = await response.json();
            setTicket(json.data || json);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}/comments`, {
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to fetch comments');
            const json = await response.json();
            setComments(json.data || json);
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        }
    };

    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    };

    const handleStatusChange = async (statusId) => {
        try {
            const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ status_id: statusId }),
            });
            if (!response.ok) throw new Error('Failed to update status');
            const data = await response.json();
            setTicket(data.data);
        } catch (err) {
            alert('Failed to update status: ' + err.message);
        }
    };

    const handlePriorityChange = async (priorityId) => {
        try {
            const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}/priority`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ priority_id: priorityId }),
            });
            if (!response.ok) throw new Error('Failed to update priority');
            const data = await response.json();
            setTicket(data.data);
        } catch (err) {
            alert('Failed to update priority: ' + err.message);
        }
    };

    const handleAssigneeChange = async (assigneeId) => {
        try {
            const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ assignee_id: assigneeId || null }),
            });
            if (!response.ok) throw new Error('Failed to update assignee');
            const data = await response.json();
            setTicket(data.data);
        } catch (err) {
            alert('Failed to update assignee: ' + err.message);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    content: newComment,
                    is_internal: isInternal,
                }),
            });
            if (!response.ok) throw new Error('Failed to add comment');
            const data = await response.json();
            const newCommentData = data.data;

            // Upload attachments if any
            if (commentAttachments.length > 0) {
                const formData = new FormData();
                commentAttachments.forEach(file => formData.append('files[]', file));

                const uploadResponse = await fetch(`/api/helpdesk/admin/comments/${newCommentData.id}/attachments`, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'Accept': 'application/json',
                    },
                    credentials: 'same-origin',
                    body: formData,
                });

                if (uploadResponse.ok) {
                    const uploadData = await uploadResponse.json();
                    newCommentData.attachments = uploadData.data;
                }
            }

            setComments([...comments, newCommentData]);
            setNewComment('');
            setIsInternal(false);
            setCommentAttachments([]);
        } catch (err) {
            alert('Failed to add comment: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTicket = async () => {
        if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) return;

        try {
            const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to delete ticket');
            navigate('/admin/helpdesk/tickets');
        } catch (err) {
            alert('Failed to delete ticket: ' + err.message);
        }
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

    const handleCommentFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => 
            ALLOWED_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE
        );
        if (validFiles.length > 0) {
            setCommentAttachments(prev => [...prev, ...validFiles].slice(0, 10));
        }
        if (commentFileInputRef.current) commentFileInputRef.current.value = '';
    };

    const removeCommentAttachment = (index) => {
        setCommentAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const isImageFile = (file) => file.type?.startsWith('image/') || false;

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
                <div className="text-slate-400">Loading ticket...</div>
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
                        <Link to="/admin/helpdesk/tickets" className="text-slate-400 hover:text-white transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <Ticket className="w-6 h-6 text-purple-400" />
                            <span className="font-semibold text-lg">Ticket #{ticket?.number}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleDeleteTicket}
                            className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition text-sm"
                        >
                            Delete Ticket
                        </button>
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
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Ticket Details */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                                <h1 className="text-2xl font-bold mb-4">{ticket?.title}</h1>
                                <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        <span>{ticket?.submitter?.name}</span>
                                        <span className="text-slate-500">({ticket?.submitter?.email})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>{new Date(ticket?.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="prose prose-invert max-w-none">
                                    <div className="whitespace-pre-wrap text-slate-300">{ticket?.content}</div>
                                </div>
                            </div>

                            {/* Comments Section */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
                                <div className="p-4 border-b border-slate-700">
                                    <h2 className="text-lg font-semibold flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-purple-400" />
                                        Comments ({comments.length})
                                    </h2>
                                </div>
                                <div className="divide-y divide-slate-700">
                                    {comments.length === 0 ? (
                                        <div className="p-6 text-center text-slate-500">No comments yet.</div>
                                    ) : (
                                        comments.map((comment) => (
                                            <div
                                                key={comment.id}
                                                className={`p-4 ${comment.is_internal ? 'bg-amber-500/5' : ''}`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-slate-200">
                                                            {comment.author_name}
                                                        </span>
                                                        {comment.is_internal && (
                                                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded flex items-center gap-1">
                                                                <Lock className="w-3 h-3" />
                                                                Internal
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-slate-500">
                                                        {new Date(comment.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="text-slate-300 whitespace-pre-wrap">{comment.content}</div>
                                                {/* Comment Attachments */}
                                                {comment.attachments?.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {comment.attachments.map((attachment) => (
                                                            <a
                                                                key={attachment.id}
                                                                href={attachment.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm transition"
                                                            >
                                                                {attachment.is_image ? (
                                                                    <Image className="w-4 h-4 text-blue-400" />
                                                                ) : (
                                                                    <FileText className="w-4 h-4 text-amber-400" />
                                                                )}
                                                                <span className="text-slate-300">{attachment.filename}</span>
                                                                <span className="text-slate-500 text-xs">({attachment.human_size})</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Add Comment Form */}
                                <form onSubmit={handleSubmitComment} className="p-4 border-t border-slate-700">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        rows={3}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-3"
                                    />
                                    
                                    {/* Attachment Input */}
                                    <input
                                        ref={commentFileInputRef}
                                        type="file"
                                        multiple
                                        onChange={handleCommentFileSelect}
                                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                                        className="hidden"
                                    />
                                    
                                    {/* Selected Attachments Preview */}
                                    {commentAttachments.length > 0 && (
                                        <div className="mb-3 flex flex-wrap gap-2">
                                            {commentAttachments.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg text-sm"
                                                >
                                                    {isImageFile(file) ? (
                                                        <Image className="w-4 h-4 text-blue-400" />
                                                    ) : (
                                                        <FileText className="w-4 h-4 text-amber-400" />
                                                    )}
                                                    <span className="text-slate-300 max-w-32 truncate">{file.name}</span>
                                                    <span className="text-slate-500 text-xs">({formatFileSize(file.size)})</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCommentAttachment(index)}
                                                        className="text-slate-400 hover:text-red-400"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isInternal}
                                                    onChange={(e) => setIsInternal(e.target.checked)}
                                                    className="rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500"
                                                />
                                                <span className="text-sm text-slate-400 flex items-center gap-1">
                                                    {isInternal ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                                    Internal note
                                                </span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => commentFileInputRef.current?.click()}
                                                className="flex items-center gap-1 text-sm text-slate-400 hover:text-purple-400 transition"
                                            >
                                                <Paperclip className="w-4 h-4" />
                                                Attach
                                            </button>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submitting || !newComment.trim()}
                                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send className="w-4 h-4" />
                                            {submitting ? 'Sending...' : 'Send'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                                <h3 className="font-semibold mb-4">Quick Actions</h3>
                                <div className="space-y-4">
                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Status</label>
                                        <select
                                            value={ticket?.status?.id || ''}
                                            onChange={(e) => handleStatusChange(e.target.value)}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            {referenceData.statuses.map((status) => (
                                                <option key={status.id} value={status.id}>
                                                    {status.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Priority */}
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Priority</label>
                                        <select
                                            value={ticket?.priority?.id || ''}
                                            onChange={(e) => handlePriorityChange(e.target.value)}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            {referenceData.priorities.map((priority) => (
                                                <option key={priority.id} value={priority.id}>
                                                    {priority.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Assignee */}
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-2">Assigned To</label>
                                        <select
                                            value={ticket?.assignee?.id || ''}
                                            onChange={(e) => handleAssigneeChange(e.target.value)}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">Unassigned</option>
                                            {referenceData.admins.map((admin) => (
                                                <option key={admin.id} value={admin.id}>
                                                    {admin.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Info */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                                <h3 className="font-semibold mb-4">Ticket Info</h3>
                                <dl className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-slate-400">Project</dt>
                                        <dd className="text-slate-200">{ticket?.project?.name}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-slate-400">Type</dt>
                                        <dd className="text-slate-200">{ticket?.type?.title}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-slate-400">External ID</dt>
                                        <dd className="text-slate-200 font-mono text-xs">
                                            {ticket?.external_id || '-'}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-slate-400">Created</dt>
                                        <dd className="text-slate-200">
                                            {new Date(ticket?.created_at).toLocaleDateString()}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-slate-400">Updated</dt>
                                        <dd className="text-slate-200">
                                            {new Date(ticket?.updated_at).toLocaleDateString()}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Labels */}
                            {ticket?.labels?.length > 0 && (
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-purple-400" />
                                        Labels
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {ticket.labels.map((label) => (
                                            <span
                                                key={label.id}
                                                className="px-2 py-1 rounded text-xs font-medium"
                                                style={{
                                                    backgroundColor: `${label.color}20`,
                                                    color: label.color,
                                                }}
                                            >
                                                {label.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TicketDetail;
