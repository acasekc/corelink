import React, { useRef, useCallback } from 'react';
import { Bold, Italic, Strikethrough, List, ListOrdered, Image, Upload, X, Loader2 } from 'lucide-react';

/**
 * Simple markdown-aware comment editor with toolbar.
 * Outputs plain markdown text suitable for the helpdesk system.
 */
export default function CommentEditor({
    value,
    onChange,
    placeholder = 'Add a comment...',
    rows = 3,
    disabled = false,
    onImageUpload = null,
    className = '',
}) {
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = React.useState(false);

    // Insert text at cursor position or wrap selection
    const insertAtCursor = useCallback((before, after = '', placeholder = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        const textToInsert = selectedText || placeholder;

        const newValue =
            value.substring(0, start) +
            before +
            textToInsert +
            after +
            value.substring(end);

        onChange(newValue);

        // Set cursor position after the operation
        setTimeout(() => {
            const newCursorPos = start + before.length + textToInsert.length + after.length;
            textarea.focus();
            textarea.setSelectionRange(
                start + before.length,
                start + before.length + textToInsert.length
            );
        }, 0);
    }, [value, onChange]);

    // Insert at start of line(s) for list items
    const insertLinePrefix = useCallback((prefix) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // Find the start of the current line
        let lineStart = start;
        while (lineStart > 0 && value[lineStart - 1] !== '\n') {
            lineStart--;
        }

        // Find the end of the current line/selection
        let lineEnd = end;
        while (lineEnd < value.length && value[lineEnd] !== '\n') {
            lineEnd++;
        }

        // Get selected lines
        const selectedText = value.substring(lineStart, lineEnd);
        const lines = selectedText.split('\n');

        // Add prefix to each line
        const newLines = lines.map((line, index) => {
            // For numbered lists, increment the number
            if (prefix === '1. ') {
                return `${index + 1}. ${line}`;
            }
            return `${prefix}${line}`;
        });

        const newValue =
            value.substring(0, lineStart) +
            newLines.join('\n') +
            value.substring(lineEnd);

        onChange(newValue);
        textarea.focus();
    }, [value, onChange]);

    const handleBold = () => insertAtCursor('**', '**', 'bold text');
    const handleItalic = () => insertAtCursor('*', '*', 'italic text');
    const handleStrikethrough = () => insertAtCursor('~~', '~~', 'strikethrough text');
    const handleBulletList = () => insertLinePrefix('- ');
    const handleNumberedList = () => insertLinePrefix('1. ');

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be less than 5MB');
            return;
        }

        setIsUploading(true);

        try {
            let imageUrl;

            if (onImageUpload) {
                // Use custom upload handler if provided
                imageUrl = await onImageUpload(file);
            } else {
                // Default: Upload to server via helpdesk endpoint
                const formData = new FormData();
                formData.append('image', file);

                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

                const response = await fetch('/api/helpdesk/upload/image', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    credentials: 'same-origin',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const data = await response.json();
                imageUrl = data.url;
            }

            // Insert markdown image syntax at cursor
            insertAtCursor(`![${file.name}](${imageUrl})`, '', '');
        } catch (error) {
            console.error('Image upload error:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    const ToolbarButton = ({ icon: Icon, onClick, title, isUploading: loading }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled || loading}
            className={`p-1.5 rounded hover:bg-slate-600 transition-colors text-slate-400 hover:text-slate-200 ${
                (disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title={title}
        >
            <Icon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
    );

    return (
        <div className={`border border-slate-600 rounded-lg overflow-hidden bg-slate-700 ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-slate-600 bg-slate-800/50">
                <ToolbarButton icon={Bold} onClick={handleBold} title="Bold (Ctrl+B)" />
                <ToolbarButton icon={Italic} onClick={handleItalic} title="Italic (Ctrl+I)" />
                <ToolbarButton icon={Strikethrough} onClick={handleStrikethrough} title="Strikethrough" />
                <div className="w-px h-4 bg-slate-600 mx-1" />
                <ToolbarButton icon={List} onClick={handleBulletList} title="Bullet List" />
                <ToolbarButton icon={ListOrdered} onClick={handleNumberedList} title="Numbered List" />
                {onImageUpload !== false && (
                    <>
                        <div className="w-px h-4 bg-slate-600 mx-1" />
                        <ToolbarButton
                            icon={isUploading ? Loader2 : Image}
                            onClick={handleImageClick}
                            title="Insert Image"
                            isUploading={isUploading}
                        />
                    </>
                )}
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Textarea */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                disabled={disabled || isUploading}
                className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none resize-none text-slate-200 placeholder-slate-500"
            />
        </div>
    );
}
