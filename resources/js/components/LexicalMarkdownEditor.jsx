import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { LinkNode } from '@lexical/link';
import { 
    $convertToMarkdownString, 
    $convertFromMarkdownString, 
    TRANSFORMERS,
    STRIKETHROUGH,
} from '@lexical/markdown';
import { 
    $getSelection, 
    $isRangeSelection, 
    FORMAT_TEXT_COMMAND,
} from 'lexical';
import { 
    INSERT_UNORDERED_LIST_COMMAND, 
    INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';
import { Bold, Italic, Strikethrough, List, ListOrdered } from 'lucide-react';

// Use Lexical's built-in transformers plus strikethrough
const ALL_TRANSFORMERS = [
    ...TRANSFORMERS,
    STRIKETHROUGH,
];

// Toolbar Plugin with proper command dispatching
function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);

    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsStrikethrough(selection.hasFormat('strikethrough'));
        }
    }, []);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateToolbar();
            });
        });
    }, [editor, updateToolbar]);

    const formatBold = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
    };

    const formatItalic = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
    };

    const formatStrikethrough = () => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
    };

    const formatBulletList = () => {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    };

    const formatNumberedList = () => {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    };

    return (
        <div className="flex gap-1 border-b border-slate-700 pb-2 mb-2 px-3 pt-3">
            <button
                type="button"
                onClick={formatBold}
                className={`p-2 rounded transition-colors ${isBold ? 'bg-slate-600 text-white' : 'hover:bg-slate-700'}`}
                title="Bold (Ctrl+B)"
            >
                <Bold className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={formatItalic}
                className={`p-2 rounded transition-colors ${isItalic ? 'bg-slate-600 text-white' : 'hover:bg-slate-700'}`}
                title="Italic (Ctrl+I)"
            >
                <Italic className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={formatStrikethrough}
                className={`p-2 rounded transition-colors ${isStrikethrough ? 'bg-slate-600 text-white' : 'hover:bg-slate-700'}`}
                title="Strikethrough"
            >
                <Strikethrough className="w-4 h-4" />
            </button>
            <div className="w-px bg-slate-700 mx-1" />
            <button
                type="button"
                onClick={formatBulletList}
                className="p-2 hover:bg-slate-700 rounded transition-colors"
                title="Bullet List"
            >
                <List className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={formatNumberedList}
                className="p-2 hover:bg-slate-700 rounded transition-colors"
                title="Numbered List"
            >
                <ListOrdered className="w-4 h-4" />
            </button>
        </div>
    );
}

// Plugin to handle markdown conversion
function MarkdownPlugin({ initialMarkdown, onChange }) {
    const [editor] = useLexicalComposerContext();
    const isFirstRenderRef = React.useRef(true);

    // Set initial content on mount
    useEffect(() => {
        if (isFirstRenderRef.current && initialMarkdown) {
            isFirstRenderRef.current = false;
            editor.update(() => {
                $convertFromMarkdownString(initialMarkdown, ALL_TRANSFORMERS);
            });
        }
    }, [editor, initialMarkdown]);

    // Listen for changes and convert back to markdown
    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const markdown = $convertToMarkdownString(ALL_TRANSFORMERS);
                onChange(markdown);
            });
        });
    }, [editor, onChange]);

    return null;
}

const theme = {
    paragraph: 'mb-1',
    text: {
        bold: 'font-bold',
        italic: 'italic',
        strikethrough: 'line-through',
        underline: 'underline',
    },
    list: {
        ul: 'list-disc list-inside ml-2',
        ol: 'list-decimal list-inside ml-2',
        listitem: 'my-1',
    },
    link: 'text-blue-400 hover:underline cursor-pointer',
    code: 'bg-slate-800 text-amber-400 px-1 py-0.5 rounded text-sm font-mono',
};

const LexicalMarkdownEditor = forwardRef(({ 
    value = '', 
    onChange, 
    placeholder = 'Add a comment... (Markdown supported)',
    className = ''
}, ref) => {
    // Use a stable key based on the initial value to reset editor when opening edit mode
    const [editorKey] = useState(() => Date.now());
    const [initialValue] = useState(value);

    const handleMarkdownChange = useCallback((newMarkdown) => {
        if (onChange) {
            onChange(newMarkdown);
        }
    }, [onChange]);

    const initialConfig = {
        namespace: 'MarkdownEditor',
        theme,
        nodes: [
            HeadingNode,
            QuoteNode,
            ListNode,
            ListItemNode,
            CodeNode,
            CodeHighlightNode,
            LinkNode,
        ],
        onError: (error) => {
            console.error('Lexical error:', error);
        },
    };

    return (
        <LexicalComposer key={editorKey} initialConfig={initialConfig}>
            <div className={`bg-slate-900 rounded-lg border border-slate-700 ${className}`}>
                <ToolbarPlugin />
                <div className="relative">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable 
                                className="min-h-24 px-3 pb-3 outline-none text-slate-300"
                            />
                        }
                        placeholder={
                            <div className="absolute top-0 left-3 text-slate-500 pointer-events-none">
                                {placeholder}
                            </div>
                        }
                    />
                </div>
                <HistoryPlugin />
                <ListPlugin />
                <LinkPlugin />
                <MarkdownShortcutPlugin transformers={ALL_TRANSFORMERS} />
                <MarkdownPlugin 
                    initialMarkdown={initialValue} 
                    onChange={handleMarkdownChange} 
                />
            </div>
        </LexicalComposer>
    );
});

LexicalMarkdownEditor.displayName = 'LexicalMarkdownEditor';

export default LexicalMarkdownEditor;
