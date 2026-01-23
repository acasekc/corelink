import React from 'react';
import ReactMarkdown from 'react-markdown';

/**
 * Markdown component for rendering markdown content with consistent styling.
 * Supports ticket descriptions, comments, and other user content.
 */
export default function Markdown({ children, className = '' }) {
    if (!children) return null;

    return (
        <ReactMarkdown
            className={`prose prose-invert prose-slate max-w-none
                prose-headings:text-slate-200 prose-headings:font-semibold
                prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
                prose-p:text-slate-300 prose-p:my-2
                prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-slate-200
                prose-code:text-amber-400 prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700 prose-pre:rounded-lg
                prose-ul:text-slate-300 prose-ol:text-slate-300
                prose-li:my-0.5
                prose-blockquote:border-l-blue-500 prose-blockquote:text-slate-400
                prose-hr:border-slate-700
                ${className}`}
            components={{
                // Open links in new tab
                a: ({ node, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" />
                ),
                // Add copy button or other enhancements to code blocks if needed
                pre: ({ node, children, ...props }) => (
                    <pre {...props} className="overflow-x-auto">
                        {children}
                    </pre>
                ),
            }}
        >
            {children}
        </ReactMarkdown>
    );
}
