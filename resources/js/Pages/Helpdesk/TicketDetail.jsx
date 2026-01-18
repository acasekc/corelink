import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    Ticket,
    LogOut,
    ChevronLeft,
    Clock,
    User,
    MessageSquare,
    AlertCircle,
    Send,
    Edit2,
    Trash2,
    Lock,
    Paperclip,
    Download,
    FileText,
    Image,
    X,
} from 'lucide-react';

export default function HelpdeskUserTicketDetail() {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [statuses, setStatuses] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [assignees, setAssignees] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [commentFiles, setCommentFiles] = useState([]);
    const [uploadingCommentFiles, setUploadingCommentFiles] = useState(false);
    const fileInputRef = useRef(null);
    const commentFileInputRef = useRef(null);

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
        const fetchTicket = async () => {
            try {
                const response = await fetch(`/api/helpdesk/user/tickets/${ticketId}`, {
                    credentials: 'include',
                });

                if (response.status === 401) {
                    navigate('/admin/login');
                    return;
                }

                if (response.status === 403) {
                    setError('You do not have access to this ticket');
                    setLoading(false);
                    return;
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch ticket');
                }

                const result = await response.json();
                setTicket(result.data);

                // Fetch reference data
                if (result.data.project?.id) {
                    const refRes = await fetch(`/api/helpdesk/user/projects/${result.data.project.id}/reference-data`, {
                        credentials: 'include',
                    });
                    const refData = await refRes.json();
                    setStatuses(refData.data?.statuses || []);
                    setPriorities(refData.data?.priorities || []);
                    setAssignees(refData.data?.assignees || []);
                }

                // Fetch attachments
                const attachRes = await fetch(`/api/helpdesk/user/tickets/${ticketId}/attachments`, {
                    credentials: 'include',
                });
                if (attachRes.ok) {
                    const attachData = await attachRes.json();
                    setAttachments(attachData.data || []);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTicket();
    }, [ticketId, navigate]);

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

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => 
            ALLOWED_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE
        );

        if (validFiles.length === 0) return;

        setUploadingFiles(true);
        try {
            const formData = new FormData();
            validFiles.forEach(file => formData.append('files[]', file));

            const response = await fetch(`/api/helpdesk/user/tickets/${ticketId}/attachments`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                setAttachments(prev => [...prev, ...result.data]);
            }
        } catch (err) {
            console.error('Failed to upload files:', err);
        } finally {
            setUploadingFiles(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteAttachment = async (attachmentId) => {
        if (!confirm('Are you sure you want to delete this attachment?')) return;

        try {
            const response = await fetch(`/api/helpdesk/user/attachments/${attachmentId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
            });

            if (response.ok) {
                setAttachments(prev => prev.filter(a => a.id !== attachmentId));
            }
        } catch (err) {
            console.error('Failed to delete attachment:', err);
        }
    };

    const handleCommentFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => 
            ALLOWED_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE
        );
        setCommentFiles(prev => [...prev, ...validFiles]);
        if (commentFileInputRef.current) commentFileInputRef.current.value = '';
    };

    const removeCommentFile = (index) => {
        setCommentFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadCommentAttachments = async (commentId) => {
        if (commentFiles.length === 0) return [];

        const formData = new FormData();
        commentFiles.forEach(file => formData.append('files[]', file));

        try {
            const response = await fetch(`/api/helpdesk/user/comments/${commentId}/attachments`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                return result.data || [];
            }
        } catch (err) {
            console.error('Failed to upload comment attachments:', err);
        }
        return [];
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() && commentFiles.length === 0) return;

        setSubmitting(true);
        try {
            const response = await fetch(`/api/helpdesk/user/tickets/${ticketId}/comments`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({
                    content: newComment || '(attachment)',
                    is_internal: isInternal,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                let newCommentData = result.data;

                // Upload attachments if any
                if (commentFiles.length > 0) {
                    setUploadingCommentFiles(true);
                    const uploadedAttachments = await uploadCommentAttachments(newCommentData.id);
                    newCommentData = {
                        ...newCommentData,
                        attachments: [...(newCommentData.attachments || []), ...uploadedAttachments],
                    };
                    setUploadingCommentFiles(false);
                }

                setTicket((prev) => ({
                    ...prev,
                    comments: [...(prev.comments || []), newCommentData],
                }));
                setNewComment('');
                setIsInternal(false);
                setCommentFiles([]);
            }
        } catch (err) {
            console.error('Failed to add comment:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateTicket = async (field, value) => {
        try {
            const response = await fetch(`/api/helpdesk/user/tickets/${ticketId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({ [field]: value }),
            });

            if (response.ok) {
                const result = await response.json();
                setTicket((prev) => ({ ...prev, ...result.data }));
            }
        } catch (err) {
            console.error('Failed to update ticket:', err);
        }
    };

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
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                    <p className="text-red-400 mb-4">{error}</p>
                    <Link to="/helpdesk/tickets" className="text-purple-400 hover:text-purple-300">
                        Back to Tickets
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
                            <Ticket className="w-6 h-6 text-purple-400" />
                            <span className="font-semibold text-lg">#{ticket.number}</span>
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
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Ticket Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Title & Content */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                                <h1 className="text-2xl font-bold mb-2">{ticket.title}</h1>
                                <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
                                    <span className="flex items-center gap-1">
                                        <User className="w-4 h-4" />
                                        {ticket.submitter?.name || 'Unknown'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {new Date(ticket.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <div className="prose prose-invert max-w-none">
                                    <p className="whitespace-pre-wrap">{ticket.content}</p>
                                </div>
                            </div>

                            {/* Attachments */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold flex items-center gap-2">
                                        <Paperclip className="w-5 h-5" />
                                        Attachments ({attachments.length})
                                    </h2>
                                    <div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            onChange={handleFileUpload}
                                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingFiles}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition disabled:opacity-50"
                                        >
                                            <Paperclip className="w-4 h-4" />
                                            {uploadingFiles ? 'Uploading...' : 'Add Files'}
                                        </button>
                                    </div>
                                </div>

                                {attachments.length > 0 ? (
                                    <div className="space-y-2">
                                        {attachments.map((attachment) => (
                                            <div
                                                key={attachment.id}
                                                className="flex items-center gap-3 bg-slate-700/50 rounded-lg px-4 py-3"
                                            >
                                                {attachment.is_image ? (
                                                    <Image className="w-5 h-5 text-blue-400" />
                                                ) : (
                                                    <FileText className="w-5 h-5 text-amber-400" />
                                                )}
                                                <span className="flex-1 truncate">{attachment.filename}</span>
                                                <span className="text-sm text-slate-400">{attachment.human_size}</span>
                                                <a
                                                    href={attachment.url}
                                                    className="text-purple-400 hover:text-purple-300 transition"
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteAttachment(attachment.id)}
                                                    className="text-slate-400 hover:text-red-400 transition"
                                                    title="Delete"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-slate-500 py-4">No attachments</p>
                                )}
                            </div>

                            {/* Comments */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5" />
                                    Comments ({ticket.comments?.length || 0})
                                </h2>

                                <div className="space-y-4 mb-6">
                                    {ticket.comments?.length > 0 ? (
                                        ticket.comments.map((comment) => (
                                            <div
                                                key={comment.id}
                                                className={`p-4 rounded-lg ${
                                                    comment.is_internal
                                                        ? 'bg-amber-900/20 border border-amber-700/50'
                                                        : 'bg-slate-700/50'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{comment.user?.name}</span>
                                                        {comment.is_internal && (
                                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-600 text-xs rounded">
                                                                <Lock className="w-3 h-3" />
                                                                Internal
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-sm text-slate-400">
                                                        {new Date(comment.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-slate-300 whitespace-pre-wrap">{comment.content}</p>
                                                
                                                {/* Comment Attachments */}
                                                {comment.attachments?.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-slate-600/50">
                                                        <div className="flex flex-wrap gap-2">
                                                            {comment.attachments.map((attachment) => (
                                                                <a
                                                                    key={attachment.id}
                                                                    href={attachment.url}
                                                                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-600/50 hover:bg-slate-600 rounded-lg text-sm transition"
                                                                    title={attachment.filename}
                                                                >
                                                                    {attachment.is_image ? (
                                                                        <Image className="w-4 h-4 text-blue-400" />
                                                                    ) : (
                                                                        <FileText className="w-4 h-4 text-amber-400" />
                                                                    )}
                                                                    <span className="max-w-[150px] truncate">{attachment.filename}</span>
                                                                    <Download className="w-3 h-3 text-slate-400" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-slate-500 py-4">No comments yet</p>
                                    )}
                                </div>

                                {/* Add Comment Form */}
                                {ticket.permissions?.can_comment && (
                                    <form onSubmit={handleAddComment}>
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Write a comment..."
                                            rows={3}
                                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                        />
                                        
                                        {/* Selected Files Preview */}
                                        {commentFiles.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {commentFiles.map((file, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm"
                                                    >
                                                        {file.type.startsWith('image/') ? (
                                                            <Image className="w-4 h-4 text-blue-400" />
                                                        ) : (
                                                            <FileText className="w-4 h-4 text-amber-400" />
                                                        )}
                                                        <span className="max-w-[150px] truncate">{file.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCommentFile(index)}
                                                            className="text-slate-400 hover:text-red-400"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-4">
                                                {ticket.permissions?.can_internal_comment && (
                                                    <label className="flex items-center gap-2 text-sm">
                                                        <input
                                                            type="checkbox"
                                                            checked={isInternal}
                                                            onChange={(e) => setIsInternal(e.target.checked)}
                                                            className="rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500"
                                                        />
                                                        <Lock className="w-4 h-4 text-amber-500" />
                                                        Internal note
                                                    </label>
                                                )}
                                                <div>
                                                    <input
                                                        ref={commentFileInputRef}
                                                        type="file"
                                                        multiple
                                                        onChange={handleCommentFileSelect}
                                                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                                                        className="hidden"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => commentFileInputRef.current?.click()}
                                                        className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition"
                                                    >
                                                        <Paperclip className="w-4 h-4" />
                                                        Attach
                                                    </button>
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={(!newComment.trim() && commentFiles.length === 0) || submitting || uploadingCommentFiles}
                                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition"
                                            >
                                                <Send className="w-4 h-4" />
                                                {submitting || uploadingCommentFiles ? 'Sending...' : 'Send'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                                <h3 className="font-semibold mb-4">Details</h3>

                                <div className="space-y-4">
                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Status</label>
                                        {ticket.permissions?.can_change_status ? (
                                            <select
                                                value={ticket.status?.id || ''}
                                                onChange={(e) => handleUpdateTicket('status_id', e.target.value)}
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                {statuses.map((s) => (
                                                    <option key={s.id} value={s.id}>{s.title}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span
                                                className="inline-block px-3 py-1 rounded-full text-sm"
                                                style={{
                                                    backgroundColor: `${ticket.status?.color}20`,
                                                    color: ticket.status?.color,
                                                }}
                                            >
                                                {ticket.status?.title}
                                            </span>
                                        )}
                                    </div>

                                    {/* Priority */}
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Priority</label>
                                        {ticket.permissions?.can_change_priority ? (
                                            <select
                                                value={ticket.priority?.id || ''}
                                                onChange={(e) => handleUpdateTicket('priority_id', e.target.value)}
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                {priorities.map((p) => (
                                                    <option key={p.id} value={p.id}>{p.title}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span
                                                className="inline-block px-3 py-1 rounded-full text-sm"
                                                style={{
                                                    backgroundColor: `${ticket.priority?.color}20`,
                                                    color: ticket.priority?.color,
                                                }}
                                            >
                                                {ticket.priority?.title}
                                            </span>
                                        )}
                                    </div>

                                    {/* Assignee */}
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Assigned To</label>
                                        {ticket.permissions?.can_assign && assignees.length > 0 ? (
                                            <select
                                                value={ticket.assignee?.id || ''}
                                                onChange={(e) => handleUpdateTicket('assignee_id', e.target.value || null)}
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="">Unassigned</option>
                                                {assignees.map((a) => (
                                                    <option key={a.id} value={a.id}>{a.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="text-slate-300">
                                                {ticket.assignee?.name || 'Unassigned'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Project */}
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Project</label>
                                        <Link
                                            to={`/helpdesk/projects/${ticket.project?.id}`}
                                            className="text-purple-400 hover:text-purple-300"
                                        >
                                            {ticket.project?.name}
                                        </Link>
                                    </div>

                                    {/* Submitter */}
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Submitted By</label>
                                        <p className="text-slate-300">{ticket.submitter?.name}</p>
                                        <p className="text-sm text-slate-500">{ticket.submitter?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Labels */}
                            {ticket.labels?.length > 0 && (
                                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                                    <h3 className="font-semibold mb-3">Labels</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {ticket.labels.map((label) => (
                                            <span
                                                key={label.id}
                                                className="px-2 py-1 rounded text-sm"
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
}
