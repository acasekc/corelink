import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Ticket, ArrowLeft, LogOut, User, Clock, Tag, MessageSquare, Send, Lock, Unlock, Paperclip, X, FileText, Image, Download, Trash2, Plus, Play, Square, Edit2, DollarSign, Timer, Eye, EyeOff, Search } from 'lucide-react';
import Markdown from '../../../components/Markdown';
import LexicalMarkdownEditor from '../../../components/LexicalMarkdownEditor';
import FileUploadProgress from '../../../components/FileUploadProgress';
import useFileUpload, { validateFiles, ALLOWED_TYPES, MAX_FILE_SIZE, MAX_FILES } from '../../../hooks/useFileUpload';

const TicketDetail = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [timeEntries, setTimeEntries] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [referenceData, setReferenceData] = useState({ statuses: [], priorities: [], admins: [] });
    const [newComment, setNewComment] = useState('');
    const [commentKey, setCommentKey] = useState(0);
    const [isInternal, setIsInternal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [commentAttachments, setCommentAttachments] = useState([]);
    const commentFileInputRef = useRef(null);
    const commentUpload = useFileUpload();
    
    // Time tracking state
    const [showTimeForm, setShowTimeForm] = useState(false);
    const [timeFormData, setTimeFormData] = useState({ hours: '', minutes: '', hourly_rate_category_id: '', description: '', is_billable: true });
    const [editingTimeEntry, setEditingTimeEntry] = useState(null);
    const [timeSubmitting, setTimeSubmitting] = useState(false);
    const [activeTimer, setActiveTimer] = useState(null);
    const [timerSeconds, setTimerSeconds] = useState(0);

    // Comment editing state
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentContent, setEditingCommentContent] = useState('');
    const [editingCommentSubmitting, setEditingCommentSubmitting] = useState(false);

    // Ticket editing state
    const [editingTicket, setEditingTicket] = useState(false);
    const [editingTicketTitle, setEditingTicketTitle] = useState('');
    const [editingTicketContent, setEditingTicketContent] = useState('');
    const [editingTicketSubmitting, setEditingTicketSubmitting] = useState(false);

    // Watcher state
    const [watchers, setWatchers] = useState([]);
    const [watcherSearch, setWatcherSearch] = useState('');
    const [watcherResults, setWatcherResults] = useState([]);
    const [showWatcherSearch, setShowWatcherSearch] = useState(false);

    useEffect(() => {
        fetchReferenceData();
        fetchTicket();
        fetchComments();
        fetchTimeEntries();
        fetchCategories();
    }, [ticketId]);

    // Timer effect
    useEffect(() => {
        let interval;
        if (activeTimer) {
            interval = setInterval(() => {
                setTimerSeconds(s => s + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activeTimer]);

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
            setWatchers((json.data || json).watchers || []);
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

    const fetchTimeEntries = async () => {
        try {
            const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}/time-entries`, {
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to fetch time entries');
            const json = await response.json();
            setTimeEntries(json.data || json);
        } catch (err) {
            console.error('Failed to fetch time entries:', err);
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
                const uploadResult = await commentUpload.upload(
                    `/api/helpdesk/admin/comments/${newCommentData.id}/attachments`,
                    commentAttachments,
                );
                if (uploadResult.data.length > 0) {
                    newCommentData.attachments = uploadResult.data;
                }
            }

            setComments([...comments, newCommentData]);
            setNewComment('');
            setCommentKey(k => k + 1);
            setIsInternal(false);
            setCommentAttachments([]);
            commentUpload.reset();
        } catch (err) {
            alert('Failed to add comment: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditComment = (comment) => {
        setEditingCommentId(comment.id);
        setEditingCommentContent(comment.content);
    };

    const handleCancelEditComment = () => {
        setEditingCommentId(null);
        setEditingCommentContent('');
    };

    const handleSaveComment = async (commentId) => {
        if (!editingCommentContent.trim()) return;
        
        setEditingCommentSubmitting(true);
        try {
            const response = await fetch(`/api/helpdesk/admin/comments/${commentId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ content: editingCommentContent }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update comment');
            }
            
            const data = await response.json();
            setComments(comments.map(c => c.id === commentId ? data.data : c));
            setEditingCommentId(null);
            setEditingCommentContent('');
        } catch (err) {
            alert('Failed to update comment: ' + err.message);
        } finally {
            setEditingCommentSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        
        try {
            const response = await fetch(`/api/helpdesk/admin/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete comment');
            }
            
            setComments(comments.filter(c => c.id !== commentId));
        } catch (err) {
            alert('Failed to delete comment: ' + err.message);
        }
    };

    const handleEditTicket = () => {
        setEditingTicket(true);
        setEditingTicketTitle(ticket?.title || '');
        setEditingTicketContent(ticket?.content || '');
    };

    const handleCancelEditTicket = () => {
        setEditingTicket(false);
        setEditingTicketTitle('');
        setEditingTicketContent('');
    };

    const handleSaveTicket = async () => {
        if (!editingTicketTitle.trim()) return;
        
        setEditingTicketSubmitting(true);
        try {
            const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    title: editingTicketTitle,
                    content: editingTicketContent,
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update ticket');
            }
            
            const data = await response.json();
            setTicket(data.data);
            setEditingTicket(false);
            setEditingTicketTitle('');
            setEditingTicketContent('');
        } catch (err) {
            alert('Failed to update ticket: ' + err.message);
        } finally {
            setEditingTicketSubmitting(false);
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

    // Watcher Handlers
    const searchAvailableWatchers = async (search) => {
        if (!search || search.length < 2) {
            setWatcherResults([]);
            return;
        }
        try {
            const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}/watchers/available?search=${encodeURIComponent(search)}`, {
                credentials: 'same-origin',
            });
            if (response.ok) {
                const json = await response.json();
                setWatcherResults(json.data || []);
            }
        } catch (err) {
            console.error('Failed to search watchers:', err);
        }
    };

    const handleAddWatcher = async (userId) => {
        try {
            const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}/watchers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({ user_id: userId }),
            });
            if (response.ok) {
                const json = await response.json();
                setWatchers(prev => [...prev, json.data]);
                setWatcherSearch('');
                setWatcherResults([]);
                setShowWatcherSearch(false);
            }
        } catch (err) {
            console.error('Failed to add watcher:', err);
        }
    };

    const handleRemoveWatcher = async (userId) => {
        try {
            const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}/watchers/${userId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });
            if (response.ok || response.status === 204) {
                setWatchers(prev => prev.filter(w => w.id !== userId));
            }
        } catch (err) {
            console.error('Failed to remove watcher:', err);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            searchAvailableWatchers(watcherSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [watcherSearch]);

    // Time Entry Handlers
    const formatTimerDisplay = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startTimer = () => {
        setActiveTimer(new Date());
        setTimerSeconds(0);
    };

    const stopTimer = () => {
        if (!activeTimer) return;
        const hours = Math.floor(timerSeconds / 3600);
        const minutes = Math.floor((timerSeconds % 3600) / 60);
        setTimeFormData(prev => ({
            ...prev,
            hours: hours.toString(),
            minutes: minutes.toString(),
        }));
        setActiveTimer(null);
        setTimerSeconds(0);
        setShowTimeForm(true);
    };

    const handleAddTimeEntry = async (e) => {
        e.preventDefault();
        setTimeSubmitting(true);
        try {
            const hours = parseInt(timeFormData.hours || 0);
            const mins = parseInt(timeFormData.minutes || 0);
            const timeSpent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
            const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}/time-entries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    time_spent: timeSpent,
                    hourly_rate_category_id: timeFormData.hourly_rate_category_id || null,
                    description: timeFormData.description,
                    is_billable: timeFormData.is_billable,
                }),
            });
            if (!response.ok) throw new Error('Failed to add time entry');
            await fetchTimeEntries();
            setShowTimeForm(false);
            setTimeFormData({ hours: '', minutes: '', hourly_rate_category_id: '', description: '', is_billable: true });
        } catch (err) {
            alert('Failed to add time entry: ' + err.message);
        } finally {
            setTimeSubmitting(false);
        }
    };

    const handleUpdateTimeEntry = async (e) => {
        e.preventDefault();
        if (!editingTimeEntry) return;
        setTimeSubmitting(true);
        try {
            const hours = parseInt(timeFormData.hours || 0);
            const mins = parseInt(timeFormData.minutes || 0);
            const timeSpent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
            const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}/time-entries/${editingTimeEntry.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    time_spent: timeSpent,
                    hourly_rate_category_id: timeFormData.hourly_rate_category_id || null,
                    description: timeFormData.description,
                    is_billable: timeFormData.is_billable,
                }),
            });
            if (!response.ok) throw new Error('Failed to update time entry');
            await fetchTimeEntries();
            setEditingTimeEntry(null);
            setShowTimeForm(false);
            setTimeFormData({ hours: '', minutes: '', hourly_rate_category_id: '', description: '', is_billable: true });
        } catch (err) {
            alert('Failed to update time entry: ' + err.message);
        } finally {
            setTimeSubmitting(false);
        }
    };

    const handleDeleteTimeEntry = async (entryId) => {
        if (!confirm('Delete this time entry?')) return;
        try {
            const response = await fetch(`/api/helpdesk/admin/tickets/${ticketId}/time-entries/${entryId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });
            if (!response.ok) throw new Error('Failed to delete time entry');
            await fetchTimeEntries();
        } catch (err) {
            alert('Failed to delete time entry: ' + err.message);
        }
    };

    const editTimeEntry = (entry) => {
        const hours = Math.floor(entry.minutes / 60);
        const mins = entry.minutes % 60;
        setTimeFormData({
            hours: hours.toString(),
            minutes: mins.toString(),
            hourly_rate_category_id: entry.hourly_rate_category_id || '',
            description: entry.description || '',
            is_billable: entry.is_billable,
        });
        setEditingTimeEntry(entry);
        setShowTimeForm(true);
    };

    const cancelTimeForm = () => {
        setShowTimeForm(false);
        setEditingTimeEntry(null);
        setTimeFormData({ hours: '', minutes: '', hourly_rate_category_id: '', description: '', is_billable: true });
    };

    const formatTimeEntryMinutes = (mins) => {
        const hours = Math.floor(mins / 60);
        const minutes = mins % 60;
        if (hours === 0) return `${minutes}m`;
        if (minutes === 0) return `${hours}h`;
        return `${hours}h ${minutes}m`;
    };

    const handleCommentFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const { validFiles } = validateFiles(files, commentAttachments.length);
        if (validFiles.length > 0) {
            setCommentAttachments(prev => [...prev, ...validFiles]);
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

    // Countdown timer component for edit window
    const EditCountdown = ({ seconds }) => {
        const [remaining, setRemaining] = useState(seconds);
        
        useEffect(() => {
            if (remaining <= 0) return;
            const timer = setInterval(() => {
                setRemaining(prev => Math.max(0, prev - 1));
            }, 1000);
            return () => clearInterval(timer);
        }, [remaining]);
        
        if (remaining <= 0) return null;
        
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        
        return (
            <span className="text-xs text-slate-500 flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {mins}:{secs.toString().padStart(2, '0')}
            </span>
        );
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
                                {editingTicket ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-2">Title</label>
                                            <input
                                                type="text"
                                                value={editingTicketTitle}
                                                onChange={(e) => setEditingTicketTitle(e.target.value)}
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-slate-400 mb-2">Description</label>
                                            <LexicalMarkdownEditor
                                                value={editingTicketContent}
                                                onChange={setEditingTicketContent}
                                                placeholder="Ticket description..."
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSaveTicket}
                                                disabled={editingTicketSubmitting || !editingTicketTitle.trim()}
                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50"
                                            >
                                                {editingTicketSubmitting ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button
                                                onClick={handleCancelEditTicket}
                                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-start justify-between mb-4">
                                            <h1 className="text-2xl font-bold">{ticket?.title}</h1>
                                            <button
                                                onClick={handleEditTicket}
                                                className="p-2 text-slate-400 hover:text-purple-400 transition"
                                                title="Edit ticket"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                        </div>
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
                                        <Markdown>{ticket?.content}</Markdown>
                                    </>
                                )}

                                {/* Ticket Attachments */}
                                {ticket?.attachments?.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-slate-700">
                                        <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                                            <Paperclip className="w-4 h-4" />
                                            Attachments ({ticket.attachments.length})
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            {ticket.attachments.map((attachment) => (
                                                <a
                                                    key={attachment.id}
                                                    href={attachment.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition group"
                                                >
                                                    {attachment.is_image ? (
                                                        <Image className="w-4 h-4 text-purple-400" />
                                                    ) : (
                                                        <FileText className="w-4 h-4 text-blue-400" />
                                                    )}
                                                    <span className="text-sm text-slate-300 group-hover:text-white">
                                                        {attachment.filename}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        ({attachment.human_size})
                                                    </span>
                                                    <Download className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
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
                                                    <div className="flex items-center gap-3">
                                                        {comment.can_modify && comment.edit_window_seconds > 0 && (
                                                            <EditCountdown seconds={comment.edit_window_seconds} />
                                                        )}
                                                        <span className="text-xs text-slate-500">
                                                            {new Date(comment.created_at).toLocaleString()}
                                                        </span>
                                                        {comment.can_modify && (
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => handleEditComment(comment)}
                                                                    className="p-1 text-slate-500 hover:text-purple-400 transition"
                                                                    title="Edit comment"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteComment(comment.id)}
                                                                    className="p-1 text-slate-500 hover:text-red-400 transition"
                                                                    title="Delete comment"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {editingCommentId === comment.id ? (
                                                    <div className="space-y-2">
                                                        <LexicalMarkdownEditor
                                                            value={editingCommentContent}
                                                            onChange={setEditingCommentContent}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleSaveComment(comment.id)}
                                                                disabled={editingCommentSubmitting}
                                                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition disabled:opacity-50"
                                                            >
                                                                {editingCommentSubmitting ? 'Saving...' : 'Save'}
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEditComment}
                                                                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Markdown>{comment.content}</Markdown>
                                                )}
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
                                    <LexicalMarkdownEditor
                                        key={commentKey}
                                        value={newComment}
                                        onChange={setNewComment}
                                        placeholder="Add a comment... (Markdown supported)"
                                        className="mb-3"
                                    />
                                    
                                    {/* Attachment Input */}
                                    <input
                                        ref={commentFileInputRef}
                                        type="file"
                                        multiple
                                        onChange={handleCommentFileSelect}
                                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                                        style={{ display: 'none' }}
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

                                    {/* Upload Progress */}
                                    {commentUpload.isUploading && commentAttachments.length > 0 && (
                                        <div className="mb-3">
                                            <FileUploadProgress
                                                files={commentAttachments}
                                                fileProgress={commentUpload.fileProgress}
                                                isUploading={commentUpload.isUploading}
                                                onCancel={commentUpload.cancel}
                                            />
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
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (commentFileInputRef.current) {
                                                        commentFileInputRef.current.click();
                                                    }
                                                }}
                                                className="flex items-center gap-1 text-sm text-slate-400 hover:text-purple-400 transition"
                                            >
                                                <Paperclip className="w-4 h-4" />
                                                Attach
                                            </button>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submitting || commentUpload.isUploading || !newComment.trim()}
                                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send className="w-4 h-4" />
                                            {submitting || commentUpload.isUploading ? 'Sending...' : 'Send'}
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

                            {/* Watchers */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                                <h3 className="font-semibold mb-4 flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-purple-400" />
                                        Watchers
                                        {watchers.length > 0 && (
                                            <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded-full text-slate-300">{watchers.length}</span>
                                        )}
                                    </span>
                                    <button
                                        onClick={() => setShowWatcherSearch(!showWatcherSearch)}
                                        className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs font-medium"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </h3>

                                {showWatcherSearch && (
                                    <div className="mb-3 relative">
                                        <div className="flex items-center gap-2 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2">
                                            <Search className="w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={watcherSearch}
                                                onChange={(e) => setWatcherSearch(e.target.value)}
                                                placeholder="Search users..."
                                                className="bg-transparent text-sm flex-1 focus:outline-none"
                                                autoFocus
                                            />
                                            <button onClick={() => { setShowWatcherSearch(false); setWatcherSearch(''); setWatcherResults([]); }}>
                                                <X className="w-4 h-4 text-slate-400 hover:text-white" />
                                            </button>
                                        </div>
                                        {watcherResults.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                                {watcherResults.map((user) => (
                                                    <button
                                                        key={user.id}
                                                        onClick={() => handleAddWatcher(user.id)}
                                                        className="w-full px-3 py-2 text-left hover:bg-slate-600 text-sm flex items-center gap-2"
                                                    >
                                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                                        <div>
                                                            <div className="text-slate-200">{user.name}</div>
                                                            <div className="text-xs text-slate-400">{user.email}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {watchers.length > 0 ? (
                                    <div className="space-y-2">
                                        {watchers.map((watcher) => (
                                            <div key={watcher.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg text-sm">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <div className="min-w-0">
                                                        <div className="text-slate-200 truncate">{watcher.name}</div>
                                                        <div className="text-xs text-slate-400 truncate">{watcher.email}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveWatcher(watcher.id)}
                                                    className="p-1 hover:bg-slate-600 rounded shrink-0"
                                                    title="Remove watcher"
                                                >
                                                    <X className="w-3 h-3 text-red-400" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 text-center py-2">No watchers</p>
                                )}
                            </div>

                            {/* Time Tracking */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                                <h3 className="font-semibold mb-4 flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-purple-400" />
                                        Time Tracking
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {activeTimer ? (
                                            <button
                                                onClick={stopTimer}
                                                className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-medium"
                                            >
                                                <Square className="w-3 h-3" />
                                                {formatTimerDisplay(timerSeconds)}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={startTimer}
                                                className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-medium"
                                            >
                                                <Play className="w-3 h-3" />
                                                Start
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setShowTimeForm(true)}
                                            className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs font-medium"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </h3>

                                {/* Time Entry Form */}
                                {showTimeForm && (
                                    <form onSubmit={editingTimeEntry ? handleUpdateTimeEntry : handleAddTimeEntry} className="mb-4 p-3 bg-slate-700/50 rounded-lg space-y-3">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-slate-400 mb-1">Hours</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={timeFormData.hours}
                                                    onChange={(e) => setTimeFormData(prev => ({ ...prev, hours: e.target.value }))}
                                                    className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-400 mb-1">Minutes</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="59"
                                                    value={timeFormData.minutes}
                                                    onChange={(e) => setTimeFormData(prev => ({ ...prev, minutes: e.target.value }))}
                                                    className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Category</label>
                                            <select
                                                value={timeFormData.hourly_rate_category_id}
                                                onChange={(e) => setTimeFormData(prev => ({ ...prev, hourly_rate_category_id: e.target.value }))}
                                                className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="">No category</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Description</label>
                                            <textarea
                                                value={timeFormData.description}
                                                onChange={(e) => setTimeFormData(prev => ({ ...prev, description: e.target.value }))}
                                                rows={2}
                                                className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                                placeholder="What did you work on?"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="is_billable"
                                                checked={timeFormData.is_billable}
                                                onChange={(e) => setTimeFormData(prev => ({ ...prev, is_billable: e.target.checked }))}
                                                className="rounded bg-slate-600 border-slate-500 text-purple-600 focus:ring-purple-500"
                                            />
                                            <label htmlFor="is_billable" className="text-xs text-slate-300 flex items-center gap-1">
                                                <DollarSign className="w-3 h-3" />
                                                Billable
                                            </label>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="submit"
                                                disabled={timeSubmitting}
                                                className="flex-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded text-xs font-medium"
                                            >
                                                {timeSubmitting ? 'Saving...' : (editingTimeEntry ? 'Update' : 'Add Time')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={cancelTimeForm}
                                                className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 rounded text-xs font-medium"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {/* Time Entries List */}
                                {timeEntries.length > 0 ? (
                                    <div className="space-y-2">
                                        {timeEntries.map((entry) => (
                                            <div key={entry.id} className="flex items-start justify-between p-2 bg-slate-700/30 rounded-lg text-sm">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-purple-400">
                                                            {entry.formatted_time || formatTimeEntryMinutes(entry.minutes)}
                                                        </span>
                                                        {entry.is_billable && (
                                                            <DollarSign className="w-3 h-3 text-green-400" />
                                                        )}
                                                        {entry.hourly_rate_category && (
                                                            <span className="text-xs px-1.5 py-0.5 bg-slate-600 rounded text-slate-300">
                                                                {entry.hourly_rate_category.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {entry.description && (
                                                        <p className="text-xs text-slate-400 mt-1 truncate">
                                                            {entry.description}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {entry.user?.name} • {new Date(entry.date_worked + 'T00:00:00').toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1 ml-2">
                                                    <button
                                                        onClick={() => editTimeEntry(entry)}
                                                        className="p-1 hover:bg-slate-600 rounded"
                                                    >
                                                        <Edit2 className="w-3 h-3 text-slate-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTimeEntry(entry.id)}
                                                        className="p-1 hover:bg-slate-600 rounded"
                                                    >
                                                        <Trash2 className="w-3 h-3 text-red-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="pt-2 border-t border-slate-700 text-sm">
                                            <div className="flex justify-between text-slate-400">
                                                <span>Total Time:</span>
                                                <span className="font-medium text-slate-200">
                                                    {formatTimeEntryMinutes(timeEntries.reduce((sum, e) => sum + e.minutes, 0))}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-slate-400">
                                                <span>Billable:</span>
                                                <span className="font-medium text-green-400">
                                                    {formatTimeEntryMinutes(timeEntries.filter(e => e.is_billable).reduce((sum, e) => sum + e.minutes, 0))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 text-center py-4">
                                        No time logged yet
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TicketDetail;
